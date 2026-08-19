import type { BusinessWorkCostFact, BusinessWorkCostProgress, BusinessWorkItem } from "@rtb/types";
import { BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS, WORK_COST_PROGRESS_VERSION } from "@rtb/types";
import { parseMinor } from "../finance/money";

export const COST_PROGRESS_DISCLAIMER =
  "Cost vs progress is a potential overrun indicator from budget consumption versus earned progress. It is not a final overrun certainty. Budget consumption is distinct from earned progress.";

export function sumFacts(
  facts: Array<Pick<BusinessWorkCostFact, "amountMinor" | "currency" | "scale" | "valueState">>,
  valueState: BusinessWorkCostFact["valueState"],
  currency: string,
  scale: number,
): bigint | null {
  const matching = facts.filter(
    (row) =>
      row.valueState === valueState &&
      row.currency.toUpperCase() === currency.toUpperCase() &&
      row.scale === scale,
  );
  if (matching.length === 0) return null;
  let total = 0n;
  for (const row of matching) {
    const amount = parseMinor(row.amountMinor);
    if (amount === null) return null;
    total += amount;
  }
  return total;
}

export function mixedCurrency(facts: Array<Pick<BusinessWorkCostFact, "currency" | "valueState">>, valueState: BusinessWorkCostFact["valueState"]): boolean {
  const currencies = new Set(
    facts.filter((row) => row.valueState === valueState).map((row) => row.currency.toUpperCase()),
  );
  return currencies.size > 1;
}

export function computeCostProgress(input: {
  work: Pick<BusinessWorkItem, "budgetCostMinor" | "currency" | "scale">;
  facts: Array<Pick<BusinessWorkCostFact, "amountMinor" | "currency" | "scale" | "valueState">>;
  progressBps: string | null;
  thresholdBps?: number;
}): BusinessWorkCostProgress {
  const threshold = input.thresholdBps ?? BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS.costProgressVarianceBps;
  const unknownReasons: string[] = [];
  const progress = parseMinor(input.progressBps);
  if (progress === null) unknownReasons.push("progress_unknown");

  if (mixedCurrency(input.facts, "actual")) {
    unknownReasons.push("mixed_currency_actual_cost");
  }

  const budgetFromWork = parseMinor(input.work.budgetCostMinor);
  const budgetFromFacts = mixedCurrency(input.facts, "budget")
    ? null
    : sumFacts(input.facts, "budget", input.work.currency, input.work.scale);
  const budget = budgetFromWork ?? budgetFromFacts;
  if (budget === null) unknownReasons.push("budget_unknown");
  else if (budget === 0n) unknownReasons.push("zero_budget");

  const actual = mixedCurrency(input.facts, "actual")
    ? null
    : sumFacts(input.facts, "actual", input.work.currency, input.work.scale);
  if (actual === null) unknownReasons.push("actual_cost_unknown");

  if (unknownReasons.length > 0 || budget === null || budget === 0n || actual === null || progress === null) {
    return {
      actualCostBpsOfBudget: null,
      progressBps: progress?.toString() ?? null,
      varianceBps: null,
      signal: false,
      unknownReasons,
      version: WORK_COST_PROGRESS_VERSION,
      method: "deterministic_cost_progress_v1",
      disclaimer: COST_PROGRESS_DISCLAIMER,
    };
  }

  const actualCostBpsOfBudget = (actual * 10000n) / budget;
  const varianceBps = actualCostBpsOfBudget - progress;
  return {
    actualCostBpsOfBudget: actualCostBpsOfBudget.toString(),
    progressBps: progress.toString(),
    varianceBps: varianceBps.toString(),
    signal: varianceBps >= BigInt(threshold),
    unknownReasons: [],
    version: WORK_COST_PROGRESS_VERSION,
    method: "deterministic_cost_progress_v1",
    disclaimer: COST_PROGRESS_DISCLAIMER,
  };
}
