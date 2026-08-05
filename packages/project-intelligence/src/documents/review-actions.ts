/**
 * Phase 8C — Document Intelligence review queue actions.
 * No AI self-approval; no automatic Engineering Core mutation.
 */
export const DOCUMENT_REVIEW_ACTIONS = [
  "approve",
  "reject",
  "request_changes",
  "defer",
  "assign_reviewer",
  "add_comment",
  "link_evidence",
  "mark_conflict",
  "reopen",
] as const;

export type DocumentReviewAction = (typeof DOCUMENT_REVIEW_ACTIONS)[number];

export type DocumentReviewState =
  | "pending"
  | "in_review"
  | "approved"
  | "rejected"
  | "deferred"
  | "reprocess_requested";

export interface DocumentReviewDecisionInput {
  action: DocumentReviewAction;
  reviewerUserId: string;
  reasonCode?: string;
  comment?: string;
  assignedToUserId?: string;
  evidenceIds?: readonly string[];
  now?: string;
}

export interface DocumentReviewDecisionResult {
  reviewState: DocumentReviewState;
  decidedBy: string;
  decidedAt: string;
  decisionComment?: string;
  assignedTo?: string;
  reasonCode?: string;
  coreMutationApplied: false;
  auditEventType: string;
  metadataPatch: Record<string, unknown>;
}

const ACTION_STATE: Record<DocumentReviewAction, DocumentReviewState | null> = {
  approve: "approved",
  reject: "rejected",
  request_changes: "reprocess_requested",
  defer: "deferred",
  assign_reviewer: "in_review",
  add_comment: null,
  link_evidence: null,
  mark_conflict: "in_review",
  reopen: "pending",
};

export function applyDocumentReviewAction(
  input: DocumentReviewDecisionInput,
): DocumentReviewDecisionResult {
  if (!DOCUMENT_REVIEW_ACTIONS.includes(input.action)) {
    throw new Error(`Unsupported review action: ${input.action}`);
  }
  if (!input.reviewerUserId.trim()) {
    throw new Error("Reviewer identity is required");
  }
  const decidedAt = input.now ?? new Date().toISOString();
  const nextState = ACTION_STATE[input.action];
  const metadataPatch: Record<string, unknown> = {
    lastAction: input.action,
    lastActionAt: decidedAt,
  };
  if (input.reasonCode) metadataPatch.reasonCode = input.reasonCode;
  if (input.evidenceIds?.length) metadataPatch.linkedEvidenceIds = input.evidenceIds;
  if (input.action === "mark_conflict") metadataPatch.conflictMarked = true;

  return {
    reviewState: nextState ?? "in_review",
    decidedBy: input.reviewerUserId,
    decidedAt,
    decisionComment: input.comment,
    assignedTo: input.assignedToUserId,
    reasonCode: input.reasonCode,
    coreMutationApplied: false,
    auditEventType: `project_intelligence.document.review.${input.action}`,
    metadataPatch,
  };
}
