/**
 * Phase 11G — Project Context Composition Layer.
 *
 * Composes Progress, Schedule, Change, Cost and Productivity intelligence
 * WITHOUT collapsing them into an opaque score. Preserves contributor
 * independence and traceability. Forecast Intelligence consumes this composed
 * context only — it never mutates upstream contributors.
 *
 * Ownership: project_controls (projectContextCompositionOwnership).
 */

import type { ChangeIntelligenceState } from "./change";
import type { CostIntelligenceState } from "./cost";
import type {
  ForecastContributorKey,
  ForecastContributorRef,
} from "./forecast";
import type { ProductivityAssessmentState } from "./productivity";
import type { ProgressAssessmentState } from "./progress";
import type { ScheduleAssessmentState } from "./schedule";
import {
  PROJECT_CONTEXT_COMPOSITION_READY,
  projectContextCompositionOwnership,
} from "../version";

export const PROJECT_CONTEXT_COMPOSITION_METHOD = "project_context_composition_v1" as const;

export type ComposedProjectContext = {
  contextId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  composedAt: string;
  contributorRefs: ForecastContributorRef[];
  publishedContributorCount: number;
  abstainedContributorCount: number;
  missingContributorKeys: ForecastContributorKey[];
  traceabilityComplete: boolean;
  ownership: typeof projectContextCompositionOwnership;
  method: typeof PROJECT_CONTEXT_COMPOSITION_METHOD;
  methodVersion: "1";
  mutatesUpstreamContributors: false;
  opaqueScoreProduced: false;
};

export type ProjectContextCompositionInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  progress: readonly ProgressAssessmentState[];
  schedule?: readonly ScheduleAssessmentState[];
  change?: readonly ChangeIntelligenceState[];
  cost?: readonly CostIntelligenceState[];
  productivity?: readonly ProductivityAssessmentState[];
  asOf?: string;
  requirePublished?: boolean;
};

export type ProjectContextCompositionResult = {
  context: ComposedProjectContext;
  sufficientForForecast: boolean;
  abstentionReason?: string;
};

export type ProjectContextCompositionEngineDeps = {
  newId?: (prefix: string) => string;
};

const ALL_CONTRIBUTOR_KEYS: ForecastContributorKey[] = [
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
];

export class ProjectContextCompositionEngine {
  readonly kind = "project_context_composition_engine" as const;
  private readonly newId: (prefix: string) => string;

  constructor(deps: ProjectContextCompositionEngineDeps = {}) {
    if (!PROJECT_CONTEXT_COMPOSITION_READY) {
      throw new Error("project_context_composition_not_ready");
    }
    this.newId =
      deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  compose(input: ProjectContextCompositionInput): ProjectContextCompositionResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const requirePublished = input.requirePublished ?? true;

    const filterScope = <T extends { projectId: string; tenantId: string; workspaceId: string }>(
      rows: readonly T[],
    ): T[] =>
      rows.filter(
        (row) =>
          row.projectId === input.projectId &&
          row.tenantId === input.tenantId &&
          row.workspaceId === input.workspaceId,
      );

    const progress = filterScope(input.progress ?? []);
    const schedule = filterScope(input.schedule ?? []);
    const change = filterScope(input.change ?? []);
    const cost = filterScope(input.cost ?? []);
    const productivity = filterScope(input.productivity ?? []);

    const latestPublished = <T extends { status: string; abstained: boolean; stateId: string; assessedAt: string }>(
      rows: readonly T[],
    ): T | undefined =>
      rows
        .filter((row) => (!requirePublished || row.status === "published") && !row.abstained)
        .sort((a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt))[0];

    const contributorRefs: ForecastContributorRef[] = [];

    const progressLatest = latestPublished(progress);
    if (progressLatest) {
      contributorRefs.push({
        contributorKey: "progress_intelligence",
        stateId: progressLatest.stateId,
        status: progressLatest.status,
        abstained: progressLatest.abstained,
        postureOrIndication: String(
          (progressLatest as ProgressAssessmentState).indicatedCompletion ?? "unknown",
        ),
        assessedAt: progressLatest.assessedAt,
      });
    }

    const scheduleLatest = latestPublished(schedule);
    if (scheduleLatest) {
      contributorRefs.push({
        contributorKey: "schedule_intelligence",
        stateId: scheduleLatest.stateId,
        status: scheduleLatest.status,
        abstained: scheduleLatest.abstained,
        postureOrIndication: (scheduleLatest as ScheduleAssessmentState).milestonePosture,
        assessedAt: scheduleLatest.assessedAt,
      });
    }

    const changeLatest = latestPublished(change);
    if (changeLatest) {
      contributorRefs.push({
        contributorKey: "change_intelligence",
        stateId: changeLatest.stateId,
        status: changeLatest.status,
        abstained: changeLatest.abstained,
        postureOrIndication: (changeLatest as ChangeIntelligenceState).changeClass,
        assessedAt: changeLatest.assessedAt,
      });
    }

    const costLatest = latestPublished(cost);
    if (costLatest) {
      contributorRefs.push({
        contributorKey: "cost_intelligence",
        stateId: costLatest.stateId,
        status: costLatest.status,
        abstained: costLatest.abstained,
        postureOrIndication: (costLatest as CostIntelligenceState).costPosture,
        assessedAt: costLatest.assessedAt,
      });
    }

    const productivityLatest = latestPublished(productivity);
    if (productivityLatest) {
      contributorRefs.push({
        contributorKey: "productivity_intelligence",
        stateId: productivityLatest.stateId,
        status: productivityLatest.status,
        abstained: productivityLatest.abstained,
        postureOrIndication: (productivityLatest as ProductivityAssessmentState).productivityPosture,
        assessedAt: productivityLatest.assessedAt,
      });
    }

    const presentKeys = new Set(contributorRefs.map((ref) => ref.contributorKey));
    const missingContributorKeys = ALL_CONTRIBUTOR_KEYS.filter((key) => !presentKeys.has(key));
    const publishedContributorCount = contributorRefs.length;
    const abstainedContributorCount = missingContributorKeys.length;

    const context: ComposedProjectContext = {
      contextId: this.newId("pcctxcomp"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      composedAt: asOf,
      contributorRefs,
      publishedContributorCount,
      abstainedContributorCount,
      missingContributorKeys,
      traceabilityComplete: missingContributorKeys.length === 0,
      ownership: projectContextCompositionOwnership,
      method: PROJECT_CONTEXT_COMPOSITION_METHOD,
      methodVersion: "1",
      mutatesUpstreamContributors: false,
      opaqueScoreProduced: false,
    };

    const sufficientForForecast = publishedContributorCount >= 2;
    const abstentionReason = sufficientForForecast
      ? undefined
      : publishedContributorCount === 0
        ? "no_published_contributors_for_forecast"
        : "insufficient_published_contributors_for_forecast";

    return { context, sufficientForForecast, abstentionReason };
  }
}

export function createProjectContextCompositionEngine(
  deps: ProjectContextCompositionEngineDeps = {},
): ProjectContextCompositionEngine {
  return new ProjectContextCompositionEngine(deps);
}

export function assertProjectContextCompositionReady(): {
  ok: true;
  ownership: typeof projectContextCompositionOwnership;
} {
  if (!PROJECT_CONTEXT_COMPOSITION_READY) {
    throw new Error("project_context_composition_not_ready");
  }
  if (projectContextCompositionOwnership !== "project_controls") {
    throw new Error("project_context_composition_ownership_mismatch");
  }
  return { ok: true, ownership: projectContextCompositionOwnership };
}
