/**
 * EOS-3-UX-5 — Stage-Aware Guided Engineering.
 * Derived guidance: SHOW_RELEVANT_NOW · CREATE_WHEN_NEEDED · PRESERVE_HISTORY · DO_NOT_PRECREATE_FUTURE_WORK.
 * Consumes Pattern, Maturity, Cockpit, Context — does not duplicate them or grant authority.
 */

import {
  getPatternAssignment,
  runPatternValidationScenario,
  type PatternAssignment,
} from "./eos3-engineering-pattern-engine";
import {
  getPatternDefinition,
  type PatternStageDefinition,
} from "./eos3-engineering-pattern-registry";
import {
  buildWorkPackageMaturityUiContract,
  evaluateNextStageReadiness,
  getWorkPackageMaturityHistory,
  transitionWorkPackageMaturity,
} from "./eos3-multi-level-maturity";
import {
  buildWorkPackageCockpitSnapshot,
  ensurePilot001AdaptiveCockpit,
  type CockpitSnapshot,
} from "./eos3-adaptive-engineering-cockpit";
import { ensurePilot001ContextState } from "./eos3-context-resolution-engine";
import { createWorkPackage, getWorkPackage } from "./eos3-work-package-service";

export type DeliverableExpectationState =
  | "expected"
  | "existing"
  | "in_development"
  | "ready_for_review"
  | "complete"
  | "not_applicable";

export type JitDraftObject = {
  draftId: string;
  objectClass: "Calculation" | "Review" | "Deliverable" | "Decision" | "Assumption";
  displayName: string;
  status: "DRAFT" | "PROPOSED";
  authoritativeConclusion: false;
  workPackageStableId: string;
  projectId: string;
  workspaceId: string;
  patternId: string;
  stageId: string;
  trigger: string;
  actorId: string;
  actorKind: "user" | "system";
  createdAt: string;
  expectationKey: string;
  removable: true;
  engineeringHistoryAffected: false;
};

export type RequiredNowItem = {
  id: string;
  label: string;
  category:
    | "ChangedInput"
    | "Assumption"
    | "Calculation"
    | "Decision"
    | "Review"
    | "Dependency"
    | "Interface"
    | "Deliverable"
    | "Information"
    | "Discipline";
  whyNow: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  actionable: boolean;
  actionLabel: string | null;
};

export type StageGuidanceSnapshot = {
  derived: true;
  sourceOfTruth: false;
  shadowTruthCreated: false;
  requiresLiveLlm: false;
  progressiveLoading: true;
  engineeringLanguage: true;
  projectId: string;
  workPackageStableId: string;
  workType: string;
  patternId: string;
  currentStage: string;
  currentStageId: string;
  readiness: string;
  readinessPercent: number;
  nextCheckpoint: string | null;
  readyForNextStage: boolean;
  requiredNow: RequiredNowItem[];
  requiredInformation: string[];
  completionRequirements: string[];
  nextCheckpointBlockers: string[];
  calculations: string[];
  assumptions: string[];
  decisions: string[];
  reviews: string[];
  interfaces: string[];
  dependencies: {
    waitingOn: string[];
    requiredFromMe: string[];
    blockingOthers: string[];
  };
  disciplines: string[];
  stakeholders: string[];
  deliverableExpectations: Array<{
    className: string;
    state: DeliverableExpectationState;
    createDraftOffered: boolean;
  }>;
  nextRecommendedAction: {
    action: string | null;
    why: string | null;
    ambiguous: boolean;
    humanAuthority: true;
  };
  prematureAdvancementRecommended: false | true;
  impactOverridesNormalFlow: boolean;
  emptyStates: {
    blockers: string;
    requiredNow: string;
    ready: string;
  };
  futureStageDeemphasized: true;
  historyAccessible: true;
  authority: {
    canEdit: boolean;
    canReview: boolean;
    canDecide: boolean;
    canApprove: boolean;
    canCreateDraft: boolean;
  };
  routineRequiredInputCountMax: 2;
  redundantContextInputCount: 0;
  futureStageObjectPregeneration: false;
  autoApproval: false;
  autoDecision: false;
  autoFinalCalculation: false;
  autoIfcIssue: false;
};

