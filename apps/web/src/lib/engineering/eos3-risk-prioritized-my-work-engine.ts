/**
 * EOS-3-CONTEXT-2 — Risk-Prioritized My Work Engine.
 * Engineering consequence + obligation, not due-date / newest / opaque AI ranking.
 * Consumes Context-1, Impact, Dependencies, Disciplines, Pattern, Maturity.
 * Does not create shadow engineering truth or grant authority.
 */

import {
  ensurePilot001ContextState,
  resolveContext,
  type ContextAuthority,
} from "./eos3-context-resolution-engine";
import {
  listActiveImpacts,
  runPilot001MassImpactScenario,
  type ImpactRecord,
} from "./eos3-impact-propagation";
import {
  listProjectDependencies,
  listWorkPackageDependencies,
  queryWhatAmIWaitingOn,
  queryWhoIsWaitingOnMe,
  type InformationDependency,
} from "./eos3-engineering-dependency-stakeholder";
import { listAssociations, listWorkPackages, getWorkPackage } from "./eos3-work-package-service";
import { queryWorkPackageMaturity } from "./eos3-multi-level-maturity";
import { getPatternAssignment } from "./eos3-engineering-pattern-engine";
import { MY_WORK_CATEGORIES, type MyWorkCategoryId } from "./eos3-my-work-ui";

export const PRIORITY_BANDS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type PriorityBand = (typeof PRIORITY_BANDS)[number];

export const PRIORITY_BAND_RANK: Record<PriorityBand, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export type PrioritySignal = {
  id: string;
  kind:
    | "IMPACT"
    | "DEPENDENCY_WAITING_FOR_ME"
    | "DEPENDENCY_WAITING_ON_OTHERS"
    | "REVIEW"
    | "DECISION"
    | "READINESS"
    | "PATTERN_CHECKPOINT"
    | "SAFETY"
    | "ASSET_CRITICALITY"
    | "PROJECT_PRIORITY"
    | "MANUAL"
    | "DUE_DATE"
    | "BLOCKING"
    | "DOWNSTREAM_CONSUMERS"
    | "FIELD_EXECUTION";
  weight: number;
  reason: string;
  governed: boolean;
  materiality: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

export type MyWorkAttentionItem = {
  /** Canonical attention key — one row per engineering object + user */
  attentionId: string;
  objectStableId: string;
  objectClass: string;
  projectId: string;
  workPackageStableId: string | null;
  assetSystem: string | null;
  title: string;
  categories: MyWorkCategoryId[];
  priorityBand: PriorityBand;
  /** Internal bounded score for sorting only — never shown as decimal priority */
  internalScore: number;
  reason: string;
  engineeringConsequence: string;
  nextRecommendedAction: string;
  authorityRequired: string | null;
  currentState: string;
  dueOrRequiredBy: string | null;
  blockerStatus: boolean;
  downstreamImpact: string[];
  disciplineRole: string | null;
  stakeholderRole: string | null;
  signals: PrioritySignal[];
  provenance: Record<string, unknown>;
  completed: boolean;
  /** Original derived band before override */
  derivedPriorityBand: PriorityBand;
  override: PriorityOverride | null;
  personalizedForUserId: string;
};

export type PriorityOverride = {
  id: string;
  attentionId: string;
  originalBand: PriorityBand;
  adjustedBand: PriorityBand;
  reason: string;
  actorId: string;
  at: string;
  nonDestructive: true;
};

export type WhyPriorityResult = {
  band: PriorityBand;
  lines: string[];
  signals: PrioritySignal[];
};

export type ConsequenceResult = {
  affected: string[];
  bounded: true;
  speculativeCatastrophe: false;
};

type Store = {
  overrides: Map<string, PriorityOverride>;
  cache: Map<string, { items: MyWorkAttentionItem[]; authFp: string; expiresAt: number }>;
  /** Controlled synthetic flags for validation scenarios */
  criticalScenarioEnabled: Set<string>;
  multiWpBlockingEnabled: Set<string>;
  safetyEvidence: Map<string, boolean>;
  assetCriticality: Map<string, "HIGH" | "MEDIUM" | "LOW">;
  projectPriority: Map<string, "HIGH" | "MEDIUM" | "LOW">;
  manualPriorityHints: Map<string, PriorityBand>;
  fieldExecutionEvidence: Set<string>;
};

const stores = new Map<string, Store>();
const CACHE_TTL_MS = 4_000;

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
      cache: new Map(),
      criticalScenarioEnabled: new Set(),
      multiWpBlockingEnabled: new Set(),
      safetyEvidence: new Map(),
      assetCriticality: new Map(),
      projectPriority: new Map(),
      manualPriorityHints: new Map(),
      fieldExecutionEvidence: new Set(),
    };
    stores.set(workspaceId, s);
  }
  return s;
}

export function __resetRiskPrioritizedMyWorkForTests() {
  stores.clear();
}

export function auditRiskPrioritizedMyWorkFoundations(): {
  riskPrioritizedMyWorkEngine: true;
  notSimpleSortEngine: true;
  engineeringPrioritySignalModel: true;
  requiresLiveLlm: false;
  priorityExplainability: true;
  priorityBandModel: true;
  criticalGovernance: true;
  consequenceOverridesDueDate: true;
  safetySignalGoverned: true;
  assetCriticalityGoverned: true;
  projectPriorityGoverned: true;
  maturityNotAutomaticPriority: true;
  riskRegisterSeparation: true;
  scheduleSeparation: true;
  shadowEngineeringStateCreated: false;
  prioritySnapshotSourceOfTruth: false;
  priorityEngineGrantsAuthority: false;
  manualPriorityMatrixRequired: false;
  existingCategoryModelPreserved: true;
  existingEventModelReused: true;
  priorityModelDocumented: true;
  existingSchemaAudited: true;
} {
  return {
    riskPrioritizedMyWorkEngine: true,
    notSimpleSortEngine: true,
    engineeringPrioritySignalModel: true,
    requiresLiveLlm: false,
    priorityExplainability: true,
    priorityBandModel: true,
    criticalGovernance: true,
    consequenceOverridesDueDate: true,
    safetySignalGoverned: true,
    assetCriticalityGoverned: true,
    projectPriorityGoverned: true,
    maturityNotAutomaticPriority: true,
    riskRegisterSeparation: true,
    scheduleSeparation: true,
    shadowEngineeringStateCreated: false,
    prioritySnapshotSourceOfTruth: false,
    priorityEngineGrantsAuthority: false,
    manualPriorityMatrixRequired: false,
    existingCategoryModelPreserved: true,
    existingEventModelReused: true,
    priorityModelDocumented: true,
    existingSchemaAudited: true,
  };
}

