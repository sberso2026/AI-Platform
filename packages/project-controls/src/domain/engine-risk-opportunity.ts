/**
 * Phase 11J — Risk & Opportunity orchestration extracted from ProjectControlsEngine.
 */

import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import {
  createProjectControlsEvent,
  riskOpportunityEventPayload,
  type ProjectControlsEventPublishPort,
} from "./events";
import type {
  PersistedRiskOpportunityEvidence,
  ProjectControlsRepositoryPort,
} from "./persistence";
import type {
  RiskOpportunityAssessmentState,
  RiskOpportunityControlContext,
  RiskOpportunityReviewRecord,
} from "./risk-opportunity";
import {
  createRiskOpportunityIntelligenceEngine,
  type ProjectControlsRiskOpportunityIntelligenceEngine,
} from "./risk-opportunity-engine";
import {
  assertRiskOpportunityPublishable,
  startRiskOpportunityReview,
  transitionRiskOpportunityReview,
  type RiskOpportunityReviewAction,
  type RiskOpportunityReviewTargetState,
} from "./review-workflow";
import type { ProjectControlsRole } from "./role-matrix";
import type { SharedProjectDomainPort } from "@rtb/engineering-shared-project-domain";
import { requireProjectReference } from "@rtb/engineering-shared-project-domain";
import { riskOpportunityStateKey } from "./risk-opportunity";

const RISK_OPPORTUNITY_SOURCE_KEY = "project_controls.risk_opportunity_intelligence" as const;

export type AssessRiskOpportunityCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: RiskOpportunityControlContext;
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

export type AssessRiskOpportunityResult = {
  state: RiskOpportunityAssessmentState;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: RiskOpportunityReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay: boolean;
  projectIdentityMutated: false;
  autoExecutionEnabled: false;
  mutatesUpstreamContributors: false;
  riskRegisterMutated: false;
  opportunityRegisterMutated: false;
  ownerAssignmentPerformed: false;
  treatmentExecutionPerformed: false;
};

export type ReviewRiskOpportunityCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  riskOpportunityStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: RiskOpportunityReviewAction;
  to: RiskOpportunityReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewRiskOpportunityResult = {
  state: RiskOpportunityAssessmentState;
  review: RiskOpportunityReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
  approvalAuthorityClaimed: false;
};

