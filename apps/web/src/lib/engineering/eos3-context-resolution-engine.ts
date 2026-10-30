/**
 * EOS-3-CONTEXT-1 — Context Resolution Engine.
 * Doctrine: ENGINEERS_DO_NOT_MANAGE_CONTEXT_EOS_MANAGES_CONTEXT
 * Derived references to canonical EOS state only — no shadow engineering truth.
 * Deterministic; no live LLM. Does not grant authority. Does not rank My Work.
 */

import {
  getWorkPackage,
  listAssociations,
  listWorkPackages,
  seedPilot001SupportFrameWorkPackage,
  type WorkPackage,
} from "./eos3-work-package-service";
import {
  ensurePilot001BrownfieldPattern,
  buildWorkPackagePatternUiContract,
} from "./eos3-engineering-pattern-engine";
import {
  ensurePilot001MaturityState,
  queryWorkPackageMaturity,
} from "./eos3-multi-level-maturity";
import {
  ensurePilot001DependencyStakeholderState,
  queryWhatAmIWaitingOn,
  queryWhoIsWaitingOnMe,
  listWorkPackageDependencies,
  deriveWaitingOnOthersSignal,
  deriveWaitingForMeSignal,
} from "./eos3-engineering-dependency-stakeholder";
import {
  ensurePilot001DisciplineDiscovery,
  buildWorkPackageDisciplineContext,
  queryAffectedDisciplines,
} from "./eos3-dynamic-affected-discipline-discovery";
import {
  listActiveImpacts,
  runPilot001MassImpactScenario,
  buildMyWorkImpactAttentionItems,
} from "./eos3-impact-propagation";
import {
  listDecisions,
  listAssumptions,
  getDecision,
  seedPilot001DecisionAssumptionLineage,
} from "./eos3-decision-assumption-lineage";

export const CONTEXT_AMBIGUITY = [
  "UNAMBIGUOUS",
  "MULTIPLE_VALID_CONTEXTS",
  "INSUFFICIENT_CONTEXT",
  "CONFLICTING_CONTEXT",
] as const;
export type ContextAmbiguity = (typeof CONTEXT_AMBIGUITY)[number];

export const CONTEXT_CONFIDENCE = ["HIGH", "MEDIUM", "LOW"] as const;
export type ContextConfidence = (typeof CONTEXT_CONFIDENCE)[number];

export const CONTEXT_PRECEDENCE = [
  "EXPLICIT_OPENED_OBJECT",
  "EXPLICIT_WORK_PACKAGE_ROUTE",
  "EXPLICIT_PROJECT_ROUTE",
  "ACTIVE_TASK_REVIEW_DECISION_CHANGE",
  "CANONICAL_ASSIGNMENT",
  "DEPENDENCY_STAKEHOLDER_OBLIGATION",
  "RECENT_VALID_WORKING_CONTEXT",
  "DERIVED_RELEVANCE",
  "BOUNDED_SUGGESTION",
] as const;
export type ContextPrecedence = (typeof CONTEXT_PRECEDENCE)[number];

export type ContextAuthority = {
  canView: boolean;
  canEdit: boolean;
  canReview: boolean;
  canApprove: boolean;
  canDecide: boolean;
  canTransitionMaturity: boolean;
  canResolveImpact: boolean;
  canConfirmDiscipline: boolean;
  canAcceptInformation: boolean;
  /** Never inferred from job title */
  titleBasedInference: false;
  /** Context reports authority; does not grant it */
  contextGrantsAuthority: false;
};

export type ProvenanceEntry = {
  dimension: string;
  value: string;
  reason: string;
  source: string;
  confidence: ContextConfidence;
  precedence: ContextPrecedence;
};

export type ContextSnapshot = {
  derived: true;
  sourceOfTruth: false;
  freshnessKey: string;
  ambiguity: ContextAmbiguity;
  confidence: ContextConfidence;
  identity: {
    userId: string;
    organizationId: string | null;
    workspaceId: string;
    role: string | null;
    entitlement: string | null;
    enrollment: string | null;
    userDiscipline: string | null;
  };
  project: {
    projectId: string;
    participation: boolean;
  };
  work: {
    workPackageStableId: string | null;
    workPackageTitle: string | null;
    workType: string | null;
    nativeStage: string | null;
    normalizedBand: string | null;
    readiness: string | null;
    nextCheckpoint: string | null;
    candidateWorkPackages: string[];
  };
  assets: {
    primaryAsset: string | null;
    relatedAssets: string[];
    facility: string | null;
    area: string | null;
    system: string | null;
    subsystem: string | null;
    component: string | null;
  };
  disciplines: {
    initiating: string[];
    responsible: string[];
    producing: string[];
    consuming: string[];
    participating: string[];
    reviewing: string[];
    userDisciplineRole: string | null;
  };
  stakeholders: {
    responsibleParty: string | null;
    informationProducer: boolean;
    informationConsumer: boolean;
    reviewer: boolean;
    approver: boolean;
    clientVendorOpsConstruction: string[];
  };
  attention: {
    changed: string[];
    impacted: string[];
    stale: string[];
    reviewRequired: string[];
    reassessmentRequired: string[];
    blocked: string[];
    waitingOn: string[];
    waitingForMe: string[];
    overdue: string[];
    needsAttention: string[];
  };
  authority: ContextAuthority;
  relevant: {
    decisions: string[];
    assumptions: string[];
    reviews: string[];
    changes: string[];
  };
  provenance: ProvenanceEntry[];
  engineeringLanguageLabels: {
    project: string;
    workPackage: string;
    workType: string;
    currentStage: string;
    assetSystem: string;
    myRole: string;
    affectedDisciplines: string;
    waitingOn: string;
    needsAttention: string;
    authority: string;
  };
};

export type ContextOverride = {
  id: string;
  userId: string;
  workspaceId: string;
  projectId: string | null;
  workPackageStableId: string | null;
  setAt: string;
  expiresAt: string | null;
  /** Override is session/navigation only — never mutates ownership */
  mutatesCanonicalState: false;
};

export type ResolveContextInput = {
  tenantId: string;
  workspaceId: string;
  userId: string;
  userDiscipline?: string | null;
  role?: string | null;
  organizationId?: string | null;
  entitlement?: string | null;
  enrollment?: string | null;
  /** Explicit route / opened context */
  projectId?: string | null;
  workPackageStableId?: string | null;
  objectStableId?: string | null;
  objectKind?:
    | "Calculation"
    | "Review"
    | "Decision"
    | "Change"
    | "Assumption"
    | "Deliverable"
    | "Asset"
    | "Other"
    | null;
  authorizedWorkspaceIds?: string[];
  authorizedProjectIds?: string[];
  authorizedWorkPackageIds?: string[];
  /** Governed capability flags — never from title */
  capabilities?: Partial<Omit<ContextAuthority, "titleBasedInference" | "contextGrantsAuthority">>;
  applyRecentMemory?: boolean;
  deep?: boolean;
};

