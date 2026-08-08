/**
 * Phase 11L — Explainability orchestration extracted from ProjectControlsEngine.
 */

import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import {
  createProjectControlsEvent,
  explainabilityEventPayload,
  type ProjectControlsEventPublishPort,
} from "./events";
import type {
  PersistedExplainabilityEvidence,
  ProjectControlsRepositoryPort,
} from "./persistence";
import type {
  ExplainabilityAssessmentState,
  ExplainabilityControlContext,
  ExplainabilityReviewRecord,
} from "./explainability";
import {
  createExplainabilityIntelligenceEngine,
  type ProjectControlsExplainabilityIntelligenceEngine,
} from "./explainability-engine";
import {
  assertExplainabilityPublishable,
  startExplainabilityReview,
  transitionExplainabilityReview,
  type ExplainabilityReviewAction,
  type ExplainabilityReviewTargetState,
} from "./review-workflow";
import type { ProjectControlsRole } from "./role-matrix";
import type { SharedProjectDomainPort } from "@rtb/engineering-shared-project-domain";
import { requireProjectReference } from "@rtb/engineering-shared-project-domain";
import { explainabilityStateKey } from "./explainability";

const EXPLAINABILITY_SOURCE_KEY = "project_controls.explainability_intelligence" as const;

export type AssessExplainabilityCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ExplainabilityControlContext;
  actorRole: ProjectControlsRole;
  actorId?: string;
  narrative?: string;
  asOf?: string;
  expectedVersion?: number;
  idempotencyKey?: string;
  correlationId?: string;
  startReview?: boolean;
  minimumContributorCount?: number;
};

export type AssessExplainabilityResult = {
  state: ExplainabilityAssessmentState;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: ExplainabilityReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay: false;
  projectIdentityMutated: false;
  autoExecutionEnabled: false;
  mutatesUpstreamContributors: false;
  chainOfThoughtExposed: false;
  hiddenReasoningExposed: false;
  fabricatedProvenance: false;
};

export type ReviewExplainabilityCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  explainabilityStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: ExplainabilityReviewAction;
  to: ExplainabilityReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewExplainabilityResult = {
  state: ExplainabilityAssessmentState;
  review: ExplainabilityReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
  approvalAuthorityClaimed: false;
  chainOfThoughtExposed: false;
};

