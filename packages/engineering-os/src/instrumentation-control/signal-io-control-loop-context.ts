/**
 * EOS-D8-R4 signal, I/O, and control-loop context.
 * One bounded runtime on exact R1 identities, exact R2 measurement revisions, and exact R3 device revisions.
 * Explicit relationships only.
 */
import {
  CONTROL_LOOP_CONTEXT_EQUALS_CONTROL_LOGIC_DESIGN,
  CONTROL_LOOP_CONTEXT_EQUALS_LOOP_TUNING,
  CONTROL_LOOP_CONTEXT_EQUALS_VALIDATED_CONTROL_PERFORMANCE,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D8_CURRENTNESS_STATES,
  D8_IMPLEMENTATION_PHASE_TYPES,
  D8_IMPLEMENTATION_PHASES,
  D8_MATURITY_STATES,
  IO_CONTEXT_EQUALS_VALIDATED_CONTROL_SYSTEM_CONFIGURATION,
  SIGNAL_CONTEXT_EQUALS_VALIDATED_IO_DESIGN,
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
  D6_REOPENED,
  D6_STATUS,
  D6_TRACK_COMPLETE,
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
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
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
  D8_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  type D8R3Store,
} from "./instrument-device-context";

export const D8_R4_STATUS = "SIGNAL_IO_AND_CONTROL_LOOP_CONTEXT_IMPLEMENTED" as const;
export const D8_R4_MATURITY = D8_R4_STATUS;
export const D8_R4_MATURITY_STATE = D8_R4_STATUS;
export const D8_R4_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D8_R4_SIGNAL_IO_AND_CONTROL_LOOP_CONTEXT_CLOSEOUT.md" as const;
export const D8_R1_R3_EXACT_REVISIONS_REUSED = true as const;
export const EXACT_D8_R4_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D8_R4_SOURCE_REFERENCE_ALLOWED = false as const;
export const D8_R4_SOURCE_AUTO_REPOINTED = false as const;
export const D8_RUNTIME_STARTED = true as const;
export const D8_RUNTIME_COUNT = 4 as const;
export const D8_R3_RUNTIME_COUNT = R3_RUNTIME_COUNT;
export const D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_IMPLEMENTED = true as const;
export const D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT = 1 as const;
export const D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY = true as const;
export const D8_SIGNAL_CONTEXT_IMPLEMENTED = true as const;
export const SIGNAL_CONTEXT_EQUALS_CONTROL_LOGIC = false as const;
export const SIGNAL_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D8_SIGNAL_TYPE_CONTEXT_SUPPORTED = true as const;
export const SUPPLIED_SIGNAL_TYPE_EQUALS_VALIDATED_SIGNAL_DESIGN = false as const;
export const D8_R4_SIGNAL_TYPES = ["ANALOG_INPUT", "ANALOG_OUTPUT", "DIGITAL_DISCRETE_INPUT", "DIGITAL_DISCRETE_OUTPUT", "PULSE_FREQUENCY", "SERIAL_NETWORK_REFERENCE", "OTHER_CANONICAL_SIGNAL"] as const;
export const D8_R4_SIGNAL_DIRECTIONS = ["INPUT", "OUTPUT", "BIDIRECTIONAL"] as const;
export const D8_R4_SIGNAL_ENDPOINT_TYPES = ["IAC_MEASUREMENT_POINT", "IAC_INSTRUMENT", "IAC_IO_POINT", "IAC_CONTROL_VALVE_CONTEXT", "IAC_SIGNAL", "IAC_CONTROL_LOOP"] as const;
export const D8_EXPLICIT_SIGNAL_SOURCE_REQUIRED = true as const;
export const D8_EXPLICIT_SIGNAL_DESTINATION_REQUIRED = true as const;
export const D8_INFERRED_SIGNAL_SOURCE_ALLOWED = false as const;
export const D8_INFERRED_SIGNAL_DESTINATION_ALLOWED = false as const;
export const EXACT_D8_SIGNAL_ENDPOINT_REVISION_REQUIRED = true as const;
export const D8_SIGNAL_ENDPOINT_AUTO_REPOINTED = false as const;
export const D8_R4_SIGNAL_RELATIONSHIP_KINDS = ["SIGNAL_SOURCE", "SIGNAL_DESTINATION"] as const;
export const D8_R4_AUTO_ROUTES_SIGNAL = false as const;
export const D8_R4_AUTO_CREATES_SIGNAL_PATH = false as const;
export const D8_IO_CONTEXT_IMPLEMENTED = true as const;
export const IO_CONTEXT_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS = false as const;
export const D8_SUPPLIED_IO_TYPE_CONTEXT_SUPPORTED = true as const;
export const D8_R4_IO_TYPES = ["ANALOG_INPUT", "ANALOG_OUTPUT", "DIGITAL_INPUT", "DIGITAL_OUTPUT", "PULSE", "SERIAL_REFERENCE", "OTHER_CANONICAL_IO"] as const;
export const SUPPLIED_IO_TYPE_EQUALS_VALIDATED_IO_CONFIGURATION = false as const;
export const D8_SUPPLIED_IO_CHANNEL_CONTEXT_SUPPORTED = true as const;
export const SUPPLIED_IO_CHANNEL_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS = false as const;
export const SUPPLIED_IO_CHANNEL_EQUALS_VALIDATED_CONTROL_SYSTEM_CONFIGURATION = false as const;
export const D8_R4_PERFORMS_IO_ALLOCATION = false as const;
export const D8_R4_PERFORMS_IO_ALLOCATION_OPTIMIZATION = false as const;
export const D8_R4_AUTO_ASSIGNS_IO_CHANNEL = false as const;
export const D8_CONTROL_LOOP_CONTEXT_IMPLEMENTED = true as const;
export const D8_EXPLICIT_CONTROL_LOOP_MEMBERSHIP_REQUIRED = true as const;
export const D8_INFERRED_CONTROL_LOOP_MEMBERSHIP_ALLOWED = false as const;
export const EXACT_D8_CONTROL_LOOP_MEMBER_REVISION_REQUIRED = true as const;
export const D8_R4_LOOP_MEMBER_KINDS = ["MEASUREMENT", "DEVICE", "SIGNAL", "IO_POINT"] as const;
export const D8_R4_LOOP_PURPOSES = ["REGULATORY_CONTROL", "INDICATION_ONLY", "ON_OFF_CONTROL", "MONITORING", "OTHER_CANONICAL_PURPOSE"] as const;
export const D8_CONTROL_LOOP_PURPOSE_CONTEXT_SUPPORTED = true as const;
export const CONTROL_LOOP_PURPOSE_EQUALS_VALIDATED_CONTROL_STRATEGY = false as const;
export const LOOP_MEMBERSHIP_EQUALS_VALIDATED_CONTROL_STRATEGY = false as const;
export const EXACT_D8_R2_MEASUREMENT_REVISION_REQUIRED = true as const;
export const D8_R4_R2_REFERENCE_AUTO_REPOINTED = false as const;
export const EXACT_D8_R3_DEVICE_REVISION_REQUIRED = true as const;
export const D8_R4_R3_REFERENCE_AUTO_REPOINTED = false as const;
export const MEASUREMENT_POINT_CONTEXT_EQUALS_SIGNAL_DESIGN = false as const;
export const PROCESS_MEASUREMENT_CONTEXT_EQUALS_IO_CONFIGURATION = false as const;
export const INSTRUMENT_DEVICE_CONTEXT_EQUALS_SIGNAL_DESIGN = false as const;
export const INSTRUMENT_DEVICE_CONTEXT_EQUALS_IO_ALLOCATION = false as const;
export const D8_R4_PERFORMS_SIGNAL_DESIGN_CALCULATION = false as const;
export const D8_R4_DERIVES_MISSING_SIGNAL_ATTRIBUTE = false as const;
export const D8_R4_INTERPOLATES_SIGNAL_ATTRIBUTE = false as const;
export const D8_R4_EXTRAPOLATES_SIGNAL_ATTRIBUTE = false as const;
export const D8_R4_ESTIMATES_MISSING_SIGNAL_ATTRIBUTE = false as const;
export const D8_R4_PERFORMS_CONTROL_LOOP_TUNING = false as const;
export const D8_R4_PERFORMS_CONTROL_LOGIC_DESIGN = false as const;
export const D8_R4_GENERATES_CONTROL_LOGIC = false as const;
export const D8_R4_CONFIGURES_DCS = false as const;
export const D8_R4_CONFIGURES_PLC = false as const;
export const D8_R4_CONFIGURES_SIS = false as const;
export const D8_R4_CONFIGURES_SCADA = false as const;
export const D8_R4_AUTO_ASSIGNS_CONTROL_SYSTEM_NODE = false as const;
export const D8_R4_AUTO_ASSIGNS_CONTROLLER = false as const;
export const D8_R4_PERFORMS_ALARM_RATIONALIZATION = false as const;
export const D8_R4_AUTO_CREATES_ALARM_CONTEXT = false as const;
export const D8_R4_PERFORMS_INTERLOCK_LOGIC_DESIGN = false as const;
export const D8_R4_PERFORMS_TRIP_LOGIC_DESIGN = false as const;
export const D8_R4_PERFORMS_SHUTDOWN_LOGIC_DESIGN = false as const;
export const D8_R4_AUTO_CREATES_INTERLOCK = false as const;
export const D8_R4_AUTO_CREATES_TRIP = false as const;
export const D8_R4_AUTO_CREATES_SHUTDOWN_FUNCTION = false as const;
export const D8_R4_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING = false as const;
export const D8_R4_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D8_R4_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT = false as const;
export const D8_R4_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT = false as const;
export const D8_R4_SOURCE_BASIS_REQUIRED = true as const;
export const D8_R4_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D8_SIGNAL_IO_LOOP_CONTEXT_AUTO_ACCEPTED = false as const;
export const D8_R4_APPLICABILITY_EXPLICIT = true as const;
export const D8_R4_LIMITATIONS_EXPLICIT = true as const;
export const D8_R4_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D8_R4_PROVENANCE_REQUIRED = true as const;
export const D8_R4_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D8_R4_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D8_R4_ACCESS_ALLOWED = false as const;
export const D8_R4_HISTORY_PRESERVED = true as const;
export const D8_R4_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D8_R4_MUTATION_ALLOWED = false as const;
export const D6_PROCESS_REQUIREMENT_EQUALS_D8_CONTROL_LOGIC = false as const;
export const D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOOP_DESIGN = false as const;
export const D7_POWER_INTERFACE_EQUALS_D8_IO_CONFIGURATION = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_SIGNAL_RELATIONSHIP = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_IO_ASSIGNMENT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_LOOP_MEMBERSHIP = false as const;
export const AI_CAN_PROMOTE_D8_SIGNAL_CONTEXT_TO_VALIDATED_IO_DESIGN = false as const;
export const AI_CAN_PROMOTE_D8_LOOP_CONTEXT_TO_VALIDATED_CONTROL_STRATEGY = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D8_R4_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D8_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_R4_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D8_R4_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D8_R5_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_SIGNAL_CONNECTIVITY_INFERENCE = false as const;
export const UNAUTHORIZED_SIGNAL_DESIGN_CALCULATION = false as const;
export const UNAUTHORIZED_IO_ALLOCATION = false as const;
export const UNAUTHORIZED_IO_ALLOCATION_OPTIMIZATION = false as const;
export const UNAUTHORIZED_IO_CHANNEL_AUTO_ASSIGNMENT = false as const;
export const UNAUTHORIZED_CONTROL_LOOP_TUNING = false as const;
export const UNAUTHORIZED_CONTROL_LOGIC_DESIGN = false as const;
export const UNAUTHORIZED_CONTROL_LOGIC_GENERATION = false as const;
export const UNAUTHORIZED_DCS_CONFIGURATION = false as const;
export const UNAUTHORIZED_PLC_CONFIGURATION = false as const;
export const UNAUTHORIZED_SIS_CONFIGURATION = false as const;
export const UNAUTHORIZED_SCADA_CONFIGURATION = false as const;
export const UNAUTHORIZED_TRIP_LOGIC_DESIGN = false as const;
export const D8_R5_CANONICAL_PHASE = D8_IMPLEMENTATION_PHASES[4];
export const D8_R5_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[4];
export const D8_R5_CANONICAL_SCOPE =
  "Implement governed control-system architecture context using exact R1 through R4 revisions. Support supplied DCS, PLC, SIS, and SCADA node context, HMI and control-panel context, controller or node identity, supplied system hierarchy, supplied network or interface context, supplied cabinet, panel, or marshalling references, and explicit relationships to signals, I/O, and loops. Preserve source, basis, applicability, limitations, provenance, and currentness. Do not configure DCS, PLC, SIS, or SCADA systems, generate control logic, optimize networks, perform cybersecurity validation, rationalize alarms, implement interlock or shutdown logic, perform SIL verification, or start D9 reasoning." as const;
