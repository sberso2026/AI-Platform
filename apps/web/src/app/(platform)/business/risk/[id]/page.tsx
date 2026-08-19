"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Button, Card, CardContent, SectionHeader, StatusChip } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type Detail = {
  risk: {
    id: string;
    reference: string;
    title: string;
    description?: string | null;
    category: string;
    domain?: string | null;
    ownerLabel?: string | null;
    status: string;
    reviewAt?: string | null;
    acceptedAt?: string | null;
    acceptedBy?: string | null;
    provenance: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
  assessments: Array<{
    id: string;
    version: number;
    likelihood: string;
    impact: string;
    inherentLevel: string;
    residualLevel: string;
    rationale?: string | null;
    residualRationale?: string | null;
    assessedAt: string;
    method: string;
  }>;
  latestAssessment?: {
    inherentLevel: string;
    residualLevel: string;
    likelihood: string;
    impact: string;
    method: string;
    residualMethod: string;
  } | null;
  evidence: Array<{ id: string; sourceType: string; sourceRef: string; capturedAt: string; snapshot: Record<string, unknown> }>;
  controls: Array<{ id: string; name: string; status: string; effectiveness: string; evidenceRefs: unknown[] }>;
  treatments: Array<{ id: string; strategy: string; expectedResidualLevel?: string | null; notes?: string | null }>;
  actions: Array<{ id: string; title: string; status: string; dueDate?: string | null }>;
  decisions: Array<{ id: string; statement: string; status: string }>;
  obligations: Array<{ id: string; title: string; status: string; dueAt?: string | null; authorizedConfirmation: boolean }>;
  incidents: Array<{ id: string; title: string; occurredAt: string; severity: string }>;
  priority: { priority: string; version: string; missingInputs: string[]; components: Array<{ id: string; label: string; known: boolean }> };
  toleranceStatus: string;
  evidenceFreshness: string;
  disclaimer: string;
};

