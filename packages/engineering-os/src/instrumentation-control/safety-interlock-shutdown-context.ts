/**
 * EOS-D8-R6 safety, interlock, and shutdown context.
 * One bounded runtime on exact R1 through R5 revisions.
 * Alarm, interlock, trip, shutdown, and functional-safety source context only.
 */
import {
  ALARM_CONTEXT_EQUALS_ALARM_RATIONALIZATION_COMPLETE,
  CAUSE_EFFECT_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED,
  CAUSE_EFFECT_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED,
  D6_PROCESS_SAFETY_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION,
  D7_PROTECTION_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D8_CURRENTNESS_STATES,
  D8_D4_INTERFACE_SUBJECTS,
  D8_D5_INTERFACE_SUBJECTS,
  D8_D6_INTERFACE_SUBJECTS,
  D8_D7_INTERFACE_SUBJECTS,
  D8_IMPLEMENTATION_PHASE_TYPES,
  D8_IMPLEMENTATION_PHASES,
  D8_MATURITY_STATES,
  INTERLOCK_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED,
  SHUTDOWN_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED,
  SIF_CONTEXT_EQUALS_SIF_VALIDATED,
  SIL_REQUIREMENT_EQUALS_SIL_VERIFIED,
  TRIP_CONTEXT_EQUALS_VALIDATED_SHUTDOWN_LOGIC,
  VENDOR_SAFETY_CERTIFICATION_EQUALS_PROJECT_SAFETY_VALIDATION,
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
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
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
  D8_RUNTIME_COUNT as R5_RUNTIME_COUNT,
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
  type D8R5Store,
} from "./control-system-architecture-context";

