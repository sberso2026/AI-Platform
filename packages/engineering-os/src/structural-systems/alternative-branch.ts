/**
 * EOS-D1N-R6 alternative-design branch governance.
 * Records a traceable alternative under one orchestration context.
 * It does not choose, rank, validate, or generate a design.
 */
import { D1N_0_BRANCH_RECORD_STATES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D1nR1Actor, D1nR1Store } from "./orchestration-context";
import { D1N_CONTEXT_AUTHORITY } from "./orchestration-context";
import type { D1nR2Store } from "./design-progression-context";
import type { D1nR3Store } from "./prerequisite-assessment";
import {
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_DIGITAL_THREAD_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY,
  D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY,
  D1K_LIMITATIONS_PRESERVED,
  D1L_TRACK_COMPLETE,
  D1L_TRACK_STATUS,
  D1M_REOPENED,
  D1M_TRACK_COMPLETE,
  D1N_ARCHITECTURE_DEFINED,
  D1N_ARCHITECTURE_READY,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_R5_C10_DEBT,
  D1N_R5_CLOSEOUT_PATH,
  D1N_R5_D1F_DEBT,
  D1N_R5_D1G_BLOCKER_PRESERVED,
  D1N_R5_D1G_DEBT,
  D1N_R5_D1H_DEBT,
  D1N_R5_D1I_DEBT,
  D1N_R5_D1J_DEBT,
  D1N_R5_D1K_DEBT,
  D1N_R5_D1L_DEBT,
  D1N_R5_DEBT_PRESERVED,
  D1N_R5_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R5_PARENT_ARCHITECTURE_PATH,
  D1N_R5_POST_D1J_DEBT_LEDGER,
  D1N_R5_R1_CLOSEOUT_PATH,
  D1N_R5_R2_CLOSEOUT_PATH,
  D1N_R5_R3_CLOSEOUT_PATH,
  D1N_R5_R4_CLOSEOUT_PATH,
  D1N_R5_STRUCTURAL_PACK_COMPLETE,
  D1N_R6_CANONICAL_SCOPE,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  type D1nR5Store,
} from "./human-decision-record";

export const D1N_R6_STATUS = "ALTERNATIVE_BRANCH_GOVERNANCE_IMPLEMENTED" as const;
export const D1N_R6_MATURITY_STATE = "STRUCTURAL_ALTERNATIVE_DESIGN_BRANCH_GOVERNANCE_IMPLEMENTED" as const;
export const D1N_R6_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1N_R6_ALTERNATIVE_DESIGN_BRANCH_GOVERNANCE_CLOSEOUT.md" as const;
export const D1N_R6_PARENT_ARCHITECTURE_PATH = D1N_R5_PARENT_ARCHITECTURE_PATH;
export const D1N_R6_R1_CLOSEOUT_PATH = D1N_R5_R1_CLOSEOUT_PATH;
export const D1N_R6_R2_CLOSEOUT_PATH = D1N_R5_R2_CLOSEOUT_PATH;
export const D1N_R6_R3_CLOSEOUT_PATH = D1N_R5_R3_CLOSEOUT_PATH;
export const D1N_R6_R4_CLOSEOUT_PATH = D1N_R5_R4_CLOSEOUT_PATH;
export const D1N_R6_R5_CLOSEOUT_PATH = D1N_R5_CLOSEOUT_PATH;
export const D1N_R6_SCOPE = D1N_R6_CANONICAL_SCOPE;
export { D1N_R6_CANONICAL_SCOPE, D1N_ARCHITECTURE_DEFINED, D1N_ARCHITECTURE_READY };

export const D1N_RUNTIME_STARTED = true as const;
export const D1N_RUNTIME_COUNT = 6 as const;
export {
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
};
export const D1N_ALTERNATIVE_BRANCH_RUNTIME_READY = true as const;
export const D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY = false as const;
export const D1N_HANDOFF_INTEGRATION_RUNTIME_READY = false as const;

