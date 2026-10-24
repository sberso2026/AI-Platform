/**
 * EOS-D1M-R7 change, staleness, and supersession.
 * Records whether existing D1M evidence is still current. It does not decide engineering correctness.
 */
import { D1K_HANDOFF_STATES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1M_R7_CANONICAL_PHASE, D1M_R7_CANONICAL_SCOPE, D1M_R7_PHASE_TYPE as OWNED_R7_PHASE_TYPE } from "./cad-bim-adapter-boundary";
import { D1L_R5_CURRENTNESS_RUNTIME_COUNT } from "./certification-lifecycle";
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

export const D1M_R7_PHASE = D1M_R7_CANONICAL_PHASE;
export const D1M_R7_PHASE_TYPE = OWNED_R7_PHASE_TYPE;
export const D1M_R7_STATUS = "CHANGE_GOVERNANCE_IMPLEMENTED" as const;
export const D1M_R7_MATURITY_STATE = "STRUCTURAL_CAD_OR_BIM_CHANGE_STALENESS_SUPERSESSION_IMPLEMENTED" as const;
export const D1M_R7_SCOPE = D1M_R7_CANONICAL_SCOPE;
export const D1M_R7_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R7_CHANGE_STALENESS_SUPERSESSION_CLOSEOUT.md" as const;
export const D1M_R7_PARENT_ARCHITECTURE_PATH = "docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md" as const;
export const D1M_R7_R1_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md" as const;
export const D1M_R7_R2_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md" as const;
export const D1M_R7_R3_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R3_GEOMETRY_SEMANTIC_EVIDENCE_CLOSEOUT.md" as const;
export const D1M_R7_R4_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R4_UNIT_COORDINATE_AXIS_REFERENCE_CLOSEOUT.md" as const;
export const D1M_R7_R5_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R5_MODEL_RELATIONSHIP_EVIDENCE_CLOSEOUT.md" as const;
export const D1M_R7_R6_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R6_FILE_API_ADAPTER_BOUNDARY_CLOSEOUT.md" as const;
export const D1M_R7_RECORD_CLASSES = [
  "R1_ARTIFACT",
  "R2_MAPPING",
  "R3_GEOMETRY",
  "R3_SEMANTIC",
  "R4_UNIT",
  "R4_COORDINATE",
  "R4_AXIS",
  "R5_RELATIONSHIP",
  "R6_ADAPTER_VERSION",
  "R6_CONTRACT",
  "R6_CAPABILITY",
  "R6_SUBMISSION",
] as const;
export const D1M_R7_CHANGE_CLASSES = [
  "ARTIFACT_REVISION",
  "CONTENT_FINGERPRINT",
  "MAPPING",
  "GEOMETRY_EVIDENCE",
  "SEMANTIC_EVIDENCE",
  "UNIT_REFERENCE",
  "COORDINATE_REFERENCE",
  "AXIS_REFERENCE",
  "RELATIONSHIP",
  "ADAPTER_VERSION",
  "CONTRACT_VERSION",
  "CAPABILITY_DECLARATION",
] as const;
export const D1M_R7_CURRENTNESS_STATES = ["CURRENT", "STALE", "SUPERSEDED"] as const;
export const D1M_R7_D1K_HANDOFF_VOCABULARY_REUSED = (D1K_HANDOFF_STATES as readonly string[]).includes("SUPERSEDED") && (D1K_HANDOFF_STATES as readonly string[]).includes("STALE_DEPENDENCY");
export const D1M_R7_D1L_CURRENTNESS_REUSED = D1L_R5_CURRENTNESS_RUNTIME_COUNT === 1;
export const D1M_R7_ARCHITECTURE_READY = true as const;
export const D1M_R7_SOURCE_REFERENCE_RUNTIME_READY = true as const;
export const D1M_R7_MODEL_EVIDENCE_RUNTIME_READY = true as const;
export const D1M_R7_ADAPTER_BOUNDARY_RUNTIME_READY = true as const;
export const D1M_R7_FORMAT_ADAPTER_RUNTIME_READY = false as const;
export const D1M_R7_STRUCTURAL_INTERPRETATION_RUNTIME_READY = false as const;
export const D1M_R7_CHANGE_GOVERNANCE_RUNTIME_READY = true as const;
export const D1M_R7_CHANGE_EVENT_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R7_CHANGE_EVENT_RUNTIME_COUNT = 1 as const;
export const D1M_R7_CURRENTNESS_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R7_CURRENTNESS_RUNTIME_COUNT = 1 as const;
export const D1M_R7_STALENESS_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R7_STALENESS_RUNTIME_COUNT = 1 as const;
export const D1M_R7_SUPERSESSION_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R7_SUPERSESSION_RUNTIME_COUNT = 1 as const;
export const D1M_R7_BOUNDED_PROPAGATION_IMPLEMENTED = true as const;
export const D1M_R7_BOUNDED_PROPAGATION_RUNTIME_COUNT = 1 as const;
export const D1M_R7_R1_CHANGE_GOVERNANCE_IMPLEMENTED = true as const;
export const D1M_R7_R2_CHANGE_GOVERNANCE_IMPLEMENTED = true as const;
export const D1M_R7_R3_GEOMETRY_CHANGE_GOVERNANCE_IMPLEMENTED = true as const;
export const D1M_R7_R3_SEMANTIC_CHANGE_GOVERNANCE_IMPLEMENTED = true as const;
export const D1M_R7_R4_CHANGE_GOVERNANCE_IMPLEMENTED = true as const;
export const D1M_R7_R5_CHANGE_GOVERNANCE_IMPLEMENTED = true as const;
export const D1M_R7_R6_CHANGE_GOVERNANCE_IMPLEMENTED = true as const;
export const D1M_R7_CHANGE_EQUALS_ENGINEERING_IMPACT = false as const;
export const D1M_R7_CONTENT_FINGERPRINT_EQUALS_ENGINEERING_IMPACT = false as const;
export const D1M_R7_FINGERPRINT_EQUALS_ENGINEERING_IMPACT = false as const;
export const D1M_R7_STALE_EQUALS_ENGINEERING_INCORRECT = false as const;
export const D1M_R7_STALE_EQUALS_INVALID = false as const;
export const D1M_R7_STALE_EQUALS_CERTIFICATION_REVOKED = false as const;
export const D1M_R7_SUPERSEDED_EQUALS_DELETED = false as const;
export const D1M_R7_CURRENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R7_CURRENT_EQUALS_STRUCTURALLY_ADEQUATE = false as const;
export const D1M_R7_REEVALUATED_EQUALS_ENGINEERING_REVALIDATED = false as const;
export const D1M_R7_REEVALUATED_EQUALS_RECERTIFIED = false as const;
export const D1M_R7_REEVALUATION_REQUIRED_EQUALS_ENGINEERING_INVALID = false as const;
export const D1M_R7_CURRENT_EQUALS_LATEST_EXTERNAL_SOURCE = false as const;
export const D1M_R7_STALENESS_CAUSE_TRACEABLE = true as const;
export const D1M_R7_INFERRED_DEPENDENCY_PROPAGATION_ALLOWED = false as const;
export const D1M_R7_CHANGE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1M_R7_SUPERSESSION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1M_R7_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1M_R7_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1M_R7_HISTORICAL_MUTATION_ALLOWED = false as const;
export const D1M_R7_HISTORICAL_RECONSTRUCTION_SUPPORTED = true as const;
export const D1M_R7_STALE_RECORD_AUTO_DELETED = false as const;
export const D1M_R7_SUPERSEDED_RECORD_AUTO_DELETED = false as const;
export const D1M_R7_R1_SILENTLY_REPOINTED = false as const;
export const D1M_R7_SUPERSEDED_RECORD_MUTATED = false as const;
export const D1M_R7_SUPERSEDED_RECORD_DELETED = false as const;
export const D1M_R7_SUPERSESSION_AUTHORITY_PRESERVED = true as const;
export const D1M_R7_LIFECYCLE_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1M_R7_LIFECYCLE_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1M_R7_ADMIN_EQUALS_LIFECYCLE_ENGINEERING_AUTHORITY = false as const;
export const D1M_R7_AI_CAN_INVENT_CHANGE = false as const;
export const D1M_R7_AI_CAN_SUPPRESS_STALENESS = false as const;
export const D1M_R7_AI_CAN_MARK_STALE_CURRENT = false as const;
export const D1M_R7_AI_CAN_DETERMINE_ENGINEERING_IMPACT = false as const;
export const D1M_R7_AI_CAN_REVALIDATE = false as const;
export const D1M_R7_AI_CAN_RECERTIFY = false as const;
export const D1M_R7_AI_CAN_REWRITE_HISTORY = false as const;
export const D1M_R7_ADMIN_CAN_ARBITRARILY_SUPERSEDE = false as const;
export const D1M_R7_ADMIN_CAN_CLEAR_STALENESS = false as const;
export const D1M_R7_ADMIN_CAN_REWRITE_HISTORY = false as const;
export const D1M_R7_ADMIN_CAN_BYPASS_CURRENTNESS = false as const;
export const D1M_R7_CAN_BYPASS_ORIGINAL_GOVERNANCE = false as const;
export const D1M_R7_SCOPE_ENFORCED = true as const;
export const D1M_R7_CROSS_WORKSPACE_PROPAGATION_ALLOWED = false as const;
export const D1M_R7_CROSS_PROJECT_PROPAGATION_ALLOWED = false as const;
export const D1M_R7_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1M_R7_AUTOMATIC_REVALIDATION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_AUTOMATIC_REINTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_AUTOMATIC_RECERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_ENGINEERING_IMPACT_RUNTIME_COUNT = 0 as const;
export const D1M_R7_GENERIC_GRAPH_ENGINE_RUNTIME_COUNT = 0 as const;
export const D1M_R7_GLOBAL_DEPENDENCY_REASONING_RUNTIME_COUNT = 0 as const;
export const D1M_R7_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_EXTERNAL_POLLING_RUNTIME_COUNT = 0 as const;
export const D1M_R7_VENDOR_MONITORING_RUNTIME_COUNT = 0 as const;
export const D1M_R7_PARSE_RUNTIME_COUNT = 0 as const;
export const D1M_R7_OBJECT_EXTRACTION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_GENERIC_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_FORMAT_ADAPTER_RUNTIME_COUNT = 0 as const;
export const D1M_R7_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1M_R7_VENDOR_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1M_R7_URL_FETCH_RUNTIME_COUNT = 0 as const;
export const D1M_R7_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_AXIS_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R7_AXIS_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_GEOMETRY_RELATIONSHIP_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R7_SEMANTIC_RELATIONSHIP_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R7_TOPOLOGY_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R7_TRANSITIVE_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R7_CONNECTIVITY_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R7_CONNECTIVITY_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_LOAD_PATH_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R7_LOAD_PATH_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_CLASH_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_COORDINATION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_MODEL_CORRECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R7_CAD_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R7_BIM_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R7_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1M_R7_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1M_R7_D1K_GOVERNANCE_REUSED = true as const;
export const D1M_R7_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1M_R7_D1K_INTERNAL_INTEGRATION_READY = D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY;
export const D1M_R7_D1K_INTELLIGENCE_READY = D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY;
export const D1M_R7_D1L_TRACK_COMPLETE = D1L_R6_TRACK_COMPLETE;
export const D1M_R7_D1L_TRACK_STATUS = D1L_R6_TRACK_STATUS;
export const D1M_R7_STALENESS_EQUALS_D1L_CERTIFICATION_REVOKED = false as const;
export const D1M_R7_CURRENTNESS_EQUALS_D1L_CERTIFICATION_ELIGIBLE = false as const;
export const D1M_R7_D1N_CURRENT_STATUS = "NOT_ABSORBED" as const;
export const D1M_R7_D1N_ABSORBED = false as const;
export const D1M_R7_D1N_RUNTIME_STARTED = false as const;
export const D1M_R7_D1N_RUNTIME_COUNT = 0 as const;
export const D1M_R7_D9_ABSORBED = false as const;
export const D1M_R7_D9_RUNTIME_STARTED = false as const;
export const D1M_R7_D9_RUNTIME_COUNT = 0 as const;
export const D1M_R7_D2_D8_RUNTIME_STARTED = false as const;
export const D1M_R7_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1M_R7_RUNTIME_STARTED = true as const;
export const D1M_R7_RUNTIME_COUNT = 7 as const;
export const D1M_R7_DATABASE_SCHEMA_CHANGED = false as const;
export const D1M_R7_NEW_DEPENDENCY_ADDED = false as const;
export const D1M_R7_STRUCTURAL_PACK_COMPLETE = D1_STRUCTURAL_PACK_COMPLETE;
export const D1M_R7_D1G_BLOCKER_PRESERVED = D1G_LIVE_VALIDATED === false && D1G_ENGINEER_VALIDATED === false && D1G_CONFORMANCE_VALIDATED === false && D1G_CERTIFIED_SOLVER_STATUS === "NOT_CERTIFIED";
export const D1M_R7_POST_D1J_DEBT_PRESERVED = POST_D1J_STRUCTURAL_DEBT_LEDGER;
export const D1M_R7_D1K_LIMITATIONS_PRESERVED = D1M_R7_D1K_INTERNAL_INTEGRATION_READY === false && D1M_R7_D1K_INTELLIGENCE_READY === false;
export const D1M_R7_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1M_R7_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1M_R8_CANONICAL_PHASE = "EOS-D1M-R8-D1K-D1L-D1N-EVIDENCE-HANDOFF" as const;
export const D1M_R8_PHASE_TYPE = "CAD_OR_BIM_D1K_D1L_D1N_EVIDENCE_HANDOFF" as const;
export const D1M_R8_CANONICAL_SCOPE =
  "Hand current D1M evidence to D1K interface governance, D1L certification evidence governance, and future D1N orchestration. Do not make D1K intelligence ready, certify through D1M, start D1N orchestration, start D9, create multidisciplinary reasoning, bypass currentness, or treat stale evidence as current handoff evidence." as const;

