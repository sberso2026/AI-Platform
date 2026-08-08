/**
 * Phase 12A — Digital Twin ownership lock.
 *
 * Machine-readable twin of `docs/architecture/DIGITAL_TWIN_OWNERSHIP_MATRIX.md`.
 */

import {
  ASSET_INTELLIGENCE_OWNERSHIP,
  AUTOMATIC_CONTROL_ENABLED,
  AUTONOMOUS_TWIN_STATE_PUBLICATION_ALLOWED,
  CANONICAL_ASSET_IDENTITY_OWNERSHIP,
  CANONICAL_ASSET_LIFECYCLE_OWNERSHIP,
  CANONICAL_ENGINEERING_RISK_OWNERSHIP,
  CANONICAL_LIFECYCLE_MUTATION_BY_TWIN_ALLOWED,
  CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
  DIGITAL_TWIN_IMPLEMENTED,
  DIGITAL_TWIN_OWNERSHIP,
  DIGITAL_TWIN_RUNTIME_IMPLEMENTED,
  DUPLICATE_ASSET_OWNERSHIP_DETECTED,
  DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
  IMPLEMENTS_OWN_AI_STACK,
  INSPECTION_INTELLIGENCE_OWNERSHIP,
  LIVE_TELEMETRY_IMPLEMENTED,
  PHYSICAL_ACTUATION_ENABLED,
  PRODUCTION_DIGITAL_TWIN_READY,
  PROJECT_CONTROLS_OWNERSHIP,
  PROJECT_INTELLIGENCE_OWNERSHIP,
  PUBLIC_CONTRACT_VERSION,
  SENSOR_STREAM_OWNERSHIP,
  SIMULATION_EXECUTION_IMPLEMENTED,
  SIMULATION_STATE_OWNERSHIP,
  TELEMETRY_INGESTION_PLANE_OWNERSHIP,
  THREE_D_VIEWER_IMPLEMENTED,
  TWIN_MAY_NOT_CLAIM_ASSET_IDENTITY,
  TWIN_MAY_NOT_CLAIM_PROJECT_IDENTITY,
  TWIN_REPRESENTATION_OWNERSHIP,
  TWIN_STATE_OWNERSHIP,
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
  | "external_system";

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
    notes: "Derived twin state snapshots — not canonical asset identity",
  },
  {
    concern: "twin_representation",
    owner: "digital_twin",
    relation: "owns",
    notes: "Geometry, fidelity config, scenario bindings — L0–L5 reserved",
  },
  {
    concern: "simulation_state",
    owner: "digital_twin",
    relation: "owns",
    notes: "Simulation artefacts — execution forbidden in Phase 12A",
  },
  {
    concern: "digital_thread",
    owner: "digital_twin",
    relation: "owns",
    notes: "Provenance thread model — defined in Phase 12A, not implemented",
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
    notes: "II owns inspection records; Twin may cite as thread evidence",
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
    notes: "SHM owns live structural/sensor streams; Twin binds references",
  },
  {
    concern: "telemetry_ingestion_plane",
    owner: "platform_kernel_telemetry",
    relation: "consumes",
    notes: "No duplicate time-series plane in Digital Twin module",
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
    notes: "Actuation disabled in Phase 12A and discovery lock",
  },
  {
    concern: "automatic_control_loops",
    owner: "external_system",
    relation: "forbidden",
    notes: "Automatic control disabled — human-gated only in future phases",
  },
  {
    concern: "kernel_digital_twins_tables",
    owner: "digital_twin",
    relation: "preserve",
    notes: "Phase 1.5 kernel tables preserved; REBIND auto-create in 12B+",
  },
] as const;

