/**
 * EOS-D1M-R8 evidence handoff.
 * Hands current D1M references to D1K, D1L, and a future D1N contract. It does not hand off their authority.
 */
import { D1K_HANDOFF_STATES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1M_R8_CANONICAL_PHASE,
  D1M_R8_CANONICAL_SCOPE,
  D1M_R8_PHASE_TYPE as OWNED_R8_PHASE_TYPE,
  type D1mR7Actor,
  type D1mR7Store,
  type D1mR7Subject,
} from "./cad-bim-change-governance";
import { D1L_R1_CLAIM_RECORDED_EQUALS_ELIGIBLE, D1L_R1_EXACT_EVIDENCE_REVISION_PINNING_IMPLEMENTED } from "./certification-claim-manifest";
import { D1L_R2_CERTIFICATION_ELIGIBILITY_SATISFIED } from "./certification-eligibility";
import { D1L_R6_TRACK_COMPLETE, D1L_R6_TRACK_STATUS } from "./certification-gate-closeout";
import { D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY, D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY } from "./interface-closeout";
import { POST_D1J_STRUCTURAL_DEBT_LEDGER } from "./post-d1j-roadmap";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D1G_CERTIFIED_SOLVER_STATUS,
  D1G_CONFORMANCE_VALIDATED,
  D1G_ENGINEER_VALIDATED,
  D1G_LIVE_VALIDATED,
  GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
} from "./roadmap-after-twin-closeout";

