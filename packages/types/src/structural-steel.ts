/**
 * EOS-D1D-0 — common Structural steel design framework.
 * Adapter contracts only. Not AS 4100 / EN 1993 / AISC 360 formula engines.
 */

import type { EosGlobalProvenanceContract } from "./global-governance";
import type { StructuralDemandResult } from "./structural-demand";
import type { StructuralCapacityResult, StructuralDesignCheck, StructuralEvidenceBinding } from "./structural-domain";
import type { StructuralStandardContext } from "./structural-standard-binding";

export const EOS_D1D0_PHASE = "EOS-D1D-0" as const;

export const DUPLICATE_STEEL_DOMAIN_MODEL = false as const;
export const DEMAND_ENGINE_DUPLICATED_IN_STEEL = false as const;
export const AUST300_GLOBAL_DEFAULT = false as const;
export const UNSOURCED_CODE_FORMULA_ALLOWED = false as const;
export const STEEL_STANDARD_LICENSING_BOUNDARY = true as const;
export const CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const SILENT_EFFECTIVE_LENGTH_ASSUMPTION = false as const;
export const UNIVERSAL_INTERACTION_EQUATION_HARDCODED = false as const;
export const INDEPENDENT_STEEL_VALIDATION_REQUIRED = true as const;
export const STEEL_AI_ADVISORY_ONLY = true as const;
export const LLM_STEEL_CAPACITY_AUTHORITY = false as const;
export const AI_ENGINEERING_APPROVAL = false as const;
export const OPTIMIZATION_REQUIRES_DETERMINISTIC_RECHECK = true as const;
export const AU_ONLY_STEEL_CORE = false as const;
export const EU_ONLY_STEEL_CORE = false as const;
export const US_ONLY_STEEL_CORE = false as const;
export const EOS_D1D_AU1_PHASE = "EOS-D1D-AU-1" as const;
export const LLM_MEMORY_ONLY_RULE_ALLOWED = false as const;
export const GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS = false as const;
export const AI_STANDARD_CONFORMANCE_AUTHORITY = false as const;
export const SILENT_STANDARD_EDITION_INFERENCE = false as const;
export const UNKNOWN_CODE_PARAMETER_GUESSED = false as const;

export const ENGINEERING_RULE_AUTHORITY_TYPES = [
  "AUTHORITATIVE_STANDARD_DERIVED",
  "VALIDATED_ENGINEERING_REFERENCE",
  "HUMAN_AUTHORED_VALIDATED_RULE",
  "ESTABLISHED_ENGINEERING_MECHANICS",
  "CERTIFIED_EXTERNAL_TOOL_REFERENCE",
  "OTHER_GOVERNED_ENGINEERING_SOURCE",
] as const;
export type EngineeringRuleAuthorityType = (typeof ENGINEERING_RULE_AUTHORITY_TYPES)[number];

export const FORBIDDEN_ENGINEERING_RULE_AUTHORITIES = [
  "LLM_MEMORY_ONLY",
  "UNSOURCED_WEB_SUMMARY",
  "BLOG_ONLY",
  "FORUM_ONLY",
  "UNVERIFIED_GENERATED_RULE",
] as const;
export type ForbiddenEngineeringRuleAuthority = (typeof FORBIDDEN_ENGINEERING_RULE_AUTHORITIES)[number];

export const STEEL_STANDARD_CONFORMANCE_STATES = [
  "INTENDED_PROFILE",
  "RULE_TRACEABLE",
  "BENCHMARKED",
  "ENGINEER_CONFIRMED",
  "CONFORMANCE_VALIDATED",
  "CERTIFIED",
] as const;
export type SteelStandardConformanceState = (typeof STEEL_STANDARD_CONFORMANCE_STATES)[number];

export const STEEL_IMPLEMENTATION_BINDING_STATES = [
  "FRAMEWORK_ONLY",
  "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
  "IMPLEMENTED",
  "BENCHMARKED",
  "HUMAN_VALIDATED",
  "PILOT",
  "CERTIFIED",
] as const;
export type SteelImplementationBindingState = (typeof STEEL_IMPLEMENTATION_BINDING_STATES)[number];

