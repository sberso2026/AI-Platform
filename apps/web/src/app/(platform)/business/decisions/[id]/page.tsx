"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Button, Card, CardContent, SectionHeader, StatusChip } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type Detail = {
  decision: { id: string; statement: string; context?: string | null; status: string; ownerId?: string | null; reviewAt?: string | null; rationale?: string | null };
  context?: {
    question: string;
    problemStatement?: string | null;
    domain: string;
    ownerLabel?: string | null;
    stakeholders: string[];
    urgency: string;
    dueAt?: string | null;
    assumptions: string[];
    constraints: string[];
    evidenceCompletenessBps: string | null;
  } | null;
  evidence: Array<{ id: string; summary: string; sourceDomain: string; sourceRef: string; valueState: string; evidenceQuality: string; snapshot: Record<string, unknown> }>;
  options: Array<{ id: string; title: string; status: string; aiGenerated: boolean; reversibility: string; description?: string | null }>;
  impacts: Array<{ optionId: string; dimension: string; quantification: string; valueMinor?: string | null; qualitativeLabel?: string | null }>;
  comparison: {
    version: string;
    scoringEnabled: boolean;
    scoringDisclaimer: string;
    recommendationText: string;
    options: Array<{ optionId: string; title: string; knownImpacts: Record<string, string>; unknownImpacts: string[]; advantages: string[]; disadvantages: string[] }>;
  };
  priority: { priority: string; version: string; components: Array<{ id: string; label: string; value: string | null; known: boolean }>; missingInputs: string[] };
  brief: { decisionQuestion: string; currentSituation: string; missingEvidence: string[]; recommendation: { text: string; generatedBy: string; timestamp: string; advisoryOnly: boolean } };
  outcome?: { status: string; expectedOutcome?: string | null; actualOutcome?: string | null; varianceState: string; varianceValue?: string | null } | null;
  effectiveness: { status: string; measurementCoverage: string; version: string };
  lessons: Array<{ id: string; lessonText: string; status: string; draftSource: string }>;
  actions: Array<{ id: string; title: string; status: string; dueDate?: string | null; priority: string }>;
  disclaimer: string;
};

