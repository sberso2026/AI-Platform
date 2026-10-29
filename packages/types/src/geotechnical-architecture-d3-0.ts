/**
 * EOS-D3-0 Geotechnical architecture.
 * Contracts only. No Geotechnical object runtime, calculation, validation, approval, or certification.
 */
import {
  D2_CURRENTNESS_STATES,
  D2_D3_INTERFACE_TOPICS,
  D2_DIGITAL_THREAD_MODULE,
  D2_FINGERPRINT_ALGORITHM,
  D2_MATURITY_STATES,
} from "./civil-architecture-d2-0";
import { EOS_JURISDICTION_PROFILE_IDS } from "./global-governance";

export const D3_0_STATUS = "ARCHITECTURE_DEFINED" as const;
export const D3_0_PHASE = "EOS-D3-0-GEOTECHNICAL-ARCHITECTURE-CANONICALIZATION" as const;
export const D3_0_PHASE_TYPE = "GEOTECHNICAL_ARCHITECTURE_CANONICALIZATION" as const;
export const D3_ARCHITECTURE_PATH = "docs/architecture/engineering-os/EOS_D3_0_GEOTECHNICAL_ARCHITECTURE.md" as const;
export const D3_ARCHITECTURE_DEFINED = true as const;
export const D3_ARCHITECTURE_READY = true as const;
export const D3_PARENT_CIVIL_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D2_R12_CIVIL_BOUNDED_CLOSEOUT.md" as const;
export const D3_PARENT_CIVIL_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D2_0_CIVIL_ARCHITECTURE.md" as const;

export const D3_CANONICAL_SCOPE =
  "Bounded Geotechnical engineering for site investigation context, boreholes, test pits, investigation locations, geological and soil stratigraphy, soil and rock classification, groundwater observations, laboratory-test evidence, in-situ-test evidence, geotechnical parameter context, foundation recommendation context, bearing and settlement criteria context, excavation and support context, slope and geotechnical stability context, earthworks material suitability, pavement subgrade parameters, ground improvement context, and geohazard context, together with Geotechnical requirements, assumptions, decisions, evidence, interfaces, review and validation governance, currentness, and a future D9 source contract. No Geotechnical calculation runtime." as const;
export const D3_CANONICAL_NON_SCOPE =
  "No bearing, settlement, slope-stability, earth-pressure, or ground-improvement calculations, no Structural member or capacity authority, no Civil grading, road, drainage, or utility-corridor design authority, no Mechanical, Piping, Process, Electrical, or Instrumentation and Control engineering, no D9 reasoning, and no validation, approval, certification, or general availability." as const;
export const D3_SCOPE_CANONICALIZED = true as const;

export const D3_GEOTECHNICAL_OBJECT_MODEL_DEFINED = true as const;
export const D3_OBJECT_TAXONOMY_CANONICALIZED = true as const;
export const D3_GEOTECHNICAL_OBJECT_CATEGORIES = [
  "SITE_INVESTIGATION_CONTEXT",
  "STRATIGRAPHY_AND_GROUNDWATER",
  "FIELD_AND_LAB_TEST_CONTEXT",
  "GEOTECHNICAL_PARAMETER_CONTEXT",
  "FOUNDATION_EXCAVATION_AND_SLOPE",
  "EARTHWORKS_SUBGRADE_AND_IMPROVEMENT",
  "GEOHAZARD_CONTEXT",
  "GEOTECHNICAL_GOVERNANCE_RECORDS",
] as const;
export const D3_GEOTECHNICAL_OBJECT_TYPES = [
  "GEOTECHNICAL_SITE_CONTEXT",
  "INVESTIGATION_LOCATION",
  "BOREHOLE",
  "TEST_PIT",
  "STRATIGRAPHIC_LAYER",
  "GROUNDWATER_OBSERVATION",
  "FIELD_TEST_RECORD",
  "LAB_TEST_RECORD",
  "MATERIAL_CLASSIFICATION",
  "GEOTECHNICAL_PARAMETER_SET",
  "FOUNDATION_GEOTECHNICAL_CONTEXT",
  "EXCAVATION_GEOTECHNICAL_CONTEXT",
  "SLOPE_GEOTECHNICAL_CONTEXT",
  "EARTHWORKS_MATERIAL_CONTEXT",
  "PAVEMENT_SUBGRADE_CONTEXT",
  "GROUND_IMPROVEMENT_CONTEXT",
  "GEOHAZARD_CONTEXT",
  "GEOTECHNICAL_GOVERNANCE_RECORD",
  "GEOTECHNICAL_REQUIREMENT",
  "GEOTECHNICAL_ASSUMPTION",
  "GEOTECHNICAL_DECISION",
  "GEOTECHNICAL_EVIDENCE_REFERENCE",
  "GEOTECHNICAL_INTERFACE",
  "GEOTECHNICAL_STANDARD_REFERENCE",
] as const;
export const D3_UNKNOWN_OBJECT_TYPE_BECOMES_AUTHORITATIVE = false as const;

