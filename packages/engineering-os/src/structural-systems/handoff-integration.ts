/**
 * EOS-D1N-R8 handoff integration.
 * Cites exact D1M, D1K, and D1L records under R7 currentness.
 * Consumption does not transfer upstream authority.
 */
import { D1N_0_CHANGED_DEPENDENCY_REQUIRES_REEVALUATION } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1M_R8_D1N_HANDOFF_CONTRACT_IMPLEMENTED,
  type D1mR8Manifest,
  type D1mR8Store,
} from "./cad-bim-evidence-handoff";
import {
  D1L_R1_CLAIM_RECORDED_EQUALS_CERTIFIED,
  D1L_R1_CLAIM_RECORDED_EQUALS_ELIGIBLE,
  type D1lR1EvidencePin,
  type D1lR1ManifestRecord,
  type D1lR1Store,
} from "./certification-claim-manifest";
import {
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT,
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
  D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
  D1N_CERTIFICATION_RUNTIME_COUNT,
  D1N_CONFORMANCE_RUNTIME_COUNT,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY,
  D1N_CURRENTNESS_STATES,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
  D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_R7_C10_DEBT,
  D1N_R7_CLOSEOUT_PATH,
  D1N_R7_D1F_DEBT,
  D1N_R7_D1G_BLOCKER_PRESERVED,
  D1N_R7_D1G_DEBT,
  D1N_R7_D1H_DEBT,
  D1N_R7_D1I_DEBT,
  D1N_R7_D1J_DEBT,
  D1N_R7_D1K_DEBT,
  D1N_R7_D1L_DEBT,
  D1N_R7_DEBT_PRESERVED,
  D1N_R7_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R7_PARENT_ARCHITECTURE_PATH,
  D1N_R7_POST_D1J_DEBT_LEDGER,
  D1N_R7_R1_CLOSEOUT_PATH,
  D1N_R7_R2_CLOSEOUT_PATH,
  D1N_R7_R3_CLOSEOUT_PATH,
  D1N_R7_R4_CLOSEOUT_PATH,
  D1N_R7_R5_CLOSEOUT_PATH,
  D1N_R7_R6_CLOSEOUT_PATH,
  D1N_R7_STRUCTURAL_PACK_COMPLETE,
  D1N_R8_CANONICAL_PHASE,
  D1N_R8_CANONICAL_SCOPE,
  D1N_R8_PHASE_TYPE,
  D1N_SOLVER_EXECUTION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY,
  D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT,
  D1N_TRIGGER_CATEGORIES,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
} from "./currentness-reassessment";
import type { D1kR3Store } from "./interface-handoff-governance";
import type { D1kR1InterfaceRecord, D1kR1Store } from "./interface-identity-foundation";
import type { D1nR1Actor, D1nR1Store } from "./orchestration-context";
import { D1N_CONTEXT_AUTHORITY } from "./orchestration-context";

export const D1N_R8_STATUS = "HANDOFF_INTEGRATION_IMPLEMENTED" as const;
export const D1N_R8_MATURITY_STATE = "STRUCTURAL_D1M_D1K_D1L_HANDOFF_INTEGRATION_IMPLEMENTED" as const;
export const D1N_R8_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1N_R8_D1M_D1K_D1L_HANDOFF_INTEGRATION_CLOSEOUT.md" as const;
export const D1N_R8_PARENT_ARCHITECTURE_PATH = D1N_R7_PARENT_ARCHITECTURE_PATH;
export const D1N_R8_R1_CLOSEOUT_PATH = D1N_R7_R1_CLOSEOUT_PATH;
export const D1N_R8_R2_CLOSEOUT_PATH = D1N_R7_R2_CLOSEOUT_PATH;
export const D1N_R8_R3_CLOSEOUT_PATH = D1N_R7_R3_CLOSEOUT_PATH;
export const D1N_R8_R4_CLOSEOUT_PATH = D1N_R7_R4_CLOSEOUT_PATH;
export const D1N_R8_R5_CLOSEOUT_PATH = D1N_R7_R5_CLOSEOUT_PATH;
export const D1N_R8_R6_CLOSEOUT_PATH = D1N_R7_R6_CLOSEOUT_PATH;
export const D1N_R8_R7_CLOSEOUT_PATH = D1N_R7_CLOSEOUT_PATH;
export const D1N_R8_SCOPE = D1N_R8_CANONICAL_SCOPE;
export { D1N_R8_CANONICAL_PHASE, D1N_R8_PHASE_TYPE, D1N_R8_CANONICAL_SCOPE };

