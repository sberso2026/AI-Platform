"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EngineeringBreadcrumb } from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";

type WorkEvent = {
  id: string;
  eventType: string;
  sourceSystem: string;
  sourceObjectType: string;
  sourceObjectId: string;
  disciplineId?: string | null;
  systemId?: string | null;
  lifecycleStage?: string | null;
  occurredAt: string;
  materiality: string;
  confirmationState: string;
  captureReason: string;
  actorId?: string | null;
};

type DayView = {
  sourcesRevised: number;
  analysesExecuted: number;
  reviewsCompleted: number;
  decisionsRecorded: number;
  productivityScore: null;
};

type WorkTemplate = {
  code: string;
  name: string;
  workType: string;
  lifecycleStage: string;
  version: string;
};

type WorkPlan = {
  id: string;
  workType: string;
  templateCode: string;
  templateVersion: string;
  status: string;
  readiness: string;
  startAllowed: boolean;
  staleness: string;
  systemId?: string | null;
  generatedAt: string;
};

const VIEWS = ["Changed", "My Work", "Waiting", "Completed", "By Discipline", "By System", "By Lifecycle Stage"] as const;

export function WorkWorkspace() {
  const projectId = useResolvedEngineeringProjectId();
  const router = useRouter();
  const [view, setView] = useState<(typeof VIEWS)[number]>("Changed");
  const [rows, setRows] = useState<WorkEvent[]>([]);
  const [day, setDay] = useState<DayView | null>(null);
  const [templates, setTemplates] = useState<WorkTemplate[]>([]);
  const [plans, setPlans] = useState<WorkPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/engineering/work?action=generatorCatalog")
      .then((response) => parseApiJsonResponse<{ templates: WorkTemplate[] }>(response))
      .then((json) => {
        if (json.data?.templates) setTemplates(json.data.templates);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/engineering/work?action=list&projectId=${encodeURIComponent(projectId)}`)
      .then((response) => parseApiJsonResponse<WorkEvent[]>(response))
      .then((json) => {
        if (json.errorMessage) setError(json.errorMessage);
        setRows(Array.isArray(json.data) ? json.data : []);
      })
      .catch((err: Error) => setError(err.message));
    fetch(`/api/engineering/work?action=day&projectId=${encodeURIComponent(projectId)}`)
      .then((response) => parseApiJsonResponse<DayView>(response))
      .then((json) => {
        if (json.errorMessage) setError(json.errorMessage);
        setDay(json.data);
      })
      .catch((err: Error) => setError(err.message));
    fetch(`/api/engineering/work?action=plans&projectId=${encodeURIComponent(projectId)}`)
      .then((response) => parseApiJsonResponse<WorkPlan[]>(response))
      .then((json) => {
        setPlans(Array.isArray(json.data) ? json.data : []);
      })
      .catch((err: Error) => setError(err.message));
  }, [projectId]);

  const filtered = useMemo(() => {
    if (view === "Changed") return rows.filter((row) => ["SOURCE_REVISED", "SOURCE_PUBLISHED", "INTERFACE_INFORMATION_CHANGED", "CONFIGURATION_CHANGED"].includes(row.eventType));
    if (view === "Waiting") return rows.filter((row) => ["DOCUMENT_REVIEW_REQUESTED", "RFI_CREATED", "ACTION_CREATED"].includes(row.eventType));
    if (view === "Completed") return rows.filter((row) => ["DOCUMENT_REVIEW_COMPLETED", "ACTION_COMPLETED", "RFI_CLOSED", "DECISION_RECORDED", "DRAWING_ISSUED", "DELIVERABLE_ISSUED", "CALCULATION_PUBLISHED"].includes(row.eventType));
    if (view === "By Discipline") return [...rows].sort((a, b) => String(a.disciplineId ?? "").localeCompare(String(b.disciplineId ?? "")));
    if (view === "By System") return [...rows].sort((a, b) => String(a.systemId ?? "").localeCompare(String(b.systemId ?? "")));
    if (view === "By Lifecycle Stage") return [...rows].sort((a, b) => String(a.lifecycleStage ?? "").localeCompare(String(b.lifecycleStage ?? "")));
    return rows;
  }, [rows, view]);

  async function startWork(template: WorkTemplate) {
    if (!projectId) {
      setError("Select an authorized project first. Project context is reused, not typed as a raw ID.");
      return;
    }
    setBusy(template.code);
    setError(null);
    const response = await fetch("/api/engineering/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generatePlan",
        projectId,
        workType: template.workType,
        lifecycleStage: template.lifecycleStage,
      }),
    });
    const json = await parseApiJsonResponse<WorkPlan>(response);
    setBusy(null);
    if (json.errorMessage || !json.data?.id) {
      setError(json.errorMessage ?? "Could not prepare engineering work.");
      return;
    }
    router.push(`/engineering/work/plans/${json.data.id}`);
  }

  const openPlans = plans.filter((row) => row.status !== "SUPERSEDED" && row.status !== "CANCELLED");

  return (
    <>
      <Header title="Engineering Work" description="Prepare the engineering desk. Material workflow events remain visible; this is not employee activity or productivity scoring." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Work" }]} />
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        <section className="mt-6" aria-label="Start Engineering Work">
          <h2 className="text-lg font-semibold">Start Engineering Work</h2>
          <p className="mt-1 text-sm text-muted-foreground">What can EOS prepare for me? Project and lifecycle context are reused. Artifact generation is A11B.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="rounded border px-3 py-2 text-sm" disabled={Boolean(busy) || !projectId} onClick={() => void startWork({ code: "EWT-CHANGE", name: "Change assessment", workType: "CHANGE_ASSESSMENT", lifecycleStage: "CONSTRUCTION", version: "v1" })}>Assess Change</button>
            <button type="button" className="rounded border px-3 py-2 text-sm" disabled={Boolean(busy) || !projectId} onClick={() => void startWork({ code: "EWT-OPTION-STUDY", name: "Option study", workType: "OPTION_STUDY", lifecycleStage: "PREFEASIBILITY", version: "v1" })}>Compare Options</button>
            <button type="button" className="rounded border px-3 py-2 text-sm" disabled={Boolean(busy) || !projectId} onClick={() => void startWork({ code: "EWT-CON-RFI", name: "RFI/TQ engineering response", workType: "RFI_TQ_RESPONSE", lifecycleStage: "CONSTRUCTION", version: "v1" })}>Prepare RFI/TQ Response</button>
            <button type="button" className="rounded border px-3 py-2 text-sm" disabled={Boolean(busy) || !projectId} onClick={() => void startWork({ code: "EWT-CHANGE", name: "Field change assessment", workType: "CHANGE_ASSESSMENT", lifecycleStage: "CONSTRUCTION", version: "v1" })}>Assess Field Change</button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <button
                key={`${template.code}-${template.lifecycleStage}`}
                type="button"
                className="rounded border p-4 text-left text-sm hover:bg-muted/40"
                onClick={() => void startWork(template)}
                disabled={Boolean(busy)}
              >
                <p className="font-medium">{template.name}</p>
                <p className="mt-1 text-muted-foreground">{template.workType.replaceAll("_", " ")} · {template.lifecycleStage.replaceAll("_", " ")}</p>
                <p className="mt-2">{busy === template.code ? "Preparing context…" : "Start Engineering Work"}</p>
              </button>
            ))}
          </div>
        </section>
        <section className="mt-8" aria-label="Continue Work">
          <h2 className="text-lg font-semibold">Continue Work</h2>
          {openPlans.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No prepared work plans in this project yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {openPlans.map((plan) => (
                <li key={plan.id} className="rounded border p-3 text-sm">
                  <Link className="font-medium underline-offset-2 hover:underline" href={`/engineering/work/plans/${plan.id}`}>
                    Continue {plan.workType.replaceAll("_", " ")}
                  </Link>
                  <p className="mt-1 text-muted-foreground">
                    {plan.readiness.replaceAll("_", " ")} · {plan.status} · {plan.templateCode}@{plan.templateVersion}
                    {plan.systemId ? ` · ${plan.systemId}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
        {day && (
          <section className="mt-8 rounded border p-4 text-sm" aria-label="Engineering day summary">
            <p>
              Since yesterday: {day.sourcesRevised} sources revised · {day.analysesExecuted} analysis executed · {day.reviewsCompleted} reviews completed · {day.decisionsRecorded} decisions recorded.
            </p>
            <p className="mt-1 text-muted-foreground">This is an engineering-state summary, not an employee productivity score.</p>
          </section>
        )}
        <div className="mt-4">
          <label className="text-sm">
            View
            <select className="eos-select mt-1 block" value={view} onChange={(event) => setView(event.target.value as (typeof VIEWS)[number])} aria-label="Work view">
              {VIEWS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <ul className="mt-4 space-y-2">
          {filtered.map((row) => (
            <li key={row.id} className="rounded border p-3 text-sm">
              <Link className="font-medium underline-offset-2 hover:underline" href={`/engineering/work/${row.id}`}>
                {row.eventType} · {row.sourceObjectType}:{row.sourceObjectId}
              </Link>
              <p className="mt-1">
                {row.materiality}
                {row.disciplineId ? ` · ${row.disciplineId}` : ""}
                {row.confirmationState === "CANDIDATE" ? " · candidate pending confirmation" : ""}
                {` · ${row.occurredAt}`}
              </p>
              <p className="mt-1 text-muted-foreground">{row.captureReason}</p>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
