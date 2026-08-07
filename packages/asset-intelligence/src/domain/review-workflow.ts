/**
 * Phase 10C — governed review workflows via Engineering Workflow SDK.
 * No new workflow engine. Reliability review reserved for Phase 10D.
 */

import {
  createReviewRecord,
  createWorkflowInstance,
  transitionWorkflowInstance,
  type EngineeringWorkflowDefinition,
  type EngineeringWorkflowInstance,
  type EngineeringReviewRecord,
} from "@rtb/engineering-os";

export const CRITICALITY_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: "asset_intelligence.criticality_review",
  displayName: "Asset Criticality Review",
  moduleKey: "asset_intelligence",
  version: 1,
  initialState: "draft",
  states: ["draft", "pending_review", "changes_requested", "approved", "rejected"] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
  ],
};

/** Phase 10D — Reliability review via Engineering Workflow SDK. */
export const RELIABILITY_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: "asset_intelligence.reliability_review",
  displayName: "Asset Reliability Review",
  moduleKey: "asset_intelligence",
  version: 1,
  initialState: "draft",
  states: ["draft", "pending_review", "changes_requested", "approved", "rejected"] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
  ],
};

/** @deprecated Prefer RELIABILITY_REVIEW_WORKFLOW */
export const RELIABILITY_REVIEW_WORKFLOW_RESERVED = RELIABILITY_REVIEW_WORKFLOW;

export function startCriticalityReview(input: {
  tenantId: string;
  workspaceId: string;
  criticalityStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: CRITICALITY_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: "asset_criticality_state",
    entityId: input.criticalityStateId,
    startedBy: input.startedBy,
    context: { kind: "criticality" },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: CRITICALITY_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({
    instanceId: submitted.instanceId,
  });
  return { instance: submitted, review };
}

/** Phase 10E — Failure review via Engineering Workflow SDK. */
export const FAILURE_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: "asset_intelligence.failure_review",
  displayName: "Asset Failure Review",
  moduleKey: "asset_intelligence",
  version: 1,
  initialState: "draft",
  states: ["draft", "pending_review", "changes_requested", "approved", "rejected"] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
  ],
};

export function startReliabilityReview(input: {
  tenantId: string;
  workspaceId: string;
  reliabilityStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: RELIABILITY_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: "asset_reliability_state",
    entityId: input.reliabilityStateId,
    startedBy: input.startedBy,
    context: { kind: "reliability" },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: RELIABILITY_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({
    instanceId: submitted.instanceId,
  });
  return { instance: submitted, review };
}

export function startFailureReview(input: {
  tenantId: string;
  workspaceId: string;
  failureModeStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: FAILURE_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: "asset_failure_mode_state",
    entityId: input.failureModeStateId,
    startedBy: input.startedBy,
    context: { kind: "failure" },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: FAILURE_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({
    instanceId: submitted.instanceId,
  });
  return { instance: submitted, review };
}

export function transitionFailureReview(input: {
  instance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: FAILURE_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

/** Phase 10F — Degradation / trend review via Engineering Workflow SDK. */
export const DEGRADATION_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: "asset_intelligence.degradation_review",
  displayName: "Asset Degradation Review",
  moduleKey: "asset_intelligence",
  version: 1,
  initialState: "draft",
  states: ["draft", "pending_review", "changes_requested", "approved", "rejected"] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
  ],
};

export function startDegradationReview(input: {
  tenantId: string;
  workspaceId: string;
  degradationStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: DEGRADATION_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: "asset_degradation_state",
    entityId: input.degradationStateId,
    startedBy: input.startedBy,
    context: { kind: "degradation" },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: DEGRADATION_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({
    instanceId: submitted.instanceId,
  });
  return { instance: submitted, review };
}

export function transitionDegradationReview(input: {
  instance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: DEGRADATION_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

/** Phase 10G — Lifecycle context review via Engineering Workflow SDK. */
export const LIFECYCLE_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: "asset_intelligence.lifecycle_review",
  displayName: "Asset Lifecycle Intelligence Review",
  moduleKey: "asset_intelligence",
  version: 1,
  initialState: "draft",
  states: ["draft", "pending_review", "changes_requested", "approved", "rejected"] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
  ],
};

export function startLifecycleReview(input: {
  tenantId: string;
  workspaceId: string;
  lifecycleStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: LIFECYCLE_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: "asset_lifecycle_intelligence_state",
    entityId: input.lifecycleStateId,
    startedBy: input.startedBy,
    context: { kind: "lifecycle_intelligence" },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: LIFECYCLE_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({
    instanceId: submitted.instanceId,
  });
  return { instance: submitted, review };
}

export function transitionLifecycleReview(input: {
  instance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: LIFECYCLE_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

/** Phase 10H — Risk Signal review via Engineering Workflow SDK. */
export const RISK_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: "asset_intelligence.risk_review",
  displayName: "Asset Risk Signal Review",
  moduleKey: "asset_intelligence",
  version: 1,
  initialState: "draft",
  states: ["draft", "pending_review", "changes_requested", "approved", "rejected"] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
  ],
};

/** Phase 10H — Maintenance Recommendation review (advisory; never a work order). */
export const MAINTENANCE_RECOMMENDATION_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: "asset_intelligence.maintenance_recommendation_review",
  displayName: "Asset Maintenance Recommendation Review",
  moduleKey: "asset_intelligence",
  version: 1,
  initialState: "draft",
  states: ["draft", "pending_review", "changes_requested", "approved", "rejected"] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
  ],
};

/** Phase 10H — Asset Priority Context review. */
export const PRIORITY_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: "asset_intelligence.priority_review",
  displayName: "Asset Priority Context Review",
  moduleKey: "asset_intelligence",
  version: 1,
  initialState: "draft",
  states: ["draft", "pending_review", "changes_requested", "approved", "rejected"] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
  ],
};