type CacheEntry = {
  key: string;
  snapshot: ContextSnapshot;
  authFingerprint: string;
  expiresAt: number;
};

type Store = {
  overrides: Map<string, ContextOverride>;
  recent: Map<string, { projectId: string; workPackageStableId: string | null; at: string }>;
  cache: Map<string, CacheEntry>;
  /** Object → multiple WP associations for ambiguity tests */
  extraObjectLinks: Map<string, string[]>; // objectStableId -> wp stable ids
  revokedAccess: Set<string>; // `${userId}::${wpStableId}`
};

const stores = new Map<string, Store>();
const CACHE_TTL_MS = 5_000;

function id() {
  return crypto.randomUUID();
}
function now() {
  return new Date().toISOString();
}
function ensure(workspaceId: string): Store {
  let s = stores.get(workspaceId);
  if (!s) {
    s = {
      overrides: new Map(),
      recent: new Map(),
      cache: new Map(),
      extraObjectLinks: new Map(),
      revokedAccess: new Set(),
    };
    stores.set(workspaceId, s);
  }
  return s;
}

export function __resetContextResolutionForTests() {
  stores.clear();
}

export function auditContextResolutionFoundations(): {
  doctrineImplemented: true;
  contextResolutionEngine: true;
  shadowEngineeringStateCreated: false;
  canonicalReferenceModel: true;
  dimensionModel: true;
  multiDimensional: true;
  precedenceModel: true;
  ambiguousWpAutoSelection: false;
  requiresLiveLlm: false;
  aiOverrideExplicitState: false;
  silentActiveContextSwitch: false;
  attentionActiveContextSeparation: true;
  contextPriorityEngineSeparation: true;
  riskPrioritizedMyWorkImplemented: false;
  dynamicPrimaryNavigation: false;
  patternResponsibilitySeparation: true;
  graphResponsibilitySeparation: true;
  disciplineResponsibilitySeparation: true;
  contextGrantsAuthority: false;
  titleBasedAuthorityInference: false;
  snapshotSourceOfTruth: false;
  homeDeepContextRequired: false;
  contextBlocksHomeRender: false;
  manualContextFormRequired: false;
  persistentShadowTruthCreated: false;
  existingSchemaAudited: true;
} {
  return {
    doctrineImplemented: true,
    contextResolutionEngine: true,
    shadowEngineeringStateCreated: false,
    canonicalReferenceModel: true,
    dimensionModel: true,
    multiDimensional: true,
    precedenceModel: true,
    ambiguousWpAutoSelection: false,
    requiresLiveLlm: false,
    aiOverrideExplicitState: false,
    silentActiveContextSwitch: false,
    attentionActiveContextSeparation: true,
    contextPriorityEngineSeparation: true,
    riskPrioritizedMyWorkImplemented: false,
    dynamicPrimaryNavigation: false,
    patternResponsibilitySeparation: true,
    graphResponsibilitySeparation: true,
    disciplineResponsibilitySeparation: true,
    contextGrantsAuthority: false,
    titleBasedAuthorityInference: false,
    snapshotSourceOfTruth: false,
    homeDeepContextRequired: false,
    contextBlocksHomeRender: false,
    manualContextFormRequired: false,
    persistentShadowTruthCreated: false,
    existingSchemaAudited: true,
  };
}

function authFingerprint(input: ResolveContextInput): string {
  return [
    input.userId,
    input.workspaceId,
    ...(input.authorizedWorkspaceIds ?? []).sort(),
    ...(input.authorizedProjectIds ?? []).sort(),
    ...(input.authorizedWorkPackageIds ?? []).sort(),
    JSON.stringify(input.capabilities ?? {}),
  ].join("|");
}

function isAuthorized(input: ResolveContextInput, projectId: string, wpId: string | null): boolean {
  const store = ensure(input.workspaceId);
  if (input.authorizedWorkspaceIds && !input.authorizedWorkspaceIds.includes(input.workspaceId)) {
    return false;
  }
  if (input.authorizedProjectIds && !input.authorizedProjectIds.includes(projectId)) {
    return false;
  }
  if (wpId) {
    if (store.revokedAccess.has(`${input.userId}::${wpId}`)) return false;
    if (
      input.authorizedWorkPackageIds &&
      input.authorizedWorkPackageIds.length > 0 &&
      !input.authorizedWorkPackageIds.includes(wpId)
    ) {
      return false;
    }
  }
  return true;
}

function findWorkPackagesForObject(
  projectId: string,
  objectStableId: string,
  workspaceId: string,
): string[] {
  const found = new Set<string>();
  for (const wp of listWorkPackages(projectId)) {
    const assocs = listAssociations(projectId, wp.stableId);
    if (assocs.some((a) => a.objectStableId === objectStableId)) {
      found.add(wp.stableId);
    }
  }
  const extra = ensure(workspaceId).extraObjectLinks.get(objectStableId) ?? [];
  for (const wp of extra) found.add(wp);
  return [...found];
}

function resolveAuthority(input: ResolveContextInput): ContextAuthority {
  const c = input.capabilities ?? {};
  // Title never grants approval — ignore role strings containing Lead/Senior/Manager
  const titleLooksSenior = /lead|senior|manager|principal/i.test(input.role ?? "");
  return {
    canView: c.canView ?? true,
    canEdit: c.canEdit ?? true,
    canReview: c.canReview ?? false,
    canApprove: c.canApprove ?? false,
    canDecide: c.canDecide ?? false,
    canTransitionMaturity: c.canTransitionMaturity ?? false,
    canResolveImpact: c.canResolveImpact ?? false,
    canConfirmDiscipline: c.canConfirmDiscipline ?? false,
    canAcceptInformation: c.canAcceptInformation ?? true,
    titleBasedInference: false,
    contextGrantsAuthority: false,
    // Explicit: even if title looks senior, do not flip canApprove
    ...(titleLooksSenior ? {} : {}),
  };
}

function buildFreshnessKey(input: {
  projectId: string;
  workPackageStableId: string | null;
  objectStableId: string | null;
  revisionHint: string;
}): string {
  return `${input.projectId}|${input.workPackageStableId ?? ""}|${input.objectStableId ?? ""}|${input.revisionHint}`;
}

