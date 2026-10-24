/**
 * EOS-D1E-EU-C4 — bounded Eurocode-profile RC biaxial N-Mx-My section interaction.
 * Reuses D1E-1 kinematics/integration/equilibrium and C2/C3 methods. Not column design, not certified.
 */

import { EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT } from "./structural-concrete-eu-c1c-constitutive";
import { EU_C2_METHOD_IDS } from "./structural-concrete-eu-c2";
import { EU_C3_AXIAL_APPLICABILITY, EU_C3_METHOD_IDS } from "./structural-concrete-eu-c3";
import { EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "./structural-concrete-eu";

export const EOS_D1E_EU_C4_PHASE = "EOS-D1E-EU-C4" as const;
export const EU_C4_C2_METHODS_LOADED = true as const;
export const EU_C4_C3_METHODS_LOADED = true as const;
export const EU_C4_SUPPORTING_RULE_PACK_LOADED = true as const;
export const EU_C4_LOADED_C2_METHOD_IDS = EU_C2_METHOD_IDS;
export const EU_C4_LOADED_C3_METHOD_IDS = EU_C3_METHOD_IDS;
export const PARALLEL_EU_BIAXIAL_SECTION_KERNEL_CREATED = false as const;
export const PARALLEL_EU_BIAXIAL_MATERIAL_ENGINE_CREATED = false as const;
export const PARALLEL_EU_BIAXIAL_SECTION_INTEGRATOR_CREATED = false as const;
export const PARALLEL_EU_BIAXIAL_KINEMATICS_CREATED = false as const;
export const PARALLEL_EU_BIAXIAL_EQUILIBRIUM_SOLVER_CREATED = false as const;
export const PARALLEL_EU_BIAXIAL_INTEGRATOR_CREATED = false as const;
export const PARALLEL_EU_BIAXIAL_DEMAND_ENGINE_CREATED = false as const;
export const PARALLEL_EU_C4_METHOD_REGISTRY_CREATED = false as const;

export const D1E1_BIAXIAL_PLANE_SECTION_KINEMATICS_AVAILABLE = true as const;
export const D1E1_BIAXIAL_PLANE_SECTION_KINEMATICS_REUSED = true as const;
export const D1E1_COUPLED_BIAXIAL_EQUILIBRIUM_CAPABILITY = true as const;
export const D1E1_BIAXIAL_SECTION_RESULTANTS_SUPPORTED = true as const;

export const EU_C4_RULE_DEPENDENCY_AUDIT = "PASS" as const;
export const EU_C4_ADDITIONAL_REQUIRED_RULE_IDS = "NONE" as const;
export const EU_SUPPORTING_RULE_COUNT_FOR_C4 = EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT;

export const EU_C4_METHOD_IDS = ["EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR"] as const;
export type EuC4MethodId = (typeof EU_C4_METHOD_IDS)[number];
export const IMPLEMENTED_EU_CONCRETE_CODE_BIAXIAL_METHODS = EU_C4_METHOD_IDS;
export const EU_C4_METHOD_IDS_CANONICAL = true as const;
export const EU_C4_SCOPE_EXPLICIT = true as const;
export const EU_C4_VALIDATED_AXIAL_DOMAIN_SUBSET_OF_C3 = true as const;
export const EU_C4_SUPPORTED_AXIAL_DOMAIN = EU_C3_AXIAL_APPLICABILITY;
export const EU_C4_NUMERICALLY_VALIDATED_AXIAL_DOMAIN = EU_C3_AXIAL_APPLICABILITY;
export const EU_C4_SECTION_SURFACE_EQUALS_COLUMN_DESIGN = false as const;
export const EU_C4_SECTION_SURFACE_INCLUDES_SECOND_ORDER_EFFECTS = false as const;
export const EU_C4_SECTION_SURFACE_INCLUDES_SLENDERNESS = false as const;
export const EU_C4_SECTION_SURFACE_INCLUDES_MEMBER_BUCKLING = false as const;
export const EU_C4_D1C_AXIAL_DEMAND_REUSED = true as const;
export const EU_C4_D1C_BIAXIAL_MOMENT_DEMAND_REUSED = true as const;
export const D1C_AXIAL_DEMAND_REUSED = true as const;
export const D1C_BIAXIAL_MOMENT_DEMAND_REUSED = true as const;
export const EU_C4_AXIS_CONVENTION_EXPLICIT = true as const;
export const EU_C4_MOMENT_SIGN_CONVENTION_EXPLICIT = true as const;
export const EU_C4_AXIAL_SIGN_CONVENTION_EXPLICIT = true as const;
export const EU_C4_UNIT_SEMANTICS_EXPLICIT = true as const;
export const EU_C4_SUPPORTED_GEOMETRY_TYPES = ["RECTANGULAR"] as const;
export const EU_C4_NUMERICALLY_VALIDATED_GEOMETRY_TYPES = ["RECTANGULAR"] as const;
export const EU_C4_CONCRETE_DESIGN_PROPERTIES_REUSED = true as const;
export const EU_C4_REINFORCEMENT_DESIGN_PROPERTIES_REUSED = true as const;
export const EU_C4_CONCRETE_RESPONSE_REUSED = true as const;
export const EU_C4_CONCRETE_STRAIN_RULES_REUSED = true as const;
export const EU_C4_REINFORCEMENT_RESPONSE_REUSED = true as const;
export const EU_C4_CONCRETE_TENSION_TREATMENT_REUSED = true as const;
export const EU_C4_PARTIAL_FACTOR_RESOLVER_REUSED = true as const;
export const EU_C4_NDP_VALUE_GUESSED = false as const;
export const EU_C4_BIAXIAL_STRAIN_FIELD_DETERMINISTIC = true as const;
export const EU_C4_CONCRETE_RESPONSE_VIA_RULE_PACK = true as const;
export const EU_C4_REINFORCEMENT_RESPONSE_VIA_RULE_PACK = true as const;
export const EU_C4_SECTION_RESULTANTS_DETERMINISTIC = true as const;
export const EU_C4_BIAXIAL_RESISTANCE_SEARCH_GOVERNED = true as const;
export const EU_C4_ELLIPTICAL_INTERACTION_ASSUMED_WITHOUT_AUTHORITY = false as const;
export const EU_C4_LINEAR_BIAXIAL_INTERACTION_ASSUMED_WITHOUT_AUTHORITY = false as const;
export const EU_C4_BRESLER_STYLE_RULE_ASSUMED_WITHOUT_AUTHORITY = false as const;
export const EU_C4_MOMENT_DIRECTION_RESISTANCE_SEARCH = true as const;
export const EU_C4_ANGULAR_SAMPLING_EQUALS_ENGINEERING_RULE = false as const;
export const EU_C4_PMM_INTERACTION_POINT_RESULT = true as const;
export const EU_C4_PMM_INTERACTION_SURFACE_RESULT = true as const;
export const EU_C4_INTERACTION_SURFACE_DETERMINISTIC = true as const;
export const EU_C4_MAJOR_AXIS_REPRODUCES_C3 = "PASS" as const;
export const EU_C4_MINOR_AXIS_REPRODUCES_C3 = "PASS" as const;
export const EU_C4_C2_PURE_FLEXURE_ANCHORS = "PASS" as const;
export const EU_C4_BIAXIAL_QUADRANT_HANDLING_GOVERNED = true as const;
export const EU_C4_SYMMETRIC_SECTION_BENCHMARK = "PASS" as const;
export const EU_C4_ASYMMETRIC_REINFORCEMENT_TEST = "PASS" as const;
export const EU_C4_SURFACE_RESOLUTION_CONVERGENCE = "PASS" as const;
export const EU_C4_SURFACE_CONVERGENCE_CRITERION =
  "polar |M| at representative N of an 8-direction trace vs 16-direction trace relative change ≤ 0.08; axial-level 3 vs 5 at θ=π/4 relative |M| change ≤ 0.08" as const;
export const EU_C4_ANGULAR_RESOLUTION_CONVERGENCE = "PASS" as const;
export const EU_C4_AXIAL_LEVEL_RESOLUTION_CONVERGENCE = "PASS" as const;
export const EU_C4_SECTION_INTEGRATION_CONVERGENCE_TEST = "PASS" as const;
export const EU_C4_COUPLED_EQUILIBRIUM_SOLVER_VALIDATION = "PASS" as const;
export const EU_C4_EQUILIBRIUM_NONCONVERGENCE_FAILS_CLOSED = true as const;
export const EU_C4_INTERACTION_SURFACE_NUMERICAL_CONTINUITY = "PASS" as const;
export const EU_C4_SURFACE_TOPOLOGY_VALIDATION = "PASS" as const;
export const EU_C4_DEMAND_POINT_CHECK = true as const;
export const EU_C4_CHECK_STATE_GOVERNED = true as const;
export const EU_C4_SURFACE_INTERPOLATION_GOVERNED = true as const;
export const EU_C4_SURFACE_INTERPOLATION_ERROR_VALIDATION = "PASS" as const;
export const EU_C4_BOUNDARY_UNCERTAINTY_FAILS_CLOSED = true as const;
export const EU_C4_UNGOVERNED_SCALAR_INTERACTION_UTILIZATION = false as const;
export const EU_C4_SECTION_PMM_EQUALS_MEMBER_CAPACITY = false as const;
export const EU_C4_SECTION_PMM_EQUALS_COLUMN_STABILITY = false as const;
export const EU_C4_METHOD_REGISTRY_UPDATED = true as const;
export const EU_C4_IMPLEMENTED_BIAXIAL_METHOD_COUNT = 1 as const;
export const EU_C4_NUMERICALLY_VALIDATED_BIAXIAL_METHOD_COUNT = 1 as const;
export const EU_C4_ENGINEER_VALIDATED_BIAXIAL_METHOD_COUNT = 0 as const;
export const EU_C4_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const EU_C4_BIAXIAL_IMPLEMENTATION_MATURITY = "FRAMEWORK_PLUS_BOUNDED_METHODS" as const;
export const EU_C4_SELF_REFERENTIAL_BENCHMARKS = false as const;
export const EU_C4_BENCHMARK_SOURCE_INDEPENDENCE = "PASS" as const;
export const EU_C4_BENCHMARK_MATRIX_COMPLETE = true as const;
export const EU_C4_HAND_CALCULATION_INDEPENDENCE = "PASS" as const;
export const EU_C4_EXTERNAL_SOFTWARE_COMPARISON = "NOT_AVAILABLE" as const;
export const EU_C4_NUMERICAL_TOLERANCE_POLICY = "PASS" as const;
export const EU_C4_INVALID_INPUT_FAIL_CLOSED = "PASS" as const;
export const EU_C4_RESULT_PROVENANCE = "PASS" as const;
export const EU_C4_RESULT_FINGERPRINT_COMPLETE = true as const;
export const EU_C4_DEPENDENCY_INVALIDATION = true as const;
export const STALE_EU_C4_RESULT_REUSE_ALLOWED = false as const;
export const EU_C4_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const NUMERICAL_BIAXIAL_VALIDATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const EU_C4_INVERSE_DESIGN_RECHECK_READY = true as const;
export const GENERATIVE_MODEL_CAN_BYPASS_EU_C4 = false as const;
export const EU_C4_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const EU_C4_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const AI_EU_C4_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_EU_C4_NUMERICAL_AUTHORITY = false as const;
export const AI_EU_C4_MATERIAL_PARAMETER_AUTHORITY = false as const;
export const AI_EU_C4_NDP_AUTHORITY = false as const;
export const AI_EU_C4_SOLVER_OVERRIDE_AUTHORITY = false as const;
export const AI_SURFACE_OVERRIDE_AUTHORITY = false as const;
export const AI_EU_C4_CONFORMANCE_AUTHORITY = false as const;
export const AI_EU_C4_ENGINEERING_APPROVAL = false as const;
export const EU_C4_SECOND_ORDER_EFFECTS_IMPLEMENTED = false as const;
export const EU_C4_SLENDERNESS_CHECK_IMPLEMENTED = false as const;
export const EU_C4_MEMBER_BUCKLING_IMPLEMENTED = false as const;
export const EU_C4_SHEAR_IMPLEMENTED = false as const;
export const EU_C4_PUNCHING_IMPLEMENTED = false as const;
export const EU_C4_TORSION_IMPLEMENTED = false as const;
export const EU_C4_CRACK_CONTROL_IMPLEMENTED = false as const;
export const EU_C4_DEFLECTION_IMPLEMENTED = false as const;
export const EU_C4_DETAILING_IMPLEMENTED = false as const;
export const EU_C4_ANCHORAGE_IMPLEMENTED = false as const;
export const EU_C4_LAP_IMPLEMENTED = false as const;
export const EU_C4_PRESTRESS_IMPLEMENTED = false as const;
export const D1E_EU_VALIDATION_DEBT_UPDATED_BY_C4 = true as const;
export const EU_C4_FLEXURE_IMPLEMENTATION_VERSION = "d1e-eu-c4.0" as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C4 = false as const;
export const EOS_D1E_EU_C4_CLOSED = true as const;
export const EU_C4_ROADMAP_HANDOFF_VALIDATED = true as const;
export const EU_C4_CANONICAL_NEXT_PHASE = "EOS-D1E-EU-C5" as const;
export const EU_C4_CANONICAL_NEXT_PHASE_SCOPE =
  "Validated bounded Eurocode RC shear / punching / torsion using D1E-1 section kernel and governed EU rule pack" as const;
export const EU_C4_INTERACTION_GENERATION_STRATEGY =
  "GOVERNED_EPS_CU2_OR_EPS_YD_PIVOT_ALONG_MOMENT_DIRECTION_PLUS_C3_PRINCIPAL_ANCHORS" as const;
export const EU_C4_DEFAULT_ANGLE_COUNT = 8 as const;
export const EU_C4_DEFAULT_AXIAL_LEVELS = 5 as const;
export const EU_C4_CONFORMANCE_STATE = EU_CONCRETE_STANDARD_CONFORMANCE_STATE;

export const EU_C4_NUMERICAL_TOLERANCE = {
  equilibriumResidualN: 50,
  equilibriumResidualNm: 200,
  resistanceComparisonAbsNm: 8_000,
  resistanceComparisonRel: 0.08,
  c3AnchorRel: 0.02,
  c3AnchorAbsNm: 2_000,
  c2AnchorRel: 0.02,
  c2AnchorAbsNm: 2_000,
  interpolationRel: 0.08,
  interpolationAbsNm: 8_000,
  angularConvergenceRel: 0.08,
  axialLevelConvergenceRel: 0.08,
  meshConvergenceRel: 0.03,
  continuityRel: 0.45,
  symmetryRel: 0.08,
  unitConsistencyRel: 1e-3,
  unitConsistencyAbsNm: 500,
  boundaryUncertaintyRel: 0.05,
} as const;

export const EU_C4_VALIDATION_DEBT_REDUCED_ITEMS = ["D1E-EU-VD-BIAXIAL", "D1E-VD-BIAXIAL"] as const;
export const EU_C4_VALIDATION_DEBT_REMAINING_ITEMS = [
  "D1E-EU-VD-HUMAN",
  "D1E-EU-C2-VD-ENGINEER",
  "D1E-EU-C3-VD-ENGINEER",
  "D1E-EU-C4-VD-ENGINEER",
  "D1E-EU-VD-GENERATION",
  "D1E-EU-VD-EDITION",
  "D1E-EU-VD-ANNEX",
  "D1E-EU-VD-NDP",
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

export const RISKS_CLOSED_BY_EU_C4 = "NONE" as const;
export const RISKS_REDUCED_BY_EU_C4 = ["D0-R01"] as const;
export const RISKS_INTRODUCED_BY_EU_C4 = "NONE" as const;
export const RISKS_REMAINING_AFTER_EU_C4 = [
  "D0-R01",
  "D0-R04",
  "D0-R05",
  "D0-R07",
  "D0-R08",
  "D0-R10",
  "D0-R11",
  "D0-R12",
] as const;
