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
import {
  AUTONOMOUS_CHANGE_PUBLICATION_ALLOWED,
  AUTONOMOUS_COST_PUBLICATION_ALLOWED,
  AUTONOMOUS_PRODUCTIVITY_PUBLICATION_ALLOWED,
  AUTONOMOUS_PROGRESS_PUBLICATION_ALLOWED,
  AUTONOMOUS_SCHEDULE_PUBLICATION_ALLOWED,
  CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED,
} from "../version";

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

// ---------------------------------------------------------------------------
// Schedule review (Phase 11C)
// ---------------------------------------------------------------------------

export const SCHEDULE_REVIEW_WORKFLOW_SLUG = "project_controls.schedule_review" as const;

export const SCHEDULE_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: SCHEDULE_REVIEW_WORKFLOW_SLUG,
  displayName: "Project Controls Schedule Review",
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

export const SCHEDULE_REVIEW_ENTITY_TYPE = "project_controls_schedule_assessment" as const;

export type ScheduleReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type ScheduleReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startScheduleReview(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: SCHEDULE_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: SCHEDULE_REVIEW_ENTITY_TYPE,
    entityId: input.assessmentStateId,
    startedBy: input.startedBy,
    context: {
      kind: "schedule_intelligence",
      projectId: input.projectId,
      advisoryOnly: true,
      criticalPathComputed: false,
      floatComputed: false,
      earnedValueComputed: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: SCHEDULE_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionScheduleReview(input: {
  instance: EngineeringWorkflowInstance;
  action: ScheduleReviewAction;
  to: ScheduleReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: SCHEDULE_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function assertSchedulePublishable(input: {
  workflowState: string;
  reviewerId?: string;
  assessedBy?: string;
}): void {
  if (AUTONOMOUS_SCHEDULE_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_schedule_publication_forbidden");
  }
  if (input.workflowState !== "approved") {
    throw new Error("schedule_publish_requires_approved_review");
  }
  if (!input.reviewerId) {
    throw new Error("schedule_publish_requires_reviewer");
  }
  if (input.assessedBy && input.assessedBy === input.reviewerId) {
    throw new Error("schedule_self_approval_forbidden");
  }
}

// ---------------------------------------------------------------------------
// Change review (Phase 11D)
// ---------------------------------------------------------------------------

/**
 * Reviewing a change *assessment* decides whether the intelligence is fit to
 * publish. Assessment approval is not contractual approval of the underlying change: that
 * authority sits outside Project Controls and no transition in this workflow
 * can confer it.
 */
export const CHANGE_REVIEW_WORKFLOW_SLUG = "project_controls.change_review" as const;

export const CHANGE_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: CHANGE_REVIEW_WORKFLOW_SLUG,
  displayName: "Project Controls Change Assessment Review",
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

export const CHANGE_REVIEW_ENTITY_TYPE = "project_controls_change_assessment" as const;

export type ChangeReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type ChangeReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startChangeReview(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: CHANGE_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: CHANGE_REVIEW_ENTITY_TYPE,
    entityId: input.assessmentStateId,
    startedBy: input.startedBy,
    context: {
      kind: "change_intelligence",
      projectId: input.projectId,
      advisoryOnly: true,
      contractualApprovalClaimed: false,
      contractualAuthorityClaimed: false,
      earnedValueComputed: false,
      criticalPathComputed: false,
      financialPostingPerformed: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: CHANGE_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionChangeReview(input: {
  instance: EngineeringWorkflowInstance;
  action: ChangeReviewAction;
  to: ChangeReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: CHANGE_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

/**
 * Gate for publishing a change assessment.
 *
 * Workflow approval publishes intelligence only. Any caller that claims the
 * review conferred contractual approval is rejected outright.
 */
export function assertChangePublishable(input: {
  workflowState: string;
  reviewerId?: string;
  assessedBy?: string;
  contractualApprovalClaimed?: boolean;
}): void {
  if (AUTONOMOUS_CHANGE_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_change_publication_forbidden");
  }
  if (CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED) {
    throw new Error("contractual_change_approval_by_ai_forbidden");
  }
  if (input.contractualApprovalClaimed === true) {
    throw new Error("change_assessment_approval_is_not_contractual_approval");
  }
  if (input.workflowState !== "approved") {
    throw new Error("change_publish_requires_approved_review");
  }
  if (!input.reviewerId) {
    throw new Error("change_publish_requires_reviewer");
  }
  if (input.assessedBy && input.assessedBy === input.reviewerId) {
    throw new Error("change_self_approval_forbidden");
  }
}

// ---------------------------------------------------------------------------
// Cost review (Phase 11E)
// ---------------------------------------------------------------------------

export const COST_REVIEW_WORKFLOW_SLUG = "project_controls.cost_review" as const;

export const COST_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: COST_REVIEW_WORKFLOW_SLUG,
  displayName: "Project Controls Cost Assessment Review",
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

export const COST_REVIEW_ENTITY_TYPE = "project_controls_cost_assessment" as const;

export type CostReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type CostReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startCostReview(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: COST_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: COST_REVIEW_ENTITY_TYPE,
    entityId: input.assessmentStateId,
    startedBy: input.startedBy,
    context: {
      kind: "cost_intelligence",
      projectId: input.projectId,
      advisoryOnly: true,
      earnedValueComputed: false,
      financialPostingPerformed: false,
      budgetMutated: false,
      forecastProduced: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: COST_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionCostReview(input: {
  instance: EngineeringWorkflowInstance;
  action: CostReviewAction;
  to: CostReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: COST_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function assertCostPublishable(input: {
  workflowState: string;
  reviewerId?: string;
  assessedBy?: string;
  financialPostingClaimed?: boolean;
}): void {
  if (AUTONOMOUS_COST_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_cost_publication_forbidden");
  }
  if (input.financialPostingClaimed === true) {
    throw new Error("cost_assessment_approval_is_not_financial_posting");
  }
  if (input.workflowState !== "approved") {
    throw new Error("cost_publish_requires_approved_review");
  }
  if (!input.reviewerId) {
    throw new Error("cost_publish_requires_reviewer");
  }
  if (input.assessedBy && input.assessedBy === input.reviewerId) {
    throw new Error("cost_self_approval_forbidden");
  }
}

// ---------------------------------------------------------------------------
// Productivity review (Phase 11F)
// ---------------------------------------------------------------------------

export const PRODUCTIVITY_REVIEW_WORKFLOW_SLUG = "project_controls.productivity_review" as const;

export const PRODUCTIVITY_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: PRODUCTIVITY_REVIEW_WORKFLOW_SLUG,
  displayName: "Project Controls Productivity Assessment Review",
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

export const PRODUCTIVITY_REVIEW_ENTITY_TYPE = "project_controls_productivity_assessment" as const;

export type ProductivityReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type ProductivityReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startProductivityReview(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: PRODUCTIVITY_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: PRODUCTIVITY_REVIEW_ENTITY_TYPE,
    entityId: input.assessmentStateId,
    startedBy: input.startedBy,
    context: {
      kind: "productivity_intelligence",
      projectId: input.projectId,
      advisoryOnly: true,
      workforceManagementPerformed: false,
      timesheetProcessed: false,
      payrollProcessed: false,
      labourProductivityPercentComputed: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: PRODUCTIVITY_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionProductivityReview(input: {
  instance: EngineeringWorkflowInstance;
  action: ProductivityReviewAction;
  to: ProductivityReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: PRODUCTIVITY_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function assertProductivityPublishable(input: {
  workflowState: string;
  reviewerId?: string;
  assessedBy?: string;
  workforceManagementClaimed?: boolean;
}): void {
  if (AUTONOMOUS_PRODUCTIVITY_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_productivity_publication_forbidden");
  }
  if (input.workforceManagementClaimed === true) {
    throw new Error("productivity_assessment_approval_is_not_workforce_management");
  }
  if (input.workflowState !== "approved") {
    throw new Error("productivity_publish_requires_approved_review");
  }
  if (!input.reviewerId) {
    throw new Error("productivity_publish_requires_reviewer");
  }
  if (input.assessedBy && input.assessedBy === input.reviewerId) {
    throw new Error("productivity_self_approval_forbidden");
  }
}
