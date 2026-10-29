/**
 * EOS-D1E-EU-C3 — bounded Eurocode-profile RC uniaxial N-M section interaction.
 * Reuses C2 / D1E-1 material integration. Not biaxial, not column stability, not certified conformance.
 */

import { EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT } from "./structural-concrete-eu-c1c-constitutive";
import { EU_C2_METHOD_IDS } from "./structural-concrete-eu-c2";
import { EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "./structural-concrete-eu";

export const EOS_D1E_EU_C3_PHASE = "EOS-D1E-EU-C3" as const;
export const EU_C3_C2_METHODS_LOADED = true as const;
export const EU_C3_LOADED_C2_METHOD_IDS = EU_C2_METHOD_IDS;
export const PARALLEL_EU_PM_SOLVER_CREATED = false as const;
export const PARALLEL_EU_PM_KINEMATICS_CREATED = false as const;
export const PARALLEL_EU_PM_INTEGRATOR_CREATED = false as const;
export const PARALLEL_EU_PM_EQUILIBRIUM_SOLVER_CREATED = false as const;
export const PARALLEL_EU_MATERIAL_ENGINE_CREATED = false as const;
export const PARALLEL_EU_C3_METHOD_REGISTRY_CREATED = false as const;
export const PARALLEL_EU_ACTION_DEMAND_ENGINE_CREATED = false as const;

export const EU_C3_RULE_DEPENDENCY_AUDIT = "PASS" as const;
export const EU_C3_ADDITIONAL_REQUIRED_RULE_IDS = "NONE" as const;
export const EU_C3_REUSED_GOVERNED_RULE_IDS = [
  "EU_C1_CONCRETE_CHAR_PROPERTIES",
  "EU_C1_REINFORCEMENT_CHAR_PROPERTIES",
  "EU_C1_CONCRETE_TENSION_TREATMENT",
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "EU_C1_PARTIAL_FACTOR_GAMMA_S",
  "EU_C1_CONCRETE_DESIGN_PROPERTIES",
  "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
  "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
  "EU_C1_CONCRETE_STRAIN_LIMITS",
  "EU_C1_REINFORCEMENT_RESPONSE",
] as const;

export const EU_C3_METHOD_IDS = [
  "EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR",
  "EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MINOR",
] as const;
export type EuC3MethodId = (typeof EU_C3_METHOD_IDS)[number];
export const IMPLEMENTED_EU_CONCRETE_CODE_AXIAL_FLEXURE_METHODS = EU_C3_METHOD_IDS;
export const EU_C3_METHOD_IDS_CANONICAL = true as const;
export const EU_C3_SCOPE_EXPLICIT = true as const;
export const EU_C3_SECTION_INTERACTION_EQUALS_COLUMN_DESIGN = false as const;
export const EU_C3_SECTION_INTERACTION_INCLUDES_SECOND_ORDER_EFFECTS = false as const;
export const EU_C3_SECTION_INTERACTION_INCLUDES_SLENDERNESS = false as const;
export const EU_C3_D1C_AXIAL_DEMAND_REUSED = true as const;
export const EU_C3_D1C_MOMENT_DEMAND_REUSED = true as const;
export const EU_C3_AXIAL_SIGN_CONVENTION_EXPLICIT = true as const;
export const EU_C3_MOMENT_SIGN_CONVENTION_EXPLICIT = true as const;
export const EU_C3_UNIT_SEMANTICS_EXPLICIT = true as const;
export const EU_C3_SUPPORTED_GEOMETRY_TYPES = ["RECTANGULAR"] as const;
export const EU_C3_NUMERICALLY_VALIDATED_GEOMETRY_TYPES = ["RECTANGULAR"] as const;
export const EU_C3_CONCRETE_DESIGN_PROPERTIES_REUSED = true as const;
export const EU_C3_REINFORCEMENT_DESIGN_PROPERTIES_REUSED = true as const;
export const EU_C3_CONCRETE_RESPONSE_REUSED = true as const;
export const EU_C3_CONCRETE_STRAIN_RULES_REUSED = true as const;
export const EU_C3_REINFORCEMENT_RESPONSE_REUSED = true as const;
export const EU_C3_PARTIAL_FACTOR_RESOLVER_REUSED = true as const;
export const EU_C3_NDP_VALUE_GUESSED = false as const;
export const EU_C3_EQUILIBRIUM_NONCONVERGENCE_FAILS_CLOSED = true as const;
export const EU_C3_AXIAL_TARGET_APPLICABILITY_CHECK = true as const;
export const EU_C3_INTERACTION_GENERATION_STRATEGY_GOVERNED = true as const;
export const EU_C3_INTERACTION_GENERATION_STRATEGY =
  "GOVERNED_STRAIN_DOMAIN_TRACE_EPS_CU2_PIVOT_PLUS_YIELD_PIVOT_WHERE_REQUIRED" as const;
export const EU_C3_CURVE_SAMPLING_EQUALS_ENGINEERING_RULE = false as const;
export const EU_C3_PM_INTERACTION_POINT_RESULT = true as const;
export const EU_C3_PM_INTERACTION_CURVE_RESULT = true as const;
export const EU_C3_INTERACTION_CURVE_DETERMINISTIC = true as const;
export const EU_C3_INTERACTION_CURVE_RESOLUTION_CONVERGENCE = "PASS" as const;
export const EU_C3_INTERACTION_CURVE_CONVERGENCE_CRITERION =
  "piecewise-linear |M| at mid-N of a 9-point trace vs 17-point trace relative change ≤ 0.05 with axial residual within C3 force tolerance" as const;
export const EU_C3_ZERO_AXIAL_REPRODUCES_C2 = "PASS" as const;
export const EU_C3_AXIAL_ANCHOR_VALIDATION = "PARTIAL" as const;
export const EU_C3_INTERACTION_NUMERICAL_CONTINUITY_CHECK = "PASS" as const;
export const EU_C3_MAJOR_AXIS_PM_IMPLEMENTED = true as const;
export const EU_C3_MINOR_AXIS_PM_IMPLEMENTED = true as const;
export const EU_C3_POSITIVE_NEGATIVE_MOMENT_HANDLING_GOVERNED = true as const;
export const EU_C3_DEMAND_POINT_CHECK = true as const;
export const EU_C3_LINEAR_INTERACTION_ASSUMED_WITHOUT_AUTHORITY = false as const;
export const EU_C3_CHECK_STATE_GOVERNED = true as const;
export const EU_C3_INTERACTION_INTERPOLATION_GOVERNED = true as const;
export const EU_C3_INTERPOLATION_ERROR_VALIDATION = "PASS" as const;
export const EU_C3_AXIAL_SIGN_DOMAIN_TEST = "PASS" as const;
export const EU_C3_SECOND_ORDER_EFFECTS_IMPLEMENTED = false as const;
export const EU_C3_SLENDERNESS_CHECK_IMPLEMENTED = false as const;
export const EU_C3_MEMBER_BUCKLING_IMPLEMENTED = false as const;
export const EU_C3_AUTHORITY_LAYERS_SEPARATE = true as const;
export const EU_C3_METHOD_REGISTRY_UPDATED = true as const;
export const EU_C3_IMPLEMENTED_PM_METHOD_COUNT = 2 as const;
export const EU_C3_NUMERICALLY_VALIDATED_PM_METHOD_COUNT = 2 as const;
export const EU_C3_ENGINEER_VALIDATED_PM_METHOD_COUNT = 0 as const;
export const EU_C3_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const EU_C3_SELF_REFERENTIAL_BENCHMARKS = false as const;
export const EU_C3_BENCHMARK_SOURCE_INDEPENDENCE = "PASS" as const;
export const EU_C3_BENCHMARK_MATRIX_COMPLETE = true as const;
export const EU_C3_C2_PURE_FLEXURE_ANCHOR = "PASS" as const;
export const EU_C3_HAND_CALCULATION_INDEPENDENCE = "PASS" as const;
export const EU_C3_EXTERNAL_SOFTWARE_COMPARISON = "NOT_AVAILABLE" as const;
export const EU_C3_NUMERICAL_TOLERANCE_POLICY = "PASS" as const;
export const EU_C3_SECTION_INTEGRATION_CONVERGENCE_TEST = "PASS" as const;
export const EU_C3_EQUILIBRIUM_SOLVER_VALIDATION = "PASS" as const;
export const EU_C3_INVALID_INPUT_FAIL_CLOSED = "PASS" as const;
export const EU_C3_RESULT_PROVENANCE = "PASS" as const;
export const EU_C3_RESULT_FINGERPRINT_COMPLETE = true as const;
export const EU_C3_DEPENDENCY_INVALIDATION = true as const;
export const STALE_EU_C3_RESULT_REUSE_ALLOWED = false as const;
export const EU_C3_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const NUMERICAL_PM_VALIDATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const EU_C3_INVERSE_DESIGN_RECHECK_READY = true as const;
export const GENERATIVE_MODEL_CAN_BYPASS_EU_C3 = false as const;
export const EU_C3_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const EU_C3_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const AI_EU_C3_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_EU_C3_NUMERICAL_AUTHORITY = false as const;
export const AI_EU_C3_MATERIAL_PARAMETER_AUTHORITY = false as const;
export const AI_EU_C3_NDP_AUTHORITY = false as const;
export const AI_EU_C3_SOLVER_OVERRIDE_AUTHORITY = false as const;
export const AI_INTERACTION_CURVE_OVERRIDE_AUTHORITY = false as const;
export const AI_EU_C3_CONFORMANCE_AUTHORITY = false as const;
export const AI_EU_C3_ENGINEERING_APPROVAL = false as const;
export const EU_C3_BIAXIAL_PM_INTERACTION_IMPLEMENTED = false as const;
export const EU_C3_COLUMN_SECOND_ORDER_DESIGN_IMPLEMENTED = false as const;
export const EU_C3_SLENDER_COLUMN_DESIGN_IMPLEMENTED = false as const;
export const D1E_EU_VALIDATION_DEBT_UPDATED_BY_C3 = true as const;
export const EU_C3_FLEXURE_IMPLEMENTATION_VERSION = "d1e-eu-c3.0" as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C3 = false as const;
export const EOS_D1E_EU_C3_CLOSED = true as const;
export const EU_C3_ROADMAP_HANDOFF_VALIDATED = true as const;
export const EU_C3_CANONICAL_NEXT_PHASE = "EOS-D1E-EU-C4" as const;
export const EU_C3_CANONICAL_NEXT_PHASE_SCOPE =
  "Validated bounded Eurocode RC biaxial P-M-M section interaction using D1E-1 section kernel and governed EU rule pack" as const;
export const EU_C3_AXIAL_APPLICABILITY =
  "UNIAXIAL_NM_WITHIN_MECHANICS_ANCHORS_UNIFORM_EPS_CU2_TO_UNIFORM_EPS_YD" as const;
export const EU_C3_DEFAULT_CURVE_POINTS = 17 as const;
export const EU_C3_SCAN_SAMPLES = 25 as const;
export const EU_SUPPORTING_RULE_COUNT_FOR_C3 = EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT;
export const EU_C3_CONFORMANCE_STATE = EU_CONCRETE_STANDARD_CONFORMANCE_STATE;

export const EU_C3_NUMERICAL_TOLERANCE = {
  equilibriumResidualN: 50,
  resistanceComparisonAbsNm: 8_000,
  resistanceComparisonRel: 0.08,
  c2AnchorRel: 0.02,
  c2AnchorAbsNm: 2_000,
  interpolationRel: 0.05,
  interpolationAbsNm: 8_000,
  curveResolutionRel: 0.05,
  meshConvergenceRel: 0.02,
  continuityRel: 0.35,
  unitConsistencyRel: 1e-3,
  unitConsistencyAbsNm: 500,
} as const;

export const EU_C3_AUTHORITY_LAYERS = [
  "SECTION_MECHANICS",
  "NUMERICALLY_VALIDATED_EU_REFERENCE_METHOD",
  "STANDARD_CONFORMANCE",
  "MEMBER_DESIGN",
  "ENGINEERING_APPROVAL",
] as const;

export const EU_C3_VALIDATION_DEBT_REDUCED_ITEMS = ["D1E-EU-VD-AXIAL-FLEXURE", "D1E-VD-AXIAL-FLEXURE", "D1E-VD-SECTION-ANALYSIS"] as const;
export const EU_C3_VALIDATION_DEBT_REMAINING_ITEMS = [
  "D1E-EU-VD-HUMAN",
  "D1E-EU-C2-VD-ENGINEER",
  "D1E-EU-C3-VD-ENGINEER",
  "D1E-EU-VD-GENERATION",
  "D1E-EU-VD-EDITION",
  "D1E-EU-VD-ANNEX",
  "D1E-EU-VD-NDP",
  "D1E-EU-VD-BIAXIAL",
  "D1E-EU-VD-SHEAR",
  "D1E-EU-VD-PUNCHING",
  "D1E-EU-VD-TORSION",
  "D1E-EU-VD-CRACK",
  "D1E-EU-VD-DEFLECTION",
  "D1E-EU-VD-DETAILING",
  "D1E-EU-VD-ANCHORAGE",
  "D1E-EU-VD-LAP",
  "D1E-EU-VD-PRESTRESS",
  "D1E-EU-VD-THIRD-PARTY",
  "D1E-EU-VD-SECOND-ORDER",
] as const;

export const RISKS_CLOSED_BY_EU_C3 = "NONE" as const;
export const RISKS_REDUCED_BY_EU_C3 = ["D0-R01"] as const;
export const RISKS_INTRODUCED_BY_EU_C3 = "NONE" as const;
export const RISKS_REMAINING_AFTER_EU_C3 = [
  "D0-R01",
  "D0-R04",
  "D0-R05",
  "D0-R07",
  "D0-R08",
  "D0-R10",
  "D0-R11",
  "D0-R12",
] as const;
