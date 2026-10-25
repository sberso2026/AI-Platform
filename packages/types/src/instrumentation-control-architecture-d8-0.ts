/**
 * EOS-D8-0 Instrumentation and Control architecture.
 * Contracts only. No instrument selection, sizing, control logic, loop tuning, SIL verification, functional-safety validation, conformance, approval, or certification.
 */
import { EOS_JURISDICTION_PROFILE_IDS } from "./global-governance";
import { D4_D8_FUTURE_CONTRACT_SUBJECTS } from "./mechanical-architecture-d4-0";
import { D7_CURRENTNESS_STATES, D7_D8_FUTURE_CONTRACT_SUBJECTS, D7_DIGITAL_THREAD_MODULE, D7_FINGERPRINT_ALGORITHM, D7_MATURITY_STATES } from "./electrical-architecture-d7-0";
import { D5_D8_FUTURE_CONTRACT_SUBJECTS } from "./piping-architecture-d5-0";
import { D6_D8_FUTURE_CONTRACT_SUBJECTS } from "./process-architecture-d6-0";

export const D8_0_STATUS = "ARCHITECTURE_DEFINED" as const;
export const D8_0_MATURITY = "ARCHITECTURE_DEFINED" as const;
export const D8_0_PHASE = "EOS-D8-0-INSTRUMENTATION-CONTROL-ARCHITECTURE-CANONICALIZATION" as const;
export const D8_0_PHASE_TYPE = "INSTRUMENTATION_CONTROL_ARCHITECTURE_CANONICALIZATION" as const;
export const D8_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D8_0_INSTRUMENTATION_CONTROL_ARCHITECTURE_CANONICALIZATION_CLOSEOUT.md" as const;
export const D8_0_CLOSEOUT_PATH = D8_ARCHITECTURE_PATH;
export const D8_ARCHITECTURE_DEFINED = true as const;
export const D8_ARCHITECTURE_READY = true as const;
export const D8_SCOPE_DEFINED = true as const;
export const D8_OWNERSHIP_DEFINED = true as const;
export const D8_PARENT_ELECTRICAL_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D7_R12_ELECTRICAL_BOUNDED_CLOSEOUT.md" as const;

export const D8_CANONICAL_SCOPE =
  "Bounded Instrumentation and Control context and governed I&C evidence for plant and project measurement, instrument, signal, I/O, control-loop, control-system, alarm, interlock, trip, shutdown, and functional-safety source context assigned to the Instrumentation and Control discipline. Includes exact-revision interfaces with Process, Electrical, and justified Mechanical, Piping, Civil, Structural, and Geotechnical source context, plus a future read-only D9 source contract. No I&C calculation, selection, control-logic, tuning, or functional-safety validation runtime." as const;
export const D8_CANONICAL_NON_SCOPE =
  "No Process design, Electrical design, Mechanical equipment design, Piping design, Structural design, Civil design, or Geotechnical design. No instrument sizing or selection, control-valve sizing, actuator sizing, control-loop tuning, PLC or DCS or SIS logic design, automatic control-logic generation, SIL calculation, SIL verification, functional-safety validation, OT cybersecurity certification, network hardening, conformance, approval, certification, or multidisciplinary reasoning." as const;
export const D8_SCOPE_CANONICALIZED = true as const;
export const D8_ABSORBS_D1_D7 = false as const;
export const D8_ABSORBS_D9 = false as const;

export const D8_REUSES_CANONICAL_EOS_GOVERNANCE = true as const;
export const D8_REUSES_CANONICAL_EOS_GOVERNANCE_PATTERNS = D8_REUSES_CANONICAL_EOS_GOVERNANCE;
export const PARALLEL_D8_GOVERNANCE_FRAMEWORK_CREATED = false as const;