export const D1N_ALTERNATIVE_BRANCH_RUNTIME_IMPLEMENTED = true as const;
export const D1N_ALTERNATIVE_BRANCH_RUNTIME_COUNT = 1 as const;
export const D1N_BRANCH_RECORD_STATES = D1N_0_BRANCH_RECORD_STATES;
export const D1N_R1_ORCHESTRATION_CONTEXT_REUSED = true as const;
export const EXACT_PARENT_ORCHESTRATION_CONTEXT_REQUIRED = true as const;
export const FLOATING_PARENT_ORCHESTRATION_CONTEXT_ALLOWED = false as const;
export const EXACT_R2_PROGRESSION_REFERENCE_REQUIRED_WHERE_APPLICABLE = true as const;
export const ALTERNATIVE_BRANCH_CREATED_EQUALS_PROGRESSION_CHANGED = false as const;
export const CANONICAL_ASSUMPTION_REFERENCES_REUSED = true as const;
export const AI_CAN_INVENT_BRANCH_ASSUMPTIONS = false as const;
export const D1N_BRANCH_ENGINEERING_EVIDENCE_AUTHORSHIP_RUNTIME_COUNT = 0 as const;
export const D1N_BRANCH_SELECTION_DECISION_REFERENCE_IMPLEMENTED = true as const;
export const D1N_BRANCH_SELECTION_REQUIRES_GOVERNED_DECISION_REFERENCE = true as const;
export const BRANCH_SELECTION_REFERENCE_EQUALS_D1N_SELECTED_BEST_DESIGN = false as const;
export const BRANCH_SELECTION_REFERENCE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const BRANCH_SELECTION_REFERENCE_EQUALS_ENGINEERING_APPROVED = false as const;
export const D1N_CAN_AUTHORITATIVELY_SELECT_BEST_ALTERNATIVE = false as const;
export const AI_CAN_AUTHORITATIVELY_SELECT_BEST_ALTERNATIVE = false as const;
export const ADMIN_CAN_SELECT_BEST_ALTERNATIVE_BY_ROLE_ALONE = false as const;
export const D1N_AUTHORITATIVE_ALTERNATIVE_RANKING_RUNTIME_COUNT = 0 as const;
export const D1N_NUMERICAL_ALTERNATIVE_SCORE_RUNTIME_COUNT = 0 as const;
export const BRANCH_NOT_SELECTED_EQUALS_ENGINEERING_INVALID = false as const;
export const BRANCH_NOT_SELECTED_EQUALS_ENGINEERING_NONCOMPLIANT = false as const;
export const BRANCH_NOT_SELECTED_EQUALS_CERTIFICATION_FAILED = false as const;
export const BRANCH_SELECTED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const BRANCH_SELECTED_EQUALS_ENGINEERING_APPROVED = false as const;
export const BRANCH_SELECTED_EQUALS_CONFORMANT = false as const;
export const BRANCH_SELECTED_EQUALS_CERTIFIED = false as const;
export const D1N_ALTERNATIVE_BRANCH_LINEAGE_IMPLEMENTED = true as const;
export const IMPLICIT_BRANCH_DERIVATION_ALLOWED = false as const;
export const D1N_AUTOMATIC_DESIGN_VARIANT_GENERATION_RUNTIME_COUNT = 0 as const;
export const D1N_AUTOMATIC_STRUCTURAL_MODIFICATION_RUNTIME_COUNT = 0 as const;
export const AI_CAN_INVENT_BRANCH_ENGINEERING_EVIDENCE = false as const;
export const AI_CAN_MARK_BRANCH_ENGINEERING_VALIDATED = false as const;
export const AI_CAN_MARK_BRANCH_CERTIFIED = false as const;
export const AI_CAN_CHANGE_DESIGN_PROGRESSION_STATE = false as const;
export { AI_EQUALS_D1N_ENGINEERING_AUTHORITY, ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY };
export const ADMIN_CAN_REWRITE_BRANCH_SELECTION_DECISION = false as const;
export const ADMIN_CAN_BYPASS_BRANCH_GOVERNANCE = false as const;
export const TENANT_WORKSPACE_PROJECT_ALTERNATIVE_BRANCH_SCOPE_ENFORCED = true as const;
export const D1N_ALTERNATIVE_BRANCH_PROVENANCE_REQUIRED = true as const;
export const D1N_ALTERNATIVE_BRANCH_PROVENANCE_PRESERVED = true as const;
export { CANONICAL_FINGERPRINT_REUSED, SECOND_FINGERPRINT_ALGORITHM_CREATED, CANONICAL_CURRENTNESS_REUSED };
export const D1N_ALTERNATIVE_BRANCH_FINGERPRINT_IMPLEMENTED = true as const;
export const FINGERPRINT_VERIFIED_EQUALS_BRANCH_VALIDATED = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_BRANCH_SELECTED = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_BRANCH_CERTIFIED = false as const;
export const SILENT_ALTERNATIVE_BRANCH_MUTATION_ALLOWED = false as const;
export const D1N_ALTERNATIVE_BRANCH_HISTORY_PRESERVED = true as const;
export const D1N_DUPLICATE_ALTERNATIVE_BRANCH_GOVERNED = true as const;
export const D1N_ALTERNATIVE_BRANCH_REPLAY_GOVERNED = true as const;
export const D1N_ALTERNATIVE_BRANCH_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT = 0 as const;
export const AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT = 0 as const;
export const D1N_CURRENTNESS_REASSESSMENT_RUNTIME_COUNT = 0 as const;
export const BRANCH_AUTO_REPOINTED_TO_NEWER_ASSUMPTION = false as const;
export const BRANCH_AUTO_REPOINTED_TO_NEWER_EVIDENCE = false as const;
export const BRANCH_AUTO_REPOINTED_TO_NEWER_DECISION = false as const;
export const BRANCH_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE = false as const;
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
export {
  CANONICAL_DIGITAL_THREAD_REUSED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  D1M_TRACK_COMPLETE,
  D1M_REOPENED,
  D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY,
  D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY,
  D1K_LIMITATIONS_PRESERVED,
  D1L_TRACK_COMPLETE,
  D1L_TRACK_STATUS,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D2_D8_RUNTIME_COUNT,
};
export const D1N_R6_C10_DEBT = D1N_R5_C10_DEBT;
export const D1N_R6_D1F_DEBT = D1N_R5_D1F_DEBT;
export const D1N_R6_D1G_DEBT = D1N_R5_D1G_DEBT;
export const D1N_R6_D1H_DEBT = D1N_R5_D1H_DEBT;
export const D1N_R6_D1I_DEBT = D1N_R5_D1I_DEBT;
export const D1N_R6_D1J_DEBT = D1N_R5_D1J_DEBT;
export const D1N_R6_D1K_DEBT = D1N_R5_D1K_DEBT;
export const D1N_R6_D1L_DEBT = D1N_R5_D1L_DEBT;
export const D1N_R6_DEBT_PRESERVED = D1N_R5_DEBT_PRESERVED;
export const D1N_R6_POST_D1J_DEBT_LEDGER = D1N_R5_POST_D1J_DEBT_LEDGER;
export const D1N_R6_D1G_BLOCKER_PRESERVED = D1N_R5_D1G_BLOCKER_PRESERVED;
export const D1N_R6_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = D1N_R5_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1N_R6_STRUCTURAL_PACK_COMPLETE = D1N_R5_STRUCTURAL_PACK_COMPLETE;
export const D1N_R6_DATABASE_SCHEMA_CHANGED = false as const;
export const D1N_R6_NEW_DEPENDENCY_ADDED = false as const;
export const D1N_R7_CANONICAL_PHASE = "EOS-D1N-R7-CURRENTNESS-STALENESS-AND-REASSESSMENT" as const;
export const D1N_R7_PHASE_TYPE = "CURRENTNESS_STALENESS_AND_REASSESSMENT" as const;
export const D1N_R7_CANONICAL_SCOPE =
  "Implement governed D1N response when upstream referenced evidence or context becomes stale, superseded, or otherwise requires reassessment. Record orchestration currentness, affected-context detection from explicit dependencies, stale or reassessment-required states, historical preservation, and reevaluation records. Do not infer undocumented dependency propagation, automatically revalidate engineering, automatically reapprove transitions, automatically refresh historical references, recertify, or mutate previous decisions or history." as const;
