/**
 * Phase 11G — Project Context Engine.
 *
 * Composes a `ProjectProfile` from the intelligence Project Controls owns.
 * Active contributors: progress intelligence (11B), schedule intelligence (11C),
 * change intelligence (11D), cost intelligence (11E), productivity intelligence
 * (11F) and forecast intelligence (11G). Contingency and earned value stay
 * reserved.
 *
 * The engine reads a `ProjectReference` for identity fields. It never writes
 * identity and never re-derives it from its own tables.
 */

import type { ProjectReference } from "@rtb/engineering-shared-project-domain";
import {
  PROJECT_PROFILE_CONTRIBUTOR_KEYS,
  type ProgressAssessmentState,
  type ProgressBand,
  type ProgressConfidenceClass,
  type ProgressEvidenceSufficiency,
  type ProjectProfile,
  type ProjectProfileContributor,
  type ProjectProfileContributorKey,
} from "./progress";
import {
  dominantMilestonePosture,
  type MilestonePosture,
  type ScheduleAssessmentState,
  type ScheduleConfidenceClass,
  type ScheduleEvidenceSufficiency,
} from "./schedule";
import {
  dominantChangeClass,
  type ChangeClassification,
  type ChangeConfidenceClass,
  type ChangeEvidenceSufficiency,
  type ChangeIntelligenceState,
  type ChangeProfileContribution,
} from "./change";
import {
  dominantCostPosture,
  type CostConfidenceClass,
  type CostEvidenceSufficiency,
  type CostIntelligenceState,
  type CostPosture,
  type CostProfileContribution,
  type CostVarianceAttribution,
} from "./cost";
import {
  dominantProductivityPosture,
  type ProductivityAssessmentState,
  type ProductivityConfidenceClass,
  type ProductivityEvidenceSufficiency,
  type ProductivityPosture,
  type ProductivityProfileContribution,
} from "./productivity";
import {
  dominantForecastPosture,
  type ForecastAssessmentState,
  type ForecastConfidenceClass,
  type ForecastEvidenceSufficiency,
  type ForecastPosture,
  type ForecastProfileContribution,
} from "./forecast";
import { PROJECT_CONTEXT_ENGINE_READY } from "../version";

export const PROJECT_PROFILE_CONTRIBUTORS: readonly ProjectProfileContributor[] = [
  {
    key: "progress_intelligence",
    status: "active",
    ownedBy: "project_controls",
    notes: "Advisory, evidence-driven progress assessments. Implemented in Phase 11B.",
  },
  {
    key: "schedule_intelligence",
    status: "active",
    ownedBy: "project_controls",
    notes:
      "Advisory, evidence-driven schedule / milestone posture. Implemented in Phase 11C. Not CPM.",
  },
  {
    key: "change_intelligence",
    status: "active",
    ownedBy: "project_controls",
    notes:
      "Advisory, evidence-driven change assessment. Implemented in Phase 11D. Not contractual change authority.",
  },
  {
    key: "cost_intelligence",
    status: "active",
    ownedBy: "project_controls",
    notes:
      "Advisory, evidence-driven cost posture assessment. Implemented in Phase 11E. Not a budget ledger or financial posting.",
  },
  {
    key: "productivity_intelligence",
    status: "active",
    ownedBy: "project_controls",
    notes:
      "Advisory, evidence-driven execution efficiency assessment. Implemented in Phase 11F. Not workforce management or labour %.",
  },
  {
    key: "forecast",
    status: "active",
    ownedBy: "project_controls",
    notes:
      "Advisory trajectory from composed contributors. Implemented in Phase 11G. Not completion date or cost forecast.",
  },
  {
    key: "contingency_intelligence",
    status: "reserved",
    ownedBy: "project_controls",
    notes: "Reserved. No contingency drawdown.",
  },
  {
    key: "earned_value",
    status: "reserved",
    ownedBy: "project_controls",
    notes: "Reserved and forbidden to implement.",
  },
] as const;

export const ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS: readonly ProjectProfileContributorKey[] =
  PROJECT_PROFILE_CONTRIBUTORS.filter((c) => c.status === "active").map((c) => c.key);

export const RESERVED_PROJECT_PROFILE_CONTRIBUTOR_KEYS: readonly ProjectProfileContributorKey[] =
  PROJECT_PROFILE_CONTRIBUTORS.filter((c) => c.status === "reserved").map((c) => c.key);

