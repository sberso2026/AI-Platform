/**
 * EOS-D1N-R2 design-progression context.
 * Records an explicitly supplied stage on an existing R1 orchestration context.
 * It does not infer the stage, decide readiness, or approve a transition.
 */
import { D1N_0_DESIGN_MATURITY_STATES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  CANONICAL_DIGITAL_THREAD_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D1N_CONTEXT_AUTHORITY,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_R1_ARCHITECTURE_DEFINED,
  D1N_R1_ARCHITECTURE_READY,
  D1N_R1_C10_DEBT,
  D1N_R1_CLOSEOUT_PATH,
  D1N_R1_D1F_DEBT,
  D1N_R1_D1G_BLOCKER_PRESERVED,
  D1N_R1_D1G_DEBT,
  D1N_R1_D1H_DEBT,
  D1N_R1_D1I_DEBT,
  D1N_R1_D1J_DEBT,
  D1N_R1_D1K_DEBT,
  D1N_R1_D1K_INTELLIGENCE_READY,
  D1N_R1_D1K_INTERNAL_INTEGRATION_READY,
  D1N_R1_D1K_LIMITATIONS_PRESERVED,
  D1N_R1_D1L_DEBT,
  D1N_R1_D1L_TRACK_COMPLETE,
  D1N_R1_D1L_TRACK_STATUS,
  D1N_R1_D1M_REOPENED,
  D1N_R1_D1M_TRACK_COMPLETE,
  D1N_R1_D1M_TRACK_STATUS,
  D1N_R1_DEBT_PRESERVED,
  D1N_R1_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R1_PARENT_ARCHITECTURE_PATH,
  D1N_R1_POST_D1J_DEBT_LEDGER,
  D1N_R1_STRUCTURAL_PACK_COMPLETE,
  D1N_R2_CANONICAL_SCOPE,
  D2_D8_RUNTIME_COUNT as PRESERVED_D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED as PRESERVED_D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT as PRESERVED_D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED as PRESERVED_D9_RUNTIME_STARTED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  type D1nR1Actor,
  type D1nR1Store,
} from "./orchestration-context";

export const D1N_R2_STATUS = "DESIGN_PROGRESSION_CONTEXT_IMPLEMENTED" as const;
export const D1N_R2_MATURITY_STATE = "STRUCTURAL_DESIGN_PROGRESSION_CONTEXT_IMPLEMENTED" as const;
export const D1N_R2_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1N_R2_DESIGN_PROGRESSION_CONTEXT_CLOSEOUT.md" as const;
export const D1N_R2_PARENT_ARCHITECTURE_PATH = D1N_R1_PARENT_ARCHITECTURE_PATH;
export const D1N_R2_R1_CLOSEOUT_PATH = D1N_R1_CLOSEOUT_PATH;
export const D1N_R2_SCOPE = D1N_R2_CANONICAL_SCOPE;
export const D1N_ARCHITECTURE_DEFINED = D1N_R1_ARCHITECTURE_DEFINED;
export const D1N_ARCHITECTURE_READY = D1N_R1_ARCHITECTURE_READY;

export const D1N_RUNTIME_STARTED = true as const;
export const D1N_RUNTIME_COUNT = 2 as const;
export const D1N_DESIGN_PROGRESSION_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D1N_DESIGN_PROGRESSION_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D1N_DESIGN_PROGRESSION_STATE_ALLOWLIST = D1N_0_DESIGN_MATURITY_STATES;
export const D1N_DESIGN_PROGRESSION_STATE_ALLOWLIST_IMPLEMENTED = true as const;
export const FREEFORM_AUTHORITATIVE_DESIGN_PROGRESSION_STATE_ALLOWED = false as const;
export const UNKNOWN_DESIGN_PROGRESSION_STATE_AUTO_ACCEPTED = false as const;
export { D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY };
export const D1N_DESIGN_PROGRESSION_RUNTIME_READY = true as const;
export const D1N_PREREQUISITE_RUNTIME_READY = false as const;
export const D1N_STAGE_TRANSITION_RUNTIME_READY = false as const;
export const D1N_HUMAN_GATE_RUNTIME_READY = false as const;
export const D1N_ALTERNATIVE_BRANCH_RUNTIME_READY = false as const;
export const D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY = false as const;
export const D1N_HANDOFF_INTEGRATION_RUNTIME_READY = false as const;

