/**
 * Phase 12F — Digital Twin ownership lock.
 *
 * Machine-readable twin of ownership matrix including representation/spatial/model boundaries.
 */

import {
  ASSET_INTELLIGENCE_OWNERSHIP,
  AUTOMATIC_CONTROL_ENABLED,
  AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED,
  AUTOMATIC_REPRESENTATION_MAPPING_APPROVAL_ENABLED,
  AUTOMATIC_TELEMETRY_STATE_PUBLICATION_ENABLED,
  AUTONOMOUS_TWIN_STATE_PUBLICATION_ALLOWED,
  CANONICAL_ASSET_IDENTITY_OWNERSHIP,
  CANONICAL_ASSET_LIFECYCLE_OWNERSHIP,
  CANONICAL_ENGINEERING_RISK_OWNERSHIP,
  CANONICAL_LIFECYCLE_MUTATION_BY_TWIN_ALLOWED,
  CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
  DIGITAL_TWIN_IMPLEMENTED,
  DIGITAL_TWIN_OWNERSHIP,
  DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED,
  DIGITAL_TWIN_RUNTIME_IMPLEMENTED,
  DUPLICATE_ASSET_OWNERSHIP_DETECTED,
  DUPLICATE_MODEL_OWNERSHIP_DETECTED,
  DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
  DUPLICATE_TIME_SERIES_PLANE_DETECTED,
  ENGINEERING_TIME_SERIES_OWNERSHIP,
  ENGINEERING_TIME_SERIES_REUSE_READY,
  HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED,
  IMPLEMENTS_OWN_AI_STACK,
  INSPECTION_INTELLIGENCE_OWNERSHIP,
  KNOWLEDGE_GRAPH_REUSE,
  LIVE_TELEMETRY_IMPLEMENTED,
  PHYSICAL_ACTUATION_ENABLED,
  PRODUCTION_DIGITAL_TWIN_READY,
  PROJECT_CONTROLS_OWNERSHIP,
  PROJECT_INTELLIGENCE_OWNERSHIP,
  PUBLIC_CONTRACT_VERSION,
  REPRESENTATION_NAVIGATION_IMPLEMENTED,
  REPRESENTATION_VERSIONING_READY,
  SENSOR_REGISTRY_IMPLEMENTED,
  SENSOR_STREAM_OWNERSHIP,
  SHM_RUNTIME_IMPLEMENTED,
  SHM_SIGNAL_PROCESSING_IMPLEMENTED,
  SIMULATION_EXECUTION_IMPLEMENTED,
  SIMULATION_STATE_OWNERSHIP,
  SOURCE_MODEL_OWNERSHIP,
  SPATIAL_CANONICAL_OWNERSHIP,
  TELEMETRY_HISTORIAN_IMPLEMENTED,
  TELEMETRY_INGESTION_PLANE_OWNERSHIP,
  THREE_D_VIEWER_IMPLEMENTED,
  TWIN_IDENTITY_READY,
  TWIN_MAY_NOT_CLAIM_ASSET_IDENTITY,
  TWIN_MAY_NOT_CLAIM_PROJECT_IDENTITY,
  TWIN_REPRESENTATION_MAPPING_READY,
  TWIN_REPRESENTATION_NAVIGATION_READY,
  TWIN_REPRESENTATION_OWNERSHIP,
  TWIN_REPRESENTATION_READY,
  TWIN_SNAPSHOT_READY,
  TWIN_SOURCE_ADAPTER_READY,
  TWIN_STATE_INGESTION_READY,
  TWIN_STATE_OWNERSHIP,
  TWIN_STATE_READY,
  TWIN_STATE_RECONCILIATION_READY,
  TWIN_TELEMETRY_BINDING_READY,
  TWIN_TELEMETRY_PROJECTION_READY,
  TWIN_THREAD_READY,
  TWIN_TIMELINE_READY,
  TWIN_VERSIONING_READY,
} from "../version";

