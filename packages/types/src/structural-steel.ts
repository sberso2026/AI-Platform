/**
 * EOS-D1D-0 — common Structural steel design framework.
 * Adapter contracts only. Not AS 4100 / EN 1993 / AISC 360 formula engines.
 */

import type { EosGlobalProvenanceContract } from "./global-governance";
import type { StructuralDemandResult } from "./structural-demand";
import type { StructuralCapacityResult, StructuralDesignCheck, StructuralEvidenceBinding } from "./structural-domain";
import type { StructuralStandardContext, StructuralStandardLifecycle } from "./structural-standard-binding";

export const EOS_D1D0_PHASE = "EOS-D1D-0" as const;

export const DUPLICATE_STEEL_DOMAIN_MODEL = false as const;
export const DEMAND_ENGINE_DUPLICATED_IN_STEEL = false as const;
export const AUST300_GLOBAL_DEFAULT = false as const;
export const UNSOURCED_CODE_FORMULA_ALLOWED = false as const;
export const STEEL_STANDARD_LICENSING_BOUNDARY = true as const;
export const CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const SILENT_EFFECTIVE_LENGTH_ASSUMPTION = false as const;
export const UNIVERSAL_INTERACTION_EQUATION_HARDCODED = false as const;
export const INDEPENDENT_STEEL_VALIDATION_REQUIRED = true as const;
export const STEEL_AI_ADVISORY_ONLY = true as const;
export const LLM_STEEL_CAPACITY_AUTHORITY = false as const;
export const AI_ENGINEERING_APPROVAL = false as const;
export const OPTIMIZATION_REQUIRES_DETERMINISTIC_RECHECK = true as const;
export const AU_ONLY_STEEL_CORE = false as const;
export const EU_ONLY_STEEL_CORE = false as const;
export const US_ONLY_STEEL_CORE = false as const;
export const EOS_D1D_AU1_PHASE = "EOS-D1D-AU-1" as const;
export const LLM_MEMORY_ONLY_RULE_ALLOWED = false as const;
export const GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS = false as const;
export const AI_STANDARD_CONFORMANCE_AUTHORITY = false as const;
export const SILENT_STANDARD_EDITION_INFERENCE = false as const;
export const UNKNOWN_CODE_PARAMETER_GUESSED = false as const;

export const ENGINEERING_RULE_AUTHORITY_TYPES = [
  "AUTHORITATIVE_STANDARD_DERIVED",
  "VALIDATED_ENGINEERING_REFERENCE",
  "HUMAN_AUTHORED_VALIDATED_RULE",
  "ESTABLISHED_ENGINEERING_MECHANICS",
  "CERTIFIED_EXTERNAL_TOOL_REFERENCE",
  "OTHER_GOVERNED_ENGINEERING_SOURCE",
] as const;
export type EngineeringRuleAuthorityType = (typeof ENGINEERING_RULE_AUTHORITY_TYPES)[number];

export const FORBIDDEN_ENGINEERING_RULE_AUTHORITIES = [
  "LLM_MEMORY_ONLY",
  "UNSOURCED_WEB_SUMMARY",
  "BLOG_ONLY",
  "FORUM_ONLY",
  "UNVERIFIED_GENERATED_RULE",
] as const;
export type ForbiddenEngineeringRuleAuthority = (typeof FORBIDDEN_ENGINEERING_RULE_AUTHORITIES)[number];

export const STEEL_STANDARD_CONFORMANCE_STATES = [
  "INTENDED_PROFILE",
  "RULE_TRACEABLE",
  "BENCHMARKED",
  "ENGINEER_CONFIRMED",
  "CONFORMANCE_VALIDATED",
  "CERTIFIED",
] as const;
export type SteelStandardConformanceState = (typeof STEEL_STANDARD_CONFORMANCE_STATES)[number];

export const STEEL_IMPLEMENTATION_BINDING_STATES = [
  "FRAMEWORK_ONLY",
  "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
  "IMPLEMENTED",
  "BENCHMARKED",
  "HUMAN_VALIDATED",
  "PILOT",
  "CERTIFIED",
] as const;
export type SteelImplementationBindingState = (typeof STEEL_IMPLEMENTATION_BINDING_STATES)[number];