export const D1M_R8_PHASE = D1M_R8_CANONICAL_PHASE;
export const D1M_R8_PHASE_TYPE = OWNED_R8_PHASE_TYPE;
export const D1M_R8_STATUS = "EVIDENCE_HANDOFF_IMPLEMENTED" as const;
export const D1M_R8_MATURITY_STATE = "STRUCTURAL_CAD_OR_BIM_D1K_D1L_D1N_EVIDENCE_HANDOFF_IMPLEMENTED" as const;
export const D1M_R8_SCOPE = D1M_R8_CANONICAL_SCOPE;
export const D1M_R8_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R8_D1K_D1L_D1N_EVIDENCE_HANDOFF_CLOSEOUT.md" as const;
export const D1M_R8_PARENT_ARCHITECTURE_PATH = "docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md" as const;
export const D1M_R8_R7_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R7_CHANGE_STALENESS_SUPERSESSION_CLOSEOUT.md" as const;
export const D1M_R8_DESTINATIONS = ["D1K_INTERFACE_GOVERNANCE", "D1L_CERTIFICATION_EVIDENCE", "D1N_FUTURE_ORCHESTRATION_INPUT"] as const;
export const D1M_R8_REVIEW_STATES = ["REQUESTED", "ACKNOWLEDGED"] as const;
export const D1M_R8_D1K_REVIEW_VOCABULARY_REUSED = (D1K_HANDOFF_STATES as readonly string[]).includes("REQUESTED") && (D1K_HANDOFF_STATES as readonly string[]).includes("ACKNOWLEDGED");
export const D1M_R8_ARCHITECTURE_READY = true as const;
export const D1M_R8_SOURCE_REFERENCE_RUNTIME_READY = true as const;
export const D1M_R8_MODEL_EVIDENCE_RUNTIME_READY = true as const;
export const D1M_R8_ADAPTER_BOUNDARY_RUNTIME_READY = true as const;
export const D1M_R8_FORMAT_ADAPTER_RUNTIME_READY = false as const;
export const D1M_R8_STRUCTURAL_INTERPRETATION_RUNTIME_READY = false as const;
export const D1M_R8_CHANGE_GOVERNANCE_RUNTIME_READY = true as const;
export const D1M_R8_EVIDENCE_HANDOFF_RUNTIME_READY = true as const;
export const D1M_R8_HANDOFF_MANIFEST_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R8_HANDOFF_MANIFEST_RUNTIME_COUNT = 1 as const;
export const D1M_R8_USES_CANONICAL_EVIDENCE_REFERENCES = true as const;
export const D1M_R8_PARALLEL_EVIDENCE_STORE_CREATED = false as const;
export const D1M_R8_EXACT_EVIDENCE_VERSION_REQUIRED = true as const;
export const D1M_R8_FLOATING_EVIDENCE_REFERENCE_ALLOWED = false as const;
export const D1M_R8_R7_CURRENTNESS_REQUIRED = true as const;
export const D1M_R8_STALE_ALLOWED_AS_CURRENT_HANDOFF = false as const;
export const D1M_R8_SUPERSEDED_ALLOWED_AS_CURRENT_HANDOFF = false as const;
export const D1M_R8_EVIDENCE_AUTO_REPOINTED = false as const;
export const D1M_R8_R7_REUSED = true as const;
export const D1M_R8_PARALLEL_CURRENTNESS_ENGINE_CREATED = false as const;
export const D1M_R8_MANIFEST_FINGERPRINT_IMPLEMENTED = true as const;
export const D1M_R8_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1M_R8_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1M_R8_FINGERPRINT_EQUALS_D1K_INTEGRATED = false as const;
export const D1M_R8_FINGERPRINT_EQUALS_D1L_ELIGIBLE = false as const;
export const D1M_R8_FINGERPRINT_EQUALS_D1N_EXECUTED = false as const;
export const D1M_R8_DESTINATION_ALLOWLIST_ENFORCED = true as const;
export const D1M_R8_FREEFORM_DESTINATION_ALLOWED = false as const;
export const D1M_R8_D1K_HANDOFF_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R8_D1K_HANDOFF_RUNTIME_COUNT = 1 as const;
export const D1M_R8_D1K_HANDOFF_EQUALS_INTERNAL_INTEGRATION = false as const;
export const D1M_R8_D1K_HANDOFF_EQUALS_INTELLIGENCE = false as const;
export const D1M_R8_D1K_HANDOFF_EQUALS_MULTIDISCIPLINARY_VALIDATED = false as const;
export const D1M_R8_D1K_ACCEPTED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R8_D1K_GOVERNANCE_REUSED = true as const;
export const D1M_R8_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1M_R8_D1K_INTERNAL_INTEGRATION_READY = D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY;
export const D1M_R8_D1K_INTELLIGENCE_READY = D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY;
export const D1M_R8_D1L_HANDOFF_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R8_D1L_HANDOFF_RUNTIME_COUNT = 1 as const;
export const D1M_R8_D1L_CLAIM_MODEL_REUSED = D1L_R1_EXACT_EVIDENCE_REVISION_PINNING_IMPLEMENTED === true && D1L_R1_CLAIM_RECORDED_EQUALS_ELIGIBLE === false;
export const D1M_R8_HANDOFF_EQUALS_D1L_ELIGIBLE = false as const;
export const D1M_R8_CURRENT_EVIDENCE_EQUALS_D1L_ELIGIBLE = D1L_R2_CERTIFICATION_ELIGIBILITY_SATISFIED;
export const D1M_R8_COMPLETE_HANDOFF_EQUALS_D1L_ELIGIBLE = false as const;
export const D1M_R8_STALE_ALLOWED_AS_CURRENT_D1L_EVIDENCE = false as const;
export const D1M_R8_STALENESS_EQUALS_D1L_CERTIFICATION_REVOKED = false as const;
export const D1M_R8_CAN_ISSUE_D1L_CERTIFICATION = false as const;
export const D1M_R8_CAN_REVOKE_D1L_CERTIFICATION = false as const;
export const D1M_R8_CAN_MUTATE_D1L_DECISION_HISTORY = false as const;
export const D1M_R8_D1L_TRACK_COMPLETE = D1L_R6_TRACK_COMPLETE;
export const D1M_R8_D1L_TRACK_STATUS = D1L_R6_TRACK_STATUS;
export const D1M_R8_D1N_HANDOFF_CONTRACT_IMPLEMENTED = true as const;
export const D1M_R8_D1N_HANDOFF_CONTRACT_COUNT = 1 as const;
export const D1M_R8_D1N_HANDOFF_EQUALS_ORCHESTRATION_STARTED = false as const;
export const D1M_R8_D1N_HANDOFF_EQUALS_CONCEPT_TO_DETAILED_EXECUTED = false as const;
export const D1M_R8_STALE_ALLOWED_AS_CURRENT_D1N_INPUT = false as const;
export const D1M_R8_D1N_DESIGN_ORCHESTRATION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_D1N_CURRENT_STATUS = "NOT_ABSORBED" as const;
export const D1M_R8_D1N_ABSORBED = false as const;
export const D1M_R8_D1N_RUNTIME_STARTED = false as const;
export const D1M_R8_D1N_RUNTIME_COUNT = 0 as const;
export const D1M_R8_AUTHORITY_PRESERVED = true as const;
export const D1M_R8_PROVENANCE_PRESERVED = true as const;
export const D1M_R8_AUTHORITY_EQUALS_D1K_ENGINEERING_AUTHORITY = false as const;
export const D1M_R8_AUTHORITY_EQUALS_D1L_CERTIFICATION_AUTHORITY = false as const;
export const D1M_R8_AUTHORITY_EQUALS_D1N_ORCHESTRATION_AUTHORITY = false as const;
export const D1M_R8_ADMIN_EQUALS_HANDOFF_ENGINEERING_AUTHORITY = false as const;
export const D1M_R8_ADMIN_CAN_HANDOFF_STALE_AS_CURRENT = false as const;
export const D1M_R8_ADMIN_CAN_BYPASS_DESTINATION_GOVERNANCE = false as const;
export const D1M_R8_AI_CAN_INVENT_EVIDENCE = false as const;
export const D1M_R8_AI_CAN_MARK_STALE_CURRENT = false as const;
export const D1M_R8_AI_CAN_APPROVE_HANDOFF_AUTHORITY = false as const;
export const D1M_R8_AI_CAN_MAKE_D1L_ELIGIBLE = false as const;
export const D1M_R8_AI_CAN_CERTIFY_D1L = false as const;
export const D1M_R8_AI_CAN_START_D1N = false as const;
export const D1M_R8_AI_CAN_PROMOTE_D1K_INTELLIGENCE = false as const;
export const D1M_R8_HANDOFF_WITHOUT_PROVENANCE_ALLOWED = false as const;
export const D1M_R8_SILENT_MUTATION_ALLOWED = false as const;
export const D1M_R8_EVIDENCE_AUTO_UPGRADED = false as const;
export const D1M_R8_DESTINATION_AUTO_CHANGED = false as const;
export const D1M_R8_CURRENTNESS_AUTO_RESTORED = false as const;
export const D1M_R8_HISTORY_PRESERVED = true as const;
export const D1M_R8_SUPERSESSION_GOVERNANCE_IMPLEMENTED = true as const;
export const D1M_R8_STALENESS_GOVERNANCE_IMPLEMENTED = true as const;
export const D1M_R8_AUTOMATIC_REHANDOFF_RUNTIME_COUNT = 0 as const;
export const D1M_R8_HUMAN_REVIEW_SUPPORTED = true as const;
export const D1M_R8_HUMAN_REVIEW_EQUALS_ENGINEERING_VALIDATION = false as const;
export const D1M_R8_HUMAN_REVIEW_EQUALS_D1L_ELIGIBILITY = false as const;
export const D1M_R8_SCOPE_ENFORCED = true as const;
export const D1M_R8_CROSS_WORKSPACE_HANDOFF_ALLOWED = false as const;
export const D1M_R8_CROSS_PROJECT_HANDOFF_ALLOWED = false as const;
export const D1M_R8_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1M_R8_DUPLICATE_HANDOFF_GOVERNED = true as const;
export const D1M_R8_D9_ABSORBED = false as const;
export const D1M_R8_D9_RUNTIME_STARTED = false as const;
export const D1M_R8_D9_RUNTIME_COUNT = 0 as const;
export const D1M_R8_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_GLOBAL_DEPENDENCY_REASONING_RUNTIME_COUNT = 0 as const;
export const D1M_R8_COORDINATION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D1M_R8_PARSE_RUNTIME_COUNT = 0 as const;
export const D1M_R8_OBJECT_EXTRACTION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_GENERIC_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_FORMAT_ADAPTER_RUNTIME_COUNT = 0 as const;
export const D1M_R8_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1M_R8_VENDOR_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1M_R8_URL_FETCH_RUNTIME_COUNT = 0 as const;
export const D1M_R8_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_AXIS_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R8_AXIS_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_CONNECTIVITY_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R8_CONNECTIVITY_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_LOAD_PATH_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R8_LOAD_PATH_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_CLASH_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_AUTOMATIC_REVALIDATION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_AUTOMATIC_REINTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_AUTOMATIC_RECERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_MODEL_CORRECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R8_CAD_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R8_BIM_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R8_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1M_R8_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1M_R8_D2_D8_RUNTIME_STARTED = false as const;
export const D1M_R8_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1M_R8_RUNTIME_STARTED = true as const;
export const D1M_R8_RUNTIME_COUNT = 8 as const;
export const D1M_R8_DATABASE_SCHEMA_CHANGED = false as const;
export const D1M_R8_NEW_DEPENDENCY_ADDED = false as const;
export const D1M_R8_STRUCTURAL_PACK_COMPLETE = D1_STRUCTURAL_PACK_COMPLETE;
export const D1M_R8_D1G_BLOCKER_PRESERVED = D1G_LIVE_VALIDATED === false && D1G_ENGINEER_VALIDATED === false && D1G_CONFORMANCE_VALIDATED === false && D1G_CERTIFIED_SOLVER_STATUS === "NOT_CERTIFIED";
export const D1M_R8_POST_D1J_DEBT_PRESERVED = POST_D1J_STRUCTURAL_DEBT_LEDGER;
export const D1M_R8_D1K_LIMITATIONS_PRESERVED = D1M_R8_D1K_INTERNAL_INTEGRATION_READY === false && D1M_R8_D1K_INTELLIGENCE_READY === false;
export const D1M_R8_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1M_R8_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1M_R9_CANONICAL_PHASE = "EOS-D1M-R9-CAD-OR-BIM-INTELLIGENCE-CLOSEOUT" as const;
export const D1M_R9_PHASE_TYPE = "CAD_OR_BIM_INTELLIGENCE_CLOSEOUT" as const;
export const D1M_R9_CANONICAL_SCOPE =
  "Close D1M as a bounded Structural CAD or BIM intelligence governance track. Verify R1 through R8 coherence and readiness claims, preserve explicit limitations, and add no new substantive runtime." as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "current bim", "current drawing", "active evidence", "latest bim"]);
