/**
 * EOS-D1N-R5 human decision and review-gate integration.
 * Records an external human decision against one exact transition request.
 * D1N does not become the decision-maker, and the R2 progression record stays unchanged.
 */
import { D1N_0_HUMAN_GATES } from "@rtb/types";
import { GATE_DECISIONS, type GateDecisionStatus } from "../lifecycle-intelligence/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { resolveAuthAssuranceLevel } from "../security-closure/privileged-mfa";
import type { D1nR1Actor } from "./orchestration-context";
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
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_R4_C10_DEBT,
  D1N_R4_CLOSEOUT_PATH,
  D1N_R4_D1F_DEBT,
  D1N_R4_D1G_BLOCKER_PRESERVED,
  D1N_R4_D1G_DEBT,
  D1N_R4_D1H_DEBT,
  D1N_R4_D1I_DEBT,
  D1N_R4_D1J_DEBT,
  D1N_R4_D1K_DEBT,
  D1N_R4_D1L_DEBT,
  D1N_R4_DEBT_PRESERVED,
  D1N_R4_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R4_PARENT_ARCHITECTURE_PATH,
  D1N_R4_POST_D1J_DEBT_LEDGER,
  D1N_R4_R1_CLOSEOUT_PATH,
  D1N_R4_R2_CLOSEOUT_PATH,
  D1N_R4_R3_CLOSEOUT_PATH,
  D1N_R4_STRUCTURAL_PACK_COMPLETE,
  D1N_R5_CANONICAL_SCOPE,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  type D1nR4CitedAssessment,
  type D1nR4CitedGap,
  type D1nR4Store,
} from "./stage-transition-request";

export const D1N_R5_STATUS = "HUMAN_DECISION_AND_REVIEW_GATE_INTEGRATED" as const;
export const D1N_R5_MATURITY_STATE = "STRUCTURAL_HUMAN_DECISION_AND_REVIEW_GATE_INTEGRATED" as const;
export const D1N_R5_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1N_R5_HUMAN_DECISION_AND_REVIEW_GATE_INTEGRATION_CLOSEOUT.md" as const;
export const D1N_R5_PARENT_ARCHITECTURE_PATH = D1N_R4_PARENT_ARCHITECTURE_PATH;
export const D1N_R5_R1_CLOSEOUT_PATH = D1N_R4_R1_CLOSEOUT_PATH;
export const D1N_R5_R2_CLOSEOUT_PATH = D1N_R4_R2_CLOSEOUT_PATH;
export const D1N_R5_R3_CLOSEOUT_PATH = D1N_R4_R3_CLOSEOUT_PATH;
export const D1N_R5_R4_CLOSEOUT_PATH = D1N_R4_CLOSEOUT_PATH;
export const D1N_R5_SCOPE = D1N_R5_CANONICAL_SCOPE;
export { D1N_R5_CANONICAL_SCOPE, D1N_ARCHITECTURE_DEFINED, D1N_ARCHITECTURE_READY };

export const D1N_RUNTIME_STARTED = true as const;
export const D1N_RUNTIME_COUNT = 5 as const;
export {
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
};
export const D1N_HUMAN_GATE_RUNTIME_READY = true as const;
export const D1N_ALTERNATIVE_BRANCH_RUNTIME_READY = false as const;
export const D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY = false as const;
export const D1N_HANDOFF_INTEGRATION_RUNTIME_READY = false as const;

