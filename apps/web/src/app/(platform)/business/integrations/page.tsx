"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  SectionHeader,
  StatusChip,
} from "@rtb/ui";
import { Plug } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type CatalogRow = {
  id: string;
  provider: string;
  writeClassification: string;
  defaultMode: string;
  live: false;
};

type Installation = {
  id: string;
  connectorId: string;
  health: string;
  effectiveMode: string;
  requestedMode: string;
  writeLabel: string;
  modeLabel: string;
  lastSuccessfulSyncAt: string | null;
  errorCategory: string | null;
  recordsProcessed: number;
  recordsRejected: number;
  conflicts: number;
  connectionState?: string | null;
  organisation?: string | null;
  permissions?: string[];
};

type Run = {
  id: string;
  connectorId: string;
  status: string;
  recordsProcessed: number;
  recordsRejected: number;
  conflicts: number;
};

type Finding = { code: string; severity: string; message: string; repaired: false };

export default function BusinessIntegrationsPage() {
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const overview = await parseApiJsonResponse<{
      catalog: CatalogRow[];
      installations: Installation[];
      runs: Run[];
      diagnostics: { findings: Finding[] };
    }>(await fetch("/api/business/integrations"));
    if (overview.ok && overview.data) {
      setCatalog(overview.data.catalog ?? []);
      setInstallations(overview.data.installations ?? []);
      setRuns(overview.data.runs ?? []);
      setFindings(overview.data.diagnostics?.findings ?? []);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function seedDemo() {
    setBusy(true);
    setError(null);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/integrations/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Demo failed");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function configure(connectorId: string) {
    setBusy(true);
    try {
      await fetch("/api/business/integrations/configure", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ connectorId, mode: "fixture" }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    setBusy(true);
    try {
      await fetch("/api/business/integrations/revoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function previewCsv() {
    setBusy(true);
    setError(null);
    try {
      const parsed = await parseApiJsonResponse<{ preview: { displayRows?: unknown; issues: unknown[] } }>(
        await fetch("/api/business/integrations/import-preview", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            filename: "customers.csv",
            entityType: "customer",
            content: "name,external_id\nAcme,ext-1\n",
          }),
        }),
      );
      if (!parsed.ok) setError(parsed.errorMessage ?? "Preview failed");
      else setPreview("Validation passed. Commit remains explicit and does not overwrite canonical records.");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header title="Integrations" />
      <PageMain>
        {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
        <p className="mb-6 text-sm text-slate-600">
          Optional read-first connectors. Business OS remains usable without any connector. Fixtures are never live.
          External writes, email send, CRM mutation, and accounting writes stay disabled.
        </p>
        <div className="mb-6 flex gap-3">
          <Button disabled={busy} onClick={() => void seedDemo()}>
            Load fixture catalog
          </Button>
          <Button disabled={busy} onClick={() => void previewCsv()}>
            Preview CSV
          </Button>
        </div>

        <div data-testid="bos-integrations-overview" className="mb-8">
          <SectionHeader title="Status" />
          <Card>
            <CardHeader>
              <CardTitle>READ ONLY</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm">
              <StatusChip value="neutral">READ ONLY</StatusChip>
              <StatusChip value="pending">FIXTURE/SANDBOX</StatusChip>
              <StatusChip value="approved">LIVE</StatusChip>
              <StatusChip value="medium">DEGRADED</StatusChip>
              <StatusChip value="rejected">REVOKED</StatusChip>
              <span>Connectors are optional installation capabilities.</span>
            </CardContent>
          </Card>
        </div>

        <div data-testid="bos-integrations-catalog" className="mb-8">
          <SectionHeader title="Connector catalog" />
          {catalog.length === 0 ? (
            <EmptyState
              icon={<Plug className="h-8 w-8" />}
              title="No connectors required"
              description="Business OS works without external connectors."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {catalog.map((row) => {
                const installation = installations.find((item) => item.connectorId === row.id);
                return (
                  <Card key={row.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-2">
                        <span>{row.provider}</span>
                        <StatusChip value="neutral">READ ONLY</StatusChip>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>
                        Mode: {installation?.modeLabel ?? "FIXTURE/SANDBOX"} · Health: {installation?.health ?? "unconfigured"}
                        {row.id === "microsoft_365" ? ` · ${installation?.connectionState ?? "NOT_CONNECTED"}` : ""}
                      </p>
                      {row.id === "microsoft_365" && (
                        <p>
                          Microsoft 365 · organisation: {installation?.organisation ?? "not bound"} · permissions:{" "}
                          {(installation?.permissions ?? ["User.Read", "Calendars.Read", "Files.Read"]).join(", ")}
                        </p>
                      )}
                      <p>Last sync: {installation?.lastSuccessfulSyncAt ?? "never"}</p>
                      {installation?.errorCategory && <p>Error: {installation.errorCategory}</p>}
                      <div className="flex gap-2">
                        <Button disabled={busy} onClick={() => void configure(row.id)}>
                          {row.id === "microsoft_365" ? "Connect Microsoft 365" : "Configure"}
                        </Button>
                        {installation && (
                          <Button disabled={busy} onClick={() => void revoke(installation.id)}>
                            {row.id === "microsoft_365" ? "Disconnect" : "Revoke"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div data-testid="bos-integrations-history" className="mb-8">
          <SectionHeader title="Sync / import history" />
          {runs.length === 0 ? (
            <EmptyState
              icon={<Plug className="h-8 w-8" />}
              title="No sync history"
              description="Sync and import runs appear after a fixture or file import."
            />
          ) : (
            <ul className="space-y-2 text-sm">
              {runs.map((run) => (
                <li key={run.id}>
                  {run.connectorId} · {run.status} · processed {run.recordsProcessed} · rejected {run.recordsRejected} ·
                  conflicts {run.conflicts}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div data-testid="bos-integrations-import" className="mb-8">
          <SectionHeader title="CSV / Excel import" />
          <Card>
            <CardContent className="space-y-2 text-sm">
              <p>Schema validation, preview, duplicate detection, and explicit commit. Formulas and macros are rejected.</p>
              {preview && <p>{preview}</p>}
            </CardContent>
          </Card>
        </div>

        <div data-testid="bos-integrations-diagnostics">
          <SectionHeader title="Diagnostics" />
          {findings.length === 0 ? (
            <p className="text-sm text-slate-600">No connector findings. Usable without connectors.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {findings.map((finding, idx) => (
                <li key={`${finding.code}-${idx}`}>
                  {finding.severity}: {finding.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </PageMain>
    </>
  );
}
