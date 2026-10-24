import type { SteelEngineeringRule, SteelInteractionType } from "@rtb/types";

export const AU_COMBINED_IMPLEMENTATION_VERSION = "au-combined-1.0.0" as const;
export const AU_COMBINED_TOOL_REF = "EOS_AU_STEEL_COMBINED_ACTION" as const;

const BASIS = "interaction-assessment-required-numerical-as-profile-rule-validation-required";

function frameworkRule(
  methodId: string,
  interactionType: SteelInteractionType,
  calculationPurpose: string,
  applicability: string,
  requiredInputs: string[],
): SteelEngineeringRule {
  return {
    ruleId: `${methodId}-V1`,
    methodId,
    jurisdiction: "australia",
    standardProfileRef: "au-steel-as4100-intended",
    authorityType: "OTHER_GOVERNED_ENGINEERING_SOURCE",
    technicalBasisRef: BASIS,
    calculationPurpose,
    applicability,
    requiredInputs,
    outputType: "COMBINED_ACTION_CHECK_UNDETERMINED",
    units: "1",
    implementationVersion: AU_COMBINED_IMPLEMENTATION_VERSION,
    validationState: "FRAMEWORK_ONLY",
    benchmarkRefs: [],
    humanReviewState: "required",
    provenanceRef: "au-combined-framework-v1",
    clauseRef: null,
    intendedStandardProfile: "AS4100",
    standardConformanceState: "INTENDED_PROFILE",
    bindingState: "FRAMEWORK_ONLY",
  };
}

export const AU_INTERACTION_TENSION_BENDING_RULE = frameworkRule(
  "AU_INTERACTION_TENSION_BENDING",
  "TENSION_BENDING",
  "detect tension + bending interaction; numerical combined-action rule VALIDATION_REQUIRED",
  "steel members with tensile axial demand and major and/or minor bending; section classification VALIDATION_REQUIRED; intended AS 4100 profile",
  ["demand.axial", "demand.moment", "capacity.tension", "capacity.bending"],
);

export const AU_INTERACTION_TENSION_BIAXIAL_RULE = frameworkRule(
  "AU_INTERACTION_TENSION_BIAXIAL_BENDING",
  "TENSION_BIAXIAL_BENDING",
  "detect tension + biaxial bending interaction; numerical combined-action rule VALIDATION_REQUIRED",
  "steel members with tensile axial demand and both major and minor bending; linear interaction not assumed",
  ["demand.axial", "demand.momentMajor", "demand.momentMinor", "capacity.tension", "capacity.bendingMajor", "capacity.bendingMinor"],
);

export const AU_INTERACTION_COMPRESSION_BENDING_RULE = frameworkRule(
  "AU_INTERACTION_COMPRESSION_BENDING",
  "COMPRESSION_BENDING",
  "detect compression + bending interaction; numerical combined-action rule VALIDATION_REQUIRED",
  "steel members with compressive axial demand and major and/or minor bending; explicit effective length, buckling axis, LTB/restraint, and moment distribution required for a future numerical rule",
  ["demand.axial", "demand.moment", "capacity.compression", "capacity.bending", "stability"],
);

export const AU_INTERACTION_COMPRESSION_BIAXIAL_RULE = frameworkRule(
  "AU_INTERACTION_COMPRESSION_BIAXIAL_BENDING",
  "COMPRESSION_BIAXIAL_BENDING",
  "detect compression + biaxial bending interaction; numerical combined-action rule VALIDATION_REQUIRED",
  "steel members with compressive axial demand and both major and minor bending; member stability context must remain explicit",
  ["demand.axial", "demand.momentMajor", "demand.momentMinor", "capacity.compression", "stability"],
);

export const AU_INTERACTION_BIAXIAL_BENDING_RULE = frameworkRule(
  "AU_INTERACTION_BIAXIAL_BENDING",
  "BIAXIAL_BENDING",
  "detect biaxial bending interaction; numerical combined-action rule VALIDATION_REQUIRED",
  "steel members with simultaneous major- and minor-axis moment; linear Mx/Mcx+My/Mcy is not assumed",
  ["demand.momentMajor", "demand.momentMinor", "capacity.bendingMajor", "capacity.bendingMinor"],
);

