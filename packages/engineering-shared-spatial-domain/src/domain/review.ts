/**
 * Phase 12M — Spatial reference review workflow helpers.
 * Slug: engineering_shared_spatial_domain.spatial_reference_review
 * No AI self-approval.
 */

import { SPATIAL_REFERENCE_REVIEW_SLUG } from "../version";
import {
  createSpatialReferenceReview,
  type SpatialReference,
  type SpatialReferenceReview,
  type SpatialReferenceReviewDecision,
  type SpatialReferenceStatus,
} from "./spatial-references";

export { SPATIAL_REFERENCE_REVIEW_SLUG };

export function applyReviewDecisionToStatus(
  current: SpatialReferenceStatus,
  decision: SpatialReferenceReviewDecision,
): SpatialReferenceStatus {
  switch (decision) {
    case "approve":
      if (current === "draft" || current === "in_review") return "approved";
      return current;
    case "reject":
      return "draft";
    case "request_changes":
      return "draft";
    case "abstain":
      return current === "draft" ? "in_review" : current;
    default:
      return current;
  }
}

export function recordSpatialReferenceReview(input: {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  spatialReference: SpatialReference;
  decision: SpatialReferenceReviewDecision;
  reviewerId?: string;
  rationale?: string;
  aiSelfApproval?: boolean;
}): { review: SpatialReferenceReview; nextStatus: SpatialReferenceStatus } {
  if (input.aiSelfApproval === true) {
    throw new Error("ai_self_approval_forbidden");
  }
  const review = createSpatialReferenceReview({
    reviewId: input.reviewId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    spatialReferenceId: input.spatialReference.id,
    decision: input.decision,
    reviewerId: input.reviewerId,
    rationale: input.rationale,
    aiSelfApproval: false,
  });
  return {
    review,
    nextStatus: applyReviewDecisionToStatus(input.spatialReference.status, input.decision),
  };
}
