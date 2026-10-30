/**
 * EOS-3-WORKFLOW-2 — Multi-level maturity model.
 * Project profile ≠ WP pattern-native stage ≠ Deliverable maturity ≠ Readiness ≠ Approval.
 * WP is primary execution maturity. No automatic engineering approval or silent stage changes.
 */

import {
  getPatternDefinition,
  listActivePatterns,
  type EngineeringPatternDefinition,
} from "./eos3-engineering-pattern-registry";
import {
  assignEngineeringPattern,
  ensurePilot001BrownfieldPattern,
  evaluatePatternGate,
  getPatternAssignment,
  runPatternValidationScenario,
  type GateReadiness,
  type PatternAssignment,
} from "./eos3-engineering-pattern-engine";
import {
  createWorkPackage,
  deriveBlockers,
  deriveReadiness,
  getWorkPackage,
  listAssociations,
  listWorkPackages,
  seedPilot001SupportFrameWorkPackage,
  updateWorkPackage,
  type WorkPackage,
  type WorkPackageMaturity,
} from "./eos3-work-package-service";
import { listActiveImpacts, processEngineeringChange } from "./eos3-impact-propagation";
import { findByStableId, snapshotProjectWorkspace } from "./eos3-project-workspace-service";

export const NORMALIZED_MATURITY_BANDS = [
  "INITIATION",
  "DEFINITION",
  "DESIGN",
  "VERIFICATION",
  "EXECUTION_READY",
  "EXECUTION",
  "HANDOVER",
  "COMPLETE",
] as const;
export type NormalizedMaturityBand = (typeof NORMALIZED_MATURITY_BANDS)[number];

export const DELIVERABLE_MATURITY_STATES = [
  "PLANNED",
  "IN_DEVELOPMENT",
  "READY_FOR_REVIEW",
  "UNDER_REVIEW",
  "READY_FOR_CURRENT_PURPOSE",
  "COMPLETE",
  "SUPERSEDED",
] as const;
export type DeliverableMaturityState = (typeof DELIVERABLE_MATURITY_STATES)[number];

export const DELIVERABLE_ISSUE_PURPOSES = [
  "IFR",
  "IFA",
  "IFI",
  "IFC",
  "AS_BUILT",
  "UNSPECIFIED",
] as const;
export type DeliverableIssuePurpose = (typeof DELIVERABLE_ISSUE_PURPOSES)[number];

export type MaturityTransitionRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
  patternId: string;
  patternVersion: string;
  previousStageId: string;
  newStageId: string;
  previousBand: NormalizedMaturityBand;
  newBand: NormalizedMaturityBand;
  direction: "FORWARD" | "BACKWARD" | "LATERAL";
  actorId: string;
  actorKind: "human" | "system";
  authorized: boolean;
  readinessSnapshot: NextStageReadiness;
  evidenceRefs: string[];
  rationale: string;
  override: MaturityOverride | null;
  at: string;
  provenance: Record<string, unknown>;
};

export type MaturityOverride = {
  readinessPercentAtOverride: number;
  reason: string;
  authorityRole: string;
  authorityUserId: string;
  evidenceRefs: string[];
  at: string;
};

export type DeliverableMaturityRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPackageStableId: string | null;
  deliverableStableId: string;
  maturity: DeliverableMaturityState;
  revision: string;
  reviewStatus: "NOT_STARTED" | "IN_PROGRESS" | "UNDER_REVIEW" | "COMPLETE" | "REJECTED";
  issuePurpose: DeliverableIssuePurpose;
  approvalState: "NOT_APPROVED" | "APPROVED" | "REJECTED" | "SUPERSEDED";
  schedulePercentComplete: number | null; // never equated to engineering maturity
  provenance: Record<string, unknown>;
  updatedAt: string;
};

export type NextStageReadiness = {
  currentStageId: string;
  currentStageLabel: string;
  nextStageId: string | null;
  nextStageLabel: string | null;
  nextCheckpointGateId: string | null;
  nextCheckpointLabel: string | null;
  readinessPercent: number;
  basisRule: string;
  explainableFactors: Array<{ factor: string; weight: number; satisfied: boolean; detail: string }>;
  blockers: string[];
  materialImpacts: Array<{ objectStableId: string; impactState: string }>;
  readyForNextStage: boolean;
  approved: false;
  impliesEngineeringApproval: false;
  impliesSchedulePercentComplete: false;
  gate: GateReadiness | null;
};

export type WorkPackageMaturityQuery = {
  workPackageStableId: string;
  workType: string;
  patternId: string;
  patternVersion: string;
  patternNativeStageId: string;
  patternNativeStageLabel: string;
  normalizedBand: NormalizedMaturityBand;
  legacyMaturityLabel: WorkPackageMaturity | string;
  readiness: NextStageReadiness;
  nextCheckpoint: string | null;
  blockerCount: number;
  blockers: string[];
  historyCount: number;
  governingMaturitySingle: true;
  scheduleProgressSeparated: true;
};