export const D8_EQUALS_D1_STRUCTURAL_AUTHORITY = false as const;
export const D8_EQUALS_D2_CIVIL_AUTHORITY = false as const;
export const D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY = false as const;
export const D8_EQUALS_D4_MECHANICAL_AUTHORITY = false as const;
export const D8_EQUALS_D5_PIPING_AUTHORITY = false as const;
export const D8_EQUALS_D6_PROCESS_AUTHORITY = false as const;
export const D8_EQUALS_D7_ELECTRICAL_AUTHORITY = false as const;
export const AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY = false as const;
export const AI_EQUALS_D8_IAC_ENGINEERING_REVIEWER_AUTHORITY = false as const;
export const ADMIN_EQUALS_D8_IAC_ENGINEERING_REVIEWER_AUTHORITY = false as const;
export const AI_EQUALS_D8_VALIDATION_AUTHORITY = false as const;
export const ADMIN_EQUALS_D8_VALIDATION_AUTHORITY = false as const;
export const D9_EQUALS_D8_IAC_ENGINEERING_AUTHORITY = false as const;

export const D8_CANONICAL_OBJECT_TAXONOMY_DEFINED = true as const;
export const D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_DEFINED = true as const;
export const D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLISTED = true as const;
export const D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED = false as const;
export const D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPES_ALLOWED = false as const;
export const D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED = false as const;
export const D8_IAC_OBJECT_TYPES = [
  "IAC_MEASUREMENT_POINT",
  "IAC_INSTRUMENT",
  "IAC_SIGNAL",
  "IAC_IO_POINT",
  "IAC_CONTROL_LOOP",
  "IAC_CONTROL_SYSTEM_CONTEXT",
  "IAC_ALARM_CONTEXT",
  "IAC_INTERLOCK_CONTEXT",
  "IAC_SHUTDOWN_CONTEXT",
  "IAC_FUNCTIONAL_SAFETY_CONTEXT",
  "IAC_CAUSE_EFFECT_CONTEXT",
  "IAC_CONTROL_VALVE_CONTEXT",
  "IAC_DOCUMENT_EVIDENCE",
  "IAC_INTERFACE",
  "IAC_GOVERNANCE_RECORD",
] as const;
export const D8_GOVERNED_RECORD_TYPES = [
  "IAC_REQUIREMENT",
  "IAC_ASSUMPTION",
  "IAC_ENGINEERING_DECISION",
  "IAC_EVIDENCE_REFERENCE",
] as const;
export const D8_INSTRUMENT_DEVICE_CLASSES = [
  "SENSOR",
  "TRANSMITTER",
  "ANALYZER",
  "SWITCH",
  "GAUGE_OR_INDICATOR",
  "ACTUATOR",
  "POSITIONER",
  "INSTRUMENT_PACKAGE",
] as const;
export const D8_CONTROL_SYSTEM_CLASSES = [
  "DCS",
  "PLC",
  "SIS_OR_ESD",
  "RTU_OR_SCADA",
  "HMI",
  "CONTROL_PANEL",
  "MARSHALLING",
] as const;
export const D8_FUNCTIONAL_SAFETY_EVIDENCE_CLASSES = [
  "HAZARD_ANALYSIS_REFERENCE",
  "SIF_REFERENCE",
  "SIL_REQUIREMENT_REFERENCE",
  "CAUSE_AND_EFFECT_REFERENCE",
  "SAFETY_REQUIREMENT_REFERENCE",
  "PROOF_TEST_EVIDENCE",
  "VENDOR_CERTIFICATION_EVIDENCE",
] as const;
export const D8_INSTRUMENT_CLASS_IS_NOT_OBJECT_TYPE = true as const;
export const D8_CONTROL_SYSTEM_CLASS_IS_NOT_OBJECT_TYPE = true as const;
export const D8_FUNCTIONAL_SAFETY_EVIDENCE_CLASS_IS_NOT_OBJECT_TYPE = true as const;

export const IAC_OBJECT_IDENTITY_EQUALS_VALIDATED_IAC_DESIGN = false as const;
export const IAC_OBJECT_IDENTITY_EQUALS_ENGINEERING_VALIDATED = false as const;
export const IAC_OBJECT_IDENTITY_EQUALS_CODE_CONFORMANCE = false as const;
export const IAC_OBJECT_IDENTITY_EQUALS_APPROVAL = false as const;
export const IAC_OBJECT_IDENTITY_EQUALS_CERTIFICATION = false as const;

