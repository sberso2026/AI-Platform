import type { BusinessGrowthOpportunityScore, BusinessGrowthScoreComponent } from "@rtb/types";
import { OPPORTUNITY_SCORE_VERSION } from "@rtb/types";
import { parseMinor } from "../finance/money";

export const OPPORTUNITY_SCORE_DISCLAIMER =
  "Opportunity score is a deterministic management ranking, not a statistical win probability. User-supplied probability_bps is stored separately and is never inferred.";

export const OPPORTUNITY_SCORE_WEIGHTS = {
  estimatedValue: 20,
  strategicFit: 15,
  expectedMargin: 15,
  timing: 10,
  relationship: 10,
  deliveryCapability: 10,
  commercialRisk: 10,
  evidenceQuality: 10,
} as const;

function band(value: string | null | undefined): "high" | "medium" | "low" | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === "high" || v === "medium" || v === "low") return v;
  return null;
}

function bandScore(weight: number, value: "high" | "medium" | "low"): number {
  if (value === "high") return weight;
  if (value === "medium") return Math.round(weight / 2);
  return 0;
}

export interface OpportunityScoreInput {
  estimatedValueMinor?: string | number | null;
  expectedMarginBps?: string | number | null;
  expectedCloseDate?: string | null;
  strategicFit?: string | null;
  relationshipStrength?: string | null;
  deliveryCapability?: string | null;
  commercialRisk?: string | null;
  nextAction?: string | null;
  description?: string | null;
  asOf?: string;
}

