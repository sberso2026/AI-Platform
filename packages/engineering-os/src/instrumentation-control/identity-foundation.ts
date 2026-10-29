/**
 * EOS-D8-R1 Instrumentation and Control identity and object foundation.
 * One bounded runtime. Identity and exact revision only.
 */
import {
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  D2_REOPENED,
  D3_REOPENED,
  D4_REOPENED,
  D5_REOPENED,
  D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT,
  D6_PROCESS_REQUIREMENT_EQUALS_D8_IAC_DESIGN,
  D6_REOPENED,
  D7_POWER_INTERFACE_EQUALS_D8_IAC_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION,
  D7_REOPENED,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_ARCHITECTURE_DEFINED,
  D8_ARCHITECTURE_READY,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_CURRENTNESS_STATES,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_IAC_OBJECT_TYPES,
  D8_IMPLEMENTATION_PHASE_TYPES,
  D8_IMPLEMENTATION_PHASES,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_MATURITY_STATES,
  D8_MEASUREMENT_CONTEXT_RUNTIME_COUNT,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  IAC_OBJECT_IDENTITY_EQUALS_APPROVAL,
  IAC_OBJECT_IDENTITY_EQUALS_CERTIFICATION,
  IAC_OBJECT_IDENTITY_EQUALS_CODE_CONFORMANCE,
  IAC_OBJECT_IDENTITY_EQUALS_ENGINEERING_VALIDATED,
  IAC_OBJECT_IDENTITY_EQUALS_VALIDATED_IAC_DESIGN,
  INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION,
  MEASUREMENT_POINT_CONTEXT_EQUALS_INSTRUMENT_SELECTION,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
} from "@rtb/types";
import { D2_TRACK_COMPLETE } from "../civil/civil-bounded-closeout";
import { D7_STATUS, D7_TRACK_COMPLETE } from "../electrical/electrical-bounded-closeout";
import { D3_TRACK_COMPLETE } from "../geotechnical/geotechnical-bounded-closeout";
import { D4_TRACK_COMPLETE } from "../mechanical/mechanical-bounded-closeout";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D5_TRACK_COMPLETE } from "../piping/piping-bounded-closeout";
import { D6_STATUS, D6_TRACK_COMPLETE } from "../process/process-bounded-closeout";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";

