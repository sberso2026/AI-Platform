/**
 * Phase 12F certification gates A–BH (Digital Twin Representation Mapping).
 * 60 gates covering representation domain, spatial reconciliation, persistence, HTTP, UI, and Phase 12G readiness.
 */
export const PHASE_12F_DIGITAL_TWIN_REPRESENTATION_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "PI v1 integrity"],
  ["E", "II v1 integrity"],
  ["F", "Phase 12A baseline pinned"],
  ["G", "Phase 12B baseline pinned"],
  ["H", "Phase 12C baseline pinned"],
  ["I", "Phase 12D baseline pinned"],
  ["J", "Phase 12E baseline pinned"],
  ["K", "Ownership lock for representation slice"],
  ["L", "TwinRepresentationSourceReference contract"],
  ["M", "TwinRepresentationElementReference contract"],
  ["N", "TwinRepresentationMapping lifecycle"],
  ["O", "Mapping confidence and methods"],
  ["P", "TwinSpatialReference CRS required"],
  ["Q", "Representation navigation service"],
  ["R", "Change impact classification"],
  ["S", "Representation mapping review workflow"],
  ["T", "Representation domain events"],
  ["U", "Persistence port extended"],
  ["V", "Postgres repository representation tables"],
  ["W", "Production memory repository forbidden"],
  ["X", "Repository factory"],
  ["Y", "Public contracts 0.6.0-representation-draft"],
  ["Z", "Version 0.6.0-representation flags"],
  ["AA", "TwinRepresentationMappingReady true"],
  ["AB", "TwinRepresentationNavigationReady true"],
  ["AC", "representationNavigationImplemented true"],
  ["AD", "Telemetry binding capabilities retained from 12E"],
  ["AE", "digitalTwinRuntimeImplemented bounded true"],
  ["AF", "threeDViewerImplemented false"],
  ["AG", "automaticRepresentationMappingApprovalEnabled false"],
  ["AH", "highFrequency/historian/sensorRegistry/shm false"],
  ["AI", "SHM/sim/viewer/actuation false"],
  ["AJ", "No duplicate asset/project/time-series/model ownership"],
  ["AK", "engineeringTimeSeriesOwnership asset_intelligence"],
  ["AL", "spatialCanonicalOwnership reconciled shared domain"],
  ["AM", "sourceModelOwnership external_or_existing"],
  ["AN", "batch_79 migration exists"],
  ["AO", "Representation tables with RLS"],
  ["AP", "Forbid CHECK constraints on representation tables"],
  ["AQ", "No model binary / geometry payload tables"],
  ["AR", "batch_75/76/77/78 not modified"],
  ["AS", "Representation sources HTTP route"],
  ["AT", "Representation versions HTTP route"],
  ["AU", "Representation elements HTTP route"],
  ["AV", "Representation mappings HTTP route"],
  ["AW", "Representation navigation HTTP route"],
  ["AX", "Representation change impacts HTTP route"],
  ["AY", "Rejects model binary payloads"],
  ["AZ", "Representation mapping UI"],
  ["BA", "Phase 12F architecture documents"],
  ["BB", "Unit tests green"],
  ["BC", "Certification package and runner"],
  ["BD", "Browser E2E CERTIFY_BROWSER=1"],
  ["BE", "Artifact identity"],
  ["BF", "Hosted representation tables readable"],
  ["BG", "Phase 12G readiness"],
  ["BH", "a11y basic surfaces / release eligibility"],
] as const;

export type Phase12fGateId = (typeof PHASE_12F_DIGITAL_TWIN_REPRESENTATION_GATES)[number][0];

export const PHASE_12F_GATE_COUNT = PHASE_12F_DIGITAL_TWIN_REPRESENTATION_GATES.length;

export const PHASE_12F_DIGITAL_TWIN_VERSION = "0.6.0-representation" as const;

export const PHASE_12A_CERTIFIED_COMMIT =
  "2c5ed03f7de12cde9bfb71a9d430f5e342291303" as const;
export const PHASE_12A_HOSTED_RUN = "31253197987" as const;
export const PHASE_12A_VERSION = "0.1.0-discovery" as const;