export const D3_RECORD_SEMANTIC_CLASSES = [
  "RAW_OBSERVATION",
  "TEST_RESULT",
  "INTERPRETATION",
  "ENGINEERING_PARAMETER",
  "ENGINEERING_RECOMMENDATION",
  "VALIDATED_OR_APPROVED_STATE",
] as const;
export const OBSERVATION_EQUALS_INTERPRETATION = false as const;
export const TEST_RESULT_EQUALS_ENGINEERING_PARAMETER = false as const;
export const ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER = false as const;
export const RECOMMENDATION_EQUALS_APPROVAL = false as const;
export const AI_CAN_CONVERT_OBSERVATION_TO_AUTHORITATIVE_PARAMETER = false as const;

export const D3_EVIDENCE_PROVENANCE_REQUIRED = true as const;
export const AI_CAN_FABRICATE_GEOTECHNICAL_EVIDENCE = false as const;
export const D3_EVIDENCE_SOURCE_KINDS = [
  "BOREHOLE_LOG",
  "TEST_PIT_LOG",
  "LABORATORY_REPORT",
  "FIELD_TEST_DATA",
  "GROUNDWATER_OBSERVATION",
  "GEOLOGICAL_MAPPING",
  "CONSULTANT_REPORT",
  "STANDARD_OR_REFERENCE",
  "HISTORICAL_SITE_INFORMATION",
  "INSTRUMENTED_MONITORING",
] as const;

export const D3_PARAMETER_CONTEXT_DEFINED = true as const;
export const D3_PARAMETER_CONTEXT_FIELDS = [
  "UNIT_WEIGHT",
  "COHESION",
  "FRICTION_ANGLE",
  "MODULUS",
  "POISSON_RATIO",
  "UNDRAINED_SHEAR_STRENGTH",
  "BEARING_PARAMETERS",
  "SETTLEMENT_COMPRESSIBILITY",
  "PERMEABILITY",
  "SUBGRADE_PARAMETERS",
  "GROUNDWATER_LEVEL",
  "ROCK_OR_SOIL_CLASSIFICATION",
] as const;
export const D3_PARAMETER_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_INFERENCE_RUNTIME_COUNT = 0 as const;
export const AI_CAN_INVENT_AUTHORITATIVE_GEOTECHNICAL_PARAMETER = false as const;

export const D3_EQUALS_D1_STRUCTURAL_AUTHORITY = false as const;
export const D3_EQUALS_D2_CIVIL_AUTHORITY = false as const;
export const D3_ABSORBS_D4_D8 = false as const;
export const D3_ABSORBS_D9 = false as const;
export const D3_D1_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D3_D1_AUTHORITY_TRANSFER_ALLOWED = false as const;
export const D3_TO_D1_HANDOFF_SUBJECTS = [
  "FOUNDATION_SOIL_ROCK_CONTEXT",
  "ALLOWABLE_OR_CHARACTERISTIC_PARAMETER_CONTEXT",
  "SETTLEMENT_CRITERIA",
  "GROUNDWATER",
  "EXCAVATION_CONSTRAINTS",
  "PILE_OR_FOUNDATION_GEOTECHNICAL_CONTEXT",
  "LATERAL_SOIL_PARAMETER_CONTEXT",
  "GEOHAZARD_LIMITATIONS",
] as const;
export const D1_TO_D3_REFERENCE_SUBJECTS = [
  "STRUCTURAL_REACTIONS",
  "FOUNDATION_GEOMETRY",
  "GOVERNED_LOAD_CASES",
  "REQUIRED_FOUNDATION_PERFORMANCE",
  "RETAINING_SYSTEM_GEOMETRY",
] as const;

export const D3_D2_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D3_D2_AUTHORITY_TRANSFER_ALLOWED = false as const;
export const D3_D2_INTERFACE_REUSES_CIVIL_CONTRACT = true as const;
export const D3_D2_INTERFACE_TOPICS = D2_D3_INTERFACE_TOPICS;
export const D3_TO_D2_HANDOFF_SUBJECTS = [
  "SOIL_CLASSIFICATION",
  "GROUNDWATER",
  "EARTHWORKS_MATERIAL_SUITABILITY",
  "EXCAVATION_CONSTRAINTS",
  "SLOPE_CRITERIA",
  "SETTLEMENT_CONTEXT",
  "PAVEMENT_SUBGRADE_PARAMETERS",
  "GROUND_IMPROVEMENT_CONTEXT",
  "GEOHAZARD_CONTEXT",
] as const;
export const D2_TO_D3_REFERENCE_SUBJECTS = [
  "SITE_OR_SURFACE_CONTEXT",
  "PROPOSED_LEVELS",
  "GRADING",
  "CUT_OR_FILL_ZONES",
  "ROAD_OR_ACCESS_CONTEXT",
  "DRAINAGE_CONTEXT",
  "CIVIL_CORRIDOR_OR_EXCAVATION_GEOMETRY",
] as const;

