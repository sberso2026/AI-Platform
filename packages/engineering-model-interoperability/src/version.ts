/**
 * Phase 13B — Engineering Model Interoperability Core Runtime + IFC/openBIM Federation.
 *
 * First production-capable federation runtime for IFC/openBIM only.
 * No production ETABS / SPACE GASS / SAP2000 / Revit / Navisworks / Tekla adapters.
 * No solver execution, model mutation/authoring, or analysis-model generation.
 * No full BIM viewer. Prefer Platform Files string refs for binaries (no PG blobs).
 *
 * Digital Twin remains 1.0.0 (tag digital-twin-v1.0.0 @ a94425ed…).
 * PHASE_13C_READY is a flag only — do not start Phase 13C.
 */

export const ENGINEERING_MODEL_INTEROPERABILITY_NAME =
  "Engineering Model & Solver Interoperability" as const;
export const ENGINEERING_MODEL_INTEROPERABILITY_KEY =
  "engineering_model_interoperability" as const;
export const ENGINEERING_MODEL_INTEROPERABILITY_VERSION =
  "0.2.0-ifc-federation" as const;
export const ENGINEERING_MODEL_INTEROPERABILITY_STATUS =
  "ifc_federation" as const;
export const ENGINEERING_MODEL_INTEROPERABILITY_PHASE = "13B" as const;

/** Retained from 13A discovery. */
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

// ---------------------------------------------------------------------------
// Phase 13B runtime readiness
// ---------------------------------------------------------------------------

export const ENGINEERING_MODEL_INTEROPERABILITY_RUNTIME_READY = true as const;
export const EngineeringModelInteroperabilityRuntimeReady = true as const;
export const engineeringModelInteroperabilityRuntimeReady = true as const;

export const IFC_FEDERATION_READY = true as const;
export const IFCFederationReady = true as const;
export const ifcFederationReady = true as const;

export const PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED = true as const;
export const productionInteroperabilityRuntimeImplemented = true as const;
export const ProductionInteroperabilityRuntimeImplemented = true as const;

export const IFC_PRODUCTION_ADAPTER_IMPLEMENTED = true as const;
export const ifcProductionAdapterImplemented = true as const;

export const MODEL_FEDERATION_PRODUCT_TABLES_INTRODUCED = true as const;
export const modelFederationProductTablesIntroduced = true as const;

export const MAPPING_REVIEW_READY = true as const;
export const mappingReviewReady = true as const;

export const CHANGE_IMPACT_READY = true as const;
export const changeImpactReady = true as const;

export const RESULT_REFERENCE_FEDERATION_READY = true as const;
export const resultReferenceFederationReady = true as const;

export const PARSER_GOVERNANCE_READY = true as const;
export const parserGovernanceReady = true as const;

export const LARGE_MODEL_SAFETY_READY = true as const;
export const largeModelSafetyReady = true as const;

/** ALWAYS false — honesty locks. */
export const AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED = false as const;
export const automaticAnalysisModelCertificationEnabled = false as const;

export const SOLVER_EXECUTION_IMPLEMENTED = false as const;
export const solverExecutionImplemented = false as const;

export const ADDITIONAL_EXTERNAL_SOLVER_EXECUTION_IMPLEMENTED = false as const;
export const additionalExternalSolverExecutionImplemented = false as const;

export const MODEL_MUTATION_IMPLEMENTED = false as const;
export const modelMutationImplemented = false as const;

export const ANALYSIS_MODEL_GENERATION_IMPLEMENTED = false as const;
export const analysisModelGenerationImplemented = false as const;

export const FULL_BIM_VIEWER_IMPLEMENTED = false as const;
export const fullBimViewerImplemented = false as const;

export const NATIVE_ETABS_ADAPTER_IMPLEMENTED = false as const;
export const nativeEtabsAdapterImplemented = false as const;
export const NATIVE_SPACEGASS_ADAPTER_IMPLEMENTED = false as const;
export const nativeSpacegassAdapterImplemented = false as const;
export const NATIVE_SAP2000_ADAPTER_IMPLEMENTED = false as const;
export const nativeSap2000AdapterImplemented = false as const;
export const NATIVE_REVIT_ADAPTER_IMPLEMENTED = false as const;
export const nativeRevitAdapterImplemented = false as const;
export const NATIVE_NAVISWORKS_ADAPTER_IMPLEMENTED = false as const;
export const nativeNavisworksAdapterImplemented = false as const;
export const NATIVE_TEKLA_ADAPTER_IMPLEMENTED = false as const;
export const nativeTeklaAdapterImplemented = false as const;

export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false as const;
export const productionMemoryRepositoryAllowed = false as const;

export const MODEL_BINARY_STORAGE_IN_POSTGRES = false as const;
export const modelBinaryStorageInPostgres = false as const;

export const DUPLICATE_TOOL_FRAMEWORK_DETECTED = false as const;
export const duplicateToolFrameworkDetected = false as const;

export const SOURCE_MODEL_OWNERSHIP_PRESERVED = true as const;
export const sourceModelOwnershipPreserved = true as const;

export const DIGITAL_TWIN_MAY_OWN_SOURCE_MODEL = false as const;
export const digitalTwinMayOwnSourceModel = false as const;

export const DUPLICATE_MODEL_OWNERSHIP_DETECTED = false as const;
export const duplicateModelOwnershipDetected = false as const;

