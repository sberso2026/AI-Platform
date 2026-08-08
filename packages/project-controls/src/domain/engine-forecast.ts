/**
 * Phase 11G — Forecast orchestration extracted from ProjectControlsEngine.
 */

import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import {
  createProjectControlsEvent,
  forecastEventPayload,
  type ProjectControlsEventPublishPort,
} from "./events";
import type {
  PersistedForecastEvidence,
  ProjectControlsRepositoryPort,
} from "./persistence";
import type { ForecastAssessmentState, ForecastControlContext, ForecastReviewRecord } from "./forecast";
import {
  createForecastIntelligenceEngine,
  type ForecastIntelligenceEngine,
} from "./forecast-engine";
import {
  assertForecastPublishable,
  startForecastReview,
  transitionForecastReview,
  type ForecastReviewAction,
  type ForecastReviewTargetState,
} from "./review-workflow";
import type { ProjectControlsRole } from "./role-matrix";
import type { SharedProjectDomainPort } from "@rtb/engineering-shared-project-domain";
import { requireProjectReference } from "@rtb/engineering-shared-project-domain";
import { forecastStateKey } from "./forecast";

const FORECAST_SOURCE_KEY = "project_controls.forecast_intelligence" as const;

export type AssessForecastCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ForecastControlContext;
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

export type AssessForecastResult = {
  state: ForecastAssessmentState;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: ForecastReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay: boolean;
  projectIdentityMutated: false;
  completionDatePredicted: false;
  mutatesUpstreamContributors: false;
};

export type ReviewForecastCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  forecastStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: ForecastReviewAction;
  to: ForecastReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewForecastResult = {
  state: ForecastAssessmentState;
  review: ForecastReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
  completionDateClaimed: false;
};