const CHANGE_TO_CLASS: Record<(typeof D1M_R7_CHANGE_CLASSES)[number], (typeof D1M_R7_RECORD_CLASSES)[number]> = {
  ARTIFACT_REVISION: "R1_ARTIFACT",
  CONTENT_FINGERPRINT: "R1_ARTIFACT",
  MAPPING: "R2_MAPPING",
  GEOMETRY_EVIDENCE: "R3_GEOMETRY",
  SEMANTIC_EVIDENCE: "R3_SEMANTIC",
  UNIT_REFERENCE: "R4_UNIT",
  COORDINATE_REFERENCE: "R4_COORDINATE",
  AXIS_REFERENCE: "R4_AXIS",
  RELATIONSHIP: "R5_RELATIONSHIP",
  ADAPTER_VERSION: "R6_ADAPTER_VERSION",
  CONTRACT_VERSION: "R6_CONTRACT",
  CAPABILITY_DECLARATION: "R6_CAPABILITY",
};
const RECORDER = "INTERFACE_RECORD_AUTHORITY";

export type D1mR7Actor = { actorId: string; tenantId: string; workspaceId: string; projectId: string; authority: string };
export type D1mR7RecordClass = (typeof D1M_R7_RECORD_CLASSES)[number];
export type D1mR7ChangeClass = (typeof D1M_R7_CHANGE_CLASSES)[number];
export type D1mR7Currentness = (typeof D1M_R7_CURRENTNESS_STATES)[number];
export type D1mR7Snapshot = Record<string, string | null>;
export type D1mR7Dependency = { subjectId: string; fingerprint: string };
export type D1mR7Cause = { changeEventId: string; dependencySubjectId: string; priorFingerprint: string; newFingerprint: string };
export type D1mR7Subject = {
  subjectId: string;
  recordClass: D1mR7RecordClass;
  recordId: string;
  fingerprint: string;
  contentFingerprint: string | null;
  dependsOn: D1mR7Dependency[];
  currentness: D1mR7Currentness;
  reevaluationRequired: boolean;
  engineeringValidated: false;
  structurallyAdequate: false;
  engineeringIncorrect: false;
  invalid: false;
  certificationRevoked: false;
  deleted: false;
  engineeringImpactDetermined: false;
  predecessorSubjectId: string | null;
  successorSubjectId: string | null;
  staleCause: D1mR7Cause | null;
  provenanceRef: string;
  snapshot: D1mR7Snapshot;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};
