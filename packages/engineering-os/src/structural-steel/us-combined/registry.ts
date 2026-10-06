import type { SteelInteractionType, UsInteractionMethodRecord, UsStabilityAnalysisMethod } from "@rtb/types";
import { AISC_UNKNOWN_EDITION_TOKEN } from "@rtb/types";

export const US_COMBINED_IMPLEMENTATION_VERSION = "us-combined-1.0.0" as const;
export const US_COMBINED_TOOL_REF = "EOS_US_STEEL_COMBINED_ACTION" as const;

const BASIS = "aisc-interaction-assessment-required-numerical-aisc360-rule-validation-required";

function frameworkRule(
  methodId: string,
  interactionType: SteelInteractionType,
  calculationPurpose: string,
  applicability: string,
  requiredInputs: string[],
  stabilityMethodDependencies: readonly UsStabilityAnalysisMethod[] | readonly ["NONE"],
  classificationDependencies: "REQUIRED" | "NOT_REQUIRED",
  localBucklingDependencies: "REQUIRED" | "NOT_REQUIRED",
  ltbDependencies: "REQUIRED" | "NOT_REQUIRED",
): UsInteractionMethodRecord {
  return {
    ruleId: `${methodId}-V1`,
    methodId,
    jurisdiction: "united-states",
    standardProfileRef: "us-steel-aisc-360-intended",
    authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
    technicalBasisRef: BASIS,
    calculationPurpose,
    applicability,
    requiredInputs,
    outputType: "AISC_PROFILE_COMBINED_ACTION",
    units: "1",
    implementationVersion: US_COMBINED_IMPLEMENTATION_VERSION,
    validationState: "FRAMEWORK_ONLY",
    benchmarkRefs: [],
    humanReviewState: "required",
    provenanceRef: "us-combined-framework-v1",
    clauseRef: null,
    intendedStandardProfile: "AISC360",
    standardConformanceState: "INTENDED_PROFILE",
    bindingState: "FRAMEWORK_ONLY",
    methodType: "AISC_PROFILE_COMBINED_ACTION",
    interactionType,
    aiscEditionRequirement: AISC_UNKNOWN_EDITION_TOKEN,
    designMethodApplicability: "BOTH",
    componentAuthorityRequirements: ["LRFD_DESIGN_STRENGTH", "ASD_ALLOWABLE_STRENGTH"],
    stabilityMethodDependencies,
    classificationDependencies,
    localBucklingDependencies,
    ltbDependencies,
    factorDependencies: ["phi", "Omega"],
    localAmendmentDependencies: ["localAmendmentSetRef"],
    compatibleEditions: [AISC_UNKNOWN_EDITION_TOKEN],
    scopeState: "FRAMEWORK_ONLY",
  };
}

export const US_INTERACTION_TENSION_BENDING_RULE = frameworkRule(
  "US_INTERACTION_TENSION_BENDING",
  "TENSION_BENDING",
  "detect tension + uniaxial bending interaction; numerical AISC combined-action rule VALIDATION_REQUIRED",
  "steel members with tensile axial demand and major and/or minor bending; LRFD or ASD explicit; AISC edition VALIDATION_REQUIRED",
  ["demand.axial", "demand.moment", "capacity.tension", "capacity.bending", "classification", "designMethod"],
  ["NONE"],
  "REQUIRED",
  "REQUIRED",
  "REQUIRED",
);

export const US_INTERACTION_TENSION_BIAXIAL_RULE = frameworkRule(
  "US_INTERACTION_TENSION_BIAXIAL_BENDING",
  "TENSION_BIAXIAL_BENDING",
  "detect tension + biaxial bending interaction; numerical AISC combined-action rule VALIDATION_REQUIRED",
  "steel members with tensile axial demand and both major and minor bending; linear interaction is not assumed",
  ["demand.axial", "demand.momentMajor", "demand.momentMinor", "capacity.tension", "capacity.bendingMajor", "capacity.bendingMinor", "classification", "designMethod"],
  ["NONE"],
  "REQUIRED",
  "REQUIRED",
  "REQUIRED",
);

export const US_INTERACTION_COMPRESSION_BENDING_RULE = frameworkRule(
  "US_INTERACTION_COMPRESSION_BENDING",
  "COMPRESSION_BENDING",
  "detect compression + uniaxial bending interaction; numerical AISC combined-action rule VALIDATION_REQUIRED",
  "steel members with compressive axial demand and major and/or minor bending; stability-analysis method, LTB, and classification remain required",
  ["demand.axial", "demand.moment", "capacity.compression", "capacity.bending", "stability", "classification", "ltb", "designMethod"],
  ["EFFECTIVE_LENGTH_BASED", "DIRECT_ANALYSIS_BASED", "OTHER_GOVERNED_METHOD"],
  "REQUIRED",
  "REQUIRED",
  "REQUIRED",
);

