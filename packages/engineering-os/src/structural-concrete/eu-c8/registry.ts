import {
  EU_C8_R1_PARAMETERS,
  EU_C8_R1_REFERENCE_PROFILE_GENERATION,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  EU_C8_R1_REFERENCE_PROFILE_VERSION,
  EU_C8_R1_RULES,
} from "./profile";
import { EU_C8_R2_CMIN_FORMULA_FINGERPRINT, EU_C8_R2_CNOM_FORMULA_FINGERPRINT } from "./fingerprints";
import { EU_C8_R2_METHOD_ID } from "./evaluate";
import { EU_C8_R3B_METHOD_ID } from "./spacing-evaluate";
import { EU_C8_R4B_METHOD_ID } from "./anchorage-evaluate";
import {
  EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
  EU_C8_R4_ANCHORAGE_PROFILE_ID,
  EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
  EU_C8_R4_DIAMETER_DIVISOR_PARAMETER_ID,
  EU_C8_R4_FORMULA_FINGERPRINT,
  EU_C8_R4_PARAMETERS,
  EU_C8_R4_PARENT_PROFILE_ID,
  EU_C8_R4_RULES,
} from "./anchorage-profile";
import {
  EU_C8_R3_NDP_PARAMETER_IDS,
  EU_C8_R3_PARAMETERS,
  EU_C8_R3_PARENT_PROFILE_ID,
  EU_C8_R3_RULES,
  EU_C8_R3_SMIN_FORMULA_FINGERPRINT,
  EU_C8_R3_SPACING_PROFILE_GENERATION,
  EU_C8_R3_SPACING_PROFILE_ID,
  EU_C8_R3_SPACING_PROFILE_VERSION,
} from "./spacing-profile";

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

export const EU_C8_R3B_METHOD_REGISTRY = [
  {
    methodId: EU_C8_R3B_METHOD_ID,
    profileId: EU_C8_R3_PARENT_PROFILE_ID,
    spacingProfileId: EU_C8_R3_SPACING_PROFILE_ID,
    profileVersion: EU_C8_R3_SPACING_PROFILE_VERSION,
    generation: EU_C8_R3_SPACING_PROFILE_GENERATION,
    scope: "MINIMUM_CLEAR_REINFORCEMENT_SPACING",
    applicability: "equal-diameter individual deformed bars; explicit HORIZONTAL_ADJACENT or VERTICAL_LAYER_ADJACENT context; surface-to-surface clearance from D1E barPairClearSpacingMm; explicit maximum aggregate size; explicit NDP bar-diameter coefficient; explicit NDP aggregate allowance; profile absolute minimum",
    barDiameterScope: "EQUAL_DIAMETER_ADJACENT_BARS_ONLY",
    aggregateContract: "MAXIMUM_AGGREGATE_SIZE",
    geometryContract: "SURFACE_TO_SURFACE",
    ndpInputs: EU_C8_R3_NDP_PARAMETER_IDS,
    ruleIds: EU_C8_R3_RULES.map((rule) => rule.ruleId),
    parameterIds: EU_C8_R3_PARAMETERS.map((parameter) => parameter.parameterId),
    formulaFingerprints: {
      EU_C8_R3_SMIN_CLEAR_ASSEMBLY: EU_C8_R3_SMIN_FORMULA_FINGERPRINT,
    },
    validationState: "NUMERICALLY_VALIDATED" as const,
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW" as const,
    conformanceState: "INTENDED_PROFILE" as const,
    benchmarkReference: "independent algebraic reconstruction in eos-d1e-eu-c8-r3b.test.ts",
  },
] as const;

export const EU_C8_R3B_METHOD_REGISTRY_UPDATED = "YES" as const;
export const EU_C8_R3B_IMPLEMENTED_METHOD_COUNT = EU_C8_R3B_METHOD_REGISTRY.length;
export const EU_C8_R3B_NUMERICALLY_VALIDATED_METHOD_COUNT = EU_C8_R3B_METHOD_REGISTRY.filter((method) => method.validationState === "NUMERICALLY_VALIDATED").length;
export const EU_C8_R3B_ENGINEER_VALIDATED_METHOD_COUNT = EU_C8_R3B_METHOD_REGISTRY.filter((method) => method.engineerValidationState !== "PENDING_HUMAN_ENGINEERING_REVIEW").length;

export const EU_C8_R4B_METHOD_REGISTRY = [
  {
    methodId: EU_C8_R4B_METHOD_ID,
    profileId: EU_C8_R4_PARENT_PROFILE_ID,
    anchorageProfileId: EU_C8_R4_ANCHORAGE_PROFILE_ID,
    profileVersion: EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
    generation: EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
    capabilityLevel: "BASIC_REQUIRED_STRAIGHT_BAR_ANCHORAGE",
    scope: "BASIC_REQUIRED_STRAIGHT_BAR_ANCHORAGE_ONLY",
    applicability: "one straight deformed bar in tension; explicit nominal diameter; explicit governed design steel stress; explicit governed design bond strength; profile diameter divisor; explicit available length and critical section only for a comparison",
    forceStateScope: "TENSION_ONLY",
    barShapeScope: "STRAIGHT",
    diameterDivisorParameterId: EU_C8_R4_DIAMETER_DIVISOR_PARAMETER_ID,
    designSteelStressContract: "EXPLICIT_DESIGN_STEEL_STRESS_TENSION_MAGNITUDE",
    designBondStrengthContract: "EXPLICIT_GOVERNED_INPUT",
    designBondStrengthProvenanceRequired: true,
    availableLengthContract: "EXPLICIT_SUPPLIED_LENGTH",
    criticalSectionContract: "EXPLICIT_REFERENCE_REQUIRED_WHEN_CHECK_REQUESTED",
    unsupportedLevelBModifiers: ["BAR_SHAPE", "COVER_CONFINEMENT", "TRANSVERSE_REINFORCEMENT", "WELDED_TRANSVERSE_REINFORCEMENT", "TRANSVERSE_PRESSURE", "MINIMUM_DESIGN_ANCHORAGE"],
    ruleIds: EU_C8_R4_RULES.map((rule) => rule.ruleId),
    parameterIds: EU_C8_R4_PARAMETERS.map((parameter) => parameter.parameterId),
    formulaFingerprints: {
      EU_C8_R4_LB_RQD_BASIC: EU_C8_R4_FORMULA_FINGERPRINT,
    },
    validationState: "NUMERICALLY_VALIDATED" as const,
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW" as const,
    conformanceState: "INTENDED_PROFILE" as const,
    benchmarkReference: "independent algebraic reconstruction in eos-d1e-eu-c8-r4b.test.ts",
  },
] as const;

export const EU_C8_R4B_METHOD_REGISTRY_UPDATED = "YES" as const;
export const EU_C8_R4B_IMPLEMENTED_METHOD_COUNT = EU_C8_R4B_METHOD_REGISTRY.length;
export const EU_C8_R4B_NUMERICALLY_VALIDATED_METHOD_COUNT = EU_C8_R4B_METHOD_REGISTRY.filter((method) => method.validationState === "NUMERICALLY_VALIDATED").length;
export const EU_C8_R4B_ENGINEER_VALIDATED_METHOD_COUNT = EU_C8_R4B_METHOD_REGISTRY.filter((method) => method.engineerValidationState !== "PENDING_HUMAN_ENGINEERING_REVIEW").length;
