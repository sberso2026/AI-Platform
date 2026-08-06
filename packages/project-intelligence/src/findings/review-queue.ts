/**
 * Phase 8E — Findings review queue actions. No AI self-review.
 */
export const FINDINGS_REVIEW_ACTIONS = [
  "assign_reviewer",
  "accept",
  "reject",
  "request_changes",
  "defer",
  "mark_duplicate",
  "link_related",
  "merge_after_approval",
  "classify",
  "set_severity",
  "set_priority",
  "add_comment",
  "attach_evidence",
  "propose_conversion",
  "close",
  "reopen",
] as const;

export type FindingsReviewAction = (typeof FINDINGS_REVIEW_ACTIONS)[number];

export type FindingsReviewDecisionResult = {
  action: FindingsReviewAction;
  decidedBy: string;
  decidedAt: string;
  reasonCode?: string;
  comment?: string;
  assignedTo?: string;
  coreMutationApplied: false;
  aiSelfReview: false;
  auditEventType: string;
};

export function applyFindingsReviewAction(input: {
  action: FindingsReviewAction;
  reviewerUserId: string;
  reasonCode?: string;
  comment?: string;
  assignedToUserId?: string;
  now?: string;
}): FindingsReviewDecisionResult {
  if (!(FINDINGS_REVIEW_ACTIONS as readonly string[]).includes(input.action)) {
    throw new Error(`Unsupported findings review action: ${input.action}`);
  }
  if (!input.reviewerUserId.trim()) {
    throw new Error("Reviewer identity is required");
  }
  const decidedAt = input.now ?? new Date().toISOString();
  return {
    action: input.action,
    decidedBy: input.reviewerUserId,
    decidedAt,
    reasonCode: input.reasonCode,
    comment: input.comment,
    assignedTo: input.assignedToUserId,
    coreMutationApplied: false,
    aiSelfReview: false,
    auditEventType: `project_intelligence.findings.review.${input.action}`,
  };
}