export const D1N_RUNTIME_STARTED = true as const;
export const D1N_RUNTIME_COUNT = 8 as const;
export {
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_ALTERNATIVE_BRANCH_RUNTIME_READY,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
};
export const D1N_HANDOFF_INTEGRATION_RUNTIME_READY = true as const;

export const D1M_TO_D1N_HANDOFF_CONTRACT_REUSED = D1M_R8_D1N_HANDOFF_CONTRACT_IMPLEMENTED;
export const D1N_D1M_RUNTIME_INTEGRATION_IMPLEMENTED = true as const;
export const D1N_D1M_RUNTIME_INTEGRATION_COUNT = 1 as const;
export const D1N_D1K_RUNTIME_INTEGRATION_IMPLEMENTED = true as const;
export const D1N_D1K_RUNTIME_INTEGRATION_COUNT = 1 as const;
export const D1N_D1L_RUNTIME_INTEGRATION_IMPLEMENTED = true as const;
export const D1N_D1L_RUNTIME_INTEGRATION_COUNT = 1 as const;
export const EXACT_D1M_HANDOFF_REFERENCE_REQUIRED = true as const;
export const EXACT_D1K_EVIDENCE_REFERENCE_REQUIRED = true as const;
export const EXACT_D1L_GOVERNANCE_REFERENCE_REQUIRED = true as const;
export const FLOATING_D1M_REFERENCE_ALLOWED = false as const;
export const FLOATING_D1K_REFERENCE_ALLOWED = false as const;
export const FLOATING_D1L_REFERENCE_ALLOWED = false as const;
export const D1N_R7_CURRENTNESS_REUSED =
  (D1N_CURRENTNESS_STATES as readonly string[]).includes("CURRENT") &&
  (D1N_CURRENTNESS_STATES as readonly string[]).includes("STALE") &&
  (D1N_CURRENTNESS_STATES as readonly string[]).includes("REASSESSMENT_REQUIRED") &&
  (D1N_CURRENTNESS_STATES as readonly string[]).includes("SUPERSEDED") &&
  D1N_0_CHANGED_DEPENDENCY_REQUIRES_REEVALUATION === true;
