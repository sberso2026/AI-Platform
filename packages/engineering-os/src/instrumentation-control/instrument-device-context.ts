/**
 * EOS-D8-R3 instrument and device context.
 * One bounded runtime on exact R1 identities and exact R2 measurement and tag revisions.
 * Supplied context only.
 */
import {
  D8_CURRENTNESS_STATES,
  D8_D4_INTERFACE_SUBJECTS,
  D8_D5_INTERFACE_SUBJECTS,
  D8_D6_INTERFACE_SUBJECTS,
  D8_IMPLEMENTATION_PHASE_TYPES,
  D8_IMPLEMENTATION_PHASES,
  D8_INSTRUMENT_DEVICE_CLASSES,
  D8_MATURITY_STATES,
  INSTRUMENT_DATASHEET_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_DESIGN,
  VENDOR_INSTRUMENT_DATA_EQUALS_PROJECT_VALIDATION,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D8_CONTEXT_AUTHORITY, D8_DISCIPLINE, type D8R1Actor, type D8R1ObjectRecord } from "./identity-foundation";
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
  D6_PROCESS_REQUIREMENT_EQUALS_D8_INSTRUMENT_SELECTION,
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
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D6_RUNTIME_INTEGRATION_COUNT,
  D8_D7_RUNTIME_INTEGRATION_COUNT,
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
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION,
  MEASUREMENT_POINT_RELATIONSHIP_EQUALS_INSTRUMENT_SELECTION,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  type D8R2Store,
} from "./process-measurement-tag-context";

