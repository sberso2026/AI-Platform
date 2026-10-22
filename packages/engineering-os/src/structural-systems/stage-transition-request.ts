/**
 * EOS-D1N-R4 stage-transition request governance.
 * Records an explicit request to consider a canonical forward transition.
 * It does not grant the transition or change the design-progression record.
 */
import { D1N_0_ALLOWED_FORWARD_TRANSITIONS, D1N_0_DESIGN_MATURITY_STATES, D1N_0_OUT_OF_SCOPE_LIFECYCLE_STAGES } from "@rtb/types";
import { DEFAULT_ENGINEERING_LIFECYCLE_PROFILE, transitionAllowed } from "../lifecycle-intelligence/profile";
import type { LifecycleStage } from "../lifecycle-intelligence/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
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
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_PREREQUISITE_AUTHORITY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_R3_C10_DEBT,
  D1N_R3_CLOSEOUT_PATH,
  D1N_R3_D1F_DEBT,
  D1N_R3_D1G_BLOCKER_PRESERVED,
  D1N_R3_D1G_DEBT,
  D1N_R3_D1H_DEBT,
  D1N_R3_D1I_DEBT,
  D1N_R3_D1J_DEBT,
  D1N_R3_D1K_DEBT,
  D1N_R3_D1L_DEBT,
  D1N_R3_DEBT_PRESERVED,
  D1N_R3_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R3_PARENT_ARCHITECTURE_PATH,
  D1N_R3_POST_D1J_DEBT_LEDGER,
  D1N_R3_R1_CLOSEOUT_PATH,
  D1N_R3_R2_CLOSEOUT_PATH,
  D1N_R3_STRUCTURAL_PACK_COMPLETE,
  D1N_R4_CANONICAL_SCOPE,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  type D1nR3Store,
} from "./prerequisite-assessment";
import type { D1nR1Actor, D1nR1Store } from "./orchestration-context";
import type { D1nR2Store } from "./design-progression-context";

export const D1N_R4_STATUS = "STAGE_TRANSITION_REQUEST_IMPLEMENTED" as const;
export const D1N_R4_MATURITY_STATE = "STRUCTURAL_STAGE_TRANSITION_REQUEST_GOVERNANCE_IMPLEMENTED" as const;
export const D1N_R4_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1N_R4_STAGE_TRANSITION_REQUEST_GOVERNANCE_CLOSEOUT.md" as const;
export const D1N_R4_PARENT_ARCHITECTURE_PATH = D1N_R3_PARENT_ARCHITECTURE_PATH;
export const D1N_R4_R1_CLOSEOUT_PATH = D1N_R3_R1_CLOSEOUT_PATH;
export const D1N_R4_R2_CLOSEOUT_PATH = D1N_R3_R2_CLOSEOUT_PATH;
export const D1N_R4_R3_CLOSEOUT_PATH = D1N_R3_CLOSEOUT_PATH;
export const D1N_R4_SCOPE = D1N_R4_CANONICAL_SCOPE;
export { D1N_R4_CANONICAL_SCOPE };
export { D1N_ARCHITECTURE_DEFINED, D1N_ARCHITECTURE_READY };

export const D1N_RUNTIME_STARTED = true as const;
export const D1N_RUNTIME_COUNT = 4 as const;
export { D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY, D1N_DESIGN_PROGRESSION_RUNTIME_READY, D1N_PREREQUISITE_RUNTIME_READY };
export const D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY = true as const;
export const D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY = false as const;
export const D1N_HUMAN_GATE_RUNTIME_READY = false as const;
export const D1N_ALTERNATIVE_BRANCH_RUNTIME_READY = false as const;
export const D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY = false as const;
export const D1N_HANDOFF_INTEGRATION_RUNTIME_READY = false as const;