export const PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE = false as const;
export const MEASUREMENT_POINT_CONTEXT_EQUALS_INSTRUMENT_SELECTION = false as const;
export const MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_INSTRUMENT_DESIGN = false as const;
export const INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION = false as const;
export const INSTRUMENT_DATASHEET_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_DESIGN = false as const;
export const VENDOR_INSTRUMENT_DATA_EQUALS_PROJECT_VALIDATION = false as const;
export const SIGNAL_CONTEXT_EQUALS_VALIDATED_IO_DESIGN = false as const;
export const IO_CONTEXT_EQUALS_VALIDATED_CONTROL_SYSTEM_CONFIGURATION = false as const;
export const CONTROL_LOOP_CONTEXT_EQUALS_CONTROL_LOGIC_DESIGN = false as const;
export const CONTROL_LOOP_CONTEXT_EQUALS_LOOP_TUNING = false as const;
export const CONTROL_LOOP_CONTEXT_EQUALS_VALIDATED_CONTROL_PERFORMANCE = false as const;
export const CONTROL_SYSTEM_CONTEXT_EQUALS_VALIDATED_CONTROL_SYSTEM_DESIGN = false as const;
export const CONTROL_SYSTEM_CONTEXT_EQUALS_NETWORK_DESIGN_VALIDATED = false as const;
export const CONTROL_SYSTEM_CONTEXT_EQUALS_CYBERSECURITY_VALIDATED = false as const;
export const ALARM_CONTEXT_EQUALS_ALARM_RATIONALIZATION_COMPLETE = false as const;
export const ALARM_PRESENT_EQUALS_VALIDATED_ALARM_PRIORITY = false as const;
export const ALARM_CONTEXT_EQUALS_APPROVED_ALARM_PHILOSOPHY = false as const;
export const INTERLOCK_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED = false as const;
export const TRIP_CONTEXT_EQUALS_VALIDATED_SHUTDOWN_LOGIC = false as const;
export const SHUTDOWN_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED = false as const;
export const FUNCTIONAL_SAFETY_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED = false as const;
export const SIL_REQUIREMENT_EQUALS_SIL_VERIFIED = false as const;
export const SIF_CONTEXT_EQUALS_SIF_VALIDATED = false as const;
export const VENDOR_SAFETY_CERTIFICATION_EQUALS_PROJECT_SAFETY_VALIDATION = false as const;
export const CAUSE_EFFECT_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED = false as const;
export const CAUSE_EFFECT_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED = false as const;
export const CONTROL_VALVE_CONTEXT_EQUALS_VALIDATED_VALVE_SIZING = false as const;
export const ACTUATOR_CONTEXT_EQUALS_VALIDATED_ACTUATOR_SELECTION = false as const;
export const SUPPLIED_INSTRUMENT_RANGE_EQUALS_VALIDATED_RANGE_SELECTION = false as const;
export const SUPPLIED_SETPOINT_EQUALS_VALIDATED_SETPOINT = false as const;

export const D6_PROCESS_REQUIREMENT_EQUALS_D8_IAC_DESIGN = false as const;
export const D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT = false as const;
export const D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN = false as const;
export const D6_PROCESS_SAFETY_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const D7_POWER_INTERFACE_EQUALS_D8_IAC_DESIGN = false as const;
export const D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN = false as const;
export const D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION = false as const;
export const D7_PROTECTION_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const D4_MECHANICAL_EQUIPMENT_CONTEXT_EQUALS_D8_IAC_DESIGN = false as const;
export const D8_IAC_CONTEXT_EQUALS_D4_MECHANICAL_DESIGN = false as const;
export const D5_PIPING_CONTEXT_EQUALS_D8_IAC_DESIGN = false as const;
export const D8_INSTRUMENT_CONTEXT_EQUALS_VALIDATED_D5_PIPING_DESIGN = false as const;
export const D8_VALIDATES_D1_STRUCTURAL_ENGINEERING = false as const;
export const D8_VALIDATES_D2_CIVIL_ENGINEERING = false as const;
export const D8_VALIDATES_D3_GEOTECHNICAL_ENGINEERING = false as const;
export const D8_VALIDATES_D4_MECHANICAL_ENGINEERING = false as const;
export const D8_VALIDATES_D5_PIPING_ENGINEERING = false as const;
export const D8_VALIDATES_D6_PROCESS_ENGINEERING = false as const;
export const D8_VALIDATES_D7_ELECTRICAL_ENGINEERING = false as const;

