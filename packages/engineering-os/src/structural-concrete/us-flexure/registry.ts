import type { UsConcreteFlexureMethodRecord } from "@rtb/types";
import {
  US_CONCRETE_STANDARD_CONFORMANCE_STATE,
  US_CONCRETE_STANDARD_EDITION,
  US_FLEXURE_IMPLEMENTATION_VERSION,
} from "@rtb/types";

export const US_FLEXURE_TOOL_REF = "EOS_US_CONCRETE_FLEXURE" as const;

export const US_RC_FLEXURE_ELASTIC_MAJOR: UsConcreteFlexureMethodRecord = {
  methodId: "US_RC_FLEXURE_ELASTIC_MAJOR",
  methodType: "ELASTIC_SECTION_REFERENCE",
  axis: "MAJOR_AXIS",
  engineeringRuleRef: "US-RC-FLEXURE-ELASTIC-MAJOR-V1",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: "d1e1-uncracked-elastic-section-reference-equilibrated-to-d1c-moment",
  aciFamily: "ACI 318",
  edition: US_CONCRETE_STANDARD_EDITION,
  amendmentErrataDependency: true,
  buildingCodeDependency: false,
  localAmendmentDependency: false,
  requiredMaterialModels: ["RC_LINEAR_ELASTIC_CONCRETE_REFERENCE", "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE"],
  stressBlockDependency: null,
  strainRuleDependency: [],
  strengthFactorDependency: null,
  reinforcementDependencies: ["D1E1_REINFORCEMENT_LAYOUT"],
  applicability: "PURE_OR_NEAR_PURE_FLEXURE_ONLY; uniaxial major-axis; D1E-1 valid geometry; arbitrary D1E-1 reinforcement layout",
  requiredInputs: ["concrete.elasticModulus", "reinforcement.elasticModulus", "demand.moment", "section", "layout"],
  outputSemantics: "MECHANICS_REFERENCE",
  implementationVersion: US_FLEXURE_IMPLEMENTATION_VERSION,
  numericalValidationState: "BENCHMARKED",
  engineeringValidationState: "NOT_VALIDATED",
  standardConformanceState: US_CONCRETE_STANDARD_CONFORMANCE_STATE,
  benchmarkRefs: ["US-RC-FLEXURE-BM-ELASTIC-MAJOR-HAND-1"],
  methodScope: "MECHANICS_REFERENCE_ONLY",
};

export const US_RC_FLEXURE_ELASTIC_MINOR: UsConcreteFlexureMethodRecord = {
  ...US_RC_FLEXURE_ELASTIC_MAJOR,
  methodId: "US_RC_FLEXURE_ELASTIC_MINOR",
  axis: "MINOR_AXIS",
  engineeringRuleRef: "US-RC-FLEXURE-ELASTIC-MINOR-V1",
  applicability: "PURE_OR_NEAR_PURE_FLEXURE_ONLY; uniaxial minor-axis; D1E-1 valid geometry; arbitrary D1E-1 reinforcement layout",
  benchmarkRefs: ["US-RC-FLEXURE-BM-ELASTIC-MINOR-HAND-1"],
};

export const US_RC_FLEXURE_ACI_MAJOR: UsConcreteFlexureMethodRecord = {
  methodId: "US_RC_FLEXURE_ACI_UNIAXIAL_MAJOR",
  methodType: "ACI_UNIAXIAL_FLEXURE",
  axis: "MAJOR_AXIS",
  engineeringRuleRef: "US-RC-FLEXURE-ACI-MAJOR-FRAMEWORK",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: "aci-uniaxial-flexure-pending-governed-edition-amendment-adoption-and-parameters",
  aciFamily: "ACI 318",
  edition: US_CONCRETE_STANDARD_EDITION,
  amendmentErrataDependency: true,
  buildingCodeDependency: true,
  localAmendmentDependency: true,
  requiredMaterialModels: ["US_CONCRETE_COMPRESSION_RESPONSE", "US_REINFORCEMENT_RESPONSE"],
  stressBlockDependency: "US_CONCRETE_STRESS_BLOCK_RULE",
  strainRuleDependency: ["US_ULTIMATE_CONCRETE_STRAIN", "US_REINFORCEMENT_STRAIN_LIMIT"],
  strengthFactorDependency: "US_CONCRETE_STRENGTH_REDUCTION_FACTOR_RULE",
  reinforcementDependencies: ["D1E1_REINFORCEMENT_LAYOUT"],
  applicability: "PURE_OR_NEAR_PURE_FLEXURE_ONLY; layout applicability declared by future governed method; not hard-coded to singly-reinforced rectangles",
  requiredInputs: [
    "concrete.compressiveStrength",
    "reinforcement.yieldStrength",
    "aciEdition",
    "buildingCodeContext",
    "localAmendments",
    "stressBlock",
    "strainRule",
    "strengthReductionFactor",
    "demand.moment",
    "section",
    "layout",
  ],
  outputSemantics: "CODE_DESIGN_STRENGTH",
  implementationVersion: US_FLEXURE_IMPLEMENTATION_VERSION,
  numericalValidationState: "NOT_VALIDATED",
  engineeringValidationState: "NOT_VALIDATED",
  standardConformanceState: US_CONCRETE_STANDARD_CONFORMANCE_STATE,
  benchmarkRefs: [],
  methodScope: "FRAMEWORK_ONLY",
};

export const US_RC_FLEXURE_ACI_MINOR: UsConcreteFlexureMethodRecord = {
  ...US_RC_FLEXURE_ACI_MAJOR,
  methodId: "US_RC_FLEXURE_ACI_UNIAXIAL_MINOR",
  axis: "MINOR_AXIS",
  engineeringRuleRef: "US-RC-FLEXURE-ACI-MINOR-FRAMEWORK",
};

export const US_CONCRETE_FLEXURE_METHODS: readonly UsConcreteFlexureMethodRecord[] = [
  US_RC_FLEXURE_ELASTIC_MAJOR,
  US_RC_FLEXURE_ELASTIC_MINOR,
  US_RC_FLEXURE_ACI_MAJOR,
  US_RC_FLEXURE_ACI_MINOR,
];

export const IMPLEMENTED_US_CONCRETE_CODE_FLEXURE_METHODS = "NONE" as const;
export const FRAMEWORK_ONLY_US_CONCRETE_FLEXURE_METHODS = [
  US_RC_FLEXURE_ACI_MAJOR.methodId,
  US_RC_FLEXURE_ACI_MINOR.methodId,
] as const;

export const US_FLEXURE_DUCTILITY = {
  ruleId: "US_FLEXURE_DUCTILITY",
  numericThreshold: null,
  implementationState: "FRAMEWORK_ONLY",
} as const;
