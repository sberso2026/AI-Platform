import {
  EU_C8_R1_PARAMETERS,
  EU_C8_R1_REFERENCE_PROFILE_GENERATION,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  EU_C8_R1_REFERENCE_PROFILE_VERSION,
  EU_C8_R1_RULES,
} from "./profile";
import { EU_C8_R2_CMIN_FORMULA_FINGERPRINT, EU_C8_R2_CNOM_FORMULA_FINGERPRINT } from "./fingerprints";
import { EU_C8_R2_METHOD_ID } from "./evaluate";

export const EU_C8_R2_METHOD_REGISTRY = [
  {
    methodId: EU_C8_R2_METHOD_ID,
    profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
    profileVersion: EU_C8_R1_REFERENCE_PROFILE_VERSION,
    generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
    scope: "COVER_ASSEMBLY_ONLY",
    applicability: "first-generation C8 reference profile; explicit bond-cover component; explicit durability-cover component; explicit deviation allowance; profile-governed absolute minimum; deterministic minimum-cover assembly; deterministic nominal-cover assembly",
    exclusions: "durability lookup; exposure classification; structural class; design working life; anchorage; spacing; lap design; fire cover; seismic detailing; provided-cover member compliance",
    requiredExplicitInputs: ["bondCoverComponentMm", "durabilityCoverComponentMm", "deviationAllowanceMm"],
    profileParameters: EU_C8_R1_PARAMETERS.map((parameter) => parameter.parameterId),
    ndpDependentInputs: ["durabilityCoverComponentMm", "deviationAllowanceMm"],
    formulaFingerprints: {
      EU_C8_R1_CMIN_ASSEMBLY: EU_C8_R2_CMIN_FORMULA_FINGERPRINT,
      EU_C8_R1_CNOM_ASSEMBLY: EU_C8_R2_CNOM_FORMULA_FINGERPRINT,
    },
    ruleIds: EU_C8_R1_RULES.map((rule) => rule.ruleId),
    validationState: "NUMERICALLY_VALIDATED" as const,
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW" as const,
    conformanceState: "INTENDED_PROFILE" as const,
    benchmarkReference: "independent algebraic reconstruction in eos-d1e-eu-c8-r2.test.ts",
  },
] as const;

export const EU_C8_R2_METHOD_REGISTRY_UPDATED = "YES" as const;
export const PARALLEL_METHOD_REGISTRY_CREATED = false as const;