export const D1N_R1_ORCHESTRATION_CONTEXT_REUSED = true as const;
export const PARALLEL_D1N_ORCHESTRATION_CONTEXT_CREATED = false as const;
export const EXACT_ORCHESTRATION_CONTEXT_REFERENCE_REQUIRED = true as const;
export const FLOATING_ORCHESTRATION_CONTEXT_REFERENCE_ALLOWED = false as const;
export const DESIGN_PROGRESSION_STATE_AUTO_INFERRED = false as const;
export const AI_CAN_INFER_AUTHORITATIVE_DESIGN_PROGRESSION_STATE = false as const;
export const LIFECYCLE_STAGE_EQUALS_D1N_DESIGN_PROGRESSION_STATE = false as const;
export const LIFECYCLE_TO_D1N_STAGE_AUTO_MAPPING_RUNTIME_COUNT = 0 as const;
export const DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_STAGE_TRANSITION_APPROVED = false as const;
export const DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_PREREQUISITES_SATISFIED = false as const;
export const DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_ENGINEERING_APPROVED = false as const;
export const DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_CERTIFIED = false as const;
export const AUTOMATIC_DESIGN_PROGRESSION_RUNTIME_COUNT = 0 as const;

export const D1N_PROGRESSION_CONTEXT_AUTHORITY = D1N_CONTEXT_AUTHORITY;
export const D1N_PROGRESSION_CONTEXT_AUTHORITY_PRESERVED = true as const;
export const D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_STAGE_APPROVAL_AUTHORITY = false as const;
export const D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY = false as const;
export const D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_ENGINEERING_VALIDATION_AUTHORITY = false as const;
export const D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const AI_CAN_ASSIGN_AUTHORITATIVE_DESIGN_PROGRESSION_STATE = false as const;
export const AI_CAN_ADVANCE_DESIGN_PROGRESSION_STATE = false as const;
export const AI_CAN_MARK_PROGRESSION_PREREQUISITES_SATISFIED = false as const;
export const AI_CAN_APPROVE_STAGE_TRANSITION = false as const;
export { AI_EQUALS_D1N_ENGINEERING_AUTHORITY, ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY };
export const ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE = false as const;
export const TENANT_WORKSPACE_PROJECT_PROGRESSION_SCOPE_ENFORCED = true as const;
export const D1N_DESIGN_PROGRESSION_PROVENANCE_REQUIRED = true as const;
export const D1N_DESIGN_PROGRESSION_PROVENANCE_PRESERVED = true as const;
export { CANONICAL_FINGERPRINT_REUSED, SECOND_FINGERPRINT_ALGORITHM_CREATED };
export const D1N_DESIGN_PROGRESSION_FINGERPRINT_IMPLEMENTED = true as const;
export const FINGERPRINT_VERIFIED_EQUALS_STAGE_APPROVED = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_CERTIFIED = false as const;
export const SILENT_DESIGN_PROGRESSION_STATE_MUTATION_ALLOWED = false as const;
export const D1N_DESIGN_PROGRESSION_HISTORY_PRESERVED = true as const;
export const D1N_DUPLICATE_DESIGN_PROGRESSION_CONTEXT_GOVERNED = true as const;
export const D1N_DESIGN_PROGRESSION_CONTEXT_SPOOFING_PROTECTION_IMPLEMENTED = true as const;

