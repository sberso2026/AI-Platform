/**
 * EOS-D1F-R4 connection and joint interface contracts.
 * The interface records identity and force-transfer context. It does not design a connection.
 */

export const EOS_D1F_R4_PHASE = "EOS-D1F-R4-CONNECTION-JOINT-INTERFACE-FOUNDATION" as const;
export const D1F_R4_MATURITY_STATE = "CONNECTION_JOINT_INTERFACE_RUNTIME_FOUNDATION_IMPLEMENTED" as const;
export const D1F_R4_CONNECTION_INTERFACE_RUNTIME_COUNT = 1 as const;
export const D1F_R4_FORCE_TRANSFER_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D1F_R4_CONNECTION_DESIGN_METHOD_COUNT = 0 as const;
export const D1F_R4_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const PHYSICAL_CONNECTION_EQUALS_ANALYTICAL_JOINT = false as const;
export const ANALYTICAL_JOINT_EQUALS_DESIGN_CONNECTION = false as const;
export const MEMBER_END_ACTION_EQUALS_CONNECTION_DESIGN_DEMAND = false as const;
export const CONNECTION_RECORD_EQUALS_CONNECTION_ADEQUACY = false as const;
export const D1F_R4_AUTOMATIC_CONNECTION_FORCE_AGGREGATION = false as const;
export const D1F_R4_AUTOMATIC_CONNECTION_ENVELOPE = false as const;
export const D1F_R4_GENERIC_MAX_ABS_CONNECTION_DEMAND = false as const;
export const D1F_R4_SYNTHETIC_CROSS_COMBINATION_CONNECTION_ACTION = false as const;
export const D1F_R4_CONNECTION_AUTHORITY_REQUIRED = true as const;
export const UNCONFIRMED_CONNECTION_CAN_GOVERN = false as const;
export const AI_CONNECTION_AUTHORITY = false as const;
export const D1F_R4_GEOMETRIC_PROXIMITY_CREATES_GOVERNED_CONNECTION = false as const;
export const D1F_R4_BIM_TOUCHING_ELEMENTS_CREATE_GOVERNED_CONNECTION = false as const;
export const D1F_R4_AI_VISUAL_INFERENCE_CREATES_GOVERNED_CONNECTION = false as const;
export const D1F_R4_CONNECTION_TYPE_INFERRED_BY_LLM = false as const;
export const D1F_R4_CONNECTION_TYPE_INFERRED_FROM_MEMBER_GEOMETRY = false as const;
export const D1F_R4_CONNECTION_TYPE_INFERRED_FROM_FORCE_PATTERN = false as const;
export const D1F_R4_MEMBER_END_ORIENTATION_EXPLICIT = true as const;
export const D1F_R4_MEMBER_END_ORIENTATION_GUESSED = false as const;
export const D1F_R4_MULTI_MEMBER_JOINT_SUPPORTED = true as const;
export const D1F_R4_R2_ACTION_BINDING_REQUIRED = true as const;
export const D1F_R4_RAW_UNNORMALIZED_PROVIDER_FORCE_ALLOWED = false as const;
export const D1F_R4_UNVERIFIED_RESULT_CAN_GOVERN = false as const;
export const D1F_R4_STALE_RESULT_CAN_GOVERN = false as const;
export const D1F_R4_NONCONVERGED_RESULT_CAN_GOVERN = false as const;
export const D1F_R4_FAILED_ANALYSIS_RESULT_CAN_GOVERN = false as const;
export const D1F_R4_MODEL_VALIDATION_REFERENCE_REQUIRED = true as const;
export const D1F_R4_CASE_COMBINATION_IDENTITY_PRESERVED = true as const;
export const D1F_R4_CROSS_COMBINATION_FORCE_SYNTHESIS = false as const;
export const D1F_R4_ABSENT_END_ACTION_EQUALS_ZERO = false as const;
export const D1F_R4_MISSING_COMPONENT_INVENTED_AS_ZERO = false as const;
export const D1F_R4_EXPLICIT_ZERO_PRESERVED = true as const;
export const D1F_R4_CONNECTION_LOCAL_AXIS_INFERRED = false as const;
export const AI_CONNECTION_AXIS_AUTHORITY = false as const;
export const D1F_R4_R2_COORDINATE_NORMALIZATION_REUSED = true as const;
export const PARALLEL_CONNECTION_TRANSFORM_ENGINE_CREATED = false as const;
export const D1F_R4_SIGN_TRANSFORM_TRACEABLE = true as const;
export const D1F_R4_DOUBLE_SIGN_TRANSFORM_ALLOWED = false as const;
export const D1F_R4_MEMBER_END_ACTIONS_ASSUMED_IN_EQUILIBRIUM = false as const;
export const D1F_R4_EQUILIBRIUM_DIAGNOSTIC_ROUTE = "DEFERRED_NON_GOVERNING_DIAGNOSTIC" as const;
export const D1F_R4_EQUILIBRIUM_DIAGNOSTIC_EQUALS_DESIGN_DEMAND = false as const;
export const D1F_R4_FORCE_TRANSFER_PATH_INFERRED_BY_AI = false as const;
export const D1F_R4_FORCE_TRANSFER_PATH_INFERRED_FROM_CONNECTION_TYPE = false as const;
export const D1F_R4_R1_MEMBER_RELEASES_REUSED = true as const;
export const D1F_R4_CONNECTION_TYPE_IMPLIES_RELEASE = false as const;
export const D1F_R4_RELEASE_IMPLIES_CONNECTION_TYPE = false as const;
export const D1F_R4_ONE_TO_ONE_CONNECTION_JOINT_MAPPING_ASSUMED = false as const;
export const D1F_R4_CONNECTION_JOINT_MAPPING_AUTHORITY_REQUIRED = true as const;
export const AI_CONNECTION_JOINT_MAPPING_CAN_GOVERN = false as const;
export const D1F_R4_CONNECTION_FAMILY_DEFINES_STIFFNESS = false as const;
export const D1F_R4_CONNECTION_FAMILY_DEFINES_RELEASE = false as const;
export const D1F_R4_CONNECTION_FAMILY_DEFINES_CAPACITY = false as const;
export const D1F_R4_BOLT_RESISTANCE_IMPLEMENTED = false as const;
export const D1F_R4_WELD_RESISTANCE_IMPLEMENTED = false as const;
export const D1F_R4_PLATE_RESISTANCE_IMPLEMENTED = false as const;
export const D1F_R4_BLOCK_SHEAR_IMPLEMENTED = false as const;
export const D1F_R4_BEARING_CHECK_IMPLEMENTED = false as const;
export const D1F_R4_PRYING_IMPLEMENTED = false as const;
export const D1F_R4_STEEL_CONNECTION_INTERACTION_IMPLEMENTED = false as const;
export const D1F_R4_BASE_PLATE_DESIGN_IMPLEMENTED = false as const;
export const D1F_R4_ANCHOR_BOLT_DESIGN_IMPLEMENTED = false as const;
export const D1F_R4_CONCRETE_BEARING_DESIGN_IMPLEMENTED = false as const;
export const D1F_R4_BEAM_COLUMN_JOINT_DESIGN_IMPLEMENTED = false as const;
export const D1F_R4_JOINT_SHEAR_DESIGN_IMPLEMENTED = false as const;
export const D1F_R4_CONFINEMENT_DESIGN_IMPLEMENTED = false as const;
export const D1F_R4_SEISMIC_JOINT_DETAILING_IMPLEMENTED = false as const;
export const D1F_R4_SUPPORT_RESTRAINT_EQUALS_CONNECTION_CAPACITY = false as const;
export const D1F_R4_MEMBER_PASS_CAN_HIDE_REQUIRED_CONNECTION_GAP = false as const;
export const D1F_R4_R3_HISTORICAL_RESULTS_REWRITTEN = false as const;
export const D1F_R4_INTERFACE_COMPLETE_EQUALS_CONNECTION_DESIGN_COMPLETE = false as const;
export const D1F_R4_INTERFACE_COMPLETE_EQUALS_CONNECTION_PASS = false as const;
export const D1F_R4_INTERFACE_COMPLETE_EQUALS_CONNECTION_ADEQUATE = false as const;
export const D1F_R4_CONNECTION_DESIGN_AVAILABILITY_EXPLICIT = true as const;
export const D1F_R4_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1F_R4_CONNECTION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1F_R4_FORCE_TRANSFER_FINGERPRINT_IMPLEMENTED = true as const;
export const D1F_R4_FINGERPRINT_ORDER_INDEPENDENT = true as const;
export const D1F_R4_INVALIDATION_IMPLEMENTED = true as const;
export const STALE_CONNECTION_INTERFACE_CAN_BE_CURRENT = false as const;
export const STALE_FORCE_TRANSFER_CONTEXT_CAN_GOVERN = false as const;
export const D1F_R4_HISTORICAL_CONNECTION_INTERFACE_REPRODUCIBLE = true as const;
export const D1F_R4_HISTORICAL_FORCE_TRANSFER_CONTEXT_REPRODUCIBLE = true as const;
export const NEW_CONNECTION_INTERFACE_OVERWRITES_OLD_RESULT = false as const;
export const D1F_R4_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1F_R4_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const AI_D1F_R4_ASSISTANCE_ADVISORY_ONLY = true as const;
export const D1F_R4_FOUNDATION_DESIGN_IMPLEMENTED = false as const;
export const D1F_R4_GEOTECHNICAL_RUNTIME_IMPLEMENTED = false as const;
export const D1F_R4_SOIL_PARAMETER_INFERENCE = false as const;
export const D1F_R4_R3_STEEL_DISPATCH_BREADTH_RECORDED = true as const;
export const D1F_R4_R3_STEEL_DISPATCH_OVERSTATED = false as const;
export const D1F_R4_R3_STEEL_DISPATCH_CURRENT_SCOPE = "D1D_EU_TENSION only. R3 does not dispatch general AU, EU, or US steel member checks." as const;
export const D1F_R4_R3_STEEL_DISPATCH_DEBT = "R3 steel routing is not general multi-jurisdiction steel system orchestration." as const;
export const PARALLEL_CONNECTION_DOMAIN_CREATED = false as const;
export const PARALLEL_MEMBER_END_MODEL_CREATED = false as const;
export const PARALLEL_ACTION_RESULT_MODEL_CREATED = false as const;
export const CROSS_PROJECT_CONNECTION_BINDING_ALLOWED = false as const;
export const CROSS_PROJECT_FORCE_TRANSFER_CONTEXT_ALLOWED = false as const;
export const CONNECTION_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const D1F_R5_HANDOFF_READY = true as const;