export const D8_R1_STATUS = "INSTRUMENTATION_CONTROL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED" as const;
export const D8_R1_MATURITY = D8_R1_STATUS;
export const D8_R1_MATURITY_STATE = D8_R1_STATUS;
export const D8_R1_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D8_R1_INSTRUMENTATION_CONTROL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md" as const;
export const D8_0_ARCHITECTURE_REUSED = D8_ARCHITECTURE_DEFINED && D8_ARCHITECTURE_READY;
export const D8_RUNTIME_STARTED = true as const;
export const D8_RUNTIME_COUNT = 1 as const;
export const D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_IMPLEMENTED = true as const;
export const D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT = 1 as const;
export const D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY = true as const;
export const D8_CANONICAL_OBJECT_TAXONOMY_REUSED = true as const;
export const D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED = true as const;
export const D8_IAC_OBJECT_IDENTITY_IMPLEMENTED = true as const;
export const D8_EXACT_OBJECT_REVISION_IDENTITY_REQUIRED = true as const;
export const D8_FLOATING_OBJECT_REVISION_ALLOWED = false as const;
export const D8_R1_IDENTITY_AUTO_CREATES_PROCESS_MEASUREMENT_CONTEXT = false as const;
export const D8_R1_IDENTITY_AUTO_CREATES_INSTRUMENT_DEVICE_CONTEXT = false as const;
export const D8_R1_IDENTITY_AUTO_CREATES_SIGNAL_IO_CONTEXT = false as const;
export const D8_R1_IDENTITY_AUTO_CREATES_CONTROL_LOOP_CONTEXT = false as const;
export const D8_R1_IDENTITY_AUTO_CREATES_CONTROL_SYSTEM_CONTEXT = false as const;
export const D8_R1_IDENTITY_AUTO_CREATES_SAFETY_INTERLOCK_SHUTDOWN_CONTEXT = false as const;
export const D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT = D8_MEASUREMENT_CONTEXT_RUNTIME_COUNT;
export const D8_R1_LIFECYCLE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_IDENTITY_LIFECYCLE_STATE_EQUALS_VALIDATED = false as const;
export const D8_R1_MATURITY_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_R1_AUTO_ADVANCES_MATURITY = false as const;
export const D8_IDENTITY_MATURITY_EQUALS_VALIDATED = false as const;
export const D8_IDENTITY_MATURITY_EQUALS_APPROVED = false as const;
export const D8_R1_SOURCE_BASIS_REQUIRED = true as const;
export const D8_R1_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D8_IDENTITY_AUTO_ACCEPTED = false as const;
export const D8_R1_PROVENANCE_REQUIRED = true as const;
export const D8_R1_PROVENANCE_PRESERVED = true as const;
export const D8_R1_APPLICABILITY_EXPLICIT = true as const;
export const D8_R1_LIMITATIONS_EXPLICIT = true as const;
export const D8_R1_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const TENANT_WORKSPACE_PROJECT_D8_R1_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D8_R1_ACCESS_ALLOWED = false as const;
export const D8_R1_FINGERPRINT_VERIFICATION_IMPLEMENTED = true as const;
export const D8_R1_FINGERPRINT_MISMATCH_AUTO_REPAIRED = false as const;
export const D8_R1_FINGERPRINT_MISMATCH_AUTO_REBASELINED = false as const;
export const D8_R1_HISTORY_PRESERVED = true as const;
export const D8_R1_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D8_R1_MUTATION_ALLOWED = false as const;
export const D8_R1_UNKNOWN_AUTHORITATIVE_IDENTITY_AUTO_ACCEPTED = false as const;
export const D8_R1_FREEFORM_AUTHORITATIVE_IDENTITY_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_IAC_IDENTITY = false as const;
export const AI_CAN_PROMOTE_UNKNOWN_D8_TYPE_TO_AUTHORITATIVE = false as const;
export const ADMIN_CAN_BYPASS_D8_AUTHORITATIVE_TYPE_ALLOWLIST = false as const;
export const D8_R1_PERFORMS_INSTRUMENT_SIZING = false as const;
export const D8_R1_PERFORMS_INSTRUMENT_SELECTION = false as const;
export const D8_R1_PERFORMS_SIGNAL_ENGINEERING = false as const;
export const D8_R1_PERFORMS_IO_ENGINEERING = false as const;
export const D8_R1_PERFORMS_CONTROL_LOOP_ENGINEERING = false as const;
export const D8_R1_PERFORMS_CONTROL_SYSTEM_DESIGN = false as const;
export const D8_R1_PERFORMS_ALARM_RATIONALIZATION = false as const;
export const D8_R1_PERFORMS_INTERLOCK_LOGIC_DESIGN = false as const;
export const D8_R1_PERFORMS_SHUTDOWN_LOGIC_DESIGN = false as const;
export const D8_R1_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING = false as const;
export const D8_R1_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_R1_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D8_R1_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D8_CONTEXT_AUTHORITY = "IAC_CONTEXT_AUTHORITY" as const;
export const D8_DISCIPLINE = "INSTRUMENTATION_CONTROL" as const;
export const D8_EXPLICIT_RELATIONSHIP_KINDS = ["PARENT", "OBJECT_REFERENCE"] as const;
export const D8_R1_CURRENTNESS_PARTICIPATES =
  (D8_CURRENTNESS_STATES as readonly string[]).includes("CURRENT") &&
  (D8_CURRENTNESS_STATES as readonly string[]).includes("SUPERSEDED");