export const D8_R5_STARTED = false as const;
export const D8_R4_READY_FOR_NEXT_PHASE = true as const;
export const D8_R4_NEXT_PHASE = D8_R5_CANONICAL_PHASE;
export const D8_R4_NEXT_PHASE_TYPE = D8_R5_PHASE_TYPE;
export const D8_R4_CANONICAL_NEXT_PHASE = D8_R5_CANONICAL_PHASE;
export const D8_R4_CANONICAL_NEXT_PHASE_SCOPE = D8_R5_CANONICAL_SCOPE;
export const D8_R4_BLOCKER = "NONE" as const;
export const D8_R4_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  SIGNAL_CONTEXT_EQUALS_VALIDATED_IO_DESIGN,
  IO_CONTEXT_EQUALS_VALIDATED_CONTROL_SYSTEM_CONFIGURATION,
  CONTROL_LOOP_CONTEXT_EQUALS_CONTROL_LOGIC_DESIGN,
  CONTROL_LOOP_CONTEXT_EQUALS_LOOP_TUNING,
  CONTROL_LOOP_CONTEXT_EQUALS_VALIDATED_CONTROL_PERFORMANCE,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
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
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
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
const CHANNEL_SPOOF = new Set(["auto", "allocated", "next", "optimized", "assigned", "unassigned", "tbd"]);
const INFERRED = new Set([
  "tag_naming",
  "matching_tag",
  "tag_prefix",
  "loop_number",
  "shared_equipment",
  "same_process_variable",
  "process_variable",
  "drawing_proximity",
  "document_co_occurrence",
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
type SignalType = (typeof D8_R4_SIGNAL_TYPES)[number];
type SignalDirection = (typeof D8_R4_SIGNAL_DIRECTIONS)[number];
type IoType = (typeof D8_R4_IO_TYPES)[number];
type LoopPurpose = (typeof D8_R4_LOOP_PURPOSES)[number];
type MemberKind = (typeof D8_R4_LOOP_MEMBER_KINDS)[number];
type SignalRelationshipKind = (typeof D8_R4_SIGNAL_RELATIONSHIP_KINDS)[number];

type Prohibited = {
  autoRoute?: boolean;
  autoCreatePath?: boolean;
  ioAllocation?: boolean;
  ioOptimization?: boolean;
  autoAssignChannel?: boolean;
  loopTuning?: boolean;
  controlLogic?: boolean;
  generateLogic?: boolean;
  configureDcs?: boolean;
  configurePlc?: boolean;
  configureSis?: boolean;
  configureScada?: boolean;
  assignNode?: boolean;
  assignController?: boolean;
  alarmRationalization?: boolean;
  autoCreateAlarm?: boolean;
  interlockLogic?: boolean;
  tripLogic?: boolean;
  shutdownLogic?: boolean;
  autoCreateInterlock?: boolean;
  autoCreateTrip?: boolean;
  autoCreateShutdown?: boolean;
  functionalSafety?: boolean;
  signalCalculation?: boolean;
  deriveMissing?: boolean;
  interpolateAttribute?: boolean;
  extrapolateAttribute?: boolean;
  estimateMissing?: boolean;
  instrumentSelection?: boolean;
  instrumentSizing?: boolean;
  controlValveSizing?: boolean;
  actuatorSizing?: boolean;
  mutateR1?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  inferredRelationship?: boolean;
  inferredLineage?: boolean;
  repoint?: boolean;
  propagate?: boolean;
  projectValidation?: boolean;
  engineeringValidated?: boolean;
  codeConformance?: boolean;
  approved?: boolean;
  certified?: boolean;
  automaticDesign?: boolean;
  d9Source?: boolean;
  disciplineInterface?: boolean;
  processAuthorityAdopted?: boolean;
  electricalAuthorityAdopted?: boolean;
  unitChange?: boolean;
  controllerNodeId?: string | null;
  controlSystemNodeId?: string | null;
  alarmContextId?: string | null;
  interlockId?: string | null;
  tripId?: string | null;
  shutdownFunctionId?: string | null;
};

type Governed = {
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D8R4SignalInput = Prohibited & Governed & {
  signalRecordId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  signalType: string;
  signalDirection: string;
  sourceObjectId: string;
  sourceObjectRevisionFingerprint: string;
  destinationObjectId: string;
  destinationObjectRevisionFingerprint: string;
  suppliedUnit?: string | null;
  suppliedProtocolReference?: string | null;
  measurementRecordId?: string | null;
  measurementRevisionFingerprint?: string | null;
  deviceRecordId?: string | null;
  deviceRevisionFingerprint?: string | null;
  predecessorSignalRecordId?: string | null;
};

export type D8R4SignalRecord = {
  signalRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "IAC_SIGNAL";
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  citedLifecycleStage: Stage;
  citedCurrentness: Currentness;
  signalType: SignalType;
  signalDirection: SignalDirection;
  sourceObjectId: string;
  sourceObjectType: D8R1ObjectRecord["objectType"];
  sourceObjectRevisionFingerprint: string;
  destinationObjectId: string;
  destinationObjectType: D8R1ObjectRecord["objectType"];
  destinationObjectRevisionFingerprint: string;
  suppliedUnit: string | null;
  suppliedProtocolReference: string | null;
  measurementRecordId: string | null;
  measurementRevisionFingerprint: string | null;
  deviceRecordId: string | null;
  deviceRevisionFingerprint: string | null;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: typeof D8_CONTEXT_AUTHORITY;
  iacEngineeringAuthority: false;
  validatedIoDesign: false;
  controlLogic: false;
  engineeringValidated: false;
  ioAllocated: false;
  routedByEos: false;
  conformant: false;
  approved: false;
  certified: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorSignalRecordId: string | null;
};

export type D8R4IoInput = Prohibited & Governed & {
  ioRecordId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  suppliedIoType: string;
  suppliedChannelReference?: string | null;
  suppliedTerminalReference?: string | null;
  suppliedMarshallingReference?: string | null;
  predecessorIoRecordId?: string | null;
};

export type D8R4IoRecord = {
  ioRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "IAC_IO_POINT";
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  citedLifecycleStage: Stage;
  citedCurrentness: Currentness;
  suppliedIoType: IoType;
  suppliedChannelReference: string | null;
  suppliedTerminalReference: string | null;
  suppliedMarshallingReference: string | null;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: typeof D8_CONTEXT_AUTHORITY;
  validatedConfiguration: false;
  allocatedByEos: false;
  channelAssignedByEos: false;
  engineeringValidated: false;
  conformant: false;
  approved: false;
  certified: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorIoRecordId: string | null;
};

export type D8R4LoopInput = Prohibited & Governed & {
  loopRecordId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  loopPurpose: string;
  measurementRecordId?: string | null;
  measurementRevisionFingerprint?: string | null;
  deviceRecordId?: string | null;
  deviceRevisionFingerprint?: string | null;
  signalRecordId?: string | null;
  signalRevisionFingerprint?: string | null;
  ioRecordId?: string | null;
  ioRevisionFingerprint?: string | null;
  predecessorLoopRecordId?: string | null;
};

export type D8R4LoopRecord = {
  loopRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "IAC_CONTROL_LOOP";
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  citedLifecycleStage: Stage;
  citedCurrentness: Currentness;
  loopPurpose: LoopPurpose;
  measurementRecordId: string | null;
  measurementRevisionFingerprint: string | null;
  deviceRecordId: string | null;
  deviceRevisionFingerprint: string | null;
  signalRecordId: string | null;
  signalRevisionFingerprint: string | null;
  ioRecordId: string | null;
  ioRevisionFingerprint: string | null;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: typeof D8_CONTEXT_AUTHORITY;
  logicDesign: false;
  tuned: false;
  validatedPerformance: false;
  validatedStrategy: false;
  engineeringValidated: false;
  conformant: false;
  approved: false;
  certified: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorLoopRecordId: string | null;
};

export type D8R4MembershipInput = Prohibited & Governed & {
  membershipId: string;
  loopRecordId: string;
  loopRevisionFingerprint: string;
  memberKind: string;
  memberRecordId: string;
  memberRevisionFingerprint: string;
  predecessorMembershipId?: string | null;
};

export type D8R4MembershipRecord = {
  membershipId: string;
  memberKind: MemberKind;
  loopRecordId: string;
  loopRevisionFingerprint: string;
  loopObjectId: string;
  loopObjectRevisionFingerprint: string;
  memberRecordId: string;
  memberRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  inferred: false;
  validatedStrategy: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorMembershipId: string | null;
};

export type D8R4SignalRelationshipInput = Prohibited & Governed & {
  relationshipId: string;
  signalRecordId: string;
  signalRevisionFingerprint: string;
  kind: string;
  endpointObjectId: string;
  endpointObjectRevisionFingerprint: string;
  predecessorRelationshipId?: string | null;
};

export type D8R4SignalRelationshipRecord = {
  relationshipId: string;
  kind: SignalRelationshipKind;
  signalRecordId: string;
  signalRevisionFingerprint: string;
  endpointObjectId: string;
  endpointObjectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  inferred: false;
  routedByEos: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorRelationshipId: string | null;
};

export type D8R4History = {
  historyId: string;
  subjectKind: "SIGNAL" | "IO" | "LOOP" | "LOOP_MEMBERSHIP" | "SIGNAL_RELATIONSHIP";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D8R4Store = {
  r3: D8R3Store;
  now: () => string;
  signals: D8R4SignalRecord[];
  ioRecords: D8R4IoRecord[];
  loops: D8R4LoopRecord[];
  memberships: D8R4MembershipRecord[];
  signalRelationships: D8R4SignalRelationshipRecord[];
  history: D8R4History[];
};

function fail(code: string): never {
  throw new Error(`D8_R4_${code}`);
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

function suppliedRef(value: string | null | undefined, code: string): string | null {
  const token = value?.trim() ?? "";
  if (!token) return null;
  if (CHANNEL_SPOOF.has(token.toLowerCase())) fail(code);
  return explicit(token, code);
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
  if (input.autoRoute === true || input.autoCreatePath === true) fail("SIGNAL_ROUTING_NOT_IN_R4");
  if (input.ioAllocation === true || input.ioOptimization === true || input.autoAssignChannel === true) fail("IO_ALLOCATION_NOT_IN_R4");
  if (input.loopTuning === true) fail("LOOP_TUNING_NOT_IN_R4");
  if (input.controlLogic === true || input.generateLogic === true) fail("CONTROL_LOGIC_NOT_IN_R4");
  if (input.configureDcs === true || input.configurePlc === true || input.configureSis === true || input.configureScada === true || input.assignNode === true || input.assignController === true) fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R4");
  if (input.alarmRationalization === true || input.autoCreateAlarm === true) fail("ALARM_CONTEXT_NOT_IN_R4");
  if (input.interlockLogic === true || input.tripLogic === true || input.shutdownLogic === true || input.autoCreateInterlock === true || input.autoCreateTrip === true || input.autoCreateShutdown === true) fail("SHUTDOWN_LOGIC_NOT_IN_R4");
  if (input.functionalSafety === true) fail("FUNCTIONAL_SAFETY_NOT_IN_R4");
  if (input.signalCalculation === true) fail("SIGNAL_DESIGN_CALCULATION_NOT_IN_R4");
  if (input.deriveMissing === true || input.interpolateAttribute === true || input.extrapolateAttribute === true || input.estimateMissing === true) fail("MISSING_SIGNAL_ATTRIBUTE_NOT_DERIVED");
  if (input.instrumentSelection === true || input.instrumentSizing === true || input.controlValveSizing === true || input.actuatorSizing === true) fail("INSTRUMENT_SIZING_NOT_IN_R4");
  if (input.mutateR1 === true) fail("R1_MUTATION_REJECTED");
  if (input.mutateR2 === true) fail("R2_MUTATION_REJECTED");
  if (input.mutateR3 === true) fail("R3_MUTATION_REJECTED");
  if (input.inferredRelationship === true || input.inferredLineage === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.projectValidation === true || input.engineeringValidated === true || input.codeConformance === true || input.approved === true || input.certified === true) fail("VALIDATION_NOT_IN_R4");
  if (input.automaticDesign === true) fail("DESIGN_NOT_IN_R4");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R4");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R4");
  if (input.processAuthorityAdopted === true || input.electricalAuthorityAdopted === true) fail("DISCIPLINE_AUTHORITY_NOT_TRANSFERRED");
  if (input.unitChange === true) fail("UNIT_CHANGE_REJECTED");
  if (input.controllerNodeId?.trim() || input.controlSystemNodeId?.trim()) fail("CONTROL_SYSTEM_NODE_NOT_IN_R4");
  if (input.alarmContextId?.trim()) fail("ALARM_CONTEXT_NOT_IN_R4");
  if (input.interlockId?.trim() || input.tripId?.trim() || input.shutdownFunctionId?.trim()) fail("SHUTDOWN_LOGIC_NOT_IN_R4");
}

function governed(input: Governed, objectId: string): { provenanceRef: string; sourceBasisRef: string; applicability: string; limitations: string } {
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return { provenanceRef, sourceBasisRef, applicability, limitations };
}

function allow<T extends string>(value: string, allowed: readonly T[], code: string): T {
  const token = explicit(value, code);
  if (!(allowed as readonly string[]).includes(token)) fail(code);
  return token as T;
}

function requireContext(store: D8R4Store, actor: D8R1Actor, contextId: string) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context || context.recordStatus !== "CURRENT" || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  return context;
}

function requireObject(store: D8R4Store, actor: D8R1Actor, contextId: string, objectId: string, revisionFingerprint: string, cited: Currentness, code: string): D8R1ObjectRecord {
  const id = explicit(objectId, code);
  const revision = explicit(revisionFingerprint, code);
  const object = store.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  if (cited === "SUPERSEDED" && object.recordStatus !== "SUPERSEDED") fail("R1_OBJECT_CURRENTNESS_MISMATCH");
  return object;
}

function requireEndpoint(store: D8R4Store, actor: D8R1Actor, contextId: string, objectId: string, revisionFingerprint: string, cited: Currentness): D8R1ObjectRecord {
  const object = requireObject(store, actor, contextId, objectId, revisionFingerprint, cited, "SIGNAL_ENDPOINT_REVISION_REQUIRED");
  if (!(D8_R4_SIGNAL_ENDPOINT_TYPES as readonly string[]).includes(object.objectType)) fail("SIGNAL_ENDPOINT_NOT_ALLOWLISTED");
  return object;
}

function requireMeasurement(store: D8R4Store, actor: D8R1Actor, measurementRecordId: string, revision: string) {
  const row = store.r3.r2.measurements.find((item) => item.measurementRecordId === measurementRecordId);
  if (!row || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT" || row.fingerprint !== revision) fail("R2_MEASUREMENT_REVISION_MISMATCH");
  return row;
}

function requireDevice(store: D8R4Store, actor: D8R1Actor, deviceRecordId: string, revision: string) {
  const row = store.r3.devices.find((item) => item.deviceRecordId === deviceRecordId);
  if (!row || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT" || row.fingerprint !== revision) fail("R3_DEVICE_REVISION_MISMATCH");
  return row;
}

function optionalMeasurement(store: D8R4Store, actor: D8R1Actor, measurementRecordId?: string | null, revision?: string | null) {
  if (!measurementRecordId?.trim() && !revision?.trim()) return null;
  return requireMeasurement(store, actor, explicit(measurementRecordId ?? "", "R2_MEASUREMENT_REVISION_REQUIRED"), explicit(revision ?? "", "R2_MEASUREMENT_REVISION_REQUIRED"));
}

function optionalDevice(store: D8R4Store, actor: D8R1Actor, deviceRecordId?: string | null, revision?: string | null) {
  if (!deviceRecordId?.trim() && !revision?.trim()) return null;
  return requireDevice(store, actor, explicit(deviceRecordId ?? "", "R3_DEVICE_REVISION_REQUIRED"), explicit(revision ?? "", "R3_DEVICE_REVISION_REQUIRED"));
}

function sameLineage(store: D8R4Store, object: D8R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D8R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    const predecessorId: string | null = cursor.predecessorObjectId;
    cursor = predecessorId ? store.r3.r2.r1.objects.find((row) => row.objectId === predecessorId) : undefined;
  }
  return false;
}

function remember(store: D8R4Store, subjectKind: D8R4History["subjectKind"], subjectId: string, action: D8R4History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function place<T extends { fingerprint: string; tenantId: string; recordStatus: "CURRENT" | "SUPERSEDED"; currentness: "CURRENT" | "SUPERSEDED" }>(
  store: D8R4Store,
  rows: T[],
  kind: D8R4History["subjectKind"],
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

function citedOf(input: { citedCurrentness: string; citedLifecycleStage: string }): { cited: Currentness; stage: Stage } {
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  return { cited: citedCurrentness, stage };
}

export function createD8R4Store(r3: D8R3Store, now: () => string = () => "2026-10-25T00:00:00.000Z"): D8R4Store {
  return { r3, now, signals: [], ioRecords: [], loops: [], memberships: [], signalRelationships: [], history: [] };
}

export function recordIacSignalContext(store: D8R4Store, actor: D8R1Actor, input: D8R4SignalInput): D8R4SignalRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const { cited, stage } = citedOf(input);
  const context = requireContext(store, actor, input.contextId);
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, cited, "R1_REVISION_REQUIRED");
  if (object.objectType !== "IAC_SIGNAL") fail("OBJECT_TYPE_NOT_SIGNAL");
  const signalType = allow(input.signalType, D8_R4_SIGNAL_TYPES, "SIGNAL_TYPE_NOT_ALLOWLISTED");
  const signalDirection = allow(input.signalDirection, D8_R4_SIGNAL_DIRECTIONS, "SIGNAL_DIRECTION_REQUIRED");
  const source = requireEndpoint(store, actor, context.contextId, input.sourceObjectId, input.sourceObjectRevisionFingerprint, cited);
  const destination = requireEndpoint(store, actor, context.contextId, input.destinationObjectId, input.destinationObjectRevisionFingerprint, cited);
  if (source.objectId === destination.objectId || source.objectId === object.objectId || destination.objectId === object.objectId) fail("SIGNAL_ENDPOINT_NOT_EXPLICIT");
  const suppliedUnit = suppliedRef(input.suppliedUnit, "UNIT_SPOOF_REJECTED");
  const suppliedProtocolReference = suppliedRef(input.suppliedProtocolReference, "PROTOCOL_REFERENCE_REQUIRED");
  const measurement = optionalMeasurement(store, actor, input.measurementRecordId, input.measurementRevisionFingerprint);
  const device = optionalDevice(store, actor, input.deviceRecordId, input.deviceRevisionFingerprint);
  const basis = governed(input, object.objectId);
  const signalRecordId = explicit(input.signalRecordId, "SIGNAL_CONTEXT_REQUIRED");
  const predecessor = input.predecessorSignalRecordId ? store.signals.find((row) => row.signalRecordId === input.predecessorSignalRecordId) : null;
  if (input.predecessorSignalRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, object, predecessor.objectId))) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    signalRecordId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    signalType,
    signalDirection,
    sourceObjectId: source.objectId,
    sourceObjectRevisionFingerprint: source.fingerprint,
    destinationObjectId: destination.objectId,
    destinationObjectRevisionFingerprint: destination.fingerprint,
    suppliedUnit,
    suppliedProtocolReference,
    measurementRevisionFingerprint: measurement?.fingerprint ?? null,
    deviceRevisionFingerprint: device?.fingerprint ?? null,
    ...basis,
    predecessorSignalRecordId: predecessor?.signalRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.signals.find((row) => row.recordStatus === "CURRENT" && row.signalRecordId !== predecessor?.signalRecordId && ((row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint) || (row.sourceObjectRevisionFingerprint === source.fingerprint && row.destinationObjectRevisionFingerprint === destination.fingerprint)));
  const record: D8R4SignalRecord = Object.freeze({
    signalRecordId,
    contextId: context.contextId,
    objectId: object.objectId,
    objectType: "IAC_SIGNAL",
    objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    citedLifecycleStage: stage,
    citedCurrentness: cited,
    signalType,
    signalDirection,
    sourceObjectId: source.objectId,
    sourceObjectType: source.objectType,
    sourceObjectRevisionFingerprint: source.fingerprint,
    destinationObjectId: destination.objectId,
    destinationObjectType: destination.objectType,
    destinationObjectRevisionFingerprint: destination.fingerprint,
    suppliedUnit,
    suppliedProtocolReference,
    measurementRecordId: measurement?.measurementRecordId ?? null,
    measurementRevisionFingerprint: measurement?.fingerprint ?? null,
    deviceRecordId: device?.deviceRecordId ?? null,
    deviceRevisionFingerprint: device?.fingerprint ?? null,
    ...basis,
    authority: D8_CONTEXT_AUTHORITY,
    iacEngineeringAuthority: false,
    validatedIoDesign: false,
    controlLogic: false,
    engineeringValidated: false,
    ioAllocated: false,
    routedByEos: false,
    conformant: false,
    approved: false,
    certified: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorSignalRecordId: predecessor?.signalRecordId ?? null,
  });
  return place(store, store.signals, "SIGNAL", signalRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.signalRecordId, (row) => `${row.objectRevisionFingerprint}|${row.sourceObjectRevisionFingerprint}|${row.destinationObjectRevisionFingerprint}|${row.suppliedUnit}|${row.measurementRevisionFingerprint}|${row.deviceRevisionFingerprint}`, duplicate, "DUPLICATE_SIGNAL_REJECTED", record);
}

export function recordIacIoContext(store: D8R4Store, actor: D8R1Actor, input: D8R4IoInput): D8R4IoRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const { cited, stage } = citedOf(input);
  const context = requireContext(store, actor, input.contextId);
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, cited, "R1_REVISION_REQUIRED");
  if (object.objectType !== "IAC_IO_POINT") fail("OBJECT_TYPE_NOT_IO");
  const suppliedIoType = allow(input.suppliedIoType, D8_R4_IO_TYPES, "IO_TYPE_NOT_ALLOWLISTED");
  const suppliedChannelReference = suppliedRef(input.suppliedChannelReference, "CHANNEL_REFERENCE_SPOOF_REJECTED");
  const suppliedTerminalReference = suppliedRef(input.suppliedTerminalReference, "TERMINAL_REFERENCE_SPOOF_REJECTED");
  const suppliedMarshallingReference = suppliedRef(input.suppliedMarshallingReference, "MARSHALLING_REFERENCE_SPOOF_REJECTED");
  const basis = governed(input, object.objectId);
  const ioRecordId = explicit(input.ioRecordId, "IO_CONTEXT_REQUIRED");
  const predecessor = input.predecessorIoRecordId ? store.ioRecords.find((row) => row.ioRecordId === input.predecessorIoRecordId) : null;
  if (input.predecessorIoRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, object, predecessor.objectId))) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    ioRecordId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    suppliedIoType,
    suppliedChannelReference,
    suppliedTerminalReference,
    suppliedMarshallingReference,
    ...basis,
    predecessorIoRecordId: predecessor?.ioRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const sameChannel = suppliedChannelReference
    ? store.ioRecords.find((row) => row.recordStatus === "CURRENT" && row.ioRecordId !== predecessor?.ioRecordId && row.suppliedChannelReference === suppliedChannelReference)
    : undefined;
  if (sameChannel) fail("CHANNEL_ASSIGNMENT_CONFLICT");
  const duplicate = store.ioRecords.find((row) => row.recordStatus === "CURRENT" && row.ioRecordId !== predecessor?.ioRecordId && row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint);
  const record: D8R4IoRecord = Object.freeze({
    ioRecordId,
    contextId: context.contextId,
    objectId: object.objectId,
    objectType: "IAC_IO_POINT",
    objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    citedLifecycleStage: stage,
    citedCurrentness: cited,
    suppliedIoType,
    suppliedChannelReference,
    suppliedTerminalReference,
    suppliedMarshallingReference,
    ...basis,
    authority: D8_CONTEXT_AUTHORITY,
    validatedConfiguration: false,
    allocatedByEos: false,
    channelAssignedByEos: false,
    engineeringValidated: false,
    conformant: false,
    approved: false,
    certified: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorIoRecordId: predecessor?.ioRecordId ?? null,
  });
  return place(store, store.ioRecords, "IO", ioRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.ioRecordId, (row) => `${row.objectRevisionFingerprint}|${row.suppliedChannelReference}|${row.suppliedIoType}|${row.suppliedTerminalReference}|${row.suppliedMarshallingReference}`, duplicate, "DUPLICATE_IO_REJECTED", record);
}

