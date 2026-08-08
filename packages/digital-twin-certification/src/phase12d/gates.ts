/**
 * Phase 12D certification gates A–AY (Digital Twin Governed State Ingestion).
 * 51 gates covering ingestion domain, persistence, HTTP, forbid locks, V1 integrity, and Phase 12E readiness.
 */
export const PHASE_12D_DIGITAL_TWIN_INGESTION_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "PI v1 integrity"],
  ["E", "II v1 integrity"],
  ["F", "Phase 12A baseline pinned"],
  ["G", "Phase 12B baseline pinned"],
  ["H", "Phase 12C baseline pinned"],
  ["I", "Ownership lock for ingestion slice"],
  ["J", "Source adapter metadata contract"],
  ["K", "TwinStateSchemaRegistry"],
  ["L", "TwinSourceFreshnessPolicy"],
  ["M", "Unit governance"],
  ["N", "ObservedTwinStateCandidate"],
  ["O", "TwinStateReconciliationEngine"],
  ["P", "TwinSourceAuthorityPolicy"],
  ["Q", "State ingestion engine"],
  ["R", "Engine forbids telemetry/SHM/sim/auto-publish"],
  ["S", "State review workflow extended"],
  ["T", "Ingestion domain events declared"],
  ["U", "Persistence port extended for ingestion"],
  ["V", "Postgres repository ingestion tables"],
  ["W", "Production memory repository forbidden"],
  ["X", "Repository factory"],
  ["Y", "Public contracts 0.4.0-ingestion-draft"],
  ["Z", "Version 0.4.0-ingestion flags"],
  ["AA", "TwinStateIngestionReady true"],
  ["AB", "TwinSourceAdapterReady true"],
  ["AC", "TwinStateReconciliationReady true"],
  ["AD", "State capabilities retained from 12C"],
  ["AE", "digitalTwinRuntimeImplemented bounded true"],
  ["AF", "automaticObservedStatePublicationEnabled false"],
  ["AG", "Live/highFrequency telemetry false"],
  ["AH", "SHM/sim/viewer/actuation false"],
  ["AI", "No duplicate asset/project ownership"],
  ["AJ", "batch_77 migration exists"],
  ["AK", "Ingestion tables with RLS"],
  ["AL", "Forbid CHECK constraints on ingestion tables"],
  ["AM", "No telemetry tables in batch_77"],
  ["AN", "batch_75/76 not modified"],
  ["AO", "Adapters HTTP route"],
  ["AP", "Ingestion HTTP route"],
  ["AQ", "Ingestion health HTTP route"],
  ["AR", "No telemetry HTTP APIs"],
  ["AS", "Phase 12D architecture document"],
  ["AT", "Source authority model document"],
  ["AU", "Unit tests green"],
  ["AV", "Certification package and runner"],
  ["AW", "Artifact identity"],
  ["AX", "Hosted ingestion tables readable"],
  ["AY", "Phase 12E readiness and release eligibility"],
] as const;

export type Phase12dGateId = (typeof PHASE_12D_DIGITAL_TWIN_INGESTION_GATES)[number][0];

export const PHASE_12D_GATE_COUNT = PHASE_12D_DIGITAL_TWIN_INGESTION_GATES.length;

export const PHASE_12D_DIGITAL_TWIN_VERSION = "0.4.0-ingestion" as const;

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

export const PHASE_12D_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12D_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12D_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12D_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12D_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12D_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12D_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12D_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12D_DIGITAL_TWIN_TABLES = [
  "digital_twin_source_adapters",
  "digital_twin_state_schemas",
  "digital_twin_state_candidates",
  "digital_twin_state_reconciliation",
  "digital_twin_source_authority_policies",
  "digital_twin_ingestion_idempotency",
] as const;

export const PHASE_12D_FORBIDDEN_CAPABILITIES = [
  "AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED",
  "LIVE_TELEMETRY_IMPLEMENTED",
  "HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED",
  "SHM_RUNTIME_IMPLEMENTED",
  "SIMULATION_EXECUTION_IMPLEMENTED",
  "THREE_D_VIEWER_IMPLEMENTED",
  "PHYSICAL_ACTUATION_ENABLED",
  "AUTOMATIC_CONTROL_ENABLED",
  "PRODUCTION_DIGITAL_TWIN_READY",
  "DUPLICATE_TIME_SERIES_PLANE_DETECTED",
] as const;

export const PHASE_12D_REQUIRED_READY_FLAGS = [
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
  "KNOWLEDGE_GRAPH_REUSE",
  "HOSTED_PERSISTENCE_READY",
  "DIGITAL_TWIN_IMPLEMENTED",
  "DIGITAL_TWIN_DISCOVERY_IMPLEMENTED",
  "DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED",
  "DIGITAL_TWIN_RUNTIME_IMPLEMENTED",
  "PHASE_12C_READY",
  "PHASE_12D_READY",
  "PHASE_12E_READY",
] as const;
