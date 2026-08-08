/**
 * Phase 12M certification gates (Engineering Shared Spatial Domain Core).
 * 72 gates: A–Z (26) + AA–BT (46).
 */
export const PHASE_12M_SHARED_SPATIAL_DOMAIN_CORE_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "Project Intelligence V1 intact"],
  ["E", "Inspection Intelligence V1 intact"],
  ["F", "Shared spatial core package exists"],
  ["G", "Shared spatial certification package exists"],
  ["H", "Version 0.2.0-spatial-core"],
  ["I", "SharedSpatialDomainDiscoveryReady is true"],
  ["J", "SharedSpatialDomainOwnershipLocked is true"],
  ["K", "SharedSpatialDomainRuntimeImplemented is true"],
  ["L", "spatialOwnershipFullyResolved is true"],
  ["M", "SharedSpatialReferenceRegistryReady is true"],
  ["N", "SpatialReferenceGovernanceReady is true"],
  ["O", "CoordinateReferenceGovernanceReady is true"],
  ["P", "CoordinateReferenceSystemRegistryReady is true"],
  ["Q", "LegacySpatialReconciliationReady is true"],
  ["R", "DigitalTwinSpatialBindingReady is true"],
  ["S", "digitalTwinMayOwnCanonicalSpatial is false"],
  ["T", "coordinateTransformationImplemented is false"],
  ["U", "gisRuntimeImplemented is false"],
  ["V", "spatialAnalyticsImplemented is false"],
  ["W", "geometryRepositoryImplemented is false"],
  ["X", "duplicate* ownership flags false"],
  ["Y", "productionMemoryRepositoryAllowed is false"],
  ["Z", "productionDigitalTwinReady is false"],
  ["AA", "Phase 12M overview doc"],
  ["AB", "Ownership matrix updated"],
  ["AC", "Boundary map updated"],
  ["AD", "Twin rebinding ADR updated"],
  ["AE", "Public contracts 0.2.0-spatial-core"],
  ["AF", "batch_85 migration exists"],
  ["AG", "batch_75–84 digital twin migrations untouched"],
  ["AH", "No PostGIS extension / geometry blobs in batch_85"],
  ["AI", "Spatial HTTP routes under /api/engineering/spatial"],
  ["AJ", "Spatial reference review slug"],
  ["AK", "Digital Twin remains 0.11.0-digital-thread"],
  ["AL", "TwinSpatialReference additive sharedSpatialReferenceId"],
  ["AM", "Digital Twin not canonical spatial owner"],
  ["AN", "Phase 12L pin intact"],
  ["AO", "Ownership lock assert passes"],
  ["AP", "Unit tests pass"],
  ["AQ", "Secret exposure"],
  ["AR", "Artifact identity"],
  ["AS", "phase12NReady is true (flag only)"],
  ["AT", "Phase 12N not started"],
  ["AU", "Hosted table probes (PK columns)"],
  ["AV", "Hosted RLS probe"],
  ["AW", "V1 tags not moved"],
  ["AX", "releaseEligible"],
  ["AY", "unexpected5xx is 0"],
  ["AZ", "Workflow exists"],
  ["BA", "Events are ids-only"],
  ["BB", "Legacy never auto-canonical"],
  ["BC", "CRS incompatible fail-closed"],
  ["BD", "Hierarchy no geometry implication"],
  ["BE", "Thin UI readiness marker"],
  ["BF", "Memory + postgres adapters"],
  ["BG", "Outbox does not rewrite digital_twin_outbox"],
  ["BH", "DT regression spatialOwnershipFullyResolved false"],
  ["BI", "Digital Thread spatial_reference kind"],
  ["BJ", "No GIS/transform/analytics directories"],
  ["BK", "Contracts not GA 1.0.0"],
  ["BL", "PLATFORM certification arch test"],
  ["BM", "Coordinate reference systems table PK crs_id"],
  ["BN", "Spatial relationships table PK relationship_id"],
  ["BO", "Reviews table PK review_id"],
  ["BP", "Legacy reconciliations table PK reconciliation_id"],
  ["BQ", "Coordinates table PK coordinate_reference_id"],
  ["BR", "Spatial references table PK spatial_reference_id"],
  ["BS", "OwnershipFullyResolved conditions proven in lock"],
  ["BT", "certify:phase12m script"],
] as const;

export type Phase12mGateId =
  (typeof PHASE_12M_SHARED_SPATIAL_DOMAIN_CORE_GATES)[number][0];

export const PHASE_12M_GATE_COUNT = PHASE_12M_SHARED_SPATIAL_DOMAIN_CORE_GATES.length;

export const PHASE_12M_SHARED_SPATIAL_VERSION = "0.2.0-spatial-core" as const;
export const PHASE_12M_DIGITAL_TWIN_VERSION = "0.11.0-digital-thread" as const;
export const PHASE_12M_PUBLIC_CONTRACT_VERSION = "0.2.0-spatial-core" as const;

export const PHASE_12L_PIN_COMMIT =
  "7d9bfbd792a034bae088dbb1db02876ca400929d" as const;
export const PHASE_12L_HOSTED_RUN = "31269729941" as const;
export const PHASE_12L_VERSION = "0.1.0-spatial-discovery" as const;

export const PHASE_12M_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12M_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12M_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12M_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12M_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12M_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12M_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12M_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12M_PROTECTED_BATCH_MIGRATIONS = [
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

export const PHASE_12M_HOSTED_TABLES = [
  { table: "engineering_spatial_references", pk: "spatial_reference_id" },
  { table: "engineering_spatial_relationships", pk: "relationship_id" },
  { table: "engineering_coordinate_reference_systems", pk: "crs_id" },
  { table: "engineering_coordinate_references", pk: "coordinate_reference_id" },
  { table: "engineering_spatial_reference_reviews", pk: "review_id" },
  { table: "engineering_legacy_spatial_reconciliations", pk: "reconciliation_id" },
] as const;

export const PHASE_12M_HTTP_ROUTES = [
  "apps/web/src/app/api/engineering/spatial/spatial-references/route.ts",
  "apps/web/src/app/api/engineering/spatial/spatial-relationships/route.ts",
  "apps/web/src/app/api/engineering/spatial/coordinate-reference-systems/route.ts",
  "apps/web/src/app/api/engineering/spatial/coordinates/route.ts",
  "apps/web/src/app/api/engineering/spatial/legacy-reconciliation/route.ts",
  "apps/web/src/app/api/engineering/spatial/reviews/route.ts",
] as const;