export function assertOwnershipLock(): {
  ok: true;
  digitalTwinOwnership: typeof DIGITAL_TWIN_OWNERSHIP;
  twinStateOwnership: typeof TWIN_STATE_OWNERSHIP;
  simulationStateOwnership: typeof SIMULATION_STATE_OWNERSHIP;
  canonicalAssetIdentityOwnership: typeof CANONICAL_ASSET_IDENTITY_OWNERSHIP;
  canonicalProjectIdentityOwnership: typeof CANONICAL_PROJECT_IDENTITY_OWNERSHIP;
  sensorStreamOwnership: typeof SENSOR_STREAM_OWNERSHIP;
  telemetryIngestionPlaneOwnership: typeof TELEMETRY_INGESTION_PLANE_OWNERSHIP;
  digitalTwinImplemented: false;
  productionDigitalTwinReady: false;
  digitalTwinRuntimeImplemented: false;
  liveTelemetryImplemented: false;
  simulationExecutionImplemented: false;
  threeDViewerImplemented: false;
  physicalActuationEnabled: false;
  automaticControlEnabled: false;
  implementsOwnAiStack: false;
  duplicateAssetOwnershipDetected: false;
  duplicateProjectOwnershipDetected: false;
  publicContractVersion: typeof PUBLIC_CONTRACT_VERSION;
} {
  if (DIGITAL_TWIN_OWNERSHIP !== "digital_twin") {
    throw new Error("digital_twin_owner_mismatch");
  }
  if (TWIN_STATE_OWNERSHIP !== "digital_twin" || SIMULATION_STATE_OWNERSHIP !== "digital_twin") {
    throw new Error("twin_state_owner_mismatch");
  }
  if (TWIN_REPRESENTATION_OWNERSHIP !== "digital_twin") {
    throw new Error("twin_representation_owner_mismatch");
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
  if (DIGITAL_TWIN_IMPLEMENTED || PRODUCTION_DIGITAL_TWIN_READY) {
    throw new Error("digital_twin_product_forbidden_in_phase_12a");
  }
  if (
    DIGITAL_TWIN_RUNTIME_IMPLEMENTED ||
    LIVE_TELEMETRY_IMPLEMENTED ||
    SIMULATION_EXECUTION_IMPLEMENTED ||
    THREE_D_VIEWER_IMPLEMENTED
  ) {
    throw new Error("digital_twin_runtime_forbidden_in_phase_12a");
  }
  if (PHYSICAL_ACTUATION_ENABLED || AUTOMATIC_CONTROL_ENABLED) {
    throw new Error("actuation_and_control_forbidden_in_phase_12a");
  }
  if (IMPLEMENTS_OWN_AI_STACK) {
    throw new Error("digital_twin_must_not_implement_own_ai_stack");
  }
  if (DUPLICATE_ASSET_OWNERSHIP_DETECTED || DUPLICATE_PROJECT_OWNERSHIP_DETECTED) {
    throw new Error("duplicate_ownership");
  }
  if (CANONICAL_LIFECYCLE_MUTATION_BY_TWIN_ALLOWED) {
    throw new Error("canonical_lifecycle_mutation_forbidden");
  }
  if (AUTONOMOUS_TWIN_STATE_PUBLICATION_ALLOWED) {
    throw new Error("autonomous_twin_state_publication_forbidden");
  }
  if (PUBLIC_CONTRACT_VERSION !== "0.1.0-draft") {
    throw new Error("public_contracts_must_stay_draft_in_phase_12a");
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

  return {
    ok: true,
    digitalTwinOwnership: DIGITAL_TWIN_OWNERSHIP,
    twinStateOwnership: TWIN_STATE_OWNERSHIP,
    simulationStateOwnership: SIMULATION_STATE_OWNERSHIP,
    canonicalAssetIdentityOwnership: CANONICAL_ASSET_IDENTITY_OWNERSHIP,
    canonicalProjectIdentityOwnership: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    sensorStreamOwnership: SENSOR_STREAM_OWNERSHIP,
    telemetryIngestionPlaneOwnership: TELEMETRY_INGESTION_PLANE_OWNERSHIP,
    digitalTwinImplemented: false,
    productionDigitalTwinReady: false,
    digitalTwinRuntimeImplemented: false,
    liveTelemetryImplemented: false,
    simulationExecutionImplemented: false,
    threeDViewerImplemented: false,
    physicalActuationEnabled: false,
    automaticControlEnabled: false,
    implementsOwnAiStack: false,
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
    publicContractVersion: PUBLIC_CONTRACT_VERSION,
  };
}
