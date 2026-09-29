/**
 * EOS-A7B Multidisciplinary Analysis & Execution Foundation contracts.
 * Discipline-neutral. Distinct from Optimization Run.
 */

import type { CanonicalDisciplineCode, DisciplineCapabilityKey } from "../discipline-intelligence/catalog";

export const ANALYSIS_JOB_TYPE = "engineering.analysis.execute" as const;

export const ANALYSIS_REQUEST_STATES = [
  "draft",
  "validating",
  "blocked",
  "ready",
  "queued",
  "executing",
  "succeeded",
  "failed",
  "cancelled",
] as const;
export type AnalysisRequestState = (typeof ANALYSIS_REQUEST_STATES)[number];

export const ANALYSIS_RESOLUTION_STATES = [
  "EXECUTABLE",
  "BLOCKED_DISCIPLINE_DISABLED",
  "BLOCKED_CAPABILITY_NOT_AVAILABLE",
  "BLOCKED_CAPABILITY_NOT_CERTIFIED",
  "BLOCKED_NO_TOOL_BINDING",
  "BLOCKED_TOOL_NOT_CONFIGURED",
  "BLOCKED_TOOL_UNAVAILABLE",
  "BLOCKED_TOOL_UNLICENSED",
  "BLOCKED_AUTOMATION_NOT_PERMITTED",
  "BLOCKED_ADAPTER_INCOMPATIBLE",
  "BLOCKED_WORKSPACE_NOT_AUTHORIZED",
  "BLOCKED_BASELINE_REQUIRED",
  "BLOCKED_REQUIREMENTS_INCOMPLETE",
  "BLOCKED_ASSUMPTIONS_INCOMPLETE",
  "BLOCKED_STANDARD_CONTEXT_REQUIRED",
  "BLOCKED_TOOL_NOT_READY",
  "BLOCKED_DEPENDENCY_NOT_ACCEPTED",
  "BLOCKED_DEPENDENCY_STALE",
  "BLOCKED_EXECUTION_HOST_UNAVAILABLE",
] as const;
export type AnalysisResolutionState = (typeof ANALYSIS_RESOLUTION_STATES)[number];

export const PRECONDITION_KEYS = [
  "CONFIGURATION_BASELINE_FROZEN",
  "REQUIRED_REQUIREMENTS_IDENTIFIED",
  "MATERIAL_ASSUMPTIONS_DECLARED",
  "APPLICABLE_STANDARD_IDENTIFIED",
  "REQUIRED_INTERFACE_INFORMATION",
  "UPSTREAM_ANALYSIS_RESULT_ACCEPTED",
  "EXTERNAL_TOOL_READY",
  "WORKSPACE_ALLOWED",
  "EXECUTION_HOST_AVAILABLE",
] as const;
export type AnalysisPreconditionKey = (typeof PRECONDITION_KEYS)[number];

export const PRECONDITION_STATES = ["SATISFIED", "NOT_SATISFIED", "NOT_APPLICABLE", "UNKNOWN"] as const;
export type AnalysisPreconditionState = (typeof PRECONDITION_STATES)[number];

export const ANALYSIS_DEPENDENCY_SEMANTICS = [
  "REQUIRES_RESULT_FROM",
  "USES_RESULT_FROM",
  "SUPERSEDES",
  "VALIDATES",
] as const;
export type AnalysisDependencySemantic = (typeof ANALYSIS_DEPENDENCY_SEMANTICS)[number];

export const ANALYSIS_DEPENDENCY_GOVERNED_MAP: Record<
  AnalysisDependencySemantic,
  "DEPENDS_ON" | "USED_BY" | "SUPERSEDES" | "VERIFIED_BY"
> = {
  REQUIRES_RESULT_FROM: "DEPENDS_ON",
  USES_RESULT_FROM: "USED_BY",
  SUPERSEDES: "SUPERSEDES",
  VALIDATES: "VERIFIED_BY",
};

export const ANALYSIS_FAILURE_CLASSES = [
  "PRECONDITION_FAILED",
  "TOOL_NOT_READY",
  "AUTHORIZATION_FAILED",
  "QUEUE_FAILED",
  "EXECUTION_FAILED",
  "TOOL_TIMEOUT",
  "TOOL_ERROR",
  "PARSER_FAILED",
  "RESULT_INCOMPLETE",
  "UNIT_INVALID",
  "RESULT_VALIDATION_FAILED",
  "DEPENDENCY_STALE",
  "CANCELLED",
] as const;
export type AnalysisFailureClass = (typeof ANALYSIS_FAILURE_CLASSES)[number];