export type D1mR7ChangeEvent = {
  changeEventId: string;
  recordClass: D1mR7RecordClass;
  changeClass: D1mR7ChangeClass;
  priorSubjectId: string;
  priorRecordId: string;
  priorFingerprint: string;
  priorContentFingerprint: string | null;
  newSubjectId: string;
  newRecordId: string;
  newFingerprint: string;
  newContentFingerprint: string | null;
  actorId: string;
  authority: string;
  provenanceRef: string;
  reason: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  changeFingerprint: string;
  supersessionFingerprint: string;
  engineeringImpactDetermined: false;
};
export type D1mR7History = { historyId: string; subjectId: string; action: "CREATED" | "SUPERSEDED" | "STALE_RECORDED"; fingerprint: string; recordedAt: string };
export type D1mR7Store = { now: () => string; subjects: D1mR7Subject[]; events: D1mR7ChangeEvent[]; history: D1mR7History[] };
export type D1mR7RegisterInput = {
  subjectId: string;
  recordClass: string;
  recordId: string;
  fingerprint: string;
  contentFingerprint?: string | null;
  dependsOn?: D1mR7Dependency[];
  provenanceRef: string;
  snapshot?: D1mR7Snapshot;
};
export type D1mR7ChangeInput = {
  changeEventId: string;
  priorSubjectId: string;
  priorFingerprint: string;
  newSubjectId: string;
  newRecordId: string;
  newFingerprint: string;
  newContentFingerprint?: string | null;
  changeClass: string;
  provenanceRef: string;
  reason: string;
  snapshot?: D1mR7Snapshot;
  dependsOn?: D1mR7Dependency[];
  bypassOriginalGovernance?: boolean;
  engineeringImpact?: boolean;
  reactivate?: boolean;
};