export type ExplainabilityOrchestrationDeps = {
  projectDomainPort: SharedProjectDomainPort;
  repository: ProjectControlsRepositoryPort;
  events: ProjectControlsEventPublishPort;
  explainabilityEngine?: ProjectControlsExplainabilityIntelligenceEngine;
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

export function createExplainabilityOrchestration(deps: ExplainabilityOrchestrationDeps) {
  const explainabilityEngine =
    deps.explainabilityEngine ??
    createExplainabilityIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });

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

  async function emitExplainabilityState(
    eventType:
      | "engineering.project.explainability.updated"
      | "engineering.project.explainability.reviewed"
      | "engineering.project.explainability.published",
    state: ExplainabilityAssessmentState,
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
        payload: explainabilityEventPayload(state),
      }),
    );
  }

  return {
    async assessExplainability(
      command: AssessExplainabilityCommand,
    ): Promise<AssessExplainabilityResult> {
      const reference = await resolveProject(command);
      const asOf = command.asOf ?? new Date().toISOString();
      const scope = command.controlContext.scope;
      const explainabilityUnitId = command.controlContext.explainabilityUnitId;

      const [
        progress,
        schedule,
        change,
        cost,
        productivity,
        forecast,
        decision,
        scenario,
        riskOpportunity,
        assurance,
      ] = await Promise.all([
        deps.repository.listProgressAssessments(
          command.tenantId,
          command.workspaceId,
          reference.projectId,
        ),
        deps.repository.listScheduleAssessments(
          command.tenantId,
          command.workspaceId,
          reference.projectId,
        ),
        deps.repository.listChangeStates(
          command.tenantId,
          command.workspaceId,
          reference.projectId,
        ),
        deps.repository.listCostStates(command.tenantId, command.workspaceId, reference.projectId),
        deps.repository.listProductivityStates(
          command.tenantId,
          command.workspaceId,
          reference.projectId,
        ),
        deps.repository.listForecastStates(
          command.tenantId,
          command.workspaceId,
          reference.projectId,
        ),
        deps.repository.listDecisionStates(
          command.tenantId,
          command.workspaceId,
          reference.projectId,
        ),
        deps.repository.listScenarioStates(
          command.tenantId,
          command.workspaceId,
          reference.projectId,
        ),
        deps.repository.listRiskOpportunityStates(
          command.tenantId,
          command.workspaceId,
          reference.projectId,
        ),
        deps.repository.listAssuranceStates(
          command.tenantId,
          command.workspaceId,
          reference.projectId,
        ),
      ]);

      const previous = await deps.repository.latestExplainabilityState(
        command.tenantId,
        command.workspaceId,
        scope,
        explainabilityUnitId,
      );
      const version = await deps.repository.nextExplainabilityStateVersion(
        command.tenantId,
        command.workspaceId,
        scope,
        explainabilityUnitId,
        command.expectedVersion,
      );

      const outcome = explainabilityEngine.assess({
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
        decision,
        scenario,
        riskOpportunity,
        assurance,
        version,
        asOf,
        narrative: command.narrative,
        createdBy: command.actorId,
        supersedesId: previous?.stateId,
        minimumContributorCount: command.minimumContributorCount,
      });

      let state = outcome.state;
      let workflowInstance: EngineeringWorkflowInstance | undefined;
      let review: ExplainabilityReviewRecord | undefined;

      if (!outcome.abstained && command.startReview !== false) {
        const started = startExplainabilityReview({
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
          explainabilityStateId: state.stateId,
          workflowInstanceId: started.instance.instanceId,
          workflowState: started.instance.state,
          createdAt: started.review.createdAt,
          selfApproved: false,
          approvalAuthorityClaimed: false,
          verificationClaimed: false,
          chainOfThoughtExposed: false,
        };
      }

      const saved = await deps.repository.saveExplainabilityState(state);
      const evidenceRows: PersistedExplainabilityEvidence[] = outcome.state.evidenceRefs.map(
        (ref) => ({
          evidenceId: ref.evidenceRefId,
          kind: ref.kind,
          sourceType: ref.sourceType,
          sourceRef: ref.sourceRef,
          sourceKey: ref.sourceKey,
          provenance: ref.provenance,
          reviewStatus: ref.reviewStatus ?? "reviewed",
          observedAt: ref.observedAt,
          tenantId: command.tenantId,
          workspaceId: command.workspaceId,
          projectId: reference.projectId,
          explainabilityStateId: saved.stateId,
          recordedAt: asOf,
          createdBy: command.actorId,
          chainOfThoughtExposed: false,
          hiddenReasoningExposed: false,
          fabricatedProvenance: false,
          autoExecutionClaimed: false,
          approvalAuthorityClaimed: false,
          verificationClaimed: false,
          automaticEvidenceCreationClaimed: false,
          earnedValueDerived: false,
          cpmDerived: false,
          financialPostingClaimed: false,
          registerMutationClaimed: false,
          mutatesUpstreamContributors: false,
        }),
      );
      if (evidenceRows.length > 0) {
        await deps.repository.saveExplainabilityEvidence(evidenceRows);
      }
      await deps.repository.saveExplainabilityConfidence({
        ...outcome.confidence,
        explainabilityStateId: saved.stateId,
        recordedAt: asOf,
      });
      if (review) await deps.repository.saveExplainabilityReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: outcome.abstained ? "explainability_abstained" : "explainability_updated",
        eventType: "engineering.project.explainability.updated",
        recordedAt: asOf,
        actorId: command.actorId,
        detail: outcome.abstentionReason,
        sourceKey: EXPLAINABILITY_SOURCE_KEY,
      });
      await emitExplainabilityState(
        "engineering.project.explainability.updated",
        saved,
        command.correlationId,
      );

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
        chainOfThoughtExposed: false,
        hiddenReasoningExposed: false,
        fabricatedProvenance: false,
      };
    },

    async reviewExplainability(
      command: ReviewExplainabilityCommand,
    ): Promise<ReviewExplainabilityResult> {
      const latest = await deps.repository.getExplainabilityStateById(
        command.tenantId,
        command.workspaceId,
        command.explainabilityStateId,
      );
      if (!latest) throw new Error("explainability_state_not_found");

      const publish = command.publish === true && command.to === "published";
      let instance = transitionExplainabilityReview({
        instance: command.workflowInstance,
        action: command.action,
        to: command.to,
      });
      if (publish) {
        assertExplainabilityPublishable({
          workflowState: instance.state,
          reviewerId: command.reviewerId,
          assessedBy: latest.createdBy,
        });
        instance = transitionExplainabilityReview({
          instance,
          action: "publish",
          to: "published",
        });
      }

      const nextStatus: ExplainabilityAssessmentState["status"] = publish
        ? "published"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "approved"
            ? "reviewed"
            : latest.status;

      const version = await deps.repository.nextExplainabilityStateVersion(
        command.tenantId,
        command.workspaceId,
        latest.controlContext.scope,
        latest.controlContext.explainabilityUnitId,
      );

      const next: ExplainabilityAssessmentState = {
        ...latest,
        version,
        status: nextStatus,
        reviewedAt: command.asOf ?? new Date().toISOString(),
        publishedAt: publish ? (command.asOf ?? new Date().toISOString()) : latest.publishedAt,
        workflowInstanceId: instance.instanceId,
        supersedesId: latest.stateId,
        stateId: deps.repository.newId("pcexst"),
        id: deps.repository.newId("pcexst"),
      };

      const saved = await deps.repository.saveExplainabilityState(next);
      const review: ExplainabilityReviewRecord = {
        reviewId: deps.repository.newId("pcexrev"),
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: command.projectId,
        explainabilityStateId: saved.stateId,
        workflowInstanceId: instance.instanceId,
        workflowState: instance.state,
        outcome: explainabilityReviewOutcomeFor(command.action),
        reviewerId: command.reviewerId,
        notes: command.notes,
        createdAt: command.asOf ?? new Date().toISOString(),
        completedAt: command.asOf ?? new Date().toISOString(),
        selfApproved: false,
        approvalAuthorityClaimed: false,
        verificationClaimed: false,
        chainOfThoughtExposed: false,
      };
      await deps.repository.saveExplainabilityReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: publish ? "explainability_published" : "explainability_reviewed",
        eventType: publish
          ? "engineering.project.explainability.published"
          : "engineering.project.explainability.reviewed",
        recordedAt: command.asOf ?? new Date().toISOString(),
        actorId: command.reviewerId,
        sourceKey: EXPLAINABILITY_SOURCE_KEY,
      });
      await emitExplainabilityState(
        publish
          ? "engineering.project.explainability.published"
          : "engineering.project.explainability.reviewed",
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
        chainOfThoughtExposed: false,
      };
    },

    async getLatestExplainability(input: {
      tenantId: string;
      workspaceId: string;
      scope: ExplainabilityControlContext["scope"];
      explainabilityUnitId: string;
    }) {
      return deps.repository.latestExplainabilityState(
        input.tenantId,
        input.workspaceId,
        input.scope,
        input.explainabilityUnitId,
      );
    },

    async listExplainabilityHistory(input: {
      tenantId: string;
      workspaceId: string;
      projectId: string;
    }) {
      return deps.repository.listExplainabilityStates(
        input.tenantId,
        input.workspaceId,
        input.projectId,
      );
    },

    latestPerExplainabilityThread(states: readonly ExplainabilityAssessmentState[]) {
      const byThread = new Map<string, ExplainabilityAssessmentState>();
      for (const state of states) {
        const key = explainabilityStateKey(
          state.controlContext.scope,
          state.controlContext.explainabilityUnitId,
        );
        const existing = byThread.get(key);
        if (!existing || state.version > existing.version) byThread.set(key, state);
      }
      return [...byThread.values()];
    },
  };
}

function explainabilityReviewOutcomeFor(
  action: ExplainabilityReviewAction,
): ExplainabilityReviewRecord["outcome"] {
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
