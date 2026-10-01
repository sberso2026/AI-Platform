import type { PotentialImpactCandidate, SuggestedEngineeringAction } from "./types";

const CATEGORY_ACTIONS: Record<string, Array<{ code: SuggestedEngineeringAction["code"]; label: string }>> = {
  ANALYSIS: [{ code: "PREPARE_ANALYSIS", label: "Prepare Analysis" }, { code: "RE_RUN_ANALYSIS", label: "Re-run Analysis" }],
  CALCULATION: [{ code: "REVISE_CALCULATION", label: "Revise Calculation" }],
  DRAWING: [{ code: "REVISE_DRAWING", label: "Revise Drawing" }],
  SPECIFICATION: [{ code: "UPDATE_SPECIFICATION", label: "Update Specification" }],
  DECISION: [{ code: "REVIEW_DECISION", label: "Review Decision" }, { code: "RECORD_DECISION", label: "Record Decision" }],
  INTERFACE: [{ code: "UPDATE_INTERFACE", label: "Update Interface" }],
  DELIVERABLE: [{ code: "REVIEW_DELIVERABLE", label: "Review Deliverable" }],
  HANDOVER: [{ code: "UPDATE_HANDOVER_PACKAGE", label: "Update Handover Package" }],
  REVIEW: [{ code: "CREATE_REVIEW_PACKAGE", label: "Create Review Package" }, { code: "RUN_PRE_ISSUE_REVIEW", label: "Run Pre-Issue Review" }],
  WORK_PLAN: [{ code: "REFRESH_WORK_PLAN", label: "Refresh Work Plan" }, { code: "REGENERATE_WORK_PLAN", label: "Regenerate" }],
  QUERY: [{ code: "PREPARE_CONSTRUCTION_RESPONSE", label: "Prepare Construction Response" }],
  REQUIREMENT: [{ code: "REQUEST_INFORMATION", label: "Request Information" }],
  INFORMATION: [{ code: "REQUEST_INFORMATION", label: "Request Information" }],
};

export function suggestedActionsFor(candidates: PotentialImpactCandidate[]): SuggestedEngineeringAction[] {
  const actions: SuggestedEngineeringAction[] = [
    {
      code: "RUN_IMPACT_ASSESSMENT",
      label: "Run Impact Assessment",
      candidateId: null,
      completed: false,
      reason: "Human engineering review required. Related is not affected.",
    },
  ];
  for (const candidate of candidates) {
    if (candidate.disposition !== "CONFIRMED_IMPACT") continue;
    const mapped = CATEGORY_ACTIONS[candidate.category] ?? [];
    for (const row of mapped) {
      actions.push({
        code: row.code,
        label: row.label,
        candidateId: candidate.id,
        completed: false,
        reason: `Suggested because ${candidate.objectType}:${candidate.objectId} is a confirmed impact. Action is not complete until it actually occurs.`,
      });
    }
  }
  return actions;
}