export const AU_STEEL_UNKNOWN_STANDARD_TOKEN = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const EOS_D1D_AU2_PHASE = "EOS-D1D-AU-2" as const;
export const EOS_D1D_AU3_PHASE = "EOS-D1D-AU-3" as const;
export const ELASTIC_BUCKLING_EQUALS_CODE_CAPACITY = false as const;
export const LLM_COMPRESSION_CAPACITY_AUTHORITY = false as const;
export const LLM_BENDING_CAPACITY_AUTHORITY = false as const;
export const SECTION_CLASSIFICATION_STATE = "VALIDATION_REQUIRED" as const;
export const SILENT_UNBRACED_LENGTH_ASSUMPTION = false as const;
export const SILENT_MOMENT_MODIFICATION_FACTOR = false as const;
export const ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY = false as const;
export const MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY = false as const;
export const AI_BENDING_ASSISTANCE_ADVISORY_ONLY = true as const;
export const OPTIMIZATION_BENDING_RECHECK_REQUIRED = true as const;
export const AU_BENDING_PILOT_EXPOSURE = false as const;
export const EOS_D1D_AU4_PHASE = "EOS-D1D-AU-4" as const;
export const LLM_SHEAR_CAPACITY_AUTHORITY = false as const;
export const SILENT_SHEAR_AREA_ASSUMPTION = false as const;
export const WEB_SLENDERNESS_LIMIT_GUESSED = false as const;
export const ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY = false as const;
export const TENSION_FIELD_ACTION_IMPLEMENTED = false as const;
export const AI_SHEAR_ASSISTANCE_ADVISORY_ONLY = true as const;
export const OPTIMIZATION_SHEAR_RECHECK_REQUIRED = true as const;
export const AU_SHEAR_PILOT_EXPOSURE = false as const;
export const BENDING_SHEAR_INTERACTION_IMPLEMENTED = false as const;
export const AXIAL_SHEAR_INTERACTION_IMPLEMENTED = false as const;
export const CONNECTION_SHEAR_DESIGN_IMPLEMENTED = false as const;
export const INTERACTION_REVIEW_REQUIRED = true as const;

export const STEEL_BUCKLING_AXES = ["MAJOR_AXIS", "MINOR_AXIS", "TORSIONAL", "FLEXURAL_TORSIONAL"] as const;
export type SteelBucklingAxis = (typeof STEEL_BUCKLING_AXES)[number];

export const STEEL_LIMIT_STATES = [
  "TENSION",
  "COMPRESSION",
  "BENDING_MAJOR",
  "BENDING_MINOR",
  "SHEAR",
  "SHEAR_MAJOR",
  "SHEAR_MINOR",
  "COMBINED_ACTION",
  "LOCAL_STABILITY",
  "MEMBER_STABILITY",
  "SERVICEABILITY",
  "OTHER",
] as const;
export type SteelLimitState = (typeof STEEL_LIMIT_STATES)[number];

export const STEEL_SOURCE_AUTHORITY_TYPES = [
  "LICENSED_STANDARD",
  "USER_SUPPLIED_STANDARD_REFERENCE",
  "VALIDATED_INTERNAL_ENGINEERING_RULE",
  "APPROVED_ENGINEERING_HANDBOOK",
  "CERTIFIED_EXTERNAL_TOOL",
  "OTHER_GOVERNED_SOURCE",
] as const;
export type SteelSourceAuthorityType = (typeof STEEL_SOURCE_AUTHORITY_TYPES)[number];

export const STEEL_METHOD_MATURITIES = [
  "FRAMEWORK_ONLY",
  "IMPLEMENTED",
  "BENCHMARKED",
  "HUMAN_VALIDATED",
  "PILOT",
  "CERTIFIED",
] as const;
export type SteelMethodMaturity = (typeof STEEL_METHOD_MATURITIES)[number];

export const STEEL_CHECK_VERDICTS = ["CHECK_SATISFIED", "CHECK_NOT_SATISFIED", "CHECK_UNDETERMINED"] as const;
export type SteelCheckVerdict = (typeof STEEL_CHECK_VERDICTS)[number];

export const STEEL_ADAPTER_IDS = ["AU_STEEL", "EU_STEEL", "US_STEEL"] as const;
export type SteelAdapterId = (typeof STEEL_ADAPTER_IDS)[number];