export const AI_CAN_INVENT_AUTHORITATIVE_D8_INSTRUMENT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_SIGNAL = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_CONTROL_LOOP = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_INTERLOCK = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_SIF = false as const;
export const AI_CAN_PROMOTE_D8_CONTEXT_TO_VALIDATED_ENGINEERING = false as const;

export const D8_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE = true as const;
export const D8_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE = true as const;
export const D8_REUSES_CANONICAL_DECISION_GOVERNANCE = true as const;
export const D8_REUSES_CANONICAL_CHANGE_GOVERNANCE = true as const;
export const PARALLEL_D8_REQUIREMENT_ENGINE_CREATED = false as const;
export const PARALLEL_D8_ASSUMPTION_ENGINE_CREATED = false as const;
export const PARALLEL_D8_DECISION_ENGINE_CREATED = false as const;
export const PARALLEL_D8_CHANGE_ENGINE_CREATED = false as const;
export const SOURCE_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT = false as const;
export const SOURCE_REQUIREMENT_AUTO_ADOPTED = false as const;
export const D8_ASSUMPTION_EQUALS_VALIDATED_FACT = false as const;
export const AI_RECOMMENDATION_EQUALS_D8_ENGINEERING_DECISION = false as const;
export const ADMIN_ACTION_EQUALS_D8_ENGINEERING_DECISION = false as const;
export const D8_CHANGE_EQUALS_AUTOMATIC_REDESIGN = false as const;
export const D8_CHANGE_EQUALS_AUTOMATIC_REVALIDATION = false as const;
export const D8_CHANGE_SUPPORTS_EXACT_DEPENDENCIES = true as const;
export const D8_CHANGE_SUPPORTS_SUPERSESSION = true as const;
export const D8_CHANGE_SUPPORTS_STALENESS = true as const;
export const D8_CHANGE_SUPPORTS_REASSESSMENT = true as const;

export const D8_EXACT_REVISION_REFERENCE_REQUIRED = true as const;
export const D8_EXACT_REVISION_BINDING_ARCHITECTURE_DEFINED = true as const;
export const D8_FLOATING_AUTHORITATIVE_REFERENCE_ALLOWED = false as const;
export const D8_HISTORICAL_REFERENCE_AUTO_REPOINT_ALLOWED = false as const;
export const D8_HISTORY_PRESERVATION_REQUIRED = true as const;
export const SILENT_D8_HISTORY_MUTATION_ALLOWED = false as const;
export const D8_REUSES_CANONICAL_IDENTITY_GOVERNANCE = true as const;
export const PARALLEL_D8_IDENTITY_SYSTEM_CREATED = false as const;

export const D8_CURRENTNESS_STATES = D7_CURRENTNESS_STATES;
export const D8_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D8_CURRENTNESS_ENGINE_CREATED = false as const;
export const CURRENT_D8_RECORD_EQUALS_VALIDATED = false as const;
export const CURRENT_D8_RECORD_EQUALS_APPROVED = false as const;
export const CURRENT_D8_RECORD_EQUALS_CONFORMANT = false as const;
export const CURRENT_D8_RECORD_EQUALS_CERTIFIED = false as const;
export const STALE_D8_RECORD_EQUALS_INVALID = false as const;
export const SUPERSEDED_D8_RECORD_EQUALS_INVALID = false as const;
export const D8_FINGERPRINT_ALGORITHM = D7_FINGERPRINT_ALGORITHM;
export const D8_REUSES_CANONICAL_FINGERPRINT = true as const;
export const SECOND_D8_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D8_DIGITAL_THREAD_MODULE = D7_DIGITAL_THREAD_MODULE;
export const D8_REUSES_CANONICAL_DIGITAL_THREAD = true as const;
export const PARALLEL_D8_DIGITAL_THREAD_CREATED = false as const;
export const D8_EXPLICIT_LINEAGE_REQUIRED = true as const;
export const D8_INFERRED_LINEAGE_ALLOWED = false as const;
export const D8_INFERRED_LINEAGE_SOURCES_PROHIBITED = [
  "NAME_OR_TAG_SIMILARITY",
  "DOCUMENT_ADJACENCY",
  "SEMANTIC_SIMILARITY",
  "AI_REASONING",
] as const;
export const D8_MATURITY_STATES = D7_MATURITY_STATES;
export const D8_CREATES_PARALLEL_MATURITY_ENUM = false as const;

