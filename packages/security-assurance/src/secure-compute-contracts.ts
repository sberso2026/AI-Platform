/**
 * Phase 15E Secure Compute Assurance public contracts — 0.5.0-secure-compute.
 * Not frozen 1.0.0. Observes execution security; does not own Execution Host or sandbox.
 */

export type SecureComputePlane =
  | "WORKLOAD_IDENTITY"
  | "TENANT_WORKSPACE_SCOPE"
  | "EXECUTION_AUTHORIZATION"
  | "RUNTIME_ISOLATION"
  | "FILESYSTEM_SCOPE"
  | "NETWORK_EGRESS"
  | "SECRET_ACCESS"
  | "RESOURCE_LIMITS"
  | "EXECUTION_TIMEOUT"
  | "ARTEFACT_INTEGRITY"
  | "EXECUTION_PROVENANCE"
  | "OUTPUT_HANDLING"
  | "TEMPORARY_DATA"
  | "LOGGING_TELEMETRY"
  | "HOST_POSTURE";

export type SecureComputeResult =
  | "pass"
  | "fail"
  | "partial"
  | "unknown"
  | "not_assessed"
  | "not_applicable"
  | "error";

export type WorkloadIdentity = {
  workloadId: string;
  jobId?: string;
  toolId?: string;
  userId?: string;
  serviceId?: string;
  /** Missing identity => unknown/not_assessed, never PASS */
  attributable: boolean;
};

export type ExecutionSecurityContext = {
  executionId: string;
  tenantId: string;
  workspaceId: string;
  requesterIdentity: string;
  workload: WorkloadIdentity;
  runtimeHostRef: string;
  authorizationPolicyRefs: string[];
  securityClassification?: "public" | "internal" | "confidential" | "restricted" | "unknown";
  inputEvidenceRefs: string[];
  outputEvidenceRefs: string[];
  artefactVersionRef?: string;
  artefactHashRef?: string;
  startedAt: string;
  endedAt?: string;
  status: SecureComputeResult;
  evidenceFreshness: "current" | "stale" | "missing" | "unknown";
  /** Never persist raw secrets solely for assurance */
  containsRawSecret: false;
};

export type ComputeControlEvidence = {
  evidenceId: string;
  plane: SecureComputePlane;
  controlRef: string;
  observed: true;
  fabricated: false;
  freshness: "current" | "stale" | "missing" | "unknown";
  sourceRef: string;
  recordedAt: string;
  containsRawSecret: false;
};

export type RuntimeIsolationAssessment = {
  assessmentId: string;
  plane: "RUNTIME_ISOLATION";
  isolationBoundary: "process" | "job" | "sandbox" | "host" | "unknown";
  result: SecureComputeResult;
  limitations?: string;
  /** Do not claim stronger isolation than infrastructure provides */
  strongerThanEvidencedClaimed: false;
  assessedAt: string;
};

export type ExecutionAuthorizationAssessment = {
  assessmentId: string;
  plane: "EXECUTION_AUTHORIZATION";
  policyDecisionRef?: string;
  decision: "allow" | "deny" | "unknown";
  result: SecureComputeResult;
  assessedAt: string;
};

export type ExecutionIntegrityAssessment = {
  assessmentId: string;
  plane: "ARTEFACT_INTEGRITY";
  artefactRef?: string;
  versionRef?: string;
  hashRef?: string;
  result: SecureComputeResult;
  /** No fabricated integrity evidence */
  fabricatedIntegrityForbidden: true;
  assessedAt: string;
};

export type SecureComputeFinding = {
  findingId: string;
  plane: SecureComputePlane;
  severity: "critical" | "high" | "medium" | "low" | "informational" | "unknown";
  status: "open" | "acknowledged" | "mitigated" | "accepted" | "closed";
  summary: string;
  evidenceRefs: string[];
  provenanceRefs: string[];
  observedAt: string;
  recommendedHumanReview: true;
  isIncident: false;
  containsSensitivePayload: false;
};

export type SecureComputeAssessment = {
  assessmentId: string;
  plane: SecureComputePlane;
  scope: string;
  executionId?: string;
  evidenceRefs: string[];
  result: SecureComputeResult;
  freshness: "current" | "stale" | "missing" | "unknown";
  limitations?: string;
  findingIds: string[];
  assessedAt: string;
  reviewStatus: "candidate" | "pending_review" | "approved" | "rejected";
  governedReviewAction: "security_assurance.secure_compute_review";
  errorCannotBecomePass: true;
  fallbackToPassForbidden: true;
};

export type SecureComputePlaneStatus = {
  plane: SecureComputePlane;
  result: SecureComputeResult;
  lastVerifiedAt?: string;
  freshness: "current" | "stale" | "missing" | "unknown";
  limitations?: string;
};

export type SecureComputeSnapshot = {
  snapshotId: string;
  capturedAt: string;
  scope: string;
  planes: SecureComputePlaneStatus[];
  overallResult: SecureComputeResult;
  isolationDimensionPreserved: true;
  aiDataDimensionPreserved: true;
  universalScorePresent: false;
  confidentialComputingClaimed: false;
  teeClaimed: false;
  hardwareAttestationClaimed: false;
  knownCrossTenantExecutionLeakageDetected: false;
  automaticRemediationEnabled: false;
};

export const SECURE_COMPUTE_PLANES: SecureComputePlane[] = [
  "WORKLOAD_IDENTITY",
  "TENANT_WORKSPACE_SCOPE",
  "EXECUTION_AUTHORIZATION",
  "RUNTIME_ISOLATION",
  "FILESYSTEM_SCOPE",
  "NETWORK_EGRESS",
  "SECRET_ACCESS",
  "RESOURCE_LIMITS",
  "EXECUTION_TIMEOUT",
  "ARTEFACT_INTEGRITY",
  "EXECUTION_PROVENANCE",
  "OUTPUT_HANDLING",
  "TEMPORARY_DATA",
  "LOGGING_TELEMETRY",
  "HOST_POSTURE",
];

export const SECURE_COMPUTE_CONTRACT_NAMES = [
  "SecureComputePlane",
  "WorkloadIdentity",
  "ExecutionSecurityContext",
  "ComputeControlEvidence",
  "RuntimeIsolationAssessment",
  "ExecutionAuthorizationAssessment",
  "ExecutionIntegrityAssessment",
  "SecureComputeFinding",
  "SecureComputeAssessment",
  "SecureComputeSnapshot",
] as const;

export const SECURE_COMPUTE_SEMANTICS = {
  missingIdentityNeverPass: true,
  probeErrorNeverPass: true,
  fallbackToPassForbidden: true,
  findingNeqIncident: true,
  noFabricatedIntegrity: true,
  noConfidentialComputingClaimWithoutEvidence: true,
  noAutonomousRemediation: true,
  assuranceNeqEnforcement: true,
  noDuplicateExecutionHost: true,
  unsupportedControlNeverPass: true,
} as const;

/** Missing/empty workload identity is not attributable. */
export function isWorkloadAttributable(workload: WorkloadIdentity): boolean {
  if (!workload.attributable) return false;
  return Boolean(
    workload.workloadId &&
      (workload.userId || workload.serviceId || workload.jobId || workload.toolId),
  );
}