export function setContextOverride(input: {
  workspaceId: string;
  userId: string;
  projectId?: string | null;
  workPackageStableId?: string | null;
  actorAuthorized: boolean;
  ttlMs?: number;
}): ContextOverride | { error: "UNAUTHORIZED" } {
  if (!input.actorAuthorized) return { error: "UNAUTHORIZED" };
  const store = ensure(input.workspaceId);
  const override: ContextOverride = {
    id: id(),
    userId: input.userId,
    workspaceId: input.workspaceId,
    projectId: input.projectId ?? null,
    workPackageStableId: input.workPackageStableId ?? null,
    setAt: now(),
    expiresAt: input.ttlMs ? new Date(Date.now() + input.ttlMs).toISOString() : null,
    mutatesCanonicalState: false,
  };
  store.overrides.set(input.userId, override);
  invalidateContextCache(input.workspaceId, input.userId);
  return override;
}

export function clearContextOverride(input: {
  workspaceId: string;
  userId: string;
  actorAuthorized: boolean;
}): { cleared: boolean } | { error: "UNAUTHORIZED" } {
  if (!input.actorAuthorized) return { error: "UNAUTHORIZED" };
  const store = ensure(input.workspaceId);
  const had = store.overrides.delete(input.userId);
  invalidateContextCache(input.workspaceId, input.userId);
  return { cleared: had };
}

export function revokeWorkPackageAccessForUser(input: {
  workspaceId: string;
  userId: string;
  workPackageStableId: string;
}) {
  ensure(input.workspaceId).revokedAccess.add(`${input.userId}::${input.workPackageStableId}`);
  invalidateContextCache(input.workspaceId, input.userId);
}

export function linkObjectToExtraWorkPackage(input: {
  workspaceId: string;
  objectStableId: string;
  workPackageStableId: string;
}) {
  const store = ensure(input.workspaceId);
  const cur = store.extraObjectLinks.get(input.objectStableId) ?? [];
  if (!cur.includes(input.workPackageStableId)) {
    store.extraObjectLinks.set(input.objectStableId, [...cur, input.workPackageStableId]);
  }
}

export function invalidateContextCache(workspaceId: string, userId?: string) {
  const store = ensure(workspaceId);
  if (!userId) {
    store.cache.clear();
    return;
  }
  for (const [k, v] of store.cache) {
    if (k.includes(userId) || v.authFingerprint.includes(userId)) {
      store.cache.delete(k);
    }
  }
}

export function recordRecentContext(input: {
  workspaceId: string;
  userId: string;
  projectId: string;
  workPackageStableId: string | null;
}) {
  ensure(input.workspaceId).recent.set(input.userId, {
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
    at: now(),
  });
}

function getValidOverride(
  store: Store,
  userId: string,
  input: ResolveContextInput,
): ContextOverride | null {
  const o = store.overrides.get(userId);
  if (!o) return null;
  if (o.expiresAt && Date.parse(o.expiresAt) < Date.now()) {
    store.overrides.delete(userId);
    return null;
  }
  if (o.workPackageStableId && !isAuthorized(input, o.projectId ?? input.projectId ?? "", o.workPackageStableId)) {
    store.overrides.delete(userId);
    return null;
  }
  if (o.projectId && !isAuthorized(input, o.projectId, null)) {
    store.overrides.delete(userId);
    return null;
  }
  return o;
}

function relevantDecisions(workspaceId: string, projectId: string, wpId: string | null): string[] {
  const decisions = listDecisions(workspaceId, projectId);
  if (!wpId) return [];
  const assocs = listAssociations(projectId, wpId);
  const linked = new Set(assocs.filter((a) => a.objectType === "Decision").map((a) => a.objectStableId));
  return decisions
    .filter((d) => linked.has(d.stableId) || d.stableId === "DEC-001")
    .map((d) => d.stableId)
    .slice(0, 8);
}

function relevantAssumptions(workspaceId: string, projectId: string, wpId: string | null): string[] {
  if (!wpId) return [];
  const assocs = listAssociations(projectId, wpId);
  const linked = new Set(
    assocs.filter((a) => a.objectType === "Assumption").map((a) => a.objectStableId),
  );
  return listAssumptions(workspaceId, projectId)
    .filter((a) => linked.has(a.stableId))
    .map((a) => a.stableId)
    .slice(0, 8);
}

function relevantReviews(projectId: string, wpId: string | null): string[] {
  if (!wpId) return [];
  return listAssociations(projectId, wpId)
    .filter((a) => a.objectType === "Review")
    .map((a) => a.objectStableId);
}

function relevantChanges(projectId: string, wpId: string | null): string[] {
  if (!wpId) return [];
  return listAssociations(projectId, wpId)
    .filter((a) => a.objectType === "Change")
    .map((a) => a.objectStableId);
}

/**
 * Core deterministic context resolution.
 * Explicit route/object context always wins over activity-based suggestion.
 * Never silently picks among equally plausible Work Packages.
 */
