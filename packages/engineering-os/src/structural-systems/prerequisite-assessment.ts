/**
 * EOS-D1N-R3 prerequisite assessment and evidence gaps.
 * Records whether a required input is present, missing, stale, limited, or waiting on another authority.
 * It does not decide whether the design may advance.
 */
import { D1N_0_INPUT_CATEGORIES, D1N_0_PREREQUISITE_STATUSES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  CANONICAL_DIGITAL_THREAD_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY,
  D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY,
  D1K_LIMITATIONS_PRESERVED,
  D1L_TRACK_COMPLETE,
  D1L_TRACK_STATUS,
  D1M_REOPENED,
  D1M_TRACK_COMPLETE,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_R2_C10_DEBT,
  D1N_R2_D1F_DEBT,
  D1N_R2_D1G_BLOCKER_PRESERVED,
  D1N_R2_D1G_DEBT,
  D1N_R2_D1H_DEBT,
  D1N_R2_D1I_DEBT,
  D1N_R2_D1J_DEBT,
  D1N_R2_D1K_DEBT,
  D1N_R2_D1L_DEBT,
  D1N_R2_DEBT_PRESERVED,
  D1N_R2_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R2_PARENT_ARCHITECTURE_PATH,
  D1N_R2_POST_D1J_DEBT_LEDGER,
  D1N_R2_CLOSEOUT_PATH,
  D1N_R2_R1_CLOSEOUT_PATH,
  D1N_R2_STRUCTURAL_PACK_COMPLETE,
  D1N_R3_CANONICAL_SCOPE,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  type D1nR2Store,
} from "./design-progression-context";
import {
  D1N_CONTEXT_AUTHORITY,
  D1N_R1_ARCHITECTURE_DEFINED,
  D1N_R1_ARCHITECTURE_READY,
  type D1nR1Actor,
  type D1nR1Store,
} from "./orchestration-context";

export const D1N_R3_STATUS = "PREREQUISITE_ASSESSMENT_IMPLEMENTED" as const;
export const D1N_R3_MATURITY_STATE = "STRUCTURAL_PREREQUISITE_ASSESSMENT_AND_EVIDENCE_GAPS_IMPLEMENTED" as const;
export const D1N_R3_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1N_R3_PREREQUISITE_ASSESSMENT_AND_EVIDENCE_GAPS_CLOSEOUT.md" as const;
export const D1N_R3_PARENT_ARCHITECTURE_PATH = D1N_R2_PARENT_ARCHITECTURE_PATH;
export const D1N_R3_R1_CLOSEOUT_PATH = D1N_R2_R1_CLOSEOUT_PATH;
export const D1N_R3_R2_CLOSEOUT_PATH = D1N_R2_CLOSEOUT_PATH;
export const D1N_R3_SCOPE = D1N_R3_CANONICAL_SCOPE;
export const D1N_ARCHITECTURE_DEFINED = D1N_R1_ARCHITECTURE_DEFINED;
export const D1N_ARCHITECTURE_READY = D1N_R1_ARCHITECTURE_READY;

export const D1N_RUNTIME_STARTED = true as const;
export const D1N_RUNTIME_COUNT = 3 as const;
export { D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY, D1N_DESIGN_PROGRESSION_RUNTIME_READY };
export const D1N_PREREQUISITE_RUNTIME_READY = true as const;
export const D1N_PREREQUISITE_RUNTIME_IMPLEMENTED = true as const;
export const D1N_PREREQUISITE_RUNTIME_COUNT = 1 as const;
export const D1N_EVIDENCE_GAP_RUNTIME_IMPLEMENTED = true as const;
export const D1N_EVIDENCE_GAP_RUNTIME_COUNT = 1 as const;
export const D1N_STAGE_TRANSITION_RUNTIME_READY = false as const;
export const D1N_HUMAN_GATE_RUNTIME_READY = false as const;
export const D1N_ALTERNATIVE_BRANCH_RUNTIME_READY = false as const;
export const D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY = false as const;
export const D1N_HANDOFF_INTEGRATION_RUNTIME_READY = false as const;

