import type {
  BusinessDecisionComparison,
  BusinessDecisionImpact,
  BusinessDecisionImpactDimension,
  BusinessDecisionOption,
  BusinessEvidenceRef,
} from "@rtb/types";
import {
  BUSINESS_DECISION_IMPACT_DIMENSIONS,
  OPTION_COMPARISON_VERSION,
  OPTION_RANKING_VERSION,
} from "@rtb/types";
import { impactDisplay, unknownDimensions } from "./impact";

const DEFAULT_WEIGHTS: Record<BusinessDecisionImpactDimension, number> = {
  financial: 3,
  profit: 3,
  revenue: 2,
  customer: 2,
  operational: 2,
  capacity: 1,
  risk: 2,
  timing: 1,
};

function evidenceFor(optionId: string, evidence: BusinessEvidenceRef[], optionEvidence: Record<string, BusinessEvidenceRef[]>): BusinessEvidenceRef[] {
  return [...evidence, ...(optionEvidence[optionId] ?? [])];
}

export function compareOptions(input: {
  options: BusinessDecisionOption[];
  impacts: BusinessDecisionImpact[];
  evidenceByOption?: Record<string, BusinessEvidenceRef[]>;
  decisionEvidence?: BusinessEvidenceRef[];
  scoringEnabled?: boolean;
  weights?: Partial<Record<BusinessDecisionImpactDimension, number>>;
}): BusinessDecisionComparison {
  const scoringEnabled = Boolean(input.scoringEnabled);
  const weights = { ...DEFAULT_WEIGHTS, ...input.weights };
  const options = input.options.map((option) => {
    const impacts = input.impacts.filter((row) => row.optionId === option.id);
    const knownImpacts: Partial<Record<BusinessDecisionImpactDimension, string>> = {};
    for (const impact of impacts) {
      knownImpacts[impact.dimension] = impactDisplay(impact);
    }
    const unknown = unknownDimensions(impacts);
    const advantages: string[] = [];
    const disadvantages: string[] = [];
    if (option.expectedBenefits) advantages.push(option.expectedBenefits);
    if (option.reversibility === "reversible") advantages.push("Reversible");
    if (option.expectedCosts) disadvantages.push(`Expected costs: ${option.expectedCosts}`);
    if (option.expectedRisks) disadvantages.push(`Expected risks: ${option.expectedRisks}`);
    if (option.reversibility === "irreversible") disadvantages.push("Irreversible");
    if (option.aiGenerated) disadvantages.push("AI-generated proposal — not an approved option");
    return {
      optionId: option.id,
      title: option.title,
      status: option.status,
      aiGenerated: option.aiGenerated,
      reversibility: option.reversibility,
      advantages,
      disadvantages,
      constraints: option.constraints,
      requiredApprovals: ["human_decision_approval"],
      knownImpacts,
      unknownImpacts: unknown,
      evidenceRefs: evidenceFor(option.id, input.decisionEvidence ?? [], input.evidenceByOption ?? {}),
    };
  });

  const preferred = input.options.find((row) => row.status === "preferred" || row.status === "selected");
  let ranking: BusinessDecisionComparison["ranking"] = null;
  if (scoringEnabled) {
    ranking = options.map((row) => {
      const components: Record<string, number> = {};
      let score = 0;
      for (const dim of BUSINESS_DECISION_IMPACT_DIMENSIONS) {
        const known = row.knownImpacts[dim];
        const weight = weights[dim] ?? 0;
        const part = known && known !== "unknown" ? weight : 0;
        components[dim] = part;
        score += part;
      }
      if (row.reversibility === "reversible") {
        components.reversibility = 1;
        score += 1;
      }
      return { optionId: row.optionId, score, components };
    });
  }

  const strongest = scoringEnabled && ranking
    ? [...ranking].sort((a, b) => b.score - a.score)[0]
    : null;
  const strongestOption = strongest ? options.find((row) => row.optionId === strongest.optionId) : preferred;
  const recommendationText = strongestOption
    ? `Option ${strongestOption.title} has strongest supported evidence`
    : preferred
      ? `Option ${preferred.title} is marked preferred on current evidence`
      : input.options.length === 0
        ? "No options recorded"
        : input.options.length === 1
          ? "Single option present — comparison is incomplete"
          : "No preferred option. Compare known and unknown impacts; this is not a guarantee of success.";

  return {
    version: OPTION_COMPARISON_VERSION,
    scoringEnabled,
    scoringDisclaimer: scoringEnabled
      ? "Configured ranking score (option_ranking.v1). Inspectable and not objective truth."
      : "Ranking score disabled. Side-by-side known/unknown impacts only.",
    rankingVersion: scoringEnabled ? OPTION_RANKING_VERSION : null,
    ranking,
    objectiveTruth: false,
    options,
    preferredOptionId: preferred?.id ?? strongest?.optionId ?? null,
    recommendationText,
  };
}
