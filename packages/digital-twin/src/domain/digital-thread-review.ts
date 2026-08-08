/**
 * Phase 12K — Digital Thread review workflow (digital_twin.digital_thread_review).
 * No AI self-approval.
 */

export const DIGITAL_TWIN_DIGITAL_THREAD_REVIEW_SLUG =
  "digital_twin.digital_thread_review" as const;

export type DigitalThreadReview = {
  reviewId: string;
  slug: typeof DIGITAL_TWIN_DIGITAL_THREAD_REVIEW_SLUG;
  subjectRef: string;
  twinId: string;
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

export function createDigitalThreadReview(input: {
  reviewId: string;
  subjectRef: string;
  twinId: string;
  notes?: string;
}): DigitalThreadReview {
  const now = new Date().toISOString();
  return {
    reviewId: input.reviewId,
    slug: DIGITAL_TWIN_DIGITAL_THREAD_REVIEW_SLUG,
    subjectRef: input.subjectRef,
    twinId: input.twinId,
    status: "draft",
    notes: input.notes,
    aiSelfApproval: false,
    automaticApproval: false,
    historicImmutable: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function submitDigitalThreadReview(
  review: DigitalThreadReview,
  submittedBy: string,
): DigitalThreadReview {
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

export function decideDigitalThreadReview(
  review: DigitalThreadReview,
  decision: "approved" | "rejected",
  decidedBy: string,
): DigitalThreadReview {
  if (review.status !== "submitted") {
    throw new Error("digital_thread_review_not_submitted");
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