export const STALENESS_REASONS = [
  "STALE_BASELINE_CHANGED",
  "STALE_REQUIREMENT_CHANGED",
  "STALE_ASSUMPTION_CHANGED",
  "STALE_INTERFACE_CHANGED",
  "STALE_STANDARD_CHANGED",
  "STALE_UPSTREAM_RESULT_CHANGED",
  "STALE_TOOL_VERSION_CHANGED",
  "STALE_ADAPTER_VERSION_CHANGED",
] as const;
export type AnalysisStalenessReason = (typeof STALENESS_REASONS)[number];

export const RESULT_ACCEPTANCE_STATES = [
  "UNREVIEWED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "SUPERSEDED",
] as const;
export type ResultAcceptanceState = (typeof RESULT_ACCEPTANCE_STATES)[number];

export const ANALYSIS_SOURCE_KINDS = [
  "EXECUTION_HOST",
  "ADAPTER",
  "SYNTHETIC_TEST",
  "MANUAL",
  "SYSTEM",
] as const;
export type AnalysisSourceKind = (typeof ANALYSIS_SOURCE_KINDS)[number];

export const SYNTHETIC_CERTIFICATION_ADAPTER_ID = "SYNTHETIC_CERTIFICATION_ANALYSIS_ADAPTER";
export const SYNTHETIC_CERTIFICATION_ADAPTER_VERSION = "0.1.0-synthetic-test";
export const SYNTHETIC_CERTIFICATION_CAPABILITY = "CERTIFICATION_ANALYSIS" as const;
export const ANALYSIS_MANIFEST_SCHEMA_VERSION = 1;

export const LLM_AS_ANALYSIS_SOLVER: "PROHIBITED" = "PROHIBITED";
export const AI_SELF_CERTIFY_TOOL: "PROHIBITED" = "PROHIBITED";
export const AI_SELF_ACCEPT_RESULT: "PROHIBITED" = "PROHIBITED";
export const AI_ENGINEERING_APPROVAL: "PROHIBITED" = "PROHIBITED";

export const ANALYSIS_PERMISSIONS = {
  CREATE_ANALYSIS_REQUEST: "analysis.create",
  PLAN_ANALYSIS: "analysis.update",
  EXECUTE_ANALYSIS: "analysis.update",
  REVIEW_ANALYSIS: "analysis.update",
  ACCEPT_ANALYSIS: "analysis.update",
  CERTIFY_TOOL_CAPABILITY: "discipline_intelligence.write",
} as const;

export type AnalysisPrecondition = {
  key: AnalysisPreconditionKey;
  state: AnalysisPreconditionState;
  detail: string;
  safetyCritical: boolean;
};

export type AnalysisToolBinding = {
  id: string;
  tenantId: string;
  workspaceId: string | null;
  disciplineCode: CanonicalDisciplineCode;
  capabilityKey: string;
  toolCode: string;
  externalToolProfileId: string | null;
  certificationStatus: string;
  priority: number;
};

export type AnalysisCapabilitySnapshot = {
  key: string;
  declaredStatus: string;
  effectiveStatus: string;
};

export type AnalysisResolution = {
  state: AnalysisResolutionState;
  executable: boolean;
  reasons: AnalysisResolutionState[];
  disciplineEnabled: boolean;
  capabilityConfigured: boolean;
  capabilityAvailable: boolean;
  capabilityCertified: boolean;
  toolRequired: boolean;
  approvedToolBinding: AnalysisToolBinding | null;
  selectedToolProfileId: string | null;
  toolProfileAvailable: boolean;
  workspaceAuthorized: boolean;
  toolCapabilityCertified: boolean;
  selectionPolicy: "REQUESTED_PROFILE" | "WORKSPACE_DEFAULT" | "GOVERNED_PRIORITY" | "NONE";
  explanation: string[];
};

export type EngineeringAnalysisRequest = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: CanonicalDisciplineCode;
  capability: DisciplineCapabilityKey | typeof SYNTHETIC_CERTIFICATION_CAPABILITY | string;
  systemId: string | null;
  assetId: string | null;
  interfaceId: string | null;
  configurationBaselineId: string | null;
  requirementIds: string[];
  assumptionIds: string[];
  applicableStandardCodes: string[];
  supportingDocumentIds: string[];
  requestedExternalToolProfileId: string | null;
  requestedOutputs: string[];
  executionPriority: number | null;
  requestedBy: string;
  requestedAt: string;
  actorKind: "HUMAN" | "AI_AGENT" | "SYSTEM";
  status: AnalysisRequestState;
  syntheticCertification: boolean;
  originalAnalysisRequestId: string | null;
  metadata: Record<string, unknown>;
};

