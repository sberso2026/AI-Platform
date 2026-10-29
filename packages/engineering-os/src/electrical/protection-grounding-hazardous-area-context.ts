/**
 * EOS-D7-R6 protection, grounding/earthing, and hazardous-area context.
 * One bounded runtime on exact R1-R5 revisions. Context only. No calculation.
 */
import {
  D7_BONDING_CONSOLIDATED_UNDER_GROUNDING_CONTEXT,
  D7_CURRENTNESS_STATES,
  D7_ELECTRICAL_OBJECT_TYPES,
  D7_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D7_HAZARDOUS_AREA_CLASSIFICATION_PERFORMED,
  D7_IMPLEMENTATION_PHASE_TYPES,
  D7_IMPLEMENTATION_PHASES,
  D7_JURISDICTION_PROFILE_IDS,
  D7_JURISDICTION_STANDARDS_ARCHITECTURE_DEFINED,
  D7_MATURITY_STATES,
  D7_SINGLE_JURISDICTION_HARDCODED_AS_GLOBAL_TRUTH,
  D7_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  ELECTRICAL_PROTECTION_CONTEXT_EQUALS_VALIDATED_PROTECTION_SETTING,
  GROUNDING_CONTEXT_EQUALS_VALIDATED_GROUNDING_DESIGN,
  HAZARDOUS_AREA_CONTEXT_EQUALS_CODE_CONFORMANCE,
  HAZARDOUS_AREA_CONTEXT_EQUALS_VALIDATED_ELECTRICAL_SELECTION,
  PROTECTION_EVIDENCE_EQUALS_VALIDATED_PROTECTION_SETTING,
  PROTECTION_SETTING_PRESENT_EQUALS_COORDINATION_VALIDATED,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  ARC_FLASH_EVIDENCE_EQUALS_VALIDATED_ARC_FLASH_ASSESSMENT,
  D7_APPROVAL_RUNTIME_COUNT,
  D7_ARC_FLASH_CALCULATION_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_REDESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_BATTERY_UPS_CALCULATION_RUNTIME_COUNT,
  D7_CABLE_SIZING_CALCULATION_RUNTIME_COUNT,
  D7_CERTIFICATION_RUNTIME_COUNT,
  D7_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_READY,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D7_EQUALS_D2_CIVIL_AUTHORITY,
  D7_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D7_EQUALS_D4_MECHANICAL_AUTHORITY,
  D7_EQUALS_D5_PIPING_AUTHORITY,
  D7_EQUALS_D6_PROCESS_AUTHORITY,
  D7_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_GROUNDING_CALCULATION_RUNTIME_COUNT,
  D7_HARMONIC_CALCULATION_RUNTIME_COUNT,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_FLOW_CALCULATION_RUNTIME_COUNT,
  D7_MOTOR_STARTING_CALCULATION_RUNTIME_COUNT,
  D7_POWER_QUALITY_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_R1_IDENTITY_REUSED,
  D7_R2_SYSTEM_SOURCE_DISTRIBUTION_CONTEXT_REUSED,
  D7_R3_LOAD_CONSUMER_EQUIPMENT_CONTEXT_REUSED,
  D7_R4_FEEDER_CABLE_RATING_CONTEXT_REUSED,
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  D7_REUSES_CANONICAL_FINGERPRINT,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_RUNTIME_COUNT as R5_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  GROUNDING_EVIDENCE_EQUALS_CODE_CONFORMANCE,
  GROUNDING_EVIDENCE_EQUALS_VALIDATED_GROUNDING_DESIGN,
  PROTECTION_COORDINATION_EVIDENCE_EQUALS_VALIDATED_PROTECTION_SETTING,
  type D7R5EvidenceRecord,
  type D7R5Store,
  ADMIN_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  CURRENT_D7_RECORD_EQUALS_VALIDATED,
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
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  UNAUTHORIZED_ARC_FLASH_CALCULATION,
  UNAUTHORIZED_GROUNDING_CALCULATION,
  UNAUTHORIZED_UPSTREAM_D7_MUTATION,
} from "./calculation-evidence";
import {
  D7_CONTEXT_AUTHORITY,
  D7_DISCIPLINE,
  type D7R1Actor,
  type D7R1ObjectRecord,
  type D7R1Store,
} from "./identity-foundation";