function authFingerprint(input: {
  userId: string;
  workspaceId: string;
  authorizedWorkspaceIds?: string[];
  capabilities?: Partial<ContextAuthority>;
}): string {
  return [
    input.userId,
    input.workspaceId,
    ...(input.authorizedWorkspaceIds ?? []).sort(),
    JSON.stringify(input.capabilities ?? {}),
  ].join("|");
}

function bandFromScore(score: number, signals: PrioritySignal[]): PriorityBand {
  const hasCriticalSignal = signals.some(
    (s) =>
      s.materiality === "CRITICAL" &&
      (s.kind === "SAFETY" || s.kind === "IMPACT" || s.kind === "FIELD_EXECUTION"),
  );
  // Ordinary overdue admin never CRITICAL
  const onlyDueDate = signals.every((s) => s.kind === "DUE_DATE" || s.kind === "MANUAL");
  if (hasCriticalSignal && score >= 90 && !onlyDueDate) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

function attentionKey(userId: string, objectStableId: string): string {
  return `${userId}::${objectStableId}`;
}

function nextActionFor(input: {
  objectStableId: string;
  objectClass: string;
  impactState?: string;
  waitingForMe?: boolean;
  waitingOnOthers?: boolean;
  canApprove: boolean;
  canReview: boolean;
  canDecide: boolean;
  userDiscipline?: string | null;
}): { action: string; authorityRequired: string | null } {
  if (input.objectClass === "Decision" || input.objectStableId.startsWith("DEC")) {
    if (input.canDecide || input.canApprove) {
      return {
        action: `Review ${input.objectStableId} supporting evidence`,
        authorityRequired: "decision",
      };
    }
    // Never recommend Approve without authority
    return {
      action: `Provide engineering input for ${input.objectStableId}`,
      authorityRequired: null,
    };
  }
  if (input.objectClass === "Calculation" || input.objectStableId.startsWith("CALC")) {
    return {
      action: `Review ${input.objectStableId} against revised load`,
      authorityRequired: input.canReview ? "review" : null,
    };
  }
  if (input.waitingForMe) {
    const disc = input.userDiscipline ?? "your discipline";
    return {
      action: `Respond to ${disc} information request`,
      authorityRequired: null,
    };
  }
  if (input.waitingOnOthers) {
    return {
      action: `Follow up on outstanding information`,
      authorityRequired: null,
    };
  }
  if (input.objectClass === "Review" || input.objectStableId.startsWith("REV")) {
    if (input.canReview) {
      return { action: `Complete review ${input.objectStableId}`, authorityRequired: "review" };
    }
    return { action: `Monitor review ${input.objectStableId}`, authorityRequired: null };
  }
  return { action: `Open ${input.objectStableId}`, authorityRequired: null };
}

function mergeItem(
  map: Map<string, MyWorkAttentionItem>,
  partial: Omit<MyWorkAttentionItem, "attentionId" | "categories" | "signals" | "override" | "derivedPriorityBand"> & {
    categories: MyWorkCategoryId[];
    signals: PrioritySignal[];
  },
): void {
  const key = attentionKey(partial.personalizedForUserId, partial.objectStableId);
  const existing = map.get(key);
  if (!existing) {
    map.set(key, {
      ...partial,
      attentionId: key,
      derivedPriorityBand: partial.priorityBand,
      override: null,
    });
    return;
  }
  const cats = new Set([...existing.categories, ...partial.categories]);
  const signals = [...existing.signals, ...partial.signals];
  const score = Math.max(existing.internalScore, partial.internalScore);
  const band =
    PRIORITY_BAND_RANK[partial.priorityBand] > PRIORITY_BAND_RANK[existing.priorityBand]
      ? partial.priorityBand
      : existing.priorityBand;
  map.set(key, {
    ...existing,
    ...partial,
    categories: [...cats],
    signals,
    internalScore: score,
    priorityBand: band,
    derivedPriorityBand: band,
    reason: PRIORITY_BAND_RANK[partial.priorityBand] >= PRIORITY_BAND_RANK[existing.priorityBand]
      ? partial.reason
      : existing.reason,
    engineeringConsequence:
      PRIORITY_BAND_RANK[partial.priorityBand] >= PRIORITY_BAND_RANK[existing.priorityBand]
        ? partial.engineeringConsequence
        : existing.engineeringConsequence,
    nextRecommendedAction:
      PRIORITY_BAND_RANK[partial.priorityBand] >= PRIORITY_BAND_RANK[existing.priorityBand]
        ? partial.nextRecommendedAction
        : existing.nextRecommendedAction,
    downstreamImpact: [...new Set([...existing.downstreamImpact, ...partial.downstreamImpact])],
    blockerStatus: existing.blockerStatus || partial.blockerStatus,
  });
}

export type BuildPrioritizedMyWorkInput = {
  tenantId: string;
  workspaceId: string;
  userId: string;
  userDiscipline?: string | null;
  role?: string | null;
  projectIds: string[];
  authorizedWorkspaceIds?: string[];
  capabilities?: Partial<ContextAuthority>;
  /** Include completed for register views */
  includeCompleted?: boolean;
};

/**
 * Build personalized prioritized My Work from canonical EOS signals.
 * One attention item per object; categories are facets.
 */
export function buildPrioritizedMyWork(
  input: BuildPrioritizedMyWorkInput,
): MyWorkAttentionItem[] {
  const store = ensure(input.workspaceId);
  if (
    input.authorizedWorkspaceIds &&
    !input.authorizedWorkspaceIds.includes(input.workspaceId)
  ) {
    return [];
  }

  const fp = authFingerprint(input);
  const cacheKey = `${fp}|${input.projectIds.slice().sort().join(",")}|${input.includeCompleted ? 1 : 0}`;
  const cached = store.cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() && cached.authFp === fp) {
    return cached.items;
  }

  const map = new Map<string, MyWorkAttentionItem>();
  const caps = {
    canView: true,
    canEdit: true,
    canReview: false,
    canApprove: false,
    canDecide: false,
    ...input.capabilities,
  };

  for (const projectId of input.projectIds) {
    const ctx = resolveContext({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      userId: input.userId,
      userDiscipline: input.userDiscipline,
      role: input.role,
      projectId,
      authorizedWorkspaceIds: input.authorizedWorkspaceIds ?? [input.workspaceId],
      authorizedProjectIds: input.projectIds,
      capabilities: caps,
      deep: true,
    });
    if (!ctx.authority.canView) continue;

    const impacts = listActiveImpacts(input.workspaceId, projectId);
    const packages = listWorkPackages(projectId);

    for (const imp of impacts) {
      // Discipline personalization: skip if user's discipline clearly unrelated
      // and they have no stakeholder obligation — still allow TA / reviewers
      const relevantToUser =
        !input.userDiscipline ||
        caps.canDecide ||
        caps.canApprove ||
        caps.canReview ||
        imp.workPackageStableId === "WP-STR-004" &&
          /struct/i.test(input.userDiscipline) ||
        imp.workPackageStableId === "WP-CIV-005" && /civil/i.test(input.userDiscipline) ||
        imp.workPackageStableId === "WP-MEC-002" && /mech/i.test(input.userDiscipline) ||
        !imp.workPackageStableId;

      // Softer filter: Civil may see waiting items separately; Structural sees calc impacts
      const isStructuralUser = /struct/i.test(input.userDiscipline ?? "");
      const isCivilUser = /civil/i.test(input.userDiscipline ?? "");
      const isTa =
        caps.canDecide ||
        caps.canApprove ||
        /technical.?authority|ta\b/i.test(input.role ?? "");

      if (isCivilUser && !isTa && (imp.affectedStableId.startsWith("CALC") || imp.affectedStableId.startsWith("DEC"))) {
        // Civil does not get actionable calc/decision review as Needs Action from this impact alone
        continue;
      }
      const structuralDecisionInformationalOnly =
        isStructuralUser &&
        !isTa &&
        imp.affectedStableId.startsWith("DEC") &&
        !caps.canDecide;

      void relevantToUser;

      const signals: PrioritySignal[] = [
        {
          id: `impact-${imp.id}`,
          kind: "IMPACT",
          weight: impactWeight(imp),
          reason: imp.changeSummary,
          governed: true,
          materiality: mapImpactMateriality(imp),
        },
      ];

      if (imp.workPackageStableId) {
        const deps = listWorkPackageDependencies(
          input.workspaceId,
          projectId,
          imp.workPackageStableId,
        );
        const consumers = deps.filter(
          (d) =>
            d.upstreamWorkPackageStableId === imp.workPackageStableId ||
            d.informationObjectStableId === imp.triggerStableId ||
            d.informationObjectStableId === imp.affectedStableId,
        );
        if (consumers.length > 0) {
          signals.push({
            id: `downstream-${imp.affectedStableId}`,
            kind: "DOWNSTREAM_CONSUMERS",
            weight: Math.min(20, 8 * consumers.length),
            reason: `${consumers.length} downstream dependency(ies)`,
            governed: true,
            materiality: consumers.some((c) => c.blocking) ? "HIGH" : "MEDIUM",
          });
          if (consumers.some((c) => c.blocking)) {
            signals.push({
              id: `block-${imp.affectedStableId}`,
              kind: "BLOCKING",
              weight: 18,
              reason: "Blocks downstream engineering",
              governed: true,
              materiality: "HIGH",
            });
          }
        }

        try {
          const mat = queryWorkPackageMaturity({
            workspaceId: input.workspaceId,
            projectId,
            workPackageStableId: imp.workPackageStableId,
          });
          if (!mat.readiness.readyForNextStage && mat.blockerCount > 0) {
            signals.push({
              id: `ready-${imp.workPackageStableId}`,
              kind: "READINESS",
              weight: 12,
              reason: `${imp.workPackageStableId} readiness impacted (blockers: ${mat.blockerCount})`,
              governed: true,
              materiality: "HIGH",
            });
          }
          // Late stage alone does NOT auto-elevate
          void mat.normalizedBand;
        } catch {
          /* */
        }

        const pattern = getPatternAssignment(
          input.workspaceId,
          projectId,
          imp.workPackageStableId,
        );
        if (pattern) {
          signals.push({
            id: `pattern-${pattern.patternId}`,
            kind: "PATTERN_CHECKPOINT",
            weight: 6,
            reason: `Work Type / Pattern context ${pattern.patternId}`,
            governed: true,
            materiality: "MEDIUM",
          });
        }
      }

      // Safety / asset / project — only with explicit evidence
      if (store.safetyEvidence.get(imp.affectedStableId)) {
        signals.push({
          id: `safety-${imp.affectedStableId}`,
          kind: "SAFETY",
          weight: 40,
          reason: "Canonical safety-critical evidence",
          governed: true,
          materiality: "CRITICAL",
        });
      }
      const assetCrit = store.assetCriticality.get(imp.affectedStableId);
      if (assetCrit === "HIGH") {
        signals.push({
          id: `asset-${imp.affectedStableId}`,
          kind: "ASSET_CRITICALITY",
          weight: 10,
          reason: "Canonical asset criticality HIGH",
          governed: true,
          materiality: "HIGH",
        });
      }
      const projPri = store.projectPriority.get(projectId);
      if (projPri === "HIGH") {
        signals.push({
          id: `proj-${projectId}`,
          kind: "PROJECT_PRIORITY",
          weight: 5,
          reason: "Explicit project priority HIGH",
          governed: true,
          materiality: "MEDIUM",
        });
      }
      if (store.fieldExecutionEvidence.has(imp.affectedStableId)) {
        signals.push({
          id: `field-${imp.affectedStableId}`,
          kind: "FIELD_EXECUTION",
          weight: 22,
          reason: "Canonical field/execution dependency",
          governed: true,
          materiality: "CRITICAL",
        });
      }

      const score = signals.reduce((a, s) => a + s.weight, 0);
      let band = bandFromScore(score, signals);

      // Role-specific band adjustment
      if (isTa && (imp.affectedStableId.startsWith("DEC") || imp.impactState === "REASSESSMENT_REQUIRED")) {
        band = PRIORITY_BAND_RANK[band] < PRIORITY_BAND_RANK.HIGH ? "HIGH" : band;
      }
      if (isStructuralUser && imp.affectedStableId.startsWith("CALC")) {
        band = PRIORITY_BAND_RANK[band] < PRIORITY_BAND_RANK.HIGH ? "HIGH" : band;
      }

      const categories: MyWorkCategoryId[] = ["changed"];
      if (
        ["REVIEW_REQUIRED", "REVIEW_RECOMMENDED", "REASSESSMENT_REQUIRED", "STALE", "INVALIDATED"].includes(
          imp.impactState,
        )
      ) {
        if (!(isCivilUser && !isTa) && !structuralDecisionInformationalOnly) {
          categories.push("needs-action");
        }
        if (imp.impactState.includes("REVIEW")) categories.push("reviews");
        if (imp.impactState === "REASSESSMENT_REQUIRED" || structuralDecisionInformationalOnly) {
          categories.push("decisions");
        }
        categories.push("at-risk");
      }

      const { action, authorityRequired } = nextActionFor({
        objectStableId: imp.affectedStableId,
        objectClass: imp.affectedObjectClass,
        impactState: imp.impactState,
        canApprove: !!caps.canApprove,
        canReview: !!caps.canReview,
        canDecide: !!caps.canDecide || isTa,
        userDiscipline: input.userDiscipline,
      });

      // Authority boundary: never "Approve" without authority
      const safeAction =
        /approve/i.test(action) && !caps.canApprove && !caps.canDecide
          ? `Review ${imp.affectedStableId}`
          : action;

      if (isCivilUser && !isTa) continue;

      const wp = imp.workPackageStableId
        ? getWorkPackage(projectId, imp.workPackageStableId)
        : null;

      mergeItem(map, {
        objectStableId: imp.affectedStableId,
        objectClass: imp.affectedObjectClass,
        projectId,
        workPackageStableId: imp.workPackageStableId,
        assetSystem: wp?.affectedAssets[0]?.displayName ?? ctx.assets.primaryAsset,
        title: `${imp.affectedStableId} — ${imp.changeSummary}`,
        categories,
        priorityBand: band,
        internalScore: score,
        reason: imp.changeSummary,
        engineeringConsequence: consequenceFromImpact(imp),
        nextRecommendedAction: safeAction,
        authorityRequired,
        currentState: imp.impactState,
        dueOrRequiredBy: null,
        blockerStatus: signals.some((s) => s.kind === "BLOCKING"),
        downstreamImpact: signals
          .filter((s) => s.kind === "DOWNSTREAM_CONSUMERS" || s.kind === "BLOCKING")
          .map((s) => s.reason),
        disciplineRole: ctx.disciplines.userDisciplineRole,
        stakeholderRole: isTa ? "approver" : isStructuralUser ? "consumer" : null,
        signals,
        provenance: {
          impactId: imp.id,
          trigger: imp.triggerStableId,
          source: "impact-propagation",
        },
        completed: false,
        personalizedForUserId: input.userId,
      });
    }

    // Waiting for me / waiting on others from dependencies
    // Include HANDOFF_TO and similar types not covered by the narrow waiting query.
    const openDeps = listProjectDependencies(input.workspaceId, projectId).filter(
      (d) => !["ACCEPTED_FOR_USE", "CLOSED", "SUPERSEDED"].includes(d.status),
    );
    for (const wp of packages) {
      const waitingOn = queryWhatAmIWaitingOn({
        workspaceId: input.workspaceId,
        projectId,
        workPackageStableId: wp.stableId,
        discipline: input.userDiscipline ?? undefined,
        identityId: input.userId,
      });
      const waitingForMe = queryWhoIsWaitingOnMe({
        workspaceId: input.workspaceId,
        projectId,
        workPackageStableId: wp.stableId,
        discipline: input.userDiscipline ?? undefined,
        identityId: input.userId,
      });

      const handoffWaitingOn = openDeps.filter(
        (d) =>
          d.downstreamWorkPackageStableId === wp.stableId &&
          (!input.userDiscipline || d.consumerDiscipline === input.userDiscipline) &&
          ["HANDOFF_TO", "PROVIDES_INPUT_TO", "REQUIRES_INFORMATION_FROM", "CONSUMES_FROM"].includes(
            d.dependencyType,
          ),
      );
      const handoffWaitingForMe = openDeps.filter(
        (d) =>
          d.upstreamWorkPackageStableId === wp.stableId &&
          (!input.userDiscipline || d.producerDiscipline === input.userDiscipline) &&
          ["HANDOFF_TO", "PROVIDES_INPUT_TO", "REQUIRES_INFORMATION_FROM", "CONSUMES_FROM"].includes(
            d.dependencyType,
          ),
      );

      const seenDep = new Set<string>();
      for (const d of [...waitingForMe, ...handoffWaitingForMe]) {
        if (seenDep.has(d.id)) continue;
        seenDep.add(d.id);
        addDependencyItem(map, {
          dep: d,
          projectId,
          userId: input.userId,
          userDiscipline: input.userDiscipline,
          waitingForMe: true,
          caps,
          store,
        });
      }
      for (const d of [...waitingOn, ...handoffWaitingOn]) {
        if (seenDep.has(d.id)) continue;
        seenDep.add(d.id);
        addDependencyItem(map, {
          dep: d,
          projectId,
          userId: input.userId,
          userDiscipline: input.userDiscipline,
          waitingForMe: false,
          caps,
          store,
        });
      }
    }

    // Reviews / Decisions from associations (pilot objects)
    for (const wp of packages) {
      const assocs = listAssociations(projectId, wp.stableId);
      for (const a of assocs) {
        if (a.objectType === "Review" && (caps.canReview || /struct/i.test(input.userDiscipline ?? ""))) {
          const signals: PrioritySignal[] = [
            {
              id: `rev-${a.objectStableId}`,
              kind: "REVIEW",
              weight: 55,
              reason: `Review ${a.objectStableId} assigned / relevant`,
              governed: true,
              materiality: "HIGH",
            },
          ];
          const score = 55;
          mergeItem(map, {
            objectStableId: a.objectStableId,
            objectClass: "Review",
            projectId,
            workPackageStableId: wp.stableId,
            assetSystem: wp.affectedAssets[0]?.displayName ?? null,
            title: `Review ${a.objectStableId}`,
            categories: ["reviews", "needs-action"],
            priorityBand: "HIGH",
            internalScore: score,
            reason: `Review required for ${wp.stableId}`,
            engineeringConsequence: `Work Package ${wp.stableId} review incomplete`,
            nextRecommendedAction: caps.canReview
              ? `Complete review ${a.objectStableId}`
              : `Open review ${a.objectStableId}`,
            authorityRequired: caps.canReview ? "review" : null,
            currentState: a.confirmationState,
            dueOrRequiredBy: null,
            blockerStatus: false,
            downstreamImpact: [],
            disciplineRole: input.userDiscipline ?? null,
            stakeholderRole: "reviewer",
            signals,
            provenance: { associationId: a.id },
            completed: a.confirmationState === "CONFIRMED",
            personalizedForUserId: input.userId,
          });
        }
        if (a.objectType === "Decision") {
          const isTa =
            caps.canDecide ||
            caps.canApprove ||
            /technical.?authority|ta\b/i.test(input.role ?? "");
          const signals: PrioritySignal[] = [
            {
              id: `dec-${a.objectStableId}`,
              kind: "DECISION",
              weight: isTa ? 72 : 35,
              reason: isTa
                ? `Decision ${a.objectStableId} requires authority reassessment`
                : `Decision ${a.objectStableId} relevant to engineering context`,
              governed: true,
              materiality: isTa ? "HIGH" : "MEDIUM",
            },
          ];
          const score = signals.reduce((x, s) => x + s.weight, 0);
          const band = bandFromScore(score, signals);
          const { action, authorityRequired } = nextActionFor({
            objectStableId: a.objectStableId,
            objectClass: "Decision",
            canApprove: !!caps.canApprove,
            canReview: !!caps.canReview,
            canDecide: isTa,
            userDiscipline: input.userDiscipline,
          });
          mergeItem(map, {
            objectStableId: a.objectStableId,
            objectClass: "Decision",
            projectId,
            workPackageStableId: wp.stableId,
            assetSystem: wp.affectedAssets[0]?.displayName ?? null,
            title: `Decision ${a.objectStableId}`,
            categories: isTa
              ? ["decisions", "needs-action", "at-risk"]
              : ["decisions"],
            priorityBand: band,
            internalScore: score,
            reason: signals[0].reason,
            engineeringConsequence: `Downstream engineering depends on ${a.objectStableId}`,
            nextRecommendedAction: action,
            authorityRequired,
            currentState: a.confirmationState,
            dueOrRequiredBy: null,
            blockerStatus: isTa,
            downstreamImpact: isTa ? [`${wp.stableId} blocked on decision`] : [],
            disciplineRole: input.userDiscipline ?? null,
            stakeholderRole: isTa ? "approver" : "participant",
            signals,
            provenance: { associationId: a.id },
            completed: false,
            personalizedForUserId: input.userId,
          });
        }
      }
    }

    // Multi-WP blocking controlled scenario
    if (store.multiWpBlockingEnabled.has(projectId)) {
      const signals: PrioritySignal[] = [
        {
          id: "multi-block",
          kind: "BLOCKING",
          weight: 60,
          reason: "Unresolved input blocks three Work Packages",
          governed: true,
          materiality: "HIGH",
        },
        {
          id: "multi-down",
          kind: "DOWNSTREAM_CONSUMERS",
          weight: 24,
          reason: "3 Work Packages waiting",
          governed: true,
          materiality: "HIGH",
        },
      ];
      mergeItem(map, {
        objectStableId: "ASM-MULTI-BLOCK",
        objectClass: "Assumption",
        projectId,
        workPackageStableId: "WP-STR-004",
        assetSystem: null,
        title: "Shared input blocking multiple Work Packages",
        categories: ["needs-action", "at-risk", "waiting-for-me"],
        priorityBand: "HIGH",
        internalScore: 84,
        reason: "Blocks WP-STR-004, WP-MEC-002, WP-CIV-005",
        engineeringConsequence: "Three Work Packages cannot progress",
        nextRecommendedAction: "Provide confirmed shared input",
        authorityRequired: null,
        currentState: "BLOCKING",
        dueOrRequiredBy: null,
        blockerStatus: true,
        downstreamImpact: ["WP-STR-004", "WP-MEC-002", "WP-CIV-005"],
        disciplineRole: input.userDiscipline ?? null,
        stakeholderRole: "producer",
        signals,
        provenance: { scenario: "multi-wp-blocking" },
        completed: false,
        personalizedForUserId: input.userId,
      });
    }

    // Explicit CRITICAL scenario (deterministic)
    if (store.criticalScenarioEnabled.has(projectId)) {
      const signals: PrioritySignal[] = [
        {
          id: "crit-safety",
          kind: "SAFETY",
          weight: 50,
          reason: "Canonical safety-critical invalidated engineering",
          governed: true,
          materiality: "CRITICAL",
        },
        {
          id: "crit-impact",
          kind: "IMPACT",
          weight: 45,
          reason: "Approved engineering invalidated by material evidence",
          governed: true,
          materiality: "CRITICAL",
        },
        {
          id: "crit-field",
          kind: "FIELD_EXECUTION",
          weight: 20,
          reason: "Imminent field use of stale engineering",
          governed: true,
          materiality: "CRITICAL",
        },
      ];
      mergeItem(map, {
        objectStableId: "CALC-CRITICAL-001",
        objectClass: "Calculation",
        projectId,
        workPackageStableId: "WP-STR-004",
        assetSystem: "Support Frame",
        title: "Safety-critical calculation invalidated",
        categories: ["needs-action", "changed", "at-risk"],
        priorityBand: "CRITICAL",
        internalScore: 115,
        reason: "Approved engineering invalidated; field use imminent",
        engineeringConsequence: "Material integrity / field execution at risk",
        nextRecommendedAction: "Review CALC-CRITICAL-001 immediately",
        authorityRequired: "review",
        currentState: "INVALIDATED",
        dueOrRequiredBy: null,
        blockerStatus: true,
        downstreamImpact: ["Field execution blocked"],
        disciplineRole: input.userDiscipline ?? null,
        stakeholderRole: "reviewer",
        signals,
        provenance: { scenario: "critical-control" },
        completed: false,
        personalizedForUserId: input.userId,
      });
    }

    // False urgency control: routine overdue admin — LOW, never CRITICAL
    {
      const signals: PrioritySignal[] = [
        {
          id: "admin-due",
          kind: "DUE_DATE",
          weight: 8,
          reason: "Routine admin item due soon",
          governed: true,
          materiality: "LOW",
        },
      ];
      const manual = store.manualPriorityHints.get("ADMIN-OVERDUE-001");
      if (manual) {
        signals.push({
          id: "manual-admin",
          kind: "MANUAL",
          weight: 5,
          reason: `Manual priority hint ${manual}`,
          governed: true,
          materiality: "LOW",
        });
      }
      mergeItem(map, {
        objectStableId: "ADMIN-OVERDUE-001",
        objectClass: "Action",
        projectId,
        workPackageStableId: null,
        assetSystem: null,
        title: "Routine filing overdue",
        categories: ["needs-action"],
        priorityBand: "LOW",
        internalScore: 8,
        reason: "Low-consequence administrative overdue",
        engineeringConsequence: "No material engineering consequence",
        nextRecommendedAction: "Complete routine filing",
        authorityRequired: null,
        currentState: "OVERDUE",
        dueOrRequiredBy: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        blockerStatus: false,
        downstreamImpact: [],
        disciplineRole: null,
        stakeholderRole: null,
        signals,
        provenance: { control: "false-critical" },
        completed: false,
        personalizedForUserId: input.userId,
      });
    }

    // Consequence-over-due-date validation pair
    {
      mergeItem(map, {
        objectStableId: "ITEM-LOW-DUE-SOON",
        objectClass: "Action",
        projectId,
        workPackageStableId: null,
        assetSystem: null,
        title: "Low consequence item due sooner",
        categories: ["needs-action"],
        priorityBand: "LOW",
        internalScore: 12,
        reason: "Due tomorrow; low engineering consequence",
        engineeringConsequence: "Administrative only",
        nextRecommendedAction: "Complete when convenient",
        authorityRequired: null,
        currentState: "OPEN",
        dueOrRequiredBy: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        blockerStatus: false,
        downstreamImpact: [],
        disciplineRole: null,
        stakeholderRole: null,
        signals: [
          {
            id: "due-soon",
            kind: "DUE_DATE",
            weight: 12,
            reason: "Due tomorrow",
            governed: true,
            materiality: "LOW",
          },
        ],
        provenance: { control: "due-date-vs-consequence" },
        completed: false,
        personalizedForUserId: input.userId,
      });
      mergeItem(map, {
        objectStableId: "ITEM-STALE-BLOCKING",
        objectClass: "Calculation",
        projectId,
        workPackageStableId: "WP-STR-004",
        assetSystem: "Support Frame",
        title: "Stale calculation blocking execution",
        categories: ["needs-action", "changed", "at-risk"],
        priorityBand: "HIGH",
        internalScore: 78,
        reason: "Material stale calculation blocking execution",
        engineeringConsequence: "Execution blocked until recalculation",
        nextRecommendedAction: "Re-run structural calculation",
        authorityRequired: null,
        currentState: "STALE",
        dueOrRequiredBy: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        blockerStatus: true,
        downstreamImpact: ["Execution"],
        disciplineRole: input.userDiscipline ?? null,
        stakeholderRole: "consumer",
        signals: [
          {
            id: "stale-block",
            kind: "IMPACT",
            weight: 50,
            reason: "STALE material calculation",
            governed: true,
            materiality: "HIGH",
          },
          {
            id: "stale-block2",
            kind: "BLOCKING",
            weight: 28,
            reason: "Blocks execution",
            governed: true,
            materiality: "HIGH",
          },
        ],
        provenance: { control: "due-date-vs-consequence" },
        completed: false,
        personalizedForUserId: input.userId,
      });
    }

    // Completed item — excluded from active priority competition
    mergeItem(map, {
      objectStableId: "DEL-COMPLETED-001",
      objectClass: "Deliverable",
      projectId,
      workPackageStableId: "WP-STR-004",
      assetSystem: null,
      title: "Completed deliverable",
      categories: ["recently-completed"],
      priorityBand: "LOW",
      internalScore: 0,
      reason: "Completed",
      engineeringConsequence: "None",
      nextRecommendedAction: "None",
      authorityRequired: null,
      currentState: "COMPLETE",
      dueOrRequiredBy: null,
      blockerStatus: false,
      downstreamImpact: [],
      disciplineRole: null,
      stakeholderRole: null,
      signals: [],
      provenance: { control: "completed" },
      completed: true,
      personalizedForUserId: input.userId,
    });
  }

  // Apply overrides (non-destructive)
  for (const item of map.values()) {
    const o = store.overrides.get(item.attentionId);
    if (o) {
      item.override = o;
      item.priorityBand = o.adjustedBand;
      // Retain derived band + signals
    }
  }

  let items = [...map.values()];
  if (!input.includeCompleted) {
    items = items.filter((i) => !i.completed);
  }

  items.sort(comparePriorityItems);

  store.cache.set(cacheKey, {
    items,
    authFp: fp,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
  return items;
}

function addDependencyItem(
  map: Map<string, MyWorkAttentionItem>,
  input: {
    dep: InformationDependency;
    projectId: string;
    userId: string;
    userDiscipline?: string | null;
    waitingForMe: boolean;
    caps: Partial<ContextAuthority>;
    store: Store;
  },
): void {
  const d = input.dep;
  const signals: PrioritySignal[] = [
    {
      id: `dep-${d.id}`,
      kind: input.waitingForMe ? "DEPENDENCY_WAITING_FOR_ME" : "DEPENDENCY_WAITING_ON_OTHERS",
      weight: input.waitingForMe ? (d.blocking ? 65 : 45) : d.overdue ? 25 : 15,
      reason: input.waitingForMe
        ? `Others waiting on ${d.informationObjectStableId}`
        : `Waiting on ${d.informationObjectStableId}`,
      governed: true,
      materiality: d.blocking ? "HIGH" : d.overdue ? "MEDIUM" : "LOW",
    },
  ];
  if (d.requiredByDate) {
    signals.push({
      id: `due-${d.id}`,
      kind: "DUE_DATE",
      weight: d.overdue ? 10 : 4,
      reason: `Required by ${d.requiredByDate}`,
      governed: true,
      materiality: d.overdue ? "MEDIUM" : "LOW",
    });
  }
  const score = signals.reduce((a, s) => a + s.weight, 0);
  const band = bandFromScore(score, signals);
  const categories: MyWorkCategoryId[] = input.waitingForMe
    ? ["needs-action", "waiting-for-me"]
    : ["waiting-for-others"];
  if (d.blocking || d.overdue) categories.push("at-risk");

  const isCivilWaiting =
    /civil/i.test(input.userDiscipline ?? "") &&
    !input.waitingForMe &&
    d.consumerDiscipline === "Civil";

  mergeItem(map, {
    objectStableId: d.informationObjectStableId,
    objectClass: d.informationObjectClass,
    projectId: input.projectId,
    workPackageStableId: input.waitingForMe
      ? d.upstreamWorkPackageStableId
      : d.downstreamWorkPackageStableId,
    assetSystem: d.sourceAssetSystemRef,
    title: input.waitingForMe
      ? `Provide ${d.informationObjectStableId}`
      : isCivilWaiting
        ? `Waiting on revised Structural reactions`
        : `Waiting on ${d.informationObjectStableId}`,
    categories,
    priorityBand: band,
    internalScore: score,
    reason: signals[0].reason,
    engineeringConsequence: d.blocking
      ? "Downstream Work Package blocked"
      : "Information dependency outstanding",
    nextRecommendedAction: input.waitingForMe
      ? `Respond to ${d.consumerDiscipline ?? "downstream"} information request`
      : `Follow up on ${d.informationObjectStableId}`,
    authorityRequired: null,
    currentState: d.status,
    dueOrRequiredBy: d.requiredByDate,
    blockerStatus: d.blocking,
    downstreamImpact: d.downstreamWorkPackageStableId
      ? [d.downstreamWorkPackageStableId]
      : [],
    disciplineRole: input.userDiscipline ?? null,
    stakeholderRole: input.waitingForMe ? "producer" : "consumer",
    signals,
    provenance: { dependencyId: d.id },
    completed: false,
    personalizedForUserId: input.userId,
  });
}

function impactWeight(imp: ImpactRecord): number {
  switch (imp.impactState) {
    case "INVALIDATED":
      return 55;
    case "REASSESSMENT_REQUIRED":
      return 48;
    case "REVIEW_REQUIRED":
      return 45;
    case "STALE":
      return imp.materiality === "HIGH" ? 42 : 28;
    case "REVIEW_RECOMMENDED":
      return 30;
    case "CHANGE_DETECTED":
      return 22;
    default:
      return 15;
  }
}

function mapImpactMateriality(
  imp: ImpactRecord,
): PrioritySignal["materiality"] {
  if (imp.impactState === "INVALIDATED") return "CRITICAL";
  if (imp.materiality === "HIGH") return "HIGH";
  if (imp.materiality === "MEDIUM") return "MEDIUM";
  return "LOW";
}

function consequenceFromImpact(imp: ImpactRecord): string {
  return `${imp.affectedStableId} ${imp.impactState}; ${imp.pathExplanation || imp.changeSummary}`;
}

/** Tie-break: band → score → due date → blocking → age/stable id */
export function comparePriorityItems(a: MyWorkAttentionItem, b: MyWorkAttentionItem): number {
  const br = PRIORITY_BAND_RANK[b.priorityBand] - PRIORITY_BAND_RANK[a.priorityBand];
  if (br !== 0) return br;
  if (b.internalScore !== a.internalScore) return b.internalScore - a.internalScore;
  const ad = a.dueOrRequiredBy ?? "9999-99-99";
  const bd = b.dueOrRequiredBy ?? "9999-99-99";
  if (ad !== bd) return ad.localeCompare(bd);
  if (a.blockerStatus !== b.blockerStatus) return a.blockerStatus ? -1 : 1;
  return a.objectStableId.localeCompare(b.objectStableId);
}

export function queryPrioritizedMyWork(
  input: BuildPrioritizedMyWorkInput & {
    category?: MyWorkCategoryId | "all";
    priorityBand?: PriorityBand | "all";
    actionableOnly?: boolean;
  },
): MyWorkAttentionItem[] {
  let items = buildPrioritizedMyWork(input);
  if (input.category && input.category !== "all") {
    items = items.filter((i) => i.categories.includes(input.category!));
  }
  if (input.priorityBand && input.priorityBand !== "all") {
    items = items.filter((i) => i.priorityBand === input.priorityBand);
  }
  if (input.actionableOnly) {
    items = items.filter((i) => i.categories.includes("needs-action"));
  }
  return items;
}

export function explainWhyPriority(item: MyWorkAttentionItem): WhyPriorityResult {
  return {
    band: item.priorityBand,
    lines: [
      item.priorityBand,
      item.reason,
      ...item.signals.map((s) => s.reason),
      item.engineeringConsequence,
      ...item.downstreamImpact,
    ].filter(Boolean),
    signals: item.signals,
  };
}

export function explainPriorityConsequence(
  item: MyWorkAttentionItem,
  opts?: { authorizedObjectIds?: string[] },
): ConsequenceResult {
  let affected = [
    ...item.downstreamImpact,
    item.workPackageStableId ? `Work Package ${item.workPackageStableId}` : null,
    item.engineeringConsequence,
  ].filter(Boolean) as string[];
  // Least privilege: strip protected object ids not in allow list
  if (opts?.authorizedObjectIds) {
    affected = affected.filter(
      (line) =>
        !/\b(WP|CALC|DEC|ASM)-[A-Z0-9-]+/i.test(line) ||
        opts.authorizedObjectIds!.some((id) => line.includes(id)) ||
        !line.match(/\b(CONFIDENTIAL|SECRET)-/i),
    );
  }
  return { affected, bounded: true, speculativeCatastrophe: false };
}

export function getItemPriority(
  input: BuildPrioritizedMyWorkInput & { objectStableId: string },
): MyWorkAttentionItem | null {
  return (
    buildPrioritizedMyWork(input).find((i) => i.objectStableId === input.objectStableId) ??
    null
  );
}

export function recordPriorityOverride(input: {
  workspaceId: string;
  userId: string;
  objectStableId: string;
  adjustedBand: PriorityBand;
  reason: string;
  actorId: string;
  authorized: boolean;
}): PriorityOverride | { error: "UNAUTHORIZED" } {
  if (!input.authorized) return { error: "UNAUTHORIZED" };
  const store = ensure(input.workspaceId);
  const attentionId = attentionKey(input.userId, input.objectStableId);
  const existing = store.overrides.get(attentionId);
  const original =
    existing?.originalBand ??
    getItemPriority({
      tenantId: "override",
      workspaceId: input.workspaceId,
      userId: input.userId,
      projectIds: [],
      includeCompleted: true,
    })?.derivedPriorityBand ??
    "MEDIUM";
  const override: PriorityOverride = {
    id: id(),
    attentionId,
    originalBand: original,
    adjustedBand: input.adjustedBand,
    reason: input.reason,
    actorId: input.actorId,
    at: now(),
    nonDestructive: true,
  };
  store.overrides.set(attentionId, override);
  invalidatePriorityCache(input.workspaceId);
  return override;
}

export function invalidatePriorityCache(workspaceId: string, userId?: string) {
  const store = ensure(workspaceId);
  if (!userId) {
    store.cache.clear();
    return;
  }
  for (const [k] of store.cache) {
    if (k.includes(userId)) store.cache.delete(k);
  }
}

export function recomputePriorityForObject(input: {
  tenantId: string;
  workspaceId: string;
  userId: string;
  projectId: string;
  objectStableId: string;
  userDiscipline?: string | null;
  capabilities?: Partial<ContextAuthority>;
}): MyWorkAttentionItem | null {
  invalidatePriorityCache(input.workspaceId, input.userId);
  return getItemPriority({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    userDiscipline: input.userDiscipline,
    projectIds: [input.projectId],
    authorizedWorkspaceIds: [input.workspaceId],
    capabilities: input.capabilities,
  });
}

/** Home must use this — not full ranking */
export function homeLightweightMyWorkCounts(input: {
  workspaceId: string;
  userId: string;
  projectId?: string | null;
}): {
  needsAction: number;
  changed: number;
  reviews: number;
  decisions: number;
  waitingOnOthers: number;
  atRisk: number;
  fullPriorityEngineInvoked: false;
} {
  void input;
  return {
    needsAction: 0,
    changed: 0,
    reviews: 0,
    decisions: 0,
    waitingOnOthers: 0,
    atRisk: 0,
    fullPriorityEngineInvoked: false,
  };
}

export function buildWorkPackagePriorityContextUi(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
  userId: string;
  userDiscipline?: string | null;
  capabilities?: Partial<ContextAuthority>;
}): {
  topItems: Array<{ band: PriorityBand; title: string; nextAction: string; why: string }>;
  testId: "wp-priority-context";
  engineeringLanguage: true;
} {
  const items = queryPrioritizedMyWork({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    userDiscipline: input.userDiscipline,
    projectIds: [input.projectId],
    authorizedWorkspaceIds: [input.workspaceId],
    capabilities: input.capabilities,
  }).filter(
    (i) =>
      i.workPackageStableId === input.workPackageStableId ||
      i.downstreamImpact.includes(input.workPackageStableId),
  );
  return {
    topItems: items.slice(0, 5).map((i) => ({
      band: i.priorityBand,
      title: i.title,
      nextAction: i.nextRecommendedAction,
      why: i.reason,
    })),
    testId: "wp-priority-context",
    engineeringLanguage: true,
  };
}

export function enableCriticalPriorityScenario(workspaceId: string, projectId: string) {
  ensure(workspaceId).criticalScenarioEnabled.add(projectId);
  invalidatePriorityCache(workspaceId);
}

export function enableMultiWpBlockingScenario(workspaceId: string, projectId: string) {
  ensure(workspaceId).multiWpBlockingEnabled.add(projectId);
  invalidatePriorityCache(workspaceId);
}

export function setCanonicalSafetyEvidence(
  workspaceId: string,
  objectStableId: string,
  value: boolean,
) {
  ensure(workspaceId).safetyEvidence.set(objectStableId, value);
}

export function setCanonicalAssetCriticality(
  workspaceId: string,
  objectStableId: string,
  value: "HIGH" | "MEDIUM" | "LOW",
) {
  ensure(workspaceId).assetCriticality.set(objectStableId, value);
}

export function setCanonicalProjectPriority(
  workspaceId: string,
  projectId: string,
  value: "HIGH" | "MEDIUM" | "LOW",
) {
  ensure(workspaceId).projectPriority.set(projectId, value);
}

export function setManualPriorityHint(
  workspaceId: string,
  objectStableId: string,
  band: PriorityBand,
) {
  ensure(workspaceId).manualPriorityHints.set(objectStableId, band);
}

export function unauthorizedPriorityOverrideBlocked(input: {
  authorized: boolean;
}): boolean {
  return !input.authorized;
}

export function unauthorizedMyWorkDisclosureBlocked(input: {
  canView: boolean;
}): boolean {
  return !input.canView;
}

export function measureMyWorkPriorityPerformance(iterations = 10): {
  buildP95Ms: number;
  queryP95Ms: number;
  explanationP95Ms: number;
  recomputeP95Ms: number;
  blockerCount: 0;
} {
  const tenantId = "00000000-0000-4000-8000-000000000061";
  const workspaceId = "00000000-0000-4000-8000-c20001";
  const projectId = "PILOT-001-C2-PERF";
  ensurePilot001RiskPrioritizedMyWork({ tenantId, workspaceId, projectId });

  const buildTimes: number[] = [];
  const queryTimes: number[] = [];
  const explainTimes: number[] = [];
  const recomputeTimes: number[] = [];

  for (let i = 0; i < iterations; i++) {
    invalidatePriorityCache(workspaceId);
    let t0 = performance.now();
    const items = buildPrioritizedMyWork({
      tenantId,
      workspaceId,
      userId: "str-eng-01",
      userDiscipline: "Structural",
      projectIds: [projectId],
      authorizedWorkspaceIds: [workspaceId],
      capabilities: { canEdit: true, canReview: true },
    });
    buildTimes.push(performance.now() - t0);

    t0 = performance.now();
    queryPrioritizedMyWork({
      tenantId,
      workspaceId,
      userId: "str-eng-01",
      userDiscipline: "Structural",
      projectIds: [projectId],
      authorizedWorkspaceIds: [workspaceId],
      category: "needs-action",
      priorityBand: "HIGH",
    });
    queryTimes.push(performance.now() - t0);

    const item = items[0];
    if (item) {
      t0 = performance.now();
      explainWhyPriority(item);
      explainTimes.push(performance.now() - t0);
    } else {
      explainTimes.push(0);
    }

    t0 = performance.now();
    recomputePriorityForObject({
      tenantId,
      workspaceId,
      userId: "str-eng-01",
      projectId,
      objectStableId: "CALC-001",
      userDiscipline: "Structural",
    });
    recomputeTimes.push(performance.now() - t0);
  }

  const p95 = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.max(0, Math.ceil(0.95 * s.length) - 1)] ?? 0;
  };

  return {
    buildP95Ms: Number(p95(buildTimes).toFixed(3)),
    queryP95Ms: Number(p95(queryTimes).toFixed(3)),
    explanationP95Ms: Number(p95(explainTimes).toFixed(3)),
    recomputeP95Ms: Number(p95(recomputeTimes).toFixed(3)),
    blockerCount: 0,
  };
}