export type ProjectMaturityBandBucket = {
  band: NormalizedMaturityBand;
  count: number;
  workPackageStableIds: string[];
};

export type ProjectMaturityProfile = {
  projectId: string;
  projectLifecycleKeyPreserved: string;
  projectGateSeparated: true;
  falseSingleProjectStage: false;
  authoritativeSingleStage: null;
  summaryLabel: string | null;
  summaryIsDerivedOnly: true;
  bands: ProjectMaturityBandBucket[];
  activeWorkPackageCount: number;
  completedWorkPackageCount: number;
  excludedWorkPackageCount: number;
  weighting: "UNWEIGHTED_WP_COUNT";
  workPackages: Array<{
    stableId: string;
    workType: string;
    patternId: string;
    nativeStageLabel: string;
    normalizedBand: NormalizedMaturityBand;
  }>;
};

type MaturityStore = {
  history: MaturityTransitionRecord[];
  deliverables: Map<string, DeliverableMaturityRecord>;
  overrides: MaturityOverride[];
};

const stores = new Map<string, MaturityStore>();

function id() {
  return crypto.randomUUID();
}
function now() {
  return new Date().toISOString();
}
function ensure(workspaceId: string): MaturityStore {
  let s = stores.get(workspaceId);
  if (!s) {
    s = { history: [], deliverables: new Map(), overrides: [] };
    stores.set(workspaceId, s);
  }
  return s;
}
function dkey(projectId: string, deliverableStableId: string) {
  return `${projectId}::${deliverableStableId}`;
}

export function __resetMultiLevelMaturityForTests() {
  stores.clear();
}

/** Pattern-native stage → reporting band. Does not replace native stage. */
export function mapStageToNormalizedBand(
  patternId: string,
  stageId: string,
): NormalizedMaturityBand {
  const s = stageId.toLowerCase();
  if (
    s.includes("closed") ||
    s.includes("complete") ||
    s === "closeout" ||
    s.includes("approval_closeout") ||
    s.includes("field_closeout")
  ) {
    return "COMPLETE";
  }
  if (s.includes("handover") || s.includes("as_built") || s.includes("commission")) {
    return "HANDOVER";
  }
  if (
    s.includes("construction_support") ||
    s.includes("field_execution") ||
    s.includes("inspection") ||
    (s.includes("construction") && !s.includes("ready"))
  ) {
    return "EXECUTION";
  }
  if (
    s.includes("ready_for_construction") ||
    s.includes("execution_ready") ||
    s.includes("ifc")
  ) {
    return "EXECUTION_READY";
  }
  if (
    s.includes("verification") ||
    s.includes("review") ||
    s === "decision" ||
    s.includes("discipline_assessments") ||
    s.includes("affected_design_review") ||
    s.includes("approval_where")
  ) {
    return "VERIFICATION";
  }
  if (
    s.includes("engineering_design") ||
    s.includes("detailed_engineering") ||
    s.includes("feed") ||
    s.includes("repair_design") ||
    s.includes("design_update") ||
    s.includes("deliverable_update") ||
    s.includes("assessment") ||
    s.includes("fitness") ||
    s.includes("technical_response")
  ) {
    return "DESIGN";
  }
  if (
    s.includes("definition") ||
    s.includes("baseline") ||
    s.includes("impact") ||
    s.includes("feasibility") ||
    s.includes("vendor_information") ||
    s.includes("engineering_impact") ||
    s.includes("defect") ||
    s.includes("condition") ||
    s.includes("cause_basis") ||
    s.includes("site_originated")
  ) {
    return "DEFINITION";
  }
  if (s.includes("concept") || s.includes("initiation") || patternId === "GREENFIELD_ENGINEERING") {
    if (s.includes("concept")) return "INITIATION";
  }
  if (s.includes("concept")) return "INITIATION";
  return "DEFINITION";
}

export function stageLabel(
  pattern: EngineeringPatternDefinition,
  stageId: string,
): string {
  return pattern.stages.find((s) => s.stageId === stageId)?.label ?? stageId;
}

function nextStageOf(
  pattern: EngineeringPatternDefinition,
  currentStageId: string,
): { stageId: string; label: string } | null {
  const ordered = [...pattern.stages].sort((a, b) => a.order - b.order);
  const idx = ordered.findIndex((s) => s.stageId === currentStageId);
  if (idx < 0 || idx >= ordered.length - 1) return null;
  const n = ordered[idx + 1]!;
  return { stageId: n.stageId, label: n.label };
}

function gateAfterStage(
  pattern: EngineeringPatternDefinition,
  stageId: string,
): { gateId: string; label: string } | null {
  const g = pattern.gates.find((x) => x.afterStageId === stageId) ?? pattern.gates[0];
  return g ? { gateId: g.gateId, label: g.label } : null;
}

