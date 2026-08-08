/**
 * Phase 12A — Digital Twin Discovery. Single authoritative version source.
 *
 * Phase 12A ships discovery and architecture lock only: no runtime, no telemetry
 * ingestion, no simulation, no 3D viewer, and no production twin persistence.
 */
export const DIGITAL_TWIN_PRODUCT_NAME = "Digital Twin" as const;
export const DIGITAL_TWIN_MODULE_KEY = "digital_twin" as const;
export const DIGITAL_TWIN_VERSION = "0.1.0-discovery" as const;
export const DIGITAL_TWIN_STATUS = "discovery" as const;
export const DIGITAL_TWIN_PHASE = "12A" as const;

export const DIGITAL_TWIN_IMPLEMENTED = false as const;
export const DIGITAL_TWIN_DISCOVERY_IMPLEMENTED = true as const;
export const digitalTwinDiscoveryReady = true as const;
export const DIGITAL_TWIN_OWNERSHIP_LOCKED = true as const;
export const digitalTwinOwnershipLocked = true as const;

export const DIGITAL_TWIN_RUNTIME_IMPLEMENTED = false as const;
export const LIVE_TELEMETRY_IMPLEMENTED = false as const;
export const SIMULATION_EXECUTION_IMPLEMENTED = false as const;
export const THREE_D_VIEWER_IMPLEMENTED = false as const;
export const PHYSICAL_ACTUATION_ENABLED = false as const;
export const AUTOMATIC_CONTROL_ENABLED = false as const;
export const PRODUCTION_DIGITAL_TWIN_READY = false as const;
export const IMPLEMENTS_OWN_AI_STACK = false as const;

export const DUPLICATE_ASSET_OWNERSHIP_DETECTED = false as const;
export const DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false as const;

export const PHASE_12B_READY = true as const;

// ---------------------------------------------------------------------------
// Frozen V1 baselines (reference only — Phase 12A must not move tags)
// ---------------------------------------------------------------------------

export const PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PROJECT_CONTROLS_V1_INTACT = true as const;

export const ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const ASSET_INTELLIGENCE_V1_INTACT = true as const;

export const INSPECTION_INTELLIGENCE_V1_TAG = "inspection-intelligence-v1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const INSPECTION_INTELLIGENCE_V1_INTACT = true as const;

export const PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PROJECT_INTELLIGENCE_V1_INTACT = true as const;

export const PUBLIC_CONTRACT_VERSION = "0.1.0-draft" as const;

// ---------------------------------------------------------------------------
// Ownership declarations (locked in Phase 12A)
// ---------------------------------------------------------------------------

export const DIGITAL_TWIN_OWNERSHIP = "digital_twin" as const;
export const TWIN_STATE_OWNERSHIP = "digital_twin" as const;
export const SIMULATION_STATE_OWNERSHIP = "digital_twin" as const;
export const TWIN_REPRESENTATION_OWNERSHIP = "digital_twin" as const;
export const DIGITAL_THREAD_OWNERSHIP = "digital_twin" as const;

export const CANONICAL_ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain" as const;
export const CANONICAL_PROJECT_IDENTITY_OWNERSHIP = "engineering_os_shared_project_domain" as const;
export const CANONICAL_ASSET_LIFECYCLE_OWNERSHIP = "engineering_os_shared_domain" as const;
export const CANONICAL_ENGINEERING_RISK_OWNERSHIP = "engineering_core" as const;

export const ASSET_INTELLIGENCE_OWNERSHIP = "asset_intelligence" as const;
export const INSPECTION_INTELLIGENCE_OWNERSHIP = "inspection_intelligence" as const;
export const PROJECT_INTELLIGENCE_OWNERSHIP = "project_intelligence" as const;
export const PROJECT_CONTROLS_OWNERSHIP = "project_controls" as const;

export const SENSOR_STREAM_OWNERSHIP = "shm" as const;
export const TELEMETRY_INGESTION_PLANE_OWNERSHIP = "platform_kernel_telemetry" as const;
export const KNOWLEDGE_GRAPH_OWNERSHIP = "platform_kernel_knowledge_graph" as const;

export const DIGITAL_TWIN_MODULE_REGISTRY_STATUS = "coming_soon" as const;
export const DIGITAL_TWIN_MODULE_REGISTRY_VERSION = "0.0.0" as const;
export const DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED = false as const;
export const DIGITAL_TWIN_PRODUCT_UI_IMPLEMENTED = false as const;
export const DIGITAL_TWIN_ENTITLEMENTS_ARE_ENTITLEMENT_ONLY = true as const;

export const CANONICAL_LIFECYCLE_MUTATION_BY_TWIN_ALLOWED = false as const;
export const TWIN_MAY_NOT_CLAIM_ASSET_IDENTITY = true as const;
export const TWIN_MAY_NOT_CLAIM_PROJECT_IDENTITY = true as const;
export const AUTONOMOUS_TWIN_STATE_PUBLICATION_ALLOWED = false as const;

export function getDigitalTwinDiscoveryDeclaration() {
  return {
    productName: DIGITAL_TWIN_PRODUCT_NAME,
    moduleKey: DIGITAL_TWIN_MODULE_KEY,
    version: DIGITAL_TWIN_VERSION,
    status: DIGITAL_TWIN_STATUS,
    phase: DIGITAL_TWIN_PHASE,
    digitalTwinImplemented: DIGITAL_TWIN_IMPLEMENTED,
    digitalTwinDiscoveryImplemented: DIGITAL_TWIN_DISCOVERY_IMPLEMENTED,
    digitalTwinDiscoveryReady,
    digitalTwinOwnershipLocked,
    productionDigitalTwinReady: PRODUCTION_DIGITAL_TWIN_READY,
    digitalTwinRuntimeImplemented: DIGITAL_TWIN_RUNTIME_IMPLEMENTED,
    liveTelemetryImplemented: LIVE_TELEMETRY_IMPLEMENTED,
    simulationExecutionImplemented: SIMULATION_EXECUTION_IMPLEMENTED,
    threeDViewerImplemented: THREE_D_VIEWER_IMPLEMENTED,
    physicalActuationEnabled: PHYSICAL_ACTUATION_ENABLED,
    automaticControlEnabled: AUTOMATIC_CONTROL_ENABLED,
    implementsOwnAiStack: IMPLEMENTS_OWN_AI_STACK,
    publicContractVersion: PUBLIC_CONTRACT_VERSION,
    phase12BReady: PHASE_12B_READY,
    projectControlsV1Tag: PROJECT_CONTROLS_V1_TAG,
    projectControlsV1Commit: PROJECT_CONTROLS_V1_COMMIT,
    assetIntelligenceV1Tag: ASSET_INTELLIGENCE_V1_TAG,
    assetIntelligenceV1Commit: ASSET_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Tag: INSPECTION_INTELLIGENCE_V1_TAG,
    inspectionIntelligenceV1Commit: INSPECTION_INTELLIGENCE_V1_COMMIT,
    projectIntelligenceV1Tag: PROJECT_INTELLIGENCE_V1_TAG,
    projectIntelligenceV1Commit: PROJECT_INTELLIGENCE_V1_COMMIT,
    duplicateAssetOwnershipDetected: DUPLICATE_ASSET_OWNERSHIP_DETECTED,
    duplicateProjectOwnershipDetected: DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
    moduleRegistryStatus: DIGITAL_TWIN_MODULE_REGISTRY_STATUS,
  };
}
