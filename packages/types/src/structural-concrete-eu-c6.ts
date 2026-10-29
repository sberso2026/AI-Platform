/** EOS-D1E-EU-C6-R1 reference-profile identity. No numerical second-order method. */

export const EU_C6_R1_SELECTED_METHOD_FAMILY = "NOMINAL_CURVATURE" as const;
export const EU_C6_R1_SELECTED_PROFILE_TYPE = "REFERENCE_IMPLEMENTATION_PROFILE" as const;
export const EU_C6_R1_REFERENCE_PROFILE_ID = "EU-EN1992-1-1-GEN1-C6-NOMINAL-CURVATURE-REFERENCE" as const;
export const EU_C6_R1_REFERENCE_PROFILE_GENERATION = "EN1992-1-1-GEN1" as const;
export const EU_C6_R1_PROFILE_VERSION = "c6-r1-nominal-curvature-reference" as const;
export const EU_C6_R1_FALSE_NATIONAL_PROFILE_CLAIM = false as const;
export const EU_C6_R1_RUNTIME_METHOD_COUNT = 0 as const;
export const NEW_C6_SECOND_ORDER_METHOD_IMPLEMENTED = false as const;
export const EU_C6_R1_NDP_VALUE_GUESSED = false as const;
export const EU_C6_R1_CREEP_DEFAULTED = false as const;
export const EU_C6_R1_EFFECTIVE_LENGTH_GUESSED = false as const;
export const EU_C6_MEMBER_SECOND_ORDER_EQUALS_GLOBAL_STABILITY = false as const;
export const EU_C6_MEMBER_SECOND_ORDER_EQUALS_EIGENVALUE_BUCKLING = false as const;
export const EU_C6_MEMBER_SECOND_ORDER_EQUALS_GENERAL_NONLINEAR_ANALYSIS = false as const;

export const EU_C6_R1_CURVATURE_FACTOR_LOWER_BOUND = 8 as const;
export const EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND = 10 as const;
export const EU_C6_R1_NBAL_PERMITTED_SIMPLIFICATION = 0.4 as const;

/** R2 runtime identity. R1 profile constants above stay unchanged. */
export const EU_C6_R2_METHOD_ID = "EU_RC_SECOND_ORDER_EN1992_NOMINAL_CURVATURE_REFERENCE" as const;
export const EU_C6_R2_IMPLEMENTATION_VERSION = "c6-r2-nominal-curvature-1" as const;
export const EU_C6_R2_IMPLEMENTED_METHOD_COUNT = 1 as const;
export const EU_C6_R2_NUMERICALLY_VALIDATED_METHOD_COUNT = 1 as const;
export const EU_C6_R2_ENGINEER_VALIDATED_METHOD_COUNT = 0 as const;
export const EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT = 1 as const;
export const EU_C6_R2_NEW_C6_NDP_PARAMETER_COUNT = 0 as const;
export const EU_C6_R2_SLENDERNESS_LIMIT_IMPLEMENTED = false as const;
export const EU_C6_R2_SECOND_ORDER_NEGLECT_DECISION_IMPLEMENTED = false as const;
export const EU_C6_R2_CREEP_MODEL_IMPLEMENTED = false as const;
export const EU_C6_R2_NOMINAL_STIFFNESS_IMPLEMENTED = false as const;
export const EU_C6_R2_GENERAL_FRAME_ANALYSIS_IMPLEMENTED = false as const;
export const EU_C6_R2_GLOBAL_PDELTA_ANALYSIS_IMPLEMENTED = false as const;
export const EU_C6_R2_EIGENVALUE_BUCKLING_IMPLEMENTED = false as const;
export const EU_C6_R2_NONLINEAR_FRAME_ANALYSIS_IMPLEMENTED = false as const;
export const EU_C6_R2_GENERAL_FEA_IMPLEMENTED = false as const;
export const EU_C6_R2_SHELL_STABILITY_IMPLEMENTED = false as const;
export const EU_C6_R2_BIAXIAL_SECOND_ORDER_IMPLEMENTED = false as const;
export const NUMERICAL_C6_VALIDATION_EQUALS_ENGINEER_VALIDATION = false as const;
export const NUMERICAL_C6_VALIDATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const GENERATIVE_MODEL_CAN_BYPASS_EU_C6 = false as const;
export const EU_C6_R2_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const EU_C6_R2_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const AI_C6_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_C6_NUMERICAL_AUTHORITY = false as const;
export const AI_C6_EFFECTIVE_LENGTH_AUTHORITY = false as const;
export const AI_C6_CREEP_AUTHORITY = false as const;
export const AI_C6_NDP_AUTHORITY = false as const;
export const AI_C6_METHOD_SELECTION_FOR_FAVORABLE_RESULT = false as const;
export const AI_C6_CHECK_OVERRIDE_AUTHORITY = false as const;
export const AI_C6_CONFORMANCE_AUTHORITY = false as const;
export const AI_C6_ENGINEERING_APPROVAL = false as const;
export const STALE_EU_C6_R2_RESULT_REUSE_ALLOWED = false as const;
export const EU_C6_R2_SECOND_ORDER_CALCULATION_EQUALS_MEMBER_PASS = false as const;