export function startRiskReview(input: {
  tenantId: string;
  workspaceId: string;
  riskSignalStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: RISK_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: "asset_risk_signal_state",
    entityId: input.riskSignalStateId,
    startedBy: input.startedBy,
    context: { kind: "risk_signal" },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: RISK_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  return { instance: submitted, review: createReviewRecord({ instanceId: submitted.instanceId }) };
}

export function transitionRiskReview(input: {
  instance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: RISK_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function startMaintenanceRecommendationReview(input: {
  tenantId: string;
  workspaceId: string;
  recommendationStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: MAINTENANCE_RECOMMENDATION_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: "asset_maintenance_recommendation_state",
    entityId: input.recommendationStateId,
    startedBy: input.startedBy,
    context: { kind: "maintenance_recommendation" },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: MAINTENANCE_RECOMMENDATION_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  return { instance: submitted, review: createReviewRecord({ instanceId: submitted.instanceId }) };
}

export function transitionMaintenanceRecommendationReview(input: {
  instance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: MAINTENANCE_RECOMMENDATION_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function startPriorityReview(input: {
  tenantId: string;
  workspaceId: string;
  priorityProfileId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: PRIORITY_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: "asset_priority_profile",
    entityId: input.priorityProfileId,
    startedBy: input.startedBy,
    context: { kind: "priority" },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: PRIORITY_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  return { instance: submitted, review: createReviewRecord({ instanceId: submitted.instanceId }) };
}

export function transitionPriorityReview(input: {
  instance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: PRIORITY_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

/** Phase 10I — Multi-source fusion review via Engineering Workflow SDK. */
export const FUSION_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: "asset_intelligence.fusion_review",
  displayName: "Asset Multi-Source Fusion Review",
  moduleKey: "asset_intelligence",
  version: 1,
  initialState: "draft",
  states: ["draft", "pending_review", "changes_requested", "approved", "rejected"] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
  ],
};

/** Phase 10I — Predictive readiness review (readiness only; never predictive execution). */
export const PREDICTIVE_READINESS_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: "asset_intelligence.predictive_readiness_review",
  displayName: "Asset Predictive Readiness Review",
  moduleKey: "asset_intelligence",
  version: 1,
  initialState: "draft",
  states: ["draft", "pending_review", "changes_requested", "approved", "rejected"] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
  ],
};

export function startFusionReview(input: {
  tenantId: string;
  workspaceId: string;
  fusionStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: FUSION_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: "asset_fusion_state",
    entityId: input.fusionStateId,
    startedBy: input.startedBy,
    context: { kind: "fusion" },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: FUSION_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  return { instance: submitted, review: createReviewRecord({ instanceId: submitted.instanceId }) };
}

export function transitionFusionReview(input: {
  instance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: FUSION_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function startPredictiveReadinessReview(input: {
  tenantId: string;
  workspaceId: string;
  readinessStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: PREDICTIVE_READINESS_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: "asset_predictive_readiness_state",
    entityId: input.readinessStateId,
    startedBy: input.startedBy,
    context: { kind: "predictive_readiness" },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: PREDICTIVE_READINESS_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  return { instance: submitted, review: createReviewRecord({ instanceId: submitted.instanceId }) };
}

export function transitionPredictiveReadinessReview(input: {
  instance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: PREDICTIVE_READINESS_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

/**
 * Phase 10J — predictive method governance review. Approval here qualifies a
 * method within its fixture domain; it never certifies it for production
 * predictive execution.
 */
export const PREDICTIVE_METHOD_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: "asset_intelligence.predictive_method_review",
  displayName: "Asset Predictive Method Governance Review",
  moduleKey: "asset_intelligence",
  version: 1,
  initialState: "draft",
  states: ["draft", "pending_review", "changes_requested", "approved", "rejected"] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
  ],
};

export function startPredictiveMethodReview(input: {
  tenantId: string;
  workspaceId: string;
  subjectId: string;
  subjectKind?:
    | "objective_readiness"
    | "method_candidate"
    | "method_qualification";
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const subjectKind = input.subjectKind ?? "method_qualification";
  const instance = createWorkflowInstance({
    definition: PREDICTIVE_METHOD_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: `asset_predictive_${subjectKind}`,
    entityId: input.subjectId,
    startedBy: input.startedBy,
    context: { kind: "predictive_governance", subjectKind },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: PREDICTIVE_METHOD_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  return { instance: submitted, review: createReviewRecord({ instanceId: submitted.instanceId }) };
}

export function transitionPredictiveMethodReview(input: {
  instance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: PREDICTIVE_METHOD_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

/** Governed approval of a predictive record never authorises execution. */
export const PREDICTIVE_METHOD_REVIEW_GRANTS = {
  grantsProductionExecution: false,
  grantsCertification: false,
} as const;

export function transitionCriticalityReview(input: {
  instance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: CRITICALITY_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}
