import { describe, expect, it } from "vitest";
import { evaluatePricing, targetMarginPrice } from "./pricing";
import { applyPricingGuardrails, defaultGuardrails } from "./guardrails";
import { money } from "../finance/money";

describe("BOS-4 pricing intelligence", () => {
  it("calculates gross profit and margin with integer minor units", () => {
    const evaluation = evaluatePricing({
      revenueMinor: "80000000",
      estimatedDirectCostMinor: "62000000",
      currency: "AUD",
      scale: 2,
    });
    expect(evaluation.grossProfit?.minor).toBe("18000000");
    expect(evaluation.grossMarginBps).toBe("2250");
    expect(evaluation.method).toBe("deterministic_pricing_v1");
  });

  it("leaves missing cost and zero price unknown rather than inventing margin", () => {
    const missing = evaluatePricing({ revenueMinor: "25000000", currency: "AUD" });
    expect(missing.grossProfit).toBeNull();
    expect(missing.unknownReasons).toContain("direct_cost_unknown");
    const zero = evaluatePricing({ revenueMinor: "0", estimatedDirectCostMinor: "100", currency: "AUD" });
    expect(zero.grossMarginBps).toBeNull();
    expect(zero.unknownReasons).toContain("zero_proposed_price");
  });

  it("applies explicit discount and risk allowance only", () => {
    const evaluation = evaluatePricing({
      revenueMinor: "10000",
      estimatedDirectCostMinor: "4000",
      discountBps: "1000",
      riskAllowanceMinor: "500",
      currency: "AUD",
    });
    expect(evaluation.revenue?.minor).toBe("9000");
    expect(evaluation.grossProfit?.minor).toBe("5000");
    expect(evaluation.contribution?.minor).toBe("4500");
  });

  it("computes target-margin price without floating point", () => {
    const priced = targetMarginPrice(money("8000", "AUD")!, 2000n);
    expect(priced?.minor).toBe(10000n);
  });

  it("flags negative margin and discounts beyond authority", () => {
    const negative = applyPricingGuardrails(
      evaluatePricing({ revenueMinor: "100", estimatedDirectCostMinor: "160", currency: "AUD" }),
      defaultGuardrails("AUD"),
    );
    expect(negative.grossMarginBps).toBe("-6000");
    expect(negative.requiresApproval).toBe(true);
    expect(negative.violations.some((v) => v.ruleId.includes("min_target_margin"))).toBe(true);

    const discount = applyPricingGuardrails(
      evaluatePricing({
        revenueMinor: "10000",
        estimatedDirectCostMinor: "7000",
        discountBps: "1500",
        currency: "AUD",
      }),
      defaultGuardrails("AUD"),
    );
    expect(discount.violations.some((v) => v.ruleId.includes("max_discount"))).toBe(true);
  });

  it("does not invent a risk percentage", () => {
    const evaluation = evaluatePricing({
      revenueMinor: "1000",
      estimatedDirectCostMinor: "600",
      currency: "AUD",
    });
    expect(evaluation.riskAllowance).toBeNull();
  });
});