export type SteelGovernedProperty = {
  name: string;
  value: number | string | null;
  unit: string | null;
  provenanceRef: string;
  sourceAuthority: SteelSourceAuthorityType;
};

export type SteelMaterialDesignProperties = {
  materialRef: string;
  grade: string;
  yieldStrength: SteelGovernedProperty | null;
  ultimateStrength: SteelGovernedProperty | null;
  elasticModulus: SteelGovernedProperty | null;
  shearModulus: SteelGovernedProperty | null;
  poissonRatio: SteelGovernedProperty | null;
  density: SteelGovernedProperty | null;
  thicknessDependentMetadata: string | null;
  jurisdictionApplicability: string[];
};

export type SteelSectionDesignProperties = {
  sectionRef: string;
  sectionFamily: string;
  catalogSource: string;
  catalogVersion: string | null;
  jurisdictionApplicability: string[];
  area: SteelGovernedProperty | null;
  Iyy: SteelGovernedProperty | null;
  Izz: SteelGovernedProperty | null;
  sectionModulusYy: SteelGovernedProperty | null;
  sectionModulusZz: SteelGovernedProperty | null;
  plasticModulusYy: SteelGovernedProperty | null;
  plasticModulusZz: SteelGovernedProperty | null;
  torsionConstant: SteelGovernedProperty | null;
  warpingConstant: SteelGovernedProperty | null;
  radiusOfGyrationYy: SteelGovernedProperty | null;
  radiusOfGyrationZz: SteelGovernedProperty | null;
  netArea: SteelGovernedProperty | null;
  shearArea?: SteelGovernedProperty | null;
  webDepth?: SteelGovernedProperty | null;
  webThickness?: SteelGovernedProperty | null;
  geometricDimensions: Record<string, SteelGovernedProperty | null>;
};

export const STEEL_SHEAR_AXES = ["MAJOR_SHEAR", "MINOR_SHEAR"] as const;
export type SteelShearAxis = (typeof STEEL_SHEAR_AXES)[number];

export const STEEL_SHEAR_STIFFENER_STATES = ["UNSTIFFENED", "TRANSVERSE_STIFFENED", "OTHER_GOVERNED_CONFIGURATION"] as const;
export type SteelShearStiffenerState = (typeof STEEL_SHEAR_STIFFENER_STATES)[number];

export type SteelShearInputContext = {
  shearAxis: SteelShearAxis;
  stiffenerState: SteelShearStiffenerState | "unknown";
  shearBucklingCoefficient?: SteelGovernedProperty | null;
  stiffenerSpacing?: SteelGovernedProperty | null;
};

export type SteelWebSlendernessContext = {
  clearWebDepth: number | null;
  webThickness: number | null;
  slendernessRatio: number | null;
  stiffenerState: SteelShearStiffenerState | "unknown";
  limitState: "VALIDATION_REQUIRED";
  technicalRuleRef: null;
};

export type SteelStabilityContext = {
  stabilityContextId: string;
  memberLengthM: number | null;
  effectiveLengthM: number | null;
  unbracedLengthM: number | null;
  restraintDescription: string | null;
  bucklingAxis: "MAJOR" | "MINOR" | "BOTH" | null;
  momentGradientRef: string | null;
  torsionalRestraint: string | null;
  lateralRestraint: string | null;
  sourceEvidenceRef: string | null;
  derived: false;
  effectiveLengthMajorM?: number | null;
  effectiveLengthMinorM?: number | null;
  effectiveLengthProvenanceRef?: string | null;
  effectiveLengthFactorMajor?: SteelGovernedProperty | null;
  effectiveLengthFactorMinor?: SteelGovernedProperty | null;
  unbracedLengthProvenanceRef?: string | null;
  warpingRestraint?: string | null;
  momentDistributionDescription?: string | null;
  loadApplicationPosition?: string | null;
};

export type SteelDesignContext = {
  designContextId: string;
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  demandRefs: string[];
  standardContextRef: string;
  parameterSetRef: string | null;
  effectiveLengthContextRef: string | null;
  restraintContextRef: string | null;
  stabilityContextRef: string | null;
  fabricationContextRef: string | null;
  evidenceRefs: StructuralEvidenceBinding[];
  toolRef: string;
  methodRef: string;
  provenanceRef: EosGlobalProvenanceContract;
  validationState: string;
  reviewState: string;
};

