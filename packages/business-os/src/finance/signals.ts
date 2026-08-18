import type {
  BusinessEvidenceRef,
  BusinessFinanceMetrics,
  BusinessFinanceSnapshot,
  BusinessSignalSeverity,
} from "@rtb/types";
import { BUSINESS_FINANCE_DEFAULT_THRESHOLDS } from "@rtb/types";
import { expenseIncreaseBps, revenueGrowthBps } from "./metrics";

export interface FinanceSignalDraft {
  type: string;
  ruleId: string;
  severity: BusinessSignalSeverity;
  title: string;
  summary: string;
  businessImpact: "low" | "medium" | "high" | "critical";
  evidence: BusinessEvidenceRef[];
  provenance: Record<string, unknown>;
}

export interface FinanceRecommendationDraft {
  type: string;
  title: string;
  recommendationText: string;
  rationaleSummary: string;
  expectedImpact: string;
  confidence: "high" | "medium" | "low" | "unavailable";
}

export type FinanceThresholds = typeof BUSINESS_FINANCE_DEFAULT_THRESHOLDS;

function bps(value: string | null): bigint | null {
  if (value === null || value === undefined) return null;
  return BigInt(value);
}

function evidence(title: string, excerpt: string, sourceRef: string): BusinessEvidenceRef[] {
  return [{ sourceType: "finance_snapshot", sourceRef, title, excerpt }];
}