function fail(code: string): never {
  throw new Error(code);
}
function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}
function assertLifecycle(actor: D1mR7Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_LIFECYCLE_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_LIFECYCLE_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("LIFECYCLE_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("LIFECYCLE_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== RECORDER) fail("UNAUTHORIZED");
}
function sameScope(actor: D1mR7Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (row.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}
function remember(store: D1mR7Store, subjectId: string, action: D1mR7History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectId, action, fingerprint, recordedAt: store.now() });
}
function copySnapshot(value: D1mR7Snapshot | undefined): D1mR7Snapshot {
  return Object.freeze({ ...(value ?? {}) });
}
function requireDependency(store: D1mR7Store, actor: D1mR7Actor, link: D1mR7Dependency): D1mR7Subject {
  const dependency = store.subjects.find((row) => row.subjectId === link.subjectId);
  if (!dependency) fail("INFERRED_DEPENDENCY_REJECTED");
  sameScope(actor, dependency);
  if (dependency.fingerprint !== link.fingerprint) fail("FINGERPRINT_MISMATCH");
  return dependency;
}
function propagate(store: D1mR7Store, originId: string, event: D1mR7ChangeEvent): void {
  const pending = [originId];
  const seen = new Set<string>([event.newSubjectId]);
  while (pending.length > 0) {
    const dependencySubjectId = pending.shift();
    if (!dependencySubjectId || seen.has(dependencySubjectId)) continue;
    seen.add(dependencySubjectId);
    for (const subject of store.subjects) {
      if (subject.subjectId === event.newSubjectId || subject.currentness !== "CURRENT") continue;
      if (!subject.dependsOn.some((link) => link.subjectId === dependencySubjectId)) continue;
      subject.currentness = "STALE";
      subject.reevaluationRequired = true;
      subject.staleCause = {
        changeEventId: event.changeEventId,
        dependencySubjectId,
        priorFingerprint: event.priorFingerprint,
        newFingerprint: event.newFingerprint,
      };
      remember(store, subject.subjectId, "STALE_RECORDED", subject.fingerprint);
      pending.push(subject.subjectId);
    }
  }
}