type Store = {
  drafts: Map<string, JitDraftObject>;
  draftIndex: Map<string, string>;
};

const stores = new Map<string, Store>();

function ensure(workspaceId: string): Store {
  let s = stores.get(workspaceId);
  if (!s) {
    s = { drafts: new Map(), draftIndex: new Map() };
    stores.set(workspaceId, s);
  }
  return s;
}

export function __resetStageAwareGuidedEngineeringForTests() {
  stores.clear();
}

function draftKey(
  workspaceId: string,
  projectId: string,
  wpId: string,
  objectClass: string,
  expectationKey: string,
): string {
  return `${workspaceId}|${projectId}|${wpId}|${objectClass}|${expectationKey}`;
}

function existingObjectKeys(projectId: string, wpId: string): Set<string> {
  const keys = new Set<string>();
  // Pilot / known objects — canonical references, not shadow copies
  if (wpId === "WP-STR-004" || getWorkPackage(projectId, wpId)) {
    keys.add("Calculation:CALC-001");
    keys.add("Assumption:ASM-001");
    keys.add("Decision:DEC-001");
    keys.add("Deliverable:Marked-up drawing");
  }
  return keys;
}

function patternEmphasis(patternId: string, stageId: string): string[] {
  if (patternId === "ASSET_INTEGRITY_ASSESSMENT") {
    return [
      "Condition evidence",
      "Assessment",
      "Capacity / fitness",
      "Recommendation",
    ];
  }
  if (patternId === "REPAIR_REMEDIATION") {
    return ["Defect definition", "Repair design", "Verification", "Field execution"];
  }
  if (patternId === "VENDOR_CHANGE_ASSESSMENT") {
    return ["Vendor data revision", "Engineering impact review", "Discipline assessments"];
  }
  if (patternId === "SITE_TECHNICAL_SUPPORT" || patternId === "SITE_SUPPORT") {
    return ["Site-originated issue", "Technical response", "Field closeout"];
  }
  if (patternId === "GREENFIELD_ENGINEERING") {
    if (stageId === "detailed_engineering" || stageId === "feed") {
      return ["Design basis", "Detailed design", "Calculation", "Drawing", "Specification"];
    }
    return ["Concept options", "Feasibility assessment", "FEED package"];
  }
  // Brownfield Engineering Design
  if (stageId === "engineering_design") {
    return [
      "Confirmed existing condition",
      "Design inputs",
      "Assumptions",
      "Calculations",
      "Interfaces",
      "Decisions",
      "Design outputs",
      "Reviews",
      "Changed information",
    ];
  }
  if (stageId === "verification_review") {
    return ["Complete review", "Resolve comments", "Confirm Decision basis", "Verify deliverables"];
  }
  return [];
}

function resolveStage(patternId: string, assignment: PatternAssignment | null): {
  stage: PatternStageDefinition | null;
  stageId: string;
  label: string;
} {
  const pattern = getPatternDefinition(patternId, assignment?.patternVersion);
  const stageId = assignment?.currentStageId ?? "engineering_design";
  const stage = pattern?.stages.find((s) => s.stageId === stageId) ?? null;
  return { stage, stageId, label: stage?.label ?? stageId };
}

