"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  BOS_CONNECTOR_CONSENT,
  connectorStatusChip,
  isBosOauthConnector,
  type BosConnectorUiState,
  type BosOauthConnectorId,
} from "@rtb/business-os";

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
  errorMessage: string | null;
  recordsProcessed: number;
  recordsRejected: number;
  conflicts: number;
  connectionState?: BosConnectorUiState | null;
  organisation?: string | null;
  permissions?: string[];
  capabilitySummary?: string;
  fixture?: boolean;
  live?: boolean;
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

const CONNECT_LABEL: Record<BosOauthConnectorId, string> = {
  xero: "Connect Xero",
  microsoft_365: "Connect Microsoft 365",
  hubspot: "Connect HubSpot",
};

const RECONNECT_LABEL: Record<BosOauthConnectorId, string> = {
  xero: "Reconnect Xero",
  microsoft_365: "Reconnect Microsoft 365",
  hubspot: "Reconnect HubSpot",
};

function uiState(row: CatalogRow, installation?: Installation): BosConnectorUiState {
  if (installation?.connectionState) return installation.connectionState;
  if (!isBosOauthConnector(row.id)) return "NOT_CONNECTED";
  return "NOT_CONNECTED";
}

export default function BusinessIntegrationsPage() {
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(true);
  const [consentFor, setConsentFor] = useState<BosOauthConnectorId | null>(null);
  const [disconnectFor, setDisconnectFor] = useState<Installation | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const overview = await parseApiJsonResponse<{
      catalog: CatalogRow[];
      installations: Installation[];
      runs: Run[];
      diagnostics: { findings: Finding[] };
      canManage?: boolean;
    }>(await fetch("/api/business/integrations"));
    if (overview.ok && overview.data) {
      setCatalog(overview.data.catalog ?? []);
      setInstallations(overview.data.installations ?? []);
      setRuns(overview.data.runs ?? []);
      setFindings(overview.data.diagnostics?.findings ?? []);
      setCanManage(overview.data.canManage !== false);
    } else {
      setError(overview.errorMessage ?? "Unable to load integrations");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauth = params.get("oauth");
    const reason = params.get("reason");
    if (oauth === "error") {
      setError(reason ? reason.replaceAll("_", " ") : "Connection did not complete.");
    }
  }, []);

  const rbacHint = useMemo(
    () => (!canManage ? "You can view integrations but cannot connect, sync, or disconnect." : null),
    [canManage],
  );

  async function seedDemo() {
    setBusy(true);
    setBusyLabel("Loading fixtures");
    setError(null);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/integrations/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Demo failed");
      await refresh();
    } finally {
      setBusy(false);
      setBusyLabel(null);
    }
  }

  async function configure(connectorId: string) {
    setBusy(true);
    setBusyLabel("Configuring");
    try {
      await fetch("/api/business/integrations/configure", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ connectorId, mode: "fixture" }),
      });
      await refresh();
    } finally {
      setBusy(false);
      setBusyLabel(null);
    }
  }

  async function startOAuth(connectorId: BosOauthConnectorId) {
    setBusy(true);
    setBusyLabel("Starting connection");
    setError(null);
    try {
      const parsed = await parseApiJsonResponse<{ authorizeUrl: string }>(
        await fetch("/api/business/integrations/oauth/start", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ connectorId, origin: window.location.origin }),
        }),
      );
      if (!parsed.ok || !parsed.data?.authorizeUrl) {
        setError(parsed.errorMessage ?? "Could not start connection");
        await refresh();
        return;
      }
      const href = parsed.data.authorizeUrl;
      const next = href.startsWith("/") ? href : new URL(href, window.location.origin);
      window.location.assign(typeof next === "string" ? next : `${next.pathname}${next.search}`);
    } finally {
      setBusy(false);
      setBusyLabel(null);
    }
  }

  async function syncNow(installation: Installation) {
    setBusy(true);
    setSyncingId(installation.id);
    setBusyLabel("Syncing");
    setError(null);
    try {
      const parsed = await parseApiJsonResponse<{ status: string; errorCategory?: string | null }>(
        await fetch("/api/business/integrations/sync", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ installationId: installation.id }),
        }),
      );
      if (!parsed.ok) setError(parsed.errorMessage ?? "Sync failed");
      await refresh();
    } finally {
      setBusy(false);
      setSyncingId(null);
      setBusyLabel(null);
    }
  }

  async function confirmDisconnect() {
    if (!disconnectFor) return;
    setBusy(true);
    setBusyLabel("Disconnecting");
    try {
      await fetch("/api/business/integrations/revoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: disconnectFor.id }),
      });
      setDisconnectFor(null);
      await refresh();
    } finally {
      setBusy(false);
      setBusyLabel(null);
    }
  }

  async function applyFixture(connectorId: string, outcome: string) {
    setBusy(true);
    setBusyLabel("Applying fixture");
    try {
      const parsed = await parseApiJsonResponse(
        await fetch("/api/business/integrations/oauth/fixture", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ connectorId, outcome }),
        }),
      );
      if (!parsed.ok) setError(parsed.errorMessage ?? "Fixture outcome failed");
      await refresh();
    } finally {
      setBusy(false);
      setBusyLabel(null);
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

  const consent = consentFor ? BOS_CONNECTOR_CONSENT[consentFor] : null;

  return (
    <>
      <Header title="Integrations" />
      <PageMain>
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-700">
            {error}
          </p>
        )}
        {rbacHint && (
          <p data-testid="bos-integrations-rbac-hint" className="mb-4 text-sm text-slate-600">
            {rbacHint}
          </p>
        )}
        <p className="mb-4 text-sm text-slate-600">
          Optional read-first connectors. Business OS remains usable without any connector. Fixtures are never live.
          External writes, email send, CRM mutation, and accounting writes stay disabled.
        </p>
        <p
          data-testid="bos-browser-fixture-banner"
          className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
        >
          Browser fixture mode — not live Xero, Microsoft 365, or HubSpot certification. No provider credentials are
          used.
        </p>
        <div className="mb-6 flex flex-wrap gap-3">
          <Button disabled={busy || !canManage} onClick={() => void seedDemo()}>
            Load fixture catalog
          </Button>
          <Button disabled={busy || !canManage} onClick={() => void previewCsv()}>
            Preview CSV
          </Button>
        </div>
        {busyLabel && (
          <p aria-live="polite" className="mb-4 text-sm text-slate-600">
            {busyLabel}…
          </p>
        )}

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

        <div data-testid="bos-integrations-catalog" className="mb-8" aria-busy={busy}>
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
                const state =
                  syncingId && installation?.id === syncingId ? "SYNCING" : uiState(row, installation);
                const oauthId = isBosOauthConnector(row.id) ? row.id : null;
                const consentCopy = oauthId ? BOS_CONNECTOR_CONSENT[oauthId] : null;
                const connectLabel = oauthId
                  ? state === "REAUTH_REQUIRED"
                    ? RECONNECT_LABEL[oauthId]
                    : CONNECT_LABEL[oauthId]
                  : "Configure";
                const showConnect =
                  Boolean(oauthId) &&
                  (state === "NOT_CONNECTED" ||
                    state === "DISCONNECTED" ||
                    state === "ERROR" ||
                    state === "REAUTH_REQUIRED");
                const showSync = Boolean(oauthId) && (state === "CONNECTED" || state === "SYNCING");
                const showDisconnect =
                  Boolean(installation) &&
                  state !== "NOT_CONNECTED" &&
                  state !== "DISCONNECTED" &&
                  installation?.health !== "revoked";
                return (
                  <Card key={row.id} data-testid={`bos-connector-card-${row.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate" title={consentCopy?.providerLabel ?? row.provider}>
                          {consentCopy?.providerLabel ?? row.provider}
                        </span>
                        <StatusChip value="neutral">READ ONLY</StatusChip>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p data-testid={`bos-connector-state-${row.id}`}>
                        <span className="sr-only">Connection status</span>
                        <StatusChip status={connectorStatusChip(state)}>{state}</StatusChip>
                        <span className="ml-2">
                          Mode: {installation?.modeLabel ?? "FIXTURE/SANDBOX"} · Sync health:{" "}
                          {installation?.health ?? "unconfigured"}
                        </span>
                      </p>
                      <p data-testid={`bos-connector-capabilities-${row.id}`}>
                        {installation?.capabilitySummary ??
                          consentCopy?.capabilitySummary ??
                          "Optional file import."}
                      </p>
                      {consentCopy && (
                        <p data-testid={`bos-connector-permissions-${row.id}`}>
                          Approved permission class: {consentCopy.permissionClass}
                        </p>
                      )}
                      <p
                        className="truncate"
                        title={installation?.organisation ?? "not bound"}
                        data-testid={`bos-connector-org-${row.id}`}
                      >
                        Account: {installation?.organisation ?? "not bound"}
                      </p>
                      <p data-testid={`bos-connector-last-sync-${row.id}`}>
                        Last sync: {installation?.lastSuccessfulSyncAt ?? "never"}
                      </p>
                      {installation?.errorMessage && (
                        <p role="alert" className="text-red-700">
                          {installation.errorMessage}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {showConnect && (
                          <Button
                            disabled={busy || !canManage}
                            aria-label={connectLabel}
                            data-testid={`bos-connect-${row.id}`}
                            onClick={() => (oauthId ? setConsentFor(oauthId) : void configure(row.id))}
                          >
                            {connectLabel}
                          </Button>
                        )}
                        {!oauthId && (
                          <Button disabled={busy || !canManage} onClick={() => void configure(row.id)}>
                            Configure
                          </Button>
                        )}
                        {!oauthId && installation && (
                          <Button
                            variant="outline"
                            disabled={busy || !canManage}
                            onClick={() => setDisconnectFor(installation)}
                          >
                            Revoke
                          </Button>
                        )}
                        {showSync && installation && (
                          <Button
                            disabled={busy || !canManage}
                            aria-label={`Sync Now ${consentCopy?.providerLabel ?? row.provider}`}
                            data-testid={`bos-sync-${row.id}`}
                            onClick={() => void syncNow(installation)}
                          >
                            {state === "SYNCING" ? "Syncing…" : "Sync Now"}
                          </Button>
                        )}
                        {showDisconnect && installation && (
                          <Button
                            variant="outline"
                            disabled={busy || !canManage}
                            aria-label={`Disconnect ${consentCopy?.providerLabel ?? row.provider}`}
                            data-testid={`bos-disconnect-${row.id}`}
                            onClick={() => setDisconnectFor(installation)}
                          >
                            Disconnect
                          </Button>
                        )}
                      </div>
                      {oauthId && installation && state === "CONNECTED" && (
                        <div
                          data-testid={`bos-fixture-controls-${row.id}`}
                          className="mt-3 space-y-2 rounded border border-dashed border-slate-300 p-2"
                        >
                          <p className="text-xs font-medium text-slate-600">Certification fixture controls</p>
                          <div className="flex flex-wrap gap-2">
                            {(
                              [
                                ["reauth_required", "Simulate reauth"],
                                ["provider_unavailable", "Provider unavailable"],
                                ["permission_denied", "Permission denied"],
                                ["timeout", "Timeout"],
                                ["rate_limit", "Rate limit"],
                                ["schema_invalid", "Schema invalid"],
                                ["wrong_provider_org", "Wrong account"],
                                ["sync_error", "Next sync error"],
                              ] as const
                            ).map(([outcome, label]) => (
                              <Button
                                key={outcome}
                                size="sm"
                                variant="secondary"
                                disabled={busy || !canManage}
                                data-testid={`bos-fixture-${row.id}-${outcome}`}
                                onClick={() => void applyFixture(row.id, outcome)}
                              >
                                {label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
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

      {consentFor && consent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bos-consent-title"
          data-testid="bos-consent-dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
        >
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h2 id="bos-consent-title" className="mb-2 text-lg font-semibold">
              Connect {consent.providerLabel}
            </h2>
            <p className="mb-2 text-sm">{consent.capabilitySummary}</p>
            <p className="mb-2 text-sm">Approved access: {consent.permissionClass}</p>
            <p className="mb-4 text-sm text-slate-600">BOS cannot: {consent.cannot.join("; ")}.</p>
            <p className="mb-4 text-sm">Connection requires your explicit action. Nothing is authorised automatically.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConsentFor(null)}>
                Cancel
              </Button>
              <Button
                data-testid="bos-consent-continue"
                autoFocus
                onClick={() => {
                  const id = consentFor;
                  setConsentFor(null);
                  void startOAuth(id);
                }}
              >
                Continue to connect
              </Button>
            </div>
          </div>
        </div>
      )}

      {disconnectFor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bos-disconnect-title"
          data-testid="bos-disconnect-dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
        >
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h2 id="bos-disconnect-title" className="mb-2 text-lg font-semibold">
              Disconnect this integration?
            </h2>
            <p className="mb-4 text-sm">
              Sync will stop. The stored secret reference will be cleared. This does not prove the provider revoked access
              unless a provider revocation result is recorded.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDisconnectFor(null)}>
                Cancel
              </Button>
              <Button data-testid="bos-disconnect-confirm" variant="destructive" autoFocus onClick={() => void confirmDisconnect()}>
                Confirm disconnect
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
