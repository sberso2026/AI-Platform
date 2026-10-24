/**
 * Phase 15C Isolation Assurance public contracts — 0.3.0-isolation-assurance.
 * Not frozen 1.0.0. Observes isolation; does not own enforcement.
 */

export type IsolationTargetPlane =
  | "DATABASE"
  | "API"
  | "FILES"
  | "SEARCH"
  | "KNOWLEDGE_GRAPH"
  | "AI_CONTEXT"
  | "BACKGROUND_JOB"
  | "EVENT"
  | "EXECUTION_HOST"
  | "SOLVER_WORKSPACE"
  | "CACHE";

export type IsolationProbeLifecycle =
  | "draft"
  | "active"
  | "deprecated"
  | "retired";

export type IsolationProbeResult =
  | "pass"
  | "fail"
  | "partial"
  | "not_applicable"
  | "unknown"
  | "error";

export type IsolationExecutionMode =
  | "on_demand"
  | "ci"
  | "scheduled"
  | "release_gate";

export type IsolationProbeDefinition = {
  probeId: string;
  name: string;
  version: string;
  targetPlane: IsolationTargetPlane;
  scope: string;
  requiredActorContexts: string[];
  expectedOutcome: "allow" | "deny" | "not_applicable";
  controlRefs: string[];
  evidencePolicy: string;
  freshnessPolicy: string;
  timeoutPolicyMs: number;
  riskClassification: "low" | "medium" | "high" | "critical";
  status: IsolationProbeLifecycle;
  /** Built-in harness key — no unrestricted executable registration */
  harnessKey: string;
  productionSafe: true;
  mutatesAuthorization: false;
  mutatesRls: false;
};

export type IsolationProbeReference = {
  probeId: string;
  version: string;
  targetPlane: IsolationTargetPlane;
};

export type IsolationProbeRun = {
  runId: string;
  probeRef: string;
  probeVersion: string;
  targetPlane: IsolationTargetPlane;
  scope: string;
  actorContextRefs: string[];
  targetRefs: string[];
  expectedOutcome: "allow" | "deny" | "not_applicable";
  actualOutcome: "allow" | "deny" | "error" | "not_applicable" | "unknown";
  result: IsolationProbeResult;
  timestamp: string;
  durationMs: number;
  evidenceRefs: string[];
  integrityRef?: string;
  limitations?: string;
  freshness: "current" | "stale" | "expired" | "unknown";
  executionMode: IsolationExecutionMode;
  /** Failures never become PASS via fallback */
  fallbackToPassForbidden: true;
  containsSensitivePayload: false;
  accessDecision?: "allow" | "deny" | "unknown";
  dataDisclosure?: "none" | "metadata_leak" | "payload_leak" | "unknown";
};

export type IsolationAssessment = {
  assessmentId: string;
  scope: string;
  scopeKind: "platform" | "tenant" | "workspace" | "service" | "module" | "plane";
  controlRefs: string[];
  probeRunRefs: string[];
  evidenceRefs: string[];
  result: IsolationProbeResult;
  freshness: "current" | "stale" | "expired" | "unknown";
  limitations?: string;
  findingIds: string[];
  assessedAt: string;
  reviewStatus: "candidate" | "pending_review" | "approved" | "rejected";
  governedReviewAction: "security_assurance.isolation_review";
};

export type IsolationFindingReference = {
  findingId: string;
  kind:
    | "cross_tenant_access"
    | "cross_workspace_access"
    | "metadata_disclosure"
    | "unauthorized_file_access"
    | "search_leakage"
    | "kg_leakage"
    | "ai_context_leakage"
    | "job_context_leakage"
    | "execution_workspace_leakage"
    | "other";
  /** finding ≠ incident */
  isIncident: false;
};

export type IsolationPlaneStatus = {
  plane: IsolationTargetPlane;
  result: IsolationProbeResult;
  lastVerifiedAt?: string;
  freshness: "current" | "stale" | "expired" | "missing" | "unknown";
  probeRunRefs: string[];
  limitations?: string;
};

export type IsolationAssuranceSnapshot = {
  snapshotId: string;
  capturedAt: string;
  scope: string;
  planes: IsolationPlaneStatus[];
  overallResult: IsolationProbeResult;
  knownCrossTenantLeakageDetected: false;
  knownCrossWorkspaceLeakageDetected: false;
  universalScorePresent: false;
};

export type IsolationReleaseGateContract = {
  contractId: string;
  requiredPlanes: IsolationTargetPlane[];
  maxEvidenceAgeHours: number;
  requiredControlStatus: "active";
  blockingFindingKinds: IsolationFindingReference["kind"][];
  allowCertifiedEvidenceReuse: true;
  subjectToFreshness: true;
};

export const ISOLATION_TARGET_PLANES: IsolationTargetPlane[] = [
  "DATABASE",
  "API",
  "FILES",
  "SEARCH",
  "KNOWLEDGE_GRAPH",
  "AI_CONTEXT",
  "BACKGROUND_JOB",
  "EVENT",
  "EXECUTION_HOST",
  "SOLVER_WORKSPACE",
  "CACHE",
];

export const ISOLATION_CONTRACT_NAMES = [
  "IsolationProbeReference",
  "IsolationProbeRun",
  "IsolationAssessment",
  "IsolationFindingReference",
  "IsolationAssuranceSnapshot",
] as const;

export const ISOLATION_SEMANTICS = {
  isolationConfiguredNeqVerified: true,
  rlsEnabledNeqEffective: true,
  authorizationPresentNeqNegativeDenied: true,
  probePassNeqExternalPentest: true,
  singleProbePassNeqContinuousAssurance: true,
  historicalPassNeqCurrentAssurance: true,
  testTenantNeqProductionTenant: true,
  isolationFindingNeqIncident: true,
  assuranceEvidenceNeqEnforcement: true,
  noEvidenceIsUnknown: true,
  staleEvidenceNotCurrent: true,
  failedProbeNeverFallbackPass: true,
} as const;