export const AU_STEEL_UNKNOWN_STANDARD_TOKEN = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const EOS_D1D_AU2_PHASE = "EOS-D1D-AU-2" as const;
export const EOS_D1D_AU3_PHASE = "EOS-D1D-AU-3" as const;
export const ELASTIC_BUCKLING_EQUALS_CODE_CAPACITY = false as const;
export const LLM_COMPRESSION_CAPACITY_AUTHORITY = false as const;
export const LLM_BENDING_CAPACITY_AUTHORITY = false as const;
export const SECTION_CLASSIFICATION_STATE = "VALIDATION_REQUIRED" as const;
export const SILENT_UNBRACED_LENGTH_ASSUMPTION = false as const;
export const SILENT_MOMENT_MODIFICATION_FACTOR = false as const;
export const ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY = false as const;
export const MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY = false as const;
export const AI_BENDING_ASSISTANCE_ADVISORY_ONLY = true as const;
export const OPTIMIZATION_BENDING_RECHECK_REQUIRED = true as const;
export const AU_BENDING_PILOT_EXPOSURE = false as const;
export const EOS_D1D_AU4_PHASE = "EOS-D1D-AU-4" as const;
export const LLM_SHEAR_CAPACITY_AUTHORITY = false as const;
export const SILENT_SHEAR_AREA_ASSUMPTION = false as const;
export const WEB_SLENDERNESS_LIMIT_GUESSED = false as const;
export const ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY = false as const;
export const TENSION_FIELD_ACTION_IMPLEMENTED = false as const;
export const AI_SHEAR_ASSISTANCE_ADVISORY_ONLY = true as const;
export const OPTIMIZATION_SHEAR_RECHECK_REQUIRED = true as const;
export const AU_SHEAR_PILOT_EXPOSURE = false as const;
export const BENDING_SHEAR_INTERACTION_IMPLEMENTED = false as const;
export const AXIAL_SHEAR_INTERACTION_IMPLEMENTED = false as const;
export const CONNECTION_SHEAR_DESIGN_IMPLEMENTED = false as const;
export const INTERACTION_REVIEW_REQUIRED = true as const;
export const EOS_D1D_AU5_PHASE = "EOS-D1D-AU-5" as const;
export const LLM_INTERACTION_AUTHORITY = false as const;
export const AI_INTERACTION_ASSISTANCE_ADVISORY_ONLY = true as const;
export const OPTIMIZATION_INTERACTION_RECHECK_REQUIRED = true as const;
export const OPTIMIZATION_ACCEPTS_UNDETERMINED_AS_PASS = false as const;
export const GENERIC_MATHEMATICS_EQUALS_CODE_INTERACTION = false as const;
export const UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED = false as const;
export const BIAXIAL_LINEAR_INTERACTION_ASSUMED = false as const;
export const SHEAR_REDUCTION_RULE_GUESSED = false as const;
export const AU_COMBINED_PILOT_EXPOSURE = false as const;
export const TORSIONAL_INTERACTION_IMPLEMENTED = false as const;
export const CONNECTION_INTERACTION_IMPLEMENTED = false as const;
export const COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK = false as const;
export const UNIVERSAL_INTERACTION_EQUATION = false as const;
export const EOS_D1D_AU6_PHASE = "EOS-D1D-AU-6" as const;
export const AU_STEEL_PACK_CERTIFIED = false as const;
export const AU_STEEL_IMPLEMENTATION_MATURITY = "PARTIAL_METHODS_BENCHMARKED" as const;
export const AU_STEEL_STANDARD_CONFORMANCE_STATE = "INTENDED_PROFILE" as const;
export const AU_STEEL_FRAMEWORK_STATE = "FRAMEWORK_IMPLEMENTED" as const;
export const AU_STEEL_CONFORMANCE_SUMMARY = "CONFORMANCE_NOT_VALIDATED" as const;
export const DEFAULT_DEFLECTION_LIMIT_GUESSED = false as const;
export const SPAN_RATIO_DENOMINATOR_GUESSED = false as const;
export const ULTIMATE_DEMAND_USED_AS_SERVICEABILITY_BY_DEFAULT = false as const;
export const UNIVERSAL_MEMBER_UTILIZATION = false as const;
export const HIGHEST_UTILIZATION_ALWAYS_GOVERNS = false as const;
export const VIBRATION_DESIGN_IMPLEMENTED = false as const;
export const AU_MEMBER_PILOT_EXPOSURE = false as const;
export const AU6_AUTOMATIC_APPROVAL = false as const;
export const MEMBER_CHECK_EQUALS_CONNECTION_CHECK = false as const;
export const MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL = false as const;
export const GENERAL_FEA_CAPABILITY_CLAIMED = false as const;
export const ORCHESTRATION_EQUALS_CODE_CERTIFICATION = false as const;
export const STALE_RESULT_REUSE_ALLOWED = false as const;
export const APPLICABILITY_EQUALS_PASS = false as const;
export const UNDETERMINED_REQUIRED_CHECK_ALLOWS_COMPLETE = false as const;
export const COMPONENT_CHECKS_CAN_SUBSTITUTE_FOR_INTERACTION = false as const;
export const UNVALIDATED_METHOD_COUNTS_AS_COMPLETE = false as const;
export const AI_SECTION_SELECTION_EQUALS_APPROVAL = false as const;
export const CANDIDATE_FULL_DETERMINISTIC_RECHECK_REQUIRED = true as const;
export const AI_MEMBER_DESIGN_EXPLANATION_ADVISORY_ONLY = true as const;
export const EOS_D1D_AU7_PHASE = "EOS-D1D-AU-7" as const;
export const VALIDATION_DIMENSIONS_SEPARATE = true as const;
export const BENCHMARK_EQUALS_STANDARD_CONFORMANCE = false as const;
export const NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL = false as const;
export const STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL = false as const;
export const SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL = false as const;
export const AS4100_CONFORMANCE_VALIDATED = false as const;
export const SELF_REFERENTIAL_BENCHMARKS = false as const;
export const THIRD_PARTY_VALIDATION_AVAILABLE = false as const;
export const AU_STEEL_PRODUCT_CLAIM_LEVEL = "BENCHMARKED_ENGINEERING_CAPABILITY" as const;
export const AU_STEEL_RELEASE_CLASSIFICATION = "INTERNAL_ENGINEERING_REFERENCE" as const;
export const GENERAL_AU_MEMBER_DESIGN_VALIDATED = false as const;
export const CONNECTION_DESIGN_VALIDATED = false as const;
export const MEMBER_VALIDATION_IMPLIES_CONNECTION_VALIDATION = false as const;
export const MEMBER_VALIDATION_IMPLIES_FOUNDATION_VALIDATION = false as const;
export const AU_VALIDATION_PILOT_EXPOSURE = false as const;
export const EOS_D1D_EU1_PHASE = "EOS-D1D-EU-1" as const;
export const GLOBAL_STANDARD_FRAMEWORK_REUSED = true as const;
export const PARALLEL_EU_STANDARD_FRAMEWORK_CREATED = false as const;
export const PARALLEL_EU_GOVERNANCE_CREATED = false as const;
export const EUROCODE_FAMILY_MODEL = true as const;
export const EN1993_STEEL_FAMILY_REGISTERED = true as const;
export const EUROCODE_PART_MODEL = true as const;
export const EU_INITIAL_STEEL_STANDARD_PART = "EN_1993_1_1" as const;
export const EU_STANDARD_VERSION_MODEL = true as const;
export const CROSS_EDITION_RULE_MIXING_ALLOWED = false as const;
export const SILENT_EU_STANDARD_EDITION_INFERENCE = false as const;
export const EU_NATIONAL_ANNEX_MODEL = true as const;
export const COUNTRY_AND_STANDARD_SEPARATE = true as const;
export const DEFAULT_EU_NATIONAL_ANNEX = false as const;
export const NDP_MODEL = true as const;
export const NDP_VALUE_GUESSED = false as const;
export const NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION = false as const;
export const UK_EUROCODE_EXTENSIBILITY = true as const;
export const EUROCODE_FAMILY_NOT_HARDCODED_TO_EU_MEMBERSHIP = true as const;
export const SECOND_GENERATION_EUROCODE_READY = true as const;
export const STANDARD_UPDATE_OVERWRITES_HISTORICAL_RULE = false as const;
export const EU_RULE_VERSION_IMMUTABILITY = true as const;
export const AUST300_EU_DEFAULT = false as const;
export const EU1_LOAD_COMBINATION_ENGINE_CREATED = false as const;
export const AI_EU_STANDARD_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_NATIONAL_ANNEX_AUTHORITY = false as const;
export const AI_NDP_AUTHORITY = false as const;
export const EU_AI_NUMERICAL_AUTHORITY = false as const;
export const EU_STEEL_CONTEXT_PII_REQUIRED = false as const;
export const EMPLOYEE_BEHAVIOR_PROFILING = false as const;
export const EU_STEEL_DESIGN_AVAILABLE = false as const;
export const EU_STEEL_PACK_CERTIFIED = false as const;
export const READY_FOR_EU2_TENSION_ARCHITECTURE = true as const;
export const EUROCODE_UNKNOWN_EDITION_TOKEN = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_EU1 = false as const;
export const EOS_D1D_EU2_PHASE = "EOS-D1D-EU-2" as const;
export const PARALLEL_EU_STEEL_CORE_CREATED = false as const;
export const AU_CODE_RULES_REUSED_AS_EU_RULES = false as const;
export const GENERIC_MECHANICS_EQUALS_EN1993_CAPACITY = false as const;
export const UNKNOWN_EU_CODE_PARAMETER_GUESSED = false as const;
export const SILENT_NET_AREA_EQUALS_GROSS_AREA = false as const;
export const EU_PARTIAL_FACTOR_GUESSED = false as const;
export const BENCHMARK_EQUALS_EN1993_CONFORMANCE = false as const;
export const AUTOMATIC_ENGINEERING_APPROVAL = false as const;
export const LLM_EU_TENSION_CAPACITY_AUTHORITY = false as const;
export const AI_EU_TENSION_ASSISTANCE_ADVISORY_ONLY = true as const;
export const EU_OPTIMIZATION_TENSION_RECHECK_REQUIRED = true as const;
export const EU_STEEL_IMPLEMENTATION_MATURITY = "FRAMEWORK_PLUS_BOUNDED_METHODS" as const;
export const EU_PARTIAL_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_EU2 = false as const;
export const EOS_D1D_EU3_PHASE = "EOS-D1D-EU-3" as const;
export const EULER_REFERENCE_EQUALS_EN1993_MEMBER_CAPACITY = false as const;
export const EU_CODE_SLENDERNESS_RULE_GUESSED = false as const;
export const EU_SECTION_CLASSIFICATION_LIMIT_GUESSED = false as const;
export const BUCKLING_CURVE_GUESSED = false as const;
export const EU_BUCKLING_PARAMETER_GUESSED = false as const;
export const EU_COMPRESSION_PARTIAL_FACTOR_GUESSED = false as const;
export const UNKNOWN_EU_COMPRESSION_CODE_PARAMETER_GUESSED = false as const;
export const COMMON_BENCHMARK_EQUALS_EUROCODE_CONFORMANCE = false as const;
export const MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK = false as const;
export const LLM_EU_COMPRESSION_CAPACITY_AUTHORITY = false as const;
export const AI_EU_COMPRESSION_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_BUCKLING_CURVE_AUTHORITY = false as const;
export const EU_OPTIMIZATION_COMPRESSION_RECHECK_REQUIRED = true as const;
export const EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_STABILITY = false as const;
export const TORSIONAL_BUCKLING_IMPLEMENTED = false as const;
export const FLEXURAL_TORSIONAL_BUCKLING_IMPLEMENTED = false as const;
export const MEMBER_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY = false as const;
export const MIXED_AUTHORITY_RESULT_COMPARISON_GOVERNED = true as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_EU3 = false as const;
export const EU_COMPRESSION_PARTIAL_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const EU_CODE_SLENDERNESS_CONTEXT_STATE = "VALIDATION_REQUIRED" as const;
export const EOS_D1D_EU4_PHASE = "EOS-D1D-EU-4" as const;
export const ELASTIC_MECHANICS_EQUALS_EN1993_BENDING_CAPACITY = false as const;
export const EU_BENDING_CLASSIFICATION_LIMIT_GUESSED = false as const;
export const UNKNOWN_EU_SECTION_BENDING_PARAMETER_GUESSED = false as const;
export const EU_MOMENT_FACTOR_GUESSED = false as const;
export const EU_LTB_CURVE_GUESSED = false as const;
export const EU_LTB_PARAMETER_GUESSED = false as const;
export const EU_BENDING_PARTIAL_FACTOR_GUESSED = false as const;
export const UNKNOWN_EU_BENDING_CODE_PARAMETER_GUESSED = false as const;
export const LLM_EU_BENDING_CAPACITY_AUTHORITY = false as const;
export const AI_EU_BENDING_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_LTB_CURVE_AUTHORITY = false as const;
export const EU_OPTIMIZATION_BENDING_RECHECK_REQUIRED = true as const;
export const EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_BENDING = false as const;
export const COMBINED_ACTION_IMPLEMENTED = false as const;
export const EU_SHEAR_IMPLEMENTED = false as const;
export const TORSIONAL_DESIGN_IMPLEMENTED = false as const;
export const MEMBER_BENDING_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY = false as const;
export const MIXED_AUTHORITY_BENDING_COMPARISON_GOVERNED = true as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_EU4 = false as const;
export const EU_BENDING_PARTIAL_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const DEFLECTION_ENGINE_DUPLICATED = false as const;
export const EOS_D1D_EU5_PHASE = "EOS-D1D-EU-5" as const;
export const GENERIC_SHEAR_MECHANICS_EQUALS_EN1993_CAPACITY = false as const;
export const EU_WEB_SLENDERNESS_LIMIT_GUESSED = false as const;
export const UNKNOWN_EU_SECTION_SHEAR_PARAMETER_GUESSED = false as const;
export const EU_SHEAR_BUCKLING_COEFFICIENT_GUESSED = false as const;
export const EU_SHEAR_PARTIAL_FACTOR_GUESSED = false as const;
export const UNKNOWN_EU_SHEAR_CODE_PARAMETER_GUESSED = false as const;
export const SILENT_STIFFENER_ASSUMPTION = false as const;
export const EU_TENSION_FIELD_ACTION_IMPLEMENTED = false as const;
export const LLM_EU_SHEAR_CAPACITY_AUTHORITY = false as const;
export const AI_EU_SHEAR_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_SHEAR_AREA_AUTHORITY = false as const;
export const AI_BUCKLING_PARAMETER_AUTHORITY = false as const;
export const EU_OPTIMIZATION_SHEAR_RECHECK_REQUIRED = true as const;
export const EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_SHEAR = false as const;
export const MIXED_AUTHORITY_SHEAR_COMPARISON_GOVERNED = true as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_EU5 = false as const;
export const EU_SHEAR_PARTIAL_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const EOS_D1D_EU6_PHASE = "EOS-D1D-EU-6" as const;
export const MECHANICS_REFERENCE_AUTOMATICALLY_VALID_FOR_CODE_INTERACTION = false as const;
export const UNIVERSAL_AXIAL_BIAXIAL_EQUATION = false as const;
export const EU_INTERACTION_CLASSIFICATION_GUESSED = false as const;
export const EU_INTERACTION_PARAMETER_GUESSED = false as const;
export const EU_SHEAR_REDUCTION_RULE_GUESSED = false as const;
export const LLM_EU_INTERACTION_AUTHORITY = false as const;
export const AI_EU_INTERACTION_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_INTERACTION_PARAMETER_AUTHORITY = false as const;
export const EU_OPTIMIZATION_INTERACTION_RECHECK_REQUIRED = true as const;
export const EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_INTERACTION = false as const;
export const MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_STABILITY = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_EU6 = false as const;
export const PARALLEL_INTERACTION_FRAMEWORK_CREATED = false as const;
export const COMPONENT_BENCHMARK_EQUALS_INTERACTION_CONFORMANCE = false as const;
export const EU_COMBINED_PILOT_EXPOSURE = false as const;
export const EOS_D1D_EU7_PHASE = "EOS-D1D-EU-7" as const;
export const PARALLEL_MEMBER_ORCHESTRATION_CREATED = false as const;
export const MECHANICS_ONLY_RESULTS_ALLOW_EUROCODE_DESIGN_PASS = false as const;
export const MECHANICS_COMPLETE_EQUALS_CODE_DESIGN_COMPLETE = false as const;
export const REFERENCE_METHOD_CANNOT_COMPLETE_CODE_CHECK = true as const;
export const MISSING_INTERACTION_PREVENTS_EU_CODE_DESIGN_PASS = true as const;
export const EU_SERVICEABILITY_DEFLECTION_ENGINE_DUPLICATED = false as const;
export const EU_SPAN_RATIO_DENOMINATOR_GUESSED = false as const;
export const EU_VIBRATION_DESIGN_IMPLEMENTED = false as const;
export const EU7_AUTOMATIC_APPROVAL = false as const;
export const EU_MEMBER_PILOT_EXPOSURE = false as const;
export const AI_EUROCODE_CAPACITY_PROMOTION_AUTHORITY = false as const;
export const AI_SERVICEABILITY_CRITERION_AUTHORITY = false as const;
export const EU_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const GENERAL_EU_MEMBER_CODE_DESIGN_VALIDATED = false as const;
export const NEW_INTERACTION_METHOD_IMPLEMENTED_IN_EU7 = false as const;
export const EU6_INTERACTION_LIMITATION_PROPAGATED = true as const;
export const EU_STEEL_RELEASE_CLASSIFICATION = "INTERNAL_ENGINEERING_REFERENCE" as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_EU7 = false as const;
export const APPLICABILITY_EQUALS_SATISFIED = false as const;
export const EOS_D1D_EU8_PHASE = "EOS-D1D-EU-8" as const;
export const EU_VALIDATION_DIMENSIONS_SEPARATE = true as const;
export const SILENT_STANDARD_IDENTITY_INFERENCE = false as const;
export const ELASTIC_BENDING_EQUALS_EN1993_SECTION_RESISTANCE = false as const;
export const ELASTIC_LTB_EQUALS_EN1993_MEMBER_RESISTANCE = false as const;
export const ELASTIC_SHEAR_EQUALS_EN1993_RESISTANCE = false as const;
export const BENCHMARK_EQUALS_EUROCODE_CONFORMANCE = false as const;
export const EU_CONFORMANCE_EVIDENCE_REQUIRED = true as const;
export const EUROCODE_NOT_HARDCODED_TO_EU_MEMBERSHIP = true as const;
export const MEMBER_VALIDATION_IMPLIES_GLOBAL_FRAME_VALIDATION = false as const;
export const ANALYSIS_SCOPE_TRUTHFUL = true as const;
export const EU_CONNECTION_DESIGN_VALIDATED = false as const;
export const EU_THIRD_PARTY_VALIDATION_AVAILABLE = false as const;
export const PACK_CERTIFICATION_NOT_OVERSTATED = true as const;
export const NEW_MAJOR_DESIGN_METHOD_IMPLEMENTED = false as const;
export const EU_STEEL_PRODUCT_CLAIM_LEVEL = "BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY" as const;
export const EU_STEEL_STANDARD_CONFORMANCE_STATE = "INTENDED_PROFILE" as const;
export const EU_STEEL_RESULT_WARNING_MODEL = true as const;
export const EU_VALIDATION_PILOT_EXPOSURE = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_EU8 = false as const;
export const NUMERICAL_EU_INTERACTION_METHODS_AFTER_EU8 = [] as const;
export const COMMON_MECHANICS_EQUALS_COMMON_CODE_AUTHORITY = false as const;
export const EOS_D1D_US1_PHASE = "EOS-D1D-US-1" as const;
export const PARALLEL_US_STANDARD_FRAMEWORK_CREATED = false as const;
export const PARALLEL_US_GOVERNANCE_CREATED = false as const;
export const US_STANDARD_ECOSYSTEM_MODEL = true as const;
export const AISC_STEEL_FAMILY_REGISTERED = true as const;
export const US_STANDARD_VERSION_MODEL = true as const;
export const AISC_UNKNOWN_EDITION_TOKEN = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const AISC_STANDARD_EDITION = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const SILENT_AISC_EDITION_INFERENCE = false as const;
export const US_DESIGN_METHOD_MODEL = true as const;
export const DEFAULT_LRFD_OR_ASD = false as const;
export const DESIGN_METHOD_EXPLICIT = true as const;
export const DESIGN_METHOD_AND_UNIT_SYSTEM_SEPARATE = true as const;
export const US_UNIT_SYSTEM_CONTEXT = true as const;
export const US_BUILDING_CODE_ADOPTION_CONTEXT = true as const;
export const BUILDING_CODE_AND_STEEL_STANDARD_SEPARATE = true as const;
export const US_JURISDICTION_AND_STANDARD_SEPARATE = true as const;
export const US_CODE_PROFILE_INFERRED_FROM_USER_LOCATION = false as const;
export const US_LOCAL_AMENDMENT_MODEL = true as const;
export const LOCAL_AMENDMENT_VALUE_GUESSED = false as const;
export const US_CODE_ADOPTION_RESOLVER = true as const;
export const DIRECT_CONTRACT_STANDARD_PROFILE_SUPPORTED = true as const;
export const US_PROJECT_STANDARD_CONTEXT = true as const;
export const ISSUED_US_CALCULATION_CONTEXT_IMMUTABLE = true as const;
export const US_LOAD_STANDARD_DEPENDENCY_MODEL = true as const;
export const US1_LOAD_COMBINATION_ENGINE_CREATED = false as const;
export const SILENT_ASCE_EDITION_INFERENCE = false as const;
export const US_LOAD_DESIGN_METHOD_COMPATIBILITY_MODEL = true as const;
export const US_SEISMIC_STEEL_DEPENDENCY_MODEL = true as const;
export const US_SEISMIC_PROFILE_ALWAYS_REQUIRED = false as const;
export const SILENT_SEISMIC_STANDARD_EDITION_INFERENCE = false as const;
export const US_CONNECTION_STANDARD_DEPENDENCY_MODEL = true as const;
export const US_CONNECTION_DESIGN_IMPLEMENTED = false as const;
export const US_MATERIAL_SOURCE_BOUNDARY = true as const;
export const AUST300_US_DEFAULT = false as const;
export const EU_SECTION_CATALOG_US_DEFAULT = false as const;
export const US_SECTION_CATALOG_ADAPTER_READY = true as const;
export const US_SECTION_PROPERTIES_FROM_UNGOVERNED_DESIGNATION = false as const;
export const US_ENGINEERING_RULE_AUTHORITY_REQUIRED = true as const;
export const US_STANDARD_PROFILE_AND_CONFORMANCE_SEPARATE = true as const;
export const US_STANDARD_CONTEXT_RESOLVER = true as const;
export const US_STANDARD_CONTEXT_CONFLICT_DETECTION = true as const;
export const US_METHOD_SPECIFIC_RULE_BINDING = true as const;
export const SILENT_LRFD_ASD_CONVERSION = false as const;
export const US_MULTI_JURISDICTION_PROJECT_SUPPORT = true as const;
export const US_STANDARD_FAMILY_NOT_HARDCODED_TO_US_GEOGRAPHY = true as const;
export const US_STANDARD_GENERATION_READY = true as const;
export const US_RULE_VERSION_IMMUTABILITY = true as const;
export const US_PROJECT_OVERRIDE_GOVERNANCE = true as const;
export const US_SOURCE_PRECEDENCE_MODEL = true as const;
export const UNRESOLVED_STANDARD_CONFLICT_FAILS_CLOSED = true as const;
export const US_STANDARD_CONTEXT_HUMAN_CONFIRMATION_SUPPORTED = true as const;
export const AI_US_STANDARD_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_AISC_EDITION_AUTHORITY = false as const;
export const AI_LRFD_ASD_AUTHORITY = false as const;
export const AI_LOCAL_AMENDMENT_AUTHORITY = false as const;
export const US_AI_NUMERICAL_AUTHORITY = false as const;
export const US_STEEL_CONTEXT_PII_REQUIRED = false as const;
export const US_STEEL_DESIGN_AVAILABLE = false as const;
export const US_STEEL_PACK_CERTIFIED = false as const;
export const READY_FOR_US2_TENSION_ARCHITECTURE = true as const;
export const US_STANDARD_SOURCE_REFERENCE_READY = true as const;
export const US_STANDARD_TENANT_ISOLATION = true as const;
export const US_STANDARD_WORKSPACE_ISOLATION = true as const;
export const US_HUMAN_OVERSIGHT_PRESERVED = true as const;
export const THREE_JURISDICTION_ARCHITECTURE_VALIDATED = true as const;
export const US_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const US_VALIDATION_PILOT_EXPOSURE = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_US1 = false as const;
export const EOS_D1D_US2_PHASE = "EOS-D1D-US-2" as const;
export const PARALLEL_US_STEEL_CORE_CREATED = false as const;
export const COMMON_STEEL_FRAMEWORK_REUSED = true as const;
export const US1_STANDARD_BINDING_REUSED = true as const;
export const AU_CODE_RULES_REUSED_AS_US_RULES = false as const;
export const EU_CODE_RULES_REUSED_AS_US_RULES = false as const;
export const COMMON_MECHANICS_SHARED_ACROSS_LRFD_ASD = true as const;
export const LRFD_ASD_MECHANICS_DUPLICATED = false as const;
export const GENERIC_MECHANICS_EQUALS_AISC_DESIGN_STRENGTH = false as const;
export const MECHANICS_REFERENCE_EQUALS_AISC_NOMINAL_STRENGTH = false as const;
export const US_LRFD_RESISTANCE_FACTOR_GUESSED = false as const;
export const US_ASD_FACTOR_GUESSED = false as const;
export const US_SHEAR_LAG_FACTOR_GUESSED = false as const;
export const US_HOLE_DEDUCTION_GUESSED = false as const;
export const UNKNOWN_US_TENSION_CODE_PARAMETER_GUESSED = false as const;
export const DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE = false as const;
export const MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK = false as const;
export const BENCHMARK_EQUALS_AISC_CONFORMANCE = false as const;
export const COMMON_BENCHMARK_EQUALS_AISC_CONFORMANCE = false as const;
export const LLM_US_TENSION_STRENGTH_AUTHORITY = false as const;
export const AI_US_TENSION_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_FACTOR_AUTHORITY = false as const;
export const AI_NET_AREA_AUTHORITY = false as const;
export const US_BLOCK_SHEAR_IMPLEMENTED = false as const;
export const US_CONNECTION_TENSION_DESIGN_IMPLEMENTED = false as const;
export const US_SEISMIC_TENSION_DESIGN_IMPLEMENTED = false as const;
export const US_FATIGUE_TENSION_DESIGN_IMPLEMENTED = false as const;
export const US_OPTIMIZATION_TENSION_RECHECK_REQUIRED = true as const;
export const US_OPTIMIZATION_ACCEPTS_UNDETERMINED_TENSION = false as const;
export const US_STEEL_IMPLEMENTATION_MATURITY = "FRAMEWORK_PLUS_BOUNDED_METHODS" as const;
export const US_STEEL_MATURITY_NOT_OVERSTATED = true as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_US2 = false as const;
export const US_LRFD_RESISTANCE_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const US_ASD_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const US_SECTION_CATALOG_OPTIONAL = true as const;
export const US2_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const US_TENSION_STRENGTH_RESULT_STATE = "PARTIAL" as const;
export const US_TENSION_INDEPENDENT_BENCHMARK_STATE = "PARTIAL" as const;
export const US_TENSION_HUMAN_VALIDATION_REQUIRED = true as const;
export const EOS_D1D_US3_PHASE = "EOS-D1D-US-3" as const;
export const PARALLEL_US_COMPRESSION_CORE_CREATED = false as const;
export const US2_DESIGN_METHOD_ARCHITECTURE_REUSED = true as const;
export const COMMON_COMPRESSION_MECHANICS_SHARED_ACROSS_LRFD_ASD = true as const;
export const LRFD_ASD_COMPRESSION_MECHANICS_DUPLICATED = false as const;
export const STABILITY_ANALYSIS_METHOD_MIXING_ALLOWED = false as const;
export const SUPPORT_LABEL_AUTOMATICALLY_DEFINES_K_FACTOR = false as const;
export const DEFAULT_K_FACTOR = false as const;
export const D1C_EQUALS_COMPLETE_US_STABILITY_ANALYSIS = false as const;
export const EULER_REFERENCE_EQUALS_AISC_MEMBER_STRENGTH = false as const;
export const US_CODE_SLENDERNESS_LIMIT_GUESSED = false as const;
export const US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED = false as const;
export const US_COMPRESSION_STRENGTH_RULE_GUESSED = false as const;
export const US_COMPRESSION_LRFD_FACTOR_GUESSED = false as const;
export const US_COMPRESSION_ASD_FACTOR_GUESSED = false as const;
export const UNKNOWN_US_COMPRESSION_CODE_PARAMETER_GUESSED = false as const;
export const US_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED = false as const;
export const US_FLEXURAL_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED = false as const;
export const LLM_US_COMPRESSION_STRENGTH_AUTHORITY = false as const;
export const AI_US_COMPRESSION_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_EFFECTIVE_LENGTH_FACTOR_AUTHORITY = false as const;
export const AI_STABILITY_METHOD_AUTHORITY = false as const;
export const AI_ELEMENT_CLASSIFICATION_AUTHORITY = false as const;
export const US_OPTIMIZATION_COMPRESSION_RECHECK_REQUIRED = true as const;
export const US_OPTIMIZATION_ACCEPTS_UNDETERMINED_COMPRESSION = false as const;
export const US_MEMBER_COMPRESSION_EQUALS_GLOBAL_FRAME_VALIDATION = false as const;
export const US_SEISMIC_COMPRESSION_DESIGN_IMPLEMENTED = false as const;
export const US_CONNECTION_COMPRESSION_DESIGN_IMPLEMENTED = false as const;
export const US_COMPRESSION_STRENGTH_RESULT_STATE = "PARTIAL" as const;
export const US_COMPRESSION_INDEPENDENT_BENCHMARK_STATE = "PARTIAL" as const;
export const US_COMPRESSION_HUMAN_VALIDATION_REQUIRED = true as const;
export const US_COMPRESSION_LRFD_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const US_COMPRESSION_ASD_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_US3 = false as const;
export const US3_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const STABILITY_METHOD_DETERMINES_EFFECTIVE_LENGTH_REQUIREMENT = true as const;
export const MIXED_AUTHORITY_COMPRESSION_COMPARISON_GOVERNED = true as const;
export const US_COMPRESSION_STANDARD_CONTEXT_REQUIRED = true as const;
export const US_COMPRESSION_DESIGN_METHOD_REQUIRED = true as const;
export const EOS_D1D_US4_PHASE = "EOS-D1D-US-4" as const;
export const PARALLEL_US_BENDING_CORE_CREATED = false as const;
export const US3_STABILITY_ARCHITECTURE_REUSED = true as const;
export const COMMON_BENDING_MECHANICS_SHARED_ACROSS_LRFD_ASD = true as const;
export const LRFD_ASD_BENDING_MECHANICS_DUPLICATED = false as const;
export const ELASTIC_BENDING_EQUALS_AISC_FLEXURAL_STRENGTH = false as const;
export const ELASTIC_LTB_EQUALS_AISC_FLEXURAL_STRENGTH = false as const;
export const US_BENDING_CLASSIFICATION_LIMIT_GUESSED = false as const;
export const UNKNOWN_US_SECTION_FLEXURAL_PARAMETER_GUESSED = false as const;
export const PLASTIC_CAPACITY_ASSUMED_WITHOUT_CLASSIFICATION = false as const;
export const US_LOCAL_BUCKLING_RULE_GUESSED = false as const;
export const SILENT_US_UNBRACED_LENGTH_ASSUMPTION = false as const;
export const GENERIC_SUPPORT_AUTOMATICALLY_DEFINES_LTB_RESTRAINT = false as const;
export const SILENT_US_LTB_RESTRAINT_ASSUMPTION = false as const;
export const US_CB_FACTOR_GUESSED = false as const;
export const US_LTB_TRANSITION_PARAMETER_GUESSED = false as const;
export const US_LTB_STRENGTH_RULE_GUESSED = false as const;
export const US_BENDING_LRFD_FACTOR_GUESSED = false as const;
export const US_BENDING_ASD_FACTOR_GUESSED = false as const;
export const UNKNOWN_US_BENDING_CODE_PARAMETER_GUESSED = false as const;
export const US_BENDING_DEFLECTION_ENGINE_DUPLICATED = false as const;
export const LLM_US_BENDING_STRENGTH_AUTHORITY = false as const;
export const AI_US_BENDING_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_UNBRACED_LENGTH_AUTHORITY = false as const;
export const AI_LTB_RESTRAINT_AUTHORITY = false as const;
export const AI_CB_FACTOR_AUTHORITY = false as const;
export const US_OPTIMIZATION_BENDING_RECHECK_REQUIRED = true as const;
export const US_OPTIMIZATION_ACCEPTS_UNDETERMINED_BENDING = false as const;
export const US_COMBINED_ACTION_IMPLEMENTED = false as const;
export const US_SHEAR_DESIGN_IMPLEMENTED = false as const;
export const US_TORSIONAL_DESIGN_IMPLEMENTED = false as const;
export const US_MEMBER_BENDING_EQUALS_GLOBAL_FRAME_VALIDATION = false as const;
export const US_SEISMIC_BENDING_DESIGN_IMPLEMENTED = false as const;
export const US_CONNECTION_BENDING_DESIGN_IMPLEMENTED = false as const;
export const US_BENDING_STRENGTH_RESULT_STATE = "PARTIAL" as const;
export const US_BENDING_INDEPENDENT_BENCHMARK_STATE = "PARTIAL" as const;
export const US_BENDING_HUMAN_VALIDATION_REQUIRED = true as const;
export const US_BENDING_LRFD_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const US_BENDING_ASD_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const US_CB_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const COMMON_BENDING_BENCHMARK_EQUALS_AISC_CONFORMANCE = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_US4 = false as const;
export const US4_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const US_BENDING_STANDARD_CONTEXT_REQUIRED = true as const;
export const US_BENDING_DESIGN_METHOD_REQUIRED = true as const;
export const EOS_D1D_US5_PHASE = "EOS-D1D-US-5" as const;
export const PARALLEL_US_SHEAR_CORE_CREATED = false as const;
export const US4_CLASSIFICATION_ARCHITECTURE_REUSED = true as const;
export const COMMON_SHEAR_MECHANICS_SHARED_ACROSS_LRFD_ASD = true as const;
export const LRFD_ASD_SHEAR_MECHANICS_DUPLICATED = false as const;
export const ELASTIC_SHEAR_EQUALS_AISC_SHEAR_STRENGTH = false as const;
export const ELASTIC_SHEAR_BUCKLING_EQUALS_AISC_WEB_STRENGTH = false as const;
export const SILENT_US_SHEAR_AREA_ASSUMPTION = false as const;
export const US_SHEAR_AREA_RULE_GUESSED = false as const;
export const US_WEB_SLENDERNESS_LIMIT_GUESSED = false as const;
export const BENDING_CLASSIFICATION_EQUALS_SHEAR_CLASSIFICATION = false as const;
export const SILENT_US_STIFFENER_ASSUMPTION = false as const;
export const US_STIFFENER_DESIGN_IMPLEMENTED = false as const;
export const US_SHEAR_BUCKLING_COEFFICIENT_GUESSED = false as const;
export const US_WEB_STABILITY_RULE_GUESSED = false as const;
export const US_TENSION_FIELD_ACTION_IMPLEMENTED = false as const;
export const US_TENSION_FIELD_ELIGIBILITY_GUESSED = false as const;
export const US_SHEAR_LRFD_FACTOR_GUESSED = false as const;
export const US_SHEAR_ASD_FACTOR_GUESSED = false as const;
export const UNKNOWN_US_SHEAR_CODE_PARAMETER_GUESSED = false as const;
export const US_BENDING_SHEAR_INTERACTION_IMPLEMENTED = false as const;
export const US_SHEAR_REDUCTION_RULE_GUESSED = false as const;
export const US_AXIAL_SHEAR_INTERACTION_IMPLEMENTED = false as const;
export const US_CONNECTION_SHEAR_DESIGN_IMPLEMENTED = false as const;
export const US_SEISMIC_SHEAR_DESIGN_IMPLEMENTED = false as const;
export const LLM_US_SHEAR_STRENGTH_AUTHORITY = false as const;
export const AI_US_SHEAR_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_WEB_SLENDERNESS_AUTHORITY = false as const;
export const AI_STIFFENER_AUTHORITY = false as const;
export const US_OPTIMIZATION_SHEAR_RECHECK_REQUIRED = true as const;
export const US_OPTIMIZATION_ACCEPTS_UNDETERMINED_SHEAR = false as const;
export const US_SHEAR_STRENGTH_RESULT_STATE = "PARTIAL" as const;
export const US_SHEAR_INDEPENDENT_BENCHMARK_STATE = "PARTIAL" as const;
export const US_SHEAR_HUMAN_VALIDATION_REQUIRED = true as const;
export const US_SHEAR_LRFD_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const US_SHEAR_ASD_FACTOR_SOURCE = "VALIDATION_REQUIRED" as const;
export const US_SHEAR_BUCKLING_COEFFICIENT_SOURCE = "VALIDATION_REQUIRED" as const;
export const COMMON_SHEAR_BENCHMARK_EQUALS_AISC_CONFORMANCE = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_US5 = false as const;
export const US5_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const US_SHEAR_STANDARD_CONTEXT_REQUIRED = true as const;
export const US_SHEAR_DESIGN_METHOD_REQUIRED = true as const;
export const EOS_D1D_US6_PHASE = "EOS-D1D-US-6" as const;
export const PARALLEL_US_INTERACTION_FRAMEWORK_CREATED = false as const;
export const US_INTERACTION_STANDARD_CONTEXT_REQUIRED = true as const;
export const US_INTERACTION_DESIGN_METHOD_REQUIRED = true as const;
export const MIXED_LRFD_ASD_COMPONENTS_ALLOWED = false as const;
export const MECHANICS_REFERENCE_AUTOMATICALLY_VALID_FOR_AISC_INTERACTION = false as const;
export const US_SYNTHETIC_INTERACTION_UTILIZATION = false as const;
export const UNIVERSAL_US_INTERACTION_EQUATION = false as const;
export const UNKNOWN_US_INTERACTION_RELATIONSHIP_GUESSED = false as const;
export const US_INTERACTION_PARAMETER_GUESSED = false as const;
export const US_INTERACTION_CLASSIFICATION_GUESSED = false as const;
export const US_INTERACTION_MOMENT_AMPLIFICATION_GUESSED = false as const;
export const UNKNOWN_US_INTERACTION_PARAMETER_GUESSED = false as const;
export const US_BENDING_SHEAR_REDUCTION_RULE_GUESSED = false as const;
export const LLM_US_INTERACTION_AUTHORITY = false as const;
export const AI_US_INTERACTION_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_CLASSIFICATION_AUTHORITY = false as const;
export const US_OPTIMIZATION_INTERACTION_RECHECK_REQUIRED = true as const;
export const US_OPTIMIZATION_ACCEPTS_UNDETERMINED_INTERACTION = false as const;
export const US_TORSIONAL_INTERACTION_IMPLEMENTED = false as const;
export const US_CONNECTION_INTERACTION_IMPLEMENTED = false as const;
export const US_SEISMIC_INTERACTION_IMPLEMENTED = false as const;
export const US_MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_VALIDATION = false as const;
export const US_INTERACTION_HUMAN_VALIDATION_REQUIRED = true as const;
export const US_INTERACTION_INDEPENDENT_BENCHMARK_STATE = "NOT_APPLICABLE" as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_US6 = false as const;
export const US6_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const COMPONENT_BENCHMARK_EQUALS_AISC_INTERACTION_CONFORMANCE = false as const;
export const US_STANDARD_BINDING_REUSED = true as const;
export const EOS_D1D_US7_PHASE = "EOS-D1D-US-7" as const;
export const PARALLEL_US_MEMBER_ORCHESTRATION_CREATED = false as const;
export const US_MEMBER_STANDARD_CONTEXT_REQUIRED = true as const;
export const US_MEMBER_DESIGN_METHOD_REQUIRED = true as const;
export const MIXED_LRFD_ASD_MEMBER_DESIGN_ALLOWED = false as const;
export const MECHANICS_ONLY_RESULTS_ALLOW_AISC_DESIGN_PASS = false as const;
export const MECHANICS_COMPLETE_EQUALS_AISC_DESIGN_COMPLETE = false as const;
export const MISSING_INTERACTION_PREVENTS_AISC_CODE_DESIGN_PASS = true as const;
export const COMPONENT_CHECKS_CAN_SUBSTITUTE_FOR_US_INTERACTION = false as const;
export const US_MEMBER_STABILITY_METHOD_MIXING_ALLOWED = false as const;
export const US_MEMBER_MOMENT_AMPLIFICATION_GUESSED = false as const;
export const US_MEMBER_CLASSIFICATION_GUESSED = false as const;
export const DEFAULT_US_DEFLECTION_LIMIT_GUESSED = false as const;
export const US_SPAN_RATIO_DENOMINATOR_GUESSED = false as const;
export const US_SERVICEABILITY_DEFLECTION_ENGINE_DUPLICATED = false as const;
export const US_VIBRATION_DESIGN_IMPLEMENTED = false as const;
export const US_UNIVERSAL_MEMBER_UTILIZATION = false as const;
export const AISC_MEMBER_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE = false as const;
export const DIRECT_CONTRACT_AISC_EQUALS_BUILDING_CODE_COMPLIANCE = false as const;
export const STALE_RESULT_REUSE_ALLOWED_FOR_US7 = false as const;
export const UNVALIDATED_METHOD_COUNTS_AS_COMPLETE_US7 = false as const;
export const US6_INTERACTION_LIMITATION_PROPAGATED = true as const;
export const NEW_INTERACTION_METHOD_IMPLEMENTED_IN_US7 = false as const;
export const GENERAL_US_MEMBER_CODE_DESIGN_VALIDATED = false as const;
export const US7_AUTOMATIC_APPROVAL = false as const;
export const US_MEMBER_PILOT_EXPOSURE = false as const;
export const AI_AISC_STRENGTH_PROMOTION_AUTHORITY = false as const;
export const AI_DESIGN_METHOD_AUTHORITY = false as const;
export const AI_BUILDING_CODE_COMPLIANCE_AUTHORITY = false as const;
export const AI_US_SECTION_SUGGESTION_ALLOWED = true as const;
export const AI_SECTION_SELECTION_EQUALS_APPROVAL_US7 = false as const;
export const US_CANDIDATE_FULL_DETERMINISTIC_RECHECK_REQUIRED = true as const;
export const US_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const US_MEMBER_CHECK_EQUALS_CONNECTION_CHECK = false as const;
export const US_MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL = false as const;
export const US_MEMBER_CHECK_EQUALS_GLOBAL_FRAME_STABILITY = false as const;
export const US_MEMBER_SEISMIC_DESIGN_VALIDATED = false as const;
export const US_CONNECTION_DESIGN_VALIDATED = false as const;
export const US_STEEL_RELEASE_CLASSIFICATION = "INTERNAL_ENGINEERING_REFERENCE" as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_US7 = false as const;
export const US7_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const US_MEMBER_HUMAN_VALIDATION_REQUIRED = true as const;