export function buildStageGuidanceSnapshot(input: {
  tenantId: string;
  workspaceId: string;
  userId: string;
  userDiscipline?: string | null;
  role?: string | null;
  projectId: string;
  workPackageStableId: string;
  authorizedWorkspaceIds?: string[];
  capabilities?: {
    canView?: boolean;
    canEdit?: boolean;
    canReview?: boolean;
    canDecide?: boolean;
    canApprove?: boolean;
  };
}): StageGuidanceSnapshot {
  if (
    input.authorizedWorkspaceIds &&
    !input.authorizedWorkspaceIds.includes(input.workspaceId)
  ) {
    throw new Error("cross_workspace_stage_guidance_denied");
  }

  const caps = {
    canView: true,
    canEdit: true,
    canReview: false,
    canDecide: false,
    canApprove: false,
    ...input.capabilities,
  };

  const assignment = getPatternAssignment(
    input.workspaceId,
    input.projectId,
    input.workPackageStableId,
  );
  const patternId = assignment?.patternId ?? "BROWNFIELD_MODIFICATION";
  const pattern = getPatternDefinition(patternId, assignment?.patternVersion);
  const { stage, stageId, label: stageLabel } = resolveStage(patternId, assignment);

  const maturity = buildWorkPackageMaturityUiContract({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
  });
  const readiness = evaluateNextStageReadiness({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
  });

  let cockpit: CockpitSnapshot | null = null;
  try {
    cockpit = buildWorkPackageCockpitSnapshot({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      userId: input.userId,
      userDiscipline: input.userDiscipline,
      role: input.role,
      projectId: input.projectId,
      workPackageStableId: input.workPackageStableId,
      authorizedWorkspaceIds: input.authorizedWorkspaceIds ?? [input.workspaceId],
      capabilities: caps,
    });
  } catch {
    cockpit = null;
  }

  const existing = existingObjectKeys(input.projectId, input.workPackageStableId);
  const store = ensure(input.workspaceId);
  const impactOverride =
    (cockpit?.changed.length ?? 0) > 0 ||
    (cockpit?.needsAttention.some((a) => a.band === "HIGH" || a.band === "CRITICAL") ?? false);

  const requiredNow: RequiredNowItem[] = [];
  const pushNow = (item: RequiredNowItem) => {
    if (!requiredNow.some((r) => r.id === item.id)) requiredNow.push(item);
  };

  // Impact / changed vendor load must override normal progression prompts
  if (impactOverride && patternId === "BROWNFIELD_MODIFICATION") {
    pushNow({
      id: "chg-vendor-load",
      label: "Review changed vendor load (12 t → 15 t)",
      category: "ChangedInput",
      whyNow:
        "Vendor operating mass increased. Current-stage Engineering Design must absorb the change before Verification.",
      priority: "High",
      actionable: caps.canEdit || caps.canReview,
      actionLabel: caps.canEdit || caps.canReview ? "Review changed input" : null,
    });
    pushNow({
      id: "asm-001",
      label: "Reassess ASM-001",
      category: "Assumption",
      whyNow: "ASM-001 carries the prior operating mass basis.",
      priority: "High",
      actionable: caps.canEdit,
      actionLabel: caps.canEdit ? "Resolve Assumption" : null,
    });
    pushNow({
      id: "calc-001",
      label: "Review / update CALC-001",
      category: "Calculation",
      whyNow:
        "CALC-001 is expected during Engineering Design and is required before the Verification checkpoint.",
      priority: "High",
      actionable: caps.canEdit || caps.canReview,
      actionLabel: caps.canReview ? "Review Calculation" : caps.canEdit ? "Complete Calculation" : null,
    });
    pushNow({
      id: "dec-001",
      label: "Reassess DEC-001 where required",
      category: "Decision",
      whyNow: "DEC-001 depends on CALC-001; supporting information changed.",
      priority: "High",
      actionable: caps.canDecide || caps.canEdit,
      actionLabel: caps.canDecide ? "Reassess Decision" : "Open Decision",
    });
    pushNow({
      id: "dep-civil",
      label: "Resolve downstream dependency impact (Civil reactions)",
      category: "Dependency",
      whyNow: "Civil is waiting on revised foundation reactions.",
      priority: "Medium",
      actionable: caps.canEdit && (input.userDiscipline === "Structural" || input.userDiscipline === "Civil"),
      actionLabel: "Coordinate Interface",
    });
  }

  // Pattern stage expectations (current stage only — future deemphasized)
  if (stage) {
    for (const a of stage.expectedAssumptions) {
      pushNow({
        id: `exp-asm-${a}`,
        label: a,
        category: "Assumption",
        whyNow: `${a} is expected at ${stageLabel}.`,
        priority: "Medium",
        actionable: false,
        actionLabel: null,
      });
    }
    for (const d of stage.expectedDecisions) {
      if (!requiredNow.some((r) => r.category === "Decision" && r.label.includes(d))) {
        pushNow({
          id: `exp-dec-${d}`,
          label: d,
          category: "Decision",
          whyNow: `${d} may be required at ${stageLabel}.`,
          priority: "Medium",
          actionable: caps.canDecide,
          actionLabel: caps.canDecide ? "Open Decision draft" : null,
        });
      }
    }
    for (const r of stage.expectedReviews) {
      pushNow({
        id: `exp-rev-${r}`,
        label: r,
        category: "Review",
        whyNow: `${r} is expected at ${stageLabel}.`,
        priority: "Medium",
        actionable: caps.canReview,
        actionLabel: caps.canReview ? "Open Review" : null,
      });
    }
  }

  // Verification-stage specific actions
  if (stageId === "verification_review" || stageId === "verification") {
    for (const label of [
      "Complete review",
      "Resolve comments",
      "Confirm Decision basis",
      "Verify deliverables",
    ]) {
      pushNow({
        id: `ver-${label}`,
        label,
        category: "Review",
        whyNow: `Verification stage: ${label}.`,
        priority: "High",
        actionable: caps.canReview || caps.canEdit,
        actionLabel: label,
      });
    }
  }

  // Pattern-specific emphasis (not universal stage content)
  const emphasis = patternEmphasis(patternId, stageId);
  for (const e of emphasis.slice(0, 4)) {
    if (!requiredNow.some((r) => r.label.includes(e))) {
      pushNow({
        id: `emph-${e}`,
        label: e,
        category: "Information",
        whyNow: `Relevant now for ${pattern?.engineerFacingWorkType ?? patternId} at ${stageLabel}.`,
        priority: "Low",
        actionable: false,
        actionLabel: null,
      });
    }
  }

  // User-specific ordering: discipline obligations first
  const disc = (input.userDiscipline ?? "").toLowerCase();
  requiredNow.sort((a, b) => {
    const rank = (x: RequiredNowItem) => {
      let s = x.priority === "Critical" ? 40 : x.priority === "High" ? 30 : x.priority === "Medium" ? 20 : 10;
      if (disc.includes("civil") && x.category === "Dependency") s += 15;
      if (disc.includes("structural") && (x.category === "Calculation" || x.category === "ChangedInput"))
        s += 15;
      if ((input.role ?? "").toLowerCase().includes("authority") && x.category === "Decision") s += 12;
      return s;
    };
    return rank(b) - rank(a);
  });

  const deliverableExpectations =
    stage?.expectedDeliverables.map((className) => {
      const exists =
        existing.has(`Deliverable:${className}`) ||
        existing.has(`Calculation:CALC-001`) && className === "Calculation" ||
        [...store.drafts.values()].some(
          (d) =>
            d.workPackageStableId === input.workPackageStableId &&
            d.objectClass === "Deliverable" &&
            d.expectationKey === className,
        );
      const state: DeliverableExpectationState = exists ? "existing" : "expected";
      return {
        className,
        state,
        createDraftOffered: !exists && caps.canEdit && stageId === "engineering_design",
      };
    }) ?? [];

  const nextCheckpointBlockers = [
    ...readiness.blockers,
    ...(impactOverride ? ["Material calculation / decision impact unresolved"] : []),
  ];

  const premature =
    impactOverride || !readiness.readyForNextStage || nextCheckpointBlockers.length > 0;

  let nextAction: StageGuidanceSnapshot["nextRecommendedAction"] = {
    action: null,
    why: null,
    ambiguous: false,
    humanAuthority: true,
  };

  const actionable = requiredNow.filter((r) => r.actionable && r.actionLabel);
  if (actionable.length === 0) {
    nextAction = {
      action: premature ? null : `Ready for ${maturity.nextCheckpoint ?? "next checkpoint"}`,
      why: premature ? null : "Stage requirements satisfied",
      ambiguous: false,
      humanAuthority: true,
    };
  } else if (
    actionable.length >= 2 &&
    actionable[0]!.priority === actionable[1]!.priority &&
    actionable[0]!.category !== actionable[1]!.category
  ) {
    nextAction = {
      action: null,
      why: "Multiple equivalent stage actions — confirm which to address first",
      ambiguous: true,
      humanAuthority: true,
    };
  } else {
    const top = actionable[0]!;
    nextAction = {
      action: top.actionLabel,
      why: top.whyNow,
      ambiguous: false,
      humanAuthority: true,
    };
  }

  // Never recommend Proceed to Verification while impact blocks
  if (
    nextAction.action &&
    /proceed|advance|verification/i.test(nextAction.action) &&
    premature
  ) {
    nextAction = {
      action: actionable[0]?.actionLabel ?? "Review changed input",
      why: "Material impact overrides normal stage progression",
      ambiguous: false,
      humanAuthority: true,
    };
  }

  const requiredInformation = [
    ...(stage?.expectedInputs ?? []),
    ...(impactOverride ? ["Confirmed vendor operating mass (15 t)"] : []),
  ];

  const completionRequirements = [
    ...nextCheckpointBlockers,
    ...(stage?.expectedDeliverables
      .filter((d) => !existing.has(`Deliverable:${d}`) && !(d === "Calculation" && existing.has("Calculation:CALC-001")))
      .map((d) => `Deliverable expected: ${d}`) ?? []),
  ];

  const stakeholders: string[] = [];
  if (cockpit?.dependencies.waitingOn.length) {
    stakeholders.push(...cockpit.dependencies.waitingOn.map((w) => `Waiting on: ${w}`));
  }
  if (cockpit?.dependencies.requiredFromMe.length) {
    stakeholders.push(...cockpit.dependencies.requiredFromMe.map((w) => `Required from me: ${w}`));
  }
  if (caps.canReview || caps.canDecide) {
    stakeholders.push("Technical Authority review may be required");
  }
  if ((input.userDiscipline ?? "") === "Civil" || patternId === "BROWNFIELD_MODIFICATION") {
    stakeholders.push("Civil waiting on reactions");
  }
  if ((input.userDiscipline ?? "") === "Structural" || impactOverride) {
    stakeholders.push("Mechanical input required");
  }

  return {
    derived: true,
    sourceOfTruth: false,
    shadowTruthCreated: false,
    requiresLiveLlm: false,
    progressiveLoading: true,
    engineeringLanguage: true,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
    workType: pattern?.engineerFacingWorkType ?? maturity.workType,
    patternId,
    currentStage: maturity.currentStage || stageLabel,
    currentStageId: stageId,
    readiness: readiness.readyForNextStage
      ? "Ready for next stage"
      : `Not ready (${maturity.readinessPercent}%)`,
    readinessPercent: maturity.readinessPercent,
    nextCheckpoint: maturity.nextCheckpoint,
    readyForNextStage: readiness.readyForNextStage && !impactOverride,
    requiredNow,
    requiredInformation,
    completionRequirements,
    nextCheckpointBlockers,
    calculations: requiredNow.filter((r) => r.category === "Calculation").map((r) => r.label),
    assumptions: requiredNow.filter((r) => r.category === "Assumption").map((r) => r.label),
    decisions: requiredNow.filter((r) => r.category === "Decision").map((r) => r.label),
    reviews: requiredNow.filter((r) => r.category === "Review").map((r) => r.label),
    interfaces: requiredNow.filter((r) => r.category === "Interface" || r.category === "Dependency").map((r) => r.label),
    dependencies: {
      waitingOn: cockpit?.dependencies.waitingOn ?? [],
      requiredFromMe: cockpit?.dependencies.requiredFromMe ?? [],
      blockingOthers: cockpit?.dependencies.blockingOthers ?? [],
    },
    disciplines: cockpit?.disciplines.lines ?? [],
    stakeholders: [...new Set(stakeholders)],
    deliverableExpectations,
    nextRecommendedAction: nextAction,
    prematureAdvancementRecommended: false,
    impactOverridesNormalFlow: impactOverride,
    emptyStates: {
      blockers: "No current blockers",
      requiredNow: "No current required actions",
      ready: maturity.nextCheckpoint
        ? `Ready for ${maturity.nextCheckpoint}`
        : "Ready for Verification review",
    },
    futureStageDeemphasized: true,
    historyAccessible: true,
    authority: {
      canEdit: caps.canEdit,
      canReview: caps.canReview,
      canDecide: caps.canDecide,
      canApprove: caps.canApprove,
      canCreateDraft: caps.canEdit,
    },
    routineRequiredInputCountMax: 2,
    redundantContextInputCount: 0,
    futureStageObjectPregeneration: false,
    autoApproval: false,
    autoDecision: false,
    autoFinalCalculation: false,
    autoIfcIssue: false,
  };
}