export const UNAUTHORIZED_D8_R2_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_UNKNOWN_IAC_TYPE_PROMOTION = false as const;
export const UNAUTHORIZED_IAC_IDENTITY_TO_VALIDATED_DESIGN_PROMOTION = false as const;
export const UNAUTHORIZED_INSTRUMENT_SIZING = false as const;
export const UNAUTHORIZED_INSTRUMENT_SELECTION = false as const;
export const UNAUTHORIZED_SIGNAL_IO_ENGINEERING = false as const;
export const UNAUTHORIZED_CONTROL_LOOP_ENGINEERING = false as const;
export const UNAUTHORIZED_CONTROL_SYSTEM_DESIGN = false as const;
export const UNAUTHORIZED_CONTROL_LOGIC_DESIGN = false as const;
export const UNAUTHORIZED_LOOP_TUNING = false as const;
export const UNAUTHORIZED_SIL_CALCULATION = false as const;
export const UNAUTHORIZED_SIL_VERIFICATION = false as const;
export const UNAUTHORIZED_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const UNAUTHORIZED_IAC_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_D6_AUTHORITY_TRANSFER = false as const;
export const UNAUTHORIZED_D7_AUTHORITY_TRANSFER = false as const;
export const D8_R2_CANONICAL_PHASE = D8_IMPLEMENTATION_PHASES[1];
export const D8_R2_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[1];
export const D8_R2_CANONICAL_SCOPE =
  "Implement governed process measurement point and Instrumentation and Control tag context using exact R1 identities and exact upstream source revisions where explicitly governed. Support measurement purpose, process variable type, source Process requirement reference, tag identity, and explicit measurement-point relationships. Preserve source, basis, applicability, limitations, provenance, and currentness. Do not implement instrument sizing or selection, signal or I/O engineering, control-loop engineering, control-system design, alarm or interlock logic, functional-safety engineering, validation, or a D9 runtime." as const;
export const D8_R2_STARTED = false as const;
export const D8_R1_READY_FOR_NEXT_PHASE = true as const;
export const D8_R1_NEXT_PHASE = D8_R2_CANONICAL_PHASE;
export const D8_R1_NEXT_PHASE_TYPE = D8_R2_PHASE_TYPE;
export const D8_R1_CANONICAL_NEXT_PHASE = D8_R2_CANONICAL_PHASE;
export const D8_R1_CANONICAL_NEXT_PHASE_SCOPE = D8_R2_CANONICAL_SCOPE;
export const D8_R1_BLOCKER = "NONE" as const;
export const D8_R1_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D8_ARCHITECTURE_DEFINED,
  D8_ARCHITECTURE_READY,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  IAC_OBJECT_IDENTITY_EQUALS_VALIDATED_IAC_DESIGN,
  IAC_OBJECT_IDENTITY_EQUALS_ENGINEERING_VALIDATED,
  IAC_OBJECT_IDENTITY_EQUALS_CODE_CONFORMANCE,
  IAC_OBJECT_IDENTITY_EQUALS_APPROVAL,
  IAC_OBJECT_IDENTITY_EQUALS_CERTIFICATION,
  PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE,
  MEASUREMENT_POINT_CONTEXT_EQUALS_INSTRUMENT_SELECTION,
  INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_PROCESS_REQUIREMENT_EQUALS_D8_IAC_DESIGN,
  D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT,
  D7_POWER_INTERFACE_EQUALS_D8_IAC_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_TRACK_COMPLETE,
  D2_REOPENED,
  D3_TRACK_COMPLETE,
  D3_REOPENED,
  D4_TRACK_COMPLETE,
  D4_REOPENED,
  D5_TRACK_COMPLETE,
  D5_REOPENED,
  D6_TRACK_COMPLETE,
  D6_STATUS,
  D6_REOPENED,
  D7_TRACK_COMPLETE,
  D7_STATUS,
  D7_REOPENED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set([
  "matching_name",
  "matching_tag",
  "name_similarity",
  "tag_similarity",
  "document_reference",
  "document_adjacency",
  "semantic_similarity",
  "timestamp",
  "ai_inference",
  "ai_reasoning",
  "inferred",
  "same_system_name",
]);

