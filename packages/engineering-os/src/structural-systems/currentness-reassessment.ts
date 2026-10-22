/**
 * EOS-D1N-R7 currentness, staleness, and reassessment.
 * Records whether an exact D1N record is still current against explicit dependencies.
 * It does not rewrite those records or make the engineering current again.
 */
import { D1N_0_CHANGED_DEPENDENCY_REQUIRES_REEVALUATION } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1M_R7_CURRENTNESS_STATES } from "./cad-bim-change-governance";
import type { D1nR6Store } from "./alternative-branch";
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
  D1N_ALTERNATIVE_BRANCH_RUNTIME_READY,
  D1N_ARCHITECTURE_DEFINED,
  D1N_ARCHITECTURE_READY,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_R6_C10_DEBT,
  D1N_R6_CLOSEOUT_PATH,
  D1N_R6_D1F_DEBT,
  D1N_R6_D1G_BLOCKER_PRESERVED,
  D1N_R6_D1G_DEBT,
  D1N_R6_D1H_DEBT,
  D1N_R6_D1I_DEBT,
  D1N_R6_D1J_DEBT,
  D1N_R6_D1K_DEBT,
  D1N_R6_D1L_DEBT,
  D1N_R6_DEBT_PRESERVED,
  D1N_R6_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R6_PARENT_ARCHITECTURE_PATH,
  D1N_R6_POST_D1J_DEBT_LEDGER,
  D1N_R6_R1_CLOSEOUT_PATH,
  D1N_R6_R2_CLOSEOUT_PATH,
  D1N_R6_R3_CLOSEOUT_PATH,
  D1N_R6_R4_CLOSEOUT_PATH,
  D1N_R6_R5_CLOSEOUT_PATH,
  D1N_R6_STRUCTURAL_PACK_COMPLETE,
  D1N_R7_CANONICAL_SCOPE,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
} from "./alternative-branch";
import type { D1nR2Store } from "./design-progression-context";
import type { D1nR5Store } from "./human-decision-record";
import type { D1nR1Actor, D1nR1Store } from "./orchestration-context";
import { D1N_CONTEXT_AUTHORITY } from "./orchestration-context";
import type { D1nR3Store } from "./prerequisite-assessment";
import type { D1nR4Store } from "./stage-transition-request";

export const D1N_R7_STATUS = "CURRENTNESS_AND_REASSESSMENT_IMPLEMENTED" as const;
export const D1N_R7_MATURITY_STATE = "STRUCTURAL_CURRENTNESS_STALENESS_AND_REASSESSMENT_IMPLEMENTED" as const;
export const D1N_R7_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1N_R7_CURRENTNESS_STALENESS_AND_REASSESSMENT_CLOSEOUT.md" as const;
export const D1N_R7_PARENT_ARCHITECTURE_PATH = D1N_R6_PARENT_ARCHITECTURE_PATH;
export const D1N_R7_R1_CLOSEOUT_PATH = D1N_R6_R1_CLOSEOUT_PATH;
export const D1N_R7_R2_CLOSEOUT_PATH = D1N_R6_R2_CLOSEOUT_PATH;
export const D1N_R7_R3_CLOSEOUT_PATH = D1N_R6_R3_CLOSEOUT_PATH;
export const D1N_R7_R4_CLOSEOUT_PATH = D1N_R6_R4_CLOSEOUT_PATH;
export const D1N_R7_R5_CLOSEOUT_PATH = D1N_R6_R5_CLOSEOUT_PATH;
export const D1N_R7_R6_CLOSEOUT_PATH = D1N_R6_CLOSEOUT_PATH;
export const D1N_R7_SCOPE = D1N_R7_CANONICAL_SCOPE;
export { D1N_R7_CANONICAL_SCOPE, D1N_ARCHITECTURE_DEFINED, D1N_ARCHITECTURE_READY };

export const D1N_RUNTIME_STARTED = true as const;
export const D1N_RUNTIME_COUNT = 7 as const;
export {
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_ALTERNATIVE_BRANCH_RUNTIME_READY,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
};
export const D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY = true as const;
export const D1N_HANDOFF_INTEGRATION_RUNTIME_READY = false as const;