export const D1N_R6_READY_FOR_NEXT_PHASE = true as const;
export const D1N_R6_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const BRANCH_AUTHORITY = D1N_CONTEXT_AUTHORITY;
const AUTHORITATIVE_LABELS = new Set(["best", "optimal", "preferred", "safest", "cheapest", "best option", "optimal design", "technically superior"]);
const FLOATING = new Set(["latest", "current", "newest", "head", "active", "latest orchestration", "active orchestration", "current progression"]);

export type D1nR6Ref = { id: string; fingerprint: string };
export type D1nR6BranchState = (typeof D1N_0_BRANCH_RECORD_STATES)[number];

export type D1nR6Input = {
  branchId: string;
  displayLabel: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  progressionId?: string | null;
  progressionFingerprint?: string | null;
  parentBranchId?: string | null;
  predecessorBranchId?: string | null;
  assumptionReferences?: D1nR6Ref[];
  evidenceReferences?: D1nR6Ref[];
  decisionReferences?: D1nR6Ref[];
  selectionDecisionId?: string | null;
  selectionDecisionFingerprint?: string | null;
  provenanceRef: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  assumptionText?: string;
  evidenceBody?: string;
  inferParent?: boolean;
  selectBest?: boolean;
  rank?: number | null;
  score?: number | null;
  branchState?: string;
  engineeringValidated?: boolean;
  engineeringApproved?: boolean;
  certified?: boolean;
  conformance?: boolean;
  solverExecution?: boolean;
  generateVariant?: boolean;
  modifyStructure?: boolean;
  progressionChange?: boolean;
  executeTransition?: boolean;
};