export type SteelSourceAuthorityRecord = {
  authorityType: SteelSourceAuthorityType;
  identifier: string;
  clauseRef: string | null;
  edition: string | null;
  licensedMetadataOnly: true;
};

export type SteelEngineeringRule = {
  ruleId: string;
  methodId: string;
  jurisdiction: string;
  standardProfileRef: string;
  authorityType: EngineeringRuleAuthorityType;
  technicalBasisRef: string;
  calculationPurpose: string;
  applicability: string;
  requiredInputs: string[];
  outputType: string;
  units: string;
  implementationVersion: string;
  validationState: SteelMethodMaturity;
  benchmarkRefs: string[];
  humanReviewState: string;
  provenanceRef: string;
  clauseRef: string | null;
  intendedStandardProfile: "AS4100";
  standardConformanceState: SteelStandardConformanceState;
  bindingState: SteelImplementationBindingState;
};

export type SteelHumanRuleConfirmation = {
  ruleId: string;
  confirmedEquationId: string | null;
  confirmedParameter: { name: string; value: number | string; unit: string | null; provenanceRef: string } | null;
  confirmedApplicability: string | null;
  edition: string | null;
  amendment: string | null;
  referenceIdentifier: string | null;
  reviewer: string;
  confirmedAt: string;
};

export type SteelTensionCheckRecord = {
  methodId: string;
  engineeringRuleRef: string;
  capacityType: string;
  capacityValueN: number;
  units: "N";
  technicalBasisRef: string;
  standardProfileRef: string;
  validationState: SteelMethodMaturity;
  standardConformanceState: SteelStandardConformanceState;
};

export type SteelCapacityEngineInput = {
  adapterId: SteelAdapterId;
  designContext: SteelDesignContext;
  standardContext: StructuralStandardContext;
  material: SteelMaterialDesignProperties;
  section: SteelSectionDesignProperties;
  stability: SteelStabilityContext | null;
  demand: Pick<StructuralDemandResult, "resultId" | "memberId" | "shear" | "moment" | "axial" | "deflection" | "capacityPresent" | "standardContext" | "inputEvidenceRefs" | "combinationId">;
  limitState: SteelLimitState;
  requiredProperties: string[];
  shear?: SteelShearInputContext | null;
};

export type SteelCompressionCheckRecord = {
  methodId: string;
  engineeringRuleRef: string;
  capacityType: string;
  resultClass: "MECHANICS_REFERENCE";
  axis: SteelBucklingAxis | "SQUASH";
  capacityValueN: number;
  units: "N";
  technicalBasisRef: string;
  standardProfileRef: string;
  validationState: SteelMethodMaturity;
  standardConformanceState: SteelStandardConformanceState;
  effectiveLengthM: number | null;
};

export type AuCompressionDesignContext = {
  compressionContextId: string;
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  axialDemandRef: string;
  memberLengthM: number;
  effectiveLengthMajorM: number | null;
  effectiveLengthMinorM: number | null;
  bucklingAxes: SteelBucklingAxis[];
  unbracedLengthM: number | null;
  restraintContext: string;
  engineeringRuleRef: string;
  standardProfileRef: string;
  provenanceRef: EosGlobalProvenanceContract;
  validationState: string;
  effectiveLengthProvenanceRef: string;
  sectionClassificationState: typeof SECTION_CLASSIFICATION_STATE;
};

export type SteelBendingCheckRecord = {
  methodId: string;
  methodType: "ELASTIC_BENDING_REFERENCE" | "ELASTIC_LTB_REFERENCE";
  engineeringRuleRef: string;
  capacityType: string;
  resultClass: "MECHANICS_REFERENCE";
  axis: "MAJOR_AXIS" | "MINOR_AXIS";
  capacityValueNm: number;
  units: "N.m";
  technicalBasisRef: string;
  standardProfileRef: string;
  validationState: SteelMethodMaturity;
  standardConformanceState: SteelStandardConformanceState;
  unbracedLengthM: number | null;
};