export const D1N_CURRENTNESS_STATES = ["CURRENT", "STALE", "REASSESSMENT_REQUIRED", "SUPERSEDED"] as const;
export const D1N_D1M_CURRENTNESS_STATES_REUSED = D1M_R7_CURRENTNESS_STATES.every((state) =>
  (D1N_CURRENTNESS_STATES as readonly string[]).includes(state),
);
export const D1N_DEPENDENCY_KINDS = [
  "R1_ORCHESTRATION",
  "R2_PROGRESSION",
  "R3_ASSESSMENT",
  "R3_EVIDENCE_GAP",
  "R4_TRANSITION_REQUEST",
  "R5_HUMAN_DECISION",
  "R6_ALTERNATIVE_BRANCH",
] as const;
export const D1N_TRIGGER_CATEGORIES = ["BASELINE", "DEPENDENCY_STALE", "DEPENDENCY_SUPERSEDED"] as const;
export { CANONICAL_CURRENTNESS_REUSED, PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED };
export const D1N_EXPLICIT_DEPENDENCY_CURRENTNESS_PROPAGATION_IMPLEMENTED = true as const;
export const INFERRED_DEPENDENCY_PROPAGATION_ALLOWED = false as const;
export const STALE_EQUALS_ENGINEERING_INCORRECT = false as const;
export const STALE_EQUALS_ENGINEERING_INVALID = false as const;
export const STALE_EQUALS_CERTIFICATION_REVOKED = false as const;
export const SUPERSEDED_EQUALS_DELETED = false as const;
export const SUPERSEDED_HISTORY_REMOVED = false as const;
export const D1N_REASSESSMENT_REQUIRED_RUNTIME_IMPLEMENTED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_REVALIDATED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_TRANSITION_REVOKED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_CERTIFICATION_REVOKED = false as const;
export const D1N_REASSESSMENT_RUNTIME_IMPLEMENTED = true as const;
export const D1N_REASSESSMENT_RUNTIME_COUNT = 1 as const;
export const D1N_CURRENTNESS_REASSESSMENT_RUNTIME_COUNT = 1 as const;
export const D1N_REASSESSMENT_EQUALS_ENGINEERING_REVALIDATION = false as const;
export const D1N_REASSESSMENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1N_REASSESSMENT_EQUALS_CONFORMANCE_RECHECK = false as const;
export const D1N_REASSESSMENT_EQUALS_CERTIFICATION = false as const;
export const D1N_RECORD_AUTO_REPOINTED_TO_NEWER_DEPENDENCY = false as const;
export const D1N_RECORD_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE = false as const;
export const D1N_HISTORICAL_REFERENCE_MUTATION_ALLOWED = false as const;
export const AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT = 0 as const;
export const R7_SILENTLY_REWRITES_R3_PREREQUISITE_STATUS = false as const;
export const R7_AUTOMATICALLY_APPROVES_TRANSITION_REQUEST = false as const;
export const R7_AUTOMATICALLY_REJECTS_TRANSITION_REQUEST = false as const;
export const R7_MUTATES_PRIOR_HUMAN_DECISION = false as const;
export const R7_AUTOMATICALLY_REAPPROVES_HUMAN_DECISION = false as const;
export const R7_AUTOMATIC_BRANCH_RESELECTION_RUNTIME_COUNT = 0 as const;
export const D1N_REASSESSMENT_AUTHORITY_EQUALS_HUMAN_DECISION_AUTHORITY = false as const;
export const D1N_REASSESSMENT_AUTHORITY_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const AI_CAN_INVENT_D1N_DEPENDENCY = false as const;
export const AI_CAN_REVALIDATE_ENGINEERING_DURING_REASSESSMENT = false as const;
export const AI_CAN_REAPPROVE_TRANSITION = false as const;
export const AI_CAN_RECERTIFY = false as const;
export { AI_EQUALS_D1N_ENGINEERING_AUTHORITY, ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY };
export const ADMIN_CAN_FORCE_CURRENT_STATE_BY_ROLE_ALONE = false as const;
export const ADMIN_CAN_REMOVE_REASSESSMENT_REQUIREMENT_BY_ROLE_ALONE = false as const;
export const ADMIN_CAN_REWRITE_CURRENTNESS_HISTORY = false as const;
export const TENANT_WORKSPACE_PROJECT_CURRENTNESS_SCOPE_ENFORCED = true as const;
export const D1N_REASSESSMENT_PROVENANCE_REQUIRED = true as const;
export const D1N_REASSESSMENT_PROVENANCE_PRESERVED = true as const;
export { CANONICAL_FINGERPRINT_REUSED, SECOND_FINGERPRINT_ALGORITHM_CREATED };
export const D1N_REASSESSMENT_FINGERPRINT_IMPLEMENTED = true as const;
export const FINGERPRINT_VERIFIED_EQUALS_CURRENT = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const FINGERPRINT_VERIFIED_EQUALS_REASSESSMENT_COMPLETE = false as const;
export const SILENT_CURRENTNESS_STATE_MUTATION_ALLOWED = false as const;
export const D1N_CURRENTNESS_HISTORY_PRESERVED = true as const;
export const D1N_REASSESSMENT_HISTORY_PRESERVED = true as const;
export const D1N_DUPLICATE_REASSESSMENT_GOVERNED = true as const;
export const D1N_REASSESSMENT_REPLAY_GOVERNED = true as const;
export const D1N_REASSESSMENT_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT = 0 as const;
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
export const D1N_R7_C10_DEBT = D1N_R6_C10_DEBT;
export const D1N_R7_D1F_DEBT = D1N_R6_D1F_DEBT;
export const D1N_R7_D1G_DEBT = D1N_R6_D1G_DEBT;
export const D1N_R7_D1H_DEBT = D1N_R6_D1H_DEBT;
export const D1N_R7_D1I_DEBT = D1N_R6_D1I_DEBT;
export const D1N_R7_D1J_DEBT = D1N_R6_D1J_DEBT;
export const D1N_R7_D1K_DEBT = D1N_R6_D1K_DEBT;
export const D1N_R7_D1L_DEBT = D1N_R6_D1L_DEBT;
export const D1N_R7_DEBT_PRESERVED = D1N_R6_DEBT_PRESERVED;
export const D1N_R7_POST_D1J_DEBT_LEDGER = D1N_R6_POST_D1J_DEBT_LEDGER;
export const D1N_R7_D1G_BLOCKER_PRESERVED = D1N_R6_D1G_BLOCKER_PRESERVED;
export const D1N_R7_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = D1N_R6_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1N_R7_STRUCTURAL_PACK_COMPLETE = D1N_R6_STRUCTURAL_PACK_COMPLETE;
export const D1N_R7_DATABASE_SCHEMA_CHANGED = false as const;
export const D1N_R7_NEW_DEPENDENCY_ADDED = false as const;
export const D1N_R8_CANONICAL_PHASE = "EOS-D1N-R8-D1M-D1K-D1L-HANDOFF-INTEGRATION" as const;
export const D1N_R8_PHASE_TYPE = "D1M_D1K_D1L_HANDOFF_INTEGRATION" as const;
export const D1N_R8_CANONICAL_SCOPE =
  "Implement governed D1N handoff integration with existing D1M, D1K, and D1L evidence and governance contracts. Reuse those contracts. Do not absorb D1M, D1K, or D1L, bypass currentness, promote D1K readiness, determine D1L certification eligibility, certify, start D9, or start D2 through D8." as const;