export const D8_SOURCE_BASIS_REQUIRED = true as const;
export const D8_SOURCE_BASIS_TRACEABLE = true as const;
export const D8_SOURCE_BASIS_ARCHITECTURE_DEFINED = true as const;
export const D8_APPLICABILITY_REQUIRED = true as const;
export const D8_LIMITATIONS_REQUIRED = true as const;
export const D8_APPLICABILITY_LIMITATIONS_ARCHITECTURE_DEFINED = true as const;
export const D8_PROVENANCE_REQUIRED = true as const;
export const D8_PROVENANCE_PRESERVED = true as const;
export const D8_PROVENANCE_ARCHITECTURE_DEFINED = true as const;
export const D8_AUTHORITATIVE_RECORD_PRESERVES = [
  "SOURCE",
  "BASIS",
  "APPLICABILITY",
  "LIMITATIONS",
  "PROVENANCE",
  "EXACT_REVISION",
] as const;
export const TENANT_WORKSPACE_PROJECT_D8_SCOPE_ARCHITECTURE_DEFINED = true as const;
export const CROSS_TENANT_D8_ACCESS_ALLOWED = false as const;

export const D8_REUSES_CANONICAL_REVIEW_GOVERNANCE = true as const;
export const D8_REUSES_CANONICAL_VALIDATION_GOVERNANCE = true as const;
export const PARALLEL_D8_REVIEW_ENGINE_CREATED = false as const;
export const PARALLEL_D8_VALIDATION_ENGINE_CREATED = false as const;
export const D8_REVIEW_REQUESTED_EQUALS_COMPLETED = false as const;
export const D8_REVIEW_COMPLETED_EQUALS_VALIDATED = false as const;
export const D8_FINDING_CLOSED_EQUALS_VALIDATED = false as const;
export const D8_VALIDATED_EQUALS_CONFORMANT = false as const;
export const D8_VALIDATED_EQUALS_APPROVED = false as const;
export const D8_VALIDATED_EQUALS_CERTIFIED = false as const;
export const D8_VALIDATED_EQUALS_REGULATORY_APPROVED = false as const;

export const D8_DISCIPLINE_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D8_D1_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D8_D1_FUTURE_CONTRACT_SUBJECTS = [
  "INSTRUMENT_SUPPORT_OR_MOUNTING_CONTEXT",
  "CONTROL_PANEL_STRUCTURAL_SUPPORT_CONTEXT",
] as const;
export const D8_D2_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D8_D2_FUTURE_CONTRACT_SUBJECTS = [
  "INSTRUMENT_TRENCH_OR_DUCT_CONTEXT",
  "CONTROL_BUILDING_OR_SITE_INTERFACE",
] as const;
export const D8_D3_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D8_D3_FUTURE_CONTRACT_SUBJECTS = [
  "SITE_INSTALLATION_GEOTECHNICAL_SOURCE",
] as const;
export const D8_D4_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D8_D4_INTERFACE_SUBJECTS = D4_D8_FUTURE_CONTRACT_SUBJECTS;
export const D8_D5_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D8_D5_INTERFACE_SUBJECTS = D5_D8_FUTURE_CONTRACT_SUBJECTS;
export const D8_D6_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D8_D6_INTERFACE_SUBJECTS = D6_D8_FUTURE_CONTRACT_SUBJECTS;
export const D8_D6_INTERFACE_COMPATIBLE_WITH_EXISTING_D6_R8_CONTRACT = true as const;
export const D8_D6_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D8_D7_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D8_D7_INTERFACE_SUBJECTS = D7_D8_FUTURE_CONTRACT_SUBJECTS;
export const D8_D7_INTERFACE_COMPATIBLE_WITH_EXISTING_D7_R8_CONTRACT = true as const;
export const D8_D7_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D8_INTERFACE_TRANSFERS_DISCIPLINE_AUTHORITY = false as const;

