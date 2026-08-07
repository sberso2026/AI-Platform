/**
 * Phase 11B — Project Controls progress review workflow.
 *
 * Mirrors the Asset Intelligence lifecycle review pattern: a single
 * `EngineeringWorkflowDefinition` from the `@rtb/engineering-os` Workflow SDK,
 * a `start*` helper that submits straight to `pending_review`, and a
 * `transition*` helper for reviewer actions.
 *
 * Nothing is published without a human transition — advisory progress may never
 * self-approve.
 */

import {
  createReviewRecord,
  createWorkflowInstance,
  transitionWorkflowInstance,
  type EngineeringReviewRecord,
  type EngineeringWorkflowDefinition,
  type EngineeringWorkflowInstance,
} from "@rtb/engineering-os";
import { AUTONOMOUS_PROGRESS_PUBLICATION_ALLOWED } from "../version";

export const PROGRESS_REVIEW_WORKFLOW_SLUG = "project_controls.progress_review" as const;

export const PROGRESS_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: PROGRESS_REVIEW_WORKFLOW_SLUG,
  displayName: "Project Controls Progress Review",
  moduleKey: "project_controls",
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

export const PROGRESS_REVIEW_ENTITY_TYPE = "project_controls_progress_assessment" as const;

export type ProgressReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type ProgressReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startProgressReview(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: PROGRESS_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: PROGRESS_REVIEW_ENTITY_TYPE,
    entityId: input.assessmentStateId,
    startedBy: input.startedBy,
    context: {
      kind: "progress_intelligence",
      projectId: input.projectId,
      advisoryOnly: true,
      earnedValueComputed: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: PROGRESS_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionProgressReview(input: {
  instance: EngineeringWorkflowInstance;
  action: ProgressReviewAction;
  to: ProgressReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: PROGRESS_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

/**
 * A published assessment must have travelled through an approved review. The
 * engine calls this before it flips `status` to `published`.
 */
export function assertPublishable(input: {
  workflowState: string;
  reviewerId?: string;
  assessedBy?: string;
}): void {
  if (AUTONOMOUS_PROGRESS_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_progress_publication_forbidden");
  }
  if (input.workflowState !== "approved") {
    throw new Error("progress_publish_requires_approved_review");
  }
  if (!input.reviewerId) {
    throw new Error("progress_publish_requires_reviewer");
  }
  if (input.assessedBy && input.assessedBy === input.reviewerId) {
    throw new Error("progress_self_approval_forbidden");
  }
}
