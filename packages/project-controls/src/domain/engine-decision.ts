/**
 * Phase 11H — Decision orchestration extracted from ProjectControlsEngine.
 */

import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import {
  createProjectControlsEvent,
  decisionEventPayload,
  type ProjectControlsEventPublishPort,
} from "./events";
import type {
  PersistedDecisionEvidence,
  ProjectControlsRepositoryPort,
} from "./persistence";
import type {
  DecisionAssessmentState,
  DecisionControlContext,
  DecisionReviewRecord,
} from "./decision";
import {
  createDecisionSupportEngine,
  type DecisionSupportEngine,
} from "./decision-engine";
import {
  assertDecisionPublishable,
  startDecisionReview,
  transitionDecisionReview,
  type DecisionReviewAction,
  type DecisionReviewTargetState,
} from "./review-workflow";
import type { ProjectControlsRole } from "./role-matrix";
import type { SharedProjectDomainPort } from "@rtb/engineering-shared-project-domain";
import { requireProjectReference } from "@rtb/engineering-shared-project-domain";
import { decisionStateKey } from "./decision";

const DECISION_SOURCE_KEY = "project_controls.decision_support" as const;

export type AssessDecisionCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: DecisionControlContext;
  actorRole: ProjectControlsRole;
  actorId?: string;
  narrative?: string;
  asOf?: string;
  expectedVersion?: number;
  idempotencyKey?: string;
  correlationId?: string;
  startReview?: boolean;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumContributorCount?: number;
};

export type AssessDecisionResult = {
  state: DecisionAssessmentState;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: DecisionReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay: boolean;
  projectIdentityMutated: false;
  autoExecutionEnabled: false;
  mutatesUpstreamContributors: false;
};

export type ReviewDecisionCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  decisionStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: DecisionReviewAction;
  to: DecisionReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewDecisionResult = {
  state: DecisionAssessmentState;
  review: DecisionReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
  approvalAuthorityClaimed: false;
};

export type DecisionOrchestrationDeps = {
  projectDomainPort: SharedProjectDomainPort;
  repository: ProjectControlsRepositoryPort;
  events: ProjectControlsEventPublishPort;
  decisionEngine?: DecisionSupportEngine;
  appendTimeline: (input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    stateId: string;
    kind: string;
    eventType: string;
    recordedAt: string;
    actorId?: string;
    detail?: string;
    sourceKey: string;
  }) => Promise<void>;
};

