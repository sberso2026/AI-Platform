/**
 * EOS-D8-R5 control-system architecture context.
 * One bounded runtime on exact R1 through R4 revisions.
 * Supplied architecture context only.
 */
import {
  CONTROL_SYSTEM_CONTEXT_EQUALS_VALIDATED_CONTROL_SYSTEM_DESIGN,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D8_CONTROL_SYSTEM_CLASSES,
  D8_CURRENTNESS_STATES,
  D8_IMPLEMENTATION_PHASE_TYPES,
  D8_IMPLEMENTATION_PHASES,
  D8_MATURITY_STATES,
  NETWORK_CONTEXT_EQUALS_SECURE_NETWORK_DESIGN,
  OT_CYBERSECURITY_CONTEXT_EQUALS_CYBERSECURITY_VALIDATED,
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
  D8_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
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
  type D8R4Store,
} from "./signal-io-control-loop-context";

export const D8_R5_STATUS = "CONTROL_SYSTEM_ARCHITECTURE_CONTEXT_IMPLEMENTED" as const;
export const D8_R5_MATURITY = D8_R5_STATUS;
export const D8_R5_MATURITY_STATE = D8_R5_STATUS;
export const D8_R5_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D8_R5_CONTROL_SYSTEM_ARCHITECTURE_CONTEXT_CLOSEOUT.md" as const;
export const D8_R1_R4_EXACT_REVISIONS_REUSED = true as const;
export const EXACT_D8_R5_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D8_R5_SOURCE_REFERENCE_ALLOWED = false as const;
export const D8_R5_SOURCE_AUTO_REPOINTED = false as const;
export const D8_RUNTIME_STARTED = true as const;
export const D8_RUNTIME_COUNT = 5 as const;
export const D8_R4_RUNTIME_COUNT = R4_RUNTIME_COUNT;
export const D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_IMPLEMENTED = true as const;
export const D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT = 1 as const;
export const D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY = true as const;
export const D8_CONTROL_SYSTEM_CONTEXT_IMPLEMENTED = true as const;
export const CONTROL_SYSTEM_CONTEXT_EQUALS_CONTROL_SYSTEM_CONFIGURATION = false as const;
export const CONTROL_SYSTEM_CONTEXT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D8_CONTROL_SYSTEM_TYPE_CONTEXT_SUPPORTED = true as const;
export const D8_R5_SYSTEM_TYPES = D8_CONTROL_SYSTEM_CLASSES;
export const SUPPLIED_CONTROL_SYSTEM_TYPE_EQUALS_VALIDATED_SYSTEM_SELECTION = false as const;
export const D8_CONTROL_SYSTEM_NODE_CONTEXT_IMPLEMENTED = true as const;
export const D8_R5_NODE_ROLES = ["CONTROLLER", "DCS_NODE", "PLC_NODE", "SIS_NODE", "SCADA_NODE", "RTU_NODE", "REMOTE_IO", "OPERATOR_STATION", "ENGINEERING_STATION"] as const;
export const CONTROL_SYSTEM_NODE_CONTEXT_EQUALS_CONTROLLER_CONFIGURATION = false as const;
export const CONTROL_SYSTEM_NODE_CONTEXT_EQUALS_VALIDATED_CONTROLLER_SELECTION = false as const;
export const EXACT_D8_CONTROL_SYSTEM_NODE_REVISION_REQUIRED = true as const;
export const FLOATING_D8_CONTROL_SYSTEM_NODE_REVISION_ALLOWED = false as const;
export const D8_CONTROL_SYSTEM_NODE_AUTO_REPOINTED = false as const;
export const D8_EXPLICIT_CONTROL_SYSTEM_MEMBERSHIP_REQUIRED = true as const;
export const D8_INFERRED_CONTROL_SYSTEM_MEMBERSHIP_ALLOWED = false as const;
export const EXACT_D8_CONTROL_SYSTEM_MEMBER_REVISION_REQUIRED = true as const;
export const D8_R5_MEMBERSHIP_KINDS = ["SYSTEM_MEMBER"] as const;
export const D8_SUPPLIED_CONTROL_SYSTEM_HIERARCHY_SUPPORTED = true as const;
export const SUPPLIED_CONTROL_SYSTEM_HIERARCHY_EQUALS_VALIDATED_SYSTEM_ARCHITECTURE = false as const;
export const D8_R5_AUTO_GENERATES_SYSTEM_HIERARCHY = false as const;
export const D8_R5_HIERARCHY_KINDS = ["SUPPLIED_PARENT"] as const;
export const D8_R5_AUTO_ASSIGNS_CONTROL_SYSTEM_NODE = false as const;
export const D8_R5_AUTO_ASSIGNS_CONTROLLER = false as const;
export const D8_R5_AUTO_ASSIGNS_SIGNAL_TO_CONTROLLER = false as const;
export const D8_R5_AUTO_ASSIGNS_IO_TO_CONTROLLER = false as const;
export const EXACT_D8_R4_SIGNAL_REVISION_REQUIRED = true as const;
export const D8_R5_R4_SIGNAL_REFERENCE_AUTO_REPOINTED = false as const;
export const EXACT_D8_R4_IO_REVISION_REQUIRED = true as const;
export const D8_R5_R4_IO_REFERENCE_AUTO_REPOINTED = false as const;
export const EXACT_D8_R4_CONTROL_LOOP_REVISION_REQUIRED = true as const;
export const D8_R5_R4_LOOP_REFERENCE_AUTO_REPOINTED = false as const;
export const D8_R5_LINK_KINDS = ["SIGNAL_TO_SYSTEM", "SIGNAL_TO_NODE", "IO_TO_SYSTEM", "IO_TO_NODE", "LOOP_TO_SYSTEM", "LOOP_TO_NODE"] as const;
export const SIGNAL_TO_SYSTEM_RELATIONSHIP_EQUALS_VALIDATED_SYSTEM_CONFIGURATION = false as const;
export const SIGNAL_TO_NODE_RELATIONSHIP_EQUALS_CONTROLLER_CONFIGURATION = false as const;
export const IO_TO_SYSTEM_RELATIONSHIP_EQUALS_VALIDATED_IO_CONFIGURATION = false as const;
export const IO_TO_CONTROLLER_RELATIONSHIP_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS = false as const;
export const CONTROL_LOOP_TO_SYSTEM_RELATIONSHIP_EQUALS_VALIDATED_CONTROL_STRATEGY = false as const;
export const CONTROL_LOOP_TO_CONTROLLER_RELATIONSHIP_EQUALS_CONTROL_LOGIC_IMPLEMENTED = false as const;
export const D8_HMI_CONTEXT_SUPPORTED = true as const;
export const D8_R5_INTERFACE_KINDS = ["HMI", "OPERATOR_STATION", "ENGINEERING_STATION", "CONTROL_PANEL", "CABINET", "MARSHALLING"] as const;
export const HMI_CONTEXT_EQUALS_HMI_CONFIGURATION = false as const;
export const HMI_CONTEXT_EQUALS_VALIDATED_HMI_DESIGN = false as const;
export const D8_R5_CONFIGURES_HMI = false as const;
export const D8_R5_GENERATES_HMI_GRAPHICS = false as const;
export const D8_R5_GENERATES_OPERATOR_GRAPHICS = false as const;
export const D8_CONTROL_PANEL_CONTEXT_SUPPORTED = true as const;
export const CONTROL_PANEL_CONTEXT_EQUALS_VALIDATED_PANEL_DESIGN = false as const;
export const CONTROL_PANEL_CONTEXT_EQUALS_PANEL_LAYOUT_DESIGN = false as const;
export const D8_CONTROL_CABINET_CONTEXT_SUPPORTED = true as const;
export const CONTROL_CABINET_CONTEXT_EQUALS_VALIDATED_CABINET_DESIGN = false as const;
export const D8_MARSHALLING_CONTEXT_SUPPORTED = true as const;
export const MARSHALLING_CONTEXT_EQUALS_VALIDATED_TERMINATION_DESIGN = false as const;
export const MARSHALLING_CONTEXT_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS = false as const;
export const D8_R5_PERFORMS_TERMINATION_DESIGN = false as const;
export const D8_R5_AUTO_ASSIGNS_MARSHALLING_TERMINAL = false as const;
export const D8_R5_AUTO_ASSIGNS_TERMINATION = false as const;
export const D8_NETWORK_INTERFACE_CONTEXT_IMPLEMENTED = true as const;
export const NETWORK_CONTEXT_EQUALS_VALIDATED_NETWORK_DESIGN = false as const;
export const NETWORK_CONTEXT_EQUALS_CYBERSECURITY_VALIDATED = false as const;
export const D8_EXPLICIT_NETWORK_ENDPOINTS_REQUIRED = true as const;
export const D8_INFERRED_NETWORK_ENDPOINTS_ALLOWED = false as const;
export const EXACT_D8_NETWORK_ENDPOINT_REVISION_REQUIRED = true as const;
export const D8_SUPPLIED_COMMUNICATION_PROTOCOL_CONTEXT_SUPPORTED = true as const;
export const SUPPLIED_PROTOCOL_CONTEXT_EQUALS_VALIDATED_NETWORK_CONFIGURATION = false as const;
export const D8_R5_CONFIGURES_NETWORK = false as const;
export const D8_R5_CONFIGURES_SWITCH = false as const;
export const D8_R5_CONFIGURES_ROUTER = false as const;
export const D8_R5_CONFIGURES_FIREWALL = false as const;
export const D8_R5_ASSIGNS_NETWORK_ADDRESS = false as const;
export const D8_R5_PERFORMS_NETWORK_DESIGN = false as const;
export const D8_R5_PERFORMS_NETWORK_OPTIMIZATION = false as const;
export const D8_R5_PERFORMS_NETWORK_BANDWIDTH_CALCULATION = false as const;
export const D8_R5_PERFORMS_NETWORK_CAPACITY_CALCULATION = false as const;
export const D8_R5_PERFORMS_NETWORK_REDUNDANCY_DESIGN = false as const;
export const D8_OT_CYBERSECURITY_CONTEXT_SUPPORTED = true as const;
export const SECURITY_ZONE_CONTEXT_EQUALS_VALIDATED_SECURITY_ARCHITECTURE = false as const;
export const D8_R5_PERFORMS_CYBERSECURITY_VALIDATION = false as const;
export const D8_R5_PERFORMS_OT_SECURITY_CERTIFICATION = false as const;
export const D8_R5_DETERMINES_NETWORK_SECURITY_COMPLIANCE = false as const;
export const D8_R5_CONFIGURES_DCS = false as const;
export const D8_R5_CONFIGURES_PLC = false as const;
export const D8_R5_CONFIGURES_SIS = false as const;
export const D8_R5_CONFIGURES_SCADA = false as const;
export const D8_R5_CONFIGURES_RTU = false as const;
export const D8_R5_PERFORMS_CONTROL_LOGIC_DESIGN = false as const;
export const D8_R5_GENERATES_CONTROL_LOGIC = false as const;
export const D8_R5_MODIFIES_CONTROL_LOGIC = false as const;
export const D8_R5_PERFORMS_CONTROL_LOOP_TUNING = false as const;
export const D8_R5_PERFORMS_IO_ALLOCATION = false as const;
export const D8_R5_PERFORMS_IO_ALLOCATION_OPTIMIZATION = false as const;
export const D8_R5_AUTO_ASSIGNS_IO_CHANNEL = false as const;
export const D8_R5_PERFORMS_CONTROLLER_SIZING = false as const;
export const D8_R5_PERFORMS_CONTROL_SYSTEM_CAPACITY_SIZING = false as const;
export const D8_R5_PERFORMS_IO_CAPACITY_SIZING = false as const;
export const D8_R5_PERFORMS_ALARM_RATIONALIZATION = false as const;
export const D8_R5_AUTO_CREATES_ALARM_CONTEXT = false as const;
export const D8_R5_PERFORMS_INTERLOCK_LOGIC_DESIGN = false as const;
export const D8_R5_PERFORMS_TRIP_LOGIC_DESIGN = false as const;
export const D8_R5_PERFORMS_SHUTDOWN_LOGIC_DESIGN = false as const;
export const D8_R5_AUTO_CREATES_INTERLOCK = false as const;
export const D8_R5_AUTO_CREATES_TRIP = false as const;
export const D8_R5_AUTO_CREATES_SHUTDOWN_FUNCTION = false as const;
export const D8_R5_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING = false as const;
export const D8_R5_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D8_R5_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT = false as const;
export const D8_R5_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT = false as const;
export const D8_R5_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT = false as const;
export const D6_PROCESS_REQUIREMENT_EQUALS_D8_CONTROL_SYSTEM_DESIGN = false as const;
export const D6_CONTROL_REQUIREMENT_EQUALS_VALIDATED_D8_CONTROL_SYSTEM_ARCHITECTURE = false as const;
export const D7_POWER_INTERFACE_EQUALS_D8_CONTROL_SYSTEM_DESIGN = false as const;
export const D7_POWER_INTERFACE_EQUALS_VALIDATED_CONTROL_PANEL_DESIGN = false as const;
export const D8_R5_SOURCE_BASIS_REQUIRED = true as const;
export const D8_R5_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D8_CONTROL_SYSTEM_CONTEXT_AUTO_ACCEPTED = false as const;
export const D8_R5_APPLICABILITY_EXPLICIT = true as const;
export const D8_R5_LIMITATIONS_EXPLICIT = true as const;
export const D8_R5_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D8_R5_PROVENANCE_REQUIRED = true as const;
export const D8_R5_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D8_R5_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D8_R5_ACCESS_ALLOWED = false as const;
export const D8_R5_HISTORY_PRESERVED = true as const;
export const D8_R5_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D8_R5_MUTATION_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_SYSTEM_HIERARCHY = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_NODE_RELATIONSHIP = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_NETWORK_TOPOLOGY = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_CONTROLLER_ASSIGNMENT = false as const;
export const AI_CAN_PROMOTE_D8_CONTROL_SYSTEM_CONTEXT_TO_VALIDATED_DESIGN = false as const;
export const AI_CAN_PROMOTE_D8_NETWORK_CONTEXT_TO_SECURE_NETWORK_DESIGN = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D8_R5_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D8_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_R5_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D8_R5_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D8_R6_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_CONTROL_SYSTEM_CONFIGURATION = false as const;
export const UNAUTHORIZED_RTU_CONFIGURATION = false as const;
export const UNAUTHORIZED_CONTROLLER_ASSIGNMENT = false as const;
export const UNAUTHORIZED_CONTROLLER_SIZING = false as const;
export const UNAUTHORIZED_SYSTEM_CAPACITY_SIZING = false as const;
export const UNAUTHORIZED_NETWORK_DESIGN = false as const;
export const UNAUTHORIZED_NETWORK_OPTIMIZATION = false as const;
export const UNAUTHORIZED_NETWORK_CONFIGURATION = false as const;
export const UNAUTHORIZED_NETWORK_ADDRESS_ASSIGNMENT = false as const;
export const UNAUTHORIZED_NETWORK_BANDWIDTH_CALCULATION = false as const;
export const UNAUTHORIZED_NETWORK_REDUNDANCY_DESIGN = false as const;
export const UNAUTHORIZED_CYBERSECURITY_VALIDATION = false as const;
export const UNAUTHORIZED_OT_SECURITY_CERTIFICATION = false as const;
export const UNAUTHORIZED_NETWORK_SECURITY_COMPLIANCE = false as const;
export const UNAUTHORIZED_HMI_CONFIGURATION = false as const;
export const UNAUTHORIZED_HMI_GRAPHICS_GENERATION = false as const;
export const UNAUTHORIZED_PANEL_DESIGN = false as const;
export const UNAUTHORIZED_TERMINATION_DESIGN = false as const;
export const UNAUTHORIZED_MARSHALLING_ASSIGNMENT = false as const;
export const D8_R6_CANONICAL_PHASE = D8_IMPLEMENTATION_PHASES[5];
export const D8_R6_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[5];
export const D8_R6_CANONICAL_SCOPE =
  "Implement governed alarm, interlock, trip, shutdown and functional-safety source context using exact D8 R1 through R5 revisions and explicit upstream source revisions. Support alarms and supplied priorities, interlock intent, trip intent, shutdown intent, permissive context, cause-and-effect source references, safety-function or SIF source context, supplied SIL requirements, supplied safety-requirement references, vendor safety-certification evidence, proof-test evidence, and explicit relationships to measurement, device, signal, loop, and control-system context. Preserve source, basis, applicability, limitations, provenance, and currentness. Do not rationalize alarms, generate interlock, trip, or shutdown logic, calculate or verify SIL, calculate PFD or PFH, design SIF architecture, perform functional-safety validation, configure SIS, determine compliance, approve or certify engineering, or start D9 reasoning." as const;
