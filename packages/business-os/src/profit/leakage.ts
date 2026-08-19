import type {
  BusinessEvidenceRef,
  BusinessProfitFact,
  BusinessProfitConcentration,
  BusinessSignalSeverity,
} from "@rtb/types";
import { BUSINESS_PROFIT_DEFAULT_THRESHOLDS } from "@rtb/types";
import { parseMinor } from "../finance/money";
import { classifyProfit } from "./classification";
import { computeFactMetrics, isRealizedState } from "./metrics";

export interface ProfitSignalDraft {
  type: string;
  ruleId: string;
  severity: BusinessSignalSeverity;
  title: string;
  summary: string;
  businessImpact: "low" | "medium" | "high" | "critical";
  evidence: BusinessEvidenceRef[];
  provenance: Record<string, unknown>;
}

export interface ProfitRecommendationDraft {
  type: string;
  title: string;
  recommendationText: string;
  rationaleSummary: string;
  expectedImpact: string;
  confidence: "high" | "medium" | "low" | "unavailable";
}

function evidence(title: string, excerpt: string, sourceRef: string): BusinessEvidenceRef[] {
  return [{ sourceType: "profit_metric", sourceRef, title, excerpt }];
}

export function detectProfitLeakage(input: {
  facts: BusinessProfitFact[];
  concentration: BusinessProfitConcentration;
  thresholds?: Partial<typeof BUSINESS_PROFIT_DEFAULT_THRESHOLDS>;
  asOf?: string;
}): { signals: ProfitSignalDraft[]; recommendations: ProfitRecommendationDraft[] } {
  const t = { ...BUSINESS_PROFIT_DEFAULT_THRESHOLDS, ...(input.thresholds ?? {}) };
  const signals: ProfitSignalDraft[] = [];
  const recommendations: ProfitRecommendationDraft[] = [];
  const realized = input.facts.filter((row) => isRealizedState(row.valueState));
  const proposed = input.facts.filter((row) => row.valueState === "proposed");
  const periodEnd = [...realized].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0]?.periodEnd;
  const current = realized.filter((row) => row.periodEnd === periodEnd);

  const top = parseMinor(input.concentration.topShareBps);
  if (top !== null && top >= BigInt(t.concentrationTop1WarningBps)) {
    signals.push({
      type: "profit.concentration_high",
      ruleId: "profit.concentration_high.v1",
      severity: "warning",
      title: "Profit concentration high",
      summary: `Top realized contribution share is ${top.toString()} bps.`,
      businessImpact: "high",
      evidence: evidence("Concentration", top.toString(), "concentration"),
      provenance: { domain: "profit", ruleId: "profit.concentration_high.v1", live: false },
    });
    recommendations.push({
      type: "profit.diversify_concentration",
      title: "Diversify profit concentration",
      recommendationText: "Review dependency on the largest realized contribution. Advisory only. No autonomous customer action.",
      rationaleSummary: "Top contribution share exceeds the configured threshold.",
      expectedImpact: "Reduce profit concentration risk.",
      confidence: "high",
    });
  }

  for (const fact of current) {
    const metrics = computeFactMetrics(fact);
    const classified = classifyProfit(fact);
    const revenue = parseMinor(metrics.revenue?.minor ?? null);
    const contribution = parseMinor(metrics.contribution?.minor ?? null);
    const margin = parseMinor(metrics.contributionMarginBps);
    const highRevenue = revenue !== null && revenue >= BigInt(t.highRevenueMinor);
    const majorRevenueMissingCost =
      revenue !== null && revenue >= BigInt(t.missingCostMajorRevenueMinor) && contribution === null;

    if (classified.classification === "negative_contribution") {
      signals.push({
        type: "profit.negative_contribution",
        ruleId: "profit.negative_contribution.v1",
        severity: "critical",
        title: "Negative contribution",
        summary: `${fact.dimensionName} contribution is negative for ${fact.periodEnd}.`,
        businessImpact: "critical",
        evidence: evidence("Contribution", metrics.contribution?.minor ?? "unknown", fact.id),
        provenance: {
          domain: "profit",
          ruleId: "profit.negative_contribution.v1",
          dimension: fact.dimensionType,
          periodEnd: fact.periodEnd,
          live: false,
        },
      });
      recommendations.push({
        type: "profit.investigate_negative",
        title: `Investigate negative-contribution activity for ${fact.dimensionName}`,
        recommendationText: "Review sourced revenue and direct cost. Do not autonomously reprice or terminate work.",
        rationaleSummary: "Realized contribution is negative.",
        expectedImpact: "Understand loss-making activity with evidence.",
        confidence: "high",
      });
    }

    if (highRevenue && classified.classification === "low_margin") {
      signals.push({
        type: "profit.low_margin_high_revenue",
        ruleId: "profit.low_margin_high_revenue.v1",
        severity: "warning",
        title: "Low-margin high-revenue work",
        summary: `${fact.dimensionName} has high revenue and low contribution margin.`,
        businessImpact: "high",
        evidence: evidence("Margin", margin?.toString() ?? "unknown", fact.id),
        provenance: {
          domain: "profit",
          ruleId: "profit.low_margin_high_revenue.v1",
          dimension: fact.dimensionType,
          periodEnd: fact.periodEnd,
          live: false,
        },
      });
      recommendations.push({
        type: "profit.review_low_margin",
        title: `Review low-margin work for ${fact.dimensionName}`,
        recommendationText: "Review pricing and cost capture internally. Advisory only.",
        rationaleSummary: "High revenue with low realized contribution margin.",
        expectedImpact: "Owner attention on margin quality.",
        confidence: "medium",
      });
    }

    if (majorRevenueMissingCost) {
      signals.push({
        type: "profit.missing_cost_attribution",
        ruleId: "profit.missing_cost_attribution.v1",
        severity: "watch",
        title: "Missing cost attribution on major revenue",
        summary: `${fact.dimensionName} has revenue without direct cost, so profitability is unknown.`,
        businessImpact: "medium",
        evidence: evidence("Revenue", revenue?.toString() ?? "unknown", fact.id),
        provenance: {
          domain: "profit",
          ruleId: "profit.missing_cost_attribution.v1",
          dimension: fact.dimensionType,
          live: false,
        },
      });
      recommendations.push({
        type: "profit.improve_cost_capture",
        title: `Improve cost capture for ${fact.dimensionName}`,
        recommendationText: "Do not invent allocated overhead. Capture sourced direct cost before classifying profit.",
        rationaleSummary: "Major revenue lacks direct cost evidence.",
        expectedImpact: "Increase profit data coverage.",
        confidence: "high",
      });
    }
  }

  const byKey = new Map<string, BusinessProfitFact[]>();
  for (const fact of realized) {
    const key = `${fact.dimensionType}:${fact.dimensionId ?? fact.dimensionRef ?? fact.dimensionName}`;
    const list = byKey.get(key) ?? [];
    list.push(fact);
    byKey.set(key, list);
  }
  let deteriorationCount = 0;
  for (const [key, rows] of byKey) {
    const ordered = [...rows].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
    if (ordered.length < 2) continue;
    const currentMargin = parseMinor(computeFactMetrics(ordered[0]).contributionMarginBps);
    const previousMargin = parseMinor(computeFactMetrics(ordered[1]).contributionMarginBps);
    if (currentMargin === null || previousMargin === null) continue;
    if (previousMargin - currentMargin >= BigInt(t.marginDeteriorationBps)) {
      deteriorationCount += 1;
      signals.push({
        type: "profit.margin_deterioration",
        ruleId: "profit.margin_deterioration.v1",
        severity: "warning",
        title: "Margin deterioration",
        summary: `${ordered[0].dimensionName} realized margin declined from ${previousMargin.toString()} to ${currentMargin.toString()} bps.`,
        businessImpact: "high",
        evidence: evidence("Margin change", key, ordered[0].id),
        provenance: { domain: "profit", ruleId: "profit.margin_deterioration.v1", live: false },
      });
    }
    const currentRev = parseMinor(ordered[0].revenueMinor);
    const previousRev = parseMinor(ordered[1].revenueMinor);
    const currentCost = parseMinor(ordered[0].directCostMinor);
    const previousCost = parseMinor(ordered[1].directCostMinor);
    if (currentRev !== null && previousRev !== null && currentCost !== null && previousCost !== null && previousRev !== 0n && previousCost !== 0n) {
      if (currentCost > previousCost && currentRev > previousRev) {
        const costGrowth = currentCost - previousCost;
        const revGrowth = currentRev - previousRev;
        if (costGrowth > revGrowth) {
          signals.push({
            type: "profit.cost_growth_faster_than_revenue",
            ruleId: "profit.cost_growth_faster_than_revenue.v1",
            severity: "watch",
            title: "Cost growth faster than revenue",
            summary: ordered[0].dimensionName,
            businessImpact: "medium",
            evidence: evidence("Cost vs revenue growth", costGrowth.toString(), ordered[0].id),
            provenance: { domain: "profit", ruleId: "profit.cost_growth_faster_than_revenue.v1", live: false },
          });
        }
      }
    }
    const lowMarginRepeats = rows.filter((row) => classifyProfit(row).classification === "low_margin").length;
    if (lowMarginRepeats >= 2) {
      signals.push({
        type: "profit.recurring_low_margin",
        ruleId: "profit.recurring_low_margin.v1",
        severity: "watch",
        title: "Recurring low-margin work",
        summary: `${rows[0].dimensionName} has ${lowMarginRepeats} low-margin realized periods.`,
        businessImpact: "medium",
        evidence: evidence("Low-margin count", String(lowMarginRepeats), rows[0].id),
        provenance: { domain: "profit", ruleId: "profit.recurring_low_margin.v1", live: false },
      });
      recommendations.push({
        type: "profit.review_pricing_recurring",
        title: `Review pricing for recurring work ${rows[0].dimensionName}`,
        recommendationText: "This is advisory. BOS-6 does not reprice or terminate customers.",
        rationaleSummary: "Repeated realized low-margin facts.",
        expectedImpact: "Internal pricing review.",
        confidence: "medium",
      });
    }
  }

  for (const fact of proposed) {
    const metrics = computeFactMetrics(fact);
    const margin = parseMinor(metrics.contributionMarginBps);
    const target = parseMinor(String(fact.provenance?.targetMarginBps ?? ""));
    if (margin !== null && target !== null && margin < target) {
      signals.push({
        type: "profit.proposed_below_target",
        ruleId: "profit.proposed_below_target.v1",
        severity: "watch",
        title: "Proposed margin below target",
        summary: `${fact.dimensionName} proposed margin ${margin.toString()} bps is below target ${target.toString()} bps. Not realized profit.`,
        businessImpact: "medium",
        evidence: evidence("Proposed margin", margin.toString(), fact.id),
        provenance: { domain: "profit", ruleId: "profit.proposed_below_target.v1", valueState: "proposed", live: false },
      });
    }
    const discountBps = parseMinor(String(fact.provenance?.discountBps ?? ""));
    if (discountBps !== null && discountBps > 0n && margin !== null && margin < BigInt(t.lowMarginWarningBps)) {
      signals.push({
        type: "profit.discount_driven_margin_erosion",
        ruleId: "profit.discount_driven_margin_erosion.v1",
        severity: "watch",
        title: "Discount-driven proposed margin erosion",
        summary: `${fact.dimensionName} proposed margin ${margin.toString()} bps follows a ${discountBps.toString()} bps discount. This is proposed, not realized profit.`,
        businessImpact: "medium",
        evidence: evidence("Discount bps", discountBps.toString(), fact.id),
        provenance: {
          domain: "profit",
          ruleId: "profit.discount_driven_margin_erosion.v1",
          valueState: "proposed",
          live: false,
        },
      });
    }
    const realizedMatch = realized.find(
      (row) =>
        row.dimensionType === fact.dimensionType &&
        (row.dimensionId === fact.dimensionId || row.dimensionName === fact.dimensionName) &&
        row.periodEnd === fact.periodEnd,
    );
    if (realizedMatch) {
      const realizedMargin = parseMinor(computeFactMetrics(realizedMatch).contributionMarginBps);
      if (margin !== null && realizedMargin !== null) {
        const delta = realizedMargin > margin ? realizedMargin - margin : margin - realizedMargin;
        if (delta >= BigInt(t.proposedRealizedDivergenceBps)) {
          signals.push({
            type: "profit.proposed_vs_realized_divergence",
            ruleId: "profit.proposed_vs_realized_divergence.v1",
            severity: "info",
            title: "Proposed vs realized margin divergence",
            summary: `${fact.dimensionName}: proposed ${margin.toString()} bps vs realized ${realizedMargin.toString()} bps.`,
            businessImpact: "low",
            evidence: evidence("Divergence", delta.toString(), fact.id),
            provenance: { domain: "profit", ruleId: "profit.proposed_vs_realized_divergence.v1", live: false },
          });
        }
      }
    }
  }

  if (deteriorationCount > 0) {
    recommendations.push({
      type: "profit.investigate_cost_attribution",
      title: "Investigate cost attribution on deteriorating margins",
      recommendationText: "Compare sourced actual periods only. Do not invent overhead allocations.",
      rationaleSummary: `${deteriorationCount} dimension(s) show realized margin deterioration.`,
      expectedImpact: "Evidence-backed margin review.",
      confidence: "medium",
    });
  }

  return { signals, recommendations };
}