export const D1F_R4_CONNECTION_ENTITY_KINDS = [
  "PHYSICAL_CONNECTION",
  "ANALYTICAL_JOINT",
  "DESIGN_CONNECTION",
  "SUPPORT_CONNECTION",
  "FOUNDATION_INTERFACE_CONNECTION",
] as const;
export const D1F_R4_CONNECTION_FAMILIES = [
  "SHEAR_CONNECTION",
  "MOMENT_CONNECTION",
  "BRACE_CONNECTION",
  "SPLICE",
  "BASE_CONNECTION",
  "CONCRETE_JOINT",
  "OTHER",
] as const;
export const D1F_R4_COORDINATE_KINDS = ["GLOBAL", "SYSTEM", "MEMBER_LOCAL", "CONNECTION_LOCAL", "ANALYSIS_PROVIDER_LOCAL"] as const;
export const D1F_R4_ACTION_QUANTITIES = ["N", "V_MAJOR", "V_MINOR", "M_MAJOR", "M_MINOR", "T"] as const;
export const D1F_R4_CONNECTION_SCOPE_STATES = [
  "CONNECTION_NOT_IN_DECLARED_SCOPE",
  "CONNECTION_REQUIRED_NOT_EVALUATED",
  "CONNECTION_INTERFACE_COMPLETE",
  "CONNECTION_DESIGN_UNAVAILABLE",
  "CONNECTION_RESULT_AVAILABLE",
] as const;
export const D1F_R4_CONNECTION_INTERFACE_COMPLETENESS_STATES = [
  "CONNECTION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE",
  "CONNECTION_INTERFACE_INCOMPLETE",
  "CONNECTION_INTERFACE_INVALID",
  "CONNECTION_INTERFACE_UNDETERMINED",
  "CONNECTION_INTERFACE_STALE",
] as const;
export const D1F_R4_EVENT_TYPES = [
  "CONNECTION_CREATED",
  "CONNECTION_CHANGED",
  "CONNECTION_MAPPING_CONFIRMED",
  "FORCE_TRANSFER_CONTEXT_CREATED",
  "FORCE_TRANSFER_CONTEXT_INVALIDATED",
  "CONNECTION_INTERFACE_EVALUATED",
  "CONNECTION_INTERFACE_INVALIDATED",
] as const;

