/**
 * EOS-D1E-EU-C5 — bounded Eurocode-profile RC shear / punching / torsion rule-authority audit.
 * Evidence classification only. No numerical EN 1992 shear, punching, or torsion equations.
 * Not member design. Not certified conformance.
 */

export const EOS_D1E_EU_C5_PHASE = "EOS-D1E-EU-C5" as const;
export const EU_C5_D1E_FROZEN_ARCHITECTURE_PRESERVED = true as const;
export const PARALLEL_EU_C5_RULE_ENGINE_CREATED = false as const;
export const PARALLEL_EU_C5_STANDARD_CONTEXT_CREATED = false as const;
export const PARALLEL_EU_C5_CAPABILITY_MANIFEST_CREATED = false as const;
export const PARALLEL_EU_C5_METHOD_REGISTRY_CREATED = false as const;
export const PARALLEL_EU_SHEAR_DEMAND_ENGINE_CREATED = false as const;

export const D1E_COMMON_SHEAR_FRAMEWORK_AVAILABLE = true as const;
export const D1E_COMMON_SHEAR_FRAMEWORK_REUSED = true as const;
export const D1E_COMMON_PUNCHING_FRAMEWORK_AVAILABLE = true as const;
export const D1E_COMMON_PUNCHING_FRAMEWORK_REUSED = true as const;
export const D1E_COMMON_TORSION_FRAMEWORK_AVAILABLE = true as const;
export const D1E_COMMON_TORSION_FRAMEWORK_REUSED = true as const;

export const EU_C5_RULE_AUTHORITY_POLICY_REUSED = true as const;
export const LLM_MEMORY_ONLY_RULE_ALLOWED_FOR_C5 = false as const;
export const EU_C5_SOURCE_PROFILE_IDENTITY_RECORDED = true as const;
export const EU_C5_CROSS_GENERATION_RULE_MIXING = false as const;
export const EU_C5_SHEAR_PUNCHING_TORSION_SEMANTICS_SEPARATE = true as const;

export const EU_C5_SHEAR_REQUIRED_RULE_IDS = [
  "EU_C5_SHEAR_RESISTANCE_WITHOUT_TRANSVERSE_REINFORCEMENT",
  "EU_C5_SHEAR_EFFECTIVE_GEOMETRY",
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "EU_C1_CONCRETE_DESIGN_PROPERTIES",
] as const;
export type EuC5ShearRequiredRuleId = (typeof EU_C5_SHEAR_REQUIRED_RULE_IDS)[number];

export const EU_C5_PUNCHING_REQUIRED_RULE_IDS = [
  "EU_C5_PUNCHING_CONTROL_PERIMETER",
  "EU_C5_PUNCHING_CONCRETE_RESISTANCE",
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
] as const;
export type EuC5PunchingRequiredRuleId = (typeof EU_C5_PUNCHING_REQUIRED_RULE_IDS)[number];

export const EU_C5_TORSION_REQUIRED_RULE_IDS = [
  "EU_C5_TORSION_RESISTANCE",
  "EU_C5_TORSION_DEMAND",
] as const;
export type EuC5TorsionRequiredRuleId = (typeof EU_C5_TORSION_REQUIRED_RULE_IDS)[number];

export const EU_C5_CLASSIFIED_OPTIONAL_RULE_IDS = [
  "EU_C5_SHEAR_RESISTANCE_WITH_TRANSVERSE_REINFORCEMENT",
  "EU_C5_SHEAR_STRUT_OR_COMPRESSION_LIMIT",
  "EU_C5_SHEAR_AXIAL_DEPENDENCY",
  "EU_C5_PUNCHING_REINFORCEMENT_CONTRIBUTION",
  "EU_C5_PUNCHING_MAXIMUM_RESISTANCE",
  "EU_C5_PUNCHING_OPENING_EFFECTS",
  "EU_C5_PUNCHING_EDGE_CORNER",
  "EU_C5_PUNCHING_ECCENTRICITY",
  "EU_C5_TORSION_THRESHOLD",
  "EU_C5_TORSION_REINFORCEMENT",
  "EU_C5_TORSION_THIN_WALL_GEOMETRY",
  "EU_C5_TORSION_SHEAR_INTERACTION",
  "EU_C5_TORSION_FLEXURE_INTERACTION",
] as const;

export type EuC5RuleId =
  | EuC5ShearRequiredRuleId
  | EuC5PunchingRequiredRuleId
  | EuC5TorsionRequiredRuleId
  | (typeof EU_C5_CLASSIFIED_OPTIONAL_RULE_IDS)[number];

