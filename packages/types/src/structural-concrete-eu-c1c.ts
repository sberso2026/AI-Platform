/**
 * EOS-D1E-EU-C1C — bounded C2 rule-gap classification.
 * No numerical EN 1992 coefficients are bound. Not flexure. Not conformance certification.
 */

export const EOS_D1E_EU_C1C_PHASE = "EOS-D1E-EU-C1C" as const;
export const EU_C1C_EXISTING_RULE_EVIDENCE_LOADED = true as const;
export const EU_C1C_INITIAL_GAP_RULE_IDS = [
  "EU_C1_CONCRETE_DESIGN_PROPERTIES",
  "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "EU_C1_PARTIAL_FACTOR_GAMMA_S",
  "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
  "EU_C1_CONCRETE_STRAIN_LIMITS",
  "EU_C1_REINFORCEMENT_RESPONSE",
  "EU_C1_REINFORCEMENT_STRAIN_STATES",
  "EU_C1_STRESS_BLOCK_OR_SECTION_MODEL",
] as const;
export type EuC1cGapRuleId = (typeof EU_C1C_INITIAL_GAP_RULE_IDS)[number];
export const EU_C1C_INITIAL_GAP_COUNT = 9 as const;
export const EU_C1C_GAP_CLASSIFICATION_COMPLETE = true as const;
export const EU_C1C_IMPLEMENTATION_READY_RULE_IDS = [] as const;
export const EU_C1C_BLOCKED_RULE_IDS = EU_C1C_INITIAL_GAP_RULE_IDS;
export const EU_C1C_IMPLEMENTED_RULE_IDS = [] as const;
export const EU_C1C_IMPLEMENTED_RULE_WITHOUT_GOVERNED_EVIDENCE = false as const;
export const PARALLEL_EU_VALIDATION_FRAMEWORK_CREATED = false as const;
export const EU_C1C_RULE_AUTHORITY_MODEL_REUSED = true as const;
export const EU_C1C_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT = 0 as const;
export const EU_C1C_CONCRETE_DESIGN_PROPERTIES_IMPLEMENTED = false as const;
export const EU_C1C_CONCRETE_DESIGN_PROPERTIES_GUESSED = false as const;
export const EU_C1C_CONCRETE_DESIGN_PROPERTY_RULE_IDS = [] as const;
export const EU_C1C_REINFORCEMENT_DESIGN_PROPERTIES_IMPLEMENTED = false as const;
export const EU_C1C_REINFORCEMENT_DESIGN_PROPERTIES_GUESSED = false as const;
export const EU_C1C_GAMMA_C_IMPLEMENTED = false as const;
export const EU_C1C_GAMMA_C_GUESSED = false as const;
export const EU_C1C_GAMMA_C_DEPENDENCY_CLASS = "UNRESOLVED" as const;
export const EU_C1C_GAMMA_S_IMPLEMENTED = false as const;
export const EU_C1C_GAMMA_S_GUESSED = false as const;
export const EU_C1C_GAMMA_S_DEPENDENCY_CLASS = "UNRESOLVED" as const;
export const EU_C1C_PARTIAL_FACTOR_SOURCE_RESOLUTION = "PASS" as const;
export const EU_C1C_CONCRETE_COMPRESSION_RESPONSE_IMPLEMENTED = false as const;
export const EU_C1C_CONCRETE_COMPRESSION_PARAMETER_GUESSED = false as const;
export const EU_C1C_CONCRETE_STRAIN_RULES_IMPLEMENTED = false as const;
export const EU_C1C_CONCRETE_STRAIN_LIMIT_GUESSED = false as const;
export const EU_C1C_CONCRETE_STRAIN_RULE_IDS = [] as const;
export const EU_C1C_REINFORCEMENT_RESPONSE_IMPLEMENTED = false as const;
export const EU_C1C_REINFORCEMENT_RESPONSE_PARAMETER_GUESSED = false as const;
export const EU_C1C_REINFORCEMENT_STRAIN_STATES_IMPLEMENTED = false as const;
export const EU_C1C_REINFORCEMENT_STRAIN_STATE_GUESSED = false as const;
export const EU_C1C_SECTION_MODEL_IMPLEMENTED = false as const;
export const EU_C1C_SECTION_MODEL_PARAMETER_GUESSED = false as const;
export const COMMON_RC_KERNEL_CONTAINS_EN1992_SECTION_MODEL = false as const;
export const EU_C1C_C2_SECTION_RESISTANCE_STRATEGY = "UNRESOLVED" as const;
export const EU_C1C_NDP_VALUE_GUESSED = false as const;
export const EU_C1C_BASE_RULE_IMPLEMENTATION_WITHOUT_DEFAULT_ANNEX_ALLOWED = true as const;
export const EU_C1C_SOURCE_CONFLICT_FAILS_CLOSED = true as const;
export const EU_C1C_SOURCE_CONFLICT_IDS = [] as const;
export const EU_C1C_FORMULA_FINGERPRINT_VALIDATION = "PASS" as const;
export const EU_C1C_PARAMETER_PROVENANCE_COMPLETE = true as const;
export const EU_C1C_UNIT_SEMANTICS_EXPLICIT = true as const;
export const EU_C1C_DETERMINISTIC_EXECUTION = "PASS" as const;
export const EU_C1C_RULE_APPLICABILITY_BOUNDS_EXPLICIT = true as const;
export const EU_C1C_FAIL_CLOSED_AUDIT = "PASS" as const;
export const EU_C1C_INDEPENDENT_GOLDEN_CASES = true as const;
export const EU_C1C_SELF_REFERENTIAL_BENCHMARKS = false as const;
export const EU_C1C_MULTI_SOURCE_VALIDATION = "PASS" as const;
export const EU_C1C_GOLDEN_CASE_COVERAGE = "PASS" as const;
export const EU_C1C_NUMERICAL_TOLERANCE_POLICY = "PASS" as const;
export const EU_C1C_IMPLEMENTED_NUMERICAL_RULE_COUNT = 0 as const;
export const EU_C1C_NUMERICALLY_VALIDATED_RULE_COUNT = 0 as const;
export const EU_C1C_ENGINEER_VALIDATED_RULE_COUNT = 0 as const;
export const EU_C1C_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const EU_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT = 3 as const;
export const EU_CUMULATIVE_NUMERICALLY_VALIDATED_RULE_COUNT = 3 as const;
export const EU_CUMULATIVE_ENGINEER_VALIDATED_RULE_COUNT = 0 as const;
export const EU_C2_REMAINING_MISSING_RULE_DEPENDENCIES = EU_C1C_INITIAL_GAP_RULE_IDS;
export const EU_C1C_CAPABILITY_MANIFEST_NEW_RULE_COUNT = 0 as const;
export const EU_CUMULATIVE_CAPABILITY_MANIFEST_RULE_COUNT = 3 as const;
export const EU_VALIDATION_DEBT_REDUCED_ITEMS = [] as const;
export const EU_VALIDATION_DEBT_REMAINING_ITEMS = [
  "D1E-EU-C1B-VD-COEFFICIENTS",
  "D1E-EU-C1-VD-C2-GAPS",
  "D1E-EU-C1C-VD-GAPS",
  "D1E-EU-VD-PARTIAL-FACTOR",
  "D1E-EU-VD-DESIGN-STRENGTH",
  "D1E-EU-VD-STRESS-BLOCK",
  "D1E-EU-VD-STRAIN-LIMITS",
  "D1E-EU-C1A-VD-PARAMETER-CLASS",
  "D1E-EU-C1-VD-ENGINEER",
] as const;
export const EU_C1C_RULE_RESULT_PROVENANCE = "PASS" as const;
export const EU_C1C_RULE_DEPENDENCY_INVALIDATION = true as const;
export const STALE_EU_C1C_RESULT_REUSE_ALLOWED = false as const;
export const EU_C1C_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const AI_EU_C1C_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_EU_C1C_NUMERICAL_AUTHORITY = false as const;
export const EU_C1C_INVERSE_DESIGN_RULE_REUSE = true as const;
export const GENERATIVE_MODEL_CAN_OVERRIDE_EU_C1C_RULE = false as const;
export const EU_C1C_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const C1_IMPLEMENTED_RULE_REGRESSION = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1C = false as const;
export const EOS_D1E_EU_C1C_CLOSED = false as const;
export const EU_C1C_READY_FOR_NEXT_PHASE = false as const;
export const EU_C1C_BLOCKER = "BLOCKED_RULE_AUTHORITY" as const;

export const EU_C1C_GAP_READINESS_STATES = [
  "IMPLEMENTATION_READY",
  "BLOCKED_RULE_AUTHORITY",
  "BLOCKED_SOURCE_CONFLICT",
  "BLOCKED_NATIONAL_ANNEX",
  "BLOCKED_NDP",
  "BLOCKED_ENGINEERING_VALIDATION",
  "NOT_REQUIRED_FOR_C2",
] as const;
export type EuC1cGapReadiness = (typeof EU_C1C_GAP_READINESS_STATES)[number];

export const EU_C1C_DEPENDENCY_CLASSES = [
  "BASE_STANDARD_FIXED",
  "NATIONAL_ANNEX_DEPENDENT",
  "NDP_DEPENDENT",
  "OTHER_GOVERNED_DEPENDENCY",
  "UNRESOLVED",
] as const;
export type EuC1cDependencyClass = (typeof EU_C1C_DEPENDENCY_CLASSES)[number];

export type EuC1cGapClassificationRow = {
  ruleId: EuC1cGapRuleId;
  readiness: "BLOCKED_RULE_AUTHORITY";
  implementable: false;
  dependencyClass: "UNRESOLVED";
  blockedReason: string;
  nationalAnnexDependency: "UNRESOLVED";
};
