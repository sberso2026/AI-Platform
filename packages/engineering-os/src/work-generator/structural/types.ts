import type { StructuralStandardContext } from "@rtb/types";

export const STRUCTURAL_WORK_KINDS = [
  "STRUCTURAL_DESIGN_BASIS",
  "STRUCTURAL_MEMBER_CHECK",
  "STRUCTURAL_CONNECTION_CHECK",
  "STRUCTURAL_FOUNDATION_INPUT_PACKAGE",
  "STRUCTURAL_MTO",
  "STRUCTURAL_DESIGN_REPORT",
] as const;
export type StructuralWorkKind = (typeof STRUCTURAL_WORK_KINDS)[number];

export const STRUCTURAL_INPUT_CLASSES = [
  "STANDARD",
  "LOAD",
  "LOAD_COMBINATION",
  "GEOMETRY",
  "MATERIAL",
  "BOUNDARY",
  "INTERFACE",
  "ENVIRONMENTAL",
  "GEOTECHNICAL",
  "ASSUMPTION",
  "REQUIREMENT",
  "CAPACITY",
] as const;
export type StructuralInputClass = (typeof STRUCTURAL_INPUT_CLASSES)[number];

export const STRUCTURAL_LOAD_CLASSES = [
  "DEAD",
  "LIVE",
  "EQUIPMENT",
  "OPERATING",
  "MAINTENANCE",
  "WIND",
  "SEISMIC",
  "THERMAL",
  "PIPE_REACTION",
  "IMPACT_DYNAMIC",
  "CONSTRUCTION",
  "LIFTING",
  "EARTH_SOIL",
  "HYDROSTATIC",
  "PROJECT_SPECIFIC",
] as const;
export type StructuralLoadClass = (typeof STRUCTURAL_LOAD_CLASSES)[number];

export const GOVERNED_INPUT_STATUSES = ["GOVERNED", "MISSING", "STALE", "UNACCEPTED"] as const;
export type GovernedInputStatus = (typeof GOVERNED_INPUT_STATUSES)[number];

export const STRUCTURAL_MISSING_CODES = [
  "DESIGN_BASIS_INCOMPLETE",
  "GEOMETRY_REQUIRED",
  "MATERIAL_GRADE_REQUIRED",
  "WIND_LOAD_REQUIRED",
  "SEISMIC_INPUT_REQUIRED",
  "GEOTECHNICAL_INPUT_REQUIRED",
  "CONNECTION_GEOMETRY_REQUIRED",
  "CONNECTION_INPUT_INCOMPLETE",
  "CAPACITY_METHOD_NOT_CERTIFIED",
  "GOVERNING_STANDARD_REQUIRED",
  "LOAD_COMBINATION_REQUIRED",
  "LOAD_REQUIRED",
  "COST_NOT_CALCULATED",
  "CARBON_NOT_CALCULATED",
] as const;
export type StructuralMissingCode = (typeof STRUCTURAL_MISSING_CODES)[number];

export const CALCULATION_RESULT_STATUSES = [
  "CALCULATED",
  "CALCULATION_INCOMPLETE",
  "INPUT_REQUIRED",
  "METHOD_NOT_CERTIFIED",
  "STALE",
  "REVIEW_REQUIRED",
  "VERIFIED_BY_ENGINEER",
] as const;
export type CalculationResultStatus = (typeof CALCULATION_RESULT_STATUSES)[number];

export const CALCULATION_REVIEW_ACTIONS = [
  "ACCEPT_FOR_USE",
  "REJECT",
  "REQUEST_REVISION",
  "NEEDS_INFORMATION",
] as const;
export type CalculationReviewAction = (typeof CALCULATION_REVIEW_ACTIONS)[number];

export const FORBIDDEN_CALCULATION_VERDICTS = [
  "DESIGN_APPROVED",
  "CODE_COMPLIANT",
  "SAFE",
  "APPROVED",
] as const;

export type ProvenanceRef = {
  sourceType: string;
  sourceId: string;
  title: string;
  revision: string | null;
  status: GovernedInputStatus;
  classification: "SYNTHETIC_DEMONSTRATION_DATA" | "ENGINEER_PROVIDED_FIXTURE" | "GOVERNED_PROJECT_RECORD";
};