export type AnalysisExecutionPlan = {
  id: string;
  analysisRequestId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: string;
  capability: string;
  configurationBaselineId: string | null;
  requirementIds: string[];
  assumptionIds: string[];
  standardCodes: string[];
  interfaceIds: string[];
  upstreamAnalysisIds: string[];
  externalToolProfileId: string | null;
  externalToolCapability: string | null;
  adapterId: string | null;
  adapterVersion: string | null;
  executionHostId: string | null;
  toolVersion: string | null;
  inputArtifactRefs: string[];
  requestedResultChannels: string[];
  unitContext: string | null;
  executionPolicy: Record<string, unknown>;
  analysisInputFingerprint: string;
  frozen: boolean;
  frozenAt: string | null;
  status: "draft" | "frozen" | "queued" | "executing" | "completed" | "failed" | "cancelled";
};

export type AnalysisMetric = {
  metricCode: string;
  value: number | null;
  unit: string | null;
  dimension: string | null;
  category: string | null;
  source: string;
  resultChannel: string;
  confidence: "low" | "medium" | "high" | "unknown";
  provenance: Record<string, unknown>;
  artifactRef?: string | null;
  shape: "SCALAR" | "ARRAY" | "CURVE" | "TABLE" | "ARTIFACT";
};

export type EngineeringAnalysisResult = {
  id: string;
  analysisRequestId: string;
  executionPlanId: string | null;
  jobId: string | null;
  executionRef: string | null;
  discipline: string;
  capability: string;
  executionSucceeded: boolean;
  resultValid: boolean;
  status: "SUCCEEDED" | "FAILED" | "INCOMPLETE" | "BLOCKED";
  metrics: AnalysisMetric[];
  warnings: string[];
  limitations: string[];
  resultArtifacts: Array<{ ref: string; hash: string | null; kind: string }>;
  provenance: {
    toolId: string | null;
    toolVersion: string | null;
    adapterId: string | null;
    adapterVersion: string | null;
    executionHostId: string | null;
    sourceKind: AnalysisSourceKind;
    startedAt: string | null;
    completedAt: string | null;
    inputFingerprint: string | null;
    inputArtifactHash: string | null;
    outputArtifactHash: string | null;
  };
  reviewState: "not_reviewed" | "in_review" | "accepted" | "rejected";
  acceptanceState: ResultAcceptanceState;
  acceptedBy: string | null;
  acceptedAt: string | null;
  acceptanceRationale: string | null;
  stale: boolean;
  staleReasons: AnalysisStalenessReason[];
};

export type AnalysisInputManifestV1 = {
  schema_version: typeof ANALYSIS_MANIFEST_SCHEMA_VERSION;
  request: {
    id: string;
    tenant_id: string;
    workspace_id: string;
    project_id: string;
    discipline: string;
    capability: string;
  };
  context: {
    system_id: string | null;
    asset_id: string | null;
    interface_id: string | null;
  };
  baseline: { id: string | null; frozen: boolean };
  requirements: { ids: string[] };
  assumptions: { ids: string[] };
  interfaces: { ids: string[] };
  standards: { codes: string[] };
  tool: {
    profile_id: string | null;
    tool_code: string | null;
    version: string | null;
    capability: string | null;
  };
  adapter: { id: string | null; version: string | null };
  execution_environment: { host_id: string | null; unit_context: string | null };
  inputs: { artifact_refs: string[]; hashes: string[] };
  units: { system: string | null };
  requested_outputs: string[];
  upstream_dependencies: Array<{ request_id: string; result_id: string | null; semantic: AnalysisDependencySemantic }>;
  provenance: { requested_by: string; requested_at: string; actor_kind: string };
};

export type AnalysisExplainability = {
  discipline: string;
  capability: string;
  context: Record<string, unknown>;
  toolSelected: { profileId: string | null; toolCode: string | null; why: string[] };
  baseline: string | null;
  standards: string[];
  requirements: string[];
  assumptions: string[];
  dependencies: Array<{ semantic: string; targetId: string }>;
  preconditions: AnalysisPrecondition[];
  readiness: AnalysisResolution;
  blockingReasons: AnalysisResolutionState[];
  requestedOutputs: string[];
};

export type ResultComparison = {
  comparable: boolean;
  reasons: string[];
  leftResultId: string;
  rightResultId: string;
  channelsCompared: string[];
};
