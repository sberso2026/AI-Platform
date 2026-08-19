"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Card, CardContent, SectionHeader, StatusChip } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import type {
  BusinessWorkCapacityFact,
  BusinessWorkCostFact,
  BusinessWorkCostProgress,
  BusinessWorkHealth,
  BusinessWorkItem,
  BusinessWorkMilestone,
  BusinessWorkProgress,
} from "@rtb/types";

type Detail = {
  work: BusinessWorkItem;
  customer: { organisationName: string } | null;
  milestones: BusinessWorkMilestone[];
  actions: Array<{ id: string; actionId: string; action: { title: string; status: string } | null }>;
  costs: BusinessWorkCostFact[];
  capacity: BusinessWorkCapacityFact[];
  progress: BusinessWorkProgress;
  costProgress: BusinessWorkCostProgress;
  health: BusinessWorkHealth;
  scheduleVarianceDays: number | null;
  engineering: {
    linkedEngineeringProjectId: string | null;
    linkedEngineeringProjectRef: string | null;
    contract: { mode: string; writesEngineeringOs: boolean };
  };
  dataQuality: {
    missingProgress: boolean;
    missingCost: boolean;
    missingCapacity: boolean;
    mixedCurrencyActual: boolean;
    unknownHealthComponents: string[];
  };
  disclaimer: string;
};

function bpsLabel(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "Unknown";
  return `${(Number(value) / 100).toFixed(2)}%`;
}

export default function WorkOperationsDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const parsed = await parseApiJsonResponse<Detail>(
      await fetch(`/api/business/operations/detail?id=${encodeURIComponent(params.id)}`),
    );
    if (!parsed.ok || !parsed.data) {
      setError(parsed.errorMessage ?? "Work not found");
      setData(null);
      return;
    }
    setError(null);
    setData(parsed.data);
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Header
        title={data ? `${data.work.reference} · ${data.work.name}` : "Work detail"}
        description="Work execution context — progress is never invented and Engineering OS remains authoritative"
        showEngineeringChrome={false}
      />
      <PageMain data-testid="bos-operations-detail">
        <p className="mb-4 text-sm">
          <Link href="/business/operations" className="text-blue-700 hover:underline">
            Back to Operations
          </Link>
        </p>
        {error && <p className="mb-4 text-destructive">{error}</p>}
        {data && (
          <div className="space-y-8">
            <section data-testid="bos-operations-overview">
              <SectionHeader title="Overview" description={data.disclaimer} />
              <Card className="mt-4">
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  <p>Type: {data.work.workType} · Status: {data.work.status} · Owner: {data.work.owner ?? "None"}</p>
                  <p>Progress: {bpsLabel(data.progress.progressBps)} ({data.progress.method})</p>
                  <p>Schedule variance (days): {data.scheduleVarianceDays ?? "Unknown"}</p>
                  <p>
                    Health: <StatusChip label={data.health.status} /> · {data.health.version}
                  </p>
                  <p>{data.health.disclaimer}</p>
                </CardContent>
              </Card>
            </section>

            <section data-testid="bos-operations-milestones">
              <SectionHeader title="Milestones" description="Weighted progress is used only when weights are explicit." />
              <Card className="mt-4">
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  {data.milestones.length === 0 && <p>No milestones.</p>}
                  {data.milestones.map((row) => (
                    <p key={row.id}>
                      {row.name}: {row.status} · due {row.dueAt ?? "Unknown"} · weight {row.weightBps ?? "not configured"}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section data-testid="bos-operations-actions">
              <SectionHeader title="Actions" description="Reuses BOS-1 actions. This is not a second task system." />
              <Card className="mt-4">
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  {data.actions.length === 0 && <p>No linked actions.</p>}
                  {data.actions.map((row) => (
                    <p key={row.id}>
                      {row.action?.title ?? row.actionId}: {row.action?.status ?? "unknown"}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section data-testid="bos-operations-cost">
              <SectionHeader title="Cost" description="Exact money. actual ≠ forecast ≠ budget ≠ derived." />
              <Card className="mt-4">
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  <p>
                    Cost vs progress: actual {bpsLabel(data.costProgress.actualCostBpsOfBudget)} of budget vs progress{" "}
                    {bpsLabel(data.costProgress.progressBps)}. Signal: {String(data.costProgress.signal)}. Potential only.
                  </p>
                  {data.costs.map((row) => (
                    <p key={row.id}>
                      {row.costType} · {row.valueState} · {row.currency} {row.amountMinor}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section data-testid="bos-operations-capacity-detail">
              <SectionHeader title="Capacity" description="Evidence-backed hours only." />
              <Card className="mt-4">
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  {data.capacity.length === 0 && <p>No capacity facts.</p>}
                  {data.capacity.map((row) => (
                    <p key={row.id}>
                      {row.dimensionName}: {row.capacityStatus} · util {bpsLabel(row.utilizationBps)}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section data-testid="bos-operations-risks">
              <SectionHeader title="Risks / signals" description="Deterministic delivery-risk indicators." />
              <Card className="mt-4">
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  {data.health.components.map((component) => (
                    <p key={component.id}>
                      {component.label}: {component.status} — {component.evidence}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section data-testid="bos-operations-customer">
              <SectionHeader title="Customer" description="Bounded customer link. Algorithms stay in Customer Intelligence." />
              <p className="mt-3 text-sm text-slate-600">{data.customer?.organisationName ?? "No customer"}</p>
            </section>

            <section data-testid="bos-operations-profitability">
              <SectionHeader title="Profitability" description="Actual operational cost may feed Profit Intelligence as operations_fact." />
              <p className="mt-3 text-sm text-slate-600">
                Contracted {data.work.contractedValueMinor ?? "Unknown"} · Budget {data.work.budgetCostMinor ?? "Unknown"} ·
                Actual {data.work.actualCostMinor ?? "Unknown"} {data.work.currency}
              </p>
            </section>

            <section data-testid="bos-operations-engineering">
              <SectionHeader title="Linked Engineering Project" description="Stable reference only. Engineering OS remains authoritative." />
              <p className="mt-3 text-sm text-slate-600">
                {data.engineering.linkedEngineeringProjectRef ?? data.engineering.linkedEngineeringProjectId ?? "Not linked"}{" "}
                · mode {data.engineering.contract.mode} · writesEngineeringOs {String(data.engineering.contract.writesEngineeringOs)}
              </p>
            </section>

            <section data-testid="bos-operations-evidence">
              <SectionHeader title="Evidence / data quality" description="Missing progress/cost/capacity stays unknown." />
              <Card className="mt-4">
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  <p>Missing progress: {String(data.dataQuality.missingProgress)}</p>
                  <p>Missing cost: {String(data.dataQuality.missingCost)}</p>
                  <p>Missing capacity: {String(data.dataQuality.missingCapacity)}</p>
                  <p>Mixed-currency actual: {String(data.dataQuality.mixedCurrencyActual)}</p>
                  <p>Unknown health components: {data.dataQuality.unknownHealthComponents.join(", ") || "None"}</p>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </PageMain>
    </>
  );
}