export const D1F_R4_CONNECTION_ENTITY_MODEL = D1F_R4_CONNECTION_ENTITY_KINDS;
export const D1F_R4_CONNECTION_FAMILY_TAXONOMY = D1F_R4_CONNECTION_FAMILIES;
export const D1F_R4_PHYSICAL_CONNECTION_RUNTIME_CONTRACT =
  "A physical connection reuses the R1 connection id and records structural system, connected members, member ends, node, explicit classification, authority, provenance, status, version, and fingerprint." as const;
export const D1F_R4_ANALYTICAL_JOINT_CONTRACT =
  "An analytical joint records its id, analysis model, node, analytical element ends, coordinate reference, mapping authority, provenance, and fingerprint." as const;
export const D1F_R4_DESIGN_CONNECTION_IDENTITY_CONTRACT =
  "A design connection records its id, physical connection, profile, explicit family, required scope, member ends, action-context refs, authority, provenance, status, and fingerprint. It does not design the connection." as const;
export const D1F_R4_MEMBER_END_IDENTITY_CONTRACT =
  "A member end records physical and design member ids, analytical element, explicit end and orientation, node, local coordinate system, and provenance." as const;
export const D1F_R4_CONNECTION_MEMBER_END_MAPPING_CONTRACT =
  "Mappings relate a physical connection to physical member ends, an analytical joint to analytical ends, and a design connection to design-member ends. One-to-one is not assumed." as const;
