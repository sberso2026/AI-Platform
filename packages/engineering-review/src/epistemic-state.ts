import type { ReviewFinding, ReviewReasoningBasis } from "./finding";
import type { ReviewFindingStatus } from "./lifecycle";

/**
 * Engineering / epistemic state is not workflow state.
 * A CLOSED finding is an administrative outcome; it does not prove the
 * underlying engineering proposition is technically correct.
 */
export const REVIEW_EPISTEMIC_STATES = [
  "SUPPORTED",
  "CONTRADICTED",
  "UNRESOLVED",
  "INSUFFICIENT_EVIDENCE",
  "OUTSIDE_SCOPE",
  "NOT_ASSESSED",
] as const;
export type ReviewEpistemicState = (typeof REVIEW_EPISTEMIC_STATES)[number];

export const REVIEW_WORKFLOW_STATES = [
  "AWAITING_ENGINEER",
  "ACCEPTED",
  "REJECTED",
  "MODIFIED",
  "ASSIGNED",
  "CLOSED",
] as const;
export type ReviewWorkflowProductState = (typeof REVIEW_WORKFLOW_STATES)[number];

const WORKFLOW_FROM_STATUS: Partial<Record<ReviewFindingStatus, ReviewWorkflowProductState>> = {
  awaiting_engineer: "AWAITING_ENGINEER",
  assigned: "ASSIGNED",
  modified: "MODIFIED",
  accepted: "ACCEPTED",
  rejected: "REJECTED",
  closed: "CLOSED",
};

export function workflowStateFromFindingStatus(
  status: ReviewFindingStatus,
): ReviewWorkflowProductState | "CANDIDATE" {
  return WORKFLOW_FROM_STATUS[status] ?? "CANDIDATE";
}

export function epistemicStateFromFinding(finding: Pick<ReviewFinding, "reasoningBasis" | "verificationState">): ReviewEpistemicState {
  if (finding.verificationState === "revoked" || finding.verificationState === "insufficient_evidence") {
    return "INSUFFICIENT_EVIDENCE";
  }
  return epistemicStateFromReasoningBasis(finding.reasoningBasis);
}

export function epistemicStateFromReasoningBasis(basis: ReviewReasoningBasis): ReviewEpistemicState {
  switch (basis) {
    case "EVIDENCE_BASED":
    case "DERIVED":
      return "SUPPORTED";
    case "CONFLICTING":
      return "CONTRADICTED";
    case "ASSUMED":
      return "UNRESOLVED";
    case "INSUFFICIENT_EVIDENCE":
      return "INSUFFICIENT_EVIDENCE";
    default:
      return "NOT_ASSESSED";
  }
}

/**
 * Zero findings never become package-level SUPPORTED.
 * Silence is not assurance that the package is correct, safe, complete, or approved.
 */
export function packageEpistemicStateFromReview(input: {
  runStatus: string;
  findingCount: number;
}): ReviewEpistemicState {
  if (input.runStatus !== "completed") return "NOT_ASSESSED";
  if (input.findingCount === 0) return "NOT_ASSESSED";
  return "UNRESOLVED";
}

export function closedFindingProvesEngineeringCorrectness(): false {
  return false;
}

export function distinguishFindingStates(finding: ReviewFinding): {
  workflow: ReviewWorkflowProductState | "CANDIDATE";
  epistemic: ReviewEpistemicState;
  closedImpliesTechnicallyProven: false;
} {
  return {
    workflow: workflowStateFromFindingStatus(finding.status),
    epistemic: epistemicStateFromFinding(finding),
    closedImpliesTechnicallyProven: false,
  };
}
