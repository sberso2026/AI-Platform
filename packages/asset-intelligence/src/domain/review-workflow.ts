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