export type ProjectContextComposeInput = {
  tenantId: string;
  workspaceId: string;
  projectReference: ProjectReference;
  progress: readonly ProgressAssessmentState[];
  schedule?: readonly ScheduleAssessmentState[];
  change?: readonly ChangeIntelligenceState[];
  cost?: readonly CostIntelligenceState[];
  productivity?: readonly ProductivityAssessmentState[];
  forecast?: readonly ForecastAssessmentState[];
  /** Number of open change candidates; a candidate is never an approved change. */
  changeCandidateCount?: number;
  version?: number;
  asOf?: string;
  createdBy?: string;
  supersedesId?: string;
};

export type ProjectContextComposeResult = {
  profile: ProjectProfile;
  abstained: boolean;
  abstentionReason?: string;
};

export type ProjectContextEngineDeps = {
  newId?: (prefix: string) => string;
};

const PROGRESS_CONFIDENCE_ORDER: ProgressConfidenceClass[] = [
  "unavailable",
  "low",
  "medium",
  "high",
];
const SCHEDULE_CONFIDENCE_ORDER: ScheduleConfidenceClass[] = [
  "unavailable",
  "low",
  "medium",
  "high",
];
const CHANGE_CONFIDENCE_ORDER: ChangeConfidenceClass[] = [
  "unavailable",
  "low",
  "medium",
  "high",
];
const COST_CONFIDENCE_ORDER: CostConfidenceClass[] = [
  "unavailable",
  "low",
  "medium",
  "high",
];
const PRODUCTIVITY_CONFIDENCE_ORDER: ProductivityConfidenceClass[] = [
  "unavailable",
  "low",
  "medium",
  "high",
];
const FORECAST_CONFIDENCE_ORDER: ForecastConfidenceClass[] = [
  "unavailable",
  "low",
  "medium",
  "high",
];

export class ProjectContextEngine {
  readonly kind = "project_context_engine" as const;
  private readonly newId: (prefix: string) => string;

