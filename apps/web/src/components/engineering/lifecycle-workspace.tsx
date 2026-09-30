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

const VIEWS = [
  { id: "current", label: "Current Lifecycle" },
  { id: "scoped", label: "Scoped Lifecycle States" },
  { id: "gate", label: "Gate Readiness" },
  { id: "criteria", label: "Gate Criteria" },
  { id: "evidence", label: "Evidence" },
  { id: "schedule", label: "Schedule Alignment" },
  { id: "history", label: "Stage History" },
  { id: "transitions", label: "Transitions" },
] as const;

export function LifecycleWorkspace() {
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>((params?.get("view") as (typeof VIEWS)[number]["id"]) ?? "current");
  const [projectId, setProjectId] = useState(params?.get("projectId") ?? "proj-crusher-feed");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [alignment, setAlignment] = useState<Alignment | null>(null);
  const [history, setHistory] = useState<Transition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rationale, setRationale] = useState("");
  const [toStage, setToStage] = useState("DETAILED_DESIGN");

  const project = assignments.find((row) => row.scopeType === "PROJECT");
  const unmet = useMemo(
    () => (evaluation?.criteria ?? []).filter((row) => row.applicability === "APPLICABLE" && row.status !== "SATISFIED" && !row.waived),
    [evaluation],
  );

  async function load() {
    setError(null);
    const catalog = await parseApiJsonResponse(await fetch("/api/engineering/lifecycle?action=catalog"));
    if (!catalog.ok) {
      setError(catalog.errorMessage ?? "Unable to load lifecycle catalog");
      return;
    }
    const listed = await parseApiJsonResponse(
      await fetch(`/api/engineering/lifecycle?action=assignments&projectId=${encodeURIComponent(projectId)}`),
    );
    if (listed.ok && Array.isArray(listed.data)) setAssignments(listed.data as Assignment[]);
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
    if (!project?.id) return;
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate", assignmentId: project.id, gateId: "FEED_EXIT" }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Gate evaluation denied");
      return;
    }
    setEvaluation(parsed.data as Evaluation);
  }

  async function refreshGate() {
    if (!evaluation?.id) {
      await evaluateGate();
      return;
    }
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
  }

  async function loadAlignment() {
    const parsed = await parseApiJsonResponse(
      await fetch(`/api/engineering/lifecycle?action=alignment&projectId=${encodeURIComponent(projectId)}`),
    );
    if (parsed.ok) setAlignment(parsed.data as Alignment);
  }

  async function decide(decision: string) {
    if (!evaluation?.id) return;
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decide", evaluationId: evaluation.id, decision, rationale }),
      }),
    );
    if (!parsed.ok) setError(parsed.errorMessage ?? "Gate decision denied");
  }

  async function transition() {
    if (!project?.id) return;
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

  return (
    <>
      <Header
        title="Lifecycle Intelligence"
        description="Governed engineering lifecycle context, gate readiness, and human-authorized transitions. The system does not approve stage changes."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Lifecycle" }]} />
        {error ? <OperationalError message={error} /> : null}
        <div className="mb-4 flex flex-wrap gap-2">
          {VIEWS.map((item) => (
            <Button key={item.id} size="sm" variant={view === item.id ? "secondary" : "secondary"} onClick={() => setView(item.id)}>
              {item.label}
            </Button>
          ))}
        </div>
        <label className="mb-4 block text-sm">
          Project id
          <input className="mt-1 w-full rounded border px-2 py-1" value={projectId} onChange={(event) => setProjectId(event.target.value)} />
        </label>
        {!assignments.length ? (
          <EmptyOperationalState
            title="No lifecycle assignment"
            description="Assign a governed Lifecycle Profile and current stage before evaluating a gate. Mixed scopes are allowed."
          />
        ) : null}
        {view === "current" ? (
          <section className="space-y-2 text-sm">
            <p>Project stage: {project?.stage ?? "UNKNOWN"}</p>
            <p>
              Profile: {project?.profileId ?? "EOS-DEFAULT-ENGINEERING"} {project?.profileVersion ?? "v1"}
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
              <Button size="sm" onClick={() => void evaluateGate()}>
                Evaluate gate from canonical evidence
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void refreshGate()}>
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
        <section className="mt-6 space-y-2 rounded border p-3 text-sm">
          <p className="font-medium">Human gate decision</p>
          <textarea className="w-full rounded border px-2 py-1" value={rationale} onChange={(event) => setRationale(event.target.value)} placeholder="Rationale" />
          <input className="w-full rounded border px-2 py-1" value={toStage} onChange={(event) => setToStage(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void decide("APPROVED_TO_TRANSITION")}>
              Approve to transition
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void decide("NOT_APPROVED")}>
              Not approved
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void transition()}>
              Execute authorized transition
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
