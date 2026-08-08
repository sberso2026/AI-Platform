/**
 * Phase 12L — Engineering Shared Spatial Domain Discovery.
 *
 * Discovery only: architecture locks, draft reference types, and ownership
 * reconciliation. No spatial runtime, GIS, PostGIS, coordinate transforms,
 * spatial analytics, sensor registry, or SHM.
 *
 * Digital Twin remains on certified 12K identity (0.11.0-digital-thread).
 * PHASE_12M_READY is a flag only — do not start Phase 12M.
 */

export const ENGINEERING_SHARED_SPATIAL_DOMAIN_NAME =
  "Engineering Shared Spatial Domain" as const;
export const ENGINEERING_SHARED_SPATIAL_DOMAIN_KEY =
  "engineering_os_shared_spatial_domain" as const;
export const ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION =
  "0.1.0-spatial-discovery" as const;
export const ENGINEERING_SHARED_SPATIAL_DOMAIN_STATUS = "discovery" as const;
export const ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE = "12L" as const;

/** Primary discovery readiness. */
export const SHARED_SPATIAL_DOMAIN_DISCOVERY_READY = true as const;
export const SharedSpatialDomainDiscoveryReady = true as const;
export const sharedSpatialDomainDiscoveryReady = true as const;

/**
 * Architecture decision locked: Shared Spatial Domain owns canonical spatial
 * REFERENCE semantics (LocationReference, CRS refs, SpatialReference).
 * Geometry blobs remain external (BIM/GIS/files).
 */
export const SHARED_SPATIAL_DOMAIN_OWNERSHIP_LOCKED = true as const;
export const SharedSpatialDomainOwnershipLocked = true as const;
export const sharedSpatialDomainOwnershipLocked = true as const;

/**
 * Not fully resolved: no engineering_locations register yet; residual TEXT
 * location fields on assets/projects remain; TwinSpatialReference still points
 * at non-materialized location IDs. Honest PASS path.
 */
export const SPATIAL_OWNERSHIP_FULLY_RESOLVED = false as const;
export const spatialOwnershipFullyResolved = false as const;

/** ALWAYS false in Phase 12L — no production spatial runtime. */
export const SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED = false as const;
export const SharedSpatialDomainRuntimeImplemented = false as const;
export const sharedSpatialDomainRuntimeImplemented = false as const;

export const COORDINATE_TRANSFORMATION_IMPLEMENTED = false as const;
export const coordinateTransformationImplemented = false as const;
export const GIS_RUNTIME_IMPLEMENTED = false as const;
export const gisRuntimeImplemented = false as const;
export const SPATIAL_ANALYTICS_IMPLEMENTED = false as const;
export const spatialAnalyticsImplemented = false as const;
export const POSTGIS_IMPLEMENTED = false as const;
export const postgisImplemented = false as const;
export const SENSOR_REGISTRY_IMPLEMENTED = false as const;
export const sensorRegistryImplemented = false as const;
export const SHM_RUNTIME_IMPLEMENTED = false as const;
export const shmRuntimeImplemented = false as const;
export const THREE_D_VIEWER_IMPLEMENTED = false as const;
export const threeDViewerImplemented = false as const;

/**
 * Competing TEXT consumers exist, but no second canonical authority claims
 * ownership of spatial reference semantics. Conflicts are documented; flag
 * stays false unless true duplicate authority is proven.
 */
export const DUPLICATE_SPATIAL_OWNERSHIP_DETECTED = false as const;
export const duplicateSpatialOwnershipDetected = false as const;
export const DUPLICATE_GEOMETRY_OWNERSHIP_DETECTED = false as const;
export const duplicateGeometryOwnershipDetected = false as const;

export const ENGINEERING_LOCATIONS_TABLE_EXISTS = false as const;
export const engineeringLocationsTableExists = false as const;
export const SHARED_SPATIAL_PRODUCT_TABLES_INTRODUCED = false as const;
export const sharedSpatialProductTablesIntroduced = false as const;
export const SHARED_SPATIAL_PRODUCT_UI_IMPLEMENTED = false as const;
export const sharedSpatialProductUiImplemented = false as const;

/** Flag only — do not start Phase 12M. */
export const PHASE_12M_READY = true as const;
export const phase12MReady = true as const;

export const PUBLIC_CONTRACT_VERSION = "0.1.0-draft" as const;

// ---------------------------------------------------------------------------
// Ownership declarations (locked decision)
// ---------------------------------------------------------------------------

export const CANONICAL_SPATIAL_REFERENCE_OWNERSHIP =
  "engineering_os_shared_spatial_domain" as const;
