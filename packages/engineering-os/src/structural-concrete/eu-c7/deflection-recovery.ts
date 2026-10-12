import {
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R3_PHI_EQUALS_C6_PHIEF_AUTOMATICALLY,
  NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED,
} from "@rtb/types";
import { EU_C7_R1_PRIMARY_SOURCE_ID, EU_C7_R1_SOURCE_CONFLICTS } from "./profile-binding";

export const EU_C7_R4_R1_FINAL_DISPOSITION = "BLOCKED_CURVATURE_INTERPOLATION_AUTHORITY" as const;
export const EU_C7_R4_R1_READY_FOR_R2 = false as const;
export const EU_C7_R4_R1_RUNTIME_METHOD_COUNT = 0 as const;
export const EU_C7_R4_R1_DEFLECTION_PROFILE_CREATED = false as const;
export const EU_C7_R4_R1_DEFLECTION_PROFILE_ID = null;
export const EU_C7_R4_R1_SPAN_DEPTH_CONFLICT_STATE = "STILL_BLOCKED" as const;
export const EU_C7_R4_R1_CURVATURE_METHOD_FEASIBILITY = "NOT_RECOVERED" as const;
export const EU_C7_R4_R1_SELECTED_METHOD_FAMILY = "NONE" as const;
export const EU_C7_R4_R1_NDP_PARAMETER_IDS = [] as const;
export const EU_C7_R4_R1_NDP_VALUE_GUESSED = false as const;
export const EU_C7_R4_R1_PHI_EQUALS_C6_PHIEF = EU_C7_R3_PHI_EQUALS_C6_PHIEF_AUTOMATICALLY;
export const EU_C7_R4_R1_R2_CRACK_WIDTH_USED_AS_DEFLECTION_FORMULA = false as const;
export const EU_C7_R4_GENERAL_STRUCTURAL_ANALYSIS_IMPLEMENTED = false as const;
export const EU_C7_R4_GENERAL_FEA_IMPLEMENTED = false as const;

export const EU_C7_R4_R1_CANDIDATE_SCOPES = [
  {
    scopeId: "ORDINARY_RECTANGULAR_PRISMATIC_BEAM",
    member: "ordinary non-prestressed rectangular prismatic beam",
    bending: "uniaxial",
    adopted: false,
    reason: "no candidate method has a complete governed expression",
  },
] as const;

export const EU_C7_R4_R1_CANDIDATE_METHODS = [
  {
    methodId: "SIMPLIFIED_SPAN_EFFECTIVE_DEPTH_CONTROL",
    methodFamily: "SIMPLIFIED_SPAN_EFFECTIVE_DEPTH_CONTROL",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    authorityClasses: ["VALIDATED_ENGINEERING_REFERENCE"],
    boundedScope: "slenderness check evidenced in the workshop; algebraic expression not recovered",
    requiredRuleIds: [],
    requiredParameterIds: [],
    sourceConflicts: ["SPAN_DEPTH_EXPRESSION", "EQUATION_LABEL_7_6_VERSUS_7_16"],
    crackingDependencies: [],
    creepDependencies: [],
    shrinkageDependencies: [],
    structuralResponseDependencies: ["support system factor is named but the expression is incomplete"],
    referenceImplementationFeasibility: "NOT_FEASIBLE",
    independentBenchmarkFeasibility: "NOT_FEASIBLE",
  },
  {
    methodId: "CURVATURE_INTERPOLATION",
    methodFamily: "CURVATURE_INTERPOLATION",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    authorityClasses: [],
    boundedScope: "not present in the re-read workshop extract",
    requiredRuleIds: [],
    requiredParameterIds: [],
    sourceConflicts: [],
    crackingDependencies: ["would require a governed interpolation rule before R2 crack state can be consumed"],
    creepDependencies: ["not recovered"],
    shrinkageDependencies: ["not recovered"],
    structuralResponseDependencies: ["not recovered"],
    referenceImplementationFeasibility: "NOT_RECOVERED",
    independentBenchmarkFeasibility: "NOT_FEASIBLE",
  },
  {
    methodId: "NUMERICAL_CURVATURE_INTEGRATION",
    methodFamily: "NUMERICAL_CURVATURE_INTEGRATION",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    authorityClasses: [],
    boundedScope: "no integration rule was recovered from the workshop extract",
    requiredRuleIds: [],
    requiredParameterIds: [],
    sourceConflicts: [],
    crackingDependencies: [],
    creepDependencies: [],
    shrinkageDependencies: [],
    structuralResponseDependencies: ["explicit curvature distribution would still need a governed code rule"],
    referenceImplementationFeasibility: "NOT_RECOVERED",
    independentBenchmarkFeasibility: "NOT_FEASIBLE",
  },
] as const;

export const EU_C7_R4_R1_SOURCE_CONFLICT_RECORDS = [
  ...EU_C7_R1_SOURCE_CONFLICTS.filter((conflict) => conflict.conflictId === "SPAN_DEPTH_EXPRESSION"),
  {
    conflictId: "EQUATION_LABEL_7_6_VERSUS_7_16",
    cause: "DIFFERENT_NOTATION",
    resolution: "REJECTED",
    detail: "The same workshop extract labels the slenderness expressions both as 7.16 and as 7.6. Neither label repairs the scrambled algebra.",
  },
] as const;

export const EU_C7_R4_R1_METHOD_SELECTION_BASIS = "No candidate has a complete governed expression, a closed parameter set, and an independent benchmark path. The span-to-depth check stays excluded. Curvature interpolation was not in the extract, so it is not invented." as const;

export function resolveEuC7DeflectionProfile(input: {
  profileId: string;
  generation: string;
  requestedMethod: string;
}): { accepted: false; code: string; readyForImplementation: false } {
  if (NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED || EU_C7_R4_R1_RUNTIME_METHOD_COUNT !== 0) {
    return { accepted: false, code: "RUNTIME_METHOD_FORBIDDEN_IN_R1", readyForImplementation: false };
  }
  if (input.profileId !== EU_C7_R1_REFERENCE_PROFILE_ID) {
    return { accepted: false, code: "PROFILE_MISMATCH", readyForImplementation: false };
  }
  if (input.generation !== EU_C7_R1_REFERENCE_PROFILE_GENERATION) {
    return { accepted: false, code: "GENERATION_MISMATCH", readyForImplementation: false };
  }
  if (input.requestedMethod === "SIMPLIFIED_SPAN_EFFECTIVE_DEPTH_CONTROL") {
    return { accepted: false, code: "SPAN_DEPTH_STILL_BLOCKED", readyForImplementation: false };
  }
  return { accepted: false, code: EU_C7_R4_R1_FINAL_DISPOSITION, readyForImplementation: false };
}

export function selectEuC7DeflectionMethod(): never {
  throw new Error("deflection method authority is unresolved");
}

export function selectEuC7DeflectionCoefficient(): never {
  throw new Error("deflection coefficients must not be selected by the assistant");
}