export const D1N_R1_ORCHESTRATION_CONTEXT_REUSED = true as const;
export const D1N_R2_DESIGN_PROGRESSION_CONTEXT_REUSED = true as const;
export const EXACT_R1_CONTEXT_REFERENCE_REQUIRED = true as const;
export const EXACT_R2_PROGRESSION_REFERENCE_REQUIRED = true as const;
export const FLOATING_R1_CONTEXT_REFERENCE_ALLOWED = false as const;
export const FLOATING_R2_PROGRESSION_REFERENCE_ALLOWED = false as const;
export const D1N_PREREQUISITE_INPUT_CATEGORIES = D1N_0_INPUT_CATEGORIES;
export const D1N_PREREQUISITE_MATRIX_STATUSES = D1N_0_PREREQUISITE_STATUSES;
export const D1N_PREREQUISITE_ASSESSMENT_STATUSES = ["PRESENT", "MISSING", "STALE", "EXTERNAL_AUTHORITY_REQUIRED", "AVAILABLE_WITH_LIMITATIONS"] as const;
export const D1N_PREREQUISITE_STATUS_ALLOWLIST_IMPLEMENTED = true as const;
export const FREEFORM_AUTHORITATIVE_PREREQUISITE_STATUS_ALLOWED = false as const;
export const UNKNOWN_PREREQUISITE_STATUS_AUTO_ACCEPTED = false as const;
export const PREREQUISITE_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const PREREQUISITE_PRESENT_EQUALS_ENGINEERING_APPROVED = false as const;
export const PREREQUISITE_MISSING_EQUALS_ENGINEERING_INCORRECT = false as const;
export const STALE_PREREQUISITE_EQUALS_ENGINEERING_INCORRECT = false as const;
export const AVAILABLE_WITH_LIMITATIONS_EQUALS_AVAILABLE = false as const;
export const R3_CAN_INVENT_STALENESS = false as const;
export const CANONICAL_CURRENTNESS_REUSED = true as const;
export const EVIDENCE_GAP_EQUALS_ENGINEERING_FAILURE = false as const;
export const EVIDENCE_GAP_EQUALS_DESIGN_REJECTION = false as const;
export const EVIDENCE_GAP_EQUALS_STAGE_TRANSITION_DENIED = false as const;
export const EVIDENCE_GAP_EQUALS_CERTIFICATION_FAILURE = false as const;
export const MISSING_REQUIRED_INPUT_AUTO_INVENTED = false as const;
export const PREREQUISITE_ASSESSMENT_COMPLETE_EQUALS_STAGE_READY = false as const;
export const ALL_RECORDED_PREREQUISITES_PRESENT_EQUALS_STAGE_APPROVED = false as const;
export const ALL_RECORDED_PREREQUISITES_PRESENT_EQUALS_STAGE_TRANSITION_AUTHORIZED = false as const;
export const D1N_NUMERICAL_STAGE_READINESS_SCORE_RUNTIME_COUNT = 0 as const;

