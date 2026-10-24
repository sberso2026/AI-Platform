/**
 * EOS-D6-0 Process architecture.
 * Contracts only. No Process object runtime, balance, hydraulic, relief, duty, validation, approval, or certification.
 */
import { EOS_JURISDICTION_PROFILE_IDS } from "./global-governance";
import { D4_D6_FUTURE_CONTRACT_SUBJECTS } from "./mechanical-architecture-d4-0";
import {
  D5_CURRENTNESS_STATES,
  D5_D6_FUTURE_CONTRACT_SUBJECTS,
  D5_DIGITAL_THREAD_MODULE,
  D5_FINGERPRINT_ALGORITHM,
  D5_MATURITY_STATES,
  PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION,
} from "./piping-architecture-d5-0";

export const D6_0_STATUS = "ARCHITECTURE_DEFINED" as const;
export const D6_0_MATURITY = "ARCHITECTURE_DEFINED" as const;
export const D6_0_PHASE = "EOS-D6-0-PROCESS-ARCHITECTURE-CANONICALIZATION" as const;
export const D6_0_PHASE_TYPE = "PROCESS_ARCHITECTURE_CANONICALIZATION" as const;
export const D6_ARCHITECTURE_PATH = "docs/architecture/engineering-os/EOS_D6_0_PROCESS_ARCHITECTURE.md" as const;
export const D6_0_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D6_0_PROCESS_ARCHITECTURE_CANONICALIZATION_CLOSEOUT.md" as const;
export const D6_ARCHITECTURE_DEFINED = true as const;
export const D6_ARCHITECTURE_READY = true as const;
export const D6_SCOPE_DEFINED = true as const;
export const D6_OWNERSHIP_DEFINED = true as const;
export const D6_PARENT_PIPING_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D5_R12_PIPING_BOUNDED_CLOSEOUT.md" as const;

export const D6_CANONICAL_SCOPE =
  "Bounded Process engineering context and governed Process evidence for plant and project process systems assigned to the Process discipline: process systems and units, streams, fluid and service context, phase and composition context, operating and design cases, Process-source conditions, design basis, requirements, assumptions, engineering decisions, utility context, mass and energy balance evidence, hydraulic and other explicitly supplied calculation evidence, equipment duty and process performance requirements, relief depressuring and process-safety scenario context, control intent and measurement requirements, process diagram and document evidence, discipline interfaces, review and validation requirements, currentness, lineage, and a future D9 source contract. No Process calculation runtime." as const;
export const D6_CANONICAL_NON_SCOPE =
  "No Piping line design, Mechanical equipment design, Electrical design, or Instrumentation and Control design. No Structural, Civil, or Geotechnical engineering. No functional-safety validation. No multidisciplinary reasoning. No mass balance, energy balance, hydraulic, pressure-drop, heat-duty, equipment-duty, relief, depressuring, or utility calculation. No automatic redesign, validation, conformance, approval, or certification." as const;
export const D6_SCOPE_CANONICALIZED = true as const;
export const D6_ABSORBS_D1_D5 = false as const;
export const D6_ABSORBS_D7_D8 = false as const;
export const D6_ABSORBS_D9 = false as const;

export const D6_EQUALS_D1_STRUCTURAL_AUTHORITY = false as const;
export const D6_EQUALS_D2_CIVIL_AUTHORITY = false as const;
export const D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY = false as const;
export const D6_EQUALS_D4_MECHANICAL_AUTHORITY = false as const;
export const D6_EQUALS_D5_PIPING_AUTHORITY = false as const;
export const D6_EQUALS_D7_ELECTRICAL_AUTHORITY = false as const;
export const D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY = false as const;
export const AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY = false as const;
export const AI_EQUALS_D6_PROCESS_ENGINEERING_REVIEWER_AUTHORITY = false as const;
export const ADMIN_EQUALS_D6_PROCESS_ENGINEERING_REVIEWER_AUTHORITY = false as const;

