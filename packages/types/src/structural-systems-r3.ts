/**
 * EOS-D1F-R3 system-to-member evaluation plan types.
 * System evaluation orchestrates existing checks. It does not analyse the system.
 */

export const EOS_D1F_R3_PHASE = "EOS-D1F-R3-SYSTEM-TO-MEMBER-EVALUATION-ORCHESTRATION" as const;
export const D1F_R3_MATURITY_STATE = "BOUNDED_SYSTEM_TO_MEMBER_EVALUATION_ORCHESTRATION_IMPLEMENTED" as const;
export const D1F_R3_PRODUCT_CLAIM = "BOUNDED_STRUCTURAL_SYSTEM_MEMBER_EVALUATION_REFERENCE_CAPABILITY" as const;
export const D1F_R3_SYSTEM_EVALUATION_ORCHESTRATOR_COUNT = 1 as const;
export const D1F_R3_NEW_STRUCTURAL_ANALYSIS_METHOD_COUNT = 0 as const;
export const D1F_R3_NEW_MEMBER_DESIGN_METHOD_COUNT = 0 as const;
export const D1F_R3_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1F_R3_NUMERICALLY_VALIDATED_SYSTEM_ORCHESTRATOR_COUNT = 1 as const;
export const D1F_R3_ORCHESTRATION_NUMERICAL_VALIDATION_EQUALS_ENGINEER_VALIDATION = false as const;
export const D1F_R3_ENGINEER_VALIDATED_SYSTEM_ORCHESTRATOR_COUNT = 0 as const;
export const D1F_R3_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const D1F_R3_FORMAL_CONFORMANCE_VALIDATED = false as const;
export const D1F_R3_SYSTEM_EVALUATION_EQUALS_CODE_CONFORMANCE = false as const;
export const D1F_R3_SYSTEM_EVALUATION_EQUALS_STRUCTURAL_ANALYSIS = false as const;
export const D1F_R3_MEMBER_PASS_EQUALS_GLOBAL_STRUCTURAL_ADEQUACY = false as const;
export const D1F_R3_SYSTEM_RESULT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1F_R3_SYSTEM_RESULT_EQUALS_FORMAL_CONFORMANCE = false as const;
export const D1F_R3_GENERIC_MAX_ABS_GOVERNS = false as const;
export const D1F_R3_AUTOMATIC_GOVERNING_CASE_SELECTION = false as const;
export const D1F_R3_AUTOMATIC_ENVELOPE_IMPLEMENTED = false as const;
export const D1F_R3_AI_GOVERNING_CASE_AUTHORITY = false as const;
export const NEW_D1F_R3_STEEL_FORMULA_IMPLEMENTED = false as const;
export const NEW_D1F_R3_CONCRETE_FORMULA_IMPLEMENTED = false as const;
export const NEW_D1F_R3_MEMBER_CAPACITY_FORMULA_IMPLEMENTED = false as const;
export const NEW_D1F_R3_INTERACTION_FORMULA_IMPLEMENTED = false as const;
export const D1F_R3_EVALUATION_PLAN_AUTHORITY_REQUIRED = true as const;
export const UNCONFIRMED_EVALUATION_PLAN_CAN_EXECUTE_GOVERNING_CHECKS = false as const;
export const AI_EVALUATION_PLAN_AUTHORITY = false as const;
export const D1F_R3_INFORMATIONAL_CHECK_CAN_SATISFY_REQUIRED_SCOPE = false as const;
export const D1F_R3_MATERIAL_DOMAIN_INFERRED_BY_LLM = false as const;
export const D1F_R3_MATERIAL_DOMAIN_INFERRED_FROM_SECTION_NAME = false as const;
export const D1F_R3_MEMBER_TYPE_INFERRED_BY_AI = false as const;
export const D1F_R3_MEMBER_TYPE_INFERRED_FROM_GEOMETRY_ONLY = false as const;
export const D1F_R3_STANDARD_PROFILE_EXPLICIT = true as const;
export const D1F_R3_JURISDICTION_INFERRED_FROM_LOCATION = false as const;
export const D1F_R3_STANDARD_SELECTED_BY_AI = false as const;
export const D1F_R3_PROFILE_COMPATIBILITY_REQUIRED = true as const;
export const PROFILE_MISMATCH_CAN_EXECUTE = false as const;
export const D1F_R3_ACTION_BINDING_ID_REQUIRED = true as const;
export const D1F_R3_ACTION_VALUES_COPIED_WITHOUT_BINDING_ALLOWED = false as const;
export const D1F_R3_ONLY_CURRENT_GOVERNED_BINDINGS_CAN_EXECUTE = true as const;
export const D1F_R3_MODEL_VALIDATION_REFERENCE_REQUIRED = true as const;
export const MISSING_MODEL_VALIDATION_REFERENCE_CAN_EXECUTE_GOVERNING_CHECK = false as const;
export const D1F_R3_NONCONVERGED_ANALYSIS_BINDING_CAN_EXECUTE = false as const;
export const D1F_R3_FAILED_ANALYSIS_BINDING_CAN_EXECUTE = false as const;
export const D1F_R3_IMPORTED_PENDING_VERIFICATION_CAN_EXECUTE = false as const;
export const D1F_R3_STALE_ACTION_BINDING_CAN_EXECUTE = false as const;
export const D1F_R3_ABSENT_ACTION_INVENTED_AS_ZERO = false as const;
export const D1F_R3_MULTIPLE_BINDINGS_WITHOUT_SELECTION_CAN_EXECUTE = false as const;
export const D1F_R3_MAX_N_AUTOMATICALLY_GOVERNS = false as const;
export const D1F_R3_MAX_V_AUTOMATICALLY_GOVERNS = false as const;
export const D1F_R3_MAX_M_AUTOMATICALLY_GOVERNS = false as const;
export const D1F_R3_MAX_T_AUTOMATICALLY_GOVERNS = false as const;
export const D1F_R3_SYNTHETIC_CROSS_COMBINATION_ACTION_TUPLE = false as const;
export const D1F_R3_UNTRACEABLE_ENVELOPE_CAN_EXECUTE = false as const;
export const D1F_R3_CRITICAL_LOCATION_LABEL_ALONE_CAN_GOVERN = false as const;
export const D1F_R3_CHECK_ENGINE_SELECTED_FROM_MEMBER_NAME = false as const;
export const D1F_R3_CHECK_ENGINE_SELECTED_BY_LLM = false as const;
export const D1F_R3_STEEL_MEMBER_EVALUATION_IMPLEMENTED = true as const;
export const D1F_R3_STEEL_CROSS_JURISDICTION_RULE_REUSE = false as const;
export const D1F_R3_STEEL_PROFILE_MISMATCH_FAILS_CLOSED = true as const;
export const D1F_R3_R2_STEEL_BINDING_REUSED = true as const;
export const PARALLEL_STEEL_ACTION_MAPPING_CREATED = false as const;
export const D1F_R3_CONCRETE_MEMBER_EVALUATION_IMPLEMENTED = true as const;
export const D1F_R3_CONCRETE_BEAM_C9_REUSED = true as const;
export const D1F_R3_CONCRETE_COLUMN_C9_REUSED = true as const;
export const D1F_R3_CONCRETE_SLAB_C9_REUSED = true as const;
export const D1F_R3_CONCRETE_WALL_C9_REUSED = true as const;
export const D1F_R3_WALL_RESULT_EQUALS_WALL_MEMBER_DESIGN = false as const;
export const D1F_R3_CONCRETE_ENGINEER_VALIDATED_PROMOTION = false as const;
export const D1F_R3_CONCRETE_CONFORMANCE_PROMOTION = false as const;
export const D1F_R3_ORCHESTRATION_CAN_EXCEED_UNDERLYING_VALIDATION_MATURITY = false as const;
export const D1F_R3_MEMBER_SATISFIED_EQUALS_COMPLETE_MEMBER_DESIGN = false as const;
export const D1F_R3_MEMBER_SATISFIED_EQUALS_CODE_CONFORMANCE = false as const;
export const D1F_R3_REQUIRED_MEMBER_SET_EXPLICIT = true as const;
export const D1F_R3_EMPTY_REQUIRED_MEMBER_SET_CAN_PASS = false as const;
export const D1F_R3_UNCHECKED_REQUIRED_MEMBER_CAN_PASS = false as const;
export const D1F_R3_UNSUPPORTED_REQUIRED_MEMBER_CAN_BE_IGNORED = false as const;
export const D1F_R3_OPTIONAL_MEMBER_RESULT_CAN_REPLACE_REQUIRED_MEMBER = false as const;
export const D1F_R3_MULTIPLE_FINDINGS_PRESERVED = true as const;
export const D1F_R3_FAILURE_DOES_NOT_HIDE_INCOMPLETENESS = true as const;
export const D1F_R3_COMPLETENESS_EQUALS_PASS = false as const;
export const D1F_R3_FULL_STRUCTURAL_SYSTEM_COVERAGE = false as const;
export const D1F_R3_UNBOUNDED_SYSTEM_ADEQUACY_CLAIM = false as const;
export const D1F_R3_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1F_R3_MEMBER_EVALUATION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1F_R3_SYSTEM_EVALUATION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1F_R3_SYSTEM_FINGERPRINT_ORDER_INDEPENDENT = true as const;
export const D1F_R3_INVALIDATION_IMPLEMENTED = true as const;
export const STALE_MEMBER_EVALUATION_CAN_GOVERN_SYSTEM = false as const;
export const STALE_SYSTEM_EVALUATION_CAN_BE_CURRENT = false as const;
export const D1F_R3_HISTORICAL_MEMBER_EVALUATION_REPRODUCIBLE = true as const;
export const D1F_R3_HISTORICAL_SYSTEM_EVALUATION_REPRODUCIBLE = true as const;
export const NEW_SYSTEM_EVALUATION_OVERWRITES_OLD_RESULT = false as const;
export const D1F_R3_HUMAN_ENGINEERING_DECISION_REQUIRED = true as const;
export const AI_D1F_R3_ASSISTANCE_ADVISORY_ONLY = true as const;
export const D1F_R3_MIXED_STEEL_CONCRETE_PLAN_SUPPORTED = true as const;
export const D1F_R3_CROSS_MATERIAL_RESULT_DETAIL_PRESERVED = true as const;
export const D1F_R3_CONNECTION_DESIGN_IMPLEMENTED = false as const;
export const D1F_R3_UNCHECKED_REQUIRED_CONNECTION_CAN_PASS = false as const;
export const D1F_R3_FOUNDATION_DESIGN_IMPLEMENTED = false as const;
export const D1F_R3_SUPPORT_REACTION_EQUALS_FOUNDATION_ADEQUACY = false as const;
export const D1F_R3_MEMBER_CHECKS_EQUAL_LOAD_PATH_VALIDATION = false as const;
export const D1F_R3_LOAD_PATH_ANALYSIS_IMPLEMENTED = false as const;
export const D1F_R3_AUTOMATIC_ANALYSIS_MODEL_VALIDATION = false as const;
export const D1F_R3_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1F_R3_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1F_R4_HANDOFF_READY = true as const;
export const CROSS_PROJECT_EVALUATION_PLAN_BINDING_ALLOWED = false as const;
export const CROSS_PROJECT_MEMBER_EVALUATION_ALLOWED = false as const;
export const EVALUATION_PLAN_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;