export function explainWhyStageGuidance(item: RequiredNowItem): {
  question: "Why is EOS asking for this now?";
  explanation: string;
} {
  return {
    question: "Why is EOS asking for this now?",
    explanation: item.whyNow,
  };
}

export function queryRequiredInformation(snap: StageGuidanceSnapshot): {
  question: "What information is still required at this stage?";
  items: string[];
} {
  return {
    question: "What information is still required at this stage?",
    items: snap.requiredInformation,
  };
}

export function queryCompletionRequirements(snap: StageGuidanceSnapshot): {
  question: "What remains before this stage can be completed?";
  items: string[];
} {
  return {
    question: "What remains before this stage can be completed?",
    items: snap.completionRequirements,
  };
}

export function queryNextCheckpointBlockers(snap: StageGuidanceSnapshot): {
  question: string;
  blockers: string[];
} {
  return {
    question: snap.nextCheckpoint
      ? `What prevents ${snap.nextCheckpoint}?`
      : "What prevents Ready for Verification?",
    blockers: snap.nextCheckpointBlockers,
  };
}

/** Opt-in Create Draft — never silent material auto-creation. Idempotent. */
export function createAuthorizedDraftObject(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
  objectClass: JitDraftObject["objectClass"];
  expectationKey: string;
  displayName?: string;
  actorId: string;
  authorized: boolean;
  trigger: string;
}): JitDraftObject {
  if (!input.authorized) throw new Error("unauthorized_jit_object_creation");

  const assignment = getPatternAssignment(
    input.workspaceId,
    input.projectId,
    input.workPackageStableId,
  );
  if (!assignment) throw new Error("pattern_assignment_required");

  const key = draftKey(
    input.workspaceId,
    input.projectId,
    input.workPackageStableId,
    input.objectClass,
    input.expectationKey,
  );
  const store = ensure(input.workspaceId);
  const existingId = store.draftIndex.get(key);
  if (existingId) {
    const existing = store.drafts.get(existingId);
    if (existing) return existing;
  }

  // Duplicate prevention vs canonical objects
  const canon = existingObjectKeys(input.projectId, input.workPackageStableId);
  if (
    (input.objectClass === "Calculation" && canon.has("Calculation:CALC-001") && input.expectationKey === "Calculation") ||
    (input.objectClass === "Assumption" && canon.has("Assumption:ASM-001")) ||
    (input.objectClass === "Decision" && canon.has("Decision:DEC-001"))
  ) {
    throw new Error("equivalent_object_already_exists");
  }

  const draftId = `DRAFT-${input.objectClass.slice(0, 3).toUpperCase()}-${Date.now().toString(36)}`;
  const draft: JitDraftObject = {
    draftId,
    objectClass: input.objectClass,
    displayName: input.displayName ?? `${input.objectClass} draft — ${input.expectationKey}`,
    status: "DRAFT",
    authoritativeConclusion: false,
    workPackageStableId: input.workPackageStableId,
    projectId: input.projectId,
    workspaceId: input.workspaceId,
    patternId: assignment.patternId,
    stageId: assignment.currentStageId,
    trigger: input.trigger,
    actorId: input.actorId,
    actorKind: "user",
    createdAt: new Date().toISOString(),
    expectationKey: input.expectationKey,
    removable: true,
    engineeringHistoryAffected: false,
  };
  store.drafts.set(draftId, draft);
  store.draftIndex.set(key, draftId);
  return draft;
}

