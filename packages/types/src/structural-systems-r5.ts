/**
 * EOS-D1F-R5 structural support and foundation interface contracts.
 * The interface records identity and reaction context. It does not design a foundation.
 */

export const EOS_D1F_R5_PHASE = "EOS-D1F-R5-FOUNDATION-SUPPORT-INTERFACE-FOUNDATION" as const;
export const D1F_R5_MATURITY_STATE = "FOUNDATION_SUPPORT_INTERFACE_RUNTIME_FOUNDATION_IMPLEMENTED" as const;
export const D1F_R5_FOUNDATION_INTERFACE_RUNTIME_COUNT = 1 as const;
export const D1F_R5_SUPPORT_REACTION_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D1F_R5_FOUNDATION_DESIGN_METHOD_COUNT = 0 as const;
export const D1F_R5_GEOTECHNICAL_DESIGN_METHOD_COUNT = 0 as const;
export const D1F_R5_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const STRUCTURAL_SUPPORT_EQUALS_FOUNDATION = false as const;
export const SUPPORT_REACTION_EQUALS_FOUNDATION_DESIGN_DEMAND = false as const;
export const FOUNDATION_IDENTITY_EQUALS_FOUNDATION_ADEQUACY = false as const;
export const GEOTECHNICAL_INPUT_EQUALS_GEOTECHNICAL_ACCEPTANCE = false as const;
export const D1F_R5_AUTOMATIC_REACTION_AGGREGATION = false as const;
export const D1F_R5_AUTOMATIC_FOUNDATION_ENVELOPE = false as const;
export const D1F_R5_GENERIC_MAX_ABS_FOUNDATION_DEMAND = false as const;
export const D1F_R5_SYNTHETIC_CROSS_COMBINATION_FOUNDATION_ACTION = false as const;
export const D1F_R5_R3_STEEL_DISPATCH_DEBT_PRESERVED = true as const;
export const D1F_R5_STEEL_BREADTH_SILENTLY_EXPANDED = false as const;
export const D1F_R5_R3_STEEL_DISPATCH_CURRENT_SCOPE = "D1D_EU_TENSION only. R3 does not dispatch general AU, EU, or US steel member checks." as const;
export const D1F_R5_R1_SUPPORT_IDENTITY_REUSED = true as const;
export const PARALLEL_STRUCTURAL_SUPPORT_MODEL_CREATED = false as const;
export const PARALLEL_SUPPORT_DOMAIN_CREATED = false as const;
export const PARALLEL_FOUNDATION_ACTION_MODEL_CREATED = false as const;
export const D1F_R5_FOUNDATION_AUTHORITY_REQUIRED = true as const;
export const UNCONFIRMED_FOUNDATION_CAN_GOVERN = false as const;
export const AI_FOUNDATION_AUTHORITY = false as const;
export const D1F_R5_FOUNDATION_TYPE_INFERRED_BY_LLM = false as const;
export const D1F_R5_FOUNDATION_TYPE_INFERRED_FROM_REACTION_PATTERN = false as const;
export const D1F_R5_FOUNDATION_TYPE_INFERRED_FROM_MEMBER_TYPE = false as const;
export const D1F_R5_FOUNDATION_TYPE_INFERRED_FROM_GEOMETRY_ONLY = false as const;
export const D1F_R5_FOUNDATION_FAMILY_DEFINES_CAPACITY = false as const;
export const D1F_R5_FOUNDATION_FAMILY_DEFINES_DIMENSIONS = false as const;
export const D1F_R5_FOUNDATION_FAMILY_DEFINES_REINFORCEMENT = false as const;
export const D1F_R5_FOUNDATION_FAMILY_DEFINES_SOIL_MODEL = false as const;
export const D1F_R5_ONE_SUPPORT_EQUALS_ONE_FOUNDATION_ASSUMED = false as const;
export const D1F_R5_SUPPORT_FOUNDATION_MAPPING_AUTHORITY_REQUIRED = true as const;
export const AI_SUPPORT_FOUNDATION_MAPPING_CAN_GOVERN = false as const;
export const D1F_R5_GOVERNED_REACTION_SOURCE_REQUIRED = true as const;
export const D1F_R5_RAW_UNNORMALIZED_PROVIDER_REACTION_ALLOWED = false as const;
export const D1F_R5_UNVERIFIED_REACTION_CAN_GOVERN = false as const;
export const D1F_R5_STALE_REACTION_CAN_GOVERN = false as const;
export const D1F_R5_NONCONVERGED_REACTION_CAN_GOVERN = false as const;
export const D1F_R5_FAILED_ANALYSIS_REACTION_CAN_GOVERN = false as const;
export const D1F_R5_MODEL_VALIDATION_REFERENCE_REQUIRED = true as const;
export const MISSING_MODEL_VALIDATION_REFERENCE_CAN_CREATE_GOVERNED_FOUNDATION_CONTEXT = false as const;
export const D1F_R5_ABSENT_REACTION_COMPONENT_EQUALS_ZERO = false as const;
export const D1F_R5_MISSING_REACTION_COMPONENT_INVENTED_AS_ZERO = false as const;
export const D1F_R5_EXPLICIT_ZERO_REACTION_PRESERVED = true as const;
export const D1F_R5_CASE_COMBINATION_IDENTITY_PRESERVED = true as const;
export const D1F_R5_CROSS_COMBINATION_REACTION_SYNTHESIS = false as const;
export const D1F_R5_MAX_FX_AUTOMATICALLY_GOVERNS = false as const;
export const D1F_R5_MAX_FY_AUTOMATICALLY_GOVERNS = false as const;
export const D1F_R5_MAX_FZ_AUTOMATICALLY_GOVERNS = false as const;
export const D1F_R5_MAX_MX_AUTOMATICALLY_GOVERNS = false as const;
export const D1F_R5_MAX_MY_AUTOMATICALLY_GOVERNS = false as const;
export const D1F_R5_MAX_MZ_AUTOMATICALLY_GOVERNS = false as const;
export const D1F_R5_REACTION_LOCATION_REQUIRED = true as const;
export const MISSING_REACTION_LOCATION_CAN_GOVERN = false as const;
export const D1F_R5_FOUNDATION_ECCENTRICITY_ROUTE = "DEFERRED" as const;
export const D1F_R5_ECCENTRICITY_INFERRED = false as const;
export const D1F_R5_FOUNDATION_LOCAL_AXIS_INFERRED = false as const;
export const AI_FOUNDATION_AXIS_AUTHORITY = false as const;
export const D1F_R5_R2_COORDINATE_NORMALIZATION_REUSED = true as const;
export const PARALLEL_FOUNDATION_TRANSFORM_ENGINE_CREATED = false as const;
export const D1F_R5_SIGN_TRANSFORM_TRACEABLE = true as const;
export const D1F_R5_DOUBLE_SIGN_TRANSFORM_ALLOWED = false as const;
export const D1F_R5_SUPPORT_RESTRAINT_DEFINES_FOUNDATION_TYPE = false as const;
export const D1F_R5_SUPPORT_RESTRAINT_DEFINES_FOUNDATION_STIFFNESS = false as const;
export const D1F_R5_STRUCTURAL_SPRING_EQUALS_SOIL_STIFFNESS = false as const;
export const D1F_R5_SOIL_PARAMETER_CALCULATION_IMPLEMENTED = false as const;
export const D1F_R5_SOIL_PARAMETER_INFERENCE_IMPLEMENTED = false as const;
export const AI_SOIL_PARAMETER_AUTHORITY = false as const;
export const D1F_R5_GEOTECHNICAL_INPUT_AUTHORITY_REQUIRED = true as const;
export const UNCONFIRMED_GEOTECHNICAL_INPUT_CAN_GOVERN = false as const;
export const D1F_R5_D3_GEOTECHNICAL_RUNTIME_IMPLEMENTED = false as const;
export const D1F_R5_BEARING_CAPACITY_IMPLEMENTED = false as const;
export const D1F_R5_SETTLEMENT_IMPLEMENTED = false as const;
export const D1F_R5_SLOPE_STABILITY_IMPLEMENTED = false as const;
export const D1F_R5_PILE_CAPACITY_IMPLEMENTED = false as const;
export const D1F_R5_FOUNDATION_INPUT_CONTEXT_EQUALS_DESIGN_RESULT = false as const;
export const D1F_R5_FOUNDATION_INPUT_CONTEXT_EQUALS_FOUNDATION_PASS = false as const;
export const D1F_R5_ISOLATED_FOOTING_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_COMBINED_FOOTING_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_STRIP_FOOTING_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_RAFT_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_PILE_AXIAL_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_PILE_LATERAL_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_PILE_GROUP_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_PILE_CAP_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_FOUNDATION_SLIDING_CHECK_IMPLEMENTED = false as const;
export const D1F_R5_FOUNDATION_OVERTURNING_CHECK_IMPLEMENTED = false as const;
export const D1F_R5_FOUNDATION_UPLIFT_CHECK_IMPLEMENTED = false as const;
export const D1F_R5_FOUNDATION_BENDING_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_FOUNDATION_ONE_WAY_SHEAR_IMPLEMENTED = false as const;
export const D1F_R5_FOUNDATION_PUNCHING_IMPLEMENTED = false as const;
export const D1F_R5_FOUNDATION_REINFORCEMENT_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_BASE_PLATE_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_ANCHOR_DESIGN_IMPLEMENTED = false as const;
export const D1F_R5_SOIL_STRUCTURE_INTERACTION_IMPLEMENTED = false as const;
export const D1F_R5_FOUNDATION_STIFFNESS_DERIVED_FROM_SOIL = false as const;
export const D1F_R5_INTERFACE_COMPLETE_EQUALS_FOUNDATION_DESIGN_COMPLETE = false as const;
export const D1F_R5_INTERFACE_COMPLETE_EQUALS_FOUNDATION_PASS = false as const;
export const D1F_R5_INTERFACE_COMPLETE_EQUALS_FOUNDATION_ADEQUATE = false as const;
export const D1F_R5_MEMBER_PASS_CAN_HIDE_REQUIRED_FOUNDATION_GAP = false as const;
export const D1F_R5_CONNECTION_INTERFACE_COMPLETE_CAN_HIDE_FOUNDATION_GAP = false as const;
export const D1F_R5_R3_HISTORICAL_RESULTS_REWRITTEN = false as const;
export const D1F_R5_R4_HISTORICAL_RESULTS_REWRITTEN = false as const;
export const D1F_R5_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1F_R5_FOUNDATION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1F_R5_REACTION_CONTEXT_FINGERPRINT_IMPLEMENTED = true as const;
export const D1F_R5_FOUNDATION_INTERFACE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1F_R5_FINGERPRINT_ORDER_INDEPENDENT = true as const;
export const D1F_R5_INVALIDATION_IMPLEMENTED = true as const;
export const STALE_FOUNDATION_INTERFACE_CAN_BE_CURRENT = false as const;
export const STALE_SUPPORT_REACTION_CONTEXT_CAN_GOVERN = false as const;
export const D1F_R5_HISTORICAL_FOUNDATION_INTERFACE_REPRODUCIBLE = true as const;
export const D1F_R5_HISTORICAL_REACTION_CONTEXT_REPRODUCIBLE = true as const;
export const NEW_FOUNDATION_INTERFACE_OVERWRITES_OLD_RESULT = false as const;
export const D1F_R5_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1F_R5_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const AI_D1F_R5_ASSISTANCE_ADVISORY_ONLY = true as const;
export const D1F_R5_SUPPORT_REACTIONS_ASSUMED_CORRECT_FROM_PROVIDER = false as const;
export const D1F_R5_EQUILIBRIUM_DIAGNOSTIC_ROUTE = "DEFERRED_NON_GOVERNING_DIAGNOSTIC" as const;
export const D1F_R5_EQUILIBRIUM_DIAGNOSTIC_EQUALS_FOUNDATION_DEMAND = false as const;
export const D1F_R5_MULTI_SUPPORT_REACTIONS_PRESERVED = true as const;
export const D1F_R5_MULTI_SUPPORT_REACTIONS_AUTOMATICALLY_SUMMED = false as const;
export const D1F_R5_MULTI_SUPPORT_AGGREGATION_ROUTE = "DEFER_TO_FUTURE_FOUNDATION_DESIGN_ORCHESTRATION" as const;
export const D1F_R5_MOMENT_TRANSPORT_BETWEEN_POINTS_AUTOMATIC = false as const;
export const D1F_R5_GEOTECHNICAL_VALUE_LOCATION_APPLICABILITY_REQUIRED = true as const;
export const D1F_R5_SITE_WIDE_SOIL_VALUE_ASSUMED = false as const;
export const D1F_R5_FOUNDATION_PROFILE_EXPLICIT = true as const;
export const D1F_R5_FOUNDATION_JURISDICTION_INFERRED_FROM_LOCATION = false as const;
export const D1F_R5_GEOTECHNICAL_STANDARD_SELECTED_BY_AI = false as const;
export const D1F_R5_DEBT_LEDGER_UPDATED = true as const;
export const D1F_R6_HANDOFF_READY = true as const;
export const CROSS_PROJECT_SUPPORT_FOUNDATION_MAPPING_ALLOWED = false as const;
export const CROSS_PROJECT_REACTION_CONTEXT_ALLOWED = false as const;
export const CROSS_PROJECT_GEOTECHNICAL_REFERENCE_ALLOWED = false as const;
export const FOUNDATION_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const GEOTECHNICAL_REFERENCE_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;