export default function BusinessRiskDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const parsed = await parseApiJsonResponse<Detail>(
      await fetch(`/api/business/risk/detail?id=${encodeURIComponent(params.id)}`),
    );
    if (!parsed.ok || !parsed.data) {
      setError(parsed.errorMessage ?? "Risk not found");
      setData(null);
      return;
    }
    setError(null);
    setData(parsed.data);
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDecision() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(
        await fetch("/api/business/risk/decision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: params.id }),
        }),
      );
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to open decision");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  const risk = data?.risk;

  return (
    <>
      <Header title={risk ? `${risk.reference} ${risk.title}` : "Risk detail"} />
      <PageMain>
        <p className="mb-4 text-sm">
          <Link href="/business/risk" className="text-blue-700 hover:underline">
            Back to Business Risk
          </Link>
        </p>
        {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
        <p className="mb-6 text-sm text-slate-600">
          No autonomous risk acceptance. Residual risk is qualitative and evidence-backed. Not legal advice.
        </p>

        <section className="mb-8" data-testid="bos-risk-detail">
          <section className="mb-6" data-testid="bos-risk-overview">
            <SectionHeader title="Overview" description="Canonical risk record, owner, status, and tolerance." />
            {risk && (
              <Card className="mt-3">
                <CardContent className="space-y-2 p-4 text-sm text-slate-600">
                  <p>{risk.description ?? "No description."}</p>
                  <p>
                    Category: {risk.category} · Domain: {risk.domain ?? "n/a"} · Owner: {risk.ownerLabel ?? "Unassigned"}
                  </p>
                  <p>
                    Status: <StatusChip value={risk.status} /> · Review: {risk.reviewAt ? risk.reviewAt.slice(0, 10) : "Unknown"} ·
                    Tolerance: {data?.toleranceStatus} · Evidence: {data?.evidenceFreshness}
                  </p>
                  <p>
                    Priority: {data?.priority.priority} ({data?.priority.version}) · missing:{" "}
                    {data?.priority.missingInputs.join(", ") || "none"}
                  </p>
                  {risk.acceptedAt && <p>Accepted at {risk.acceptedAt} by a human owner. AI cannot accept risk.</p>}
                </CardContent>
              </Card>
            )}
          </section>

          <section className="mb-6" data-testid="bos-risk-assessment">
            <SectionHeader title="Assessment" description="Versioned likelihood × impact. Not a statistical probability." />
            <div className="mt-3 space-y-3">
              {(data?.assessments ?? []).map((assessment) => (
                <Card key={assessment.id}>
                  <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                    <p>
                      v{assessment.version} · {assessment.method} · {assessment.assessedAt.slice(0, 10)}
                    </p>
                    <p>
                      Likelihood {assessment.likelihood} · Impact {assessment.impact} · Inherent {assessment.inherentLevel} ·
                      Residual {assessment.residualLevel}
                    </p>
                    <p>{assessment.rationale}</p>
                    <p className="text-xs">{assessment.residualRationale}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-6" data-testid="bos-risk-evidence">
            <SectionHeader title="Evidence" description="Stable domain refs. Amounts are not invented." />
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {(data?.evidence ?? []).map((item) => (
                <p key={item.id}>
                  {item.sourceType}:{item.sourceRef} · captured {item.capturedAt.slice(0, 10)}
                </p>
              ))}
              {(data?.evidence.length ?? 0) === 0 && <p>No linked evidence.</p>}
            </div>
          </section>

          <section className="mb-6" data-testid="bos-risk-controls-detail">
            <SectionHeader title="Controls" description="Effective requires evidence." />
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {(data?.controls ?? []).map((control) => (
                <p key={control.id}>
                  {control.name} · {control.status} · {control.effectiveness} · evidence {control.evidenceRefs.length}
                </p>
              ))}
              {(data?.controls.length ?? 0) === 0 && <p>No linked controls.</p>}
            </div>
          </section>

          <section className="mb-6" data-testid="bos-risk-treatment">
            <SectionHeader title="Treatment" description="Treatments reuse BOS-1 actions. Acceptance is human-only." />
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {(data?.treatments ?? []).map((treatment) => (
                <p key={treatment.id}>
                  {treatment.strategy} · expected residual {treatment.expectedResidualLevel ?? "unknown"} · {treatment.notes}
                </p>
              ))}
              {(data?.treatments.length ?? 0) === 0 && <p>No treatment recorded.</p>}
            </div>
          </section>

          <section className="mb-6" data-testid="bos-risk-decisions">
            <SectionHeader title="Decisions" description="Material risks may link to Decision Intelligence. Humans still approve." />
            <div className="mt-3 space-y-2 text-sm">
              {(data?.decisions ?? []).map((decision) => (
                <p key={decision.id}>
                  <Link href={`/business/decisions/${decision.id}`} className="text-blue-700 hover:underline">
                    {decision.statement}
                  </Link>{" "}
                  · {decision.status}
                </p>
              ))}
              <Button size="sm" disabled={busy} onClick={() => void openDecision()}>
                Open treatment decision
              </Button>
            </div>
          </section>

          <section className="mb-6" data-testid="bos-risk-actions">
            <SectionHeader title="Actions" description="Existing BOS actions linked as treatments. No second task system." />
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {(data?.actions ?? []).map((action) => (
                <p key={action.id}>
                  {action.title} · {action.status} · due {action.dueDate ?? "unknown"}
                </p>
              ))}
              {(data?.actions.length ?? 0) === 0 && <p>No linked actions.</p>}
            </div>
          </section>

          <section className="mb-6" data-testid="bos-risk-obligations-detail">
            <SectionHeader title="Obligations" description="Compliant is not a statutory finding." />
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {(data?.obligations ?? []).map((obligation) => (
                <p key={obligation.id}>
                  {obligation.title} · {obligation.status} · confirmed {obligation.authorizedConfirmation ? "yes" : "no"}
                </p>
              ))}
              {(data?.obligations.length ?? 0) === 0 && <p>No linked obligations.</p>}
            </div>
          </section>

          <section className="mb-6" data-testid="bos-risk-incidents">
            <SectionHeader title="Incidents" description="Bounded incident links, not an incident-management platform." />
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {(data?.incidents ?? []).map((incident) => (
                <p key={incident.id}>
                  {incident.title} · {incident.severity} · {incident.occurredAt.slice(0, 10)}
                </p>
              ))}
              {(data?.incidents.length ?? 0) === 0 && <p>No linked incidents.</p>}
            </div>
          </section>

          <section className="mb-6" data-testid="bos-risk-history">
            <SectionHeader title="History" description="Assessment versions are append-only." />
            <p className="mt-3 text-sm text-slate-600">
              Created {risk?.createdAt} · Updated {risk?.updatedAt} · {data?.assessments.length ?? 0} assessment version(s).
            </p>
          </section>

          <section className="mb-6" data-testid="bos-risk-audit">
            <SectionHeader title="Audit / Provenance" description="Material mutations are audited. AI explanations are advisory." />
            <pre className="mt-3 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              {JSON.stringify(risk?.provenance ?? {}, null, 2)}
            </pre>
            <p className="mt-2 text-xs text-slate-500">{data?.disclaimer}</p>
          </section>
        </section>
      </PageMain>
    </>
  );
}