export const D1F_R4_FORCE_TRANSFER_CONTEXT_CONTRACT =
  "A force-transfer context groups governed member-end action binding ids, cases, locations, coordinates, and signs. It does not calculate connection demand." as const;
export const D1F_R4_MEMBER_END_ACTION_SET_CONTRACT = D1F_R4_ACTION_QUANTITIES;
export const D1F_R4_CONNECTION_COORDINATE_CONTRACT = D1F_R4_COORDINATE_KINDS;
export const D1F_R4_STEEL_CONNECTION_INTERFACE_CONTRACT =
  "Steel interface metadata may name material, section, member end, governed end actions, explicit family, and profile. Resistance is not computed." as const;
export const D1F_R4_BASE_CONNECTION_INTERFACE_CONTRACT =
  "A base interface may name the support, connection, location, reaction refs, and future foundation context. Base-plate, anchor, and bearing design are not implemented." as const;
export const D1F_R4_CONCRETE_JOINT_INTERFACE_CONTRACT =
  "A concrete joint interface may name beam, column, wall, or slab ends, governed actions, geometry refs, and profile. Joint design is not performed." as const;
export const D1F_R4_CONNECTION_SCOPE_STATE_CONTRACT = D1F_R4_CONNECTION_SCOPE_STATES;
export const D1F_R4_CONNECTION_INTERFACE_RESULT_CONTRACT =
  "A connection interface result records connection refs, member ends, force-transfer contexts, authority, findings, completeness, explicit design availability, provenance, and fingerprint." as const;
export const D1F_R5_REQUIRED_R4_CONTRACTS = [
  "structuralSystemId",
  "supportIdentity",
  "connectionIdentity",
  "memberEndIdentity",
  "forceTransferContext",
  "supportReactionRefs",
  "coordinates",
  "profileContext",
  "provenance",
  "fingerprints",
  "invalidation",
] as const;

export type D1fR4ConnectionFamily = (typeof D1F_R4_CONNECTION_FAMILIES)[number];
export type D1fR4Completeness = (typeof D1F_R4_CONNECTION_INTERFACE_COMPLETENESS_STATES)[number];
export type D1fR4ScopeState = (typeof D1F_R4_CONNECTION_SCOPE_STATES)[number];