export const D1N_R1_ORCHESTRATION_CONTEXT_REUSED = true as const;
export const D1N_R2_DESIGN_PROGRESSION_CONTEXT_REUSED = true as const;
export const D1N_R3_PREREQUISITE_ASSESSMENTS_REUSED = true as const;
export const D1N_R3_EVIDENCE_GAPS_REUSED = true as const;
export const EXACT_R1_CONTEXT_REFERENCE_REQUIRED = true as const;
export const EXACT_R2_SOURCE_PROGRESSION_REFERENCE_REQUIRED = true as const;
export const EXACT_R3_PREREQUISITE_REFERENCE_REQUIRED = true as const;
export const FLOATING_R1_CONTEXT_REFERENCE_ALLOWED = false as const;
export const FLOATING_R2_PROGRESSION_REFERENCE_ALLOWED = false as const;
export const FLOATING_R3_PREREQUISITE_REFERENCE_ALLOWED = false as const;
export const D1N_STAGE_TRANSITION_REQUEST_RUNTIME_IMPLEMENTED = true as const;
export const D1N_STAGE_TRANSITION_REQUEST_RUNTIME_COUNT = 1 as const;
export const D1N_TRANSITION_SOURCE_STATES = D1N_0_DESIGN_MATURITY_STATES;
export const D1N_TRANSITION_DESTINATION_STATES = D1N_0_DESIGN_MATURITY_STATES;
export const D1N_TRANSITION_FORWARD_PAIRS = D1N_0_ALLOWED_FORWARD_TRANSITIONS;
export const D1N_TRANSITION_SOURCE_STATE_ALLOWLIST_ENFORCED = true as const;
export const D1N_TRANSITION_DESTINATION_STATE_ALLOWLIST_ENFORCED = true as const;
export const FREEFORM_TRANSITION_DESTINATION_ALLOWED = false as const;
export const UNKNOWN_TRANSITION_DESTINATION_AUTO_ACCEPTED = false as const;
export const TRANSITION_SOURCE_STATE_DERIVED_FROM_EXACT_R2_RECORD = true as const;
export const REQUESTER_CAN_OVERRIDE_SOURCE_STATE = false as const;
export const AI_CAN_INVENT_SOURCE_STATE = false as const;
export const STAGE_TRANSITION_REQUEST_EQUALS_DESIGN_PROGRESSION_CHANGE = false as const;
export const SILENT_R2_PROGRESSION_MUTATION_ALLOWED = false as const;
export const AUTOMATIC_DESIGN_PROGRESSION_RUNTIME_COUNT = 0 as const;
export const STAGE_TRANSITION_REQUEST_EQUALS_STAGE_APPROVAL = false as const;
export const STAGE_TRANSITION_REQUEST_EQUALS_STAGE_TRANSITION_AUTHORIZED = false as const;
export const STAGE_TRANSITION_REQUEST_EQUALS_ENGINEERING_APPROVAL = false as const;
export const STAGE_TRANSITION_REQUEST_EQUALS_ENGINEERING_VALIDATION = false as const;
export const STAGE_TRANSITION_REQUEST_EQUALS_CERTIFICATION = false as const;
export const R4_REASSESSES_PREREQUISITES_INDEPENDENTLY = false as const;
export const R3_PREREQUISITE_STATUS_REUSED = true as const;
export const R3_EVIDENCE_GAP_STATE_REUSED = true as const;
export const ALL_REFERENCED_PREREQUISITES_PRESENT_EQUALS_TRANSITION_APPROVED = false as const;
export const NO_EVIDENCE_GAPS_EQUALS_TRANSITION_APPROVED = false as const;
export const NO_EVIDENCE_GAPS_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1N_TRANSITION_REQUEST_LIFECYCLE_STATES = ["OPEN", "SUPERSEDED", "WITHDRAWN"] as const;
export const D1N_TRANSITION_REQUEST_LIFECYCLE_IMPLEMENTED = true as const;
export const SILENT_TRANSITION_REQUEST_MUTATION_ALLOWED = false as const;
export const D1N_TRANSITION_REQUEST_HISTORY_PRESERVED = true as const;
export const AUTOMATIC_STAGE_TRANSITION_APPROVAL_RUNTIME_COUNT = 0 as const;
export const AUTOMATIC_TRANSITION_REQUEST_ACCEPTANCE_RUNTIME_COUNT = 0 as const;
export const D1N_AUTOMATIC_NEXT_STAGE_SELECTION_RUNTIME_COUNT = 0 as const;
export const D1N_TRANSITION_RELATIONSHIP_RULES_REUSED = true as const;