export function createDecisionOrchestration(deps: DecisionOrchestrationDeps) {
  const decisionEngine =
    deps.decisionEngine ??
    createDecisionSupportEngine({ newId: (p) => deps.repository.newId(p) });

  async function resolveProject(command: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
  }) {
    return requireProjectReference(deps.projectDomainPort, {
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: command.projectId,
    });
  }

  async function emitDecisionState(
    eventType:
      | "engineering.project.decision.updated"
      | "engineering.project.decision.reviewed"
      | "engineering.project.decision.published",
    state: DecisionAssessmentState,
    correlationId?: string,
  ) {
    await deps.events.publish(
      createProjectControlsEvent({
        eventType,
        tenantId: state.tenantId,
        workspaceId: state.workspaceId,
        projectId: state.projectId,
        stateId: state.stateId,
        occurredAt: state.recordedAt,
        correlationId,
        payload: decisionEventPayload(state),
      }),
    );
  }

  return {
    async assessDecision(command: AssessDecisionCommand): Promise<AssessDecisionResult> {
      const reference = await resolveProject(command);
      const asOf = command.asOf ?? new Date().toISOString();
      const scope = command.controlContext.scope;
      const decisionUnitId = command.controlContext.decisionUnitId;

      const [progress, schedule, change, cost, productivity, forecast] = await Promise.all([
        deps.repository.listProgressAssessments(command.tenantId, command.workspaceId, reference.projectId),
        deps.repository.listScheduleAssessments(command.tenantId, command.workspaceId, reference.projectId),
        deps.repository.listChangeStates(command.tenantId, command.workspaceId, reference.projectId),
        deps.repository.listCostStates(command.tenantId, command.workspaceId, reference.projectId),
        deps.repository.listProductivityStates(command.tenantId, command.workspaceId, reference.projectId),
        deps.repository.listForecastStates(command.tenantId, command.workspaceId, reference.projectId),
      ]);

      const previous = await deps.repository.latestDecisionState(
        command.tenantId,
        command.workspaceId,
        scope,
        decisionUnitId,
      );
      const version = await deps.repository.nextDecisionStateVersion(
        command.tenantId,
        command.workspaceId,
        scope,
        decisionUnitId,
        command.expectedVersion,
      );

      const outcome = decisionEngine.assess({
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        controlContext: command.controlContext,
        progress,
        schedule,
        change,
        cost,
        productivity,
        forecast,
        version,
        asOf,
        narrative: command.narrative,
        createdBy: command.actorId,
        supersedesId: previous?.stateId,
        freshnessHorizonHours: command.freshnessHorizonHours,
        sufficiencyThreshold: command.sufficiencyThreshold,
        minimumContributorCount: command.minimumContributorCount,
      });

      let state = outcome.state;
      let workflowInstance: EngineeringWorkflowInstance | undefined;
      let review: DecisionReviewRecord | undefined;

      if (!outcome.abstained && command.startReview !== false) {
        const started = startDecisionReview({
          tenantId: command.tenantId,
          workspaceId: command.workspaceId,
          projectId: reference.projectId,
          assessmentStateId: state.stateId,
          startedBy: command.actorId,
        });
        workflowInstance = started.instance;
        state = {
          ...state,
          status: "pending_review",
          workflowInstanceId: started.instance.instanceId,
        };
        review = {
          reviewId: started.review.reviewId,
          tenantId: command.tenantId,
          workspaceId: command.workspaceId,
          projectId: reference.projectId,
          decisionStateId: state.stateId,
          workflowInstanceId: started.instance.instanceId,
          workflowState: started.instance.state,
          createdAt: started.review.createdAt,
          selfApproved: false,
          approvalAuthorityClaimed: false,
        };
      }

      const saved = await deps.repository.saveDecisionState(state);
      const evidenceRows: PersistedDecisionEvidence[] = outcome.state.evidenceRefs.map((refId) => ({
        evidenceId: refId,
        kind: "composed_context_ref",
        sourceType: "project_context_composition",
        sourceRef: outcome.composedContext.contextId,
        sourceKey: "project_context_composition",
        provenance: "system_reference",
        reviewStatus: "published",
        observedAt: asOf,
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        decisionStateId: saved.stateId,
        recordedAt: asOf,
        createdBy: command.actorId,
        autoExecutionClaimed: false,
        scheduleExecutionClaimed: false,
        costExecutionClaimed: false,
        contractInstructionClaimed: false,
        approvalAuthorityClaimed: false,
        earnedValueDerived: false,
        cpmDerived: false,
        financialPostingClaimed: false,
        mutatesCoreRisk: false,
      }));
      if (evidenceRows.length > 0) {
        await deps.repository.saveDecisionEvidence(evidenceRows);
      }
      await deps.repository.saveDecisionConfidence({
        ...outcome.confidence,
        decisionStateId: saved.stateId,
        recordedAt: asOf,
      });
      if (review) await deps.repository.saveDecisionReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: outcome.abstained ? "decision_abstained" : "decision_updated",
        eventType: "engineering.project.decision.updated",
        recordedAt: asOf,
        actorId: command.actorId,
        detail: outcome.abstentionReason,
        sourceKey: DECISION_SOURCE_KEY,
      });
      await emitDecisionState("engineering.project.decision.updated", saved, command.correlationId);

      return {
        state: saved,
        workflowInstance,
        review,
        abstained: outcome.abstained,
        abstentionReason: outcome.abstentionReason,
        idempotentReplay: false,
        projectIdentityMutated: false,
        autoExecutionEnabled: false,
        mutatesUpstreamContributors: false,
      };
    },

    async reviewDecision(command: ReviewDecisionCommand): Promise<ReviewDecisionResult> {
      const latest = await deps.repository.getDecisionStateById(
        command.tenantId,
        command.workspaceId,
        command.decisionStateId,
      );
      if (!latest) throw new Error("decision_state_not_found");

      const publish = command.publish === true && command.to === "published";
      let instance = transitionDecisionReview({
        instance: command.workflowInstance,
        action: command.action,
        to: command.to,
      });
      if (publish) {
        assertDecisionPublishable({
          workflowState: instance.state,
          reviewerId: command.reviewerId,
          assessedBy: latest.createdBy,
        });
        instance = transitionDecisionReview({ instance, action: "publish", to: "published" });
      }

      const nextStatus: DecisionAssessmentState["status"] = publish
        ? "published"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "approved"
            ? "reviewed"
            : latest.status;

      const version = await deps.repository.nextDecisionStateVersion(
        command.tenantId,
        command.workspaceId,
        latest.controlContext.scope,
        latest.controlContext.decisionUnitId,
      );

      const next: DecisionAssessmentState = {
        ...latest,
        version,
        status: nextStatus,
        reviewedAt: command.asOf ?? new Date().toISOString(),
        publishedAt: publish ? (command.asOf ?? new Date().toISOString()) : latest.publishedAt,
        workflowInstanceId: instance.instanceId,
        supersedesId: latest.stateId,
        stateId: deps.repository.newId("pcdst"),
        id: deps.repository.newId("pcdst"),
      };

      const saved = await deps.repository.saveDecisionState(next);
      const review: DecisionReviewRecord = {
        reviewId: deps.repository.newId("pcdrev"),
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: command.projectId,
        decisionStateId: saved.stateId,
        workflowInstanceId: instance.instanceId,
        workflowState: instance.state,
        outcome: decisionReviewOutcomeFor(command.action),
        reviewerId: command.reviewerId,
        notes: command.notes,
        createdAt: command.asOf ?? new Date().toISOString(),
        completedAt: command.asOf ?? new Date().toISOString(),
        selfApproved: false,
        approvalAuthorityClaimed: false,
      };
      await deps.repository.saveDecisionReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: publish ? "decision_published" : "decision_reviewed",
        eventType: publish
          ? "engineering.project.decision.published"
          : "engineering.project.decision.reviewed",
        recordedAt: command.asOf ?? new Date().toISOString(),
        actorId: command.reviewerId,
        sourceKey: DECISION_SOURCE_KEY,
      });
      await emitDecisionState(
        publish ? "engineering.project.decision.published" : "engineering.project.decision.reviewed",
        saved,
        command.correlationId,
      );

      return {
        state: saved,
        review,
        workflowInstance: instance,
        published: publish,
        projectIdentityMutated: false,
        approvalAuthorityClaimed: false,
      };
    },

    async getLatestDecision(input: {
      tenantId: string;
      workspaceId: string;
      scope: DecisionControlContext["scope"];
      decisionUnitId: string;
    }) {
      return deps.repository.latestDecisionState(
        input.tenantId,
        input.workspaceId,
        input.scope,
        input.decisionUnitId,
      );
    },

    async listDecisionHistory(input: {
      tenantId: string;
      workspaceId: string;
      projectId: string;
    }) {
      return deps.repository.listDecisionStates(
        input.tenantId,
        input.workspaceId,
        input.projectId,
      );
    },

    latestPerDecisionThread(states: readonly DecisionAssessmentState[]) {
      const byThread = new Map<string, DecisionAssessmentState>();
      for (const state of states) {
        const key = decisionStateKey(state.controlContext.scope, state.controlContext.decisionUnitId);
        const existing = byThread.get(key);
        if (!existing || state.version > existing.version) byThread.set(key, state);
      }
      return [...byThread.values()];
    },
  };
}

function decisionReviewOutcomeFor(action: DecisionReviewAction): DecisionReviewRecord["outcome"] {
  switch (action) {
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "request_changes":
      return "changes_requested";
    case "resubmit":
      return "resubmitted";
    default:
      return undefined;
  }
}