export const D7_R6_STATUS = "PROTECTION_GROUNDING_AND_HAZARDOUS_AREA_CONTEXT_IMPLEMENTED" as const;
export const D7_R6_MATURITY = D7_R6_STATUS;
export const D7_R6_MATURITY_STATE = D7_R6_STATUS;
export const D7_R6_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D7_R6_PROTECTION_GROUNDING_AND_HAZARDOUS_AREA_CONTEXT_CLOSEOUT.md" as const;
export const D7_R5_ELECTRICAL_CALCULATION_EVIDENCE_REUSED = D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_READY;
export const EXACT_D7_R1_R5_REFERENCE_REQUIRED = true as const;
export const FLOATING_D7_R6_SOURCE_REFERENCE_ALLOWED = false as const;
export const D7_R6_SOURCE_AUTO_REPOINTED = false as const;
export const D7_RUNTIME_STARTED = true as const;
export const D7_RUNTIME_COUNT = 6 as const;
export const D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_IMPLEMENTED = true as const;
export const D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT = 1 as const;
export const D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_READY = true as const;
export const D7_CANONICAL_OBJECT_TAXONOMY_REUSED = true as const;
export const D7_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED = true as const;
export const D7_PROTECTIVE_DEVICE_CONTEXT_IMPLEMENTED = true as const;
export const PROTECTIVE_DEVICE_CONTEXT_EQUALS_VALIDATED_PROTECTION_DESIGN = false as const;
export const PROTECTIVE_DEVICE_CONTEXT_EQUALS_VALIDATED_DEVICE_SELECTION = false as const;
export const D7_EXPLICIT_PROTECTION_RELATIONSHIP_REQUIRED = true as const;
export const D7_INFERRED_PROTECTION_RELATIONSHIP_ALLOWED = false as const;
export const EXACT_D7_PROTECTION_RELATIONSHIP_ENDPOINT_REVISION_REQUIRED = true as const;
export const D7_PROTECTION_RELATIONSHIP_AUTO_REPOINTED = false as const;
export const D7_SUPPLIED_PROTECTION_SETTING_SUPPORTED = true as const;
export const D7_ADOPTED_PROTECTION_SETTING_SUPPORTED = true as const;
export const SUPPLIED_PROTECTION_SETTING_EQUALS_ADOPTED_PROTECTION_SETTING = false as const;
export const SUPPLIED_PROTECTION_SETTING_AUTO_ADOPTED = false as const;
export const ADOPTED_PROTECTION_SETTING_EQUALS_VALIDATED_PROTECTION_SETTING = false as const;
export const D7_PROTECTION_SETTING_CONTEXT_IMPLEMENTED = true as const;
export const PROTECTION_SETTING_CONTEXT_EQUALS_PROTECTION_CALCULATION = false as const;
export const PROTECTION_SETTING_CONTEXT_EQUALS_CODE_CONFORMANCE = false as const;
export const EXACT_D7_R5_PROTECTION_EVIDENCE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D7_R6_AUTO_ADOPTS_PROTECTION_EVIDENCE_RESULT = false as const;
export const D7_R6_AUTO_RECALCULATES_PROTECTION_EVIDENCE = false as const;
export const D7_R6_CALCULATES_PROTECTION_SETTING = false as const;
export const D7_R6_PERFORMS_PROTECTION_COORDINATION = false as const;
export const D7_R6_SELECTS_PROTECTION_DEVICE = false as const;
export const D7_R6_CALCULATES_BREAKER_TRIP_SETTING = false as const;
export const D7_R6_CALCULATES_RELAY_SETTING = false as const;
export const EXACT_D7_R5_ARC_FLASH_EVIDENCE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D7_R6_AUTO_GENERATES_ARC_FLASH_LABEL = false as const;
export const D7_R6_AUTO_DETERMINES_PPE_CATEGORY = false as const;
export const D7_R6_PERFORMS_ARC_FLASH_CALCULATION = false as const;
export const D7_GROUNDING_EARTHING_CONTEXT_IMPLEMENTED = true as const;
export const GROUNDING_CONTEXT_EQUALS_CODE_CONFORMANCE = false as const;
export const D7_EXPLICIT_GROUNDING_RELATIONSHIP_REQUIRED = true as const;
export const D7_INFERRED_GROUNDING_RELATIONSHIP_ALLOWED = false as const;
export const EXACT_D7_GROUNDING_RELATIONSHIP_REVISION_REQUIRED = true as const;
export const D7_GROUNDING_RELATIONSHIP_AUTO_REPOINTED = false as const;
export const EXACT_D7_R5_GROUNDING_EVIDENCE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D7_R6_AUTO_ADOPTS_GROUNDING_EVIDENCE_RESULT = false as const;
export const D7_R6_AUTO_RECALCULATES_GROUNDING_EVIDENCE = false as const;
export const D7_R6_CALCULATES_GROUND_RESISTANCE = false as const;
export const D7_R6_CALCULATES_STEP_TOUCH_VOLTAGE = false as const;
export const D7_R6_SIZES_GROUNDING_CONDUCTOR = false as const;
export const D7_R6_DESIGNS_GROUND_GRID = false as const;
export const D7_HAZARDOUS_AREA_CONTEXT_IMPLEMENTED = true as const;
export const HAZARDOUS_AREA_CONTEXT_EQUALS_CLASSIFICATION_PERFORMED_BY_EOS = D7_HAZARDOUS_AREA_CLASSIFICATION_PERFORMED;
export const HAZARDOUS_AREA_CONTEXT_EQUALS_VALIDATED_HAZARDOUS_AREA_CLASSIFICATION = false as const;
export const D7_HAZARDOUS_AREA_CLASSIFICATION_RUNTIME_COUNT = 0 as const;
export const D7_R6_PERFORMS_HAZARDOUS_AREA_CLASSIFICATION = false as const;
export const D7_HAZARDOUS_AREA_EQUIPMENT_SUITABILITY_CONTEXT_IMPLEMENTED = true as const;
export const HAZARDOUS_AREA_EQUIPMENT_SUITABILITY_CONTEXT_EQUALS_VALIDATED_SELECTION = false as const;
export const HAZARDOUS_AREA_EQUIPMENT_SUITABILITY_EVIDENCE_EQUALS_CODE_CONFORMANCE = false as const;
export const D7_R6_AUTO_MATCHES_EQUIPMENT_TO_HAZARDOUS_AREA = false as const;
export const D7_R6_AUTO_SELECTS_HAZARDOUS_AREA_EQUIPMENT = false as const;
export const D7_R6_AUTO_APPROVES_EQUIPMENT_SUITABILITY = false as const;
export const SUPPLIED_EQUIPMENT_CERTIFICATION_EVIDENCE_EQUALS_EOS_CERTIFICATION = false as const;
export const SUPPLIED_EQUIPMENT_MARKING_EQUALS_VALIDATED_PROJECT_SELECTION = false as const;
export const D7_REUSES_JURISDICTION_STANDARDS_ARCHITECTURE = D7_JURISDICTION_STANDARDS_ARCHITECTURE_DEFINED;
export const STANDARD_REFERENCE_PRESENT_EQUALS_CONFORMANCE_DETERMINED = false as const;
export const EXACT_D7_R1_IDENTITY_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D7_R2_CONTEXT_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D7_R3_LOAD_CONSUMER_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D7_R4_FEEDER_CABLE_RATING_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D7_R6_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D7_R6_AUTO_MUTATES_R2_SYSTEM_SOURCE_DISTRIBUTION = false as const;
export const D7_R6_AUTO_MUTATES_R3_LOAD_CONSUMER_EQUIPMENT = false as const;
export const D7_R6_AUTO_MUTATES_R4_FEEDER_CABLE_RATING = false as const;
export const D7_R6_AUTO_MUTATES_R5_CALCULATION_EVIDENCE = false as const;
export const D7_R6_FEEDER_CONTEXT_AUTO_CREATES_PROTECTION_SETTING = false as const;
export const D7_R6_CABLE_RATING_AUTO_CREATES_PROTECTION_SETTING = false as const;
export const D7_R6_LOAD_CONTEXT_AUTO_CREATES_PROTECTION_SETTING = false as const;
export const D7_R6_AUTO_ADOPTS_PROTECTION_COORDINATION_RESULT = false as const;
export const D7_R6_AUTO_ADOPTS_GROUNDING_RESULT = false as const;
export const D7_R6_AUTO_ADOPTS_ARC_FLASH_RESULT = false as const;
export const D7_R6_AUTO_ADOPTS_HAZARDOUS_AREA_SUITABILITY = false as const;
export const D7_R6_UNITS_REQUIRED = true as const;
export const D7_R6_UNITS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D7_R6_UNITS = false as const;
export const D7_R6_SOURCE_BASIS_REQUIRED = true as const;
export const D7_R6_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D7_R6_CONTEXT_AUTO_ACCEPTED = false as const;
export const D7_R6_APPLICABILITY_EXPLICIT = true as const;
export const D7_R6_LIMITATIONS_EXPLICIT = true as const;
export const D7_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D7_R6_PROVENANCE_REQUIRED = true as const;
export const D7_R6_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D7_R6_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D7_R6_ACCESS_ALLOWED = false as const;
export const D7_R6_HISTORY_PRESERVED = true as const;
export const D7_R6_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D7_R6_MUTATION_ALLOWED = false as const;
export const D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION = false as const;
export const D7_PROTECTION_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_PROTECTION_SETTING = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_GROUNDING_CONTEXT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_HAZARDOUS_AREA_CLASSIFICATION = false as const;
export const AI_CAN_APPROVE_D7_HAZARDOUS_AREA_EQUIPMENT_SUITABILITY = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D7_R6_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D7_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D7_R6_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D7_R6_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D7_R7_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_PROTECTION_CALCULATION = false as const;
export const UNAUTHORIZED_PROTECTION_COORDINATION = false as const;
export const UNAUTHORIZED_RELAY_BREAKER_SETTING_CALCULATION = false as const;
export const UNAUTHORIZED_HAZARDOUS_AREA_CLASSIFICATION = false as const;
export const UNAUTHORIZED_PROTECTION_EVIDENCE_AUTO_ADOPTION = false as const;
export const UNAUTHORIZED_GROUNDING_EVIDENCE_AUTO_ADOPTION = false as const;
export const UNAUTHORIZED_HAZARDOUS_AREA_EQUIPMENT_AUTO_SELECTION = false as const;
export const UNAUTHORIZED_HAZARDOUS_AREA_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_ELECTRICAL_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_CERTIFICATION_PROMOTION = false as const;
export const D7_R6_DEVICE_CLASSES = ["BREAKER", "FUSE", "RELAY", "PROTECTION_FUNCTION", "OTHER_CANONICAL_PROTECTION_DEVICE"] as const;
export const D7_R6_PROTECTION_RELATIONSHIP_KINDS = ["DEVICE_PROTECTS_SUBJECT"] as const;
export const D7_R6_SETTING_ROLES = ["SUPPLIED_PROTECTION_SETTING", "ADOPTED_PROTECTION_SETTING"] as const;
export const D7_R6_SETTING_CATEGORIES = ["CURRENT", "TIME", "VOLTAGE"] as const;
export const D7_R6_GROUNDING_ROLES = ["GROUNDING_SYSTEM", "EARTHING_SYSTEM", "BONDING", "GROUNDING_REQUIREMENT"] as const;
export const D7_R6_GROUNDING_RELATIONSHIP_KINDS = ["EQUIPMENT_GROUNDING", "BONDING_CONNECTION"] as const;
export const D7_R6_ZONE_OR_DIVISION = ["ZONE_0", "ZONE_1", "ZONE_2", "ZONE_20", "ZONE_21", "ZONE_22", "DIVISION_1", "DIVISION_2"] as const;
export const D7_R6_ATMOSPHERES = ["GAS", "DUST", "GAS_AND_DUST"] as const;
export const D7_R6_GROUPS = ["IIA", "IIB", "IIC", "IIIA", "IIIB", "IIIC"] as const;
export const D7_R6_TEMPERATURE_CLASSES = ["T1", "T2", "T3", "T4", "T5", "T6"] as const;
export const D7_R6_SUITABILITY_ROLES = ["SUPPLIED_EQUIPMENT_SUITABILITY", "ADOPTED_EQUIPMENT_SUITABILITY"] as const;
export const D7_R6_EQUIPMENT_OBJECT_TYPES = ["ELECTRICAL_MOTOR_DRIVE", "ELECTRICAL_DISTRIBUTION_EQUIPMENT", "ELECTRICAL_LOAD", "ELECTRICAL_CONSUMER", "ELECTRICAL_POWER_SOURCE"] as const;
export const D7_R7_CANONICAL_PHASE = D7_IMPLEMENTATION_PHASES[6];
export const D7_R7_PHASE_TYPE = D7_IMPLEMENTATION_PHASE_TYPES[6];
export const D7_R7_CANONICAL_SCOPE =
  "Implement canonical Electrical requirement, assumption, engineering-decision, change, supersession and reassessment governance across exact D7 R1-R6 revisions. Reuse canonical EOS governance. Preserve source requirement != adopted Electrical requirement, assumption != validated fact, AI recommendation != Electrical engineering decision, and change/reassessment must not automatically recalculate loads, load flow, cable sizing, protection settings, grounding, hazardous-area suitability, redesign, revalidate, approve or determine conformance." as const;