export function scoreOpportunity(input: OpportunityScoreInput): BusinessGrowthOpportunityScore {
  const missingInputs: string[] = [];
  const components: BusinessGrowthScoreComponent[] = [];
  const asOf = input.asOf ? Date.parse(input.asOf) : Date.now();

  let valueMinor: bigint | null = null;
  try {
    valueMinor = parseMinor(input.estimatedValueMinor ?? null);
  } catch {
    valueMinor = null;
    missingInputs.push("estimated_value");
  }
  if (valueMinor === null) {
    components.push({
      id: "estimated_value",
      label: "Estimated value",
      weight: OPPORTUNITY_SCORE_WEIGHTS.estimatedValue,
      score: null,
      evidence: "Estimated value was not supplied.",
    });
    missingInputs.push("estimated_value");
  } else if (valueMinor <= 0n) {
    components.push({
      id: "estimated_value",
      label: "Estimated value",
      weight: OPPORTUNITY_SCORE_WEIGHTS.estimatedValue,
      score: 0,
      evidence: "Estimated value is zero or negative.",
    });
  } else {
    const score =
      valueMinor >= 100_000_000n
        ? OPPORTUNITY_SCORE_WEIGHTS.estimatedValue
        : valueMinor >= 25_000_000n
          ? 12
          : 6;
    components.push({
      id: "estimated_value",
      label: "Estimated value",
      weight: OPPORTUNITY_SCORE_WEIGHTS.estimatedValue,
      score,
      evidence: `Value minor units ${valueMinor.toString()} ranked by configured size bands.`,
    });
  }

  const strategic = band(input.strategicFit);
  if (!strategic) {
    components.push({
      id: "strategic_fit",
      label: "Strategic fit",
      weight: OPPORTUNITY_SCORE_WEIGHTS.strategicFit,
      score: null,
      evidence: "Strategic fit was not supplied.",
    });
    missingInputs.push("strategic_fit");
  } else {
    components.push({
      id: "strategic_fit",
      label: "Strategic fit",
      weight: OPPORTUNITY_SCORE_WEIGHTS.strategicFit,
      score: bandScore(OPPORTUNITY_SCORE_WEIGHTS.strategicFit, strategic),
      evidence: `Strategic fit is ${strategic}.`,
    });
  }

  let margin: bigint | null = null;
  try {
    margin = parseMinor(input.expectedMarginBps ?? null);
  } catch {
    margin = null;
  }
  if (margin === null) {
    components.push({
      id: "expected_margin",
      label: "Expected margin",
      weight: OPPORTUNITY_SCORE_WEIGHTS.expectedMargin,
      score: null,
      evidence: "Expected margin is unknown and was not fabricated.",
    });
    missingInputs.push("expected_margin");
  } else {
    const score = margin >= 2500n ? OPPORTUNITY_SCORE_WEIGHTS.expectedMargin : margin >= 1000n ? 8 : 0;
    components.push({
      id: "expected_margin",
      label: "Expected margin",
      weight: OPPORTUNITY_SCORE_WEIGHTS.expectedMargin,
      score,
      evidence: `Supplied expected margin is ${margin.toString()} bps.`,
    });
  }

  if (!input.expectedCloseDate) {
    components.push({
      id: "timing",
      label: "Timing",
      weight: OPPORTUNITY_SCORE_WEIGHTS.timing,
      score: null,
      evidence: "Expected close date was not supplied.",
    });
    missingInputs.push("timing");
  } else {
    const close = Date.parse(`${input.expectedCloseDate}T00:00:00.000Z`);
    const days = Number.isNaN(close) ? null : Math.floor((close - asOf) / 86_400_000);
    if (days === null) {
      components.push({
        id: "timing",
        label: "Timing",
        weight: OPPORTUNITY_SCORE_WEIGHTS.timing,
        score: null,
        evidence: "Expected close date could not be parsed.",
      });
      missingInputs.push("timing");
    } else {
      const score = days < 0 ? 0 : days <= 90 ? OPPORTUNITY_SCORE_WEIGHTS.timing : days <= 180 ? 6 : 3;
      components.push({
        id: "timing",
        label: "Timing",
        weight: OPPORTUNITY_SCORE_WEIGHTS.timing,
        score,
        evidence: `Expected close is ${days} days from the assessment date.`,
      });
    }
  }

  const relationship = band(input.relationshipStrength);
  if (!relationship) {
    components.push({
      id: "relationship",
      label: "Relationship strength",
      weight: OPPORTUNITY_SCORE_WEIGHTS.relationship,
      score: null,
      evidence: "Relationship strength was not supplied.",
    });
    missingInputs.push("relationship");
  } else {
    components.push({
      id: "relationship",
      label: "Relationship strength",
      weight: OPPORTUNITY_SCORE_WEIGHTS.relationship,
      score: bandScore(OPPORTUNITY_SCORE_WEIGHTS.relationship, relationship),
      evidence: `Relationship strength is ${relationship}.`,
    });
  }

  const delivery = band(input.deliveryCapability);
  if (!delivery) {
    components.push({
      id: "delivery_capability",
      label: "Delivery capability",
      weight: OPPORTUNITY_SCORE_WEIGHTS.deliveryCapability,
      score: null,
      evidence: "Delivery capability was not supplied.",
    });
    missingInputs.push("delivery_capability");
  } else {
    components.push({
      id: "delivery_capability",
      label: "Delivery capability",
      weight: OPPORTUNITY_SCORE_WEIGHTS.deliveryCapability,
      score: bandScore(OPPORTUNITY_SCORE_WEIGHTS.deliveryCapability, delivery),
      evidence: `Delivery capability is ${delivery}.`,
    });
  }

  const risk = band(input.commercialRisk);
  if (!risk) {
    components.push({
      id: "commercial_risk",
      label: "Commercial risk",
      weight: OPPORTUNITY_SCORE_WEIGHTS.commercialRisk,
      score: null,
      evidence: "Commercial risk was not supplied.",
    });
    missingInputs.push("commercial_risk");
  } else {
    const score = risk === "low" ? OPPORTUNITY_SCORE_WEIGHTS.commercialRisk : risk === "medium" ? 5 : 0;
    components.push({
      id: "commercial_risk",
      label: "Commercial risk",
      weight: OPPORTUNITY_SCORE_WEIGHTS.commercialRisk,
      score,
      evidence: `Commercial risk is ${risk} (higher score means lower risk).`,
    });
  }

  const evidenceBits = [input.nextAction, input.description, input.strategicFit].filter(Boolean).length;
  components.push({
    id: "evidence_quality",
    label: "Evidence quality",
    weight: OPPORTUNITY_SCORE_WEIGHTS.evidenceQuality,
    score: Math.round((evidenceBits / 3) * OPPORTUNITY_SCORE_WEIGHTS.evidenceQuality),
    evidence: `${evidenceBits}/3 narrative evidence fields present.`,
  });

  const scored = components.filter((c) => c.score !== null);
  const total = scored.length ? scored.reduce((sum, c) => sum + (c.score ?? 0), 0) : null;

  return {
    total,
    components,
    missingInputs: [...new Set(missingInputs)],
    version: OPPORTUNITY_SCORE_VERSION,
    method: "deterministic_opportunity_score_v1",
    disclaimer: OPPORTUNITY_SCORE_DISCLAIMER,
  };
}