const RECORDER = "INTERFACE_RECORD_AUTHORITY";
const REVIEWER = "REVIEWER_AUTHORITY";

export type D1mR8Destination = (typeof D1M_R8_DESTINATIONS)[number];
export type D1mR8Reference = { subjectId: string; fingerprint: string; recordClass: string; currentnessAtHandoff: "CURRENT" };
export type D1mR8Manifest = {
  handoffId: string;
  destination: D1mR8Destination;
  claimId: string | null;
  references: readonly D1mR8Reference[];
  currentness: "CURRENT" | "STALE" | "SUPERSEDED";
  currentnessAtHandoff: "CURRENT";
  reevaluationRequired: boolean;
  humanReviewState: (typeof D1M_R8_REVIEW_STATES)[number];
  provenanceRef: string;
  actorId: string;
  authority: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  manifestFingerprint: string;
  predecessorHandoffId: string | null;
  successorHandoffId: string | null;
  engineeringValidated: false;
  d1lEligible: false;
  certified: false;
  certificationRevoked: false;
  d1kIntegrationReady: false;
  d1kIntelligenceReady: false;
  multidisciplinaryValidated: false;
  d1nOrchestrationStarted: false;
  conceptToDetailedExecuted: false;
  deleted: false;
};
export type D1mR8History = { historyId: string; handoffId: string; action: "CREATED" | "SUPERSEDED" | "STALE_RECORDED" | "REVIEWED"; fingerprint: string; recordedAt: string };
export type D1mR8Store = { r7: D1mR7Store; now: () => string; manifests: D1mR8Manifest[]; history: D1mR8History[] };
export type D1mR8IssueInput = {
  handoffId: string;
  destination: string;
  references: { subjectId: string; fingerprint: string }[];
  claimId?: string | null;
  provenanceRef: string;
  predecessorHandoffId?: string | null;
  assertedCurrentness?: string;
  certify?: boolean;
  startOrchestration?: boolean;
  promoteIntelligence?: boolean;
};