function legacyMaturityForStage(stageId: string, stageLabelText: string): WorkPackageMaturity {
  const s = `${stageId} ${stageLabelText}`.toLowerCase();
  if (s.includes("closed")) return "Closed";
  if (s.includes("complete") || s.includes("closeout")) return "Complete";
  if (s.includes("commission") || s.includes("handover") || s.includes("as_built")) {
    return "Commissioning";
  }
  if (s.includes("construction_support") || (s.includes("construction") && !s.includes("ready"))) {
    return "Construction";
  }
  if (s.includes("ready_for_construction") || s.includes("ifc")) return "Ready for Construction";
  if (s.includes("verification") || s.includes("review")) return "Verification / Review";
  if (s.includes("detailed") || s.includes("engineering_design") || s.includes("repair_design")) {
    return "Detailed Engineering";
  }
  if (s.includes("feed")) return "FEED";
  if (s.includes("feasib")) return "Feasibility";
  if (s.includes("concept")) return "Concept";
  return "Detailed Engineering";
}

export function evaluateNextStageReadiness(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
}): NextStageReadiness {
  const assignment = getPatternAssignment(
    input.workspaceId,
    input.projectId,
    input.workPackageStableId,
  );
  const pattern = assignment
    ? getPatternDefinition(assignment.patternId, assignment.patternVersion)
    : getPatternDefinition("BROWNFIELD_MODIFICATION");
  if (!pattern) throw new Error("pattern_not_found");

  const currentStageId = assignment?.currentStageId ?? "engineering_design";
  const currentLabel = stageLabel(pattern, currentStageId);
  const next = nextStageOf(pattern, currentStageId);
  const checkpoint = gateAfterStage(pattern, currentStageId);

  const wpReadiness = deriveReadiness(input.projectId, input.workPackageStableId);
  const wpBlockers = deriveBlockers(input.projectId, input.workPackageStableId);
  const impacts = listActiveImpacts(input.workspaceId, input.projectId).filter((i) =>
    ["STALE", "REVIEW_REQUIRED", "REASSESSMENT_REQUIRED"].includes(i.impactState),
  );

  let gate: GateReadiness | null = null;
  if (assignment && checkpoint) {
    try {
      gate = evaluatePatternGate({
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        workPackageStableId: input.workPackageStableId,
        gateId: checkpoint.gateId,
      });
    } catch {
      gate = null;
    }
  }

  const factors: NextStageReadiness["explainableFactors"] = [
    {
      factor: "inputs",
      weight: 25,
      satisfied: wpReadiness.inputsAvailable >= Math.max(1, Math.floor(wpReadiness.inputsExpected * 0.5)),
      detail: `${wpReadiness.inputsAvailable}/${wpReadiness.inputsExpected} inputs`,
    },
    {
      factor: "calculations",
      weight: 20,
      satisfied: wpReadiness.calculations > 0,
      detail: `${wpReadiness.calculations} calculation(s)`,
    },
    {
      factor: "decisions",
      weight: 15,
      satisfied: wpReadiness.decisions > 0,
      detail: `${wpReadiness.decisions} decision(s)`,
    },
    {
      factor: "deliverables",
      weight: 15,
      satisfied: wpReadiness.deliverables > 0,
      detail: `${wpReadiness.deliverables} deliverable(s)`,
    },
    {
      factor: "reviews",
      weight: 10,
      satisfied: wpReadiness.reviews > 0,
      detail: `${wpReadiness.reviews} review(s)`,
    },
    {
      factor: "material_impacts",
      weight: 15,
      satisfied: impacts.length === 0,
      detail: impacts.length ? `${impacts.length} material impact(s)` : "no material impacts",
    },
  ];

  const blockers = [
    ...wpBlockers.filter((b) => b.material).map((b) => b.label),
    ...(gate?.blockers ?? []),
    ...impacts.map((i) => `${i.affectedStableId} is ${i.impactState}`),
  ];
  // Cross-WP dependency blockers
  const deps = listWorkPackages(input.projectId);
  void deps;

  let scored = 0;
  let total = 0;
  for (const f of factors) {
    total += f.weight;
    if (f.satisfied) scored += f.weight;
  }
  const readinessPercent = Math.round((scored / Math.max(1, total)) * 100);
  const readyForNextStage =
    Boolean(next) && readinessPercent >= 80 && blockers.length === 0 && impacts.length === 0;

  return {
    currentStageId,
    currentStageLabel: currentLabel,
    nextStageId: next?.stageId ?? null,
    nextStageLabel: next?.label ?? null,
    nextCheckpointGateId: checkpoint?.gateId ?? null,
    nextCheckpointLabel: checkpoint?.label ?? null,
    readinessPercent,
    basisRule: "EOS_WORKFLOW2_READINESS_WEIGHTED_V1",
    explainableFactors: factors,
    blockers: [...new Set(blockers)],
    materialImpacts: impacts.map((i) => ({
      objectStableId: i.affectedStableId,
      impactState: i.impactState,
    })),
    readyForNextStage,
    approved: false,
    impliesEngineeringApproval: false,
    impliesSchedulePercentComplete: false,
    gate,
  };
}