export default function DecisionDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const parsed = await parseApiJsonResponse<Detail>(
      await fetch(`/api/business/decisions/detail?id=${encodeURIComponent(params.id)}`),
    );
    if (!parsed.ok || !parsed.data) {
      setError(parsed.errorMessage ?? "Decision not found");
      setData(null);
      return;
    }
    setError(null);
    setData(parsed.data);
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchDecision(status: "approved" | "deferred" | "rejected") {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(
        await fetch("/api/business/decisions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: params.id, status }),
        }),
      );
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to update decision");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header
        title={data?.context?.question ?? data?.decision.statement ?? "Decision detail"}
        description="Structured decision brief, evidence, options, and outcomes — no hidden AI reasoning"
        showEngineeringChrome={false}
      />
      <PageMain data-testid="bos-decisions-detail">
        <p className="mb-4 text-sm">
          <Link href="/business/decisions" className="text-blue-700 hover:underline">
            Back to Decision Intelligence
          </Link>
        </p>
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}
        {data && (
          <>
            <section className="mb-6" data-testid="bos-decisions-context">
              <SectionHeader title="Context" description="Business question, problem, domain, owner, timing, assumptions, and constraints." />
              <Card className="mt-3">
                <CardContent className="space-y-1 p-4 text-sm text-slate-700">
                  <p>Question: {data.context?.question ?? data.decision.statement}</p>
                  <p>Problem: {data.context?.problemStatement ?? data.decision.context ?? "None"}</p>
                  <p>
                    Domain: {data.context?.domain ?? "unknown"} · Owner: {data.context?.ownerLabel ?? data.decision.ownerId ?? "Unassigned"} · Urgency:{" "}
                    {data.context?.urgency ?? "unknown"}
                  </p>
                  <p>
                    Due: {data.context?.dueAt ?? "Unknown"} · Review: {data.decision.reviewAt ?? "Unknown"}
                  </p>
                  <p>Assumptions: {data.context?.assumptions.join("; ") || "None"}</p>
                  <p>Constraints: {data.context?.constraints.join("; ") || "None"}</p>
                  <p>
                    Priority {data.priority.priority} ({data.priority.version}) · missing: {data.priority.missingInputs.join(", ") || "none"}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="mb-6" data-testid="bos-decisions-evidence">
              <SectionHeader title="Evidence" description="Point-in-time references. Historical snapshots are not rewritten." />
              <div className="mt-3 space-y-2">
                {data.evidence.length === 0 && <p className="text-sm text-slate-600">No evidence linked.</p>}
                {data.evidence.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 text-sm text-slate-700">
                      <p>
                        {item.summary} · {item.sourceDomain}/{item.sourceRef} · {item.valueState} · quality {item.evidenceQuality}
                      </p>
                      <p className="text-xs text-slate-500">Snapshot captured at {String(item.snapshot.capturedAt ?? "link time")}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mb-6" data-testid="bos-decisions-options">
              <SectionHeader title="Options" description="AI-generated proposals are labelled and never auto-approved." />
              <div className="mt-3 space-y-2">
                {data.options.map((option) => (
                  <Card key={option.id}>
                    <CardContent className="flex items-start justify-between gap-3 p-4 text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{option.title}</p>
                        <p className="text-slate-600">{option.description}</p>
                        <p className="text-xs text-slate-500">
                          {option.aiGenerated ? "AI-generated proposal" : "Human/deterministic"} · {option.reversibility}
                        </p>
                      </div>
                      <StatusChip value={option.status} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mb-6" data-testid="bos-decisions-impact">
              <SectionHeader title="Impact" description="Quantitative values come from deterministic sources. Unknown stays unknown." />
              <Card className="mt-3">
                <CardContent className="space-y-1 p-4 text-sm text-slate-700">
                  {data.impacts.length === 0 && <p>No impact assessments recorded.</p>}
                  {data.impacts.map((impact) => (
                    <p key={`${impact.optionId}-${impact.dimension}`}>
                      {impact.dimension}: {impact.quantification === "unknown" ? "unknown" : impact.qualitativeLabel ?? impact.valueMinor ?? impact.quantification}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section className="mb-6" data-testid="bos-decisions-comparison">
              <SectionHeader title="Option comparison" description={data.comparison.scoringDisclaimer} />
              <Card className="mt-3">
                <CardContent className="space-y-3 p-4 text-sm text-slate-700">
                  {data.comparison.options.map((option) => (
                    <div key={option.optionId}>
                      <p className="font-medium text-slate-900">{option.title}</p>
                      <p>Known: {Object.entries(option.knownImpacts).map(([k, v]) => `${k} ${v}`).join("; ") || "none"}</p>
                      <p>Unknown: {option.unknownImpacts.join(", ") || "none"}</p>
                      <p>Advantages: {option.advantages.join("; ") || "none"}</p>
                      <p>Disadvantages: {option.disadvantages.join("; ") || "none"}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section className="mb-6" data-testid="bos-decisions-recommendation">
              <SectionHeader title="Recommendation" description="Advisory only. Not a guarantee of success." />
              <Card className="mt-3">
                <CardContent className="space-y-1 p-4 text-sm text-slate-700">
                  <p>{data.comparison.recommendationText}</p>
                  <p>{data.brief.recommendation.text}</p>
                  <p className="text-xs text-slate-500">
                    {data.brief.recommendation.generatedBy} · {data.brief.recommendation.timestamp} · advisory
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="mb-6" data-testid="bos-decisions-decision">
              <SectionHeader title="Decision" description="Human authority only. No autonomous approval." />
              <Card className="mt-3">
                <CardContent className="space-y-2 p-4 text-sm text-slate-700">
                  <p>Status: {data.decision.status}</p>
                  <p>Rationale: {data.decision.rationale ?? "None"}</p>
                  {data.decision.status === "pending" && (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" disabled={busy} onClick={() => void patchDecision("approved")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => void patchDecision("deferred")}>
                        Defer
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => void patchDecision("rejected")}>
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="mb-6" data-testid="bos-decisions-actions">
              <SectionHeader title="Actions" description="Existing BOS-1 action records linked to this decision." />
              <div className="mt-3 space-y-2">
                {data.actions.length === 0 && <p className="text-sm text-slate-600">No linked actions.</p>}
                {data.actions.map((action) => (
                  <Card key={action.id}>
                    <CardContent className="flex items-center justify-between p-4 text-sm">
                      <span>
                        {action.title} · due {action.dueDate ?? "Unknown"} · {action.priority}
                      </span>
                      <StatusChip value={action.status} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mb-6" data-testid="bos-decisions-outcome">
              <SectionHeader title="Outcome" description="Expected vs actual. Incomparable metrics stay unknown." />
              <Card className="mt-3">
                <CardContent className="space-y-1 p-4 text-sm text-slate-700">
                  <p>Status: {data.outcome?.status ?? "none"}</p>
                  <p>Expected: {data.outcome?.expectedOutcome ?? "Unknown"}</p>
                  <p>Actual: {data.outcome?.actualOutcome ?? "Unknown"}</p>
                  <p>Variance: {data.outcome?.varianceState === "computed" ? data.outcome.varianceValue : "unknown"}</p>
                  <p>
                    Effectiveness: {data.effectiveness.status} · coverage {data.effectiveness.measurementCoverage} · {data.effectiveness.version}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="mb-6" data-testid="bos-decisions-lessons">
              <SectionHeader title="Lessons" description="AI drafts are not organisational knowledge until a human accepts them." />
              <div className="mt-3 space-y-2">
                {data.lessons.length === 0 && <p className="text-sm text-slate-600">No lessons recorded.</p>}
                {data.lessons.map((lesson) => (
                  <Card key={lesson.id}>
                    <CardContent className="flex items-start justify-between gap-3 p-4 text-sm">
                      <p>{lesson.lessonText}</p>
                      <StatusChip value={lesson.status} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mb-6" data-testid="bos-decisions-audit">
              <SectionHeader title="Audit / Provenance" description="Point-in-time evidence snapshots and deterministic rule versions." />
              <Card className="mt-3">
                <CardContent className="space-y-1 p-4 text-sm text-slate-700">
                  <p>Brief: {data.brief.decisionQuestion}</p>
                  <p>Situation: {data.brief.currentSituation}</p>
                  <p>Missing evidence: {data.brief.missingEvidence.join("; ") || "None"}</p>
                  <p>{data.disclaimer}</p>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </PageMain>
    </>
  );
}