function fail(code: string): never {
  throw new Error(code);
}
function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}
function floating(value: string): boolean {
  return FLOATING.has(value.trim().toLowerCase());
}
function assertParty(actor: D1mR7Actor, allowed: string): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_HANDOFF_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_HANDOFF_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("HANDOFF_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("HANDOFF_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority === "D1N_ORCHESTRATION_AUTHORITY") fail("HANDOFF_AUTHORITY_NOT_D1N_ORCHESTRATION");
  if (actor.authority !== allowed) fail("UNAUTHORIZED");
}
function sameScope(actor: D1mR7Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (row.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}
function remember(store: D1mR8Store, handoffId: string, action: D1mR8History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, handoffId, action, fingerprint, recordedAt: store.now() });
}
function evidenceKey(references: readonly { subjectId: string; fingerprint: string }[]): string {
  return references.map((row) => `${row.subjectId}:${row.fingerprint}`).sort().join("|");
}
function findSubject(store: D1mR8Store, actor: D1mR7Actor, reference: { subjectId: string; fingerprint: string }, asserted?: string): D1mR7Subject {
  if (!reference.subjectId.trim() || !reference.fingerprint.trim() || floating(reference.subjectId) || floating(reference.fingerprint)) fail("FLOATING_HANDOFF_REFERENCE_REJECTED");
  const subject = store.r7.subjects.find((row) => row.subjectId === reference.subjectId);
  if (!subject) fail("EVIDENCE_REFERENCE_REQUIRED");
  sameScope(actor, subject);
  if (subject.fingerprint !== reference.fingerprint) fail("FINGERPRINT_MISMATCH");
  if (asserted != null && asserted !== subject.currentness) fail("CURRENTNESS_SUBSTITUTION_REJECTED");
  if (subject.currentness === "STALE") fail("STALE_HANDOFF_REJECTED");
  if (subject.currentness === "SUPERSEDED") fail("SUPERSEDED_HANDOFF_REJECTED");
  if (subject.currentness !== "CURRENT") fail("R7_CURRENTNESS_REQUIRED");
  return subject;
}