  constructor(deps: ProjectContextEngineDeps = {}) {
    if (!PROJECT_CONTEXT_ENGINE_READY) {
      throw new Error("project_context_engine_not_ready");
    }
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  compose(input: ProjectContextComposeInput): ProjectContextComposeResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reference = input.projectReference;
    if (reference.owner !== "engineering_os_shared_project_domain") {
      throw new Error("project_reference_owner_mismatch");
    }
    if (reference.projectId === "") throw new Error("project_id_required");

    const progress = (input.progress ?? []).filter(
      (state) =>
        state.projectId === reference.projectId &&
        state.tenantId === input.tenantId &&
        state.workspaceId === input.workspaceId,
    );
    const schedule = (input.schedule ?? []).filter(
      (state) =>
        state.projectId === reference.projectId &&
        state.tenantId === input.tenantId &&
        state.workspaceId === input.workspaceId,
    );
    const change = (input.change ?? []).filter(
      (state) =>
        state.projectId === reference.projectId &&
        state.tenantId === input.tenantId &&
        state.workspaceId === input.workspaceId,
    );
    const cost = (input.cost ?? []).filter(
      (state) =>
        state.projectId === reference.projectId &&
        state.tenantId === input.tenantId &&
        state.workspaceId === input.workspaceId,
    );
    const productivity = (input.productivity ?? []).filter(
      (state) =>
        state.projectId === reference.projectId &&
        state.tenantId === input.tenantId &&
        state.workspaceId === input.workspaceId,
    );
    const forecast = (input.forecast ?? []).filter(
      (state) =>
        state.projectId === reference.projectId &&
        state.tenantId === input.tenantId &&
        state.workspaceId === input.workspaceId,
    );

    const reasons: string[] = [];
    const progressAssessed = progress.filter((state) => !state.abstained);
    const progressAbstained = progress.filter((state) => state.abstained);
    const progressPublished = progress.filter((state) => state.status === "published");
    const scheduleAssessed = schedule.filter((state) => !state.abstained);
    const scheduleAbstained = schedule.filter((state) => state.abstained);
    const schedulePublished = schedule.filter((state) => state.status === "published");
    const changeAssessed = change.filter((state) => !state.abstained);
    const changeAbstained = change.filter((state) => state.abstained);
    const changePublished = change.filter((state) => state.status === "published");
    const costAssessed = cost.filter((state) => !state.abstained);
    const costAbstained = cost.filter((state) => state.abstained);
    const costPublished = cost.filter((state) => state.status === "published");
    const productivityAssessed = productivity.filter((state) => !state.abstained);
    const productivityAbstained = productivity.filter((state) => state.abstained);
    const productivityPublished = productivity.filter((state) => state.status === "published");
    const forecastAssessed = forecast.filter((state) => !state.abstained);
    const forecastAbstained = forecast.filter((state) => state.abstained);
    const forecastPublished = forecast.filter((state) => state.status === "published");

    const projectProgress = progress
      .filter((state) => state.scope.kind === "project")
      .sort((a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt))[0];

    let abstained = false;
    let abstentionReason: string | undefined;
    let profileClass: ProjectProfile["profileClass"] = "composed";

    if (
      progress.length === 0 &&
      schedule.length === 0 &&
      change.length === 0 &&
      cost.length === 0 &&
      productivity.length === 0 &&
      forecast.length === 0
    ) {
      abstained = true;
      abstentionReason = "no_project_controls_intelligence_available";
      profileClass = "abstained";
      reasons.push("no_project_controls_intelligence_available");
    } else if (
      progressAssessed.length === 0 &&
      scheduleAssessed.length === 0 &&
      changeAssessed.length === 0 &&
      costAssessed.length === 0 &&
      productivityAssessed.length === 0 &&
      forecastAssessed.length === 0
    ) {
      abstained = true;
      abstentionReason = "all_intelligence_assessments_abstained";
      profileClass = "abstained";
      reasons.push("all_intelligence_assessments_abstained");
    } else if (
      progressAbstained.length > 0 ||
      scheduleAbstained.length > 0 ||
      changeAbstained.length > 0 ||
      costAbstained.length > 0 ||
      productivityAbstained.length > 0 ||
      forecastAbstained.length > 0 ||
      progressPublished.length === 0 ||
      (schedule.length > 0 && schedulePublished.length === 0) ||
      (change.length > 0 && changePublished.length === 0) ||
      (cost.length > 0 && costPublished.length === 0) ||
      (productivity.length > 0 && productivityPublished.length === 0) ||
      (forecast.length > 0 && forecastPublished.length === 0)
    ) {
      profileClass = "partially_composed";
      if (progressAbstained.length > 0) reasons.push("some_progress_scopes_abstained");
      if (scheduleAbstained.length > 0) reasons.push("some_schedule_scopes_abstained");
      if (changeAbstained.length > 0) reasons.push("some_change_assessments_abstained");
      if (costAbstained.length > 0) reasons.push("some_cost_assessments_abstained");
      if (productivityAbstained.length > 0) reasons.push("some_productivity_assessments_abstained");
      if (forecastAbstained.length > 0) reasons.push("some_forecast_assessments_abstained");
      if (progressPublished.length === 0 && progress.length > 0) {
        reasons.push("no_published_progress_yet");
      }
      if (schedule.length > 0 && schedulePublished.length === 0) {
        reasons.push("no_published_schedule_yet");
      }
      if (change.length > 0 && changePublished.length === 0) {
        reasons.push("no_published_change_assessment_yet");
      }
      if (cost.length > 0 && costPublished.length === 0) {
        reasons.push("no_published_cost_assessment_yet");
      }
      if (productivity.length > 0 && productivityPublished.length === 0) {
        reasons.push("no_published_productivity_assessment_yet");
      }
      if (forecast.length > 0 && forecastPublished.length === 0) {
        reasons.push("no_published_forecast_assessment_yet");
      }
    }

    reasons.push(`reserved_contributors:${RESERVED_PROJECT_PROFILE_CONTRIBUTOR_KEYS.join("|")}`);

    const schedulePostures = scheduleAssessed
      .map((state) => state.milestonePosture)
      .filter((value): value is MilestonePosture => typeof value === "string");

    const profile: ProjectProfile = {
      profileId: this.newId("pcprofile"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: reference.projectId,
      version: input.version ?? 1,
      profileClass,
      composedAt: asOf,
      recordedAt: asOf,
      projectCode: reference.projectCode,
      projectName: reference.projectName,
      projectPhase: reference.projectPhase,
      projectStatus: reference.status,
      progress: {
        scopesAssessed: progressAssessed.length,
        scopesAbstained: progressAbstained.length,
        publishedScopes: progressPublished.length,
        projectScopeIndication:
          projectProgress && !projectProgress.abstained
            ? projectProgress.indicatedCompletion
            : undefined,
        projectScopeBand:
          projectProgress && !projectProgress.abstained
            ? (projectProgress.band as ProgressBand | undefined)
            : undefined,
        lowestConfidenceClass: lowestProgressConfidence(progress),
        dominantSufficiency: dominantProgress(progress),
        latestAssessmentAt: latestAt(progress.map((s) => s.assessedAt)),
      },
      schedule: {
        scopesAssessed: scheduleAssessed.length,
        scopesAbstained: scheduleAbstained.length,
        publishedScopes: schedulePublished.length,
        dominantMilestonePosture: dominantMilestonePosture(schedulePostures),
        lowestConfidenceClass: lowestScheduleConfidence(schedule),
        dominantSufficiency: dominantSchedule(schedule),
        latestAssessmentAt: latestAt(schedule.map((s) => s.assessedAt)),
      },
      change: {
        changesAssessed: changeAssessed.length,
        changesAbstained: changeAbstained.length,
        publishedChanges: changePublished.length,
        candidateCount: input.changeCandidateCount ?? 0,
        pendingContextCount: countStatusContext(changeAssessed, "pending"),
        approvedContextCount: countStatusContext(changeAssessed, "approved_context"),
        rejectedContextCount: countStatusContext(changeAssessed, "rejected_context"),
        dominantChangeClass: dominantChangeClass(
          changeAssessed.map((state) => state.changeClass),
        ),
        lowestConfidenceClass: lowestChangeConfidence(change),
        dominantSufficiency: dominantChange(change),
        latestAssessmentAt: latestAt(change.map((s) => s.assessedAt)),
        contractualAuthorityClaimed: false,
      } satisfies ChangeProfileContribution,
      cost: {
        costsAssessed: costAssessed.length,
        costsAbstained: costAbstained.length,
        publishedCosts: costPublished.length,
        overCount: countPosture(costAssessed, "over"),
        underCount: countPosture(costAssessed, "under"),
        withinToleranceCount: countPosture(costAssessed, "within_tolerance"),
        attentionRequiredCount: countPosture(costAssessed, "attention_required"),
        unexplainedVarianceCount: countVarianceAttribution(
          costAssessed,
          "unexplained_movement",
        ),
        changeExplainedVarianceCount: countVarianceAttribution(
          costAssessed,
          "explained_by_approved_change",
        ),
        dominantPosture: dominantCostPosture(
          costAssessed.map((state) => state.costPosture),
        ),
        dominantVarianceAttribution: dominantVarianceAttribution(costAssessed),
        lowestConfidenceClass: lowestCostConfidence(cost),
        dominantSufficiency: dominantCost(cost),
        latestAssessmentAt: latestAt(cost.map((s) => s.assessedAt)),
        financialPostingClaimed: false,
      } satisfies CostProfileContribution,
      productivity: {
        productivityAssessed: productivityAssessed.length,
        productivityAbstained: productivityAbstained.length,
        publishedProductivity: productivityPublished.length,
        improvingCount: countProductivityPosture(productivityAssessed, "improving"),
        stableCount: countProductivityPosture(productivityAssessed, "stable"),
        decliningCount: countProductivityPosture(productivityAssessed, "declining"),
        constrainedCount: countProductivityPosture(productivityAssessed, "constrained"),
        recoveringCount: countProductivityPosture(productivityAssessed, "recovering"),
        dominantPosture: dominantProductivityPosture(
          productivityAssessed.map((state) => state.productivityPosture),
        ),
        factorPresenceCount: productivityAssessed.reduce(
          (sum, state) => sum + state.factors.filter((f) => f.present).length,
          0,
        ),
        lowestConfidenceClass: lowestProductivityConfidence(productivity),
        dominantSufficiency: dominantProductivity(productivity),
        latestAssessmentAt: latestAt(productivity.map((s) => s.assessedAt)),
        labourProductivityPercentClaimed: false,
      } satisfies ProductivityProfileContribution,
      forecast: {
        forecastsAssessed: forecastAssessed.length,
        forecastsAbstained: forecastAbstained.length,
        publishedForecasts: forecastPublished.length,
        favourableCount: countForecastPosture(forecastAssessed, "favourable"),
        stableCount: countForecastPosture(forecastAssessed, "stable"),
        uncertainCount: countForecastPosture(forecastAssessed, "uncertain"),
        deterioratingCount: countForecastPosture(forecastAssessed, "deteriorating"),
        recoveryPossibleCount: countForecastPosture(forecastAssessed, "recovery_possible"),
        dominantPosture: dominantForecastPosture(
          forecastAssessed.map((state) => state.forecastPosture),
        ),
        contributorCoverageCount: forecastAssessed.reduce(
          (sum, state) => sum + state.contributingContributors.length,
          0,
        ),
        lowestConfidenceClass: lowestForecastConfidence(forecast),
        dominantSufficiency: dominantForecast(forecast),
        latestAssessmentAt: latestAt(forecast.map((s) => s.assessedAt)),
        completionDateClaimed: false,
      } satisfies ForecastProfileContribution,
      contributors: PROJECT_PROFILE_CONTRIBUTORS,
      activeContributorKeys: ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS,
      reservedContributorKeys: RESERVED_PROJECT_PROFILE_CONTRIBUTOR_KEYS,
      reasons: [...new Set(reasons)],
      abstained,
      abstentionReason,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      earnedValueComputed: false,
      criticalPathComputed: false,
      floatComputed: false,
      costIntegrated: false,
      financialPostingPerformed: false,
      contractualApprovalClaimed: false,
      forecastProduced: false,
      advisoryOnly: true,
      mutatesProjectIdentity: false,
      isProjectRegistry: false,
    };

    return { profile, abstained, abstentionReason };
  }
}

export function createProjectContextEngine(
  deps: ProjectContextEngineDeps = {},
): ProjectContextEngine {
  return new ProjectContextEngine(deps);
}

export function assertProjectProfileContributorsComplete(): {
  ok: true;
  activeContributorKeys: readonly ProjectProfileContributorKey[];
  reservedContributorKeys: readonly ProjectProfileContributorKey[];
} {
  const declared = new Set(PROJECT_PROFILE_CONTRIBUTOR_KEYS);
  const listed = new Set(PROJECT_PROFILE_CONTRIBUTORS.map((c) => c.key));
  if (declared.size !== listed.size) {
    throw new Error("project_profile_contributor_list_incomplete");
  }
  for (const key of declared) {
    if (!listed.has(key)) throw new Error(`project_profile_contributor_missing:${key}`);
  }
  if (ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS.length !== 6) {
    throw new Error("phase_11g_must_have_exactly_six_active_contributors");
  }
  if (!ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS.includes("progress_intelligence")) {
    throw new Error("progress_intelligence_must_stay_active");
  }
  if (!ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS.includes("schedule_intelligence")) {
    throw new Error("schedule_intelligence_must_be_active");
  }
  if (!ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS.includes("change_intelligence")) {
    throw new Error("change_intelligence_must_be_active");
  }
  if (!ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS.includes("cost_intelligence")) {
    throw new Error("cost_intelligence_must_be_active");
  }
  if (!ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS.includes("productivity_intelligence")) {
    throw new Error("productivity_intelligence_must_be_active");
  }
  if (!ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS.includes("forecast")) {
    throw new Error("forecast_intelligence_must_be_active");
  }
  for (const key of ["contingency_intelligence", "earned_value"] as const) {
    const row = PROJECT_PROFILE_CONTRIBUTORS.find((c) => c.key === key);
    if (!row || row.status !== "reserved") {
      throw new Error(`contributor_must_stay_reserved:${key}`);
    }
  }
  return {
    ok: true,
    activeContributorKeys: ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS,
    reservedContributorKeys: RESERVED_PROJECT_PROFILE_CONTRIBUTOR_KEYS,
  };
}

function lowestProgressConfidence(
  states: readonly ProgressAssessmentState[],
): ProgressConfidenceClass {
  if (states.length === 0) return "unavailable";
  return states
    .map((state) => state.confidence.confidenceClass)
    .reduce((lowest, current) =>
      PROGRESS_CONFIDENCE_ORDER.indexOf(current) < PROGRESS_CONFIDENCE_ORDER.indexOf(lowest)
        ? current
        : lowest,
    );
}

function lowestScheduleConfidence(
  states: readonly ScheduleAssessmentState[],
): ScheduleConfidenceClass {
  if (states.length === 0) return "unavailable";
  return states
    .map((state) => state.confidence.confidenceClass)
    .reduce((lowest, current) =>
      SCHEDULE_CONFIDENCE_ORDER.indexOf(current) < SCHEDULE_CONFIDENCE_ORDER.indexOf(lowest)
        ? current
        : lowest,
    );
}

function dominantProgress(
  states: readonly ProgressAssessmentState[],
): ProgressEvidenceSufficiency {
  if (states.length === 0) return "insufficient";
  const counts = new Map<ProgressEvidenceSufficiency, number>();
  for (const state of states) {
    const key = state.confidence.dataSufficiency;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function dominantSchedule(
  states: readonly ScheduleAssessmentState[],
): ScheduleEvidenceSufficiency {
  if (states.length === 0) return "insufficient";
  const counts = new Map<ScheduleEvidenceSufficiency, number>();
  for (const state of states) {
    const key = state.confidence.dataSufficiency;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function lowestChangeConfidence(
  states: readonly ChangeIntelligenceState[],
): ChangeConfidenceClass {
  if (states.length === 0) return "unavailable";
  return states
    .map((state) => state.confidence.confidenceClass)
    .reduce((lowest, current) =>
      CHANGE_CONFIDENCE_ORDER.indexOf(current) < CHANGE_CONFIDENCE_ORDER.indexOf(lowest)
        ? current
        : lowest,
    );
}

function dominantChange(
  states: readonly ChangeIntelligenceState[],
): ChangeEvidenceSufficiency {
  if (states.length === 0) return "insufficient";
  const counts = new Map<ChangeEvidenceSufficiency, number>();
  for (const state of states) {
    const key = state.confidence.dataSufficiency;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function countStatusContext(
  states: readonly ChangeIntelligenceState[],
  context: ChangeIntelligenceState["changeStatusContext"],
): number {
  return states.filter((state) => state.changeStatusContext === context).length;
}

function latestAt(values: string[]): string | undefined {
  if (values.length === 0) return undefined;
  return values.sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}

function lowestCostConfidence(states: readonly CostIntelligenceState[]): CostConfidenceClass {
  if (states.length === 0) return "unavailable";
  return states
    .map((state) => state.confidence.confidenceClass)
    .reduce((lowest, current) =>
      COST_CONFIDENCE_ORDER.indexOf(current) < COST_CONFIDENCE_ORDER.indexOf(lowest)
        ? current
        : lowest,
    );
}

function dominantCost(states: readonly CostIntelligenceState[]): CostEvidenceSufficiency {
  if (states.length === 0) return "insufficient";
  const counts = new Map<CostEvidenceSufficiency, number>();
  for (const state of states) {
    const key = state.confidence.dataSufficiency;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function countPosture(states: readonly CostIntelligenceState[], posture: CostPosture): number {
  return states.filter((state) => state.costPosture === posture).length;
}

function countVarianceAttribution(
  states: readonly CostIntelligenceState[],
  attribution: CostVarianceAttribution,
): number {
  return states.filter((state) => state.varianceAttribution === attribution).length;
}

function dominantVarianceAttribution(
  states: readonly CostIntelligenceState[],
): CostVarianceAttribution | undefined {
  if (states.length === 0) return undefined;
  const counts = new Map<CostVarianceAttribution, number>();
  for (const state of states) {
    counts.set(state.varianceAttribution, (counts.get(state.varianceAttribution) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function lowestProductivityConfidence(
  states: readonly ProductivityAssessmentState[],
): ProductivityConfidenceClass {
  if (states.length === 0) return "unavailable";
  return states
    .map((state) => state.confidence.confidenceClass)
    .reduce((lowest, current) =>
      PRODUCTIVITY_CONFIDENCE_ORDER.indexOf(current) <
      PRODUCTIVITY_CONFIDENCE_ORDER.indexOf(lowest)
        ? current
        : lowest,
    );
}

function dominantProductivity(
  states: readonly ProductivityAssessmentState[],
): ProductivityEvidenceSufficiency {
  if (states.length === 0) return "insufficient";
  const counts = new Map<ProductivityEvidenceSufficiency, number>();
  for (const state of states) {
    const key = state.confidence.dataSufficiency;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function countProductivityPosture(
  states: readonly ProductivityAssessmentState[],
  posture: ProductivityPosture,
): number {
  return states.filter((state) => state.productivityPosture === posture).length;
}

function lowestForecastConfidence(states: readonly ForecastAssessmentState[]): ForecastConfidenceClass {
  if (states.length === 0) return "unavailable";
  return states
    .map((state) => state.confidence.confidenceClass)
    .reduce((lowest, current) =>
      FORECAST_CONFIDENCE_ORDER.indexOf(current) < FORECAST_CONFIDENCE_ORDER.indexOf(lowest)
        ? current
        : lowest,
    );
}

function dominantForecast(states: readonly ForecastAssessmentState[]): ForecastEvidenceSufficiency {
  if (states.length === 0) return "insufficient";
  const counts = new Map<ForecastEvidenceSufficiency, number>();
  for (const state of states) {
    const key = state.confidence.dataSufficiency;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function countForecastPosture(states: readonly ForecastAssessmentState[], posture: ForecastPosture): number {
  return states.filter((state) => state.forecastPosture === posture).length;
}