export const D1N_TRANSITION_REQUEST_AUTHORITY = D1N_PREREQUISITE_AUTHORITY;
export const D1N_TRANSITION_REQUEST_AUTHORITY_PRESERVED = true as const;
export const D1N_TRANSITION_REQUEST_AUTHORITY_EQUALS_STAGE_APPROVAL_AUTHORITY = false as const;
export const D1N_TRANSITION_REQUEST_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY = false as const;
export const D1N_TRANSITION_REQUEST_AUTHORITY_EQUALS_ENGINEERING_VALIDATION_AUTHORITY = false as const;
export const D1N_TRANSITION_REQUEST_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const AI_CAN_INVENT_TRANSITION_REQUEST_AUTHORITY = false as const;
export const AI_CAN_AUTHORITATIVELY_SELECT_NEXT_STAGE = false as const;
export const AI_CAN_APPROVE_STAGE_TRANSITION = false as const;
export const AI_CAN_CHANGE_DESIGN_PROGRESSION_STATE = false as const;
export { AI_EQUALS_D1N_ENGINEERING_AUTHORITY, ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY };
export const ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE = false as const;
export const ADMIN_CAN_BYPASS_TRANSITION_REQUEST_GOVERNANCE = false as const;
export const TENANT_WORKSPACE_PROJECT_TRANSITION_REQUEST_SCOPE_ENFORCED = true as const;
export const D1N_TRANSITION_REQUEST_PROVENANCE_REQUIRED = true as const;
export const D1N_TRANSITION_REQUEST_PROVENANCE_PRESERVED = true as const;
export { CANONICAL_FINGERPRINT_REUSED, SECOND_FINGERPRINT_ALGORITHM_CREATED, CANONICAL_CURRENTNESS_REUSED };
export const D1N_TRANSITION_REQUEST_FINGERPRINT_IMPLEMENTED = true as const;
export const FINGERPRINT_VERIFIED_EQUALS_TRANSITION_APPROVED = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_CERTIFIED = false as const;
export const D1N_DUPLICATE_TRANSITION_REQUEST_GOVERNED = true as const;
export const D1N_TRANSITION_REQUEST_REPLAY_GOVERNED = true as const;
export const D1N_TRANSITION_REQUEST_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1N_CURRENTNESS_REASSESSMENT_RUNTIME_COUNT = 0 as const;
export const TRANSITION_REQUEST_AUTO_REPOINTED_TO_NEWER_R2_CONTEXT = false as const;
export const TRANSITION_REQUEST_AUTO_REPOINTED_TO_NEWER_R3_ASSESSMENT = false as const;
export const TRANSITION_REQUEST_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE = false as const;