export const D8_D9_SOURCE_CONTRACT_ARCHITECTURE_DEFINED = true as const;
export const D8_D9_SOURCE_CONTRACT_FIELDS = [
  "IDENTITY",
  "MEASUREMENT_OR_INSTRUMENT",
  "SIGNAL_IO_OR_CONTROL_LOOP",
  "CONTROL_SYSTEM",
  "ALARM_INTERLOCK_OR_SHUTDOWN",
  "FUNCTIONAL_SAFETY_CONTEXT",
  "REQUIREMENTS",
  "ASSUMPTIONS",
  "ENGINEERING_DECISIONS",
  "EVIDENCE",
  "INTERFACES",
  "REVIEW_VALIDATION",
  "CURRENTNESS",
  "LINEAGE",
  "APPLICABILITY",
  "LIMITATIONS",
  "PROVENANCE",
  "AUTHORITY",
  "FINGERPRINT",
] as const;
export const D8_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT = false as const;
export const D8_D9_SOURCE_CONTRACT_DERIVES_NEW_ENGINEERING_VALUE = false as const;
export const D8_D9_SOURCE_CONTRACT_TRANSFERS_IAC_AUTHORITY = false as const;
export const D8_D9_SOURCE_CONTRACT_TRANSFERS_ENGINEERING_AUTHORITY = false as const;

export const D8_JURISDICTION_STANDARDS_ARCHITECTURE_DEFINED = true as const;
export const D8_SINGLE_JURISDICTION_HARDCODED_AS_GLOBAL_TRUTH = false as const;
export const D8_JURISDICTION_PROFILE_IDS = EOS_JURISDICTION_PROFILE_IDS;
export const D8_ADDS_JURISDICTION_PROFILE_ID = false as const;
export const D8_CLAIMS_LEGAL_OR_REGULATORY_COMPLIANCE = false as const;
export const STANDARD_REFERENCE_PRESENT_EQUALS_CONFORMANCE_DETERMINED = false as const;
export const FUNCTIONAL_SAFETY_STANDARD_REFERENCE_EQUALS_COMPLIANCE = false as const;
export const SIL_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_CERTIFICATION = false as const;
export const D8_CLAIMS_IEC_61508_COMPLIANCE = false as const;
export const D8_CLAIMS_IEC_61511_COMPLIANCE = false as const;
export const OT_CYBERSECURITY_CONTEXT_EQUALS_CYBERSECURITY_VALIDATED = false as const;
export const NETWORK_CONTEXT_EQUALS_SECURE_NETWORK_DESIGN = false as const;

export const D8_RUNTIME_COUNT = 0 as const;
export const D8_0_RUNTIME_STARTED = false as const;
export const D8_0_ADDS_SUBSTANTIVE_IAC_RUNTIME = false as const;
export const D8_INSTRUMENT_IDENTITY_RUNTIME_COUNT = 0 as const;
export const D8_MEASUREMENT_CONTEXT_RUNTIME_COUNT = 0 as const;
export const D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT = 0 as const;
export const D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT = 0 as const;
export const D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT = 0 as const;
export const D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT = 0 as const;
export const D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 0 as const;
export const D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 0 as const;
export const D8_REVIEW_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D8_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D8_INSTRUMENT_SIZING_RUNTIME_COUNT = 0 as const;
export const D8_INSTRUMENT_SELECTION_RUNTIME_COUNT = 0 as const;
export const D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT = 0 as const;
export const D8_ACTUATOR_SIZING_RUNTIME_COUNT = 0 as const;
export const D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT = 0 as const;
export const D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT = 0 as const;
export const D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT = 0 as const;
export const D8_SIL_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D8_SIL_VERIFICATION_RUNTIME_COUNT = 0 as const;
export const D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT = 0 as const;
export const D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D8_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D8_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;

export const D8_ENGINEERING_VALIDATED = false as const;
export const D8_CONFORMANT = false as const;
export const D8_APPROVED = false as const;
export const D8_CERTIFIED = false as const;
export const D8_REGULATORY_APPROVED = false as const;
export const D8_GA_READY = false as const;
export const D7_REOPENED = false as const;
export const D8_PRESERVES_D1_STRUCTURAL_PACK_INCOMPLETE = true as const;
export const D8_PRESERVES_D7_COMPLETE_BOUNDED_WITH_LIMITATIONS = true as const;
export const D8_0_DATABASE_SCHEMA_CHANGED = false as const;
export const D8_0_NEW_DEPENDENCY_ADDED = false as const;