export const D8_R6_STARTED = false as const;
export const D8_R5_READY_FOR_NEXT_PHASE = true as const;
export const D8_R5_NEXT_PHASE = D8_R6_CANONICAL_PHASE;
export const D8_R5_NEXT_PHASE_TYPE = D8_R6_PHASE_TYPE;
export const D8_R5_CANONICAL_NEXT_PHASE = D8_R6_CANONICAL_PHASE;
export const D8_R5_CANONICAL_NEXT_PHASE_SCOPE = D8_R6_CANONICAL_SCOPE;
export const D8_R5_BLOCKER = "NONE" as const;
export const D8_R5_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  CONTROL_SYSTEM_CONTEXT_EQUALS_VALIDATED_CONTROL_SYSTEM_DESIGN,
  NETWORK_CONTEXT_EQUALS_SECURE_NETWORK_DESIGN,
  OT_CYBERSECURITY_CONTEXT_EQUALS_CYBERSECURITY_VALIDATED,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
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
const SPOOF = new Set(["auto", "allocated", "assigned", "secure", "validated", "compliant", "certified", "optimized"]);
const INFERRED = new Set([
  "naming_convention",
  "network_address",
  "address_similarity",
  "vendor_family",
  "tag_prefix",
  "tag_naming",
  "document_co_occurrence",
  "topology_proximity",
  "semantic_similarity",
  "ai_interpretation",
  "ai_inference",
  "inferred",
  "ip_similarity",
]);