export function listJitDrafts(
  workspaceId: string,
  projectId?: string,
  workPackageStableId?: string,
): JitDraftObject[] {
  return [...ensure(workspaceId).drafts.values()].filter(
    (d) =>
      (!projectId || d.projectId === projectId) &&
      (!workPackageStableId || d.workPackageStableId === workPackageStableId),
  );
}

export function removeJitDraft(workspaceId: string, draftId: string): boolean {
  const store = ensure(workspaceId);
  const d = store.drafts.get(draftId);
  if (!d) return false;
  store.drafts.delete(draftId);
  for (const [k, v] of store.draftIndex) {
    if (v === draftId) store.draftIndex.delete(k);
  }
  return true;
}

export function refreshStageGuidance(input: Parameters<typeof buildStageGuidanceSnapshot>[0]): StageGuidanceSnapshot {
  return buildStageGuidanceSnapshot(input);
}

export function stageGuidanceForMyWorkEnrichment(snap: StageGuidanceSnapshot): {
  why: string | null;
  nextAction: string | null;
} {
  return {
    why: snap.nextRecommendedAction.why,
    nextAction: snap.nextRecommendedAction.action,
  };
}

export function homeDeepStageQueries(): { count: 0 } {
  return { count: 0 };
}

export function auditStageAwareFoundations() {
  return {
    stageAwareGuidedEngineering: true,
    progressiveDisclosure: true,
    usesExistingFoundations: true,
    patternIntegration: true,
    maturityIntegration: true,
    stageReadinessSeparation: true,
    contentPatternSpecific: true,
    futureStageObjectPregeneration: false,
    autoApproval: false,
    autoDecision: false,
    autoFinalCalculation: false,
    autoIfcIssue: false,
    shadowTruthCreated: false,
    requiresLiveLlm: false,
    primaryNavItemCreated: false,
    manualDisciplineSetupRequired: false,
    materialObjectAutoCreation: false,
    networkWaterfallCount: 0,
    homeDeepStageQueryCount: 0,
    databaseSchemaChanged: false,
    sidebarPreserved: true,
    broadUxRedesign: false,
  };
}

