import {
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R2_CRACK_WIDTH_METHOD_ID,
  EU_C7_R2_IMPLEMENTATION_VERSION,
} from "@rtb/types";
import { EU_C7_R1_PARAMETERS, EU_C7_R1_RULES } from "./profile-binding";

export const EU_C7_R2_METHOD_REGISTRY = [
  {
    methodId: EU_C7_R2_CRACK_WIDTH_METHOD_ID,
    family: "CRACK_WIDTH" as const,
    profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
    generation: EU_C7_R1_REFERENCE_PROFILE_GENERATION,
    applicability: "ordinary non-prestressed rectangular beam or solid slab; quasi-permanent SLS; explicit cover to bar surface, bar diameter, reinforcement area, fct,eff, moduli, duration, bond, strain case, cracked-section steel stress, and project crack limit",
    exclusions: "prestress, circular and flanged sections, minimum crack reinforcement, bar diameter tables, bar spacing tables, service stress limits, calculated creep, calculated shrinkage, deflection, reinforcement design",
    serviceCombination: "QUASI_PERMANENT" as const,
    sigmaSRoute: "EXPLICIT_GOVERNED_INPUT" as const,
    ruleIds: EU_C7_R1_RULES.map((rule) => rule.ruleId),
    parameterIds: EU_C7_R1_PARAMETERS.map((parameter) => parameter.parameterId),
    implementationVersion: EU_C7_R2_IMPLEMENTATION_VERSION,
    validationState: "NUMERICALLY_VALIDATED" as const,
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW" as const,
    conformanceState: "INTENDED_PROFILE" as const,
    benchmarkReference: "independent closed-form reconstruction in eos-d1e-eu-c7-r2.test.ts",
  },
] as const;

export const EU_C7_R2_METHOD_REGISTRY_UPDATED = "YES" as const;
