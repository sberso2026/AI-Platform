import type { BusinessRevenueGuardrails, BusinessRevenuePricingEvaluation } from "@rtb/types";
import { BUSINESS_REVENUE_DEFAULT_GUARDRAILS, PRICING_GUARDRAIL_VERSION } from "@rtb/types";
import { parseMinor } from "../finance/money";

export function defaultGuardrails(currency?: string | null, scale = 2): BusinessRevenueGuardrails {
  return {
    minTargetMarginBps: BUSINESS_REVENUE_DEFAULT_GUARDRAILS.minTargetMarginBps,
    maxDiscountBpsWithoutApproval: BUSINESS_REVENUE_DEFAULT_GUARDRAILS.maxDiscountBpsWithoutApproval,
    minAbsoluteContributionMinor: BUSINESS_REVENUE_DEFAULT_GUARDRAILS.minAbsoluteContributionMinor,
    currency: currency ?? null,
    scale,
    version: PRICING_GUARDRAIL_VERSION,
  };
}

export function applyPricingGuardrails(
  evaluation: BusinessRevenuePricingEvaluation,
  guardrails: BusinessRevenueGuardrails,
): BusinessRevenuePricingEvaluation {
  const violations: BusinessRevenuePricingEvaluation["violations"] = [...evaluation.violations];
  let requiresApproval = evaluation.requiresApproval;

  const margin = parseMinor(evaluation.grossMarginBps);
  if (margin !== null && margin < BigInt(guardrails.minTargetMarginBps)) {
    violations.push({
      ruleId: "pricing_guardrail.min_target_margin.v1",
      message: `Gross margin ${margin.toString()} bps is below the configured minimum ${guardrails.minTargetMarginBps} bps.`,
      severity: margin < 0n ? "critical" : "warning",
    });
    requiresApproval = true;
  }

  const discount = parseMinor(evaluation.discountBps);
  if (discount !== null && discount > BigInt(guardrails.maxDiscountBpsWithoutApproval)) {
    violations.push({
      ruleId: "pricing_guardrail.max_discount.v1",
      message: `Discount ${discount.toString()} bps exceeds authority of ${guardrails.maxDiscountBpsWithoutApproval} bps.`,
      severity: "warning",
    });
    requiresApproval = true;
  }

  const contribution = parseMinor(evaluation.contribution?.minor ?? null);
  const minContribution = parseMinor(guardrails.minAbsoluteContributionMinor) ?? 0n;
  if (contribution !== null && contribution < minContribution) {
    violations.push({
      ruleId: "pricing_guardrail.min_contribution.v1",
      message: `Contribution ${contribution.toString()} is below the configured minimum ${minContribution.toString()}.`,
      severity: contribution < 0n ? "critical" : "warning",
    });
    requiresApproval = true;
  }

  if (evaluation.unknownReasons.includes("zero_proposed_price")) {
    violations.push({
      ruleId: "pricing_guardrail.zero_price.v1",
      message: "Proposed price is zero; margin cannot be determined.",
      severity: "warning",
    });
    requiresApproval = true;
  }

  return {
    ...evaluation,
    violations,
    requiresApproval,
    version: guardrails.version,
  };
}