export const D1F_R3_EVALUATION_PLAN_STATUS_STATES = ["DRAFT", "GOVERNED", "STALE", "INVALID", "SUPERSEDED", "ARCHIVED"] as const;
export const D1F_R3_PLAN_AUTHORITIES = ["HUMAN_AUTHORED", "HUMAN_CONFIRMED", "GOVERNED_IMPORTED", "EXPLICIT_GOVERNED_MODEL", "UNCONFIRMED_CANDIDATE"] as const;
export const D1F_R3_MEMBER_RESULT_STATES = [
  "MEMBER_SATISFIED_FOR_DECLARED_BOUNDED_SCOPE",
  "MEMBER_NOT_SATISFIED",
  "MEMBER_INCOMPLETE",
  "MEMBER_UNDETERMINED",
  "MEMBER_INVALID",
  "MEMBER_STALE",
] as const;
export const D1F_R3_SYSTEM_RESULT_STATES = [
  "SYSTEM_SATISFIED_FOR_EXECUTED_DECLARED_BOUNDED_SCOPE",
  "SYSTEM_NOT_SATISFIED",
  "SYSTEM_INCOMPLETE",
  "SYSTEM_UNDETERMINED",
  "SYSTEM_INVALID",
  "SYSTEM_STALE",
] as const;
export const D1F_R3_EVENT_TYPES = [
  "EVALUATION_PLAN_CREATED",
  "EVALUATION_PLAN_CHANGED",
  "MEMBER_EVALUATION_EXECUTED",
  "MEMBER_EVALUATION_FAILED",
  "SYSTEM_EVALUATION_EXECUTED",
  "SYSTEM_EVALUATION_INVALIDATED",
] as const;