export const D1N_R7_READY_FOR_NEXT_PHASE = true as const;
export const D1N_R7_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const REASSESSMENT_AUTHORITY = D1N_CONTEXT_AUTHORITY;
const FLOATING = new Set(["latest", "current", "newest", "head", "active", "latest orchestration", "current progression"]);

export type D1nR7Kind = (typeof D1N_DEPENDENCY_KINDS)[number];
export type D1nR7Currentness = (typeof D1N_CURRENTNESS_STATES)[number];
export type D1nR7Trigger = (typeof D1N_TRIGGER_CATEGORIES)[number];
export type D1nR7Dependency = { kind: D1nR7Kind; id: string; fingerprint: string };
export type D1nR7Sources = {
  orchestration: D1nR1Store;
  progression: D1nR2Store;
  assessments: D1nR3Store;
  requests: D1nR4Store;
  decisions: D1nR5Store;
  branches: D1nR6Store;
};
export type D1nR7Input = {
  reassessmentId: string;
  affectedKind: string;
  affectedId: string;
  affectedFingerprint: string;
  dependencies: { kind: string; id: string; fingerprint: string }[];
  provenanceRef: string;
  triggerCategory?: string;
  triggeringDependencyId?: string | null;
  observedFingerprint?: string | null;
  predecessorReassessmentId?: string | null;
  assertedFingerprint?: string;
  resultingCurrentness?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  inferDependency?: boolean;
  repoint?: boolean;
  revalidate?: boolean;
  reapprove?: boolean;
  recertify?: boolean;
  progressionChange?: boolean;
  reselectBranch?: boolean;
  rewriteDecision?: boolean;
  rewriteAssessment?: boolean;
  approveRequest?: boolean;
  rejectRequest?: boolean;
  forceCurrent?: boolean;
  clearReassessment?: boolean;
  engineeringValidated?: boolean;
  solverExecution?: boolean;
  conformance?: boolean;
};