export function recordIacControlLoopContext(store: D8R4Store, actor: D8R1Actor, input: D8R4LoopInput): D8R4LoopRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const { cited, stage } = citedOf(input);
  const context = requireContext(store, actor, input.contextId);
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, cited, "R1_REVISION_REQUIRED");
  if (object.objectType !== "IAC_CONTROL_LOOP") fail("OBJECT_TYPE_NOT_LOOP");
  const loopPurpose = allow(input.loopPurpose, D8_R4_LOOP_PURPOSES, "LOOP_PURPOSE_NOT_ALLOWLISTED");
  const measurement = optionalMeasurement(store, actor, input.measurementRecordId, input.measurementRevisionFingerprint);
  const device = optionalDevice(store, actor, input.deviceRecordId, input.deviceRevisionFingerprint);
  const signal = input.signalRecordId?.trim() || input.signalRevisionFingerprint?.trim()
    ? store.signals.find((row) => row.signalRecordId === explicit(input.signalRecordId ?? "", "SIGNAL_REVISION_REQUIRED") && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT" && row.fingerprint === explicit(input.signalRevisionFingerprint ?? "", "SIGNAL_REVISION_REQUIRED"))
    : null;
  if ((input.signalRecordId?.trim() || input.signalRevisionFingerprint?.trim()) && !signal) fail("SIGNAL_REVISION_MISMATCH");
  const io = input.ioRecordId?.trim() || input.ioRevisionFingerprint?.trim()
    ? store.ioRecords.find((row) => row.ioRecordId === explicit(input.ioRecordId ?? "", "IO_REVISION_REQUIRED") && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT" && row.fingerprint === explicit(input.ioRevisionFingerprint ?? "", "IO_REVISION_REQUIRED"))
    : null;
  if ((input.ioRecordId?.trim() || input.ioRevisionFingerprint?.trim()) && !io) fail("IO_REVISION_MISMATCH");
  const basis = governed(input, object.objectId);
  const loopRecordId = explicit(input.loopRecordId, "LOOP_CONTEXT_REQUIRED");
  const predecessor = input.predecessorLoopRecordId ? store.loops.find((row) => row.loopRecordId === input.predecessorLoopRecordId) : null;
  if (input.predecessorLoopRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, object, predecessor.objectId))) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    loopRecordId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    loopPurpose,
    measurementRevisionFingerprint: measurement?.fingerprint ?? null,
    deviceRevisionFingerprint: device?.fingerprint ?? null,
    signalRevisionFingerprint: signal?.fingerprint ?? null,
    ioRevisionFingerprint: io?.fingerprint ?? null,
    ...basis,
    predecessorLoopRecordId: predecessor?.loopRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.loops.find((row) => row.recordStatus === "CURRENT" && row.loopRecordId !== predecessor?.loopRecordId && row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint);
  const record: D8R4LoopRecord = Object.freeze({
    loopRecordId,
    contextId: context.contextId,
    objectId: object.objectId,
    objectType: "IAC_CONTROL_LOOP",
    objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    citedLifecycleStage: stage,
    citedCurrentness: cited,
    loopPurpose,
    measurementRecordId: measurement?.measurementRecordId ?? null,
    measurementRevisionFingerprint: measurement?.fingerprint ?? null,
    deviceRecordId: device?.deviceRecordId ?? null,
    deviceRevisionFingerprint: device?.fingerprint ?? null,
    signalRecordId: signal?.signalRecordId ?? null,
    signalRevisionFingerprint: signal?.fingerprint ?? null,
    ioRecordId: io?.ioRecordId ?? null,
    ioRevisionFingerprint: io?.fingerprint ?? null,
    ...basis,
    authority: D8_CONTEXT_AUTHORITY,
    logicDesign: false,
    tuned: false,
    validatedPerformance: false,
    validatedStrategy: false,
    engineeringValidated: false,
    conformant: false,
    approved: false,
    certified: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorLoopRecordId: predecessor?.loopRecordId ?? null,
  });
  return place(store, store.loops, "LOOP", loopRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.loopRecordId, (row) => `${row.objectRevisionFingerprint}|${row.loopPurpose}|${row.measurementRevisionFingerprint}|${row.deviceRevisionFingerprint}|${row.signalRevisionFingerprint}|${row.ioRevisionFingerprint}`, duplicate, "DUPLICATE_LOOP_REJECTED", record);
}