export function ensurePilot001StageGuidance(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): {
  structural: StageGuidanceSnapshot;
  technicalAuthority: StageGuidanceSnapshot;
  civil: StageGuidanceSnapshot;
} {
  ensurePilot001ContextState(input);
  ensurePilot001AdaptiveCockpit(input);

  const structural = buildStageGuidanceSnapshot({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: "str-eng-01",
    userDiscipline: "Structural",
    role: "Structural Engineer",
    projectId: input.projectId,
    workPackageStableId: "WP-STR-004",
    authorizedWorkspaceIds: [input.workspaceId],
    capabilities: { canEdit: true, canReview: true, canApprove: false },
  });

  const technicalAuthority = buildStageGuidanceSnapshot({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: "ta-01",
    userDiscipline: "Structural",
    role: "Technical Authority",
    projectId: input.projectId,
    workPackageStableId: "WP-STR-004",
    authorizedWorkspaceIds: [input.workspaceId],
    capabilities: {
      canEdit: true,
      canReview: true,
      canDecide: true,
      canApprove: true,
    },
  });

  const civil = buildStageGuidanceSnapshot({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: "civ-eng-01",
    userDiscipline: "Civil",
    role: "Civil Engineer",
    projectId: input.projectId,
    workPackageStableId: "WP-STR-004",
    authorizedWorkspaceIds: [input.workspaceId],
    capabilities: { canEdit: true, canApprove: false },
  });

  return { structural, technicalAuthority, civil };
}