export type D1nR7Record = {
  reassessmentId: string;
  affectedKind: D1nR7Kind;
  affectedId: string;
  affectedFingerprint: string;
  dependencies: readonly D1nR7Dependency[];
  triggeringDependencyId: string | null;
  triggeringDependencyFingerprint: string | null;
  observedFingerprint: string | null;
  priorCurrentness: D1nR7Currentness | null;
  currentnessState: Exclude<D1nR7Currentness, "SUPERSEDED">;
  triggerCategory: D1nR7Trigger;
  reassessmentRequired: boolean;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: typeof REASSESSMENT_AUTHORITY;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorReassessmentId: string | null;
  deleted: false;
  engineeringValidated: false;
  engineeringApproved: false;
  engineeringIncorrect: false;
  engineeringInvalid: false;
  conformant: false;
  certified: false;
  certificationRevoked: false;
  progressionChanged: false;
  transitionApproved: false;
  transitionRejected: false;
  branchReselected: false;
  referencesRepointed: false;
};

export type D1nR7History = {
  historyId: string;
  reassessmentId: string;
  action: "CREATED" | "SUPERSEDED";
  currentnessState: D1nR7Record["currentnessState"];
  fingerprint: string;
  recordedAt: string;
};
export type D1nR7Store = { now: () => string; records: D1nR7Record[]; history: D1nR7History[] };

