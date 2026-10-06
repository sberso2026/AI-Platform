import type { AuConcreteFlexureMethodRecord } from "@rtb/types";
import {
  AU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  AU_CONCRETE_STANDARD_EDITION,
  AU_FLEXURE_IMPLEMENTATION_VERSION,
} from "@rtb/types";

export const AU_FLEXURE_TOOL_REF = "EOS_AU_CONCRETE_FLEXURE" as const;

export const AU_RC_FLEXURE_ELASTIC_MAJOR: AuConcreteFlexureMethodRecord = {
  methodId: "AU_RC_FLEXURE_ELASTIC_MAJOR",
  methodType: "ELASTIC_SECTION_REFERENCE",
  axis: "MAJOR_AXIS",
  engineeringRuleRef: "AU-RC-FLEXURE-ELASTIC-MAJOR-V1",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: "d1e1-uncracked-elastic-section-reference-equilibrated-to-d1c-moment",
  as3600EditionRequirement: AU_CONCRETE_STANDARD_EDITION,
  requiredMaterialModels: ["RC_LINEAR_ELASTIC_CONCRETE_REFERENCE", "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE"],
  stressBlockDependency: null,
  strainLimitDependencies: [],
  strengthFactorDependency: null,
  reinforcementDependencies: ["D1E1_REINFORCEMENT_LAYOUT"],
  applicability: "PURE_OR_NEAR_PURE_FLEXURE_ONLY; uniaxial major-axis; D1E-1 valid geometry",
  requiredInputs: ["concrete.elasticModulus", "reinforcement.elasticModulus", "demand.moment", "section", "layout"],
  outputSemantics: "MECHANICS_REFERENCE",
  implementationVersion: AU_FLEXURE_IMPLEMENTATION_VERSION,
  numericalValidationState: "BENCHMARKED",
  engineeringValidationState: "NOT_VALIDATED",
  standardConformanceState: AU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  benchmarkRefs: ["AU-RC-FLEXURE-BM-ELASTIC-MAJOR-HAND-1"],
  methodScope: "MECHANICS_REFERENCE_ONLY",
};

export const AU_RC_FLEXURE_ELASTIC_MINOR: AuConcreteFlexureMethodRecord = {
  ...AU_RC_FLEXURE_ELASTIC_MAJOR,
  methodId: "AU_RC_FLEXURE_ELASTIC_MINOR",
  axis: "MINOR_AXIS",
  engineeringRuleRef: "AU-RC-FLEXURE-ELASTIC-MINOR-V1",
  applicability: "PURE_OR_NEAR_PURE_FLEXURE_ONLY; uniaxial minor-axis; D1E-1 valid geometry",
  benchmarkRefs: ["AU-RC-FLEXURE-BM-ELASTIC-MINOR-HAND-1"],
};

export const AU_RC_FLEXURE_AS3600_MAJOR: AuConcreteFlexureMethodRecord = {
  methodId: "AU_RC_FLEXURE_AS3600_UNIAXIAL_MAJOR",
  methodType: "AS3600_UNIAXIAL_FLEXURE",
  axis: "MAJOR_AXIS",
  engineeringRuleRef: "AU-RC-FLEXURE-AS3600-MAJOR-FRAMEWORK",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: "as-3600-uniaxial-flexure-pending-governed-edition-and-parameters",
  as3600EditionRequirement: AU_CONCRETE_STANDARD_EDITION,
  requiredMaterialModels: ["AU_CONCRETE_COMPRESSION_RESPONSE", "AU_REINFORCEMENT_RESPONSE"],
  stressBlockDependency: "AU_STRESS_BLOCK_RULE",
  strainLimitDependencies: ["AU_ULTIMATE_CONCRETE_STRAIN", "AU_REINFORCEMENT_STRAIN_LIMIT"],
  strengthFactorDependency: "AU_FLEXURE_STRENGTH_FACTOR",
  reinforcementDependencies: ["D1E1_REINFORCEMENT_LAYOUT"],
  applicability: "PURE_OR_NEAR_PURE_FLEXURE_ONLY; layout applicability declared by future governed method; not hard-coded to singly-reinforced rectangles",
  requiredInputs: [
    "concrete.compressiveStrength",
    "reinforcement.yieldStrength",
    "stressBlock",
    "strainLimits",
    "strengthFactor",
    "demand.moment",
    "section",
    "layout",
  ],
  outputSemantics: "CODE_DESIGN_CAPACITY",
  implementationVersion: AU_FLEXURE_IMPLEMENTATION_VERSION,
  numericalValidationState: "NOT_VALIDATED",
  engineeringValidationState: "NOT_VALIDATED",
  standardConformanceState: AU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  benchmarkRefs: [],
  methodScope: "FRAMEWORK_ONLY",
};

export const AU_RC_FLEXURE_AS3600_MINOR: AuConcreteFlexureMethodRecord = {
  ...AU_RC_FLEXURE_AS3600_MAJOR,
  methodId: "AU_RC_FLEXURE_AS3600_UNIAXIAL_MINOR",
  axis: "MINOR_AXIS",
  engineeringRuleRef: "AU-RC-FLEXURE-AS3600-MINOR-FRAMEWORK",
};

export const AU_CONCRETE_FLEXURE_METHODS: readonly AuConcreteFlexureMethodRecord[] = [
  AU_RC_FLEXURE_ELASTIC_MAJOR,
  AU_RC_FLEXURE_ELASTIC_MINOR,
  AU_RC_FLEXURE_AS3600_MAJOR,
  AU_RC_FLEXURE_AS3600_MINOR,
];

export const IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS = "NONE" as const;
export const FRAMEWORK_ONLY_AU_CONCRETE_FLEXURE_METHODS = [
  AU_RC_FLEXURE_AS3600_MAJOR.methodId,
  AU_RC_FLEXURE_AS3600_MINOR.methodId,
] as const;

export const AU_STRESS_BLOCK_RULE = {
  ruleId: "AU_STRESS_BLOCK_RULE",
  technicalBasisRef: null,
  standardEditionApplicability: AU_CONCRETE_STANDARD_EDITION,
  parameterRefs: ["alpha", "gamma", "equivalent_rectangular_factors"] as const,
  parameters: null,
  materialRangeApplicability: "UNKNOWN_PENDING_CONFIRMATION",
  implementationVersion: AU_FLEXURE_IMPLEMENTATION_VERSION,
  validationState: "FRAMEWORK_ONLY",
  populated: false,
} as const;

export const AU_STRENGTH_FACTOR_RULE = {
  ruleId: "AU_FLEXURE_STRENGTH_FACTOR",
  technicalBasisRef: null,
  standardEditionApplicability: AU_CONCRETE_STANDARD_EDITION,
  value: null,
  implementationVersion: AU_FLEXURE_IMPLEMENTATION_VERSION,
  validationState: "FRAMEWORK_ONLY",
  populated: false,
} as const;

export const AU_STRAIN_LIMIT_RULE = {
  ruleId: "AU_FLEXURE_STRAIN_LIMITS",
  ultimateConcreteStrain: null,
  reinforcementStrainLimit: null,
  source: "UNAVAILABLE",
  standardEditionApplicability: AU_CONCRETE_STANDARD_EDITION,
  implementationVersion: AU_FLEXURE_IMPLEMENTATION_VERSION,
} as const;

export const AU_DUCTILITY_FRAMEWORK = {
  ruleId: "AU_FLEXURE_DUCTILITY",
  numericThreshold: null,
  implementationState: "FRAMEWORK_ONLY",
} as const;
