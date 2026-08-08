/**
 * Phase 12G — TwinSimulationResult + validation + review lifecycle.
 *
 * Successful execution ≠ validated ≠ engineering acceptance / approval.
 */

export const SIMULATION_RUN_STATUSES = [
  "queued",
  "running",
  "succeeded",
  "failed",
  "timed_out",
  "cancelled",
] as const;

export type SimulationRunStatus = (typeof SIMULATION_RUN_STATUSES)[number];

export type TwinSimulationArtifactRef = {
  artifactRefId: string;
  /** Platform Files style pointer — no large solver blobs in Twin tables. */
  fileId: string;
  contentType?: string;
  label?: string;
  storesSolverArtifact: false;
};

export type TwinSimulationResult = {
  resultId: string;
  runId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  scenarioId: string;
  inputSetId: string;
  methodId: string;
  providerId: string;
  contentHash: string;
  status: "immutable";
  summary: Record<string, unknown>;
  artifactRefs: TwinSimulationArtifactRef[];
  executionSucceeded: boolean;
  isEngineeringAcceptance: false;
  isApproval: false;
  claimsNativeSolver: false;
  createdAt: string;
  createdBy?: string;
};

export function createTwinSimulationResult(input: {
  resultId: string;
  runId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  scenarioId: string;
  inputSetId: string;
  methodId: string;
  providerId: string;
  contentHash: string;
  executionSucceeded: boolean;
  summary?: Record<string, unknown>;
  artifactRefs?: TwinSimulationArtifactRef[];
  createdBy?: string;
}): TwinSimulationResult {
  return {
    resultId: input.resultId,
    runId: input.runId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    scenarioId: input.scenarioId,
    inputSetId: input.inputSetId,
    methodId: input.methodId,
    providerId: input.providerId,
    contentHash: input.contentHash,
    status: "immutable",
    summary: input.summary ?? {},
    artifactRefs: (input.artifactRefs ?? []).map((a) => ({
      ...a,
      storesSolverArtifact: false as const,
    })),
    executionSucceeded: input.executionSucceeded,
    isEngineeringAcceptance: false,
    isApproval: false,
    claimsNativeSolver: false,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };
}

export const SIMULATION_VALIDATION_STATUSES = [
  "not_validated",
  "pending_validation",
  "validated",
  "rejected",
] as const;

export type SimulationValidationStatus = (typeof SIMULATION_VALIDATION_STATUSES)[number];

export type TwinSimulationValidationState = {
  validationId: string;
  resultId: string;
  runId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  status: SimulationValidationStatus;
  /** Execution success does not imply validated. */
  executionSuccessImpliesValidated: false;
  notes?: string;
  validatedAt?: string;
  validatedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export function createTwinSimulationValidationState(input: {
  validationId: string;
  resultId: string;
  runId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
}): TwinSimulationValidationState {
  const now = new Date().toISOString();
  return {
    validationId: input.validationId,
    resultId: input.resultId,
    runId: input.runId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    status: "not_validated",
    executionSuccessImpliesValidated: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function markSimulationValidated(
  state: TwinSimulationValidationState,
  input: { validatedBy?: string; notes?: string },
): TwinSimulationValidationState {
  return {
    ...state,
    status: "validated",
    notes: input.notes,
    validatedAt: new Date().toISOString(),
    validatedBy: input.validatedBy,
    updatedAt: new Date().toISOString(),
  };
}

export const SIMULATION_REVIEW_LIFECYCLE = [
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "published",
  "superseded",
] as const;

export type SimulationReviewLifecycle = (typeof SIMULATION_REVIEW_LIFECYCLE)[number];

export type TwinSimulationReview = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  resultId: string;
  validationId: string;
  lifecycle: SimulationReviewLifecycle;
  autoApproved: false;
  aiSelfApproved: false;
  createdAt: string;
  updatedAt: string;
  decidedBy?: string;
};

export function createTwinSimulationReview(input: {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  resultId: string;
  validationId: string;
}): TwinSimulationReview {
  const now = new Date().toISOString();
  return {
    reviewId: input.reviewId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    resultId: input.resultId,
    validationId: input.validationId,
    lifecycle: "draft",
    autoApproved: false,
    aiSelfApproved: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function submitSimulationReview(review: TwinSimulationReview): TwinSimulationReview {
  if (review.lifecycle !== "draft") {
    throw new Error("review_must_be_draft_to_submit");
  }
  return { ...review, lifecycle: "pending_review", updatedAt: new Date().toISOString() };
}

export function decideSimulationReview(
  review: TwinSimulationReview,
  decision: "approved" | "rejected",
  decidedBy?: string,
): TwinSimulationReview {
  if (review.lifecycle !== "pending_review") {
    throw new Error("review_must_be_pending");
  }
  if (review.autoApproved || review.aiSelfApproved) {
    throw new Error("automatic_or_ai_self_approval_forbidden");
  }
  return {
    ...review,
    lifecycle: decision,
    decidedBy,
    updatedAt: new Date().toISOString(),
  };
}

export function assertNoAutomaticSimulationApproval(review: TwinSimulationReview): void {
  if (review.autoApproved || review.aiSelfApproved) {
    throw new Error("automatic_simulation_approval_forbidden");
  }
}