export const D1N_R4_TRANSITION_REQUEST_REUSED = true as const;
export const EXACT_R4_TRANSITION_REQUEST_REFERENCE_REQUIRED = true as const;
export const FLOATING_R4_TRANSITION_REQUEST_REFERENCE_ALLOWED = false as const;
export const R5_REBINDS_R1_CONTEXT = false as const;
export const R5_REBINDS_R2_PROGRESSION_CONTEXT = false as const;
export const R5_REBINDS_R3_PREREQUISITE_ASSESSMENTS = false as const;
export const R5_REBINDS_R4_TRANSITION_REQUEST = false as const;
export const D1N_HUMAN_DECISION_RUNTIME_IMPLEMENTED = true as const;
export const D1N_HUMAN_DECISION_RUNTIME_COUNT = 1 as const;
export const D1N_HUMAN_DECISION_GATE_RUNTIME_COUNT = 1 as const;
export const D1N_HUMAN_DECISION_OUTCOMES = GATE_DECISIONS;
export const D1N_HUMAN_DECISION_GATES = D1N_0_HUMAN_GATES;
export const D1N_HUMAN_DECISION_OUTCOME_ALLOWLIST_IMPLEMENTED = true as const;
export const FREEFORM_AUTHORITATIVE_HUMAN_DECISION_OUTCOME_ALLOWED = false as const;
export const UNKNOWN_HUMAN_DECISION_OUTCOME_AUTO_ACCEPTED = false as const;
export const HUMAN_TRANSITION_DECISION_EQUALS_ENGINEERING_VALIDATION = false as const;
export const HUMAN_TRANSITION_DECISION_EQUALS_ENGINEERING_CONFORMANCE = false as const;
export const HUMAN_TRANSITION_DECISION_EQUALS_CERTIFICATION = false as const;
export const HUMAN_TRANSITION_APPROVAL_RECORDED_EQUALS_R2_PROGRESSION_CHANGED = false as const;
export const HUMAN_TRANSITION_APPROVAL_RECORDED_EQUALS_TRANSITION_EXECUTED = false as const;
export const REVIEW_OUTCOME_EQUALS_TRANSITION_DECISION = false as const;
export const RECOMMENDATION_EQUALS_TRANSITION_APPROVAL = false as const;
export const OPEN_EVIDENCE_GAP_EQUALS_AUTOMATIC_REJECTION = false as const;
export const D1N_HUMAN_DECISION_AUTHORITY = "LIFECYCLE_GATE_DECISION" as const;
export const D1N_HUMAN_DECISION_AUTHORITY_REQUIRED = true as const;
export const D1N_HUMAN_DECISION_AUTHORITY_PRESERVED = true as const;
export const REQUEST_AUTHORITY_EQUALS_DECISION_AUTHORITY = false as const;
export const D1N_HUMAN_DECISION_AAL2_GUARD_REUSED = true as const;
export const AI_CAN_IMPERSONATE_HUMAN_DECISION_AUTHORITY = false as const;
export const AI_CAN_APPROVE_STAGE_TRANSITION = false as const;
export const AI_CAN_REJECT_STAGE_TRANSITION_AUTHORITATIVELY = false as const;
export const AI_CAN_CHANGE_HUMAN_DECISION_OUTCOME = false as const;
export const AI_CAN_CHANGE_DESIGN_PROGRESSION_STATE = false as const;
export { AI_EQUALS_D1N_ENGINEERING_AUTHORITY, ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY };
export const ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE = false as const;
export const ADMIN_CAN_REWRITE_HUMAN_DECISION = false as const;
export const ADMIN_CAN_BYPASS_DECISION_AUTHORITY = false as const;
export const R5_REASSESSES_PREREQUISITES_INDEPENDENTLY = false as const;
export const R3_PREREQUISITE_STATUS_REUSED = true as const;
export const R3_EVIDENCE_GAP_STATE_REUSED = true as const;
export const R4_TRANSITION_REQUEST_REUSED = true as const;
export const AUTOMATIC_HUMAN_DECISION_RUNTIME_COUNT = 0 as const;
export const AUTOMATIC_TRANSITION_APPROVAL_RUNTIME_COUNT = 0 as const;
export const AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT = 0 as const;
export const D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT = 0 as const;
export const D1N_HUMAN_DECISION_RATIONALE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_HUMAN_DECISION_SCOPE_ENFORCED = true as const;
export const D1N_HUMAN_DECISION_PROVENANCE_REQUIRED = true as const;
export const D1N_HUMAN_DECISION_PROVENANCE_PRESERVED = true as const;
export { CANONICAL_FINGERPRINT_REUSED, SECOND_FINGERPRINT_ALGORITHM_CREATED, CANONICAL_CURRENTNESS_REUSED };
export const D1N_HUMAN_DECISION_FINGERPRINT_IMPLEMENTED = true as const;
export const FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_CERTIFIED = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_PROGRESSION_EXECUTED = false as const;
export const SILENT_HUMAN_DECISION_MUTATION_ALLOWED = false as const;
export const D1N_HUMAN_DECISION_HISTORY_PRESERVED = true as const;
export const D1N_DUPLICATE_HUMAN_DECISION_GOVERNED = true as const;
export const D1N_HUMAN_DECISION_REPLAY_GOVERNED = true as const;
export const D1N_HUMAN_DECISION_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1N_CURRENTNESS_REASSESSMENT_RUNTIME_COUNT = 0 as const;
export const HUMAN_DECISION_AUTO_REPOINTED_TO_NEWER_R4_REQUEST = false as const;
export const HUMAN_DECISION_AUTO_REPOINTED_TO_NEWER_R3_ASSESSMENT = false as const;
export const HUMAN_DECISION_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE = false as const;
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
export const D1N_R5_C10_DEBT = D1N_R4_C10_DEBT;
export const D1N_R5_D1F_DEBT = D1N_R4_D1F_DEBT;
export const D1N_R5_D1G_DEBT = D1N_R4_D1G_DEBT;
export const D1N_R5_D1H_DEBT = D1N_R4_D1H_DEBT;
export const D1N_R5_D1I_DEBT = D1N_R4_D1I_DEBT;
export const D1N_R5_D1J_DEBT = D1N_R4_D1J_DEBT;
export const D1N_R5_D1K_DEBT = D1N_R4_D1K_DEBT;
export const D1N_R5_D1L_DEBT = D1N_R4_D1L_DEBT;
export const D1N_R5_DEBT_PRESERVED = D1N_R4_DEBT_PRESERVED;
export const D1N_R5_POST_D1J_DEBT_LEDGER = D1N_R4_POST_D1J_DEBT_LEDGER;
export const D1N_R5_D1G_BLOCKER_PRESERVED = D1N_R4_D1G_BLOCKER_PRESERVED;
export const D1N_R5_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = D1N_R4_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1N_R5_STRUCTURAL_PACK_COMPLETE = D1N_R4_STRUCTURAL_PACK_COMPLETE;
export const D1N_R5_DATABASE_SCHEMA_CHANGED = false as const;
export const D1N_R5_NEW_DEPENDENCY_ADDED = false as const;
export const D1N_R6_CANONICAL_PHASE = "EOS-D1N-R6-ALTERNATIVE-DESIGN-BRANCH-GOVERNANCE" as const;
export const D1N_R6_PHASE_TYPE = "ALTERNATIVE_DESIGN_BRANCH_GOVERNANCE" as const;
export const D1N_R6_CANONICAL_SCOPE =
  "Implement bounded alternative-design branch governance. Record alternative branch identity, the parent orchestration context, branch-specific assumption and evidence references, provenance, fingerprint, history, and a branch-selection decision reference. Do not select the best design, make AI the design selector, validate alternatives, execute calculations, certify, or perform multidisciplinary reasoning." as const;