export function detectFinanceSignals(input: {
  current: BusinessFinanceSnapshot;
  previous: BusinessFinanceSnapshot | null;
  metrics: BusinessFinanceMetrics;
  previousMetrics?: BusinessFinanceMetrics | null;
  thresholds?: FinanceThresholds;
}): { signals: FinanceSignalDraft[]; recommendations: FinanceRecommendationDraft[] } {
  const t = input.thresholds ?? BUSINESS_FINANCE_DEFAULT_THRESHOLDS;
  const sourceRef = input.current.id;
  const signals: FinanceSignalDraft[] = [];
  const recs: FinanceRecommendationDraft[] = [];

  const growth = revenueGrowthBps(input.current, input.previous);
  if (growth !== null && growth <= BigInt(-t.revenueDeclineWarningBps)) {
    signals.push({
      type: "finance.revenue_declining",
      ruleId: "finance.revenue_declining.v1",
      severity: growth <= BigInt(-t.revenueDeclineWarningBps * 2) ? "critical" : "warning",
      title: "Revenue declining versus prior period",
      summary: `Demo-safe management rule: revenue growth is ${growth.toString()} bps versus the previous ingested period.`,
      businessImpact: "high",
      evidence: evidence("Revenue growth", `${growth.toString()} bps`, sourceRef),
      provenance: { domain: "finance", ruleId: "finance.revenue_declining.v1", baseline: "prior_period", live: false },
    });
    recs.push({
      type: "finance.revenue_declining",
      title: "Review revenue movement",
      recommendationText:
        "Review the ingested revenue trend versus the prior period. Advisory only — Business OS does not change invoices or accounting systems.",
      rationaleSummary: "Deterministic rule: period revenue declined beyond the configured bps threshold.",
      expectedImpact: "Owner attention on revenue coverage; not a ledger adjustment.",
      confidence: "medium",
    });
  }

  const gm = bps(input.metrics.grossMarginBps);
  if (gm !== null && gm <= BigInt(t.grossMarginWarningBps)) {
    const critical = gm <= BigInt(t.grossMarginCriticalBps);
    signals.push({
      type: "finance.gross_margin_below_target",
      ruleId: "finance.gross_margin_below_target.v1",
      severity: critical ? "critical" : "warning",
      title: "Gross margin below target",
      summary: `Gross margin is ${gm.toString()} bps against warning ${t.grossMarginWarningBps} bps.`,
      businessImpact: critical ? "critical" : "high",
      evidence: evidence("Gross margin", `${gm.toString()} bps`, sourceRef),
      provenance: { domain: "finance", ruleId: "finance.gross_margin_below_target.v1", live: false },
    });
    recs.push({
      type: "finance.gross_margin_below_target",
      title: "Investigate margin deterioration",
      recommendationText:
        "Inspect cost of sales versus revenue on the current snapshot. No job-costing or GL write is performed.",
      rationaleSummary: "Deterministic gross margin is at or below the configured warning threshold.",
      expectedImpact: "Visibility of margin pressure; not a financial close.",
      confidence: "medium",
    });
  }

  const om = bps(input.metrics.operatingMarginBps);
  const prevOm = bps(input.previousMetrics?.operatingMarginBps ?? null);
  if (om !== null && om <= BigInt(t.operatingMarginWarningBps)) {
    signals.push({
      type: "finance.operating_margin_deterioration",
      ruleId: "finance.operating_margin_deterioration.v1",
      severity: om <= BigInt(t.operatingMarginCriticalBps) ? "critical" : "warning",
      title: "Operating margin below target",
      summary: `Operating margin is ${om.toString()} bps${prevOm !== null ? ` (prior ${prevOm.toString()} bps)` : ""}.`,
      businessImpact: "high",
      evidence: evidence("Operating margin", `${om.toString()} bps`, sourceRef),
      provenance: { domain: "finance", ruleId: "finance.operating_margin_deterioration.v1", live: false },
    });
    recs.push({
      type: "finance.operating_margin_deterioration",
      title: "Review operating expenses",
      recommendationText:
        "Review operating expense movement against revenue. Business OS will not post journals or payments.",
      rationaleSummary: "Deterministic operating margin is at or below the configured warning threshold.",
      expectedImpact: "Expense attention; not an accounting entry.",
      confidence: "medium",
    });
  }

  const runway = bps(input.metrics.cashRunwayMonthHundredths);
  if (runway !== null && runway <= BigInt(t.cashRunwayWarningMonthHundredths)) {
    signals.push({
      type: "finance.cash_runway_warning",
      ruleId: "finance.cash_runway_warning.v1",
      severity: runway <= BigInt(t.cashRunwayCriticalMonthHundredths) ? "critical" : "warning",
      title: "Cash runway below configured threshold",
      summary: `Cash runway is ${runway.toString()} month-hundredths using period operating expenses as burn.`,
      businessImpact: "critical",
      evidence: evidence("Cash runway", `${runway.toString()} month-hundredths`, sourceRef),
      provenance: { domain: "finance", ruleId: "finance.cash_runway_warning.v1", live: false },
    });
    recs.push({
      type: "finance.cash_runway_warning",
      title: "Review cash exposure",
      recommendationText:
        "Review cash, burn basis, and overdue collections. No bank payment or reconciliation is executed.",
      rationaleSummary: "Deterministic runway using snapshot cash and operating expenses is below threshold.",
      expectedImpact: "Cash attention; not a treasury instruction.",
      confidence: "medium",
    });
  }

  const overdueBps = bps(input.metrics.receivablesOverdueBps);
  if (overdueBps !== null && overdueBps >= BigInt(t.overdueReceivableRatioWarningBps)) {
    signals.push({
      type: "finance.overdue_receivables_above_threshold",
      ruleId: "finance.overdue_receivables_above_threshold.v1",
      severity: overdueBps >= BigInt(t.overdueReceivableRatioCriticalBps) ? "critical" : "warning",
      title: "Overdue receivables above threshold",
      summary: `Overdue receivables are ${overdueBps.toString()} bps of outstanding AR.`,
      businessImpact: "high",
      evidence: evidence("Overdue AR ratio", `${overdueBps.toString()} bps`, sourceRef),
      provenance: { domain: "finance", ruleId: "finance.overdue_receivables_above_threshold.v1", live: false },
    });
    recs.push({
      type: "finance.overdue_receivables_above_threshold",
      title: "Review overdue receivables",
      recommendationText:
        "Prioritise the overdue ageing buckets on the current snapshot. Business OS does not issue invoices or emails.",
      rationaleSummary: "Deterministic overdue-to-outstanding ratio exceeds the configured threshold.",
      expectedImpact: "Collections attention; not a debtor-ledger write.",
      confidence: "medium",
    });
  }

  const budgetBps = bps(input.metrics.budgetRevenueVarianceBps);
  if (budgetBps !== null && budgetBps <= BigInt(-t.budgetRevenueAdverseBps)) {
    signals.push({
      type: "finance.adverse_budget_variance",
      ruleId: "finance.adverse_budget_variance.v1",
      severity: "warning",
      title: "Adverse revenue budget variance",
      summary: `Revenue versus budget is ${budgetBps.toString()} bps.`,
      businessImpact: "medium",
      evidence: evidence("Budget revenue variance", `${budgetBps.toString()} bps`, sourceRef),
      provenance: { domain: "finance", ruleId: "finance.adverse_budget_variance.v1", live: false },
    });
    recs.push({
      type: "finance.adverse_budget_variance",
      title: "Review budget versus actual",
      recommendationText:
        "Compare ingested actual revenue with the period budget. No budget ledger is maintained in Business OS.",
      rationaleSummary: "Deterministic actual-minus-budget ratio is below the adverse threshold.",
      expectedImpact: "Planning attention only.",
      confidence: "medium",
    });
  }

  const expenseBps = expenseIncreaseBps(input.current, input.previous);
  if (expenseBps !== null && expenseBps >= BigInt(t.expenseIncreaseWarningBps)) {
    signals.push({
      type: "finance.unusual_expense_increase",
      ruleId: "finance.unusual_expense_increase.v1",
      severity: "watch",
      title: "Operating expenses increased versus prior period",
      summary: `Operating expenses increased by ${expenseBps.toString()} bps versus the previous snapshot.`,
      businessImpact: "medium",
      evidence: evidence("Expense increase", `${expenseBps.toString()} bps`, sourceRef),
      provenance: { domain: "finance", ruleId: "finance.unusual_expense_increase.v1", live: false },
    });
    recs.push({
      type: "finance.unusual_expense_increase",
      title: "Review expense category movement",
      recommendationText:
        "Inspect operating expenses versus the prior period. Category-level GL detail is not available in BOS-2.",
      rationaleSummary: "Deterministic period-on-period operating expense increase exceeds the threshold.",
      expectedImpact: "Expense review; not a payment or journal.",
      confidence: "low",
    });
  }

  return { signals, recommendations: recs };
}
