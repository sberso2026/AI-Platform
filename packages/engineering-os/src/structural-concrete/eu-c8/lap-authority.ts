/**
 * C8-R5 records that the lecture lap length cannot be bound.
 * The only stated expression multiplies the basic required anchorage length by factors
 * whose cover, transverse-reinforcement, shape, and pressure expressions are not stated.
 * This module does not calculate a lap length.
 */

import {
  EU_C8_R1_REFERENCE_PROFILE_GENERATION,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED,
} from "./profile";

export const EU_C8_R5_PARENT_PROFILE_ID = EU_C8_R1_REFERENCE_PROFILE_ID;
export const EU_C8_R5_PARENT_PROFILE_REUSED = true as const;
export const PARALLEL_C8_STANDARD_PROFILE_CREATED = false as const;
export const PARALLEL_LAP_ENGINE_CREATED = false as const;
export const EU_C8_R5_CANDIDATE_LAP_SCOPE =
  "ORDINARY_NON_PRESTRESSED_RC_INDIVIDUAL_STRAIGHT_DEFORMED_BAR_TENSION_LAP" as const;
export const EU_C8_R5_LEVEL_A_FEASIBILITY = "NO" as const;
export const EU_C8_R5_LEVEL_B_FEASIBILITY = "NO" as const;
export const EU_C8_R5_LAP_BASE_QUANTITY = "BASIC_REQUIRED_ANCHORAGE_LENGTH" as const;
export const EU_C8_R5_BASIC_ANCHORAGE_AUTOMATICALLY_USED_AS_DESIGN_ANCHORAGE = false as const;
export const EU_C8_R5_R4B_REUSED_DEPENDENCIES = ["basicRequiredAnchorageLengthMm", "nominalBarDiameterMm"] as const;
export const EU_C8_R5_RULE_AUTHORITY_POLICY_REUSED = true as const;
export const LLM_MEMORY_ONLY_RULE_ALLOWED = false as const;
export const EU_C8_R5_SOURCE_HIERARCHY_ENFORCED = true as const;
export const PUBLIC_SOURCE_AUTOMATICALLY_AUTHORITATIVE = false as const;
export const EU_C8_R5_SOURCE_ID = "JRC_ARRIETA_BRUSSELS_2011_DETAILING" as const;
export const EU_C8_R5_LAP_RULE_CHAIN_COMPLETE = false as const;
export const EU_C8_R5_FORCE_STATE_SCOPE = "TENSION_ONLY" as const;
export const EU_C8_R5_BAR_DIAMETER_CONTRACT = "NOMINAL_BAR_DIAMETER" as const;
export const EU_C8_R5_BAR_DIAMETER_GUESSED = false as const;
export const EU_C8_R5_BAR_DIAMETER_PAIR_SCOPE = "EQUAL_DIAMETER_ONLY" as const;
export const EU_C8_R5_LAP_LENGTH_SEMANTICS_EXPLICIT = true as const;
export const EU_C8_R5_LAP_PERCENTAGE_RULE_STATE = "EXPRESSION_VISIBLE_INSIDE_UNQUANTIFIED_FACTOR_PRODUCT" as const;
export const EU_C8_R5_LAP_PERCENTAGE_DEFAULTED = false as const;
export const AI_LAP_PERCENTAGE_AUTHORITY = false as const;
export const EU_C8_R5_LAP_FACTOR_STATE = "SHAPE_COVER_TRANSVERSE_AND_PRESSURE_EXPRESSIONS_NOT_STATED" as const;
export const EU_C8_R5_LAP_CLEAR_SPACING_RULE_STATE = "NOT_STATED_AS_A_LAP_COEFFICIENT" as const;
export const C8_MIN_CLEAR_SPACING_CHECK_RESULT_EQUALS_LAP_SPACING_FACTOR = false as const;
export const EU_C8_R5_COVER_CONFINEMENT_RULE_STATE = "NAMED_EXPRESSION_NOT_RECOVERED" as const;
export const C8_REQUIRED_NOMINAL_COVER_EQUALS_LAP_ACTUAL_COVER = false as const;
export const EU_C8_R5_TRANSVERSE_REINFORCEMENT_RULE_STATE = "NAMED_EXPRESSION_NOT_RECOVERED" as const;
export const EU_C8_R5_MINIMUM_LAP_RULE_STATE = "VISIBLE_NOT_SEPARABLE_FROM_UNQUANTIFIED_DESIGN_LAP_FACTORS" as const;
export const EU_C8_R5_MINIMUM_LAP_RULE_IDS = [] as const;
export const EU_C8_R5_MINIMUM_LAP_PARAMETER_IDS = [] as const;
export const EU_C8_R5_FULL_DESIGN_ANCHORAGE_PREREQUISITE = false as const;
export const EU_C8_R5_EXPLICIT_LAP_BASE_INPUT_FEASIBLE = false as const;
export const EU_C8_R5_BASIC_ANCHORAGE_REUSE_STATE = "DIRECT_GOVERNED_DEPENDENCY" as const;
export const EU_C8_R5_DESIGN_STEEL_STRESS_ROUTE = "EXPLICIT_DESIGN_STEEL_STRESS_VIA_BASIC_REQUIRED_ANCHORAGE" as const;
export const EU_C8_R5_FYD_AUTOMATICALLY_USED_AS_SIGMA_SD = false as const;
export const EU_C8_R5_DESIGN_BOND_STRENGTH_ROUTE = "EXPLICIT_GOVERNED_INPUT_VIA_BASIC_REQUIRED_ANCHORAGE" as const;
export const EU_C8_R5_BOND_CONDITION_RULE_STATE = "NOT_APPLIED_AGAIN_WHEN_BOND_STRENGTH_IS_EXPLICIT" as const;
export const EU_C8_R5_EXPLICIT_FBD_DOUBLE_FACTORING = false as const;
export const EU_C8_R5_PROVIDED_LAP_LENGTH_CONTRACT = "EXPLICIT_SUPPLIED_LAP_LENGTH" as const;
export const EU_C8_R5_LAP_REFERENCE_ZONE_CONTRACT = "EXPLICIT_REFERENCE_NOT_SELECTED_BY_MODEL" as const;
export const AI_LAP_ZONE_AUTHORITY = false as const;
export const EU_C8_R5_FUTURE_CHECK_STATE_GOVERNED = false as const;
export const EU_C8_R5_LAP_CHECK_EQUALS_COMPLETE_DETAILING_COMPLIANCE = false as const;
export const EU_C8_R5_BAR_ARRANGEMENT_SCOPE = "INDIVIDUAL_STRAIGHT_BARS_NOT_BOUND" as const;
export const EU_C8_R5_STAGGERED_LAP_RULE_STATE = "ARRANGEMENT_GUIDANCE_VISIBLE_NOT_A_LENGTH_RULE" as const;
export const EU_C8_R5_SIMULTANEOUS_LAP_RULE_STATE = "PERCENTAGE_WITHIN_A_ZONE_NAMED_INSIDE_UNBOUND_PRODUCT" as const;
export const EU_C8_R5_BUNDLE_LAPS_SUPPORTED = false as const;
export const EU_C8_R5_MESH_LAPS_SUPPORTED = false as const;
export const EU_C8_R5_PRESTRESS_LAPS_SUPPORTED = false as const;
export const EU_C8_R5_MECHANICAL_SPLICES_SUPPORTED = false as const;
export const EU_C8_R5_REQUIRED_RULE_IDS = [] as const;
export const EU_C8_R5_REQUIRED_PARAMETER_IDS = [] as const;
export const EU_C8_R5_NDP_PARAMETER_IDS = [] as const;
export const EU_C8_R5_NDP_VALUE_GUESSED = false as const;
export const EU_C8_R5_NATIONAL_ANNEX_GLOBALLY_REQUIRED = false as const;
export const EU_C8_R5_PROJECT_SPECIFIC_PARAMETER_IDS = [] as const;
export const EU_C8_R5_SOURCE_CONFLICT_FAILS_CLOSED = true as const;
export const EU_C8_R5_SOURCE_INDEPENDENCE_RESULT = "SINGLE_GOVERNED_SOURCE" as const;
export const EU_C8_R5_SELECTED_CAPABILITY_LEVEL = "NONE" as const;
export const EU_C8_R5_SELECTED_METHOD_ID = "NONE" as const;
export const EU_C8_R5_LAP_PROFILE_CREATED = false as const;
export const EU_C8_R5_LAP_PROFILE_ID = "NONE" as const;
export const EU_C8_R5_LAP_PROFILE_GENERATION = EU_C8_R1_REFERENCE_PROFILE_GENERATION;
export const EU_C8_R5_LAP_PROFILE_IS_NATIONAL_ANNEX = false as const;
export const EU_C8_R5_PROFILE_INTERNAL_CONSISTENCY = "NOT_BOUND" as const;
export const EU_C8_R5_CROSS_GENERATION_RULE_MIXING = false as const;
export const EU_C8_R5_RULE_PROVENANCE_COMPLETE = false as const;
export const EU_C8_R5_PARAMETER_PROVENANCE_COMPLETE = false as const;
export const EU_C8_R5_UNPROVENANCED_PARAMETER_COUNT = 0 as const;
export const EU_C8_R5_FORMULA_FINGERPRINT_VALIDATION = "NOT_BOUND" as const;
export const EU_C8_R5_PROFILE_PACK_VALIDATION = "NOT_BOUND" as const;
export const EU_C8_R5_PROFILE_BINDING_FAIL_CLOSED = "PASS" as const;
export const EU_C8_R5_LAP_AUTODESIGN_PLANNED = false as const;
export const EU_C8_R5_READY_FOR_IMPLEMENTATION = false as const;
export const EU_C8_R5_FINAL_DISPOSITION = "LAPS_DEFERRED_AFTER_TARGETED_RECOVERY" as const;
export const EU_C8_R5_RUNTIME_METHOD_COUNT = 0 as const;
export const EU_C8_R5_DESIGN_ANCHORAGE_IMPLEMENTED = false as const;
export const EU_C8_R5_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const AI_TRANSVERSE_REINFORCEMENT_AUTHORITY = false as const;
export const AI_LAP_OVERRIDE_AUTHORITY = false as const;