export const D6_CANONICAL_OBJECT_TAXONOMY_DEFINED = true as const;
export const D6_AUTHORITATIVE_OBJECT_TYPES_ALLOWLISTED = true as const;
export const D6_FREEFORM_AUTHORITATIVE_OBJECT_TYPES_ALLOWED = false as const;
export const D6_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED = false as const;
export const D6_PROCESS_OBJECT_TYPES = [
  "PROCESS_SYSTEM",
  "PROCESS_UNIT",
  "PROCESS_STREAM",
  "PROCESS_SERVICE",
  "PROCESS_FLUID",
  "PROCESS_COMPOSITION_CONTEXT",
  "PROCESS_OPERATING_CASE",
  "PROCESS_DESIGN_CASE",
  "PROCESS_CONDITION",
  "PROCESS_DESIGN_BASIS",
  "PROCESS_CALCULATION_EVIDENCE",
  "PROCESS_EQUIPMENT_DUTY",
  "PROCESS_UTILITY_REQUIREMENT",
  "PROCESS_RELIEF_SCENARIO",
  "PROCESS_SAFETY_CONTEXT",
  "PROCESS_CONTROL_INTENT",
  "PROCESS_MEASUREMENT_REQUIREMENT",
  "PROCESS_DOCUMENT_EVIDENCE",
  "PROCESS_INTERFACE",
  "PROCESS_GOVERNANCE_RECORD",
] as const;
export const D6_GOVERNED_RECORD_TYPES = [
  "PROCESS_REQUIREMENT",
  "PROCESS_ASSUMPTION",
  "PROCESS_ENGINEERING_DECISION",
  "PROCESS_EVIDENCE_REFERENCE",
] as const;
export const D6_PHASE_CLASSIFICATIONS = ["VAPOR", "LIQUID", "TWO_PHASE", "SOLID", "MIXED"] as const;
export const D6_CALCULATION_EVIDENCE_CLASSES = [
  "MASS_BALANCE",
  "ENERGY_BALANCE",
  "HYDRAULIC",
  "PRESSURE_DROP",
  "HEAT_DUTY",
  "EQUIPMENT_DUTY",
  "RELIEF_LOAD",
  "DEPRESSURING",
  "UTILITY_CONSUMPTION",
  "OTHER_PROCESS_CALCULATION",
] as const;
export const D6_RELIEF_SCENARIO_CLASSES = ["RELIEF", "DEPRESSURING", "SAFEGUARDING"] as const;
export const D6_DOCUMENT_KINDS = [
  "PFD",
  "HEAT_MATERIAL_BALANCE",
  "PROCESS_DATASHEET",
  "PROCESS_DESIGN_BASIS_DOCUMENT",
  "PID_PROCESS_CONTEXT",
  "CALCULATION_REPORT",
  "VENDOR_PROCESS_EVIDENCE",
] as const;
export const D6_DOCUMENT_FORMATS_ARE_NOT_OBJECT_TYPES = true as const;
export const D6_PROCESS_AREA_CONSOLIDATED_INTO_PROCESS_UNIT = true as const;
export const D6_PROCESS_PHASE_IS_CLASSIFICATION_NOT_OBJECT = true as const;
export const D6_BALANCE_EVIDENCE_CONSOLIDATED_UNDER_CALCULATION_EVIDENCE = true as const;
export const D6_DEPRESSURING_CONSOLIDATED_UNDER_RELIEF_SCENARIO = true as const;

export const PROCESS_STREAM_EQUALS_PIPING_LINE = false as const;
export const PROCESS_STREAM_IDENTITY_EQUALS_PIPING_LINE_IDENTITY = false as const;
export const D6_PROCESS_STREAM_CAN_REFERENCE_D5_LINE = true as const;
export const D6_PROCESS_STREAM_REFERENCE_TRANSFERS_D5_AUTHORITY = false as const;
export const D6_INFERS_D5_LINE_MEMBERSHIP_FROM_STREAM_IDENTITY = false as const;
export const PROCESS_SERVICE_EQUALS_PIPING_SERVICE_CONTEXT = false as const;
export const PROCESS_SERVICE_AUTO_CREATES_D5_PIPING_SERVICE = false as const;
export const D6_PRESERVES_EXISTING_PROCESS_CONDITION_BOUNDARY =
  PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION === false;
export const PROCESS_SOURCE_CONDITION_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION = false as const;
export const D6_CREATES_D5_ADOPTED_PIPING_DESIGN_CONDITION = false as const;

export const PROCESS_EQUIPMENT_DUTY_EQUALS_MECHANICAL_EQUIPMENT_DESIGN = false as const;
export const PROCESS_EQUIPMENT_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION = false as const;
export const D6_TRANSFERS_MECHANICAL_AUTHORITY = false as const;
export const D6_TRANSFERS_D4_AUTHORITY = D6_TRANSFERS_MECHANICAL_AUTHORITY;