export const EU_C5_SHEAR_BOUNDED_SCOPE =
  "WITHOUT_DESIGN_SHEAR_REINFORCEMENT_RECTANGULAR_RC_ULS_CHECK_CONSUMING_D1C_SHEAR_DEMAND; WITH_REINFORCEMENT_AND_STRUT_AND_AXIAL_OUT_OF_BOUNDED_V1; NONE_IMPLEMENTABLE" as const;
export const EU_C5_PUNCHING_BOUNDED_SCOPE =
  "INTERIOR_SUPPORT_CONCRETE_RESISTANCE_ONLY_IF_GOVERNED_CONTROL_PERIMETER_EXISTS; OPENINGS_EDGE_CORNER_ECCENTRICITY_AND_PUNCHING_REINFORCEMENT_OUT_OF_BOUNDED_V1; NONE_IMPLEMENTABLE" as const;
export const EU_C5_TORSION_BOUNDED_SCOPE =
  "STANDALONE_TORSIONAL_RESISTANCE_CHECK_IF_D1C_TORSION_DEMAND_AND_GOVERNED_RESISTANCE_EXIST; INTERACTION_AND_THIN_WALL_MODEL_OUT_OF_BOUNDED_V1; NONE_IMPLEMENTABLE" as const;

export const EU_C5_READINESS_STATES = [
  "IMPLEMENTATION_READY",
  "SATISFIED_BY_EXISTING_RULE",
  "BLOCKED_RULE_AUTHORITY",
  "BLOCKED_SOURCE_CONFLICT",
  "BLOCKED_NDP",
  "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
] as const;
export type EuC5Readiness = (typeof EU_C5_READINESS_STATES)[number];

export const EU_C5_SHEAR_RULE_CLASSIFICATION_COMPLETE = true as const;
export const EU_C5_SHEAR_IMPLEMENTATION_READY_RULE_IDS = [] as const;
export const EU_C5_SHEAR_BLOCKED_RULE_IDS = [
  "EU_C5_SHEAR_RESISTANCE_WITHOUT_TRANSVERSE_REINFORCEMENT",
  "EU_C5_SHEAR_EFFECTIVE_GEOMETRY",
] as const;
export const EU_C5_SHEAR_SATISFIED_EXISTING_RULE_IDS = [
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "EU_C1_CONCRETE_DESIGN_PROPERTIES",
] as const;

export const D1C_SHEAR_DEMAND_REUSED = true as const;
export const EU_C5_SHEAR_GEOMETRY_DERIVATION_GOVERNED = true as const;
export const EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_STATE = "BLOCKED" as const;
export const EU_C5_SHEAR_WITH_REINFORCEMENT_METHOD_STATE = "OUT_OF_SCOPE" as const;
export const EU_C5_SHEAR_REINFORCEMENT_PROPERTIES_REUSED = "NOT_APPLICABLE" as const;
export const EU_C5_SHEAR_FAIL_CLOSED_AUDIT = "PASS" as const;

export const EU_C5_PUNCHING_RULE_CLASSIFICATION_COMPLETE = true as const;
export const EU_C5_PUNCHING_IMPLEMENTATION_READY_RULE_IDS = [] as const;
export const EU_C5_PUNCHING_BLOCKED_RULE_IDS = [
  "EU_C5_PUNCHING_CONTROL_PERIMETER",
  "EU_C5_PUNCHING_CONCRETE_RESISTANCE",
] as const;
export const EU_C5_PUNCHING_SATISFIED_EXISTING_RULE_IDS = ["EU_C1_PARTIAL_FACTOR_GAMMA_C"] as const;
export const EU_C5_PUNCHING_CONTROL_PERIMETER_GOVERNED = "NOT_IMPLEMENTED" as const;
export const D1C_PUNCHING_ACTIONS_REUSED = "NOT_APPLICABLE" as const;
export const EU_C5_PUNCHING_OPENING_EFFECTS_STATE = "OUT_OF_SCOPE" as const;
export const EU_C5_PUNCHING_EDGE_CORNER_STATE = "OUT_OF_SCOPE" as const;
export const EU_C5_PUNCHING_ECCENTRICITY_STATE = "OUT_OF_SCOPE" as const;
export const EU_C5_PUNCHING_FAIL_CLOSED_AUDIT = "PASS" as const;