export const D1N_PREREQUISITE_RUNTIME_COUNT = 0 as const;
export const D1N_EVIDENCE_GAP_RUNTIME_COUNT = 0 as const;
export const D1N_NEXT_ACTION_RUNTIME_COUNT = 0 as const;
export const D1N_STAGE_TRANSITION_REQUEST_RUNTIME_COUNT = 0 as const;
export const D1N_STAGE_TRANSITION_RUNTIME_COUNT = 0 as const;
export const D1N_HUMAN_DECISION_GATE_RUNTIME_COUNT = 0 as const;
export const D1N_REVIEW_GATE_RUNTIME_COUNT = 0 as const;
export const D1N_ALTERNATIVE_BRANCH_RUNTIME_COUNT = 0 as const;
export const D1N_CURRENTNESS_REASSESSMENT_RUNTIME_COUNT = 0 as const;
export const D1N_D1M_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D1N_D1K_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D1N_D1L_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D1N_SOLVER_EXECUTION_RUNTIME_COUNT = 0 as const;
export const D1N_CONFORMANCE_RUNTIME_COUNT = 0 as const;
export const D1N_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT = 0 as const;
export const D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT = 0 as const;
export { CANONICAL_DIGITAL_THREAD_REUSED, PARALLEL_D1N_DIGITAL_THREAD_CREATED, PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED };

export const D1M_TRACK_COMPLETE = D1N_R1_D1M_TRACK_COMPLETE;
export const D1M_TRACK_STATUS = D1N_R1_D1M_TRACK_STATUS;
export const D1M_REOPENED = D1N_R1_D1M_REOPENED;
export const D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY = D1N_R1_D1K_INTERNAL_INTEGRATION_READY;
export const D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY = D1N_R1_D1K_INTELLIGENCE_READY;
export const D1K_LIMITATIONS_PRESERVED = D1N_R1_D1K_LIMITATIONS_PRESERVED;
export const D1L_TRACK_COMPLETE = D1N_R1_D1L_TRACK_COMPLETE;
export const D1L_TRACK_STATUS = D1N_R1_D1L_TRACK_STATUS;
export const D9_RUNTIME_STARTED = PRESERVED_D9_RUNTIME_STARTED;
export const D9_RUNTIME_COUNT = PRESERVED_D9_RUNTIME_COUNT;
export const D2_D8_RUNTIME_STARTED = PRESERVED_D2_D8_RUNTIME_STARTED;
export const D2_D8_RUNTIME_COUNT = PRESERVED_D2_D8_RUNTIME_COUNT;
export const D1N_R2_C10_DEBT = D1N_R1_C10_DEBT;
export const D1N_R2_D1F_DEBT = D1N_R1_D1F_DEBT;
export const D1N_R2_D1G_DEBT = D1N_R1_D1G_DEBT;
export const D1N_R2_D1H_DEBT = D1N_R1_D1H_DEBT;
export const D1N_R2_D1I_DEBT = D1N_R1_D1I_DEBT;
export const D1N_R2_D1J_DEBT = D1N_R1_D1J_DEBT;
export const D1N_R2_D1K_DEBT = D1N_R1_D1K_DEBT;
export const D1N_R2_D1L_DEBT = D1N_R1_D1L_DEBT;
export const D1N_R2_DEBT_PRESERVED = D1N_R1_DEBT_PRESERVED;
export const D1N_R2_POST_D1J_DEBT_LEDGER = D1N_R1_POST_D1J_DEBT_LEDGER;
export const D1N_R2_D1G_BLOCKER_PRESERVED = D1N_R1_D1G_BLOCKER_PRESERVED;
export const D1N_R2_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = D1N_R1_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1N_R2_STRUCTURAL_PACK_COMPLETE = D1N_R1_STRUCTURAL_PACK_COMPLETE;
export const D1N_R2_DATABASE_SCHEMA_CHANGED = false as const;
export const D1N_R2_NEW_DEPENDENCY_ADDED = false as const;

export const D1N_R3_CANONICAL_PHASE = "EOS-D1N-R3-PREREQUISITE-ASSESSMENT-AND-EVIDENCE-GAPS" as const;
export const D1N_R3_PHASE_TYPE = "PREREQUISITE_ASSESSMENT_AND_EVIDENCE_GAPS" as const;
export const D1N_R3_CANONICAL_SCOPE =
  "Implement bounded prerequisite assessment and evidence-gap records against the current orchestration and progression context. R3 may record a required input as present, missing, stale, requiring external authority, or available with limitations. Do not request or approve a stage transition, execute a human gate, select an alternative, validate engineering, approve engineering, or certify." as const;