export const D8_R3_STATUS = "INSTRUMENT_AND_DEVICE_CONTEXT_IMPLEMENTED" as const;
export const D8_R3_MATURITY = D8_R3_STATUS;
export const D8_R3_MATURITY_STATE = D8_R3_STATUS;
export const D8_R3_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D8_R3_INSTRUMENT_AND_DEVICE_CONTEXT_CLOSEOUT.md" as const;
export const D8_R1_IDENTITY_REUSED = D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY;
export const D8_R2_PROCESS_MEASUREMENT_TAG_CONTEXT_REUSED = D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY;
export const EXACT_D8_R1_R2_REFERENCE_REQUIRED = true as const;
export const FLOATING_D8_R3_SOURCE_REFERENCE_ALLOWED = false as const;
export const D8_R3_SOURCE_AUTO_REPOINTED = false as const;
export const D8_RUNTIME_STARTED = true as const;
export const D8_RUNTIME_COUNT = 3 as const;
export const D8_R2_RUNTIME_COUNT = R2_RUNTIME_COUNT;
export const D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY = true as const;
export const D8_INSTRUMENT_DEVICE_CONTEXT_IMPLEMENTED = true as const;
export const INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_DESIGN = false as const;
export const DEVICE_CONTEXT_EQUALS_ENGINEERING_VALIDATION = false as const;
export const DEVICE_CONTEXT_EQUALS_DEVICE_SIZING = false as const;
export const EXACT_D8_INSTRUMENT_DEVICE_REVISION_REQUIRED = true as const;
export const FLOATING_D8_INSTRUMENT_DEVICE_REVISION_ALLOWED = false as const;
export const D8_INSTRUMENT_DEVICE_REVISION_AUTO_REPOINTED = false as const;
export const EXACT_D8_R2_MEASUREMENT_REVISION_REQUIRED = true as const;
export const EXACT_D8_R2_TAG_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const TAG_RELATIONSHIP_EQUALS_VALIDATED_DEVICE_ASSIGNMENT = false as const;
export const D8_EXPLICIT_DEVICE_MEASUREMENT_RELATIONSHIP_REQUIRED = true as const;
export const D8_INFERRED_DEVICE_MEASUREMENT_RELATIONSHIP_ALLOWED = false as const;
export const EXACT_D8_DEVICE_MEASUREMENT_ENDPOINT_REVISION_REQUIRED = true as const;
export const D8_R3_DEVICE_RELATIONSHIP_KINDS = ["DEVICE_TO_MEASUREMENT"] as const;
export const D8_R3_DEVICE_CLASSES = [...D8_INSTRUMENT_DEVICE_CLASSES, "CONTROL_VALVE"] as const;
export const D8_R3_SERVICE_CONTEXTS = ["PROCESS_MEASUREMENT_SERVICE", "LOCAL_INDICATION", "ON_OFF_SWITCHING", "ANALYTICAL_SERVICE", "FINAL_ELEMENT", "PACKAGE_INSTRUMENT", "OTHER_CANONICAL_SERVICE"] as const;
export const D8_INSTRUMENT_SERVICE_CONTEXT_SUPPORTED = true as const;
export const INSTRUMENT_SERVICE_CONTEXT_EQUALS_VALIDATED_DEVICE_SELECTION = false as const;
export const D8_INSTRUMENT_DATASHEET_CONTEXT_SUPPORTED = true as const;
export const INSTRUMENT_DATASHEET_PRESENT_EQUALS_PROJECT_VALIDATION = false as const;
export const D8_VENDOR_MANUFACTURER_CONTEXT_SUPPORTED = true as const;
export const VENDOR_SELECTED_DEVICE_EQUALS_PROJECT_VALIDATED_SELECTION = false as const;
export const D8_SUPPLIED_INSTRUMENT_RANGE_CONTEXT_SUPPORTED = true as const;
export const SUPPLIED_INSTRUMENT_RANGE_EQUALS_VALIDATED_RANGE_SELECTION = false as const;
export const SUPPLIED_INSTRUMENT_RANGE_EQUALS_RANGE_CALCULATED_BY_EOS = false as const;
export const D8_R3_DERIVES_INSTRUMENT_RANGE = false as const;
export const D8_R3_CALCULATES_INSTRUMENT_RANGE = false as const;
export const D8_R3_AUTO_SELECTS_INSTRUMENT_RANGE = false as const;
export const D8_SUPPLIED_SETPOINT_CONTEXT_SUPPORTED = true as const;
export const SUPPLIED_SETPOINT_EQUALS_VALIDATED_SETPOINT = false as const;
export const SUPPLIED_SETPOINT_EQUALS_SETPOINT_CALCULATED_BY_EOS = false as const;
export const D8_R3_DERIVES_SETPOINT = false as const;
export const D8_R3_CALCULATES_SETPOINT = false as const;
export const D8_R3_AUTO_ADOPTS_SETPOINT = false as const;
export const D8_R3_UNITS_REQUIRED = true as const;
export const D8_R3_UNITS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D8_R3_UNITS = false as const;
export const D8_SUPPLIED_DEVICE_CERTIFICATION_CONTEXT_SUPPORTED = true as const;
export const SUPPLIED_DEVICE_CERTIFICATION_EQUALS_PROJECT_VALIDATION = false as const;
export const SUPPLIED_DEVICE_CERTIFICATION_EQUALS_D8_CERTIFICATION = false as const;
export const SUPPLIED_DEVICE_MARKING_EQUALS_VALIDATED_PROJECT_SELECTION = false as const;
export const D8_R3_HAZARDOUS_AREA_DEVICE_CONTEXT_SUPPORTED = true as const;
export const HAZARDOUS_AREA_DEVICE_CONTEXT_EQUALS_VALIDATED_HAZARDOUS_AREA_SELECTION = false as const;
export const HAZARDOUS_AREA_MARKING_EQUALS_CODE_CONFORMANCE = false as const;
export const EXACT_D6_PROCESS_SOURCE_REVISION_REQUIRED = true as const;
export const D8_R3_D6_SOURCE_AUTO_REPOINTED = false as const;
export const D6_PROCESS_CONDITION_EQUALS_VALIDATED_INSTRUMENT_RANGE = false as const;
export const D8_R3_CAN_REFERENCE_D4_MECHANICAL_CONTEXT = true as const;
export const EXACT_D4_MECHANICAL_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D4_MECHANICAL_EQUIPMENT_CONTEXT_EQUALS_D8_INSTRUMENT_SELECTION = false as const;
export const D4_PACKAGE_CONTEXT_EQUALS_VALIDATED_D8_DEVICE_DESIGN = false as const;
export const D8_R3_CAN_REFERENCE_D5_PIPING_CONTEXT = true as const;
export const EXACT_D5_PIPING_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D5_PIPING_CONTEXT_EQUALS_D8_INSTRUMENT_SELECTION = false as const;
export const D8_INSTRUMENT_CONTEXT_EQUALS_VALIDATED_D5_PIPING_DESIGN = false as const;
export const D8_R3_PERFORMS_INSTRUMENT_SELECTION = false as const;
export const D8_R3_PERFORMS_INSTRUMENT_SIZING = false as const;
export const D8_R3_PERFORMS_CONTROL_VALVE_SIZING = false as const;
export const D8_R3_PERFORMS_ACTUATOR_SIZING = false as const;
export const D8_R3_PERFORMS_DEVICE_PERFORMANCE_CALCULATION = false as const;
export const D8_R3_DERIVES_MISSING_DEVICE_ATTRIBUTE = false as const;
export const D8_R3_INTERPOLATES_DEVICE_ATTRIBUTE = false as const;
export const D8_R3_EXTRAPOLATES_DEVICE_ATTRIBUTE = false as const;
export const D8_R3_ESTIMATES_MISSING_DEVICE_ATTRIBUTE = false as const;
export const D8_R3_PERFORMS_SIGNAL_ENGINEERING = false as const;
export const D8_R3_PERFORMS_IO_ENGINEERING = false as const;
export const D8_R3_PERFORMS_CONTROL_LOOP_ENGINEERING = false as const;
export const D8_R3_PERFORMS_CONTROL_SYSTEM_DESIGN = false as const;
export const D8_R3_PERFORMS_ALARM_RATIONALIZATION = false as const;
export const D8_R3_PERFORMS_INTERLOCK_LOGIC_DESIGN = false as const;
export const D8_R3_PERFORMS_SHUTDOWN_LOGIC_DESIGN = false as const;
export const D8_R3_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING = false as const;
export const D8_R3_SOURCE_BASIS_REQUIRED = true as const;
export const D8_R3_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D8_DEVICE_CONTEXT_AUTO_ACCEPTED = false as const;
export const D8_R3_APPLICABILITY_EXPLICIT = true as const;
export const D8_R3_LIMITATIONS_EXPLICIT = true as const;
export const D8_R3_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D8_R3_PROVENANCE_REQUIRED = true as const;
export const D8_R3_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D8_R3_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D8_R3_ACCESS_ALLOWED = false as const;
export const D8_R3_HISTORY_PRESERVED = true as const;
export const D8_R3_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D8_R3_MUTATION_ALLOWED = false as const;
export const D8_R3_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D8_R3_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_DEVICE_ATTRIBUTE = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_RANGE = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_SETPOINT = false as const;
export const AI_CAN_PROMOTE_D8_DEVICE_CONTEXT_TO_VALIDATED_SELECTION = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D8_R3_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D8_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_R3_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D8_R3_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D8_R4_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_INSTRUMENT_RANGE_DERIVATION = false as const;
export const UNAUTHORIZED_SETPOINT_DERIVATION = false as const;
export const UNAUTHORIZED_CONTROL_VALVE_SIZING = false as const;
export const UNAUTHORIZED_ACTUATOR_SIZING = false as const;
export const UNAUTHORIZED_DEVICE_PERFORMANCE_CALCULATION = false as const;
export const UNAUTHORIZED_D4_AUTHORITY_TRANSFER = false as const;
export const UNAUTHORIZED_D5_AUTHORITY_TRANSFER = false as const;
export const D8_R4_CANONICAL_PHASE = D8_IMPLEMENTATION_PHASES[3];
export const D8_R4_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[3];
export const D8_R4_CANONICAL_SCOPE =
  "Implement governed signal, I/O and control-loop context using exact R1 through R3 revisions. Support signal identity and type, exact source and destination relationships, supplied I/O type and channel reference, explicit loop membership, loop purpose, and measurement or device relationships. Preserve source, basis, applicability, limitations, provenance, and currentness. Do not perform signal design calculations, I/O allocation optimization, control-loop tuning, control-logic design, DCS, PLC, or SIS configuration, alarm, interlock, or shutdown logic, functional-safety validation, or D9 reasoning." as const;
