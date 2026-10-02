/**
 * EOS-A15A-V5 — Structural Engineering Work Generator overlay.
 *
 * Composition over Work Generator, Tool Orchestration, External Tool Governance,
 * Discipline Intelligence, MTO V2/V3, Deliverable Composition V4, Pre-Issue,
 * Digital Thread, Change Impact, Requirements, Assumptions, Systems, Interfaces.
 * Not a Structural / Calculation / Analysis / MTO / Cost Intelligence domain.
 * Not a solver framework.
 */

export const A15A_V5_GENERATOR_VERSION = "EOS-A15A-V5";

export const A15A_V5_FEATURE_FREEZE = {
  newTopLevelDomain: false,
  newStructuralIntelligenceDomain: false,
  newCalculationIntelligenceDomain: false,
  newAnalysisIntelligenceDomain: false,
  newMtoIntelligenceDomain: false,
  newCostIntelligenceDomain: false,
  newSolverFramework: false,
  newGraphStore: false,
  newEventBus: false,
  newDms: false,
  newConnectorFramework: false,
  scannerV2: false,
  spaceGassApiAvailable: false,
  spaceGassRealSolverExecution: "NOT_CERTIFIED",
  spaceGassProductionUsePermitted: false,
  guiAutomation: false,
  llmAsNumericalSolver: false,
  universalDesignCodeHardcoded: false,
  designApprovedBecauseCalculated: false,
} as const;

export const STRUCTURAL_AI_BOUNDARY = {
  mayAssembleGovernedInputs: true,
  mayLocateEvidence: true,
  mayPrepareCalculationManifest: true,
  mayExplainResults: true,
  mayDraftNarratives: true,
  mayIdentifyMissingInformation: true,
  mayIdentifyInconsistencies: true,
  mayInventLoads: false,
  mayInventGeometry: false,
  mayInventMaterialProperties: false,
  mayInventBoundaryConditions: false,
  mayInventMemberSizes: false,
  mayInventLoadCombinations: false,
  mayInventDesignCapacities: false,
  mayInventCodeFactors: false,
  mayInventSoilParameters: false,
  mayInventConnectionCapacities: false,
  mayInventReinforcement: false,
  mayAcceptEngineering: false,
  mayVerifyOwnCalculation: false,
} as const;

export const STRUCTURAL_SOLVER_BOUNDARY = {
  engineId: "EOS_STRUCTURAL_DETERMINISTIC_V1",
  engineVersion: "1.0.0",
  method: "SYNTHETIC_SS_BEAM_UDL_STATICS",
  methodClassification: "SYNTHETIC_DEMONSTRATION_DATA",
  notAs4100Capacity: true,
  notSpaceGassExecution: true,
  notFrameAnalysisCertification: true,
  notFeaCertification: true,
  notDynamicAnalysisCertification: true,
  capacityFromMemoryCodeEquations: false,
} as const;

export const HOSTED_MALWARE_SCANNER = "DEFERRED_EXTERNAL_DEPENDENCY" as const;
export const RETURNED_ARTIFACT_ROUND_TRIP = "DEFERRED_DEPENDENT_GATE" as const;

export const STRUCTURAL_CALLER_SUPPLIED_KEYS = [
  "tenantId",
  "workspaceId",
  "aal",
  "approved",
  "authoritative",
  "verifiedBy",
  "createdBy",
  "inputFingerprint",
  "engineeringApproved",
  "designApproved",
] as const;