type Prohibited = {
  processMeasurementContext?: boolean;
  instrumentDeviceContext?: boolean;
  signalIoContext?: boolean;
  controlLoopContext?: boolean;
  controlSystemContext?: boolean;
  safetyInterlockShutdownContext?: boolean;
  instrumentSizing?: boolean;
  instrumentSelection?: boolean;
  signalEngineering?: boolean;
  ioEngineering?: boolean;
  controlLoopEngineering?: boolean;
  controlSystemDesign?: boolean;
  alarmRationalization?: boolean;
  interlockLogic?: boolean;
  shutdownLogic?: boolean;
  functionalSafety?: boolean;
  requirementChange?: boolean;
  disciplineInterface?: boolean;
  reviewValidation?: boolean;
  d9Source?: boolean;
  engineeringValidated?: boolean;
  codeConformance?: boolean;
  approved?: boolean;
  certified?: boolean;
  advanceMaturity?: boolean;
  inferredRelationship?: boolean;
  automaticDesign?: boolean;
  processRequirementAdopted?: boolean;
  electricalProtectionAdopted?: boolean;
};

export type D8R1Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D8R1Relationship = {
  kind: (typeof D8_EXPLICIT_RELATIONSHIP_KINDS)[number];
  targetObjectId: string;
};

export type D8R1ContextInput = Prohibited & {
  contextId: string;
  citedLifecycleStage: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  assertedFingerprint?: string;
  predecessorContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  discipline?: string;
  currentness?: string;
};

export type D8R1ContextRecord = {
  contextId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  citedLifecycleStage: (typeof D8_MATURITY_STATES)[number];
  authority: typeof D8_CONTEXT_AUTHORITY;
  iacEngineeringAuthority: false;
  engineeringValidated: false;
  conformant: false;
  approved: false;
  certified: false;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorContextId: string | null;
};

export type D8R1ObjectInput = Prohibited & {
  objectId: string;
  contextId: string;
  objectType: string;
  citedLifecycleStage: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  displayName?: string | null;
  projectTag?: string | null;
  parentObjectId?: string | null;
  relationships?: readonly { kind: string; targetObjectId: string }[];
  assertedFingerprint?: string;
  predecessorObjectId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  currentness?: string;
};

export type D8R1ObjectRecord = {
  objectId: string;
  contextId: string;
  objectType: (typeof D8_IAC_OBJECT_TYPES)[number];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  citedLifecycleStage: (typeof D8_MATURITY_STATES)[number];
  displayName: string | null;
  projectTag: string | null;
  parentObjectId: string | null;
  relationships: readonly D8R1Relationship[];
  authority: typeof D8_CONTEXT_AUTHORITY;
  iacEngineeringAuthority: false;
  engineeringValidated: false;
  conformant: false;
  approved: false;
  certified: false;
  processMeasurementContextEstablished: false;
  instrumentDeviceContextEstablished: false;
  signalIoContextEstablished: false;
  controlLoopContextEstablished: false;
  controlSystemContextEstablished: false;
  safetyContextEstablished: false;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorObjectId: string | null;
};

export type D8R1History = {
  historyId: string;
  subjectKind: "CONTEXT" | "OBJECT";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  actorId: string;
  authority: typeof D8_CONTEXT_AUTHORITY;
  recordedAt: string;
};

export type D8R1Store = {
  now: () => string;
  contexts: D8R1ContextRecord[];
  objects: D8R1ObjectRecord[];
  history: D8R1History[];
};