export const EU_C8_R5_LAP_CANDIDATE_RULES = [
  {
    ruleId: "EU_C8_R5_DESIGN_LAP_PRODUCT",
    status: "NOT_SELECTED",
    expression: "design lap length is a product of named factors and the basic required anchorage length, floored by a minimum length",
  },
  {
    ruleId: "EU_C8_R5_LAP_PERCENTAGE_FACTOR",
    status: "NOT_SELECTED",
    expression: "lapped-bar percentage factor is visible inside that product and is not a standalone lap length",
  },
  {
    ruleId: "EU_C8_R5_MINIMUM_LAP",
    status: "NOT_SELECTED",
    expression: "minimum lap length is visible and is not separable from the unquantified factor product",
  },
] as const;

export const EU_C8_R5_RULE_CLASSIFICATIONS = {
  EU_C8_R5_DESIGN_LAP_PRODUCT: "BLOCKED_RULE_AUTHORITY",
  EU_C8_R5_LAP_PERCENTAGE_FACTOR: "DEFERRED",
  EU_C8_R5_MINIMUM_LAP: "DEFERRED",
  EU_C8_R5_SHAPE_FACTOR: "BLOCKED_RULE_AUTHORITY",
  EU_C8_R5_COVER_FACTOR: "BLOCKED_RULE_AUTHORITY",
  EU_C8_R5_TRANSVERSE_REINFORCEMENT_FACTOR: "BLOCKED_RULE_AUTHORITY",
  EU_C8_R5_TRANSVERSE_PRESSURE_FACTOR: "BLOCKED_RULE_AUTHORITY",
  EU_C8_R5_BASIC_REQUIRED_ANCHORAGE_BASIS: "SATISFIED_BY_EXISTING_RULE",
  EU_C8_R5_STAGGERED_LAP_ARRANGEMENT: "DEFERRED",
} as const;

