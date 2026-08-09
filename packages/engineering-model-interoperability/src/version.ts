/**
 * Phase 13A — Engineering Model & Solver Interoperability Discovery.
 *
 * Architecture lock + provider inventory ONLY. No production ETABS / SPACE GASS /
 * SAP2000 / Revit / Navisworks / IFC ingestion runtime, and no additional solver
 * execution beyond Digital Twin V1 CalculiX linear-static.
 *
 * Digital Twin remains 1.0.0 (tag digital-twin-v1.0.0 @ a94425ed…).
 * PHASE_13B_READY is a flag only — do not start Phase 13B.
 */

export const ENGINEERING_MODEL_INTEROPERABILITY_NAME =
  "Engineering Model & Solver Interoperability" as const;
export const ENGINEERING_MODEL_INTEROPERABILITY_KEY =
  "engineering_model_interoperability" as const;
export const ENGINEERING_MODEL_INTEROPERABILITY_VERSION =
  "0.1.0-interop-discovery" as const;
export const ENGINEERING_MODEL_INTEROPERABILITY_STATUS =
  "interop_discovery" as const;
export const ENGINEERING_MODEL_INTEROPERABILITY_PHASE = "13A" as const;

/** Discovery readiness. */
export const INTEROP_DISCOVERY_READY = true as const;
export const InteropDiscoveryReady = true as const;
export const interopDiscoveryReady = true as const;
export const EngineeringInteropDiscoveryReady = true as const;

export const ENGINEERING_FEDERATION_MODEL_LOCKED = true as const;
export const EngineeringFederationModelLocked = true as const;
export const engineeringFederationModelLocked = true as const;

export const MODEL_FEDERATION_BOUNDARY_LOCKED = true as const;
export const ModelFederationBoundaryLocked = true as const;
export const modelFederationBoundaryLocked = true as const;

export const RESULT_FEDERATION_BOUNDARY_LOCKED = true as const;
export const ResultFederationBoundaryLocked = true as const;
export const resultFederationBoundaryLocked = true as const;

export const SOLVER_EXECUTION_BOUNDARY_LOCKED = true as const;
export const SolverExecutionBoundaryLocked = true as const;
export const solverExecutionBoundaryLocked = true as const;

export const MODEL_AUTHORING_BOUNDARY_LOCKED = true as const;
export const ModelAuthoringBoundaryLocked = true as const;

export const ANALYSIS_MODEL_GENERATION_BOUNDARY_LOCKED = true as const;
export const AnalysisModelGenerationBoundaryLocked = true as const;

export const IFC_FIRST_CLASS_INTEROPERABILITY_RESERVED = true as const;
export const IFCFirstClassInteroperabilityReserved = true as const;
export const ifcFirstClassInteroperabilityReserved = true as const;

export const ETABS_INTEGRATION_DISCOVERED = true as const;
export const ETABSIntegrationDiscovered = true as const;
export const etabsIntegrationDiscovered = true as const;

export const SPACE_GASS_INTEGRATION_DISCOVERED = true as const;
export const SpaceGassIntegrationDiscovered = true as const;
export const spaceGassIntegrationDiscovered = true as const;

/** ALWAYS false in 13A — discovery only. */
export const PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED = false as const;
export const productionInteroperabilityRuntimeImplemented = false as const;
export const ProductionInteroperabilityRuntimeImplemented = false as const;

export const AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED = false as const;
export const automaticAnalysisModelCertificationEnabled = false as const;

/** Do NOT create a second solver/tool framework. */
export const DUPLICATE_TOOL_FRAMEWORK_DETECTED = false as const;
export const duplicateToolFrameworkDetected = false as const;

export const SOURCE_MODEL_OWNERSHIP_PRESERVED = true as const;
export const sourceModelOwnershipPreserved = true as const;

export const DUPLICATE_ASSET_OWNERSHIP_DETECTED = false as const;
export const duplicateAssetOwnershipDetected = false as const;
export const DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false as const;
export const duplicateProjectOwnershipDetected = false as const;
export const DUPLICATE_SPATIAL_OWNERSHIP_DETECTED = false as const;
export const duplicateSpatialOwnershipDetected = false as const;

/** Model accessible ≠ solver executable (and related honesty locks). */
export const MODEL_ACCESSIBLE_IMPLIES_SOLVER_EXECUTABLE = false as const;
export const MODEL_FEDERATED_IMPLIES_RTB_OWNERSHIP = false as const;
export const EXISTING_RESULTS_IMPLIES_RTB_GENERATED = false as const;
export const SOLVER_SUPPORTED_IMPLIES_SOLVER_QUALIFIED = false as const;
export const SOLVER_QUALIFIED_IMPLIES_PROJECT_APPROVED = false as const;
export const PROJECT_APPROVED_IMPLIES_EXECUTION_QUALIFIED = false as const;
export const EXECUTION_QUALIFIED_IMPLIES_ENGINEERING_APPROVED = false as const;

export const PROJECT_AWARE_SOLVER_POLICY_LOCKED = true as const;
export const projectAwareSolverPolicyLocked = true as const;
export const ABSTAIN_RATHER_THAN_SILENT_SUBSTITUTE = true as const;
export const abstainRatherThanSilentSubstitute = true as const;