export const US_INTERACTION_COMPRESSION_BIAXIAL_RULE = frameworkRule(
  "US_INTERACTION_COMPRESSION_BIAXIAL_BENDING",
  "COMPRESSION_BIAXIAL_BENDING",
  "detect compression + biaxial bending interaction; numerical AISC combined-action rule VALIDATION_REQUIRED",
  "steel members with compressive axial demand and both major and minor bending; member stability context must remain explicit",
  ["demand.axial", "demand.momentMajor", "demand.momentMinor", "capacity.compression", "stability", "classification", "ltb", "designMethod"],
  ["EFFECTIVE_LENGTH_BASED", "DIRECT_ANALYSIS_BASED", "OTHER_GOVERNED_METHOD"],
  "REQUIRED",
  "REQUIRED",
  "REQUIRED",
);

export const US_INTERACTION_BIAXIAL_BENDING_RULE = frameworkRule(
  "US_INTERACTION_BIAXIAL_BENDING",
  "BIAXIAL_BENDING",
  "detect biaxial bending interaction; numerical AISC combined-action rule VALIDATION_REQUIRED",
  "steel members with simultaneous major- and minor-axis moment; Mx/Mcx+My/Mcy is not assumed",
  ["demand.momentMajor", "demand.momentMinor", "capacity.bendingMajor", "capacity.bendingMinor", "classification", "ltb", "designMethod"],
  ["NONE"],
  "REQUIRED",
  "REQUIRED",
  "REQUIRED",
);

export const US_INTERACTION_AXIAL_BIAXIAL_RULE = frameworkRule(
  "US_INTERACTION_AXIAL_BIAXIAL_BENDING",
  "AXIAL_BIAXIAL_BENDING",
  "detect N + Mx + My interaction; no universal three-component expression",
  "steel members with axial force and both major and minor bending; universal N/Nc+Mx/Mcx+My/Mcy is forbidden",
  ["demand.axial", "demand.momentMajor", "demand.momentMinor", "classification", "stability", "designMethod"],
  ["EFFECTIVE_LENGTH_BASED", "DIRECT_ANALYSIS_BASED", "OTHER_GOVERNED_METHOD"],
  "REQUIRED",
  "REQUIRED",
  "REQUIRED",
);

export const US_INTERACTION_BENDING_SHEAR_RULE = frameworkRule(
  "US_INTERACTION_BENDING_SHEAR",
  "BENDING_SHEAR",
  "detect bending + shear interaction; bending-resistance reduction is not guessed",
  "steel members with simultaneous bending and shear; AISC shear/web and flexural interaction remain VALIDATION_REQUIRED",
  ["demand.moment", "demand.shear", "capacity.bending", "capacity.shear", "classification", "designMethod"],
  ["NONE"],
  "REQUIRED",
  "REQUIRED",
  "NOT_REQUIRED",
);

export const US_INTERACTION_AXIAL_SHEAR_RULE = frameworkRule(
  "US_INTERACTION_AXIAL_SHEAR",
  "AXIAL_SHEAR",
  "detect axial + shear interaction; no universal axial/shear equation",
  "steel members with simultaneous axial force and shear where a future governed AISC method may require assessment",
  ["demand.axial", "demand.shear", "capacity.axial", "capacity.shear", "designMethod"],
  ["NONE"],
  "NOT_REQUIRED",
  "NOT_REQUIRED",
  "NOT_REQUIRED",
);

export const US_INTERACTION_METHOD_REGISTRY: readonly UsInteractionMethodRecord[] = [
  US_INTERACTION_TENSION_BENDING_RULE,
  US_INTERACTION_TENSION_BIAXIAL_RULE,
  US_INTERACTION_COMPRESSION_BENDING_RULE,
  US_INTERACTION_COMPRESSION_BIAXIAL_RULE,
  US_INTERACTION_BIAXIAL_BENDING_RULE,
  US_INTERACTION_AXIAL_BIAXIAL_RULE,
  US_INTERACTION_BENDING_SHEAR_RULE,
  US_INTERACTION_AXIAL_SHEAR_RULE,
];

export const IMPLEMENTED_US_INTERACTION_METHODS: readonly string[] = [];
export const FRAMEWORK_ONLY_US_INTERACTION_METHODS = US_INTERACTION_METHOD_REGISTRY.map((row) => row.methodId);
export const US_INTERACTION_INDEPENDENT_BENCHMARKS = "NOT_APPLICABLE" as const;
