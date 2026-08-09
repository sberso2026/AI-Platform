/**
 * Phase 13A certification gates A–BE (Engineering Model & Solver Interoperability Discovery).
 * 57 gates: A–Z (26) + AA–BE (31).
 *
 * Discovery scale: docs, ownership/federation locks, draft contracts, DT V1 pin checks.
 * No production adapters, no IFC/ETABS/SPACE GASS runtime, no Phase 13B.
 */
export const PHASE_13A_ENGINEERING_INTEROP_DISCOVERY_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "Project Intelligence V1 intact"],
  ["E", "Inspection Intelligence V1 intact"],
  ["F", "Digital Twin V1 tag intact"],
  ["G", "Interop discovery package exists"],
  ["H", "Interop certification package exists"],
  ["I", "Version 0.1.0-interop-discovery"],
  ["J", "InteropDiscoveryReady is true"],
  ["K", "EngineeringFederationModelLocked is true"],
  ["L", "productionInteroperabilityRuntimeImplemented is false"],
  ["M", "automaticAnalysisModelCertificationEnabled is false"],
  ["N", "duplicateToolFrameworkDetected is false"],
  ["O", "sourceModelOwnershipPreserved is true"],
  ["P", "ModelFederationBoundaryLocked is true"],
  ["Q", "ResultFederationBoundaryLocked is true"],
  ["R", "SolverExecutionBoundaryLocked is true"],
  ["S", "Existing footprint inventory document"],
  ["T", "Boundary map document"],
  ["U", "Ownership matrix document"],
  ["V", "IFC strategy document"],
  ["W", "Solver strategy document"],
  ["X", "ETABS discovery document"],
  ["Y", "SPACE GASS discovery document"],
  ["Z", "Engineering federation model document"],
  ["AA", "Phase 13A discovery overview"],
  ["AB", "Draft public contracts document"],
  ["AC", "Digital Twin remains 1.0.0"],
  ["AD", "No phase13a under digital-twin package"],
  ["AE", "Terminology locks encoded"],
  ["AF", "Provider discovery matrix complete"],
  ["AG", "IFCFirstClassInteroperabilityReserved is true"],
  ["AH", "ETABSIntegrationDiscovered is true"],
  ["AI", "SpaceGassIntegrationDiscovered is true"],
  ["AJ", "No production interoperability adapters"],
  ["AK", "Reuses Digital Twin solver/tool framework"],
  ["AL", "CSI family product adapters remain separate"],
  ["AM", "Secret exposure"],
  ["AN", "Artifact identity / gate count"],
  ["AO", "phase13BReady is true"],
  ["AP", "releaseEligible is true"],
  ["AQ", "Digital Twin V1 commit pin"],
  ["AR", "Project-aware solver policy locked"],
  ["AS", "Asset/Project/Spatial ownership preserved"],
  ["AT", "duplicateAssetOwnershipDetected is false"],
  ["AU", "duplicateProjectOwnershipDetected is false"],
  ["AV", "duplicateSpatialOwnershipDetected is false"],
  ["AW", "Public contracts draft 0.1.0-draft"],
  ["AX", "Ownership lock assert passes"],
  ["AY", "Workflow exists"],
  ["AZ", "Discovery unit tests"],
  ["BA", "CalculiX existing certified path documented"],
  ["BB", "Reserved DT stubs inventoried without mutation"],
  ["BC", "External model ownership preserved"],
  ["BD", "External solver ownership preserved"],
  ["BE", "Phase 13B not started"],
] as const;

export type Phase13aGateId =
  (typeof PHASE_13A_ENGINEERING_INTEROP_DISCOVERY_GATES)[number][0];

export const PHASE_13A_GATE_COUNT =
  PHASE_13A_ENGINEERING_INTEROP_DISCOVERY_GATES.length;

export const PHASE_13A_INTEROP_VERSION = "0.1.0-interop-discovery" as const;
export const PHASE_13A_DIGITAL_TWIN_VERSION = "1.0.0" as const;
export const PHASE_13A_DIGITAL_TWIN_TAG = "digital-twin-v1.0.0" as const;
export const PHASE_13A_DIGITAL_TWIN_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;

export const PHASE_13A_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_13A_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_13A_ASSET_INTELLIGENCE_V1_TAG =
  "asset-intelligence-v1.0.0" as const;
export const PHASE_13A_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_13A_PROJECT_INTELLIGENCE_V1_TAG =
  "project-intelligence-v1.0.0" as const;
export const PHASE_13A_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_13A_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_13A_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
