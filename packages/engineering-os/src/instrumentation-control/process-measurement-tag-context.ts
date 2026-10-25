/**
 * EOS-D8-R2 process measurement point and I&C tag context.
 * One bounded runtime on exact R1 identity revisions. Context and explicit relationships only.
 */
import {
  D8_CURRENTNESS_STATES,
  D8_D6_INTERFACE_SUBJECTS,
  D8_D6_RUNTIME_INTEGRATION_COUNT,
  D8_D7_RUNTIME_INTEGRATION_COUNT,
  D8_IAC_OBJECT_TYPES,
  MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_INSTRUMENT_DESIGN,
  D8_IMPLEMENTATION_PHASE_TYPES,
  D8_IMPLEMENTATION_PHASES,
  D8_MATURITY_STATES,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_REOPENED,
  D5_TRACK_COMPLETE,
  D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT,
  D6_PROCESS_REQUIREMENT_EQUALS_D8_IAC_DESIGN,
  D6_REOPENED,
  D6_STATUS,
  D6_TRACK_COMPLETE,
  D7_POWER_INTERFACE_EQUALS_D8_IAC_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION,
  D7_REOPENED,
  D7_STATUS,
  D7_TRACK_COMPLETE,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_CONTEXT_AUTHORITY,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_DISCIPLINE,
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
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION,
  MEASUREMENT_POINT_CONTEXT_EQUALS_INSTRUMENT_SELECTION,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  type D8R1Actor,
  type D8R1ObjectRecord,
  type D8R1Store,
} from "./identity-foundation";