export type DomainOwner =
  | "engineering_os_shared_domain"
  | "engineering_os_shared_project_domain"
  | "engineering_core"
  | "asset_intelligence"
  | "inspection_intelligence"
  | "project_intelligence"
  | "project_controls"
  | "digital_twin"
  | "shm"
  | "platform_kernel_telemetry"
  | "platform_kernel_knowledge_graph"
  | "external_system"
  | "external_or_existing_engineering_model_owner"
  | "existing_shared_spatial_domain_or_explicitly_reconciled_owner";

export type BoundaryRelation = "owns" | "consumes" | "forbidden" | "preserve";

export type OwnershipRow = {
  concern: string;
  owner: DomainOwner;
  relation: BoundaryRelation;
  notes: string;
};

export const DIGITAL_TWIN_OWNERSHIP_MATRIX: readonly OwnershipRow[] = [
  {
    concern: "twin_identity",
    owner: "digital_twin",
    relation: "owns",
    notes: "Twin id and representation config; references canonical entity only",
  },
  {
    concern: "twin_state",
    owner: "digital_twin",
    relation: "owns",
    notes: "Governed twin state with provenance — projections require review before publish",
  },
  {
    concern: "twin_state_ingestion",
    owner: "digital_twin",
    relation: "owns",
    notes: "Bounded governed ingestion runtime — candidates require review before publish",
  },
  {
    concern: "telemetry_binding",
    owner: "digital_twin",
    relation: "owns",
    notes: "Telemetry source/channel/binding references — never raw telemetry storage",
  },
  {
    concern: "engineering_time_series",
    owner: "asset_intelligence",
    relation: "consumes",
    notes: "Authoritative engineering time series in asset_intelligence_time_series — read-only via port",
  },
  {
    concern: "twin_representation",
    owner: "digital_twin",
    relation: "owns",
    notes: "Representation references and immutable version history",
  },
  {
    concern: "representation_mapping",
    owner: "digital_twin",
    relation: "owns",
    notes: "Versioned element mappings — refs only; no model binaries; no auto-approve",
  },
  {
    concern: "twin_spatial_reference",
    owner: "digital_twin",
    relation: "owns",
    notes: "Thin TwinSpatialReference wrappers only — no Twin location registry",
  },
  {
    concern: "spatial_canonical_location",
    owner: "existing_shared_spatial_domain_or_explicitly_reconciled_owner",
    relation: "consumes",
    notes: "Canonical locations belong to engineering_os_shared_domain",
  },
  {
    concern: "source_engineering_model",
    owner: "external_or_existing_engineering_model_owner",
    relation: "consumes",
    notes: "Model binaries in Platform Files / engineering_documents — Twin stores source_ref/fileId only",
  },
  {
    concern: "simulation_state",
    owner: "digital_twin",
    relation: "owns",
    notes: "Simulated state references reserved — execution forbidden in Phase 12F",
  },
  {
    concern: "digital_thread",
    owner: "digital_twin",
    relation: "owns",
    notes: "Thread links and append-only timeline by reference",
  },
  {
    concern: "asset_identity_canonical",
    owner: "engineering_os_shared_domain",
    relation: "consumes",
    notes: "TwinTargetReference only — Twin must not become asset registry",
  },
  {
    concern: "project_identity_canonical",
    owner: "engineering_os_shared_project_domain",
    relation: "consumes",
    notes: "Twin may reference project context; does not own project identity",
  },
  {
    concern: "asset_lifecycle_canonical",
    owner: "engineering_os_shared_domain",
    relation: "forbidden",
    notes: "Twin must not mutate canonical lifecycle",
  },
  {
    concern: "condition_intelligence",
    owner: "asset_intelligence",
    relation: "consumes",
    notes: "AI publishes advisory slices; Twin consumes via public contracts",
  },
  {
    concern: "inspection_history",
    owner: "inspection_intelligence",
    relation: "consumes",
    notes: "II owns inspection records; Twin may cite as thread evidence; mapping adapter reserved",
  },
  {
    concern: "project_knowledge",
    owner: "project_intelligence",
    relation: "consumes",
    notes: "PI owns knowledge derivatives",
  },
  {
    concern: "project_controls_intelligence",
    owner: "project_controls",
    relation: "consumes",
    notes: "Frozen PC V1 — Twin consumes advisory context only",
  },
  {
    concern: "sensor_streams",
    owner: "shm",
    relation: "consumes",
    notes: "SHM owns live structural/sensor streams; Twin binds references only — shmSignalProcessingImplemented=false",
  },
  {
    concern: "telemetry_ingestion_plane",
    owner: "platform_kernel_telemetry",
    relation: "consumes",
    notes: "Kernel owns raw sensors/events — Twin stores references only; no duplicate time-series plane",
  },
  {
    concern: "knowledge_graph_nodes",
    owner: "platform_kernel_knowledge_graph",
    relation: "consumes",
    notes: "Reuse typed KG relationships; no new KG subsystem in Twin",
  },
  {
    concern: "canonical_risk_register",
    owner: "engineering_core",
    relation: "forbidden",
    notes: "Twin may reference risk context; auto-mutation forbidden",
  },
  {
    concern: "physical_actuation",
    owner: "external_system",
    relation: "forbidden",
    notes: "Actuation disabled in Phase 12F representation slice",
  },
  {
    concern: "automatic_control_loops",
    owner: "external_system",
    relation: "forbidden",
    notes: "Automatic control disabled — human-gated only",
  },
  {
    concern: "kernel_digital_twins_tables",
    owner: "digital_twin",
    relation: "preserve",
    notes: "Phase 1.5 kernel tables preserved; REBIND via kernel_twin_id in batch_75",
  },
] as const;

