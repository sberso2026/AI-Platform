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

export const STEEL_LIMIT_STATES = [
  "TENSION",
  "COMPRESSION",
  "BENDING_MAJOR",
  "BENDING_MINOR",
  "SHEAR",
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
  geometricDimensions: Record<string, SteelGovernedProperty | null>;
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

export type SteelCapacityEngineInput = {
  adapterId: SteelAdapterId;
  designContext: SteelDesignContext;
  standardContext: StructuralStandardContext;
  material: SteelMaterialDesignProperties;
  section: SteelSectionDesignProperties;
  stability: SteelStabilityContext | null;
  demand: Pick<StructuralDemandResult, "resultId" | "memberId" | "shear" | "moment" | "axial" | "deflection" | "capacityPresent" | "standardContext" | "inputEvidenceRefs">;
  limitState: SteelLimitState;
  requiredProperties: string[];
};

export type SteelCapacityEngineOutput = {
  adapterId: SteelAdapterId;
  maturity: SteelMethodMaturity;
  implemented: false;
  capacity: StructuralCapacityResult | null;
  reason: string;
  sourceAuthority: SteelSourceAuthorityRecord | null;
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
