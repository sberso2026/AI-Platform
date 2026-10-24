/**
 * EOS-D2-0 Civil architecture.
 * Contracts only. No Civil object runtime, calculation, validation, approval, or certification.
 */
import { EOS_JURISDICTION_PROFILE_IDS } from "./global-governance";

export const D2_0_STATUS = "ARCHITECTURE_DEFINED" as const;
export const D2_0_PHASE = "EOS-D2-0-CIVIL-ARCHITECTURE-CANONICALIZATION" as const;
export const D2_0_PHASE_TYPE = "CIVIL_ARCHITECTURE_CANONICALIZATION" as const;
export const D2_ARCHITECTURE_PATH = "docs/architecture/engineering-os/EOS_D2_0_CIVIL_ARCHITECTURE.md" as const;
export const D2_ARCHITECTURE_DEFINED = true as const;
export const D2_ARCHITECTURE_READY = true as const;
export const D2_PARENT_SEQUENCING_PATH =
  "docs/architecture/engineering-os/EOS_D1_STRUCTURAL_PACK_COMPLETION_CRITERIA_AND_ROADMAP_SEQUENCING.md" as const;

export const D2_CANONICAL_SCOPE =
  "Bounded Civil engineering for site development, survey and spatial reference, existing and design surface context, grading, earthworks context, roads and access, pavement context, drainage and stormwater context, channels, culvert context, outfalls, Civil utility corridors, trenches, pits, manholes, crossings, clearance envelopes, and erosion and sediment-control context, together with Civil requirements, assumptions, decisions, evidence, and interfaces. No Civil calculation runtime." as const;
export const D2_CANONICAL_NON_SCOPE =
  "No earthworks quantities, geotechnical slope stability, road-design calculations, hydrology, hydraulics, Structural engineering, Geotechnical authority, Mechanical, Piping, Process, Electrical, or Instrumentation and Control engineering, D9 reasoning, validation, approval, certification, or general availability." as const;

export const D2_CIVIL_OBJECT_MODEL_DEFINED = true as const;
export const D2_CIVIL_OBJECT_CATEGORIES = [
  "SITE_AND_SPATIAL_REFERENCE",
  "SURFACE_CONTEXT",
  "GRADING_AND_EARTHWORKS",
  "ROADS_AND_ACCESS",
  "DRAINAGE_AND_STORMWATER",
  "CIVIL_UTILITY_AND_CORRIDOR",
  "EROSION_AND_SEDIMENT_CONTROL_CONTEXT",
  "CIVIL_GOVERNANCE_RECORDS",
] as const;
export const D2_CIVIL_OBJECT_TYPES = [
  "CIVIL_SITE",
  "SURVEY_SOURCE",
  "COORDINATE_REFERENCE",
  "SURFACE_REFERENCE",
  "GRADING_ZONE",
  "FINISHED_LEVEL",
  "EARTHWORKS_ZONE",
  "ROAD_ALIGNMENT",
  "ROAD_PROFILE",
  "ROAD_CORRIDOR",
  "PAVEMENT_CONTEXT",
  "DRAINAGE_CATCHMENT",
  "RAINFALL_REFERENCE",
  "DRAINAGE_NETWORK",
  "DRAINAGE_NODE",
  "DRAINAGE_LINK",
  "CHANNEL",
  "CULVERT_REFERENCE",
  "STORMWATER_OUTFALL",
  "DETENTION_REFERENCE",
  "CIVIL_UTILITY_CORRIDOR",
  "TRENCH",
  "PIT",
  "MANHOLE",
  "CROSSING",
  "CLEARANCE_ENVELOPE",
  "EROSION_CONTROL_CONTEXT",
  "CIVIL_REQUIREMENT",
  "CIVIL_ASSUMPTION",
  "CIVIL_DECISION",
  "CIVIL_EVIDENCE_REFERENCE",
  "CIVIL_INTERFACE",
  "CIVIL_STANDARD_REFERENCE",
] as const;

