import type { EuTensionMethodRecord } from "@rtb/types";

export const EU_TENSION_IMPLEMENTATION_VERSION = "eu-tension-1.0.0" as const;
export const EU_TENSION_TOOL_REF = "EOS_EU_STEEL_TENSION" as const;

const MECHANICS_BASIS = "established-mechanics-nominal-tension-force-equals-stress-times-area";

export const EU_TENSION_GROSS_YIELD_MECHANICS_RULE: EuTensionMethodRecord = {
  ruleId: "EU-TENSION-GROSS-YIELD-MECHANICS-V1",
  methodId: "EU_TENSION_GROSS_YIELD_MECHANICS",
  jurisdiction: "eu-eea",
  standardProfileRef: "eu-steel-en1993-1-1-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_BASIS,
  calculationPurpose: "nominal tensile yield resistance of the gross metal area",
  applicability: "steel tension members with explicit governed fy and gross area; holes ignored",
  requiredInputs: ["material.yieldStrength", "section.area"],
  outputType: "NOMINAL_GROSS_YIELD",
  units: "N",
  implementationVersion: EU_TENSION_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["EU-TENSION-BM-GROSS-YIELD-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "eu-tension-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "EN1993",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
  methodType: "ENGINEERING_MECHANICS_REFERENCE",
  standardPartRef: "EN_1993_1_1",
  ndpDependencies: [],
  ruleRequiresNdp: false,
  compatibleGenerations: ["FIRST_GENERATION", "UNKNOWN_PENDING_CONFIRMATION"],
  scopeState: "MECHANICS_REFERENCE_ONLY",
};

export const EU_TENSION_NET_FRACTURE_MECHANICS_RULE: EuTensionMethodRecord = {
  ruleId: "EU-TENSION-NET-FRACTURE-MECHANICS-V1",
  methodId: "EU_TENSION_NET_FRACTURE_MECHANICS",
  jurisdiction: "eu-eea",
  standardProfileRef: "eu-steel-en1993-1-1-intended",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: MECHANICS_BASIS,
  calculationPurpose: "nominal tensile fracture resistance of the explicit net metal area",
  applicability: "steel tension members with explicit governed fu and net area; net area must not be inferred",
  requiredInputs: ["material.ultimateStrength", "section.netArea"],
  outputType: "NOMINAL_NET_FRACTURE",
  units: "N",
  implementationVersion: EU_TENSION_IMPLEMENTATION_VERSION,
  validationState: "BENCHMARKED",
  benchmarkRefs: ["EU-TENSION-BM-NET-FRACTURE-HAND-1"],
  humanReviewState: "required",
  provenanceRef: "eu-tension-mechanics-v1",
  clauseRef: null,
  intendedStandardProfile: "EN1993",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
  methodType: "ENGINEERING_MECHANICS_REFERENCE",
  standardPartRef: "EN_1993_1_1",
  ndpDependencies: [],
  ruleRequiresNdp: false,
  compatibleGenerations: ["FIRST_GENERATION", "UNKNOWN_PENDING_CONFIRMATION"],
  scopeState: "MECHANICS_REFERENCE_ONLY",
};

export const EU_TENSION_GROSS_YIELD_CODE_PROFILE_RULE: EuTensionMethodRecord = {
  ruleId: "EU-TENSION-GROSS-YIELD-CODE-PROFILE-V1",
  methodId: "EU_TENSION_GROSS_YIELD_CODE_PROFILE",
  jurisdiction: "eu-eea",
  standardProfileRef: "eu-steel-en1993-1-1-intended",
  authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
  technicalBasisRef: "en1993-tension-design-resistance-validation-required",
  calculationPurpose: "Eurocode-profile tensile design resistance of the gross section",
  applicability: "not implemented; requires governed partial factor / NDP and confirmed edition",
  requiredInputs: ["material.yieldStrength", "section.area", "ndp.partial-factor"],
  outputType: "EUROCODE_PROFILE_GROSS_YIELD",
  units: "N",
  implementationVersion: EU_TENSION_IMPLEMENTATION_VERSION,
  validationState: "FRAMEWORK_ONLY",
  benchmarkRefs: [],
  humanReviewState: "required",
  provenanceRef: "eu-tension-code-profile-unvalidated-v1",
  clauseRef: null,
  intendedStandardProfile: "EN1993",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "FRAMEWORK_ONLY",
  methodType: "EUROCODE_PROFILE_CAPACITY",
  standardPartRef: "EN_1993_1_1",
  ndpDependencies: ["partial-factor"],
  ruleRequiresNdp: true,
  compatibleGenerations: ["FIRST_GENERATION", "UNKNOWN_PENDING_CONFIRMATION"],
  scopeState: "VALIDATION_REQUIRED",
};

export const EU_TENSION_NET_FRACTURE_CODE_PROFILE_RULE: EuTensionMethodRecord = {
  ruleId: "EU-TENSION-NET-FRACTURE-CODE-PROFILE-V1",
  methodId: "EU_TENSION_NET_FRACTURE_CODE_PROFILE",
  jurisdiction: "eu-eea",
  standardProfileRef: "eu-steel-en1993-1-1-intended",
  authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
  technicalBasisRef: "en1993-tension-design-resistance-validation-required",
  calculationPurpose: "Eurocode-profile tensile design resistance of the net section",
  applicability: "not implemented; requires governed partial factor, net-area reduction rule, and confirmed edition",
  requiredInputs: ["material.ultimateStrength", "section.netArea", "ndp.partial-factor"],
  outputType: "EUROCODE_PROFILE_NET_FRACTURE",
  units: "N",
  implementationVersion: EU_TENSION_IMPLEMENTATION_VERSION,
  validationState: "FRAMEWORK_ONLY",
  benchmarkRefs: [],
  humanReviewState: "required",
  provenanceRef: "eu-tension-code-profile-unvalidated-v1",
  clauseRef: null,
  intendedStandardProfile: "EN1993",
  standardConformanceState: "INTENDED_PROFILE",
  bindingState: "FRAMEWORK_ONLY",
  methodType: "EUROCODE_PROFILE_CAPACITY",
  standardPartRef: "EN_1993_1_1",
  ndpDependencies: ["partial-factor"],
  ruleRequiresNdp: true,
  compatibleGenerations: ["FIRST_GENERATION", "UNKNOWN_PENDING_CONFIRMATION"],
  scopeState: "NOT_IMPLEMENTED",
};

export const EU_TENSION_METHOD_REGISTRY: readonly EuTensionMethodRecord[] = [
  EU_TENSION_GROSS_YIELD_MECHANICS_RULE,
  EU_TENSION_NET_FRACTURE_MECHANICS_RULE,
  EU_TENSION_GROSS_YIELD_CODE_PROFILE_RULE,
  EU_TENSION_NET_FRACTURE_CODE_PROFILE_RULE,
];

export const IMPLEMENTED_EU_TENSION_METHODS = [
  EU_TENSION_GROSS_YIELD_MECHANICS_RULE.methodId,
  EU_TENSION_NET_FRACTURE_MECHANICS_RULE.methodId,
] as const;

export const FRAMEWORK_ONLY_EU_TENSION_METHODS = [
  EU_TENSION_GROSS_YIELD_CODE_PROFILE_RULE.methodId,
  EU_TENSION_NET_FRACTURE_CODE_PROFILE_RULE.methodId,
] as const;