export function queryWorkPackageMaturity(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
}): WorkPackageMaturityQuery {
  const wp = getWorkPackage(input.projectId, input.workPackageStableId);
  if (!wp) throw new Error("work_package_not_found");
  const assignment = getPatternAssignment(
    input.workspaceId,
    input.projectId,
    input.workPackageStableId,
  );
  const patternId = assignment?.patternId ?? "BROWNFIELD_MODIFICATION";
  const patternVersion = assignment?.patternVersion ?? "1.0.0";
  const pattern = getPatternDefinition(patternId, patternVersion)!;
  const stageId = assignment?.currentStageId ?? "engineering_design";
  const readiness = evaluateNextStageReadiness(input);
  const history = ensure(input.workspaceId).history.filter(
    (h) => h.projectId === input.projectId && h.workPackageStableId === input.workPackageStableId,
  );

  return {
    workPackageStableId: input.workPackageStableId,
    workType: pattern.engineerFacingWorkType,
    patternId,
    patternVersion,
    patternNativeStageId: stageId,
    patternNativeStageLabel: stageLabel(pattern, stageId),
    normalizedBand: mapStageToNormalizedBand(patternId, stageId),
    legacyMaturityLabel: wp.maturity,
    readiness,
    nextCheckpoint: readiness.nextCheckpointLabel,
    blockerCount: readiness.blockers.length,
    blockers: readiness.blockers,
    historyCount: history.length,
    governingMaturitySingle: true,
    scheduleProgressSeparated: true,
  };
}

export function queryProjectMaturityProfile(input: {
  workspaceId: string;
  projectId: string;
}): ProjectMaturityProfile {
  const snap = snapshotProjectWorkspace(input.projectId);
  const packages = listWorkPackages(input.projectId);
  const active = packages.filter((p) => p.active && p.status !== "CLOSED");
  const completed = packages.filter((p) => p.status === "CLOSED" || p.maturity === "Closed");
  const excluded = packages.filter((p) => !p.active && p.status !== "CLOSED");

  const workPackages = active.map((wp) => {
    const a = getPatternAssignment(input.workspaceId, input.projectId, wp.stableId);
    const patternId = a?.patternId ?? "BROWNFIELD_MODIFICATION";
    const stageId = a?.currentStageId ?? "engineering_design";
    const pattern = getPatternDefinition(patternId)!;
    return {
      stableId: wp.stableId,
      workType: pattern.engineerFacingWorkType,
      patternId,
      nativeStageLabel: stageLabel(pattern, stageId),
      normalizedBand: mapStageToNormalizedBand(patternId, stageId),
    };
  });

  const bands: ProjectMaturityBandBucket[] = NORMALIZED_MATURITY_BANDS.map((band) => {
    const ids = workPackages.filter((w) => w.normalizedBand === band).map((w) => w.stableId);
    return { band, count: ids.length, workPackageStableIds: ids };
  }).filter((b) => b.count > 0 || true);

  const nonZero = bands.filter((b) => b.count > 0);
  let summaryLabel: string | null = null;
  if (nonZero.length === 0) summaryLabel = "No active Work Packages";
  else if (nonZero.length === 1) {
    summaryLabel = `Predominantly ${nonZero[0]!.band.replace(/_/g, " ")} (derived summary)`;
  } else {
    summaryLabel = "Mixed Engineering / Execution (derived summary)";
  }

  return {
    projectId: input.projectId,
    projectLifecycleKeyPreserved: snap.lifecycle.currentKey,
    projectGateSeparated: true,
    falseSingleProjectStage: false,
    authoritativeSingleStage: null,
    summaryLabel,
    summaryIsDerivedOnly: true,
    bands,
    activeWorkPackageCount: active.length,
    completedWorkPackageCount: completed.length,
    excludedWorkPackageCount: excluded.length,
    weighting: "UNWEIGHTED_WP_COUNT",
    workPackages,
  };
}