export const D8_IMPLEMENTATION_PHASES = [
  "EOS-D8-R1-INSTRUMENTATION-CONTROL-IDENTITY-AND-OBJECT-FOUNDATION",
  "EOS-D8-R2-PROCESS-MEASUREMENT-AND-TAG-CONTEXT",
  "EOS-D8-R3-INSTRUMENT-AND-DEVICE-CONTEXT",
  "EOS-D8-R4-SIGNAL-IO-AND-CONTROL-LOOP-CONTEXT",
  "EOS-D8-R5-CONTROL-SYSTEM-ARCHITECTURE-CONTEXT",
  "EOS-D8-R6-SAFETY-INTERLOCK-AND-SHUTDOWN-CONTEXT",
  "EOS-D8-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE",
  "EOS-D8-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS",
  "EOS-D8-R9-REVIEW-AND-VALIDATION-GOVERNANCE",
  "EOS-D8-R10-CURRENTNESS-AND-DIGITAL-THREAD",
  "EOS-D8-R11-D9-SOURCE-CONTRACT",
  "EOS-D8-R12-INSTRUMENTATION-CONTROL-BOUNDED-CLOSEOUT",
] as const;
export const D8_IMPLEMENTATION_PHASE_TYPES = [
  "INSTRUMENTATION_CONTROL_IDENTITY_AND_OBJECT_FOUNDATION",
  "PROCESS_MEASUREMENT_AND_TAG_CONTEXT",
  "INSTRUMENT_AND_DEVICE_CONTEXT",
  "SIGNAL_IO_AND_CONTROL_LOOP_CONTEXT",
  "CONTROL_SYSTEM_ARCHITECTURE_CONTEXT",
  "SAFETY_INTERLOCK_AND_SHUTDOWN_CONTEXT",
  "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE",
  "DISCIPLINE_INTERFACES_AND_HANDOFFS",
  "REVIEW_AND_VALIDATION_GOVERNANCE",
  "CURRENTNESS_AND_DIGITAL_THREAD",
  "D9_SOURCE_CONTRACT",
  "INSTRUMENTATION_CONTROL_BOUNDED_CLOSEOUT",
] as const;
export const D8_CANONICAL_PHASE_DECOMPOSITION_DEFINED = true as const;
export const D8_CANONICAL_PHASE_COUNT = D8_IMPLEMENTATION_PHASES.length;
export const D8_CANONICAL_MILESTONE_COUNT_INCLUDING_D8_0 = D8_CANONICAL_PHASE_COUNT + 1;
export const D8_CANONICAL_MILESTONE_COUNT = D8_CANONICAL_MILESTONE_COUNT_INCLUDING_D8_0;
export const D8_CANONICAL_PHASES = D8_IMPLEMENTATION_PHASES;
export const D8_R1_PHASE = D8_IMPLEMENTATION_PHASES[0];
export const D8_R1_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[0];
export const D8_R1_CANONICAL_PHASE = D8_R1_PHASE;
export const D8_R1_CANONICAL_SCOPE =
  "Implement exact governed Instrumentation and Control identities and the canonical I&C object taxonomy with tenant, workspace, and project scope, lifecycle and maturity, provenance, canonical currentness, and the canonical fingerprint. Do not implement process-measurement engineering, instrument sizing or selection, signals, I/O, control loops, control-system design, alarms, interlocks, functional safety, requirements, interfaces, review, the D9 source contract, or any I&C calculation." as const;
