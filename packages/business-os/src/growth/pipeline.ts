import type {
  BusinessGrowthOpportunity,
  BusinessGrowthOpportunityStage,
  BusinessGrowthPipelineMetrics,
  MoneyJson,
} from "@rtb/types";
import {
  CurrencyMismatchError,
  add,
  money,
  parseMinor,
  ratioBps,
  roundDiv,
  serializeMoney,
  type MoneyAmount,
} from "../finance/money";

export const PIPELINE_DISCLAIMER =
  "Pipeline figures are deterministic sums of ingested opportunity values. Weighted pipeline uses only user-supplied probability_bps. Opportunity score is not a win probability.";

export const OPEN_STAGES: BusinessGrowthOpportunityStage[] = [
  "identified",
  "qualified",
  "discovery",
  "proposal_ready",
  "proposal",
  "negotiation",
  "on_hold",
];

export const QUALIFIED_OPEN_STAGES: BusinessGrowthOpportunityStage[] = [
  "qualified",
  "discovery",
  "proposal_ready",
  "proposal",
  "negotiation",
];

export interface PipelineTarget {
  revenueTargetMinor?: string | number | null;
  currency?: string | null;
  scale?: number;
}

function amount(row: BusinessGrowthOpportunity): MoneyAmount | null {
  if (row.estimatedValueMinor === null || row.estimatedValueMinor === undefined) return null;
  return money(row.estimatedValueMinor, row.currency, row.scale);
}

function sumAmounts(rows: BusinessGrowthOpportunity[], unknownReasons: string[]): MoneyAmount | null {
  const known = rows.map(amount).filter((a): a is MoneyAmount => Boolean(a));
  if (!known.length) {
    unknownReasons.push("pipeline_value_unknown");
    return null;
  }
  try {
    return known.slice(1).reduce((acc, next) => add(acc, next), known[0]);
  } catch (error) {
    if (error instanceof CurrencyMismatchError) unknownReasons.push("currency_mismatch");
    else unknownReasons.push("pipeline_value_unknown");
    return null;
  }
}

export function computePipelineMetrics(
  opportunities: BusinessGrowthOpportunity[],
  target: PipelineTarget = {},
  minWinRateSample = 3,
): BusinessGrowthPipelineMetrics {
  const unknownReasons: string[] = [];
  const active = opportunities.filter((row) => !row.suppressed);
  const open = active.filter((row) => OPEN_STAGES.includes(row.stage));
  const qualifiedOpen = active.filter((row) => QUALIFIED_OPEN_STAGES.includes(row.stage));
  const won = active.filter((row) => row.stage === "won");
  const lost = active.filter((row) => row.stage === "lost");

  if (!active.length) unknownReasons.push("zero_opportunities");

  const totalPipeline = sumAmounts(open, unknownReasons);
  const qualifiedPipeline = sumAmounts(qualifiedOpen, []);
  const scale = totalPipeline?.scale ?? open[0]?.scale ?? 2;
  const currency = totalPipeline?.currency ?? null;

  const weightedParts: MoneyAmount[] = [];
  let probabilityMissing = 0;
  for (const row of open) {
    const value = amount(row);
    if (!value) continue;
    if (row.probabilityBps === null || row.probabilityBps === undefined || row.probabilityBps === "") {
      probabilityMissing += 1;
      continue;
    }
    const bps = parseMinor(row.probabilityBps);
    if (bps === null) {
      probabilityMissing += 1;
      continue;
    }
    weightedParts.push({
      minor: roundDiv(value.minor * bps, 10_000n),
      currency: value.currency,
      scale: value.scale,
    });
  }
  let weightedPipeline: MoneyAmount | null = null;
  if (!weightedParts.length) {
    unknownReasons.push("weighted_pipeline_requires_supplied_probability");
  } else {
    try {
      weightedPipeline = weightedParts.slice(1).reduce((acc, next) => add(acc, next), weightedParts[0]);
      if (probabilityMissing) unknownReasons.push("weighted_pipeline_excludes_opportunities_without_probability");
    } catch {
      unknownReasons.push("currency_mismatch");
      weightedPipeline = null;
    }
  }

  const stages: BusinessGrowthOpportunityStage[] = [
    "identified",
    "qualified",
    "discovery",
    "proposal_ready",
    "proposal",
    "negotiation",
    "won",
    "lost",
    "on_hold",
  ];
  const pipelineByStage = stages.map((stage) => {
    const rows = active.filter((row) => row.stage === stage);
    return {
      stage,
      count: rows.length,
      value: serializeMoney(sumAmounts(rows, [])),
    };
  });

  const byPeriod = new Map<string, BusinessGrowthOpportunity[]>();
  for (const row of open) {
    if (!row.expectedCloseDate) continue;
    const period = row.expectedCloseDate.slice(0, 7);
    const list = byPeriod.get(period) ?? [];
    list.push(row);
    byPeriod.set(period, list);
  }
  const expectedCloseByPeriod = [...byPeriod.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, rows]) => ({
      period,
      count: rows.length,
      value: serializeMoney(sumAmounts(rows, [])),
    }));
  if (open.some((row) => !row.expectedCloseDate)) {
    unknownReasons.push("expected_close_missing_for_some_opportunities");
  }

  const closedCount = won.length + lost.length;
  let winRateBps: string | null = null;
  if (closedCount < minWinRateSample) {
    unknownReasons.push("insufficient_win_rate_sample");
  } else {
    winRateBps = roundDiv(BigInt(won.length) * 10_000n, BigInt(closedCount)).toString();
  }

  let averageOpportunityValue: MoneyJson | null = null;
  if (totalPipeline && open.length) {
    averageOpportunityValue = serializeMoney({
      minor: roundDiv(totalPipeline.minor, BigInt(open.length)),
      currency: totalPipeline.currency,
      scale: totalPipeline.scale,
    });
  }

  let pipelineCoverageBps: string | null = null;
  const targetMinor = parseMinor(target.revenueTargetMinor ?? null);
  if (targetMinor === null || !target.currency) {
    unknownReasons.push("pipeline_coverage_requires_revenue_target");
  } else if (!totalPipeline) {
    unknownReasons.push("pipeline_coverage_requires_pipeline_value");
  } else if (totalPipeline.currency !== target.currency.toUpperCase()) {
    unknownReasons.push("currency_mismatch");
  } else {
    const coverage = ratioBps(totalPipeline, {
      minor: targetMinor,
      currency: target.currency.toUpperCase(),
      scale: target.scale ?? totalPipeline.scale,
    });
    pipelineCoverageBps = coverage === null ? null : coverage.toString();
    if (coverage === null) unknownReasons.push("pipeline_coverage_undefined_zero_target");
  }

  return {
    currency,
    scale,
    totalPipeline: serializeMoney(totalPipeline),
    qualifiedPipeline: serializeMoney(qualifiedPipeline),
    weightedPipeline: serializeMoney(weightedPipeline),
    pipelineByStage,
    expectedCloseByPeriod,
    wonCount: won.length,
    lostCount: lost.length,
    winRateBps,
    averageOpportunityValue,
    openCount: open.length,
    qualifiedOpenCount: qualifiedOpen.length,
    pipelineCoverageBps,
    unknownReasons: [...new Set(unknownReasons)],
    method: "deterministic_pipeline_metrics_v1",
    disclaimer: PIPELINE_DISCLAIMER,
  };
}

export function qualificationRateBps(qualifiedCount: number, totalCount: number): string | null {
  if (totalCount <= 0) return null;
  return roundDiv(BigInt(qualifiedCount) * 10_000n, BigInt(totalCount)).toString();
}