export function createD1mR8Store(r7: D1mR7Store, now: () => string): D1mR8Store {
  return { r7, now, manifests: [], history: [] };
}

export function issueEvidenceHandoff(store: D1mR8Store, actor: D1mR7Actor, input: D1mR8IssueInput): D1mR8Manifest {
  assertParty(actor, RECORDER);
  if (input.certify === true) fail("D1L_CERTIFICATION_NOT_IN_R8");
  if (input.startOrchestration === true) fail("D1N_ORCHESTRATION_NOT_IN_R8");
  if (input.promoteIntelligence === true) fail("D1K_INTELLIGENCE_PROMOTION_REJECTED");
  if (!(D1M_R8_DESTINATIONS as readonly string[]).includes(input.destination)) fail("DESTINATION_NOT_ALLOWLISTED");
  if (!input.handoffId.trim() || floating(input.handoffId)) fail("HANDOFF_IDENTITY_REQUIRED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_HANDOFF_PROVENANCE");
  if (!input.references.length) fail("EVIDENCE_REFERENCE_REQUIRED");
  const destination = input.destination as D1mR8Destination;
  const claimId = input.claimId?.trim() ? input.claimId.trim() : null;
  if (destination === "D1L_CERTIFICATION_EVIDENCE" && (!claimId || floating(claimId))) fail("CLAIM_REQUIRED");
  if (destination !== "D1L_CERTIFICATION_EVIDENCE" && claimId) fail("CLAIM_NOT_FOR_DESTINATION");
  const resolved = input.references.map((reference) => findSubject(store, actor, reference, input.assertedCurrentness));
  const references: D1mR8Reference[] = resolved.map((subject) => ({
    subjectId: subject.subjectId,
    fingerprint: subject.fingerprint,
    recordClass: subject.recordClass,
    currentnessAtHandoff: "CURRENT",
  }));
  const predecessor = input.predecessorHandoffId ? store.manifests.find((row) => row.handoffId === input.predecessorHandoffId) : null;
  if (input.predecessorHandoffId && (!predecessor || predecessor.currentness === "SUPERSEDED" || predecessor.destination !== destination)) fail("PREDECESSOR_NOT_CURRENT");
  if (predecessor) sameScope(actor, predecessor);
  const manifestFingerprint = fingerprintCanonical({
    handoffId: input.handoffId,
    destination,
    claimId,
    references: references.map((row) => ({ subjectId: row.subjectId, fingerprint: row.fingerprint, recordClass: row.recordClass })),
    provenanceRef: input.provenanceRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    predecessorHandoffId: predecessor?.handoffId ?? null,
  });
  const existing = store.manifests.find((row) => row.handoffId === input.handoffId);
  if (existing) {
    if (existing.manifestFingerprint === manifestFingerprint) return existing;
    fail("HANDOFF_ALREADY_RECORDED");
  }
  const key = evidenceKey(references);
  const duplicate = store.manifests.find((row) => row.currentness !== "SUPERSEDED" && row.handoffId !== predecessor?.handoffId && row.destination === destination && row.claimId === claimId && row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId && evidenceKey(row.references) === key);
  if (duplicate) fail("DUPLICATE_HANDOFF_REJECTED");
  const manifest: D1mR8Manifest = {
    handoffId: input.handoffId,
    destination,
    claimId,
    references: Object.freeze(references.map((row) => Object.freeze(row))),
    currentness: "CURRENT",
    currentnessAtHandoff: "CURRENT",
    reevaluationRequired: false,
    humanReviewState: "REQUESTED",
    provenanceRef: input.provenanceRef,
    actorId: actor.actorId,
    authority: actor.authority,
    recordedAt: store.now(),
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    manifestFingerprint,
    predecessorHandoffId: predecessor?.handoffId ?? null,
    successorHandoffId: null,
    engineeringValidated: false,
    d1lEligible: false,
    certified: false,
    certificationRevoked: false,
    d1kIntegrationReady: false,
    d1kIntelligenceReady: false,
    multidisciplinaryValidated: false,
    d1nOrchestrationStarted: false,
    conceptToDetailedExecuted: false,
    deleted: false,
  };
  if (predecessor) {
    predecessor.currentness = "SUPERSEDED";
    predecessor.successorHandoffId = manifest.handoffId;
    remember(store, predecessor.handoffId, "SUPERSEDED", predecessor.manifestFingerprint);
  }
  store.manifests.push(manifest);
  remember(store, manifest.handoffId, "CREATED", manifestFingerprint);
  return manifest;
}