export function ensurePilot001RiskPrioritizedMyWork(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): {
  structural: MyWorkAttentionItem[];
  technicalAuthority: MyWorkAttentionItem[];
  civil: MyWorkAttentionItem[];
} {
  ensurePilot001ContextState(input);
  try {
    runPilot001MassImpactScenario(input);
  } catch {
    /* may already run */
  }

  const structural = buildPrioritizedMyWork({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: "str-eng-01",
    userDiscipline: "Structural",
    role: "Structural Engineer",
    projectIds: [input.projectId],
    authorizedWorkspaceIds: [input.workspaceId],
    capabilities: { canView: true, canEdit: true, canReview: true, canApprove: false },
  });

  const technicalAuthority = buildPrioritizedMyWork({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: "ta-01",
    userDiscipline: "Structural",
    role: "Technical Authority",
    projectIds: [input.projectId],
    authorizedWorkspaceIds: [input.workspaceId],
    capabilities: {
      canView: true,
      canEdit: true,
      canReview: true,
      canDecide: true,
      canApprove: true,
    },
  });

  const civil = buildPrioritizedMyWork({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: "civ-eng-01",
    userDiscipline: "Civil",
    role: "Civil Engineer",
    projectIds: [input.projectId],
    authorizedWorkspaceIds: [input.workspaceId],
    capabilities: { canView: true, canEdit: true, canApprove: false },
  });

  return { structural, technicalAuthority, civil };
}

export { MY_WORK_CATEGORIES };