export const D1F_R5_FOUNDATION_ENTITY_KINDS = [
  "STRUCTURAL_SUPPORT",
  "ANALYTICAL_SUPPORT_OR_RESTRAINT",
  "SUPPORT_REACTION_SOURCE",
  "BASE_OR_SUPPORT_CONNECTION",
  "PHYSICAL_FOUNDATION",
  "DESIGN_FOUNDATION",
  "GEOTECHNICAL_CONTEXT",
  "FOUNDATION_INTERFACE_RESULT",
] as const;
export const D1F_R5_FOUNDATION_FAMILIES = [
  "ISOLATED_FOOTING",
  "STRIP_FOOTING",
  "COMBINED_FOOTING",
  "RAFT_OR_MAT",
  "PILE_CAP",
  "PILE_FOUNDATION",
  "PEDESTAL",
  "GROUND_BEAM_INTERFACE",
  "OTHER",
] as const;
export const D1F_R5_REACTION_COMPONENTS = ["FX", "FY", "FZ", "MX", "MY", "MZ"] as const;
export const D1F_R5_COORDINATE_KINDS = ["GLOBAL", "SYSTEM", "SUPPORT_LOCAL", "FOUNDATION_LOCAL", "ANALYSIS_PROVIDER_LOCAL"] as const;
export const D1F_R5_FOUNDATION_SCOPE_STATES = [
  "FOUNDATION_NOT_IN_DECLARED_SCOPE",
  "FOUNDATION_REQUIRED_NOT_EVALUATED",
  "FOUNDATION_INTERFACE_COMPLETE",
  "FOUNDATION_DESIGN_UNAVAILABLE",
  "FOUNDATION_RESULT_AVAILABLE",
] as const;
export const D1F_R5_FOUNDATION_INTERFACE_COMPLETENESS_STATES = [
  "FOUNDATION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE",
  "FOUNDATION_INTERFACE_INCOMPLETE",
  "FOUNDATION_INTERFACE_INVALID",
  "FOUNDATION_INTERFACE_UNDETERMINED",
  "FOUNDATION_INTERFACE_STALE",
] as const;
export const D1F_R5_EVENT_TYPES = [
  "FOUNDATION_IDENTITY_CREATED",
  "FOUNDATION_MAPPING_CHANGED",
  "SUPPORT_REACTION_CONTEXT_CREATED",
  "SUPPORT_REACTION_CONTEXT_INVALIDATED",
  "GEOTECHNICAL_REFERENCE_CHANGED",
  "FOUNDATION_INTERFACE_EVALUATED",
  "FOUNDATION_INTERFACE_INVALIDATED",
] as const;
export const D1F_R5_DEBT_ITEMS = [
  "NO_STRUCTURAL_SOLVER",
  "NO_EXTERNAL_SOLVER_CONNECTOR",
  "R3_STEEL_DISPATCH_D1D_EU_TENSION_ONLY",
  "NO_GENERIC_STEEL_SYSTEM_ORCHESTRATION",
  "NO_CONNECTION_DESIGN",
  "NO_FOUNDATION_DESIGN",
  "NO_GEOTECHNICAL_DESIGN",
  "NO_AUTOMATED_ANALYSIS_MODEL_VALIDATION",
  "NO_AUTOMATIC_GOVERNING_ACTION_SELECTION",
  "NO_AUTOMATIC_ENVELOPE_ENGINE",
  "NO_COMPLETE_LOAD_PATH_VERIFICATION",
  "CONCRETE_C10_HUMAN_REVIEW_PENDING",
  "D1F_SYSTEM_ORCHESTRATOR_ENGINEER_REVIEW_PENDING",
  "GA_SECURITY_DEBT_REMAINS",
] as const;