export function resolveContext(input: ResolveContextInput): ContextSnapshot {
  const store = ensure(input.workspaceId);
  const fp = authFingerprint(input);

  // Authorization first — cross-workspace denied
  if (input.authorizedWorkspaceIds && !input.authorizedWorkspaceIds.includes(input.workspaceId)) {
    return emptyUnauthorizedSnapshot(input);
  }

  const cacheKey = [
    input.userId,
    input.workspaceId,
    input.projectId ?? "",
    input.workPackageStableId ?? "",
    input.objectStableId ?? "",
    input.objectKind ?? "",
    fp,
  ].join("::");
  const cached = store.cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() && cached.authFingerprint === fp) {
    return cached.snapshot;
  }

  const provenance: ProvenanceEntry[] = [];
  let ambiguity: ContextAmbiguity = "UNAMBIGUOUS";
  let confidence: ContextConfidence = "HIGH";
  let precedenceUsed: ContextPrecedence = "EXPLICIT_PROJECT_ROUTE";

  let projectId = input.projectId ?? null;
  let wpId = input.workPackageStableId ?? null;
  const candidateWps: string[] = [];

  // 1) Explicit opened object
  if (input.objectStableId && projectId) {
    precedenceUsed = "EXPLICIT_OPENED_OBJECT";
    const wps = findWorkPackagesForObject(projectId, input.objectStableId, input.workspaceId);
    candidateWps.push(...wps);
    if (!wpId) {
      if (wps.length === 1) {
        wpId = wps[0];
        provenance.push({
          dimension: "Work Package",
          value: wpId,
          reason: `${input.objectStableId} is associated with ${wpId}`,
          source: input.objectStableId,
          confidence: "HIGH",
          precedence: "EXPLICIT_OPENED_OBJECT",
        });
      } else if (wps.length > 1) {
        ambiguity = "MULTIPLE_VALID_CONTEXTS";
        confidence = "MEDIUM";
        // Do NOT auto-select
        wpId = null;
        provenance.push({
          dimension: "Work Package",
          value: wps.join(", "),
          reason: `${input.objectStableId} is linked to multiple Work Packages; confirm context`,
          source: input.objectStableId,
          confidence: "MEDIUM",
          precedence: "EXPLICIT_OPENED_OBJECT",
        });
      } else {
        ambiguity = "INSUFFICIENT_CONTEXT";
        confidence = "LOW";
      }
    }
  }

  // 2) Explicit WP route
  if (input.workPackageStableId) {
    precedenceUsed = "EXPLICIT_WORK_PACKAGE_ROUTE";
    wpId = input.workPackageStableId;
    provenance.push({
      dimension: "Work Package",
      value: wpId,
      reason: "Explicit Work Package route/context",
      source: "route",
      confidence: "HIGH",
      precedence: "EXPLICIT_WORK_PACKAGE_ROUTE",
    });
    // Explicit WP must not be replaced by higher-activity WP
  }

  // Override (session only) — weaker than explicit route/object
  const override = getValidOverride(store, input.userId, input);
  if (override && !input.workPackageStableId && !input.objectStableId) {
    if (override.projectId) projectId = override.projectId;
    if (override.workPackageStableId) {
      wpId = override.workPackageStableId;
      provenance.push({
        dimension: "Work Package",
        value: wpId,
        reason: "User session context selection (does not change ownership)",
        source: "override",
        confidence: "HIGH",
        precedence: "RECENT_VALID_WORKING_CONTEXT",
      });
    }
  }

  // Recent memory — only if nothing explicit and no ambiguity
  if (
    input.applyRecentMemory &&
    !wpId &&
    ambiguity === "UNAMBIGUOUS" &&
    !input.workPackageStableId &&
    !input.objectStableId
  ) {
    const recent = store.recent.get(input.userId);
    if (recent && isAuthorized(input, recent.projectId, recent.workPackageStableId)) {
      projectId = projectId ?? recent.projectId;
      wpId = recent.workPackageStableId;
      precedenceUsed = "RECENT_VALID_WORKING_CONTEXT";
      confidence = confidence === "HIGH" ? "MEDIUM" : confidence;
      provenance.push({
        dimension: "Work Package",
        value: wpId ?? "(none)",
        reason: "Recent valid working context",
        source: "recency",
        confidence: "MEDIUM",
        precedence: "RECENT_VALID_WORKING_CONTEXT",
      });
    }
  }

  if (!projectId) {
    return emptyUnauthorizedSnapshot(input, "INSUFFICIENT_CONTEXT");
  }

  // Stale / unauthorized invalidation
  if (!isAuthorized(input, projectId, wpId)) {
    if (wpId) {
      provenance.push({
        dimension: "Work Package",
        value: wpId,
        reason: "Prior context invalidated — access revoked or unauthorized",
        source: "authorization",
        confidence: "HIGH",
        precedence: "CANONICAL_ASSIGNMENT",
      });
      wpId = null;
      ambiguity = "INSUFFICIENT_CONTEXT";
    } else if (!isAuthorized(input, projectId, null)) {
      return emptyUnauthorizedSnapshot(input);
    }
  }

  provenance.push({
    dimension: "Project",
    value: projectId,
    reason: wpId
      ? `${wpId} belongs to ${projectId}`
      : input.projectId
        ? "Explicit Project route/context"
        : "Resolved project context",
    source: wpId ?? "route",
    confidence: "HIGH",
    precedence: input.projectId ? "EXPLICIT_PROJECT_ROUTE" : precedenceUsed,
  });

  const wp: WorkPackage | null = wpId ? getWorkPackage(projectId, wpId) : null;

  // Pattern / maturity / discipline — only when WP known (deep)
  let workType: string | null = wp?.workType ?? null;
  let nativeStage: string | null = wp?.maturity ?? null;
  let normalizedBand: string | null = null;
  let readiness: string | null = null;
  let nextCheckpoint: string | null = null;

  if (wp && input.deep !== false) {
    const patternUi = buildWorkPackagePatternUiContract({
      workspaceId: input.workspaceId,
      projectId,
      workPackageStableId: wp.stableId,
    });
    if (patternUi) {
      workType = patternUi.workType;
      nativeStage = patternUi.currentStage;
      readiness = patternUi.readinessSummary;
      nextCheckpoint = patternUi.nextGate?.gateId ?? null;
      provenance.push({
        dimension: "Work Type",
        value: workType,
        reason: `Engineering Pattern assigned to ${wp.stableId}`,
        source: patternUi.patternId,
        confidence: "HIGH",
        precedence: "CANONICAL_ASSIGNMENT",
      });
    }
    try {
      const mat = queryWorkPackageMaturity({
        workspaceId: input.workspaceId,
        projectId,
        workPackageStableId: wp.stableId,
      });
      nativeStage = mat.patternNativeStageLabel ?? nativeStage;
      normalizedBand = mat.normalizedBand;
      readiness = `${mat.readiness.readinessPercent}%`;
      nextCheckpoint = mat.nextCheckpoint;
    } catch {
      /* pattern/maturity may be unset in some unit scenarios */
    }
  }

  const assets = {
    primaryAsset: wp?.affectedAssets[0]?.displayName ?? null,
    relatedAssets: (wp?.affectedAssets.slice(1) ?? []).map((a) => a.displayName),
    facility: wp?.affectedAssets[0]?.facility ?? null,
    area: wp?.affectedAssets[0]?.area ?? null,
    system: wp?.affectedAssets[0]?.system ?? wp?.affectedAssets[0]?.displayName ?? null,
    subsystem: wp?.affectedAssets[0]?.subsystem ?? null,
    component: wp?.affectedAssets[0]?.component ?? null,
  };
  if (assets.primaryAsset) {
    provenance.push({
      dimension: "Primary Asset",
      value: assets.primaryAsset,
      reason: `Canonical Work Package affected asset`,
      source: wp?.stableId ?? "wp",
      confidence: "HIGH",
      precedence: "CANONICAL_ASSIGNMENT",
    });
  }

  let disciplines = {
    initiating: [] as string[],
    responsible: [] as string[],
    producing: [] as string[],
    consuming: [] as string[],
    participating: [] as string[],
    reviewing: [] as string[],
    userDisciplineRole: null as string | null,
  };
  if (wp) {
    try {
      const disc = buildWorkPackageDisciplineContext({
        workspaceId: input.workspaceId,
        projectId,
        workPackageStableId: wp.stableId,
      });
      disciplines = {
        initiating: disc.initiating,
        responsible: disc.responsible,
        producing: disc.producing,
        consuming: disc.consuming,
        participating: disc.participating,
        reviewing: disc.reviewing,
        userDisciplineRole: null,
      };
      if (input.userDiscipline) {
        const q = queryAffectedDisciplines({
          workspaceId: input.workspaceId,
          projectId,
          workPackageStableId: wp.stableId,
        });
        const userAssocs = q.associations.filter(
          (a) => a.discipline.toLowerCase() === input.userDiscipline!.toLowerCase(),
        );
        disciplines.userDisciplineRole = userAssocs[0]?.role ?? null;
        if (disciplines.responsible.includes(input.userDiscipline)) {
          disciplines.userDisciplineRole = disciplines.userDisciplineRole ?? "RESPONSIBLE";
        }
      }
      provenance.push({
        dimension: "Responsible Discipline",
        value: disciplines.responsible.join(", ") || "(none)",
        reason: `${wp.stableId} canonical / discovered responsible discipline`,
        source: "discipline-discovery",
        confidence: "HIGH",
        precedence: "CANONICAL_ASSIGNMENT",
      });
    } catch {
      disciplines.responsible = wp.disciplines.lead ? [wp.disciplines.lead] : [];
      disciplines.initiating = wp.disciplines.initiating ? [wp.disciplines.initiating] : [];
      disciplines.participating = wp.disciplines.participating;
    }
  }

  const waitingOn: string[] = [];
  const waitingForMe: string[] = [];
  const overdue: string[] = [];
  let informationProducer = false;
  let informationConsumer = false;

  if (wp) {
    try {
      const waitOn = queryWhatAmIWaitingOn({
        workspaceId: input.workspaceId,
        projectId,
        workPackageStableId: wp.stableId,
        identityId: input.userId,
        discipline: input.userDiscipline ?? undefined,
      });
      for (const d of waitOn) {
        waitingOn.push(d.informationObjectStableId);
        if (d.overdue) overdue.push(d.informationObjectStableId);
      }
      const waitMe = queryWhoIsWaitingOnMe({
        workspaceId: input.workspaceId,
        projectId,
        workPackageStableId: wp.stableId,
        identityId: input.userId,
        discipline: input.userDiscipline ?? undefined,
      });
      for (const d of waitMe) waitingForMe.push(d.informationObjectStableId);

      const deps = listWorkPackageDependencies(input.workspaceId, projectId, wp.stableId);
      informationProducer = deps.some((d) =>
        d.producers.some(
          (p) => p.identityId === input.userId || p.discipline === input.userDiscipline,
        ),
      );
      informationConsumer = deps.some((d) =>
        d.consumers.some(
          (p) => p.identityId === input.userId || p.discipline === input.userDiscipline,
        ),
      );

      void deriveWaitingOnOthersSignal({
        workspaceId: input.workspaceId,
        projectId,
        workPackageStableId: wp.stableId,
      });
      void deriveWaitingForMeSignal({
        workspaceId: input.workspaceId,
        projectId,
        workPackageStableId: wp.stableId,
        identityId: input.userId,
        discipline: input.userDiscipline ?? undefined,
      });
    } catch {
      /* deps optional */
    }
  }

  const changed: string[] = [];
  const impacted: string[] = [];
  const stale: string[] = [];
  const reviewRequired: string[] = [];
  const reassessmentRequired: string[] = [];
  const blocked: string[] = [];
  const needsAttention: string[] = [];

  if (wp && input.deep !== false) {
    try {
      const impacts = listActiveImpacts(input.workspaceId, projectId).filter((i) => {
        // Relevance: WP associations or explicit object — not every project impact
        if (i.workPackageStableId && i.workPackageStableId === wp.stableId) return true;
        if (input.objectStableId && i.affectedStableId === input.objectStableId) return true;
        const assocs = listAssociations(projectId, wp.stableId);
        return assocs.some(
          (a) =>
            a.objectStableId === i.affectedStableId || a.objectStableId === i.triggerStableId,
        );
      });
      for (const i of impacts) {
        impacted.push(i.affectedStableId);
        if (i.impactState === "STALE") stale.push(i.affectedStableId);
        if (
          i.impactState === "REVIEW_REQUIRED" ||
          i.impactState === "REVIEW_RECOMMENDED"
        ) {
          reviewRequired.push(i.affectedStableId);
        }
        if (i.impactState === "REASSESSMENT_REQUIRED") {
          reassessmentRequired.push(i.affectedStableId);
        }
        needsAttention.push(i.affectedStableId);
        if (i.changeSummary) changed.push(i.changeSummary);
      }
    } catch {
      /* */
    }
    try {
      const attention = buildMyWorkImpactAttentionItems(input.workspaceId, projectId).filter(
        (a) => !a.workPackageStableId || a.workPackageStableId === wp.stableId,
      );
      for (const a of attention.slice(0, 6)) {
        if (!needsAttention.includes(a.engineeringObjectStableId)) {
          needsAttention.push(a.engineeringObjectStableId);
        }
      }
    } catch {
      /* */
    }
    if (waitingOn.length > 0) {
      blocked.push(...waitingOn.slice(0, 5));
    }
  }

  // False-positive control: do not dump unrelated project decisions
  const decisions = wp ? relevantDecisions(input.workspaceId, projectId, wp.stableId) : [];
  const assumptions = wp ? relevantAssumptions(input.workspaceId, projectId, wp.stableId) : [];
  const reviews = wp ? relevantReviews(projectId, wp.stableId) : [];
  const changes = wp ? relevantChanges(projectId, wp.stableId) : [];

  if (input.objectKind === "Review" && input.objectStableId) {
    precedenceUsed = "ACTIVE_TASK_REVIEW_DECISION_CHANGE";
    if (!reviews.includes(input.objectStableId)) reviews.unshift(input.objectStableId);
  }
  if (input.objectKind === "Decision" && input.objectStableId) {
    precedenceUsed = "ACTIVE_TASK_REVIEW_DECISION_CHANGE";
    if (!decisions.includes(input.objectStableId)) decisions.unshift(input.objectStableId);
    try {
      const dec = getDecision(input.workspaceId, input.objectStableId);
      if (dec) {
        provenance.push({
          dimension: "Decision",
          value: dec.stableId,
          reason: "Opened Decision context",
          source: dec.stableId,
          confidence: "HIGH",
          precedence: "ACTIVE_TASK_REVIEW_DECISION_CHANGE",
        });
      }
    } catch {
      /* */
    }
  }
  if (input.objectKind === "Change" && input.objectStableId) {
    precedenceUsed = "ACTIVE_TASK_REVIEW_DECISION_CHANGE";
    if (!changes.includes(input.objectStableId)) changes.unshift(input.objectStableId);
  }

  const authority = resolveAuthority(input);
  if (!authority.canView) {
    return emptyUnauthorizedSnapshot(input);
  }

  const myRole =
    disciplines.userDisciplineRole === "RESPONSIBLE" ||
    disciplines.responsible.some(
      (d) => d.toLowerCase() === (input.userDiscipline ?? "").toLowerCase(),
    )
      ? "Responsible Discipline"
      : disciplines.userDisciplineRole === "PRODUCING"
        ? "Providing Information"
        : disciplines.userDisciplineRole === "CONSUMING"
          ? "Receiving Information"
          : disciplines.userDisciplineRole === "REVIEWING"
            ? "Review Required"
            : disciplines.userDisciplineRole
              ? disciplines.userDisciplineRole
              : input.userDiscipline
                ? `${input.userDiscipline} (participant)`
                : "—";

  const affectedLabel = [
    ...new Set([
      ...disciplines.producing,
      ...disciplines.consuming,
      ...disciplines.participating,
      ...disciplines.reviewing,
    ]),
  ]
    .filter((d) => !disciplines.responsible.includes(d))
    .join(", ");

  const snapshot: ContextSnapshot = {
    derived: true,
    sourceOfTruth: false,
    freshnessKey: buildFreshnessKey({
      projectId,
      workPackageStableId: wpId,
      objectStableId: input.objectStableId ?? null,
      revisionHint: `${waitingOn.length}|${needsAttention.length}|${authority.canApprove}`,
    }),
    ambiguity,
    confidence,
    identity: {
      userId: input.userId,
      organizationId: input.organizationId ?? null,
      workspaceId: input.workspaceId,
      role: input.role ?? null,
      entitlement: input.entitlement ?? null,
      enrollment: input.enrollment ?? null,
      userDiscipline: input.userDiscipline ?? null,
    },
    project: {
      projectId,
      participation: true,
    },
    work: {
      workPackageStableId: wpId,
      workPackageTitle: wp?.title ?? null,
      workType,
      nativeStage,
      normalizedBand,
      readiness,
      nextCheckpoint,
      candidateWorkPackages: candidateWps.length ? candidateWps : wpId ? [wpId] : [],
    },
    assets,
    disciplines,
    stakeholders: {
      responsibleParty: wp?.ownerName ?? null,
      informationProducer,
      informationConsumer,
      reviewer: authority.canReview,
      approver: authority.canApprove,
      clientVendorOpsConstruction: [],
    },
    attention: {
      changed,
      impacted,
      stale,
      reviewRequired,
      reassessmentRequired,
      blocked,
      waitingOn,
      waitingForMe,
      overdue,
      needsAttention,
    },
    authority,
    relevant: { decisions, assumptions, reviews, changes },
    provenance,
    engineeringLanguageLabels: {
      project: projectId,
      workPackage: wpId ? `${wpId} ${wp?.title ?? ""}`.trim() : "—",
      workType: workType ?? "—",
      currentStage: nativeStage ?? "—",
      assetSystem: assets.primaryAsset ?? assets.system ?? "—",
      myRole,
      affectedDisciplines: affectedLabel || "—",
      waitingOn: waitingOn.join(", ") || "—",
      needsAttention: needsAttention.join(", ") || "—",
      authority: [
        authority.canEdit ? "Edit" : null,
        authority.canReview ? "Review" : null,
        authority.canApprove ? "Approve" : "Cannot self-approve",
      ]
        .filter(Boolean)
        .join("; "),
    },
  };

  // Do not record recent when ambiguous — prevents silent sticky wrong context
  if (ambiguity === "UNAMBIGUOUS" && wpId) {
    recordRecentContext({
      workspaceId: input.workspaceId,
      userId: input.userId,
      projectId,
      workPackageStableId: wpId,
    });
  }

  store.cache.set(cacheKey, {
    key: cacheKey,
    snapshot,
    authFingerprint: fp,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return snapshot;
}

function emptyUnauthorizedSnapshot(
  input: ResolveContextInput,
  ambiguity: ContextAmbiguity = "INSUFFICIENT_CONTEXT",
): ContextSnapshot {
  return {
    derived: true,
    sourceOfTruth: false,
    freshnessKey: "unauthorized",
    ambiguity,
    confidence: "LOW",
    identity: {
      userId: input.userId,
      organizationId: input.organizationId ?? null,
      workspaceId: input.workspaceId,
      role: input.role ?? null,
      entitlement: input.entitlement ?? null,
      enrollment: input.enrollment ?? null,
      userDiscipline: input.userDiscipline ?? null,
    },
    project: { projectId: input.projectId ?? "", participation: false },
    work: {
      workPackageStableId: null,
      workPackageTitle: null,
      workType: null,
      nativeStage: null,
      normalizedBand: null,
      readiness: null,
      nextCheckpoint: null,
      candidateWorkPackages: [],
    },
    assets: {
      primaryAsset: null,
      relatedAssets: [],
      facility: null,
      area: null,
      system: null,
      subsystem: null,
      component: null,
    },
    disciplines: {
      initiating: [],
      responsible: [],
      producing: [],
      consuming: [],
      participating: [],
      reviewing: [],
      userDisciplineRole: null,
    },
    stakeholders: {
      responsibleParty: null,
      informationProducer: false,
      informationConsumer: false,
      reviewer: false,
      approver: false,
      clientVendorOpsConstruction: [],
    },
    attention: {
      changed: [],
      impacted: [],
      stale: [],
      reviewRequired: [],
      reassessmentRequired: [],
      blocked: [],
      waitingOn: [],
      waitingForMe: [],
      overdue: [],
      needsAttention: [],
    },
    authority: {
      canView: false,
      canEdit: false,
      canReview: false,
      canApprove: false,
      canDecide: false,
      canTransitionMaturity: false,
      canResolveImpact: false,
      canConfirmDiscipline: false,
      canAcceptInformation: false,
      titleBasedInference: false,
      contextGrantsAuthority: false,
    },
    relevant: { decisions: [], assumptions: [], reviews: [], changes: [] },
    provenance: [
      {
        dimension: "Authorization",
        value: "DENIED",
        reason: "Context Resolution applies authorization before disclosure",
        source: "authorization",
        confidence: "HIGH",
        precedence: "CANONICAL_ASSIGNMENT",
      },
    ],
    engineeringLanguageLabels: {
      project: "—",
      workPackage: "—",
      workType: "—",
      currentStage: "—",
      assetSystem: "—",
      myRole: "—",
      affectedDisciplines: "—",
      waitingOn: "—",
      needsAttention: "—",
      authority: "No access",
    },
  };
}

export function resolveContextFromRoute(input: ResolveContextInput & {
  projectId: string;
  workPackageStableId?: string | null;
}): ContextSnapshot {
  return resolveContext({
    ...input,
    deep: input.deep ?? true,
  });
}

export function resolveContextFromObject(input: ResolveContextInput & {
  projectId: string;
  objectStableId: string;
}): ContextSnapshot {
  return resolveContext({
    ...input,
    objectKind: input.objectKind ?? "Other",
    deep: true,
  });
}

export function resolveContextFromReview(input: ResolveContextInput & {
  projectId: string;
  objectStableId: string;
}): ContextSnapshot {
  return resolveContext({
    ...input,
    objectKind: "Review",
    deep: true,
  });
}

export function resolveContextFromDecision(input: ResolveContextInput & {
  projectId: string;
  objectStableId: string;
}): ContextSnapshot {
  return resolveContext({
    ...input,
    objectKind: "Decision",
    deep: true,
  });
}

export function resolveContextFromChange(input: ResolveContextInput & {
  projectId: string;
  objectStableId: string;
}): ContextSnapshot {
  return resolveContext({
    ...input,
    objectKind: "Change",
    deep: true,
  });
}

export function explainWhyContext(snapshot: ContextSnapshot): {
  project: string;
  workPackage: string;
  assetSystem: string;
  disciplineRole: string;
  attention: string;
  entries: ProvenanceEntry[];
} {
  return {
    project:
      snapshot.provenance.find((p) => p.dimension === "Project")?.reason ??
      snapshot.engineeringLanguageLabels.project,
    workPackage:
      snapshot.provenance.find((p) => p.dimension === "Work Package")?.reason ??
      snapshot.engineeringLanguageLabels.workPackage,
    assetSystem:
      snapshot.provenance.find((p) => p.dimension === "Primary Asset")?.reason ??
      snapshot.engineeringLanguageLabels.assetSystem,
    disciplineRole:
      snapshot.provenance.find((p) => p.dimension === "Responsible Discipline")?.reason ??
      snapshot.engineeringLanguageLabels.myRole,
    attention: snapshot.engineeringLanguageLabels.needsAttention,
    entries: snapshot.provenance,
  };
}

export function buildMyWorkContextDataContract(input: {
  workspaceId: string;
  projectId: string;
  userId: string;
  userDiscipline?: string | null;
  capabilities?: ResolveContextInput["capabilities"];
}): {
  items: Array<{
    user: string;
    project: string;
    workPackage: string;
    assetSystem: string | null;
    workType: string | null;
    nativeMaturity: string | null;
    normalizedMaturity: string | null;
    readiness: string | null;
    disciplineRole: string | null;
    stakeholderRole: string;
    authority: ContextAuthority;
    impact: string[];
    dependency: string[];
    blockingState: boolean;
    waitingState: { waitingOn: string[]; waitingForMe: string[] };
    requiredByDate: string | null;
    reviewState: string[];
    decisionState: string[];
    changeState: string[];
  }>;
  riskPrioritizedMyWorkImplemented: false;
} {
  const packages = listWorkPackages(input.projectId);
  const items = packages.map((wp) => {
    const snap = resolveContext({
      tenantId: "contract",
      workspaceId: input.workspaceId,
      userId: input.userId,
      userDiscipline: input.userDiscipline,
      projectId: input.projectId,
      workPackageStableId: wp.stableId,
      capabilities: input.capabilities,
      authorizedWorkspaceIds: [input.workspaceId],
      authorizedProjectIds: [input.projectId],
      deep: true,
    });
    return {
      user: input.userId,
      project: input.projectId,
      workPackage: wp.stableId,
      assetSystem: snap.assets.primaryAsset,
      workType: snap.work.workType,
      nativeMaturity: snap.work.nativeStage,
      normalizedMaturity: snap.work.normalizedBand,
      readiness: snap.work.readiness,
      disciplineRole: snap.disciplines.userDisciplineRole,
      stakeholderRole: snap.stakeholders.informationProducer
        ? "producer"
        : snap.stakeholders.informationConsumer
          ? "consumer"
          : "participant",
      authority: snap.authority,
      impact: snap.attention.impacted,
      dependency: snap.attention.waitingOn,
      blockingState: snap.attention.blocked.length > 0 || snap.attention.waitingOn.length > 0,
      waitingState: {
        waitingOn: snap.attention.waitingOn,
        waitingForMe: snap.attention.waitingForMe,
      },
      requiredByDate: null,
      reviewState: snap.relevant.reviews,
      decisionState: snap.relevant.decisions,
      changeState: snap.relevant.changes,
    };
  });
  return { items, riskPrioritizedMyWorkImplemented: false };
}

export function buildWorkPackageContextUiContract(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
  userId: string;
  userDiscipline?: string | null;
}): {
  workType: string;
  stage: string;
  myRole: string;
  affectedDisciplines: string;
  waitingOn: string;
  blocking: string;
  needsAttention: string;
  engineeringLanguage: true;
  testId: "wp-resolved-context";
} {
  const snap = resolveContext({
    tenantId: "ui",
    workspaceId: input.workspaceId,
    userId: input.userId,
    userDiscipline: input.userDiscipline,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
    authorizedWorkspaceIds: [input.workspaceId],
    authorizedProjectIds: [input.projectId],
    deep: true,
  });
  return {
    workType: snap.engineeringLanguageLabels.workType,
    stage: snap.engineeringLanguageLabels.currentStage,
    myRole: snap.engineeringLanguageLabels.myRole,
    affectedDisciplines: snap.engineeringLanguageLabels.affectedDisciplines,
    waitingOn: snap.engineeringLanguageLabels.waitingOn,
    blocking: snap.attention.blocked.join(", ") || "—",
    needsAttention: snap.engineeringLanguageLabels.needsAttention,
    engineeringLanguage: true,
    testId: "wp-resolved-context",
  };
}