export const D1N_PREREQUISITE_AUTHORITY = D1N_CONTEXT_AUTHORITY;
export const D1N_PREREQUISITE_AUTHORITY_PRESERVED = true as const;
export const D1N_PREREQUISITE_AUTHORITY_EQUALS_STAGE_APPROVAL_AUTHORITY = false as const;
export const D1N_PREREQUISITE_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY = false as const;
export const D1N_PREREQUISITE_AUTHORITY_EQUALS_ENGINEERING_VALIDATION_AUTHORITY = false as const;
export const D1N_PREREQUISITE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const AI_CAN_INVENT_REQUIRED_EVIDENCE = false as const;
export const AI_CAN_INVENT_PREREQUISITE_SATISFACTION = false as const;
export const AI_CAN_OVERRIDE_STALE_PREREQUISITE = false as const;
export const AI_CAN_MARK_EXTERNAL_AUTHORITY_SATISFIED = false as const;
export const AI_CAN_DECLARE_STAGE_READY = false as const;
export const AI_CAN_APPROVE_STAGE_TRANSITION = false as const;
export { AI_EQUALS_D1N_ENGINEERING_AUTHORITY, ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY };
export const ADMIN_CAN_MARK_MISSING_PREREQUISITE_PRESENT_BY_ROLE_ALONE = false as const;
export const ADMIN_CAN_OVERRIDE_STALE_PREREQUISITE_BY_ROLE_ALONE = false as const;
export const ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE = false as const;
export const TENANT_WORKSPACE_PROJECT_PREREQUISITE_SCOPE_ENFORCED = true as const;
export const D1N_PREREQUISITE_PROVENANCE_REQUIRED = true as const;
export const D1N_PREREQUISITE_PROVENANCE_PRESERVED = true as const;
export { CANONICAL_FINGERPRINT_REUSED, SECOND_FINGERPRINT_ALGORITHM_CREATED, CANONICAL_CURRENTNESS_REUSED as D1N_R3_CURRENTNESS_REUSED };
export const D1N_PREREQUISITE_ASSESSMENT_FINGERPRINT_IMPLEMENTED = true as const;
export const D1N_EVIDENCE_GAP_FINGERPRINT_IMPLEMENTED = true as const;
export const FINGERPRINT_VERIFIED_EQUALS_PREREQUISITE_CORRECT = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_STAGE_READY = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const SILENT_PREREQUISITE_ASSESSMENT_MUTATION_ALLOWED = false as const;
export const D1N_PREREQUISITE_ASSESSMENT_HISTORY_PRESERVED = true as const;
export const D1N_EVIDENCE_GAP_HISTORY_PRESERVED = true as const;
export const D1N_DUPLICATE_PREREQUISITE_ASSESSMENT_GOVERNED = true as const;
export const D1N_DUPLICATE_EVIDENCE_GAP_GOVERNED = true as const;
export const D1N_PREREQUISITE_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1N_EVIDENCE_GAP_SPOOFING_PROTECTION_IMPLEMENTED = true as const;

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
export const D1N_R3_C10_DEBT = D1N_R2_C10_DEBT;
export const D1N_R3_D1F_DEBT = D1N_R2_D1F_DEBT;
export const D1N_R3_D1G_DEBT = D1N_R2_D1G_DEBT;
export const D1N_R3_D1H_DEBT = D1N_R2_D1H_DEBT;
export const D1N_R3_D1I_DEBT = D1N_R2_D1I_DEBT;
export const D1N_R3_D1J_DEBT = D1N_R2_D1J_DEBT;
export const D1N_R3_D1K_DEBT = D1N_R2_D1K_DEBT;
export const D1N_R3_D1L_DEBT = D1N_R2_D1L_DEBT;
export const D1N_R3_DEBT_PRESERVED = D1N_R2_DEBT_PRESERVED;
export const D1N_R3_POST_D1J_DEBT_LEDGER = D1N_R2_POST_D1J_DEBT_LEDGER;
export const D1N_R3_D1G_BLOCKER_PRESERVED = D1N_R2_D1G_BLOCKER_PRESERVED;
export const D1N_R3_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = D1N_R2_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1N_R3_STRUCTURAL_PACK_COMPLETE = D1N_R2_STRUCTURAL_PACK_COMPLETE;
export const D1N_R3_DATABASE_SCHEMA_CHANGED = false as const;
export const D1N_R3_NEW_DEPENDENCY_ADDED = false as const;
export const D1N_R4_CANONICAL_PHASE = "EOS-D1N-R4-STAGE-TRANSITION-REQUEST-GOVERNANCE" as const;
export const D1N_R4_PHASE_TYPE = "STAGE_TRANSITION_REQUEST_GOVERNANCE" as const;
export const D1N_R4_CANONICAL_SCOPE =
  "Implement governed requests to transition between canonical D1N design-progression states. Record the source state, requested destination, prerequisite-assessment references, evidence-gap state, requesting authority, provenance, fingerprint, and request lifecycle. Do not approve the transition, execute a human gate, change the progression state, validate engineering, approve engineering, certify, or select an alternative." as const;