export const D1N_R5_READY_FOR_NEXT_PHASE = true as const;
export const D1N_R5_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const DECISION_AUTHORITY = D1N_HUMAN_DECISION_AUTHORITY;
const APPROVAL_OUTCOMES = new Set<GateDecisionStatus>(["APPROVED_TO_TRANSITION", "APPROVED_WITH_CONDITIONS"]);
const FLOATING = new Set(["latest", "current", "newest", "head", "active", "latest request", "current request", "active request"]);

export type D1nR5Input = {
  decisionId: string;
  requestId: string;
  requestFingerprint: string;
  gateId?: string;
  outcome?: string;
  rationale?: string;
  provenanceRef: string;
  aal?: string | null;
  amr?: Array<string | { method?: string }> | null;
  assertedFingerprint?: string;
  predecessorDecisionId?: string | null;
  recordKind?: string;
  orchestrationContextId?: string;
  progressionId?: string;
  prerequisiteFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  aiDraftRationale?: boolean;
  humanAcceptedRationale?: boolean;
  autoApprove?: boolean;
  progressionChange?: boolean;
  executeTransition?: boolean;
  reassessPrerequisites?: boolean;
  engineeringValidated?: boolean;
  engineeringApproved?: boolean;
  certified?: boolean;
  conformance?: boolean;
  solverExecution?: boolean;
  cadBimInterpretation?: boolean;
  alternativeSelection?: boolean;
  rewriteDecision?: boolean;
};

