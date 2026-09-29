export const STRUCTURAL_PILOT_REVIEW_REFERENCE = {
  objectType: "optimization_study",
  capability: "STRUCTURAL_OPTIMIZATION_PILOT",
  autoApproval: false,
  findingTable: "NONE",
} as const;

export const STRUCTURAL_PILOT_DECISION_HANDOFF = {
  optimizationAlternativesAreNotDecisionAlternatives: true,
  autoSelectFinalDesign: false,
  humanSelectionRequired: true,
  mapping: "governed_reference_only",
} as const;

export function mapOptimizationAlternativeToDecisionReference(input: {
  optimizationAlternativeId: string;
  decisionId: string | null;
}): {
  optimizationAlternativeId: string;
  decisionAlternativeId: null;
  decisionId: string | null;
  selected: false;
  rationaleRequired: true;
} {
  return {
    optimizationAlternativeId: input.optimizationAlternativeId,
    decisionAlternativeId: null,
    decisionId: input.decisionId,
    selected: false,
    rationaleRequired: true,
  };
}

export function assertHumanReviewMandatory(): { engineeringReviewApproval: "NOT_CREATED"; humanReviewMandatory: true } {
  return { engineeringReviewApproval: "NOT_CREATED", humanReviewMandatory: true };
}