export const D1N_R3_READY_FOR_NEXT_PHASE = true as const;
export const D1N_R3_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const ASSESSMENT_AUTHORITY = D1N_PREREQUISITE_AUTHORITY;
const FLOATING = new Set(["latest", "current", "newest", "head", "active", "latest orchestration", "current orchestration", "current progression", "latest context", "active project context"]);
const FOLLOW_UP = new Set(["MISSING", "STALE", "EXTERNAL_AUTHORITY_REQUIRED", "AVAILABLE_WITH_LIMITATIONS"]);

export type D1nR3Status = (typeof D1N_PREREQUISITE_ASSESSMENT_STATUSES)[number];
export type D1nR3Category = (typeof D1N_PREREQUISITE_INPUT_CATEGORIES)[number];
export type D1nR3Currentness = "CURRENT" | "STALE";

export type D1nR3Input = {
  assessmentId: string;
  gapId?: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  progressionId: string;
  progressionFingerprint: string;
  prerequisiteId: string;
  inputCategory: string;
  assessmentStatus?: string;
  evidenceRef?: string | null;
  externalAuthorityRef?: string | null;
  limitationRef?: string | null;
  citedCurrentness?: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  assertedGapFingerprint?: string;
  predecessorAssessmentId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  structuralIdentityId?: string;
  stageReady?: boolean;
  transitionRequest?: boolean;
  transitionApproved?: boolean;
  humanGate?: boolean;
  alternativeSelection?: boolean;
  engineeringValidated?: boolean;
  engineeringApproved?: boolean;
  certified?: boolean;
  solverExecution?: boolean;
  conformance?: boolean;
  cadBimInterpretation?: boolean;
  nextAction?: boolean;
  currentnessReassessment?: boolean;
  readinessScore?: number;
  inventEvidence?: boolean;
  externalAuthoritySatisfied?: boolean;
  overrideStale?: boolean;
  fullyAvailable?: boolean;
};

export type D1nR3Assessment = {
  assessmentId: string;
  gapId: string | null;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  progressionId: string;
  progressionFingerprint: string;
  structuralIdentityId: string;
  prerequisiteId: string;
  inputCategory: D1nR3Category;
  assessmentStatus: D1nR3Status;
  evidenceRef: string | null;
  externalAuthorityRef: string | null;
  limitationRef: string | null;
  citedCurrentness: D1nR3Currentness;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: typeof ASSESSMENT_AUTHORITY;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorAssessmentId: string | null;
  engineeringValidated: false;
  engineeringApproved: false;
  engineeringIncorrect: false;
  stageReady: false;
  stageApproved: false;
  transitionAuthorized: false;
  fullyAvailable: false;
};

export type D1nR3Gap = {
  gapId: string;
  assessmentId: string;
  assessmentFingerprint: string;
  prerequisiteId: string;
  inputCategory: D1nR3Category;
  assessmentStatus: Exclude<D1nR3Status, "PRESENT">;
  orchestrationContextId: string;
  progressionId: string;
  evidenceRef: string | null;
  externalAuthorityRef: string | null;
  limitationRef: string | null;
  provenanceRef: string;
  authority: typeof ASSESSMENT_AUTHORITY;
  fingerprint: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  engineeringFailure: false;
  designRejected: false;
  transitionDenied: false;
  certificationFailure: false;
};

