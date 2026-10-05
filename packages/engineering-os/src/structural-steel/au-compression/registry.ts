import type { SteelEngineeringRule } from "@rtb/types";

export const AU_COMPRESSION_IMPLEMENTATION_VERSION = "au-compression-1.0.0" as const;
export const AU_COMPRESSION_TOOL_REF = "EOS_AU_STEEL_COMPRESSION" as const;

const MECHANICS_SQUASH = "established-mechanics-nominal-squash-load-equals-yield-stress-times-gross-area";
const MECHANICS_EULER = "established-mechanics-euler-elastic-buckling-pcr-pi2-ei-over-le2";

export const AU_COMPRESSION_SQUASH_RULE: SteelEngineeringRule = {
  ruleId: "AU-COMPRESSION-SQUASH-V1",
  methodId: "AU_COMPRESSION_SQUASH_YIELD",
  jurisdiction: "australia",
  standardProfileRef: "au-steel-as4100-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_SQUASH,
  calculationPurpose: "nominal squash load as a mechanics reference, not a design-code member capacity",
  applicability: "steel compression members with explicit governed fy and gross area",
  requiredInputs: ["material.yieldStrength", "section.area"],
  outputType: "MECHANICS_REFERENCE_SQUASH",
  units: "N",
  implementationVersion: AU_COMPRESSION_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["AU-COMPRESSION-BM-SQUASH-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "au-compression-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "AS4100",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
};

export const AU_COMPRESSION_EULER_MAJOR_RULE: SteelEngineeringRule = {
  ruleId: "AU-COMPRESSION-EULER-MAJOR-V1",
  methodId: "AU_COMPRESSION_EULER_MAJOR",
  jurisdiction: "australia",
  standardProfileRef: "au-steel-as4100-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_EULER,
  calculationPurpose: "Euler elastic buckling load about the major axis as a mechanics reference",
  applicability: "prismatic members with explicit E, Iyy, and governed major-axis effective length",
  requiredInputs: ["material.elasticModulus", "section.Iyy", "stability.effectiveLengthMajorM"],
  outputType: "MECHANICS_REFERENCE_EULER",
  units: "N",
  implementationVersion: AU_COMPRESSION_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["AU-COMPRESSION-BM-EULER-MAJOR-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "au-compression-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "AS4100",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
};

export const AU_COMPRESSION_EULER_MINOR_RULE: SteelEngineeringRule = {
  ruleId: "AU-COMPRESSION-EULER-MINOR-V1",
  methodId: "AU_COMPRESSION_EULER_MINOR",
  jurisdiction: "australia",
  standardProfileRef: "au-steel-as4100-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_EULER,
  calculationPurpose: "Euler elastic buckling load about the minor axis as a mechanics reference",
  applicability: "prismatic members with explicit E, Izz, and governed minor-axis effective length",
  requiredInputs: ["material.elasticModulus", "section.Izz", "stability.effectiveLengthMinorM"],
  outputType: "MECHANICS_REFERENCE_EULER",
  units: "N",
  implementationVersion: AU_COMPRESSION_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["AU-COMPRESSION-BM-EULER-MINOR-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "au-compression-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "AS4100",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
};

export const AU_COMPRESSION_METHOD_REGISTRY: readonly SteelEngineeringRule[] = [
  AU_COMPRESSION_SQUASH_RULE,
  AU_COMPRESSION_EULER_MAJOR_RULE,
  AU_COMPRESSION_EULER_MINOR_RULE,
];

export const AU_COMPRESSION_UNSUPPORTED_METHODS = {
  AS4100_MEMBER_CAPACITY: "VALIDATION_REQUIRED",
  BUCKLING_CURVE: "VALIDATION_REQUIRED",
  CAPACITY_REDUCTION_FACTOR: "VALIDATION_REQUIRED",
  SECTION_CLASSIFICATION: "VALIDATION_REQUIRED",
  BENDING: false,
  LTB: false,
  SHEAR: false,
  COMBINED_ACTION: false,
} as const;