export const STEEL_BUCKLING_AXES = ["MAJOR_AXIS", "MINOR_AXIS", "TORSIONAL", "FLEXURAL_TORSIONAL"] as const;
export type SteelBucklingAxis = (typeof STEEL_BUCKLING_AXES)[number];

export const STEEL_LIMIT_STATES = [
  "TENSION",
  "COMPRESSION",
  "BENDING_MAJOR",
  "BENDING_MINOR",
  "SHEAR",
  "SHEAR_MAJOR",
  "SHEAR_MINOR",
  "COMBINED_ACTION",
  "LOCAL_STABILITY",
  "MEMBER_STABILITY",
  "SERVICEABILITY",
  "OTHER",
] as const;
export type SteelLimitState = (typeof STEEL_LIMIT_STATES)[number];

export const STEEL_SOURCE_AUTHORITY_TYPES = [
  "LICENSED_STANDARD",
  "USER_SUPPLIED_STANDARD_REFERENCE",
  "VALIDATED_INTERNAL_ENGINEERING_RULE",
  "APPROVED_ENGINEERING_HANDBOOK",
  "CERTIFIED_EXTERNAL_TOOL",
  "OTHER_GOVERNED_SOURCE",
] as const;
export type SteelSourceAuthorityType = (typeof STEEL_SOURCE_AUTHORITY_TYPES)[number];

