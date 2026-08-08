/**
 * Phase 11M — Organizational Learning orchestration extracted from ProjectControlsEngine.
 */

import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import {
  createProjectControlsEvent,
  organizationalLearningEventPayload,
  type ProjectControlsEventPublishPort,
} from "./events";
import type {
  PersistedOrganizationalLearningEvidence,
  ProjectControlsRepositoryPort,
} from "./persistence";
import type {
  OrganizationalLearningAssessmentState,
  OrganizationalLearningControlContext,
  OrganizationalLearningReviewRecord,
} from "./organizational-learning";
import {
  createOrganizationalLearningIntelligenceEngine,
  type ProjectControlsOrganizationalLearningEngine,
} from "./organizational-learning-engine";
import {
  assertOrganizationalLearningPublishable,
  startOrganizationalLearningReview,
  transitionOrganizationalLearningReview,
  type OrganizationalLearningReviewAction,
  type OrganizationalLearningReviewTargetState,
} from "./review-workflow";
import type { ProjectControlsRole } from "./role-matrix";
import type { SharedProjectDomainPort } from "@rtb/engineering-shared-project-domain";
import { requireProjectReference } from "@rtb/engineering-shared-project-domain";
import { organizationalLearningStateKey } from "./organizational-learning";

const ORGANIZATIONAL_LEARNING_SOURCE_KEY =
  "project_controls.organizational_learning_intelligence" as const;

export type AssessOrganizationalLearningCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: OrganizationalLearningControlContext;
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

export type AssessOrganizationalLearningResult = {
  state: OrganizationalLearningAssessmentState;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: OrganizationalLearningReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay: false;
  projectIdentityMutated: false;
  autoExecutionEnabled: false;
  mutatesUpstreamContributors: false;
  fabricatedLesson: false;
  unsupportedSimilarityScore: false;
  knowledgeMutationClaimed: false;
};

export type ReviewOrganizationalLearningCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  organizationalLearningStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: OrganizationalLearningReviewAction;
  to: OrganizationalLearningReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewOrganizationalLearningResult = {
  state: OrganizationalLearningAssessmentState;
  review: OrganizationalLearningReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
  learningApprovalClaimed: false;
  fabricatedLesson: false;
};