export const PROCESS_CONTROL_INTENT_EQUALS_IAC_DESIGN = false as const;
export const PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_INSTRUMENT_DESIGN = false as const;
export const PROCESS_SETPOINT_CONTEXT_EQUALS_VALIDATED_CONTROL_CONFIGURATION = false as const;
export const D6_TRANSFERS_IAC_AUTHORITY = false as const;
export const PROCESS_ELECTRICAL_REQUIREMENT_CONTEXT_EQUALS_ELECTRICAL_DESIGN = false as const;
export const D6_TRANSFERS_ELECTRICAL_AUTHORITY = false as const;

export const PROCESS_CALCULATION_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN = false as const;
export const PROCESS_CALCULATION_EVIDENCE_EQUALS_CODE_CONFORMANCE = false as const;
export const RELIEF_SCENARIO_EQUALS_RELIEF_DEVICE_DESIGN = false as const;
export const RELIEF_REQUIREMENT_EQUALS_VALIDATED_RELIEF_DEVICE_SELECTION = false as const;
export const PROCESS_HAZARD_FINDING_EQUALS_APPROVED_SAFEGUARD = false as const;
export const PROCESS_SAFETY_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const PROCESS_DOCUMENT_EQUALS_PROCESS_IDENTITY = false as const;
export const PROCESS_DIAGRAM_EQUALS_VALIDATED_PROCESS_DESIGN = false as const;

export const D6_OBJECT_IDENTITY_FIELDS = [
  "STABLE_OBJECT_IDENTITY",
  "TENANT_WORKSPACE_PROJECT_SCOPE",
  "CANONICAL_OBJECT_TYPE",
  "PROCESS_TAG_OR_IDENTIFIER",
  "SERVICE_OR_FUNCTION",
  "LIFECYCLE_OR_MATURITY",
  "EXACT_REVISION",
  "EXPLICIT_RELATIONSHIPS",
  "PROVENANCE",
  "CURRENTNESS",
  "CANONICAL_FINGERPRINT",
  "IMMUTABLE_HISTORY",
] as const;
export const D6_REUSES_CANONICAL_IDENTITY_GOVERNANCE = true as const;
export const PARALLEL_D6_IDENTITY_SYSTEM_CREATED = false as const;
export const EXACT_D6_REVISION_REFERENCE_REQUIRED = true as const;
export const FLOATING_D6_AUTHORITATIVE_REFERENCE_ALLOWED = false as const;
export const D6_OBJECT_IDENTITY_EQUALS_ENGINEERING_CONTENT = false as const;

export const D6_CURRENTNESS_STATES = D5_CURRENTNESS_STATES;
export const D6_REUSES_CANONICAL_CURRENTNESS = true as const;
export const D6_CURRENTNESS_ARCHITECTURE_DEFINED = true as const;
export const PARALLEL_D6_CURRENTNESS_ENGINE_CREATED = false as const;
export const D6_FINGERPRINT_ALGORITHM = D5_FINGERPRINT_ALGORITHM;
export const D6_REUSES_CANONICAL_FINGERPRINT = true as const;
export const SECOND_D6_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D6_DIGITAL_THREAD_MODULE = D5_DIGITAL_THREAD_MODULE;
export const D6_REUSES_CANONICAL_DIGITAL_THREAD = true as const;
export const D6_DIGITAL_THREAD_ARCHITECTURE_DEFINED = true as const;
export const PARALLEL_D6_DIGITAL_THREAD_CREATED = false as const;
export const D6_EXPLICIT_LINEAGE_REQUIRED = true as const;
export const D6_INFERRED_LINEAGE_ALLOWED = false as const;
export const D6_HISTORICAL_REFERENCE_AUTO_REPOINT_ALLOWED = false as const;
export const D6_INFERRED_LINEAGE_SOURCES_PROHIBITED = [
  "NAME_OR_TAG_SIMILARITY",
  "DOCUMENT_ADJACENCY",
  "SEMANTIC_SIMILARITY",
  "AI_REASONING",
] as const;
export const D6_MATURITY_STATES = D5_MATURITY_STATES;
export const D6_CREATES_PARALLEL_MATURITY_ENUM = false as const;

