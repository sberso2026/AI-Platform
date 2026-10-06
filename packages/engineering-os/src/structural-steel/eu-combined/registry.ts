import type { EuInteractionMethodRecord, SteelInteractionType } from "@rtb/types";

export const EU_COMBINED_IMPLEMENTATION_VERSION = "eu-combined-1.0.0" as const;
export const EU_COMBINED_TOOL_REF = "EOS_EU_STEEL_COMBINED_ACTION" as const;

export const EU_INTERACTION_STANDARD_PART_DEPENDENCY_MODEL = {
  memberInteractionPart: "EN_1993_1_1",
  bendingShearPlatedDependencyPart: "EN_1993_1_5",
  assumedSinglePartGovernsAllInteractions: false,
} as const;

const BASIS = "eurocode-interaction-assessment-required-numerical-en1993-rule-validation-required";

function frameworkRule(
  methodId: string,
  interactionType: SteelInteractionType,
  calculationPurpose: string,
  applicability: string,
  requiredInputs: string[],
  stabilityDependency: "REQUIRED" | "NOT_REQUIRED",
  standardPartRefs: readonly ("EN_1993_1_1" | "EN_1993_1_5")[] = ["EN_1993_1_1"],
  classificationDependency: "REQUIRED" | "NOT_REQUIRED" = "REQUIRED",
): EuInteractionMethodRecord {
  return {
    ruleId: `${methodId}-V1`,
    methodId,
    jurisdiction: "eu-eea",
    standardProfileRef: "eu-steel-en1993-1-1-intended",
    authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
    technicalBasisRef: BASIS,
    calculationPurpose,
    applicability,
    requiredInputs,
    outputType: "EUROCODE_PROFILE_COMBINED_ACTION",
    units: "1",
    implementationVersion: EU_COMBINED_IMPLEMENTATION_VERSION,
    validationState: "FRAMEWORK_ONLY",
    benchmarkRefs: [],
    humanReviewState: "required",
    provenanceRef: "eu-combined-framework-v1",
    clauseRef: null,
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    bindingState: "FRAMEWORK_ONLY",
    methodType: "EUROCODE_PROFILE_COMBINED_ACTION",
    interactionType,
    standardPartRef: standardPartRefs[0] ?? "EN_1993_1_1",
    standardPartRefs,
    ndpDependencies: ["partial-factor"],
    annexDependency: "NDP_REQUIRED",
    ruleRequiresNdp: true,
    classificationDependency,
    stabilityDependency,
    compatibleGenerations: ["FIRST_GENERATION", "UNKNOWN_PENDING_CONFIRMATION"],
    scopeState: "FRAMEWORK_ONLY",
  };
}

export const EU_INTERACTION_TENSION_BENDING_RULE = frameworkRule(
  "EU_INTERACTION_TENSION_BENDING",
  "TENSION_BENDING",
  "detect tension + uniaxial bending interaction; numerical EN 1993 combined-action rule VALIDATION_REQUIRED",
  "steel members with tensile axial demand and major and/or minor bending; section classification VALIDATION_REQUIRED; intended EN 1993-1-1 profile",
  ["demand.axial", "demand.moment", "capacity.tension", "capacity.bending", "classification", "ndp.partial-factor"],
  "NOT_REQUIRED",
);

export const EU_INTERACTION_TENSION_BIAXIAL_RULE = frameworkRule(
  "EU_INTERACTION_TENSION_BIAXIAL_BENDING",
  "TENSION_BIAXIAL_BENDING",
  "detect tension + biaxial bending interaction; numerical EN 1993 combined-action rule VALIDATION_REQUIRED",
  "steel members with tensile axial demand and both major and minor bending; linear interaction is not assumed",
  ["demand.axial", "demand.momentMajor", "demand.momentMinor", "capacity.tension", "capacity.bendingMajor", "capacity.bendingMinor", "classification", "ndp.partial-factor"],
  "NOT_REQUIRED",
);

export const EU_INTERACTION_COMPRESSION_BENDING_RULE = frameworkRule(
  "EU_INTERACTION_COMPRESSION_BENDING",
  "COMPRESSION_BENDING",
  "detect compression + uniaxial bending interaction; numerical EN 1993 combined-action rule VALIDATION_REQUIRED",
  "steel members with compressive axial demand and major and/or minor bending; effective length, buckling axis, LTB/restraint, and moment distribution remain required for a future numerical rule",
  ["demand.axial", "demand.moment", "capacity.compression", "capacity.bending", "stability", "classification", "ndp.partial-factor"],
  "REQUIRED",
);