export const PHASE_12B_CERTIFIED_COMMIT =
  "5e1bb22486a9fdd6385fb980daf0150a330eca9b" as const;
export const PHASE_12B_HOSTED_RUN = "31255221472" as const;
export const PHASE_12B_VERSION = "0.2.0-core" as const;

export const PHASE_12C_CERTIFIED_COMMIT =
  "07b5ccc843395bd02633163dc654668da9f17658" as const;
export const PHASE_12C_HOSTED_RUN = "31256556800" as const;
export const PHASE_12C_VERSION = "0.3.0-state" as const;

export const PHASE_12D_CERTIFIED_COMMIT =
  "3e387f4b76cbd9c80b274585c7b78821482f496d" as const;
export const PHASE_12D_HOSTED_RUN = "31257741414" as const;
export const PHASE_12D_VERSION = "0.4.0-ingestion" as const;

export const PHASE_12E_CERTIFIED_COMMIT =
  "b871e8c3eb9e1293604610bacdd410ecb4da5684" as const;
export const PHASE_12E_HOSTED_RUN = "31260082507" as const;
export const PHASE_12E_VERSION = "0.5.0-telemetry-binding" as const;

export const PHASE_12F_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12F_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12F_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12F_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12F_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12F_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12F_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12F_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12F_DIGITAL_TWIN_TABLES = [
  "digital_twin_representation_sources",
  "digital_twin_representation_elements",
  "digital_twin_representation_mappings",
  "digital_twin_representation_mapping_reviews",
  "digital_twin_representation_change_impacts",
  "digital_twin_spatial_references",
] as const;

export const PHASE_12F_FORBIDDEN_CAPABILITIES = [
  "AUTOMATIC_REPRESENTATION_MAPPING_APPROVAL_ENABLED",
  "HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED",
  "TELEMETRY_HISTORIAN_IMPLEMENTED",
  "SENSOR_REGISTRY_IMPLEMENTED",
  "SHM_SIGNAL_PROCESSING_IMPLEMENTED",
  "SHM_RUNTIME_IMPLEMENTED",
  "SIMULATION_EXECUTION_IMPLEMENTED",
  "THREE_D_VIEWER_IMPLEMENTED",
  "PHYSICAL_ACTUATION_ENABLED",
  "AUTOMATIC_CONTROL_ENABLED",
  "PRODUCTION_DIGITAL_TWIN_READY",
  "DUPLICATE_TIME_SERIES_PLANE_DETECTED",
  "DUPLICATE_MODEL_OWNERSHIP_DETECTED",
] as const;

export const PHASE_12F_REQUIRED_READY_FLAGS = [
  "TWIN_IDENTITY_READY",
  "TWIN_REPRESENTATION_READY",
  "TWIN_THREAD_READY",
  "TWIN_STATE_READY",
  "TWIN_VERSIONING_READY",
  "REPRESENTATION_VERSIONING_READY",
  "TWIN_SNAPSHOT_READY",
  "TWIN_TIMELINE_READY",
  "TWIN_STATE_INGESTION_READY",
  "TWIN_SOURCE_ADAPTER_READY",
  "TWIN_STATE_RECONCILIATION_READY",
  "TWIN_TELEMETRY_BINDING_READY",
  "TWIN_TELEMETRY_PROJECTION_READY",
  "ENGINEERING_TIME_SERIES_REUSE_READY",
  "TWIN_REPRESENTATION_MAPPING_READY",
  "TWIN_REPRESENTATION_NAVIGATION_READY",
  "REPRESENTATION_NAVIGATION_IMPLEMENTED",
  "KNOWLEDGE_GRAPH_REUSE",
  "HOSTED_PERSISTENCE_READY",
  "DIGITAL_TWIN_IMPLEMENTED",
  "DIGITAL_TWIN_DISCOVERY_IMPLEMENTED",
  "DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED",
  "DIGITAL_TWIN_RUNTIME_IMPLEMENTED",
  "PHASE_12C_READY",
  "PHASE_12D_READY",
  "PHASE_12E_READY",
  "PHASE_12F_READY",
  "PHASE_12G_READY",
] as const;