export type ForecastOrchestrationDeps = {
  projectDomainPort: SharedProjectDomainPort;
  repository: ProjectControlsRepositoryPort;
  events: ProjectControlsEventPublishPort;
  forecastEngine?: ForecastIntelligenceEngine;
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

export function createForecastOrchestration(deps: ForecastOrchestrationDeps) {
  const forecastEngine =
    deps.forecastEngine ??
    createForecastIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });

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

  async function emitForecastState(
    eventType:
      | "engineering.project.forecast.updated"
      | "engineering.project.forecast.reviewed"
      | "engineering.project.forecast.published",
    state: ForecastAssessmentState,
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
        payload: forecastEventPayload(state),
      }),
    );
  }

  return {
    async assessForecast(command: AssessForecastCommand): Promise<AssessForecastResult> {
      const reference = await resolveProject(command);
      const asOf = command.asOf ?? new Date().toISOString();
      const scope = command.controlContext.scope;
      const trajectoryUnitId = command.controlContext.trajectoryUnitId;

      const [progress, schedule, change, cost, productivity] = await Promise.all([
        deps.repository.listProgressAssessments(command.tenantId, command.workspaceId, reference.projectId),
        deps.repository.listScheduleAssessments(command.tenantId, command.workspaceId, reference.projectId),
        deps.repository.listChangeStates(command.tenantId, command.workspaceId, reference.projectId),
        deps.repository.listCostStates(command.tenantId, command.workspaceId, reference.projectId),
        deps.repository.listProductivityStates(command.tenantId, command.workspaceId, reference.projectId),
      ]);

      const previous = await deps.repository.latestForecastState(
        command.tenantId,
        command.workspaceId,
        scope,
        trajectoryUnitId,
      );
      const version = await deps.repository.nextForecastStateVersion(
        command.tenantId,
        command.workspaceId,
        scope,
        trajectoryUnitId,
        command.expectedVersion,
      );

      const outcome = forecastEngine.assess({
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        controlContext: command.controlContext,
        progress,
        schedule,
        change,
        cost,
        productivity,
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
      let review: ForecastReviewRecord | undefined;

      if (!outcome.abstained && command.startReview !== false) {
        const started = startForecastReview({
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
          forecastStateId: state.stateId,
          workflowInstanceId: started.instance.instanceId,
          workflowState: started.instance.state,
          createdAt: started.review.createdAt,
          selfApproved: false,
          completionDateClaimed: false,
        };
      }

      const saved = await deps.repository.saveForecastState(state);
      const evidenceRows: PersistedForecastEvidence[] = outcome.state.evidenceRefs.map((refId) => ({
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
        forecastStateId: saved.stateId,
        recordedAt: asOf,
        createdBy: command.actorId,
        completionDateClaimed: false,
        costForecastClaimed: false,
        earnedValueDerived: false,
        cpmDerived: false,
        resourcePlanningClaimed: false,
        budgetLedgerClaimed: false,
        financialPostingClaimed: false,
        mutatesCoreRisk: false,
      }));
      if (evidenceRows.length > 0) {
        await deps.repository.saveForecastEvidence(evidenceRows);
      }
      await deps.repository.saveForecastConfidence({
        ...outcome.confidence,
        forecastStateId: saved.stateId,
        recordedAt: asOf,
      });
      if (review) await deps.repository.saveForecastReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: outcome.abstained ? "forecast_abstained" : "forecast_updated",
        eventType: "engineering.project.forecast.updated",
        recordedAt: asOf,
        actorId: command.actorId,
        detail: outcome.abstentionReason,
        sourceKey: FORECAST_SOURCE_KEY,
      });
      await emitForecastState("engineering.project.forecast.updated", saved, command.correlationId);

      return {
        state: saved,
        workflowInstance,
        review,
        abstained: outcome.abstained,
        abstentionReason: outcome.abstentionReason,
        idempotentReplay: false,
        projectIdentityMutated: false,
        completionDatePredicted: false,
        mutatesUpstreamContributors: false,
      };
    },

    async reviewForecast(command: ReviewForecastCommand): Promise<ReviewForecastResult> {
      const latest = await deps.repository.getForecastStateById(
        command.tenantId,
        command.workspaceId,
        command.forecastStateId,
      );
      if (!latest) throw new Error("forecast_state_not_found");

      const publish = command.publish === true && command.to === "published";
      let instance = transitionForecastReview({
        instance: command.workflowInstance,
        action: command.action,
        to: command.to,
      });
      if (publish) {
        assertForecastPublishable({
          workflowState: instance.state,
          reviewerId: command.reviewerId,
          assessedBy: latest.createdBy,
        });
        instance = transitionForecastReview({ instance, action: "publish", to: "published" });
      }

      const nextStatus: ForecastAssessmentState["status"] = publish
        ? "published"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "approved"
            ? "reviewed"
            : latest.status;

      const version = await deps.repository.nextForecastStateVersion(
        command.tenantId,
        command.workspaceId,
        latest.controlContext.scope,
        latest.controlContext.trajectoryUnitId,
      );

      const next: ForecastAssessmentState = {
        ...latest,
        version,
        status: nextStatus,
        reviewedAt: command.asOf ?? new Date().toISOString(),
        publishedAt: publish ? (command.asOf ?? new Date().toISOString()) : latest.publishedAt,
        workflowInstanceId: instance.instanceId,
        supersedesId: latest.stateId,
        stateId: deps.repository.newId("pcfcst"),
        id: deps.repository.newId("pcfcst"),
      };

      const saved = await deps.repository.saveForecastState(next);
      const review: ForecastReviewRecord = {
        reviewId: deps.repository.newId("pcfcrev"),
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: command.projectId,
        forecastStateId: saved.stateId,
        workflowInstanceId: instance.instanceId,
        workflowState: instance.state,
        outcome: forecastReviewOutcomeFor(command.action),
        reviewerId: command.reviewerId,
        notes: command.notes,
        createdAt: command.asOf ?? new Date().toISOString(),
        completedAt: command.asOf ?? new Date().toISOString(),
        selfApproved: false,
        completionDateClaimed: false,
      };
      await deps.repository.saveForecastReview(review);

      await deps.appendTimeline({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        stateId: saved.stateId,
        kind: publish ? "forecast_published" : "forecast_reviewed",
        eventType: publish
          ? "engineering.project.forecast.published"
          : "engineering.project.forecast.reviewed",
        recordedAt: command.asOf ?? new Date().toISOString(),
        actorId: command.reviewerId,
        sourceKey: FORECAST_SOURCE_KEY,
      });
      await emitForecastState(
        publish ? "engineering.project.forecast.published" : "engineering.project.forecast.reviewed",
        saved,
        command.correlationId,
      );

      return {
        state: saved,
        review,
        workflowInstance: instance,
        published: publish,
        projectIdentityMutated: false,
        completionDateClaimed: false,
      };
    },

    async getLatestForecast(input: {
      tenantId: string;
      workspaceId: string;
      scope: ForecastControlContext["scope"];
      trajectoryUnitId: string;
    }) {
      return deps.repository.latestForecastState(
        input.tenantId,
        input.workspaceId,
        input.scope,
        input.trajectoryUnitId,
      );
    },

    async listForecastHistory(input: {
      tenantId: string;
      workspaceId: string;
      projectId: string;
    }) {
      return deps.repository.listForecastStates(
        input.tenantId,
        input.workspaceId,
        input.projectId,
      );
    },

    latestPerForecastThread(states: readonly ForecastAssessmentState[]) {
      const byThread = new Map<string, ForecastAssessmentState>();
      for (const state of states) {
        const key = forecastStateKey(state.controlContext.scope, state.controlContext.trajectoryUnitId);
        const existing = byThread.get(key);
        if (!existing || state.version > existing.version) byThread.set(key, state);
      }
      return [...byThread.values()];
    },
  };
}

function forecastReviewOutcomeFor(action: ForecastReviewAction): ForecastReviewRecord["outcome"] {
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