export function refreshHandoffCurrentness(store: D1mR8Store, handoffId: string): D1mR8Manifest {
  const manifest = store.manifests.find((row) => row.handoffId === handoffId);
  if (!manifest || manifest.deleted) fail("HANDOFF_NOT_FOUND");
  if (manifest.currentness === "SUPERSEDED") return manifest;
  const stale = manifest.references.some((reference) => {
    const subject = store.r7.subjects.find((row) => row.subjectId === reference.subjectId);
    return !subject || subject.fingerprint !== reference.fingerprint || subject.currentness !== "CURRENT";
  });
  if (stale && manifest.currentness === "CURRENT") {
    manifest.currentness = "STALE";
    manifest.reevaluationRequired = true;
    remember(store, manifest.handoffId, "STALE_RECORDED", manifest.manifestFingerprint);
  }
  return manifest;
}

export function confirmHandoffReview(store: D1mR8Store, actor: D1mR7Actor, handoffId: string): D1mR8Manifest {
  assertParty(actor, REVIEWER);
  const manifest = store.manifests.find((row) => row.handoffId === handoffId);
  if (!manifest) fail("HANDOFF_NOT_FOUND");
  sameScope(actor, manifest);
  if (manifest.currentness !== "CURRENT") fail("STALE_HANDOFF_REJECTED");
  const before = manifest.manifestFingerprint;
  manifest.humanReviewState = "ACKNOWLEDGED";
  if (manifest.manifestFingerprint !== before) fail("SILENT_HANDOFF_MUTATION_REJECTED");
  manifest.engineeringValidated = false;
  manifest.d1lEligible = false;
  remember(store, manifest.handoffId, "REVIEWED", manifest.manifestFingerprint);
  return manifest;
}

export function reconstructHandoff(store: D1mR8Store, handoffId: string): { handoffId: string; destination: D1mR8Destination; references: D1mR8Reference[]; currentnessAtHandoff: "CURRENT"; provenanceRef: string; manifestFingerprint: string } {
  const manifest = store.manifests.find((row) => row.handoffId === handoffId);
  if (!manifest || manifest.deleted) fail("HANDOFF_NOT_FOUND");
  return {
    handoffId: manifest.handoffId,
    destination: manifest.destination,
    references: manifest.references.map((row) => ({ ...row })),
    currentnessAtHandoff: manifest.currentnessAtHandoff,
    provenanceRef: manifest.provenanceRef,
    manifestFingerprint: manifest.manifestFingerprint,
  };
}