export function assertOwnershipLock(): {
  ok: true;
  digitalTwinOwnership: typeof DIGITAL_TWIN_OWNERSHIP;
  twinStateOwnership: typeof TWIN_STATE_OWNERSHIP;
  simulationStateOwnership: typeof SIMULATION_STATE_OWNERSHIP;
  engineeringTimeSeriesOwnership: typeof ENGINEERING_TIME_SERIES_OWNERSHIP;
  spatialCanonicalOwnership: typeof SPATIAL_CANONICAL_OWNERSHIP;
  sourceModelOwnership: typeof SOURCE_MODEL_OWNERSHIP;
  canonicalAssetIdentityOwnership: typeof CANONICAL_ASSET_IDENTITY_OWNERSHIP;
  canonicalProjectIdentityOwnership: typeof CANONICAL_PROJECT_IDENTITY_OWNERSHIP;
  sensorStreamOwnership: typeof SENSOR_STREAM_OWNERSHIP;
  telemetryIngestionPlaneOwnership: typeof TELEMETRY_INGESTION_PLANE_OWNERSHIP;
  digitalTwinImplemented: true;
  productionDigitalTwinReady: false;
  digitalTwinRuntimeImplemented: true;
  automaticObservedStatePublicationEnabled: false;
  automaticTelemetryStatePublicationEnabled: false;
  automaticRepresentationMappingApprovalEnabled: false;
  liveTelemetryImplemented: true;
  highFrequencyTelemetryImplemented: false;
  telemetryHistorianImplemented: false;
  sensorRegistryImplemented: false;
  shmSignalProcessingImplemented: false;
  shmRuntimeImplemented: false;
  simulationExecutionImplemented: false;
  threeDViewerImplemented: false;
  physicalActuationEnabled: false;
  automaticControlEnabled: false;
  implementsOwnAiStack: false;
  duplicateTimeSeriesPlaneDetected: false;
  duplicateModelOwnershipDetected: false;
  duplicateAssetOwnershipDetected: false;
  duplicateProjectOwnershipDetected: false;
  publicContractVersion: typeof PUBLIC_CONTRACT_VERSION;
  twinIdentityReady: true;
  twinRepresentationReady: true;
  twinThreadReady: true;
  twinStateReady: true;
  twinStateIngestionReady: true;
  twinSourceAdapterReady: true;
  twinStateReconciliationReady: true;
  twinTelemetryBindingReady: true;
  twinTelemetryProjectionReady: true;
  engineeringTimeSeriesReuseReady: true;
  twinRepresentationMappingReady: true;
  twinRepresentationNavigationReady: true;
  representationNavigationImplemented: true;
  twinVersioningReady: true;
  representationVersioningReady: true;
  twinSnapshotReady: true;
  twinTimelineReady: true;
  knowledgeGraphReuse: true;
  productTablesIntroduced: true;
} {
  if (DIGITAL_TWIN_OWNERSHIP !== "digital_twin") {
    throw new Error("digital_twin_owner_mismatch");
  }
  if (TWIN_STATE_OWNERSHIP !== "digital_twin" || SIMULATION_STATE_OWNERSHIP !== "digital_twin") {
    throw new Error("twin_state_owner_mismatch");
  }
  if (ENGINEERING_TIME_SERIES_OWNERSHIP !== "asset_intelligence") {
    throw new Error("engineering_time_series_owner_must_be_asset_intelligence");
  }
  if (TWIN_REPRESENTATION_OWNERSHIP !== "digital_twin") {
    throw new Error("twin_representation_owner_mismatch");
  }
  if (
    SPATIAL_CANONICAL_OWNERSHIP !==
    "existing_shared_spatial_domain_or_explicitly_reconciled_owner"
  ) {
    throw new Error("spatial_canonical_ownership_must_be_shared_domain");
  }
  if (SOURCE_MODEL_OWNERSHIP !== "external_or_existing_engineering_model_owner") {
    throw new Error("source_model_ownership_must_be_external_or_existing");
  }
  if (CANONICAL_ASSET_IDENTITY_OWNERSHIP !== "engineering_os_shared_domain") {
    throw new Error("asset_identity_must_be_shared_domain");
  }
  if (CANONICAL_PROJECT_IDENTITY_OWNERSHIP !== "engineering_os_shared_project_domain") {
    throw new Error("project_identity_must_be_shared_project_domain");
  }
  if (!TWIN_MAY_NOT_CLAIM_ASSET_IDENTITY || !TWIN_MAY_NOT_CLAIM_PROJECT_IDENTITY) {
    throw new Error("digital_twin_may_not_claim_canonical_identity");
  }
  if (!DIGITAL_TWIN_IMPLEMENTED) {
    throw new Error("digital_twin_representation_must_be_implemented_in_phase_12f");
  }
  if (PRODUCTION_DIGITAL_TWIN_READY) {
    throw new Error("production_digital_twin_not_ready_in_phase_12f");
  }
  if (!DIGITAL_TWIN_RUNTIME_IMPLEMENTED) {
    throw new Error("digital_twin_bounded_runtime_required_in_phase_12f");
  }
  if (
    AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED ||
    AUTOMATIC_TELEMETRY_STATE_PUBLICATION_ENABLED ||
    AUTOMATIC_REPRESENTATION_MAPPING_APPROVAL_ENABLED
  ) {
    throw new Error("automatic_publication_or_mapping_approval_forbidden");
  }
  if (!LIVE_TELEMETRY_IMPLEMENTED) {
    throw new Error("bounded_live_telemetry_binding_required");
  }
  if (HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED || TELEMETRY_HISTORIAN_IMPLEMENTED || SENSOR_REGISTRY_IMPLEMENTED) {
    throw new Error("historian_high_frequency_and_sensor_registry_forbidden_in_phase_12f");
  }
  if (SHM_RUNTIME_IMPLEMENTED || SHM_SIGNAL_PROCESSING_IMPLEMENTED) {
    throw new Error("shm_forbidden_in_phase_12f");
  }
  if (SIMULATION_EXECUTION_IMPLEMENTED || THREE_D_VIEWER_IMPLEMENTED) {
    throw new Error("simulation_and_viewer_forbidden_in_phase_12f");
  }
  if (PHYSICAL_ACTUATION_ENABLED || AUTOMATIC_CONTROL_ENABLED) {
    throw new Error("actuation_and_control_forbidden_in_phase_12f");
  }
  if (IMPLEMENTS_OWN_AI_STACK) {
    throw new Error("digital_twin_must_not_implement_own_ai_stack");
  }
  if (DUPLICATE_ASSET_OWNERSHIP_DETECTED || DUPLICATE_PROJECT_OWNERSHIP_DETECTED) {
    throw new Error("duplicate_ownership");
  }
  if (DUPLICATE_TIME_SERIES_PLANE_DETECTED) {
    throw new Error("duplicate_timeseries_plane_forbidden");
  }
  if (DUPLICATE_MODEL_OWNERSHIP_DETECTED) {
    throw new Error("duplicate_model_ownership_forbidden");
  }
  if (CANONICAL_LIFECYCLE_MUTATION_BY_TWIN_ALLOWED) {
    throw new Error("canonical_lifecycle_mutation_forbidden");
  }
  if (AUTONOMOUS_TWIN_STATE_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_twin_state_publication_forbidden");
  }
  if (PUBLIC_CONTRACT_VERSION !== "0.6.0-representation-draft") {
    throw new Error("public_contracts_must_be_representation_draft_in_phase_12f");
  }
  if (
    !TWIN_IDENTITY_READY ||
    !TWIN_REPRESENTATION_READY ||
    !TWIN_THREAD_READY ||
    !TWIN_STATE_READY ||
    !TWIN_STATE_INGESTION_READY ||
    !TWIN_SOURCE_ADAPTER_READY ||
    !TWIN_STATE_RECONCILIATION_READY ||
    !TWIN_TELEMETRY_BINDING_READY ||
    !TWIN_TELEMETRY_PROJECTION_READY ||
    !ENGINEERING_TIME_SERIES_REUSE_READY ||
    !TWIN_REPRESENTATION_MAPPING_READY ||
    !TWIN_REPRESENTATION_NAVIGATION_READY ||
    !REPRESENTATION_NAVIGATION_IMPLEMENTED ||
    !TWIN_VERSIONING_READY ||
    !REPRESENTATION_VERSIONING_READY ||
    !TWIN_SNAPSHOT_READY ||
    !TWIN_TIMELINE_READY
  ) {
    throw new Error("representation_capabilities_not_ready");
  }
  if (!KNOWLEDGE_GRAPH_REUSE) {
    throw new Error("knowledge_graph_reuse_required");
  }
  if (!DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED) {
    throw new Error("product_tables_must_be_introduced");
  }
  if (SENSOR_STREAM_OWNERSHIP !== "shm") {
    throw new Error("sensor_streams_must_be_shm");
  }
  if (TELEMETRY_INGESTION_PLANE_OWNERSHIP !== "platform_kernel_telemetry") {
    throw new Error("telemetry_plane_must_be_kernel");
  }
  if (ASSET_INTELLIGENCE_OWNERSHIP !== "asset_intelligence") {
    throw new Error("asset_intelligence_owner_mismatch");
  }
  if (INSPECTION_INTELLIGENCE_OWNERSHIP !== "inspection_intelligence") {
    throw new Error("inspection_intelligence_owner_mismatch");
  }
  if (PROJECT_INTELLIGENCE_OWNERSHIP !== "project_intelligence") {
    throw new Error("project_intelligence_owner_mismatch");
  }
  if (PROJECT_CONTROLS_OWNERSHIP !== "project_controls") {
    throw new Error("project_controls_owner_mismatch");
  }
  if (CANONICAL_ENGINEERING_RISK_OWNERSHIP !== "engineering_core") {
    throw new Error("canonical_risk_must_be_engineering_core");
  }
  if (CANONICAL_ASSET_LIFECYCLE_OWNERSHIP !== "engineering_os_shared_domain") {
    throw new Error("asset_lifecycle_must_be_shared_domain");
  }

  const twinIdentityRows = DIGITAL_TWIN_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "asset_identity_canonical",
  );
  if (twinIdentityRows.some((row) => row.owner === "digital_twin")) {
    throw new Error("digital_twin_may_not_own_asset_identity");
  }

  const tsRows = DIGITAL_TWIN_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "engineering_time_series",
  );
  if (tsRows.some((row) => row.owner === "digital_twin")) {
    throw new Error("digital_twin_may_not_own_engineering_time_series");
  }

  const modelRows = DIGITAL_TWIN_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "source_engineering_model",
  );
  if (modelRows.some((row) => row.owner === "digital_twin")) {
    throw new Error("digital_twin_may_not_own_source_engineering_model");
  }

  const spatialRows = DIGITAL_TWIN_OWNERSHIP_MATRIX.filter(
    (row) => row.concern === "spatial_canonical_location",
  );
  if (spatialRows.some((row) => row.owner === "digital_twin")) {
    throw new Error("digital_twin_may_not_own_canonical_spatial_location");
  }

  return {
    ok: true,
    digitalTwinOwnership: DIGITAL_TWIN_OWNERSHIP,
    twinStateOwnership: TWIN_STATE_OWNERSHIP,
    simulationStateOwnership: SIMULATION_STATE_OWNERSHIP,
    engineeringTimeSeriesOwnership: ENGINEERING_TIME_SERIES_OWNERSHIP,
    spatialCanonicalOwnership: SPATIAL_CANONICAL_OWNERSHIP,
    sourceModelOwnership: SOURCE_MODEL_OWNERSHIP,
    canonicalAssetIdentityOwnership: CANONICAL_ASSET_IDENTITY_OWNERSHIP,
    canonicalProjectIdentityOwnership: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    sensorStreamOwnership: SENSOR_STREAM_OWNERSHIP,
    telemetryIngestionPlaneOwnership: TELEMETRY_INGESTION_PLANE_OWNERSHIP,
    digitalTwinImplemented: true,
    productionDigitalTwinReady: false,
    digitalTwinRuntimeImplemented: true,
    automaticObservedStatePublicationEnabled: false,
    automaticTelemetryStatePublicationEnabled: false,
    automaticRepresentationMappingApprovalEnabled: false,
    liveTelemetryImplemented: true,
    highFrequencyTelemetryImplemented: false,
    telemetryHistorianImplemented: false,
    sensorRegistryImplemented: false,
    shmSignalProcessingImplemented: false,
    shmRuntimeImplemented: false,
    simulationExecutionImplemented: false,
    threeDViewerImplemented: false,
    physicalActuationEnabled: false,
    automaticControlEnabled: false,
    implementsOwnAiStack: false,
    duplicateTimeSeriesPlaneDetected: false,
    duplicateModelOwnershipDetected: false,
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
    publicContractVersion: PUBLIC_CONTRACT_VERSION,
    twinIdentityReady: true,
    twinRepresentationReady: true,
    twinThreadReady: true,
    twinStateReady: true,
    twinStateIngestionReady: true,
    twinSourceAdapterReady: true,
    twinStateReconciliationReady: true,
    twinTelemetryBindingReady: true,
    twinTelemetryProjectionReady: true,
    engineeringTimeSeriesReuseReady: true,
    twinRepresentationMappingReady: true,
    twinRepresentationNavigationReady: true,
    representationNavigationImplemented: true,
    twinVersioningReady: true,
    representationVersioningReady: true,
    twinSnapshotReady: true,
    twinTimelineReady: true,
    knowledgeGraphReuse: true,
    productTablesIntroduced: true,
  };
}
