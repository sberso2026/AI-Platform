/**
 * EOS-D1C — Structural loads, combinations, and bounded deterministic demand.
 * Demand only. Not capacity, FEA, or design-code resistance.
 */

import type { EosGlobalProvenanceContract } from "./global-governance";
import type { StructuralAnalysisResult, StructuralEvidenceBinding } from "./structural-domain";
import type { StructuralStandardContext } from "./structural-standard-binding";

export const EOS_D1C_PHASE = "EOS-D1C" as const;

export const GENERIC_ENGINE_HARDCODES_CODE_FACTORS = false as const;
export const D1C_CAPACITY_ENGINE_PRESENT = false as const;
export const D1C_DESIGN_PASS_FAIL_PRESENT = false as const;
export const GENERAL_FEA_IMPLEMENTED = false as const;
export const GEOTECHNICAL_CAPACITY_CALCULATION_PRESENT = false as const;
export const LLM_DEMAND_RESULT_AUTHORITY = false as const;
export const AI_DEMAND_ASSISTANCE_ADVISORY_ONLY = true as const;
export const HUMAN_REVIEW_REQUIRED_FOR_GOVERNED_DEMAND = true as const;
export const EU_ONLY_DEMAND_ENGINE = false as const;
export const AU_ONLY_DEMAND_ENGINE = false as const;
export const TORSION_DEMAND_SCOPE = "NOT_IMPLEMENTED" as const;
export const D1C_TORSIONAL_ACTION_ID = "MEMBER_TORSION" as const;
export const D1C_TORSIONAL_ACTION_TYPE = "EXPLICIT_GOVERNED_ACTION" as const;
export const D1C_TORSIONAL_ACTION_UNIT = "N.m" as const;
export const D1C_TORSIONAL_ACTION_AXIS = "MEMBER_X" as const;
export const D1C_TORSIONAL_ACTION_SIGN_CONVENTION = "RIGHT_HAND_ABOUT_MEMBER_X_INCREASING" as const;
export const TORSIONAL_ACTION_TRANSPORT_IMPLEMENTED = true as const;
export const GENERAL_TORSIONAL_ANALYSIS_IMPLEMENTED = false as const;
export const EU_SPECIFIC_TORSION_ACTION_CREATED = false as const;

export const STRUCTURAL_ACTION_CATEGORIES = [
  "DEAD",
  "SUPERIMPOSED_DEAD",
  "LIVE",
  "EQUIPMENT",
  "PIPING",
  "WIND",
  "SEISMIC",
  "THERMAL",
  "PRESSURE",
  "IMPOSED_DEFORMATION",
  "CONSTRUCTION",
  "ACCIDENTAL",
  "OTHER",
] as const;
export type StructuralActionCategory = (typeof STRUCTURAL_ACTION_CATEGORIES)[number];

export const STRUCTURAL_LOAD_APPLICATION_KINDS = [
  "POINT_FORCE",
  "POINT_MOMENT",
  "UNIFORM_DISTRIBUTED_LOAD",
  "LINEARLY_VARYING_DISTRIBUTED_LOAD",
  "NODAL_FORCE",
  "NODAL_MOMENT",
] as const;
export type StructuralLoadApplicationKind = (typeof STRUCTURAL_LOAD_APPLICATION_KINDS)[number];

export const STRUCTURAL_LOAD_COORDINATE_SYSTEMS = ["GLOBAL", "LOCAL_MEMBER", "LOCAL_FRAME"] as const;
export type StructuralLoadCoordinateSystem = (typeof STRUCTURAL_LOAD_COORDINATE_SYSTEMS)[number];

export const STRUCTURAL_BOUNDARY_CONDITIONS = ["SIMPLE_SIMPLE", "FIXED_FREE"] as const;
export type StructuralBoundaryCondition = (typeof STRUCTURAL_BOUNDARY_CONDITIONS)[number];

export const STRUCTURAL_DEMAND_METHOD_IDS = [
  "SS_BEAM_UDL",
  "SS_BEAM_POINT_LOAD",
  "SS_BEAM_APPLIED_MOMENT",
  "SS_BEAM_LINEAR_VARYING",
  "CANTILEVER_UDL",
  "CANTILEVER_POINT_LOAD",
  "CANTILEVER_APPLIED_MOMENT",
  "CANTILEVER_LINEAR_VARYING",
  "LINEAR_SUPERPOSITION",
  "AXIAL_DIRECT",
  "SYNTHETIC_SS_BEAM_UDL_STATICS",
] as const;
export type StructuralDemandMethodId = (typeof STRUCTURAL_DEMAND_METHOD_IDS)[number];

export const STRUCTURAL_DEMAND_METHOD_MATURITIES = [
  "IMPLEMENTED",
  "BENCHMARKED",
  "HUMAN_VALIDATED",
  "PILOT",
  "CERTIFIED",
] as const;
export type StructuralDemandMethodMaturity = (typeof STRUCTURAL_DEMAND_METHOD_MATURITIES)[number];

export const CANONICAL_INTERNAL_UNITS = {
  force: "N",
  moment: "N.m",
  length: "m",
  distributedForce: "N/m",
  stress: "Pa",
  secondMoment: "m4",
  deflection: "m",
} as const;

export const ENGINEERING_NUMERICAL_TOLERANCE = {
  relative: 1e-8,
  forceN: 1e-4,
  momentNm: 1e-4,
  lengthM: 1e-10,
} as const;