export const D1F_R3_SYSTEM_EVALUATION_PLAN_CONTRACT =
  "A plan records its id, structural system, topology fingerprint, project context, standard profile, declared scope, required and informational entries, authority, provenance, version, fingerprint, and status." as const;
export const D1F_R3_MEMBER_EVALUATION_ENTRY_CONTRACT =
  "An entry records its id, physical and design member ids, explicit material domain and member type, capability id, profile, declared scope, selected action binding, role, authority, and provenance." as const;
export const D1F_R3_MEMBER_EVALUATION_DISPATCH_CONTRACT =
  "Dispatch follows the explicit capability id to the existing EU steel tension check or the existing C9 beam, column, slab, or wall-section orchestrator." as const;
export const D1F_R3_MEMBER_RESULT_MATURITY_PROPAGATION_CONTRACT =
  "Each member result keeps the underlying capability validation and conformance state. Orchestration does not raise that state." as const;
export const D1F_R3_MEMBER_EVALUATION_RESULT_CONTRACT =
  "A member result records plan and entry identity, bindings, fingerprints, underlying engine result, maturity, findings, completeness, bounded acceptance, provenance, and fingerprint." as const;
export const D1F_R3_MEMBER_RESULT_STATE_CONTRACT = D1F_R3_MEMBER_RESULT_STATES;
export const D1F_R3_SYSTEM_EVALUATION_RESULT_CONTRACT =
  "A system result records plan identity, topology fingerprint, member counts by state, member result ids, findings, declared scope, completeness, bounded overall state, maturity summary, provenance, and fingerprint." as const;
export const D1F_R3_SYSTEM_RESULT_STATE_CONTRACT = D1F_R3_SYSTEM_RESULT_STATES;
export const D1F_R3_SYSTEM_AGGREGATION_CONTRACT =
  "A required not-satisfied member makes the system not satisfied and keeps other findings. Invalid and undetermined precede incomplete. Incomplete precedes stale. Bounded satisfaction requires every required member to be satisfied for its declared scope." as const;
export const D1F_R4_REQUIRED_R3_CONTRACTS = [
  "structuralSystemIdentity",
  "memberIdentities",
  "connectionIdentities",
  "memberEndMappings",
  "governedActionBindingReferences",
  "evaluationPlanIdentity",
  "memberEvaluationIdentity",
  "provenance",
  "fingerprints",
  "invalidation",
] as const;

export type D1fR3PlanStatus = (typeof D1F_R3_EVALUATION_PLAN_STATUS_STATES)[number];
export type D1fR3MemberState = (typeof D1F_R3_MEMBER_RESULT_STATES)[number];
export type D1fR3SystemState = (typeof D1F_R3_SYSTEM_RESULT_STATES)[number];
export type D1fR3EventType = (typeof D1F_R3_EVENT_TYPES)[number];
