"use client";

import { useMemo, useState } from "react";
import { Button, StatusChip } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import { CreateForm, useRegisterList } from "@/components/engineering/register-shell";
import {
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { ObjectThreadPanel } from "@/components/engineering/object-thread-panel";

type FilterId = "all" | "blocked" | "ready" | "executing" | "results" | "stale";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Analysis Requests" },
  { id: "blocked", label: "Blocked" },
  { id: "ready", label: "Ready" },
  { id: "executing", label: "Executing" },
  { id: "results", label: "Results" },
  { id: "stale", label: "Stale" },
];

function statusOf(item: Record<string, unknown>): string {
  return String(item.status ?? item.Status ?? "");
}

export function AnalysisWorkspace() {
  const { items, loading, error, reload, projectId } = useRegisterList("/api/engineering/analysis");
  const { canMutate } = useEngineeringWriteAccess();
  const [filter, setFilter] = useState<FilterId>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [preflight, setPreflight] = useState<Record<string, unknown> | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const visible = useMemo(() => {
    return items.filter((item) => {
      const status = statusOf(item);
      if (filter === "blocked") return status === "blocked";
      if (filter === "ready") return status === "ready";
      if (filter === "executing") return status === "queued" || status === "executing";
      if (filter === "results") return status === "succeeded" || status === "failed";
      if (filter === "stale") return item.stale === true;
      return true;
    });
  }, [items, filter]);

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetailError(null);
    const response = await fetch(`/api/engineering/analysis?id=${encodeURIComponent(id)}`);
    const parsed = await parseApiJsonResponse(response);
    if (!parsed.ok) {
      setDetail(null);
      setDetailError(parsed.errorMessage ?? "Failed to load analysis request");
      return;
    }
    setDetail((parsed.data as Record<string, unknown>) ?? null);
    const pre = await fetch(`/api/engineering/analysis?id=${encodeURIComponent(id)}&action=preflight`);
    const preParsed = await parseApiJsonResponse(pre);
    setPreflight(preParsed.ok ? ((preParsed.data as Record<string, unknown>) ?? null) : null);
    const res = await fetch(`/api/engineering/analysis?id=${encodeURIComponent(id)}&action=result`);
    const resParsed = await parseApiJsonResponse(res);
    setResult(resParsed.ok ? ((resParsed.data as Record<string, unknown>) ?? null) : null);
  }

  async function post(body: Record<string, unknown>) {
    await fetch("/api/engineering/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await reload();
    if (selectedId) await openDetail(selectedId);
  }

  const blocking = Array.isArray(preflight?.blockingReasons) ? (preflight?.blockingReasons as string[]) : [];
  const explanation = Array.isArray(preflight?.readiness)
    ? []
    : ((preflight?.readiness as { explanation?: string[] } | undefined)?.explanation ?? []);
  const toolSelected = preflight?.toolSelected as { profileId?: string; toolCode?: string; why?: string[] } | undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Analysis" }]} />
        <h1 className="text-2xl font-semibold">Engineering Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Discipline-neutral analysis requests. Tool configuration lives under Settings → External Tools. A blocked tool is a
          valid governed outcome — not an application failure.
        </p>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((tab) => (
            <Button key={tab.id} variant={filter === tab.id ? "primary" : "secondary"} onClick={() => setFilter(tab.id)}>
              {tab.label}
            </Button>
          ))}
        </div>
        {canMutate ? (
          <CreateForm
            endpoint="/api/engineering/analysis"
            fields={[
              { name: "discipline", label: "Discipline", required: true },
              { name: "capability", label: "Capability", required: true },
            ]}
            extra={{ projectId }}
            onCreated={reload}
          />
        ) : null}
        {loading ? <OperationalSkeleton /> : null}
        {error ? <OperationalError message={error} /> : null}
        {!loading && !visible.length ? (
          <EmptyOperationalState title="No analysis requests" body="Create a request or adjust the filter." />
        ) : (
          <ul className="divide-y rounded border">
            {visible.map((item) => {
              const id = String(item.id ?? "");
              const hidden = String(item.capability) === "CERTIFICATION_ANALYSIS";
              if (hidden) return null;
              return (
                <li key={id} className="flex cursor-pointer items-center justify-between p-3" onClick={() => openDetail(id)}>
                  <span>
                    {String(item.discipline)} / {String(item.capability)}
                  </span>
                  <StatusChip status={statusOf(item)} />
                </li>
              );
            })}
          </ul>
        )}
        {detailError ? <OperationalError message={detailError} /> : null}
        {detail ? (
          <section className="space-y-3 rounded border p-4">
            <h2 className="text-lg font-medium">Request detail</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt>Discipline</dt>
              <dd>{String(detail.discipline)}</dd>
              <dt>Capability</dt>
              <dd>{String(detail.capability)}</dd>
              <dt>System / Asset / Interface</dt>
              <dd>
                {String(detail.systemId ?? "—")} / {String(detail.assetId ?? "—")} / {String(detail.interfaceId ?? "—")}
              </dd>
              <dt>Baseline</dt>
              <dd>{String(detail.configurationBaselineId ?? "—")}</dd>
              <dt>Requirements</dt>
              <dd>{JSON.stringify(detail.requirementIds ?? [])}</dd>
              <dt>Assumptions</dt>
              <dd>{JSON.stringify(detail.assumptionIds ?? [])}</dd>
              <dt>Standards</dt>
              <dd>{JSON.stringify(detail.applicableStandardCodes ?? [])}</dd>
              <dt>Status</dt>
              <dd>
                <StatusChip status={statusOf(detail)} />
              </dd>
            </dl>
            {statusOf(detail) === "blocked" ? (
              <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">
                <p className="font-medium">Status: BLOCKED</p>
                <p>Tool: {toolSelected?.toolCode ?? "not selected"}</p>
                <p>Reason: {blocking.join(", ") || "See preconditions."}</p>
                {explanation.length ? (
                  <ul className="mt-2 list-disc pl-5">
                    {explanation.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-2">
                  This is not an application failure. Configure an approved certified external tool under Settings → External
                  Tools.
                </p>
              </div>
            ) : null}
            {preflight ? (
              <pre className="overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(preflight, null, 2)}</pre>
            ) : null}
            {result ? <pre className="overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(result, null, 2)}</pre> : null}
            {selectedId ? <ObjectThreadPanel objectType="analysis_request" objectId={selectedId} /> : null}
            {canMutate ? (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => post({ action: "preflight", id: selectedId })}>Validate</Button>
                <Button onClick={() => post({ action: "plan", id: selectedId })}>Create plan</Button>
                <Button onClick={() => post({ action: "queue", id: selectedId })}>Queue</Button>
                <Button variant="secondary" onClick={() => post({ action: "cancel", id: selectedId })}>
                  Cancel
                </Button>
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
