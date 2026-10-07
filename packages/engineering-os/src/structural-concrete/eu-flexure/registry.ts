import type { EuConcreteFlexureMethodRecord } from "@rtb/types";
import {
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  EU_CONCRETE_STANDARD_EDITION,
  EU_FLEXURE_IMPLEMENTATION_VERSION,
  EU_INITIAL_CONCRETE_STANDARD_PART,
} from "@rtb/types";

export const EU_FLEXURE_TOOL_REF = "EOS_EU_CONCRETE_FLEXURE" as const;

const NDP_DEPS = ["gamma_c", "gamma_s", "ecu", "eta", "lambda"] as const;

export const EU_RC_FLEXURE_ELASTIC_MAJOR: EuConcreteFlexureMethodRecord = {
  methodId: "EU_RC_FLEXURE_ELASTIC_MAJOR",
  methodType: "ELASTIC_SECTION_REFERENCE",
  axis: "MAJOR_AXIS",
  engineeringRuleRef: "EU-RC-FLEXURE-ELASTIC-MAJOR-V1",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: "d1e1-uncracked-elastic-section-reference-equilibrated-to-d1c-moment",
  standardFamily: "EN 1992",
  generation: "UNKNOWN_PENDING_CONFIRMATION",
  edition: EU_CONCRETE_STANDARD_EDITION,
  part: EU_INITIAL_CONCRETE_STANDARD_PART,
  nationalAnnexDependency: false,
  ndpDependency: [],
  requiredMaterialModels: ["RC_LINEAR_ELASTIC_CONCRETE_REFERENCE", "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE"],
  stressBlockOrDesignModelDependency: null,
  strainLimitDependencies: [],
  partialFactorDependencies: [],
  reinforcementDependencies: ["D1E1_REINFORCEMENT_LAYOUT"],
  applicability: "PURE_OR_NEAR_PURE_FLEXURE_ONLY; uniaxial major-axis; D1E-1 valid geometry; arbitrary D1E-1 reinforcement layout",
  requiredInputs: ["concrete.elasticModulus", "reinforcement.elasticModulus", "demand.moment", "section", "layout"],
  outputSemantics: "MECHANICS_REFERENCE",
  implementationVersion: EU_FLEXURE_IMPLEMENTATION_VERSION,
  numericalValidationState: "BENCHMARKED",
  engineeringValidationState: "NOT_VALIDATED",
  standardConformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  benchmarkRefs: ["EU-RC-FLEXURE-BM-ELASTIC-MAJOR-HAND-1"],
  methodScope: "MECHANICS_REFERENCE_ONLY",
};

export const EU_RC_FLEXURE_ELASTIC_MINOR: EuConcreteFlexureMethodRecord = {
  ...EU_RC_FLEXURE_ELASTIC_MAJOR,
  methodId: "EU_RC_FLEXURE_ELASTIC_MINOR",
  axis: "MINOR_AXIS",
  engineeringRuleRef: "EU-RC-FLEXURE-ELASTIC-MINOR-V1",
  applicability: "PURE_OR_NEAR_PURE_FLEXURE_ONLY; uniaxial minor-axis; D1E-1 valid geometry; arbitrary D1E-1 reinforcement layout",
  benchmarkRefs: ["EU-RC-FLEXURE-BM-ELASTIC-MINOR-HAND-1"],
};

export const EU_RC_FLEXURE_EN1992_MAJOR: EuConcreteFlexureMethodRecord = {
  methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
  methodType: "EN1992_UNIAXIAL_FLEXURE",
  axis: "MAJOR_AXIS",
  engineeringRuleRef: "EU-RC-FLEXURE-EN1992-MAJOR-FRAMEWORK",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: "en-1992-uniaxial-flexure-pending-governed-edition-annex-ndp-and-parameters",
  standardFamily: "EN 1992",
  generation: "UNKNOWN_PENDING_CONFIRMATION",
  edition: EU_CONCRETE_STANDARD_EDITION,
  part: EU_INITIAL_CONCRETE_STANDARD_PART,
  nationalAnnexDependency: true,
  ndpDependency: NDP_DEPS,
  requiredMaterialModels: ["EU_CONCRETE_COMPRESSION_RESPONSE", "EU_REINFORCEMENT_RESPONSE"],
  stressBlockOrDesignModelDependency: "EU_CONCRETE_STRESS_BLOCK_RULE",
  strainLimitDependencies: ["EU_ULTIMATE_CONCRETE_STRAIN", "EU_REINFORCEMENT_STRAIN_LIMIT"],
  partialFactorDependencies: ["gamma_c", "gamma_s"],
  reinforcementDependencies: ["D1E1_REINFORCEMENT_LAYOUT"],
  applicability: "PURE_OR_NEAR_PURE_FLEXURE_ONLY; layout applicability declared by future governed method; not hard-coded to singly-reinforced rectangles",
  requiredInputs: [
    "concrete.compressiveStrength",
    "reinforcement.yieldStrength",
    "standardPart",
    "nationalAnnex",
    "ndpSet",
    "stressBlockOrDesignModel",
    "strainLimits",
    "partialFactors",
    "demand.moment",
    "section",
    "layout",
  ],
  outputSemantics: "CODE_DESIGN_RESISTANCE",
  implementationVersion: EU_FLEXURE_IMPLEMENTATION_VERSION,
  numericalValidationState: "NOT_VALIDATED",
  engineeringValidationState: "NOT_VALIDATED",
  standardConformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  benchmarkRefs: [],
  methodScope: "FRAMEWORK_ONLY",
};

export const EU_RC_FLEXURE_EN1992_MINOR: EuConcreteFlexureMethodRecord = {
  ...EU_RC_FLEXURE_EN1992_MAJOR,
  methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR",
  axis: "MINOR_AXIS",
  engineeringRuleRef: "EU-RC-FLEXURE-EN1992-MINOR-FRAMEWORK",
};

export const EU_CONCRETE_FLEXURE_METHODS: readonly EuConcreteFlexureMethodRecord[] = [
  EU_RC_FLEXURE_ELASTIC_MAJOR,
  EU_RC_FLEXURE_ELASTIC_MINOR,
  EU_RC_FLEXURE_EN1992_MAJOR,
  EU_RC_FLEXURE_EN1992_MINOR,
];

export const IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS = "NONE" as const;
export const FRAMEWORK_ONLY_EU_CONCRETE_FLEXURE_METHODS = [
  EU_RC_FLEXURE_EN1992_MAJOR.methodId,
  EU_RC_FLEXURE_EN1992_MINOR.methodId,
] as const;

export const EU_FLEXURE_DUCTILITY = {
  ruleId: "EU_FLEXURE_DUCTILITY",
  numericThreshold: null,
  implementationState: "FRAMEWORK_ONLY",
} as const;