export const PARALLEL_R8_CURRENTNESS_ENGINE_CREATED = false as const;
export const D1M_HANDOFF_AUTO_REPOINTED_TO_NEWER_EVIDENCE = false as const;
export const D1K_HANDOFF_AUTO_REPOINTED_TO_NEWER_EVIDENCE = false as const;
export const D1L_HANDOFF_AUTO_REPOINTED_TO_NEWER_GOVERNANCE_STATE = false as const;
export const D1M_HANDOFF_EQUALS_D1N_CAD_BIM_AUTHORITY = false as const;
export const D1K_HANDOFF_EQUALS_D1N_INTERFACE_AUTHORITY = false as const;
export const D1L_HANDOFF_EQUALS_D1N_CERTIFICATION_AUTHORITY = false as const;
export const D1M_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1K_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1L_GOVERNANCE_REFERENCE_PRESENT_EQUALS_CERTIFIED = false as const;
export const D1M_LIMITATIONS_PROPAGATED_TO_D1N = true as const;
export const D1K_LIMITATIONS_PROPAGATED_TO_D1N = true as const;
export const D1L_LIMITATIONS_PROPAGATED_TO_D1N = true as const;
export const D1N_EQUALS_D1M_AUTHORITY = false as const;
export const D1N_EQUALS_D1K_AUTHORITY = false as const;
export const D1N_EQUALS_D1L_CERTIFICATION_AUTHORITY = false as const;
export const AI_CAN_INVENT_D1M_HANDOFF_EVIDENCE = false as const;
export const AI_CAN_INVENT_D1K_INTERFACE_EVIDENCE = false as const;
export const AI_CAN_INVENT_D1L_ELIGIBILITY = false as const;
export const AI_CAN_OVERRIDE_STALE_HANDOFF = false as const;
export { AI_EQUALS_D1N_ENGINEERING_AUTHORITY, ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY };
export const TENANT_WORKSPACE_PROJECT_HANDOFF_SCOPE_ENFORCED = true as const;
export const D1N_HANDOFF_PROVENANCE_REQUIRED = true as const;
export const D1N_HANDOFF_PROVENANCE_PRESERVED = true as const;
export { CANONICAL_FINGERPRINT_REUSED, SECOND_FINGERPRINT_ALGORITHM_CREATED };
export const D1N_HANDOFF_FINGERPRINT_IMPLEMENTED = true as const;
export const SILENT_HANDOFF_MUTATION_ALLOWED = false as const;
export const D1N_HANDOFF_HISTORY_PRESERVED = true as const;
export const D1N_DUPLICATE_HANDOFF_GOVERNED = true as const;
export const D1N_HANDOFF_REPLAY_GOVERNED = true as const;
export const D1N_HANDOFF_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1N_ABSORBS_D1M = false as const;
export const D1N_ABSORBS_D1K = false as const;
export const D1N_ABSORBS_D1L = false as const;
export {
  D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
  D1N_SOLVER_EXECUTION_RUNTIME_COUNT,
  D1N_CONFORMANCE_RUNTIME_COUNT,
  D1N_CERTIFICATION_RUNTIME_COUNT,
  D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT,
  D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT,
  AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT,
  D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY,
  D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY,
  D1K_LIMITATIONS_PRESERVED,
  D1L_TRACK_COMPLETE,
  D1L_TRACK_STATUS,
};
export const D1N_DETERMINES_D1L_ELIGIBILITY = false as const;
export const D1N_ISSUES_D1L_CERTIFICATION = false as const;
export const D1N_REVOKES_D1L_CERTIFICATION = false as const;
export {
  CANONICAL_DIGITAL_THREAD_REUSED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  D1M_TRACK_COMPLETE,
  D1M_REOPENED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D2_D8_RUNTIME_COUNT,
};
export const D1N_R8_C10_DEBT = D1N_R7_C10_DEBT;
export const D1N_R8_D1F_DEBT = D1N_R7_D1F_DEBT;
export const D1N_R8_D1G_DEBT = D1N_R7_D1G_DEBT;
export const D1N_R8_D1H_DEBT = D1N_R7_D1H_DEBT;
export const D1N_R8_D1I_DEBT = D1N_R7_D1I_DEBT;
export const D1N_R8_D1J_DEBT = D1N_R7_D1J_DEBT;
export const D1N_R8_D1K_DEBT = D1N_R7_D1K_DEBT;
export const D1N_R8_D1L_DEBT = D1N_R7_D1L_DEBT;
export const D1N_R8_DEBT_PRESERVED = D1N_R7_DEBT_PRESERVED;
export const D1N_R8_POST_D1J_DEBT_LEDGER = D1N_R7_POST_D1J_DEBT_LEDGER;
export const D1N_R8_D1G_BLOCKER_PRESERVED = D1N_R7_D1G_BLOCKER_PRESERVED;
export const D1N_R8_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = D1N_R7_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1N_R8_STRUCTURAL_PACK_COMPLETE = D1N_R7_STRUCTURAL_PACK_COMPLETE;
export const D1N_R8_DATABASE_SCHEMA_CHANGED = false as const;
export const D1N_R8_NEW_DEPENDENCY_ADDED = false as const;
export const D1N_R9_CANONICAL_PHASE = "EOS-D1N-R9-CONCEPT-TO-DETAILED-ORCHESTRATION-CLOSEOUT" as const;
export const D1N_R9_PHASE_TYPE = "CONCEPT_TO_DETAILED_ORCHESTRATION_CLOSEOUT" as const;
export const D1N_R9_CANONICAL_SCOPE =
  "Close the bounded D1N concept-to-detailed orchestration implementation. Verify R1 through R8 coherence, preserve explicit limitations and authority boundaries, and add no new substantive runtime. Do not execute a stage transition, validate engineering, approve engineering, certify, absorb D1M, D1K, or D1L, or start D9 or D2 through D8." as const;
export const D1N_R8_READY_FOR_NEXT_PHASE = true as const;
export const D1N_R8_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const HANDOFF_AUTHORITY = D1N_CONTEXT_AUTHORITY;
const FLOATING = new Set([
  "latest",
  "current",
  "newest",
  "head",
  "active",
  "current model",
  "current interface",
  "current certification record",
  "latest bim",
  "current bim",
]);
const PINS = ["designEvidence", "analysisEvidence", "validationEvidence", "engineerReviewEvidence", "conformanceEvidence", "solverQualificationEvidence", "crossDisciplineEvidence", "authorityEvidence"] as const;