export const D8_R6_STATUS = "SAFETY_INTERLOCK_AND_SHUTDOWN_CONTEXT_IMPLEMENTED" as const;
export const D8_R6_MATURITY = D8_R6_STATUS;
export const D8_R6_MATURITY_STATE = D8_R6_STATUS;
export const D8_R6_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D8_R6_SAFETY_INTERLOCK_AND_SHUTDOWN_CONTEXT_CLOSEOUT.md" as const;
export const D8_R1_R5_EXACT_REVISIONS_REUSED = true as const;
export const EXACT_D8_R6_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D8_R6_SOURCE_REFERENCE_ALLOWED = false as const;
export const D8_R6_SOURCE_AUTO_REPOINTED = false as const;
export const D8_RUNTIME_STARTED = true as const;
export const D8_RUNTIME_COUNT = 6 as const;
export const D8_R5_RUNTIME_COUNT = R5_RUNTIME_COUNT;
export const D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_IMPLEMENTED = true as const;
export const D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT = 1 as const;
export const D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY = true as const;
export const D8_ALARM_CONTEXT_IMPLEMENTED = true as const;
export const ALARM_CONTEXT_EQUALS_VALIDATED_ALARM_DESIGN = false as const;
export const ALARM_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D8_SUPPLIED_ALARM_PRIORITY_CONTEXT_SUPPORTED = true as const;
export const SUPPLIED_ALARM_PRIORITY_EQUALS_VALIDATED_ALARM_PRIORITY = false as const;
export const SUPPLIED_ALARM_PRIORITY_EQUALS_ALARM_RATIONALIZATION = false as const;
export const D8_R6_CALCULATES_ALARM_PRIORITY = false as const;
export const D8_R6_AUTO_ASSIGNS_ALARM_PRIORITY = false as const;
export const D8_R6_PERFORMS_ALARM_RATIONALIZATION = false as const;
export const D8_R6_PERFORMS_ALARM_FLOOD_ANALYSIS = false as const;
export const D8_R6_PERFORMS_ALARM_OPTIMIZATION = false as const;
export const D8_INTERLOCK_CONTEXT_IMPLEMENTED = true as const;
export const INTERLOCK_CONTEXT_EQUALS_VALIDATED_INTERLOCK_DESIGN = false as const;
export const D8_TRIP_CONTEXT_IMPLEMENTED = true as const;
export const TRIP_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED = false as const;
export const D8_SHUTDOWN_CONTEXT_IMPLEMENTED = true as const;
export const SHUTDOWN_INTENT_EQUALS_CONTROL_LOGIC_IMPLEMENTED = false as const;
export const D8_PERMISSIVE_CONTEXT_SUPPORTED = true as const;
export const PERMISSIVE_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED = false as const;
export const PERMISSIVE_CONTEXT_EQUALS_VALIDATED_PERMISSIVE_LOGIC = false as const;
export const D8_CAUSE_EFFECT_CONTEXT_SUPPORTED = true as const;
export const CAUSE_EFFECT_CONTEXT_EQUALS_VALIDATED_LOGIC_DESIGN = false as const;
export const D8_R6_CONTEXT_KINDS = [
  "ALARM",
  "INTERLOCK",
  "TRIP",
  "SHUTDOWN",
  "PERMISSIVE",
  "CAUSE_EFFECT",
  "SIF",
  "SIL_REQUIREMENT",
  "SAFETY_REQUIREMENT",
  "VENDOR_CERTIFICATION",
  "PROOF_TEST",
  "STANDARD_REFERENCE",
] as const;
export const EXACT_D8_R1_IDENTITY_REVISION_REQUIRED = true as const;
export const EXACT_D8_R2_MEASUREMENT_REVISION_REQUIRED = true as const;
export const EXACT_D8_R3_DEVICE_REVISION_REQUIRED = true as const;
export const EXACT_D8_R4_SIGNAL_LOOP_REVISION_REQUIRED = true as const;
export const EXACT_D8_R5_CONTROL_SYSTEM_REVISION_REQUIRED = true as const;
export const D8_EXPLICIT_ALARM_RELATIONSHIP_REQUIRED = true as const;
export const D8_INFERRED_ALARM_RELATIONSHIP_ALLOWED = false as const;
export const EXACT_D8_ALARM_RELATIONSHIP_ENDPOINT_REVISION_REQUIRED = true as const;
export const D8_EXPLICIT_INTERLOCK_RELATIONSHIP_REQUIRED = true as const;
export const D8_EXPLICIT_TRIP_RELATIONSHIP_REQUIRED = true as const;
export const D8_EXPLICIT_SHUTDOWN_RELATIONSHIP_REQUIRED = true as const;
export const D8_INFERRED_INTERLOCK_RELATIONSHIP_ALLOWED = false as const;
export const D8_INFERRED_TRIP_RELATIONSHIP_ALLOWED = false as const;
export const D8_INFERRED_SHUTDOWN_RELATIONSHIP_ALLOWED = false as const;
export const D8_R6_RELATIONSHIP_KINDS = ["ALARM", "INTERLOCK", "TRIP", "SHUTDOWN"] as const;
export const D8_R6_ENDPOINT_KINDS = ["MEASUREMENT", "DEVICE", "SIGNAL", "IO", "LOOP", "CONTROL_SYSTEM"] as const;
export const D8_SIF_CONTEXT_SUPPORTED = true as const;
export const SIF_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED = false as const;
export const SIF_CONTEXT_EQUALS_SIF_ARCHITECTURE_DESIGNED_BY_EOS = false as const;
export const D8_SUPPLIED_SIL_REQUIREMENT_CONTEXT_SUPPORTED = true as const;
export const SIL_REQUIREMENT_EQUALS_SIL_CALCULATED_BY_EOS = false as const;
export const SIL_REQUIREMENT_EQUALS_FUNCTIONAL_SAFETY_CERTIFICATION = false as const;
export const D8_R6_PERFORMS_SIL_CALCULATION = false as const;
export const D8_R6_PERFORMS_SIL_VERIFICATION = false as const;
export const D8_R6_PERFORMS_PFD_CALCULATION = false as const;
export const D8_R6_PERFORMS_PFH_CALCULATION = false as const;
export const D8_R6_PERFORMS_RELIABILITY_CALCULATION = false as const;
export const D8_R6_DESIGNS_SIF_ARCHITECTURE = false as const;
export const D8_R6_SELECTS_SIF_SENSOR_ARCHITECTURE = false as const;
export const D8_R6_SELECTS_SIF_LOGIC_SOLVER_ARCHITECTURE = false as const;
export const D8_R6_SELECTS_SIF_FINAL_ELEMENT_ARCHITECTURE = false as const;
export const D8_SAFETY_REQUIREMENT_CONTEXT_SUPPORTED = true as const;
export const SAFETY_REQUIREMENT_CONTEXT_EQUALS_VALIDATED_SRS = false as const;
export const SAFETY_REQUIREMENT_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED = false as const;
export const D8_VENDOR_SAFETY_CERTIFICATION_CONTEXT_SUPPORTED = true as const;
export const VENDOR_SAFETY_CERTIFICATION_EQUALS_D8_CERTIFICATION = false as const;
export const D8_PROOF_TEST_EVIDENCE_CONTEXT_SUPPORTED = true as const;
export const PROOF_TEST_EVIDENCE_EQUALS_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const PROOF_TEST_RECORD_PRESENT_EQUALS_SIF_VALIDATED = false as const;
export const FUNCTIONAL_SAFETY_STANDARD_REFERENCE_EQUALS_COMPLIANCE = false as const;
export const SIL_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_CERTIFICATION = false as const;
export const D8_R6_PERFORMS_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const D8_R6_CONFIGURES_SIS = false as const;
export const D8_R6_CONFIGURES_LOGIC_SOLVER = false as const;
export const D8_R6_PERFORMS_INTERLOCK_LOGIC_DESIGN = false as const;
export const D8_R6_PERFORMS_TRIP_LOGIC_DESIGN = false as const;
export const D8_R6_PERFORMS_SHUTDOWN_LOGIC_DESIGN = false as const;
export const D8_R6_GENERATES_CONTROL_LOGIC = false as const;
export const D8_R6_GENERATES_SAFETY_LOGIC = false as const;
export const D8_R6_AUTO_CONVERTS_CAUSE_EFFECT_TO_LOGIC = false as const;
export const D8_R6_AUTO_CONVERTS_TRIP_INTENT_TO_LOGIC = false as const;
export const D8_R6_AUTO_CONVERTS_SHUTDOWN_INTENT_TO_LOGIC = false as const;
export const EXACT_D6_PROCESS_SOURCE_REVISION_REQUIRED = true as const;
export const D8_R6_D6_SOURCE_AUTO_REPOINTED = false as const;
export const D6_ALARM_REQUIREMENT_EQUALS_VALIDATED_D8_ALARM_DESIGN = false as const;
export const EXACT_D7_ELECTRICAL_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D8_R6_D7_SOURCE_AUTO_REPOINTED = false as const;
export const D7_PROTECTION_CONTEXT_EQUALS_D8_SIS_IMPLEMENTATION = false as const;
export const EXACT_D4_MECHANICAL_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D5_PIPING_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D4_MECHANICAL_CONTEXT_EQUALS_D8_SAFETY_LOGIC = false as const;
export const D5_PIPING_CONTEXT_EQUALS_D8_SAFETY_LOGIC = false as const;
export const D8_R6_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D8_R6_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT = false as const;
export const D8_R6_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT = false as const;
export const D8_R6_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT = false as const;
export const D8_R6_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT = false as const;
export const D8_R6_CONFIGURES_DCS = false as const;
export const D8_R6_CONFIGURES_PLC = false as const;
export const D8_R6_CONFIGURES_SCADA = false as const;
export const D8_R6_CONFIGURES_RTU = false as const;
export const D8_R6_PERFORMS_NETWORK_DESIGN = false as const;
export const D8_R6_PERFORMS_CYBERSECURITY_VALIDATION = false as const;
export const D8_R6_DETERMINES_NETWORK_SECURITY_COMPLIANCE = false as const;
export const D8_R6_SOURCE_BASIS_REQUIRED = true as const;
export const D8_R6_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D8_SAFETY_CONTEXT_AUTO_ACCEPTED = false as const;
export const D8_R6_APPLICABILITY_EXPLICIT = true as const;
export const D8_R6_LIMITATIONS_EXPLICIT = true as const;
export const D8_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D8_R6_PROVENANCE_REQUIRED = true as const;
export const D8_R6_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D8_R6_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D8_R6_ACCESS_ALLOWED = false as const;
export const D8_R6_HISTORY_PRESERVED = true as const;
export const D8_R6_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D8_R6_MUTATION_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_ALARM_RELATIONSHIP = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_INTERLOCK = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_TRIP = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_SHUTDOWN_FUNCTION = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_SIF = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_SIL_REQUIREMENT = false as const;
export const AI_CAN_PROMOTE_D8_SAFETY_CONTEXT_TO_FUNCTIONAL_SAFETY_VALIDATED = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D8_R6_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D8_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_R6_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D8_R6_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D8_R7_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_ALARM_PRIORITY_CALCULATION = false as const;
export const UNAUTHORIZED_CAUSE_EFFECT_TO_LOGIC_GENERATION = false as const;
export const UNAUTHORIZED_PFD_CALCULATION = false as const;
export const UNAUTHORIZED_PFH_CALCULATION = false as const;
export const UNAUTHORIZED_SIF_ARCHITECTURE_DESIGN = false as const;
export const UNAUTHORIZED_FUNCTIONAL_SAFETY_COMPLIANCE_PROMOTION = false as const;
export const UNAUTHORIZED_SAFETY_LOGIC_GENERATION = false as const;
export const D8_R7_CANONICAL_PHASE = D8_IMPLEMENTATION_PHASES[6];
export const D8_R7_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[6];
export const D8_R7_CANONICAL_SCOPE =
  "Implement canonical D8 requirement, assumption, engineering-decision, change, supersession and reassessment governance using exact R1 through R6 revisions. Preserve source requirement distinct from an adopted D8 requirement, assumption distinct from validated fact, AI recommendation distinct from an engineering decision, engineering decision distinct from approval, change distinct from automatic redesign, and reassessment distinct from validation failure or validation. Do not automatically recalculate, reselect, reconfigure, retune, rewrite logic, recalculate SIL, revalidate functional safety, mutate counterpart disciplines, or silently repoint historical revisions." as const;
