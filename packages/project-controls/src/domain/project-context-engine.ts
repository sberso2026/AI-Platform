/**
 * Phase 11B — Project Context Engine.
 *
 * Composes a `ProjectProfile` from the intelligence Project Controls owns. In
 * 11B the only active contributor is progress intelligence; cost, schedule,
 * change, contingency, productivity, earned value and forecast are declared as
 * reserved so the profile shape is stable while the values stay absent.
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
import { PROJECT_CONTEXT_ENGINE_READY } from "../version";

/**
 * The full contributor set. Order is stable so the profile is diffable, and
 * `status` is the single source of truth for what 11B actually composes.
 */
export const PROJECT_PROFILE_CONTRIBUTORS: readonly ProjectProfileContributor[] = [
  {
    key: "progress_intelligence",
    status: "active",
    ownedBy: "project_controls",
    notes: "Advisory, evidence-driven progress assessments. Implemented in Phase 11B.",
  },
  {
    key: "cost_intelligence",
    status: "reserved",
    ownedBy: "project_controls",
    notes: "Reserved. No cost engine exists; financial ledgers stay with platform_commerce_finance.",
  },
  {
    key: "schedule_intelligence",
    status: "reserved",
    ownedBy: "project_controls",
    notes: "Reserved. No CPM, float or schedule execution.",
  },
  {
    key: "change_intelligence",
    status: "reserved",
    ownedBy: "project_controls",
    notes: "Reserved. No change control workflow.",
  },
  {
    key: "contingency_intelligence",
    status: "reserved",
    ownedBy: "project_controls",
    notes: "Reserved. No contingency drawdown.",
  },
  {
    key: "productivity_intelligence",
    status: "reserved",
    ownedBy: "project_controls",
    notes: "Reserved. No unit rates or productivity factors.",
  },
  {
    key: "earned_value",
    status: "reserved",
    ownedBy: "project_controls",
    notes: "Reserved and forbidden to implement. Progress intelligence is not earned value.",
  },
  {
    key: "forecast",
    status: "reserved",
    ownedBy: "project_controls",
    notes: "Reserved and forbidden to implement. No completion or cost forecast.",
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
  /** Every progress assessment the caller wants reflected in the profile. */
  progress: readonly ProgressAssessmentState[];
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

const CONFIDENCE_ORDER: ProgressConfidenceClass[] = ["unavailable", "low", "medium", "high"];

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

    const relevant = input.progress.filter(
      (state) =>
        state.projectId === reference.projectId &&
        state.tenantId === input.tenantId &&
        state.workspaceId === input.workspaceId,
    );
    const reasons: string[] = [];
    if (relevant.length < input.progress.length) reasons.push("out_of_scope_progress_ignored");

    const assessed = relevant.filter((state) => !state.abstained);
    const abstainedStates = relevant.filter((state) => state.abstained);
    const published = relevant.filter((state) => state.status === "published");

    const projectScope = relevant
      .filter((state) => state.scope.kind === "project")
      .sort((a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt))[0];

    const lowestConfidenceClass = lowestConfidence(relevant);
    const dominantSufficiency = dominant(relevant);

    let abstained = false;
    let abstentionReason: string | undefined;
    let profileClass: ProjectProfile["profileClass"] = "composed";

    if (relevant.length === 0) {
      abstained = true;
      abstentionReason = "no_progress_intelligence_available";
      profileClass = "abstained";
      reasons.push("no_progress_intelligence_available");
    } else if (assessed.length === 0) {
      abstained = true;
      abstentionReason = "all_progress_assessments_abstained";
      profileClass = "abstained";
      reasons.push("all_progress_assessments_abstained");
    } else if (abstainedStates.length > 0 || published.length === 0) {
      profileClass = "partially_composed";
      if (abstainedStates.length > 0) reasons.push("some_scopes_abstained");
      if (published.length === 0) reasons.push("no_published_progress_yet");
    }

    reasons.push(
      `reserved_contributors:${RESERVED_PROJECT_PROFILE_CONTRIBUTOR_KEYS.join("|")}`,
    );

    const projectScopeIndication =
      projectScope && !projectScope.abstained ? projectScope.indicatedCompletion : undefined;
    const projectScopeBand: ProgressBand | undefined =
      projectScope && !projectScope.abstained ? projectScope.band : undefined;

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
        scopesAssessed: assessed.length,
        scopesAbstained: abstainedStates.length,
        publishedScopes: published.length,
        projectScopeIndication,
        projectScopeBand,
        lowestConfidenceClass,
        dominantSufficiency,
        latestAssessmentAt: latestAssessedAt(relevant),
      },
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
      costIntegrated: false,
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

/** Certification helper: the contributor list must cover every declared key. */
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
  if (ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS.length !== 1) {
    throw new Error("phase_11b_must_have_exactly_one_active_contributor");
  }
  if (ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS[0] !== "progress_intelligence") {
    throw new Error("phase_11b_active_contributor_must_be_progress_intelligence");
  }
  for (const key of ["earned_value", "forecast"] as const) {
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

function lowestConfidence(
  states: readonly ProgressAssessmentState[],
): ProgressConfidenceClass {
  if (states.length === 0) return "unavailable";
  return states
    .map((state) => state.confidence.confidenceClass)
    .reduce((lowest, current) =>
      CONFIDENCE_ORDER.indexOf(current) < CONFIDENCE_ORDER.indexOf(lowest) ? current : lowest,
    );
}

function dominant(states: readonly ProgressAssessmentState[]): ProgressEvidenceSufficiency {
  if (states.length === 0) return "insufficient";
  const counts = new Map<ProgressEvidenceSufficiency, number>();
  for (const state of states) {
    const key = state.confidence.dataSufficiency;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function latestAssessedAt(states: readonly ProgressAssessmentState[]): string | undefined {
  if (states.length === 0) return undefined;
  return states
    .map((state) => state.assessedAt)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}