export const EU_INTERACTION_COMPRESSION_BIAXIAL_RULE = frameworkRule(
  "EU_INTERACTION_COMPRESSION_BIAXIAL_BENDING",
  "COMPRESSION_BIAXIAL_BENDING",
  "detect compression + biaxial bending interaction; numerical EN 1993 combined-action rule VALIDATION_REQUIRED",
  "steel members with compressive axial demand and both major and minor bending; member stability context must remain explicit",
  ["demand.axial", "demand.momentMajor", "demand.momentMinor", "capacity.compression", "stability", "classification", "ndp.partial-factor"],
  "REQUIRED",
);

export const EU_INTERACTION_BIAXIAL_BENDING_RULE = frameworkRule(
  "EU_INTERACTION_BIAXIAL_BENDING",
  "BIAXIAL_BENDING",
  "detect biaxial bending interaction; numerical EN 1993 combined-action rule VALIDATION_REQUIRED",
  "steel members with simultaneous major- and minor-axis moment; Mx/Mcx+My/Mcy is not assumed",
  ["demand.momentMajor", "demand.momentMinor", "capacity.bendingMajor", "capacity.bendingMinor", "classification", "ndp.partial-factor"],
  "NOT_REQUIRED",
);

export const EU_INTERACTION_AXIAL_BIAXIAL_RULE = frameworkRule(
  "EU_INTERACTION_AXIAL_BIAXIAL_BENDING",
  "AXIAL_BIAXIAL_BENDING",
  "detect N + Mx + My interaction; no universal three-component expression",
  "steel members with axial force and both major and minor bending; universal N/Nc+Mx/Mcx+My/Mcy is forbidden",
  ["demand.axial", "demand.momentMajor", "demand.momentMinor", "classification", "ndp.partial-factor"],
  "REQUIRED",
);

export const EU_INTERACTION_BENDING_SHEAR_RULE = frameworkRule(
  "EU_INTERACTION_BENDING_SHEAR",
  "BENDING_SHEAR",
  "detect bending + shear interaction; bending-resistance reduction is not guessed",
  "steel members with simultaneous bending and shear; EN 1993-1-1 member rules with optional EN 1993-1-5 plated dependency",
  ["demand.moment", "demand.shear", "capacity.bending", "capacity.shear", "classification", "ndp.partial-factor"],
  "NOT_REQUIRED",
  ["EN_1993_1_1", "EN_1993_1_5"],
);

export const EU_INTERACTION_AXIAL_SHEAR_RULE = frameworkRule(
  "EU_INTERACTION_AXIAL_SHEAR",
  "AXIAL_SHEAR",
  "detect axial + shear interaction; no universal axial/shear equation",
  "steel members with simultaneous axial force and shear where a future governed method may require assessment",
  ["demand.axial", "demand.shear", "capacity.axial", "capacity.shear", "ndp.partial-factor"],
  "NOT_REQUIRED",
  ["EN_1993_1_1"],
  "NOT_REQUIRED",
);

export const EU_INTERACTION_METHOD_REGISTRY: readonly EuInteractionMethodRecord[] = [
  EU_INTERACTION_TENSION_BENDING_RULE,
  EU_INTERACTION_TENSION_BIAXIAL_RULE,
  EU_INTERACTION_COMPRESSION_BENDING_RULE,
  EU_INTERACTION_COMPRESSION_BIAXIAL_RULE,
  EU_INTERACTION_BIAXIAL_BENDING_RULE,
  EU_INTERACTION_AXIAL_BIAXIAL_RULE,
  EU_INTERACTION_BENDING_SHEAR_RULE,
  EU_INTERACTION_AXIAL_SHEAR_RULE,
];

export const IMPLEMENTED_EU_INTERACTION_METHODS: readonly string[] = [];
export const FRAMEWORK_ONLY_EU_INTERACTION_METHODS = EU_INTERACTION_METHOD_REGISTRY.map((row) => row.methodId);
export const EU_INTERACTION_INDEPENDENT_BENCHMARKS = "NOT_APPLICABLE" as const;