export const D8_R2_STATUS = "PROCESS_MEASUREMENT_AND_TAG_CONTEXT_IMPLEMENTED" as const;
export const D8_R2_MATURITY = D8_R2_STATUS;
export const D8_R2_MATURITY_STATE = D8_R2_STATUS;
export const D8_R2_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D8_R2_PROCESS_MEASUREMENT_AND_TAG_CONTEXT_CLOSEOUT.md" as const;
export const D8_R1_IDENTITY_REUSED = D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY;
export const EXACT_D8_R1_IDENTITY_REVISION_REQUIRED = true as const;
export const FLOATING_D8_R2_IDENTITY_REFERENCE_ALLOWED = false as const;
export const D8_R2_IDENTITY_REFERENCE_AUTO_REPOINTED = false as const;
export const D8_RUNTIME_STARTED = true as const;
export const D8_RUNTIME_COUNT = 2 as const;
export const D8_R1_RUNTIME_COUNT = R1_RUNTIME_COUNT;
export const D8_PROCESS_MEASUREMENT_TAG_RUNTIME_IMPLEMENTED = true as const;
export const D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT = 1 as const;
export const D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY = true as const;
export const D8_PROCESS_MEASUREMENT_CONTEXT_IMPLEMENTED = true as const;
export const PROCESS_MEASUREMENT_CONTEXT_EQUALS_PROCESS_CALCULATION = false as const;
export const PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_DESIGN = false as const;
export const D8_MEASUREMENT_REQUIREMENT_CONTEXT_SUPPORTED = true as const;
export const MEASUREMENT_REQUIREMENT_EQUALS_INSTRUMENT_SELECTION = false as const;
export const MEASUREMENT_REQUIREMENT_AUTO_SELECTS_INSTRUMENT = false as const;
export const D8_PROCESS_VARIABLE_TYPE_CONTEXT_SUPPORTED = true as const;
export const D8_R2_PROCESS_VARIABLE_TYPES = ["PRESSURE", "TEMPERATURE", "FLOW", "LEVEL", "COMPOSITION_ANALYZER", "POSITION_STATUS"] as const;
export const D8_R2_MEASUREMENT_PURPOSES = ["PROCESS_MONITORING", "CONTROL_INPUT_REFERENCE", "ALARM_SOURCE_REFERENCE", "ACCOUNTING", "OTHER_CANONICAL_MEASUREMENT_PURPOSE"] as const;
export const D8_R2_DERIVES_PROCESS_VALUE = false as const;
export const D8_R2_ESTIMATES_PROCESS_VALUE = false as const;
export const D8_IAC_TAG_CONTEXT_IMPLEMENTED = true as const;
export const IAC_TAG_CONTEXT_EQUALS_VALIDATED_IAC_DESIGN = false as const;
export const IAC_TAG_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D8_EXPLICIT_TAG_RELATIONSHIP_REQUIRED = true as const;
export const D8_INFERRED_TAG_RELATIONSHIP_ALLOWED = false as const;
export const EXACT_D8_TAG_RELATIONSHIP_ENDPOINT_REVISION_REQUIRED = true as const;
export const D8_TAG_RELATIONSHIP_AUTO_REPOINTED = false as const;
export const D8_EXPLICIT_MEASUREMENT_OBJECT_RELATIONSHIP_REQUIRED = true as const;
export const D8_INFERRED_MEASUREMENT_OBJECT_RELATIONSHIP_ALLOWED = false as const;
export const EXACT_D8_MEASUREMENT_OBJECT_ENDPOINT_REVISION_REQUIRED = true as const;
export const MEASUREMENT_POINT_RELATIONSHIP_EQUALS_INSTRUMENT_SELECTION = false as const;
export const D8_R2_TAG_RELATIONSHIP_KINDS = ["TAG_TO_OBJECT"] as const;
export const D8_R2_MEASUREMENT_RELATIONSHIP_KINDS = ["MEASUREMENT_POINT_TO_OBJECT"] as const;
export const EXACT_D6_PROCESS_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D6_PROCESS_SOURCE_REFERENCE_ALLOWED = false as const;
export const D8_R2_D6_SOURCE_AUTO_REPOINTED = false as const;
export const D8_R2_CAN_REFERENCE_D6_PROCESS_REQUIREMENT = true as const;
export const D6_PROCESS_REQUIREMENT_EQUALS_D8_INSTRUMENT_SELECTION = false as const;
export const D8_R2_CAN_REFERENCE_D6_PROCESS_CONDITION = true as const;
export const D6_PROCESS_CONDITION_EQUALS_D8_MEASUREMENT_RESULT = false as const;
export const D6_PROCESS_CONDITION_EQUALS_VALIDATED_D8_INSTRUMENT_RANGE = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_PROCESS_VALUE = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_MEASUREMENT_REQUIREMENT = false as const;
export const D8_R2_UNITS_REQUIRED = true as const;
export const D8_R2_UNITS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D8_R2_UNITS = false as const;
export const D8_R2_PERFORMS_INSTRUMENT_SELECTION = false as const;
export const D8_R2_PERFORMS_INSTRUMENT_SIZING = false as const;
export const D8_R2_SELECTS_INSTRUMENT_RANGE = false as const;
export const D8_R2_DERIVES_INSTRUMENT_RANGE = false as const;
export const D8_R2_AUTO_CREATES_INSTRUMENT_DEVICE_CONTEXT = false as const;
export const D8_R2_PERFORMS_SIGNAL_ENGINEERING = false as const;
export const D8_R2_PERFORMS_IO_ENGINEERING = false as const;
export const D8_R2_PERFORMS_CONTROL_LOOP_ENGINEERING = false as const;
export const D8_R2_PERFORMS_CONTROL_SYSTEM_DESIGN = false as const;
export const D8_R2_PERFORMS_ALARM_RATIONALIZATION = false as const;
export const D8_R2_PERFORMS_INTERLOCK_LOGIC_DESIGN = false as const;
export const D8_R2_PERFORMS_SHUTDOWN_LOGIC_DESIGN = false as const;
export const D8_R2_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING = false as const;
export const D8_R2_SOURCE_BASIS_REQUIRED = true as const;
export const D8_R2_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D8_MEASUREMENT_CONTEXT_AUTO_ACCEPTED = false as const;
export const D8_R2_APPLICABILITY_EXPLICIT = true as const;
export const D8_R2_LIMITATIONS_EXPLICIT = true as const;
export const D8_R2_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D8_R2_PROVENANCE_REQUIRED = true as const;
export const D8_R2_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D8_R2_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D8_R2_ACCESS_ALLOWED = false as const;
export const D8_R2_HISTORY_PRESERVED = true as const;
export const D8_R2_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D8_R2_MUTATION_ALLOWED = false as const;
export const D8_R2_AUTO_MUTATES_R1_IDENTITY = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_MEASUREMENT_POINT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_TAG_RELATIONSHIP = false as const;
export const AI_CAN_PROMOTE_D8_MEASUREMENT_CONTEXT_TO_VALIDATED_DESIGN = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D8_R2_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D8_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_R2_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D8_R2_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D8_R3_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_VALUE_DERIVATION = false as const;
export const UNAUTHORIZED_INSTRUMENT_RANGE_SELECTION = false as const;
export const UNAUTHORIZED_ALARM_RATIONALIZATION = false as const;
export const UNAUTHORIZED_INTERLOCK_LOGIC_DESIGN = false as const;
export const UNAUTHORIZED_SHUTDOWN_LOGIC_DESIGN = false as const;
export const UNAUTHORIZED_FUNCTIONAL_SAFETY_ENGINEERING = false as const;
export const UNAUTHORIZED_D6_PROCESS_AUTHORITY_TRANSFER = false as const;
export const UNAUTHORIZED_D7_ELECTRICAL_AUTHORITY_TRANSFER = false as const;
export const D8_R3_CANONICAL_PHASE = D8_IMPLEMENTATION_PHASES[2];
export const D8_R3_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[2];
export const D8_R3_CANONICAL_SCOPE =
  "Implement governed instrument and device context using exact R1 identities, exact R2 measurement and tag context, and explicit upstream source revisions. Support canonical instruments and devices, supplied datasheet or vendor attributes, service context, supplied ranges and setpoints where explicitly sourced, and explicit device-to-measurement relationships. Preserve source, basis, applicability, limitations, provenance, and currentness. Do not perform instrument sizing or selection, range derivation, control-valve or actuator sizing, signal or I/O engineering, loop engineering, control-system design, alarm or interlock logic, functional-safety engineering, validation, or D9 reasoning." as const;