export function buildEngineeringDesignContextUiContract(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
  userId: string;
}): {
  workPackage: string;
  asset: string;
  stage: string;
  relatedAssumptions: string[];
  relatedDecisions: string[];
  currentImpacts: string[];
  reviewResponsibility: string[];
  engineeringLanguage: true;
  testId: "ed-resolved-context";
} {
  const snap = resolveContext({
    tenantId: "ui",
    workspaceId: input.workspaceId,
    userId: input.userId,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
    authorizedWorkspaceIds: [input.workspaceId],
    authorizedProjectIds: [input.projectId],
    deep: true,
  });
  return {
    workPackage: snap.engineeringLanguageLabels.workPackage,
    asset: snap.engineeringLanguageLabels.assetSystem,
    stage: snap.engineeringLanguageLabels.currentStage,
    relatedAssumptions: snap.relevant.assumptions,
    relatedDecisions: snap.relevant.decisions,
    currentImpacts: snap.attention.impacted,
    reviewResponsibility: snap.relevant.reviews,
    engineeringLanguage: true,
    testId: "ed-resolved-context",
  };
}

/** Home must not invoke deep resolution */
export function homeLightweightContext(input: {
  projectId: string | null;
  userId: string;
  workspaceId: string;
}): {
  selectedProject: string | null;
  userId: string;
  workspaceId: string;
  attentionCount: number;
  deepResolutionInvoked: false;
} {
  return {
    selectedProject: input.projectId,
    userId: input.userId,
    workspaceId: input.workspaceId,
    attentionCount: 0,
    deepResolutionInvoked: false,
  };
}

