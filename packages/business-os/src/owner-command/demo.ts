import type { OwnerCommandRepository } from "./repository";
import type { BusinessKpi } from "@rtb/types";

const NOW = "2026-08-18T09:00:00.000Z";

function isoDate(offsetDays: number): string {
  const d = new Date("2026-08-18T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Deterministic Owner Command Centre demo fixtures. Not live business data. */
export async function seedOwnerCommandDemo(
  repo: OwnerCommandRepository,
  scope: { tenantId: string; workspaceId: string; userId?: string },
): Promise<{ kpis: BusinessKpi[]; seeded: true; isDemo: true; created: boolean }> {
  const createdBy = scope.userId;
  const kpis = [];

  kpis.push(
    await repo.upsertKpi(scope, {
      key: "cash_runway_months",
      name: "Cash runway",
      description: "Demo: months of operating cash remaining",
      category: "cash",
      unit: "months",
      value: 4.2,
      target: 9,
      warningThreshold: 6,
      criticalThreshold: 3,
      direction: "higher_is_better",
      measuredAt: NOW,
      sourceType: "demo",
      sourceRef: "bos-1-demo",
      provenance: { fixture: "bos-1-owner-command", live: false },
      isDemo: true,
      createdBy,
    }),
  );
  kpis.push(
    await repo.upsertKpi(scope, {
      key: "overdue_receivables",
      name: "Overdue receivables",
      description: "Demo: invoices past due",
      category: "receivables",
      unit: "AUD",
      value: 85000,
      target: 0,
      warningThreshold: 25000,
      criticalThreshold: 100000,
      direction: "lower_is_better",
      measuredAt: NOW,
      sourceType: "demo",
      sourceRef: "bos-1-demo",
      provenance: { fixture: "bos-1-owner-command", live: false },
      isDemo: true,
      createdBy,
    }),
  );
  kpis.push(
    await repo.upsertKpi(scope, {
      key: "project_margin_pct",
      name: "Project margin",
      description: "Demo: blended project margin",
      category: "margin",
      unit: "%",
      value: 8.4,
      target: 18,
      warningThreshold: 12,
      criticalThreshold: 6,
      direction: "higher_is_better",
      measuredAt: NOW,
      sourceType: "demo",
      sourceRef: "bos-1-demo",
      provenance: { fixture: "bos-1-owner-command", live: false },
      isDemo: true,
      createdBy,
    }),
  );
  kpis.push(
    await repo.upsertKpi(scope, {
      key: "pipeline_coverage",
      name: "Revenue pipeline coverage",
      description: "Demo: pipeline / next-quarter revenue target",
      category: "pipeline",
      unit: "ratio",
      value: 0.72,
      target: 1.2,
      warningThreshold: 1,
      criticalThreshold: 0.6,
      direction: "higher_is_better",
      measuredAt: NOW,
      sourceType: "demo",
      sourceRef: "bos-1-demo",
      provenance: { fixture: "bos-1-owner-command", live: false },
      isDemo: true,
      createdBy,
    }),
  );
  kpis.push(
    await repo.upsertKpi(scope, {
      key: "monthly_revenue",
      name: "Monthly revenue",
      description: "Demo: recognised revenue this month — value unknown",
      category: "revenue",
      unit: "AUD",
      value: null,
      target: 420000,
      warningThreshold: 350000,
      criticalThreshold: 280000,
      direction: "higher_is_better",
      measuredAt: null,
      sourceType: "demo",
      sourceRef: "bos-1-demo",
      provenance: { fixture: "bos-1-owner-command", live: false, unknown: true },
      isDemo: true,
      createdBy,
    }),
  );

  const existingSignals = await repo.listSignals(scope);
  if (existingSignals.some((s) => s.isDemo)) {
    return { kpis, seeded: true, isDemo: true, created: false };
  }

  const byKey = Object.fromEntries(kpis.map((k) => [k.key, k]));

  const cash = await repo.insertSignal(scope, {
    type: "cash_runway",
    severity: "warning",
    title: "Cash runway below six months",
    summary: "Demo fixture: cash runway is 4.2 months against a 6-month watch threshold.",
    sourceType: "demo",
    sourceRef: byKey.cash_runway_months.id,
    kpiId: byKey.cash_runway_months.id,
    evidence: [
      {
        sourceType: "kpi",
        sourceRef: byKey.cash_runway_months.id,
        title: "Cash runway",
        excerpt: "4.2 months (demo)",
      },
    ],
    provenance: { fixture: "bos-1-owner-command", live: false },
    detectedAt: NOW,
    status: "open",
    businessImpact: "high",
    isDemo: true,
    createdBy,
  });

  const recv = await repo.insertSignal(scope, {
    type: "overdue_receivable",
    severity: "warning",
    title: "Overdue receivables elevated",
    summary: "Demo fixture: $85,000 past due against a $25,000 warning threshold.",
    sourceType: "demo",
    sourceRef: byKey.overdue_receivables.id,
    kpiId: byKey.overdue_receivables.id,
    evidence: [
      {
        sourceType: "kpi",
        sourceRef: byKey.overdue_receivables.id,
        title: "Overdue receivables",
        excerpt: "85000 AUD (demo)",
      },
    ],
    provenance: { fixture: "bos-1-owner-command", live: false },
    detectedAt: NOW,
    status: "open",
    businessImpact: "high",
    isDemo: true,
    createdBy,
  });

  const margin = await repo.insertSignal(scope, {
    type: "project_margin",
    severity: "warning",
    title: "Project margin declining",
    summary: "Demo fixture: blended project margin is 8.4% vs 18% target.",
    sourceType: "demo",
    sourceRef: byKey.project_margin_pct.id,
    kpiId: byKey.project_margin_pct.id,
    evidence: [
      {
        sourceType: "kpi",
        sourceRef: byKey.project_margin_pct.id,
        title: "Project margin",
        excerpt: "8.4% (demo)",
      },
    ],
    provenance: { fixture: "bos-1-owner-command", live: false },
    detectedAt: NOW,
    status: "open",
    businessImpact: "medium",
    isDemo: true,
    createdBy,
  });

  const pipeline = await repo.insertSignal(scope, {
    type: "pipeline_coverage",
    severity: "warning",
    title: "Revenue pipeline below target",
    summary: "Demo fixture: pipeline coverage is 0.72x versus 1.2x target.",
    sourceType: "demo",
    sourceRef: byKey.pipeline_coverage.id,
    kpiId: byKey.pipeline_coverage.id,
    evidence: [
      {
        sourceType: "kpi",
        sourceRef: byKey.pipeline_coverage.id,
        title: "Revenue pipeline coverage",
        excerpt: "0.72 ratio (demo)",
      },
    ],
    provenance: { fixture: "bos-1-owner-command", live: false },
    detectedAt: NOW,
    status: "open",
    businessImpact: "high",
    isDemo: true,
    createdBy,
  });

  const recCash = await repo.insertRecommendation(scope, {
    signalId: cash.id,
    title: "Protect cash runway",
    recommendationText:
      "Review discretionary spend this month and accelerate collection of the largest overdue invoices. Advisory only — no payment or CRM write is performed.",
    rationaleSummary: "Runway is below the configured 6-month warning threshold on a demo KPI.",
    expectedImpact: "Reduce cash burn visibility gap; does not change bank balances.",
    confidence: "medium",
    evidenceRefs: cash.evidence,
    status: "proposed",
    generatedBy: "deterministic_rule",
    isDemo: true,
    createdBy,
  });

  await repo.insertRecommendation(scope, {
    signalId: recv.id,
    title: "Collect overdue receivables",
    recommendationText:
      "Prioritise invoices older than 30 days. This is an internal action record only — Business OS does not send emails or post receipts.",
    rationaleSummary: "Overdue receivables exceed the demo warning threshold.",
    expectedImpact: "Working-capital attention; not a live AR system.",
    confidence: "medium",
    evidenceRefs: recv.evidence,
    status: "proposed",
    generatedBy: "deterministic_rule",
    isDemo: true,
    createdBy,
  });

  await repo.insertRecommendation(scope, {
    signalId: margin.id,
    title: "Investigate margin erosion",
    recommendationText:
      "Identify jobs with the largest margin gap versus target. No job-costing write is performed in BOS-1.",
    rationaleSummary: "Demo project margin is below the warning threshold.",
    expectedImpact: "Owner visibility; not a finance close.",
    confidence: "low",
    evidenceRefs: margin.evidence,
    status: "proposed",
    generatedBy: "deterministic_rule",
    isDemo: true,
    createdBy,
  });

  await repo.insertRecommendation(scope, {
    signalId: pipeline.id,
    title: "Rebuild pipeline coverage",
    recommendationText:
      "Focus owner time on qualified opportunities already in view. BOS-1 does not generate leads or write to CRM.",
    rationaleSummary: "Demo pipeline coverage is below the 1.0 warning threshold.",
    expectedImpact: "Attention ranking only.",
    confidence: "medium",
    evidenceRefs: pipeline.evidence,
    status: "proposed",
    generatedBy: "deterministic_rule",
    isDemo: true,
    createdBy,
  });

  const decision = await repo.insertDecision(scope, {
    recommendationId: recCash.id,
    statement: "Hold non-essential spend until cash runway is reviewed.",
    context: "Demo decision linked to cash runway recommendation. Pending owner confirmation.",
    ownerId: scope.userId ?? null,
    status: "pending",
    decision: null,
    rationale: null,
    decidedAt: null,
    reviewAt: isoDate(7),
    isDemo: true,
    createdBy,
  });

  await repo.insertAction(scope, {
    decisionId: decision.id,
    title: "Review top 5 overdue invoices (demo)",
    ownerId: scope.userId ?? null,
    dueDate: isoDate(-2),
    priority: "high",
    status: "open",
    completionEvidence: {},
    completedAt: null,
    isDemo: true,
    createdBy,
  });

  await repo.insertAction(scope, {
    decisionId: decision.id,
    title: "Pause discretionary software renewals (demo)",
    ownerId: scope.userId ?? null,
    dueDate: isoDate(3),
    priority: "medium",
    status: "blocked",
    completionEvidence: { blocker: "Awaiting owner confirmation — demo" },
    completedAt: null,
    isDemo: true,
    createdBy,
  });

  return { kpis, seeded: true, isDemo: true, created: true };
}