export const STEEL_METHOD_MATURITIES = [
  "FRAMEWORK_ONLY",
  "IMPLEMENTED",
  "BENCHMARKED",
  "HUMAN_VALIDATED",
  "PILOT",
  "CERTIFIED",
] as const;
export type SteelMethodMaturity = (typeof STEEL_METHOD_MATURITIES)[number];

export const STEEL_CHECK_VERDICTS = ["CHECK_SATISFIED", "CHECK_NOT_SATISFIED", "CHECK_UNDETERMINED"] as const;
export type SteelCheckVerdict = (typeof STEEL_CHECK_VERDICTS)[number];

export const STEEL_ADAPTER_IDS = ["AU_STEEL", "EU_STEEL", "US_STEEL"] as const;
export type SteelAdapterId = (typeof STEEL_ADAPTER_IDS)[number];

export type SteelGovernedProperty = {
  name: string;
  value: number | string | null;
  unit: string | null;
  provenanceRef: string;
  sourceAuthority: SteelSourceAuthorityType;
};

export type SteelMaterialDesignProperties = {
  materialRef: string;
  grade: string;
  yieldStrength: SteelGovernedProperty | null;
  ultimateStrength: SteelGovernedProperty | null;
  elasticModulus: SteelGovernedProperty | null;
  shearModulus: SteelGovernedProperty | null;
  poissonRatio: SteelGovernedProperty | null;
  density: SteelGovernedProperty | null;
  thicknessDependentMetadata: string | null;
  jurisdictionApplicability: string[];
};

export type SteelSectionDesignProperties = {
  sectionRef: string;
  sectionFamily: string;
  catalogSource: string;
  catalogVersion: string | null;
  jurisdictionApplicability: string[];
  area: SteelGovernedProperty | null;
  Iyy: SteelGovernedProperty | null;
  Izz: SteelGovernedProperty | null;
  sectionModulusYy: SteelGovernedProperty | null;
  sectionModulusZz: SteelGovernedProperty | null;
  plasticModulusYy: SteelGovernedProperty | null;
  plasticModulusZz: SteelGovernedProperty | null;
  torsionConstant: SteelGovernedProperty | null;
  warpingConstant: SteelGovernedProperty | null;
  radiusOfGyrationYy: SteelGovernedProperty | null;
  radiusOfGyrationZz: SteelGovernedProperty | null;
  netArea: SteelGovernedProperty | null;
  shearArea?: SteelGovernedProperty | null;
  webDepth?: SteelGovernedProperty | null;
  webThickness?: SteelGovernedProperty | null;
  geometricDimensions: Record<string, SteelGovernedProperty | null>;
};

export const STEEL_SHEAR_AXES = ["MAJOR_SHEAR", "MINOR_SHEAR"] as const;
export type SteelShearAxis = (typeof STEEL_SHEAR_AXES)[number];

export const STEEL_SHEAR_STIFFENER_STATES = [
  "UNSTIFFENED",
  "TRANSVERSE_STIFFENED",
  "LONGITUDINALLY_STIFFENED",
  "MULTI_STIFFENED",
  "OTHER_GOVERNED_CONFIGURATION",
] as const;
export type SteelShearStiffenerState = (typeof STEEL_SHEAR_STIFFENER_STATES)[number];

export type SteelShearInputContext = {
  shearAxis: SteelShearAxis;
  stiffenerState: SteelShearStiffenerState | "unknown";
  shearBucklingCoefficient?: SteelGovernedProperty | null;
  stiffenerSpacing?: SteelGovernedProperty | null;
  panelLength?: SteelGovernedProperty | null;
  panelBoundaryMetadata?: string | null;
};

export type SteelWebSlendernessContext = {
  clearWebDepth: number | null;
  webThickness: number | null;
  slendernessRatio: number | null;
  stiffenerState: SteelShearStiffenerState | "unknown";
  limitState: "VALIDATION_REQUIRED";
  technicalRuleRef: null;
};

export type SteelStabilityContext = {
  stabilityContextId: string;
  memberLengthM: number | null;
  effectiveLengthM: number | null;
  unbracedLengthM: number | null;
  restraintDescription: string | null;
  bucklingAxis: "MAJOR" | "MINOR" | "BOTH" | null;
  momentGradientRef: string | null;
  torsionalRestraint: string | null;
  lateralRestraint: string | null;
  sourceEvidenceRef: string | null;
  derived: false;
  effectiveLengthMajorM?: number | null;
  effectiveLengthMinorM?: number | null;
  effectiveLengthProvenanceRef?: string | null;
  effectiveLengthFactorMajor?: SteelGovernedProperty | null;
  effectiveLengthFactorMinor?: SteelGovernedProperty | null;
  unbracedLengthProvenanceRef?: string | null;
  warpingRestraint?: string | null;
  momentDistributionDescription?: string | null;
  loadApplicationPosition?: string | null;
};

export type SteelDesignContext = {
  designContextId: string;
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  demandRefs: string[];
  standardContextRef: string;
  parameterSetRef: string | null;
  effectiveLengthContextRef: string | null;
  restraintContextRef: string | null;
  stabilityContextRef: string | null;
  fabricationContextRef: string | null;
  evidenceRefs: StructuralEvidenceBinding[];
  toolRef: string;
  methodRef: string;
  provenanceRef: EosGlobalProvenanceContract;
  validationState: string;
  reviewState: string;
};

export type SteelSourceAuthorityRecord = {
  authorityType: SteelSourceAuthorityType;
  identifier: string;
  clauseRef: string | null;
  edition: string | null;
  licensedMetadataOnly: true;
};

export type SteelEngineeringRule = {
  ruleId: string;
  methodId: string;
  jurisdiction: string;
  standardProfileRef: string;
  authorityType: EngineeringRuleAuthorityType;
  technicalBasisRef: string;
  calculationPurpose: string;
  applicability: string;
  requiredInputs: string[];
  outputType: string;
  units: string;
  implementationVersion: string;
  validationState: SteelMethodMaturity;
  benchmarkRefs: string[];
  humanReviewState: string;
  provenanceRef: string;
  clauseRef: string | null;
  intendedStandardProfile: "AS4100" | "EN1993" | "AISC360";
  standardConformanceState: SteelStandardConformanceState;
  bindingState: SteelImplementationBindingState;
};

export type SteelHumanRuleConfirmation = {
  ruleId: string;
  confirmedEquationId: string | null;
  confirmedParameter: { name: string; value: number | string; unit: string | null; provenanceRef: string } | null;
  confirmedApplicability: string | null;
  edition: string | null;
  amendment: string | null;
  referenceIdentifier: string | null;
  reviewer: string;
  confirmedAt: string;
};

export type SteelTensionCheckRecord = {
  methodId: string;
  engineeringRuleRef: string;
  capacityType: string;
  capacityValueN: number;
  units: "N";
  technicalBasisRef: string;
  standardProfileRef: string;
  validationState: SteelMethodMaturity;
  standardConformanceState: SteelStandardConformanceState;
};

export const STEEL_INTERACTION_TYPES = [
  "TENSION_BENDING",
  "TENSION_BIAXIAL_BENDING",
  "COMPRESSION_BENDING",
  "COMPRESSION_BIAXIAL_BENDING",
  "BIAXIAL_BENDING",
  "BENDING_SHEAR",
  "AXIAL_SHEAR",
  "AXIAL_BIAXIAL_BENDING",
] as const;
export type SteelInteractionType = (typeof STEEL_INTERACTION_TYPES)[number];

export type SteelCombinedDemandComponent = {
  resultId: string;
  memberId: string;
  combinationId: string | null;
  kind: "AXIAL" | "MOMENT_MAJOR" | "MOMENT_MINOR" | "SHEAR" | "SHEAR_MAJOR" | "SHEAR_MINOR";
  value: number;
  unit: string;
  signed: number;
  revision?: string | null;
};

export type SteelCombinedCapacityComponent = {
  capacityResultId: string;
  methodId: string;
  memberId: string;
  combinationId: string | null;
  kind: "TENSION" | "COMPRESSION" | "BENDING_MAJOR" | "BENDING_MINOR" | "SHEAR";
  value: number;
  unit: string;
  standardProfileRef: string;
  maturity: SteelMethodMaturity;
  revision?: string | null;
  resultClass?: "MECHANICS_REFERENCE" | "DESIGN_CAPACITY";
  authorityState?: "MECHANICS_REFERENCE" | "CODE_PROFILE_CAPACITY";
  designMethod?: "LRFD" | "ASD";
};

export type SteelCombinedActionInput = {
  combinationRef: string;
  componentDemands: SteelCombinedDemandComponent[];
  componentCapacities: SteelCombinedCapacityComponent[];
};

export type SteelComponentUtilizationRow = {
  kind: "AXIAL" | "BENDING_MAJOR" | "BENDING_MINOR" | "SHEAR" | "SHEAR_MAJOR" | "SHEAR_MINOR";
  demand: { value: number; unit: string };
  capacity: { value: number; unit: string } | null;
  ratio: number | null;
  informationalOnly: true;
};

export type SteelComponentUtilizationVector = {
  combinationRef: string;
  rows: SteelComponentUtilizationRow[];
  equalsInteractionCheck: false;
};

export type SteelCombinedActionContext = {
  combinedContextId: string;
  memberRef: string;
  tensionDemandRef: string | null;
  compressionDemandRef: string | null;
  majorMomentDemandRef: string | null;
  minorMomentDemandRef: string | null;
  shearDemandRefs: string[];
  tensionCapacityRefs: string[];
  compressionCapacityRefs: string[];
  majorBendingCapacityRefs: string[];
  minorBendingCapacityRefs: string[];
  shearCapacityRefs: string[];
  stabilityContextRef: string | null;
  sectionClassificationRef: typeof SECTION_CLASSIFICATION_STATE;
  interactionRuleRef: string;
  standardProfileRef: string;
  technicalBasisRef: string;
  provenanceRef: EosGlobalProvenanceContract;
  validationState: string;
};

export type SteelCombinedActionResult = {
  resultId: string;
  memberRef: string;
  combinationRef: string;
  interactionType: SteelInteractionType;
  componentDemandRefs: string[];
  componentCapacityRefs: string[];
  componentAuthorityStates?: readonly ("MECHANICS_REFERENCE" | "CODE_PROFILE_CAPACITY")[];
  ruleRef: string;
  interactionValue: null;
  criterion: null;
  checkState: SteelCheckVerdict;
  reason:
    | "INTERACTION_RULE_VALIDATION_REQUIRED"
    | "INSUFFICIENT_COMPONENT_AUTHORITY"
    | "MISSING_CLASSIFICATION"
    | "MISSING_STABILITY"
    | "NATIONAL_ANNEX_REQUIRED"
    | "NDP_REQUIRED"
    | "REVISION_MISMATCH"
    | "MISSING_LTB"
    | "MIXED_DESIGN_METHOD"
    | "STABILITY_METHOD_CONFLICT"
    | "LOCAL_AMENDMENT_UNRESOLVED";
  governingComponent: string | null;
  technicalBasisRef: string;
  standardProfileRef: string;
  standardPartRefs?: readonly string[];
  edition?: string;
  nationalAnnexRef?: string | null;
  ndpSetRef?: string | null;
  designMethod?: "LRFD" | "ASD";
  unitSystem?: "US_CUSTOMARY" | "SI";
  stabilityMethodRef?: string | null;
  classificationRefs?: readonly string[];
  localBucklingRefs?: readonly string[];
  ltbContextRefs?: readonly string[];
  buildingCodeContextRef?: string | null;
  loadStandardContextRef?: string | null;
  localAmendmentSetRef?: string | null;
  directContractProfile?: boolean;
  standardConformanceState: SteelStandardConformanceState;
  validationState: SteelMethodMaturity;
  benchmarkState: "NOT_APPLICABLE";
  humanReviewState: "required";
  llmOriginated: false;
};

export type SteelCapacityEngineInput = {
  adapterId: SteelAdapterId;
  designContext: SteelDesignContext;
  standardContext: StructuralStandardContext;
  material: SteelMaterialDesignProperties;
  section: SteelSectionDesignProperties;
  stability: SteelStabilityContext | null;
  demand: Pick<StructuralDemandResult, "resultId" | "memberId" | "shear" | "moment" | "axial" | "deflection" | "capacityPresent" | "standardContext" | "inputEvidenceRefs" | "combinationId">;
  limitState: SteelLimitState;
  requiredProperties: string[];
  shear?: SteelShearInputContext | null;
  combined?: SteelCombinedActionInput | null;
  eurocodeContext?: EurocodeSteelDesignContext | null;
  usSteelContext?: USSteelDesignContext | null;
  usStabilityContext?: UsStabilityAnalysisContext | null;
};

export type SteelCompressionCheckRecord = {
  methodId: string;
  engineeringRuleRef: string;
  capacityType: string;
  resultClass: "MECHANICS_REFERENCE";
  axis: SteelBucklingAxis | "SQUASH";
  capacityValueN: number;
  units: "N";
  technicalBasisRef: string;
  standardProfileRef: string;
  validationState: SteelMethodMaturity;
  standardConformanceState: SteelStandardConformanceState;
  effectiveLengthM: number | null;
};

export type AuCompressionDesignContext = {
  compressionContextId: string;
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  axialDemandRef: string;
  memberLengthM: number;
  effectiveLengthMajorM: number | null;
  effectiveLengthMinorM: number | null;
  bucklingAxes: SteelBucklingAxis[];
  unbracedLengthM: number | null;
  restraintContext: string;
  engineeringRuleRef: string;
  standardProfileRef: string;
  provenanceRef: EosGlobalProvenanceContract;
  validationState: string;
  effectiveLengthProvenanceRef: string;
  sectionClassificationState: typeof SECTION_CLASSIFICATION_STATE;
};

export type SteelBendingCheckRecord = {
  methodId: string;
  methodType: "ELASTIC_BENDING_REFERENCE" | "ELASTIC_LTB_REFERENCE";
  engineeringRuleRef: string;
  capacityType: string;
  resultClass: "MECHANICS_REFERENCE";
  axis: "MAJOR_AXIS" | "MINOR_AXIS";
  capacityValueNm: number;
  units: "N.m";
  technicalBasisRef: string;
  standardProfileRef: string;
  validationState: SteelMethodMaturity;
  standardConformanceState: SteelStandardConformanceState;
  unbracedLengthM: number | null;
};

