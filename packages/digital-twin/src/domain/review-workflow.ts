/**
 * Phase 12B — Digital Twin identity review workflow.
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
import { AUTONOMOUS_TWIN_STATE_PUBLICATION_ALLOWED, DIGITAL_TWIN_IDENTITY_REVIEW_SLUG } from "../version";

export const IDENTITY_REVIEW_WORKFLOW_SLUG = DIGITAL_TWIN_IDENTITY_REVIEW_SLUG;

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

export function assertIdentityPublishable(input: {
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
