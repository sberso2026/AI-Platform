/**
 * Phase 12J — Capability review workflow (digital_twin.capability_review).
 * No AI self-approval. Historic reviews are immutable.
 */

export const DIGITAL_TWIN_CAPABILITY_REVIEW_SLUG = "digital_twin.capability_review" as const;

export type CapabilityReview = {
  reviewId: string;
  slug: typeof DIGITAL_TWIN_CAPABILITY_REVIEW_SLUG;
  subjectRef: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedBy?: string;
  decidedBy?: string;
  decidedAt?: string;
  notes?: string;
  aiSelfApproval: false;
  automaticApproval: false;
  historicImmutable: true;
  createdAt: string;
  updatedAt: string;
};

export function createCapabilityReview(input: {
  reviewId: string;
  subjectRef: string;
  notes?: string;
}): CapabilityReview {
  const now = new Date().toISOString();
  return {
    reviewId: input.reviewId,
    slug: DIGITAL_TWIN_CAPABILITY_REVIEW_SLUG,
    subjectRef: input.subjectRef,
    status: "draft",
    notes: input.notes,
    aiSelfApproval: false,
    automaticApproval: false,
    historicImmutable: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function submitCapabilityReview(
  review: CapabilityReview,
  submittedBy: string,
): CapabilityReview {
  if (review.aiSelfApproval || review.automaticApproval) {
    throw new Error("automatic_or_ai_self_approval_forbidden");
  }
  return {
    ...review,
    status: "submitted",
    submittedBy,
    updatedAt: new Date().toISOString(),
    historicImmutable: true,
    aiSelfApproval: false,
    automaticApproval: false,
  };
}

export function decideCapabilityReview(
  review: CapabilityReview,
  decision: "approved" | "rejected",
  decidedBy: string,
): CapabilityReview {
  if (review.status !== "submitted") {
    throw new Error("capability_review_not_submitted");
  }
  if (!decidedBy || decidedBy === "ai" || decidedBy === "system_auto") {
    throw new Error("automatic_or_ai_self_approval_forbidden");
  }
  if (review.aiSelfApproval || review.automaticApproval) {
    throw new Error("automatic_or_ai_self_approval_forbidden");
  }
  return {
    ...review,
    status: decision,
    decidedBy,
    decidedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    historicImmutable: true,
    aiSelfApproval: false,
    automaticApproval: false,
  };
}
