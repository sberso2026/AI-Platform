import type { BusinessRevenuePricingEvaluation, MoneyJson } from "@rtb/types";
import { PRICING_GUARDRAIL_VERSION } from "@rtb/types";
import {
  CurrencyMismatchError,
  add,
  money,
  parseMinor,
  ratioBps,
  roundDiv,
  serializeMoney,
  sub,
  type MoneyAmount,
} from "../finance/money";

export const PRICING_DISCLAIMER =
  "Pricing figures are deterministic integer minor-unit arithmetic. Missing cost, price, or risk allowance remains unknown. AI must not invent prices, costs, or risk percentages.";

export interface PricingScenarioInput {
  revenueMinor?: string | number | null;
  estimatedDirectCostMinor?: string | number | null;
  allocatedCostMinor?: string | number | null;
  discountBps?: string | number | null;
  riskAllowanceMinor?: string | number | null;
  currency: string;
  scale?: number;
  targetMarginBps?: string | number | null;
}

function amount(minor: unknown, currency: string, scale: number): MoneyAmount | null {
  return money(minor ?? null, currency, scale);
}

export function targetMarginPrice(
  cost: MoneyAmount,
  targetMarginBps: bigint,
): MoneyAmount | null {
  if (targetMarginBps >= 10_000n) return null;
  const denominator = 10_000n - targetMarginBps;
  if (denominator <= 0n) return null;
  return {
    minor: roundDiv(cost.minor * 10_000n, denominator),
    currency: cost.currency,
    scale: cost.scale,
  };
}

export function applyDiscount(revenue: MoneyAmount, discountBps: bigint): MoneyAmount {
  if (discountBps < 0n || discountBps > 10_000n) throw new Error("invalid_discount_bps");
  return {
    minor: roundDiv(revenue.minor * (10_000n - discountBps), 10_000n),
    currency: revenue.currency,
    scale: revenue.scale,
  };
}

export function evaluatePricing(input: PricingScenarioInput): BusinessRevenuePricingEvaluation {
  const scale = input.scale ?? 2;
  const unknownReasons: string[] = [];
  const currency = input.currency?.trim().toUpperCase();
  if (!currency || currency.length !== 3) throw new Error("currency_required");

  let revenue: MoneyAmount | null = null;
  let direct: MoneyAmount | null = null;
  let allocated: MoneyAmount | null = null;
  let risk: MoneyAmount | null = null;
  try {
    revenue = amount(input.revenueMinor, currency, scale);
    direct = amount(input.estimatedDirectCostMinor, currency, scale);
    allocated = amount(input.allocatedCostMinor, currency, scale);
    risk = amount(input.riskAllowanceMinor, currency, scale);
  } catch (error) {
    if (error instanceof CurrencyMismatchError) unknownReasons.push("currency_mismatch");
    else throw error;
  }

  if (revenue === null) unknownReasons.push("proposed_price_unknown");
  if (direct === null) unknownReasons.push("direct_cost_unknown");
  if (revenue && revenue.minor === 0n) unknownReasons.push("zero_proposed_price");

  let discountedRevenue = revenue;
  let discountBps: string | null = null;
  const parsedDiscount = parseMinor(input.discountBps ?? null);
  if (parsedDiscount !== null) {
    if (parsedDiscount < 0n || parsedDiscount > 10_000n) throw new Error("invalid_discount_bps");
    discountBps = parsedDiscount.toString();
    if (revenue) discountedRevenue = applyDiscount(revenue, parsedDiscount);
  }

  let grossProfit: MoneyAmount | null = null;
  let contribution: MoneyAmount | null = null;
  let grossMarginBps: string | null = null;
  try {
    if (discountedRevenue && direct) {
      grossProfit = sub(discountedRevenue, direct);
      let totalCost = direct;
      if (allocated) totalCost = add(totalCost, allocated);
      if (risk) totalCost = add(totalCost, risk);
      contribution = sub(discountedRevenue, totalCost);
      const margin = ratioBps(grossProfit, discountedRevenue);
      grossMarginBps = margin === null ? null : margin.toString();
      if (margin === null) unknownReasons.push("gross_margin_undefined_for_zero_price");
    }
  } catch (error) {
    if (error instanceof CurrencyMismatchError) unknownReasons.push("currency_mismatch");
    else unknownReasons.push("pricing_unknown");
    grossProfit = null;
    contribution = null;
    grossMarginBps = null;
  }

  let targetPrice: MoneyJson | null = null;
  const targetBps = parseMinor(input.targetMarginBps ?? null);
  if (direct && targetBps !== null) {
    const priced = targetMarginPrice(direct, targetBps);
    targetPrice = serializeMoney(priced);
  } else if (targetBps === null) {
    unknownReasons.push("target_margin_unknown");
  }

  return {
    revenue: serializeMoney(discountedRevenue),
    estimatedDirectCost: serializeMoney(direct),
    allocatedCost: serializeMoney(allocated),
    riskAllowance: serializeMoney(risk),
    grossProfit: serializeMoney(grossProfit),
    contribution: serializeMoney(contribution),
    grossMarginBps,
    discountBps,
    targetMarginPrice: targetPrice,
    violations: [],
    requiresApproval: false,
    unknownReasons,
    version: PRICING_GUARDRAIL_VERSION,
    method: "deterministic_pricing_v1",
    disclaimer: PRICING_DISCLAIMER,
  };
}