export const D1N_STAGE_TRANSITION_RUNTIME_COUNT = 0 as const;
export const D1N_HUMAN_DECISION_GATE_RUNTIME_COUNT = 0 as const;
export const D1N_REVIEW_GATE_RUNTIME_COUNT = 0 as const;
export const D1N_ALTERNATIVE_BRANCH_RUNTIME_COUNT = 0 as const;
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
export const D1N_R4_C10_DEBT = D1N_R3_C10_DEBT;
export const D1N_R4_D1F_DEBT = D1N_R3_D1F_DEBT;
export const D1N_R4_D1G_DEBT = D1N_R3_D1G_DEBT;
export const D1N_R4_D1H_DEBT = D1N_R3_D1H_DEBT;
export const D1N_R4_D1I_DEBT = D1N_R3_D1I_DEBT;
export const D1N_R4_D1J_DEBT = D1N_R3_D1J_DEBT;
export const D1N_R4_D1K_DEBT = D1N_R3_D1K_DEBT;
export const D1N_R4_D1L_DEBT = D1N_R3_D1L_DEBT;
export const D1N_R4_DEBT_PRESERVED = D1N_R3_DEBT_PRESERVED;
export const D1N_R4_POST_D1J_DEBT_LEDGER = D1N_R3_POST_D1J_DEBT_LEDGER;
export const D1N_R4_D1G_BLOCKER_PRESERVED = D1N_R3_D1G_BLOCKER_PRESERVED;
export const D1N_R4_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = D1N_R3_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1N_R4_STRUCTURAL_PACK_COMPLETE = D1N_R3_STRUCTURAL_PACK_COMPLETE;
export const D1N_R4_DATABASE_SCHEMA_CHANGED = false as const;
export const D1N_R4_NEW_DEPENDENCY_ADDED = false as const;
export const D1N_R5_CANONICAL_PHASE = "EOS-D1N-R5-HUMAN-DECISION-AND-REVIEW-GATE-INTEGRATION" as const;
export const D1N_R5_PHASE_TYPE = "HUMAN_DECISION_AND_REVIEW_GATE_INTEGRATION" as const;
export const D1N_R5_CANONICAL_SCOPE =
  "Integrate governed human decision and review handling for an exact D1N transition request. Record the request reference, decision authority, human decision or review outcome, rationale, provenance, and immutable history. Do not validate engineering, certify, execute a solver, or interpret CAD or BIM." as const;
export const D1N_R4_READY_FOR_NEXT_PHASE = true as const;
export const D1N_R4_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const REQUEST_AUTHORITY = D1N_TRANSITION_REQUEST_AUTHORITY;
const FLOATING = new Set(["latest", "current", "newest", "head", "active", "latest orchestration", "current orchestration", "current progression", "latest context", "latest assessment", "current assessment", "active project context"]);
const APPROVAL_LIFECYCLE = new Set(["APPROVED", "ACCEPTED", "REJECTED", "AUTHORIZED", "READY_FOR_FEED", "READY_FOR_DETAILED_DESIGN", "APPROVED_TO_ADVANCE"]);

export type D1nR4Lifecycle = (typeof D1N_TRANSITION_REQUEST_LIFECYCLE_STATES)[number];
export type D1nR4Stage = (typeof D1N_0_DESIGN_MATURITY_STATES)[number];

export type D1nR4PrerequisiteRef = {
  assessmentId: string;
  fingerprint: string;
  assessmentStatus?: string;
};

export type D1nR4GapRef = {
  gapId: string;
  fingerprint: string;
};

export type D1nR4Input = {
  requestId: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  progressionId: string;
  progressionFingerprint: string;
  sourceStage?: string;
  destinationStage?: string;
  prerequisiteReferences?: D1nR4PrerequisiteRef[];
  evidenceGapReferences?: D1nR4GapRef[];
  provenanceRef: string;
  assertedFingerprint?: string;
  predecessorRequestId?: string | null;
  lifecycleState?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  transitionApproved?: boolean;
  transitionAuthorized?: boolean;
  progressionChange?: boolean;
  humanGate?: boolean;
  alternativeSelection?: boolean;
  engineeringValidated?: boolean;
  engineeringApproved?: boolean;
  certified?: boolean;
  solverExecution?: boolean;
  conformance?: boolean;
  cadBimInterpretation?: boolean;
  overrideStale?: boolean;
  reassessPrerequisites?: boolean;
  selectNextStage?: boolean;
  autoApprove?: boolean;
};

export type D1nR4CitedAssessment = {
  assessmentId: string;
  fingerprint: string;
  assessmentStatus: string;
  inputCategory: string;
  citedCurrentness: "CURRENT" | "STALE";
};

export type D1nR4CitedGap = {
  gapId: string;
  fingerprint: string;
  assessmentId: string;
  assessmentStatus: string;
};