export const D7_R7_STARTED = false as const;
export const D7_R6_READY_FOR_NEXT_PHASE = true as const;
export const D7_R6_NEXT_PHASE = D7_R7_CANONICAL_PHASE;
export const D7_R6_NEXT_PHASE_TYPE = D7_R7_PHASE_TYPE;
export const D7_R6_CANONICAL_NEXT_PHASE = D7_R7_CANONICAL_PHASE;
export const D7_R6_CANONICAL_NEXT_PHASE_SCOPE = D7_R7_CANONICAL_SCOPE;
export const D7_R6_BLOCKER = "NONE" as const;
export const D7_R6_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D7_R1_IDENTITY_REUSED,
  D7_R2_SYSTEM_SOURCE_DISTRIBUTION_CONTEXT_REUSED,
  D7_R3_LOAD_CONSUMER_EQUIPMENT_CONTEXT_REUSED,
  D7_R4_FEEDER_CABLE_RATING_CONTEXT_REUSED,
  D7_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D7_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  D7_BONDING_CONSOLIDATED_UNDER_GROUNDING_CONTEXT,
  ELECTRICAL_PROTECTION_CONTEXT_EQUALS_VALIDATED_PROTECTION_SETTING,
  PROTECTION_EVIDENCE_EQUALS_VALIDATED_PROTECTION_SETTING,
  PROTECTION_SETTING_PRESENT_EQUALS_COORDINATION_VALIDATED,
  PROTECTION_COORDINATION_EVIDENCE_EQUALS_VALIDATED_PROTECTION_SETTING,
  ARC_FLASH_EVIDENCE_EQUALS_VALIDATED_ARC_FLASH_ASSESSMENT,
  GROUNDING_CONTEXT_EQUALS_VALIDATED_GROUNDING_DESIGN,
  GROUNDING_EVIDENCE_EQUALS_VALIDATED_GROUNDING_DESIGN,
  GROUNDING_EVIDENCE_EQUALS_CODE_CONFORMANCE,
  HAZARDOUS_AREA_CONTEXT_EQUALS_VALIDATED_ELECTRICAL_SELECTION,
  HAZARDOUS_AREA_CONTEXT_EQUALS_CODE_CONFORMANCE,
  D7_SINGLE_JURISDICTION_HARDCODED_AS_GLOBAL_TRUTH,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_FLOW_CALCULATION_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_MOTOR_STARTING_CALCULATION_RUNTIME_COUNT,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D7_CABLE_SIZING_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_ARC_FLASH_CALCULATION_RUNTIME_COUNT,
  D7_GROUNDING_CALCULATION_RUNTIME_COUNT,
  D7_POWER_QUALITY_CALCULATION_RUNTIME_COUNT,
  D7_HARMONIC_CALCULATION_RUNTIME_COUNT,
  D7_BATTERY_UPS_CALCULATION_RUNTIME_COUNT,
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D7_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_REDESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D7_APPROVAL_RUNTIME_COUNT,
  D7_CERTIFICATION_RUNTIME_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  CURRENT_D7_RECORD_EQUALS_VALIDATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  D7_REUSES_CANONICAL_FINGERPRINT,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D7_EQUALS_D2_CIVIL_AUTHORITY,
  D7_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D7_EQUALS_D4_MECHANICAL_AUTHORITY,
  D7_EQUALS_D5_PIPING_AUTHORITY,
  D7_EQUALS_D6_PROCESS_AUTHORITY,
  D7_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  AI_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  D7_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
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
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  UNAUTHORIZED_ARC_FLASH_CALCULATION,
  UNAUTHORIZED_GROUNDING_CALCULATION,
  UNAUTHORIZED_UPSTREAM_D7_MUTATION,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["matching_name", "matching_tag", "name_similarity", "tag_similarity", "semantic_similarity", "ai_inference", "ai_reasoning", "inferred", "topology", "drawing"]);
const MAGNITUDE = /^[0-9]+(\.[0-9]+)?$/;
const SETTING_UNITS = { CURRENT: ["A", "kA"], TIME: ["s"], VOLTAGE: ["V", "kV"] } as const;

type Currentness = (typeof D7_CURRENTNESS_STATES)[number];
type Stage = (typeof D7_MATURITY_STATES)[number];
type DeviceClass = (typeof D7_R6_DEVICE_CLASSES)[number];
type SettingRole = (typeof D7_R6_SETTING_ROLES)[number];
type SettingCategory = (typeof D7_R6_SETTING_CATEGORIES)[number];
type GroundingRole = (typeof D7_R6_GROUNDING_ROLES)[number];
type SuitabilityRole = (typeof D7_R6_SUITABILITY_ROLES)[number];

type Prohibited = {
  mutateR1?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  inferRelationship?: boolean;
  repoint?: boolean;
  autoAdopt?: boolean;
  autoAdoptProtectionEvidence?: boolean;
  autoAdoptGroundingEvidence?: boolean;
  autoAdoptArcFlash?: boolean;
  autoAdoptSuitability?: boolean;
  recalculateProtectionEvidence?: boolean;
  recalculateGroundingEvidence?: boolean;
  calculateProtectionSetting?: boolean;
  performCoordination?: boolean;
  selectDevice?: boolean;
  calculateBreakerTrip?: boolean;
  calculateRelaySetting?: boolean;
  generateArcFlashLabel?: boolean;
  determinePpeCategory?: boolean;
  performArcFlash?: boolean;
  calculateGroundResistance?: boolean;
  calculateStepTouch?: boolean;
  sizeGroundingConductor?: boolean;
  designGroundGrid?: boolean;
  performHazardousAreaClassification?: boolean;
  autoMatchEquipment?: boolean;
  autoSelectEquipment?: boolean;
  autoApproveSuitability?: boolean;
  feederAutoCreatesSetting?: boolean;
  cableAutoCreatesSetting?: boolean;
  loadAutoCreatesSetting?: boolean;
  convertUnits?: boolean;
  engineeringValidated?: boolean;
  codeConformance?: boolean;
  approval?: boolean;
  certification?: boolean;
  eosCertification?: boolean;
  markingEqualsSelection?: boolean;
  conformanceDetermined?: boolean;
  iacImplementation?: boolean;
  functionalSafety?: boolean;
  d9Source?: boolean;
  requirementsGovernance?: boolean;
};

type GovernedInput = Prohibited & {
  contextId: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  jurisdictionProfileId?: string | null;
  standardReference?: string | null;
};

type Prepared = {
  contextId: string;
  object: D7R1ObjectRecord;
  stage: Stage;
  citedCurrentness: Currentness;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  sourceBasisRef: string;
  jurisdictionProfileId: string | null;
  standardReference: string | null;
};

export type D7R6History = {
  historyId: string;
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  boundRevision: string;
  recordedAt: string;
};

type RowStatus = { fingerprint: string; tenantId: string; recordStatus: "CURRENT" | "SUPERSEDED"; currentness: "CURRENT" | "SUPERSEDED" };

export type D7R6DeviceRecord = RowStatus & {
  deviceRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "ELECTRICAL_PROTECTION_CONTEXT";
  objectRevisionFingerprint: string;
  deviceClass: DeviceClass;
  arcFlashEvidenceId: string | null;
  arcFlashEvidenceRevisionFingerprint: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D7_CONTEXT_AUTHORITY;
  validatedProtectionDesign: false;
  validatedDeviceSelection: false;
  deviceSelectedByEos: false;
  labelGenerated: false;
  ppeCategoryDetermined: false;
  engineeringValidated: false;
  recordedBy: string;
  recordedAt: string;
  predecessorDeviceRecordId: string | null;
};

export type D7R6ProtectionRelationshipRecord = RowStatus & {
  relationshipId: string;
  kind: "DEVICE_PROTECTS_SUBJECT";
  contextId: string;
  deviceObjectId: string;
  deviceObjectRevisionFingerprint: string;
  deviceRecordId: string;
  deviceRevisionFingerprint: string;
  subjectObjectId: string;
  subjectObjectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D7_CONTEXT_AUTHORITY;
  inferred: false;
  engineeringValidated: false;
  recordedBy: string;
  recordedAt: string;
  predecessorRelationshipId: string | null;
};

export type D7R6SettingRecord = RowStatus & {
  settingRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "ELECTRICAL_PROTECTION_CONTEXT";
  objectRevisionFingerprint: string;
  statementRole: SettingRole;
  settingCategory: SettingCategory;
  suppliedValue: string;
  unit: string;
  adopted: boolean;
  adoptedFromSettingRecordId: string | null;
  adoptionRationale: string | null;
  protectionEvidenceId: string | null;
  protectionEvidenceRevisionFingerprint: string | null;
  feederRecordId: string | null;
  feederRevisionFingerprint: string | null;
  cableRecordId: string | null;
  cableRevisionFingerprint: string | null;
  loadRecordId: string | null;
  loadRevisionFingerprint: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  jurisdictionProfileId: string | null;
  standardReference: string | null;
  authority: typeof D7_CONTEXT_AUTHORITY;
  coordinationValidated: false;
  calculated: false;
  validatedSetting: false;
  codeConformance: false;
  conformanceDetermined: false;
  engineeringValidated: false;
  recordedBy: string;
  recordedAt: string;
  predecessorSettingRecordId: string | null;
};

