import type {
  BusinessProfitClassification,
  BusinessProfitClassificationResult,
  BusinessProfitFact,
} from "@rtb/types";
import { BUSINESS_PROFIT_DEFAULT_THRESHOLDS, PROFIT_CLASSIFICATION_VERSION } from "@rtb/types";
import { parseMinor } from "../finance/money";
import { computeFactMetrics } from "./metrics";

export const PROFIT_CLASSIFICATION_DISCLAIMER =
  "Profit classification is a deterministic management band from contribution evidence. It is not a credit rating, tax position, or autonomous pricing decision.";

export function classifyProfit(
  fact: BusinessProfitFact,
  thresholds = BUSINESS_PROFIT_DEFAULT_THRESHOLDS,
): BusinessProfitClassificationResult {
  const metrics = computeFactMetrics(fact);
  const missingInputs = [...metrics.unknownReasons];
  const contribution = parseMinor(metrics.contribution?.minor ?? null);
  const margin = parseMinor(metrics.contributionMarginBps);

  if (contribution === null && margin === null) {
    return result("unknown", null, "Revenue and direct cost are both required for classification.", missingInputs);
  }
  if (contribution !== null && contribution < 0n) {
    return result(
      "negative_contribution",
      metrics.contributionMarginBps,
      `Contribution ${contribution.toString()} minor units is negative.`,
      missingInputs,
    );
  }
  if (margin === null) {
    return result(
      "unknown",
      null,
      "Contribution margin is unknown (zero or missing revenue).",
      missingInputs,
    );
  }
  if (margin >= BigInt(thresholds.highlyProfitableMinBps)) {
    return result("highly_profitable", metrics.contributionMarginBps, `Margin ${margin.toString()} bps.`, missingInputs);
  }
  if (margin >= BigInt(thresholds.profitableMinBps)) {
    return result("profitable", metrics.contributionMarginBps, `Margin ${margin.toString()} bps.`, missingInputs);
  }
  if (margin >= BigInt(thresholds.lowMarginMinBps)) {
    return result("low_margin", metrics.contributionMarginBps, `Margin ${margin.toString()} bps.`, missingInputs);
  }
  const abs = margin < 0n ? -margin : margin;
  if (abs <= BigInt(thresholds.breakEvenAbsBps)) {
    return result("break_even", metrics.contributionMarginBps, `Margin ${margin.toString()} bps is within break-even band.`, missingInputs);
  }
  return result("low_margin", metrics.contributionMarginBps, `Margin ${margin.toString()} bps.`, missingInputs);
}

function result(
  classification: BusinessProfitClassification,
  contributionMarginBps: string | null,
  evidence: string,
  missingInputs: string[],
): BusinessProfitClassificationResult {
  return {
    classification,
    contributionMarginBps,
    evidence,
    missingInputs,
    version: PROFIT_CLASSIFICATION_VERSION,
    method: "deterministic_profit_classification_v1",
    disclaimer: PROFIT_CLASSIFICATION_DISCLAIMER,
  };
}
