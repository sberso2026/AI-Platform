/**
 * EOS-A9A Lifecycle Intelligence Foundation.
 * Lifecycle Stage is engineering context. It is not schedule, maturity, baseline, or approval.
 */

import { LIFECYCLE_STAGES, type LifecycleStage } from "../optimization-intelligence/invariants";

export { LIFECYCLE_STAGES, type LifecycleStage };

export const LIFECYCLE_JOB_TYPE = "engineering.lifecycle.evaluate" as const;

export const LIFECYCLE_SCOPE_TYPES = ["PROJECT", "SYSTEM", "ASSET"] as const;
export type LifecycleScopeType = (typeof LIFECYCLE_SCOPE_TYPES)[number];

export const GATE_READINESS = [
  "NOT_EVALUATED",
  "EVALUATING",
  "READY_FOR_REVIEW",
  "NOT_READY",
  "PARTIAL",
  "FAILED",
  "STALE",
] as const;
export type GateReadiness = (typeof GATE_READINESS)[number];

export const LIFECYCLE_COMPLETENESS = ["COMPLETE", "PARTIAL", "FAILED"] as const;
export type LifecycleCompleteness = (typeof LIFECYCLE_COMPLETENESS)[number];

export const CRITERION_RESULTS = ["SATISFIED", "NOT_SATISFIED", "NOT_APPLICABLE", "UNKNOWN"] as const;
export type CriterionResultStatus = (typeof CRITERION_RESULTS)[number];

export const GATE_DECISIONS = [
  "APPROVED_TO_TRANSITION",
  "APPROVED_WITH_CONDITIONS",
  "NOT_APPROVED",
  "DEFERRED",
  "WAIVED",
] as const;
export type GateDecisionStatus = (typeof GATE_DECISIONS)[number];

export const CRITERION_TYPES = [
  "CONFIGURATION_BASELINE_REQUIRED",
  "TRACEABILITY_MATURITY_REQUIRED",
  "REQUIREMENTS_CONTEXT_REQUIRED",
  "ASSUMPTION_REVIEW_REQUIRED",
  "INTERFACE_INFORMATION_REQUIRED",
  "ANALYSIS_EVIDENCE_REQUIRED",
  "ENGINEERING_REVIEW_REQUIRED",
  "DECISION_EVIDENCE_REQUIRED",
  "ASSURANCE_EVALUATION_COMPLETE",
  "NO_OPEN_BLOCKING_ASSURANCE_CONDITIONS",
  "CHANGE_SURFACED",
  "OPTIMIZATION_CONTEXT",
] as const;
export type LifecycleCriterionType = (typeof CRITERION_TYPES)[number];

export const OPTIMIZATION_STAGE_POLICY = ["OPTIONAL", "REQUIRED", "NOT_APPLICABLE"] as const;
export type OptimizationStagePolicy = (typeof OPTIMIZATION_STAGE_POLICY)[number];

export const LIFECYCLE_AI_BOUNDARY = {
  mayEvaluateReadiness: true,
  mayExplainCriteria: true,
  mayApproveGate: false,
  mayApproveTransition: false,
  mayWaiveCriterion: false,
  mayAdvanceStage: false,
  mayBackTransition: false,
} as const;

export type LifecycleCriterionDefinition = {
  criterionId: string;
  criterionVersion: "v1";
  type: LifecycleCriterionType;
  gateId: string;
  name: string;
  description: string;
  enabled: true;
  applicableDisciplines?: readonly string[];
  baselineType?: string;
  requiredBaselineStatus?: string;
  requiredInterfaceStatus?: readonly string[];
  sourceDiscipline?: string;
  receivingDiscipline?: string;
  informationKey?: string;
  blockingConditionTypes?: readonly string[];
  minMateriality?: "HIGH" | "CRITICAL";
  optimizationPolicy?: OptimizationStagePolicy;
};

export type LifecycleGateDefinition = {
  gateId: string;
  name: string;
  fromStage: LifecycleStage;
  toStage: LifecycleStage;
  required: boolean;
};

export type LifecycleProfile = {
  profileId: string;
  profileVersion: string;
  name: string;
  enabled: true;
  stages: readonly LifecycleStage[];
  omittedStages: readonly LifecycleStage[];
  allowedTransitions: ReadonlyArray<{ from: LifecycleStage; to: LifecycleStage }>;
  gates: readonly LifecycleGateDefinition[];
  criteria: readonly LifecycleCriterionDefinition[];
};