export const CSI_INTEROP_CORE_ASSESSMENT_REQUIRED = true as const;
export const CSI_PRODUCT_ADAPTERS_REMAIN_SEPARATE = true as const;
export const csiProductAdaptersRemainSeparate = true as const;

export const REUSES_DIGITAL_TWIN_SOLVER_ADAPTER_FRAMEWORK = true as const;
export const reusesDigitalTwinSolverAdapterFramework = true as const;

/** Flag only — do not start Phase 13B. */
export const PHASE_13B_READY = true as const;
export const phase13BReady = true as const;

export const PUBLIC_CONTRACT_VERSION = "0.1.0-draft" as const;

// ---------------------------------------------------------------------------
// Ownership declarations (locked — preserve existing domains)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSET_OWNERSHIP = "engineering_os_shared_domain" as const;
export const CANONICAL_PROJECT_OWNERSHIP =
  "engineering_os_shared_project_domain" as const;
export const CANONICAL_SPATIAL_OWNERSHIP =
  "engineering_os_shared_spatial_domain" as const;
export const DIGITAL_TWIN_OWNERSHIP = "digital_twin" as const;
export const ENGINEERING_TOOL_FRAMEWORK_OWNERSHIP =
  "platform_intelligence" as const;
export const EXTERNAL_MODEL_OWNERSHIP =
  "source_client_engineering_application" as const;
export const EXTERNAL_SOLVER_OWNERSHIP = "external_engineering_tool" as const;

export const MODEL_FEDERATION_OWNERSHIP =
  "engineering_model_interoperability" as const;
export const RESULT_FEDERATION_OWNERSHIP =
  "engineering_model_interoperability" as const;
export const SOLVER_EXECUTION_ORCHESTRATION_OWNERSHIP = "digital_twin" as const;

// ---------------------------------------------------------------------------
// Digital Twin V1 pin (must not mutate / must not move tag)
// ---------------------------------------------------------------------------

export const DIGITAL_TWIN_V1_VERSION = "1.0.0" as const;
export const DIGITAL_TWIN_V1_TAG = "digital-twin-v1.0.0" as const;
export const DIGITAL_TWIN_V1_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const DIGITAL_TWIN_V1_INTACT = true as const;
export const DigitalTwinV1Intact = true as const;

export const PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;

/** Existing DT reserved external solver stubs (document only — do not modify DT). */
export const DIGITAL_TWIN_RESERVED_SOLVER_STUBS = [
  "ansys",
  "abaqus",
  "opensees",
  "openfoam",
  "sap2000",
  "etabs",
  "staad",
  "spacegass",
  "nastran",
  "comsol",
  "other_external",
] as const;

export const DIGITAL_TWIN_CERTIFIED_SOLVER = "calculix" as const;
export const DIGITAL_TWIN_CERTIFIED_SOLVER_CAPABILITY =
  "linear_elastic_static" as const;

export function getEngineeringInteropDiscoveryDeclaration() {
  return {
    name: ENGINEERING_MODEL_INTEROPERABILITY_NAME,
    key: ENGINEERING_MODEL_INTEROPERABILITY_KEY,
    version: ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
    status: ENGINEERING_MODEL_INTEROPERABILITY_STATUS,
    phase: ENGINEERING_MODEL_INTEROPERABILITY_PHASE,
    InteropDiscoveryReady,
    EngineeringFederationModelLocked,
    ModelFederationBoundaryLocked,
    ResultFederationBoundaryLocked,
    SolverExecutionBoundaryLocked,
    IFCFirstClassInteroperabilityReserved,
    ETABSIntegrationDiscovered,
    SpaceGassIntegrationDiscovered,
    productionInteroperabilityRuntimeImplemented,
    automaticAnalysisModelCertificationEnabled,
    duplicateToolFrameworkDetected,
    sourceModelOwnershipPreserved,
    duplicateAssetOwnershipDetected,
    duplicateProjectOwnershipDetected,
    duplicateSpatialOwnershipDetected,
    DigitalTwinV1Intact,
    digitalTwinV1Version: DIGITAL_TWIN_V1_VERSION,
    digitalTwinV1Commit: DIGITAL_TWIN_V1_COMMIT,
    publicContractVersion: PUBLIC_CONTRACT_VERSION,
    phase13BReady,
    canonicalAssetOwnership: CANONICAL_ASSET_OWNERSHIP,
    canonicalProjectOwnership: CANONICAL_PROJECT_OWNERSHIP,
    canonicalSpatialOwnership: CANONICAL_SPATIAL_OWNERSHIP,
    digitalTwinOwnership: DIGITAL_TWIN_OWNERSHIP,
    engineeringToolFrameworkOwnership: ENGINEERING_TOOL_FRAMEWORK_OWNERSHIP,
    externalModelOwnership: EXTERNAL_MODEL_OWNERSHIP,
    externalSolverOwnership: EXTERNAL_SOLVER_OWNERSHIP,
    hierarchy:
      "RTB AI Platform → Engineering OS → Engineering Model Interoperability (federation discovery) → reuse Digital Twin EngineeringSolverAdapter / ETF four-layer qualification; external models/solvers remain source-owned" as const,
  };
}