export type D1nR5Decision = {
  decisionId: string;
  requestId: string;
  requestFingerprint: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  progressionId: string;
  progressionFingerprint: string;
  sourceStage: string;
  destinationStage: string;
  prerequisiteReferences: readonly D1nR4CitedAssessment[];
  evidenceGapReferences: readonly D1nR4CitedGap[];
  gateId: (typeof D1N_0_HUMAN_GATES)[number];
  outcome: GateDecisionStatus;
  rationale: string;
  rationaleProvenance: "HUMAN" | "HUMAN_ACCEPTED_DRAFT";
  authority: typeof DECISION_AUTHORITY;
  authorityId: string;
  aal: "aal2";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorDecisionId: string | null;
  humanTransitionApprovalRecorded: boolean;
  progressionChanged: false;
  transitionExecuted: false;
  engineeringValidated: false;
  engineeringApproved: false;
  conformanceDetermined: false;
  certified: false;
};

export type D1nR5History = {
  historyId: string;
  decisionId: string;
  action: "CREATED" | "SUPERSEDED";
  outcome: GateDecisionStatus;
  fingerprint: string;
  recordedAt: string;
};

export type D1nR5Store = {
  now: () => string;
  decisions: D1nR5Decision[];
  history: D1nR5History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function isOutcome(value: string): value is GateDecisionStatus {
  return (D1N_HUMAN_DECISION_OUTCOMES as readonly string[]).includes(value);
}

function isGate(value: string): value is D1nR5Decision["gateId"] {
  return (D1N_HUMAN_DECISION_GATES as readonly string[]).includes(value);
}

function assertActor(actor: D1nR1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_DECISION_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_DECISION_AUTHORITY");
  if (actor.authority === "ORCHESTRATION_CONTEXT_AUTHORITY") fail("REQUEST_AUTHORITY_NOT_DECISION_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY" || actor.authority === "ENGINEERING_VALIDATION_AUTHORITY") fail("DECISION_AUTHORITY_NOT_ENGINEERING_AUTHORITY");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("DECISION_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== DECISION_AUTHORITY) fail("DECISION_AUTHORITY_REQUIRED");
}

function assertProhibited(input: D1nR5Input): void {
  if (input.autoApprove === true) fail("AUTOMATIC_APPROVAL_NOT_IN_R5");
  if (input.progressionChange === true) fail("PROGRESSION_MUTATION_NOT_IN_R5");
  if (input.executeTransition === true) fail("STAGE_TRANSITION_EXECUTION_NOT_IN_R5");
  if (input.reassessPrerequisites === true) fail("PREREQUISITE_REASSESSMENT_NOT_IN_R5");
  if (input.engineeringValidated === true) fail("ENGINEERING_VALIDATION_NOT_IN_R5");
  if (input.engineeringApproved === true) fail("ENGINEERING_APPROVAL_NOT_IN_R5");
  if (input.certified === true) fail("CERTIFICATION_NOT_IN_R5");
  if (input.conformance === true) fail("CONFORMANCE_NOT_IN_R5");
  if (input.solverExecution === true) fail("SOLVER_NOT_IN_R5");
  if (input.cadBimInterpretation === true) fail("CAD_BIM_INTERPRETATION_NOT_IN_R5");
  if (input.alternativeSelection === true) fail("ALTERNATIVE_SELECTION_NOT_IN_R5");
  if (input.rewriteDecision === true) fail("ADMIN_DECISION_REWRITE_REJECTED");
  if (input.recordKind === "REVIEW") fail("REVIEW_NOT_TRANSITION_DECISION");
  if (input.recordKind === "RECOMMENDATION") fail("RECOMMENDATION_NOT_TRANSITION_APPROVAL");
}

function decisionFingerprint(body: {
  decisionId: string;
  requestId: string;
  requestFingerprint: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  progressionId: string;
  progressionFingerprint: string;
  sourceStage: string;
  destinationStage: string;
  prerequisiteReferences: readonly D1nR4CitedAssessment[];
  evidenceGapReferences: readonly D1nR4CitedGap[];
  gateId: string;
  outcome: string;
  rationale: string;
  rationaleProvenance: string;
  authority: string;
  authorityId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  predecessorDecisionId: string | null;
}): string {
  return fingerprintCanonical(body);
}

export function createD1nR5Store(now: () => string = () => "2026-10-22T00:00:00.000Z"): D1nR5Store {
  return { now, decisions: [], history: [] };
}

export function recordHumanDecision(requests: D1nR4Store, store: D1nR5Store, actor: D1nR1Actor, input: D1nR5Input): D1nR5Decision {
  assertActor(actor);
  assertProhibited(input);
  if (resolveAuthAssuranceLevel({ aal: input.aal, amr: input.amr }) !== "aal2") fail("AAL2_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_PROJECT_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (!input.decisionId.trim() || FLOATING.has(input.decisionId.trim().toLowerCase())) fail("DECISION_IDENTITY_REQUIRED");
  if (!input.requestId.trim() || FLOATING.has(input.requestId.trim().toLowerCase())) fail("FLOATING_R4_REQUEST_REJECTED");
  if (!input.requestFingerprint.trim()) fail("EXACT_REQUEST_FINGERPRINT_REQUIRED");
  if (!input.provenanceRef.trim()) fail("MISSING_PROVENANCE");
  if (!input.rationale?.trim()) fail("RATIONALE_REQUIRED");
  if (input.aiDraftRationale === true && input.humanAcceptedRationale !== true) fail("AI_RATIONALE_NOT_ACCEPTED");
  const rationale = input.rationale.trim();
  if (blockedParty(rationale) || blockedParty(input.provenanceRef) || blockedParty(input.decisionId) || blockedParty(input.requestId)) fail("AI_NOT_DECISION_AUTHORITY");
  if (input.gateId == null || !input.gateId.trim()) fail("HUMAN_GATE_REFERENCE_REQUIRED");
  const gateToken = input.gateId.trim();
  if (!/^[A-Z0-9_]+$/.test(gateToken)) fail("FREEFORM_GATE_REJECTED");
  if (!isGate(gateToken)) fail("HUMAN_GATE_INVALID");
  if (input.outcome == null || !input.outcome.trim()) fail("EXPLICIT_HUMAN_DECISION_OUTCOME_REQUIRED");
  const outcomeToken = input.outcome.trim();
  if (!/^[A-Z0-9_]+$/.test(outcomeToken)) fail("FREEFORM_HUMAN_DECISION_OUTCOME_REJECTED");
  if (!isOutcome(outcomeToken)) fail("HUMAN_DECISION_OUTCOME_INVALID");
  const request = requests.requests.find((row) => row.requestId === input.requestId);
  if (!request) fail("TRANSITION_REQUEST_REQUIRED");
  if (request.fingerprint !== input.requestFingerprint) fail("TRANSITION_REQUEST_FINGERPRINT_MISMATCH");
  if (request.lifecycleState !== "OPEN") fail("REQUEST_NOT_OPEN");
  if (request.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (request.workspaceId !== actor.workspaceId || request.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (input.orchestrationContextId != null && input.orchestrationContextId !== request.orchestrationContextId) fail("R1_REBIND_REJECTED");
  if (input.progressionId != null && input.progressionId !== request.progressionId) fail("R2_REBIND_REJECTED");
  if (input.prerequisiteFingerprint != null && !request.prerequisiteReferences.some((row) => row.fingerprint === input.prerequisiteFingerprint)) fail("R3_REBIND_REJECTED");
  const rationaleProvenance = input.aiDraftRationale === true ? "HUMAN_ACCEPTED_DRAFT" : "HUMAN";
  const predecessor = input.predecessorDecisionId ? store.decisions.find((row) => row.decisionId === input.predecessorDecisionId) : null;
  if (input.predecessorDecisionId) {
    if (!predecessor) fail("DECISION_NOT_FOUND");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    if (predecessor.requestId !== request.requestId || predecessor.requestFingerprint !== request.fingerprint) fail("DECISION_REQUEST_MISMATCH");
    if (predecessor.outcome === outcomeToken && predecessor.rationale === rationale && predecessor.provenanceRef === input.provenanceRef) fail("DECISION_UNCHANGED");
  }
  const fingerprint = decisionFingerprint({
    decisionId: input.decisionId,
    requestId: request.requestId,
    requestFingerprint: request.fingerprint,
    orchestrationContextId: request.orchestrationContextId,
    orchestrationContextFingerprint: request.orchestrationContextFingerprint,
    progressionId: request.progressionId,
    progressionFingerprint: request.progressionFingerprint,
    sourceStage: request.sourceStage,
    destinationStage: request.destinationStage,
    prerequisiteReferences: request.prerequisiteReferences,
    evidenceGapReferences: request.evidenceGapReferences,
    gateId: gateToken,
    outcome: outcomeToken,
    rationale,
    rationaleProvenance,
    authority: DECISION_AUTHORITY,
    authorityId: actor.actorId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    provenanceRef: input.provenanceRef,
    predecessorDecisionId: predecessor?.decisionId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.decisions.find((row) => row.decisionId === input.decisionId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("DECISION_ALREADY_RECORDED");
  }
  const duplicate = store.decisions.find((row) => row.recordStatus === "CURRENT" && row.decisionId !== predecessor?.decisionId && row.requestId === request.requestId);
  if (duplicate) fail("DUPLICATE_DECISION_REJECTED");
  const decision: D1nR5Decision = Object.freeze({
    decisionId: input.decisionId,
    requestId: request.requestId,
    requestFingerprint: request.fingerprint,
    orchestrationContextId: request.orchestrationContextId,
    orchestrationContextFingerprint: request.orchestrationContextFingerprint,
    progressionId: request.progressionId,
    progressionFingerprint: request.progressionFingerprint,
    sourceStage: request.sourceStage,
    destinationStage: request.destinationStage,
    prerequisiteReferences: request.prerequisiteReferences,
    evidenceGapReferences: request.evidenceGapReferences,
    gateId: gateToken,
    outcome: outcomeToken,
    rationale,
    rationaleProvenance,
    authority: DECISION_AUTHORITY,
    authorityId: actor.actorId,
    aal: "aal2",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    provenanceRef: input.provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorDecisionId: predecessor?.decisionId ?? null,
    humanTransitionApprovalRecorded: APPROVAL_OUTCOMES.has(outcomeToken),
    progressionChanged: false,
    transitionExecuted: false,
    engineeringValidated: false,
    engineeringApproved: false,
    conformanceDetermined: false,
    certified: false,
  });
  if (predecessor) {
    const index = store.decisions.findIndex((row) => row.decisionId === predecessor.decisionId);
    store.decisions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" });
    store.history.push({ historyId: `hist-${store.history.length + 1}`, decisionId: predecessor.decisionId, action: "SUPERSEDED", outcome: predecessor.outcome, fingerprint: predecessor.fingerprint, recordedAt: store.now() });
  }
  store.decisions.push(decision);
  store.history.push({ historyId: `hist-${store.history.length + 1}`, decisionId: decision.decisionId, action: "CREATED", outcome: decision.outcome, fingerprint, recordedAt: store.now() });
  return decision;
}

export function reconstructHumanDecision(store: D1nR5Store, decisionId: string): D1nR5Decision {
  const record = store.decisions.find((row) => row.decisionId === decisionId);
  if (!record) fail("DECISION_NOT_FOUND");
  return record;
}

export function mutateHumanDecision(): never {
  return fail("DECISION_MUTATION_REJECTED");
}
export function rewriteHumanDecision(): never {
  return fail("ADMIN_DECISION_REWRITE_REJECTED");
}
export function approveTransitionAutomatically(): never {
  return fail("AUTOMATIC_APPROVAL_NOT_IN_R5");
}
export function executeStageTransition(): never {
  return fail("STAGE_TRANSITION_EXECUTION_NOT_IN_R5");
}
export function changeDesignProgression(): never {
  return fail("PROGRESSION_MUTATION_NOT_IN_R5");
}
export function reassessPrerequisites(): never {
  return fail("PREREQUISITE_REASSESSMENT_NOT_IN_R5");
}
export function repointHumanDecision(): never {
  return fail("DECISION_REPOINT_NOT_IN_R5");
}