function fail(code: string): never {
  throw new Error(code);
}
function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}
function isKind(value: string): value is D1nR7Kind {
  return (D1N_DEPENDENCY_KINDS as readonly string[]).includes(value);
}
function assertActor(actor: D1nR1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_REASSESSMENT_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_CURRENTNESS_AUTHORITY");
  if (actor.authority === "LIFECYCLE_GATE_DECISION") fail("REASSESSMENT_AUTHORITY_NOT_HUMAN_DECISION");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY" || actor.authority === "ENGINEERING_VALIDATION_AUTHORITY") fail("REASSESSMENT_AUTHORITY_NOT_ENGINEERING");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("REASSESSMENT_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== REASSESSMENT_AUTHORITY) fail("UNAUTHORIZED");
}
function assertProhibited(input: D1nR7Input): void {
  if (input.inferDependency === true) fail("INFERRED_DEPENDENCY_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_NOT_IN_R7");
  if (input.revalidate === true || input.engineeringValidated === true) fail("ENGINEERING_REVALIDATION_NOT_IN_R7");
  if (input.reapprove === true) fail("TRANSITION_REAPPROVAL_NOT_IN_R7");
  if (input.recertify === true) fail("CERTIFICATION_NOT_IN_R7");
  if (input.progressionChange === true) fail("PROGRESSION_MUTATION_NOT_IN_R7");
  if (input.reselectBranch === true) fail("BRANCH_RESELECTION_NOT_IN_R7");
  if (input.rewriteDecision === true) fail("HUMAN_DECISION_MUTATION_NOT_IN_R7");
  if (input.rewriteAssessment === true) fail("PREREQUISITE_REWRITE_NOT_IN_R7");
  if (input.approveRequest === true) fail("TRANSITION_APPROVAL_NOT_IN_R7");
  if (input.rejectRequest === true) fail("TRANSITION_REJECTION_NOT_IN_R7");
  if (input.forceCurrent === true) fail("FORCED_CURRENTNESS_NOT_IN_R7");
  if (input.clearReassessment === true) fail("REASSESSMENT_CLEAR_NOT_IN_R7");
  if (input.solverExecution === true) fail("SOLVER_NOT_IN_R7");
  if (input.conformance === true) fail("CONFORMANCE_NOT_IN_R7");
}
type Resolved = { id: string; fingerprint: string; tenantId: string; workspaceId: string; projectId: string; stale: boolean };
function resolve(sources: D1nR7Sources, kind: D1nR7Kind, id: string, fingerprint: string): Resolved {
  if (kind === "R1_ORCHESTRATION") {
    const row = sources.orchestration.records.find((item) => item.contextId === id);
    if (!row || row.fingerprint !== fingerprint) fail("DEPENDENCY_MISMATCH");
    return { id, fingerprint, tenantId: row.tenantId, workspaceId: row.workspaceId, projectId: row.projectId, stale: false };
  }
  if (kind === "R2_PROGRESSION") {
    const row = sources.progression.records.find((item) => item.progressionId === id);
    if (!row || row.fingerprint !== fingerprint) fail("DEPENDENCY_MISMATCH");
    return { id, fingerprint, tenantId: row.tenantId, workspaceId: row.workspaceId, projectId: row.projectId, stale: false };
  }
  if (kind === "R3_ASSESSMENT") {
    const row = sources.assessments.assessments.find((item) => item.assessmentId === id);
    if (!row || row.fingerprint !== fingerprint) fail("DEPENDENCY_MISMATCH");
    return { id, fingerprint, tenantId: row.tenantId, workspaceId: row.workspaceId, projectId: row.projectId, stale: row.citedCurrentness === "STALE" || row.assessmentStatus === "STALE" };
  }
  if (kind === "R3_EVIDENCE_GAP") {
    const row = sources.assessments.gaps.find((item) => item.gapId === id);
    if (!row || row.fingerprint !== fingerprint) fail("DEPENDENCY_MISMATCH");
    const assessment = sources.assessments.assessments.find((item) => item.assessmentId === row.assessmentId);
    if (!assessment) fail("DEPENDENCY_MISMATCH");
    return { id, fingerprint, tenantId: assessment.tenantId, workspaceId: assessment.workspaceId, projectId: assessment.projectId, stale: row.assessmentStatus === "STALE" };
  }
  if (kind === "R4_TRANSITION_REQUEST") {
    const row = sources.requests.requests.find((item) => item.requestId === id);
    if (!row || row.fingerprint !== fingerprint) fail("DEPENDENCY_MISMATCH");
    return { id, fingerprint, tenantId: row.tenantId, workspaceId: row.workspaceId, projectId: row.projectId, stale: false };
  }
  if (kind === "R5_HUMAN_DECISION") {
    const row = sources.decisions.decisions.find((item) => item.decisionId === id);
    if (!row || row.fingerprint !== fingerprint) fail("DEPENDENCY_MISMATCH");
    return { id, fingerprint, tenantId: row.tenantId, workspaceId: row.workspaceId, projectId: row.projectId, stale: false };
  }
  const row = sources.branches.branches.find((item) => item.branchId === id);
  if (!row || row.fingerprint !== fingerprint) fail("DEPENDENCY_MISMATCH");
  return { id, fingerprint, tenantId: row.tenantId, workspaceId: row.workspaceId, projectId: row.projectId, stale: false };
}
function successorIs(sources: D1nR7Sources, kind: D1nR7Kind, id: string, observedFingerprint: string): boolean {
  if (kind === "R1_ORCHESTRATION") return sources.orchestration.records.some((row) => row.predecessorContextId === id && row.fingerprint === observedFingerprint);
  if (kind === "R2_PROGRESSION") return sources.progression.records.some((row) => row.predecessorProgressionId === id && row.fingerprint === observedFingerprint);
  if (kind === "R3_ASSESSMENT") return sources.assessments.assessments.some((row) => row.predecessorAssessmentId === id && row.fingerprint === observedFingerprint);
  if (kind === "R3_EVIDENCE_GAP") {
    const prior = sources.assessments.gaps.find((row) => row.gapId === id);
    const next = sources.assessments.gaps.find((row) => row.fingerprint === observedFingerprint);
    const assessment = next ? sources.assessments.assessments.find((row) => row.assessmentId === next.assessmentId) : undefined;
    return Boolean(prior && assessment && assessment.predecessorAssessmentId === prior.assessmentId);
  }
  if (kind === "R4_TRANSITION_REQUEST") return sources.requests.requests.some((row) => row.predecessorRequestId === id && row.fingerprint === observedFingerprint);
  if (kind === "R5_HUMAN_DECISION") return sources.decisions.decisions.some((row) => row.predecessorDecisionId === id && row.fingerprint === observedFingerprint);
  return sources.branches.branches.some((row) => row.predecessorBranchId === id && row.fingerprint === observedFingerprint);
}
function observedIsStale(sources: D1nR7Sources, kind: D1nR7Kind, observedFingerprint: string): boolean {
  if (kind === "R3_ASSESSMENT") {
    const row = sources.assessments.assessments.find((item) => item.fingerprint === observedFingerprint);
    return row?.citedCurrentness === "STALE" || row?.assessmentStatus === "STALE";
  }
  if (kind === "R3_EVIDENCE_GAP") return sources.assessments.gaps.some((row) => row.fingerprint === observedFingerprint && row.assessmentStatus === "STALE");
  return false;
}
function sameDeps(left: readonly D1nR7Dependency[], right: readonly D1nR7Dependency[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function createD1nR7Store(now: () => string = () => "2026-10-22T00:00:00.000Z"): D1nR7Store {
  return { now, records: [], history: [] };
}

function commit(
  sources: D1nR7Sources,
  store: D1nR7Store,
  actor: D1nR1Actor,
  input: D1nR7Input,
  mode: "BASELINE" | "REASSESSMENT",
): D1nR7Record {
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_PROJECT_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (!input.reassessmentId.trim() || FLOATING.has(input.reassessmentId.trim().toLowerCase())) fail("REASSESSMENT_IDENTITY_REQUIRED");
  if (!isKind(input.affectedKind)) fail(/^[A-Z0-9_]+$/.test(input.affectedKind) ? "AFFECTED_KIND_INVALID" : "FREEFORM_AFFECTED_KIND_REJECTED");
  if (!input.affectedId.trim() || FLOATING.has(input.affectedId.trim().toLowerCase())) fail("AFFECTED_RECORD_REQUIRED");
  if (!input.affectedFingerprint.trim()) fail("AFFECTED_FINGERPRINT_REQUIRED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail(blockedParty(input.provenanceRef) ? "AI_NOT_REASSESSMENT_AUTHORITY" : "MISSING_PROVENANCE");
  if (!input.dependencies.length) fail("EXPLICIT_DEPENDENCY_REQUIRED");
  const affected = resolve(sources, input.affectedKind, input.affectedId, input.affectedFingerprint);
  if (affected.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (affected.workspaceId !== actor.workspaceId || affected.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  const dependencies = input.dependencies.map((link) => {
    if (!isKind(link.kind)) fail(/^[A-Z0-9_]+$/.test(link.kind) ? "DEPENDENCY_KIND_INVALID" : "FREEFORM_DEPENDENCY_REJECTED");
    if (!link.id.trim() || FLOATING.has(link.id.trim().toLowerCase())) fail("EXPLICIT_DEPENDENCY_REQUIRED");
    const resolved = resolve(sources, link.kind, link.id, link.fingerprint);
    if (resolved.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    if (resolved.workspaceId !== actor.workspaceId || resolved.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
    return { kind: link.kind, id: resolved.id, fingerprint: resolved.fingerprint };
  }).sort((left, right) => left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id));
  const predecessor = input.predecessorReassessmentId ? store.records.find((row) => row.reassessmentId === input.predecessorReassessmentId) : null;
  if (mode === "BASELINE") {
    if (input.triggerCategory != null && input.triggerCategory !== "BASELINE") fail("BASELINE_TRIGGER_ONLY");
    if (predecessor) fail("BASELINE_SUPERSESSION_REJECTED");
    if (dependencies.some((link) => resolve(sources, link.kind, link.id, link.fingerprint).stale)) fail("BASELINE_DEPENDENCY_NOT_CURRENT");
  } else {
    if (!predecessor || predecessor.recordStatus !== "CURRENT") fail("PRIOR_CURRENTNESS_REQUIRED");
    if (predecessor.affectedId !== input.affectedId || predecessor.affectedFingerprint !== input.affectedFingerprint || predecessor.affectedKind !== input.affectedKind) fail("AFFECTED_RECORD_MISMATCH");
    if (!sameDeps(predecessor.dependencies, dependencies)) fail("DEPENDENCY_SET_MUTATION_REJECTED");
    if (!input.triggeringDependencyId || !input.observedFingerprint?.trim()) fail("TRIGGERING_DEPENDENCY_REQUIRED");
    if (!dependencies.some((link) => link.id === input.triggeringDependencyId)) fail("INFERRED_DEPENDENCY_REJECTED");
  }
  let triggerCategory: D1nR7Trigger = "BASELINE";
  let currentnessState: D1nR7Record["currentnessState"] = "CURRENT";
  let triggeringDependencyId: string | null = null;
  let triggeringDependencyFingerprint: string | null = null;
  let observedFingerprint: string | null = null;
  let reassessmentRequired = false;
  if (mode === "REASSESSMENT") {
    const trigger = input.triggerCategory ?? "";
    if (trigger !== "DEPENDENCY_STALE" && trigger !== "DEPENDENCY_SUPERSEDED") fail(/^[A-Z0-9_]+$/.test(trigger) ? "TRIGGER_CATEGORY_INVALID" : "FREEFORM_TRIGGER_REJECTED");
    const link = dependencies.find((item) => item.id === input.triggeringDependencyId);
    if (!link) fail("INFERRED_DEPENDENCY_REJECTED");
    if (!successorIs(sources, link.kind, link.id, input.observedFingerprint!)) fail("SUPERSESSION_NOT_CITED");
    if (trigger === "DEPENDENCY_STALE" && !observedIsStale(sources, link.kind, input.observedFingerprint!)) fail("STALENESS_NOT_CITED");
    if (trigger === "DEPENDENCY_SUPERSEDED" && !D1N_0_CHANGED_DEPENDENCY_REQUIRES_REEVALUATION) fail("REASSESSMENT_RULE_NOT_AUTHORIZED");
    triggerCategory = trigger;
    currentnessState = trigger === "DEPENDENCY_STALE" ? "STALE" : "REASSESSMENT_REQUIRED";
    triggeringDependencyId = link.id;
    triggeringDependencyFingerprint = link.fingerprint;
    observedFingerprint = input.observedFingerprint!;
    reassessmentRequired = true;
  }
  if (input.resultingCurrentness != null && input.resultingCurrentness !== currentnessState) fail("CURRENTNESS_STATE_MISMATCH");
  const fingerprint = fingerprintCanonical({
    reassessmentId: input.reassessmentId,
    affectedKind: input.affectedKind,
    affectedId: input.affectedId,
    affectedFingerprint: input.affectedFingerprint,
    dependencies,
    triggeringDependencyId,
    triggeringDependencyFingerprint,
    observedFingerprint,
    priorCurrentness: predecessor?.currentnessState ?? null,
    currentnessState,
    triggerCategory,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    authority: REASSESSMENT_AUTHORITY,
    provenanceRef: input.provenanceRef,
    predecessorReassessmentId: predecessor?.reassessmentId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.records.find((row) => row.reassessmentId === input.reassessmentId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("REASSESSMENT_ALREADY_RECORDED");
  }
  const duplicate = store.records.find((row) => row.recordStatus === "CURRENT" && row.affectedId === input.affectedId && row.reassessmentId !== predecessor?.reassessmentId);
  if (duplicate) fail("DUPLICATE_REASSESSMENT_REJECTED");
  const record: D1nR7Record = Object.freeze({
    reassessmentId: input.reassessmentId,
    affectedKind: input.affectedKind,
    affectedId: input.affectedId,
    affectedFingerprint: input.affectedFingerprint,
    dependencies: Object.freeze(dependencies.map((link) => Object.freeze(link))),
    triggeringDependencyId,
    triggeringDependencyFingerprint,
    observedFingerprint,
    priorCurrentness: predecessor?.currentnessState ?? null,
    currentnessState,
    triggerCategory,
    reassessmentRequired,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    authority: REASSESSMENT_AUTHORITY,
    provenanceRef: input.provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorReassessmentId: predecessor?.reassessmentId ?? null,
    deleted: false,
    engineeringValidated: false,
    engineeringApproved: false,
    engineeringIncorrect: false,
    engineeringInvalid: false,
    conformant: false,
    certified: false,
    certificationRevoked: false,
    progressionChanged: false,
    transitionApproved: false,
    transitionRejected: false,
    branchReselected: false,
    referencesRepointed: false,
  });
  if (predecessor) {
    const index = store.records.findIndex((row) => row.reassessmentId === predecessor.reassessmentId);
    store.records[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" });
    store.history.push({ historyId: `hist-${store.history.length + 1}`, reassessmentId: predecessor.reassessmentId, action: "SUPERSEDED", currentnessState: predecessor.currentnessState, fingerprint: predecessor.fingerprint, recordedAt: store.now() });
  }
  store.records.push(record);
  store.history.push({ historyId: `hist-${store.history.length + 1}`, reassessmentId: record.reassessmentId, action: "CREATED", currentnessState: record.currentnessState, fingerprint, recordedAt: store.now() });
  return record;
}

export function recordCurrentness(sources: D1nR7Sources, store: D1nR7Store, actor: D1nR1Actor, input: D1nR7Input): D1nR7Record {
  return commit(sources, store, actor, input, "BASELINE");
}
export function recordReassessment(sources: D1nR7Sources, store: D1nR7Store, actor: D1nR1Actor, input: D1nR7Input): D1nR7Record {
  return commit(sources, store, actor, input, "REASSESSMENT");
}
export function reconstructReassessment(store: D1nR7Store, reassessmentId: string): D1nR7Record {
  const record = store.records.find((row) => row.reassessmentId === reassessmentId);
  if (!record) fail("REASSESSMENT_NOT_FOUND");
  return record;
}
export function mutateCurrentness(): never {
  return fail("CURRENTNESS_MUTATION_REJECTED");
}
export function rewriteCurrentnessHistory(): never {
  return fail("CURRENTNESS_HISTORY_REWRITE_REJECTED");
}
export function repointD1nRecord(): never {
  return fail("AUTO_REPOINT_NOT_IN_R7");
}
export function inferDependency(): never {
  return fail("INFERRED_DEPENDENCY_REJECTED");
}
export function changeDesignProgression(): never {
  return fail("PROGRESSION_MUTATION_NOT_IN_R7");
}
export function executeStageTransition(): never {
  return fail("STAGE_TRANSITION_EXECUTION_NOT_IN_R7");
}
export function reselectBranch(): never {
  return fail("BRANCH_RESELECTION_NOT_IN_R7");
}
export function revalidateEngineering(): never {
  return fail("ENGINEERING_REVALIDATION_NOT_IN_R7");
}
export function reapproveTransition(): never {
  return fail("TRANSITION_REAPPROVAL_NOT_IN_R7");
}
export function recertify(): never {
  return fail("CERTIFICATION_NOT_IN_R7");
}