export const D8_R4_STARTED = false as const;
export const D8_R3_READY_FOR_NEXT_PHASE = true as const;
export const D8_R3_NEXT_PHASE = D8_R4_CANONICAL_PHASE;
export const D8_R3_NEXT_PHASE_TYPE = D8_R4_PHASE_TYPE;
export const D8_R3_CANONICAL_NEXT_PHASE = D8_R4_CANONICAL_PHASE;
export const D8_R3_CANONICAL_NEXT_PHASE_SCOPE = D8_R4_CANONICAL_SCOPE;
export const D8_R3_BLOCKER = "NONE" as const;
export const D8_R3_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION,
  INSTRUMENT_DATASHEET_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_DESIGN,
  VENDOR_INSTRUMENT_DATA_EQUALS_PROJECT_VALIDATION,
  MEASUREMENT_POINT_RELATIONSHIP_EQUALS_INSTRUMENT_SELECTION,
  D6_PROCESS_REQUIREMENT_EQUALS_D8_INSTRUMENT_SELECTION,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D8_D6_RUNTIME_INTEGRATION_COUNT,
  D8_D7_RUNTIME_INTEGRATION_COUNT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
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
  "tag_naming",
  "matching_tag",
  "tag_prefix",
  "variable_type",
  "service_description",
  "equipment_proximity",
  "drawing_position",
  "vendor_data",
  "semantic_similarity",
  "ai_interpretation",
  "ai_inference",
  "inferred",
]);

type Stage = (typeof D8_MATURITY_STATES)[number];
type Currentness = (typeof D8_CURRENTNESS_STATES)[number];
type DeviceClass = (typeof D8_R3_DEVICE_CLASSES)[number];
type ServiceContext = (typeof D8_R3_SERVICE_CONTEXTS)[number];