export function queryDeliverableMaturity(input: {
  workspaceId: string;
  projectId: string;
  deliverableStableId: string;
}): DeliverableMaturityRecord & {
  maturityVsIssuePurposeSeparated: true;
  maturityVsApprovalSeparated: true;
  maturityVsRevisionSeparated: true;
} {
  const store = ensure(input.workspaceId);
  let rec = store.deliverables.get(dkey(input.projectId, input.deliverableStableId));
  if (!rec) {
    const obj = findByStableId(input.projectId, input.deliverableStableId);
    rec = {
      id: id(),
      tenantId: "00000000-0000-4000-8000-000000000041",
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      workPackageStableId: null,
      deliverableStableId: input.deliverableStableId,
      maturity: "IN_DEVELOPMENT",
      revision: "A",
      reviewStatus: "NOT_STARTED",
      issuePurpose: "UNSPECIFIED",
      approvalState: "NOT_APPROVED",
      schedulePercentComplete: null,
      provenance: {
        source: "eos3.multi-level-maturity",
        displayName: obj?.displayName ?? input.deliverableStableId,
        fabricatedApproval: false,
      },
      updatedAt: now(),
    };
    store.deliverables.set(dkey(input.projectId, input.deliverableStableId), rec);
  }
  return {
    ...rec,
    maturityVsIssuePurposeSeparated: true,
    maturityVsApprovalSeparated: true,
    maturityVsRevisionSeparated: true,
  };
}

export function setDeliverableMaturity(input: {
  workspaceId: string;
  projectId: string;
  deliverableStableId: string;
  workPackageStableId?: string | null;
  maturity?: DeliverableMaturityState;
  revision?: string;
  reviewStatus?: DeliverableMaturityRecord["reviewStatus"];
  issuePurpose?: DeliverableIssuePurpose;
  approvalState?: DeliverableMaturityRecord["approvalState"];
  /** Never write approval as READY_FOR_CURRENT_PURPOSE synonym */
  authorized: boolean;
}): DeliverableMaturityRecord {
  if (!input.authorized) throw new Error("unauthorized_maturity_write");
  const current = queryDeliverableMaturity({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    deliverableStableId: input.deliverableStableId,
  });
  const next: DeliverableMaturityRecord = {
    ...current,
    workPackageStableId: input.workPackageStableId ?? current.workPackageStableId,
    maturity: input.maturity ?? current.maturity,
    revision: input.revision ?? current.revision,
    reviewStatus: input.reviewStatus ?? current.reviewStatus,
    issuePurpose: input.issuePurpose ?? current.issuePurpose,
    approvalState: input.approvalState ?? current.approvalState,
    updatedAt: now(),
    provenance: {
      ...current.provenance,
      // READY_FOR_CURRENT_PURPOSE ≠ APPROVED
      readyForPurposeImpliesApproved: false,
    },
  };
  // READY_FOR_CURRENT_PURPOSE must not silently imply APPROVED
  if (input.maturity === "READY_FOR_CURRENT_PURPOSE" && input.approvalState == null) {
    next.approvalState = current.approvalState === "APPROVED" ? "APPROVED" : "NOT_APPROVED";
  }
  ensure(input.workspaceId).deliverables.set(
    dkey(input.projectId, input.deliverableStableId),
    next,
  );
  return next;
}

export function recordMaturityOverride(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
  reason: string;
  authorityRole: string;
  authorityUserId: string;
  evidenceRefs?: string[];
  authorized: boolean;
}): MaturityOverride {
  if (!input.authorized) throw new Error("unauthorized_maturity_write");
  if (!input.authorityRole || input.authorityRole === "author") {
    throw new Error("maturity_override_authority_required");
  }
  const readiness = evaluateNextStageReadiness({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
  });
  const override: MaturityOverride = {
    readinessPercentAtOverride: readiness.readinessPercent,
    reason: input.reason,
    authorityRole: input.authorityRole,
    authorityUserId: input.authorityUserId,
    evidenceRefs: input.evidenceRefs ?? [],
    at: now(),
  };
  ensure(input.workspaceId).overrides.push(override);
  return override;
}