export const D3_REUSES_CANONICAL_EOS_GOVERNANCE = true as const;
export const PARALLEL_D3_PLATFORM_GOVERNANCE_CREATED = false as const;
export const D3_CURRENTNESS_STATES = D2_CURRENTNESS_STATES;
export const D3_0_CANONICAL_CURRENTNESS_REUSED = true as const;
export const PARALLEL_D3_CURRENTNESS_ENGINE_CREATED = false as const;
export const D3_FINGERPRINT_ALGORITHM = D2_FINGERPRINT_ALGORITHM;
export const D3_0_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D3_DIGITAL_THREAD_MODULE = D2_DIGITAL_THREAD_MODULE;
export const D3_0_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const PARALLEL_D3_DIGITAL_THREAD_CREATED = false as const;
export const INFERRED_D3_DEPENDENCY_PROPAGATION_ALLOWED = false as const;
export const D3_SILENT_REPOINTING_ALLOWED = false as const;
export const D3_EXPLICIT_CHANGE_DEPENDENCIES = [
  "INVESTIGATION_EVIDENCE_TO_STRATIGRAPHY_AND_GROUNDWATER",
  "STRATIGRAPHY_OR_TEST_TO_PARAMETER_SET",
  "PARAMETER_SET_TO_FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT",
  "PARAMETER_OR_CONTEXT_TO_D1_AND_D2_INTERFACE",
] as const;

export const D3_MATURITY_STATES = D2_MATURITY_STATES;
export const D3_CREATES_PARALLEL_MATURITY_ENUM = false as const;
export const D3_AUTHORITY_ROLES = [
  "AUTHOR_DESIGNER",
  "REVIEWER",
  "APPROVER",
  "GEOTECHNICAL_ENGINEERING_AUTHORITY",
  "LIFECYCLE_AUTHORITY",
  "SOURCE_SYSTEM_AUTHORITY",
  "AI_ASSISTANT",
  "ADMINISTRATOR",
] as const;
export const AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = false as const;
export const VALIDATED_EQUALS_CONFORMANT = false as const;
export const VALIDATED_EQUALS_ENGINEERING_APPROVED = false as const;
export const VALIDATED_EQUALS_CERTIFIED = false as const;
export const D3_VALIDATION_RUNTIME_IMPLEMENTED = false as const;

export const D3_D9_SOURCE_CONTRACT_ARCHITECTURE_DEFINED = true as const;
export const D3_D9_SOURCE_CONTRACT_FIELDS = [
  "OBJECT_IDENTITY",
  "OBJECT_TYPE",
  "EXACT_REVISION",
  "LIFECYCLE",
  "CURRENTNESS",
  "PROVENANCE",
  "AUTHORITY",
  "ASSUMPTIONS",
  "REQUIREMENTS",
  "DECISIONS",
  "EVIDENCE",
  "GEOTECHNICAL_PARAMETERS",
  "INVESTIGATION_CONTEXT",
  "D1_INTERFACE_RECORDS",
  "D2_INTERFACE_RECORDS",
  "LIMITATIONS",
  "LINEAGE",
  "REVIEW_VALIDATION_STATE",
  "CANONICAL_FINGERPRINT",
] as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D3_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;

export const D3_JURISDICTION_PROFILE_IDS = EOS_JURISDICTION_PROFILE_IDS;
export const D3_ADDS_JURISDICTION_PROFILE_ID = false as const;
export const D3_CLAIMS_LEGAL_OR_REGULATORY_COMPLIANCE = false as const;

