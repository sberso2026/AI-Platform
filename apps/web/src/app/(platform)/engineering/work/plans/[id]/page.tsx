"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EngineeringBreadcrumb } from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type WorkReference = { objectId: string; title: string; whyIncluded: string };
type WorkAction = { code: string; label: string; availability: string; reason: string };
type WorkPlan = {
  id: string;
  projectId: string;
  workType: string;
  templateCode: string;
  templateVersion: string;
  status: string;
  readiness: string;
  startAllowed: boolean;
  staleness: string;
  systemId?: string | null;
  assetId?: string | null;
  explanations: { whyBlocked: string | null; whyConditional: string | null; templateProvenance: string; engineeringApproved: false };
  context: {
    information: Array<{ title: string; whyIncluded: string; freshness?: string | null; authorityOutcome?: string | null }>;
    gaps: Array<{ kind: string; title: string; explanation: string }>;
    requirements: WorkReference[];
    assumptions: WorkReference[];
    interfaces: WorkReference[];
    decisions: WorkReference[];
    analyses: WorkReference[];
    expectedOutputs: Array<{ outputType: string; title: string; generated: false }>;
    actions: WorkAction[];
    conditions: string[];
  };
};

export default function WorkPlanPage() {
  const params = useParams<{ id: string }>();
  const [plan, setPlan] = useState<WorkPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch(`/api/engineering/work?action=plan&id=${encodeURIComponent(params.id)}`);
    const json = await parseApiJsonResponse<WorkPlan>(response);
    if (json.errorMessage) setError(json.errorMessage);
    else setPlan(json.data);
  }

  useEffect(() => {
    void load();
  }, [params.id]);

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setError(null);
    setMessage(null);
    const response = await fetch("/api/engineering/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id: params.id, ...extra }),
    });
    const json = await parseApiJsonResponse<{ allowed?: boolean; reason?: string | null; plan?: WorkPlan; diff?: Record<string, unknown>; next?: WorkPlan }>(response);
    if (json.errorMessage) {
      setError(json.errorMessage);
      return;
    }
    if (action === "startPlan") {
      if (json.data?.allowed) setMessage("Engineering work started. This is not engineering approval.");
      else setError(json.data?.reason ?? "Start is blocked.");
      if (json.data?.plan) setPlan(json.data.plan);
      return;
    }
    if (action === "refreshPlan" && json.data?.next) {
      setPlan(json.data.next);
      setDiff(JSON.stringify(json.data.diff ?? {}, null, 2));
      setMessage("Engineering context refreshed. Historical plan provenance is retained.");
      return;
    }
    await load();
  }

  return (
    <>
      <Header title="Engineering Work Plan" description="Governed context and actions for engineering work. EOS prepares the desk; it does not approve design." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringBreadcrumb items={[{ label: "Work", href: "/engineering/work" }, { label: "Work plan" }]} />
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        {message && <p className="mt-3 text-sm">{message}</p>}
        {plan && (
          <>
            <p className="mt-4 text-sm">
              {plan.workType.replaceAll("_", " ")} · {plan.readiness.replaceAll("_", " ")} · {plan.status} · {plan.explanations.templateProvenance}
              {plan.systemId ? ` · ${plan.systemId}` : ""}
            </p>
            {plan.explanations.whyBlocked && <p className="mt-2 text-sm">{plan.explanations.whyBlocked}</p>}
            {plan.explanations.whyConditional && <p className="mt-2 text-sm">{plan.explanations.whyConditional}</p>}
            {plan.context.conditions.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {plan.context.conditions.map((row) => <li key={row}>{row}</li>)}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => void act("startPlan")}>Start Engineering Work</button>
              {plan.readiness === "READY_WITH_CONDITIONS" && (
                <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => void act("startPlan", { acknowledged: true })}>
                  Acknowledge conditions and start
                </button>
              )}
              <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => void act("refreshPlan")}>Refresh Engineering Context</button>
            </div>
            <section className="mt-6 text-sm">
              <h2 className="font-semibold">Governing Information</h2>
              <ul className="mt-2 space-y-1">{plan.context.information.map((row) => <li key={row.title}>{row.title} — {row.whyIncluded}</li>)}</ul>
              <h2 className="mt-4 font-semibold">Information gaps</h2>
              <ul className="mt-2 space-y-1">{plan.context.gaps.map((row) => <li key={row.title}>{row.kind}: {row.title}</li>)}</ul>
              <h2 className="mt-4 font-semibold">Requirements</h2>
              <ul className="mt-2 space-y-1">{plan.context.requirements.map((row) => <li key={row.objectId}>{row.title} — {row.whyIncluded}</li>)}</ul>
              <h2 className="mt-4 font-semibold">Interfaces</h2>
              <ul className="mt-2 space-y-1">{plan.context.interfaces.map((row) => <li key={row.objectId}>{row.title} — {row.whyIncluded}</li>)}</ul>
              <h2 className="mt-4 font-semibold">Assumptions</h2>
              <ul className="mt-2 space-y-1">{plan.context.assumptions.map((row) => <li key={row.objectId}>{row.title} — {row.whyIncluded}</li>)}</ul>
              <h2 className="mt-4 font-semibold">Decisions</h2>
              <ul className="mt-2 space-y-1">{plan.context.decisions.map((row) => <li key={row.objectId}>{row.title} — {row.whyIncluded}</li>)}</ul>
              <h2 className="mt-4 font-semibold">Expected outputs</h2>
              <ul className="mt-2 space-y-1">{plan.context.expectedOutputs.map((row) => <li key={row.outputType}>{row.outputType.replaceAll("_", " ")} (not generated in A11A)</li>)}</ul>
              <h2 className="mt-4 font-semibold">Actions</h2>
              <ul className="mt-2 space-y-1">
                {plan.context.actions.map((row) => (
                  <li key={row.code}>{row.label} · {row.availability.replaceAll("_", " ")} — {row.reason}</li>
                ))}
              </ul>
            </section>
            {diff && <pre className="mt-4 overflow-auto rounded border p-3 text-xs">{diff}</pre>}
            <p className="mt-4 text-sm text-muted-foreground">Personal/unmanaged files remain outside EOS. This is not an employee productivity record.</p>
          </>
        )}
      </main>
    </>
  );
}