export type SteelBendingDesignContext = {
  bendingContextId: string;
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  momentDemandRefs: string[];
  bendingAxis: "MAJOR_AXIS" | "MINOR_AXIS";
  memberLengthM: number | null;
  unbracedLengthM: number | null;
  unbracedLengthProvenanceRef: string | null;
  restraintContext: string | null;
  lateralRestraint: string | null;
  torsionalRestraint: string | null;
  warpingRestraint: string | null;
  momentDistributionContext: string | null;
  engineeringRuleRef: string;
  standardProfileRef: string;
  provenanceRef: EosGlobalProvenanceContract;
  validationState: string;
  sectionClassificationState: typeof SECTION_CLASSIFICATION_STATE;
};

export type SteelShearCheckRecord = {
  methodId: string;
  methodType: "ELASTIC_SHEAR_REFERENCE" | "ELASTIC_SHEAR_BUCKLING_REFERENCE";
  engineeringRuleRef: string;
  capacityType: string;
  resultClass: "MECHANICS_REFERENCE";
  axis: SteelShearAxis;
  capacityValueN: number;
  units: "N";
  technicalBasisRef: string;
  standardProfileRef: string;
  validationState: SteelMethodMaturity;
  standardConformanceState: SteelStandardConformanceState;
  stiffenerState: SteelShearStiffenerState;
  webSlendernessRatio: number | null;
};

export type SteelShearDesignContext = {
  shearContextId: string;
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  shearDemandRefs: string[];
  shearAxis: SteelShearAxis;
  webDepth: number | null;
  webThickness: number | null;
  webSlenderness: SteelWebSlendernessContext;
  stiffenerState: SteelShearStiffenerState;
  stiffenerSpacing: number | null;
  engineeringRuleRef: string;
  standardProfileRef: string;
  technicalBasisRef: string;
  provenanceRef: EosGlobalProvenanceContract;
  validationState: string;
  interactionReviewRequired: true;
};

export type SteelCapacityEngineOutput = {
  adapterId: SteelAdapterId;
  maturity: SteelMethodMaturity;
  implemented: boolean;
  capacity: StructuralCapacityResult | null;
  reason: string;
  sourceAuthority: SteelSourceAuthorityRecord | null;
  tensionChecks?: SteelTensionCheckRecord[];
  compressionChecks?: SteelCompressionCheckRecord[];
  bendingChecks?: SteelBendingCheckRecord[];
  shearChecks?: SteelShearCheckRecord[];
  governingMethodId?: string | null;
  standardConformanceState?: SteelStandardConformanceState;
  implementationBindingState?: SteelImplementationBindingState;
  resultClass?: "MECHANICS_REFERENCE" | "DESIGN_CAPACITY";
  designCapacityState?: "VALIDATION_REQUIRED" | "IMPLEMENTED";
  sectionClassificationState?: typeof SECTION_CLASSIFICATION_STATE;
  interactionReviewRequired?: true;
  combinedResults?: SteelCombinedActionResult[];
  componentUtilizations?: SteelComponentUtilizationVector;
  interactionRequired?: boolean;
};

export type SteelUtilizationComposition = {
  simpleUtilizationValid: boolean;
  demand: { value: number; unit: string };
  capacity: { value: number; unit: string } | null;
  ratio: number | null;
};

export type SteelDesignCheckOutcome = {
  designCheck: Pick<StructuralDesignCheck, "designCheckId" | "demandRef" | "capacityRef" | "checkType" | "approvalState" | "reviewState" | "validationState">;
  verdict: SteelCheckVerdict;
  utilization: SteelUtilizationComposition | null;
  interactionRequiresAdapter: boolean;
  humanReviewRequired: true;
  engineeringApproved: false;
};

export type SteelBenchmarkRecord = {
  benchmarkId: string;
  methodId: string;
  jurisdiction: string;
  standard: string;
  edition: string;
  annex: string | null;
  sourceAuthority: SteelSourceAuthorityType;
  input: Record<string, unknown>;
  expectedResult: { value: number; unit: string };
  tolerance: { relative: number; absolute: number };
  actualResult: { value: number; unit: string } | null;
  reviewer: string | null;
  validationDate: string | null;
  evidenceRef: string;
};

export type SteelOptimizationCandidate = {
  candidateSectionRef: string;
  proposedBy: "AI" | "OPTIMIZER" | "HUMAN";
  deterministicRecheckRequired: true;
  rechecked: boolean;
  interactionCheckState?: SteelCheckVerdict | null;
  memberCheckState?: SteelCheckVerdict | null;
};

export const STEEL_MEMBER_DESIGN_CHECK_KINDS = [
  "TENSION",
  "COMPRESSION",
  "BENDING_MAJOR",
  "BENDING_MINOR",
  "SHEAR_MAJOR",
  "SHEAR_MINOR",
  "STABILITY_COMPRESSION",
  "STABILITY_LTB",
  "COMBINED_ACTION",
  "WEB_STABILITY",
  "DEFLECTION",
  "OTHER_SERVICEABILITY",
] as const;
export type SteelMemberDesignCheckKind = (typeof STEEL_MEMBER_DESIGN_CHECK_KINDS)[number];

export const STEEL_MEMBER_COMPLETENESS_STATES = [
  "COMPLETE",
  "INCOMPLETE_REQUIRED_INPUT",
  "INCOMPLETE_METHOD_UNAVAILABLE",
  "INCOMPLETE_VALIDATION_REQUIRED",
  "INCOMPLETE_INTERACTION",
  "NOT_APPLICABLE",
] as const;
export type SteelMemberCompletenessState = (typeof STEEL_MEMBER_COMPLETENESS_STATES)[number];

export const STEEL_INCOMPLETE_REASONS = [
  "NOT_APPLICABLE",
  "METHOD_NOT_IMPLEMENTED",
  "VALIDATION_REQUIRED",
  "MISSING_INPUT",
  "INTERACTION_RULE_VALIDATION_REQUIRED",
  "SERVICEABILITY_CRITERION_REQUIRED",
  "STALE_RESULT",
  "UNSUPPORTED_METHOD",
  "CODE_METHOD_UNAVAILABLE",
  "INTERACTION_METHOD_UNAVAILABLE",
  "NATIONAL_ANNEX_REQUIRED",
  "NDP_REQUIRED",
  "STANDARD_EDITION_REQUIRED",
  "STANDARD_CONTEXT_INCOMPLETE",
  "SECTION_CLASSIFICATION_REQUIRED",
  "UNSUPPORTED_SCOPE",
  "DESIGN_METHOD_REQUIRED",
  "LOAD_BASIS_INCOMPATIBLE",
  "STABILITY_METHOD_REQUIRED",
  "LOCAL_BUCKLING_RULE_REQUIRED",
  "INTERACTION_REQUIRED",
  "LOCAL_AMENDMENT_REQUIRED",
  "BUILDING_CODE_CONTEXT_REQUIRED",
  "AISC_EDITION_REQUIRED",
  "EFFECTIVE_LENGTH_REQUIRED",
  "UNBRACED_LENGTH_REQUIRED",
  "LTB_CONTEXT_REQUIRED",
  "LOCAL_AMENDMENT_CONFLICT",
  "ELEMENT_CLASSIFICATION_REQUIRED",
] as const;
export type SteelIncompleteReason = (typeof STEEL_INCOMPLETE_REASONS)[number];

export const STEEL_SERVICEABILITY_CRITERION_SOURCES = [
  "PROJECT_REQUIREMENT",
  "CLIENT_REQUIREMENT",
  "ENGINEERING_DESIGN_CRITERIA",
  "VALIDATED_STANDARD_RULE",
  "NATIONAL_ANNEX_RULE",
  "HUMAN_CONFIRMED_RULE",
  "OTHER_GOVERNED_SOURCE",
  "OTHER_GOVERNED_ENGINEERING_SOURCE",
  "BUILDING_CODE_REQUIREMENT",
  "REFERENCED_STANDARD_RULE",
  "LOCAL_AMENDMENT",
] as const;
export type SteelServiceabilityCriterionSource = (typeof STEEL_SERVICEABILITY_CRITERION_SOURCES)[number];

export const STEEL_SERVICEABILITY_CRITERION_TYPES = ["ABSOLUTE_DISPLACEMENT", "SPAN_RATIO", "OTHER"] as const;
export type SteelServiceabilityCriterionType = (typeof STEEL_SERVICEABILITY_CRITERION_TYPES)[number];

export const STEEL_OTHER_SERVICEABILITY_MODES = [
  "VIBRATION",
  "DRIFT",
  "ROTATION",
  "LOCAL_DEFORMATION",
  "EQUIPMENT_ALIGNMENT",
  "FLOOR_RESPONSE",
  "CLADDING_INTERFACE",
] as const;
export type SteelOtherServiceabilityMode = (typeof STEEL_OTHER_SERVICEABILITY_MODES)[number];

export const STEEL_MEMBER_HUMAN_REVIEW_STATES = ["NOT_REVIEWED", "UNDER_REVIEW", "REVIEWED", "REQUIRES_REVISION"] as const;
export type SteelMemberHumanReviewState = (typeof STEEL_MEMBER_HUMAN_REVIEW_STATES)[number];

export const STEEL_MEMBER_APPROVAL_STATES = ["not_approved", "approved"] as const;
export type SteelMemberApprovalState = (typeof STEEL_MEMBER_APPROVAL_STATES)[number];

export const STEEL_MEMBER_CONFORMANCE_SUMMARY_STATES = [
  "INTENDED_PROFILE",
  "PARTIALLY_TRACEABLE",
  "ENGINEER_CONFIRMED",
  "CONFORMANCE_VALIDATED",
  "CERTIFIED",
] as const;
export type SteelMemberConformanceSummaryState = (typeof STEEL_MEMBER_CONFORMANCE_SUMMARY_STATES)[number];

export type SteelServiceabilityContext = {
  memberRef: string;
  serviceabilityDemandRef: string | null;
  criterionRef: string | null;
  criterionType: SteelServiceabilityCriterionType | null;
  criterionValue: number | null;
  criterionUnits: string | null;
  criterionSource: SteelServiceabilityCriterionSource | null;
  loadCaseOrCombinationRef: string | null;
  projectRequirementRef: string | null;
  standardProfileRef: string | null;
  evidenceRef: string | null;
  provenanceRef: EosGlobalProvenanceContract | null;
  validationState: string;
  spanM: number | null;
};

export type SteelServiceabilityResult = {
  resultId: string;
  memberRef: string;
  demandRef: string | null;
  criterionRef: string | null;
  criterionSource: SteelServiceabilityCriterionSource | null;
  loadContextRef: string | null;
  actualValue: number | null;
  actualUnits: string | null;
  allowableValue: number | null;
  allowableUnits: string | null;
  ratio: number | null;
  checkState: SteelCheckVerdict;
  reason: string;
  technicalBasisRef: string;
  standardProfileRef: string;
  standardConformanceState: SteelStandardConformanceState;
  provenanceRef: EosGlobalProvenanceContract | null;
  humanReviewState: "required";
};

export type SteelMemberDesignCheckRow = {
  checkKind: SteelMemberDesignCheckKind;
  applicable: boolean;
  state: SteelCheckVerdict | null;
  completeness: SteelMemberCompletenessState;
  incompleteReason: SteelIncompleteReason | null;
  checkRef: string | null;
  utilization: number | null;
  utilizationComparable: boolean;
  reportLanguage: string;
  methodMaturity: SteelMethodMaturity | null;
  authority?: "MECHANICS_REFERENCE" | "CODE_PROFILE" | "GOVERNED";
};

export type SteelMemberDesignFingerprint = {
  sectionRef: string;
  materialRef: string;
  demandResultId: string;
  combinationId: string | null;
  effectiveLengthMajorM: number | null;
  effectiveLengthMinorM: number | null;
  unbracedLengthM: number | null;
  standardContextId: string;
  criterionRef: string | null;
  methodVersions: Record<string, string>;
  nationalAnnexId?: string | null;
  ndpSetRef?: string | null;
  edition?: string | null;
  generationFamily?: string | null;
  restraintDescription?: string | null;
  designMethod?: "LRFD" | "ASD" | null;
  stabilityMethod?: string | null;
  classificationState?: string | null;
  buildingCodeEdition?: string | null;
  localAmendmentSetRef?: string | null;
  aiscEdition?: string | null;
};

export type SteelMemberInvalidationTag =
  | "SECTION_CHANGED"
  | "MATERIAL_CHANGED"
  | "LOAD_CHANGED"
  | "UNBRACED_LENGTH_CHANGED"
  | "EFFECTIVE_LENGTH_CHANGED"
  | "SERVICEABILITY_CRITERION_CHANGED"
  | "STANDARD_PROFILE_CHANGED"
  | "NATIONAL_ANNEX_CHANGED"
  | "NDP_CHANGED"
  | "EDITION_CHANGED"
  | "GENERATION_CHANGED"
  | "RESTRAINT_CHANGED"
  | "DESIGN_METHOD_CHANGED"
  | "STABILITY_METHOD_CHANGED"
  | "CLASSIFICATION_CHANGED"
  | "BUILDING_CODE_EDITION_CHANGED"
  | "LOCAL_AMENDMENT_CHANGED"
  | "AISC_EDITION_CHANGED";

export type SteelOptimizationHandoff = {
  satisfiedChecks: SteelMemberDesignCheckKind[];
  failedChecks: SteelMemberDesignCheckKind[];
  undeterminedChecks: SteelMemberDesignCheckKind[];
  governingCheckKind: SteelMemberDesignCheckKind | null;
  sectionRef: string;
  materialRef: string;
  serviceabilityState: SteelCheckVerdict | null;
  interactionCompleteness: SteelMemberCompletenessState;
  validationState: string;
  optimizationImplemented: false;
};

export type SteelMemberDesignRecord = {
  designRecordId: string;
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  standardProfileRef: string;
  demandSetRef: string;
  loadCombinationRefs: string[];
  strengthCheckRefs: string[];
  stabilityCheckRefs: string[];
  interactionCheckRefs: string[];
  serviceabilityCheckRefs: string[];
  applicableCheckRegistry: SteelMemberDesignCheckKind[];
  completenessMatrix: SteelMemberDesignCheckRow[];
  governingCheckRef: string | null;
  governingCheckKind: SteelMemberDesignCheckKind | null;
  completenessState: SteelMemberCompletenessState;
  engineeringCheckState: SteelCheckVerdict;
  standardConformanceState: SteelMemberConformanceSummaryState;
  implementationMaturity: typeof AU_STEEL_IMPLEMENTATION_MATURITY | typeof EU_STEEL_IMPLEMENTATION_MATURITY | typeof US_STEEL_IMPLEMENTATION_MATURITY;
  humanReviewState: SteelMemberHumanReviewState;
  approvalState: SteelMemberApprovalState;
  evidenceRefs: StructuralEvidenceBinding[];
  provenanceRef: EosGlobalProvenanceContract;
  createdAt: string;
  version: number;
  fingerprint: SteelMemberDesignFingerprint;
  invalidationTags: SteelMemberInvalidationTag[];
  serviceabilityResult: SteelServiceabilityResult | null;
  optimizationHandoff: SteelOptimizationHandoff;
  connectionDesignInScope: false;
  foundationAdequacyInScope: false;
  generalFeaClaimed: false;
  as4100CompliantClaim: false;
  reportLanguage: string;
};

export const EU_MECHANICS_COMPLETENESS_STATES = [
  "COMPLETE_FOR_AVAILABLE_MECHANICS",
  "INCOMPLETE_MECHANICS_INPUT",
  "MECHANICS_METHOD_UNAVAILABLE",
  "NOT_APPLICABLE",
] as const;
export type EuMechanicsCompletenessState = (typeof EU_MECHANICS_COMPLETENESS_STATES)[number];

export type EurocodeSteelServiceabilityContext = SteelServiceabilityContext & {
  standardContextRef: string;
  standardPartRefs: readonly string[];
  nationalAnnexRef: string | null;
  ndpRefs: readonly string[];
  technicalBasisRef: string | null;
  criterionRequiresNdp: boolean;
  criterionRequiresAnnex: boolean;
};