export type D7R6GroundingRecord = RowStatus & {
  groundingRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "ELECTRICAL_GROUNDING_CONTEXT";
  objectRevisionFingerprint: string;
  groundingRole: GroundingRole;
  suppliedResistanceValue: string | null;
  resistanceUnit: "ohm" | null;
  groundingEvidenceId: string | null;
  groundingEvidenceRevisionFingerprint: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D7_CONTEXT_AUTHORITY;
  validatedGroundingDesign: false;
  codeConformance: false;
  resistanceCalculated: false;
  stepTouchCalculated: false;
  conductorSized: false;
  groundGridDesigned: false;
  engineeringValidated: false;
  recordedBy: string;
  recordedAt: string;
  predecessorGroundingRecordId: string | null;
};

export type D7R6GroundingRelationshipRecord = RowStatus & {
  relationshipId: string;
  kind: (typeof D7_R6_GROUNDING_RELATIONSHIP_KINDS)[number];
  contextId: string;
  groundingObjectId: string;
  groundingObjectRevisionFingerprint: string;
  groundingRecordId: string;
  groundingRevisionFingerprint: string;
  subjectObjectId: string;
  subjectObjectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D7_CONTEXT_AUTHORITY;
  inferred: false;
  engineeringValidated: false;
  recordedBy: string;
  recordedAt: string;
  predecessorRelationshipId: string | null;
};

export type D7R6HazardousAreaRecord = RowStatus & {
  areaRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "ELECTRICAL_HAZARDOUS_AREA_CONTEXT";
  objectRevisionFingerprint: string;
  classificationSourceDocument: string;
  classificationSourceRevision: string;
  zoneOrDivision: (typeof D7_R6_ZONE_OR_DIVISION)[number];
  atmosphere: (typeof D7_R6_ATMOSPHERES)[number];
  group: (typeof D7_R6_GROUPS)[number] | null;
  temperatureClass: (typeof D7_R6_TEMPERATURE_CLASSES)[number] | null;
  areaLocationRef: string;
  jurisdictionProfileId: string | null;
  standardReference: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D7_CONTEXT_AUTHORITY;
  classificationPerformedByEos: false;
  validatedClassification: false;
  codeConformance: false;
  conformanceDetermined: false;
  engineeringValidated: false;
  recordedBy: string;
  recordedAt: string;
  predecessorAreaRecordId: string | null;
};

export type D7R6SuitabilityRecord = RowStatus & {
  suitabilityRecordId: string;
  contextId: string;
  equipmentObjectId: string;
  equipmentObjectType: D7R1ObjectRecord["objectType"];
  equipmentRevisionFingerprint: string;
  hazardousAreaRecordId: string;
  hazardousAreaRevisionFingerprint: string;
  statementRole: SuitabilityRole;
  adopted: boolean;
  adoptedFromSuitabilityRecordId: string | null;
  adoptionRationale: string | null;
  suppliedCertificationEvidenceRef: string;
  suppliedMarkingRef: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  jurisdictionProfileId: string | null;
  standardReference: string | null;
  authority: typeof D7_CONTEXT_AUTHORITY;
  validatedSelection: false;
  codeConformance: false;
  eosCertified: false;
  markingValidatedSelection: false;
  autoMatched: false;
  conformanceDetermined: false;
  engineeringValidated: false;
  recordedBy: string;
  recordedAt: string;
  predecessorSuitabilityRecordId: string | null;
};

export type D7R6Store = {
  r1: D7R1Store;
  r5: D7R5Store;
  now: () => string;
  devices: D7R6DeviceRecord[];
  protectionRelationships: D7R6ProtectionRelationshipRecord[];
  settings: D7R6SettingRecord[];
  grounding: D7R6GroundingRecord[];
  groundingRelationships: D7R6GroundingRelationshipRecord[];
  hazardousAreas: D7R6HazardousAreaRecord[];
  suitability: D7R6SuitabilityRecord[];
  history: D7R6History[];
};