export type D1nR8Sources = {
  orchestration: D1nR1Store;
  d1m: D1mR8Store;
  d1k: D1kR1Store;
  d1kEvents: D1kR3Store;
  d1l: D1lR1Store;
};
export type D1nR8Citation = {
  id: string;
  fingerprint: string;
  authority: string;
  currentnessAtBind: "CURRENT";
};
export type D1nR8Limitations = { d1m: readonly string[]; d1k: readonly string[]; d1l: readonly string[] };
export type D1nR8Record = {
  handoffId: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  d1m: D1nR8Citation;
  d1k: D1nR8Citation;
  d1l: D1nR8Citation;
  claimId: string;
  currentnessState: "CURRENT" | "STALE" | "REASSESSMENT_REQUIRED";
  recordStatus: "CURRENT" | "SUPERSEDED";
  reassessmentRequired: boolean;
  triggerCategory: (typeof D1N_TRIGGER_CATEGORIES)[number];
  triggeringDependencyId: string | null;
  observedFingerprint: string | null;
  limitations: D1nR8Limitations;
  missingCertificationPrerequisites: readonly string[];
  upstreamAuthorities: { d1m: string; d1k: string; d1l: string };
  engineeringValidated: false;
  certified: false;
  d1lEligible: false;
  cadBimInterpreted: false;
  interfaceAuthorityAssumed: false;
  certificationAuthorityAssumed: false;
  referencesRepointed: false;
  progressionChanged: false;
  transitionExecuted: false;
  provenanceRef: string;
  actorId: string;
  authority: typeof HANDOFF_AUTHORITY;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  recordedAt: string;
  fingerprint: string;
  predecessorHandoffId: string | null;
  deleted: false;
};
export type D1nR8History = {
  historyId: string;
  handoffId: string;
  action: "CREATED" | "SUPERSEDED";
  currentnessState: D1nR8Record["currentnessState"];
  fingerprint: string;
  recordedAt: string;
};
export type D1nR8Store = { now: () => string; records: D1nR8Record[]; history: D1nR8History[] };
export type D1nR8Input = {
  handoffId: string;
  orchestrationContextId: string;
  orchestrationContextFingerprint: string;
  d1mHandoffId: string;
  d1mFingerprint: string;
  d1kInterfaceId: string;
  d1kFingerprint: string;
  d1lManifestId: string;
  d1lFingerprint: string;
  provenanceRef: string;
  predecessorHandoffId?: string | null;
  triggerCategory?: string;
  triggeringDependencyId?: string | null;
  observedFingerprint?: string | null;
  resultingCurrentness?: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  repoint?: boolean;
  interpretCad?: boolean;
  inventD1m?: boolean;
  inventD1k?: boolean;
  inventD1lEligibility?: boolean;
  overrideStale?: boolean;
  determineEligibility?: boolean;
  certify?: boolean;
  revoke?: boolean;
  validateEngineering?: boolean;
  approveEngineering?: boolean;
  resolveInterface?: boolean;
  changeProgression?: boolean;
  executeTransition?: boolean;
  forceCurrent?: boolean;
  stripLimitations?: boolean;
  absorbD1m?: boolean;
  absorbD1k?: boolean;
  absorbD1l?: boolean;
};