export function createD1mR7Store(now: () => string): D1mR7Store {
  return { now, subjects: [], events: [], history: [] };
}

export function registerGovernedRecord(store: D1mR7Store, actor: D1mR7Actor, input: D1mR7RegisterInput): D1mR7Subject {
  assertLifecycle(actor);
  if (!(D1M_R7_RECORD_CLASSES as readonly string[]).includes(input.recordClass)) fail("RECORD_CLASS_UNSUPPORTED");
  if (!input.subjectId.trim() || !input.recordId.trim() || !input.fingerprint.trim()) fail("RECORD_IDENTITY_REQUIRED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_CHANGE_PROVENANCE");
  if (input.dependsOn?.some((link) => link.subjectId === input.subjectId)) fail("SELF_DEPENDENCY_REJECTED");
  for (const link of input.dependsOn ?? []) requireDependency(store, actor, link);
  const existing = store.subjects.find((row) => row.subjectId === input.subjectId);
  if (existing) {
    if (existing.fingerprint === input.fingerprint && existing.recordClass === input.recordClass && existing.recordId === input.recordId) return existing;
    fail("RECORD_ALREADY_RECORDED");
  }
  const subject: D1mR7Subject = {
    subjectId: input.subjectId,
    recordClass: input.recordClass as D1mR7RecordClass,
    recordId: input.recordId,
    fingerprint: input.fingerprint,
    contentFingerprint: input.contentFingerprint ?? null,
    dependsOn: (input.dependsOn ?? []).map((link) => ({ subjectId: link.subjectId, fingerprint: link.fingerprint })),
    currentness: "CURRENT",
    reevaluationRequired: false,
    engineeringValidated: false,
    structurallyAdequate: false,
    engineeringIncorrect: false,
    invalid: false,
    certificationRevoked: false,
    deleted: false,
    engineeringImpactDetermined: false,
    predecessorSubjectId: null,
    successorSubjectId: null,
    staleCause: null,
    provenanceRef: input.provenanceRef,
    snapshot: copySnapshot({ ...input.snapshot, recordId: input.recordId, fingerprint: input.fingerprint, provenanceRef: input.provenanceRef }),
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  };
  store.subjects.push(subject);
  remember(store, subject.subjectId, "CREATED", subject.fingerprint);
  return subject;
}