export const DUPLICATE_ASSET_OWNERSHIP_DETECTED = false as const;
export const duplicateAssetOwnershipDetected = false as const;
export const DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false as const;
export const duplicateProjectOwnershipDetected = false as const;
export const DUPLICATE_SPATIAL_OWNERSHIP_DETECTED = false as const;
export const duplicateSpatialOwnershipDetected = false as const;
export const DUPLICATE_TWIN_OWNERSHIP_DETECTED = false as const;
export const duplicateTwinOwnershipDetected = false as const;

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

/** Flag only — do not start Phase 13C. */
export const PHASE_13B_READY = true as const;
export const phase13BReady = true as const;
export const PHASE_13C_READY = true as const;
export const phase13CReady = true as const;

export const PUBLIC_CONTRACT_VERSION = "0.2.0-ifc-federation" as const;

// ---------------------------------------------------------------------------
// Ownership declarations
// ---------------------------------------------------------------------------

export const MODEL_INTEROPERABILITY_OWNERSHIP =
  "engineering_model_interoperability" as const;
export const modelInteroperabilityOwnership =
  MODEL_INTEROPERABILITY_OWNERSHIP;

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
export const externalModelOwnership = EXTERNAL_MODEL_OWNERSHIP;
export const EXTERNAL_SOLVER_OWNERSHIP = "external_engineering_tool" as const;

export const MODEL_FEDERATION_OWNERSHIP =
  "engineering_model_interoperability" as const;
export const RESULT_FEDERATION_OWNERSHIP =
  "engineering_model_interoperability" as const;
export const SOLVER_EXECUTION_ORCHESTRATION_OWNERSHIP = "digital_twin" as const;

export const MAPPING_REVIEW_SLUG =
  "engineering_model_interoperability.mapping_review" as const;

// ---------------------------------------------------------------------------
// Pins
// ---------------------------------------------------------------------------

export const DIGITAL_TWIN_V1_VERSION = "1.0.0" as const;
export const DIGITAL_TWIN_V1_TAG = "digital-twin-v1.0.0" as const;
export const DIGITAL_TWIN_V1_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const DIGITAL_TWIN_V1_INTACT = true as const;
export const DigitalTwinV1Intact = true as const;

export const PHASE_13A_VERSION = "0.1.0-interop-discovery" as const;
export const PHASE_13A_CERTIFIED_COMMIT =
  "5d238f24a3c61b95011c6c2a0ab2f1bf81540267" as const;
export const PHASE_13A_HOSTED_RUN = "31288157345" as const;

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

export const IFC_PARSER_IMPLEMENTATION = "bounded_step_text_extractor" as const;
export const IFC_PARSER_VERSION = "0.2.0-ifc-federation-step-1" as const;
export const IFC_SUPPORTED_SCHEMAS = ["IFC2X3", "IFC4", "IFC4X3"] as const;

export function getEngineeringInteropIfcFederationDeclaration() {
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
    EngineeringModelInteroperabilityRuntimeReady,
    IFCFederationReady,
    productionInteroperabilityRuntimeImplemented,
    ifcProductionAdapterImplemented,
    automaticAnalysisModelCertificationEnabled,
    solverExecutionImplemented,
    additionalExternalSolverExecutionImplemented,
    modelMutationImplemented,
    analysisModelGenerationImplemented,
    fullBimViewerImplemented,
    productionMemoryRepositoryAllowed,
    modelBinaryStorageInPostgres,
    duplicateToolFrameworkDetected,
    sourceModelOwnershipPreserved,
    digitalTwinMayOwnSourceModel,
    duplicateModelOwnershipDetected,
    duplicateAssetOwnershipDetected,
    duplicateProjectOwnershipDetected,
    duplicateSpatialOwnershipDetected,
    DigitalTwinV1Intact,
    digitalTwinV1Version: DIGITAL_TWIN_V1_VERSION,
    digitalTwinV1Commit: DIGITAL_TWIN_V1_COMMIT,
    publicContractVersion: PUBLIC_CONTRACT_VERSION,
    phase13AVersion: PHASE_13A_VERSION,
    phase13ACertifiedCommit: PHASE_13A_CERTIFIED_COMMIT,
    phase13AHostedRun: PHASE_13A_HOSTED_RUN,
    phase13BReady,
    phase13CReady,
    modelInteroperabilityOwnership: MODEL_INTEROPERABILITY_OWNERSHIP,
    canonicalAssetOwnership: CANONICAL_ASSET_OWNERSHIP,
    canonicalProjectOwnership: CANONICAL_PROJECT_OWNERSHIP,
    canonicalSpatialOwnership: CANONICAL_SPATIAL_OWNERSHIP,
    digitalTwinOwnership: DIGITAL_TWIN_OWNERSHIP,
    engineeringToolFrameworkOwnership: ENGINEERING_TOOL_FRAMEWORK_OWNERSHIP,
    externalModelOwnership: EXTERNAL_MODEL_OWNERSHIP,
    externalSolverOwnership: EXTERNAL_SOLVER_OWNERSHIP,
    mappingReviewSlug: MAPPING_REVIEW_SLUG,
    ifcParserImplementation: IFC_PARSER_IMPLEMENTATION,
    ifcParserVersion: IFC_PARSER_VERSION,
    ifcSupportedSchemas: IFC_SUPPORTED_SCHEMAS,
    hierarchy:
      "RTB AI Platform → Engineering OS → Engineering Model Interoperability (IFC federation runtime) → consume Digital Twin V1 public contracts; external models remain source-owned" as const,
  };
}

/** @deprecated Prefer getEngineeringInteropIfcFederationDeclaration (13B). */
export function getEngineeringInteropDiscoveryDeclaration() {
  return getEngineeringInteropIfcFederationDeclaration();
}