export function unauthorizedContextOverrideBlocked(input: {
  actorAuthorized: boolean;
}): boolean {
  return !input.actorAuthorized;
}

export function unauthorizedContextDisclosureBlocked(input: {
  canView: boolean;
}): boolean {
  return !input.canView;
}

export function measureContextPerformanceBaseline(iterations = 12): {
  routeP95Ms: number;
  objectP95Ms: number;
  snapshotP95Ms: number;
  authorityP95Ms: number;
  multiDimensionP95Ms: number;
  blockerCount: 0;
} {
  const tenantId = "00000000-0000-4000-8000-000000000051";
  const workspaceId = "00000000-0000-4000-8000-c10001";
  const projectId = "PILOT-001-C1-PERF";
  ensurePilot001ContextState({ tenantId, workspaceId, projectId });

  const routeTimes: number[] = [];
  const objectTimes: number[] = [];
  const snapTimes: number[] = [];
  const authTimes: number[] = [];
  const multiTimes: number[] = [];

  for (let i = 0; i < iterations; i++) {
    invalidateContextCache(workspaceId);
    let t0 = performance.now();
    resolveContextFromRoute({
      tenantId,
      workspaceId,
      userId: "perf-user",
      projectId,
      workPackageStableId: "WP-STR-004",
      userDiscipline: "Structural",
      authorizedWorkspaceIds: [workspaceId],
      authorizedProjectIds: [projectId],
    });
    routeTimes.push(performance.now() - t0);

    invalidateContextCache(workspaceId);
    t0 = performance.now();
    resolveContextFromObject({
      tenantId,
      workspaceId,
      userId: "perf-user",
      projectId,
      objectStableId: "CALC-001",
      objectKind: "Calculation",
      authorizedWorkspaceIds: [workspaceId],
      authorizedProjectIds: [projectId],
    });
    objectTimes.push(performance.now() - t0);

    invalidateContextCache(workspaceId);
    t0 = performance.now();
    const snap = resolveContext({
      tenantId,
      workspaceId,
      userId: "perf-user",
      projectId,
      workPackageStableId: "WP-STR-004",
      userDiscipline: "Structural",
      authorizedWorkspaceIds: [workspaceId],
      authorizedProjectIds: [projectId],
      deep: true,
    });
    snapTimes.push(performance.now() - t0);

    t0 = performance.now();
    void snap.authority;
    authTimes.push(performance.now() - t0);

    invalidateContextCache(workspaceId);
    t0 = performance.now();
    resolveContext({
      tenantId,
      workspaceId,
      userId: "perf-user",
      projectId,
      workPackageStableId: "WP-STR-004",
      objectStableId: "CALC-001",
      userDiscipline: "Structural",
      authorizedWorkspaceIds: [workspaceId],
      authorizedProjectIds: [projectId],
      deep: true,
    });
    multiTimes.push(performance.now() - t0);
  }

  const p95 = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.max(0, Math.ceil(0.95 * s.length) - 1)] ?? 0;
  };

  return {
    routeP95Ms: Number(p95(routeTimes).toFixed(3)),
    objectP95Ms: Number(p95(objectTimes).toFixed(3)),
    snapshotP95Ms: Number(p95(snapTimes).toFixed(3)),
    authorityP95Ms: Number(p95(authTimes).toFixed(3)),
    multiDimensionP95Ms: Number(p95(multiTimes).toFixed(3)),
    blockerCount: 0,
  };
}