function fail(code: string): never {
  throw new Error(`D8_R1_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function isStage(value: string): value is (typeof D8_MATURITY_STATES)[number] {
  return (D8_MATURITY_STATES as readonly string[]).includes(value);
}

function isObjectType(value: string): value is (typeof D8_IAC_OBJECT_TYPES)[number] {
  return (D8_IAC_OBJECT_TYPES as readonly string[]).includes(value);
}

function assertActor(actor: D8R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_IAC_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_IAC_AUTHORITY");
  if (actor.authority === "IAC_ENGINEERING_AUTHORITY" || actor.authority === "INSTRUMENTATION_CONTROL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_IAC_ENGINEERING_AUTHORITY");
  if (actor.authority !== D8_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D8R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.processMeasurementContext === true) fail("PROCESS_MEASUREMENT_NOT_IN_R1");
  if (input.instrumentDeviceContext === true || input.instrumentSizing === true || input.instrumentSelection === true) fail("INSTRUMENT_DEVICE_NOT_IN_R1");
  if (input.signalIoContext === true || input.signalEngineering === true || input.ioEngineering === true) fail("SIGNAL_IO_NOT_IN_R1");
  if (input.controlLoopContext === true || input.controlLoopEngineering === true) fail("CONTROL_LOOP_NOT_IN_R1");
  if (input.controlSystemContext === true || input.controlSystemDesign === true) fail("CONTROL_SYSTEM_NOT_IN_R1");
  if (input.safetyInterlockShutdownContext === true || input.alarmRationalization === true || input.interlockLogic === true || input.shutdownLogic === true || input.functionalSafety === true) fail("SAFETY_CONTEXT_NOT_IN_R1");
  if (input.requirementChange === true) fail("REQUIREMENT_CHANGE_NOT_IN_R1");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R1");
  if (input.reviewValidation === true) fail("REVIEW_VALIDATION_NOT_IN_R1");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R1");
  if (input.engineeringValidated === true || input.codeConformance === true || input.approved === true || input.certified === true) fail("VALIDATION_NOT_IN_R1");
  if (input.advanceMaturity === true) fail("MATURITY_PROGRESSION_NOT_IN_R1");
  if (input.inferredRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.automaticDesign === true) fail("DESIGN_NOT_IN_R1");
  if (input.processRequirementAdopted === true || input.electricalProtectionAdopted === true) fail("DISCIPLINE_AUTHORITY_NOT_TRANSFERRED");
}

function assertIdentityToken(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function assertGovernedText(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function assertBasis(input: { provenanceRef: string; sourceBasisRef: string; applicability: string; limitations: string }): {
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
} {
  const provenanceRef = input.provenanceRef.trim();
  if (!provenanceRef || blockedParty(provenanceRef)) fail("MISSING_PROVENANCE");
  return {
    provenanceRef,
    sourceBasisRef: assertGovernedText(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    applicability: assertGovernedText(input.applicability, "MISSING_APPLICABILITY"),
    limitations: assertGovernedText(input.limitations, "MISSING_LIMITATIONS"),
  };
}

function assertCreationCurrentness(currentness: string | undefined): void {
  if (currentness != null && currentness !== "CURRENT") fail("CURRENTNESS_NOT_VALIDATION");
}

function remember(store: D8R1Store, subjectKind: D8R1History["subjectKind"], subjectId: string, action: D8R1History["action"], fingerprint: string, actor: D8R1Actor): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    action,
    fingerprint,
    actorId: actor.actorId,
    authority: D8_CONTEXT_AUTHORITY,
    recordedAt: store.now(),
  });
}

export function createD8R1Store(now: () => string = () => "2026-10-25T00:00:00.000Z"): D8R1Store {
  return { now, contexts: [], objects: [], history: [] };
}

export function recordIacContext(store: D8R1Store, actor: D8R1Actor, input: D8R1ContextInput): D8R1ContextRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  assertCreationCurrentness(input.currentness);
  const contextId = assertIdentityToken(input.contextId, "CONTEXT_IDENTITY_REQUIRED");
  const basis = assertBasis(input);
  if (input.discipline != null && input.discipline !== D8_DISCIPLINE) fail("DISCIPLINE_NOT_IAC");
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const predecessor = input.predecessorContextId ? store.contexts.find((row) => row.contextId === input.predecessorContextId) : null;
  if (input.predecessorContextId) {
    if (!predecessor) fail("CONTEXT_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.workspaceId !== actor.workspaceId || predecessor.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    contextId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    citedLifecycleStage: stage,
    provenanceRef: basis.provenanceRef,
    sourceBasisRef: basis.sourceBasisRef,
    applicability: basis.applicability,
    limitations: basis.limitations,
    authority: D8_CONTEXT_AUTHORITY,
    predecessorContextId: predecessor?.contextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.contexts.find((row) => row.contextId === contextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("DUPLICATE_CONTEXT_REJECTED");
  }
  const duplicate = store.contexts.find((row) => row.recordStatus === "CURRENT" && row.contextId !== predecessor?.contextId && row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId);
  if (duplicate) fail("DUPLICATE_CONTEXT_REJECTED");
  const record: D8R1ContextRecord = Object.freeze({
    contextId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    citedLifecycleStage: stage,
    authority: D8_CONTEXT_AUTHORITY,
    iacEngineeringAuthority: false,
    engineeringValidated: false,
    conformant: false,
    approved: false,
    certified: false,
    provenanceRef: basis.provenanceRef,
    sourceBasisRef: basis.sourceBasisRef,
    applicability: basis.applicability,
    limitations: basis.limitations,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorContextId: predecessor?.contextId ?? null,
  });
  if (predecessor) {
    const keptFingerprint = predecessor.fingerprint;
    const keptId = predecessor.contextId;
    const index = store.contexts.findIndex((row) => row.contextId === predecessor.contextId);
    store.contexts[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.contexts[index].contextId !== keptId || store.contexts[index].fingerprint !== keptFingerprint) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "CONTEXT", keptId, "SUPERSEDED", keptFingerprint, actor);
  }
  store.contexts.push(record);
  remember(store, "CONTEXT", record.contextId, "CREATED", record.fingerprint, actor);
  return record;
}

function normalizeRelationships(store: D8R1Store, actor: D8R1Actor, contextId: string, parentObjectId: string | null, relationships: D8R1ObjectInput["relationships"]): D8R1Relationship[] {
  const explicit = [...(relationships ?? [])];
  if (parentObjectId) explicit.push({ kind: "PARENT", targetObjectId: parentObjectId });
  const normalized: D8R1Relationship[] = [];
  for (const link of explicit) {
    if (INFERRED.has(link.kind.trim().toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
    if (!(D8_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(link.kind)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
    const target = store.objects.find((row) => row.objectId === link.targetObjectId && row.recordStatus === "CURRENT");
    if (!target) fail("RELATIONSHIP_TARGET_NOT_FOUND");
    if (target.tenantId !== actor.tenantId || target.workspaceId !== actor.workspaceId || target.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
    if (target.contextId !== contextId) fail("RELATIONSHIP_CONTEXT_MISMATCH");
    normalized.push({ kind: link.kind as D8R1Relationship["kind"], targetObjectId: target.objectId });
  }
  normalized.sort((left, right) => `${left.kind}:${left.targetObjectId}`.localeCompare(`${right.kind}:${right.targetObjectId}`));
  return normalized;
}

export function recordIacObjectIdentity(store: D8R1Store, actor: D8R1Actor, input: D8R1ObjectInput): D8R1ObjectRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  assertCreationCurrentness(input.currentness);
  const objectId = assertIdentityToken(input.objectId, "OBJECT_IDENTITY_REQUIRED");
  const context = store.contexts.find((row) => row.contextId === input.contextId);
  if (!context) fail("CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (context.recordStatus !== "CURRENT") fail("CONTEXT_NOT_CURRENT");
  if (!isObjectType(input.objectType)) fail("OBJECT_TYPE_NOT_ALLOWLISTED");
  const basis = assertBasis(input);
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const displayName = input.displayName?.trim() ? input.displayName.trim() : null;
  const projectTag = input.projectTag?.trim() ? assertIdentityToken(input.projectTag, "PROJECT_TAG_NOT_AUTHORITATIVE") : null;
  const parentObjectId = input.parentObjectId ? assertIdentityToken(input.parentObjectId, "OBJECT_IDENTITY_REQUIRED") : null;
  const relationships = normalizeRelationships(store, actor, context.contextId, parentObjectId, input.relationships);
  const predecessor = input.predecessorObjectId ? store.objects.find((row) => row.objectId === input.predecessorObjectId) : null;
  if (input.predecessorObjectId) {
    if (!predecessor) fail("OBJECT_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.workspaceId !== actor.workspaceId || predecessor.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    if (predecessor.objectType !== input.objectType) fail("OBJECT_TYPE_SUBSTITUTION_REJECTED");
    if (predecessor.contextId !== context.contextId) fail("RELATIONSHIP_CONTEXT_MISMATCH");
  }
  const fingerprint = fingerprintCanonical({
    objectId,
    contextId: context.contextId,
    objectType: input.objectType,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    citedLifecycleStage: stage,
    displayName,
    projectTag,
    parentObjectId,
    relationships,
    provenanceRef: basis.provenanceRef,
    sourceBasisRef: basis.sourceBasisRef,
    applicability: basis.applicability,
    limitations: basis.limitations,
    authority: D8_CONTEXT_AUTHORITY,
    predecessorObjectId: predecessor?.objectId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.objects.find((row) => row.objectId === objectId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("DUPLICATE_OBJECT_REJECTED");
  }
  const signature = JSON.stringify(relationships);
  const duplicate = store.objects.find((row) => row.recordStatus === "CURRENT" && row.objectId !== predecessor?.objectId && row.contextId === context.contextId && row.objectType === input.objectType && row.provenanceRef === basis.provenanceRef && row.sourceBasisRef === basis.sourceBasisRef && row.applicability === basis.applicability && row.limitations === basis.limitations && row.parentObjectId === parentObjectId && row.projectTag === projectTag && JSON.stringify(row.relationships) === signature);
  if (duplicate) fail("DUPLICATE_OBJECT_REJECTED");
  const record: D8R1ObjectRecord = Object.freeze({
    objectId,
    contextId: context.contextId,
    objectType: input.objectType,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    citedLifecycleStage: stage,
    displayName,
    projectTag,
    parentObjectId,
    relationships: Object.freeze(relationships),
    authority: D8_CONTEXT_AUTHORITY,
    iacEngineeringAuthority: false,
    engineeringValidated: false,
    conformant: false,
    approved: false,
    certified: false,
    processMeasurementContextEstablished: false,
    instrumentDeviceContextEstablished: false,
    signalIoContextEstablished: false,
    controlLoopContextEstablished: false,
    controlSystemContextEstablished: false,
    safetyContextEstablished: false,
    provenanceRef: basis.provenanceRef,
    sourceBasisRef: basis.sourceBasisRef,
    applicability: basis.applicability,
    limitations: basis.limitations,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorObjectId: predecessor?.objectId ?? null,
  });
  if (predecessor) {
    const keptFingerprint = predecessor.fingerprint;
    const keptId = predecessor.objectId;
    const index = store.objects.findIndex((row) => row.objectId === predecessor.objectId);
    store.objects[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.objects[index].objectId !== keptId || store.objects[index].fingerprint !== keptFingerprint) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "OBJECT", keptId, "SUPERSEDED", keptFingerprint, actor);
  }
  store.objects.push(record);
  remember(store, "OBJECT", record.objectId, "CREATED", record.fingerprint, actor);
  return record;
}

export function reconstructIacObject(store: D8R1Store, objectId: string): D8R1ObjectRecord {
  const record = store.objects.find((row) => row.objectId === objectId);
  if (!record) fail("OBJECT_NOT_FOUND");
  return record;
}

export function repointIacIdentity(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function advanceIacMaturity(): never {
  return fail("MATURITY_PROGRESSION_NOT_IN_R1");
}

export function recordIacProcessMeasurement(): never {
  return fail("PROCESS_MEASUREMENT_NOT_IN_R1");
}

export function recordIacInstrumentDeviceContext(): never {
  return fail("INSTRUMENT_DEVICE_NOT_IN_R1");
}

export function recordIacSignalIoContext(): never {
  return fail("SIGNAL_IO_NOT_IN_R1");
}

export function recordIacControlLoopContext(): never {
  return fail("CONTROL_LOOP_NOT_IN_R1");
}

export function recordIacControlSystemContext(): never {
  return fail("CONTROL_SYSTEM_NOT_IN_R1");
}

export function recordIacSafetyContext(): never {
  return fail("SAFETY_CONTEXT_NOT_IN_R1");
}

export function recordIacRequirement(): never {
  return fail("REQUIREMENT_CHANGE_NOT_IN_R1");
}

export function recordIacInterface(): never {
  return fail("DISCIPLINE_INTERFACE_NOT_IN_R1");
}

export function recordIacReview(): never {
  return fail("REVIEW_VALIDATION_NOT_IN_R1");
}

export function recordIacSourceContract(): never {
  return fail("D9_SOURCE_NOT_IN_R1");
}

export function validateIacEngineering(): never {
  return fail("VALIDATION_NOT_IN_R1");
}

export function repairIacFingerprint(): never {
  return fail("FINGERPRINT_REPAIR_REJECTED");
}
