import type {
  BusinessGrowthScoreComponent,
  BusinessRevenueBidInput,
  BusinessRevenueBidRecommendation,
} from "@rtb/types";
import { BID_NOBID_VERSION } from "@rtb/types";
import { parseMinor } from "../finance/money";

export const BID_DISCLAIMER =
  "Bid/no-bid is a deterministic advisory ranking from supplied evidence. It is not a statistical win probability. Final bid/no-bid remains a human decision.";

export const BID_WEIGHTS = {
  strategicFit: 15,
  opportunityScore: 10,
  expectedValue: 15,
  expectedMargin: 15,
  deliveryFit: 10,
  timing: 5,
  relationship: 10,
  proposalEffort: 5,
  evidenceQuality: 10,
  commercialRisk: 5,
} as const;

function band(value: string | null | undefined): "high" | "medium" | "low" | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === "high" || v === "medium" || v === "low") return v;
  return null;
}

function bandScore(weight: number, value: "high" | "medium" | "low", invert = false): number {
  const mapped = value === "high" ? weight : value === "medium" ? Math.round(weight / 2) : 0;
  return invert ? weight - mapped : mapped;
}

export interface BidNoBidResult {
  recommendation: BusinessRevenueBidRecommendation;
  total: number | null;
  components: BusinessGrowthScoreComponent[];
  missingInputs: string[];
  version: typeof BID_NOBID_VERSION;
  method: "deterministic_bid_nobid_v1";
  disclaimer: string;
}

export function evaluateBidNoBid(input: BusinessRevenueBidInput): BidNoBidResult {
  const missingInputs: string[] = [];
  const components: BusinessGrowthScoreComponent[] = [];
  const asOf = input.asOf ? Date.parse(input.asOf) : Date.now();

  const pushBand = (
    id: string,
    label: string,
    weight: number,
    value: string | null | undefined,
    invert = false,
  ) => {
    const b = band(value);
    if (!b) {
      components.push({ id, label, weight, score: null, evidence: "Field not supplied." });
      missingInputs.push(id);
      return;
    }
    components.push({
      id,
      label,
      weight,
      score: bandScore(weight, b, invert),
      evidence: invert ? `${b} (inverse scored).` : `Rated ${b}.`,
    });
  };

  pushBand("strategic_fit", "Strategic fit", BID_WEIGHTS.strategicFit, input.strategicFit);
  pushBand("delivery_fit", "Delivery fit", BID_WEIGHTS.deliveryFit, input.deliveryCapability);
  pushBand("relationship", "Relationship strength", BID_WEIGHTS.relationship, input.relationshipStrength);
  pushBand("proposal_effort", "Proposal effort", BID_WEIGHTS.proposalEffort, input.proposalEffort, true);
  pushBand("evidence_quality", "Evidence quality", BID_WEIGHTS.evidenceQuality, input.evidenceQuality);
  pushBand("commercial_risk", "Commercial risk", BID_WEIGHTS.commercialRisk, input.commercialRisk, true);

  if (input.opportunityScore === null || input.opportunityScore === undefined) {
    components.push({
      id: "opportunity_score",
      label: "Opportunity score",
      weight: BID_WEIGHTS.opportunityScore,
      score: null,
      evidence: "Growth opportunity score was not supplied.",
    });
    missingInputs.push("opportunity_score");
  } else {
    const capped = Math.max(0, Math.min(100, input.opportunityScore));
    components.push({
      id: "opportunity_score",
      label: "Opportunity score",
      weight: BID_WEIGHTS.opportunityScore,
      score: Math.round((capped / 100) * BID_WEIGHTS.opportunityScore),
      evidence: `Growth opportunity score ${capped} (ranking, not win probability).`,
    });
  }

  const valueMinor = parseMinor(input.estimatedValueMinor ?? null);
  if (valueMinor === null) {
    components.push({
      id: "expected_value",
      label: "Expected value",
      weight: BID_WEIGHTS.expectedValue,
      score: null,
      evidence: "Estimated value was not supplied.",
    });
    missingInputs.push("expected_value");
  } else {
    const score =
      valueMinor >= 100_000_000n
        ? BID_WEIGHTS.expectedValue
        : valueMinor >= 25_000_000n
          ? 10
          : valueMinor > 0n
            ? 5
            : 0;
    components.push({
      id: "expected_value",
      label: "Expected value",
      weight: BID_WEIGHTS.expectedValue,
      score,
      evidence: valueMinor <= 0n ? "Estimated value is zero or negative." : `Value ${valueMinor.toString()} minor units.`,
    });
  }

  const margin = parseMinor(input.expectedMarginBps ?? null);
  if (margin === null) {
    components.push({
      id: "expected_margin",
      label: "Expected margin",
      weight: BID_WEIGHTS.expectedMargin,
      score: null,
      evidence: "Expected margin was not supplied.",
    });
    missingInputs.push("expected_margin");
  } else {
    const score = margin >= 2500n ? BID_WEIGHTS.expectedMargin : margin >= 1500n ? 8 : margin > 0n ? 3 : 0;
    components.push({
      id: "expected_margin",
      label: "Expected margin",
      weight: BID_WEIGHTS.expectedMargin,
      score,
      evidence: `Expected margin ${margin.toString()} bps.`,
    });
  }

  if (!input.expectedCloseDate) {
    components.push({
      id: "timing",
      label: "Timing",
      weight: BID_WEIGHTS.timing,
      score: null,
      evidence: "Expected close date was not supplied.",
    });
    missingInputs.push("timing");
  } else {
    const close = Date.parse(input.expectedCloseDate);
    const days = Number.isNaN(close) ? null : Math.round((close - asOf) / 86_400_000);
    const score = days === null ? null : days < 0 ? 0 : days <= 90 ? BID_WEIGHTS.timing : days <= 180 ? 3 : 1;
    components.push({
      id: "timing",
      label: "Timing",
      weight: BID_WEIGHTS.timing,
      score,
      evidence: days === null ? "Close date could not be parsed." : `Expected close in ${days} day(s).`,
    });
    if (score === null) missingInputs.push("timing");
  }

  const scored = components.filter((c) => c.score !== null);
  let recommendation: BusinessRevenueBidRecommendation = "insufficient_evidence";
  let total: number | null = null;
  if (missingInputs.length >= 5 || scored.length < 4) {
    recommendation = "insufficient_evidence";
  } else {
    total = scored.reduce((sum, c) => sum + (c.score ?? 0), 0);
    const available = scored.reduce((sum, c) => sum + c.weight, 0);
    const scaled = available === 0 ? 0 : Math.round((total / available) * 100);
    total = scaled;
    if (scaled >= 70) recommendation = "pursue";
    else if (scaled >= 55) recommendation = "pursue_with_conditions";
    else if (scaled >= 40) recommendation = "review";
    else recommendation = "do_not_pursue";
  }

  return {
    recommendation,
    total,
    components,
    missingInputs,
    version: BID_NOBID_VERSION,
    method: "deterministic_bid_nobid_v1",
    disclaimer: BID_DISCLAIMER,
  };
}
