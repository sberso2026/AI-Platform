/**
 * Phase 12E certification gates A–BI (Digital Twin Telemetry Binding).
 * 61 gates covering telemetry domain, AI time series reuse, persistence, HTTP, UI, and Phase 12F readiness.
 */
export const PHASE_12E_DIGITAL_TWIN_TELEMETRY_BINDING_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "PI v1 integrity"],
  ["E", "II v1 integrity"],
  ["F", "Phase 12A baseline pinned"],
  ["G", "Phase 12B baseline pinned"],
  ["H", "Phase 12C baseline pinned"],
  ["I", "Phase 12D baseline pinned"],
  ["J", "Ownership lock for telemetry binding slice"],
  ["K", "TelemetrySourceReference contract"],
  ["L", "TelemetryChannelReference contract"],
  ["M", "TwinTelemetryBinding lifecycle"],
  ["N", "EngineeringTimeSeriesReadPort read-only"],
  ["O", "TwinTelemetryProjectionEngine"],
  ["P", "Projection methods bounded"],
  ["Q", "Aggregation policy"],
  ["R", "Observation quality"],
  ["S", "Gap handling interpolation not_implemented"],
  ["T", "Source health"],
  ["U", "Live state semantics"],
  ["V", "Telemetry binding review workflow"],
  ["W", "Telemetry domain events"],
  ["X", "Persistence port extended"],
  ["Y", "Postgres repository binding tables"],
  ["Z", "Production memory repository forbidden"],
  ["AA", "Repository factory"],
  ["AB", "Public contracts 0.5.0-telemetry-binding-draft"],
  ["AC", "Version 0.5.0-telemetry-binding flags"],
  ["AD", "TwinTelemetryBindingReady true"],
  ["AE", "TwinTelemetryProjectionReady true"],
  ["AF", "EngineeringTimeSeriesReuseReady true"],
  ["AG", "Ingestion capabilities retained from 12D"],
  ["AH", "digitalTwinRuntimeImplemented bounded true"],
  ["AI", "liveTelemetryImplemented bounded true"],
  ["AJ", "automaticTelemetryStatePublicationEnabled false"],
  ["AK", "highFrequency/historian/sensorRegistry/shm false"],
  ["AL", "SHM/sim/viewer/actuation false"],
  ["AM", "No duplicate asset/project/time-series ownership"],
  ["AN", "engineeringTimeSeriesOwnership asset_intelligence"],
  ["AO", "batch_78 migration exists"],
  ["AP", "Binding tables with RLS"],
  ["AQ", "Forbid CHECK constraints on binding tables"],
  ["AR", "No raw telemetry value/history tables"],
  ["AS", "batch_75/76/77 not modified"],
  ["AT", "Telemetry sources HTTP route"],
  ["AU", "Telemetry channels HTTP route"],
  ["AV", "Telemetry bindings HTTP route"],
  ["AW", "Telemetry projection HTTP route"],
  ["AX", "Telemetry health HTTP route"],
  ["AY", "Rejects raw telemetry payloads"],
  ["AZ", "Telemetry binding UI"],
  ["BA", "Phase 12E architecture documents"],
  ["BB", "Unit tests green"],
  ["BC", "Certification package and runner"],
  ["BD", "Browser E2E CERTIFY_BROWSER=1"],
  ["BE", "Artifact identity"],
  ["BF", "Hosted binding tables readable"],
  ["BG", "Phase 12F readiness"],
  ["BH", "a11y basic surfaces"],
  ["BI", "Release eligibility"],
] as const;

export type Phase12eGateId = (typeof PHASE_12E_DIGITAL_TWIN_TELEMETRY_BINDING_GATES)[number][0];

export const PHASE_12E_GATE_COUNT = PHASE_12E_DIGITAL_TWIN_TELEMETRY_BINDING_GATES.length;

export const PHASE_12E_DIGITAL_TWIN_VERSION = "0.5.0-telemetry-binding" as const;

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

export const PHASE_12E_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12E_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12E_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12E_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12E_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12E_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12E_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12E_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12E_DIGITAL_TWIN_TABLES = [
  "digital_twin_telemetry_sources",
  "digital_twin_telemetry_channels",
  "digital_twin_telemetry_bindings",
  "digital_twin_telemetry_aggregation_policies",
  "digital_twin_telemetry_projection_records",
  "digital_twin_telemetry_binding_reviews",
] as const;

export const PHASE_12E_FORBIDDEN_CAPABILITIES = [
  "AUTOMATIC_TELEMETRY_STATE_PUBLICATION_ENABLED",
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
] as const;

export const PHASE_12E_REQUIRED_READY_FLAGS = [
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
] as const;
