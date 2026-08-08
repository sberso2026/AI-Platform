/**
 * Phase 12B certification gates A–AX (Digital Twin Core Domain).
 * 50 gates covering core identity, representation, thread, persistence, HTTP,
 * forbid locks, V1 integrity, and Phase 12C readiness.
 */
export const PHASE_12B_DIGITAL_TWIN_CORE_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "PI v1 integrity"],
  ["E", "II v1 integrity"],
  ["F", "Phase 12A baseline pinned"],
  ["G", "Ownership lock for core slice"],
  ["H", "Twin identity domain types"],
  ["I", "Twin representation references"],
  ["J", "State reference containers"],
  ["K", "Digital thread links"],
  ["L", "Typed relationships with KG reuse"],
  ["M", "Core engine create/update/lookup"],
  ["N", "Engine forbids runtime/telemetry/sim/viewer"],
  ["O", "Identity review workflow digital_twin.identity_review"],
  ["P", "No AI self-approval"],
  ["Q", "Domain events declared"],
  ["R", "Persistence port and memory adapter"],
  ["S", "Postgres repository adapter"],
  ["T", "Production memory repository forbidden"],
  ["U", "Repository factory"],
  ["V", "Public contracts 0.2.0-core-draft"],
  ["W", "Version 0.2.0-core flags"],
  ["X", "TwinIdentityReady true"],
  ["Y", "TwinRepresentationReady true"],
  ["Z", "TwinThreadReady true"],
  ["AA", "KnowledgeGraphReuse true"],
  ["AB", "HostedPersistenceReady true"],
  ["AC", "DIGITAL_TWIN_IMPLEMENTED core only"],
  ["AD", "Runtime/telemetry/sim/viewer forbid flags false"],
  ["AE", "Actuation and control disabled"],
  ["AF", "No duplicate asset/project ownership"],
  ["AG", "batch_75 migration exists"],
  ["AH", "Core tables with RLS"],
  ["AI", "Forbid CHECK constraints on core tables"],
  ["AJ", "No telemetry tables in batch_75"],
  ["AK", "Kernel digital_twins preserved"],
  ["AL", "Identity HTTP route"],
  ["AM", "Representation HTTP route"],
  ["AN", "Thread HTTP route"],
  ["AO", "No telemetry HTTP APIs"],
  ["AP", "Phase 12B architecture document"],
  ["AQ", "Unit tests green"],
  ["AR", "Certification package and runner"],
  ["AS", "Secret exposure"],
  ["AT", "Artifact identity"],
  ["AU", "Hosted core tables readable"],
  ["AV", "JWT/RLS tenant workspace isolation"],
  ["AW", "AI/PI/II/PC V1 surfaces unmodified"],
  ["AX", "Phase 12C readiness and release eligibility"],
] as const;

export type Phase12bGateId = (typeof PHASE_12B_DIGITAL_TWIN_CORE_GATES)[number][0];

export const PHASE_12B_GATE_COUNT = PHASE_12B_DIGITAL_TWIN_CORE_GATES.length;

export const PHASE_12B_DIGITAL_TWIN_VERSION = "0.2.0-core" as const;

export const PHASE_12A_CERTIFIED_COMMIT =
  "2c5ed03f7de12cde9bfb71a9d430f5e342291303" as const;
export const PHASE_12A_HOSTED_RUN = "31253197987" as const;
export const PHASE_12A_VERSION = "0.1.0-discovery" as const;

export const PHASE_12B_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12B_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12B_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12B_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12B_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12B_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12B_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12B_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12B_DIGITAL_TWIN_TABLES = [
  "digital_twin_identities",
  "digital_twin_representations",
  "digital_twin_typed_relationships",
  "digital_twin_thread_links",
  "digital_twin_state_references",
  "digital_twin_reviews",
  "digital_twin_outbox_events",
] as const;

export const PHASE_12B_FORBIDDEN_CAPABILITIES = [
  "DIGITAL_TWIN_RUNTIME_IMPLEMENTED",
  "LIVE_TELEMETRY_IMPLEMENTED",
  "SIMULATION_EXECUTION_IMPLEMENTED",
  "THREE_D_VIEWER_IMPLEMENTED",
  "PHYSICAL_ACTUATION_ENABLED",
  "AUTOMATIC_CONTROL_ENABLED",
  "PRODUCTION_DIGITAL_TWIN_READY",
] as const;

export const PHASE_12B_REQUIRED_READY_FLAGS = [
  "TWIN_IDENTITY_READY",
  "TWIN_REPRESENTATION_READY",
  "TWIN_THREAD_READY",
  "KNOWLEDGE_GRAPH_REUSE",
  "HOSTED_PERSISTENCE_READY",
  "DIGITAL_TWIN_IMPLEMENTED",
  "DIGITAL_TWIN_DISCOVERY_IMPLEMENTED",
  "DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED",
  "PHASE_12C_READY",
] as const;