export const D8_R7_STARTED = false as const;
export const D8_R6_READY_FOR_NEXT_PHASE = true as const;
export const D8_R6_NEXT_PHASE = D8_R7_CANONICAL_PHASE;
export const D8_R6_NEXT_PHASE_TYPE = D8_R7_PHASE_TYPE;
export const D8_R6_CANONICAL_NEXT_PHASE = D8_R7_CANONICAL_PHASE;
export const D8_R6_CANONICAL_NEXT_PHASE_SCOPE = D8_R7_CANONICAL_SCOPE;
export const D8_R6_BLOCKER = "NONE" as const;
export const D8_R6_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  ALARM_CONTEXT_EQUALS_ALARM_RATIONALIZATION_COMPLETE,
  INTERLOCK_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED,
  TRIP_CONTEXT_EQUALS_VALIDATED_SHUTDOWN_LOGIC,
  SHUTDOWN_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED,
  CAUSE_EFFECT_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED,
  CAUSE_EFFECT_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED,
  SIL_REQUIREMENT_EQUALS_SIL_VERIFIED,
  SIF_CONTEXT_EQUALS_SIF_VALIDATED,
  VENDOR_SAFETY_CERTIFICATION_EQUALS_PROJECT_SAFETY_VALIDATION,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
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
  D6_PROCESS_SAFETY_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
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
const SPOOF = new Set(["auto", "allocated", "assigned", "secure", "validated", "compliant", "certified", "optimized", "calculated", "rationalized"]);
const INFERRED = new Set([
  "naming_convention",
  "tag_prefix",
  "tag_naming",
  "tag_name",
  "limit",
  "setpoint",
  "process_variable",
  "document_co_occurrence",
  "semantic_similarity",
  "ai_interpretation",
  "ai_inference",
  "inferred",
]);