export type D1nR6CitedAssumption = { assumptionId: string; fingerprint: string; assessmentStatus: string };
export type D1nR6CitedEvidence = { evidenceId: string; fingerprint: string };
export type D1nR6CitedDecision = { decisionId: string; fingerprint: string; outcome: string };

export type D1nR6Branch = {
  branchId: string;
  displayLabel: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  progressionId: string | null;
  progressionFingerprint: string | null;
  parentBranchId: string | null;
  predecessorBranchId: string | null;
  assumptionReferences: readonly D1nR6CitedAssumption[];
  evidenceReferences: readonly D1nR6CitedEvidence[];
  decisionReferences: readonly D1nR6CitedDecision[];
  selectionDecisionId: string | null;
  selectionDecisionFingerprint: string | null;
  branchState: D1nR6BranchState;
  selectedByGovernedDecision: boolean;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: typeof BRANCH_AUTHORITY;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "RETAINED_HISTORICAL";
  technicallyBest: false;
  engineeringValidated: false;
  engineeringApproved: false;
  engineeringInvalid: false;
  conformant: false;
  certified: false;
  progressionChanged: false;
};

export type D1nR6History = {
  historyId: string;
  branchId: string;
  action: "CREATED" | "RETAINED_HISTORICAL";
  fingerprint: string;
  recordedAt: string;
};

export type D1nR6Store = {
  now: () => string;
  branches: D1nR6Branch[];
  history: D1nR6History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function assertActor(actor: D1nR1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_BRANCH_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_BRANCH_AUTHORITY");
  if (actor.authority === "LIFECYCLE_GATE_DECISION") fail("DECISION_AUTHORITY_DOES_NOT_SELECT_IN_R6");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY" || actor.authority === "ENGINEERING_VALIDATION_AUTHORITY") fail("BRANCH_AUTHORITY_NOT_ENGINEERING_AUTHORITY");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("BRANCH_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== BRANCH_AUTHORITY) fail("UNAUTHORIZED");
}

function assertProhibited(input: D1nR6Input): void {
  if (input.selectBest === true) fail("BEST_SELECTION_NOT_IN_R6");
  if (input.rank != null) fail("RANKING_NOT_IN_R6");
  if (input.score != null) fail("ALTERNATIVE_SCORE_NOT_IN_R6");
  if (input.inferParent === true) fail("IMPLICIT_DERIVATION_REJECTED");
  if (input.assumptionText != null) fail("ASSUMPTION_AUTHORSHIP_NOT_IN_R6");
  if (input.evidenceBody != null) fail("EVIDENCE_AUTHORSHIP_NOT_IN_R6");
  if (input.generateVariant === true) fail("DESIGN_VARIANT_GENERATION_NOT_IN_R6");
  if (input.modifyStructure === true) fail("STRUCTURAL_MODIFICATION_NOT_IN_R6");
  if (input.engineeringValidated === true) fail("ENGINEERING_VALIDATION_NOT_IN_R6");
  if (input.engineeringApproved === true) fail("ENGINEERING_APPROVAL_NOT_IN_R6");
  if (input.certified === true) fail("CERTIFICATION_NOT_IN_R6");
  if (input.conformance === true) fail("CONFORMANCE_NOT_IN_R6");
  if (input.solverExecution === true) fail("SOLVER_NOT_IN_R6");
  if (input.progressionChange === true) fail("PROGRESSION_MUTATION_NOT_IN_R6");
  if (input.executeTransition === true) fail("STAGE_TRANSITION_EXECUTION_NOT_IN_R6");
  if (input.branchState != null && input.branchState !== "OPEN" && input.branchState !== "DECISION_CITED") {
    fail(/^[A-Z0-9_]+$/.test(input.branchState) ? "BRANCH_STATUS_INVALID" : "FREEFORM_BRANCH_STATUS_REJECTED");
  }
}