export type RiskOpportunityOrchestrationDeps = {
  projectDomainPort: SharedProjectDomainPort;
  repository: ProjectControlsRepositoryPort;
  events: ProjectControlsEventPublishPort;
  riskOpportunityEngine?: ProjectControlsRiskOpportunityIntelligenceEngine;
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

export function createRiskOpportunityOrchestration(deps: RiskOpportunityOrchestrationDeps) {
  const riskOpportunityEngine =
    deps.riskOpportunityEngine ??
    createRiskOpportunityIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });

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

  async function emitRiskOpportunityState(
    eventType:
      | "engineering.project.risk_opportunity.updated"
      | "engineering.project.risk_opportunity.reviewed"
      | "engineering.project.risk_opportunity.published",
    state: RiskOpportunityAssessmentState,
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
        payload: riskOpportunityEventPayload(state),
      }),
    );
  }

  return {
    async assessRiskOpportunity(
      command: AssessRiskOpportunityCommand,
    ): Promise<AssessRiskOpportunityResult> {
      const reference = await resolveProject(command);
      const asOf = command.asOf ?? new Date().toISOString();
      const scope = command.controlContext.scope;
      const riskOpportunityUnitId = command.controlContext.riskOpportunityUnitId;

      const [progress, schedule, change, cost, productivity, forecast, decision, scenario] =
        await Promise.all([
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
          deps.repository.listCostStates(
            command.tenantId,
            command.workspaceId,
            reference.projectId,
          ),
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
        ]);

      const previous = await deps.repository.latestRiskOpportunityState(
        command.tenantId,
        command.workspaceId,
        scope,
        riskOpportunityUnitId,
      );
      const version = await deps.repository.nextRiskOpportunityStateVersion(
        command.tenantId,
        command.workspaceId,
        scope,
        riskOpportunityUnitId,
        command.expectedVersion,
      );

      const outcome = riskOpportunityEngine.assess({
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
      let review: RiskOpportunityReviewRecord | undefined;

      if (!outcome.abstained && command.startReview !== false) {
        const started = startRiskOpportunityReview({
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
          riskOpportunityStateId: state.stateId,
          workflowInstanceId: started.instance.instanceId,
          workflowState: started.instance.state,
          createdAt: started.review.createdAt,
          selfApproved: false,
          approvalAuthorityClaimed: false,
        };
      }

      const saved = await deps.repository.saveRiskOpportunityState(state);
      const evidenceRows: PersistedRiskOpportunityEvidence[] = outcome.state.evidenceRefs.map(
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
          riskOpportunityStateId: saved.stateId,
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
          monteCarloClaimed: false,
          numericalPrecisionClaimed: false,
          riskRegisterMutationClaimed: false,
          opportunityRegisterMutationClaimed: false,
          ownerAssignmentClaimed: false,
          treatmentExecutionClaimed: false,
          mutatesCoreRisk: false,
        }),
      );
      if (evidenceRows.length > 0) {
        await deps.repository.saveRiskOpportunityEvidence(evidenceRows);
      }
      await deps.repository.saveRiskOpportunityConfidence({
        ...outcome.confidence,
        riskOpportunityStateId: saved.stateId,
        recordedAt: asOf,
      });
      if (review) await deps.repository.saveRiskOpportunityReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: outcome.abstained ? "risk_opportunity_abstained" : "risk_opportunity_updated",
        eventType: "engineering.project.risk_opportunity.updated",
        recordedAt: asOf,
        actorId: command.actorId,
        detail: outcome.abstentionReason,
        sourceKey: RISK_OPPORTUNITY_SOURCE_KEY,
      });
      await emitRiskOpportunityState(
        "engineering.project.risk_opportunity.updated",
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
        riskRegisterMutated: false,
        opportunityRegisterMutated: false,
        ownerAssignmentPerformed: false,
        treatmentExecutionPerformed: false,
      };
    },

    async reviewRiskOpportunity(
      command: ReviewRiskOpportunityCommand,
    ): Promise<ReviewRiskOpportunityResult> {
      const latest = await deps.repository.getRiskOpportunityStateById(
        command.tenantId,
        command.workspaceId,
        command.riskOpportunityStateId,
      );
      if (!latest) throw new Error("risk_opportunity_state_not_found");

      const publish = command.publish === true && command.to === "published";
      let instance = transitionRiskOpportunityReview({
        instance: command.workflowInstance,
        action: command.action,
        to: command.to,
      });
      if (publish) {
        assertRiskOpportunityPublishable({
          workflowState: instance.state,
          reviewerId: command.reviewerId,
          assessedBy: latest.createdBy,
        });
        instance = transitionRiskOpportunityReview({
          instance,
          action: "publish",
          to: "published",
        });
      }

      const nextStatus: RiskOpportunityAssessmentState["status"] = publish
        ? "published"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "approved"
            ? "reviewed"
            : latest.status;

      const version = await deps.repository.nextRiskOpportunityStateVersion(
        command.tenantId,
        command.workspaceId,
        latest.controlContext.scope,
        latest.controlContext.riskOpportunityUnitId,
      );

      const next: RiskOpportunityAssessmentState = {
        ...latest,
        version,
        status: nextStatus,
        reviewedAt: command.asOf ?? new Date().toISOString(),
        publishedAt: publish ? (command.asOf ?? new Date().toISOString()) : latest.publishedAt,
        workflowInstanceId: instance.instanceId,
        supersedesId: latest.stateId,
        stateId: deps.repository.newId("pcrost"),
        id: deps.repository.newId("pcrost"),
      };

      const saved = await deps.repository.saveRiskOpportunityState(next);
      const review: RiskOpportunityReviewRecord = {
        reviewId: deps.repository.newId("pcrorev"),
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: command.projectId,
        riskOpportunityStateId: saved.stateId,
        workflowInstanceId: instance.instanceId,
        workflowState: instance.state,
        outcome: riskOpportunityReviewOutcomeFor(command.action),
        reviewerId: command.reviewerId,
        notes: command.notes,
        createdAt: command.asOf ?? new Date().toISOString(),
        completedAt: command.asOf ?? new Date().toISOString(),
        selfApproved: false,
        approvalAuthorityClaimed: false,
      };
      await deps.repository.saveRiskOpportunityReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: publish ? "risk_opportunity_published" : "risk_opportunity_reviewed",
        eventType: publish
          ? "engineering.project.risk_opportunity.published"
          : "engineering.project.risk_opportunity.reviewed",
        recordedAt: command.asOf ?? new Date().toISOString(),
        actorId: command.reviewerId,
        sourceKey: RISK_OPPORTUNITY_SOURCE_KEY,
      });
      await emitRiskOpportunityState(
        publish
          ? "engineering.project.risk_opportunity.published"
          : "engineering.project.risk_opportunity.reviewed",
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

    async getLatestRiskOpportunity(input: {
      tenantId: string;
      workspaceId: string;
      scope: RiskOpportunityControlContext["scope"];
      riskOpportunityUnitId: string;
    }) {
      return deps.repository.latestRiskOpportunityState(
        input.tenantId,
        input.workspaceId,
        input.scope,
        input.riskOpportunityUnitId,
      );
    },

    async listRiskOpportunityHistory(input: {
      tenantId: string;
      workspaceId: string;
      projectId: string;
    }) {
      return deps.repository.listRiskOpportunityStates(
        input.tenantId,
        input.workspaceId,
        input.projectId,
      );
    },

    latestPerRiskOpportunityThread(states: readonly RiskOpportunityAssessmentState[]) {
      const byThread = new Map<string, RiskOpportunityAssessmentState>();
      for (const state of states) {
        const key = riskOpportunityStateKey(
          state.controlContext.scope,
          state.controlContext.riskOpportunityUnitId,
        );
        const existing = byThread.get(key);
        if (!existing || state.version > existing.version) byThread.set(key, state);
      }
      return [...byThread.values()];
    },
  };
}

function riskOpportunityReviewOutcomeFor(
  action: RiskOpportunityReviewAction,
): RiskOpportunityReviewRecord["outcome"] {
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