export const EU_C5_TORSION_RULE_CLASSIFICATION_COMPLETE = true as const;
export const EU_C5_TORSION_IMPLEMENTATION_READY_RULE_IDS = [] as const;
export const EU_C5_TORSION_BLOCKED_RULE_IDS = ["EU_C5_TORSION_RESISTANCE", "EU_C5_TORSION_DEMAND"] as const;
export const D1C_TORSION_DEMAND_REUSED = "NOT_AVAILABLE" as const;
export const EU_C5_TORSION_INTERACTION_RULE_STATE = "OUT_OF_SCOPE" as const;
export const EU_C5_UNGOVERNED_TORSION_INTERACTION_USED = false as const;
export const EU_C5_TORSION_FAIL_CLOSED_AUDIT = "PASS" as const;

export const EU_C5_MULTI_SOURCE_RULE_VALIDATION_POLICY = true as const;
export const EU_C5_RULE_SOURCE_CONFLICT_FAILS_CLOSED = true as const;
export const EU_C5_RULE_SOURCE_CONFLICT_IDS = [] as const;
export const EU_C5_NDP_CLASSIFICATION_EVIDENCE_BASED = true as const;
export const EU_C5_NDP_VALUE_GUESSED = false as const;
export const EU_C5_SHEAR_RULE_AUTHORITY_COMPLETE = false as const;
export const EU_C5_PUNCHING_RULE_AUTHORITY_COMPLETE = false as const;
export const EU_C5_TORSION_RULE_AUTHORITY_COMPLETE = false as const;

export const EU_C5_IMPLEMENTED_RULE_IDS = [] as const;
export const EU_C5_IMPLEMENTED_METHOD_IDS = [] as const;
export const EU_C5_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT = 0 as const;
export const EU_C5_PARAMETER_PROVENANCE_COMPLETE = true as const;
export const EU_C5_FORMULA_FINGERPRINT_VALIDATION = "PASS" as const;
export const EU_C5_UNIT_SEMANTICS_EXPLICIT = true as const;
export const EU_C5_METHOD_APPLICABILITY_EXPLICIT = true as const;
export const EU_C5_DETERMINISTIC_EXECUTION = "PASS" as const;
export const EU_C5_SELF_REFERENTIAL_BENCHMARKS = false as const;
export const EU_C5_SHEAR_GOLDEN_CASES = "NOT_IMPLEMENTED" as const;
export const EU_C5_PUNCHING_GOLDEN_CASES = "NOT_IMPLEMENTED" as const;
export const EU_C5_TORSION_GOLDEN_CASES = "NOT_IMPLEMENTED" as const;
export const EU_C5_BENCHMARK_COVERAGE = "NOT_APPLICABLE" as const;
export const EU_C5_BENCHMARK_SOURCE_INDEPENDENCE = "NOT_APPLICABLE" as const;
export const EU_C5_EXTERNAL_SOFTWARE_COMPARISON = "NOT_AVAILABLE" as const;
export const EU_C5_NUMERICAL_TOLERANCE_POLICY = "NOT_APPLICABLE" as const;
export const EU_C5_RESULT_CONTRACTS_GOVERNED = true as const;
export const EU_C5_CHECK_STATE_GOVERNED = true as const;
export const EU_C5_UTILIZATION_CONTEXT_VALIDATED = true as const;
export const EU_C5_CHECKS_EQUAL_MEMBER_CONFORMANCE = false as const;
export const EU_C5_C2_FLEXURE_REUSED_NOT_REIMPLEMENTED = true as const;
export const EU_C5_C3_PM_REUSED_NOT_REIMPLEMENTED = true as const;
export const EU_C5_C4_PMM_REUSED_NOT_REIMPLEMENTED = true as const;
export const EU_C5_UNGOVERNED_COMBINED_ACTION_INTERACTION = false as const;

export const EU_C5_IMPLEMENTED_SHEAR_METHOD_COUNT = 0 as const;
export const EU_C5_IMPLEMENTED_PUNCHING_METHOD_COUNT = 0 as const;
export const EU_C5_IMPLEMENTED_TORSION_METHOD_COUNT = 0 as const;
export const EU_C5_NUMERICALLY_VALIDATED_SHEAR_METHOD_COUNT = 0 as const;
export const EU_C5_NUMERICALLY_VALIDATED_PUNCHING_METHOD_COUNT = 0 as const;
export const EU_C5_NUMERICALLY_VALIDATED_TORSION_METHOD_COUNT = 0 as const;
export const EU_C5_ENGINEER_VALIDATED_SHEAR_METHOD_COUNT = 0 as const;
export const EU_C5_ENGINEER_VALIDATED_PUNCHING_METHOD_COUNT = 0 as const;
export const EU_C5_ENGINEER_VALIDATED_TORSION_METHOD_COUNT = 0 as const;
export const EU_C5_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const NUMERICAL_C5_VALIDATION_EQUALS_STANDARD_CONFORMANCE = false as const;