export type EurocodeSteelMemberDesignRecord = SteelMemberDesignRecord & {
  standardContextRef: string;
  mechanicsResultRefs: readonly string[];
  codeProfileCapacityRefs: readonly string[];
  mechanicsEvaluationState: EuMechanicsCompletenessState;
  codeDesignCheckState: SteelCheckVerdict;
  overallEngineeringCheckState: SteelCheckVerdict;
  governingIssueRef: string | null;
  governingValidatedCheckRef: string | null;
  numericalValidationState: "NOT_APPLICABLE" | "VALIDATION_REQUIRED";
  engineeringValidationState: "VALIDATION_REQUIRED";
  eurocodeCompliantClaim: false;
  nationalAnnexRef: string | null;
  ndpSetRef: string | null;
  standardPartRefs: readonly string[];
  edition: string;
  generationFamily: string | null;
  releaseClassification: typeof EU_STEEL_RELEASE_CLASSIFICATION;
};

export const AU_METHOD_CLASSIFICATIONS = [
  "ENGINEERING_MECHANICS_REFERENCE",
  "DETERMINISTIC_CAPACITY_METHOD",
  "STABILITY_REFERENCE",
  "SERVICEABILITY_METHOD",
  "CODE_PROFILE_METHOD",
  "INTERACTION_METHOD",
] as const;
export type AuMethodClassification = (typeof AU_METHOD_CLASSIFICATIONS)[number];

export const AU_NUMERICAL_VALIDATION_STATES = ["PASS", "PARTIAL", "FAIL", "NOT_APPLICABLE"] as const;
export type AuNumericalValidationState = (typeof AU_NUMERICAL_VALIDATION_STATES)[number];

export const AU_ENGINEERING_VALIDATION_STATES = ["VALIDATION_REQUIRED", "ENGINEER_VALIDATED", "REJECTED"] as const;
export type AuEngineeringValidationState = (typeof AU_ENGINEERING_VALIDATION_STATES)[number];

export const AU_PRODUCT_CLAIM_LEVELS = [
  "REFERENCE_CAPABILITY",
  "BENCHMARKED_ENGINEERING_CAPABILITY",
  "BOUNDED_ENGINEER_VALIDATED_CAPABILITY",
  "BOUNDED_CONFORMANCE_VALIDATED_CAPABILITY",
  "CERTIFIED_DESIGN_CAPABILITY",
] as const;
export type AuProductClaimLevel = (typeof AU_PRODUCT_CLAIM_LEVELS)[number];

export const AU_RELEASE_CLASSIFICATIONS = [
  "INTERNAL_ENGINEERING_REFERENCE",
  "CONTROLLED_ENGINEERING_PREVIEW",
  "CONTROLLED_PILOT",
  "GENERAL_AVAILABILITY",
  "CERTIFIED_ENGINEERING_USE",
] as const;
export type AuReleaseClassification = (typeof AU_RELEASE_CLASSIFICATIONS)[number];

export const AU_VALIDATION_PRIORITIES = [
  "SAFETY_CRITICAL",
  "CONFORMANCE_CRITICAL",
  "COMMERCIAL_RELEASE_CRITICAL",
  "ENHANCEMENT",
] as const;
export type AuValidationPriority = (typeof AU_VALIDATION_PRIORITIES)[number];

export type AuMethodValidationRecord = {
  methodId: string;
  category: string;
  purpose: string;
  technicalBasis: string;
  authorityType: EngineeringRuleAuthorityType;
  implementationVersion: string;
  inputs: string[];
  outputs: string;
  benchmarkRefs: string[];
  numericalValidationState: AuNumericalValidationState;
  engineeringValidationState: AuEngineeringValidationState;
  standardProfile: "AS4100";
  standardConformanceState: SteelStandardConformanceState;
  classifications: AuMethodClassification[];
  supportedScope: string;
  unsupportedScope: string;
  humanReviewRequirement: "required";
};

export type AuSteelValidationMatrixRow = {
  capability: string;
  implemented: boolean;
  benchmarked: boolean;
  engineerValidated: boolean;
  conformanceValidated: boolean;
  certified: boolean;
  limitation: string;
};

export type AuMethodEngineeringConfirmation = {
  methodRef: string;
  validationScope: string;
  reviewOutcome: "CONFIRMED" | "REJECTED" | "REQUIRES_REVISION";
  evidenceRefs: string[];
  reviewedAt: string;
  reviewerAuthorityRef: string;
  projectApprovalImplied: false;
  professionalCertificationImplied: false;
  softwareCertificationImplied: false;
};

export type AuThirdPartyValidationRecord = {
  software: string;
  version: string;
  analysisOrDesignMode: string;
  inputs: Record<string, unknown>;
  standardProfileSetting: string;
  outputCompared: { value: number; unit: string };
  difference: number | null;
  tolerance: { relative: number; absolute: number };
  reviewState: string;
};

export type AuValidationDebtItem = {
  debtId: string;
  description: string;
  priority: AuValidationPriority;
};

export const EU_METHOD_CLASSIFICATIONS = [
  "ENGINEERING_MECHANICS_REFERENCE",
  "DETERMINISTIC_CAPACITY_METHOD",
  "STABILITY_REFERENCE",
  "CODE_PROFILE_METHOD",
  "INTERACTION_METHOD",
  "SERVICEABILITY_METHOD",
  "ORCHESTRATION_METHOD",
] as const;
export type EuMethodClassification = (typeof EU_METHOD_CLASSIFICATIONS)[number];

export const EU_PRODUCT_CLAIM_LEVELS = [
  "REFERENCE_CAPABILITY",
  "BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY",
  "BOUNDED_ENGINEER_VALIDATED_CAPABILITY",
  "BOUNDED_CONFORMANCE_VALIDATED_CAPABILITY",
  "CERTIFIED_DESIGN_CAPABILITY",
] as const;
export type EuProductClaimLevel = (typeof EU_PRODUCT_CLAIM_LEVELS)[number];

export type EuMethodValidationRecord = {
  methodId: string;
  category: string;
  methodType: EuMethodClassification;
  technicalBasis: string;
  authorityType: EngineeringRuleAuthorityType;
  standardFamily: "EUROCODE";
  standardPart: string;
  editionRequirement: typeof EUROCODE_UNKNOWN_EDITION_TOKEN;
  nationalAnnexDependency: "REQUIRED" | "OPTIONAL" | "NOT_REQUIRED" | "NDP_REQUIRED";
  ndpDependency: boolean;
  requiredInputs: string[];
  supportedScope: string;
  unsupportedScope: string;
  implementationVersion: string;
  benchmarkRefs: string[];
  numericalValidationState: AuNumericalValidationState;
  engineeringValidationState: AuEngineeringValidationState;
  standardConformanceState: SteelStandardConformanceState;
  humanReviewRequirement: "required";
  classifications: EuMethodClassification[];
};

export type EuSteelValidationMatrixRow = {
  capability: string;
  implemented: boolean;
  numericallyValidated: boolean;
  engineerValidated: boolean;
  codeProfileImplemented: boolean;
  conformanceValidated: boolean;
  certified: boolean;
  limitation: string;
};

export type EuMethodEngineeringConfirmation = {
  methodRef: string;
  validationScope: string;
  reviewOutcome: "CONFIRMED" | "REJECTED" | "REQUIRES_REVISION";
  evidenceRefs: string[];
  reviewedAt: string;
  reviewerAuthorityRef: string;
  projectApprovalImplied: false;
  professionalCertificationImplied: false;
  softwareCertificationImplied: false;
};

export type EuThirdPartyValidationRecord = {
  software: string;
  version: string;
  standardProfile: string;
  nationalAnnex: string | null;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  difference: number | null;
  tolerance: { relative: number; absolute: number };
  reviewState: string;
};

export type EuValidationDebtItem = {
  debtId: string;
  description: string;
  priority: AuValidationPriority;
};

export const EUROCODE_FAMILY_IDS = [
  "EN_1990",
  "EN_1991",
  "EN_1992",
  "EN_1993",
  "EN_1994",
  "EN_1995",
  "EN_1996",
  "EN_1997",
  "EN_1998",
  "EN_1999",
] as const;
export type EurocodeFamilyId = (typeof EUROCODE_FAMILY_IDS)[number];

export const EN1993_PART_IDS = [
  "EN_1993_1_1",
  "EN_1993_1_5",
  "EN_1993_1_8",
  "EN_1993_1_9",
  "EN_1993_1_10",
  "EN_1993_1_12",
] as const;
export type En1993PartId = (typeof EN1993_PART_IDS)[number];

export const EUROCODE_GENERATION_FAMILIES = [
  "FIRST_GENERATION",
  "SECOND_GENERATION",
  "UNKNOWN_PENDING_CONFIRMATION",
] as const;
export type EurocodeGenerationFamily = (typeof EUROCODE_GENERATION_FAMILIES)[number];

export const EUROCODE_PART_IMPLEMENTATION_STATES = [
  "REGISTERED_ARCHITECTURE",
  "NOT_IMPLEMENTED",
  "FRAMEWORK_ONLY",
] as const;
export type EurocodePartImplementationState = (typeof EUROCODE_PART_IMPLEMENTATION_STATES)[number];

export const EUROCODE_RESOLVER_FAIL_REASONS = [
  "STANDARD_EDITION_REQUIRED",
  "NATIONAL_ANNEX_REQUIRED",
  "NATIONAL_ANNEX_MISMATCH",
  "NDP_REQUIRED",
  "STANDARD_PART_UNSUPPORTED",
  "STANDARD_VERSION_CONFLICT",
  "USER_LOCATION_INFERENCE_DENIED",
  "AI_AUTHORITY_DENIED",
  "HUMAN_CONFIRMATION_REQUIRED",
  "RULE_AUTHORITY_DENIED",
] as const;
export type EurocodeResolverFailReason = (typeof EUROCODE_RESOLVER_FAIL_REASONS)[number];

export type EurocodeStandardVersion = {
  standardIdentifier: string;
  generationFamily: EurocodeGenerationFamily;
  edition: string;
  publicationDate: string | null;
  amendment: string | null;
  corrigendum: string | null;
  supersessionState: StructuralStandardLifecycle | "UNKNOWN_PENDING_CONFIRMATION";
  effectiveDate: string | null;
};

export type EurocodeNationalAnnex = {
  nationalAnnexId: string;
  countryCode: string;
  standardPartRef: En1993PartId | string;
  edition: string;
  publicationDate: string | null;
  amendment: string | null;
  effectiveDate: string | null;
  status: string;
  nationalParameterSetRef: string | null;
  sourceAuthorityRef: string;
  validationState: string;
  generationFamily: EurocodeGenerationFamily;
};

export type EurocodeNdpRecord = {
  parameterId: string;
  standardPartRef: En1993PartId | string;
  ruleRef: string;
  nationalAnnexRef: string | null;
  country: string;
  value: number | string | null;
  units: string | null;
  applicability: string;
  sourceAuthorityRef: string;
  validationState: string;
  effectiveDate: string | null;
  version: string;
};

export type EurocodeStandardSourceReference = {
  sourceIdentifier: string;
  publisher: string;
  standardIdentifier: string;
  edition: string | null;
  part: string | null;
  referenceIdentifier: string;
  validationState: string;
  contentEmbedded: false;
};

export type EurocodeStandardContextConfirmation = {
  jurisdictionConfirmed: boolean;
  generationConfirmed: boolean;
  partConfirmed: boolean;
  editionConfirmed: boolean;
  nationalAnnexConfirmed: boolean;
  projectExceptionsConfirmed: boolean;
  confirmedAt: string;
  reviewerAuthorityRef: string;
  aiConfirmed: false;
  engineeringApprovalImplied: false;
};

export type EurocodeSteelDesignContext = {
  contextId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assetId: string | null;
  jurisdictionProfileRef: string;
  countryCode: string;
  standardFamily: "EUROCODE";
  standardPart: En1993PartId | string;
  standardCode: string;
  version: EurocodeStandardVersion;
  nationalAnnex: EurocodeNationalAnnex | null;
  ndpSet: readonly EurocodeNdpRecord[];
  materialSourceKind: "MATERIAL_STANDARD" | "PRODUCT_STANDARD" | "SECTION_CATALOGUE" | "PROJECT_SPECIFICATION" | "UNBOUND";
  sectionCatalogRef: string | null;
  projectContextRef: string | null;
  calculationContextRef: string | null;
  sourceAuthorityRef: string;
  intendedStandardProfile: "EN1993";
  standardConformanceState: SteelStandardConformanceState;
  validationState: string;
  provenanceRef: string;
  issued: boolean;
  humanConfirmation: EurocodeStandardContextConfirmation | null;
  piiPresent: false;
};

export type EurocodeProjectStandardContext = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  jurisdictionProfileRef: string;
  countryCode: string | null;
  generationFamily: EurocodeGenerationFamily;
  governingParts: readonly string[];
  nationalAnnexSet: readonly EurocodeNationalAnnex[];
  projectSpecificGovernedParameters: readonly EurocodeNdpRecord[];
  designBasisReference: string | null;
  workspaceGlobalAnnexId: null;
};

export type EurocodeSteelResolverInput = {
  projectContext: EurocodeProjectStandardContext | null;
  explicitCalculationContext: EurocodeSteelDesignContext | null;
  issuedContext: EurocodeSteelDesignContext | null;
  requestedMethodId: string;
  requestedPartId: En1993PartId | string;
  requiredNdpIds: readonly string[];
  ruleRequiresNdp: boolean;
  source: "explicit" | "project_default" | "locale" | "ip" | "browser_locale" | "physical_location" | "tenant_address" | "ai";
  aiSelectedAnnex: boolean;
  aiSuppliedNdp: boolean;
  aiInferredEdition: boolean;
  aiClaimedConformance: boolean;
  humanConfirmed: boolean;
  ruleAuthorityType: EngineeringRuleAuthorityType | ForbiddenEngineeringRuleAuthority | string;
};

export type EurocodeSteelResolverResult =
  | { ok: true; context: EurocodeSteelDesignContext; failReason: null }
  | { ok: false; context: null; failReason: EurocodeResolverFailReason; detail: string; checkState: "CHECK_UNDETERMINED" };