export const D2_SPATIAL_SURVEY_ARCHITECTURE_DEFINED = true as const;
export const D2_SPATIAL_GOVERNED_FIELDS = [
  "COORDINATE_REFERENCE_SYSTEM",
  "HORIZONTAL_DATUM",
  "VERTICAL_DATUM",
  "PROJECT_COORDINATES",
  "SITE_BOUNDARY",
  "SURVEY_SOURCE",
  "SURVEY_REVISION",
  "EXISTING_SURFACE",
  "DESIGN_SURFACE",
  "PROVENANCE",
  "CURRENTNESS",
] as const;
export const D2_FABRICATES_SURVEY_OR_TERRAIN = false as const;

export const D2_EARTHWORKS_ARCHITECTURE_DEFINED = true as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_GEOTECHNICAL_SLOPE_STABILITY_RUNTIME_COUNT = 0 as const;
export const D2_ROADS_ARCHITECTURE_DEFINED = true as const;
export const D2_ROAD_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_DRAINAGE_ARCHITECTURE_DEFINED = true as const;
export const D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_UTILITIES_ARCHITECTURE_DEFINED = true as const;
export const D2_CALCULATION_RUNTIME_COUNT = 0 as const;

export const D2_ABSORBS_D1_STRUCTURAL = false as const;
export const D2_ABSORBS_D3_GEOTECHNICAL = false as const;
export const D2_ABSORBS_D4_MECHANICAL = false as const;
export const D2_ABSORBS_D5_PIPING = false as const;
export const D2_ABSORBS_D6_PROCESS = false as const;
export const D2_ABSORBS_D7_ELECTRICAL = false as const;
export const D2_ABSORBS_D8_INSTRUMENTATION_CONTROL = false as const;
export const D2_ABSORBS_D4_D8 = false as const;
export const D2_ABSORBS_D9 = false as const;

export const D2_D1_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D2_EQUALS_D1_STRUCTURAL_AUTHORITY = false as const;
export const D1_EQUALS_D2_CIVIL_AUTHORITY = false as const;
export const D2_D1_INTERFACE_TOPICS = [
  "SITE_LEVELS",
  "GRADING_NEAR_STRUCTURES",
  "ROADS_AND_ACCESS",
  "DRAINAGE_INTERFACES",
  "CROSSINGS",
  "CIVIL_CONDITIONS_AFFECTING_STRUCTURAL_ASSETS",
] as const;

export const D2_D3_INTERFACE_ARCHITECTURE_DEFINED = true as const;
export const D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY = false as const;
export const D2_D3_INTERFACE_TOPICS = [
  "SOIL_PARAMETERS",
  "GROUNDWATER",
  "SETTLEMENT_CRITERIA",
  "EXCAVATION_AND_FILL_CRITERIA",
  "SLOPE_CRITERIA",
  "SUBGRADE_CRITERIA",
  "CIVIL_LEVELS",
  "EARTHWORKS_GEOMETRY",
  "CORRIDOR_GEOMETRY",
] as const;

export const D2_D4_D8_FUTURE_INTERFACE_REQUIREMENTS_DEFINED = true as const;
export const D2_D4_D8_FUTURE_INTERFACE_TOPICS = [
  "CORRIDOR_SPACE",
  "CROSSING_GEOMETRY",
  "CLEARANCE_ENVELOPE",
  "TRENCH_PIT_AND_MANHOLE_SPATIAL_CONTEXT",
  "DISCIPLINE_OBJECT_IDENTITY_CITATION",
] as const;
export const D2_OWNS_D4_D8_ENGINEERING_TRUTH = false as const;