export const D8_R3_STARTED = false as const;
export const D8_R2_READY_FOR_NEXT_PHASE = true as const;
export const D8_R2_NEXT_PHASE = D8_R3_CANONICAL_PHASE;
export const D8_R2_NEXT_PHASE_TYPE = D8_R3_PHASE_TYPE;
export const D8_R2_CANONICAL_NEXT_PHASE = D8_R3_CANONICAL_PHASE;
export const D8_R2_CANONICAL_NEXT_PHASE_SCOPE = D8_R3_CANONICAL_SCOPE;
export const D8_R2_BLOCKER = "NONE" as const;
export const D8_R2_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE,
  MEASUREMENT_POINT_CONTEXT_EQUALS_INSTRUMENT_SELECTION,
  MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_INSTRUMENT_DESIGN,
  INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
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
  D8_D6_RUNTIME_INTEGRATION_COUNT,
  D8_D7_RUNTIME_INTEGRATION_COUNT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
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
  "tag_prefix",
  "tag_suffix",
  "naming_convention",
  "document_proximity",
  "document_adjacency",
  "drawing_position",
  "semantic_similarity",
  "matching_service",
  "ai_interpretation",
  "ai_inference",
  "inferred",
]);

type Stage = (typeof D8_MATURITY_STATES)[number];
type Currentness = (typeof D8_CURRENTNESS_STATES)[number];
type Variable = (typeof D8_R2_PROCESS_VARIABLE_TYPES)[number];
type Purpose = (typeof D8_R2_MEASUREMENT_PURPOSES)[number];

type Prohibited = {
  processValue?: boolean;
  processValueDerived?: boolean;
  processValueEstimated?: boolean;
  validatedProcessValue?: boolean;
  processCalculation?: boolean;
  instrumentSelection?: boolean;
  instrumentSizing?: boolean;
  rangeSelection?: boolean;
  rangeDerivation?: boolean;
  validatedInstrumentDesign?: boolean;
  deviceContext?: boolean;
  signalEngineering?: boolean;
  ioEngineering?: boolean;
  controlLoopEngineering?: boolean;
  controlSystemDesign?: boolean;
  alarmRationalization?: boolean;
  interlockLogic?: boolean;
  shutdownLogic?: boolean;
  functionalSafety?: boolean;
  unitChange?: boolean;
  automaticDesign?: boolean;
  engineeringValidated?: boolean;
  codeConformance?: boolean;
  approved?: boolean;
  certified?: boolean;
  requirementChange?: boolean;
  disciplineInterface?: boolean;
  reviewValidation?: boolean;
  d9Source?: boolean;
  inferredRelationship?: boolean;
  useProjectTag?: boolean;
  propagate?: boolean;
  advanceMaturity?: boolean;
  repoint?: boolean;
  mutateR1?: boolean;
  processAuthorityAdopted?: boolean;
  electricalProtectionAdopted?: boolean;
  inventRequirement?: boolean;
};

type Bound = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

type D6Fields = {
  d6SourceId?: string | null;
  d6SourceRevisionFingerprint?: string | null;
  d6Subject?: string | null;
};

type Prepared = {
  contextId: string;
  object: D8R1ObjectRecord;
  stage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
};

export type D8R2MeasurementInput = Bound & D6Fields & {
  measurementRecordId: string;
  measurementPurpose: string;
  processVariableType: string;
  locationReference: string;
  suppliedConditionValue?: string | null;
  suppliedConditionUnit?: string | null;
  predecessorMeasurementRecordId?: string | null;
  assertedFingerprint?: string;
};

export type D8R2MeasurementRecord = {
  measurementRecordId: string;
  contextId: string;
  objectId: string;
  objectType: D8R1ObjectRecord["objectType"];
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  citedLifecycleStage: Stage;
  measurementPurpose: Purpose;
  processVariableType: Variable;
  locationReference: string;
  d6SourceId: string | null;
  d6SourceRevisionFingerprint: string | null;
  d6Subject: string | null;
  suppliedConditionValue: string | null;
  suppliedConditionUnit: string | null;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D8_CONTEXT_AUTHORITY;
  iacEngineeringAuthority: false;
  engineeringValidated: false;
  conformant: false;
  approved: false;
  certified: false;
  validatedProcessValue: false;
  processCalculation: false;
  instrumentSelection: false;
  validatedInstrumentDesign: false;
  measuredResult: false;
  validatedInstrumentRange: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorMeasurementRecordId: string | null;
};

export type D8R2RequirementInput = Bound & D6Fields & {
  requirementRecordId: string;
  measurementRecordId: string;
  requirementText: string;
  predecessorRequirementRecordId?: string | null;
  assertedFingerprint?: string;
};

export type D8R2RequirementRecord = {
  requirementRecordId: string;
  measurementRecordId: string;
  measurementRevisionFingerprint: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  requirementText: string;
  d6SourceId: string;
  d6SourceRevisionFingerprint: string;
  d6Subject: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: typeof D8_CONTEXT_AUTHORITY;
  instrumentSelected: false;
  validatedInstrumentDesign: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorRequirementRecordId: string | null;
};

