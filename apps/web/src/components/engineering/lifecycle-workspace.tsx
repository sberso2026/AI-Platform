"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import {
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
} from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";
import { useIdentityAssurance } from "@/hooks/use-identity-assurance";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";
import {
  allowedTransitionTargets,
  gateIdForCurrentStage,
  lifecycleControlState,
} from "@/lib/engineering/lifecycle-control-state";

type Assignment = {
  id: string;
  scopeType: string;
  scopeId: string;
  stage: string;
  profileId: string;
  profileVersion: string;
  version: number;
};

type Criterion = {
  criterionId: string;
  type: string;
  applicability: string;
  status: string;
  explanation: string;
  waived?: boolean;
  expectedCondition?: string;
  actualState?: string;
  sourceCompleteness?: string;
  stale?: boolean;
  evidenceRefs?: Array<{ objectType: string; objectId: string; note?: string }>;
};

type Evaluation = {
  id: string;
  gateId: string;
  completeness: string;
  readiness: string;
  profileVersion: string;
  stale: boolean;
  criteria: Criterion[];
  evidenceSource?: string;
  harvestedAt?: string;
  evidenceSnapshot?: { fingerprint?: string } | null;
};

type Alignment = {
  lifecycleStage?: string;
  state?: string;
  explanation?: string;
  note?: string;
  scheduleAuthority?: boolean;
};

type Transition = {
  id: string;
  fromStage: string;
  toStage: string;
  authorizedBy: string;
  authorizedAt: string;
  rationale: string;
  profileVersion: string;
};

type Catalog = {
  profile?: {
    allowedTransitions?: Array<{ from: string; to: string }>;
    gates?: Array<{ gateId: string; fromStage: string; toStage?: string }>;
  };
};

const VIEWS = [
  { id: "current", label: "Current Lifecycle" },
  { id: "scoped", label: "Scoped Lifecycle States" },
  { id: "gate", label: "Gate Readiness" },
  { id: "criteria", label: "Gate Criteria" },
  { id: "evidence", label: "Evidence" },
  { id: "schedule", label: "Schedule Alignment" },
  { id: "deliverables", label: "Required Deliverables" },
  { id: "history", label: "Stage History" },
  { id: "transitions", label: "Transitions" },
] as const;