export const CONCRETE_CAPABILITY_MANIFEST_UPDATED_BY_C5 = true as const;
export const EU_C5_METHOD_REGISTRY_UPDATED = "NO_AS_NO_NEW_METHODS" as const;
export const EU_C5_SHEAR_IMPLEMENTATION_MATURITY = "FRAMEWORK_PLUS_COMMON_MECHANICS" as const;
export const EU_C5_PUNCHING_IMPLEMENTATION_MATURITY = "FRAMEWORK_PLUS_COMMON_MECHANICS" as const;
export const EU_C5_TORSION_IMPLEMENTATION_MATURITY = "FRAMEWORK_PLUS_COMMON_MECHANICS" as const;
export const EU_C5_RESULT_PROVENANCE = "PASS" as const;
export const EU_C5_RESULT_FINGERPRINT_COMPLETE = true as const;
export const EU_C5_DEPENDENCY_INVALIDATION = true as const;
export const STALE_EU_C5_RESULT_REUSE_ALLOWED = false as const;
export const EU_C5_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const EU_C5_INVERSE_DESIGN_RECHECK_READY = false as const;
export const GENERATIVE_MODEL_CAN_BYPASS_EU_C5 = false as const;
export const EU_C5_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const EU_C5_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;

export const AI_EU_C5_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_EU_C5_NUMERICAL_AUTHORITY = false as const;
export const AI_EU_C5_RULE_PARAMETER_AUTHORITY = false as const;
export const AI_EU_C5_NDP_AUTHORITY = false as const;
export const AI_EU_C5_SOURCE_CONFLICT_AUTHORITY = false as const;
export const AI_EU_C5_CHECK_OVERRIDE_AUTHORITY = false as const;
export const AI_EU_C5_CONFORMANCE_AUTHORITY = false as const;
export const AI_EU_C5_ENGINEERING_APPROVAL = false as const;

export const EU_C5_SECOND_ORDER_IMPLEMENTED = false as const;
export const EU_C5_SLENDERNESS_IMPLEMENTED = false as const;
export const EU_C5_MEMBER_BUCKLING_IMPLEMENTED = false as const;
export const EU_C5_CRACK_CONTROL_IMPLEMENTED = false as const;
export const EU_C5_DEFLECTION_IMPLEMENTED = false as const;
export const EU_C5_FULL_DETAILING_IMPLEMENTED = false as const;
export const EU_C5_ANCHORAGE_IMPLEMENTED = false as const;
export const EU_C5_LAP_IMPLEMENTED = false as const;
export const EU_C5_PRESTRESS_IMPLEMENTED = false as const;

export const EU_C5_SHEAR_BOUNDED_CAPABILITY_COMPLETE = false as const;
export const EU_C5_PUNCHING_BOUNDED_CAPABILITY_COMPLETE = false as const;
export const EU_C5_TORSION_BOUNDED_CAPABILITY_COMPLETE = false as const;

export const D1E_EU_VALIDATION_DEBT_UPDATED_BY_C5 = true as const;
export const EU_C5_VALIDATION_DEBT_REDUCED_ITEMS = [] as const;
export const EU_C5_VALIDATION_DEBT_REMAINING_ITEMS = [
  "D1E-EU-C5-VD-EVIDENCE",
  "D1E-EU-VD-SHEAR",
  "D1E-EU-VD-PUNCHING",
  "D1E-EU-VD-TORSION",
  "D1E-EU-VD-HUMAN",
  "D1E-EU-C2-VD-ENGINEER",
  "D1E-EU-C3-VD-ENGINEER",
  "D1E-EU-C4-VD-ENGINEER",
  "D1E-EU-VD-GENERATION",
  "D1E-EU-VD-EDITION",
  "D1E-EU-VD-ANNEX",
  "D1E-EU-VD-NDP",
  "D1E-EU-VD-CRACK",
  "D1E-EU-VD-DEFLECTION",
  "D1E-EU-VD-DETAILING",
  "D1E-EU-VD-ANCHORAGE",
  "D1E-EU-VD-LAP",
  "D1E-EU-VD-PRESTRESS",
  "D1E-EU-VD-THIRD-PARTY",
  "D1E-EU-VD-SECOND-ORDER",
] as const;

