/**
 * Phase 12D — Digital Twin identity, state, and candidate review workflows.
 *
 * draft → pending_review → approved|rejected → published
 * No AI self-approval.
 */

import {
  createReviewRecord,
  createWorkflowInstance,
  transitionWorkflowInstance,
  type EngineeringReviewRecord,
  type EngineeringWorkflowDefinition,
  type EngineeringWorkflowInstance,
} from "@rtb/engineering-os";
import {
  AUTONOMOUS_TWIN_STATE_PUBLICATION_ALLOWED,
  DIGITAL_TWIN_IDENTITY_REVIEW_SLUG,
  DIGITAL_TWIN_STATE_REVIEW_SLUG,
  DIGITAL_TWIN_TELEMETRY_BINDING_REVIEW_SLUG,
} from "../version";

export const IDENTITY_REVIEW_WORKFLOW_SLUG = DIGITAL_TWIN_IDENTITY_REVIEW_SLUG;
export const STATE_REVIEW_WORKFLOW_SLUG = DIGITAL_TWIN_STATE_REVIEW_SLUG;
export const TELEMETRY_BINDING_REVIEW_WORKFLOW_SLUG = DIGITAL_TWIN_TELEMETRY_BINDING_REVIEW_SLUG;

export const IDENTITY_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: IDENTITY_REVIEW_WORKFLOW_SLUG,
  displayName: "Digital Twin Identity Review",
  moduleKey: "digital_twin",
  version: 1,
  initialState: "draft",
  states: [
    "draft",
    "pending_review",
    "changes_requested",
    "approved",
    "rejected",
    "published",
  ] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
    { from: "approved", to: "published", action: "publish" },
  ],
};

export const IDENTITY_REVIEW_ENTITY_TYPE = "digital_twin_identity" as const;

export type IdentityReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type IdentityReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startIdentityReview(input: {
  tenantId: string;
  workspaceId: string;
  twinId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: IDENTITY_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: IDENTITY_REVIEW_ENTITY_TYPE,
    entityId: input.twinId,
    startedBy: input.startedBy,
    context: {
      kind: "digital_twin_identity",
      twinId: input.twinId,
      liveTelemetryBound: false,
      simulationExecuted: false,
      runtimeSyncEnabled: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: IDENTITY_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionIdentityReview(input: {
  instance: EngineeringWorkflowInstance;
  action: IdentityReviewAction;
  to: IdentityReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: IDENTITY_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export const STATE_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: STATE_REVIEW_WORKFLOW_SLUG,
  displayName: "Digital Twin State Review",
  moduleKey: "digital_twin",
  version: 1,
  initialState: "draft",
  states: [
    "draft",
    "pending_review",
    "changes_requested",
    "approved",
    "rejected",
    "published",
  ] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
    { from: "approved", to: "published", action: "publish" },
  ],
};

export const STATE_REVIEW_ENTITY_TYPE = "digital_twin_state" as const;

export type StateReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type StateReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startStateReview(input: {
  tenantId: string;
  workspaceId: string;
  twinId: string;
  stateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: STATE_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: STATE_REVIEW_ENTITY_TYPE,
    entityId: input.stateId,
    startedBy: input.startedBy,
    context: {
      kind: "digital_twin_state",
      twinId: input.twinId,
      stateId: input.stateId,
      liveIngestionEnabled: false,
      simulationExecuted: false,
      storesTelemetryPayload: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: STATE_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionStateReview(input: {
  instance: EngineeringWorkflowInstance;
  action: StateReviewAction;
  to: StateReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: STATE_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function assertReviewPublishable(input: {
  workflowState: string;
  reviewerId?: string;
  createdBy?: string;
}): void {
  if (AUTONOMOUS_TWIN_STATE_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_twin_publication_forbidden");
  }
  if (input.workflowState !== "approved") {
    throw new Error("twin_publish_requires_approved_review");
  }
  if (!input.reviewerId) {
    throw new Error("twin_publish_requires_reviewer");
  }
  if (input.createdBy && input.createdBy === input.reviewerId) {
    throw new Error("twin_self_approval_forbidden");
  }
}

/** @deprecated Use assertReviewPublishable */
export function assertIdentityPublishable(input: {
  workflowState: string;
  reviewerId?: string;
  createdBy?: string;
}): void {
  assertReviewPublishable(input);
}

export const CANDIDATE_REVIEW_ENTITY_TYPE = "digital_twin_state_candidate" as const;

export type CandidateReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type CandidateReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startCandidateStateReview(input: {
  tenantId: string;
  workspaceId: string;
  twinId: string;
  candidateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: STATE_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: CANDIDATE_REVIEW_ENTITY_TYPE,
    entityId: input.candidateId,
    startedBy: input.startedBy,
    context: {
      kind: "digital_twin_state_candidate",
      twinId: input.twinId,
      candidateId: input.candidateId,
      autoPublishEnabled: false,
      liveIngestionEnabled: false,
      storesTelemetryPayload: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: STATE_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionCandidateStateReview(input: {
  instance: EngineeringWorkflowInstance;
  action: CandidateReviewAction;
  to: CandidateReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionStateReview(input);
}

export const TELEMETRY_BINDING_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: TELEMETRY_BINDING_REVIEW_WORKFLOW_SLUG,
  displayName: "Digital Twin Telemetry Binding Review",
  moduleKey: "digital_twin",
  version: 1,
  initialState: "draft",
  states: [
    "draft",
    "pending_review",
    "changes_requested",
    "approved",
    "rejected",
    "published",
    "suspended",
    "superseded",
    "retired",
  ] as const,
  transitions: [
    { from: "draft", to: "pending_review", action: "submit" },
    { from: "pending_review", to: "approved", action: "approve" },
    { from: "pending_review", to: "changes_requested", action: "request_changes" },
    { from: "pending_review", to: "rejected", action: "reject" },
    { from: "changes_requested", to: "pending_review", action: "resubmit" },
    { from: "approved", to: "published", action: "publish" },
    { from: "published", to: "suspended", action: "suspend" },
    { from: "published", to: "superseded", action: "supersede" },
    { from: "suspended", to: "published", action: "resume" },
    { from: "published", to: "retired", action: "retire" },
    { from: "superseded", to: "retired", action: "retire" },
  ],
};

export const TELEMETRY_BINDING_REVIEW_ENTITY_TYPE = "digital_twin_telemetry_binding" as const;

export type TelemetryBindingReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish"
  | "suspend"
  | "supersede"
  | "resume"
  | "retire";
export type TelemetryBindingReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published"
  | "suspended"
  | "superseded"
  | "retired";

export function startTelemetryBindingReview(input: {
  tenantId: string;
  workspaceId: string;
  twinId: string;
  bindingId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: TELEMETRY_BINDING_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: TELEMETRY_BINDING_REVIEW_ENTITY_TYPE,
    entityId: input.bindingId,
    startedBy: input.startedBy,
    context: {
      kind: "digital_twin_telemetry_binding",
      twinId: input.twinId,
      bindingId: input.bindingId,
      storesRawTelemetry: false,
      autoPublishEnabled: false,
      liveTelemetryBound: true,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: TELEMETRY_BINDING_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionTelemetryBindingReview(input: {
  instance: EngineeringWorkflowInstance;
  action: TelemetryBindingReviewAction;
  to: TelemetryBindingReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: TELEMETRY_BINDING_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}