export function mutateHandoffManifest(): never { return fail("SILENT_HANDOFF_MUTATION_REJECTED"); }
export function repointHandoffEvidence(): never { return fail("HANDOFF_REPOINT_REJECTED"); }
export function restoreHandoffCurrentness(): never { return fail("HANDOFF_CURRENTNESS_RESTORE_REJECTED"); }
export function automaticRehandoff(): never { return fail("AUTOMATIC_REHANDOFF_REJECTED"); }
export function issueD1lCertification(): never { return fail("D1L_CERTIFICATION_NOT_IN_R8"); }
export function revokeD1lCertification(): never { return fail("D1L_REVOCATION_NOT_IN_R8"); }
export function mutateD1lDecisionHistory(): never { return fail("D1L_DECISION_MUTATION_REJECTED"); }
export function startD1nOrchestration(): never { return fail("D1N_ORCHESTRATION_NOT_IN_R8"); }
export function executeConceptToDetailed(): never { return fail("CONCEPT_TO_DETAILED_NOT_IN_R8"); }
export function promoteD1kIntelligence(): never { return fail("D1K_INTELLIGENCE_PROMOTION_REJECTED"); }
export function parseCadBimArtifact(): never { return fail("PARSE_NOT_IN_R8"); }
export function extractCadBimObjects(): never { return fail("OBJECT_EXTRACTION_NOT_IN_R8"); }
export function ingestCadBimFile(): never { return fail("FILE_INGESTION_NOT_IN_R8"); }
export function adaptCadBimFormat(): never { return fail("FORMAT_ADAPTER_NOT_IN_R8"); }
export function connectExternalSystem(): never { return fail("CONNECTOR_NOT_IN_R8"); }
export function fetchExternalUrl(): never { return fail("ARBITRARY_URL_FETCH_REJECTED"); }
export function convertUnits(): never { return fail("UNIT_CONVERSION_NOT_IN_R8"); }
export function transformCoordinates(): never { return fail("COORDINATE_TRANSFORMATION_NOT_IN_R8"); }
export function inferAxis(): never { return fail("AXIS_INFERENCE_NOT_IN_R8"); }
export function transformGeometry(): never { return fail("GEOMETRY_TRANSFORMATION_NOT_IN_R8"); }
export function inferConnectivity(): never { return fail("CONNECTIVITY_INFERENCE_NOT_IN_R8"); }
export function validateConnectivity(): never { return fail("CONNECTIVITY_VALIDATION_NOT_IN_R8"); }
export function inferLoadPath(): never { return fail("LOAD_PATH_INFERENCE_NOT_IN_R8"); }
export function validateLoadPath(): never { return fail("LOAD_PATH_VALIDATION_NOT_IN_R8"); }
export function detectClash(): never { return fail("CLASH_DETECTION_NOT_IN_R8"); }
export function coordinateMultidisciplinaryBim(): never { return fail("MULTIDISCIPLINARY_COORDINATION_NOT_IN_R8"); }
export function reasonGlobalDependency(): never { return fail("GLOBAL_DEPENDENCY_REASONING_NOT_IN_R8"); }
export function detectGlobalCycle(): never { return fail("GLOBAL_CYCLE_DETECTION_NOT_IN_R8"); }
export function interpretEngineeringProperties(): never { return fail("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R8"); }
export function revalidateEngineering(): never { return fail("ENGINEERING_REVALIDATION_NOT_IN_R8"); }
export function reinterpretStructure(): never { return fail("STRUCTURAL_REINTERPRETATION_NOT_IN_R8"); }
export function recertifyEvidence(): never { return fail("RECERTIFICATION_NOT_IN_R8"); }
export function correctCadBimModel(): never { return fail("MODEL_CORRECTION_NOT_IN_R8"); }
export function authorCadModel(): never { return fail("CAD_AUTHORING_NOT_IN_R8"); }
export function authorBimModel(): never { return fail("BIM_AUTHORING_NOT_IN_R8"); }
