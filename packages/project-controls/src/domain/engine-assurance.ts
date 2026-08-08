/**
 * Phase 11K — Assurance orchestration extracted from ProjectControlsEngine.
 */

import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import {
  createProjectControlsEvent,
  assuranceEventPayload,
  type ProjectControlsEventPublishPort,
} from "./events";
import type {
  PersistedAssuranceEvidence,
  ProjectControlsRepositoryPort,
} from "./persistence";
import type {
  AssuranceAssessmentState,
  AssuranceControlContext,
  AssuranceReviewRecord,
} from "./assurance";
import {
  createAssuranceIntelligenceEngine,
  type ProjectControlsAssuranceIntelligenceEngine,
} from "./assurance-engine";
import {
  assertAssurancePublishable,
  startAssuranceReview,
  transitionAssuranceReview,
  type AssuranceReviewAction,
  type AssuranceReviewTargetState,
} from "./review-workflow";
import type { ProjectControlsRole } from "./role-matrix";
import type { SharedProjectDomainPort } from "@rtb/engineering-shared-project-domain";
import { requireProjectReference } from "@rtb/engineering-shared-project-domain";
import { assuranceStateKey } from "./assurance";

const ASSURANCE_SOURCE_KEY = "project_controls.assurance_intelligence" as const;

export type AssessAssuranceCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: AssuranceControlContext;
  actorRole: ProjectControlsRole;
  actorId?: string;
  narrative?: string;
  asOf?: string;
  expectedVersion?: number;
  idempotencyKey?: string;
  correlationId?: string;
  startReview?: boolean;
  freshnessHorizonHours?: number;
  minimumContributorCount?: number;
};

export type AssessAssuranceResult = {
  state: AssuranceAssessmentState;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: AssuranceReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay: false;
  projectIdentityMutated: false;
  autoExecutionEnabled: false;
  mutatesUpstreamContributors: false;
  certificationClaimed: false;
  verificationClaimed: false;
  evidenceApprovalClaimed: false;
};

export type ReviewAssuranceCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assuranceStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: AssuranceReviewAction;
  to: AssuranceReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewAssuranceResult = {
  state: AssuranceAssessmentState;
  review: AssuranceReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
  approvalAuthorityClaimed: false;
  certificationClaimed: false;
};

