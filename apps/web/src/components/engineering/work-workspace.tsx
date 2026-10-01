"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EngineeringBreadcrumb } from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";
import { buildAskHref } from "@/hooks/use-engineering-context";

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
  discipline?: string | null;
  lifecycleStage?: string | null;
  systemId?: string | null;
  generatedAt: string;
  context?: {
    information?: Array<{ title: string; revision?: string | null; purpose?: string | null }>;
    gaps?: Array<{ kind: string; title: string; explanation: string }>;
  };
};

type WorkbenchAction = {
  code: string;
  label: string;
  workType: string | null;
  href: string | null;
  availability: "AVAILABLE" | "REQUIRES_WORK_PLAN" | "UNAVAILABLE";
  reason: string;
  reuses: string;
};

type WorkbenchPayload = {
  lifecycleStage: string;
  actions: WorkbenchAction[];
  governingInformation: Array<{ title: string; revision?: string | null; purpose?: string | null }>;
  deepModules: Array<{ id: string; label: string; href: string }>;
  metrics: { initialMs: number; plansMs: number; actionsMs: number; governingMs: number };
};

const MATERIAL_EVENTS = new Set([
  "WORK_STARTED",
  "ARTIFACT_GENERATED",
  "ARTIFACT_RETURNED",
  "PRE_ISSUE_REVIEW_COMPLETED",
  "IMPACT_ASSESSMENT_COMPLETED",
  "RFI_RESPONSE_PREPARED",
  "SOURCE_REVISED",
  "SOURCE_PUBLISHED",
  "DECISION_RECORDED",
  "CALCULATION_PUBLISHED",
]);

function readinessLabel(value: string) {
  if (value === "READY") return "Ready";
  if (value.includes("CONDITION")) return "Ready with conditions";
  if (value.includes("BLOCKED") || value === "BLOCKED") return "Blocked";
  return value.replaceAll("_", " ");
}

