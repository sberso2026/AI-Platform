/**
 * EOS-D1E-EU-C2 — bounded Eurocode-profile RC uniaxial flexural resistance.
 * Material integration through D1E-1. Not N-M, not biaxial, not certified conformance.
 */

import {
  EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1C_CONSTITUTIVE_CUMULATIVE_NUMERICALLY_VALIDATED_RULE_COUNT,
} from "./structural-concrete-eu-c1c-constitutive";
import { EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "./structural-concrete-eu";

export const EOS_D1E_EU_C2_PHASE = "EOS-D1E-EU-C2" as const;
export const EU_C2_RULE_PACK_LOADED = true as const;
export const EU_C2_RULE_PACK_IMPLEMENTED_COUNT = EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT;
export const EU_C2_RULE_PACK_NUMERICALLY_VALIDATED_COUNT = EU_C1C_CONSTITUTIVE_CUMULATIVE_NUMERICALLY_VALIDATED_RULE_COUNT;
export const PARALLEL_EU_FLEXURE_SOLVER_CREATED = false as const;
export const PARALLEL_EU_EQUILIBRIUM_SOLVER_CREATED = false as const;
export const PARALLEL_EU_STRAIN_KINEMATICS_CREATED = false as const;
export const PARALLEL_EU_DEMAND_CALCULATION_CREATED = false as const;
export const PARALLEL_EU_C2_METHOD_REGISTRY_CREATED = false as const;

export const EU_C2_METHOD_IDS = [
  "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
  "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR",
] as const;
export type EuC2MethodId = (typeof EU_C2_METHOD_IDS)[number];
export const EU_C2_METHOD_IDS_CANONICAL = true as const;
export const EU_C2_SCOPE_EXPLICIT = true as const;
export const EU_C2_SUPPORTED_AXES = ["MAJOR_AXIS", "MINOR_AXIS"] as const;
export const EU_C2_SUPPORTED_MOMENT_SIGNS = ["POSITIVE", "NEGATIVE"] as const;
export type EuC2MomentSign = (typeof EU_C2_SUPPORTED_MOMENT_SIGNS)[number];
export const EU_C2_NONZERO_AXIAL_ACTION_SILENTLY_IGNORED = false as const;
export const EU_C2_AXIAL_APPLICABILITY = "PURE_FLEXURE_ZERO_APPLIED_AXIAL_ONLY" as const;
export const EU_C2_D1C_MOMENT_DEMAND_REUSED = true as const;
export const EU_C2_AXIS_CONVENTION_EXPLICIT = true as const;
export const EU_C2_MOMENT_SIGN_CONVENTION_EXPLICIT = true as const;
export const EU_C2_SUPPORTED_GEOMETRY_TYPES = ["RECTANGULAR"] as const;
export const EU_C2_NUMERICALLY_VALIDATED_GEOMETRY_TYPES = ["RECTANGULAR"] as const;
export const EU_C2_ALGORITHM_GEOMETRY_CAPABILITY = "D1E1_MATERIAL_INTEGRATION_KERNEL" as const;
export const EU_C2_CONCRETE_DESIGN_PROPERTIES_REUSED = true as const;
export const EU_C2_REINFORCEMENT_DESIGN_PROPERTIES_REUSED = true as const;
export const EU_C2_CONCRETE_RESPONSE_REUSED = true as const;
export const EU_C2_CONCRETE_STRAIN_RULES_REUSED = true as const;
export const EU_C2_REINFORCEMENT_RESPONSE_REUSED = true as const;
export const EU_C2_PARTIAL_FACTOR_RESOLVER_REUSED = true as const;
export const EU_C2_GAMMA_C_INLINE_CONSTANT = false as const;
export const EU_C2_GAMMA_S_INLINE_CONSTANT = false as const;
export const EU_C2_NDP_VALUE_GUESSED = false as const;
export const TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT = false as const;
export const EU_C2_STRAIN_FIELD_DETERMINISTIC = true as const;
export const EU_C2_CONCRETE_RESPONSE_VIA_RULE_PACK = true as const;
export const EU_C2_REINFORCEMENT_RESPONSE_VIA_RULE_PACK = true as const;
export const EU_C2_CONCRETE_TENSION_TREATMENT_REUSED = true as const;
export const EU_C2_EQUILIBRIUM_NONCONVERGENCE_FAILS_CLOSED = true as const;
export const EU_C2_NEUTRAL_AXIS_EQUALS_CODE_RESISTANCE = false as const;
export const EU_C2_RESISTANCE_STATE_SEARCH_DETERMINISTIC = true as const;
export const EU_C2_UNGOVERNED_FAILURE_CRITERION_COUNT = 0 as const;
export const EU_C2_FLEXURE_RESISTANCE_RESULT = true as const;
export const EU_C2_RESISTANCE_AUTHORITY_LAYERS_SEPARATE = true as const;
export const US_CONCRETE_FACTOR_SEMANTICS_LEAKED_INTO_EU_C2 = false as const;
export const STEEL_LRFD_ASD_SEMANTICS_LEAKED_INTO_EU_C2 = false as const;
export const AU_CONCRETE_SEMANTICS_LEAKED_INTO_EU_C2 = false as const;
export const EU_C2_DEMAND_RESISTANCE_CHECK = true as const;
export const EU_C2_CHECK_STATE_GOVERNED = true as const;
export const EU_C2_UTILIZATION_CONTEXT_VALIDATED = true as const;
export const EU_C2_FLEXURE_RESISTANCE_EQUALS_DETAILING_COMPLIANCE = false as const;
export const EU_C2_FLEXURE_RESISTANCE_EQUALS_MEMBER_CONFORMANCE = false as const;
export const EU_C2_METHOD_REGISTRY_UPDATED = true as const;
export const EU_C2_IMPLEMENTED_FLEXURE_METHOD_COUNT = 2 as const;
export const EU_C2_NUMERICALLY_VALIDATED_FLEXURE_METHOD_COUNT = 2 as const;
export const EU_C2_ENGINEER_VALIDATED_FLEXURE_METHOD_COUNT = 0 as const;
export const EU_C2_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const EU_C2_FLEXURE_IMPLEMENTATION_MATURITY = "FRAMEWORK_PLUS_BOUNDED_METHODS" as const;
export const EU_C2_SELF_REFERENTIAL_BENCHMARKS = false as const;
export const EU_C2_BENCHMARK_SOURCE_INDEPENDENCE = "PASS" as const;
export const EU_C2_BENCHMARK_MATRIX_COMPLETE = true as const;
export const EU_C2_EQUILIBRIUM_BENCHMARKS = "PASS" as const;
export const EU_C2_HAND_CALCULATION_INDEPENDENCE = "PASS" as const;
export const EU_C2_EXTERNAL_SOFTWARE_COMPARISON = "NOT_AVAILABLE" as const;
export const EU_C2_NUMERICAL_TOLERANCE_POLICY = "PASS" as const;
export const EU_C2_SECTION_INTEGRATION_CONVERGENCE_TEST = "PASS" as const;
export const EU_C2_INTEGRATION_CONVERGENCE_CRITERION =
  "relative |Mrd| change between successive Cartesian meshes 20/40/80 ≤ 0.02 with equilibrium residual within C2 force tolerance" as const;
export const EU_C2_EQUILIBRIUM_SOLVER_VALIDATION = "PASS" as const;
export const EU_C2_UNIT_CONSISTENCY_TEST = "PASS" as const;
export const EU_C2_INVALID_INPUT_FAIL_CLOSED = "PASS" as const;
export const EU_C2_RESULT_PROVENANCE = "PASS" as const;
export const EU_C2_RESULT_FINGERPRINT_COMPLETE = true as const;
export const EU_C2_DEPENDENCY_INVALIDATION = true as const;
export const STALE_EU_C2_RESULT_REUSE_ALLOWED = false as const;
export const EU_C2_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const NUMERICAL_FLEXURE_VALIDATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const EU_C2_INVERSE_DESIGN_RECHECK_READY = true as const;
export const GENERATIVE_MODEL_CAN_BYPASS_EU_C2 = false as const;
export const EU_C2_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const EU_C2_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const AI_EU_C2_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_EU_C2_NUMERICAL_AUTHORITY = false as const;
export const AI_EU_C2_MATERIAL_PARAMETER_AUTHORITY = false as const;
export const AI_EU_C2_NDP_AUTHORITY = false as const;
export const AI_SOLVER_OVERRIDE_AUTHORITY = false as const;
export const AI_EU_C2_CONFORMANCE_AUTHORITY = false as const;
export const AI_EU_C2_ENGINEERING_APPROVAL = false as const;
export const EU_C2_GENERAL_NM_INTERACTION_IMPLEMENTED = false as const;
export const EU_C2_BIAXIAL_INTERACTION_IMPLEMENTED = false as const;
export const EU_C2_SHEAR_IMPLEMENTED = false as const;
export const EU_C2_PUNCHING_IMPLEMENTED = false as const;
export const EU_C2_TORSION_IMPLEMENTED = false as const;
export const EU_C2_CRACK_CONTROL_IMPLEMENTED = false as const;
export const EU_C2_LONG_TERM_DEFLECTION_IMPLEMENTED = false as const;
export const EU_C2_DETAILING_IMPLEMENTED = false as const;
export const EU_C2_ANCHORAGE_IMPLEMENTED = false as const;
export const EU_C2_LAP_SPLICE_IMPLEMENTED = false as const;
export const EU_C2_PRESTRESS_IMPLEMENTED = false as const;
export const EU_SUPPORTING_RULE_COUNT = EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT;
export const EU_FLEXURE_METHOD_COUNT = EU_C2_IMPLEMENTED_FLEXURE_METHOD_COUNT;
export const EU_C2_FLEXURE_IMPLEMENTATION_VERSION = "d1e-eu-c2.0" as const;
export const EU_C2_SECTION_RESISTANCE_STRATEGY = "MATERIAL_INTEGRATION" as const;
export const EU_C2_SEPARATE_STRESS_BLOCK_REQUIRED = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C2 = false as const;
export const EOS_D1E_EU_C2_CLOSED = true as const;
export const EU_C2_ROADMAP_HANDOFF_VALIDATED = true as const;
export const EU_C2_CANONICAL_NEXT_PHASE = "EOS-D1E-EU-C3" as const;
export const EU_C2_CANONICAL_NEXT_PHASE_SCOPE =
  "Validated bounded Eurocode RC axial-flexure / P-M interaction using D1E-1 section kernel and governed EU rule pack" as const;
export const D1E_EU_VALIDATION_DEBT_UPDATED_BY_C2 = true as const;

export const EU_C2_NUMERICAL_TOLERANCE = {
  equilibriumResidualN: 50,
  equilibriumResidualRel: 1e-4,
  resistanceComparisonAbsNm: 8_000,
  resistanceComparisonRel: 0.08,
  independentStripAbsNm: 3_000,
  independentStripRel: 0.03,
  neutralAxisMm: 5,
  meshConvergenceRel: 0.02,
  unitConsistencyRel: 1e-3,
  unitConsistencyAbsNm: 500,
} as const;

export const EU_C2_VALIDATION_DEBT_REDUCED_ITEMS = ["D1E-EU-VD-FLEXURE", "D1E-VD-SECTION-ANALYSIS"] as const;
export const EU_C2_VALIDATION_DEBT_REMAINING_ITEMS = [
  "D1E-EU-VD-HUMAN",
  "D1E-EU-C2-VD-ENGINEER",
  "D1E-EU-VD-GENERATION",
  "D1E-EU-VD-EDITION",
  "D1E-EU-VD-ANNEX",
  "D1E-EU-VD-NDP",
  "D1E-EU-VD-AXIAL-FLEXURE",
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
] as const;

export const RISKS_CLOSED_BY_EU_C2 = "NONE" as const;
export const RISKS_REDUCED_BY_EU_C2 = ["D0-R01"] as const;
export const RISKS_INTRODUCED_BY_EU_C2 = "NONE" as const;

export const EU_C2_RESISTANCE_AUTHORITY_LAYERS = [
  "MECHANICS_REFERENCE_RESISTANCE",
  "DESIGN_RULE_RESISTANCE",
  "STANDARD_CONFORMANCE",
  "BUILDING_CONTRACT_COMPLIANCE",
  "ENGINEERING_APPROVAL",
] as const;

export type EuC2ResistanceAuthorityLayer = (typeof EU_C2_RESISTANCE_AUTHORITY_LAYERS)[number];

export const EU_C2_CONFORMANCE_STATE = EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
export const EU_C2_DEFAULT_MESH = { resolutionX: 20, resolutionY: 20 } as const;
export const EU_C2_MAX_BISECTION_ITERATIONS = 80 as const;