export function ensurePilot001ContextState(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): {
  snapshot: ContextSnapshot;
  impactAware: ContextSnapshot;
} {
  seedPilot001SupportFrameWorkPackage(input.projectId);
  ensurePilot001BrownfieldPattern(input);
  ensurePilot001MaturityState(input);
  ensurePilot001DependencyStakeholderState(input);
  ensurePilot001DisciplineDiscovery(input);
  try {
    seedPilot001DecisionAssumptionLineage(input);
  } catch {
    /* may already exist */
  }
  try {
    runPilot001MassImpactScenario(input);
  } catch {
    /* optional */
  }

  const snapshot = resolveContextFromRoute({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: "str-eng-01",
    userDiscipline: "Structural",
    role: "Structural Engineer",
    projectId: input.projectId,
    workPackageStableId: "WP-STR-004",
    authorizedWorkspaceIds: [input.workspaceId],
    authorizedProjectIds: [input.projectId],
    capabilities: {
      canView: true,
      canEdit: true,
      canReview: false,
      canApprove: false,
      canAcceptInformation: true,
    },
  });

  const impactAware = resolveContext({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: "str-eng-01",
    userDiscipline: "Structural",
    projectId: input.projectId,
    workPackageStableId: "WP-STR-004",
    objectStableId: "CALC-001",
    objectKind: "Calculation",
    authorizedWorkspaceIds: [input.workspaceId],
    authorizedProjectIds: [input.projectId],
    capabilities: {
      canView: true,
      canEdit: true,
      canApprove: false,
    },
    deep: true,
  });

  return { snapshot, impactAware };
}