type Stage = (typeof D8_MATURITY_STATES)[number];
type Currentness = (typeof D8_CURRENTNESS_STATES)[number];
type ContextKind = (typeof D8_R6_CONTEXT_KINDS)[number];
type RelationshipKind = (typeof D8_R6_RELATIONSHIP_KINDS)[number];
type EndpointKind = (typeof D8_R6_ENDPOINT_KINDS)[number];
type Status = "CURRENT" | "SUPERSEDED";
type SourceRef = { sourceId: string | null; sourceRevisionFingerprint: string | null; sourceSubject: string | null };

type Prohibited = {
  calculatePriority?: boolean;
  autoAssignPriority?: boolean;
  alarmRationalization?: boolean;
  alarmFlood?: boolean;
  alarmOptimization?: boolean;
  interlockLogic?: boolean;
  tripLogic?: boolean;
  shutdownLogic?: boolean;
  generateLogic?: boolean;
  generateSafetyLogic?: boolean;
  convertCauseEffect?: boolean;
  convertTrip?: boolean;
  convertShutdown?: boolean;
  silCalculation?: boolean;
  silVerification?: boolean;
  pfdCalculation?: boolean;
  pfhCalculation?: boolean;
  reliabilityCalculation?: boolean;
  designSif?: boolean;
  selectSensorArchitecture?: boolean;
  selectLogicSolverArchitecture?: boolean;
  selectFinalElementArchitecture?: boolean;
  functionalSafetyValidation?: boolean;
  configureSis?: boolean;
  configureLogicSolver?: boolean;
  configureDcs?: boolean;
  configurePlc?: boolean;
  configureScada?: boolean;
  configureRtu?: boolean;
  networkDesign?: boolean;
  cybersecurityValidation?: boolean;
  securityCompliance?: boolean;
  mutateR1?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  inferredRelationship?: boolean;
  inferredLineage?: boolean;
  repoint?: boolean;
  autoRepointD6?: boolean;
  autoRepointD7?: boolean;
  propagate?: boolean;
  projectValidation?: boolean;
  approved?: boolean;
  certified?: boolean;
  d9Source?: boolean;
  processAuthorityAdopted?: boolean;
  electricalAuthorityAdopted?: boolean;
  mechanicalAuthorityAdopted?: boolean;
  pipingAuthorityAdopted?: boolean;
  calculatedPriority?: string | null;
  pfdValue?: string | null;
  pfhValue?: string | null;
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

type Upstream = {
  d6SourceId?: string | null;
  d6SourceRevisionFingerprint?: string | null;
  d6Subject?: string | null;
  d7SourceId?: string | null;
  d7SourceRevisionFingerprint?: string | null;
  d7Subject?: string | null;
  d4SourceId?: string | null;
  d4SourceRevisionFingerprint?: string | null;
  d4Subject?: string | null;
  d5SourceId?: string | null;
  d5SourceRevisionFingerprint?: string | null;
  d5Subject?: string | null;
};

export type D8R6ContextInput = Prohibited & Governed & Upstream & {
  contextRecordId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  kind: string;
  suppliedPriority?: string | null;
  suppliedSilRequirement?: string | null;
  suppliedReference?: string | null;
  predecessorContextRecordId?: string | null;
};

export type D8R6ContextRecord = {
  contextRecordId: string;
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
  kind: ContextKind;
  suppliedPriority: string | null;
  suppliedSilRequirement: string | null;
  suppliedReference: string | null;
  d6: SourceRef;
  d7: SourceRef;
  d4: SourceRef;
  d5: SourceRef;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: typeof D8_CONTEXT_AUTHORITY;
  alarmRationalized: false;
  validatedAlarmDesign: false;
  engineeringValidated: false;
  priorityValidated: false;
  priorityCalculated: false;
  priorityAutoAssigned: false;
  logicImplemented: false;
  validatedInterlockDesign: false;
  validatedShutdownLogic: false;
  functionalSafetyValidated: false;
  validatedPermissiveLogic: false;
  validatedLogicDesign: false;
  sifValidated: false;
  sifArchitectureDesignedByEos: false;
  silVerified: false;
  silCalculatedByEos: false;
  functionalSafetyCertification: false;
  pfdCalculated: false;
  pfhCalculated: false;
  reliabilityCalculated: false;
  sensorArchitectureSelected: false;
  logicSolverArchitectureSelected: false;
  finalElementArchitectureSelected: false;
  validatedSrs: false;
  vendorEqualsProjectValidation: false;
  vendorEqualsD8Certification: false;
  proofTestEqualsValidation: false;
  proofTestEqualsSifValidated: false;
  standardEqualsCompliance: false;
  silContextEqualsCertification: false;
  sisConfigured: false;
  logicSolverConfigured: false;
  causeEffectConvertedToLogic: false;
  tripIntentConvertedToLogic: false;
  shutdownIntentConvertedToLogic: false;
  d6AutoRepointed: false;
  d7AutoRepointed: false;
  d6AlarmEqualsValidatedDesign: false;
  d6SafetyIntentEqualsValidation: false;
  d7EqualsControlLogic: false;
  d7EqualsFunctionalSafety: false;
  d7EqualsSisImplementation: false;
  d4EqualsSafetyLogic: false;
  d5EqualsSafetyLogic: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorContextRecordId: string | null;
};

export type D8R6RelationshipInput = Prohibited & Governed & {
  relationshipId: string;
  kind: string;
  subjectRecordId: string;
  subjectRevisionFingerprint: string;
  endpointKind: string;
  endpointRecordId: string;
  endpointRevisionFingerprint: string;
  predecessorRelationshipId?: string | null;
};

export type D8R6RelationshipRecord = {
  relationshipId: string;
  kind: RelationshipKind;
  subjectRecordId: string;
  subjectRevisionFingerprint: string;
  subjectObjectId: string;
  subjectObjectRevisionFingerprint: string;
  endpointKind: EndpointKind;
  endpointRecordId: string;
  endpointRevisionFingerprint: string;
  endpointObjectId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  inferred: false;
  logicImplemented: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorRelationshipId: string | null;
};

export type D8R6History = {
  historyId: string;
  subjectKind: "CONTEXT" | "RELATIONSHIP";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D8R6Store = {
  r5: D8R5Store;
  now: () => string;
  contexts: D8R6ContextRecord[];
  relationships: D8R6RelationshipRecord[];
  history: D8R6History[];
};

const BOUNDARIES = {
  alarmRationalized: false,
  validatedAlarmDesign: false,
  engineeringValidated: false,
  priorityValidated: false,
  priorityCalculated: false,
  priorityAutoAssigned: false,
  logicImplemented: false,
  validatedInterlockDesign: false,
  validatedShutdownLogic: false,
  functionalSafetyValidated: false,
  validatedPermissiveLogic: false,
  validatedLogicDesign: false,
  sifValidated: false,
  sifArchitectureDesignedByEos: false,
  silVerified: false,
  silCalculatedByEos: false,
  functionalSafetyCertification: false,
  pfdCalculated: false,
  pfhCalculated: false,
  reliabilityCalculated: false,
  sensorArchitectureSelected: false,
  logicSolverArchitectureSelected: false,
  finalElementArchitectureSelected: false,
  validatedSrs: false,
  vendorEqualsProjectValidation: false,
  vendorEqualsD8Certification: false,
  proofTestEqualsValidation: false,
  proofTestEqualsSifValidated: false,
  standardEqualsCompliance: false,
  silContextEqualsCertification: false,
  sisConfigured: false,
  logicSolverConfigured: false,
  causeEffectConvertedToLogic: false,
  tripIntentConvertedToLogic: false,
  shutdownIntentConvertedToLogic: false,
  d6AutoRepointed: false,
  d7AutoRepointed: false,
  d6AlarmEqualsValidatedDesign: false,
  d6SafetyIntentEqualsValidation: false,
  d7EqualsControlLogic: false,
  d7EqualsFunctionalSafety: false,
  d7EqualsSisImplementation: false,
  d4EqualsSafetyLogic: false,
  d5EqualsSafetyLogic: false,
} as const;

function fail(code: string): never {
  throw new Error(`D8_R6_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || SPOOF.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isStage(value: string): value is Stage {
  return (D8_MATURITY_STATES as readonly string[]).includes(value);
}

function isCurrentness(value: string): value is Currentness {
  return (D8_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function allow<T extends string>(value: string, allowed: readonly T[], code: string): T {
  const token = explicit(value, code);
  if (!(allowed as readonly string[]).includes(token)) fail(code);
  return token as T;
}

function supplied(value: string | null | undefined, code: string): string | null {
  const token = value?.trim() ?? "";
  return token ? explicit(token, code) : null;
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
  if (input.calculatePriority === true || input.autoAssignPriority === true || input.calculatedPriority?.trim()) fail("ALARM_PRIORITY_CALCULATION_NOT_IN_R6");
  if (input.alarmRationalization === true || input.alarmFlood === true || input.alarmOptimization === true) fail("ALARM_RATIONALIZATION_NOT_IN_R6");
  if (input.interlockLogic === true || input.tripLogic === true || input.shutdownLogic === true || input.generateLogic === true || input.generateSafetyLogic === true) fail("SAFETY_LOGIC_NOT_IN_R6");
  if (input.convertCauseEffect === true || input.convertTrip === true || input.convertShutdown === true) fail("CAUSE_EFFECT_TO_LOGIC_NOT_IN_R6");
  if (input.silCalculation === true || input.silVerification === true) fail("SIL_CALCULATION_NOT_IN_R6");
  if (input.pfdCalculation === true || input.pfhCalculation === true || input.reliabilityCalculation === true || input.pfdValue?.trim() || input.pfhValue?.trim()) fail("PFD_CALCULATION_NOT_IN_R6");
  if (input.designSif === true || input.selectSensorArchitecture === true || input.selectLogicSolverArchitecture === true || input.selectFinalElementArchitecture === true) fail("SIF_DESIGN_NOT_IN_R6");
  if (input.functionalSafetyValidation === true || input.projectValidation === true || input.approved === true || input.certified === true) fail("FUNCTIONAL_SAFETY_VALIDATION_NOT_IN_R6");
  if (input.configureSis === true || input.configureLogicSolver === true) fail("SIS_CONFIGURATION_NOT_IN_R6");
  if (input.configureDcs === true || input.configurePlc === true || input.configureScada === true || input.configureRtu === true) fail("CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R6");
  if (input.networkDesign === true || input.cybersecurityValidation === true || input.securityCompliance === true) fail("NETWORK_DESIGN_NOT_IN_R6");
  if (input.mutateR1 === true) fail("R1_MUTATION_REJECTED");
  if (input.mutateR2 === true) fail("R2_MUTATION_REJECTED");
  if (input.mutateR3 === true) fail("R3_MUTATION_REJECTED");
  if (input.mutateR4 === true) fail("R4_MUTATION_REJECTED");
  if (input.mutateR5 === true) fail("R5_MUTATION_REJECTED");
  if (input.inferredRelationship === true || input.inferredLineage === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.repoint === true || input.autoRepointD6 === true) fail("D6_SOURCE_AUTO_REPOINT_REJECTED");
  if (input.autoRepointD7 === true) fail("D7_SOURCE_AUTO_REPOINT_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R6");
  if (input.processAuthorityAdopted === true || input.electricalAuthorityAdopted === true || input.mechanicalAuthorityAdopted === true || input.pipingAuthorityAdopted === true) fail("DISCIPLINE_AUTHORITY_NOT_TRANSFERRED");
}

function governed(input: Governed, scopeId: string): { provenanceRef: string; sourceBasisRef: string; applicability: string; limitations: string } {
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(scopeId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return { provenanceRef, sourceBasisRef, applicability, limitations };
}

function sourceOf(input: { sourceId?: string | null; sourceRevisionFingerprint?: string | null; sourceSubject?: string | null }, allowed: readonly string[], code: string): SourceRef {
  const present = Boolean(input.sourceId || input.sourceRevisionFingerprint || input.sourceSubject);
  if (!present) return { sourceId: null, sourceRevisionFingerprint: null, sourceSubject: null };
  if (!input.sourceId || !input.sourceRevisionFingerprint || !input.sourceSubject) fail(code);
  const sourceSubject = explicit(input.sourceSubject, code);
  if (!allowed.includes(sourceSubject)) fail(code);
  return { sourceId: explicit(input.sourceId, code), sourceRevisionFingerprint: explicit(input.sourceRevisionFingerprint, code), sourceSubject };
}

function objectTypeFor(kind: ContextKind): D8R1ObjectRecord["objectType"] {
  if (kind === "ALARM") return "IAC_ALARM_CONTEXT";
  if (kind === "INTERLOCK" || kind === "PERMISSIVE") return "IAC_INTERLOCK_CONTEXT";
  if (kind === "TRIP" || kind === "SHUTDOWN") return "IAC_SHUTDOWN_CONTEXT";
  if (kind === "CAUSE_EFFECT") return "IAC_CAUSE_EFFECT_CONTEXT";
  return "IAC_FUNCTIONAL_SAFETY_CONTEXT";
}

function requireObject(store: D8R6Store, actor: D8R1Actor, contextId: string, objectId: string, revisionFingerprint: string, cited: Currentness): D8R1ObjectRecord {
  const id = explicit(objectId, "R1_REVISION_REQUIRED");
  const revision = explicit(revisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function sameLineage(store: D8R6Store, object: D8R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D8R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    const predecessorId: string | null = cursor.predecessorObjectId;
    cursor = predecessorId ? store.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === predecessorId) : undefined;
  }
  return false;
}

function remember(store: D8R6Store, subjectKind: D8R6History["subjectKind"], subjectId: string, action: D8R6History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function endpointOf(store: D8R6Store, actor: D8R1Actor, kind: EndpointKind, recordId: string, revision: string): { recordId: string; fingerprint: string; objectId: string } {
  const id = explicit(recordId, "ENDPOINT_REVISION_REQUIRED");
  const cited = explicit(revision, "ENDPOINT_REVISION_REQUIRED");
  const mismatch = `${kind}_REVISION_MISMATCH`;
  if (kind === "MEASUREMENT") {
    const row = store.r5.r4.r3.r2.measurements.find((item) => item.measurementRecordId === id);
    if (!row || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT" || row.fingerprint !== cited) fail(mismatch);
    return { recordId: row.measurementRecordId, fingerprint: row.fingerprint, objectId: row.objectId };
  }
  if (kind === "DEVICE") {
    const row = store.r5.r4.r3.devices.find((item) => item.deviceRecordId === id);
    if (!row || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT" || row.fingerprint !== cited) fail(mismatch);
    return { recordId: row.deviceRecordId, fingerprint: row.fingerprint, objectId: row.objectId };
  }
  if (kind === "SIGNAL") {
    const row = store.r5.r4.signals.find((item) => item.signalRecordId === id);
    if (!row || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT" || row.fingerprint !== cited) fail(mismatch);
    return { recordId: row.signalRecordId, fingerprint: row.fingerprint, objectId: row.objectId };
  }
  if (kind === "IO") {
    const row = store.r5.r4.ioRecords.find((item) => item.ioRecordId === id);
    if (!row || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT" || row.fingerprint !== cited) fail(mismatch);
    return { recordId: row.ioRecordId, fingerprint: row.fingerprint, objectId: row.objectId };
  }
  if (kind === "LOOP") {
    const row = store.r5.r4.loops.find((item) => item.loopRecordId === id);
    if (!row || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT" || row.fingerprint !== cited) fail(mismatch);
    return { recordId: row.loopRecordId, fingerprint: row.fingerprint, objectId: row.objectId };
  }
  const system = store.r5.systems.find((item) => item.systemRecordId === id);
  if (system) {
    if (system.tenantId !== actor.tenantId || system.recordStatus !== "CURRENT" || system.fingerprint !== cited) fail(mismatch);
    return { recordId: system.systemRecordId, fingerprint: system.fingerprint, objectId: system.objectId };
  }
  const node = store.r5.nodes.find((item) => item.nodeRecordId === id);
  if (!node || node.tenantId !== actor.tenantId || node.recordStatus !== "CURRENT" || node.fingerprint !== cited) fail(mismatch);
  return { recordId: node.nodeRecordId, fingerprint: node.fingerprint, objectId: node.objectId };
}

export function createD8R6Store(r5: D8R5Store, now: () => string = () => "2026-10-25T00:00:00.000Z"): D8R6Store {
  return { r5, now, contexts: [], relationships: [], history: [] };
}

export function recordIacSafetyContext(store: D8R6Store, actor: D8R1Actor, input: D8R6ContextInput): D8R6ContextRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const stageToken = input.citedLifecycleStage.trim();
  if (!isStage(stageToken)) fail("MATURITY_STAGE_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.recordStatus !== "CURRENT" || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  const kind = allow(input.kind, D8_R6_CONTEXT_KINDS, "CONTEXT_KIND_NOT_ALLOWLISTED");
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, citedCurrentness);
  if (object.objectType !== objectTypeFor(kind)) fail("OBJECT_TYPE_NOT_SAFETY_KIND");
  const suppliedPriority = supplied(input.suppliedPriority, "ALARM_PRIORITY_NOT_SUPPLIED");
  const suppliedSilRequirement = supplied(input.suppliedSilRequirement, "SIL_REQUIREMENT_NOT_SUPPLIED");
  const suppliedReference = supplied(input.suppliedReference, "SUPPLIED_REFERENCE_REQUIRED");
  if (kind !== "ALARM" && suppliedPriority) fail("ALARM_PRIORITY_NOT_IN_KIND");
  if (kind === "SIL_REQUIREMENT" && !suppliedSilRequirement) fail("SIL_REQUIREMENT_REQUIRED");
  if (kind !== "SIL_REQUIREMENT" && suppliedSilRequirement) fail("SIL_REQUIREMENT_NOT_IN_KIND");
  if ((kind === "SIF" || kind === "SAFETY_REQUIREMENT" || kind === "VENDOR_CERTIFICATION" || kind === "PROOF_TEST" || kind === "STANDARD_REFERENCE" || kind === "CAUSE_EFFECT") && !suppliedReference) fail("SUPPLIED_REFERENCE_REQUIRED");
  const d6 = sourceOf({ sourceId: input.d6SourceId, sourceRevisionFingerprint: input.d6SourceRevisionFingerprint, sourceSubject: input.d6Subject }, D8_D6_INTERFACE_SUBJECTS, "D6_SOURCE_REVISION_REQUIRED");
  const d7 = sourceOf({ sourceId: input.d7SourceId, sourceRevisionFingerprint: input.d7SourceRevisionFingerprint, sourceSubject: input.d7Subject }, D8_D7_INTERFACE_SUBJECTS, "D7_SOURCE_REVISION_REQUIRED");
  const d4 = sourceOf({ sourceId: input.d4SourceId, sourceRevisionFingerprint: input.d4SourceRevisionFingerprint, sourceSubject: input.d4Subject }, D8_D4_INTERFACE_SUBJECTS, "D4_SOURCE_REVISION_REQUIRED");
  const d5 = sourceOf({ sourceId: input.d5SourceId, sourceRevisionFingerprint: input.d5SourceRevisionFingerprint, sourceSubject: input.d5Subject }, D8_D5_INTERFACE_SUBJECTS, "D5_SOURCE_REVISION_REQUIRED");
  const basis = governed(input, object.objectId);
  const contextRecordId = explicit(input.contextRecordId, "SAFETY_CONTEXT_REQUIRED");
  const predecessor = input.predecessorContextRecordId ? store.contexts.find((row) => row.contextRecordId === input.predecessorContextRecordId) : null;
  if (input.predecessorContextRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.kind !== kind || !sameLineage(store, object, predecessor.objectId))) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    contextRecordId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    kind,
    suppliedPriority,
    suppliedSilRequirement,
    suppliedReference,
    d6,
    d7,
    d4,
    d5,
    ...basis,
    predecessorContextRecordId: predecessor?.contextRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.contexts.find((row) => row.contextRecordId === contextRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINGERPRINT_MISMATCH");
  const duplicate = store.contexts.find((row) => row.recordStatus === "CURRENT" && row.contextRecordId !== predecessor?.contextRecordId && row.objectId === object.objectId && row.kind === kind);
  if (duplicate) fail("DUPLICATE_SAFETY_CONTEXT_REJECTED");
  if (predecessor) {
    const kept = predecessor.objectRevisionFingerprint;
    const keptD6 = predecessor.d6.sourceRevisionFingerprint;
    const index = store.contexts.findIndex((row) => row.contextRecordId === predecessor.contextRecordId);
    store.contexts[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.contexts[index].objectRevisionFingerprint !== kept || store.contexts[index].d6.sourceRevisionFingerprint !== keptD6) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "CONTEXT", predecessor.contextRecordId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D8R6ContextRecord = Object.freeze({
    contextRecordId,
    contextId: context.contextId,
    objectId: object.objectId,
    objectType: object.objectType,
    objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    citedLifecycleStage: stageToken,
    citedCurrentness,
    kind,
    suppliedPriority,
    suppliedSilRequirement,
    suppliedReference,
    d6,
    d7,
    d4,
    d5,
    ...basis,
    authority: D8_CONTEXT_AUTHORITY,
    ...BOUNDARIES,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorContextRecordId: predecessor?.contextRecordId ?? null,
  });
  store.contexts.push(record);
  remember(store, "CONTEXT", contextRecordId, "CREATED", fingerprint);
  return record;
}

export function recordIacSafetyRelationship(store: D8R6Store, actor: D8R1Actor, input: D8R6RelationshipInput): D8R6RelationshipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const kind = allow(input.kind, D8_R6_RELATIONSHIP_KINDS, "RELATIONSHIP_KIND_NOT_ALLOWLISTED");
  const endpointKind = allow(input.endpointKind, D8_R6_ENDPOINT_KINDS, "ENDPOINT_KIND_NOT_ALLOWLISTED");
  const subject = store.contexts.find((row) => row.contextRecordId === explicit(input.subjectRecordId, "SUBJECT_REVISION_REQUIRED"));
  if (!subject || subject.tenantId !== actor.tenantId || subject.recordStatus !== "CURRENT" || subject.fingerprint !== explicit(input.subjectRevisionFingerprint, "SUBJECT_REVISION_REQUIRED") || subject.kind !== kind) fail("SUBJECT_REVISION_MISMATCH");
  const endpoint = endpointOf(store, actor, endpointKind, input.endpointRecordId, input.endpointRevisionFingerprint);
  const basis = governed(input, subject.objectId);
  if (!basis.applicability.includes(endpoint.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const relationshipId = explicit(input.relationshipId, "RELATIONSHIP_REQUIRED");
  const predecessor = input.predecessorRelationshipId ? store.relationships.find((row) => row.relationshipId === input.predecessorRelationshipId) : null;
  if (input.predecessorRelationshipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.kind !== kind)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    relationshipId,
    kind,
    subjectRecordId: subject.contextRecordId,
    subjectRevisionFingerprint: subject.fingerprint,
    endpointKind,
    endpointRecordId: endpoint.recordId,
    endpointRevisionFingerprint: endpoint.fingerprint,
    ...basis,
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.relationships.find((row) => row.relationshipId === relationshipId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINGERPRINT_MISMATCH");
  const duplicate = store.relationships.find((row) => row.recordStatus === "CURRENT" && row.relationshipId !== predecessor?.relationshipId && row.kind === kind && row.subjectRecordId === subject.contextRecordId && row.endpointKind === endpointKind && row.endpointRecordId === endpoint.recordId);
  if (duplicate) fail("DUPLICATE_RELATIONSHIP_REJECTED");
  if (predecessor) {
    const kept = predecessor.endpointRevisionFingerprint;
    const index = store.relationships.findIndex((row) => row.relationshipId === predecessor.relationshipId);
    store.relationships[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.relationships[index].endpointRevisionFingerprint !== kept) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "RELATIONSHIP", predecessor.relationshipId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D8R6RelationshipRecord = Object.freeze({
    relationshipId,
    kind,
    subjectRecordId: subject.contextRecordId,
    subjectRevisionFingerprint: subject.fingerprint,
    subjectObjectId: subject.objectId,
    subjectObjectRevisionFingerprint: subject.objectRevisionFingerprint,
    endpointKind,
    endpointRecordId: endpoint.recordId,
    endpointRevisionFingerprint: endpoint.fingerprint,
    endpointObjectId: endpoint.objectId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    ...basis,
    inferred: false,
    logicImplemented: false,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  store.relationships.push(record);
  remember(store, "RELATIONSHIP", relationshipId, "CREATED", fingerprint);
  return record;
}

export function rationalizeIacAlarm(): never {
  fail("ALARM_RATIONALIZATION_NOT_IN_R6");
}
export function calculateIacAlarmPriority(): never {
  fail("ALARM_PRIORITY_CALCULATION_NOT_IN_R6");
}
export function calculateIacSil(): never {
  fail("SIL_CALCULATION_NOT_IN_R6");
}
export function verifyIacSil(): never {
  fail("SIL_CALCULATION_NOT_IN_R6");
}
export function calculateIacPfd(): never {
  fail("PFD_CALCULATION_NOT_IN_R6");
}
export function designIacSifArchitecture(): never {
  fail("SIF_DESIGN_NOT_IN_R6");
}
export function configureIacSisFromSafety(): never {
  fail("SIS_CONFIGURATION_NOT_IN_R6");
}
export function generateIacSafetyLogic(): never {
  fail("SAFETY_LOGIC_NOT_IN_R6");
}
export function convertIacCauseEffectToLogic(): never {
  fail("CAUSE_EFFECT_TO_LOGIC_NOT_IN_R6");
}
export function validateIacFunctionalSafety(): never {
  fail("FUNCTIONAL_SAFETY_VALIDATION_NOT_IN_R6");
}
export function mutateIacControlSystemFromSafety(): never {
  fail("R5_MUTATION_REJECTED");
}