export function registerChange(store: D1mR7Store, actor: D1mR7Actor, input: D1mR7ChangeInput): D1mR7ChangeEvent {
  assertLifecycle(actor);
  if (input.bypassOriginalGovernance === true) fail("R7_GOVERNANCE_BYPASS_REJECTED");
  if (input.engineeringImpact === true) fail("ENGINEERING_IMPACT_NOT_IN_R7");
  if (input.reactivate === true) fail("STALE_REACTIVATION_REJECTED");
  if (!(D1M_R7_CHANGE_CLASSES as readonly string[]).includes(input.changeClass)) fail("CHANGE_CLASS_UNSUPPORTED");
  if (!input.provenanceRef.trim() || !input.reason.trim() || blockedParty(input.provenanceRef) || blockedParty(input.reason)) fail("MISSING_CHANGE_PROVENANCE");
  if (!input.newSubjectId.trim() || !input.newRecordId.trim() || !input.newFingerprint.trim() || !input.priorFingerprint.trim()) fail("RECORD_IDENTITY_REQUIRED");
  const prior = store.subjects.find((row) => row.subjectId === input.priorSubjectId);
  if (!prior) fail("PRIOR_RECORD_REQUIRED");
  sameScope(actor, prior);
  if (prior.fingerprint !== input.priorFingerprint) fail("FINGERPRINT_MISMATCH");
  const changeClass = input.changeClass as D1mR7ChangeClass;
  if (CHANGE_TO_CLASS[changeClass] !== prior.recordClass) fail("RECORD_CLASS_MISMATCH");
  if (input.newSubjectId === prior.subjectId || input.newFingerprint === prior.fingerprint) fail("SELF_SUPERSESSION_REJECTED");
  for (const link of input.dependsOn ?? []) requireDependency(store, actor, link);
  const supersessionFingerprint = fingerprintCanonical({
    priorSubjectId: prior.subjectId,
    priorFingerprint: prior.fingerprint,
    newSubjectId: input.newSubjectId,
    newFingerprint: input.newFingerprint,
    recordClass: prior.recordClass,
  });
  const changeFingerprint = fingerprintCanonical({
    changeEventId: input.changeEventId,
    changeClass,
    supersessionFingerprint,
    provenanceRef: input.provenanceRef,
    reason: input.reason,
    actorId: actor.actorId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  const existing = store.events.find((row) => row.changeEventId === input.changeEventId);
  if (existing) {
    if (existing.changeFingerprint === changeFingerprint) return existing;
    fail("CHANGE_ALREADY_RECORDED");
  }
  if (prior.currentness === "SUPERSEDED") fail("PREDECESSOR_NOT_CURRENT");
  const successor = registerGovernedRecord(store, actor, {
    subjectId: input.newSubjectId,
    recordClass: prior.recordClass,
    recordId: input.newRecordId,
    fingerprint: input.newFingerprint,
    contentFingerprint: input.newContentFingerprint ?? null,
    dependsOn: input.dependsOn,
    provenanceRef: input.provenanceRef,
    snapshot: input.snapshot,
  });
  successor.predecessorSubjectId = prior.subjectId;
  const event: D1mR7ChangeEvent = {
    changeEventId: input.changeEventId,
    recordClass: prior.recordClass,
    changeClass,
    priorSubjectId: prior.subjectId,
    priorRecordId: prior.recordId,
    priorFingerprint: prior.fingerprint,
    priorContentFingerprint: prior.contentFingerprint,
    newSubjectId: successor.subjectId,
    newRecordId: successor.recordId,
    newFingerprint: successor.fingerprint,
    newContentFingerprint: successor.contentFingerprint,
    actorId: actor.actorId,
    authority: actor.authority,
    provenanceRef: input.provenanceRef,
    reason: input.reason,
    recordedAt: store.now(),
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    changeFingerprint,
    supersessionFingerprint,
    engineeringImpactDetermined: false,
  };
  prior.currentness = "SUPERSEDED";
  prior.successorSubjectId = successor.subjectId;
  remember(store, prior.subjectId, "SUPERSEDED", prior.fingerprint);
  store.events.push(event);
  propagate(store, prior.subjectId, event);
  return event;
}

export function reconstructGovernedRecord(store: D1mR7Store, subjectId: string): D1mR7Snapshot & { subjectId: string; recordClass: D1mR7RecordClass; currentness: D1mR7Currentness } {
  const subject = store.subjects.find((row) => row.subjectId === subjectId);
  if (!subject || subject.deleted) fail("RECORD_NOT_FOUND");
  return { ...subject.snapshot, subjectId: subject.subjectId, recordClass: subject.recordClass, currentness: subject.currentness };
}

export function mutateHistoricalRecord(): never { return fail("HISTORICAL_MUTATION_REJECTED"); }
export function deleteStaleRecord(): never { return fail("STALE_RECORD_DELETION_REJECTED"); }
export function deleteSupersededRecord(): never { return fail("SUPERSEDED_RECORD_DELETION_REJECTED"); }
export function repointArtifactRevision(): never { return fail("SILENT_R1_REPOINTING_REJECTED"); }
export function repointMapping(): never { return fail("MAPPING_AUTO_REPOINT_REJECTED"); }
export function upgradeEvidence(): never { return fail("EVIDENCE_AUTO_UPGRADE_REJECTED"); }
export function upgradeRelationship(): never { return fail("RELATIONSHIP_AUTO_UPGRADE_REJECTED"); }
export function upgradeAdapterContract(): never { return fail("ADAPTER_CONTRACT_AUTO_UPGRADE_REJECTED"); }
export function clearStaleness(): never { return fail("STALE_REACTIVATION_REJECTED"); }
export function rewriteSupersessionHistory(): never { return fail("SUPERSESSION_HISTORY_REWRITE_REJECTED"); }
export function reactivateStaleRecord(): never { return fail("STALE_REACTIVATION_REJECTED"); }
export function determineEngineeringImpact(): never { return fail("ENGINEERING_IMPACT_NOT_IN_R7"); }
export function revalidateEngineering(): never { return fail("ENGINEERING_REVALIDATION_NOT_IN_R7"); }
export function reinterpretStructure(): never { return fail("STRUCTURAL_REINTERPRETATION_NOT_IN_R7"); }
export function recertifyEvidence(): never { return fail("RECERTIFICATION_NOT_IN_R7"); }
export function pollExternalChanges(): never { return fail("EXTERNAL_CHANGE_POLLING_NOT_IN_R7"); }
export function monitorVendorChanges(): never { return fail("VENDOR_CHANGE_MONITORING_NOT_IN_R7"); }
export function parseCadBimArtifact(): never { return fail("PARSE_NOT_IN_R7"); }
export function extractCadBimObjects(): never { return fail("OBJECT_EXTRACTION_NOT_IN_R7"); }
export function ingestCadBimFile(): never { return fail("FILE_INGESTION_NOT_IN_R7"); }
export function adaptCadBimFormat(): never { return fail("FORMAT_ADAPTER_NOT_IN_R7"); }
export function connectCadBimVendor(): never { return fail("VENDOR_CONNECTOR_NOT_IN_R7"); }
export function fetchExternalUrl(): never { return fail("ARBITRARY_URL_FETCH_REJECTED"); }
export function convertUnits(): never { return fail("UNIT_CONVERSION_NOT_IN_R7"); }
export function transformCoordinates(): never { return fail("COORDINATE_TRANSFORMATION_NOT_IN_R7"); }
export function inferAxis(): never { return fail("AXIS_INFERENCE_NOT_IN_R7"); }
export function transformAxis(): never { return fail("AXIS_TRANSFORMATION_NOT_IN_R7"); }
export function transformGeometry(): never { return fail("GEOMETRY_TRANSFORMATION_NOT_IN_R7"); }
export function inferRelationship(): never { return fail("RELATIONSHIP_INFERENCE_NOT_IN_R7"); }
export function inferTopology(): never { return fail("TOPOLOGY_INFERENCE_NOT_IN_R7"); }
export function inferConnectivity(): never { return fail("CONNECTIVITY_INFERENCE_NOT_IN_R7"); }
export function validateConnectivity(): never { return fail("CONNECTIVITY_VALIDATION_NOT_IN_R7"); }
export function inferLoadPath(): never { return fail("LOAD_PATH_INFERENCE_NOT_IN_R7"); }
export function validateLoadPath(): never { return fail("LOAD_PATH_VALIDATION_NOT_IN_R7"); }
export function detectClash(): never { return fail("CLASH_DETECTION_NOT_IN_R7"); }
export function coordinateMultidisciplinaryBim(): never { return fail("MULTIDISCIPLINARY_COORDINATION_NOT_IN_R7"); }
export function reasonGlobalDependency(): never { return fail("GLOBAL_DEPENDENCY_REASONING_NOT_IN_R7"); }
export function detectGlobalCycle(): never { return fail("GLOBAL_CYCLE_DETECTION_NOT_IN_R7"); }
export function interpretEngineeringProperties(): never { return fail("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R7"); }
export function correctCadBimModel(): never { return fail("MODEL_CORRECTION_NOT_IN_R7"); }
export function authorCadModel(): never { return fail("CAD_AUTHORING_NOT_IN_R7"); }
export function authorBimModel(): never { return fail("BIM_AUTHORING_NOT_IN_R7"); }