export const D2_D9_SOURCE_CONTRACT_ARCHITECTURE_DEFINED = true as const;
export const D2_D9_SOURCE_CONTRACT_FIELDS = [
  "OBJECT_IDENTITY",
  "OBJECT_TYPE",
  "EXACT_REVISION",
  "CURRENTNESS",
  "AUTHORITY",
  "PROVENANCE",
  "REQUIREMENTS",
  "ASSUMPTIONS",
  "DECISIONS",
  "EVIDENCE",
  "INTERFACES",
  "SPATIAL_CONTEXT",
  "MATURITY",
  "LIMITATIONS",
  "CANONICAL_FINGERPRINT",
] as const;
export const D2_PERFORMS_MULTIDISCIPLINARY_REASONING = false as const;
export const D9_OWNS_FUTURE_CROSS_DISCIPLINE_INTELLIGENCE = true as const;

export const D2_REQUIREMENTS_GOVERNANCE_DEFINED = true as const;
export const D2_REQUIREMENT_FIELDS = ["SOURCE", "APPLICABILITY", "VERSION", "AUTHORITY", "CURRENTNESS"] as const;
export const D2_ASSUMPTION_GOVERNANCE_DEFINED = true as const;
export const AI_CAN_INVENT_AUTHORITATIVE_CIVIL_ASSUMPTION = false as const;
export const D2_DECISION_GOVERNANCE_DEFINED = true as const;
export const D2_AI_RECOMMENDATION_EQUALS_AUTHORITATIVE_DECISION = false as const;
export const D2_EVIDENCE_GOVERNANCE_DEFINED = true as const;
export const CIVIL_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;

export const D2_AUTHORITY_MODEL_DEFINED = true as const;
export const D2_AUTHORITY_ROLES = [
  "AUTHOR_DESIGNER",
  "REVIEWER",
  "APPROVER",
  "CIVIL_ENGINEERING_AUTHORITY",
  "LIFECYCLE_AUTHORITY",
  "SOURCE_SYSTEM_AUTHORITY",
  "AI_ASSISTANT",
  "ADMINISTRATOR",
] as const;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;

export const D2_HUMAN_OVERSIGHT_MODEL_DEFINED = true as const;
export const D2_HUMAN_OVERSIGHT_CLASSES = [
  "AI_ASSISTANCE",
  "ENGINEERING_RECOMMENDATION",
  "ENGINEER_REVIEW",
  "VALIDATION",
  "APPROVAL",
  "CONFORMANCE",
  "CERTIFICATION",
] as const;

export const D2_MATURITY_MODEL_DEFINED = true as const;
export const D2_MATURITY_STATES = ["CONCEPT", "PREFEASIBILITY", "FEASIBILITY", "FEED", "DETAILED_DESIGN"] as const;
export const D2_CREATES_PARALLEL_MATURITY_ENUM = false as const;
export const MATURITY_STAGE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const MATURITY_STAGE_EQUALS_ENGINEERING_APPROVED = false as const;
export const MATURITY_STAGE_EQUALS_CERTIFIED = false as const;

export const D2_CURRENTNESS_STATES = ["CURRENT", "STALE", "REASSESSMENT_REQUIRED", "SUPERSEDED"] as const;
export const CANONICAL_CURRENTNESS_REUSED = true as const;
export const PARALLEL_D2_CURRENTNESS_ENGINE_CREATED = false as const;
export const D2_FINGERPRINT_ALGORITHM = "fingerprintCanonical" as const;
export const D2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_DIGITAL_THREAD_MODULE = "packages/engineering-os/src/digital-thread" as const;
export const D2_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const PARALLEL_D2_DIGITAL_THREAD_CREATED = false as const;
export const INFERRED_D2_DEPENDENCY_PROPAGATION_ALLOWED = false as const;
export const D2_SILENT_REPOINTING_ALLOWED = false as const;
export const D2_EXPLICIT_CHANGE_DEPENDENCIES = [
  "SURVEY_SOURCE_TO_SURFACE_REFERENCE",
  "SURFACE_REFERENCE_TO_GRADING_AND_EARTHWORKS",
  "GRADING_OR_FINISHED_LEVEL_TO_ROAD_DRAINAGE_AND_INTERFACE",
  "ROAD_CORRIDOR_TO_DRAINAGE_UTILITY_AND_D1_INTERFACE",
] as const;