export type D8R2TagInput = Bound & {
  tagRecordId: string;
  tagToken: string;
  predecessorTagRecordId?: string | null;
  assertedFingerprint?: string;
};

export type D8R2TagRecord = {
  tagRecordId: string;
  tagToken: string;
  contextId: string;
  objectId: string;
  objectType: D8R1ObjectRecord["objectType"];
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: typeof D8_CONTEXT_AUTHORITY;
  validatedIacDesign: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorTagRecordId: string | null;
};

export type D8R2TagRelationshipInput = Prohibited & {
  relationshipId: string;
  tagRecordId: string;
  tagRevisionFingerprint: string;
  objectId: string;
  objectRevisionFingerprint: string;
  kind: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  predecessorRelationshipId?: string | null;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D8R2TagRelationshipRecord = {
  relationshipId: string;
  kind: (typeof D8_R2_TAG_RELATIONSHIP_KINDS)[number];
  tagRecordId: string;
  tagRevisionFingerprint: string;
  objectId: string;
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  inferred: false;
  validatedIacDesign: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorRelationshipId: string | null;
};

export type D8R2MeasurementRelationshipInput = Prohibited & {
  relationshipId: string;
  measurementRecordId: string;
  measurementRevisionFingerprint: string;
  fromObjectId: string;
  fromObjectRevisionFingerprint: string;
  toObjectId: string;
  toObjectRevisionFingerprint: string;
  kind: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  predecessorRelationshipId?: string | null;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D8R2MeasurementRelationshipRecord = {
  relationshipId: string;
  kind: (typeof D8_R2_MEASUREMENT_RELATIONSHIP_KINDS)[number];
  measurementRecordId: string;
  measurementRevisionFingerprint: string;
  fromObjectId: string;
  fromObjectRevisionFingerprint: string;
  toObjectId: string;
  toObjectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  inferred: false;
  instrumentSelection: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorRelationshipId: string | null;
};

export type D8R2History = {
  historyId: string;
  subjectKind: "MEASUREMENT" | "REQUIREMENT" | "TAG" | "TAG_RELATIONSHIP" | "MEASUREMENT_RELATIONSHIP";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D8R2Store = {
  r1: D8R1Store;
  now: () => string;
  measurements: D8R2MeasurementRecord[];
  requirements: D8R2RequirementRecord[];
  tags: D8R2TagRecord[];
  tagRelationships: D8R2TagRelationshipRecord[];
  measurementRelationships: D8R2MeasurementRelationshipRecord[];
  history: D8R2History[];
};

function fail(code: string): never {
  throw new Error(`D8_R2_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isStage(value: string): value is Stage {
  return (D8_MATURITY_STATES as readonly string[]).includes(value);
}

function isCurrentness(value: string): value is Currentness {
  return (D8_CURRENTNESS_STATES as readonly string[]).includes(value);
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
  if (input.mutateR1 === true) fail("R1_MUTATION_REJECTED");
  if (input.processValue === true || input.processValueDerived === true || input.processValueEstimated === true || input.validatedProcessValue === true || input.processCalculation === true) fail("PROCESS_VALUE_NOT_IN_R2");
  if (input.instrumentSelection === true) fail("INSTRUMENT_SELECTION_NOT_IN_R2");
  if (input.instrumentSizing === true) fail("INSTRUMENT_SIZING_NOT_IN_R2");
  if (input.rangeSelection === true || input.rangeDerivation === true) fail("INSTRUMENT_RANGE_NOT_IN_R2");
  if (input.validatedInstrumentDesign === true) fail("INSTRUMENT_DESIGN_NOT_IN_R2");
  if (input.deviceContext === true) fail("INSTRUMENT_DEVICE_NOT_IN_R2");
  if (input.signalEngineering === true || input.ioEngineering === true) fail("SIGNAL_IO_NOT_IN_R2");
  if (input.controlLoopEngineering === true) fail("CONTROL_LOOP_NOT_IN_R2");
  if (input.controlSystemDesign === true) fail("CONTROL_SYSTEM_NOT_IN_R2");
  if (input.alarmRationalization === true || input.interlockLogic === true || input.shutdownLogic === true || input.functionalSafety === true) fail("SAFETY_CONTEXT_NOT_IN_R2");
  if (input.unitChange === true) fail("UNIT_CHANGE_REJECTED");
  if (input.useProjectTag === true || input.inferredRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.inventRequirement === true) fail("MEASUREMENT_REQUIREMENT_NOT_INVENTED");
  if (input.requirementChange === true) fail("REQUIREMENT_CHANGE_NOT_IN_R2");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R2");
  if (input.reviewValidation === true || input.engineeringValidated === true || input.codeConformance === true || input.approved === true || input.certified === true) fail("VALIDATION_NOT_IN_R2");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R2");
  if (input.automaticDesign === true) fail("DESIGN_NOT_IN_R2");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.advanceMaturity === true) fail("MATURITY_PROGRESSION_NOT_IN_R2");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.processAuthorityAdopted === true || input.electricalProtectionAdopted === true) fail("DISCIPLINE_AUTHORITY_NOT_TRANSFERRED");
}

function remember(store: D8R2Store, subjectKind: D8R2History["subjectKind"], subjectId: string, action: D8R2History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function requireContext(store: D8R2Store, actor: D8R1Actor, contextId: string): string {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context.contextId;
}

function requireObject(store: D8R2Store, actor: D8R1Actor, contextId: string, objectId: string, revisionFingerprint: string, allowed: readonly string[], cited: Currentness): D8R1ObjectRecord {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(revisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === id);
  if (!object || !allowed.includes(object.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  if (cited === "SUPERSEDED" && object.recordStatus !== "SUPERSEDED") fail("R1_OBJECT_CURRENTNESS_MISMATCH");
  return object;
}

function prepare(store: D8R2Store, actor: D8R1Actor, input: Bound, allowed: readonly string[]): Prepared {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const contextId = requireContext(store, actor, input.contextId);
  const object = requireObject(store, actor, contextId, input.objectId, input.objectRevisionFingerprint, allowed, citedCurrentness);
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return { contextId, object, stage, provenanceRef, sourceBasisRef, applicability, limitations, citedCurrentness };
}

function assertD6(input: D6Fields, required: boolean): { d6SourceId: string | null; d6SourceRevisionFingerprint: string | null; d6Subject: string | null } {
  const present = Boolean(input.d6SourceId || input.d6SourceRevisionFingerprint || input.d6Subject);
  if (!required && !present) return { d6SourceId: null, d6SourceRevisionFingerprint: null, d6Subject: null };
  if (!input.d6SourceId || !input.d6SourceRevisionFingerprint || !input.d6Subject) fail("D6_SOURCE_REVISION_REQUIRED");
  const d6SourceId = explicit(input.d6SourceId, "D6_SOURCE_REVISION_REQUIRED");
  const d6SourceRevisionFingerprint = explicit(input.d6SourceRevisionFingerprint, "D6_SOURCE_REVISION_REQUIRED");
  const d6Subject = explicit(input.d6Subject, "D6_SOURCE_SUBJECT_REQUIRED");
  if (!(D8_D6_INTERFACE_SUBJECTS as readonly string[]).includes(d6Subject)) fail("D6_SOURCE_SUBJECT_NOT_ALLOWLISTED");
  return { d6SourceId, d6SourceRevisionFingerprint, d6Subject };
}

function conditionOf(input: D8R2MeasurementInput): { suppliedConditionValue: string | null; suppliedConditionUnit: string | null } {
  const value = input.suppliedConditionValue?.trim() ? explicit(input.suppliedConditionValue, "PROCESS_CONDITION_REQUIRED") : "";
  const unit = input.suppliedConditionUnit?.trim() ?? "";
  if (value && !unit) fail("MISSING_UNIT");
  if (!value && unit) fail("PROCESS_CONDITION_REQUIRED");
  if (unit && (FLOATING.has(unit.toLowerCase()) || blockedParty(unit))) fail("UNIT_SPOOF_REJECTED");
  return { suppliedConditionValue: value || null, suppliedConditionUnit: unit || null };
}

function sameMeasurementLineage(store: D8R2Store, object: D8R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D8R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    const predecessorId: string | null = cursor.predecessorObjectId;
    cursor = predecessorId ? store.r1.objects.find((row) => row.objectId === predecessorId) : undefined;
  }
  return false;
}

function place<T extends { fingerprint: string; tenantId: string; recordStatus: "CURRENT" | "SUPERSEDED"; currentness: "CURRENT" | "SUPERSEDED" }>(
  store: D8R2Store,
  rows: T[],
  kind: D8R2History["subjectKind"],
  id: string,
  fingerprint: string,
  tenantId: string,
  predecessor: T | null,
  idOf: (row: T) => string,
  kept: (row: T) => string,
  duplicate: T | undefined,
  duplicateCode: string,
  record: T,
): T {
  const existing = rows.find((row) => idOf(row) === id);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === tenantId ? existing : fail(duplicateCode);
  if (duplicate) fail(duplicateCode);
  if (predecessor) {
    const before = kept(predecessor);
    const index = rows.findIndex((row) => idOf(row) === idOf(predecessor));
    rows[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (kept(rows[index]) !== before) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, kind, idOf(predecessor), "SUPERSEDED", predecessor.fingerprint);
  }
  rows.push(record);
  remember(store, kind, id, "CREATED", fingerprint);
  return record;
}

export function createD8R2Store(r1: D8R1Store, now: () => string = () => "2026-10-25T00:00:00.000Z"): D8R2Store {
  return { r1, now, measurements: [], requirements: [], tags: [], tagRelationships: [], measurementRelationships: [], history: [] };
}

export function recordProcessMeasurementContext(store: D8R2Store, actor: D8R1Actor, input: D8R2MeasurementInput): D8R2MeasurementRecord {
  const prepared = prepare(store, actor, input, ["IAC_MEASUREMENT_POINT"]);
  const measurementRecordId = explicit(input.measurementRecordId, "MEASUREMENT_CONTEXT_REQUIRED");
  const measurementPurpose = explicit(input.measurementPurpose, "MEASUREMENT_PURPOSE_REQUIRED");
  const processVariableType = explicit(input.processVariableType, "PROCESS_VARIABLE_REQUIRED");
  const locationReference = explicit(input.locationReference, "LOCATION_REFERENCE_REQUIRED");
  if (!(D8_R2_MEASUREMENT_PURPOSES as readonly string[]).includes(measurementPurpose)) fail("MEASUREMENT_PURPOSE_NOT_ALLOWLISTED");
  if (!(D8_R2_PROCESS_VARIABLE_TYPES as readonly string[]).includes(processVariableType)) fail("PROCESS_VARIABLE_NOT_ALLOWLISTED");
  const condition = conditionOf(input);
  const d6 = assertD6(input, condition.suppliedConditionValue != null);
  const predecessor = input.predecessorMeasurementRecordId ? store.measurements.find((row) => row.measurementRecordId === input.predecessorMeasurementRecordId) : null;
  if (input.predecessorMeasurementRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameMeasurementLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    measurementRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    measurementPurpose,
    processVariableType,
    locationReference,
    d6,
    condition,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    citedLifecycleStage: prepared.stage,
    citedCurrentness: prepared.citedCurrentness,
    predecessorMeasurementRecordId: predecessor?.measurementRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.measurements.find((row) => row.recordStatus === "CURRENT" && row.measurementRecordId !== predecessor?.measurementRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.measurementPurpose === measurementPurpose && row.processVariableType === processVariableType && row.locationReference === locationReference);
  const record: D8R2MeasurementRecord = Object.freeze({
    measurementRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectType: prepared.object.objectType,
    objectRevisionFingerprint: prepared.object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    measurementPurpose: measurementPurpose as Purpose,
    processVariableType: processVariableType as Variable,
    locationReference,
    d6SourceId: d6.d6SourceId,
    d6SourceRevisionFingerprint: d6.d6SourceRevisionFingerprint,
    d6Subject: d6.d6Subject,
    suppliedConditionValue: condition.suppliedConditionValue,
    suppliedConditionUnit: condition.suppliedConditionUnit,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D8_CONTEXT_AUTHORITY,
    iacEngineeringAuthority: false,
    engineeringValidated: false,
    conformant: false,
    approved: false,
    certified: false,
    validatedProcessValue: false,
    processCalculation: false,
    instrumentSelection: false,
    validatedInstrumentDesign: false,
    measuredResult: false,
    validatedInstrumentRange: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorMeasurementRecordId: predecessor?.measurementRecordId ?? null,
  });
  return place(store, store.measurements, "MEASUREMENT", measurementRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.measurementRecordId, (row) => `${row.objectRevisionFingerprint}|${row.d6SourceRevisionFingerprint}|${row.suppliedConditionUnit}`, duplicate, "DUPLICATE_MEASUREMENT_REJECTED", record);
}

export function recordMeasurementRequirementContext(store: D8R2Store, actor: D8R1Actor, input: D8R2RequirementInput): D8R2RequirementRecord {
  const prepared = prepare(store, actor, input, ["IAC_MEASUREMENT_POINT"]);
  const requirementRecordId = explicit(input.requirementRecordId, "MEASUREMENT_REQUIREMENT_REQUIRED");
  const requirementText = explicit(input.requirementText, "MEASUREMENT_REQUIREMENT_REQUIRED");
  const measurement = store.measurements.find((row) => row.measurementRecordId === input.measurementRecordId && row.recordStatus === "CURRENT");
  if (!measurement || measurement.objectId !== prepared.object.objectId || measurement.objectRevisionFingerprint !== prepared.object.fingerprint || measurement.tenantId !== actor.tenantId) fail("MEASUREMENT_CONTEXT_NOT_FOUND");
  const d6 = assertD6(input, true);
  if (!d6.d6SourceId || !d6.d6SourceRevisionFingerprint || !d6.d6Subject) fail("D6_SOURCE_REVISION_REQUIRED");
  const predecessor = input.predecessorRequirementRecordId ? store.requirements.find((row) => row.requirementRecordId === input.predecessorRequirementRecordId) : null;
  if (input.predecessorRequirementRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    requirementRecordId,
    measurementRecordId: measurement.measurementRecordId,
    measurementRevisionFingerprint: measurement.fingerprint,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    requirementText,
    d6,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    predecessorRequirementRecordId: predecessor?.requirementRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.requirements.find((row) => row.recordStatus === "CURRENT" && row.requirementRecordId !== predecessor?.requirementRecordId && row.measurementRecordId === measurement.measurementRecordId && row.requirementText === requirementText && row.d6SourceRevisionFingerprint === d6.d6SourceRevisionFingerprint);
  const record: D8R2RequirementRecord = Object.freeze({
    requirementRecordId,
    measurementRecordId: measurement.measurementRecordId,
    measurementRevisionFingerprint: measurement.fingerprint,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    requirementText,
    d6SourceId: d6.d6SourceId,
    d6SourceRevisionFingerprint: d6.d6SourceRevisionFingerprint,
    d6Subject: d6.d6Subject,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    authority: D8_CONTEXT_AUTHORITY,
    instrumentSelected: false,
    validatedInstrumentDesign: false,
    engineeringValidated: false,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRequirementRecordId: predecessor?.requirementRecordId ?? null,
  });
  return place(store, store.requirements, "REQUIREMENT", requirementRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.requirementRecordId, (row) => `${row.objectRevisionFingerprint}|${row.d6SourceRevisionFingerprint}|${row.measurementRevisionFingerprint}`, duplicate, "DUPLICATE_REQUIREMENT_REJECTED", record);
}

export function recordIacTagContext(store: D8R2Store, actor: D8R1Actor, input: D8R2TagInput): D8R2TagRecord {
  const prepared = prepare(store, actor, input, D8_IAC_OBJECT_TYPES);
  const tagRecordId = explicit(input.tagRecordId, "TAG_CONTEXT_REQUIRED");
  const tagToken = explicit(input.tagToken, "TAG_IDENTITY_REQUIRED");
  const predecessor = input.predecessorTagRecordId ? store.tags.find((row) => row.tagRecordId === input.predecessorTagRecordId) : null;
  if (input.predecessorTagRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameMeasurementLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    tagRecordId,
    tagToken,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    predecessorTagRecordId: predecessor?.tagRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.tags.find((row) => row.recordStatus === "CURRENT" && row.tagRecordId !== predecessor?.tagRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.tagToken === tagToken);
  const record: D8R2TagRecord = Object.freeze({
    tagRecordId,
    tagToken,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectType: prepared.object.objectType,
    objectRevisionFingerprint: prepared.object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    authority: D8_CONTEXT_AUTHORITY,
    validatedIacDesign: false,
    engineeringValidated: false,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorTagRecordId: predecessor?.tagRecordId ?? null,
  });
  return place(store, store.tags, "TAG", tagRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.tagRecordId, (row) => row.objectRevisionFingerprint, duplicate, "DUPLICATE_TAG_REJECTED", record);
}

export function recordIacTagRelationship(store: D8R2Store, actor: D8R1Actor, input: D8R2TagRelationshipInput): D8R2TagRelationshipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const relationshipId = explicit(input.relationshipId, "TAG_RELATIONSHIP_REQUIRED");
  const kind = input.kind.trim();
  if (INFERRED.has(kind.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (!(D8_R2_TAG_RELATIONSHIP_KINDS as readonly string[]).includes(kind)) fail("TAG_RELATIONSHIP_NOT_EXPLICIT");
  const tag = store.tags.find((row) => row.tagRecordId === input.tagRecordId && row.recordStatus === "CURRENT");
  if (!tag || tag.tenantId !== actor.tenantId) fail("TAG_CONTEXT_NOT_FOUND");
  const tagRevision = explicit(input.tagRevisionFingerprint, "TAG_REVISION_REQUIRED");
  if (tag.fingerprint !== tagRevision) fail("TAG_REVISION_MISMATCH");
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === input.objectId);
  if (!object || object.fingerprint !== objectRevision || object.tenantId !== actor.tenantId || object.recordStatus !== "CURRENT") fail("R1_REVISION_MISMATCH");
  if (tag.objectId !== object.objectId || tag.objectRevisionFingerprint !== object.fingerprint) fail("TAG_ENDPOINT_MISMATCH");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const predecessor = input.predecessorRelationshipId ? store.tagRelationships.find((row) => row.relationshipId === input.predecessorRelationshipId) : null;
  if (input.predecessorRelationshipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    relationshipId,
    kind,
    tagRecordId: tag.tagRecordId,
    tagRevisionFingerprint: tag.fingerprint,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    applicability,
    limitations,
    provenanceRef,
    sourceBasisRef,
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.tagRelationships.find((row) => row.recordStatus === "CURRENT" && row.relationshipId !== predecessor?.relationshipId && row.tagRecordId === tag.tagRecordId && row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint);
  const record: D8R2TagRelationshipRecord = Object.freeze({
    relationshipId,
    kind: kind as D8R2TagRelationshipRecord["kind"],
    tagRecordId: tag.tagRecordId,
    tagRevisionFingerprint: tag.fingerprint,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    provenanceRef,
    sourceBasisRef,
    applicability,
    limitations,
    inferred: false,
    validatedIacDesign: false,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  return place(store, store.tagRelationships, "TAG_RELATIONSHIP", relationshipId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.relationshipId, (row) => `${row.tagRevisionFingerprint}|${row.objectRevisionFingerprint}`, duplicate, "DUPLICATE_TAG_RELATIONSHIP_REJECTED", record);
}

export function recordMeasurementObjectRelationship(store: D8R2Store, actor: D8R1Actor, input: D8R2MeasurementRelationshipInput): D8R2MeasurementRelationshipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const relationshipId = explicit(input.relationshipId, "MEASUREMENT_RELATIONSHIP_REQUIRED");
  const kind = input.kind.trim();
  if (INFERRED.has(kind.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (!(D8_R2_MEASUREMENT_RELATIONSHIP_KINDS as readonly string[]).includes(kind)) fail("MEASUREMENT_RELATIONSHIP_NOT_EXPLICIT");
  const measurement = store.measurements.find((row) => row.measurementRecordId === input.measurementRecordId && row.recordStatus === "CURRENT");
  if (!measurement || measurement.tenantId !== actor.tenantId) fail("MEASUREMENT_CONTEXT_NOT_FOUND");
  const measurementRevision = explicit(input.measurementRevisionFingerprint, "MEASUREMENT_REVISION_REQUIRED");
  if (measurement.fingerprint !== measurementRevision) fail("MEASUREMENT_REVISION_MISMATCH");
  const fromRevision = explicit(input.fromObjectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const toRevision = explicit(input.toObjectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const fromObject = store.r1.objects.find((row) => row.objectId === input.fromObjectId);
  const toObject = store.r1.objects.find((row) => row.objectId === input.toObjectId);
  if (!fromObject || fromObject.objectType !== "IAC_MEASUREMENT_POINT" || fromObject.fingerprint !== fromRevision || fromObject.recordStatus !== "CURRENT" || fromObject.tenantId !== actor.tenantId) fail("R1_REVISION_MISMATCH");
  if (!toObject || fromObject.objectId === toObject.objectId || toObject.fingerprint !== toRevision || toObject.recordStatus !== "CURRENT" || toObject.tenantId !== actor.tenantId) fail("R1_REVISION_MISMATCH");
  if (!(D8_IAC_OBJECT_TYPES as readonly string[]).includes(toObject.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (measurement.objectId !== fromObject.objectId || measurement.objectRevisionFingerprint !== fromObject.fingerprint) fail("MEASUREMENT_ENDPOINT_MISMATCH");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const predecessor = input.predecessorRelationshipId ? store.measurementRelationships.find((row) => row.relationshipId === input.predecessorRelationshipId) : null;
  if (input.predecessorRelationshipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    relationshipId,
    kind,
    measurementRecordId: measurement.measurementRecordId,
    measurementRevisionFingerprint: measurement.fingerprint,
    fromObjectId: fromObject.objectId,
    fromObjectRevisionFingerprint: fromObject.fingerprint,
    toObjectId: toObject.objectId,
    toObjectRevisionFingerprint: toObject.fingerprint,
    applicability,
    limitations,
    provenanceRef,
    sourceBasisRef,
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.measurementRelationships.find((row) => row.recordStatus === "CURRENT" && row.relationshipId !== predecessor?.relationshipId && row.fromObjectId === fromObject.objectId && row.fromObjectRevisionFingerprint === fromObject.fingerprint && row.toObjectId === toObject.objectId && row.toObjectRevisionFingerprint === toObject.fingerprint);
  const record: D8R2MeasurementRelationshipRecord = Object.freeze({
    relationshipId,
    kind: kind as D8R2MeasurementRelationshipRecord["kind"],
    measurementRecordId: measurement.measurementRecordId,
    measurementRevisionFingerprint: measurement.fingerprint,
    fromObjectId: fromObject.objectId,
    fromObjectRevisionFingerprint: fromObject.fingerprint,
    toObjectId: toObject.objectId,
    toObjectRevisionFingerprint: toObject.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    provenanceRef,
    sourceBasisRef,
    applicability,
    limitations,
    inferred: false,
    instrumentSelection: false,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  return place(store, store.measurementRelationships, "MEASUREMENT_RELATIONSHIP", relationshipId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.relationshipId, (row) => `${row.fromObjectRevisionFingerprint}|${row.toObjectRevisionFingerprint}|${row.measurementRevisionFingerprint}`, duplicate, "DUPLICATE_MEASUREMENT_RELATIONSHIP_REJECTED", record);
}

export function selectIacInstrument(): never {
  return fail("INSTRUMENT_SELECTION_NOT_IN_R2");
}

export function sizeIacInstrument(): never {
  return fail("INSTRUMENT_SIZING_NOT_IN_R2");
}

export function deriveIacInstrumentRange(): never {
  return fail("INSTRUMENT_RANGE_NOT_IN_R2");
}

export function deriveIacProcessValue(): never {
  return fail("PROCESS_VALUE_NOT_IN_R2");
}

export function recordIacInstrumentDeviceContext(): never {
  return fail("INSTRUMENT_DEVICE_NOT_IN_R2");
}

export function recordIacSignalIoContext(): never {
  return fail("SIGNAL_IO_NOT_IN_R2");
}

export function recordIacControlLoopContext(): never {
  return fail("CONTROL_LOOP_NOT_IN_R2");
}

export function recordIacControlSystemContext(): never {
  return fail("CONTROL_SYSTEM_NOT_IN_R2");
}

export function recordIacSafetyContext(): never {
  return fail("SAFETY_CONTEXT_NOT_IN_R2");
}

export function mutateIacIdentity(): never {
  return fail("R1_MUTATION_REJECTED");
}

export function repointIacMeasurementContext(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
