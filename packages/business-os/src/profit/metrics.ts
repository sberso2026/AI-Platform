import type { BusinessProfitFact, BusinessProfitMetrics } from "@rtb/types";
import { PROFIT_METRICS_VERSION } from "@rtb/types";
import {
  CurrencyMismatchError,
  money,
  parseMinor,
  ratioBps,
  serializeMoney,
  sub,
} from "../finance/money";

export const PROFIT_METRICS_DISCLAIMER =
  "Profit metrics use exact minor units from supplied facts. Missing direct cost leaves contribution unknown. Allocated cost is never invented. Proposed values are not realized profit.";

export function computeFactMetrics(fact: BusinessProfitFact): BusinessProfitMetrics {
  const unknownReasons: string[] = [];
  try {
    const revenue = money(fact.revenueMinor, fact.currency, fact.scale);
    const directCost = money(fact.directCostMinor, fact.currency, fact.scale);
    const allocated = money(fact.allocatedCostMinor, fact.currency, fact.scale);
    if (!revenue) unknownReasons.push("revenue_unknown");
    if (!directCost) unknownReasons.push("direct_cost_unknown");
    if (!allocated) unknownReasons.push("allocated_cost_unknown");

    let contribution = null;
    if (revenue && directCost) {
      contribution = sub(revenue, directCost);
    } else if (revenue && !directCost) {
      unknownReasons.push("contribution_unknown_missing_direct_cost");
    } else if (!revenue && directCost) {
      unknownReasons.push("contribution_uses_zero_revenue_when_absent");
      contribution = sub(money("0", fact.currency, fact.scale)!, directCost);
    }

    let contributionMarginBps: string | null = null;
    if (contribution && revenue) {
      const ratio = ratioBps(contribution, revenue);
      contributionMarginBps = ratio === null ? null : ratio.toString();
      if (ratio === null) unknownReasons.push("contribution_margin_undefined_zero_revenue");
    }

    let profitAfterAllocated = null;
    if (contribution && allocated) {
      profitAfterAllocated = sub(contribution, allocated);
    } else if (contribution && !allocated) {
      unknownReasons.push("fully_allocated_profit_unknown");
    }

    let profitMarginBps: string | null = null;
    if (profitAfterAllocated && revenue) {
      const ratio = ratioBps(profitAfterAllocated, revenue);
      profitMarginBps = ratio === null ? null : ratio.toString();
    }

    return {
      revenue: serializeMoney(revenue),
      directCost: serializeMoney(directCost),
      contribution: serializeMoney(contribution),
      contributionMarginBps,
      allocatedCost: serializeMoney(allocated),
      profitAfterAllocated: serializeMoney(profitAfterAllocated),
      profitMarginBps,
      unknownReasons,
      attributionMethod: fact.attributionMethod,
      valueState: fact.valueState,
      version: PROFIT_METRICS_VERSION,
      method: "deterministic_profit_metrics_v1",
      disclaimer: PROFIT_METRICS_DISCLAIMER,
    };
  } catch (error) {
    if (error instanceof CurrencyMismatchError) unknownReasons.push("currency_mismatch");
    return {
      revenue: null,
      directCost: null,
      contribution: null,
      contributionMarginBps: null,
      allocatedCost: null,
      profitAfterAllocated: null,
      profitMarginBps: null,
      unknownReasons: unknownReasons.length ? unknownReasons : ["profit_unknown"],
      attributionMethod: fact.attributionMethod,
      valueState: fact.valueState,
      version: PROFIT_METRICS_VERSION,
      method: "deterministic_profit_metrics_v1",
      disclaimer: PROFIT_METRICS_DISCLAIMER,
    };
  }
}

export function contributionFromComponents(
  revenueMinor: string | number | null | undefined,
  directCostMinor: string | number | null | undefined,
): string | null {
  const revenue = parseMinor(revenueMinor ?? null);
  const cost = parseMinor(directCostMinor ?? null);
  if (revenue === null || cost === null) return null;
  return (revenue - cost).toString();
}

export function profitAfterAllocatedFromComponents(
  contributionMinor: string | number | null | undefined,
  allocatedCostMinor: string | number | null | undefined,
): string | null {
  const contribution = parseMinor(contributionMinor ?? null);
  const allocated = parseMinor(allocatedCostMinor ?? null);
  if (contribution === null || allocated === null) return null;
  return (contribution - allocated).toString();
}

export function isRealizedState(state: BusinessProfitFact["valueState"]): boolean {
  return state === "actual" || state === "derived";
}
