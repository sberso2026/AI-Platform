/**
 * Phase 12L certification gates A–BE (Engineering Shared Spatial Domain Discovery).
 * 57 gates: A–Z (26) + AA–BE (31).
 *
 * Discovery scale: docs, ownership locks, draft contracts, DT pin checks.
 * No hosted spatial DB, no GIS runtime, no browser E2E required.
 */
export const PHASE_12L_SHARED_SPATIAL_DOMAIN_DISCOVERY_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "Project Intelligence V1 intact"],
  ["E", "Inspection Intelligence V1 intact"],
  ["F", "Shared spatial discovery package exists"],
  ["G", "Shared spatial certification package exists"],
  ["H", "Version 0.1.0-spatial-discovery"],
  ["I", "SharedSpatialDomainDiscoveryReady is true"],
  ["J", "SharedSpatialDomainOwnershipLocked is true"],
  ["K", "SharedSpatialDomainRuntimeImplemented is false"],
  ["L", "spatialOwnershipFullyResolved is false"],
  ["M", "coordinateTransformationImplemented is false"],
  ["N", "gisRuntimeImplemented is false"],
  ["O", "spatialAnalyticsImplemented is false"],
  ["P", "duplicateSpatialOwnershipDetected is false"],
  ["Q", "duplicateGeometryOwnershipDetected is false"],
  ["R", "Existing footprint inventory complete"],
  ["S", "Ownership matrix document"],
  ["T", "Boundary map document"],
  ["U", "Spatial ownership ADR"],
  ["V", "Geometry ownership ADR"],
  ["W", "CRS governance ADR"],
  ["X", "Local vs global coordinates ADR"],
  ["Y", "BIM/GIS/model boundary ADR"],
  ["Z", "Linear referencing boundary ADR"],
  ["AA", "TwinSpatialReference migration ADR"],
  ["AB", "Phase 12L discovery overview"],
  ["AC", "Draft public contracts document"],
  ["AD", "Digital Twin remains 0.11.0-digital-thread"],
  ["AE", "Digital Twin is not canonical spatial owner"],
  ["AF", "TwinSpatialReference remains thin wrapper"],
  ["AG", "No engineering_locations table introduced"],
  ["AH", "No PostGIS / GIS runtime"],
  ["AI", "No shared spatial product migrations"],
  ["AJ", "batch_75–84 digital twin migrations untouched"],
  ["AK", "No spatial runtime services in discovery package"],
  ["AL", "No shared spatial product UI"],
  ["AM", "Secret exposure"],
  ["AN", "Artifact identity"],
  ["AO", "phase12MReady is true"],
  ["AP", "releaseEligible is true"],
  ["AQ", "Digital Twin 12K baseline pin / hosted run"],
  ["AR", "productionDigitalTwinReady remains false"],
  ["AS", "DT spatialOwnershipFullyResolved remains false"],
  ["AT", "SPATIAL_CANONICAL_OWNERSHIP reconciled"],
  ["AU", "Residual TEXT location fields documented"],
  ["AV", "Inspection Intelligence consumes not owns"],
  ["AW", "Asset/Project remain identity owners"],
  ["AX", "Time series stays Asset Intelligence"],
  ["AY", "Knowledge Graph not spatial owner"],
  ["AZ", "Geometry blobs remain external"],
  ["BA", "Public contracts draft 0.1.0-draft"],
  ["BB", "Ownership lock assert passes"],
  ["BC", "Workflow exists"],
  ["BD", "Discovery unit tests"],
  ["BE", "Phase 12M not started"],
] as const;

export type Phase12lGateId =
  (typeof PHASE_12L_SHARED_SPATIAL_DOMAIN_DISCOVERY_GATES)[number][0];

export const PHASE_12L_GATE_COUNT = PHASE_12L_SHARED_SPATIAL_DOMAIN_DISCOVERY_GATES.length;

export const PHASE_12L_SHARED_SPATIAL_VERSION = "0.1.0-spatial-discovery" as const;
export const PHASE_12L_DIGITAL_TWIN_VERSION = "0.11.0-digital-thread" as const;
export const PHASE_12L_DIGITAL_TWIN_CERTIFIED_COMMIT =
  "dc5d1d6775b172634cd50038d34f35c13c34c339" as const;
export const PHASE_12L_DIGITAL_TWIN_HOSTED_RUN = "31269156189" as const;

export const PHASE_12L_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12L_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12L_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12L_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12L_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12L_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12L_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12L_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12L_PROTECTED_BATCH_MIGRATIONS = [
  "supabase/migrations/20260808140000_batch_75_digital_twin_core.sql",
  "supabase/migrations/20260808150000_batch_76_digital_twin_state.sql",
  "supabase/migrations/20260808160000_batch_77_digital_twin_state_ingestion.sql",
  "supabase/migrations/20260808170000_batch_78_digital_twin_telemetry_binding.sql",
  "supabase/migrations/20260808180000_batch_79_digital_twin_representation_mapping.sql",
  "supabase/migrations/20260808190000_batch_80_digital_twin_simulation.sql",
  "supabase/migrations/20260808200000_batch_81_digital_twin_simulation_assurance.sql",
  "supabase/migrations/20260808210000_batch_82_digital_twin_solver_adapters.sql",
  "supabase/migrations/20260808220000_batch_83_digital_twin_solver_capabilities.sql",
  "supabase/migrations/20260808230000_batch_84_digital_twin_digital_thread.sql",
] as const;