export const D1F_R5_FOUNDATION_ENTITY_MODEL = D1F_R5_FOUNDATION_ENTITY_KINDS;
export const D1F_R5_FOUNDATION_FAMILY_TAXONOMY = D1F_R5_FOUNDATION_FAMILIES;
export const D1F_R5_FOUNDATION_IDENTITY_CONTRACT =
  "A foundation identity records its id, structural system, project, support refs, base-connection refs, location, explicit classification, profile, authority, provenance, status, version, and fingerprint." as const;
export const D1F_R5_SUPPORT_FOUNDATION_MAPPING_CONTRACT =
  "A mapping relates R1 supports and R4 base connections to a foundation identity with cardinality ONE_TO_ONE, ONE_TO_MANY, or MANY_TO_ONE and explicit authority." as const;
export const D1F_R5_SUPPORT_REACTION_CONTEXT_CONTRACT =
  "A support-reaction context records support, foundation, connection, model, run, result set, reaction ids, cases, location, coordinates, signs, authority, provenance, status, and fingerprint." as const;
export const D1F_R5_REACTION_COMPONENT_CONTRACT = D1F_R5_REACTION_COMPONENTS;
export const D1F_R5_GOVERNED_REACTION_ENVELOPE_INPUT_CONTRACT =
  "A governed envelope, when supplied, keeps source reaction ids, selection rule, cases, quantity, location, governing state, authority, provenance, and fingerprint. R5 does not create one." as const;