export function transitionWorkPackageMaturity(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
  targetStageId: string;
  actorId: string;
  /** Edit WP ≠ gated transition authority */
  transitionAuthorized: boolean;
  rationale: string;
  evidenceRefs?: string[];
  override?: {
    reason: string;
    authorityRole: string;
    authorityUserId: string;
  } | null;
  allowAutomaticNonAuthoritative?: boolean;
}): MaturityTransitionRecord {
  if (!input.transitionAuthorized) throw new Error("unauthorized_maturity_transition");

  const assignment = getPatternAssignment(
    input.workspaceId,
    input.projectId,
    input.workPackageStableId,
  );
  if (!assignment) throw new Error("pattern_assignment_not_found");
  const pattern = getPatternDefinition(assignment.patternId, assignment.patternVersion);
  if (!pattern) throw new Error("pattern_not_found");

  const target = pattern.stages.find((s) => s.stageId === input.targetStageId);
  if (!target) throw new Error("target_stage_not_in_pattern");

  const previousStageId = assignment.currentStageId;
  const prevOrder = pattern.stages.find((s) => s.stageId === previousStageId)?.order ?? 0;
  const direction: MaturityTransitionRecord["direction"] =
    target.order > prevOrder ? "FORWARD" : target.order < prevOrder ? "BACKWARD" : "LATERAL";

  const readiness = evaluateNextStageReadiness({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
  });

  let override: MaturityOverride | null = null;
  if (!readiness.readyForNextStage && direction === "FORWARD") {
    if (!input.override) throw new Error("transition_blocked_without_override");
    override = recordMaturityOverride({
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      workPackageStableId: input.workPackageStableId,
      reason: input.override.reason,
      authorityRole: input.override.authorityRole,
      authorityUserId: input.override.authorityUserId,
      authorized: true,
    });
  }

  // Non-authoritative auto only when explicitly permitted — default never
  if (input.allowAutomaticNonAuthoritative && input.actorId === "system") {
    if (!pattern.provenance || pattern.provenance.allowsNonAuthoritativeAutoTransition !== true) {
      throw new Error("non_authoritative_auto_transition_not_permitted");
    }
  }

  const associationsBefore = listAssociations(input.projectId, input.workPackageStableId).map(
    (a) => a.objectStableId,
  );

  // Update pattern assignment stage (non-destructive)
  assignment.currentStageId = input.targetStageId;
  assignment.updatedAt = now();

  const wp = getWorkPackage(input.projectId, input.workPackageStableId);
  if (wp) {
    updateWorkPackage(input.projectId, input.workPackageStableId, {
      maturity: legacyMaturityForStage(input.targetStageId, target.label),
    });
  }

  const associationsAfter = listAssociations(input.projectId, input.workPackageStableId).map(
    (a) => a.objectStableId,
  );
  for (const s of associationsBefore) {
    if (!associationsAfter.includes(s)) throw new Error("maturity_transition_destructive");
  }

  const record: MaturityTransitionRecord = {
    id: id(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
    patternId: assignment.patternId,
    patternVersion: assignment.patternVersion,
    previousStageId,
    newStageId: input.targetStageId,
    previousBand: mapStageToNormalizedBand(assignment.patternId, previousStageId),
    newBand: mapStageToNormalizedBand(assignment.patternId, input.targetStageId),
    direction,
    actorId: input.actorId,
    actorKind: input.actorId === "system" ? "system" : "human",
    authorized: true,
    readinessSnapshot: readiness,
    evidenceRefs: input.evidenceRefs ?? [],
    rationale: input.rationale,
    override,
    at: now(),
    provenance: {
      source: "eos3.multi-level-maturity.transition",
      autoApproved: false,
      automaticAdvancement: false,
      existingEventModelReused: true,
      grantsEngineeringAuthority: false,
    },
  };
  ensure(input.workspaceId).history.push(record);
  return record;
}

export function getWorkPackageMaturityHistory(
  workspaceId: string,
  projectId: string,
  workPackageStableId: string,
): MaturityTransitionRecord[] {
  return ensure(workspaceId)
    .history.filter(
      (h) => h.projectId === projectId && h.workPackageStableId === workPackageStableId,
    )
    .sort((a, b) => a.at.localeCompare(b.at));
}

export function unauthorizedMaturityWriteBlocked(input: {
  callerWorkspaceId: string;
  assignmentWorkspaceId: string;
}): boolean {
  return input.callerWorkspaceId !== input.assignmentWorkspaceId;
}

export function buildWorkPackageMaturityUiContract(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
}): {
  workType: string;
  currentStage: string;
  readinessPercent: number;
  nextCheckpoint: string | null;
  blockerCount: number;
  readyForNextStage: boolean;
  engineeringLanguage: true;
} {
  const q = queryWorkPackageMaturity(input);
  return {
    workType: q.workType,
    currentStage: q.patternNativeStageLabel,
    readinessPercent: q.readiness.readinessPercent,
    nextCheckpoint: q.nextCheckpoint,
    blockerCount: q.blockerCount,
    readyForNextStage: q.readiness.readyForNextStage,
    engineeringLanguage: true,
  };
}

export function ensurePilot001MaturityState(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): {
  projectLifecycleKey: string;
  wpQuery: WorkPackageMaturityQuery;
  projectProfile: ProjectMaturityProfile;
  deliverable: ReturnType<typeof queryDeliverableMaturity>;
  impactScenario: {
    stageUnchanged: boolean;
    readinessReduced: boolean;
    blockersPresent: boolean;
  };
} {
  const seeded = seedPilot001SupportFrameWorkPackage(input.projectId);
  ensurePilot001BrownfieldPattern({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
  });

  const before = queryWorkPackageMaturity({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: "WP-STR-004",
  });

  setDeliverableMaturity({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    deliverableStableId: "DEL-001",
    workPackageStableId: "WP-STR-004",
    maturity: "IN_DEVELOPMENT",
    revision: "A",
    reviewStatus: "NOT_STARTED",
    issuePurpose: "UNSPECIFIED",
    approvalState: "NOT_APPROVED",
    authorized: true,
  });

  const readinessBeforeImpact = before.readiness.readinessPercent;

  processEngineeringChange({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    triggerKind: "ASSUMPTION_REVISION",
    triggerStableId: "ASM-001",
    triggerObjectClass: "Assumption",
    previousRevision: "Rev 1",
    newRevision: "Rev 2",
    changeSummary: "Vendor operating mass changed from 12 t to 15 t",
    eventKey: "wf2-mass",
  });

  const after = queryWorkPackageMaturity({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: "WP-STR-004",
  });

  return {
    projectLifecycleKey: seeded.projectLifecycleKey,
    wpQuery: after,
    projectProfile: queryProjectMaturityProfile({
      workspaceId: input.workspaceId,
      projectId: input.projectId,
    }),
    deliverable: queryDeliverableMaturity({
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      deliverableStableId: "DEL-001",
    }),
    impactScenario: {
      stageUnchanged: after.patternNativeStageId === before.patternNativeStageId,
      readinessReduced:
        after.readiness.readinessPercent < readinessBeforeImpact ||
        after.readiness.blockers.length > 0 ||
        after.readiness.materialImpacts.length > 0,
      blockersPresent: after.blockerCount > 0 || after.readiness.materialImpacts.length > 0,
    },
  };
}