export const D3_0_RUNTIME_STARTED = false as const;
export const D3_RUNTIME_COUNT = 0 as const;
export const D3_SITE_INVESTIGATION_RUNTIME_COUNT = 0 as const;
export const D3_BOREHOLE_RUNTIME_COUNT = 0 as const;
export const D3_LAB_TEST_RUNTIME_COUNT = 0 as const;
export const D3_FIELD_TEST_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_RUNTIME_COUNT = 0 as const;
export const D3_FOUNDATION_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_BEARING_CAPACITY_RUNTIME_COUNT = 0 as const;
export const D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_STABILITY_RUNTIME_COUNT = 0 as const;
export const D3_EARTH_PRESSURE_RUNTIME_COUNT = 0 as const;
export const D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT = 0 as const;
export const D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D3_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D3_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D3_0_D4_RUNTIME_STARTED = false as const;
export const D3_0_D5_RUNTIME_STARTED = false as const;
export const D3_0_D6_RUNTIME_STARTED = false as const;
export const D3_0_D7_RUNTIME_STARTED = false as const;
export const D3_0_D8_RUNTIME_STARTED = false as const;
export const D3_0_D9_RUNTIME_STARTED = false as const;
export const D3_0_D9_RUNTIME_COUNT = 0 as const;
export const D3_0_DATABASE_SCHEMA_CHANGED = false as const;
export const D3_0_NEW_DEPENDENCY_ADDED = false as const;
export const D3_0_NEW_SUBSTANTIVE_RUNTIME_ADDED = false as const;

export const D3_PRESERVES_D1_STRUCTURAL_PACK_INCOMPLETE = true as const;
export const D3_PRESERVES_D1N_CLOSED = true as const;
export const D3_PRESERVES_D2_TRACK_COMPLETE = true as const;
export const D2_REOPENED = false as const;
export const D3_REOPENS_D2 = false as const;

export const D3_IMPLEMENTATION_PHASES = [
  "EOS-D3-R1-GEOTECHNICAL-IDENTITY-AND-OBJECT-FOUNDATION",
  "EOS-D3-R2-SITE-INVESTIGATION-AND-EVIDENCE-CONTEXT",
  "EOS-D3-R3-STRATIGRAPHY-GROUNDWATER-AND-MATERIAL-CONTEXT",
  "EOS-D3-R4-FIELD-AND-LAB-TEST-CONTEXT",
  "EOS-D3-R5-GEOTECHNICAL-PARAMETER-CONTEXT",
  "EOS-D3-R6-FOUNDATION-EXCAVATION-AND-SLOPE-CONTEXT",
  "EOS-D3-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE",
  "EOS-D3-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS",
  "EOS-D3-R9-REVIEW-AND-VALIDATION-GOVERNANCE",
  "EOS-D3-R10-CURRENTNESS-AND-DIGITAL-THREAD",
  "EOS-D3-R11-D9-SOURCE-CONTRACT",
  "EOS-D3-R12-GEOTECHNICAL-BOUNDED-CLOSEOUT",
] as const;
export const D3_IMPLEMENTATION_PHASE_TYPES = [
  "GEOTECHNICAL_IDENTITY_AND_OBJECT_FOUNDATION",
  "SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT",
  "STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT",
  "FIELD_AND_LAB_TEST_CONTEXT",
  "GEOTECHNICAL_PARAMETER_CONTEXT",
  "FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT",
  "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE",
  "DISCIPLINE_INTERFACES_AND_HANDOFFS",
  "REVIEW_AND_VALIDATION_GOVERNANCE",
  "CURRENTNESS_AND_DIGITAL_THREAD",
  "D9_SOURCE_CONTRACT",
  "GEOTECHNICAL_BOUNDED_CLOSEOUT",
] as const;
export const D3_IMPLEMENTATION_DECOMPOSITION_DEFINED = true as const;
export const D3_CANONICAL_PHASE_COUNT = D3_IMPLEMENTATION_PHASES.length;
export const D3_CANONICAL_PHASE_SEQUENCE = D3_IMPLEMENTATION_PHASES.join(", ");
export const D3_R1_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[0];
export const D3_R1_PHASE_TYPE = D3_IMPLEMENTATION_PHASE_TYPES[0];
export const D3_R1_CANONICAL_SCOPE =
  "Record one governed Geotechnical context and the object identities it owns: tenant, workspace, project, object type, explicit relationships, cited lifecycle stage, provenance, and fingerprint. Do not record boreholes, test results, stratigraphy, parameters, foundation recommendations, calculations, or start D4 through D9." as const;
export const D3_R1_STARTED = false as const;
export const D3_0_READY_FOR_NEXT_PHASE = true as const;
export const D3_0_NEXT_PHASE = D3_R1_CANONICAL_PHASE;
export const D3_0_NEXT_PHASE_TYPE = D3_R1_PHASE_TYPE;
export const D3_0_CANONICAL_NEXT_PHASE = D3_R1_CANONICAL_PHASE;
export const D3_0_CANONICAL_NEXT_PHASE_SCOPE = D3_R1_CANONICAL_SCOPE;
export const D3_0_BLOCKER = "NONE" as const;
export const D3_0_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;