export type LifecycleAssignment = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scopeType: LifecycleScopeType;
  scopeId: string;
  parentScopeType?: LifecycleScopeType | null;
  parentScopeId?: string | null;
  stage: LifecycleStage;
  profileId: string;
  profileVersion: string;
  version: number;
  assignedBy?: string | null;
  assignedAt: string;
};

export type LifecycleCriterionResult = {
  criterionId: string;
  criterionVersion: string;
  type: LifecycleCriterionType;
  applicability: "APPLICABLE" | "NOT_APPLICABLE";
  status: CriterionResultStatus;
  explanation: string;
  evidenceRefs: Array<{ objectType: string; objectId: string; note?: string }>;
  evaluatedAt: string;
  waived?: boolean;
  waiverRationale?: string | null;
};

export type LifecycleEvaluation = {
  id: string;
  tenantId: string;
  workspaceId: string;
  assignmentId: string;
  gateId: string;
  profileId: string;
  profileVersion: string;
  completeness: LifecycleCompleteness;
  readiness: GateReadiness;
  truncated: boolean;
  remainingScopeUnknown: boolean;
  reason?: string | null;
  criteria: LifecycleCriterionResult[];
  evidenceFingerprint: string;
  createdAt: string;
  stale: boolean;
};

export type LifecycleGateDecision = {
  id: string;
  tenantId: string;
  workspaceId: string;
  evaluationId: string;
  decision: GateDecisionStatus;
  rationale: string;
  outstandingConditionIds?: string[];
  actorId: string;
  decidedAt: string;
};

export type LifecycleTransition = {
  id: string;
  tenantId: string;
  workspaceId: string;
  assignmentId: string;
  fromStage: LifecycleStage;
  toStage: LifecycleStage;
  gateId?: string | null;
  evaluationId?: string | null;
  decisionId?: string | null;
  profileId: string;
  profileVersion: string;
  authorizedBy: string;
  authorizedAt: string;
  rationale: string;
  configurationBaselineId?: string | null;
  evidenceFingerprint: string;
  snapshot: Record<string, unknown>;
};

export type LifecycleScope = {
  objectType: LifecycleScopeType;
  objectId: string;
  parentObjectId?: string | null;
  label?: string;
};

export type LifecycleProfileSetting = {
  id?: string;
  tenantId: string;
  workspaceId: string;
  projectId?: string | null;
  profileId: string;
  profileVersion: string;
  enabledCriterionIds: string[] | null;
  omittedStages: LifecycleStage[];
  configuredBy: string;
  configuredAt: string;
};

export type LifecycleEvidence = {
  projectId?: string;
  baselines: Array<{ id: string; baselineType: string; status: string }>;
  requirements: Array<{ id: string; allocated: boolean; status: string }>;
  assumptions: Array<{
    id: string;
    materiality?: string | null;
    validationStatus?: string | null;
    expired?: boolean;
    reviewed?: boolean;
  }>;
  interfaces: Array<{
    id: string;
    informationKey: string;
    status: string;
    sourceDiscipline?: string | null;
    receivingDiscipline?: string | null;
  }>;
  analyses: Array<{
    id: string;
    applicable: boolean;
    valid: boolean;
    reviewed: boolean;
    accepted?: boolean;
    stale: boolean;
  }>;
  reviews: Array<{ id: string; status: string; reviewsObjectId?: string | null }>;
  decisions: Array<{ id: string; status: string; decisionClass?: string | null }>;
  changes: Array<{ id: string; status: string; material?: boolean }>;
  assurance: {
    completeness: LifecycleCompleteness;
    conditions: Array<{
      id: string;
      conditionType: string;
      materiality: string;
      status: string;
    }>;
  };
  optimizationPolicy: OptimizationStagePolicy;
  optimizationPresent: boolean;
  truncated?: boolean;
  failed?: boolean;
  failureReason?: string | null;
};

export type EffectiveLifecycle = {
  stage: LifecycleStage | "UNKNOWN";
  source: "explicit" | "parent" | "project" | "UNKNOWN";
  assignment?: LifecycleAssignment;
};