function branchFingerprint(body: {
  branchId: string;
  displayLabel: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  progressionId: string | null;
  progressionFingerprint: string | null;
  parentBranchId: string | null;
  predecessorBranchId: string | null;
  assumptionReferences: readonly D1nR6CitedAssumption[];
  evidenceReferences: readonly D1nR6CitedEvidence[];
  decisionReferences: readonly D1nR6CitedDecision[];
  selectionDecisionId: string | null;
  selectionDecisionFingerprint: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  authority: string;
}): string {
  return fingerprintCanonical(body);
}

export function createD1nR6Store(now: () => string = () => "2026-10-22T00:00:00.000Z"): D1nR6Store {
  return { now, branches: [], history: [] };
}

export function recordAlternativeBranch(
  orchestration: D1nR1Store,
  progression: D1nR2Store,
  assessments: D1nR3Store,
  decisions: D1nR5Store,
  store: D1nR6Store,
  actor: D1nR1Actor,
  input: D1nR6Input,
): D1nR6Branch {
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_PROJECT_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (!input.branchId.trim() || FLOATING.has(input.branchId.trim().toLowerCase())) fail("BRANCH_IDENTITY_REQUIRED");
  if (!input.displayLabel.trim()) fail("BRANCH_LABEL_REQUIRED");
  if (AUTHORITATIVE_LABELS.has(input.displayLabel.trim().toLowerCase())) fail("AUTHORITATIVE_BRANCH_LABEL_REJECTED");
  if (!input.orchestrationContextId.trim() || FLOATING.has(input.orchestrationContextId.trim().toLowerCase())) fail("FLOATING_PARENT_CONTEXT_REJECTED");
  if (!input.orchestrationContextFingerprint.trim()) fail("EXACT_CONTEXT_FINGERPRINT_REQUIRED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef) || blockedParty(input.branchId) || blockedParty(input.displayLabel)) {
    fail(blockedParty(input.provenanceRef) || blockedParty(input.branchId) || blockedParty(input.displayLabel) ? "AI_NOT_BRANCH_AUTHORITY" : "MISSING_PROVENANCE");
  }
  const context = orchestration.records.find((row) => row.contextId === input.orchestrationContextId);
  if (!context) fail("ORCHESTRATION_CONTEXT_REQUIRED");
  if (context.fingerprint !== input.orchestrationContextFingerprint) fail("ORCHESTRATION_CONTEXT_FINGERPRINT_MISMATCH");
  if (context.recordStatus !== "CURRENT") fail("ORCHESTRATION_CONTEXT_NOT_CURRENT");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  let progressionId: string | null = null;
  let progressionFingerprint: string | null = null;
  if (input.progressionId != null && input.progressionId !== "") {
    if (FLOATING.has(input.progressionId.trim().toLowerCase())) fail("FLOATING_PROGRESSION_REJECTED");
    if (!input.progressionFingerprint?.trim()) fail("EXACT_PROGRESSION_FINGERPRINT_REQUIRED");
    const stage = progression.records.find((row) => row.progressionId === input.progressionId);
    if (!stage) fail("PROGRESSION_CONTEXT_REQUIRED");
    if (stage.fingerprint !== input.progressionFingerprint) fail("PROGRESSION_FINGERPRINT_MISMATCH");
    if (stage.orchestrationContextId !== context.contextId || stage.orchestrationContextFingerprint !== context.fingerprint) fail("PROGRESSION_CONTEXT_MISMATCH");
    if (stage.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    if (stage.workspaceId !== actor.workspaceId || stage.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
    progressionId = stage.progressionId;
    progressionFingerprint = stage.fingerprint;
  }
  const assumptionReferences = (input.assumptionReferences ?? []).map((ref) => {
    if (!ref.id.trim() || FLOATING.has(ref.id.trim().toLowerCase())) fail("ASSUMPTION_REFERENCE_REQUIRED");
    const assessment = assessments.assessments.find((row) => (row.assessmentId === ref.id || row.prerequisiteId === ref.id) && row.fingerprint === ref.fingerprint);
    if (!assessment) fail("ASSUMPTION_REFERENCE_MISMATCH");
    if (assessment.inputCategory !== "ASSUMPTIONS") fail("ASSUMPTION_CATEGORY_REQUIRED");
    if (assessment.orchestrationContextId !== context.contextId) fail("ASSUMPTION_CONTEXT_MISMATCH");
    if (assessment.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    return { assumptionId: assessment.prerequisiteId, fingerprint: assessment.fingerprint, assessmentStatus: assessment.assessmentStatus };
  }).sort((left, right) => left.assumptionId.localeCompare(right.assumptionId));
  const evidenceReferences = (input.evidenceReferences ?? []).map((ref) => {
    if (!ref.id.trim() || FLOATING.has(ref.id.trim().toLowerCase())) fail("EVIDENCE_REFERENCE_REQUIRED");
    const assessment = assessments.assessments.find((row) => row.assessmentId === ref.id);
    if (!assessment || assessment.fingerprint !== ref.fingerprint) fail("EVIDENCE_REFERENCE_MISMATCH");
    if (assessment.inputCategory !== "ENGINEERING_EVIDENCE_REFERENCES") fail("EVIDENCE_CATEGORY_REQUIRED");
    if (assessment.orchestrationContextId !== context.contextId) fail("EVIDENCE_CONTEXT_MISMATCH");
    return { evidenceId: assessment.assessmentId, fingerprint: assessment.fingerprint };
  }).sort((left, right) => left.evidenceId.localeCompare(right.evidenceId));
  const decisionReferences = (input.decisionReferences ?? []).map((ref) => {
    const decision = decisions.decisions.find((row) => row.decisionId === ref.id);
    if (!decision || decision.fingerprint !== ref.fingerprint) fail("DECISION_REFERENCE_MISMATCH");
    if (decision.orchestrationContextId !== context.contextId) fail("DECISION_CONTEXT_MISMATCH");
    if (decision.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    return { decisionId: decision.decisionId, fingerprint: decision.fingerprint, outcome: decision.outcome };
  }).sort((left, right) => left.decisionId.localeCompare(right.decisionId));
  let selectionDecisionId: string | null = null;
  let selectionDecisionFingerprint: string | null = null;
  let selectedByGovernedDecision = false;
  if (input.selectionDecisionId != null && input.selectionDecisionId !== "") {
    if (!input.selectionDecisionFingerprint?.trim()) fail("SELECTION_DECISION_FINGERPRINT_REQUIRED");
    const decision = decisions.decisions.find((row) => row.decisionId === input.selectionDecisionId);
    if (!decision || decision.fingerprint !== input.selectionDecisionFingerprint) fail("SELECTION_DECISION_MISMATCH");
    if (decision.gateId !== "MAJOR_SYSTEM_SELECTION") fail("SELECTION_GATE_MISMATCH");
    if (decision.orchestrationContextId !== context.contextId) fail("SELECTION_CONTEXT_MISMATCH");
    if (decision.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    selectionDecisionId = decision.decisionId;
    selectionDecisionFingerprint = decision.fingerprint;
    selectedByGovernedDecision = decision.humanTransitionApprovalRecorded;
  }
  const branchState: D1nR6BranchState = selectionDecisionId ? "DECISION_CITED" : "OPEN";
  if (input.branchState != null && input.branchState !== branchState) fail("BRANCH_STATUS_MISMATCH");
  const parent = input.parentBranchId ? store.branches.find((row) => row.branchId === input.parentBranchId && row.recordStatus === "CURRENT") : null;
  if (input.parentBranchId) {
    if (!parent) fail("PARENT_BRANCH_REQUIRED");
    if (parent.branchId === input.branchId) fail("LINEAGE_CYCLE");
    if (parent.orchestrationContextId !== context.contextId) fail("PARENT_CONTEXT_MISMATCH");
  }
  const predecessor = input.predecessorBranchId ? store.branches.find((row) => row.branchId === input.predecessorBranchId) : null;
  if (input.predecessorBranchId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    if (predecessor.orchestrationContextId !== context.contextId) fail("PREDECESSOR_CONTEXT_MISMATCH");
  }
  const fingerprint = branchFingerprint({
    branchId: input.branchId,
    displayLabel: input.displayLabel.trim(),
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    progressionId,
    progressionFingerprint,
    parentBranchId: parent?.branchId ?? null,
    predecessorBranchId: predecessor?.branchId ?? null,
    assumptionReferences,
    evidenceReferences,
    decisionReferences,
    selectionDecisionId,
    selectionDecisionFingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    provenanceRef: input.provenanceRef,
    authority: BRANCH_AUTHORITY,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.branches.find((row) => row.branchId === input.branchId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("BRANCH_ALREADY_RECORDED");
  }
  if (predecessor && predecessor.fingerprint === fingerprint) fail("BRANCH_UNCHANGED");
  const branch: D1nR6Branch = Object.freeze({
    branchId: input.branchId,
    displayLabel: input.displayLabel.trim(),
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    progressionId,
    progressionFingerprint,
    parentBranchId: parent?.branchId ?? null,
    predecessorBranchId: predecessor?.branchId ?? null,
    assumptionReferences: Object.freeze(assumptionReferences.map((row) => Object.freeze(row))),
    evidenceReferences: Object.freeze(evidenceReferences.map((row) => Object.freeze(row))),
    decisionReferences: Object.freeze(decisionReferences.map((row) => Object.freeze(row))),
    selectionDecisionId,
    selectionDecisionFingerprint,
    branchState,
    selectedByGovernedDecision,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    authority: BRANCH_AUTHORITY,
    provenanceRef: input.provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    technicallyBest: false,
    engineeringValidated: false,
    engineeringApproved: false,
    engineeringInvalid: false,
    conformant: false,
    certified: false,
    progressionChanged: false,
  });
  if (predecessor) {
    const index = store.branches.findIndex((row) => row.branchId === predecessor.branchId);
    store.branches[index] = Object.freeze({ ...predecessor, branchState: "RETAINED_HISTORICAL", recordStatus: "RETAINED_HISTORICAL" });
    store.history.push({ historyId: `hist-${store.history.length + 1}`, branchId: predecessor.branchId, action: "RETAINED_HISTORICAL", fingerprint: predecessor.fingerprint, recordedAt: store.now() });
  }
  store.branches.push(branch);
  store.history.push({ historyId: `hist-${store.history.length + 1}`, branchId: branch.branchId, action: "CREATED", fingerprint, recordedAt: store.now() });
  return branch;
}

export function reconstructAlternativeBranch(store: D1nR6Store, branchId: string): D1nR6Branch {
  const record = store.branches.find((row) => row.branchId === branchId);
  if (!record) fail("BRANCH_NOT_FOUND");
  return record;
}

export function mutateAlternativeBranch(): never {
  return fail("BRANCH_MUTATION_REJECTED");
}
export function selectBestAlternative(): never {
  return fail("BEST_SELECTION_NOT_IN_R6");
}
export function rankAlternatives(): never {
  return fail("RANKING_NOT_IN_R6");
}
export function generateDesignVariant(): never {
  return fail("DESIGN_VARIANT_GENERATION_NOT_IN_R6");
}
export function modifyStructure(): never {
  return fail("STRUCTURAL_MODIFICATION_NOT_IN_R6");
}
export function authorBranchEvidence(): never {
  return fail("EVIDENCE_AUTHORSHIP_NOT_IN_R6");
}
export function repointAlternativeBranch(): never {
  return fail("BRANCH_REPOINT_NOT_IN_R6");
}
export function changeDesignProgression(): never {
  return fail("PROGRESSION_MUTATION_NOT_IN_R6");
}
export function executeStageTransition(): never {
  return fail("STAGE_TRANSITION_EXECUTION_NOT_IN_R6");
}