export const RISKS_CLOSED_BY_EU_C5 = "NONE" as const;
export const RISKS_REDUCED_BY_EU_C5 = "NONE" as const;
export const RISKS_INTRODUCED_BY_EU_C5 = "NONE" as const;
export const RISKS_REMAINING_AFTER_EU_C5 = [
  "D0-R01",
  "D0-R04",
  "D0-R05",
  "D0-R07",
  "D0-R08",
  "D0-R10",
  "D0-R11",
  "D0-R12",
] as const;

export const EU_C5_NEXT_PHASE_TYPE = "TARGETED_C5_EVIDENCE_RECOVERY" as const;
export const EU_C5_CANONICAL_NEXT_PHASE = "EOS-D1E-EU-C5-EVIDENCE" as const;
export const EU_C5_CANONICAL_NEXT_PHASE_SCOPE =
  "Recover independently governed first-generation EN 1992 shear / punching / torsion numerical-rule evidence without reproducing copyrighted standard text" as const;

export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C5 = false as const;
export const EOS_D1E_EU_C5_CLOSED = true as const;
export const EU_C5_BLOCKER =
  "BLOCKED_RULE_AUTHORITY: no independently governed shear, punching, or torsion resistance equation is bound in-repository" as const;
export const EU_C5_READY_FOR_NEXT_PHASE = true as const;
export const EU_C5_VERDICT = "BLOCKED" as const;
export const EU_C5_IMPLEMENTATION_VERSION = "d1e-eu-c5.0" as const;

export const EU_C5_FAMILY_IDS = ["SHEAR", "PUNCHING", "TORSION"] as const;
export type EuC5FamilyId = (typeof EU_C5_FAMILY_IDS)[number];

export const EU_C5_METHOD_STATES = ["IMPLEMENTATION_READY", "IMPLEMENTED", "BLOCKED", "OUT_OF_SCOPE"] as const;
export type EuC5MethodState = (typeof EU_C5_METHOD_STATES)[number];

export type EuC5EvidenceRuleRecord = {
  ruleId: EuC5RuleId;
  family: EuC5FamilyId;
  readiness: EuC5Readiness;
  authorityType: string;
  source: string;
  publisher: string;
  sourceType: string;
  claimedStandardGeneration: string;
  claimedEdition: string;
  parameterIds: readonly string[];
  units: string | null;
  applicability: string;
  nationalAnnexDependency: boolean | "UNRESOLVED";
  ndpDependency: boolean | "UNRESOLVED";
  independentCorroboration: readonly string[];
  validationState: "NOT_STARTED" | "PLAN_ONLY" | "NUMERICALLY_VALIDATED";
  formulaFingerprint: string | null;
  packConstantValue: null;
  implementable: boolean;
  provenance: string;
  version: typeof EU_C5_IMPLEMENTATION_VERSION;
  engineeringValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW";
  conformanceState: "INTENDED_PROFILE";
};

export type EuC5UndeterminedReason =
  | "BLOCKED_RULE_AUTHORITY"
  | "MISSING_GEOMETRY"
  | "MISSING_MATERIAL_PARAMETER"
  | "MISSING_NDP"
  | "MISSING_SHEAR_REINFORCEMENT_DATA"
  | "MISSING_LONGITUDINAL_REINFORCEMENT"
  | "UNSUPPORTED_AXIAL_STATE"
  | "UNSUPPORTED_GEOMETRY"
  | "UNSUPPORTED_RULE_APPLICABILITY"
  | "RULE_SOURCE_CONFLICT"
  | "D1C_TORSION_DEMAND_NOT_AVAILABLE"
  | "D1C_PUNCHING_ACTION_NOT_AVAILABLE"
  | "STALE_RESULT";

export type EuC5CheckResult = {
  ok: false;
  family: EuC5FamilyId;
  methodId: null;
  demand: { value: number | null; unit: string | null; source: string };
  resistance: null;
  units: { demand: string | null; resistance: null };
  checkState: "CHECK_UNDETERMINED";
  governingRuleIds: readonly string[];
  parameterVersions: readonly string[];
  geometryFingerprint: string | null;
  reinforcementFingerprint: string | null;
  standardProfileContext: string;
  ndpContext: string;
  validationState: "NOT_STARTED";
  conformanceState: "INTENDED_PROFILE";
  warnings: readonly string[];
  provenance: string;
  failReason: EuC5UndeterminedReason;
  fingerprint: string;
};
