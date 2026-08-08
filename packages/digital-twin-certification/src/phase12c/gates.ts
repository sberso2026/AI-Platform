/**
 * Phase 12C certification gates A–AY (Digital Twin State Domain).
 * 51 gates covering governed state, versioning, snapshots, timeline, persistence,
 * HTTP, forbid locks, V1 integrity, and Phase 12D readiness.
 */
export const PHASE_12C_DIGITAL_TWIN_STATE_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "PI v1 integrity"],
  ["E", "II v1 integrity"],
  ["F", "Phase 12A baseline pinned"],
  ["G", "Phase 12B baseline pinned"],
  ["H", "Ownership lock for state slice"],
  ["I", "Governed TwinState domain types"],
  ["J", "TwinStateVersion immutable history"],
  ["K", "RepresentationVersion append-only"],
  ["L", "TwinSnapshot versioned refs only"],
  ["M", "Append-only TwinTimelineEvent"],
  ["N", "State engine create/review/publish"],
  ["O", "State engine supersede/snapshot/history"],
  ["P", "Engine forbids runtime/telemetry/sim/viewer"],
  ["Q", "State review workflow digital_twin.state_review"],
  ["R", "Identity review retained"],
  ["S", "No AI self-approval"],
  ["T", "State domain events declared"],
  ["U", "Persistence port extended for state"],
  ["V", "Postgres repository state tables"],
  ["W", "Production memory repository forbidden"],
  ["X", "Repository factory"],
  ["Y", "Public contracts 0.3.0-state-draft"],
  ["Z", "Version 0.3.0-state flags"],
  ["AA", "TwinStateReady true"],
  ["AB", "TwinVersioningReady true"],
  ["AC", "RepresentationVersioningReady true"],
  ["AD", "TwinSnapshotReady true"],
  ["AE", "TwinTimelineReady true"],
  ["AF", "Core capabilities retained"],
  ["AG", "Runtime/telemetry/sim/viewer forbid flags false"],
  ["AH", "Actuation and control disabled"],
  ["AI", "No duplicate asset/project ownership"],
  ["AJ", "batch_76 migration exists"],
  ["AK", "State tables with RLS"],
  ["AL", "Forbid CHECK constraints on state tables"],
  ["AM", "No telemetry tables in batch_76"],
  ["AN", "batch_75 not modified"],
  ["AO", "State HTTP route"],
  ["AP", "Snapshot HTTP route"],
  ["AQ", "Representation history HTTP route"],
  ["AR", "No telemetry HTTP APIs"],
  ["AS", "Phase 12C architecture document"],
  ["AT", "Unit tests green"],
  ["AU", "Certification package and runner"],
  ["AV", "Secret exposure"],
  ["AW", "Artifact identity"],
  ["AX", "Hosted state tables readable"],
  ["AY", "Phase 12D readiness and release eligibility"],
] as const;

export type Phase12cGateId = (typeof PHASE_12C_DIGITAL_TWIN_STATE_GATES)[number][0];

export const PHASE_12C_GATE_COUNT = PHASE_12C_DIGITAL_TWIN_STATE_GATES.length;

export const PHASE_12C_DIGITAL_TWIN_VERSION = "0.3.0-state" as const;

export const PHASE_12A_CERTIFIED_COMMIT =
  "2c5ed03f7de12cde9bfb71a9d430f5e342291303" as const;
export const PHASE_12A_HOSTED_RUN = "31253197987" as const;
export const PHASE_12A_VERSION = "0.1.0-discovery" as const;

export const PHASE_12B_CERTIFIED_COMMIT =
  "5e1bb22486a9fdd6385fb980daf0150a330eca9b" as const;
export const PHASE_12B_HOSTED_RUN = "31255221472" as const;
export const PHASE_12B_VERSION = "0.2.0-core" as const;

export const PHASE_12C_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12C_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12C_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12C_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12C_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12C_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12C_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12C_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12C_DIGITAL_TWIN_TABLES = [
  "digital_twin_states",
  "digital_twin_state_versions",
  "digital_twin_representation_versions",
  "digital_twin_snapshots",
  "digital_twin_timeline_events",
  "digital_twin_state_reviews",
] as const;

export const PHASE_12C_FORBIDDEN_CAPABILITIES = [
  "DIGITAL_TWIN_RUNTIME_IMPLEMENTED",
  "LIVE_TELEMETRY_IMPLEMENTED",
  "SIMULATION_EXECUTION_IMPLEMENTED",
  "THREE_D_VIEWER_IMPLEMENTED",
  "PHYSICAL_ACTUATION_ENABLED",
  "AUTOMATIC_CONTROL_ENABLED",
  "PRODUCTION_DIGITAL_TWIN_READY",
] as const;

export const PHASE_12C_REQUIRED_READY_FLAGS = [
  "TWIN_IDENTITY_READY",
  "TWIN_REPRESENTATION_READY",
  "TWIN_THREAD_READY",
  "TWIN_STATE_READY",
  "TWIN_VERSIONING_READY",
  "REPRESENTATION_VERSIONING_READY",
  "TWIN_SNAPSHOT_READY",
  "TWIN_TIMELINE_READY",
  "KNOWLEDGE_GRAPH_REUSE",
  "HOSTED_PERSISTENCE_READY",
  "DIGITAL_TWIN_IMPLEMENTED",
  "DIGITAL_TWIN_DISCOVERY_IMPLEMENTED",
  "DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED",
  "PHASE_12C_READY",
  "PHASE_12D_READY",
] as const;