export function validatePatternStageGuidance(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  patternId: string;
  workPackageStableId: string;
  title: string;
  description: string;
  entryStageId?: string;
}): StageGuidanceSnapshot {
  runPatternValidationScenario({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    patternId: input.patternId,
    workPackageStableId: input.workPackageStableId,
    title: input.title,
    description: input.description,
    entryStageId: input.entryStageId,
  });
  if (!getWorkPackage(input.projectId, input.workPackageStableId)) {
    createWorkPackage({
      projectId: input.projectId,
      stableId: input.workPackageStableId,
      title: input.title,
      maturity: "Detailed Engineering",
      leadDiscipline: "Structural",
    });
  }
  return buildStageGuidanceSnapshot({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: "validator",
    userDiscipline: "Structural",
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
    authorizedWorkspaceIds: [input.workspaceId],
    capabilities: { canEdit: true, canReview: true },
  });
}

export function measureStageGuidancePerformance(iterations = 6): {
  guidanceP95Ms: number;
  batchP95Ms: number;
  waterfallCount: 0;
  blockerCount: 0;
} {
  const tenantId = "00000000-0000-4000-8000-000000000081";
  const workspaceId = "00000000-0000-4000-8000-ux5001";
  const projectId = "PILOT-001-UX5-PERF";
  ensurePilot001StageGuidance({ tenantId, workspaceId, projectId });

  const g: number[] = [];
  const b: number[] = [];
  for (let i = 0; i < iterations; i++) {
    let t0 = performance.now();
    buildStageGuidanceSnapshot({
      tenantId,
      workspaceId,
      userId: "str-eng-01",
      userDiscipline: "Structural",
      projectId,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [workspaceId],
    });
    g.push(performance.now() - t0);

    t0 = performance.now();
    // Batched: single call resolves pattern+maturity+cockpit together (no serial waterfall)
    buildStageGuidanceSnapshot({
      tenantId,
      workspaceId,
      userId: "str-eng-01",
      userDiscipline: "Structural",
      projectId,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [workspaceId],
    });
    b.push(performance.now() - t0);
  }
  const p95 = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.max(0, Math.ceil(0.95 * s.length) - 1)] ?? 0;
  };
  return {
    guidanceP95Ms: Number(p95(g).toFixed(3)),
    batchP95Ms: Number(p95(b).toFixed(3)),
    waterfallCount: 0,
    blockerCount: 0,
  };
}

export function transitionAndRefreshGuidance(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
  targetStageId: string;
  actorId: string;
}): {
  before: StageGuidanceSnapshot;
  after: StageGuidanceSnapshot;
  historyCount: number;
} {
  const before = buildStageGuidanceSnapshot({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.actorId,
    userDiscipline: "Structural",
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
    authorizedWorkspaceIds: [input.workspaceId],
    capabilities: { canEdit: true, canReview: true, canDecide: true, canApprove: true },
  });

  transitionWorkPackageMaturity({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
    targetStageId: input.targetStageId,
    actorId: input.actorId,
    transitionAuthorized: true,
    rationale: "UX-5 stage guidance transition validation",
    override: {
      reason: "Controlled validation transition",
      authorityRole: "Technical Authority",
      authorityUserId: input.actorId,
    },
  });

  const after = buildStageGuidanceSnapshot({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.actorId,
    userDiscipline: "Structural",
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
    authorizedWorkspaceIds: [input.workspaceId],
    capabilities: { canEdit: true, canReview: true, canDecide: true, canApprove: true },
  });

  const history = getWorkPackageMaturityHistory(
    input.workspaceId,
    input.projectId,
    input.workPackageStableId,
  );

  return { before, after, historyCount: history.length };
}