export function recordIacControlLoopMembership(store: D8R4Store, actor: D8R1Actor, input: D8R4MembershipInput): D8R4MembershipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const membershipId = explicit(input.membershipId, "LOOP_MEMBERSHIP_REQUIRED");
  const memberKindToken = input.memberKind.trim();
  if (INFERRED.has(memberKindToken.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  const memberKind = allow(memberKindToken, D8_R4_LOOP_MEMBER_KINDS, "LOOP_MEMBERSHIP_NOT_EXPLICIT");
  const loop = store.loops.find((row) => row.loopRecordId === explicit(input.loopRecordId, "LOOP_REVISION_REQUIRED") && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT");
  if (!loop || loop.fingerprint !== explicit(input.loopRevisionFingerprint, "LOOP_REVISION_REQUIRED")) fail("LOOP_REVISION_MISMATCH");
  const memberRecordId = explicit(input.memberRecordId, "LOOP_MEMBER_REVISION_REQUIRED");
  const memberRevision = explicit(input.memberRevisionFingerprint, "LOOP_MEMBER_REVISION_REQUIRED");
  if (memberKind === "MEASUREMENT") requireMeasurement(store, actor, memberRecordId, memberRevision);
  if (memberKind === "DEVICE") requireDevice(store, actor, memberRecordId, memberRevision);
  if (memberKind === "SIGNAL" && !store.signals.some((row) => row.signalRecordId === memberRecordId && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT" && row.fingerprint === memberRevision)) fail("SIGNAL_REVISION_MISMATCH");
  if (memberKind === "IO_POINT" && !store.ioRecords.some((row) => row.ioRecordId === memberRecordId && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT" && row.fingerprint === memberRevision)) fail("IO_REVISION_MISMATCH");
  const basis = governed(input, loop.objectId);
  const predecessor = input.predecessorMembershipId ? store.memberships.find((row) => row.membershipId === input.predecessorMembershipId) : null;
  if (input.predecessorMembershipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    membershipId,
    memberKind,
    loopRecordId: loop.loopRecordId,
    loopRevisionFingerprint: loop.fingerprint,
    memberRecordId,
    memberRevisionFingerprint: memberRevision,
    ...basis,
    predecessorMembershipId: predecessor?.membershipId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.memberships.find((row) => row.recordStatus === "CURRENT" && row.membershipId !== predecessor?.membershipId && row.loopRecordId === loop.loopRecordId && row.memberKind === memberKind && row.memberRecordId === memberRecordId && row.memberRevisionFingerprint === memberRevision);
  const record: D8R4MembershipRecord = Object.freeze({
    membershipId,
    memberKind,
    loopRecordId: loop.loopRecordId,
    loopRevisionFingerprint: loop.fingerprint,
    loopObjectId: loop.objectId,
    loopObjectRevisionFingerprint: loop.objectRevisionFingerprint,
    memberRecordId,
    memberRevisionFingerprint: memberRevision,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    ...basis,
    inferred: false,
    validatedStrategy: false,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorMembershipId: predecessor?.membershipId ?? null,
  });
  return place(store, store.memberships, "LOOP_MEMBERSHIP", membershipId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.membershipId, (row) => `${row.loopRevisionFingerprint}|${row.memberKind}|${row.memberRevisionFingerprint}`, duplicate, "DUPLICATE_LOOP_MEMBERSHIP_REJECTED", record);
}

export function recordIacSignalEndpointRelationship(store: D8R4Store, actor: D8R1Actor, input: D8R4SignalRelationshipInput): D8R4SignalRelationshipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const relationshipId = explicit(input.relationshipId, "SIGNAL_RELATIONSHIP_REQUIRED");
  const kindToken = input.kind.trim();
  if (INFERRED.has(kindToken.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  const kind = allow(kindToken, D8_R4_SIGNAL_RELATIONSHIP_KINDS, "SIGNAL_RELATIONSHIP_NOT_EXPLICIT");
  const signal = store.signals.find((row) => row.signalRecordId === explicit(input.signalRecordId, "SIGNAL_REVISION_REQUIRED") && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT");
  if (!signal || signal.fingerprint !== explicit(input.signalRevisionFingerprint, "SIGNAL_REVISION_REQUIRED")) fail("SIGNAL_REVISION_MISMATCH");
  const endpointObjectId = explicit(input.endpointObjectId, "SIGNAL_ENDPOINT_REVISION_REQUIRED");
  const endpointRevision = explicit(input.endpointObjectRevisionFingerprint, "SIGNAL_ENDPOINT_REVISION_REQUIRED");
  const expectedId = kind === "SIGNAL_SOURCE" ? signal.sourceObjectId : signal.destinationObjectId;
  const expectedRevision = kind === "SIGNAL_SOURCE" ? signal.sourceObjectRevisionFingerprint : signal.destinationObjectRevisionFingerprint;
  if (endpointObjectId !== expectedId || endpointRevision !== expectedRevision) fail("SIGNAL_ENDPOINT_MISMATCH");
  const basis = governed(input, signal.objectId);
  const predecessor = input.predecessorRelationshipId ? store.signalRelationships.find((row) => row.relationshipId === input.predecessorRelationshipId) : null;
  if (input.predecessorRelationshipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    relationshipId,
    kind,
    signalRecordId: signal.signalRecordId,
    signalRevisionFingerprint: signal.fingerprint,
    endpointObjectId,
    endpointObjectRevisionFingerprint: endpointRevision,
    ...basis,
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.signalRelationships.find((row) => row.recordStatus === "CURRENT" && row.relationshipId !== predecessor?.relationshipId && row.signalRecordId === signal.signalRecordId && row.kind === kind && row.endpointObjectRevisionFingerprint === endpointRevision);
  const record: D8R4SignalRelationshipRecord = Object.freeze({
    relationshipId,
    kind,
    signalRecordId: signal.signalRecordId,
    signalRevisionFingerprint: signal.fingerprint,
    endpointObjectId,
    endpointObjectRevisionFingerprint: endpointRevision,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    ...basis,
    inferred: false,
    routedByEos: false,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  return place(store, store.signalRelationships, "SIGNAL_RELATIONSHIP", relationshipId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.relationshipId, (row) => `${row.signalRevisionFingerprint}|${row.kind}|${row.endpointObjectRevisionFingerprint}`, duplicate, "DUPLICATE_SIGNAL_RELATIONSHIP_REJECTED", record);
}

export function routeIacSignal(): never {
  return fail("SIGNAL_ROUTING_NOT_IN_R4");
}
export function allocateIacIo(): never {
  return fail("IO_ALLOCATION_NOT_IN_R4");
}
export function optimizeIacIoAllocation(): never {
  return fail("IO_ALLOCATION_NOT_IN_R4");
}
export function assignIacIoChannel(): never {
  return fail("IO_ALLOCATION_NOT_IN_R4");
}
export function tuneIacControlLoop(): never {
  return fail("LOOP_TUNING_NOT_IN_R4");
}
export function designIacControlLogic(): never {
  return fail("CONTROL_LOGIC_NOT_IN_R4");
}
export function generateIacControlLogic(): never {
  return fail("CONTROL_LOGIC_NOT_IN_R4");
}
export function configureIacDcs(): never {
  return fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R4");
}
export function configureIacPlc(): never {
  return fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R4");
}
export function configureIacSis(): never {
  return fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R4");
}
export function configureIacScada(): never {
  return fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R4");
}
export function calculateIacSignalDesign(): never {
  return fail("SIGNAL_DESIGN_CALCULATION_NOT_IN_R4");
}
export function deriveIacSignalAttribute(): never {
  return fail("MISSING_SIGNAL_ATTRIBUTE_NOT_DERIVED");
}
export function createIacAlarmContext(): never {
  return fail("ALARM_CONTEXT_NOT_IN_R4");
}
export function mutateIacIdentityFromSignalContext(): never {
  return fail("R1_MUTATION_REJECTED");
}
export function mutateIacMeasurementFromSignalContext(): never {
  return fail("R2_MUTATION_REJECTED");
}
export function mutateIacDeviceFromSignalContext(): never {
  return fail("R3_MUTATION_REJECTED");
}