export const EU_TENSION_METHOD_SCOPE_STATES = [
  "GOVERNED_IMPLEMENTABLE",
  "MECHANICS_REFERENCE_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type EuTensionMethodScopeState = (typeof EU_TENSION_METHOD_SCOPE_STATES)[number];

export type EuTensionMethodRecord = SteelEngineeringRule & {
  methodType: "ENGINEERING_MECHANICS_REFERENCE" | "EUROCODE_PROFILE_CAPACITY";
  standardPartRef: En1993PartId;
  ndpDependencies: readonly string[];
  ruleRequiresNdp: boolean;
  compatibleGenerations: readonly EurocodeGenerationFamily[];
  scopeState: EuTensionMethodScopeState;
};

export type EurocodeSteelTensionContext = {
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  axialDemandRef: string;
  standardContextRef: string;
  standardPartRef: En1993PartId | string;
  nationalAnnexRef: string | null;
  ndpSetRef: string | null;
  engineeringRuleRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  provenanceRef: string;
  validationState: string;
  conformanceState: SteelStandardConformanceState;
};

export const EU_COMPRESSION_METHOD_SCOPE_STATES = [
  "GOVERNED_IMPLEMENTABLE",
  "MECHANICS_REFERENCE_ONLY",
  "FRAMEWORK_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type EuCompressionMethodScopeState = (typeof EU_COMPRESSION_METHOD_SCOPE_STATES)[number];

export const EU_SECTION_CLASSIFICATION_STATES = [
  "CLASSIFIED",
  "VALIDATION_REQUIRED",
  "NOT_REQUIRED",
  "UNSUPPORTED",
] as const;
export type EuSectionClassificationState = (typeof EU_SECTION_CLASSIFICATION_STATES)[number];

export type EuCompressionMethodRecord = SteelEngineeringRule & {
  methodType: "ENGINEERING_MECHANICS_REFERENCE" | "EUROCODE_PROFILE_MEMBER_CAPACITY";
  standardPartRef: En1993PartId;
  ndpDependencies: readonly string[];
  annexDependency: "ANNEX_REQUIRED" | "NDP_REQUIRED" | "ANNEX_OPTIONAL" | "NO_ANNEX_DEPENDENCY";
  ruleRequiresNdp: boolean;
  axis: SteelBucklingAxis | "SQUASH" | "CLASSIFICATION" | "BUCKLING_CURVE";
  compatibleGenerations: readonly EurocodeGenerationFamily[];
  scopeState: EuCompressionMethodScopeState;
};

export type EurocodeSteelCompressionContext = {
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  compressionDemandRef: string;
  memberLengthM: number;
  effectiveLengthMajorM: number | null;
  effectiveLengthMinorM: number | null;
  bucklingAxes: SteelBucklingAxis[];
  restraintContext: string;
  standardContextRef: string;
  standardPartRef: En1993PartId | string;
  nationalAnnexRef: string | null;
  ndpSetRef: string | null;
  engineeringRuleRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  validationState: string;
  conformanceState: SteelStandardConformanceState;
  provenanceRef: string;
  effectiveLengthProvenanceRef: string;
  sectionClassificationState: EuSectionClassificationState;
};

export type EuBucklingCurveRecord = {
  curveId: string;
  axis: SteelBucklingAxis;
  sectionFamily: string | null;
  fabricationContext: string | null;
  materialContext: string | null;
  standardPart: string;
  edition: string;
  nationalAnnexContext: string | null;
  engineeringRuleRef: string;
  validationState: "FRAMEWORK_ONLY";
  coefficientsPopulated: false;
};

export type EuCodeSlendernessContext = {
  state: "VALIDATION_REQUIRED";
  ruleGuessed: false;
  normalization: null;
  referenceResistance: null;
};

export const EU_BENDING_METHOD_SCOPE_STATES = [
  "GOVERNED_IMPLEMENTABLE",
  "MECHANICS_REFERENCE_ONLY",
  "FRAMEWORK_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type EuBendingMethodScopeState = (typeof EU_BENDING_METHOD_SCOPE_STATES)[number];

export const EU_SECTION_RESISTANCE_CLASSES = ["ELASTIC", "PLASTIC", "EFFECTIVE"] as const;
export type EuSectionResistanceClass = (typeof EU_SECTION_RESISTANCE_CLASSES)[number];

export type EuBendingMethodRecord = SteelEngineeringRule & {
  methodType: "ENGINEERING_MECHANICS_REFERENCE" | "EUROCODE_PROFILE_SECTION_CAPACITY" | "EUROCODE_PROFILE_MEMBER_CAPACITY";
  standardPartRef: En1993PartId;
  ndpDependencies: readonly string[];
  annexDependency: "ANNEX_REQUIRED" | "NDP_REQUIRED" | "ANNEX_OPTIONAL" | "NO_ANNEX_DEPENDENCY";
  ruleRequiresNdp: boolean;
  axis: "MAJOR_AXIS" | "MINOR_AXIS" | "LTB" | "CLASSIFICATION" | "SECTION";
  compatibleGenerations: readonly EurocodeGenerationFamily[];
  scopeState: EuBendingMethodScopeState;
};

export type EurocodeSteelBendingContext = {
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  momentDemandRefs: readonly string[];
  bendingAxis: "MAJOR_AXIS" | "MINOR_AXIS";
  memberLengthM: number | null;
  unbracedLengthM: number | null;
  unbracedLengthProvenanceRef: string | null;
  restraintContext: string | null;
  lateralRestraint: string | null;
  torsionalRestraint: string | null;
  warpingRestraint: string | null;
  momentDistributionContext: string | null;
  loadApplicationContext: string | null;
  standardContextRef: string;
  standardPartRef: En1993PartId | string;
  nationalAnnexRef: string | null;
  ndpSetRef: string | null;
  engineeringRuleRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  validationState: string;
  conformanceState: SteelStandardConformanceState;
  provenanceRef: string;
  sectionClassificationState: EuSectionClassificationState;
  sectionResistanceClassState: "VALIDATION_REQUIRED";
};

export const EU_SHEAR_METHOD_SCOPE_STATES = [
  "GOVERNED_IMPLEMENTABLE",
  "MECHANICS_REFERENCE_ONLY",
  "FRAMEWORK_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type EuShearMethodScopeState = (typeof EU_SHEAR_METHOD_SCOPE_STATES)[number];

export type EuShearMethodRecord = SteelEngineeringRule & {
  methodType: "ENGINEERING_MECHANICS_REFERENCE" | "EUROCODE_PROFILE_SHEAR_CAPACITY" | "EUROCODE_PROFILE_WEB_STABILITY_CAPACITY";
  standardPartRef: En1993PartId;
  ndpDependencies: readonly string[];
  annexDependency: "ANNEX_REQUIRED" | "NDP_REQUIRED" | "ANNEX_OPTIONAL" | "NO_ANNEX_DEPENDENCY";
  ruleRequiresNdp: boolean;
  axis: "MAJOR_SHEAR" | "MINOR_SHEAR" | "SHEAR" | "WEB" | "PANEL";
  compatibleGenerations: readonly EurocodeGenerationFamily[];
  scopeState: EuShearMethodScopeState;
};

export type EurocodeSteelShearContext = {
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  shearDemandRefs: readonly string[];
  shearAxis: SteelShearAxis;
  sectionGeometry: string | null;
  webGeometry: { clearWebDepth: number | null; webThickness: number | null };
  shearAreaContext: "GOVERNED_EXPLICIT";
  stiffenerContext: SteelShearStiffenerState;
  panelContext: {
    panelLengthM: number | null;
    stiffenerSpacingM: number | null;
    boundaryMetadata: string | null;
  };
  webSlenderness: SteelWebSlendernessContext;
  standardContextRef: string;
  standardPartRef: En1993PartId | string;
  standardPartRefs: readonly En1993PartId[];
  nationalAnnexRef: string | null;
  ndpSetRef: string | null;
  engineeringRuleRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  validationState: string;
  conformanceState: SteelStandardConformanceState;
  provenanceRef: string;
};

export const EU_INTERACTION_METHOD_SCOPE_STATES = [
  "GOVERNED_IMPLEMENTABLE",
  "MECHANICS_REFERENCE_ONLY",
  "FRAMEWORK_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type EuInteractionMethodScopeState = (typeof EU_INTERACTION_METHOD_SCOPE_STATES)[number];

export type EuInteractionMethodRecord = SteelEngineeringRule & {
  methodType: "EUROCODE_PROFILE_COMBINED_ACTION";
  interactionType: SteelInteractionType;
  standardPartRef: En1993PartId;
  standardPartRefs: readonly En1993PartId[];
  ndpDependencies: readonly string[];
  annexDependency: "ANNEX_REQUIRED" | "NDP_REQUIRED" | "ANNEX_OPTIONAL" | "NO_ANNEX_DEPENDENCY";
  ruleRequiresNdp: boolean;
  classificationDependency: "REQUIRED" | "NOT_REQUIRED";
  stabilityDependency: "REQUIRED" | "NOT_REQUIRED";
  compatibleGenerations: readonly EurocodeGenerationFamily[];
  scopeState: EuInteractionMethodScopeState;
};

export type EurocodeSteelCombinedActionContext = {
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  axialDemandRef: string | null;
  majorMomentDemandRef: string | null;
  minorMomentDemandRef: string | null;
  majorShearDemandRef: string | null;
  minorShearDemandRef: string | null;
  componentCapacityRefs: readonly string[];
  componentMechanicsRefs: readonly string[];
  compressionStabilityContextRef: string | null;
  bendingStabilityContextRef: string | null;
  sectionClassificationRef: EuSectionClassificationState;
  interactionRuleRef: string | null;
  standardContextRef: string;
  standardPartRefs: readonly En1993PartId[];
  nationalAnnexRef: string | null;
  ndpSetRef: string | null;
  technicalBasisRef: string;
  provenance: string;
  validationState: string;
  conformanceState: SteelStandardConformanceState;
};

export type SteelDemandCapacitySeparation = StructuralDemandResult["capacityPresent"];

export const US_STEEL_ECOSYSTEM_IDS = [
  "AISC_360",
  "AISC_341",
  "ASCE_7",
  "IBC",
  "ASTM_MATERIAL",
  "RCSC",
  "AISC_358",
] as const;
export type UsSteelEcosystemId = (typeof US_STEEL_ECOSYSTEM_IDS)[number];

export const US_DESIGN_METHODS = ["LRFD", "ASD"] as const;
export type UsDesignMethod = (typeof US_DESIGN_METHODS)[number];

export const US_UNIT_SYSTEMS = ["US_CUSTOMARY", "SI"] as const;
export type UsUnitSystem = (typeof US_UNIT_SYSTEMS)[number];

export const US_SOURCE_PRECEDENCE_KINDS = [
  "MANDATORY_ADOPTED_CODE",
  "REFERENCED_STANDARD",
  "LOCAL_AMENDMENT",
  "CONTRACT_REQUIREMENT",
  "OWNER_PROJECT_STANDARD",
  "ENGINEERING_APPROVED_EXCEPTION",
] as const;
export type UsSourcePrecedenceKind = (typeof US_SOURCE_PRECEDENCE_KINDS)[number];

export const US_RESOLVER_FAIL_REASONS = [
  "AISC_EDITION_REQUIRED",
  "DESIGN_METHOD_REQUIRED",
  "BUILDING_CODE_CONTEXT_REQUIRED",
  "LOAD_STANDARD_CONTEXT_REQUIRED",
  "LOCAL_AMENDMENT_CONFLICT",
  "SEISMIC_CONTEXT_REQUIRED",
  "STANDARD_VERSION_CONFLICT",
  "UNSUPPORTED_STANDARD_PROFILE",
  "STANDARD_CONTEXT_CONFLICT",
  "USER_LOCATION_INFERENCE_DENIED",
  "AI_AUTHORITY_DENIED",
  "HUMAN_CONFIRMATION_REQUIRED",
  "RULE_AUTHORITY_DENIED",
] as const;
export type UsResolverFailReason = (typeof US_RESOLVER_FAIL_REASONS)[number];

export type UsStandardVersion = {
  publisher: string;
  standardFamily: string;
  standardIdentifier: string;
  edition: string;
  publicationDate: string | null;
  amendment: string | null;
  errata: string | null;
  supersessionState: StructuralStandardLifecycle | "UNKNOWN_PENDING_CONFIRMATION";
  effectiveDate: string | null;
};

export type BuildingCodeAdoptionContext = {
  adoptionId: string;
  jurisdiction: string;
  adoptingAuthority: string;
  buildingCodeFamily: string;
  buildingCodeEdition: string;
  effectiveDate: string | null;
  localAmendmentSetRef: string | null;
  referencedStandards: readonly string[];
  projectOverrideRefs: readonly string[];
  validationState: string;
  sourceAuthorityRef: string;
};

export type UsLocalAmendment = {
  amendmentSetId: string;
  jurisdiction: string;
  authority: string;
  baseCodeRef: string;
  editionCompatibility: string;
  effectiveDate: string | null;
  ruleOverrides: readonly Record<string, never>[];
  sourceAuthorityRef: string;
  validationState: string;
};

export type UsLoadStandardDependency = {
  standardId: "ASCE_7" | string;
  standardCode: string;
  edition: string;
  combinationBasis: "STRENGTH" | "ALLOWABLE" | "UNKNOWN_PENDING_CONFIRMATION";
  implemented: false;
};

export type UsSeismicDependency = {
  applicable: boolean;
  standardId: "AISC_341" | string;
  standardCode: string;
  edition: string;
  implemented: false;
};

export type UsProjectOverride = {
  overrideId: string;
  sourceExplicit: boolean;
  authorityExplicit: boolean;
  scopeExplicit: boolean;
  conflictBehavior: "FAIL_CLOSED" | "REQUIRE_HUMAN_CONFIRMATION";
  humanConfirmation: boolean;
};

export type UsStandardContextConfirmation = {
  jurisdictionConfirmed: boolean;
  adoptedCodeConfirmed: boolean | "NOT_APPLICABLE";
  aiscEditionConfirmed: boolean;
  designMethodConfirmed: boolean;
  asceLoadStandardConfirmed: boolean;
  seismicApplicabilityConfirmed: boolean;
  localAmendmentsConfirmed: boolean;
  projectExceptionsConfirmed: boolean;
  confirmedAt: string;
  reviewerAuthorityRef: string;
  aiConfirmed: false;
  engineeringApprovalImplied: false;
};

export type USSteelDesignContext = {
  contextId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assetId: string | null;
  jurisdictionProfileRef: string;
  buildingCodeAdoptionRef: string | null;
  buildingCodeAdoption: BuildingCodeAdoptionContext | null;
  steelStandardFamily: "AISC";
  steelStandardId: string;
  steelStandardCode: string;
  edition: string;
  amendmentErrataState: string;
  designMethod: UsDesignMethod | null;
  unitSystem: UsUnitSystem;
  referencedStandardRefs: readonly string[];
  localAmendmentSetRef: string | null;
  localAmendment: UsLocalAmendment | null;
  loadStandard: UsLoadStandardDependency | null;
  seismicApplicable: boolean;
  seismicStandard: UsSeismicDependency | null;
  connectionStandardRefs: readonly string[];
  materialSourceKind: "ASTM" | "MANUFACTURER_CATALOG" | "PROJECT_SPECIFICATION" | "ENGINEERING_DATABASE" | "UNBOUND";
  sectionCatalogRef: string | null;
  projectStandardContextRef: string | null;
  calculationContextRef: string | null;
  engineeringRuleAuthorityRefs: readonly string[];
  projectOverride: UsProjectOverride | null;
  sourcePrecedence: readonly UsSourcePrecedenceKind[];
  intendedStandardProfile: "AISC360";
  standardConformanceState: SteelStandardConformanceState;
  validationState: string;
  provenanceRef: string;
  issued: boolean;
  humanConfirmation: UsStandardContextConfirmation | null;
  piiPresent: false;
  directContractProfile: boolean;
};

export type UsProjectStandardContext = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  jurisdictionProfileRef: string;
  buildingCodeFamily: string | null;
  buildingCodeEdition: string | null;
  aiscEdition: string;
  designMethod: UsDesignMethod | null;
  unitSystem: UsUnitSystem;
  asceEdition: string;
  seismicApplicable: boolean;
  seismicEdition: string | null;
  localAmendmentSetRef: string | null;
  directContractProfile: boolean;
  workspaceGlobalCodeProfileId: null;
  designBasisReference: string | null;
};

export type UsSteelResolverInput = {
  projectContext: UsProjectStandardContext | null;
  explicitCalculationContext: USSteelDesignContext | null;
  issuedContext: USSteelDesignContext | null;
  adoptionRequired: boolean;
  loadStandardRequired: boolean;
  ruleRequiresSeismic: boolean;
  enforceLoadMethodCompatibility: boolean;
  unresolvedSourceConflict: boolean;
  collapseDesignMethodFromUnits: boolean;
  convertLrfdToAsdSilently: boolean;
  convertAsdToLrfdSilently: boolean;
  source: "explicit" | "project_default" | "locale" | "ip" | "browser_locale" | "physical_location" | "tenant_address" | "ai";
  aiSelectedEdition: boolean;
  aiSelectedDesignMethod: boolean;
  aiInventedAmendment: boolean;
  aiClaimedConformance: boolean;
  ruleAuthorityType?: string;
  humanConfirmationRequired: boolean;
};

export type UsSteelResolverResult =
  | { ok: true; context: USSteelDesignContext; failReason: null }
  | { ok: false; context: null; failReason: UsResolverFailReason; detail: string; checkState: "CHECK_UNDETERMINED" };

export type UsStandardSourceReference = {
  sourceId: string;
  publisher: string;
  standardId: string;
  edition: string | null;
  referenceIdentifier: string;
  effectiveDate: string | null;
  authorityType: EngineeringRuleAuthorityType;
  validationState: string;
  contentEmbedded: false;
};

export const US_TENSION_METHOD_SCOPE_STATES = [
  "GOVERNED_IMPLEMENTABLE",
  "MECHANICS_REFERENCE_ONLY",
  "FRAMEWORK_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type UsTensionMethodScopeState = (typeof US_TENSION_METHOD_SCOPE_STATES)[number];

export type UsTensionMethodRecord = SteelEngineeringRule & {
  methodType: "ENGINEERING_MECHANICS_REFERENCE" | "AISC_LRFD_DESIGN_STRENGTH" | "AISC_ASD_ALLOWABLE_STRENGTH" | "NOMINAL_STRENGTH_REFERENCE";
  aiscEditionRequirement: string;
  designMethodApplicability: "LRFD" | "ASD" | "BOTH";
  loadBasisRequirement: "STRENGTH" | "ALLOWABLE" | "NONE";
  factorDependencies: readonly string[];
  localAmendmentDependencies: readonly string[];
  sectionPropertyDependencies: readonly string[];
  materialPropertyDependencies: readonly string[];
  compatibleEditions: readonly string[];
  scopeState: UsTensionMethodScopeState;
};

export type USSteelTensionContext = {
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  axialDemandRef: string;
  designMethod: UsDesignMethod;
  unitSystem: UsUnitSystem;
  grossAreaRef: string;
  netAreaRef: string;
  effectiveNetAreaRef: string | null;
  standardContextRef: string;
  buildingCodeContextRef: string | null;
  loadStandardContextRef: string | null;
  localAmendmentSetRef: string | null;
  engineeringRuleRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  materialPropertyRefs: readonly string[];
  sectionPropertyRefs: readonly string[];
  validationState: string;
  conformanceState: SteelStandardConformanceState;
  provenance: string;
  directContractProfile: boolean;
};

export const US_STABILITY_ANALYSIS_METHODS = [
  "EFFECTIVE_LENGTH_BASED",
  "DIRECT_ANALYSIS_BASED",
  "OTHER_GOVERNED_METHOD",
  "UNKNOWN",
] as const;
export type UsStabilityAnalysisMethod = (typeof US_STABILITY_ANALYSIS_METHODS)[number];

export const US_SECOND_ORDER_ANALYSIS_STATES = [
  "FIRST_ORDER",
  "SECOND_ORDER",
  "P_DELTA",
  "P_SMALL_DELTA",
  "OTHER_GOVERNED_ANALYSIS",
  "UNKNOWN",
] as const;
export type UsSecondOrderAnalysisState = (typeof US_SECOND_ORDER_ANALYSIS_STATES)[number];

export type UsStabilityAnalysisContext = {
  method: UsStabilityAnalysisMethod;
  secondOrder: UsSecondOrderAnalysisState;
  mixedMethods: boolean;
};

export const US_COMPRESSION_METHOD_SCOPE_STATES = [
  "GOVERNED_IMPLEMENTABLE",
  "MECHANICS_REFERENCE_ONLY",
  "FRAMEWORK_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type UsCompressionMethodScopeState = (typeof US_COMPRESSION_METHOD_SCOPE_STATES)[number];

export const US_ELEMENT_CLASSIFICATION_STATES = [
  "CLASSIFIED",
  "VALIDATION_REQUIRED",
  "NOT_REQUIRED",
  "UNSUPPORTED",
] as const;
export type UsElementClassificationState = (typeof US_ELEMENT_CLASSIFICATION_STATES)[number];

export type UsCompressionMethodRecord = SteelEngineeringRule & {
  methodType: "ENGINEERING_MECHANICS_REFERENCE" | "ELASTIC_BUCKLING_REFERENCE" | "AISC_NOMINAL_COMPRESSIVE_STRENGTH" | "AISC_LRFD_DESIGN_STRENGTH" | "AISC_ASD_ALLOWABLE_STRENGTH";
  aiscEditionRequirement: string;
  designMethodApplicability: "LRFD" | "ASD" | "BOTH";
  stabilityAnalysisMethodDependency: UsStabilityAnalysisMethod | "NONE";
  axis: SteelBucklingAxis | "SQUASH" | "CLASSIFICATION" | "SLENDERNESS" | "STRENGTH_CURVE";
  factorDependencies: readonly string[];
  localAmendmentDependencies: readonly string[];
  elementClassificationDependency: boolean;
  compatibleEditions: readonly string[];
  scopeState: UsCompressionMethodScopeState;
};

export type USSteelCompressionContext = {
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  compressionDemandRef: string;
  designMethod: UsDesignMethod;
  unitSystem: UsUnitSystem;
  memberLengthM: number;
  effectiveLengthMajorM: number | null;
  effectiveLengthMinorM: number | null;
  stabilityAnalysisMethod: UsStabilityAnalysisMethod;
  secondOrderAnalysis: UsSecondOrderAnalysisState;
  bucklingAxes: SteelBucklingAxis[];
  restraintContext: string;
  standardContextRef: string;
  buildingCodeContextRef: string | null;
  loadStandardContextRef: string | null;
  localAmendmentSetRef: string | null;
  engineeringRuleRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  validationState: string;
  conformanceState: SteelStandardConformanceState;
  provenance: string;
  effectiveLengthProvenanceRef: string;
  elementClassificationState: UsElementClassificationState;
  directContractProfile: boolean;
};

export const US_BENDING_METHOD_SCOPE_STATES = [
  "GOVERNED_IMPLEMENTABLE",
  "MECHANICS_REFERENCE_ONLY",
  "FRAMEWORK_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type UsBendingMethodScopeState = (typeof US_BENDING_METHOD_SCOPE_STATES)[number];

export const US_FLEXURAL_BEHAVIOR_STATES = [
  "ELASTIC",
  "PLASTIC",
  "LOCAL_BUCKLING_CONTROLLED",
  "VALIDATION_REQUIRED",
] as const;
export type UsFlexuralBehaviorState = (typeof US_FLEXURAL_BEHAVIOR_STATES)[number];

export const US_COMPACTNESS_STATES = [
  "COMPACT",
  "NONCOMPACT",
  "SLENDER",
  "OTHER_GOVERNED_STATE",
  "VALIDATION_REQUIRED",
] as const;
export type UsCompactnessState = (typeof US_COMPACTNESS_STATES)[number];

export type UsBendingClassificationContext = {
  element: "FLANGE" | "WEB" | "OTHER";
  axis: "MAJOR_AXIS" | "MINOR_AXIS";
  limitState: string;
  compactnessState: UsCompactnessState;
  limitGuessed: false;
};

export type UsLtbTransitionParameterContext = {
  Lp: null;
  Lr: null;
  guessed: false;
  state: "VALIDATION_REQUIRED";
};

export type UsBendingMethodRecord = SteelEngineeringRule & {
  methodType: "ENGINEERING_MECHANICS_REFERENCE" | "ELASTIC_BENDING_REFERENCE" | "ELASTIC_LTB_REFERENCE" | "AISC_NOMINAL_FLEXURAL_STRENGTH" | "AISC_LRFD_DESIGN_STRENGTH" | "AISC_ASD_ALLOWABLE_STRENGTH";
  aiscEditionRequirement: string;
  designMethodApplicability: "LRFD" | "ASD" | "BOTH";
  axis: "MAJOR_AXIS" | "MINOR_AXIS" | "LTB" | "CLASSIFICATION" | "SECTION" | "LOCAL_BUCKLING" | "TRANSITION";
  factorDependencies: readonly string[];
  localAmendmentDependencies: readonly string[];
  classificationDependency: boolean;
  unbracedLengthDependency: boolean;
  restraintDependency: boolean;
  momentGradientDependency: boolean;
  compatibleEditions: readonly string[];
  scopeState: UsBendingMethodScopeState;
};

export type USSteelBendingContext = {
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  momentDemandRefs: readonly string[];
  designMethod: UsDesignMethod;
  unitSystem: UsUnitSystem;
  bendingAxis: "MAJOR_AXIS" | "MINOR_AXIS";
  memberLengthM: number | null;
  unbracedLengthM: number | null;
  unbracedLengthProvenanceRef: string | null;
  restraintContext: string | null;
  lateralRestraint: string | null;
  torsionalRestraint: string | null;
  warpingRestraint: string | null;
  momentGradientContext: string | null;
  loadApplicationContext: string | null;
  stabilityAnalysisContext: UsStabilityAnalysisMethod | null;
  elementClassificationState: UsElementClassificationState;
  flexuralBehaviorState: UsFlexuralBehaviorState;
  standardContextRef: string;
  buildingCodeContextRef: string | null;
  loadStandardContextRef: string | null;
  localAmendmentSetRef: string | null;
  engineeringRuleRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  validationState: string;
  conformanceState: SteelStandardConformanceState;
  provenance: string;
  directContractProfile: boolean;
};

export const US_SHEAR_METHOD_SCOPE_STATES = [
  "GOVERNED_IMPLEMENTABLE",
  "MECHANICS_REFERENCE_ONLY",
  "FRAMEWORK_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type UsShearMethodScopeState = (typeof US_SHEAR_METHOD_SCOPE_STATES)[number];

export type UsShearMethodRecord = SteelEngineeringRule & {
  methodType: "ENGINEERING_MECHANICS_REFERENCE" | "ELASTIC_SHEAR_REFERENCE" | "ELASTIC_SHEAR_BUCKLING_REFERENCE" | "AISC_NOMINAL_SHEAR_STRENGTH" | "AISC_LRFD_DESIGN_STRENGTH" | "AISC_ASD_ALLOWABLE_STRENGTH";
  aiscEditionRequirement: string;
  designMethodApplicability: "LRFD" | "ASD" | "BOTH";
  axis: "MAJOR_SHEAR" | "MINOR_SHEAR" | "SHEAR" | "WEB" | "PANEL" | "SLENDERNESS";
  factorDependencies: readonly string[];
  localAmendmentDependencies: readonly string[];
  shearAreaDependency: boolean;
  webSlendernessDependency: boolean;
  panelDependency: boolean;
  stiffenerDependency: boolean;
  compatibleEditions: readonly string[];
  scopeState: UsShearMethodScopeState;
};

export type USSteelShearContext = {
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  shearDemandRefs: readonly string[];
  designMethod: UsDesignMethod;
  unitSystem: UsUnitSystem;
  shearAxis: SteelShearAxis;
  sectionGeometry: string | null;
  webGeometry: { clearWebDepth: number | null; webThickness: number | null };
  shearAreaContext: "GOVERNED_EXPLICIT";
  panelGeometryContext: {
    panelLengthM: number | null;
    stiffenerSpacingM: number | null;
    boundaryMetadata: string | null;
  };
  stiffenerContext: SteelShearStiffenerState;
  webSlendernessContext: SteelWebSlendernessContext;
  elementClassificationState: UsElementClassificationState;
  standardContextRef: string;
  buildingCodeContextRef: string | null;
  loadStandardContextRef: string | null;
  localAmendmentSetRef: string | null;
  engineeringRuleRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  validationState: string;
  conformanceState: SteelStandardConformanceState;
  provenance: string;
  directContractProfile: boolean;
};

export const US_INTERACTION_METHOD_SCOPE_STATES = [
  "GOVERNED_IMPLEMENTABLE",
  "MECHANICS_REFERENCE_ONLY",
  "FRAMEWORK_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type UsInteractionMethodScopeState = (typeof US_INTERACTION_METHOD_SCOPE_STATES)[number];

export type UsInteractionMethodRecord = SteelEngineeringRule & {
  methodType: "AISC_PROFILE_COMBINED_ACTION";
  interactionType: SteelInteractionType;
  aiscEditionRequirement: string;
  designMethodApplicability: "LRFD" | "ASD" | "BOTH";
  componentAuthorityRequirements: readonly ("MECHANICS_REFERENCE" | "NOMINAL_STRENGTH" | "LRFD_DESIGN_STRENGTH" | "ASD_ALLOWABLE_STRENGTH")[];
  stabilityMethodDependencies: readonly UsStabilityAnalysisMethod[] | readonly ["NONE"];
  classificationDependencies: "REQUIRED" | "NOT_REQUIRED";
  localBucklingDependencies: "REQUIRED" | "NOT_REQUIRED";
  ltbDependencies: "REQUIRED" | "NOT_REQUIRED";
  factorDependencies: readonly string[];
  localAmendmentDependencies: readonly string[];
  compatibleEditions: readonly string[];
  scopeState: UsInteractionMethodScopeState;
};

export type USSteelCombinedActionContext = {
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  axialDemandRef: string | null;
  majorMomentDemandRef: string | null;
  minorMomentDemandRef: string | null;
  majorShearDemandRef: string | null;
  minorShearDemandRef: string | null;
  componentMechanicsRefs: readonly string[];
  componentStrengthRefs: readonly string[];
  designMethod: UsDesignMethod;
  unitSystem: UsUnitSystem;
  stabilityAnalysisContextRef: UsStabilityAnalysisMethod | null;
  compressionStabilityContextRef: string | null;
  bendingStabilityContextRef: string | null;
  secondOrderAnalysis: UsSecondOrderAnalysisState | null;
  elementClassificationRefs: readonly UsElementClassificationState[];
  localBucklingContextRefs: readonly string[];
  ltbContextRefs: readonly string[];
  interactionRuleRef: string | null;
  standardContextRef: string;
  buildingCodeContextRef: string | null;
  loadStandardContextRef: string | null;
  localAmendmentSetRef: string | null;
  engineeringRuleRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  validationState: string;
  conformanceState: SteelStandardConformanceState;
  provenance: string;
  directContractProfile: boolean;
};

export const US_MECHANICS_COMPLETENESS_STATES = EU_MECHANICS_COMPLETENESS_STATES;
export type UsMechanicsCompletenessState = EuMechanicsCompletenessState;

export const US_BUILDING_CODE_COMPLIANCE_STATES = [
  "NOT_EVALUATED",
  "NOT_APPLICABLE",
  "CONTEXT_INCOMPLETE",
  "REQUIRES_REVIEW",
  "COMPLIANCE_NOT_VALIDATED",
  "COMPLIANCE_VALIDATED",
] as const;
export type UsBuildingCodeComplianceState = (typeof US_BUILDING_CODE_COMPLIANCE_STATES)[number];

export type USSteelServiceabilityContext = SteelServiceabilityContext & {
  loadBasisRef: string | null;
  buildingCodeContextRef: string | null;
  directContractProfileRef: string | null;
  localAmendmentSetRef: string | null;
  standardContextRef: string | null;
  clientRequirementRef: string | null;
  technicalBasisRef: string | null;
  criterionRequiresBuildingCode: boolean;
  criterionRequiresLocalAmendment: boolean;
};

export type USSteelMemberDesignRecord = SteelMemberDesignRecord & {
  standardContextRef: string;
  buildingCodeContextRef: string | null;
  directContractProfileRef: string | null;
  loadStandardContextRef: string | null;
  localAmendmentSetRef: string | null;
  designMethod: UsDesignMethod | null;
  unitSystem: UsUnitSystem;
  stabilityAnalysisContextRef: string | null;
  mechanicsResultRefs: readonly string[];
  codeProfileStrengthRefs: readonly string[];
  classificationRefs: readonly string[];
  localBucklingRefs: readonly string[];
  mechanicsEvaluationState: UsMechanicsCompletenessState;
  codeDesignCheckState: SteelCheckVerdict;
  buildingCodeComplianceState: UsBuildingCodeComplianceState;
  overallEngineeringCheckState: SteelCheckVerdict;
  governingIssueRef: string | null;
  governingValidatedCheckRef: string | null;
  numericalValidationState: "NOT_APPLICABLE" | "VALIDATION_REQUIRED";
  engineeringValidationState: "VALIDATION_REQUIRED";
  aiscCompliantClaim: false;
  buildingCodeCompliantClaim: false;
  edition: string;
  aiscAmendmentState: string;
  releaseClassification: typeof US_STEEL_RELEASE_CLASSIFICATION;
};
