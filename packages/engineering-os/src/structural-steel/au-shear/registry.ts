import type { SteelEngineeringRule } from "@rtb/types";

export const AU_SHEAR_IMPLEMENTATION_VERSION = "au-shear-1.0.0" as const;
export const AU_SHEAR_TOOL_REF = "EOS_AU_STEEL_SHEAR" as const;

const MECHANICS_YIELD = "established-mechanics-von-mises-pure-shear-yield-fy-over-sqrt-3-times-governed-shear-area";
const MECHANICS_BUCKLING = "established-mechanics-elastic-plate-shear-buckling-kv-pi2-E-over-12-1-nu2-d-over-t-squared-times-Av";

export const AU_SHEAR_YIELD_RULE: SteelEngineeringRule = {
  ruleId: "AU-SHEAR-YIELD-V1",
  methodId: "AU_SHEAR_YIELD_REFERENCE",
  jurisdiction: "australia",
  standardProfileRef: "au-steel-as4100-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_YIELD,
  calculationPurpose: "von Mises pure-shear yield force as a mechanics reference; Av must be explicitly governed",
  applicability: "steel members with explicit fy and governed shear area for the requested shear axis",
  requiredInputs: ["material.yieldStrength", "section.shearArea"],
  outputType: "MECHANICS_REFERENCE_ELASTIC_SHEAR",
  units: "N",
  implementationVersion: AU_SHEAR_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["AU-SHEAR-BM-YIELD-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "au-shear-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "AS4100",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
};

export const AU_SHEAR_BUCKLING_RULE: SteelEngineeringRule = {
  ruleId: "AU-SHEAR-BUCKLING-V1",
  methodId: "AU_SHEAR_BUCKLING_REFERENCE",
  jurisdiction: "australia",
  standardProfileRef: "au-steel-as4100-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_BUCKLING,
  calculationPurpose: "elastic plate shear-buckling force as a mechanics reference; kv is never defaulted",
  applicability: "plates with explicit E, Poisson ratio, web depth, web thickness, governed Av, and supplied kv",
  requiredInputs: ["material.elasticModulus", "material.poissonRatio", "section.webDepth", "section.webThickness", "section.shearArea", "shear.shearBucklingCoefficient"],
  outputType: "MECHANICS_REFERENCE_ELASTIC_SHEAR_BUCKLING",
  units: "N",
  implementationVersion: AU_SHEAR_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["AU-SHEAR-BM-BUCKLING-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "au-shear-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "AS4100",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
};

export const AU_SHEAR_METHOD_REGISTRY: readonly SteelEngineeringRule[] = [
  AU_SHEAR_YIELD_RULE,
  AU_SHEAR_BUCKLING_RULE,
];

export const AU_SECTION_SHEAR_METHOD_REGISTRY = [AU_SHEAR_YIELD_RULE] as const;

export const AU_SHEAR_METHOD_CATALOG = [
  {
    methodId: AU_SHEAR_YIELD_RULE.methodId,
    methodType: "ELASTIC_SHEAR_REFERENCE" as const,
    ruleRef: AU_SHEAR_YIELD_RULE.ruleId,
    authority: AU_SHEAR_YIELD_RULE.authorityType,
    technicalBasis: AU_SHEAR_YIELD_RULE.technicalBasisRef,
    requiredInputs: AU_SHEAR_YIELD_RULE.requiredInputs,
    applicability: AU_SHEAR_YIELD_RULE.applicability,
    output: AU_SHEAR_YIELD_RULE.outputType,
    validationState: AU_SHEAR_YIELD_RULE.validationState,
    standardConformanceState: AU_SHEAR_YIELD_RULE.standardConformanceState,
  },
  {
    methodId: AU_SHEAR_BUCKLING_RULE.methodId,
    methodType: "ELASTIC_SHEAR_BUCKLING_REFERENCE" as const,
    ruleRef: AU_SHEAR_BUCKLING_RULE.ruleId,
    authority: AU_SHEAR_BUCKLING_RULE.authorityType,
    technicalBasis: AU_SHEAR_BUCKLING_RULE.technicalBasisRef,
    requiredInputs: AU_SHEAR_BUCKLING_RULE.requiredInputs,
    applicability: AU_SHEAR_BUCKLING_RULE.applicability,
    output: AU_SHEAR_BUCKLING_RULE.outputType,
    validationState: AU_SHEAR_BUCKLING_RULE.validationState,
    standardConformanceState: AU_SHEAR_BUCKLING_RULE.standardConformanceState,
  },
] as const;

export const AU_SHEAR_UNSUPPORTED_METHODS = {
  CODE_PROFILE_SHEAR: "VALIDATION_REQUIRED",
  AS4100_DESIGN_CAPACITY: "VALIDATION_REQUIRED",
  WEB_SLENDERNESS_LIMIT: "VALIDATION_REQUIRED",
  CAPACITY_REDUCTION_FACTOR: "VALIDATION_REQUIRED",
  TENSION_FIELD: false,
  CONNECTION_SHEAR: false,
  BENDING_SHEAR_INTERACTION: false,
  AXIAL_SHEAR_INTERACTION: false,
  TORSIONAL_DESIGN: false,
} as const;