export const D2_JURISDICTION_PROFILE_IDS = EOS_JURISDICTION_PROFILE_IDS;
export const D2_JURISDICTION_STANDARDS_EXTENSIBILITY_DEFINED = true as const;
export const D2_ADDS_JURISDICTION_PROFILE_ID = false as const;
export const D2_CLAIMS_LEGAL_OR_REGULATORY_COMPLIANCE = false as const;
export const D2_STANDARD_REFERENCE_FIELDS = [
  "STANDARD_IDENTITY",
  "EDITION",
  "JURISDICTION_PROFILE",
  "APPLICABILITY",
  "PROJECT_ADOPTION",
  "DEPARTURE",
  "PROVENANCE",
  "HUMAN_ENGINEERING_CONFIRMATION",
] as const;

export const D2_RUNTIME_STARTED = false as const;
export const D2_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_OBJECT_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D2_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D2_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D3_RUNTIME_STARTED = false as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D2_0_D9_RUNTIME_STARTED = false as const;
export const D2_0_D9_RUNTIME_COUNT = 0 as const;
export const D9_READY = false as const;
export const D3_D9_RUNTIME_STARTED = false as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const NEW_SUBSTANTIVE_RUNTIME_ADDED = false as const;

export const D2_PRESERVES_D1_STRUCTURAL_PACK_INCOMPLETE = true as const;
export const D2_PRESERVES_D1N_CLOSED = true as const;
export const D2_REMEDIATES_D1_DEBT = false as const;

export const D2_IMPLEMENTATION_PHASES = [
  "EOS-D2-R1-CIVIL-IDENTITY-AND-OBJECT-FOUNDATION",
  "EOS-D2-R2-SURVEY-SPATIAL-AND-SURFACE-CONTEXT",
  "EOS-D2-R3-GRADING-AND-EARTHWORKS-CONTEXT",
  "EOS-D2-R4-ROADS-AND-ACCESS-CONTEXT",
  "EOS-D2-R5-DRAINAGE-AND-STORMWATER-CONTEXT",
  "EOS-D2-R6-CIVIL-UTILITY-AND-CORRIDOR-CONTEXT",
  "EOS-D2-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE",
  "EOS-D2-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS",
  "EOS-D2-R9-REVIEW-AND-VALIDATION-GOVERNANCE",
  "EOS-D2-R10-CURRENTNESS-AND-DIGITAL-THREAD",
  "EOS-D2-R11-D9-SOURCE-CONTRACT",
  "EOS-D2-R12-CIVIL-BOUNDED-CLOSEOUT",
] as const;
export const D2_IMPLEMENTATION_DECOMPOSITION_DEFINED = true as const;
export const D2_IMPLEMENTATION_PHASE_COUNT = D2_IMPLEMENTATION_PHASES.length;
export const D2_R1_CANONICAL_PHASE = "EOS-D2-R1-CIVIL-IDENTITY-AND-OBJECT-FOUNDATION" as const;
export const D2_R1_PHASE_TYPE = "CIVIL_IDENTITY_AND_OBJECT_FOUNDATION" as const;
export const D2_R1_CANONICAL_SCOPE =
  "Record one governed Civil context and the object identities it owns: tenant, workspace, project, object type, explicit relationships, cited lifecycle stage, provenance, and fingerprint. Do not record survey observations, surfaces, grading, roads, drainage, utility geometry, quantities, or calculations, and do not start D3 through D9." as const;
export const D2_R1_STARTED = false as const;
export const D2_0_READY_FOR_NEXT_PHASE = true as const;
export const D2_0_NEXT_PHASE = D2_R1_CANONICAL_PHASE;
export const D2_0_NEXT_PHASE_TYPE = D2_R1_PHASE_TYPE;
export const D2_0_CANONICAL_NEXT_PHASE = D2_R1_CANONICAL_PHASE;
export const D2_0_CANONICAL_NEXT_PHASE_SCOPE = D2_R1_CANONICAL_SCOPE;
export const D2_0_BLOCKER = "NONE" as const;
export const D2_0_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
