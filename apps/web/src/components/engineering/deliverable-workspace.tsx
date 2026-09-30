"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import {
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
} from "@/components/engineering/operational";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type Listed = {
  id: string;
  definitionCode: string;
  lifecycleStage: string;
  responsibleDiscipline: string;
  contributingDisciplines: string[];
  intendedPurpose: string;
  requirementState: string;
  scopeType: string;
  scopeId: string;
  boundCount: number;
  status: string;
  latest?: {
    completeness: string;
    readiness: string;
    stale: boolean;
    dimensions: Array<{ dimension: string; state: string; explanation: string; waived?: boolean }>;
    digitalThread: string;
    assuranceSignals: Array<{ conditionType: string; explanation: string }>;
  } | null;
};

const VIEWS = [
  { id: "expected", label: "Expected" },
  { id: "missing", label: "Missing" },
  { id: "developing", label: "Developing" },
  { id: "review", label: "Review Ready" },
  { id: "purpose", label: "Ready for Configured Purpose" },
  { id: "stale", label: "Stale" },
  { id: "discipline", label: "By Discipline" },
  { id: "stage", label: "By Lifecycle Stage" },
  { id: "scope", label: "By System / Package" },
] as const;

export function DeliverableWorkspace() {
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>((params?.get("view") as (typeof VIEWS)[number]["id"]) ?? "expected");
  const [projectId, setProjectId] = useState(params?.get("projectId") ?? "proj-crusher-feed");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<Listed[]>([]);
  const [selected, setSelected] = useState<Listed | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (view === "missing") return rows.filter((row) => row.status === "MISSING");
    if (view === "developing") return rows.filter((row) => row.status === "DEVELOPING" || row.status === "PARTIAL" || row.status === "INCOMPLETE");
    if (view === "review") return rows.filter((row) => row.latest?.readiness === "READY_FOR_REVIEW");
    if (view === "purpose") return rows.filter((row) => row.latest?.readiness === "READY_FOR_CONFIGURED_PURPOSE");
    if (view === "stale") return rows.filter((row) => row.status === "STALE" || row.latest?.stale);
    return rows;
  }, [rows, view]);

  async function load() {
    setError(null);
    const parsed = await parseApiJsonResponse(
      await fetch(`/api/engineering/deliverables?action=list&projectId=${encodeURIComponent(projectId)}`),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to load deliverables");
      return;
    }
    const data = parsed.data as { expected?: Listed[]; note?: string };
    setRows(data.expected ?? []);
    setNote(data.note ?? "");
  }

  useEffect(() => {
    void load();
  }, [projectId]);

  async function evaluate(id: string) {
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate", expectationId: id }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to evaluate deliverable");
      return;
    }
    await load();
  }

  return (
    <>
      <Header
        title="Deliverable Intelligence"
        description="Governed engineering expectations, canonical artifact bindings, and purpose-specific maturity evidence. Maturity is not approval, safety, or percent complete."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Deliverables" }]} />
        {error ? <OperationalError message={error} /> : null}
        <div className="mb-4 flex flex-wrap gap-2">
          {VIEWS.map((item) => (
            <Button key={item.id} size="sm" variant="secondary" onClick={() => setView(item.id)}>
              {item.label}
            </Button>
          ))}
        </div>
        <label className="mb-4 block text-sm">
          Project id
          <input className="mt-1 w-full rounded border px-2 py-1" value={projectId} onChange={(event) => setProjectId(event.target.value)} />
        </label>
        <p className="mb-4 text-sm">{note || "Counts of expected versus bound expectations are not engineering percent complete."}</p>
        {!rows.length ? (
          <EmptyOperationalState
            title="No deliverable expectations"
            description="Instantiate a governed example definition against a lifecycle scope. This is not a document register."
          />
        ) : null}
        {view === "discipline" ? (
          <ul className="space-y-2 text-sm">
            {visible.map((row) => (
              <li key={row.id} className="rounded border p-2">
                {row.responsibleDiscipline} owns {row.definitionCode}; contributing {row.contributingDisciplines.join(", ") || "none"}
              </li>
            ))}
          </ul>
        ) : null}
        {view === "stage" ? (
          <ul className="space-y-2 text-sm">
            {visible.map((row) => (
              <li key={row.id} className="rounded border p-2">
                {row.lifecycleStage}: {row.definitionCode} ({row.status})
              </li>
            ))}
          </ul>
        ) : null}
        {view === "scope" ? (
          <ul className="space-y-2 text-sm">
            {visible.map((row) => (
              <li key={row.id} className="rounded border p-2">
                {row.scopeType} {row.scopeId}: {row.definitionCode}
              </li>
            ))}
          </ul>
        ) : null}
        {view !== "discipline" && view !== "stage" && view !== "scope" ? (
          <ul className="space-y-2 text-sm">
            {visible.map((row) => (
              <li key={row.id} className="rounded border p-2">
                <button type="button" className="underline" onClick={() => setSelected(row)}>
                  {row.definitionCode}
                </button>{" "}
                {row.status} · {row.responsibleDiscipline} · {row.intendedPurpose}
                <Button className="ml-2" size="sm" onClick={() => void evaluate(row.id)}>
                  Evaluate from canonical evidence
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        {selected ? (
          <section className="mt-6 space-y-2 rounded border p-3 text-sm">
            <p className="font-medium">{selected.definitionCode}</p>
            <p>Stage: {selected.lifecycleStage}</p>
            <p>Scope: {selected.scopeType} {selected.scopeId}</p>
            <p>Responsible: {selected.responsibleDiscipline}</p>
            <p>Contributing: {selected.contributingDisciplines.join(", ") || "none"}</p>
            <p>Required: {selected.requirementState}</p>
            <p>Purpose: {selected.intendedPurpose}</p>
            <p>Bound artifacts: {selected.boundCount}</p>
            <p>Readiness: {selected.latest?.readiness ?? "NOT_EVALUATED"}</p>
            <p>Completeness: {selected.latest?.completeness ?? "not assessed"}</p>
            <p>Stale: {selected.latest?.stale ? "yes" : "no"}</p>
            <p>Thread: {selected.latest?.digitalThread ?? "none"}</p>
            {(selected.latest?.dimensions ?? []).map((row) => (
              <p key={row.dimension}>
                {row.dimension}: {row.state}
                {row.waived ? " (WAIVED)" : ""} — {row.explanation}
              </p>
            ))}
            {(selected.latest?.assuranceSignals ?? []).map((row) => (
              <p key={row.conditionType}>
                {row.conditionType}: {row.explanation}
              </p>
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}