function fail(code: string): never {
  throw new Error(code);
}
function blocked(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}
function floating(value: string): boolean {
  return FLOATING.has(value.trim().toLowerCase());
}
function assertActor(actor: D1nR1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blocked(actor.actorId) || blocked(actor.authority)) fail("AI_NOT_HANDOFF_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_HANDOFF_AUTHORITY");
  if (actor.authority === "LIFECYCLE_GATE_DECISION") fail("HANDOFF_AUTHORITY_NOT_HUMAN_DECISION");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY" || actor.authority === "ENGINEERING_VALIDATION_AUTHORITY") fail("HANDOFF_AUTHORITY_NOT_ENGINEERING");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("HANDOFF_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority === "INTERFACE_RECORD_AUTHORITY" || actor.authority === "HUMAN_ENGINEER" || actor.authority === "EVIDENCE_PRODUCER") fail("UPSTREAM_AUTHORITY_DOES_NOT_RECORD_D1N_HANDOFF");
  if (actor.authority !== HANDOFF_AUTHORITY) fail("UNAUTHORIZED");
}
function sameScope(actor: D1nR1Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (row.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}
function exact(value: string, code: string): string {
  if (!value.trim() || floating(value)) fail(code);
  return value.trim();
}
function rejectProhibited(input: D1nR8Input): void {
  if (input.repoint) fail("AUTO_REPOINT_NOT_IN_R8");
  if (input.interpretCad) fail("CAD_BIM_INTERPRETATION_NOT_IN_R8");
  if (input.inventD1m) fail("D1M_EVIDENCE_INVENTION_REJECTED");
  if (input.inventD1k) fail("D1K_EVIDENCE_INVENTION_REJECTED");
  if (input.inventD1lEligibility) fail("D1L_ELIGIBILITY_INVENTION_REJECTED");
  if (input.overrideStale) fail("STALE_HANDOFF_OVERRIDE_REJECTED");
  if (input.determineEligibility) fail("D1L_ELIGIBILITY_NOT_IN_R8");
  if (input.certify) fail("CERTIFICATION_NOT_IN_R8");
  if (input.revoke) fail("CERTIFICATION_REVOCATION_NOT_IN_R8");
  if (input.validateEngineering || input.approveEngineering) fail("ENGINEERING_AUTHORITY_NOT_IN_R8");
  if (input.resolveInterface) fail("INTERFACE_RESOLUTION_NOT_IN_R8");
  if (input.changeProgression) fail("PROGRESSION_MUTATION_NOT_IN_R8");
  if (input.executeTransition) fail("STAGE_TRANSITION_EXECUTION_NOT_IN_R8");
  if (input.forceCurrent) fail("FORCED_CURRENTNESS_NOT_IN_R8");
  if (input.stripLimitations) fail("LIMITATION_STRIP_REJECTED");
  if (input.absorbD1m || input.absorbD1k || input.absorbD1l) fail("UPSTREAM_ABSORPTION_REJECTED");
}
function limitationsFor(manifest: D1mR8Manifest, iface: D1kR1InterfaceRecord, claim: D1lR1ManifestRecord): D1nR8Limitations {
  const d1l = [
    D1L_R1_CLAIM_RECORDED_EQUALS_ELIGIBLE ? "ELIGIBLE" : "CLAIM_RECORDED_IS_NOT_ELIGIBLE",
    D1L_R1_CLAIM_RECORDED_EQUALS_CERTIFIED ? "CERTIFIED" : "CLAIM_RECORDED_IS_NOT_CERTIFIED",
    D1L_TRACK_STATUS,
  ];
  for (const pin of PINS) {
    const row = claim[pin];
    if (row?.upstreamDiagnostic) d1l.push(row.upstreamDiagnostic);
  }
  if ("status" in claim.consequenceReliabilityProfile) d1l.push("CONSEQUENCE_PROFILE_NOT_AVAILABLE");
  return {
    d1m: [
      manifest.engineeringValidated ? "ENGINEERING_VALIDATED" : "NOT_ENGINEERING_VALIDATED",
      "NOT_CAD_BIM_AUTHORITY",
      manifest.d1nOrchestrationStarted ? "ORCHESTRATION_STARTED" : "D1N_DOES_NOT_OWN_D1M",
    ],
    d1k: [
      D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY ? "INTERNAL_INTEGRATION_READY" : "INTERNAL_DISCIPLINE_INTEGRATION_NOT_READY",
      D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY ? "INTELLIGENCE_READY" : "CROSS_DISCIPLINE_INTELLIGENCE_NOT_READY",
      iface.engineeringApproval ? "ENGINEERING_APPROVED" : "INTERFACE_CITATION_IS_NOT_ENGINEERING_APPROVAL",
    ],
    d1l,
  };
}
function missingPrerequisites(claim: D1lR1ManifestRecord): string[] {
  return PINS.filter((slot) => claim[slot] == null);
}
function citedEvidence(claim: D1lR1ManifestRecord): D1lR1EvidencePin[] {
  return PINS.flatMap((slot) => {
    const pin = claim[slot];
    return pin ? [pin] : [];
  });
}
function classifyD1m(manifest: D1mR8Manifest): "CURRENT" | "STALE" | "REASSESSMENT_REQUIRED" {
  if (manifest.currentness === "STALE") return "STALE";
  if (manifest.currentness === "SUPERSEDED") return D1N_0_CHANGED_DEPENDENCY_REQUIRES_REEVALUATION ? "REASSESSMENT_REQUIRED" : "CURRENT";
  return "CURRENT";
}
function classifyD1k(row: D1kR1InterfaceRecord, events: D1kR3Store): "CURRENT" | "STALE" | "REASSESSMENT_REQUIRED" {
  if (events.events.some((event) => event.interfaceId === row.interfaceId && event.handoffState === "STALE_DEPENDENCY")) return "STALE";
  if (row.recordStatus === "SUPERSEDED") return D1N_0_CHANGED_DEPENDENCY_REQUIRES_REEVALUATION ? "REASSESSMENT_REQUIRED" : "CURRENT";
  return "CURRENT";
}
function classifyD1l(store: D1lR1Store, claim: D1lR1ManifestRecord): "CURRENT" | "STALE" | "REASSESSMENT_REQUIRED" {
  const stale = citedEvidence(claim).some((pin) => store.catalog.evidence.some((row) => row.evidenceId === pin.evidenceId && row.stale));
  if (stale) return "STALE";
  if (claim.recordStatus === "SUPERSEDED") return D1N_0_CHANGED_DEPENDENCY_REQUIRES_REEVALUATION ? "REASSESSMENT_REQUIRED" : "CURRENT";
  return "CURRENT";
}

export function createD1nR8Store(now: () => string = () => "2026-10-22T00:00:00.000Z"): D1nR8Store {
  return { now, records: [], history: [] };
}

function findManifest(store: D1mR8Store, actor: D1nR1Actor, id: string, fingerprint: string, bind: boolean): D1mR8Manifest {
  exact(id, "FLOATING_D1M_REFERENCE_REJECTED");
  exact(fingerprint, "FLOATING_D1M_REFERENCE_REJECTED");
  const manifest = store.manifests.find((row) => row.handoffId === id);
  if (!manifest || manifest.deleted) fail("D1M_HANDOFF_NOT_FOUND");
  sameScope(actor, manifest);
  if (manifest.manifestFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  if (manifest.destination !== "D1N_FUTURE_ORCHESTRATION_INPUT") fail("D1M_DESTINATION_NOT_D1N");
  if (bind && manifest.currentness !== "CURRENT") fail("STALE_D1M_HANDOFF_REJECTED");
  return manifest;
}
function findInterface(store: D1kR1Store, events: D1kR3Store, actor: D1nR1Actor, id: string, fingerprint: string, bind: boolean): D1kR1InterfaceRecord {
  exact(id, "FLOATING_D1K_REFERENCE_REJECTED");
  exact(fingerprint, "FLOATING_D1K_REFERENCE_REJECTED");
  const row = store.records.find((item) => item.interfaceId === id);
  if (!row) fail("D1K_INTERFACE_NOT_FOUND");
  sameScope(actor, row);
  if (row.fingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  if (bind && (row.recordStatus !== "CURRENT" || classifyD1k(row, events) !== "CURRENT")) fail("STALE_D1K_REFERENCE_REJECTED");
  return row;
}
function findClaim(store: D1lR1Store, actor: D1nR1Actor, id: string, fingerprint: string, bind: boolean): D1lR1ManifestRecord {
  exact(id, "FLOATING_D1L_REFERENCE_REJECTED");
  exact(fingerprint, "FLOATING_D1L_REFERENCE_REJECTED");
  const claim = store.records.find((row) => row.manifestId === id);
  if (!claim) fail("D1L_GOVERNANCE_NOT_FOUND");
  sameScope(actor, claim);
  if (claim.manifestFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  if (bind && (claim.recordStatus !== "CURRENT" || classifyD1l(store, claim) !== "CURRENT")) fail("STALE_D1L_REFERENCE_REJECTED");
  if (claim.certificationAuthority != null) fail("D1L_AUTHORITY_SUBSTITUTION_REJECTED");
  return claim;
}

function commit(sources: D1nR8Sources, store: D1nR8Store, actor: D1nR1Actor, input: D1nR8Input, mode: "BASELINE" | "REASSESSMENT"): D1nR8Record {
  assertActor(actor);
  rejectProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if ((input.workspaceId != null && input.workspaceId !== actor.workspaceId) || (input.projectId != null && input.projectId !== actor.projectId)) fail("CROSS_PROJECT_OPERATION");
  if (!input.provenanceRef.trim() || blocked(input.provenanceRef) || floating(input.provenanceRef)) fail("MISSING_HANDOFF_PROVENANCE");
  exact(input.handoffId, "HANDOFF_IDENTITY_REQUIRED");
  const context = sources.orchestration.records.find((row) => row.contextId === input.orchestrationContextId);
  if (!context) fail("ORCHESTRATION_CONTEXT_REQUIRED");
  sameScope(actor, context);
  if (context.fingerprint !== input.orchestrationContextFingerprint) fail("FINGERPRINT_MISMATCH");
  const predecessor = input.predecessorHandoffId ? store.records.find((row) => row.handoffId === input.predecessorHandoffId) : null;
  if (mode === "REASSESSMENT" && (!predecessor || predecessor.recordStatus !== "CURRENT")) fail("PREDECESSOR_NOT_CURRENT");
  if (predecessor) {
    sameScope(actor, predecessor);
    const rebound =
      input.d1mHandoffId !== predecessor.d1m.id ||
      input.d1mFingerprint !== predecessor.d1m.fingerprint ||
      input.d1kInterfaceId !== predecessor.d1k.id ||
      input.d1kFingerprint !== predecessor.d1k.fingerprint ||
      input.d1lManifestId !== predecessor.d1l.id ||
      input.d1lFingerprint !== predecessor.d1l.fingerprint;
    if (rebound) fail("AUTO_REPOINT_NOT_IN_R8");
  }
  const manifest = findManifest(sources.d1m, actor, input.d1mHandoffId, input.d1mFingerprint, mode === "BASELINE");
  const iface = findInterface(sources.d1k, sources.d1kEvents, actor, input.d1kInterfaceId, input.d1kFingerprint, mode === "BASELINE");
  const claim = findClaim(sources.d1l, actor, input.d1lManifestId, input.d1lFingerprint, mode === "BASELINE");
  const observations = {
    [manifest.handoffId]: classifyD1m(manifest),
    [iface.interfaceId]: classifyD1k(iface, sources.d1kEvents),
    [claim.manifestId]: classifyD1l(sources.d1l, claim),
  };
  let currentnessState: D1nR8Record["currentnessState"] = "CURRENT";
  let triggerCategory: D1nR8Record["triggerCategory"] = "BASELINE";
  let triggeringDependencyId: string | null = null;
  if (mode === "REASSESSMENT") {
    if (!input.triggerCategory || !(D1N_TRIGGER_CATEGORIES as readonly string[]).includes(input.triggerCategory) || input.triggerCategory === "BASELINE") fail("TRIGGER_REQUIRED");
    if (!input.triggeringDependencyId || observations[input.triggeringDependencyId] == null) fail("TRIGGER_DEPENDENCY_NOT_CITED");
    const observed = observations[input.triggeringDependencyId];
    if (observed === "CURRENT") fail("UPSTREAM_STILL_CURRENT");
    if (input.triggerCategory === "DEPENDENCY_STALE" && observed !== "STALE") fail("STALENESS_NOT_CITED");
    if (input.triggerCategory === "DEPENDENCY_SUPERSEDED" && observed !== "REASSESSMENT_REQUIRED") fail("SUPERSESSION_NOT_CITED");
    currentnessState = observed === "STALE" ? "STALE" : "REASSESSMENT_REQUIRED";
    triggerCategory = input.triggerCategory as D1nR8Record["triggerCategory"];
    triggeringDependencyId = input.triggeringDependencyId;
  }
  if (input.resultingCurrentness != null && input.resultingCurrentness !== currentnessState) fail("CURRENTNESS_STATE_MISMATCH");
  const limits = limitationsFor(manifest, iface, claim);
  const missing = missingPrerequisites(claim);
  const body = {
    handoffId: input.handoffId,
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    d1m: { id: manifest.handoffId, fingerprint: manifest.manifestFingerprint, authority: manifest.authority, currentnessAtBind: "CURRENT" as const },
    d1k: { id: iface.interfaceId, fingerprint: iface.fingerprint, authority: iface.sourceAuthority, currentnessAtBind: "CURRENT" as const },
    d1l: { id: claim.manifestId, fingerprint: claim.manifestFingerprint, authority: claim.creatorAuthority, currentnessAtBind: "CURRENT" as const },
    claimId: claim.claimId,
    currentnessState,
    reassessmentRequired: currentnessState !== "CURRENT",
    triggerCategory,
    triggeringDependencyId,
    observedFingerprint: input.observedFingerprint ?? null,
    limitations: limits,
    missingCertificationPrerequisites: missing,
    upstreamAuthorities: { d1m: manifest.authority, d1k: iface.sourceAuthority, d1l: claim.creatorAuthority },
    provenanceRef: input.provenanceRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    predecessorHandoffId: predecessor?.handoffId ?? null,
  };
  const fingerprint = fingerprintCanonical(body);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.records.find((row) => row.handoffId === input.handoffId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("HANDOFF_ALREADY_RECORDED");
  }
  const duplicate = store.records.find((row) => row.recordStatus === "CURRENT" && row.handoffId !== predecessor?.handoffId && row.orchestrationContextId === context.contextId && row.tenantId === actor.tenantId);
  if (duplicate) fail("DUPLICATE_HANDOFF_REJECTED");
  const record: D1nR8Record = Object.freeze({
    ...body,
    d1m: Object.freeze(body.d1m),
    d1k: Object.freeze(body.d1k),
    d1l: Object.freeze(body.d1l),
    limitations: Object.freeze({
      d1m: Object.freeze([...limits.d1m]),
      d1k: Object.freeze([...limits.d1k]),
      d1l: Object.freeze([...limits.d1l]),
    }),
    missingCertificationPrerequisites: Object.freeze([...missing]),
    upstreamAuthorities: Object.freeze(body.upstreamAuthorities),
    engineeringValidated: false,
    certified: false,
    d1lEligible: false,
    cadBimInterpreted: false,
    interfaceAuthorityAssumed: false,
    certificationAuthorityAssumed: false,
    referencesRepointed: false,
    progressionChanged: false,
    transitionExecuted: false,
    actorId: actor.actorId,
    authority: HANDOFF_AUTHORITY,
    recordedAt: store.now(),
    fingerprint,
    recordStatus: "CURRENT",
    deleted: false,
  });
  if (predecessor) {
    const index = store.records.findIndex((row) => row.handoffId === predecessor.handoffId);
    store.records[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" });
    store.history.push({ historyId: `hist-${store.history.length + 1}`, handoffId: predecessor.handoffId, action: "SUPERSEDED", currentnessState: predecessor.currentnessState, fingerprint: predecessor.fingerprint, recordedAt: store.now() });
  }
  store.records.push(record);
  store.history.push({ historyId: `hist-${store.history.length + 1}`, handoffId: record.handoffId, action: "CREATED", currentnessState, fingerprint, recordedAt: store.now() });
  return record;
}

export function recordHandoffIntegration(sources: D1nR8Sources, store: D1nR8Store, actor: D1nR1Actor, input: D1nR8Input): D1nR8Record {
  return commit(sources, store, actor, input, "BASELINE");
}
export function reassessHandoffIntegration(sources: D1nR8Sources, store: D1nR8Store, actor: D1nR1Actor, input: D1nR8Input): D1nR8Record {
  return commit(sources, store, actor, input, "REASSESSMENT");
}
export function reconstructHandoffIntegration(store: D1nR8Store, handoffId: string): D1nR8Record {
  const record = store.records.find((row) => row.handoffId === handoffId);
  if (!record || record.deleted) fail("HANDOFF_NOT_FOUND");
  return record;
}
export function mutateHandoffIntegration(): never { return fail("HANDOFF_MUTATION_REJECTED"); }
export function repointHandoffIntegration(): never { return fail("AUTO_REPOINT_NOT_IN_R8"); }
export function interpretCadBim(): never { return fail("CAD_BIM_INTERPRETATION_NOT_IN_R8"); }
export function resolveInterfaceAuthority(): never { return fail("INTERFACE_RESOLUTION_NOT_IN_R8"); }
export function determineD1lEligibility(): never { return fail("D1L_ELIGIBILITY_NOT_IN_R8"); }
export function issueD1lCertification(): never { return fail("CERTIFICATION_NOT_IN_R8"); }
export function revokeD1lCertification(): never { return fail("CERTIFICATION_REVOCATION_NOT_IN_R8"); }
export function executeStageTransition(): never { return fail("STAGE_TRANSITION_EXECUTION_NOT_IN_R8"); }
export function changeDesignProgression(): never { return fail("PROGRESSION_MUTATION_NOT_IN_R8"); }
