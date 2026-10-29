import {
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R3_PHI_EQUALS_C6_PHIEF_AUTOMATICALLY,
  NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED,
} from "@rtb/types";

export const EU_C7_R4_E1_FINAL_DISPOSITION = "DEFLECTION_DEFERRED_AFTER_TARGETED_RECOVERY" as const;
export const EU_C7_R4_E1_READY_FOR_R2 = false as const;
export const EU_C7_R4_E1_RUNTIME_METHOD_COUNT = 0 as const;
export const EU_C7_R4_E1_SELECTED_METHOD_FAMILY = "NONE" as const;
export const EU_C7_R4_E1_DEFLECTION_PROFILE_CREATED = false as const;
export const EU_C7_R4_E1_DEFLECTION_PROFILE_ID = null;
export const EU_C7_R4_E1_CURVATURE_RULE_CHAIN_COMPLETE = false as const;
export const EU_C7_R4_E1_SPAN_DEPTH_METHOD_IMPLEMENTATION_AUTHORIZED = false as const;
export const EU_C7_R4_E1_NDP_PARAMETER_IDS = [] as const;
export const EU_C7_R4_E1_NDP_VALUE_GUESSED = false as const;
export const EU_C7_R4_E1_PHI_EQUALS_C6_PHIEF_AUTOMATICALLY = EU_C7_R3_PHI_EQUALS_C6_PHIEF_AUTOMATICALLY;
export const EU_C7_R4_E1_CRACK_WIDTH_USED_AS_DEFLECTION_FORMULA = false as const;
export const EU_C7_R4_E1_DEFLECTION_SIGN_CONVENTION = "NOT_BOUND_NO_METHOD_SELECTED" as const;
export const EU_C7_R4_E1_DEFLECTION_SIGN_CONVENTION_EXPLICIT = false as const;
export const DEFLECTION_RUNTIME_CAPABILITY = "NOT_IMPLEMENTED" as const;
export const EU_C7_R4_E1_NEXT_PHASE = "EOS-D1E-EU-C7-R5-CLOSEOUT" as const;

export const EU_C7_R4_E1_TARGET_METHODS = [
  "CRACKED_UNCRACKED_CURVATURE_INTERPOLATION",
  "SIMPLIFIED_SPAN_EFFECTIVE_DEPTH_CONTROL",
] as const;

export const EU_C7_R4_E1_CURVATURE_REQUIRED_RULE_IDS = [
  "UNCRACKED_DEFORMATION",
  "CRACKED_DEFORMATION",
  "CRACKING_THRESHOLD",
  "INTERPOLATION",
  "LOAD_DURATION_COEFFICIENT",
  "CURVATURE_INTEGRATION",
  "CREEP_TRANSFORMATION",
  "SHRINKAGE_CURVATURE",
] as const;

export const EU_C7_R4_E1_CURVATURE_REQUIRED_PARAMETER_IDS = [
  "DURATION_COEFFICIENT",
  "CRACKED_TENSION_STRESS_RATIO",
  "CRACKING_MOMENT",
  "SERVICE_MOMENT",
  "CONCRETE_MODULUS",
  "EXPLICIT_CREEP_COEFFICIENT",
  "EXPLICIT_SHRINKAGE_STRAIN",
] as const;

export const EU_C7_R4_E1_SOURCE_CONFLICT_RECORDS = [
  {
    conflictId: "SPAN_DEPTH_EXPRESSION",
    previousState: "STILL_BLOCKED",
    newSourceIds: ["EUROCODES_FI_WALRAVEN_2008_TRAINING", "MASESOFT_SCIA_EN1992_TRAINING"],
    cause: "ACTUAL_UNRESOLVED_CONFLICT",
    resolution: "STILL_UNRESOLVED",
    authorityState: "BLOCKED_SOURCE_CONFLICT",
  },
  {
    conflictId: "EQUATION_LABEL_7_6_VERSUS_7_16",
    previousState: "DIFFERENT_NOTATION_REJECTED",
    newSourceIds: ["EUROCODES_FI_WALRAVEN_2008_TRAINING"],
    cause: "DIFFERENT_NOTATION",
    resolution: "STILL_UNRESOLVED",
    authorityState: "BLOCKED_SOURCE_CONFLICT",
  },
  {
    conflictId: "UNCRACKED_CRACKED_STATE_LABELS",
    previousState: "NOT_RECOVERED",
    newSourceIds: ["EUROCODES_FI_WALRAVEN_2008_TRAINING", "MASESOFT_SCIA_EN1992_TRAINING"],
    cause: "DIFFERENT_NOTATION",
    resolution: "STILL_UNRESOLVED",
    authorityState: "BLOCKED_SOURCE_CONFLICT",
  },
] as const;

export const EU_C7_R4_E1_METHOD_SELECTION_BASIS = "The targeted extracts name an interpolation between uncracked and fully cracked deformation and a separate span-to-depth check. Neither extract supplies a complete curvature chain, a clean span-to-depth expression, an integration scheme, or a shrinkage-curvature rule. No method is selected." as const;

export const EU_C7_R4_E1_RULE_CLASSIFICATIONS = {
  CRACKED_UNCRACKED_CURVATURE_INTERPOLATION: "BLOCKED_RULE_AUTHORITY",
  SIMPLIFIED_SPAN_EFFECTIVE_DEPTH_CONTROL: "BLOCKED_SOURCE_CONFLICT",
  CURVATURE_INTEGRATION: "BLOCKED_RULE_AUTHORITY",
  CREEP_TRANSFORMATION: "BLOCKED_RULE_AUTHORITY",
  SHRINKAGE_CURVATURE: "BLOCKED_RULE_AUTHORITY",
} as const;

export function resolveEuC7DeflectionAuthority(input: {
  profileId: string;
  generation: string;
  requestedMethod: string;
}): { accepted: false; code: string; readyForImplementation: false } {
  if (NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED || EU_C7_R4_E1_RUNTIME_METHOD_COUNT !== 0) {
    return { accepted: false, code: "RUNTIME_METHOD_FORBIDDEN", readyForImplementation: false };
  }
  if (input.profileId !== EU_C7_R1_REFERENCE_PROFILE_ID) {
    return { accepted: false, code: "PROFILE_MISMATCH", readyForImplementation: false };
  }
  if (input.generation !== EU_C7_R1_REFERENCE_PROFILE_GENERATION) {
    return { accepted: false, code: "GENERATION_MISMATCH", readyForImplementation: false };
  }
  if (input.requestedMethod.length === 0) {
    return { accepted: false, code: "MISSING_METHOD", readyForImplementation: false };
  }
  return { accepted: false, code: EU_C7_R4_E1_FINAL_DISPOSITION, readyForImplementation: false };
}
