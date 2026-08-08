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
  AUTONOMOUS_FORECAST_PUBLICATION_ALLOWED,
  AUTONOMOUS_DECISION_PUBLICATION_ALLOWED,
  AUTONOMOUS_SCENARIO_PUBLICATION_ALLOWED,
  AUTONOMOUS_RISK_OPPORTUNITY_PUBLICATION_ALLOWED,
  AUTONOMOUS_ASSURANCE_PUBLICATION_ALLOWED,
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

// ---------------------------------------------------------------------------
// Forecast review (Phase 11G)
// ---------------------------------------------------------------------------

export const FORECAST_REVIEW_WORKFLOW_SLUG = "project_controls.forecast_review" as const;

export const FORECAST_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: FORECAST_REVIEW_WORKFLOW_SLUG,
  displayName: "Project Controls Forecast Assessment Review",
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

export const FORECAST_REVIEW_ENTITY_TYPE = "project_controls_forecast_assessment" as const;

export type ForecastReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type ForecastReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startForecastReview(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: FORECAST_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: FORECAST_REVIEW_ENTITY_TYPE,
    entityId: input.assessmentStateId,
    startedBy: input.startedBy,
    context: {
      kind: "forecast_intelligence",
      projectId: input.projectId,
      advisoryOnly: true,
      completionDatePredicted: false,
      costForecastComputed: false,
      mutatesUpstreamContributors: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: FORECAST_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionForecastReview(input: {
  instance: EngineeringWorkflowInstance;
  action: ForecastReviewAction;
  to: ForecastReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: FORECAST_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function assertForecastPublishable(input: {
  workflowState: string;
  reviewerId?: string;
  assessedBy?: string;
  completionDateClaimed?: boolean;
}): void {
  if (AUTONOMOUS_FORECAST_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_forecast_publication_forbidden");
  }
  if (input.completionDateClaimed === true) {
    throw new Error("forecast_assessment_approval_is_not_completion_date_prediction");
  }
  if (input.workflowState !== "approved") {
    throw new Error("forecast_publish_requires_approved_review");
  }
  if (!input.reviewerId) {
    throw new Error("forecast_publish_requires_reviewer");
  }
  if (input.assessedBy && input.assessedBy === input.reviewerId) {
    throw new Error("forecast_self_approval_forbidden");
  }
}

// ---------------------------------------------------------------------------
// Decision review (Phase 11H)
// ---------------------------------------------------------------------------

export const DECISION_REVIEW_WORKFLOW_SLUG = "project_controls.decision_review" as const;

export const DECISION_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: DECISION_REVIEW_WORKFLOW_SLUG,
  displayName: "Project Controls Decision Support Review",
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

export const DECISION_REVIEW_ENTITY_TYPE = "project_controls_decision_assessment" as const;

export type DecisionReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type DecisionReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startDecisionReview(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: DECISION_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: DECISION_REVIEW_ENTITY_TYPE,
    entityId: input.assessmentStateId,
    startedBy: input.startedBy,
    context: {
      kind: "decision_support",
      projectId: input.projectId,
      advisoryOnly: true,
      autoExecutionEnabled: false,
      approvalAuthorityClaimed: false,
      mutatesUpstreamContributors: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: DECISION_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionDecisionReview(input: {
  instance: EngineeringWorkflowInstance;
  action: DecisionReviewAction;
  to: DecisionReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: DECISION_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function assertDecisionPublishable(input: {
  workflowState: string;
  reviewerId?: string;
  assessedBy?: string;
  approvalAuthorityClaimed?: boolean;
}): void {
  if (AUTONOMOUS_DECISION_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_decision_publication_forbidden");
  }
  if (input.approvalAuthorityClaimed === true) {
    throw new Error("decision_assessment_approval_is_not_project_or_contract_approval");
  }
  if (input.workflowState !== "approved") {
    throw new Error("decision_publish_requires_approved_review");
  }
  if (!input.reviewerId) {
    throw new Error("decision_publish_requires_reviewer");
  }
  if (input.assessedBy && input.assessedBy === input.reviewerId) {
    throw new Error("decision_self_approval_forbidden");
  }
}

// ---------------------------------------------------------------------------
// Scenario review (Phase 11I)
// ---------------------------------------------------------------------------

export const SCENARIO_REVIEW_WORKFLOW_SLUG = "project_controls.scenario_review" as const;

export const SCENARIO_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: SCENARIO_REVIEW_WORKFLOW_SLUG,
  displayName: "Project Controls Scenario Intelligence Review",
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

export const SCENARIO_REVIEW_ENTITY_TYPE = "project_controls_scenario_assessment" as const;

export type ScenarioReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type ScenarioReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startScenarioReview(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: SCENARIO_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: SCENARIO_REVIEW_ENTITY_TYPE,
    entityId: input.assessmentStateId,
    startedBy: input.startedBy,
    context: {
      kind: "scenario_intelligence",
      projectId: input.projectId,
      advisoryOnly: true,
      autoExecutionEnabled: false,
      approvalAuthorityClaimed: false,
      preferredScenarioSelected: false,
      optimisationPerformed: false,
      mutatesUpstreamContributors: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: SCENARIO_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionScenarioReview(input: {
  instance: EngineeringWorkflowInstance;
  action: ScenarioReviewAction;
  to: ScenarioReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: SCENARIO_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function assertScenarioPublishable(input: {
  workflowState: string;
  reviewerId?: string;
  assessedBy?: string;
  approvalAuthorityClaimed?: boolean;
}): void {
  if (AUTONOMOUS_SCENARIO_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_scenario_publication_forbidden");
  }
  if (input.approvalAuthorityClaimed === true) {
    throw new Error("scenario_assessment_approval_is_not_project_or_contract_approval");
  }
  if (input.workflowState !== "approved") {
    throw new Error("scenario_publish_requires_approved_review");
  }
  if (!input.reviewerId) {
    throw new Error("scenario_publish_requires_reviewer");
  }
  if (input.assessedBy && input.assessedBy === input.reviewerId) {
    throw new Error("scenario_self_approval_forbidden");
  }
}

// ---------------------------------------------------------------------------
// Risk & Opportunity review (Phase 11J)
// ---------------------------------------------------------------------------

export const RISK_OPPORTUNITY_REVIEW_WORKFLOW_SLUG =
  "project_controls.risk_opportunity_review" as const;

export const RISK_OPPORTUNITY_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: RISK_OPPORTUNITY_REVIEW_WORKFLOW_SLUG,
  displayName: "Project Controls Risk & Opportunity Intelligence Review",
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

export const RISK_OPPORTUNITY_REVIEW_ENTITY_TYPE =
  "project_controls_risk_opportunity_assessment" as const;

export type RiskOpportunityReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type RiskOpportunityReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startRiskOpportunityReview(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: RISK_OPPORTUNITY_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: RISK_OPPORTUNITY_REVIEW_ENTITY_TYPE,
    entityId: input.assessmentStateId,
    startedBy: input.startedBy,
    context: {
      kind: "risk_opportunity_intelligence",
      projectId: input.projectId,
      advisoryOnly: true,
      autoExecutionEnabled: false,
      approvalAuthorityClaimed: false,
      riskRegisterMutated: false,
      opportunityRegisterMutated: false,
      ownerAssignmentPerformed: false,
      treatmentExecutionPerformed: false,
      duplicateRiskOwnershipDetected: false,
      mutatesUpstreamContributors: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: RISK_OPPORTUNITY_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionRiskOpportunityReview(input: {
  instance: EngineeringWorkflowInstance;
  action: RiskOpportunityReviewAction;
  to: RiskOpportunityReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: RISK_OPPORTUNITY_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function assertRiskOpportunityPublishable(input: {
  workflowState: string;
  reviewerId?: string;
  assessedBy?: string;
  approvalAuthorityClaimed?: boolean;
}): void {
  if (AUTONOMOUS_RISK_OPPORTUNITY_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_risk_opportunity_publication_forbidden");
  }
  if (input.approvalAuthorityClaimed === true) {
    throw new Error("risk_opportunity_assessment_approval_is_not_register_approval");
  }
  if (input.workflowState !== "approved") {
    throw new Error("risk_opportunity_publish_requires_approved_review");
  }
  if (!input.reviewerId) {
    throw new Error("risk_opportunity_publish_requires_reviewer");
  }
  if (input.assessedBy && input.assessedBy === input.reviewerId) {
    throw new Error("risk_opportunity_self_approval_forbidden");
  }
}

// ---------------------------------------------------------------------------
// Assurance review (Phase 11K)
// ---------------------------------------------------------------------------

export const ASSURANCE_REVIEW_WORKFLOW_SLUG = "project_controls.assurance_review" as const;

export const ASSURANCE_REVIEW_WORKFLOW: EngineeringWorkflowDefinition = {
  slug: ASSURANCE_REVIEW_WORKFLOW_SLUG,
  displayName: "Project Controls Assurance Intelligence Review",
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

export const ASSURANCE_REVIEW_ENTITY_TYPE = "project_controls_assurance_assessment" as const;

export type AssuranceReviewAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "resubmit"
  | "publish";
export type AssuranceReviewTargetState =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "pending_review"
  | "published";

export function startAssuranceReview(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  startedBy?: string;
}): { instance: EngineeringWorkflowInstance; review: EngineeringReviewRecord } {
  const instance = createWorkflowInstance({
    definition: ASSURANCE_REVIEW_WORKFLOW,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: ASSURANCE_REVIEW_ENTITY_TYPE,
    entityId: input.assessmentStateId,
    startedBy: input.startedBy,
    context: {
      kind: "assurance_intelligence",
      projectId: input.projectId,
      advisoryOnly: true,
      autoExecutionEnabled: false,
      approvalAuthorityClaimed: false,
      certificationClaimed: false,
      verificationClaimed: false,
      evidenceApprovalClaimed: false,
      duplicateAssuranceOwnershipDetected: false,
      mutatesUpstreamContributors: false,
    },
  });
  const submitted = transitionWorkflowInstance({
    instance,
    definition: ASSURANCE_REVIEW_WORKFLOW,
    action: "submit",
    to: "pending_review",
  });
  const review = createReviewRecord({ instanceId: submitted.instanceId });
  return { instance: submitted, review };
}

export function transitionAssuranceReview(input: {
  instance: EngineeringWorkflowInstance;
  action: AssuranceReviewAction;
  to: AssuranceReviewTargetState;
}): EngineeringWorkflowInstance {
  return transitionWorkflowInstance({
    instance: input.instance,
    definition: ASSURANCE_REVIEW_WORKFLOW,
    action: input.action,
    to: input.to,
  });
}

export function assertAssurancePublishable(input: {
  workflowState: string;
  reviewerId?: string;
  assessedBy?: string;
  approvalAuthorityClaimed?: boolean;
  certificationClaimed?: boolean;
}): void {
  if (AUTONOMOUS_ASSURANCE_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_assurance_publication_forbidden");
  }
  if (input.approvalAuthorityClaimed === true || input.certificationClaimed === true) {
    throw new Error("assurance_assessment_is_not_certification_or_approval");
  }
  if (input.workflowState !== "approved") {
    throw new Error("assurance_publish_requires_approved_review");
  }
  if (!input.reviewerId) {
    throw new Error("assurance_publish_requires_reviewer");
  }
  if (input.assessedBy && input.assessedBy === input.reviewerId) {
    throw new Error("assurance_self_approval_forbidden");
  }
}