type Prohibited = {
  instrumentSelection?: boolean;
  instrumentSizing?: boolean;
  rangeDerivation?: boolean;
  rangeCalculation?: boolean;
  rangeSelection?: boolean;
  setpointDerivation?: boolean;
  setpointCalculation?: boolean;
  adoptSetpoint?: boolean;
  controlValveSizing?: boolean;
  actuatorSizing?: boolean;
  performanceCalculation?: boolean;
  deriveMissing?: boolean;
  interpolateAttribute?: boolean;
  extrapolateAttribute?: boolean;
  estimateMissing?: boolean;
  signalEngineering?: boolean;
  ioEngineering?: boolean;
  controlLoopEngineering?: boolean;
  controlSystemDesign?: boolean;
  alarmRationalization?: boolean;
  interlockLogic?: boolean;
  shutdownLogic?: boolean;
  functionalSafety?: boolean;
  hazardousAreaClassification?: boolean;
  projectValidation?: boolean;
  engineeringValidated?: boolean;
  codeConformance?: boolean;
  approved?: boolean;
  certified?: boolean;
  unitChange?: boolean;
  inferredRelationship?: boolean;
  automaticDesign?: boolean;
  mutateR1?: boolean;
  mutateR2?: boolean;
  repoint?: boolean;
  propagate?: boolean;
  d9Source?: boolean;
  disciplineInterface?: boolean;
  reviewValidation?: boolean;
  processAuthorityAdopted?: boolean;
  mechanicalAuthorityAdopted?: boolean;
  pipingAuthorityAdopted?: boolean;
};

type SourceTriple = { sourceId?: string | null; sourceRevisionFingerprint?: string | null; sourceSubject?: string | null };