export const STRUCTURAL_SIGN_CONVENTION = {
  axis: "member x from start (x=0) to end (x=L)",
  loadPositive: "transverse load positive in the gravity/downward sense",
  reactionPositive: "transverse reaction positive upward",
  shearPositive: "left-face upward (dV/dx = -w for downward w)",
  momentPositive: "sagging (compression in the top fiber)",
  deflectionPositive: "downward",
  appliedMomentPositive: "clockwise when x increases to the right",
  axialPositive: "tension",
  torsionPositive: "right-hand rule about member x, thumb toward increasing x",
} as const;

export type StructuralQuantity = {
  value: number;
  unit: string;
};

export type StructuralLoadApplication = {
  applicationId: string;
  loadCaseId: string;
  actionCategory: StructuralActionCategory;
  kind: StructuralLoadApplicationKind;
  coordinateSystem: StructuralLoadCoordinateSystem;
  memberLocalResolved: boolean;
  targetMemberId: string;
  targetNodeId: string | null;
  positionM: number | null;
  startM: number | null;
  endM: number | null;
  magnitude: StructuralQuantity;
  endMagnitude: StructuralQuantity | null;
  direction: "TRANSVERSE" | "AXIAL";
  evidenceRef: StructuralEvidenceBinding | null;
  externalSource: StructuralExternalLoadSource | null;
};

export type StructuralExternalLoadSource = {
  sourceDiscipline: string;
  sourceObjectId: string;
  revision: string;
  evidenceId: string;
  status: string;
};

export type StructuralBoundCombinationFactor = {
  loadCaseId: string;
  factor: number;
  provenanceRef: string;
  source: "HUMAN_ENTERED" | "JURISDICTION_PACK";
};

export type StructuralLoadFactorProviderRequest = {
  packId: "AU" | "EU" | "US" | "NEUTRAL";
  standardCode: string | null;
  edition: string | null;
  nationalAnnexRef: string | null;
  combinationCategory: string;
};

export type StructuralLoadFactorProviderResult = {
  packId: StructuralLoadFactorProviderRequest["packId"];
  implemented: boolean;
  maturity: "FRAMEWORK_ONLY" | "IMPLEMENTED";
  factors: StructuralBoundCombinationFactor[];
  reason: string;
};

export type StructuralDemandMethodRecord = {
  methodId: StructuralDemandMethodId;
  boundary: StructuralBoundaryCondition | "ANY";
  applicationKind: StructuralLoadApplicationKind | "SUPERPOSITION" | "AXIAL";
  maturity: StructuralDemandMethodMaturity;
  deflectionSupported: boolean;
  independentBenchmark: boolean;
};

export type StructuralEnvelopeValue = {
  value: number;
  unit: string;
  locationM: number;
  signed: number;
};

export type StructuralDemandResult = {
  resultId: string;
  memberId: string;
  boundaryCondition: StructuralBoundaryCondition;
  spanM: number;
  combinationId: string | null;
  loadCaseIds: string[];
  methods: StructuralDemandMethodId[];
  reactions: {
    startFyN: number;
    endFyN: number;
    startMzNm: number;
    endMzNm: number;
    unitForce: "N";
    unitMoment: "N.m";
  };
  shear: StructuralEnvelopeValue;
  moment: StructuralEnvelopeValue;
  axial: { valueN: number; unit: "N"; method: "AXIAL_DIRECT" } | { status: "NO_AXIAL_COMPONENTS"; valueN: 0 };
  deflection: StructuralEnvelopeValue | { status: "NOT_IMPLEMENTED"; reason: string };
  torsion:
    | { status: "NOT_IMPLEMENTED" }
    | {
        status: "TRANSPORTED";
        actionId: typeof D1C_TORSIONAL_ACTION_ID;
        actionType: typeof D1C_TORSIONAL_ACTION_TYPE;
        signedValueNm: number;
        unit: typeof D1C_TORSIONAL_ACTION_UNIT;
        axis: typeof D1C_TORSIONAL_ACTION_AXIS;
        signConvention: typeof D1C_TORSIONAL_ACTION_SIGN_CONVENTION;
        combinationId: string;
        provenance: {
          evidenceId: string;
          sourceDiscipline: string;
          sourceObjectId: string;
          revision: string;
        };
        fingerprint: string;
      };
  stiffness: { EPa: number; I_m4: number } | null;
  equilibriumResidual: { forceN: number; momentNm: number };
  outputClass: "DETERMINISTIC_DEMAND";
  capacityPresent: false;
  designPassFailPresent: false;
  humanReviewRequired: true;
  approvalState: "not_approved";
  llmOriginated: false;
  standardContext: StructuralStandardContext;
  toolRef: string;
  toolVersion: string;
  provenanceRef: EosGlobalProvenanceContract;
  inputEvidenceRefs: StructuralEvidenceBinding[];
  foundationReactionHandoff: {
    startFyN: number;
    endFyN: number;
    startMzNm: number;
    endMzNm: number;
    geotechnicalCapacityCalculated: false;
  };
};

export type StructuralDemandHandoff = {
  analysisResult: Pick<StructuralAnalysisResult, "resultType" | "memberActions" | "reactions" | "deflections" | "outputClass" | "solverSuccessImpliesApproval">;
  demandResultId: string;
  futureCapacityResultRef: null;
  futureUtilizationResultRef: null;
};