export function LifecycleWorkspace() {
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>((params?.get("view") as (typeof VIEWS)[number]["id"]) ?? "current");
  const projectId = useResolvedEngineeringProjectId();
  const assurance = useIdentityAssurance();
  const { canMutate } = useEngineeringWriteAccess();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [alignment, setAlignment] = useState<Alignment | null>(null);
  const [history, setHistory] = useState<Transition[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [deliverableSummary, setDeliverableSummary] = useState<{
    required: Array<{ definitionCode: string; bound: boolean; readiness: string; stale: boolean }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rationale, setRationale] = useState("");
  const [toStage, setToStage] = useState("");
  const [lastDecision, setLastDecision] = useState<string | null>(null);

  const project = assignments.find((row) => row.scopeType === "PROJECT");
  const unmet = useMemo(
    () => (evaluation?.criteria ?? []).filter((row) => row.applicability === "APPLICABLE" && row.status !== "SATISFIED" && !row.waived),
    [evaluation],
  );
  const allowedTo = useMemo(
    () => allowedTransitionTargets(project?.stage, catalog?.profile?.allowedTransitions ?? []),
    [catalog, project?.stage],
  );
  const controls = lifecycleControlState({
    hasAssignment: Boolean(project),
    aal: assurance.aal,
    canMutate,
    evaluationReadiness: evaluation?.readiness,
    evaluationStale: Boolean(evaluation?.stale),
    lastDecision,
  });

  useEffect(() => {
    if (allowedTo.length && !allowedTo.includes(toStage)) setToStage(allowedTo[0] ?? "");
  }, [allowedTo, toStage]);

  async function load() {
    setError(null);
    const catalogParsed = await parseApiJsonResponse(await fetch("/api/engineering/lifecycle?action=catalog"));
    if (!catalogParsed.ok) {
      setError(catalogParsed.errorMessage ?? "Unable to load lifecycle catalog");
      return;
    }
    setCatalog((catalogParsed.data as Catalog) ?? null);
    if (!projectId) {
      setAssignments([]);
      return;
    }
    const listed = await parseApiJsonResponse(
      await fetch(`/api/engineering/lifecycle?action=assignments&projectId=${encodeURIComponent(projectId)}`),
    );
    if (listed.ok && Array.isArray(listed.data)) setAssignments(listed.data as Assignment[]);
    else setAssignments([]);
  }

  useEffect(() => {
    void load();
  }, [projectId]);

  async function loadHistory(assignmentId: string) {
    const parsed = await parseApiJsonResponse(
      await fetch(`/api/engineering/lifecycle?action=history&assignmentId=${encodeURIComponent(assignmentId)}`),
    );
    if (parsed.ok && Array.isArray(parsed.data)) setHistory(parsed.data as Transition[]);
  }

  async function evaluateGate() {
    if (!project?.id || !controls.evaluateEnabled) return;
    const gateId = gateIdForCurrentStage(project.stage, catalog?.profile?.gates ?? []) ?? "FEED_EXIT";
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate", assignmentId: project.id, gateId }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Gate evaluation denied");
      return;
    }
    setEvaluation(parsed.data as Evaluation);
    setLastDecision(null);
  }

  async function refreshGate() {
    if (!evaluation?.id) {
      await evaluateGate();
      return;
    }
    if (!controls.evaluateEnabled) return;
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh", evaluationId: evaluation.id, assignmentId: project?.id, gateId: evaluation.gateId }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Refresh denied");
      return;
    }
    setEvaluation(parsed.data as Evaluation);
    setLastDecision(null);
  }

  async function loadAlignment() {
    if (!projectId) return;
    const parsed = await parseApiJsonResponse(
      await fetch(`/api/engineering/lifecycle?action=alignment&projectId=${encodeURIComponent(projectId)}`),
    );
    if (parsed.ok) setAlignment(parsed.data as Alignment);
  }

  async function decide(decision: string) {
    if (!evaluation?.id || !controls.decisionEnabled) return;
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decide", evaluationId: evaluation.id, decision, rationale }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Gate decision denied");
      return;
    }
    setLastDecision(decision);
  }

  async function transition() {
    if (!project?.id || !controls.transitionEnabled) return;
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transition",
          assignmentId: project.id,
          toStage,
          evaluationId: evaluation?.id,
          rationale,
        }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Transition denied");
      return;
    }
    await load();
    if (project.id) await loadHistory(project.id);
  }

  async function assignProfile() {
    if (!projectId || !canMutate || assurance.aal !== "aal2") {
      setError("Assigning a Lifecycle Profile requires an authorized AAL2 session and a selected project.");
      return;
    }
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign",
          projectId,
          scopeType: "PROJECT",
          scopeId: projectId,
          stage: "FEED",
        }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Lifecycle assignment denied");
      return;
    }
    await load();
  }

  return (
    <>
      <Header
        title="Lifecycle Intelligence"
        description="Gate readiness is evaluated from canonical evidence. Humans authorize transitions. The system does not approve stage changes."
        wrapDescription
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Lifecycle" }]} />
        <EngineeringProjectContextBar />
        {error ? <OperationalError message={error} /> : null}
        <div className="mb-4 flex flex-wrap gap-2">
          {VIEWS.map((item) => (
            <Button key={item.id} size="sm" variant="secondary" onClick={() => setView(item.id)}>
              {item.label}
            </Button>
          ))}
        </div>
        {!projectId ? (
          <EmptyOperationalState
            title="Select a project"
            description="Lifecycle uses the authorized project selector. Arbitrary project IDs are not mutation authority."
          />
        ) : null}
        {projectId && !assignments.length ? (
          <EmptyOperationalState
            title="No lifecycle assignment"
            description={controls.reason}
            action={
              controls.assignmentCta === "assign" ? (
                <Button size="sm" data-testid="assign-lifecycle-profile" onClick={() => void assignProfile()}>
                  Assign Lifecycle Profile
                </Button>
              ) : (
                <Link className="underline" href="/engineering/settings/lifecycle">
                  Open Lifecycle Settings
                </Link>
              )
            }
          />
        ) : null}
        {view === "current" ? (
          <section className="space-y-2 text-sm">
            <p>Project stage: {project?.stage ?? "UNKNOWN"}</p>
            <p>
              Profile: {project?.profileId ?? "unassigned"} {project?.profileVersion ?? ""}
            </p>
            <p>Gate readiness is machine-evaluated from canonical harvested evidence. Gate decision remains human-governed.</p>
            <p>Automatic stage transition is not available. Project Controls does not define lifecycle authority.</p>
          </section>
        ) : null}
        {view === "scoped" ? (
          <ul className="space-y-2 text-sm">
            {assignments.map((row) => (
              <li key={row.id} className="rounded border p-2">
                {row.scopeType} {row.scopeId}: {row.stage}
              </li>
            ))}
          </ul>
        ) : null}
        {view === "gate" || view === "criteria" || view === "evidence" ? (
          <section className="space-y-3 text-sm">
            <p>Evidence source: {evaluation?.evidenceSource ?? "CANONICAL"}</p>
            <p>Harvested at: {evaluation?.harvestedAt ?? "not harvested"}</p>
            <p>Snapshot fingerprint: {evaluation?.evidenceSnapshot?.fingerprint ?? "none"}</p>
            <p>Completeness: {evaluation?.completeness ?? "NOT_EVALUATED"}</p>
            <p>Readiness: {evaluation?.readiness ?? "NOT_EVALUATED"}</p>
            <p>Stale: {evaluation?.stale ? "yes" : "no"}</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!controls.evaluateEnabled} onClick={() => void evaluateGate()}>
                Evaluate gate from canonical evidence
              </Button>
              <Button size="sm" variant="secondary" disabled={!controls.evaluateEnabled} onClick={() => void refreshGate()}>
                Refresh / re-evaluate gate
              </Button>
            </div>
            {(view === "criteria" || view === "evidence") &&
              (evaluation?.criteria ?? []).map((row) => (
                <div key={row.criterionId} className="rounded border p-2">
                  <p>
                    {row.criterionId} — {row.status} ({row.sourceCompleteness ?? "COMPLETE"})
                  </p>
                  <p>Expected: {row.expectedCondition ?? "see criterion"}</p>
                  <p>Actual: {row.actualState ?? row.explanation}</p>
                  <p>{row.explanation}</p>
                  {(row.evidenceRefs ?? []).map((ref) => (
                    <p key={`${ref.objectType}:${ref.objectId}`}>
                      {ref.objectType} {ref.objectId}
                    </p>
                  ))}
                </div>
              ))}
            {view === "gate" ? (
              <div>
                <p className="font-medium">Blocking / unmet criteria</p>
                {unmet.map((row) => (
                  <p key={row.criterionId}>
                    {row.criterionId}: {row.explanation}
                  </p>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
        {view === "schedule" ? (
          <section className="space-y-2 text-sm">
            <Button size="sm" variant="secondary" onClick={() => void loadAlignment()}>
              Load schedule alignment
            </Button>
            <p>Engineering Lifecycle: {alignment?.lifecycleStage ?? project?.stage ?? "UNKNOWN"}</p>
            <p>Alignment: {alignment?.state ?? "UNMAPPED"}</p>
            <p>{alignment?.explanation ?? "Project Controls activity does not change Engineering Lifecycle authority."}</p>
            <p>Schedule authority: {alignment?.scheduleAuthority ? "yes" : "no"}</p>
          </section>
        ) : null}
        {view === "deliverables" ? (
          <section className="space-y-2 text-sm">
            <Button
              size="sm"
              variant="secondary"
              disabled={!projectId}
              onClick={async () => {
                if (!projectId) return;
                const parsed = await parseApiJsonResponse(
                  await fetch(`/api/engineering/deliverables?action=lifecycle&projectId=${encodeURIComponent(projectId)}`),
                );
                if (parsed.ok) setDeliverableSummary(parsed.data as typeof deliverableSummary);
              }}
            >
              Load required deliverables
            </Button>
            <p>This is not a document register. Counts are not engineering percent complete.</p>
            {(deliverableSummary?.required ?? []).map((row) => (
              <p key={row.definitionCode}>
                {row.definitionCode}: {row.bound ? "bound" : "missing"} · {row.readiness}
                {row.stale ? " · stale" : ""}
              </p>
            ))}
            {(evaluation?.criteria ?? [])
              .filter((row) => row.type.startsWith("DELIVERABLE") || row.type === "REQUIRED_DELIVERABLES_PRESENT")
              .map((row) => (
                <p key={row.criterionId}>
                  Gate {row.criterionId}: {row.status}
                </p>
              ))}
          </section>
        ) : null}
        {view === "history" || view === "transitions" ? (
          <section className="space-y-2 text-sm">
            <Button size="sm" variant="secondary" onClick={() => project?.id && void loadHistory(project.id)}>
              Load history
            </Button>
            {history.map((row) => (
              <div key={row.id} className="rounded border p-2">
                <p>
                  {row.fromStage} → {row.toStage} ({row.profileVersion})
                </p>
                <p>
                  {row.authorizedAt} · {row.authorizedBy}
                </p>
                <p>{row.rationale}</p>
              </div>
            ))}
          </section>
        ) : null}
        <section className="mt-6 space-y-2 rounded border p-3 text-sm" data-testid="lifecycle-human-controls">
          <p className="font-medium">Human gate decision</p>
          <p data-testid="lifecycle-control-reason">{controls.reason}</p>
          <textarea
            className="w-full rounded border px-2 py-1"
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
            placeholder="Rationale"
            disabled={!controls.decisionEnabled && !controls.transitionEnabled}
          />
          <label className="block">
            Target stage
            <select
              className="mt-1 w-full rounded border px-2 py-1"
              data-testid="lifecycle-target-stage"
              value={toStage}
              disabled={!controls.targetEditable || allowedTo.length === 0}
              onChange={(event) => setToStage(event.target.value)}
            >
              {allowedTo.length === 0 ? <option value="">No governed transition</option> : null}
              {allowedTo.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={!controls.decisionEnabled} onClick={() => void decide("APPROVED_TO_TRANSITION")}>
              Approve to transition
            </Button>
            <Button size="sm" variant="secondary" disabled={!controls.decisionEnabled} onClick={() => void decide("NOT_APPROVED")}>
              Not approved
            </Button>
            <Button size="sm" variant="secondary" disabled={!controls.transitionEnabled} onClick={() => void transition()}>
              Execute authorized transition
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