export const D6_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE = true as const;
export const D6_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE = true as const;
export const D6_REUSES_CANONICAL_DECISION_GOVERNANCE = true as const;
export const D6_REUSES_CANONICAL_CHANGE_GOVERNANCE = true as const;
export const PARALLEL_D6_REQUIREMENT_ENGINE_CREATED = false as const;
export const PARALLEL_D6_ASSUMPTION_ENGINE_CREATED = false as const;
export const PARALLEL_D6_DECISION_ENGINE_CREATED = false as const;
export const PARALLEL_D6_CHANGE_ENGINE_CREATED = false as const;
export const SOURCE_REQUIREMENT_EQUALS_ADOPTED_PROCESS_REQUIREMENT = false as const;
export const ASSUMPTION_EQUALS_VALIDATED_FACT = false as const;
export const AI_RECOMMENDATION_EQUALS_PROCESS_ENGINEERING_DECISION = false as const;

export const D6_REVIEW_GOVERNANCE_ARCHITECTURE_DEFINED = true as const;
export const D6_VALIDATION_GOVERNANCE_ARCHITECTURE_DEFINED = true as const;
export const REVIEWED_PROCESS_RECORD_EQUALS_VALIDATED_PROCESS_RECORD = false as const;
export const VALIDATED_PROCESS_RECORD_EQUALS_CONFORMANT = false as const;
export const VALIDATED_PROCESS_RECORD_EQUALS_APPROVED = false as const;
export const VALIDATED_PROCESS_RECORD_EQUALS_CERTIFIED = false as const;
export const D6_REVIEW_VALIDATION_RUNTIME_COUNT = 0 as const;

export const D6_D4_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D6_D4_REUSES_D4_FUTURE_PROCESS_CONTRACT = true as const;
export const D6_D4_INTERFACE_SUBJECTS = [
  ...D4_D6_FUTURE_CONTRACT_SUBJECTS,
  "UTILITY_REQUIREMENT",
  "PROCESS_SIDE_PACKAGE_REQUIREMENT",
] as const;
export const D6_D4_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D6_VALIDATES_D4_MECHANICAL_ENGINEERING = false as const;

export const D6_D5_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D6_D5_INTERFACE_SUBJECTS = D5_D6_FUTURE_CONTRACT_SUBJECTS;
export const D6_D5_CONTRACT_COMPATIBLE_WITH_EXISTING_D5_R8_CONTRACT = true as const;
export const D6_D5_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D6_VALIDATES_D5_PIPING_ENGINEERING = false as const;
export const D6_TRANSFERS_D5_AUTHORITY = false as const;

export const D6_D7_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D6_D7_FUTURE_CONTRACT_SUBJECTS = [
  "MOTOR_OR_LOAD_PROCESS_REQUIREMENT",
  "POWER_REQUIREMENT_CONTEXT",
  "UTILITY_POWER_PROCESS_CONTEXT",
] as const;
export const D6_D7_RUNTIME_INTEGRATION_COUNT = 0 as const;

export const D6_D8_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D6_D8_FUTURE_CONTRACT_SUBJECTS = [
  "PROCESS_CONTROL_INTENT",
  "PROCESS_MEASUREMENT_REQUIREMENT",
  "ALARM_OR_TRIP_PROCESS_INTENT",
  "SETPOINT_SOURCE_CONTEXT",
  "CONTROL_VALVE_PROCESS_REQUIREMENT",
  "PROCESS_SAFEGUARDING_REQUIREMENT",
] as const;
export const D6_D8_RUNTIME_INTEGRATION_COUNT = 0 as const;

export const D6_D1_D3_DIRECT_INTERFACE_DEFINED = false as const;
export const D6_D1_D3_DIRECT_AUTHORITY_TRANSFER_ALLOWED = false as const;
export const D6_VALIDATES_D1_D3_ENGINEERING = false as const;