export const D1F_R5_FOUNDATION_REFERENCE_LOCATION_CONTRACT =
  "A foundation identity carries an explicit reference location and coordinate system. Eccentricity is deferred." as const;
export const D1F_R5_FOUNDATION_COORDINATE_CONTRACT = D1F_R5_COORDINATE_KINDS;
export const D1F_R5_GEOTECHNICAL_INTERFACE_CONTRACT =
  "A geotechnical interface may reference a ground model, investigation, design report, parameter set, groundwater context, bearing recommendation, settlement assessment, pile recommendation, and site context, with authority, provenance, status, and fingerprint." as const;
export const D1F_R5_FOUNDATION_DESIGN_INPUT_CONTEXT =
  "A design-input context references foundation identity, reaction context, profile, explicit geometry and material refs, geotechnical refs, and design requirements. It is not a design result." as const;
export const D1F_R5_FOUNDATION_DESIGN_AVAILABILITY_CONTRACT = "FOUNDATION_DESIGN_NOT_IMPLEMENTED and GEOTECHNICAL_DESIGN_NOT_IMPLEMENTED" as const;
export const D1F_R5_FOUNDATION_SCOPE_STATE_CONTRACT = D1F_R5_FOUNDATION_SCOPE_STATES;
export const D1F_R5_FOUNDATION_INTERFACE_RESULT_CONTRACT =
  "A foundation interface result records foundation, supports, connections, reaction contexts, geotechnical refs, profile, authority, findings, completeness, design availability, provenance, and fingerprint." as const;
export const D1F_R5_GEOTECHNICAL_RECOMMENDATION_REFERENCE_CONTRACT =
  "A recommendation reference keeps source, authority, units, applicability, location or depth, and version. The value is not calculated here." as const;
export const D1F_R6_REQUIRED_R5_CONTRACTS = [
  "structuralSystemIdentity",
  "topologyFingerprint",
  "analysisModelRunResultBindings",
  "systemEvaluationPlan",
  "memberEvaluationResults",
  "connectionInterface",
  "forceTransferContext",
  "foundationIdentity",
  "supportReactionContext",
  "geotechnicalInterfaceRefs",
  "provenance",
  "fingerprints",
  "invalidation",
  "maturityStates",
] as const;

export type D1fR5FoundationFamily = (typeof D1F_R5_FOUNDATION_FAMILIES)[number];
export type D1fR5Completeness = (typeof D1F_R5_FOUNDATION_INTERFACE_COMPLETENESS_STATES)[number];
export type D1fR5ScopeState = (typeof D1F_R5_FOUNDATION_SCOPE_STATES)[number];