export const CANONICAL_LOCATION_REFERENCE_OWNERSHIP =
  "engineering_os_shared_spatial_domain" as const;
export const CANONICAL_CRS_REFERENCE_OWNERSHIP =
  "engineering_os_shared_spatial_domain" as const;
export const GEOMETRY_BLOB_OWNERSHIP =
  "external_or_existing_engineering_model_owner" as const;
export const CANONICAL_ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain" as const;
export const CANONICAL_PROJECT_IDENTITY_OWNERSHIP =
  "engineering_os_shared_project_domain" as const;
export const ENGINEERING_TIME_SERIES_OWNERSHIP = "asset_intelligence" as const;
export const KNOWLEDGE_GRAPH_OWNERSHIP = "platform_kernel_knowledge_graph" as const;
export const TWIN_SPATIAL_REFERENCE_OWNERSHIP = "digital_twin" as const;
export const DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL = false as const;
export const digitalTwinMayOwnCanonicalSpatial = false as const;

/** Residual TEXT location columns — not a competing canonical register. */
export const RESIDUAL_TEXT_LOCATION_FIELDS = [
  "engineering_assets.location",
  "engineering_projects.location",
  "engineering_projects.site_name",
] as const;

export const FUTURE_LOCATION_REGISTER = "engineering_locations" as const;

/** Digital Twin 12K certified identity (must not bump). */
export const DIGITAL_TWIN_12K_VERSION = "0.11.0-digital-thread" as const;
export const DIGITAL_TWIN_12K_CERTIFIED_COMMIT =
  "dc5d1d6775b172634cd50038d34f35c13c34c339" as const;
export const DIGITAL_TWIN_12K_HOSTED_RUN = "31269156189" as const;

export const PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const INSPECTION_INTELLIGENCE_V1_TAG = "inspection-intelligence-v1.0.0" as const;
export const INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;

export const SANCTIONED_SPATIAL_REFERENCE_CONSUMERS = [
  "digital_twin",
  "asset_intelligence",
  "inspection_intelligence",
  "project_intelligence",
  "project_controls",
  "engineering_core",
  "engineering_os_shared_project_domain",
] as const;

export type SanctionedSpatialReferenceConsumer =
  (typeof SANCTIONED_SPATIAL_REFERENCE_CONSUMERS)[number];

export function getSharedSpatialDomainDiscoveryDeclaration() {
  return {
    name: ENGINEERING_SHARED_SPATIAL_DOMAIN_NAME,
    key: ENGINEERING_SHARED_SPATIAL_DOMAIN_KEY,
    version: ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION,
    status: ENGINEERING_SHARED_SPATIAL_DOMAIN_STATUS,
    phase: ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE,
    SharedSpatialDomainDiscoveryReady,
    SharedSpatialDomainOwnershipLocked,
    SharedSpatialDomainRuntimeImplemented,
    spatialOwnershipFullyResolved,
    coordinateTransformationImplemented,
    gisRuntimeImplemented,
    spatialAnalyticsImplemented,
    postgisImplemented,
    duplicateSpatialOwnershipDetected,
    duplicateGeometryOwnershipDetected,
    engineeringLocationsTableExists,
    sharedSpatialProductTablesIntroduced,
    sharedSpatialProductUiImplemented,
    digitalTwinMayOwnCanonicalSpatial,
    canonicalSpatialReferenceOwnership: CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
    canonicalLocationReferenceOwnership: CANONICAL_LOCATION_REFERENCE_OWNERSHIP,
    canonicalCrsReferenceOwnership: CANONICAL_CRS_REFERENCE_OWNERSHIP,
    geometryBlobOwnership: GEOMETRY_BLOB_OWNERSHIP,
    twinSpatialReferenceOwnership: TWIN_SPATIAL_REFERENCE_OWNERSHIP,
    residualTextLocationFields: RESIDUAL_TEXT_LOCATION_FIELDS,
    futureLocationRegister: FUTURE_LOCATION_REGISTER,
    publicContractVersion: PUBLIC_CONTRACT_VERSION,
    phase12MReady,
    digitalTwin12KVersion: DIGITAL_TWIN_12K_VERSION,
    digitalTwin12KCertifiedCommit: DIGITAL_TWIN_12K_CERTIFIED_COMMIT,
    digitalTwin12KHostedRun: DIGITAL_TWIN_12K_HOSTED_RUN,
    hierarchy:
      "RTB AI Platform → Engineering OS → Engineering Shared Spatial Domain (canonical spatial REFERENCE semantics) → consuming modules (Digital Twin thin wrappers, II, AI, …)" as const,
  };
}
