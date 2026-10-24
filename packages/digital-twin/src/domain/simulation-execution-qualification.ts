/**
 * Phase 12H — SimulationExecutionQualification (layer 4).
 *
 * Only when all layers + pins + units + immutable input + successful run +
 * validation + human review. NO auto engineering approval.
 */

export const EXECUTION_QUALIFICATION_STATUSES = [
  "not_qualified",
  "qualified",
  "superseded",
  "revoked",
] as const;

export type ExecutionQualificationStatus = (typeof EXECUTION_QUALIFICATION_STATUSES)[number];

export type SimulationExecutionQualification = {
  executionQualificationId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  runId: string;
  resultId: string;
  methodQualificationId: string;
  providerQualificationId: string;
  applicationQualificationId: string;
  validationId: string;
  reviewId: string;
  packageId?: string;
  status: ExecutionQualificationStatus;
  /** Explicit — never auto-promoted from successful run alone. */
  engineeringApproved: false;
  successfulRunImpliesQualified: false;
  validatedImpliesUniversallyAccurate: false;
  pinsPresent: true;
  unitsGoverned: true;
  inputImmutable: true;
  runSucceeded: true;
  validationRecorded: true;
  humanReviewRecorded: true;
  effectiveFrom: string;
  effectiveTo?: string;
  revokedAt?: string;
  supersededBy?: string;
  reviewSlug: "digital_twin.simulation_execution_qualification_review";
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export type ExecutionQualificationEvidence = {
  pinsPresent: boolean;
  unitsGoverned: boolean;
  inputImmutable: boolean;
  runSucceeded: boolean;
  validationRecorded: boolean;
  humanReviewRecorded: boolean;
  allLayersActive: boolean;
  engineeringApprovedAttempt?: boolean;
};

export function createSimulationExecutionQualification(input: {
  executionQualificationId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  runId: string;
  resultId: string;
  methodQualificationId: string;
  providerQualificationId: string;
  applicationQualificationId: string;
  validationId: string;
  reviewId: string;
  packageId?: string;
  evidence: ExecutionQualificationEvidence;
  effectiveFrom?: string;
  createdBy?: string;
}): SimulationExecutionQualification {
  const now = new Date().toISOString();
  if (input.evidence.engineeringApprovedAttempt) {
    throw new Error("auto_engineering_approval_forbidden");
  }
  const eligible =
    input.evidence.allLayersActive &&
    input.evidence.pinsPresent &&
    input.evidence.unitsGoverned &&
    input.evidence.inputImmutable &&
    input.evidence.runSucceeded &&
    input.evidence.validationRecorded &&
    input.evidence.humanReviewRecorded;

  return {
    executionQualificationId: input.executionQualificationId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    runId: input.runId,
    resultId: input.resultId,
    methodQualificationId: input.methodQualificationId,
    providerQualificationId: input.providerQualificationId,
    applicationQualificationId: input.applicationQualificationId,
    validationId: input.validationId,
    reviewId: input.reviewId,
    packageId: input.packageId,
    status: eligible ? "qualified" : "not_qualified",
    engineeringApproved: false,
    successfulRunImpliesQualified: false,
    validatedImpliesUniversallyAccurate: false,
    pinsPresent: true,
    unitsGoverned: true,
    inputImmutable: true,
    runSucceeded: true,
    validationRecorded: true,
    humanReviewRecorded: true,
    effectiveFrom: input.effectiveFrom ?? now,
    reviewSlug: "digital_twin.simulation_execution_qualification_review",
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function supersedeExecutionQualification(
  q: SimulationExecutionQualification,
  supersededBy: string,
): SimulationExecutionQualification {
  if (q.status === "revoked") {
    throw new Error("revoked_execution_qualification_cannot_supersede");
  }
  return {
    ...q,
    status: "superseded",
    supersededBy,
    engineeringApproved: false,
    updatedAt: new Date().toISOString(),
  };
}

export function revokeExecutionQualification(
  q: SimulationExecutionQualification,
): SimulationExecutionQualification {
  const now = new Date().toISOString();
  return {
    ...q,
    status: "revoked",
    revokedAt: now,
    engineeringApproved: false,
    updatedAt: now,
  };
}