type Stage = (typeof D8_MATURITY_STATES)[number];
type Currentness = (typeof D8_CURRENTNESS_STATES)[number];
type SystemType = (typeof D8_R5_SYSTEM_TYPES)[number];
type NodeRole = (typeof D8_R5_NODE_ROLES)[number];
type InterfaceKind = (typeof D8_R5_INTERFACE_KINDS)[number];
type LinkKind = (typeof D8_R5_LINK_KINDS)[number];
type Status = "CURRENT" | "SUPERSEDED";

type Prohibited = {
  configureDcs?: boolean;
  configurePlc?: boolean;
  configureSis?: boolean;
  configureScada?: boolean;
  configureRtu?: boolean;
  configureHmi?: boolean;
  generateGraphics?: boolean;
  generateLogic?: boolean;
  modifyLogic?: boolean;
  controlLogic?: boolean;
  loopTuning?: boolean;
  ioAllocation?: boolean;
  ioOptimization?: boolean;
  autoAssignChannel?: boolean;
  autoAssignNode?: boolean;
  autoAssignController?: boolean;
  autoAssignSignal?: boolean;
  autoAssignIo?: boolean;
  autoGenerateHierarchy?: boolean;
  terminationDesign?: boolean;
  autoAssignTerminal?: boolean;
  configureNetwork?: boolean;
  configureSwitch?: boolean;
  configureRouter?: boolean;
  configureFirewall?: boolean;
  assignNetworkAddress?: boolean;
  networkDesign?: boolean;
  networkOptimization?: boolean;
  bandwidthCalculation?: boolean;
  capacityCalculation?: boolean;
  redundancyDesign?: boolean;
  cybersecurityValidation?: boolean;
  otCertification?: boolean;
  securityCompliance?: boolean;
  controllerSizing?: boolean;
  systemSizing?: boolean;
  ioSizing?: boolean;
  alarmRationalization?: boolean;
  autoCreateAlarm?: boolean;
  interlockLogic?: boolean;
  tripLogic?: boolean;
  shutdownLogic?: boolean;
  functionalSafety?: boolean;
  instrumentSelection?: boolean;
  instrumentSizing?: boolean;
  mutateR1?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  inferredRelationship?: boolean;
  inferredLineage?: boolean;
  repoint?: boolean;
  propagate?: boolean;
  projectValidation?: boolean;
  engineeringValidated?: boolean;
  approved?: boolean;
  certified?: boolean;
  automaticDesign?: boolean;
  d9Source?: boolean;
  processAuthorityAdopted?: boolean;
  electricalAuthorityAdopted?: boolean;
  networkAddress?: string | null;
  terminalId?: string | null;
  marshallingTerminal?: string | null;
  alarmContextId?: string | null;
  graphicsId?: string | null;
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

type Bound = {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
};

export type D8R5SystemInput = Prohibited & Governed & Bound & {
  systemRecordId: string;
  systemType: string;
  predecessorSystemRecordId?: string | null;
};

export type D8R5SystemRecord = {
  systemRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "IAC_CONTROL_SYSTEM_CONTEXT";
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  citedLifecycleStage: Stage;
  citedCurrentness: Currentness;
  systemType: SystemType;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: typeof D8_CONTEXT_AUTHORITY;
  validatedDesign: false;
  configured: false;
  engineeringValidated: false;
  conformant: false;
  approved: false;
  certified: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorSystemRecordId: string | null;
};

export type D8R5NodeInput = Prohibited & Governed & Bound & {
  nodeRecordId: string;
  nodeRole: string;
  predecessorNodeRecordId?: string | null;
};

export type D8R5NodeRecord = {
  nodeRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "IAC_CONTROL_SYSTEM_CONTEXT";
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  citedLifecycleStage: Stage;
  citedCurrentness: Currentness;
  nodeRole: NodeRole;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: typeof D8_CONTEXT_AUTHORITY;
  controllerConfigured: false;
  controllerSelected: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorNodeRecordId: string | null;
};

export type D8R5MembershipInput = Prohibited & Governed & {
  membershipId: string;
  systemRecordId: string;
  systemRevisionFingerprint: string;
  nodeRecordId: string;
  nodeRevisionFingerprint: string;
  kind: string;
  predecessorMembershipId?: string | null;
};

export type D8R5MembershipRecord = {
  membershipId: string;
  kind: (typeof D8_R5_MEMBERSHIP_KINDS)[number];
  systemRecordId: string;
  systemRevisionFingerprint: string;
  systemObjectId: string;
  systemObjectRevisionFingerprint: string;
  nodeRecordId: string;
  nodeRevisionFingerprint: string;
  nodeObjectId: string;
  nodeObjectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  inferred: false;
  validatedArchitecture: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorMembershipId: string | null;
};

export type D8R5HierarchyInput = Prohibited & Governed & {
  hierarchyId: string;
  parentRecordId: string;
  parentRevisionFingerprint: string;
  childRecordId: string;
  childRevisionFingerprint: string;
  kind: string;
  predecessorHierarchyId?: string | null;
};

export type D8R5HierarchyRecord = {
  hierarchyId: string;
  kind: (typeof D8_R5_HIERARCHY_KINDS)[number];
  parentRecordId: string;
  parentRevisionFingerprint: string;
  parentObjectId: string;
  childRecordId: string;
  childRevisionFingerprint: string;
  childObjectId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  generatedByEos: false;
  validatedArchitecture: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorHierarchyId: string | null;
};

export type D8R5InterfaceInput = Prohibited & Governed & Bound & {
  interfaceRecordId: string;
  interfaceKind: string;
  suppliedReference?: string | null;
  predecessorInterfaceRecordId?: string | null;
};

export type D8R5InterfaceRecord = {
  interfaceRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "IAC_CONTROL_SYSTEM_CONTEXT";
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  citedLifecycleStage: Stage;
  citedCurrentness: Currentness;
  interfaceKind: InterfaceKind;
  suppliedReference: string | null;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: typeof D8_CONTEXT_AUTHORITY;
  hmiConfigured: false;
  graphicsGenerated: false;
  panelDesign: false;
  cabinetDesign: false;
  terminationDesign: false;
  allocatedByEos: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorInterfaceRecordId: string | null;
};

export type D8R5NetworkInput = Prohibited & Governed & {
  networkRecordId: string;
  sourceNodeRecordId: string;
  sourceNodeRevisionFingerprint: string;
  destinationNodeRecordId: string;
  destinationNodeRevisionFingerprint: string;
  suppliedSegmentReference?: string | null;
  suppliedProtocolReference?: string | null;
  suppliedVendorReference?: string | null;
  suppliedCybersecurityReference?: string | null;
  predecessorNetworkRecordId?: string | null;
};

export type D8R5NetworkRecord = {
  networkRecordId: string;
  sourceNodeRecordId: string;
  sourceNodeRevisionFingerprint: string;
  sourceObjectId: string;
  sourceObjectRevisionFingerprint: string;
  destinationNodeRecordId: string;
  destinationNodeRevisionFingerprint: string;
  destinationObjectId: string;
  destinationObjectRevisionFingerprint: string;
  suppliedSegmentReference: string | null;
  suppliedProtocolReference: string | null;
  suppliedVendorReference: string | null;
  suppliedCybersecurityReference: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  validatedNetworkDesign: false;
  secureNetworkDesign: false;
  cybersecurityValidated: false;
  configured: false;
  addressAssigned: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorNetworkRecordId: string | null;
};

export type D8R5LinkInput = Prohibited & Governed & {
  linkId: string;
  kind: string;
  targetRecordId: string;
  targetRevisionFingerprint: string;
  memberRecordId: string;
  memberRevisionFingerprint: string;
  predecessorLinkId?: string | null;
};

export type D8R5LinkRecord = {
  linkId: string;
  kind: LinkKind;
  targetRecordId: string;
  targetRevisionFingerprint: string;
  targetObjectId: string;
  targetObjectRevisionFingerprint: string;
  memberRecordId: string;
  memberRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  validatedConfiguration: false;
  controllerConfigured: false;
  ioAllocated: false;
  validatedStrategy: false;
  controlLogic: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorLinkId: string | null;
};

export type D8R5History = {
  historyId: string;
  subjectKind: "SYSTEM" | "NODE" | "MEMBERSHIP" | "HIERARCHY" | "INTERFACE" | "NETWORK" | "LINK";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D8R5Store = {
  r4: D8R4Store;
  now: () => string;
  systems: D8R5SystemRecord[];
  nodes: D8R5NodeRecord[];
  memberships: D8R5MembershipRecord[];
  hierarchies: D8R5HierarchyRecord[];
  interfaces: D8R5InterfaceRecord[];
  networks: D8R5NetworkRecord[];
  links: D8R5LinkRecord[];
  history: D8R5History[];
};

function fail(code: string): never {
  throw new Error(`D8_R5_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || SPOOF.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(token)) fail("NETWORK_ADDRESS_NOT_IN_R5");
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
  return token ? explicit(token, code) : null;
}

function allow<T extends string>(value: string, allowed: readonly T[], code: string): T {
  const token = explicit(value, code);
  if (!(allowed as readonly string[]).includes(token)) fail(code);
  return token as T;
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
  if (input.configureDcs === true || input.configurePlc === true || input.configureSis === true || input.configureScada === true || input.configureRtu === true) fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R5");
  if (input.configureHmi === true || input.generateGraphics === true) fail("HMI_CONFIGURATION_NOT_IN_R5");
  if (input.generateLogic === true || input.modifyLogic === true || input.controlLogic === true) fail("CONTROL_LOGIC_NOT_IN_R5");
  if (input.loopTuning === true) fail("LOOP_TUNING_NOT_IN_R5");
  if (input.ioAllocation === true || input.ioOptimization === true || input.autoAssignChannel === true || input.autoAssignIo === true) fail("IO_ALLOCATION_NOT_IN_R5");
  if (input.autoAssignNode === true || input.autoAssignController === true || input.autoAssignSignal === true) fail("CONTROLLER_ASSIGNMENT_NOT_IN_R5");
  if (input.autoGenerateHierarchy === true) fail("HIERARCHY_GENERATION_NOT_IN_R5");
  if (input.terminationDesign === true || input.autoAssignTerminal === true) fail("TERMINATION_DESIGN_NOT_IN_R5");
  if (input.configureNetwork === true || input.configureSwitch === true || input.configureRouter === true || input.configureFirewall === true || input.assignNetworkAddress === true) fail("NETWORK_CONFIGURATION_NOT_IN_R5");
  if (input.networkDesign === true || input.networkOptimization === true || input.bandwidthCalculation === true || input.capacityCalculation === true || input.redundancyDesign === true) fail("NETWORK_DESIGN_NOT_IN_R5");
  if (input.cybersecurityValidation === true || input.otCertification === true || input.securityCompliance === true) fail("CYBERSECURITY_VALIDATION_NOT_IN_R5");
  if (input.controllerSizing === true || input.systemSizing === true || input.ioSizing === true) fail("CONTROLLER_SIZING_NOT_IN_R5");
  if (input.alarmRationalization === true || input.autoCreateAlarm === true) fail("ALARM_CONTEXT_NOT_IN_R5");
  if (input.interlockLogic === true || input.tripLogic === true || input.shutdownLogic === true) fail("SHUTDOWN_LOGIC_NOT_IN_R5");
  if (input.functionalSafety === true) fail("FUNCTIONAL_SAFETY_NOT_IN_R5");
  if (input.instrumentSelection === true || input.instrumentSizing === true) fail("INSTRUMENT_ENGINEERING_NOT_IN_R5");
  if (input.mutateR1 === true) fail("R1_MUTATION_REJECTED");
  if (input.mutateR2 === true) fail("R2_MUTATION_REJECTED");
  if (input.mutateR3 === true) fail("R3_MUTATION_REJECTED");
  if (input.mutateR4 === true) fail("R4_MUTATION_REJECTED");
  if (input.inferredRelationship === true || input.inferredLineage === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.projectValidation === true || input.engineeringValidated === true || input.approved === true || input.certified === true) fail("VALIDATION_NOT_IN_R5");
  if (input.automaticDesign === true) fail("DESIGN_NOT_IN_R5");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R5");
  if (input.processAuthorityAdopted === true || input.electricalAuthorityAdopted === true) fail("DISCIPLINE_AUTHORITY_NOT_TRANSFERRED");
  if (input.networkAddress?.trim()) fail("NETWORK_ADDRESS_NOT_IN_R5");
  if (input.terminalId?.trim() || input.marshallingTerminal?.trim()) fail("TERMINATION_DESIGN_NOT_IN_R5");
  if (input.alarmContextId?.trim()) fail("ALARM_CONTEXT_NOT_IN_R5");
  if (input.graphicsId?.trim()) fail("HMI_CONFIGURATION_NOT_IN_R5");
}

function governed(input: Governed, scopeId: string): { provenanceRef: string; sourceBasisRef: string; applicability: string; limitations: string } {
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(scopeId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return { provenanceRef, sourceBasisRef, applicability, limitations };
}

function citedOf(input: { citedCurrentness: string; citedLifecycleStage: string }): { cited: Currentness; stage: Stage } {
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  return { cited: citedCurrentness, stage };
}

function requireContext(store: D8R5Store, actor: D8R1Actor, contextId: string) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r4.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context || context.recordStatus !== "CURRENT" || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  return context;
}

function requireObject(store: D8R5Store, actor: D8R1Actor, contextId: string, objectId: string, revisionFingerprint: string, cited: Currentness): D8R1ObjectRecord {
  const id = explicit(objectId, "R1_REVISION_REQUIRED");
  const revision = explicit(revisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (object.objectType !== "IAC_CONTROL_SYSTEM_CONTEXT") fail("OBJECT_TYPE_NOT_CONTROL_SYSTEM");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  if (cited === "SUPERSEDED" && object.recordStatus !== "SUPERSEDED") fail("R1_OBJECT_CURRENTNESS_MISMATCH");
  return object;
}

function sameLineage(store: D8R5Store, object: D8R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D8R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    const predecessorId: string | null = cursor.predecessorObjectId;
    cursor = predecessorId ? store.r4.r3.r2.r1.objects.find((row) => row.objectId === predecessorId) : undefined;
  }
  return false;
}

function remember(store: D8R5Store, subjectKind: D8R5History["subjectKind"], subjectId: string, action: D8R5History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function place<T extends { fingerprint: string; tenantId: string; recordStatus: Status; currentness: Status }>(
  store: D8R5Store,
  rows: T[],
  kind: D8R5History["subjectKind"],
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

type ArchitectureRef = { recordId: string; fingerprint: string; objectId: string; objectRevisionFingerprint: string };

function findArchitecture(store: D8R5Store, actor: D8R1Actor, recordId: string, revision: string): ArchitectureRef | undefined {
  const system = store.systems.find((row) => row.systemRecordId === recordId && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT" && row.fingerprint === revision);
  if (system) return { recordId: system.systemRecordId, fingerprint: system.fingerprint, objectId: system.objectId, objectRevisionFingerprint: system.objectRevisionFingerprint };
  const node = store.nodes.find((row) => row.nodeRecordId === recordId && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT" && row.fingerprint === revision);
  if (node) return { recordId: node.nodeRecordId, fingerprint: node.fingerprint, objectId: node.objectId, objectRevisionFingerprint: node.objectRevisionFingerprint };
  return undefined;
}

export function createD8R5Store(r4: D8R4Store, now: () => string = () => "2026-10-25T00:00:00.000Z"): D8R5Store {
  return { r4, now, systems: [], nodes: [], memberships: [], hierarchies: [], interfaces: [], networks: [], links: [], history: [] };
}

export function recordIacControlSystemContext(store: D8R5Store, actor: D8R1Actor, input: D8R5SystemInput): D8R5SystemRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const { cited, stage } = citedOf(input);
  const context = requireContext(store, actor, input.contextId);
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, cited);
  const systemType = allow(input.systemType, D8_R5_SYSTEM_TYPES, "SYSTEM_TYPE_NOT_ALLOWLISTED");
  const basis = governed(input, object.objectId);
  const systemRecordId = explicit(input.systemRecordId, "SYSTEM_CONTEXT_REQUIRED");
  const predecessor = input.predecessorSystemRecordId ? store.systems.find((row) => row.systemRecordId === input.predecessorSystemRecordId) : null;
  if (input.predecessorSystemRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, object, predecessor.objectId))) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ systemRecordId, objectId: object.objectId, objectRevisionFingerprint: object.fingerprint, systemType, ...basis, predecessorSystemRecordId: predecessor?.systemRecordId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.systems.find((row) => row.recordStatus === "CURRENT" && row.systemRecordId !== predecessor?.systemRecordId && row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint);
  const record: D8R5SystemRecord = Object.freeze({
    systemRecordId, contextId: context.contextId, objectId: object.objectId, objectType: "IAC_CONTROL_SYSTEM_CONTEXT", objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, discipline: D8_DISCIPLINE, citedLifecycleStage: stage, citedCurrentness: cited, systemType, ...basis,
    authority: D8_CONTEXT_AUTHORITY, validatedDesign: false, configured: false, engineeringValidated: false, conformant: false, approved: false, certified: false,
    fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorSystemRecordId: predecessor?.systemRecordId ?? null,
  });
  return place(store, store.systems, "SYSTEM", systemRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.systemRecordId, (row) => `${row.objectRevisionFingerprint}|${row.systemType}`, duplicate, "DUPLICATE_SYSTEM_REJECTED", record);
}

export function recordIacControlNodeContext(store: D8R5Store, actor: D8R1Actor, input: D8R5NodeInput): D8R5NodeRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const { cited, stage } = citedOf(input);
  const context = requireContext(store, actor, input.contextId);
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, cited);
  const nodeRole = allow(input.nodeRole, D8_R5_NODE_ROLES, "NODE_ROLE_NOT_ALLOWLISTED");
  const basis = governed(input, object.objectId);
  const nodeRecordId = explicit(input.nodeRecordId, "NODE_CONTEXT_REQUIRED");
  const predecessor = input.predecessorNodeRecordId ? store.nodes.find((row) => row.nodeRecordId === input.predecessorNodeRecordId) : null;
  if (input.predecessorNodeRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, object, predecessor.objectId))) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ nodeRecordId, objectId: object.objectId, objectRevisionFingerprint: object.fingerprint, nodeRole, ...basis, predecessorNodeRecordId: predecessor?.nodeRecordId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.nodes.find((row) => row.recordStatus === "CURRENT" && row.nodeRecordId !== predecessor?.nodeRecordId && row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint);
  const record: D8R5NodeRecord = Object.freeze({
    nodeRecordId, contextId: context.contextId, objectId: object.objectId, objectType: "IAC_CONTROL_SYSTEM_CONTEXT", objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, discipline: D8_DISCIPLINE, citedLifecycleStage: stage, citedCurrentness: cited, nodeRole, ...basis,
    authority: D8_CONTEXT_AUTHORITY, controllerConfigured: false, controllerSelected: false, engineeringValidated: false,
    fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorNodeRecordId: predecessor?.nodeRecordId ?? null,
  });
  return place(store, store.nodes, "NODE", nodeRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.nodeRecordId, (row) => `${row.objectRevisionFingerprint}|${row.nodeRole}`, duplicate, "DUPLICATE_NODE_REJECTED", record);
}

export function recordIacControlSystemMembership(store: D8R5Store, actor: D8R1Actor, input: D8R5MembershipInput): D8R5MembershipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const membershipId = explicit(input.membershipId, "SYSTEM_MEMBERSHIP_REQUIRED");
  const kindToken = input.kind.trim();
  if (INFERRED.has(kindToken.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  const kind = allow(kindToken, D8_R5_MEMBERSHIP_KINDS, "SYSTEM_MEMBERSHIP_NOT_EXPLICIT");
  const system = store.systems.find((row) => row.systemRecordId === explicit(input.systemRecordId, "SYSTEM_REVISION_REQUIRED") && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT");
  if (!system || system.fingerprint !== explicit(input.systemRevisionFingerprint, "SYSTEM_REVISION_REQUIRED")) fail("SYSTEM_REVISION_MISMATCH");
  const node = store.nodes.find((row) => row.nodeRecordId === explicit(input.nodeRecordId, "NODE_REVISION_REQUIRED") && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT");
  if (!node || node.fingerprint !== explicit(input.nodeRevisionFingerprint, "NODE_REVISION_REQUIRED")) fail("NODE_REVISION_MISMATCH");
  const basis = governed(input, system.objectId);
  const predecessor = input.predecessorMembershipId ? store.memberships.find((row) => row.membershipId === input.predecessorMembershipId) : null;
  if (input.predecessorMembershipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ membershipId, kind, systemRecordId: system.systemRecordId, systemRevisionFingerprint: system.fingerprint, nodeRecordId: node.nodeRecordId, nodeRevisionFingerprint: node.fingerprint, ...basis, predecessorMembershipId: predecessor?.membershipId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.memberships.find((row) => row.recordStatus === "CURRENT" && row.membershipId !== predecessor?.membershipId && row.systemRecordId === system.systemRecordId && row.nodeRecordId === node.nodeRecordId && row.systemRevisionFingerprint === system.fingerprint && row.nodeRevisionFingerprint === node.fingerprint);
  const record: D8R5MembershipRecord = Object.freeze({
    membershipId, kind, systemRecordId: system.systemRecordId, systemRevisionFingerprint: system.fingerprint, systemObjectId: system.objectId, systemObjectRevisionFingerprint: system.objectRevisionFingerprint,
    nodeRecordId: node.nodeRecordId, nodeRevisionFingerprint: node.fingerprint, nodeObjectId: node.objectId, nodeObjectRevisionFingerprint: node.objectRevisionFingerprint,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, ...basis, inferred: false, validatedArchitecture: false,
    fingerprint, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorMembershipId: predecessor?.membershipId ?? null,
  });
  return place(store, store.memberships, "MEMBERSHIP", membershipId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.membershipId, (row) => `${row.systemRevisionFingerprint}|${row.nodeRevisionFingerprint}`, duplicate, "DUPLICATE_MEMBERSHIP_REJECTED", record);
}

export function recordIacControlSystemHierarchy(store: D8R5Store, actor: D8R1Actor, input: D8R5HierarchyInput): D8R5HierarchyRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const hierarchyId = explicit(input.hierarchyId, "HIERARCHY_REQUIRED");
  const kindToken = input.kind.trim();
  if (INFERRED.has(kindToken.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  const kind = allow(kindToken, D8_R5_HIERARCHY_KINDS, "HIERARCHY_NOT_EXPLICIT");
  const parent = findArchitecture(store, actor, explicit(input.parentRecordId, "HIERARCHY_REVISION_REQUIRED"), explicit(input.parentRevisionFingerprint, "HIERARCHY_REVISION_REQUIRED"));
  const child = findArchitecture(store, actor, explicit(input.childRecordId, "HIERARCHY_REVISION_REQUIRED"), explicit(input.childRevisionFingerprint, "HIERARCHY_REVISION_REQUIRED"));
  if (!parent || !child || parent.recordId === child.recordId) fail("HIERARCHY_REVISION_MISMATCH");
  const basis = governed(input, child.objectId);
  const predecessor = input.predecessorHierarchyId ? store.hierarchies.find((row) => row.hierarchyId === input.predecessorHierarchyId) : null;
  if (input.predecessorHierarchyId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ hierarchyId, kind, parentRecordId: parent.recordId, parentRevisionFingerprint: parent.fingerprint, childRecordId: child.recordId, childRevisionFingerprint: child.fingerprint, ...basis, predecessorHierarchyId: predecessor?.hierarchyId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const conflict = store.hierarchies.find((row) => row.recordStatus === "CURRENT" && row.hierarchyId !== predecessor?.hierarchyId && row.childRecordId === child.recordId && row.parentRecordId !== parent.recordId);
  if (conflict) fail("CONFLICTING_HIERARCHY_REJECTED");
  const duplicate = store.hierarchies.find((row) => row.recordStatus === "CURRENT" && row.hierarchyId !== predecessor?.hierarchyId && row.parentRecordId === parent.recordId && row.childRecordId === child.recordId && row.parentRevisionFingerprint === parent.fingerprint && row.childRevisionFingerprint === child.fingerprint);
  const record: D8R5HierarchyRecord = Object.freeze({
    hierarchyId, kind, parentRecordId: parent.recordId, parentRevisionFingerprint: parent.fingerprint, parentObjectId: parent.objectId,
    childRecordId: child.recordId, childRevisionFingerprint: child.fingerprint, childObjectId: child.objectId,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, ...basis, generatedByEos: false, validatedArchitecture: false,
    fingerprint, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorHierarchyId: predecessor?.hierarchyId ?? null,
  });
  return place(store, store.hierarchies, "HIERARCHY", hierarchyId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.hierarchyId, (row) => `${row.parentRevisionFingerprint}|${row.childRevisionFingerprint}`, duplicate, "DUPLICATE_HIERARCHY_REJECTED", record);
}

export function recordIacSuppliedInterfaceContext(store: D8R5Store, actor: D8R1Actor, input: D8R5InterfaceInput): D8R5InterfaceRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const { cited, stage } = citedOf(input);
  const context = requireContext(store, actor, input.contextId);
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, cited);
  const interfaceKind = allow(input.interfaceKind, D8_R5_INTERFACE_KINDS, "INTERFACE_KIND_NOT_ALLOWLISTED");
  const suppliedReference = suppliedRef(input.suppliedReference, "INTERFACE_REFERENCE_SPOOF_REJECTED");
  const basis = governed(input, object.objectId);
  const interfaceRecordId = explicit(input.interfaceRecordId, "INTERFACE_CONTEXT_REQUIRED");
  const predecessor = input.predecessorInterfaceRecordId ? store.interfaces.find((row) => row.interfaceRecordId === input.predecessorInterfaceRecordId) : null;
  if (input.predecessorInterfaceRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, object, predecessor.objectId))) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ interfaceRecordId, objectId: object.objectId, objectRevisionFingerprint: object.fingerprint, interfaceKind, suppliedReference, ...basis, predecessorInterfaceRecordId: predecessor?.interfaceRecordId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.interfaces.find((row) => row.recordStatus === "CURRENT" && row.interfaceRecordId !== predecessor?.interfaceRecordId && row.objectId === object.objectId && row.interfaceKind === interfaceKind && row.objectRevisionFingerprint === object.fingerprint);
  const record: D8R5InterfaceRecord = Object.freeze({
    interfaceRecordId, contextId: context.contextId, objectId: object.objectId, objectType: "IAC_CONTROL_SYSTEM_CONTEXT", objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, discipline: D8_DISCIPLINE, citedLifecycleStage: stage, citedCurrentness: cited, interfaceKind, suppliedReference, ...basis,
    authority: D8_CONTEXT_AUTHORITY, hmiConfigured: false, graphicsGenerated: false, panelDesign: false, cabinetDesign: false, terminationDesign: false, allocatedByEos: false,
    fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorInterfaceRecordId: predecessor?.interfaceRecordId ?? null,
  });
  return place(store, store.interfaces, "INTERFACE", interfaceRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.interfaceRecordId, (row) => `${row.objectRevisionFingerprint}|${row.interfaceKind}|${row.suppliedReference}`, duplicate, "DUPLICATE_INTERFACE_REJECTED", record);
}

export function recordIacNetworkInterfaceContext(store: D8R5Store, actor: D8R1Actor, input: D8R5NetworkInput): D8R5NetworkRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const networkRecordId = explicit(input.networkRecordId, "NETWORK_CONTEXT_REQUIRED");
  const source = store.nodes.find((row) => row.nodeRecordId === explicit(input.sourceNodeRecordId, "NETWORK_ENDPOINT_REVISION_REQUIRED") && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT");
  const destination = store.nodes.find((row) => row.nodeRecordId === explicit(input.destinationNodeRecordId, "NETWORK_ENDPOINT_REVISION_REQUIRED") && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT");
  if (!source || source.fingerprint !== explicit(input.sourceNodeRevisionFingerprint, "NETWORK_ENDPOINT_REVISION_REQUIRED")) fail("NETWORK_ENDPOINT_REVISION_MISMATCH");
  if (!destination || destination.fingerprint !== explicit(input.destinationNodeRevisionFingerprint, "NETWORK_ENDPOINT_REVISION_REQUIRED")) fail("NETWORK_ENDPOINT_REVISION_MISMATCH");
  if (source.nodeRecordId === destination.nodeRecordId) fail("NETWORK_ENDPOINT_NOT_EXPLICIT");
  const suppliedSegmentReference = suppliedRef(input.suppliedSegmentReference, "SEGMENT_REFERENCE_SPOOF_REJECTED");
  const suppliedProtocolReference = suppliedRef(input.suppliedProtocolReference, "PROTOCOL_REFERENCE_SPOOF_REJECTED");
  const suppliedVendorReference = suppliedRef(input.suppliedVendorReference, "VENDOR_REFERENCE_SPOOF_REJECTED");
  const suppliedCybersecurityReference = suppliedRef(input.suppliedCybersecurityReference, "CYBERSECURITY_REFERENCE_SPOOF_REJECTED");
  const basis = governed(input, source.objectId);
  if (!basis.applicability.includes(destination.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const predecessor = input.predecessorNetworkRecordId ? store.networks.find((row) => row.networkRecordId === input.predecessorNetworkRecordId) : null;
  if (input.predecessorNetworkRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    networkRecordId, sourceNodeRecordId: source.nodeRecordId, sourceNodeRevisionFingerprint: source.fingerprint, destinationNodeRecordId: destination.nodeRecordId, destinationNodeRevisionFingerprint: destination.fingerprint,
    suppliedSegmentReference, suppliedProtocolReference, suppliedVendorReference, suppliedCybersecurityReference, ...basis, predecessorNetworkRecordId: predecessor?.networkRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.networks.find((row) => row.recordStatus === "CURRENT" && row.networkRecordId !== predecessor?.networkRecordId && row.sourceNodeRevisionFingerprint === source.fingerprint && row.destinationNodeRevisionFingerprint === destination.fingerprint);
  const record: D8R5NetworkRecord = Object.freeze({
    networkRecordId, sourceNodeRecordId: source.nodeRecordId, sourceNodeRevisionFingerprint: source.fingerprint, sourceObjectId: source.objectId, sourceObjectRevisionFingerprint: source.objectRevisionFingerprint,
    destinationNodeRecordId: destination.nodeRecordId, destinationNodeRevisionFingerprint: destination.fingerprint, destinationObjectId: destination.objectId, destinationObjectRevisionFingerprint: destination.objectRevisionFingerprint,
    suppliedSegmentReference, suppliedProtocolReference, suppliedVendorReference, suppliedCybersecurityReference,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, ...basis,
    validatedNetworkDesign: false, secureNetworkDesign: false, cybersecurityValidated: false, configured: false, addressAssigned: false,
    fingerprint, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorNetworkRecordId: predecessor?.networkRecordId ?? null,
  });
  return place(store, store.networks, "NETWORK", networkRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.networkRecordId, (row) => `${row.sourceNodeRevisionFingerprint}|${row.destinationNodeRevisionFingerprint}|${row.suppliedProtocolReference}|${row.suppliedCybersecurityReference}`, duplicate, "DUPLICATE_NETWORK_REJECTED", record);
}

export function recordIacControlSystemLink(store: D8R5Store, actor: D8R1Actor, input: D8R5LinkInput): D8R5LinkRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const linkId = explicit(input.linkId, "SYSTEM_LINK_REQUIRED");
  const kindToken = input.kind.trim();
  if (INFERRED.has(kindToken.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  const kind = allow(kindToken, D8_R5_LINK_KINDS, "SYSTEM_LINK_NOT_EXPLICIT");
  const targetIsNode = kind.endsWith("_NODE");
  const target = targetIsNode
    ? store.nodes.find((row) => row.nodeRecordId === explicit(input.targetRecordId, "TARGET_REVISION_REQUIRED") && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT")
    : store.systems.find((row) => row.systemRecordId === explicit(input.targetRecordId, "TARGET_REVISION_REQUIRED") && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT");
  if (!target || target.fingerprint !== explicit(input.targetRevisionFingerprint, "TARGET_REVISION_REQUIRED")) fail("TARGET_REVISION_MISMATCH");
  const memberRecordId = explicit(input.memberRecordId, "R4_REVISION_REQUIRED");
  const memberRevision = explicit(input.memberRevisionFingerprint, "R4_REVISION_REQUIRED");
  const memberOk = kind.startsWith("SIGNAL_")
    ? store.r4.signals.some((row) => row.signalRecordId === memberRecordId && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT" && row.fingerprint === memberRevision)
    : kind.startsWith("IO_")
      ? store.r4.ioRecords.some((row) => row.ioRecordId === memberRecordId && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT" && row.fingerprint === memberRevision)
      : store.r4.loops.some((row) => row.loopRecordId === memberRecordId && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT" && row.fingerprint === memberRevision);
  if (!memberOk) fail(kind.startsWith("SIGNAL_") ? "R4_SIGNAL_REVISION_MISMATCH" : kind.startsWith("IO_") ? "R4_IO_REVISION_MISMATCH" : "R4_LOOP_REVISION_MISMATCH");
  const basis = governed(input, target.objectId);
  const predecessor = input.predecessorLinkId ? store.links.find((row) => row.linkId === input.predecessorLinkId) : null;
  if (input.predecessorLinkId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ linkId, kind, targetRecordId: targetIsNode ? (target as D8R5NodeRecord).nodeRecordId : (target as D8R5SystemRecord).systemRecordId, targetRevisionFingerprint: target.fingerprint, memberRecordId, memberRevisionFingerprint: memberRevision, ...basis, predecessorLinkId: predecessor?.linkId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const targetId = targetIsNode ? (target as D8R5NodeRecord).nodeRecordId : (target as D8R5SystemRecord).systemRecordId;
  const duplicate = store.links.find((row) => row.recordStatus === "CURRENT" && row.linkId !== predecessor?.linkId && row.kind === kind && row.targetRecordId === targetId && row.memberRecordId === memberRecordId && row.targetRevisionFingerprint === target.fingerprint && row.memberRevisionFingerprint === memberRevision);
  const record: D8R5LinkRecord = Object.freeze({
    linkId, kind, targetRecordId: targetId, targetRevisionFingerprint: target.fingerprint, targetObjectId: target.objectId, targetObjectRevisionFingerprint: target.objectRevisionFingerprint,
    memberRecordId, memberRevisionFingerprint: memberRevision, tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, ...basis,
    validatedConfiguration: false, controllerConfigured: false, ioAllocated: false, validatedStrategy: false, controlLogic: false,
    fingerprint, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorLinkId: predecessor?.linkId ?? null,
  });
  return place(store, store.links, "LINK", linkId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.linkId, (row) => `${row.kind}|${row.targetRevisionFingerprint}|${row.memberRevisionFingerprint}`, duplicate, "DUPLICATE_LINK_REJECTED", record);
}

export function configureIacDcs(): never { return fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R5"); }
export function configureIacPlc(): never { return fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R5"); }
export function configureIacSis(): never { return fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R5"); }
export function configureIacScada(): never { return fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R5"); }
export function configureIacRtu(): never { return fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R5"); }
export function configureIacHmi(): never { return fail("HMI_CONFIGURATION_NOT_IN_R5"); }
export function generateIacHmiGraphics(): never { return fail("HMI_CONFIGURATION_NOT_IN_R5"); }
export function generateIacControlLogic(): never { return fail("CONTROL_LOGIC_NOT_IN_R5"); }
export function tuneIacControlLoop(): never { return fail("LOOP_TUNING_NOT_IN_R5"); }
export function allocateIacIo(): never { return fail("IO_ALLOCATION_NOT_IN_R5"); }
export function designIacNetwork(): never { return fail("NETWORK_DESIGN_NOT_IN_R5"); }
export function configureIacNetwork(): never { return fail("NETWORK_CONFIGURATION_NOT_IN_R5"); }
export function validateIacCybersecurity(): never { return fail("CYBERSECURITY_VALIDATION_NOT_IN_R5"); }
export function sizeIacController(): never { return fail("CONTROLLER_SIZING_NOT_IN_R5"); }
export function assignIacMarshallingTerminal(): never { return fail("TERMINATION_DESIGN_NOT_IN_R5"); }
export function createIacAlarmContext(): never { return fail("ALARM_CONTEXT_NOT_IN_R5"); }
export function mutateIacSignalContext(): never { return fail("R4_MUTATION_REJECTED"); }