export const D6_D9_SOURCE_CONTRACT_ARCHITECTURE_DEFINED = true as const;
export const D6_D9_SOURCE_CONTRACT_FIELDS = [
  "IDENTITY",
  "SYSTEM_STREAM_OR_SERVICE",
  "OPERATING_OR_DESIGN_CASE",
  "PROCESS_CONDITIONS",
  "FLUID_OR_COMPOSITION_CONTEXT",
  "REQUIREMENTS",
  "ASSUMPTIONS",
  "ENGINEERING_DECISIONS",
  "EVIDENCE",
  "EQUIPMENT_DUTIES",
  "PROCESS_SAFETY_OR_RELIEF_CONTEXT",
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
export const D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D6_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D6_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT = false as const;
export const D6_D9_SOURCE_CONTRACT_TRANSFERS_ENGINEERING_AUTHORITY = false as const;

export const D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;

export const D6_RUNTIME_COUNT = 0 as const;
export const D6_0_RUNTIME_STARTED = false as const;
export const D6_0_ADDS_SUBSTANTIVE_PROCESS_RUNTIME = false as const;
export const D6_PROCESS_IDENTITY_RUNTIME_COUNT = 0 as const;
export const D6_SYSTEM_STREAM_SERVICE_RUNTIME_COUNT = 0 as const;
export const D6_DESIGN_BASIS_CONDITION_RUNTIME_COUNT = 0 as const;
export const D6_PROCESS_EVIDENCE_RUNTIME_COUNT = 0 as const;
export const D6_EQUIPMENT_DUTY_RUNTIME_COUNT = 0 as const;
export const D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT = 0 as const;
export const D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 0 as const;
export const D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 0 as const;
export const D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D6_PROCESS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D6_RELIEF_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D6_UTILITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D6_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D6_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D6_HIDDEN_CALCULATION_ALLOWED = false as const;

export const TENANT_WORKSPACE_PROJECT_D6_SCOPE_ARCHITECTURE_DEFINED = true as const;
export const CROSS_TENANT_D6_ACCESS_ALLOWED = false as const;
export const D6_JURISDICTION_PROFILE_IDS = EOS_JURISDICTION_PROFILE_IDS;
export const D6_ADDS_JURISDICTION_PROFILE_ID = false as const;
export const D6_CLAIMS_LEGAL_OR_REGULATORY_COMPLIANCE = false as const;
export const D6_ENGINEERING_VALIDATED = false as const;
export const D6_CONFORMANT = false as const;
export const D6_APPROVED = false as const;
export const D6_CERTIFIED = false as const;
export const D6_GA_READY = false as const;

export const D6_PRESERVES_D1_STRUCTURAL_PACK_INCOMPLETE = true as const;
export const D6_PRESERVES_D1N_CLOSED = true as const;
export const D6_PRESERVES_D2_TRACK_COMPLETE = true as const;
export const D6_PRESERVES_D3_TRACK_COMPLETE = true as const;
export const D6_PRESERVES_D4_TRACK_COMPLETE = true as const;
export const D6_PRESERVES_D5_TRACK_COMPLETE = true as const;
export const D6_REOPENS_D1 = false as const;
export const D6_REOPENS_D2 = false as const;
export const D6_REOPENS_D3 = false as const;
export const D6_REOPENS_D4 = false as const;
export const D6_REOPENS_D5 = false as const;
export const D5_REOPENED = false as const;
export const D6_0_DATABASE_SCHEMA_CHANGED = false as const;
export const D6_0_NEW_DEPENDENCY_ADDED = false as const;

export const D6_IMPLEMENTATION_PHASES = [
  "EOS-D6-R1-PROCESS-IDENTITY-AND-OBJECT-FOUNDATION",
  "EOS-D6-R2-PROCESS-SYSTEM-STREAM-AND-SERVICE-CONTEXT",
  "EOS-D6-R3-OPERATING-AND-DESIGN-BASIS-AND-CONDITIONS",
  "EOS-D6-R4-PROCESS-EVIDENCE-AND-BALANCES",
  "EOS-D6-R5-EQUIPMENT-DUTY-AND-UTILITY-CONTEXT",
  "EOS-D6-R6-PROCESS-SAFETY-AND-RELIEF-CONTEXT",
  "EOS-D6-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE",
  "EOS-D6-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS",
  "EOS-D6-R9-REVIEW-AND-VALIDATION-GOVERNANCE",
  "EOS-D6-R10-CURRENTNESS-AND-DIGITAL-THREAD",
  "EOS-D6-R11-D9-SOURCE-CONTRACT",
  "EOS-D6-R12-PROCESS-BOUNDED-CLOSEOUT",
] as const;
export const D6_IMPLEMENTATION_PHASE_TYPES = [
  "PROCESS_IDENTITY_AND_OBJECT_FOUNDATION",
  "PROCESS_SYSTEM_STREAM_AND_SERVICE_CONTEXT",
  "OPERATING_AND_DESIGN_BASIS_AND_CONDITIONS",
  "PROCESS_EVIDENCE_AND_BALANCES",
  "EQUIPMENT_DUTY_AND_UTILITY_CONTEXT",
  "PROCESS_SAFETY_AND_RELIEF_CONTEXT",
  "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE",
  "DISCIPLINE_INTERFACES_AND_HANDOFFS",
  "REVIEW_AND_VALIDATION_GOVERNANCE",
  "CURRENTNESS_AND_DIGITAL_THREAD",
  "D9_SOURCE_CONTRACT",
  "PROCESS_BOUNDED_CLOSEOUT",
] as const;
export const D6_PHASE_PRIMARY_SUBJECTS = [
  "IDENTITY_AND_OBJECT_FOUNDATION",
  "SYSTEM_STREAM_AND_SERVICE_CONTEXT",
  "OPERATING_AND_DESIGN_BASIS_AND_CONDITIONS",
  "PROCESS_EVIDENCE_AND_BALANCES",
  "EQUIPMENT_DUTY_AND_UTILITY_CONTEXT",
  "PROCESS_SAFETY_AND_RELIEF_CONTEXT",
  "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE",
  "DISCIPLINE_INTERFACES_AND_HANDOFFS",
  "REVIEW_AND_VALIDATION_GOVERNANCE",
  "CURRENTNESS_AND_DIGITAL_THREAD",
  "D9_SOURCE_CONTRACT",
  "BOUNDED_CLOSEOUT",
] as const;
export const D6_CANONICAL_PHASE_DECOMPOSITION_DEFINED = true as const;
export const D6_CANONICAL_PHASE_COUNT = D6_IMPLEMENTATION_PHASES.length;
export const D6_CANONICAL_PHASES = D6_IMPLEMENTATION_PHASES;
export const D6_CANONICAL_PHASE_SEQUENCE = D6_IMPLEMENTATION_PHASES.join(", ");
export const D6_R1_CANONICAL_PHASE = D6_IMPLEMENTATION_PHASES[0];
export const D6_R1_PHASE_TYPE = D6_IMPLEMENTATION_PHASE_TYPES[0];
export const D6_R1_CANONICAL_SCOPE =
  "Implement exact governed Process identities and the canonical Process object taxonomy with tenant, workspace, and project scope, lifecycle and maturity, provenance, canonical currentness, and the canonical fingerprint. Do not implement system, stream, or service technical context, operating or design conditions, calculation evidence, equipment duty, process-safety context, requirements, interfaces, review, the D9 source contract, or any Process calculation." as const;
export const D6_R1_STARTED = false as const;
export const D6_0_READY_FOR_NEXT_PHASE = true as const;
export const D6_0_NEXT_PHASE = D6_R1_CANONICAL_PHASE;
export const D6_0_NEXT_PHASE_TYPE = D6_R1_PHASE_TYPE;
export const D6_0_CANONICAL_NEXT_PHASE = D6_R1_CANONICAL_PHASE;
export const D6_0_CANONICAL_NEXT_PHASE_SCOPE = D6_R1_CANONICAL_SCOPE;
export const D6_0_BLOCKER = "NONE" as const;
export const D6_0_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const UNAUTHORIZED_D5_REOPEN = false as const;
export const UNAUTHORIZED_D6_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D7_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER = false as const;
export const D6_0_UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const D6_0_UNAUTHORIZED_D2_REOPEN = false as const;
export const D6_0_UNAUTHORIZED_D3_REOPEN = false as const;
export const D6_0_UNAUTHORIZED_D4_REOPEN = false as const;
export const D6_0_UNAUTHORIZED_D5_REOPEN = false as const;
export const D6_0_UNAUTHORIZED_D6_RUNTIME_PROMOTION = false as const;
export const D6_0_UNAUTHORIZED_D7_RUNTIME_PROMOTION = false as const;
export const D6_0_UNAUTHORIZED_D8_RUNTIME_PROMOTION = false as const;
export const D6_0_UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const D6_0_UNAUTHORIZED_PROCESS_CALCULATION_PROMOTION = false as const;
export const D6_0_UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION = false as const;
export const D6_0_UNAUTHORIZED_PROCESS_CONFORMANCE_PROMOTION = false as const;
export const D6_0_UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER = false as const;
export const D6_0_UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const D6_0_UNAUTHORIZED_GA_PROMOTION = false as const;
export const D6_0_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
