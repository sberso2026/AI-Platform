import {
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R2_CRACK_WIDTH_METHOD_ID,
  EU_C7_R2_IMPLEMENTATION_VERSION,
  EU_C7_R3_IMPLEMENTATION_VERSION,
  EU_C7_R3_LONG_TERM_METHOD_ID,
  EU_C7_R3_SHRINKAGE_SIGN_CONVENTION,
  EU_C7_R3_SUPPORTED_LONG_TERM_STATES,
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

export const EU_C7_R3_METHOD_REGISTRY = [
  {
    methodId: EU_C7_R3_LONG_TERM_METHOD_ID,
    family: "EXPLICIT_GOVERNED_LONG_TERM_INPUT_STATE" as const,
    profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
    generation: EU_C7_R1_REFERENCE_PROFILE_GENERATION,
    states: EU_C7_R3_SUPPORTED_LONG_TERM_STATES,
    creep: "explicit dimensionless phi with provenance; not calculated from humidity, age, cement, or notional size",
    shrinkage: "explicit shrinkage magnitude in dimensionless strain; microstrain normalizes by the SI scale",
    signConvention: EU_C7_R3_SHRINKAGE_SIGN_CONVENTION,
    phiVersusPhiEf: "phi is not phiEf; no transformation is implemented; C6 keeps its own explicit phiEf",
    consumers: ["explicit C6 copy only", "R2 duration context without crack recomputation", "R4 input contract without deflection"],
    ruleIds: ["EU_C7_R1_EXPLICIT_CREEP", "EU_C7_R1_EXPLICIT_SHRINKAGE", "EU_C7_R1_C6_CREEP_INTERFACE"],
    implementationVersion: EU_C7_R3_IMPLEMENTATION_VERSION,
    validationState: "NUMERICALLY_VALIDATED" as const,
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW" as const,
    conformanceState: "INTENDED_PROFILE" as const,
    limitations: "calculated creep, calculated shrinkage, phi-to-phiEf transformation, and deflection are not implemented",
    benchmarkReference: "independent normalization in eos-d1e-eu-c7-r3.test.ts",
  },
] as const;

export const EU_C7_R3_METHOD_REGISTRY_UPDATED = "YES" as const;