export const D1N_R2_READY_FOR_NEXT_PHASE = true as const;
export const D1N_R2_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const PROGRESSION_AUTHORITY = D1N_PROGRESSION_CONTEXT_AUTHORITY;
const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "current orchestration", "latest context", "active project context"]);

export type D1nR2Input = {
  progressionId: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  designProgressionState?: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  predecessorProgressionId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  structuralIdentityId?: string;
  citedLifecycleStage?: string;
  citedCurrentness?: string;
  inferStage?: boolean;
  mapLifecycle?: boolean;
  advanceStage?: boolean;
  prerequisitesSatisfied?: boolean;
  evidenceGap?: boolean;
  nextAction?: boolean;
  stageTransitionRequest?: boolean;
  stageTransitionApproved?: boolean;
  humanGate?: boolean;
  alternativeSelection?: boolean;
  engineeringValidated?: boolean;
  engineeringApproved?: boolean;
  certified?: boolean;
  solverExecution?: boolean;
  conformance?: boolean;
  cadBimInterpretation?: boolean;
  currentnessReassessment?: boolean;
};

export type D1nR2Record = {
  progressionId: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  structuralIdentityId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  citedLifecycleStage: (typeof D1N_0_DESIGN_MATURITY_STATES)[number];
  designProgressionState: (typeof D1N_0_DESIGN_MATURITY_STATES)[number];
  lifecycleStageIsProgressionState: false;
  citedCurrentness: "CURRENT";
  authority: typeof PROGRESSION_AUTHORITY;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorProgressionId: string | null;
  stageTransitionApproved: false;
  prerequisitesSatisfied: false;
  engineeringValidated: false;
  engineeringApproved: false;
  certified: false;
};

export type D1nR2History = {
  historyId: string;
  progressionId: string;
  action: "CREATED" | "SUPERSEDED";
  designProgressionState: D1nR2Record["designProgressionState"];
  fingerprint: string;
  actorId: string;
  authority: typeof PROGRESSION_AUTHORITY;
  recordedAt: string;
};

export type D1nR2Store = {
  now: () => string;
  records: D1nR2Record[];
  history: D1nR2History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function isDesignStage(value: string): value is D1nR2Record["designProgressionState"] {
  return (D1N_DESIGN_PROGRESSION_STATE_ALLOWLIST as readonly string[]).includes(value);
}

function assertActor(actor: D1nR1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PROGRESSION_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PROGRESSION_AUTHORITY");
  if (actor.authority === "STAGE_APPROVAL_AUTHORITY") fail("PROGRESSION_AUTHORITY_NOT_STAGE_APPROVAL");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("PROGRESSION_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "ENGINEERING_VALIDATION_AUTHORITY") fail("PROGRESSION_AUTHORITY_NOT_ENGINEERING_VALIDATION");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("PROGRESSION_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== PROGRESSION_AUTHORITY) fail("UNAUTHORIZED");
}

function assertProhibited(input: D1nR2Input): void {
  if (input.inferStage === true) fail("PROGRESSION_INFERENCE_NOT_IN_R2");
  if (input.mapLifecycle === true) fail("LIFECYCLE_MAPPING_NOT_IN_R2");
  if (input.advanceStage === true) fail("AUTOMATIC_PROGRESSION_NOT_IN_R2");
  if (input.prerequisitesSatisfied === true) fail("PREREQUISITE_NOT_IN_R2");
  if (input.evidenceGap === true) fail("EVIDENCE_GAP_NOT_IN_R2");
  if (input.nextAction === true) fail("NEXT_ACTION_NOT_IN_R2");
  if (input.stageTransitionRequest === true) fail("STAGE_TRANSITION_NOT_IN_R2");
  if (input.stageTransitionApproved === true) fail("STAGE_APPROVAL_NOT_IN_R2");
  if (input.humanGate === true) fail("HUMAN_GATE_NOT_IN_R2");
  if (input.alternativeSelection === true) fail("ALTERNATIVE_SELECTION_NOT_IN_R2");
  if (input.engineeringValidated === true) fail("ENGINEERING_VALIDATION_NOT_IN_R2");
  if (input.engineeringApproved === true) fail("ENGINEERING_APPROVAL_NOT_IN_R2");
  if (input.certified === true) fail("CERTIFICATION_NOT_IN_R2");
  if (input.solverExecution === true) fail("SOLVER_NOT_IN_R2");
  if (input.conformance === true) fail("CONFORMANCE_NOT_IN_R2");
  if (input.cadBimInterpretation === true) fail("CAD_BIM_INTERPRETATION_NOT_IN_R2");
  if (input.currentnessReassessment === true) fail("CURRENTNESS_REASSESSMENT_NOT_IN_R2");
}

function progressionFingerprint(body: {
  progressionId: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  structuralIdentityId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  designProgressionState: string;
  provenanceRef: string;
  authority: string;
  predecessorProgressionId: string | null;
}): string {
  return fingerprintCanonical(body);
}

function remember(store: D1nR2Store, record: D1nR2Record, action: D1nR2History["action"]): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    progressionId: record.progressionId,
    action,
    designProgressionState: record.designProgressionState,
    fingerprint: record.fingerprint,
    actorId: record.recordedBy,
    authority: record.authority,
    recordedAt: store.now(),
  });
}

