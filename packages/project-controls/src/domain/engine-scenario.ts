/**
 * Phase 11I — Scenario orchestration extracted from ProjectControlsEngine.
 */

import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import {
  createProjectControlsEvent,
  scenarioEventPayload,
  type ProjectControlsEventPublishPort,
} from "./events";
import type {
  PersistedScenarioEvidence,
  ProjectControlsRepositoryPort,
} from "./persistence";
import type {
  ScenarioAssessmentState,
  ScenarioControlContext,
  ScenarioReviewRecord,
} from "./scenario";
import {
  createScenarioIntelligenceEngine,
  type ProjectControlsScenarioIntelligenceEngine,
} from "./scenario-engine";
import {
  assertScenarioPublishable,
  startScenarioReview,
  transitionScenarioReview,
  type ScenarioReviewAction,
  type ScenarioReviewTargetState,
} from "./review-workflow";
import type { ProjectControlsRole } from "./role-matrix";
import type { SharedProjectDomainPort } from "@rtb/engineering-shared-project-domain";
import { requireProjectReference } from "@rtb/engineering-shared-project-domain";
import { scenarioStateKey } from "./scenario";

const SCENARIO_SOURCE_KEY = "project_controls.scenario_intelligence" as const;

export type AssessScenarioCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ScenarioControlContext;
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

export type AssessScenarioResult = {
  state: ScenarioAssessmentState;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: ScenarioReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay: boolean;
  projectIdentityMutated: false;
  autoExecutionEnabled: false;
  mutatesUpstreamContributors: false;
  preferredScenarioSelected: false;
};

export type ReviewScenarioCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scenarioStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: ScenarioReviewAction;
  to: ScenarioReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewScenarioResult = {
  state: ScenarioAssessmentState;
  review: ScenarioReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
  approvalAuthorityClaimed: false;
};