export const D8_R2_PHASE = D8_IMPLEMENTATION_PHASES[1];
export const D8_R2_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[1];
export const D8_R3_PHASE = D8_IMPLEMENTATION_PHASES[2];
export const D8_R3_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[2];
export const D8_R4_PHASE = D8_IMPLEMENTATION_PHASES[3];
export const D8_R4_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[3];
export const D8_R5_PHASE = D8_IMPLEMENTATION_PHASES[4];
export const D8_R5_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[4];
export const D8_R6_PHASE = D8_IMPLEMENTATION_PHASES[5];
export const D8_R6_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[5];
export const D8_R7_PHASE = D8_IMPLEMENTATION_PHASES[6];
export const D8_R7_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[6];
export const D8_R8_PHASE = D8_IMPLEMENTATION_PHASES[7];
export const D8_R8_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[7];
export const D8_R9_PHASE = D8_IMPLEMENTATION_PHASES[8];
export const D8_R9_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[8];
export const D8_R10_PHASE = D8_IMPLEMENTATION_PHASES[9];
export const D8_R10_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[9];
export const D8_R11_PHASE = D8_IMPLEMENTATION_PHASES[10];
export const D8_R11_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[10];
export const D8_R12_PHASE = D8_IMPLEMENTATION_PHASES[11];
export const D8_R12_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[11];
export const D8_R1_STARTED = false as const;
export const D8_0_READY_FOR_NEXT_PHASE = true as const;
export const D8_0_NEXT_PHASE = D8_R1_CANONICAL_PHASE;
export const D8_0_NEXT_PHASE_TYPE = D8_R1_PHASE_TYPE;
export const D8_0_CANONICAL_NEXT_PHASE = D8_R1_CANONICAL_PHASE;
export const D8_0_CANONICAL_NEXT_PHASE_SCOPE = D8_R1_CANONICAL_SCOPE;
export const D8_0_BLOCKER = "NONE" as const;
export const D8_0_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D8_0_UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const D8_0_UNAUTHORIZED_D2_REOPEN = false as const;
export const D8_0_UNAUTHORIZED_D3_REOPEN = false as const;
export const D8_0_UNAUTHORIZED_D4_REOPEN = false as const;
export const D8_0_UNAUTHORIZED_D5_REOPEN = false as const;
export const D8_0_UNAUTHORIZED_D6_REOPEN = false as const;
export const D8_0_UNAUTHORIZED_D7_REOPEN = false as const;
export const D8_0_UNAUTHORIZED_D8_RUNTIME_PROMOTION = false as const;
export const D8_0_UNAUTHORIZED_INSTRUMENT_SIZING = false as const;
export const D8_0_UNAUTHORIZED_INSTRUMENT_SELECTION = false as const;
export const D8_0_UNAUTHORIZED_CONTROL_VALVE_SIZING = false as const;
export const D8_0_UNAUTHORIZED_ACTUATOR_SIZING = false as const;
export const D8_0_UNAUTHORIZED_LOOP_TUNING = false as const;
export const D8_0_UNAUTHORIZED_CONTROL_LOGIC_GENERATION = false as const;
export const D8_0_UNAUTHORIZED_SIL_CALCULATION = false as const;
export const D8_0_UNAUTHORIZED_SIL_VERIFICATION = false as const;
export const D8_0_UNAUTHORIZED_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const D8_0_UNAUTHORIZED_IAC_VALIDATION_PROMOTION = false as const;
export const D8_0_UNAUTHORIZED_CONFORMANCE_PROMOTION = false as const;
export const D8_0_UNAUTHORIZED_APPROVAL_PROMOTION = false as const;
export const D8_0_UNAUTHORIZED_CERTIFICATION_PROMOTION = false as const;
export const D8_0_UNAUTHORIZED_D6_AUTHORITY_TRANSFER = false as const;
export const D8_0_UNAUTHORIZED_D7_AUTHORITY_TRANSFER = false as const;
export const D8_0_UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER = false as const;
export const D8_0_UNAUTHORIZED_PARALLEL_CURRENTNESS_ENGINE = false as const;
export const D8_0_UNAUTHORIZED_PARALLEL_DIGITAL_THREAD = false as const;
export const D8_0_UNAUTHORIZED_SECOND_FINGERPRINT_ALGORITHM = false as const;
export const D8_0_UNAUTHORIZED_INFERRED_LINEAGE = false as const;
export const D8_0_UNAUTHORIZED_HISTORICAL_AUTO_REPOINT = false as const;
export const D8_0_UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const D8_0_UNAUTHORIZED_D9_RUNTIME_INTEGRATION = false as const;
export const D8_0_UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const D8_0_UNAUTHORIZED_EOS_COMPLETE_CLAIM = false as const;
export const D8_0_UNAUTHORIZED_GA_PROMOTION = false as const;
export const D8_0_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