export function createD1nR2Store(now: () => string = () => "2026-10-22T00:00:00.000Z"): D1nR2Store {
  return { now, records: [], history: [] };
}

export function recordDesignProgression(orchestration: D1nR1Store, store: D1nR2Store, actor: D1nR1Actor, input: D1nR2Input): D1nR2Record {
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_PROJECT_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (!input.progressionId.trim() || FLOATING.has(input.progressionId.trim().toLowerCase())) fail("PROGRESSION_IDENTITY_REQUIRED");
  if (!input.orchestrationContextId.trim() || FLOATING.has(input.orchestrationContextId.trim().toLowerCase())) fail("FLOATING_ORCHESTRATION_CONTEXT_REJECTED");
  if (!input.orchestrationContextFingerprint.trim()) fail("ORCHESTRATION_CONTEXT_FINGERPRINT_REQUIRED");
  if (blockedParty(input.progressionId) || blockedParty(input.orchestrationContextId) || blockedParty(input.designProgressionState ?? "") || blockedParty(input.provenanceRef)) {
    fail("AI_NOT_PROGRESSION_AUTHORITY");
  }
  if (!input.provenanceRef.trim()) fail("MISSING_PROVENANCE");
  if (input.citedCurrentness != null && input.citedCurrentness !== "CURRENT") fail("CURRENTNESS_REASSESSMENT_NOT_IN_R2");
  if (input.designProgressionState == null || !input.designProgressionState.trim()) fail("EXPLICIT_PROGRESSION_STATE_REQUIRED");
  const stage = input.designProgressionState.trim();
  if (!isDesignStage(stage)) fail(/^[A-Z0-9_]+$/.test(stage) ? "DESIGN_PROGRESSION_STATE_INVALID" : "FREEFORM_PROGRESSION_STATE_REJECTED");
  const context = orchestration.records.find((row) => row.contextId === input.orchestrationContextId);
  if (!context) fail("ORCHESTRATION_CONTEXT_REQUIRED");
  if (context.fingerprint !== input.orchestrationContextFingerprint) fail("ORCHESTRATION_CONTEXT_FINGERPRINT_MISMATCH");
  if (context.recordStatus !== "CURRENT" || context.citedCurrentness !== "CURRENT") fail("ORCHESTRATION_CONTEXT_NOT_CURRENT");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (input.structuralIdentityId != null && input.structuralIdentityId !== context.structuralIdentityId) fail("STRUCTURAL_IDENTITY_MISMATCH");
  if (input.citedLifecycleStage != null && input.citedLifecycleStage !== context.citedLifecycleStage) fail("LIFECYCLE_CITATION_MISMATCH");
  const predecessor = input.predecessorProgressionId ? store.records.find((row) => row.progressionId === input.predecessorProgressionId) : null;
  if (input.predecessorProgressionId) {
    if (!predecessor) fail("PROGRESSION_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    if (predecessor.workspaceId !== actor.workspaceId || predecessor.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    if (predecessor.orchestrationContextId !== context.contextId) fail("ORCHESTRATION_CONTEXT_MISMATCH");
    if (predecessor.designProgressionState === stage && predecessor.provenanceRef === input.provenanceRef) fail("PROGRESSION_UNCHANGED");
  }
  const fingerprint = progressionFingerprint({
    progressionId: input.progressionId,
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    structuralIdentityId: context.structuralIdentityId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    designProgressionState: stage,
    provenanceRef: input.provenanceRef,
    authority: PROGRESSION_AUTHORITY,
    predecessorProgressionId: predecessor?.progressionId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.records.find((row) => row.progressionId === input.progressionId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("PROGRESSION_ALREADY_RECORDED");
  }
  const duplicate = store.records.find((row) => row.recordStatus === "CURRENT" && row.orchestrationContextId === context.contextId && row.progressionId !== predecessor?.progressionId);
  if (duplicate) fail("DUPLICATE_PROGRESSION_REJECTED");
  const record: D1nR2Record = Object.freeze({
    progressionId: input.progressionId,
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    structuralIdentityId: context.structuralIdentityId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    citedLifecycleStage: context.citedLifecycleStage,
    designProgressionState: stage,
    lifecycleStageIsProgressionState: false,
    citedCurrentness: "CURRENT",
    authority: PROGRESSION_AUTHORITY,
    provenanceRef: input.provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorProgressionId: predecessor?.progressionId ?? null,
    stageTransitionApproved: false,
    prerequisitesSatisfied: false,
    engineeringValidated: false,
    engineeringApproved: false,
    certified: false,
  });
  if (predecessor) {
    const index = store.records.findIndex((row) => row.progressionId === predecessor.progressionId);
    const superseded: D1nR2Record = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" });
    store.records[index] = superseded;
    remember(store, superseded, "SUPERSEDED");
  }
  store.records.push(record);
  remember(store, record, "CREATED");
  return record;
}

export function reconstructDesignProgression(store: D1nR2Store, progressionId: string): D1nR2Record {
  const record = store.records.find((row) => row.progressionId === progressionId);
  if (!record) fail("PROGRESSION_NOT_FOUND");
  return record;
}

export function mutateDesignProgression(): never {
  return fail("PROGRESSION_MUTATION_REJECTED");
}
export function inferDesignProgressionState(): never {
  return fail("PROGRESSION_INFERENCE_NOT_IN_R2");
}
export function mapLifecycleStageToProgression(): never {
  return fail("LIFECYCLE_MAPPING_NOT_IN_R2");
}
export function advanceDesignProgression(): never {
  return fail("AUTOMATIC_PROGRESSION_NOT_IN_R2");
}
export function assessPrerequisites(): never {
  return fail("PREREQUISITE_NOT_IN_R2");
}
export function requestStageTransition(): never {
  return fail("STAGE_TRANSITION_NOT_IN_R2");
}
export function approveStageTransition(): never {
  return fail("STAGE_APPROVAL_NOT_IN_R2");
}
export function executeHumanGate(): never {
  return fail("HUMAN_GATE_NOT_IN_R2");
}
export function selectAlternative(): never {
  return fail("ALTERNATIVE_SELECTION_NOT_IN_R2");
}
export function validateEngineering(): never {
  return fail("ENGINEERING_VALIDATION_NOT_IN_R2");
}
export function certifyProgression(): never {
  return fail("CERTIFICATION_NOT_IN_R2");
}
