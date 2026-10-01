import { computeParetoSet, type ObjectiveSpec, type ParetoCandidate } from "../optimization-intelligence/analysis";
import { infeasibleAgainstSafetyHierarchy, optionObjectivesForPareto } from "../lifecycle-intelligence/cross-lifecycle-value";
import type { OptionAlternative, OptionCriterion, OptionStudyComposition } from "./types";

export const DEFAULT_OPTION_CRITERIA: OptionCriterion[] = [
  { key: "capex", label: "CAPEX", direction: "MINIMIZE", unit: "relative", weight: 0.2, weightSource: "HUMAN_ENTERED" },
  { key: "opex", label: "OPEX", direction: "MINIMIZE", unit: "relative", weight: 0.15, weightSource: "HUMAN_ENTERED" },
  { key: "schedule", label: "Schedule", direction: "MINIMIZE", unit: "months", weight: 0.15, weightSource: "HUMAN_ENTERED" },
  { key: "constructability", label: "Constructability", direction: "MAXIMIZE", unit: "score", weight: 0.15, weightSource: "HUMAN_ENTERED" },
  { key: "maintainability", label: "Maintainability", direction: "MAXIMIZE", unit: "score", weight: 0.1, weightSource: "HUMAN_ENTERED" },
  { key: "technical_complexity", label: "Technical complexity", direction: "MINIMIZE", unit: "score", weight: 0.1, weightSource: "HUMAN_ENTERED" },
  { key: "weight", label: "Weight", direction: "MINIMIZE", unit: "t", weight: 0.08, weightSource: "HUMAN_ENTERED" },
  { key: "footprint", label: "Footprint", direction: "MINIMIZE", unit: "m2", weight: 0.07, weightSource: "HUMAN_ENTERED" },
];

export function composeOptionStudy(input: {
  title: string;
  options: OptionAlternative[];
  criteria?: OptionCriterion[];
}): OptionStudyComposition {
  const criteria = input.criteria ?? DEFAULT_OPTION_CRITERIA;
  const paretoCriteria = optionObjectivesForPareto(criteria);
  const objectives: ObjectiveSpec[] = (paretoCriteria.length
    ? paretoCriteria
    : criteria.filter((row) => row.role !== "MANDATORY_CONSTRAINT" && row.applicability !== "NOT_APPLICABLE")
  ).map((row) => ({
    id: row.key,
    metric_key: row.key,
    direction: row.direction === "MAXIMIZE" ? "MAXIMIZE" : "MINIMIZE",
    unit: row.unit,
  }));
  const candidates: ParetoCandidate[] = input.options.map((option) => ({
    alternativeId: option.id,
    runId: option.id,
    metrics: option.metrics,
    feasible: option.metrics.length > 0 && !infeasibleAgainstSafetyHierarchy(option),
  }));
  const pareto = computeParetoSet(objectives, candidates).map((row) => ({
    alternativeId: row.alternativeId,
    status: row.status,
  }));
  const missingEvidence: string[] = [];
  for (const option of input.options) {
    if (!option.evidence.length) missingEvidence.push(`${option.code} missing evidence`);
    if (!option.costInputAvailable) missingEvidence.push(`${option.code} CAPEX/OPEX input not available in project`);
  }
  return {
    id: `option-study:${input.title}`,
    title: input.title,
    criteria,
    options: input.options,
    pareto,
    automaticWinner: false,
    selectedOptionId: null,
    humanDecisionRequired: true,
    humanDecisionRecorded: false,
    decisionId: null,
    optimizationReused: true,
    decisionIntelligenceReused: true,
    weightsVisible: true,
    criteriaVisible: true,
    missingEvidence,
  };
}