export type D8R3DeviceInput = Prohibited & {
  deviceRecordId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  deviceClass: string;
  serviceContext: string;
  measurementPrinciple?: string | null;
  manufacturer?: string | null;
  modelReference?: string | null;
  datasheetId?: string | null;
  datasheetRevision?: string | null;
  suppliedRangeLow?: string | null;
  suppliedRangeHigh?: string | null;
  suppliedRangeUnit?: string | null;
  suppliedSetpointValue?: string | null;
  suppliedSetpointUnit?: string | null;
  suppliedCertificationRef?: string | null;
  suppliedMarking?: string | null;
  suppliedHazardousAreaMarking?: string | null;
  measurementRecordId?: string | null;
  measurementRevisionFingerprint?: string | null;
  tagRecordId?: string | null;
  tagRevisionFingerprint?: string | null;
  d6SourceId?: string | null;
  d6SourceRevisionFingerprint?: string | null;
  d6Subject?: string | null;
  d4SourceId?: string | null;
  d4SourceRevisionFingerprint?: string | null;
  d4Subject?: string | null;
  d5SourceId?: string | null;
  d5SourceRevisionFingerprint?: string | null;
  d5Subject?: string | null;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  predecessorDeviceRecordId?: string | null;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

type Sourced = { sourceId: string | null; sourceRevisionFingerprint: string | null; sourceSubject: string | null };

export type D8R3DeviceRecord = {
  deviceRecordId: string;
  contextId: string;
  objectId: string;
  objectType: D8R1ObjectRecord["objectType"];
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  citedLifecycleStage: Stage;
  citedCurrentness: Currentness;
  deviceClass: DeviceClass;
  serviceContext: ServiceContext;
  measurementPrinciple: string | null;
  manufacturer: string | null;
  modelReference: string | null;
  datasheetId: string | null;
  datasheetRevision: string | null;
  suppliedRangeLow: string | null;
  suppliedRangeHigh: string | null;
  suppliedRangeUnit: string | null;
  suppliedSetpointValue: string | null;
  suppliedSetpointUnit: string | null;
  suppliedCertificationRef: string | null;
  suppliedMarking: string | null;
  suppliedHazardousAreaMarking: string | null;
  measurementRecordId: string | null;
  measurementRevisionFingerprint: string | null;
  tagRecordId: string | null;
  tagRevisionFingerprint: string | null;
  d6SourceId: string | null;
  d6SourceRevisionFingerprint: string | null;
  d6Subject: string | null;
  d4SourceId: string | null;
  d4SourceRevisionFingerprint: string | null;
  d4Subject: string | null;
  d5SourceId: string | null;
  d5SourceRevisionFingerprint: string | null;
  d5Subject: string | null;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: typeof D8_CONTEXT_AUTHORITY;
  iacEngineeringAuthority: false;
  engineeringValidated: false;
  conformant: false;
  approved: false;
  certified: false;
  instrumentSelected: false;
  validatedInstrumentDesign: false;
  projectValidated: false;
  rangeCalculated: false;
  setpointCalculated: false;
  hazardousAreaSelected: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorDeviceRecordId: string | null;
};

export type D8R3RelationshipInput = Prohibited & {
  relationshipId: string;
  deviceRecordId: string;
  deviceRevisionFingerprint: string;
  measurementRecordId: string;
  measurementRevisionFingerprint: string;
  tagRecordId?: string | null;
  tagRevisionFingerprint?: string | null;
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

export type D8R3RelationshipRecord = {
  relationshipId: string;
  kind: (typeof D8_R3_DEVICE_RELATIONSHIP_KINDS)[number];
  deviceRecordId: string;
  deviceRevisionFingerprint: string;
  objectId: string;
  objectRevisionFingerprint: string;
  measurementRecordId: string;
  measurementRevisionFingerprint: string;
  measurementObjectId: string;
  measurementObjectRevisionFingerprint: string;
  tagRecordId: string | null;
  tagRevisionFingerprint: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  inferred: false;
  instrumentSelection: false;
  validatedDeviceAssignment: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorRelationshipId: string | null;
};

export type D8R3History = {
  historyId: string;
  subjectKind: "DEVICE" | "DEVICE_RELATIONSHIP";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D8R3Store = {
  r2: D8R2Store;
  now: () => string;
  devices: D8R3DeviceRecord[];
  relationships: D8R3RelationshipRecord[];
  history: D8R3History[];
};

function fail(code: string): never {
  throw new Error(`D8_R3_${code}`);
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
  if (input.mutateR2 === true) fail("R2_MUTATION_REJECTED");
  if (input.instrumentSelection === true) fail("INSTRUMENT_SELECTION_NOT_IN_R3");
  if (input.instrumentSizing === true) fail("INSTRUMENT_SIZING_NOT_IN_R3");
  if (input.rangeDerivation === true || input.rangeCalculation === true || input.rangeSelection === true) fail("RANGE_DERIVATION_NOT_IN_R3");
  if (input.setpointDerivation === true || input.setpointCalculation === true || input.adoptSetpoint === true) fail("SETPOINT_DERIVATION_NOT_IN_R3");
  if (input.controlValveSizing === true) fail("CONTROL_VALVE_SIZING_NOT_IN_R3");
  if (input.actuatorSizing === true) fail("ACTUATOR_SIZING_NOT_IN_R3");
  if (input.performanceCalculation === true) fail("DEVICE_PERFORMANCE_NOT_IN_R3");
  if (input.deriveMissing === true || input.interpolateAttribute === true || input.extrapolateAttribute === true || input.estimateMissing === true) fail("MISSING_ATTRIBUTE_NOT_DERIVED");
  if (input.signalEngineering === true || input.ioEngineering === true) fail("SIGNAL_IO_NOT_IN_R3");
  if (input.controlLoopEngineering === true) fail("CONTROL_LOOP_NOT_IN_R3");
  if (input.controlSystemDesign === true) fail("CONTROL_SYSTEM_NOT_IN_R3");
  if (input.alarmRationalization === true || input.interlockLogic === true || input.shutdownLogic === true || input.functionalSafety === true) fail("SAFETY_CONTEXT_NOT_IN_R3");
  if (input.hazardousAreaClassification === true) fail("HAZARDOUS_AREA_CLASSIFICATION_NOT_IN_R3");
  if (input.projectValidation === true || input.engineeringValidated === true || input.codeConformance === true || input.approved === true || input.certified === true || input.reviewValidation === true) fail("VALIDATION_NOT_IN_R3");
  if (input.unitChange === true) fail("UNIT_CHANGE_REJECTED");
  if (input.inferredRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.automaticDesign === true) fail("DESIGN_NOT_IN_R3");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R3");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R3");
  if (input.processAuthorityAdopted === true || input.mechanicalAuthorityAdopted === true || input.pipingAuthorityAdopted === true) fail("DISCIPLINE_AUTHORITY_NOT_TRANSFERRED");
}

function pair(left?: string | null, right?: string | null, code = "SUPPLIED_PAIR_REQUIRED"): { left: string | null; right: string | null } {
  const a = left?.trim() ?? "";
  const b = right?.trim() ?? "";
  if (!a && !b) return { left: null, right: null };
  if (!a || !b) fail(code);
  return { left: explicit(a, code), right: explicit(b, code) };
}

function quantity(value: string | null | undefined, unit: string | null | undefined, incomplete: string): { value: string | null; unit: string | null } {
  const quantityValue = value?.trim() ?? "";
  const quantityUnit = unit?.trim() ?? "";
  if (!quantityValue && !quantityUnit) return { value: null, unit: null };
  if (!quantityValue || !quantityUnit) fail(incomplete);
  if (FLOATING.has(quantityUnit.toLowerCase()) || blockedParty(quantityUnit)) fail("UNIT_SPOOF_REJECTED");
  return { value: explicit(quantityValue, incomplete), unit: quantityUnit };
}

function rangeOf(input: D8R3DeviceInput): { low: string | null; high: string | null; unit: string | null } {
  const low = input.suppliedRangeLow?.trim() ?? "";
  const high = input.suppliedRangeHigh?.trim() ?? "";
  const unit = input.suppliedRangeUnit?.trim() ?? "";
  if (!low && !high && !unit) return { low: null, high: null, unit: null };
  if (!low || !high || !unit) fail("MISSING_UNIT");
  if (FLOATING.has(unit.toLowerCase()) || blockedParty(unit)) fail("UNIT_SPOOF_REJECTED");
  return { low: explicit(low, "RANGE_NOT_SUPPLIED"), high: explicit(high, "RANGE_NOT_SUPPLIED"), unit };
}

function optionalText(value?: string | null): string | null {
  const token = value?.trim() ?? "";
  return token ? explicit(token, "SUPPLIED_TEXT_REQUIRED") : null;
}

function assertSource(input: SourceTriple, allowed: readonly string[], requiredCode: string): Sourced {
  const present = Boolean(input.sourceId || input.sourceRevisionFingerprint || input.sourceSubject);
  if (!present) return { sourceId: null, sourceRevisionFingerprint: null, sourceSubject: null };
  if (!input.sourceId || !input.sourceRevisionFingerprint || !input.sourceSubject) fail(requiredCode);
  const sourceId = explicit(input.sourceId, requiredCode);
  const sourceRevisionFingerprint = explicit(input.sourceRevisionFingerprint, requiredCode);
  const sourceSubject = explicit(input.sourceSubject, requiredCode);
  if (!allowed.includes(sourceSubject)) fail(requiredCode);
  return { sourceId, sourceRevisionFingerprint, sourceSubject };
}

function assertDeviceClass(objectType: string, deviceClass: string): DeviceClass {
  const token = explicit(deviceClass, "DEVICE_CLASS_REQUIRED");
  if (objectType === "IAC_CONTROL_VALVE_CONTEXT") {
    if (token !== "CONTROL_VALVE") fail("DEVICE_CLASS_NOT_ALLOWLISTED");
    return token;
  }
  if (objectType !== "IAC_INSTRUMENT" || !(D8_INSTRUMENT_DEVICE_CLASSES as readonly string[]).includes(token)) fail("DEVICE_CLASS_NOT_ALLOWLISTED");
  return token as DeviceClass;
}

function requireObject(store: D8R3Store, actor: D8R1Actor, contextId: string, objectId: string, revisionFingerprint: string, cited: Currentness): D8R1ObjectRecord {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(revisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r2.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  if (cited === "SUPERSEDED" && object.recordStatus !== "SUPERSEDED") fail("R1_OBJECT_CURRENTNESS_MISMATCH");
  return object;
}

function requireMeasurement(store: D8R3Store, actor: D8R1Actor, measurementRecordId: string, revision: string) {
  const row = store.r2.measurements.find((item) => item.measurementRecordId === measurementRecordId);
  if (!row || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT" || row.fingerprint !== revision) fail("R2_MEASUREMENT_REVISION_MISMATCH");
  return row;
}

function requireTag(store: D8R3Store, actor: D8R1Actor, tagRecordId: string, revision: string) {
  const row = store.r2.tags.find((item) => item.tagRecordId === tagRecordId);
  if (!row || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT" || row.fingerprint !== revision) fail("R2_TAG_REVISION_MISMATCH");
  return row;
}

function sameLineage(store: D8R3Store, object: D8R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D8R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    const predecessorId: string | null = cursor.predecessorObjectId;
    cursor = predecessorId ? store.r2.r1.objects.find((row) => row.objectId === predecessorId) : undefined;
  }
  return false;
}

function remember(store: D8R3Store, subjectKind: D8R3History["subjectKind"], subjectId: string, action: D8R3History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function place<T extends { fingerprint: string; tenantId: string; recordStatus: "CURRENT" | "SUPERSEDED"; currentness: "CURRENT" | "SUPERSEDED" }>(
  store: D8R3Store,
  rows: T[],
  kind: D8R3History["subjectKind"],
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

export function createD8R3Store(r2: D8R2Store, now: () => string = () => "2026-10-25T00:00:00.000Z"): D8R3Store {
  return { r2, now, devices: [], relationships: [], history: [] };
}

export function recordInstrumentDeviceContext(store: D8R3Store, actor: D8R1Actor, input: D8R3DeviceInput): D8R3DeviceRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.recordStatus !== "CURRENT" || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, citedCurrentness);
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const deviceClass = assertDeviceClass(object.objectType, input.deviceClass);
  const serviceContext = explicit(input.serviceContext, "SERVICE_CONTEXT_REQUIRED");
  if (!(D8_R3_SERVICE_CONTEXTS as readonly string[]).includes(serviceContext)) fail("SERVICE_CONTEXT_NOT_ALLOWLISTED");
  const vendor = pair(input.manufacturer, input.modelReference, "VENDOR_CONTEXT_REQUIRED");
  const datasheet = pair(input.datasheetId, input.datasheetRevision, "DATASHEET_REVISION_REQUIRED");
  const range = rangeOf(input);
  const setpoint = quantity(input.suppliedSetpointValue, input.suppliedSetpointUnit, "MISSING_UNIT");
  const measurement = input.measurementRecordId || input.measurementRevisionFingerprint
    ? requireMeasurement(store, actor, explicit(input.measurementRecordId ?? "", "R2_MEASUREMENT_REVISION_REQUIRED"), explicit(input.measurementRevisionFingerprint ?? "", "R2_MEASUREMENT_REVISION_REQUIRED"))
    : null;
  const tag = input.tagRecordId || input.tagRevisionFingerprint
    ? requireTag(store, actor, explicit(input.tagRecordId ?? "", "R2_TAG_REVISION_REQUIRED"), explicit(input.tagRevisionFingerprint ?? "", "R2_TAG_REVISION_REQUIRED"))
    : null;
  const d6 = assertSource({ sourceId: input.d6SourceId, sourceRevisionFingerprint: input.d6SourceRevisionFingerprint, sourceSubject: input.d6Subject }, D8_D6_INTERFACE_SUBJECTS, "D6_SOURCE_REVISION_REQUIRED");
  const d4 = assertSource({ sourceId: input.d4SourceId, sourceRevisionFingerprint: input.d4SourceRevisionFingerprint, sourceSubject: input.d4Subject }, D8_D4_INTERFACE_SUBJECTS, "D4_SOURCE_REVISION_REQUIRED");
  const d5 = assertSource({ sourceId: input.d5SourceId, sourceRevisionFingerprint: input.d5SourceRevisionFingerprint, sourceSubject: input.d5Subject }, D8_D5_INTERFACE_SUBJECTS, "D5_SOURCE_REVISION_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const deviceRecordId = explicit(input.deviceRecordId, "DEVICE_CONTEXT_REQUIRED");
  const predecessor = input.predecessorDeviceRecordId ? store.devices.find((row) => row.deviceRecordId === input.predecessorDeviceRecordId) : null;
  if (input.predecessorDeviceRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, object, predecessor.objectId))) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    deviceRecordId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    deviceClass,
    serviceContext,
    measurementPrinciple: optionalText(input.measurementPrinciple),
    vendor,
    datasheet,
    range,
    setpoint,
    suppliedCertificationRef: optionalText(input.suppliedCertificationRef),
    suppliedMarking: optionalText(input.suppliedMarking),
    suppliedHazardousAreaMarking: optionalText(input.suppliedHazardousAreaMarking),
    measurementRevisionFingerprint: measurement?.fingerprint ?? null,
    tagRevisionFingerprint: tag?.fingerprint ?? null,
    d6,
    d4,
    d5,
    applicability,
    limitations,
    provenanceRef,
    sourceBasisRef,
    predecessorDeviceRecordId: predecessor?.deviceRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.devices.find((row) => row.recordStatus === "CURRENT" && row.deviceRecordId !== predecessor?.deviceRecordId && row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint);
  const record: D8R3DeviceRecord = Object.freeze({
    deviceRecordId,
    contextId: context.contextId,
    objectId: object.objectId,
    objectType: object.objectType,
    objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    citedLifecycleStage: stage,
    citedCurrentness,
    deviceClass,
    serviceContext: serviceContext as ServiceContext,
    measurementPrinciple: optionalText(input.measurementPrinciple),
    manufacturer: vendor.left,
    modelReference: vendor.right,
    datasheetId: datasheet.left,
    datasheetRevision: datasheet.right,
    suppliedRangeLow: range.low,
    suppliedRangeHigh: range.high,
    suppliedRangeUnit: range.unit,
    suppliedSetpointValue: setpoint.value,
    suppliedSetpointUnit: setpoint.unit,
    suppliedCertificationRef: optionalText(input.suppliedCertificationRef),
    suppliedMarking: optionalText(input.suppliedMarking),
    suppliedHazardousAreaMarking: optionalText(input.suppliedHazardousAreaMarking),
    measurementRecordId: measurement?.measurementRecordId ?? null,
    measurementRevisionFingerprint: measurement?.fingerprint ?? null,
    tagRecordId: tag?.tagRecordId ?? null,
    tagRevisionFingerprint: tag?.fingerprint ?? null,
    d6SourceId: d6.sourceId,
    d6SourceRevisionFingerprint: d6.sourceRevisionFingerprint,
    d6Subject: d6.sourceSubject,
    d4SourceId: d4.sourceId,
    d4SourceRevisionFingerprint: d4.sourceRevisionFingerprint,
    d4Subject: d4.sourceSubject,
    d5SourceId: d5.sourceId,
    d5SourceRevisionFingerprint: d5.sourceRevisionFingerprint,
    d5Subject: d5.sourceSubject,
    provenanceRef,
    sourceBasisRef,
    applicability,
    limitations,
    authority: D8_CONTEXT_AUTHORITY,
    iacEngineeringAuthority: false,
    engineeringValidated: false,
    conformant: false,
    approved: false,
    certified: false,
    instrumentSelected: false,
    validatedInstrumentDesign: false,
    projectValidated: false,
    rangeCalculated: false,
    setpointCalculated: false,
    hazardousAreaSelected: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorDeviceRecordId: predecessor?.deviceRecordId ?? null,
  });
  return place(store, store.devices, "DEVICE", deviceRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.deviceRecordId, (row) => `${row.objectRevisionFingerprint}|${row.suppliedRangeUnit}|${row.suppliedSetpointUnit}|${row.datasheetRevision}|${row.d6SourceRevisionFingerprint}|${row.d4SourceRevisionFingerprint}|${row.d5SourceRevisionFingerprint}`, duplicate, "DUPLICATE_DEVICE_REJECTED", record);
}

export function recordDeviceMeasurementRelationship(store: D8R3Store, actor: D8R1Actor, input: D8R3RelationshipInput): D8R3RelationshipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const relationshipId = explicit(input.relationshipId, "DEVICE_RELATIONSHIP_REQUIRED");
  const kind = input.kind.trim();
  if (INFERRED.has(kind.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (!(D8_R3_DEVICE_RELATIONSHIP_KINDS as readonly string[]).includes(kind)) fail("DEVICE_RELATIONSHIP_NOT_EXPLICIT");
  const device = store.devices.find((row) => row.deviceRecordId === input.deviceRecordId && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!device || device.fingerprint !== explicit(input.deviceRevisionFingerprint, "DEVICE_REVISION_REQUIRED")) fail("DEVICE_REVISION_MISMATCH");
  const measurement = requireMeasurement(store, actor, explicit(input.measurementRecordId, "R2_MEASUREMENT_REVISION_REQUIRED"), explicit(input.measurementRevisionFingerprint, "R2_MEASUREMENT_REVISION_REQUIRED"));
  const tag = input.tagRecordId || input.tagRevisionFingerprint
    ? requireTag(store, actor, explicit(input.tagRecordId ?? "", "R2_TAG_REVISION_REQUIRED"), explicit(input.tagRevisionFingerprint ?? "", "R2_TAG_REVISION_REQUIRED"))
    : null;
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const predecessor = input.predecessorRelationshipId ? store.relationships.find((row) => row.relationshipId === input.predecessorRelationshipId) : null;
  if (input.predecessorRelationshipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    relationshipId,
    kind,
    deviceRecordId: device.deviceRecordId,
    deviceRevisionFingerprint: device.fingerprint,
    objectRevisionFingerprint: device.objectRevisionFingerprint,
    measurementRecordId: measurement.measurementRecordId,
    measurementRevisionFingerprint: measurement.fingerprint,
    measurementObjectRevisionFingerprint: measurement.objectRevisionFingerprint,
    tagRevisionFingerprint: tag?.fingerprint ?? null,
    applicability,
    limitations,
    provenanceRef,
    sourceBasisRef,
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.relationships.find((row) => row.recordStatus === "CURRENT" && row.relationshipId !== predecessor?.relationshipId && row.deviceRecordId === device.deviceRecordId && row.measurementRecordId === measurement.measurementRecordId && row.deviceRevisionFingerprint === device.fingerprint && row.measurementRevisionFingerprint === measurement.fingerprint);
  const record: D8R3RelationshipRecord = Object.freeze({
    relationshipId,
    kind: kind as D8R3RelationshipRecord["kind"],
    deviceRecordId: device.deviceRecordId,
    deviceRevisionFingerprint: device.fingerprint,
    objectId: device.objectId,
    objectRevisionFingerprint: device.objectRevisionFingerprint,
    measurementRecordId: measurement.measurementRecordId,
    measurementRevisionFingerprint: measurement.fingerprint,
    measurementObjectId: measurement.objectId,
    measurementObjectRevisionFingerprint: measurement.objectRevisionFingerprint,
    tagRecordId: tag?.tagRecordId ?? null,
    tagRevisionFingerprint: tag?.fingerprint ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    provenanceRef,
    sourceBasisRef,
    applicability,
    limitations,
    inferred: false,
    instrumentSelection: false,
    validatedDeviceAssignment: false,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  return place(store, store.relationships, "DEVICE_RELATIONSHIP", relationshipId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.relationshipId, (row) => `${row.deviceRevisionFingerprint}|${row.measurementRevisionFingerprint}|${row.tagRevisionFingerprint}`, duplicate, "DUPLICATE_DEVICE_RELATIONSHIP_REJECTED", record);
}

export function selectIacInstrument(): never {
  return fail("INSTRUMENT_SELECTION_NOT_IN_R3");
}

export function sizeIacInstrument(): never {
  return fail("INSTRUMENT_SIZING_NOT_IN_R3");
}

export function deriveIacInstrumentRange(): never {
  return fail("RANGE_DERIVATION_NOT_IN_R3");
}

export function deriveIacSetpoint(): never {
  return fail("SETPOINT_DERIVATION_NOT_IN_R3");
}

export function sizeIacControlValve(): never {
  return fail("CONTROL_VALVE_SIZING_NOT_IN_R3");
}

export function sizeIacActuator(): never {
  return fail("ACTUATOR_SIZING_NOT_IN_R3");
}

export function calculateIacDevicePerformance(): never {
  return fail("DEVICE_PERFORMANCE_NOT_IN_R3");
}

export function mutateIacIdentity(): never {
  return fail("R1_MUTATION_REJECTED");
}

export function mutateIacMeasurementContext(): never {
  return fail("R2_MUTATION_REJECTED");
}