export type D1nR3History = {
  historyId: string;
  recordId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D1nR3Store = {
  now: () => string;
  assessments: D1nR3Assessment[];
  gaps: D1nR3Gap[];
  assessmentHistory: D1nR3History[];
  gapHistory: D1nR3History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function isCategory(value: string): value is D1nR3Category {
  return (D1N_PREREQUISITE_INPUT_CATEGORIES as readonly string[]).includes(value);
}

function isStatus(value: string): value is D1nR3Status {
  return (D1N_PREREQUISITE_ASSESSMENT_STATUSES as readonly string[]).includes(value);
}

function assertActor(actor: D1nR1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PREREQUISITE_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PREREQUISITE_AUTHORITY");
  if (actor.authority === "STAGE_APPROVAL_AUTHORITY") fail("PREREQUISITE_AUTHORITY_NOT_STAGE_APPROVAL");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("PREREQUISITE_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "ENGINEERING_VALIDATION_AUTHORITY") fail("PREREQUISITE_AUTHORITY_NOT_ENGINEERING_VALIDATION");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("PREREQUISITE_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== ASSESSMENT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertProhibited(input: D1nR3Input): void {
  if (input.inventEvidence === true) fail("EVIDENCE_INVENTION_NOT_IN_R3");
  if (input.overrideStale === true) fail("STALE_OVERRIDE_NOT_IN_R3");
  if (input.externalAuthoritySatisfied === true) fail("EXTERNAL_AUTHORITY_SATISFACTION_NOT_IN_R3");
  if (input.stageReady === true || input.readinessScore != null) fail("STAGE_READINESS_NOT_IN_R3");
  if (input.transitionRequest === true) fail("STAGE_TRANSITION_NOT_IN_R3");
  if (input.transitionApproved === true) fail("STAGE_APPROVAL_NOT_IN_R3");
  if (input.humanGate === true) fail("HUMAN_GATE_NOT_IN_R3");
  if (input.alternativeSelection === true) fail("ALTERNATIVE_SELECTION_NOT_IN_R3");
  if (input.engineeringValidated === true) fail("ENGINEERING_VALIDATION_NOT_IN_R3");
  if (input.engineeringApproved === true) fail("ENGINEERING_APPROVAL_NOT_IN_R3");
  if (input.certified === true) fail("CERTIFICATION_NOT_IN_R3");
  if (input.solverExecution === true) fail("SOLVER_NOT_IN_R3");
  if (input.conformance === true) fail("CONFORMANCE_NOT_IN_R3");
  if (input.cadBimInterpretation === true) fail("CAD_BIM_INTERPRETATION_NOT_IN_R3");
  if (input.nextAction === true) fail("NEXT_ACTION_NOT_IN_R3");
  if (input.currentnessReassessment === true) fail("CURRENTNESS_REASSESSMENT_NOT_IN_R3");
  if (input.fullyAvailable === true) fail("LIMITATION_NOT_FULL_AVAILABILITY");
}

function assessmentFingerprint(body: {
  assessmentId: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  progressionId: string;
  progressionFingerprint: string;
  structuralIdentityId: string;
  prerequisiteId: string;
  inputCategory: string;
  assessmentStatus: string;
  evidenceRef: string | null;
  externalAuthorityRef: string | null;
  limitationRef: string | null;
  citedCurrentness: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  authority: string;
  predecessorAssessmentId: string | null;
}): string {
  return fingerprintCanonical(body);
}

function gapFingerprint(body: {
  gapId: string;
  assessmentId: string;
  assessmentFingerprint: string;
  prerequisiteId: string;
  inputCategory: string;
  assessmentStatus: string;
  orchestrationContextId: string;
  progressionId: string;
  evidenceRef: string | null;
  externalAuthorityRef: string | null;
  limitationRef: string | null;
  provenanceRef: string;
  authority: string;
}): string {
  return fingerprintCanonical(body);
}

export function createD1nR3Store(now: () => string = () => "2026-10-22T00:00:00.000Z"): D1nR3Store {
  return { now, assessments: [], gaps: [], assessmentHistory: [], gapHistory: [] };
}

export function recordPrerequisiteAssessment(orchestration: D1nR1Store, progression: D1nR2Store, store: D1nR3Store, actor: D1nR1Actor, input: D1nR3Input): D1nR3Assessment {
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_PROJECT_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (!input.assessmentId.trim() || FLOATING.has(input.assessmentId.trim().toLowerCase())) fail("ASSESSMENT_IDENTITY_REQUIRED");
  if (!input.prerequisiteId.trim() || FLOATING.has(input.prerequisiteId.trim().toLowerCase())) fail("PREREQUISITE_IDENTITY_REQUIRED");
  if (!input.orchestrationContextId.trim() || FLOATING.has(input.orchestrationContextId.trim().toLowerCase())) fail("FLOATING_R1_CONTEXT_REJECTED");
  if (!input.progressionId.trim() || FLOATING.has(input.progressionId.trim().toLowerCase())) fail("FLOATING_R2_PROGRESSION_REJECTED");
  if (!input.orchestrationContextFingerprint.trim() || !input.progressionFingerprint.trim()) fail("EXACT_CONTEXT_FINGERPRINT_REQUIRED");
  const blockedFields = [input.assessmentId, input.prerequisiteId, input.orchestrationContextId, input.progressionId, input.evidenceRef ?? "", input.provenanceRef, input.assessmentStatus ?? "", input.externalAuthorityRef ?? "", input.limitationRef ?? "", input.gapId ?? ""];
  if (blockedFields.some((value) => blockedParty(value))) fail("AI_NOT_PREREQUISITE_AUTHORITY");
  if (!input.provenanceRef.trim()) fail("MISSING_PROVENANCE");
  if (input.citedCurrentness !== "CURRENT" && input.citedCurrentness !== "STALE") fail("CURRENTNESS_CITATION_REQUIRED");
  if (!isCategory(input.inputCategory)) fail(/^[A-Z0-9_]+$/.test(input.inputCategory) ? "INPUT_CATEGORY_INVALID" : "FREEFORM_INPUT_CATEGORY_REJECTED");
  if (input.assessmentStatus == null || !input.assessmentStatus.trim()) fail("EXPLICIT_PREREQUISITE_STATUS_REQUIRED");
  const statusToken = input.assessmentStatus.trim();
  if (!isStatus(statusToken)) fail(/^[A-Z0-9_]+$/.test(statusToken) ? "PREREQUISITE_STATUS_INVALID" : "FREEFORM_PREREQUISITE_STATUS_REJECTED");
  const evidenceRef = input.evidenceRef?.trim() ? input.evidenceRef.trim() : null;
  const externalAuthorityRef = input.externalAuthorityRef?.trim() ? input.externalAuthorityRef.trim() : null;
  const limitationRef = input.limitationRef?.trim() ? input.limitationRef.trim() : null;
  if (statusToken === "PRESENT") {
    if (!evidenceRef) fail("PRESENT_REQUIRES_EVIDENCE");
    if (input.citedCurrentness !== "CURRENT") fail("STALE_NOT_PRESENT");
  }
  if (statusToken === "MISSING") {
    if (evidenceRef) fail("MISSING_EVIDENCE_NOT_INVENTED");
    if (input.citedCurrentness !== "CURRENT") fail("STATUS_CURRENTNESS_CONFLICT");
  }
  if (statusToken === "STALE") {
    if (input.citedCurrentness !== "STALE") fail("STALENESS_NOT_CITED");
    if (!evidenceRef) fail("STALE_REQUIRES_EVIDENCE");
  }
  if (statusToken === "EXTERNAL_AUTHORITY_REQUIRED") {
    if (!externalAuthorityRef) fail("EXTERNAL_AUTHORITY_REFERENCE_REQUIRED");
    if (input.citedCurrentness !== "CURRENT") fail("STATUS_CURRENTNESS_CONFLICT");
  }
  if (statusToken === "AVAILABLE_WITH_LIMITATIONS") {
    if (!limitationRef) fail("LIMITATION_REFERENCE_REQUIRED");
    if (input.citedCurrentness !== "CURRENT") fail("STATUS_CURRENTNESS_CONFLICT");
  }
  const context = orchestration.records.find((row) => row.contextId === input.orchestrationContextId);
  if (!context) fail("ORCHESTRATION_CONTEXT_REQUIRED");
  if (context.fingerprint !== input.orchestrationContextFingerprint) fail("ORCHESTRATION_CONTEXT_FINGERPRINT_MISMATCH");
  if (context.recordStatus !== "CURRENT") fail("ORCHESTRATION_CONTEXT_NOT_CURRENT");
  const stage = progression.records.find((row) => row.progressionId === input.progressionId);
  if (!stage) fail("PROGRESSION_CONTEXT_REQUIRED");
  if (stage.fingerprint !== input.progressionFingerprint) fail("PROGRESSION_FINGERPRINT_MISMATCH");
  if (stage.recordStatus !== "CURRENT") fail("PROGRESSION_CONTEXT_NOT_CURRENT");
  if (stage.orchestrationContextId !== context.contextId || stage.orchestrationContextFingerprint !== context.fingerprint) fail("PROGRESSION_CONTEXT_MISMATCH");
  if (context.tenantId !== actor.tenantId || stage.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId || stage.workspaceId !== actor.workspaceId || stage.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (input.structuralIdentityId != null && input.structuralIdentityId !== context.structuralIdentityId) fail("STRUCTURAL_IDENTITY_MISMATCH");
  const predecessor = input.predecessorAssessmentId ? store.assessments.find((row) => row.assessmentId === input.predecessorAssessmentId) : null;
  if (input.predecessorAssessmentId) {
    if (!predecessor) fail("ASSESSMENT_NOT_FOUND");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    if (predecessor.orchestrationContextId !== context.contextId || predecessor.progressionId !== stage.progressionId) fail("ASSESSMENT_CONTEXT_MISMATCH");
    if (predecessor.inputCategory !== input.inputCategory) fail("PREREQUISITE_IDENTITY_MISMATCH");
    if (predecessor.assessmentStatus === statusToken && predecessor.evidenceRef === evidenceRef && predecessor.citedCurrentness === input.citedCurrentness && predecessor.provenanceRef === input.provenanceRef) fail("ASSESSMENT_UNCHANGED");
  }
  const fingerprint = assessmentFingerprint({
    assessmentId: input.assessmentId,
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    progressionId: stage.progressionId,
    progressionFingerprint: stage.fingerprint,
    structuralIdentityId: context.structuralIdentityId,
    prerequisiteId: input.prerequisiteId,
    inputCategory: input.inputCategory,
    assessmentStatus: statusToken,
    evidenceRef,
    externalAuthorityRef,
    limitationRef,
    citedCurrentness: input.citedCurrentness,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    provenanceRef: input.provenanceRef,
    authority: ASSESSMENT_AUTHORITY,
    predecessorAssessmentId: predecessor?.assessmentId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.assessments.find((row) => row.assessmentId === input.assessmentId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("ASSESSMENT_ALREADY_RECORDED");
  }
  const duplicate = store.assessments.find((row) => row.recordStatus === "CURRENT" && row.assessmentId !== predecessor?.assessmentId && row.orchestrationContextId === context.contextId && row.progressionId === stage.progressionId && row.inputCategory === input.inputCategory);
  if (duplicate) fail("DUPLICATE_ASSESSMENT_REJECTED");
  const needsGap = FOLLOW_UP.has(statusToken);
  if (needsGap && (!input.gapId || !input.gapId.trim() || FLOATING.has(input.gapId.trim().toLowerCase()))) fail("GAP_IDENTITY_REQUIRED");
  if (!needsGap && input.gapId) fail("GAP_NOT_APPLICABLE");
  const assessment: D1nR3Assessment = Object.freeze({
    assessmentId: input.assessmentId,
    gapId: needsGap ? input.gapId!.trim() : null,
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    progressionId: stage.progressionId,
    progressionFingerprint: stage.fingerprint,
    structuralIdentityId: context.structuralIdentityId,
    prerequisiteId: input.prerequisiteId,
    inputCategory: input.inputCategory,
    assessmentStatus: statusToken,
    evidenceRef,
    externalAuthorityRef,
    limitationRef,
    citedCurrentness: input.citedCurrentness,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    authority: ASSESSMENT_AUTHORITY,
    provenanceRef: input.provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorAssessmentId: predecessor?.assessmentId ?? null,
    engineeringValidated: false,
    engineeringApproved: false,
    engineeringIncorrect: false,
    stageReady: false,
    stageApproved: false,
    transitionAuthorized: false,
    fullyAvailable: false,
  });
  if (predecessor) {
    const index = store.assessments.findIndex((row) => row.assessmentId === predecessor.assessmentId);
    store.assessments[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" });
    store.assessmentHistory.push({ historyId: `hist-${store.assessmentHistory.length + 1}`, recordId: predecessor.assessmentId, action: "SUPERSEDED", fingerprint: predecessor.fingerprint, recordedAt: store.now() });
    if (predecessor.gapId) {
      const gapIndex = store.gaps.findIndex((row) => row.gapId === predecessor.gapId && row.recordStatus === "CURRENT");
      if (gapIndex >= 0) {
        const priorGap = store.gaps[gapIndex];
        store.gaps[gapIndex] = Object.freeze({ ...priorGap, recordStatus: "SUPERSEDED" });
        store.gapHistory.push({ historyId: `gap-hist-${store.gapHistory.length + 1}`, recordId: priorGap.gapId, action: "SUPERSEDED", fingerprint: priorGap.fingerprint, recordedAt: store.now() });
      }
    }
  }
  if (needsGap) {
    const gapId = input.gapId!.trim();
    const gapPrint = gapFingerprint({
      gapId,
      assessmentId: assessment.assessmentId,
      assessmentFingerprint: fingerprint,
      prerequisiteId: input.prerequisiteId,
      inputCategory: input.inputCategory,
      assessmentStatus: statusToken,
      orchestrationContextId: context.contextId,
      progressionId: stage.progressionId,
      evidenceRef,
      externalAuthorityRef,
      limitationRef,
      provenanceRef: input.provenanceRef,
      authority: ASSESSMENT_AUTHORITY,
    });
    if (input.assertedGapFingerprint != null && input.assertedGapFingerprint !== gapPrint) fail("GAP_FINGERPRINT_MISMATCH");
    if (store.gaps.some((row) => row.gapId === gapId)) fail("GAP_ALREADY_RECORDED");
    const gap: D1nR3Gap = Object.freeze({
      gapId,
      assessmentId: assessment.assessmentId,
      assessmentFingerprint: fingerprint,
      prerequisiteId: input.prerequisiteId,
      inputCategory: input.inputCategory,
      assessmentStatus: statusToken as D1nR3Gap["assessmentStatus"],
      orchestrationContextId: context.contextId,
      progressionId: stage.progressionId,
      evidenceRef,
      externalAuthorityRef,
      limitationRef,
      provenanceRef: input.provenanceRef,
      authority: ASSESSMENT_AUTHORITY,
      fingerprint: gapPrint,
      recordedAt: store.now(),
      recordStatus: "CURRENT",
      engineeringFailure: false,
      designRejected: false,
      transitionDenied: false,
      certificationFailure: false,
    });
    store.gaps.push(gap);
    store.gapHistory.push({ historyId: `gap-hist-${store.gapHistory.length + 1}`, recordId: gap.gapId, action: "CREATED", fingerprint: gap.fingerprint, recordedAt: store.now() });
  }
  store.assessments.push(assessment);
  store.assessmentHistory.push({ historyId: `hist-${store.assessmentHistory.length + 1}`, recordId: assessment.assessmentId, action: "CREATED", fingerprint, recordedAt: store.now() });
  return assessment;
}

export function reconstructPrerequisiteAssessment(store: D1nR3Store, assessmentId: string): D1nR3Assessment {
  const record = store.assessments.find((row) => row.assessmentId === assessmentId);
  if (!record) fail("ASSESSMENT_NOT_FOUND");
  return record;
}

export function reconstructEvidenceGap(store: D1nR3Store, gapId: string): D1nR3Gap {
  const record = store.gaps.find((row) => row.gapId === gapId);
  if (!record) fail("GAP_NOT_FOUND");
  return record;
}

export function mutatePrerequisiteAssessment(): never {
  return fail("ASSESSMENT_MUTATION_REJECTED");
}
export function declareStageReady(): never {
  return fail("STAGE_READINESS_NOT_IN_R3");
}
export function requestStageTransition(): never {
  return fail("STAGE_TRANSITION_NOT_IN_R3");
}
export function approveStageTransition(): never {
  return fail("STAGE_APPROVAL_NOT_IN_R3");
}
export function inventRequiredEvidence(): never {
  return fail("EVIDENCE_INVENTION_NOT_IN_R3");
}
export function reassessCurrentness(): never {
  return fail("CURRENTNESS_REASSESSMENT_NOT_IN_R3");
}