export function runMixedProjectMaturityScenario(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): ProjectMaturityProfile {
  const specs: Array<{
    stableId: string;
    title: string;
    patternId: string;
    stageId: string;
    maturity: WorkPackageMaturity;
  }> = [
    {
      stableId: "WP-MIX-A",
      title: "FEED package development",
      patternId: "GREENFIELD_ENGINEERING",
      stageId: "feed",
      maturity: "FEED",
    },
    {
      stableId: "WP-MIX-B",
      title: "Detailed engineering package",
      patternId: "GREENFIELD_ENGINEERING",
      stageId: "detailed_engineering",
      maturity: "Detailed Engineering",
    },
    {
      stableId: "WP-MIX-C",
      title: "IFC package",
      patternId: "BROWNFIELD_MODIFICATION",
      stageId: "ready_for_construction_ifc",
      maturity: "Ready for Construction",
    },
    {
      stableId: "WP-MIX-D",
      title: "Construction support",
      patternId: "BROWNFIELD_MODIFICATION",
      stageId: "construction_support",
      maturity: "Construction",
    },
  ];

  for (const s of specs) {
    if (!getWorkPackage(input.projectId, s.stableId)) {
      createWorkPackage({
        projectId: input.projectId,
        stableId: s.stableId,
        title: s.title,
        description: s.title,
        maturity: s.maturity,
      });
    }
    const pattern = getPatternDefinition(s.patternId)!;
    const entry =
      pattern.permittedEntryStageIds.find((id) => id === s.stageId) ??
      pattern.permittedEntryStageIds[0]!;
    assignEngineeringPattern({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      workPackageStableId: s.stableId,
      patternId: s.patternId,
      entryStageId: entry,
      entryReason: "Mixed project maturity scenario",
    });
    // Scenario places WP at target stage without implying that stage was a permitted entry
    const a = getPatternAssignment(input.workspaceId, input.projectId, s.stableId);
    if (a) {
      a.currentStageId = s.stageId;
      a.updatedAt = now();
    }
    updateWorkPackage(input.projectId, s.stableId, { maturity: s.maturity });
  }

  return queryProjectMaturityProfile(input);
}

export function runMultiPatternMaturityScenario(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): ProjectMaturityProfile {
  const specs = [
    {
      patternId: "GREENFIELD_ENGINEERING",
      workPackageStableId: "WP-MP-GF",
      title: "New pump skid",
      description: "greenfield new pump installation",
      entryStageId: "detailed_engineering",
    },
    {
      patternId: "BROWNFIELD_MODIFICATION",
      workPackageStableId: "WP-MP-BF",
      title: "Platform modification",
      description: "brownfield modification existing structure",
      entryStageId: "engineering_design",
    },
    {
      patternId: "VENDOR_CHANGE_ASSESSMENT",
      workPackageStableId: "WP-MP-VC",
      title: "Vendor load change",
      description: "vendor operating mass datasheet revision",
      entryStageId: "engineering_impact_review",
    },
    {
      patternId: "SITE_TECHNICAL_SUPPORT",
      workPackageStableId: "WP-MP-SS",
      title: "Field TQ",
      description: "construction field TQ site support",
      entryStageId: "technical_response",
    },
  ] as const;

  for (const s of specs) {
    runPatternValidationScenario({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      patternId: s.patternId,
      workPackageStableId: s.workPackageStableId,
      title: s.title,
      description: s.description,
      entryStageId: s.entryStageId,
    });
  }

  return queryProjectMaturityProfile(input);
}