export const AU_INTERACTION_BENDING_SHEAR_RULE = frameworkRule(
  "AU_INTERACTION_BENDING_SHEAR",
  "BENDING_SHEAR",
  "detect bending + shear interaction; numerical reduction rule VALIDATION_REQUIRED",
  "steel members with simultaneous bending and shear; shear-related bending reduction is not guessed",
  ["demand.moment", "demand.shear", "capacity.bending", "capacity.shear"],
);

export const AU_INTERACTION_AXIAL_SHEAR_RULE = frameworkRule(
  "AU_INTERACTION_AXIAL_SHEAR",
  "AXIAL_SHEAR",
  "detect axial + shear interaction; numerical combined-action rule VALIDATION_REQUIRED",
  "steel members with simultaneous axial force and shear; no universal axial/shear equation",
  ["demand.axial", "demand.shear", "capacity.axial", "capacity.shear"],
);

export const AU_INTERACTION_AXIAL_BIAXIAL_RULE = frameworkRule(
  "AU_INTERACTION_AXIAL_BIAXIAL_BENDING",
  "AXIAL_BIAXIAL_BENDING",
  "detect axial + biaxial bending interaction; numerical combined-action rule VALIDATION_REQUIRED",
  "steel members with axial force and both major and minor bending",
  ["demand.axial", "demand.momentMajor", "demand.momentMinor"],
);

export const AU_INTERACTION_METHOD_REGISTRY: readonly SteelEngineeringRule[] = [
  AU_INTERACTION_TENSION_BENDING_RULE,
  AU_INTERACTION_TENSION_BIAXIAL_RULE,
  AU_INTERACTION_COMPRESSION_BENDING_RULE,
  AU_INTERACTION_COMPRESSION_BIAXIAL_RULE,
  AU_INTERACTION_BIAXIAL_BENDING_RULE,
  AU_INTERACTION_BENDING_SHEAR_RULE,
  AU_INTERACTION_AXIAL_SHEAR_RULE,
  AU_INTERACTION_AXIAL_BIAXIAL_RULE,
];

export const AU_INTERACTION_METHOD_CATALOG = AU_INTERACTION_METHOD_REGISTRY.map((rule) => ({
  methodId: rule.methodId,
  interactionType: rule.methodId.replace("AU_INTERACTION_", "") as string,
  engineeringRuleRef: rule.ruleId,
  authorityType: rule.authorityType,
  technicalBasis: rule.technicalBasisRef,
  requiredInputs: rule.requiredInputs,
  applicability: rule.applicability,
  outputType: rule.outputType,
  implementationVersion: rule.implementationVersion,
  validationState: rule.validationState,
  standardConformanceState: rule.standardConformanceState,
  benchmarkRefs: rule.benchmarkRefs,
}));

export const FRAMEWORK_ONLY_INTERACTION_TYPES = [
  "TENSION_BENDING",
  "TENSION_BIAXIAL_BENDING",
  "COMPRESSION_BENDING",
  "COMPRESSION_BIAXIAL_BENDING",
  "BIAXIAL_BENDING",
  "BENDING_SHEAR",
  "AXIAL_SHEAR",
  "AXIAL_BIAXIAL_BENDING",
] as const;

export const IMPLEMENTED_INTERACTION_METHODS: readonly string[] = [];
export const AU_INTERACTION_INDEPENDENT_BENCHMARKS = "NOT_APPLICABLE" as const;

export const AU_COMBINED_UNSUPPORTED_METHODS = {
  UNIVERSAL_INTERACTION_EQUATION: false,
  AS4100_INTERACTION: "VALIDATION_REQUIRED",
  TORSIONAL_INTERACTION: false,
  CONNECTION_INTERACTION: false,
  SHEAR_REDUCTION: "VALIDATION_REQUIRED",
  BIAXIAL_LINEAR_INTERACTION: false,
} as const;