export type AssuranceOrchestrationDeps = {
  projectDomainPort: SharedProjectDomainPort;
  repository: ProjectControlsRepositoryPort;
  events: ProjectControlsEventPublishPort;
  assuranceEngine?: ProjectControlsAssuranceIntelligenceEngine;
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

export function createAssuranceOrchestration(deps: AssuranceOrchestrationDeps) {
  const assuranceEngine =
    deps.assuranceEngine ??
    createAssuranceIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });

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

  async function emitAssuranceState(
    eventType:
      | "engineering.project.assurance.updated"
      | "engineering.project.assurance.reviewed"
      | "engineering.project.assurance.published",
    state: AssuranceAssessmentState,
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
        payload: assuranceEventPayload(state),
      }),
    );
  }

  return {
    async assessAssurance(command: AssessAssuranceCommand): Promise<AssessAssuranceResult> {
      const reference = await resolveProject(command);
      const asOf = command.asOf ?? new Date().toISOString();
      const scope = command.controlContext.scope;
      const assuranceUnitId = command.controlContext.assuranceUnitId;

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
      ]);

      const previous = await deps.repository.latestAssuranceState(
        command.tenantId,
        command.workspaceId,
        scope,
        assuranceUnitId,
      );
      const version = await deps.repository.nextAssuranceStateVersion(
        command.tenantId,
        command.workspaceId,
        scope,
        assuranceUnitId,
        command.expectedVersion,
      );

      const outcome = assuranceEngine.assess({
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
        version,
        asOf,
        narrative: command.narrative,
        createdBy: command.actorId,
        supersedesId: previous?.stateId,
        freshnessHorizonHours: command.freshnessHorizonHours,
        minimumContributorCount: command.minimumContributorCount,
      });

      let state = outcome.state;
      let workflowInstance: EngineeringWorkflowInstance | undefined;
      let review: AssuranceReviewRecord | undefined;

      if (!outcome.abstained && command.startReview !== false) {
        const started = startAssuranceReview({
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
          assuranceStateId: state.stateId,
          workflowInstanceId: started.instance.instanceId,
          workflowState: started.instance.state,
          createdAt: started.review.createdAt,
          selfApproved: false,
          approvalAuthorityClaimed: false,
          certificationClaimed: false,
          verificationClaimed: false,
        };
      }

      const saved = await deps.repository.saveAssuranceState(state);
      const evidenceRows: PersistedAssuranceEvidence[] = outcome.state.evidenceRefs.map(
        (refId) => ({
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
          assuranceStateId: saved.stateId,
          recordedAt: asOf,
          createdBy: command.actorId,
          autoExecutionClaimed: false,
          scheduleExecutionClaimed: false,
          costExecutionClaimed: false,
          contractInstructionClaimed: false,
          approvalAuthorityClaimed: false,
          certificationClaimed: false,
          verificationClaimed: false,
          evidenceApprovalClaimed: false,
          earnedValueDerived: false,
          cpmDerived: false,
          financialPostingClaimed: false,
          numericalPrecisionClaimed: false,
          registerMutationClaimed: false,
          mutatesCoreRisk: false,
          mutatesUpstreamContributors: false,
        }),
      );
      if (evidenceRows.length > 0) {
        await deps.repository.saveAssuranceEvidence(evidenceRows);
      }
      await deps.repository.saveAssuranceConfidence({
        ...outcome.confidence,
        assuranceStateId: saved.stateId,
        recordedAt: asOf,
      });
      if (review) await deps.repository.saveAssuranceReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: outcome.abstained ? "assurance_abstained" : "assurance_updated",
        eventType: "engineering.project.assurance.updated",
        recordedAt: asOf,
        actorId: command.actorId,
        detail: outcome.abstentionReason,
        sourceKey: ASSURANCE_SOURCE_KEY,
      });
      await emitAssuranceState("engineering.project.assurance.updated", saved, command.correlationId);

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
        certificationClaimed: false,
        verificationClaimed: false,
        evidenceApprovalClaimed: false,
      };
    },

    async reviewAssurance(command: ReviewAssuranceCommand): Promise<ReviewAssuranceResult> {
      const latest = await deps.repository.getAssuranceStateById(
        command.tenantId,
        command.workspaceId,
        command.assuranceStateId,
      );
      if (!latest) throw new Error("assurance_state_not_found");

      const publish = command.publish === true && command.to === "published";
      let instance = transitionAssuranceReview({
        instance: command.workflowInstance,
        action: command.action,
        to: command.to,
      });
      if (publish) {
        assertAssurancePublishable({
          workflowState: instance.state,
          reviewerId: command.reviewerId,
          assessedBy: latest.createdBy,
        });
        instance = transitionAssuranceReview({
          instance,
          action: "publish",
          to: "published",
        });
      }

      const nextStatus: AssuranceAssessmentState["status"] = publish
        ? "published"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "approved"
            ? "reviewed"
            : latest.status;

      const version = await deps.repository.nextAssuranceStateVersion(
        command.tenantId,
        command.workspaceId,
        latest.controlContext.scope,
        latest.controlContext.assuranceUnitId,
      );

      const next: AssuranceAssessmentState = {
        ...latest,
        version,
        status: nextStatus,
        reviewedAt: command.asOf ?? new Date().toISOString(),
        publishedAt: publish ? (command.asOf ?? new Date().toISOString()) : latest.publishedAt,
        workflowInstanceId: instance.instanceId,
        supersedesId: latest.stateId,
        stateId: deps.repository.newId("pcasst"),
        id: deps.repository.newId("pcasst"),
      };

      const saved = await deps.repository.saveAssuranceState(next);
      const review: AssuranceReviewRecord = {
        reviewId: deps.repository.newId("pcasrev"),
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: command.projectId,
        assuranceStateId: saved.stateId,
        workflowInstanceId: instance.instanceId,
        workflowState: instance.state,
        outcome: assuranceReviewOutcomeFor(command.action),
        reviewerId: command.reviewerId,
        notes: command.notes,
        createdAt: command.asOf ?? new Date().toISOString(),
        completedAt: command.asOf ?? new Date().toISOString(),
        selfApproved: false,
        approvalAuthorityClaimed: false,
        certificationClaimed: false,
        verificationClaimed: false,
      };
      await deps.repository.saveAssuranceReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: publish ? "assurance_published" : "assurance_reviewed",
        eventType: publish
          ? "engineering.project.assurance.published"
          : "engineering.project.assurance.reviewed",
        recordedAt: command.asOf ?? new Date().toISOString(),
        actorId: command.reviewerId,
        sourceKey: ASSURANCE_SOURCE_KEY,
      });
      await emitAssuranceState(
        publish ? "engineering.project.assurance.published" : "engineering.project.assurance.reviewed",
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
        certificationClaimed: false,
      };
    },

    async getLatestAssurance(input: {
      tenantId: string;
      workspaceId: string;
      scope: AssuranceControlContext["scope"];
      assuranceUnitId: string;
    }) {
      return deps.repository.latestAssuranceState(
        input.tenantId,
        input.workspaceId,
        input.scope,
        input.assuranceUnitId,
      );
    },

    async listAssuranceHistory(input: {
      tenantId: string;
      workspaceId: string;
      projectId: string;
    }) {
      return deps.repository.listAssuranceStates(
        input.tenantId,
        input.workspaceId,
        input.projectId,
      );
    },

    latestPerAssuranceThread(states: readonly AssuranceAssessmentState[]) {
      const byThread = new Map<string, AssuranceAssessmentState>();
      for (const state of states) {
        const key = assuranceStateKey(
          state.controlContext.scope,
          state.controlContext.assuranceUnitId,
        );
        const existing = byThread.get(key);
        if (!existing || state.version > existing.version) byThread.set(key, state);
      }
      return [...byThread.values()];
    },
  };
}

function assuranceReviewOutcomeFor(
  action: AssuranceReviewAction,
): AssuranceReviewRecord["outcome"] {
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
