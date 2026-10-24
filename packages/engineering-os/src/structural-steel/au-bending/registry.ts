import type { SteelEngineeringRule } from "@rtb/types";

export const AU_BENDING_IMPLEMENTATION_VERSION = "au-bending-1.0.0" as const;
export const AU_BENDING_TOOL_REF = "EOS_AU_STEEL_BENDING" as const;

const MECHANICS_YIELD = "established-mechanics-first-yield-moment-equals-fy-times-elastic-section-modulus";
const MECHANICS_LTB = "established-mechanics-uniform-moment-elastic-critical-ltb-sqrt-pi2-EIy-L2-times-GJ-plus-pi2-EIw-L2";

export const AU_BENDING_ELASTIC_MAJOR_RULE: SteelEngineeringRule = {
  ruleId: "AU-BENDING-ELASTIC-MAJOR-V1",
  methodId: "AU_BENDING_ELASTIC_MAJOR",
  jurisdiction: "australia",
  standardProfileRef: "au-steel-as4100-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_YIELD,
  calculationPurpose: "elastic first-yield moment about the major axis as a mechanics reference",
  applicability: "steel members with explicit fy and major-axis elastic section modulus",
  requiredInputs: ["material.yieldStrength", "section.sectionModulusYy"],
  outputType: "MECHANICS_REFERENCE_ELASTIC_BENDING",
  units: "N.m",
  implementationVersion: AU_BENDING_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["AU-BENDING-BM-ELASTIC-MAJOR-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "au-bending-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "AS4100",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
};

export const AU_BENDING_ELASTIC_MINOR_RULE: SteelEngineeringRule = {
  ruleId: "AU-BENDING-ELASTIC-MINOR-V1",
  methodId: "AU_BENDING_ELASTIC_MINOR",
  jurisdiction: "australia",
  standardProfileRef: "au-steel-as4100-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_YIELD,
  calculationPurpose: "elastic first-yield moment about the minor axis as a mechanics reference",
  applicability: "steel members with explicit fy and minor-axis elastic section modulus",
  requiredInputs: ["material.yieldStrength", "section.sectionModulusZz"],
  outputType: "MECHANICS_REFERENCE_ELASTIC_BENDING",
  units: "N.m",
  implementationVersion: AU_BENDING_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["AU-BENDING-BM-ELASTIC-MINOR-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "au-bending-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "AS4100",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
};

export const AU_BENDING_ELASTIC_LTB_RULE: SteelEngineeringRule = {
  ruleId: "AU-BENDING-ELASTIC-LTB-V1",
  methodId: "AU_BENDING_ELASTIC_LTB",
  jurisdiction: "australia",
  standardProfileRef: "au-steel-as4100-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_LTB,
  calculationPurpose: "uniform-moment elastic critical LTB moment as a mechanics reference; no moment-modification or code reduction",
  applicability: "doubly-symmetric prismatic members with explicit E, G, Iminor, J, Iw, unbraced length, and LTB restraint",
  requiredInputs: ["material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant", "stability.unbracedLengthM"],
  outputType: "MECHANICS_REFERENCE_ELASTIC_LTB",
  units: "N.m",
  implementationVersion: AU_BENDING_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["AU-BENDING-BM-ELASTIC-LTB-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "au-bending-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "AS4100",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
};

export const AU_BENDING_METHOD_REGISTRY: readonly SteelEngineeringRule[] = [
  AU_BENDING_ELASTIC_MAJOR_RULE,
  AU_BENDING_ELASTIC_MINOR_RULE,
  AU_BENDING_ELASTIC_LTB_RULE,
];

export const AU_SECTION_BENDING_METHOD_REGISTRY = [AU_BENDING_ELASTIC_MAJOR_RULE, AU_BENDING_ELASTIC_MINOR_RULE] as const;

export const AU_BENDING_METHOD_CATALOG = [
  {
    methodId: AU_BENDING_ELASTIC_MAJOR_RULE.methodId,
    methodType: "ELASTIC_BENDING_REFERENCE" as const,
    engineeringRuleRef: AU_BENDING_ELASTIC_MAJOR_RULE.ruleId,
    technicalBasis: AU_BENDING_ELASTIC_MAJOR_RULE.technicalBasisRef,
    axis: "MAJOR_AXIS" as const,
    requiredInputs: AU_BENDING_ELASTIC_MAJOR_RULE.requiredInputs,
    output: AU_BENDING_ELASTIC_MAJOR_RULE.outputType,
    authorityType: AU_BENDING_ELASTIC_MAJOR_RULE.authorityType,
    validationState: AU_BENDING_ELASTIC_MAJOR_RULE.validationState,
    standardConformanceState: AU_BENDING_ELASTIC_MAJOR_RULE.standardConformanceState,
  },
  {
    methodId: AU_BENDING_ELASTIC_MINOR_RULE.methodId,
    methodType: "ELASTIC_BENDING_REFERENCE" as const,
    engineeringRuleRef: AU_BENDING_ELASTIC_MINOR_RULE.ruleId,
    technicalBasis: AU_BENDING_ELASTIC_MINOR_RULE.technicalBasisRef,
    axis: "MINOR_AXIS" as const,
    requiredInputs: AU_BENDING_ELASTIC_MINOR_RULE.requiredInputs,
    output: AU_BENDING_ELASTIC_MINOR_RULE.outputType,
    authorityType: AU_BENDING_ELASTIC_MINOR_RULE.authorityType,
    validationState: AU_BENDING_ELASTIC_MINOR_RULE.validationState,
    standardConformanceState: AU_BENDING_ELASTIC_MINOR_RULE.standardConformanceState,
  },
  {
    methodId: AU_BENDING_ELASTIC_LTB_RULE.methodId,
    methodType: "ELASTIC_LTB_REFERENCE" as const,
    engineeringRuleRef: AU_BENDING_ELASTIC_LTB_RULE.ruleId,
    technicalBasis: AU_BENDING_ELASTIC_LTB_RULE.technicalBasisRef,
    axis: "MAJOR_AXIS" as const,
    requiredInputs: AU_BENDING_ELASTIC_LTB_RULE.requiredInputs,
    output: AU_BENDING_ELASTIC_LTB_RULE.outputType,
    authorityType: AU_BENDING_ELASTIC_LTB_RULE.authorityType,
    validationState: AU_BENDING_ELASTIC_LTB_RULE.validationState,
    standardConformanceState: AU_BENDING_ELASTIC_LTB_RULE.standardConformanceState,
  },
] as const;

export const AU_BENDING_UNSUPPORTED_METHODS = {
  SECTION_CLASSIFICATION: "VALIDATION_REQUIRED",
  PLASTIC_SECTION_CAPACITY: "VALIDATION_REQUIRED",
  CAPACITY_REDUCTION_FACTOR: "VALIDATION_REQUIRED",
  MOMENT_MODIFICATION_FACTOR: "VALIDATION_REQUIRED",
  CODE_PROFILE_LTB: "VALIDATION_REQUIRED",
  AS4100_MEMBER_BENDING_CAPACITY: "VALIDATION_REQUIRED",
  SHEAR: false,
  COMBINED_ACTION: false,
  TORSIONAL_DESIGN: false,
} as const;