export type SteelBendingDesignContext = {
  bendingContextId: string;
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  momentDemandRefs: string[];
  bendingAxis: "MAJOR_AXIS" | "MINOR_AXIS";
  memberLengthM: number | null;
  unbracedLengthM: number | null;
  unbracedLengthProvenanceRef: string | null;
  restraintContext: string | null;
  lateralRestraint: string | null;
  torsionalRestraint: string | null;
  warpingRestraint: string | null;
  momentDistributionContext: string | null;
  engineeringRuleRef: string;
  standardProfileRef: string;
  provenanceRef: EosGlobalProvenanceContract;
  validationState: string;
  sectionClassificationState: typeof SECTION_CLASSIFICATION_STATE;
};

export type SteelShearCheckRecord = {
  methodId: string;
  methodType: "ELASTIC_SHEAR_REFERENCE" | "ELASTIC_SHEAR_BUCKLING_REFERENCE";
  engineeringRuleRef: string;
  capacityType: string;
  resultClass: "MECHANICS_REFERENCE";
  axis: SteelShearAxis;
  capacityValueN: number;
  units: "N";
  technicalBasisRef: string;
  standardProfileRef: string;
  validationState: SteelMethodMaturity;
  standardConformanceState: SteelStandardConformanceState;
  stiffenerState: SteelShearStiffenerState;
  webSlendernessRatio: number | null;
};

export type SteelShearDesignContext = {
  shearContextId: string;
  memberRef: string;
  sectionRef: string;
  materialRef: string;
  shearDemandRefs: string[];
  shearAxis: SteelShearAxis;
  webDepth: number | null;
  webThickness: number | null;
  webSlenderness: SteelWebSlendernessContext;
  stiffenerState: SteelShearStiffenerState;
  stiffenerSpacing: number | null;
  engineeringRuleRef: string;
  standardProfileRef: string;
  technicalBasisRef: string;
  provenanceRef: EosGlobalProvenanceContract;
  validationState: string;
  interactionReviewRequired: true;
};

export type SteelCapacityEngineOutput = {
  adapterId: SteelAdapterId;
  maturity: SteelMethodMaturity;
  implemented: boolean;
  capacity: StructuralCapacityResult | null;
  reason: string;
  sourceAuthority: SteelSourceAuthorityRecord | null;
  tensionChecks?: SteelTensionCheckRecord[];
  compressionChecks?: SteelCompressionCheckRecord[];
  bendingChecks?: SteelBendingCheckRecord[];
  shearChecks?: SteelShearCheckRecord[];
  governingMethodId?: string | null;
  standardConformanceState?: SteelStandardConformanceState;
  implementationBindingState?: SteelImplementationBindingState;
  resultClass?: "MECHANICS_REFERENCE" | "DESIGN_CAPACITY";
  designCapacityState?: "VALIDATION_REQUIRED" | "IMPLEMENTED";
  sectionClassificationState?: typeof SECTION_CLASSIFICATION_STATE;
  interactionReviewRequired?: true;
};

export type SteelUtilizationComposition = {
  simpleUtilizationValid: boolean;
  demand: { value: number; unit: string };
  capacity: { value: number; unit: string } | null;
  ratio: number | null;
};

export type SteelDesignCheckOutcome = {
  designCheck: Pick<StructuralDesignCheck, "designCheckId" | "demandRef" | "capacityRef" | "checkType" | "approvalState" | "reviewState" | "validationState">;
  verdict: SteelCheckVerdict;
  utilization: SteelUtilizationComposition | null;
  interactionRequiresAdapter: boolean;
  humanReviewRequired: true;
  engineeringApproved: false;
};

export type SteelBenchmarkRecord = {
  benchmarkId: string;
  methodId: string;
  jurisdiction: string;
  standard: string;
  edition: string;
  annex: string | null;
  sourceAuthority: SteelSourceAuthorityType;
  input: Record<string, unknown>;
  expectedResult: { value: number; unit: string };
  tolerance: { relative: number; absolute: number };
  actualResult: { value: number; unit: string } | null;
  reviewer: string | null;
  validationDate: string | null;
  evidenceRef: string;
};

export type SteelOptimizationCandidate = {
  candidateSectionRef: string;
  proposedBy: "AI" | "OPTIMIZER" | "HUMAN";
  deterministicRecheckRequired: true;
  rechecked: boolean;
};

export type SteelDemandCapacitySeparation = StructuralDemandResult["capacityPresent"];
