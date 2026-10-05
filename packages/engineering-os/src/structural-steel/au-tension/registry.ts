import type { SteelEngineeringRule } from "@rtb/types";

export const AU_TENSION_IMPLEMENTATION_VERSION = "au-tension-1.0.0" as const;
export const AU_TENSION_TOOL_REF = "EOS_AU_STEEL_TENSION" as const;

const MECHANICS_BASIS = "established-mechanics-nominal-tension-force-equals-stress-times-area";

export const AU_TENSION_GROSS_YIELD_RULE: SteelEngineeringRule = {
  ruleId: "AU-TENSION-GROSS-YIELD-V1",
  methodId: "AU_TENSION_GROSS_YIELD",
  jurisdiction: "australia",
  standardProfileRef: "au-steel-as4100-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_BASIS,
  calculationPurpose: "nominal tensile yield resistance of the gross metal area",
  applicability: "steel tension members with explicit governed fy and gross area; holes ignored",
  requiredInputs: ["material.yieldStrength", "section.area"],
  outputType: "NOMINAL_GROSS_YIELD",
  units: "N",
  implementationVersion: AU_TENSION_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["AU-TENSION-BM-GROSS-YIELD-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "au-tension-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "AS4100",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
};

export const AU_TENSION_NET_FRACTURE_RULE: SteelEngineeringRule = {
  ruleId: "AU-TENSION-NET-FRACTURE-V1",
  methodId: "AU_TENSION_NET_FRACTURE",
  jurisdiction: "australia",
  standardProfileRef: "au-steel-as4100-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_BASIS,
  calculationPurpose: "nominal tensile fracture resistance of the explicit net metal area",
  applicability: "steel tension members with explicit governed fu and net area; net area must not be inferred",
  requiredInputs: ["material.ultimateStrength", "section.netArea"],
  outputType: "NOMINAL_NET_FRACTURE",
  units: "N",
  implementationVersion: AU_TENSION_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["AU-TENSION-BM-NET-FRACTURE-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "au-tension-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "AS4100",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
};

export const AU_TENSION_METHOD_REGISTRY: readonly SteelEngineeringRule[] = [
  AU_TENSION_GROSS_YIELD_RULE,
  AU_TENSION_NET_FRACTURE_RULE,
];

export const AU_TENSION_UNSUPPORTED_METHODS = {
  COMPRESSION: false,
  BENDING: false,
  SHEAR: false,
  COMBINED_ACTION: false,
  CONNECTION: false,
  DESIGN_CAPACITY_REDUCTION: "VALIDATION_REQUIRED",
} as const;