function fail(code: string): never {
  throw new Error(`D7_R6_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function named(value: string, code: string): string {
  const token = value.trim();
  if (!token) fail(code);
  return token;
}

function explicit(value: string, code: string): string {
  const token = named(value, code);
  if (FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function allow<T extends string>(value: string, rows: readonly T[], code: string): T {
  if (!(rows as readonly string[]).includes(value)) fail(code);
  return value as T;
}

function assertActor(actor: D7R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_ELECTRICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_ELECTRICAL_AUTHORITY");
  if (actor.authority === "ELECTRICAL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_ELECTRICAL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D7_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D7R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.mutateR1 === true || input.mutateR2 === true || input.mutateR3 === true || input.mutateR4 === true || input.mutateR5 === true) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.inferRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.autoAdopt === true || input.autoAdoptProtectionEvidence === true || input.autoAdoptGroundingEvidence === true || input.autoAdoptArcFlash === true || input.autoAdoptSuitability === true) fail("AUTO_ADOPTION_REJECTED");
  if (input.recalculateProtectionEvidence === true || input.recalculateGroundingEvidence === true) fail("EVIDENCE_RECALCULATION_REJECTED");
  if (input.calculateProtectionSetting === true || input.performCoordination === true || input.calculateBreakerTrip === true || input.calculateRelaySetting === true) fail("PROTECTION_CALCULATION_NOT_IN_R6");
  if (input.selectDevice === true) fail("DEVICE_SELECTION_NOT_IN_R6");
  if (input.generateArcFlashLabel === true || input.determinePpeCategory === true || input.performArcFlash === true) fail("ARC_FLASH_CALCULATION_NOT_IN_R6");
  if (input.calculateGroundResistance === true || input.calculateStepTouch === true || input.sizeGroundingConductor === true || input.designGroundGrid === true) fail("GROUNDING_CALCULATION_NOT_IN_R6");
  if (input.performHazardousAreaClassification === true) fail("HAZARDOUS_AREA_CLASSIFICATION_NOT_IN_R6");
  if (input.autoMatchEquipment === true || input.autoSelectEquipment === true || input.autoApproveSuitability === true) fail("EQUIPMENT_MATCHING_NOT_IN_R6");
  if (input.feederAutoCreatesSetting === true || input.cableAutoCreatesSetting === true || input.loadAutoCreatesSetting === true) fail("CONTEXT_DOES_NOT_CREATE_PROTECTION_SETTING");
  if (input.convertUnits === true) fail("UNIT_CHANGE_REJECTED");
  if (input.engineeringValidated === true || input.codeConformance === true || input.approval === true || input.certification === true || input.conformanceDetermined === true) fail("VALIDATION_NOT_IN_R6");
  if (input.eosCertification === true) fail("SUPPLIED_CERTIFICATION_NOT_EOS_CERTIFICATION");
  if (input.markingEqualsSelection === true) fail("MARKING_NOT_VALIDATED_SELECTION");
  if (input.iacImplementation === true || input.functionalSafety === true) fail("D8_NOT_IN_R6");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R6");
  if (input.requirementsGovernance === true) fail("REQUIREMENTS_NOT_IN_R6");
}

function requireObject(store: D7R6Store, actor: D7R1Actor, contextId: string, objectId: string, revision: string, allowed: readonly string[], cited: Currentness): D7R1ObjectRecord {
  const context = store.r1.contexts.find((row) => row.contextId === contextId);
  const object = store.r1.objects.find((row) => row.objectId === explicit(objectId, "R1_OBJECT_REQUIRED"));
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (!object || !(allowed as readonly string[]).includes(object.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== explicit(revision, "R1_REVISION_REQUIRED")) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== context.contextId || object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function optionalPair(id: string | null | undefined, revision: string | null | undefined, code: string): { id: string; revision: string } | null {
  const hasId = id != null && id.trim() !== "";
  const hasRevision = revision != null && revision.trim() !== "";
  if (!hasId && !hasRevision) return null;
  if (!hasId || !hasRevision) fail(code);
  return { id: id as string, revision: revision as string };
}

function requireCurrent<T extends { tenantId: string; fingerprint: string; recordStatus: "CURRENT" | "SUPERSEDED" }>(rows: readonly T[], id: string, fingerprint: string, actor: D7R1Actor, idOf: (row: T) => string, code: string): T {
  const row = rows.find((item) => idOf(item) === explicit(id, code));
  if (!row || row.fingerprint !== explicit(fingerprint, code) || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT") fail(code);
  return row;
}

function requireEvidence(store: D7R6Store, actor: D7R1Actor, id: string, fingerprint: string, evidenceClass: D7R5EvidenceRecord["evidenceClass"]): D7R5EvidenceRecord {
  const row = requireCurrent(store.r5.evidence, id, fingerprint, actor, (item) => item.evidenceId, "R5_EVIDENCE_REVISION_MISMATCH");
  if (row.evidenceClass !== evidenceClass) fail("R5_EVIDENCE_CLASS_MISMATCH");
  return row;
}

function jurisdiction(input: GovernedInput): { jurisdictionProfileId: string | null; standardReference: string | null } {
  const jurisdictionProfileId = input.jurisdictionProfileId == null || input.jurisdictionProfileId.trim() === ""
    ? null
    : allow(named(input.jurisdictionProfileId, "JURISDICTION_REQUIRED"), D7_JURISDICTION_PROFILE_IDS, "JURISDICTION_NOT_ALLOWLISTED");
  const standardReference = input.standardReference == null || input.standardReference.trim() === "" ? null : explicit(input.standardReference, "STANDARD_REFERENCE_REQUIRED");
  return { jurisdictionProfileId, standardReference };
}

function prepare(store: D7R6Store, actor: D7R1Actor, input: GovernedInput, allowed: readonly string[], objectId: string, revision: string): Prepared {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!(D7_CURRENTNESS_STATES as readonly string[]).includes(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const stage = input.citedLifecycleStage.trim();
  if (!(D7_MATURITY_STATES as readonly string[]).includes(stage)) fail("MATURITY_STAGE_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const object = requireObject(store, actor, contextId, objectId, revision, allowed, citedCurrentness as Currentness);
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return {
    contextId,
    object,
    stage: stage as Stage,
    citedCurrentness: citedCurrentness as Currentness,
    applicability,
    limitations,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    ...jurisdiction(input),
  };
}

function commit<T extends RowStatus>(
  rows: T[],
  history: D7R6History[],
  now: () => string,
  id: string,
  fingerprint: string,
  tenantId: string,
  predecessor: T | null,
  idOf: (row: T) => string,
  revisionOf: (row: T) => string,
  duplicate: T | undefined,
  duplicateCode: string,
  record: T,
): T {
  const existing = rows.find((row) => idOf(row) === id);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === tenantId ? existing : fail(duplicateCode);
  if (duplicate) fail(duplicateCode);
  if (predecessor) {
    const prior = revisionOf(predecessor);
    const index = rows.findIndex((row) => idOf(row) === idOf(predecessor));
    rows[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (revisionOf(rows[index]) !== prior) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    history.push({ historyId: `hist-${history.length + 1}`, subjectId: idOf(predecessor), action: "SUPERSEDED", fingerprint: predecessor.fingerprint, boundRevision: prior, recordedAt: now() });
  }
  rows.push(record);
  history.push({ historyId: `hist-${history.length + 1}`, subjectId: id, action: "CREATED", fingerprint, boundRevision: revisionOf(record), recordedAt: now() });
  return record;
}

function magnitude(value: string, unit: string, allowed: readonly string[]): { value: string; unit: string } {
  const keptUnit = allow(named(unit, "UNIT_REQUIRED"), allowed, "UNIT_NOT_PRESERVED");
  const keptValue = explicit(value, "VALUE_REQUIRED");
  if (!MAGNITUDE.test(keptValue)) fail("HIDDEN_CALCULATION");
  return { value: keptValue, unit: keptUnit };
}

export function createD7R6Store(r1: D7R1Store, r5: D7R5Store, now: () => string = () => "2026-10-25T00:00:00.000Z"): D7R6Store {
  if (R5_RUNTIME_COUNT !== 5) fail("R5_RUNTIME_COUNT_UNEXPECTED");
  if (r5.r1 !== r1 || r5.r4.r1 !== r1 || r5.r4.r2.r1 !== r1 || r5.r4.r3.r1 !== r1 || r5.r4.r3.r2 !== r5.r4.r2) fail("R1_R5_STORE_MISMATCH");
  return { r1, r5, now, devices: [], protectionRelationships: [], settings: [], grounding: [], groundingRelationships: [], hazardousAreas: [], suitability: [], history: [] };
}

export function recordElectricalProtectionDeviceContext(store: D7R6Store, actor: D7R1Actor, input: GovernedInput & {
  deviceRecordId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  deviceClass: string;
  arcFlashEvidenceId?: string | null;
  arcFlashEvidenceRevisionFingerprint?: string | null;
  predecessorDeviceRecordId?: string | null;
}): D7R6DeviceRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_PROTECTION_CONTEXT"], input.objectId, input.objectRevisionFingerprint);
  const deviceRecordId = explicit(input.deviceRecordId, "DEVICE_CONTEXT_REQUIRED");
  const deviceClass = allow(named(input.deviceClass, "DEVICE_CLASS_REQUIRED"), D7_R6_DEVICE_CLASSES, "DEVICE_CLASS_NOT_ALLOWLISTED");
  const arcPair = optionalPair(input.arcFlashEvidenceId, input.arcFlashEvidenceRevisionFingerprint, "R5_ARC_FLASH_REVISION_REQUIRED");
  const arc = arcPair ? requireEvidence(store, actor, arcPair.id, arcPair.revision, "ARC_FLASH") : null;
  const before = { object: prepared.object.fingerprint, arc: arc?.fingerprint ?? null, arcResult: arc?.results[0]?.value ?? null };
  const predecessor = input.predecessorDeviceRecordId ? store.devices.find((row) => row.deviceRecordId === input.predecessorDeviceRecordId) : null;
  if (input.predecessorDeviceRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    deviceRecordId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    deviceClass,
    arcFlashEvidenceId: arc?.evidenceId ?? null,
    arcFlashEvidenceRevisionFingerprint: arc?.fingerprint ?? null,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
  });
  if (prepared.object.fingerprint !== before.object || (arc?.fingerprint ?? null) !== before.arc || (arc?.results[0]?.value ?? null) !== before.arcResult) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.devices.find((row) => row.recordStatus === "CURRENT" && row.deviceRecordId !== predecessor?.deviceRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint);
  const record: D7R6DeviceRecord = Object.freeze({
    deviceRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectType: "ELECTRICAL_PROTECTION_CONTEXT",
    objectRevisionFingerprint: prepared.object.fingerprint,
    deviceClass,
    arcFlashEvidenceId: arc?.evidenceId ?? null,
    arcFlashEvidenceRevisionFingerprint: arc?.fingerprint ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D7_CONTEXT_AUTHORITY,
    validatedProtectionDesign: false,
    validatedDeviceSelection: false,
    deviceSelectedByEos: false,
    labelGenerated: false,
    ppeCategoryDetermined: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorDeviceRecordId: predecessor?.deviceRecordId ?? null,
  });
  return commit(store.devices, store.history, store.now, deviceRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.deviceRecordId, (row) => row.objectRevisionFingerprint, duplicate, "DUPLICATE_DEVICE_REJECTED", record);
}

export function recordElectricalProtectionRelationship(store: D7R6Store, actor: D7R1Actor, input: GovernedInput & {
  relationshipId: string;
  kind: string;
  deviceObjectId: string;
  deviceObjectRevisionFingerprint: string;
  deviceRecordId: string;
  deviceRevisionFingerprint: string;
  subjectObjectId: string;
  subjectObjectRevisionFingerprint: string;
  predecessorRelationshipId?: string | null;
}): D7R6ProtectionRelationshipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!(D7_CURRENTNESS_STATES as readonly string[]).includes(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const relationshipId = explicit(input.relationshipId, "RELATIONSHIP_REQUIRED");
  const kindToken = input.kind.trim();
  if (INFERRED.has(kindToken.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (kindToken !== "DEVICE_PROTECTS_SUBJECT") fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const deviceObject = requireObject(store, actor, contextId, input.deviceObjectId, input.deviceObjectRevisionFingerprint, ["ELECTRICAL_PROTECTION_CONTEXT"], citedCurrentness as Currentness);
  const subject = requireObject(store, actor, contextId, input.subjectObjectId, input.subjectObjectRevisionFingerprint, D7_ELECTRICAL_OBJECT_TYPES, citedCurrentness as Currentness);
  const device = requireCurrent(store.devices, input.deviceRecordId, input.deviceRevisionFingerprint, actor, (row) => row.deviceRecordId, "DEVICE_REVISION_MISMATCH");
  if (device.objectId !== deviceObject.objectId || device.objectRevisionFingerprint !== deviceObject.fingerprint) fail("DEVICE_REVISION_MISMATCH");
  const stage = input.citedLifecycleStage.trim();
  if (!(D7_MATURITY_STATES as readonly string[]).includes(stage)) fail("MATURITY_STAGE_INVALID");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  if (!applicability.includes(deviceObject.objectId) || !applicability.includes(subject.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const before = { device: device.fingerprint, subject: subject.fingerprint };
  const predecessor = input.predecessorRelationshipId ? store.protectionRelationships.find((row) => row.relationshipId === input.predecessorRelationshipId) : null;
  if (input.predecessorRelationshipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    relationshipId,
    kind: "DEVICE_PROTECTS_SUBJECT",
    deviceRecordId: device.deviceRecordId,
    deviceRevisionFingerprint: device.fingerprint,
    subjectObjectId: subject.objectId,
    subjectObjectRevisionFingerprint: subject.fingerprint,
    applicability,
    limitations,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
  });
  if (device.fingerprint !== before.device || subject.fingerprint !== before.subject) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.protectionRelationships.find((row) => row.recordStatus === "CURRENT" && row.relationshipId !== predecessor?.relationshipId && row.kind === "DEVICE_PROTECTS_SUBJECT" && row.deviceRevisionFingerprint === device.fingerprint && row.subjectObjectRevisionFingerprint === subject.fingerprint);
  const record: D7R6ProtectionRelationshipRecord = Object.freeze({
    relationshipId,
    kind: "DEVICE_PROTECTS_SUBJECT",
    contextId,
    deviceObjectId: deviceObject.objectId,
    deviceObjectRevisionFingerprint: deviceObject.fingerprint,
    deviceRecordId: device.deviceRecordId,
    deviceRevisionFingerprint: device.fingerprint,
    subjectObjectId: subject.objectId,
    subjectObjectRevisionFingerprint: subject.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: stage as Stage,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    applicability,
    limitations,
    citedCurrentness: citedCurrentness as Currentness,
    authority: D7_CONTEXT_AUTHORITY,
    inferred: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  return commit(store.protectionRelationships, store.history, store.now, relationshipId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.relationshipId, (row) => row.subjectObjectRevisionFingerprint, duplicate, "DUPLICATE_PROTECTION_RELATIONSHIP_REJECTED", record);
}

export function recordElectricalProtectionSetting(store: D7R6Store, actor: D7R1Actor, input: GovernedInput & {
  settingRecordId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  statementRole: string;
  settingCategory: string;
  suppliedValue: string;
  unit: string;
  adoptedFromSettingRecordId?: string | null;
  adoptionRationale?: string | null;
  protectionEvidenceId?: string | null;
  protectionEvidenceRevisionFingerprint?: string | null;
  feederRecordId?: string | null;
  feederRevisionFingerprint?: string | null;
  cableRecordId?: string | null;
  cableRevisionFingerprint?: string | null;
  loadRecordId?: string | null;
  loadRevisionFingerprint?: string | null;
  predecessorSettingRecordId?: string | null;
}): D7R6SettingRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_PROTECTION_CONTEXT"], input.objectId, input.objectRevisionFingerprint);
  const settingRecordId = explicit(input.settingRecordId, "SETTING_REQUIRED");
  const statementRole = allow(named(input.statementRole, "SETTING_ROLE_REQUIRED"), D7_R6_SETTING_ROLES, "SETTING_ROLE_NOT_ALLOWLISTED");
  const settingCategory = allow(named(input.settingCategory, "SETTING_CATEGORY_REQUIRED"), D7_R6_SETTING_CATEGORIES, "SETTING_CATEGORY_NOT_ALLOWLISTED");
  const measured = magnitude(input.suppliedValue, input.unit, SETTING_UNITS[settingCategory]);
  if (statementRole === "SUPPLIED_PROTECTION_SETTING" && input.adoptedFromSettingRecordId) fail("SUPPLIED_SETTING_AUTO_ADOPTED");
  const evidencePair = optionalPair(input.protectionEvidenceId, input.protectionEvidenceRevisionFingerprint, "R5_PROTECTION_EVIDENCE_REVISION_REQUIRED");
  const evidence = evidencePair ? requireEvidence(store, actor, evidencePair.id, evidencePair.revision, "PROTECTION_COORDINATION") : null;
  const feederPair = optionalPair(input.feederRecordId, input.feederRevisionFingerprint, "R4_FEEDER_REVISION_REQUIRED");
  const cablePair = optionalPair(input.cableRecordId, input.cableRevisionFingerprint, "R4_CABLE_REVISION_REQUIRED");
  const loadPair = optionalPair(input.loadRecordId, input.loadRevisionFingerprint, "R3_LOAD_REVISION_REQUIRED");
  const feeder = feederPair ? requireCurrent(store.r5.r4.feeders, feederPair.id, feederPair.revision, actor, (row) => row.feederRecordId, "R4_FEEDER_REVISION_MISMATCH") : null;
  const cable = cablePair ? requireCurrent(store.r5.r4.cables, cablePair.id, cablePair.revision, actor, (row) => row.cableRecordId, "R4_CABLE_REVISION_MISMATCH") : null;
  const load = loadPair ? requireCurrent(store.r5.r4.r3.loads, loadPair.id, loadPair.revision, actor, (row) => row.loadRecordId, "R3_LOAD_REVISION_MISMATCH") : null;
  let adoptedFrom: D7R6SettingRecord | null = null;
  if (statementRole === "ADOPTED_PROTECTION_SETTING") {
    adoptedFrom = store.settings.find((row) => row.settingRecordId === input.adoptedFromSettingRecordId) ?? null;
    const rationale = input.adoptionRationale ?? "";
    if (!adoptedFrom || !rationale.trim() || adoptedFrom.statementRole !== "SUPPLIED_PROTECTION_SETTING" || adoptedFrom.recordStatus !== "CURRENT" || adoptedFrom.tenantId !== actor.tenantId || adoptedFrom.settingCategory !== settingCategory || adoptedFrom.objectId !== prepared.object.objectId || adoptedFrom.unit !== measured.unit || adoptedFrom.suppliedValue !== measured.value) fail("ADOPTION_REQUIRED");
  }
  const before = {
    object: prepared.object.fingerprint,
    evidence: evidence?.fingerprint ?? null,
    evidenceResult: evidence?.results[0]?.value ?? null,
    feeder: feeder?.fingerprint ?? null,
    feederCoordination: feeder?.protectionCoordination ?? null,
    cable: cable?.fingerprint ?? null,
    cableSize: cable?.suppliedSizeAttribute ?? null,
    load: load?.fingerprint ?? null,
    loadValue: load?.suppliedValue ?? null,
    adoptedFrom: adoptedFrom?.fingerprint ?? null,
    adoptedFlag: adoptedFrom?.adopted ?? null,
  };
  const predecessor = input.predecessorSettingRecordId ? store.settings.find((row) => row.settingRecordId === input.predecessorSettingRecordId) : null;
  if (input.predecessorSettingRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId || predecessor.statementRole !== statementRole)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    settingRecordId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    statementRole,
    settingCategory,
    suppliedValue: measured.value,
    unit: measured.unit,
    adoptedFromSettingRecordId: adoptedFrom?.settingRecordId ?? null,
    protectionEvidenceId: evidence?.evidenceId ?? null,
    protectionEvidenceRevisionFingerprint: evidence?.fingerprint ?? null,
    feederRecordId: feeder?.feederRecordId ?? null,
    feederRevisionFingerprint: feeder?.fingerprint ?? null,
    cableRecordId: cable?.cableRecordId ?? null,
    cableRevisionFingerprint: cable?.fingerprint ?? null,
    loadRecordId: load?.loadRecordId ?? null,
    loadRevisionFingerprint: load?.fingerprint ?? null,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    jurisdictionProfileId: prepared.jurisdictionProfileId,
    standardReference: prepared.standardReference,
  });
  if (
    prepared.object.fingerprint !== before.object
    || (evidence?.fingerprint ?? null) !== before.evidence
    || (evidence?.results[0]?.value ?? null) !== before.evidenceResult
    || (feeder?.fingerprint ?? null) !== before.feeder
    || (feeder?.protectionCoordination ?? null) !== before.feederCoordination
    || (cable?.fingerprint ?? null) !== before.cable
    || (cable?.suppliedSizeAttribute ?? null) !== before.cableSize
    || (load?.fingerprint ?? null) !== before.load
    || (load?.suppliedValue ?? null) !== before.loadValue
    || (adoptedFrom?.fingerprint ?? null) !== before.adoptedFrom
    || (adoptedFrom?.adopted ?? null) !== before.adoptedFlag
  ) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.settings.find((row) => row.recordStatus === "CURRENT" && row.settingRecordId !== predecessor?.settingRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.settingCategory === settingCategory && row.statementRole === statementRole);
  const record: D7R6SettingRecord = Object.freeze({
    settingRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectType: "ELECTRICAL_PROTECTION_CONTEXT",
    objectRevisionFingerprint: prepared.object.fingerprint,
    statementRole,
    settingCategory,
    suppliedValue: measured.value,
    unit: measured.unit,
    adopted: statementRole === "ADOPTED_PROTECTION_SETTING",
    adoptedFromSettingRecordId: adoptedFrom?.settingRecordId ?? null,
    adoptionRationale: statementRole === "ADOPTED_PROTECTION_SETTING" ? explicit(input.adoptionRationale ?? "", "ADOPTION_RATIONALE_REQUIRED") : null,
    protectionEvidenceId: evidence?.evidenceId ?? null,
    protectionEvidenceRevisionFingerprint: evidence?.fingerprint ?? null,
    feederRecordId: feeder?.feederRecordId ?? null,
    feederRevisionFingerprint: feeder?.fingerprint ?? null,
    cableRecordId: cable?.cableRecordId ?? null,
    cableRevisionFingerprint: cable?.fingerprint ?? null,
    loadRecordId: load?.loadRecordId ?? null,
    loadRevisionFingerprint: load?.fingerprint ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    jurisdictionProfileId: prepared.jurisdictionProfileId,
    standardReference: prepared.standardReference,
    authority: D7_CONTEXT_AUTHORITY,
    coordinationValidated: false,
    calculated: false,
    validatedSetting: false,
    codeConformance: false,
    conformanceDetermined: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorSettingRecordId: predecessor?.settingRecordId ?? null,
  });
  return commit(store.settings, store.history, store.now, settingRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.settingRecordId, (row) => row.objectRevisionFingerprint, duplicate, "DUPLICATE_SETTING_REJECTED", record);
}

export function recordElectricalGroundingContext(store: D7R6Store, actor: D7R1Actor, input: GovernedInput & {
  groundingRecordId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  groundingRole: string;
  suppliedResistanceValue?: string | null;
  resistanceUnit?: string | null;
  groundingEvidenceId?: string | null;
  groundingEvidenceRevisionFingerprint?: string | null;
  predecessorGroundingRecordId?: string | null;
}): D7R6GroundingRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_GROUNDING_CONTEXT"], input.objectId, input.objectRevisionFingerprint);
  const groundingRecordId = explicit(input.groundingRecordId, "GROUNDING_CONTEXT_REQUIRED");
  const groundingRole = allow(named(input.groundingRole, "GROUNDING_ROLE_REQUIRED"), D7_R6_GROUNDING_ROLES, "GROUNDING_ROLE_NOT_ALLOWLISTED");
  const hasValue = input.suppliedResistanceValue != null && input.suppliedResistanceValue.trim() !== "";
  const hasUnit = input.resistanceUnit != null && input.resistanceUnit.trim() !== "";
  if (hasValue !== hasUnit) fail("UNIT_REQUIRED");
  const resistance = hasValue ? magnitude(input.suppliedResistanceValue ?? "", input.resistanceUnit ?? "", ["ohm"]) : null;
  const evidencePair = optionalPair(input.groundingEvidenceId, input.groundingEvidenceRevisionFingerprint, "R5_GROUNDING_EVIDENCE_REVISION_REQUIRED");
  const evidence = evidencePair ? requireEvidence(store, actor, evidencePair.id, evidencePair.revision, "GROUNDING") : null;
  const before = { object: prepared.object.fingerprint, evidence: evidence?.fingerprint ?? null, evidenceResult: evidence?.results[0]?.value ?? null };
  const predecessor = input.predecessorGroundingRecordId ? store.grounding.find((row) => row.groundingRecordId === input.predecessorGroundingRecordId) : null;
  if (input.predecessorGroundingRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    groundingRecordId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    groundingRole,
    suppliedResistanceValue: resistance?.value ?? null,
    resistanceUnit: resistance?.unit ?? null,
    groundingEvidenceId: evidence?.evidenceId ?? null,
    groundingEvidenceRevisionFingerprint: evidence?.fingerprint ?? null,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
  });
  if (prepared.object.fingerprint !== before.object || (evidence?.fingerprint ?? null) !== before.evidence || (evidence?.results[0]?.value ?? null) !== before.evidenceResult) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.grounding.find((row) => row.recordStatus === "CURRENT" && row.groundingRecordId !== predecessor?.groundingRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.groundingRole === groundingRole);
  const record: D7R6GroundingRecord = Object.freeze({
    groundingRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectType: "ELECTRICAL_GROUNDING_CONTEXT",
    objectRevisionFingerprint: prepared.object.fingerprint,
    groundingRole,
    suppliedResistanceValue: resistance?.value ?? null,
    resistanceUnit: resistance ? "ohm" : null,
    groundingEvidenceId: evidence?.evidenceId ?? null,
    groundingEvidenceRevisionFingerprint: evidence?.fingerprint ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D7_CONTEXT_AUTHORITY,
    validatedGroundingDesign: false,
    codeConformance: false,
    resistanceCalculated: false,
    stepTouchCalculated: false,
    conductorSized: false,
    groundGridDesigned: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorGroundingRecordId: predecessor?.groundingRecordId ?? null,
  });
  return commit(store.grounding, store.history, store.now, groundingRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.groundingRecordId, (row) => row.objectRevisionFingerprint, duplicate, "DUPLICATE_GROUNDING_REJECTED", record);
}

export function recordElectricalGroundingRelationship(store: D7R6Store, actor: D7R1Actor, input: GovernedInput & {
  relationshipId: string;
  kind: string;
  groundingObjectId: string;
  groundingObjectRevisionFingerprint: string;
  groundingRecordId: string;
  groundingRevisionFingerprint: string;
  subjectObjectId: string;
  subjectObjectRevisionFingerprint: string;
  predecessorRelationshipId?: string | null;
}): D7R6GroundingRelationshipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!(D7_CURRENTNESS_STATES as readonly string[]).includes(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const relationshipId = explicit(input.relationshipId, "RELATIONSHIP_REQUIRED");
  const kindToken = input.kind.trim();
  if (INFERRED.has(kindToken.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  const kind = allow(kindToken, D7_R6_GROUNDING_RELATIONSHIP_KINDS, "RELATIONSHIP_KIND_NOT_EXPLICIT");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const groundingObject = requireObject(store, actor, contextId, input.groundingObjectId, input.groundingObjectRevisionFingerprint, ["ELECTRICAL_GROUNDING_CONTEXT"], citedCurrentness as Currentness);
  const subject = requireObject(store, actor, contextId, input.subjectObjectId, input.subjectObjectRevisionFingerprint, D7_ELECTRICAL_OBJECT_TYPES, citedCurrentness as Currentness);
  const grounding = requireCurrent(store.grounding, input.groundingRecordId, input.groundingRevisionFingerprint, actor, (row) => row.groundingRecordId, "GROUNDING_REVISION_MISMATCH");
  if (grounding.objectId !== groundingObject.objectId || grounding.objectRevisionFingerprint !== groundingObject.fingerprint) fail("GROUNDING_REVISION_MISMATCH");
  const stage = input.citedLifecycleStage.trim();
  if (!(D7_MATURITY_STATES as readonly string[]).includes(stage)) fail("MATURITY_STAGE_INVALID");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  if (!applicability.includes(groundingObject.objectId) || !applicability.includes(subject.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const before = { grounding: grounding.fingerprint, subject: subject.fingerprint };
  const predecessor = input.predecessorRelationshipId ? store.groundingRelationships.find((row) => row.relationshipId === input.predecessorRelationshipId) : null;
  if (input.predecessorRelationshipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    relationshipId,
    kind,
    groundingRecordId: grounding.groundingRecordId,
    groundingRevisionFingerprint: grounding.fingerprint,
    subjectObjectId: subject.objectId,
    subjectObjectRevisionFingerprint: subject.fingerprint,
    applicability,
    limitations,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
  });
  if (grounding.fingerprint !== before.grounding || subject.fingerprint !== before.subject) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.groundingRelationships.find((row) => row.recordStatus === "CURRENT" && row.relationshipId !== predecessor?.relationshipId && row.kind === kind && row.groundingRevisionFingerprint === grounding.fingerprint && row.subjectObjectRevisionFingerprint === subject.fingerprint);
  const record: D7R6GroundingRelationshipRecord = Object.freeze({
    relationshipId,
    kind,
    contextId,
    groundingObjectId: groundingObject.objectId,
    groundingObjectRevisionFingerprint: groundingObject.fingerprint,
    groundingRecordId: grounding.groundingRecordId,
    groundingRevisionFingerprint: grounding.fingerprint,
    subjectObjectId: subject.objectId,
    subjectObjectRevisionFingerprint: subject.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: stage as Stage,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    applicability,
    limitations,
    citedCurrentness: citedCurrentness as Currentness,
    authority: D7_CONTEXT_AUTHORITY,
    inferred: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  return commit(store.groundingRelationships, store.history, store.now, relationshipId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.relationshipId, (row) => row.subjectObjectRevisionFingerprint, duplicate, "DUPLICATE_GROUNDING_RELATIONSHIP_REJECTED", record);
}

export function recordElectricalHazardousAreaContext(store: D7R6Store, actor: D7R1Actor, input: GovernedInput & {
  areaRecordId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  classificationSourceDocument: string;
  classificationSourceRevision: string;
  zoneOrDivision: string;
  atmosphere: string;
  group?: string | null;
  temperatureClass?: string | null;
  areaLocationRef: string;
  predecessorAreaRecordId?: string | null;
}): D7R6HazardousAreaRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_HAZARDOUS_AREA_CONTEXT"], input.objectId, input.objectRevisionFingerprint);
  const areaRecordId = explicit(input.areaRecordId, "HAZARDOUS_AREA_REQUIRED");
  const classificationSourceDocument = explicit(input.classificationSourceDocument, "CLASSIFICATION_SOURCE_REQUIRED");
  const classificationSourceRevision = explicit(input.classificationSourceRevision, "CLASSIFICATION_SOURCE_REVISION_REQUIRED");
  const zoneOrDivision = allow(named(input.zoneOrDivision, "ZONE_CONTEXT_REQUIRED"), D7_R6_ZONE_OR_DIVISION, "ZONE_CONTEXT_NOT_ALLOWLISTED");
  const atmosphere = allow(named(input.atmosphere, "ATMOSPHERE_REQUIRED"), D7_R6_ATMOSPHERES, "ATMOSPHERE_NOT_ALLOWLISTED");
  const group = input.group == null || input.group.trim() === "" ? null : allow(named(input.group, "GROUP_REQUIRED"), D7_R6_GROUPS, "GROUP_NOT_ALLOWLISTED");
  const temperatureClass = input.temperatureClass == null || input.temperatureClass.trim() === "" ? null : allow(named(input.temperatureClass, "TEMPERATURE_CLASS_REQUIRED"), D7_R6_TEMPERATURE_CLASSES, "TEMPERATURE_CLASS_NOT_ALLOWLISTED");
  const areaLocationRef = explicit(input.areaLocationRef, "AREA_LOCATION_REQUIRED");
  const before = prepared.object.fingerprint;
  const predecessor = input.predecessorAreaRecordId ? store.hazardousAreas.find((row) => row.areaRecordId === input.predecessorAreaRecordId) : null;
  if (input.predecessorAreaRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    areaRecordId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    classificationSourceDocument,
    classificationSourceRevision,
    zoneOrDivision,
    atmosphere,
    group,
    temperatureClass,
    areaLocationRef,
    jurisdictionProfileId: prepared.jurisdictionProfileId,
    standardReference: prepared.standardReference,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
  });
  if (prepared.object.fingerprint !== before) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.hazardousAreas.find((row) => row.recordStatus === "CURRENT" && row.areaRecordId !== predecessor?.areaRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint);
  const record: D7R6HazardousAreaRecord = Object.freeze({
    areaRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectType: "ELECTRICAL_HAZARDOUS_AREA_CONTEXT",
    objectRevisionFingerprint: prepared.object.fingerprint,
    classificationSourceDocument,
    classificationSourceRevision,
    zoneOrDivision,
    atmosphere,
    group,
    temperatureClass,
    areaLocationRef,
    jurisdictionProfileId: prepared.jurisdictionProfileId,
    standardReference: prepared.standardReference,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D7_CONTEXT_AUTHORITY,
    classificationPerformedByEos: false,
    validatedClassification: false,
    codeConformance: false,
    conformanceDetermined: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorAreaRecordId: predecessor?.areaRecordId ?? null,
  });
  return commit(store.hazardousAreas, store.history, store.now, areaRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.areaRecordId, (row) => row.objectRevisionFingerprint, duplicate, "DUPLICATE_HAZARDOUS_AREA_REJECTED", record);
}

export function recordElectricalEquipmentSuitabilityContext(store: D7R6Store, actor: D7R1Actor, input: GovernedInput & {
  suitabilityRecordId: string;
  equipmentObjectId: string;
  equipmentRevisionFingerprint: string;
  hazardousAreaRecordId: string;
  hazardousAreaRevisionFingerprint: string;
  statementRole: string;
  adoptedFromSuitabilityRecordId?: string | null;
  adoptionRationale?: string | null;
  suppliedCertificationEvidenceRef: string;
  suppliedMarkingRef: string;
  predecessorSuitabilityRecordId?: string | null;
}): D7R6SuitabilityRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!(D7_CURRENTNESS_STATES as readonly string[]).includes(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const suitabilityRecordId = explicit(input.suitabilityRecordId, "SUITABILITY_REQUIRED");
  const statementRole = allow(named(input.statementRole, "SUITABILITY_ROLE_REQUIRED"), D7_R6_SUITABILITY_ROLES, "SUITABILITY_ROLE_NOT_ALLOWLISTED");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const equipment = requireObject(store, actor, contextId, input.equipmentObjectId, input.equipmentRevisionFingerprint, D7_R6_EQUIPMENT_OBJECT_TYPES, citedCurrentness as Currentness);
  const area = requireCurrent(store.hazardousAreas, input.hazardousAreaRecordId, input.hazardousAreaRevisionFingerprint, actor, (row) => row.areaRecordId, "HAZARDOUS_AREA_REVISION_MISMATCH");
  const stage = input.citedLifecycleStage.trim();
  if (!(D7_MATURITY_STATES as readonly string[]).includes(stage)) fail("MATURITY_STAGE_INVALID");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  if (!applicability.includes(equipment.objectId) || !applicability.includes(area.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const suppliedCertificationEvidenceRef = explicit(input.suppliedCertificationEvidenceRef, "CERTIFICATION_EVIDENCE_REQUIRED");
  const suppliedMarkingRef = explicit(input.suppliedMarkingRef, "MARKING_EVIDENCE_REQUIRED");
  const profile = jurisdiction(input);
  if (statementRole === "SUPPLIED_EQUIPMENT_SUITABILITY" && input.adoptedFromSuitabilityRecordId) fail("SUPPLIED_SUITABILITY_AUTO_ADOPTED");
  let adoptedFrom: D7R6SuitabilityRecord | null = null;
  if (statementRole === "ADOPTED_EQUIPMENT_SUITABILITY") {
    adoptedFrom = store.suitability.find((row) => row.suitabilityRecordId === input.adoptedFromSuitabilityRecordId) ?? null;
    const rationale = input.adoptionRationale ?? "";
    if (!adoptedFrom || !rationale.trim() || adoptedFrom.statementRole !== "SUPPLIED_EQUIPMENT_SUITABILITY" || adoptedFrom.recordStatus !== "CURRENT" || adoptedFrom.tenantId !== actor.tenantId || adoptedFrom.equipmentObjectId !== equipment.objectId || adoptedFrom.hazardousAreaRecordId !== area.areaRecordId || adoptedFrom.suppliedCertificationEvidenceRef !== suppliedCertificationEvidenceRef || adoptedFrom.suppliedMarkingRef !== suppliedMarkingRef) fail("ADOPTION_REQUIRED");
  }
  const before = { equipment: equipment.fingerprint, area: area.fingerprint, adoptedFrom: adoptedFrom?.fingerprint ?? null };
  const predecessor = input.predecessorSuitabilityRecordId ? store.suitability.find((row) => row.suitabilityRecordId === input.predecessorSuitabilityRecordId) : null;
  if (input.predecessorSuitabilityRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.equipmentObjectId !== equipment.objectId || predecessor.statementRole !== statementRole)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    suitabilityRecordId,
    equipmentObjectId: equipment.objectId,
    equipmentRevisionFingerprint: equipment.fingerprint,
    hazardousAreaRecordId: area.areaRecordId,
    hazardousAreaRevisionFingerprint: area.fingerprint,
    statementRole,
    suppliedCertificationEvidenceRef,
    suppliedMarkingRef,
    adoptedFromSuitabilityRecordId: adoptedFrom?.suitabilityRecordId ?? null,
    applicability,
    limitations,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    jurisdictionProfileId: profile.jurisdictionProfileId,
    standardReference: profile.standardReference,
  });
  if (equipment.fingerprint !== before.equipment || area.fingerprint !== before.area || (adoptedFrom?.fingerprint ?? null) !== before.adoptedFrom) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.suitability.find((row) => row.recordStatus === "CURRENT" && row.suitabilityRecordId !== predecessor?.suitabilityRecordId && row.equipmentObjectId === equipment.objectId && row.equipmentRevisionFingerprint === equipment.fingerprint && row.hazardousAreaRevisionFingerprint === area.fingerprint && row.statementRole === statementRole);
  const record: D7R6SuitabilityRecord = Object.freeze({
    suitabilityRecordId,
    contextId,
    equipmentObjectId: equipment.objectId,
    equipmentObjectType: equipment.objectType,
    equipmentRevisionFingerprint: equipment.fingerprint,
    hazardousAreaRecordId: area.areaRecordId,
    hazardousAreaRevisionFingerprint: area.fingerprint,
    statementRole,
    adopted: statementRole === "ADOPTED_EQUIPMENT_SUITABILITY",
    adoptedFromSuitabilityRecordId: adoptedFrom?.suitabilityRecordId ?? null,
    adoptionRationale: statementRole === "ADOPTED_EQUIPMENT_SUITABILITY" ? explicit(input.adoptionRationale ?? "", "ADOPTION_RATIONALE_REQUIRED") : null,
    suppliedCertificationEvidenceRef,
    suppliedMarkingRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: stage as Stage,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    applicability,
    limitations,
    citedCurrentness: citedCurrentness as Currentness,
    jurisdictionProfileId: profile.jurisdictionProfileId,
    standardReference: profile.standardReference,
    authority: D7_CONTEXT_AUTHORITY,
    validatedSelection: false,
    codeConformance: false,
    eosCertified: false,
    markingValidatedSelection: false,
    autoMatched: false,
    conformanceDetermined: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorSuitabilityRecordId: predecessor?.suitabilityRecordId ?? null,
  });
  return commit(store.suitability, store.history, store.now, suitabilityRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.suitabilityRecordId, (row) => row.equipmentRevisionFingerprint, duplicate, "DUPLICATE_SUITABILITY_REJECTED", record);
}

export function calculateProtectionSetting(): never {
  return fail("PROTECTION_CALCULATION_NOT_IN_R6");
}

export function performHazardousAreaClassification(): never {
  return fail("HAZARDOUS_AREA_CLASSIFICATION_NOT_IN_R6");
}

export function matchEquipmentToHazardousArea(): never {
  return fail("EQUIPMENT_MATCHING_NOT_IN_R6");
}

export function recordElectricalRequirement(): never {
  return fail("REQUIREMENTS_NOT_IN_R6");
}