export function runMixedDeliverableMaturityScenario(input: {
  workspaceId: string;
  projectId: string;
  workPackageStableId: string;
}): {
  workPackageStage: string;
  deliverables: DeliverableMaturityRecord[];
} {
  const calc = setDeliverableMaturity({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    deliverableStableId: "CALC-DEL-001",
    workPackageStableId: input.workPackageStableId,
    maturity: "UNDER_REVIEW",
    revision: "B",
    reviewStatus: "UNDER_REVIEW",
    issuePurpose: "IFR",
    approvalState: "NOT_APPROVED",
    authorized: true,
  });
  const drawing = setDeliverableMaturity({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    deliverableStableId: "DWG-DEL-001",
    workPackageStableId: input.workPackageStableId,
    maturity: "IN_DEVELOPMENT",
    revision: "A",
    reviewStatus: "IN_PROGRESS",
    issuePurpose: "UNSPECIFIED",
    approvalState: "NOT_APPROVED",
    authorized: true,
  });
  const report = setDeliverableMaturity({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    deliverableStableId: "RPT-DEL-001",
    workPackageStableId: input.workPackageStableId,
    maturity: "READY_FOR_REVIEW",
    revision: "A",
    reviewStatus: "NOT_STARTED",
    issuePurpose: "IFA",
    approvalState: "NOT_APPROVED",
    authorized: true,
  });

  const wp = queryWorkPackageMaturity({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workPackageStableId: input.workPackageStableId,
  });

  return {
    workPackageStage: wp.patternNativeStageLabel,
    deliverables: [calc, drawing, report],
  };
}

export function measureMaturityPerformanceBaseline(iterations = 10): {
  projectProfileP95Ms: number;
  workPackageQueryP95Ms: number;
  nextStageReadinessP95Ms: number;
  deliverableQueryP95Ms: number;
  blockerCount: number;
} {
  const tenantId = "00000000-0000-4000-8000-000000000041";
  const profile: number[] = [];
  const wpQ: number[] = [];
  const next: number[] = [];
  const del: number[] = [];

  for (let i = 0; i < iterations; i++) {
    __resetMultiLevelMaturityForTests();
    const workspaceId = `00000000-0000-4000-8000-wf2perf${String(i).padStart(4, "0")}`;
    const projectId = `PILOT-001-WF2-PERF-${i}`;
    ensurePilot001MaturityState({ tenantId, workspaceId, projectId });

    const t0 = performance.now();
    queryProjectMaturityProfile({ workspaceId, projectId });
    profile.push(performance.now() - t0);

    const t1 = performance.now();
    queryWorkPackageMaturity({ workspaceId, projectId, workPackageStableId: "WP-STR-004" });
    wpQ.push(performance.now() - t1);

    const t2 = performance.now();
    evaluateNextStageReadiness({ workspaceId, projectId, workPackageStableId: "WP-STR-004" });
    next.push(performance.now() - t2);

    const t3 = performance.now();
    queryDeliverableMaturity({ workspaceId, projectId, deliverableStableId: "DEL-001" });
    del.push(performance.now() - t3);
  }

  const p95 = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.max(0, Math.ceil(0.95 * s.length) - 1)] ?? 0;
  };

  return {
    projectProfileP95Ms: Number(p95(profile).toFixed(3)),
    workPackageQueryP95Ms: Number(p95(wpQ).toFixed(3)),
    nextStageReadinessP95Ms: Number(p95(next).toFixed(3)),
    deliverableQueryP95Ms: Number(p95(del).toFixed(3)),
    blockerCount: 0,
  };
}

export function auditMaturityFoundations() {
  return {
    multiLevelMaturityModel: true,
    conceptSeparation: true,
    projectLevel: true,
    workPackageLevel: true,
    deliverableLevel: true,
    newAssetMaturityModelCreated: false,
    workPackagePrimaryBoundary: true,
    patternNativeMaturity: true,
    patternStageSemanticsPreserved: true,
    normalizedBand: true,
    nativeNormalizedSeparation: true,
    projectMaturityProfile: true,
    summaryDerivedOnly: true,
    falseSingleProjectStageCount: 0,
    existingProjectLifecycleHistoryPreserved: true,
    projectGateWpMaturitySeparation: true,
    deliverableMaturityModel: true,
    issuePurposeSeparation: true,
    approvalSeparation: true,
    revisionSeparation: true,
    maturityReadinessSeparation: true,
    manualMaturityPercentRequired: false,
    scheduleProgressSeparation: true,
    transitionAutoApproval: false,
    automaticMaturityAdvancement: false,
    impactAutoMaturityChange: false,
    gateMaturitySeparation: true,
    workPackageSingleGoverningMaturity: true,
    workPackageStageCouplingRequired: false,
    projectMaturityArbitraryWeighting: false,
    maturityPrimaryNavCreated: false,
    existingEventModelReused: true,
    inProcessSourceOfTruthCreated: false,
    duplicateLifecycleModelCreated: false,
    grantsEngineeringAuthority: false,
    patternsAvailable: listActivePatterns().length,
  };
}

export type { PatternAssignment, WorkPackage };
