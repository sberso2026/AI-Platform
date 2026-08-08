/**
 * Phase 12H — Qualification / package review workflows (no AI self-approval).
 */

export const SIMULATION_ASSURANCE_REVIEW_SLUGS = [
  "digital_twin.simulation_method_qualification_review",
  "digital_twin.simulation_provider_qualification_review",
  "digital_twin.simulation_application_qualification_review",
  "digital_twin.simulation_execution_qualification_review",
  "digital_twin.simulation_package_review",
] as const;

export type SimulationAssuranceReviewSlug =
  (typeof SIMULATION_ASSURANCE_REVIEW_SLUGS)[number];

export type SimulationAssuranceReview = {
  reviewId: string;
  slug: SimulationAssuranceReviewSlug;
  subjectRef: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedBy?: string;
  decidedBy?: string;
  decidedAt?: string;
  notes?: string;
  /** Explicit firewall */
  aiSelfApproval: false;
  automaticApproval: false;
  isEngineeringAcceptance: false;
  createdAt: string;
  updatedAt: string;
};

export function createSimulationAssuranceReview(input: {
  reviewId: string;
  slug: SimulationAssuranceReviewSlug;
  subjectRef: string;
  notes?: string;
}): SimulationAssuranceReview {
  const now = new Date().toISOString();
  return {
    reviewId: input.reviewId,
    slug: input.slug,
    subjectRef: input.subjectRef,
    status: "draft",
    notes: input.notes,
    aiSelfApproval: false,
    automaticApproval: false,
    isEngineeringAcceptance: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function submitAssuranceReview(
  review: SimulationAssuranceReview,
  submittedBy: string,
): SimulationAssuranceReview {
  if (review.aiSelfApproval || review.automaticApproval) {
    throw new Error("automatic_or_ai_self_approval_forbidden");
  }
  return {
    ...review,
    status: "submitted",
    submittedBy,
    updatedAt: new Date().toISOString(),
  };
}

export function decideAssuranceReview(
  review: SimulationAssuranceReview,
  decision: "approved" | "rejected",
  decidedBy: string,
): SimulationAssuranceReview {
  if (review.status !== "submitted") {
    throw new Error("assurance_review_not_submitted");
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
    isEngineeringAcceptance: false,
    aiSelfApproval: false,
    automaticApproval: false,
  };
}