export type D1nR4Request = {
  requestId: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  progressionId: string;
  progressionFingerprint: string;
  structuralIdentityId: string;
  sourceStage: D1nR4Stage;
  destinationStage: D1nR4Stage;
  prerequisiteReferences: readonly D1nR4CitedAssessment[];
  evidenceGapReferences: readonly D1nR4CitedGap[];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: typeof REQUEST_AUTHORITY;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  lifecycleState: D1nR4Lifecycle;
  predecessorRequestId: string | null;
  transitionApproved: false;
  transitionAuthorized: false;
  transitionApprovable: false;
  progressionChanged: false;
  engineeringValidated: false;
  engineeringApproved: false;
  certified: false;
};

export type D1nR4History = {
  historyId: string;
  requestId: string;
  action: "CREATED" | "SUPERSEDED" | "WITHDRAWN";
  fingerprint: string;
  recordedAt: string;
};

export type D1nR4Store = {
  now: () => string;
  requests: D1nR4Request[];
  history: D1nR4History[];
};

export type D1nR4Withdrawal = {
  requestId: string;
  provenanceRef: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function isDesignStage(value: string): value is D1nR4Stage {
  return (D1N_0_DESIGN_MATURITY_STATES as readonly string[]).includes(value);
}

function assertActor(actor: D1nR1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_TRANSITION_REQUEST_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_TRANSITION_REQUEST_AUTHORITY");
  if (actor.authority === "STAGE_APPROVAL_AUTHORITY") fail("TRANSITION_REQUEST_AUTHORITY_NOT_STAGE_APPROVAL");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("TRANSITION_REQUEST_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "ENGINEERING_VALIDATION_AUTHORITY") fail("TRANSITION_REQUEST_AUTHORITY_NOT_ENGINEERING_VALIDATION");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("TRANSITION_REQUEST_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== REQUEST_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D1nR1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_PROJECT_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: D1nR4Input): void {
  if (input.transitionApproved === true || input.autoApprove === true) fail("STAGE_APPROVAL_NOT_IN_R4");
  if (input.transitionAuthorized === true) fail("STAGE_TRANSITION_EXECUTION_NOT_IN_R4");
  if (input.progressionChange === true) fail("PROGRESSION_MUTATION_NOT_IN_R4");
  if (input.humanGate === true) fail("HUMAN_GATE_NOT_IN_R4");
  if (input.alternativeSelection === true) fail("ALTERNATIVE_SELECTION_NOT_IN_R4");
  if (input.engineeringValidated === true) fail("ENGINEERING_VALIDATION_NOT_IN_R4");
  if (input.engineeringApproved === true) fail("ENGINEERING_APPROVAL_NOT_IN_R4");
  if (input.certified === true) fail("CERTIFICATION_NOT_IN_R4");
  if (input.solverExecution === true) fail("SOLVER_NOT_IN_R4");
  if (input.conformance === true) fail("CONFORMANCE_NOT_IN_R4");
  if (input.cadBimInterpretation === true) fail("CAD_BIM_INTERPRETATION_NOT_IN_R4");
  if (input.overrideStale === true) fail("STALE_OVERRIDE_NOT_IN_R4");
  if (input.reassessPrerequisites === true) fail("PREREQUISITE_REASSESSMENT_NOT_IN_R4");
  if (input.selectNextStage === true) fail("NEXT_STAGE_SELECTION_NOT_IN_R4");
  if (input.lifecycleState != null && input.lifecycleState !== "OPEN") fail(APPROVAL_LIFECYCLE.has(input.lifecycleState) ? "APPROVAL_LIFECYCLE_NOT_IN_R4" : "REQUEST_LIFECYCLE_ASSIGNMENT_REJECTED");
}

function requestFingerprint(body: {
  requestId: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  progressionId: string;
  progressionFingerprint: string;
  structuralIdentityId: string;
  sourceStage: string;
  destinationStage: string;
  prerequisiteReferences: readonly D1nR4CitedAssessment[];
  evidenceGapReferences: readonly D1nR4CitedGap[];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  authority: string;
  predecessorRequestId: string | null;
}): string {
  return fingerprintCanonical(body);
}

export function createD1nR4Store(now: () => string = () => "2026-10-22T00:00:00.000Z"): D1nR4Store {
  return { now, requests: [], history: [] };
}

export function recordTransitionRequest(orchestration: D1nR1Store, progression: D1nR2Store, assessments: D1nR3Store, store: D1nR4Store, actor: D1nR1Actor, input: D1nR4Input): D1nR4Request {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  if (!input.requestId.trim() || FLOATING.has(input.requestId.trim().toLowerCase())) fail("REQUEST_IDENTITY_REQUIRED");
  if (!input.orchestrationContextId.trim() || FLOATING.has(input.orchestrationContextId.trim().toLowerCase())) fail("FLOATING_R1_CONTEXT_REJECTED");
  if (!input.progressionId.trim() || FLOATING.has(input.progressionId.trim().toLowerCase())) fail("FLOATING_R2_PROGRESSION_REJECTED");
  if (!input.orchestrationContextFingerprint.trim() || !input.progressionFingerprint.trim()) fail("EXACT_CONTEXT_FINGERPRINT_REQUIRED");
  if (!input.provenanceRef.trim()) fail("MISSING_PROVENANCE");
  if (input.selectNextStage === true) fail("NEXT_STAGE_SELECTION_NOT_IN_R4");
  if (input.destinationStage == null || !input.destinationStage.trim()) fail("EXPLICIT_DESTINATION_REQUIRED");
  const destinationToken = input.destinationStage.trim();
  if (!/^[A-Z0-9_]+$/.test(destinationToken)) fail("FREEFORM_TRANSITION_DESTINATION_REJECTED");
  if ((D1N_0_OUT_OF_SCOPE_LIFECYCLE_STAGES as readonly string[]).includes(destinationToken)) fail("DESTINATION_OUT_OF_D1N_SCOPE");
  if (!isDesignStage(destinationToken)) fail("DESTINATION_STATE_INVALID");
  const blockedFields = [input.requestId, input.orchestrationContextId, input.progressionId, input.sourceStage ?? "", destinationToken, input.provenanceRef, ...(input.prerequisiteReferences ?? []).map((row) => row.assessmentId), ...(input.evidenceGapReferences ?? []).map((row) => row.gapId)];
  if (blockedFields.some((value) => blockedParty(value))) fail("AI_NOT_TRANSITION_REQUEST_AUTHORITY");
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
  if (input.sourceStage != null && input.sourceStage.trim() !== stage.designProgressionState) fail("SOURCE_STATE_OVERRIDE_REJECTED");
  const sourceStage = stage.designProgressionState;
  const pair = `${sourceStage}_TO_${destinationToken}`;
  if (!(D1N_TRANSITION_FORWARD_PAIRS as readonly string[]).includes(pair)) fail("TRANSITION_RELATIONSHIP_NOT_ALLOWED");
  if (!transitionAllowed(DEFAULT_ENGINEERING_LIFECYCLE_PROFILE, sourceStage as LifecycleStage, destinationToken as LifecycleStage)) fail("LIFECYCLE_PROFILE_TRANSITION_REJECTED");
  const cited = input.prerequisiteReferences ?? [];
  if (cited.length === 0) fail("PREREQUISITE_REFERENCE_REQUIRED");
  const seenAssessments = new Set<string>();
  const prerequisiteReferences: D1nR4CitedAssessment[] = cited.map((ref) => {
    if (!ref.assessmentId.trim() || FLOATING.has(ref.assessmentId.trim().toLowerCase())) fail("FLOATING_R3_PREREQUISITE_REJECTED");
    if (seenAssessments.has(ref.assessmentId)) fail("DUPLICATE_PREREQUISITE_REFERENCE");
    seenAssessments.add(ref.assessmentId);
    const assessment = assessments.assessments.find((row) => row.assessmentId === ref.assessmentId);
    if (!assessment) fail("PREREQUISITE_ASSESSMENT_REQUIRED");
    if (assessment.fingerprint !== ref.fingerprint) fail("PREREQUISITE_FINGERPRINT_MISMATCH");
    if (ref.assessmentStatus != null && ref.assessmentStatus !== assessment.assessmentStatus) fail("PREREQUISITE_STATUS_MISMATCH");
    if (assessment.orchestrationContextId !== context.contextId || assessment.orchestrationContextFingerprint !== context.fingerprint) fail("PREREQUISITE_CONTEXT_MISMATCH");
    if (assessment.progressionId !== stage.progressionId || assessment.progressionFingerprint !== stage.fingerprint) fail("PREREQUISITE_PROGRESSION_MISMATCH");
    if (assessment.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    if (assessment.workspaceId !== actor.workspaceId || assessment.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
    if (assessment.assessmentStatus === "STALE" || assessment.citedCurrentness === "STALE") fail("STALE_INPUT_NOT_ALLOWED_FOR_CURRENT_TRANSITION");
    return {
      assessmentId: assessment.assessmentId,
      fingerprint: assessment.fingerprint,
      assessmentStatus: assessment.assessmentStatus,
      inputCategory: assessment.inputCategory,
      citedCurrentness: assessment.citedCurrentness,
    };
  }).sort((left, right) => left.assessmentId.localeCompare(right.assessmentId));
  const expectedGaps = prerequisiteReferences.flatMap((ref) => {
    const assessment = assessments.assessments.find((row) => row.assessmentId === ref.assessmentId);
    return assessment?.gapId ? [assessment] : [];
  });
  const suppliedGaps = input.evidenceGapReferences ?? [];
  if (suppliedGaps.length !== expectedGaps.length) fail(expectedGaps.length === 0 ? "GAP_NOT_APPLICABLE" : "EVIDENCE_GAP_REFERENCE_REQUIRED");
  const evidenceGapReferences: D1nR4CitedGap[] = expectedGaps.map((assessment) => {
    const supplied = suppliedGaps.find((row) => row.gapId === assessment.gapId);
    if (!supplied) fail("EVIDENCE_GAP_REFERENCE_REQUIRED");
    const gap = assessments.gaps.find((row) => row.gapId === supplied.gapId);
    if (!gap || gap.fingerprint !== supplied.fingerprint || gap.assessmentId !== assessment.assessmentId) fail("EVIDENCE_GAP_FINGERPRINT_MISMATCH");
    return { gapId: gap.gapId, fingerprint: gap.fingerprint, assessmentId: gap.assessmentId, assessmentStatus: gap.assessmentStatus };
  }).sort((left, right) => left.gapId.localeCompare(right.gapId));
  const predecessor = input.predecessorRequestId ? store.requests.find((row) => row.requestId === input.predecessorRequestId) : null;
  if (input.predecessorRequestId) {
    if (!predecessor) fail("REQUEST_NOT_FOUND");
    if (predecessor.lifecycleState !== "OPEN") fail("PREDECESSOR_NOT_OPEN");
    if (predecessor.orchestrationContextId !== context.contextId || predecessor.progressionId !== stage.progressionId) fail("REQUEST_CONTEXT_MISMATCH");
    const sameRefs = JSON.stringify(predecessor.prerequisiteReferences) === JSON.stringify(prerequisiteReferences) && JSON.stringify(predecessor.evidenceGapReferences) === JSON.stringify(evidenceGapReferences);
    if (predecessor.destinationStage === destinationToken && predecessor.provenanceRef === input.provenanceRef && sameRefs) fail("REQUEST_UNCHANGED");
  }
  const fingerprint = requestFingerprint({
    requestId: input.requestId,
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    progressionId: stage.progressionId,
    progressionFingerprint: stage.fingerprint,
    structuralIdentityId: context.structuralIdentityId,
    sourceStage,
    destinationStage: destinationToken,
    prerequisiteReferences,
    evidenceGapReferences,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    provenanceRef: input.provenanceRef,
    authority: REQUEST_AUTHORITY,
    predecessorRequestId: predecessor?.requestId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requests.find((row) => row.requestId === input.requestId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("REQUEST_ALREADY_RECORDED");
  }
  const duplicate = store.requests.find((row) => row.lifecycleState === "OPEN" && row.requestId !== predecessor?.requestId && row.orchestrationContextId === context.contextId && row.progressionId === stage.progressionId);
  if (duplicate) fail("DUPLICATE_REQUEST_REJECTED");
  const request: D1nR4Request = Object.freeze({
    requestId: input.requestId,
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    progressionId: stage.progressionId,
    progressionFingerprint: stage.fingerprint,
    structuralIdentityId: context.structuralIdentityId,
    sourceStage,
    destinationStage: destinationToken,
    prerequisiteReferences: Object.freeze(prerequisiteReferences.map((row) => Object.freeze(row))),
    evidenceGapReferences: Object.freeze(evidenceGapReferences.map((row) => Object.freeze(row))),
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    authority: REQUEST_AUTHORITY,
    provenanceRef: input.provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    lifecycleState: "OPEN",
    predecessorRequestId: predecessor?.requestId ?? null,
    transitionApproved: false,
    transitionAuthorized: false,
    transitionApprovable: false,
    progressionChanged: false,
    engineeringValidated: false,
    engineeringApproved: false,
    certified: false,
  });
  if (predecessor) {
    const index = store.requests.findIndex((row) => row.requestId === predecessor.requestId);
    store.requests[index] = Object.freeze({ ...predecessor, lifecycleState: "SUPERSEDED" });
    store.history.push({ historyId: `hist-${store.history.length + 1}`, requestId: predecessor.requestId, action: "SUPERSEDED", fingerprint: predecessor.fingerprint, recordedAt: store.now() });
  }
  store.requests.push(request);
  store.history.push({ historyId: `hist-${store.history.length + 1}`, requestId: request.requestId, action: "CREATED", fingerprint, recordedAt: store.now() });
  return request;
}

export function withdrawTransitionRequest(store: D1nR4Store, actor: D1nR1Actor, input: D1nR4Withdrawal): D1nR4Request {
  assertActor(actor);
  assertScope(actor, input);
  if (!input.provenanceRef.trim()) fail("MISSING_PROVENANCE");
  if (blockedParty(input.provenanceRef) || blockedParty(input.requestId)) fail("AI_NOT_TRANSITION_REQUEST_AUTHORITY");
  const request = store.requests.find((row) => row.requestId === input.requestId);
  if (!request) fail("REQUEST_NOT_FOUND");
  if (request.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (request.workspaceId !== actor.workspaceId || request.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (request.lifecycleState !== "OPEN") fail("REQUEST_NOT_OPEN");
  const withdrawn: D1nR4Request = Object.freeze({ ...request, lifecycleState: "WITHDRAWN" });
  const index = store.requests.findIndex((row) => row.requestId === request.requestId);
  store.requests[index] = withdrawn;
  store.history.push({ historyId: `hist-${store.history.length + 1}`, requestId: request.requestId, action: "WITHDRAWN", fingerprint: request.fingerprint, recordedAt: store.now() });
  return withdrawn;
}

export function reconstructTransitionRequest(store: D1nR4Store, requestId: string): D1nR4Request {
  const record = store.requests.find((row) => row.requestId === requestId);
  if (!record) fail("REQUEST_NOT_FOUND");
  return record;
}

export function mutateTransitionRequest(): never {
  return fail("REQUEST_MUTATION_REJECTED");
}
export function approveStageTransition(): never {
  return fail("STAGE_APPROVAL_NOT_IN_R4");
}
export function executeStageTransition(): never {
  return fail("STAGE_TRANSITION_EXECUTION_NOT_IN_R4");
}
export function selectNextStage(): never {
  return fail("NEXT_STAGE_SELECTION_NOT_IN_R4");
}
export function reassessPrerequisites(): never {
  return fail("PREREQUISITE_REASSESSMENT_NOT_IN_R4");
}
export function repointTransitionRequest(): never {
  return fail("REQUEST_REPOINT_NOT_IN_R4");
}
export function changeDesignProgression(): never {
  return fail("PROGRESSION_MUTATION_NOT_IN_R4");
}