export function WorkWorkspace() {
  const projectId = useResolvedEngineeringProjectId();
  const router = useRouter();
  const [rows, setRows] = useState<WorkEvent[]>([]);
  const [day, setDay] = useState<DayView | null>(null);
  const [templates, setTemplates] = useState<WorkTemplate[]>([]);
  const [plans, setPlans] = useState<WorkPlan[]>([]);
  const [workbench, setWorkbench] = useState<WorkbenchPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showSpecialist, setShowSpecialist] = useState(false);

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
    const started = performance.now();
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
    fetch(`/api/engineering/work?action=workbench&projectId=${encodeURIComponent(projectId)}`)
      .then((response) => parseApiJsonResponse<WorkbenchPayload>(response))
      .then((json) => {
        if (json.data) setWorkbench(json.data);
        window.setTimeout(() => {
          console.info(`[eos-a12a] workbench wall_ms=${Math.round(performance.now() - started)}`);
        }, 0);
      })
      .catch((err: Error) => setError(err.message));
  }, [projectId]);

  const openPlans = plans.filter((row) => row.status !== "SUPERSEDED" && row.status !== "CANCELLED");
  const recent = useMemo(
    () => rows.filter((row) => MATERIAL_EVENTS.has(row.eventType)).slice(0, 8),
    [rows],
  );
  const lifecycleActions = workbench?.actions ?? [];
  const startActions = lifecycleActions.filter((row) => row.workType);
  const governing = workbench?.governingInformation ?? openPlans[0]?.context?.information ?? [];

  async function startWork(input: { code: string; workType: string; lifecycleStage?: string; name?: string }) {
    if (!projectId) {
      setError("Select an authorized project first. Project context is reused, not typed as a raw ID.");
      return;
    }
    setBusy(input.code);
    setError(null);
    const response = await fetch("/api/engineering/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generatePlan",
        projectId,
        workType: input.workType,
        lifecycleStage: input.lifecycleStage ?? workbench?.lifecycleStage,
      }),
    });
    const json = await parseApiJsonResponse<WorkPlan>(response);
    setBusy(null);
    if (json.errorMessage || !json.data?.id) {
      setError(json.errorMessage ?? "Cannot start this work. Check governing information, then Request Information or create an Assumption.");
      return;
    }
    router.push(`/engineering/work/plans/${json.data.id}`);
  }

  function runAction(action: WorkbenchAction) {
    if (action.availability === "UNAVAILABLE") {
      setError(action.reason);
      return;
    }
    if (action.href) {
      router.push(action.href);
      return;
    }
    if (action.workType) {
      void startWork({
        code: action.code,
        workType: action.workType,
        lifecycleStage: workbench?.lifecycleStage !== "UNKNOWN" ? workbench?.lifecycleStage : undefined,
      });
    }
  }

  const askHref = buildAskHref({
    projectId,
    q: openPlans[0]
      ? "What is blocking this work? What information applies, and what changed that affects this system?"
      : "What information applies to this project, and what engineering work can EOS prepare?",
  });

  return (
    <>
      <Header
        title="Unified Engineering Workbench"
        description="Prepare the engineering desk. Material workflow events remain visible; this is not employee activity or productivity scoring."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="unified-engineering-workbench">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Work" }]} />
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}

        <section className="mt-6 rounded border p-4" aria-label="Project and lifecycle context">
          <p className="text-sm text-muted-foreground">Project context is selected once and reused. Switching project changes the view, not ownership of existing work.</p>
          <p className="mt-2 text-base font-medium">
            Lifecycle: {(workbench?.lifecycleStage ?? "UNKNOWN").replaceAll("_", " ")}
          </p>
        </section>

        <section className="mt-8" aria-label="Continue Work">
          <h2 className="text-lg font-semibold">Continue Work</h2>
          {openPlans.length === 0 ? (
            <div className="mt-3 rounded border p-4">
              <p className="text-sm">No active engineering work for this project.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="rounded border px-3 py-2 text-sm" disabled={!projectId || Boolean(busy)} onClick={() => void startWork({ code: "START_CALCULATION", workType: "DESIGN_CALCULATION", lifecycleStage: "DETAILED_DESIGN" })}>Start Calculation</button>
                <button type="button" className="rounded border px-3 py-2 text-sm" disabled={!projectId || Boolean(busy)} onClick={() => void startWork({ code: "PREPARE_ANALYSIS", workType: "ENGINEERING_ANALYSIS" })}>Start Analysis</button>
                <button type="button" className="rounded border px-3 py-2 text-sm" disabled={!projectId || Boolean(busy)} onClick={() => void startWork({ code: "PREPARE_DESIGN_REPORT", workType: "DESIGN_REPORT" })}>Prepare Design Report</button>
                <button type="button" className="rounded border px-3 py-2 text-sm" disabled={!projectId || Boolean(busy)} onClick={() => void startWork({ code: "ASSESS_CHANGE", workType: "CHANGE_ASSESSMENT", lifecycleStage: "CONSTRUCTION" })}>Assess Change</button>
                <button type="button" className="rounded border px-3 py-2 text-sm" disabled={!projectId || Boolean(busy)} onClick={() => void startWork({ code: "RESPOND_RFI_TQ", workType: "RFI_TQ_RESPONSE", lifecycleStage: "CONSTRUCTION" })}>Respond to RFI/TQ</button>
              </div>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {openPlans.map((plan) => (
                <li key={plan.id} className="rounded border p-3 text-sm">
                  <Link className="font-medium underline-offset-2 hover:underline" href={`/engineering/work/plans/${plan.id}`}>
                    Continue {plan.workType.replaceAll("_", " ")}
                  </Link>
                  <p className="mt-1 text-muted-foreground">
                    {readinessLabel(plan.readiness)} · {plan.status.replaceAll("_", " ")} · {plan.templateCode}@{plan.templateVersion}
                    {plan.systemId ? ` · ${plan.systemId}` : ""}
                    {plan.staleness !== "CURRENT" ? ` · ${plan.staleness.replaceAll("_", " ")}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8" aria-label="Start Engineering Work">
          <h2 className="text-lg font-semibold">Start Engineering Work</h2>
          <p className="mt-1 text-sm text-muted-foreground">What can EOS prepare for me? Project and lifecycle context are reused. Artifact generation is A11B.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {startActions.map((action) => (
              <button
                key={action.code}
                type="button"
                className="rounded border p-4 text-left text-sm hover:bg-muted/40 disabled:opacity-60"
                onClick={() => runAction(action)}
                disabled={Boolean(busy) || action.availability === "UNAVAILABLE" || !projectId}
                title={action.reason}
              >
                <p className="font-medium">{action.label}</p>
                <p className="mt-1 text-muted-foreground">{action.availability === "UNAVAILABLE" ? action.reason : busy === action.code ? "Preparing context…" : "Start Engineering Work"}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8" aria-label="Governing Information">
          <h2 className="text-lg font-semibold">Governing Information</h2>
          {governing.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No governing information is attached to current work. Start work to assemble applicable sources, or open Information.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {governing.slice(0, 8).map((row) => (
                <li key={row.title} className="rounded border p-3 text-sm">
                  <p className="font-medium">{row.title}{row.revision ? ` Rev ${row.revision}` : ""}</p>
                  {row.purpose ? <p className="mt-1 text-muted-foreground">{row.purpose}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8" aria-label="Engineering Actions">
          <h2 className="text-lg font-semibold">Engineering Actions</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {lifecycleActions.filter((row) => !row.workType || row.availability !== "AVAILABLE").map((action) => (
              <button
                key={action.code}
                type="button"
                className="rounded border px-3 py-2 text-sm disabled:opacity-60"
                disabled={action.availability === "UNAVAILABLE" || (!action.href && !action.workType)}
                onClick={() => runAction(action)}
                title={action.reason}
              >
                {action.label}
              </button>
            ))}
            <button type="button" className="rounded border px-3 py-2 text-sm" disabled={Boolean(busy) || !projectId} onClick={() => void startWork({ code: "EWT-CHANGE", workType: "CHANGE_ASSESSMENT", lifecycleStage: "CONSTRUCTION" })}>Assess Change</button>
            <button type="button" className="rounded border px-3 py-2 text-sm" disabled={Boolean(busy) || !projectId} onClick={() => void startWork({ code: "EWT-OPTION-STUDY", workType: "OPTION_STUDY", lifecycleStage: "PREFEASIBILITY" })}>Compare Options</button>
            <button type="button" className="rounded border px-3 py-2 text-sm" disabled={Boolean(busy) || !projectId} onClick={() => void startWork({ code: "EWT-CON-RFI", workType: "RFI_TQ_RESPONSE", lifecycleStage: "CONSTRUCTION" })}>Prepare RFI/TQ Response</button>
            <button type="button" className="rounded border px-3 py-2 text-sm" disabled={Boolean(busy) || !projectId} onClick={() => void startWork({ code: "EWT-CHANGE", workType: "CHANGE_ASSESSMENT", lifecycleStage: "CONSTRUCTION" })}>Assess Field Change</button>
          </div>
        </section>

        <section className="mt-8 rounded border p-4" aria-label="Ask EOS">
          <h2 className="text-lg font-semibold">Ask EOS</h2>
          <p className="mt-1 text-sm text-muted-foreground">Uses the selected project and current work. AI cannot approve design, issue a response, or override readiness.</p>
          <Link className="mt-3 inline-block rounded border px-3 py-2 text-sm" href={askHref}>Ask EOS</Link>
        </section>

        {day && (
          <section className="mt-8 rounded border p-4 text-sm" aria-label="Engineering day summary">
            <p>
              Since yesterday: {day.sourcesRevised} sources revised · {day.analysesExecuted} analysis executed · {day.reviewsCompleted} reviews completed · {day.decisionsRecorded} decisions recorded.
            </p>
            <p className="mt-1 text-muted-foreground">This is an engineering-state summary, not an employee productivity score.</p>
          </section>
        )}

        <section className="mt-8" aria-label="Recent work">
          <h2 className="text-lg font-semibold">Recent work</h2>
          {recent.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No recent material engineering events for this project view.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recent.map((row) => (
                <li key={row.id} className="rounded border p-3 text-sm">
                  <Link className="font-medium underline-offset-2 hover:underline" href={`/engineering/work/${row.id}`}>
                    {row.eventType.replaceAll("_", " ")} · {row.sourceObjectType}
                  </Link>
                  <p className="mt-1 text-muted-foreground">{row.captureReason} · {row.occurredAt}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8" aria-label="Specialist modules">
          <button type="button" className="text-sm underline-offset-2 hover:underline" onClick={() => setShowSpecialist((value) => !value)}>
            {showSpecialist ? "Hide specialist modules" : "Specialist and governance modules"}
          </button>
          {showSpecialist ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(workbench?.deepModules ?? []).map((row) => (
                <li key={row.id}>
                  <Link className="rounded border px-3 py-2 text-sm inline-block w-full" href={row.href}>{row.label}</Link>
                </li>
              ))}
              {templates.map((template) => (
                <li key={`${template.code}-catalog`} className="text-sm text-muted-foreground px-3 py-2">
                  Catalog: {template.name}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </main>
    </>
  );
}