export type OrganizationalLearningOrchestrationDeps = {
  projectDomainPort: SharedProjectDomainPort;
  repository: ProjectControlsRepositoryPort;
  events: ProjectControlsEventPublishPort;
  organizationalLearningEngine?: ProjectControlsOrganizationalLearningEngine;
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

export function createOrganizationalLearningOrchestration(deps: OrganizationalLearningOrchestrationDeps) {
  const organizationalLearningEngine =
    deps.organizationalLearningEngine ??
    createOrganizationalLearningIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });

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

  async function emitOrganizationalLearningState(
    eventType:
      | "engineering.project.organizationalLearning.updated"
      | "engineering.project.organizationalLearning.reviewed"
      | "engineering.project.organizationalLearning.published",
    state: OrganizationalLearningAssessmentState,
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
        payload: organizationalLearningEventPayload(state),
      }),
    );
  }

  return {
    async assessOrganizationalLearning(
      command: AssessOrganizationalLearningCommand,
    ): Promise<AssessOrganizationalLearningResult> {
      const reference = await resolveProject(command);
      const asOf = command.asOf ?? new Date().toISOString();
      const scope = command.controlContext.scope;
      const organizationalLearningUnitId = command.controlContext.organizationalLearningUnitId;

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
        explainability,
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
        deps.repository.listExplainabilityStates(
          command.tenantId,
          command.workspaceId,
          reference.projectId,
        ),
      ]);

      const previous = await deps.repository.latestOrganizationalLearningState(
        command.tenantId,
        command.workspaceId,
        scope,
        organizationalLearningUnitId,
      );
      const version = await deps.repository.nextOrganizationalLearningStateVersion(
        command.tenantId,
        command.workspaceId,
        scope,
        organizationalLearningUnitId,
        command.expectedVersion,
      );

      const outcome = organizationalLearningEngine.assess({
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
        explainability,
        version,
        asOf,
        narrative: command.narrative,
        createdBy: command.actorId,
        supersedesId: previous?.stateId,
        minimumContributorCount: command.minimumContributorCount,
      });

      let state = outcome.state;
      let workflowInstance: EngineeringWorkflowInstance | undefined;
      let review: OrganizationalLearningReviewRecord | undefined;

      if (!outcome.abstained && command.startReview !== false) {
        const started = startOrganizationalLearningReview({
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
          organizationalLearningStateId: state.stateId,
          workflowInstanceId: started.instance.instanceId,
          workflowState: started.instance.state,
          createdAt: started.review.createdAt,
          selfApproved: false,
          approvalAuthorityClaimed: false,
          learningApprovalClaimed: false,
          fabricatedLesson: false,
        };
      }

      const saved = await deps.repository.saveOrganizationalLearningState(state);
      const evidenceRows: PersistedOrganizationalLearningEvidence[] = outcome.state.evidenceRefs.map(
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
          organizationalLearningStateId: saved.stateId,
          recordedAt: asOf,
          createdBy: command.actorId,
          fabricatedLesson: false,
          unsupportedSimilarityScore: false,
          knowledgeMutationClaimed: false,
          autoExecutionClaimed: false,
          approvalAuthorityClaimed: false,
          learningApprovalClaimed: false,
          automaticKnowledgeMutationClaimed: false,
          earnedValueDerived: false,
          cpmDerived: false,
          financialPostingClaimed: false,
          registerMutationClaimed: false,
          mutatesUpstreamContributors: false,
        }),
      );
      if (evidenceRows.length > 0) {
        await deps.repository.saveOrganizationalLearningEvidence(evidenceRows);
      }
      await deps.repository.saveOrganizationalLearningConfidence({
        ...outcome.confidence,
        organizationalLearningStateId: saved.stateId,
        recordedAt: asOf,
      });
      if (review) await deps.repository.saveOrganizationalLearningReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: outcome.abstained ? "organizationalLearning_abstained" : "organizationalLearning_updated",
        eventType: "engineering.project.organizationalLearning.updated",
        recordedAt: asOf,
        actorId: command.actorId,
        detail: outcome.abstentionReason,
        sourceKey: ORGANIZATIONAL_LEARNING_SOURCE_KEY,
      });
      await emitOrganizationalLearningState(
        "engineering.project.organizationalLearning.updated",
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
        fabricatedLesson: false,
        unsupportedSimilarityScore: false,
        knowledgeMutationClaimed: false,
      };
    },

    async reviewOrganizationalLearning(
      command: ReviewOrganizationalLearningCommand,
    ): Promise<ReviewOrganizationalLearningResult> {
      const latest = await deps.repository.getOrganizationalLearningStateById(
        command.tenantId,
        command.workspaceId,
        command.organizationalLearningStateId,
      );
      if (!latest) throw new Error("organizationalLearning_state_not_found");

      const publish = command.publish === true && command.to === "published";
      let instance = transitionOrganizationalLearningReview({
        instance: command.workflowInstance,
        action: command.action,
        to: command.to,
      });
      if (publish) {
        assertOrganizationalLearningPublishable({
          workflowState: instance.state,
          reviewerId: command.reviewerId,
          assessedBy: latest.createdBy,
        });
        instance = transitionOrganizationalLearningReview({
          instance,
          action: "publish",
          to: "published",
        });
      }

      const nextStatus: OrganizationalLearningAssessmentState["status"] = publish
        ? "published"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "approved"
            ? "reviewed"
            : latest.status;

      const version = await deps.repository.nextOrganizationalLearningStateVersion(
        command.tenantId,
        command.workspaceId,
        latest.controlContext.scope,
        latest.controlContext.organizationalLearningUnitId,
      );

      const next: OrganizationalLearningAssessmentState = {
        ...latest,
        version,
        status: nextStatus,
        reviewedAt: command.asOf ?? new Date().toISOString(),
        publishedAt: publish ? (command.asOf ?? new Date().toISOString()) : latest.publishedAt,
        workflowInstanceId: instance.instanceId,
        supersedesId: latest.stateId,
        stateId: deps.repository.newId("pcolst"),
        id: deps.repository.newId("pcolst"),
      };

      const saved = await deps.repository.saveOrganizationalLearningState(next);
      const review: OrganizationalLearningReviewRecord = {
        reviewId: deps.repository.newId("pcolrev"),
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: command.projectId,
        organizationalLearningStateId: saved.stateId,
        workflowInstanceId: instance.instanceId,
        workflowState: instance.state,
        outcome: organizationalLearningReviewOutcomeFor(command.action),
        reviewerId: command.reviewerId,
        notes: command.notes,
        createdAt: command.asOf ?? new Date().toISOString(),
        completedAt: command.asOf ?? new Date().toISOString(),
        selfApproved: false,
        approvalAuthorityClaimed: false,
        learningApprovalClaimed: false,
        fabricatedLesson: false,
      };
      await deps.repository.saveOrganizationalLearningReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: publish ? "organizationalLearning_published" : "organizationalLearning_reviewed",
        eventType: publish
          ? "engineering.project.organizationalLearning.published"
          : "engineering.project.organizationalLearning.reviewed",
        recordedAt: command.asOf ?? new Date().toISOString(),
        actorId: command.reviewerId,
        sourceKey: ORGANIZATIONAL_LEARNING_SOURCE_KEY,
      });
      await emitOrganizationalLearningState(
        publish
          ? "engineering.project.organizationalLearning.published"
          : "engineering.project.organizationalLearning.reviewed",
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
        fabricatedLesson: false,
      };
    },

    async getLatestOrganizationalLearning(input: {
      tenantId: string;
      workspaceId: string;
      scope: OrganizationalLearningControlContext["scope"];
      organizationalLearningUnitId: string;
    }) {
      return deps.repository.latestOrganizationalLearningState(
        input.tenantId,
        input.workspaceId,
        input.scope,
        input.organizationalLearningUnitId,
      );
    },

    async listOrganizationalLearningHistory(input: {
      tenantId: string;
      workspaceId: string;
      projectId: string;
    }) {
      return deps.repository.listOrganizationalLearningStates(
        input.tenantId,
        input.workspaceId,
        input.projectId,
      );
    },

    latestPerOrganizationalLearningThread(states: readonly OrganizationalLearningAssessmentState[]) {
      const byThread = new Map<string, OrganizationalLearningAssessmentState>();
      for (const state of states) {
        const key = organizationalLearningStateKey(
          state.controlContext.scope,
          state.controlContext.organizationalLearningUnitId,
        );
        const existing = byThread.get(key);
        if (!existing || state.version > existing.version) byThread.set(key, state);
      }
      return [...byThread.values()];
    },
  };
}

function organizationalLearningReviewOutcomeFor(
  action: OrganizationalLearningReviewAction,
): OrganizationalLearningReviewRecord["outcome"] {
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