export type GovernedStructuralInput = {
  key: string;
  inputClass: StructuralInputClass;
  loadClass?: StructuralLoadClass | null;
  label: string;
  value: number | string | null;
  unit: string | null;
  direction?: string | null;
  loadCase?: string | null;
  required: boolean;
  status: GovernedInputStatus;
  missingCode?: StructuralMissingCode | null;
  provenance: ProvenanceRef;
};

export type StructuralDesignStandard = {
  identifier: string;
  editionYear: string;
  source: string;
  projectApplicability: "CONFIGURED" | "NOT_CONFIGURED";
  status: GovernedInputStatus;
  context: StructuralStandardContext;
  engineState: "NOT_IMPLEMENTED" | "IMPLEMENTED";
  certificationState: "NOT_CERTIFIED" | "UNVALIDATED" | "IMPLEMENTED" | "BENCHMARKED" | "HUMAN_VALIDATED" | "PILOT" | "CERTIFIED";
};

export type StructuralDesignBasis = {
  workKind: StructuralWorkKind;
  projectId: string;
  systemId: string | null;
  assetId: string | null;
  lifecycleStage: string | null;
  structuralSystem: string | null;
  dataClassification: "SYNTHETIC_DEMONSTRATION_DATA";
  standards: StructuralDesignStandard[];
  inputs: GovernedStructuralInput[];
  missing: StructuralMissingCode[];
  complete: boolean;
  incompleteReason: string | null;
};

export type CalculationManifest = {
  id: string;
  workPlanId: string;
  projectId: string;
  systemId: string | null;
  assetId: string | null;
  discipline: "STRUCTURAL";
  workKind: StructuralWorkKind;
  calculationType: string;
  designStandard: StructuralDesignStandard | null;
  inputRefs: ProvenanceRef[];
  inputFingerprint: string;
  assumptions: string[];
  loadCases: string[];
  loadCombinations: string[];
  engineId: string;
  engineVersion: string;
  expectedOutputs: string[];
  createdAt: string;
  createdBy: string | null;
  verificationStatus: "UNVERIFIED" | "VERIFIED_BY_ENGINEER" | "REJECTED" | "NEEDS_INFORMATION";
};

export type MemberCheckQuantities = {
  demandShearKN: number | null;
  demandMomentKNm: number | null;
  capacityMomentKNm: number | null;
  utilization: number | null;
  serviceability: "NOT_EVALUATED";
  demandStatus: "DEMAND_AVAILABLE" | "DEMAND_UNAVAILABLE";
  capacityStatus: "CAPACITY_SUPPLIED" | "CAPACITY_METHOD_NOT_CERTIFIED";
};

export type StructuralCalculationResult = {
  id: string;
  manifestId: string;
  calculationType: string;
  toolEngine: string;
  toolVersion: string;
  status: CalculationResultStatus;
  reviewStatus: CalculationManifest["verificationStatus"];
  inputFingerprint: string;
  results: MemberCheckQuantities & {
    connection: "NOT_CALCULATED" | "CONNECTION_INPUT_INCOMPLETE";
    foundation: "INPUT_PACKAGE_ONLY" | "GEOTECHNICAL_INPUT_REQUIRED";
    units: { force: "kN"; moment: "kN.m"; length: "m"; mass: "kg" };
  };
  warnings: string[];
  limitations: string[];
  executedAt: string;
  executedBy: string;
  reviewAction: CalculationReviewAction | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  engineeringApproved: false;
  dataClassification: "SYNTHETIC_DEMONSTRATION_DATA";
};

export type PersistedStructuralCalculation = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPlanId: string;
  workKind: StructuralWorkKind;
  revision: string;
  status: CalculationResultStatus;
  reviewStatus: CalculationManifest["verificationStatus"];
  inputFingerprint: string;
  engineId: string;
  engineVersion: string;
  manifest: CalculationManifest;
  result: StructuralCalculationResult | null;
  designBasis: StructuralDesignBasis;
  missingCodes: StructuralMissingCode[];
  supersedesId: string | null;
  createdAt: string;
  createdBy: string | null;
  executedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  thread: Array<{
    relationship: string;
    fromType: string;
    fromId: string;
    toType: string;
    toId: string;
  }>;
};