export const EU_C8_R5_PARAMETER_CLASSIFICATIONS = {
  basicRequiredAnchorageLengthMm: "DERIVED_FROM_GOVERNED_RULE",
  nominalBarDiameterMm: "GEOMETRY_SPECIFIC",
  lappedBarPercentage: "UNRESOLVED",
  shapeFactor: "UNRESOLVED",
  coverFactor: "UNRESOLVED",
  transverseReinforcementFactor: "UNRESOLVED",
  transversePressureFactor: "UNRESOLVED",
  providedLapLengthMm: "UNRESOLVED",
} as const;

export const EU_C8_R5_SOURCE_CONFLICT_RECORDS = [
  { id: "WORKED_BUILDING_LAP_TABLES", classification: "DIFFERENT_SCOPE" },
  { id: "DESIGN_ANCHORAGE_FACTORS_VERSUS_LAP_FACTORS", classification: "DIFFERENT_METHOD" },
] as const;

export const EU_C8_R5_FUTURE_RESULT_CONTRACT = [] as const;

export type EuC8LapResolveResult = {
  ok: false;
  reason: "LAP_AUTHORITY_DEFERRED";
  calculatedLapLengthMm: null;
  runtimeMethodImplemented: false;
};

export function resolveEuC8LapAuthority(): EuC8LapResolveResult {
  if (NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED || EU_C8_R5_RUNTIME_METHOD_COUNT !== 0 || EU_C8_R5_LAP_PROFILE_CREATED) {
    throw new Error("lap runtime is outside the deferred authority record");
  }
  return {
    ok: false,
    reason: "LAP_AUTHORITY_DEFERRED",
    calculatedLapLengthMm: null,
    runtimeMethodImplemented: false,
  };
}