export type ScenarioOrchestrationDeps = {
  projectDomainPort: SharedProjectDomainPort;
  repository: ProjectControlsRepositoryPort;
  events: ProjectControlsEventPublishPort;
  scenarioEngine?: ProjectControlsScenarioIntelligenceEngine;
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

export function createScenarioOrchestration(deps: ScenarioOrchestrationDeps) {
  const scenarioEngine =
    deps.scenarioEngine ??
    createScenarioIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });

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

  async function emitScenarioState(
    eventType:
      | "engineering.project.scenario.updated"
      | "engineering.project.scenario.reviewed"
      | "engineering.project.scenario.published",
    state: ScenarioAssessmentState,
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
        payload: scenarioEventPayload(state),
      }),
    );
  }

  return {
    async assessScenario(command: AssessScenarioCommand): Promise<AssessScenarioResult> {
      const reference = await resolveProject(command);
      const asOf = command.asOf ?? new Date().toISOString();
      const scope = command.controlContext.scope;
      const scenarioUnitId = command.controlContext.scenarioUnitId;

      const [progress, schedule, change, cost, productivity, forecast, decision] =
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
        ]);

      const previous = await deps.repository.latestScenarioState(
        command.tenantId,
        command.workspaceId,
        scope,
        scenarioUnitId,
      );
      const version = await deps.repository.nextScenarioStateVersion(
        command.tenantId,
        command.workspaceId,
        scope,
        scenarioUnitId,
        command.expectedVersion,
      );

      const outcome = scenarioEngine.assess({
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
      let review: ScenarioReviewRecord | undefined;

      if (!outcome.abstained && command.startReview !== false) {
        const started = startScenarioReview({
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
          scenarioStateId: state.stateId,
          workflowInstanceId: started.instance.instanceId,
          workflowState: started.instance.state,
          createdAt: started.review.createdAt,
          selfApproved: false,
          approvalAuthorityClaimed: false,
        };
      }

      const saved = await deps.repository.saveScenarioState(state);
      const evidenceRows: PersistedScenarioEvidence[] = outcome.state.evidenceRefs.map((refId) => ({
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
        scenarioStateId: saved.stateId,
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
        preferredSelectionClaimed: false,
        optimisationClaimed: false,
        mutatesCoreRisk: false,
      }));
      if (evidenceRows.length > 0) {
        await deps.repository.saveScenarioEvidence(evidenceRows);
      }
      await deps.repository.saveScenarioConfidence({
        ...outcome.confidence,
        scenarioStateId: saved.stateId,
        recordedAt: asOf,
      });
      if (review) await deps.repository.saveScenarioReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: outcome.abstained ? "scenario_abstained" : "scenario_updated",
        eventType: "engineering.project.scenario.updated",
        recordedAt: asOf,
        actorId: command.actorId,
        detail: outcome.abstentionReason,
        sourceKey: SCENARIO_SOURCE_KEY,
      });
      await emitScenarioState("engineering.project.scenario.updated", saved, command.correlationId);

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
        preferredScenarioSelected: false,
      };
    },

    async reviewScenario(command: ReviewScenarioCommand): Promise<ReviewScenarioResult> {
      const latest = await deps.repository.getScenarioStateById(
        command.tenantId,
        command.workspaceId,
        command.scenarioStateId,
      );
      if (!latest) throw new Error("scenario_state_not_found");

      const publish = command.publish === true && command.to === "published";
      let instance = transitionScenarioReview({
        instance: command.workflowInstance,
        action: command.action,
        to: command.to,
      });
      if (publish) {
        assertScenarioPublishable({
          workflowState: instance.state,
          reviewerId: command.reviewerId,
          assessedBy: latest.createdBy,
        });
        instance = transitionScenarioReview({ instance, action: "publish", to: "published" });
      }

      const nextStatus: ScenarioAssessmentState["status"] = publish
        ? "published"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "approved"
            ? "reviewed"
            : latest.status;

      const version = await deps.repository.nextScenarioStateVersion(
        command.tenantId,
        command.workspaceId,
        latest.controlContext.scope,
        latest.controlContext.scenarioUnitId,
      );

      const next: ScenarioAssessmentState = {
        ...latest,
        version,
        status: nextStatus,
        reviewedAt: command.asOf ?? new Date().toISOString(),
        publishedAt: publish ? (command.asOf ?? new Date().toISOString()) : latest.publishedAt,
        workflowInstanceId: instance.instanceId,
        supersedesId: latest.stateId,
        stateId: deps.repository.newId("pcssst"),
        id: deps.repository.newId("pcssst"),
      };

      const saved = await deps.repository.saveScenarioState(next);
      const review: ScenarioReviewRecord = {
        reviewId: deps.repository.newId("pcsrev"),
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: command.projectId,
        scenarioStateId: saved.stateId,
        workflowInstanceId: instance.instanceId,
        workflowState: instance.state,
        outcome: scenarioReviewOutcomeFor(command.action),
        reviewerId: command.reviewerId,
        notes: command.notes,
        createdAt: command.asOf ?? new Date().toISOString(),
        completedAt: command.asOf ?? new Date().toISOString(),
        selfApproved: false,
        approvalAuthorityClaimed: false,
      };
      await deps.repository.saveScenarioReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: publish ? "scenario_published" : "scenario_reviewed",
        eventType: publish
          ? "engineering.project.scenario.published"
          : "engineering.project.scenario.reviewed",
        recordedAt: command.asOf ?? new Date().toISOString(),
        actorId: command.reviewerId,
        sourceKey: SCENARIO_SOURCE_KEY,
      });
      await emitScenarioState(
        publish ? "engineering.project.scenario.published" : "engineering.project.scenario.reviewed",
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

    async getLatestScenario(input: {
      tenantId: string;
      workspaceId: string;
      scope: ScenarioControlContext["scope"];
      scenarioUnitId: string;
    }) {
      return deps.repository.latestScenarioState(
        input.tenantId,
        input.workspaceId,
        input.scope,
        input.scenarioUnitId,
      );
    },

    async listScenarioHistory(input: {
      tenantId: string;
      workspaceId: string;
      projectId: string;
    }) {
      return deps.repository.listScenarioStates(
        input.tenantId,
        input.workspaceId,
        input.projectId,
      );
    },

    latestPerScenarioThread(states: readonly ScenarioAssessmentState[]) {
      const byThread = new Map<string, ScenarioAssessmentState>();
      for (const state of states) {
        const key = scenarioStateKey(
          state.controlContext.scope,
          state.controlContext.scenarioUnitId,
        );
        const existing = byThread.get(key);
        if (!existing || state.version > existing.version) byThread.set(key, state);
      }
      return [...byThread.values()];
    },
  };
}

function scenarioReviewOutcomeFor(action: ScenarioReviewAction): ScenarioReviewRecord["outcome"] {
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
