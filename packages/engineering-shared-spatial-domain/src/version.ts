/**
 * Phase 12M — Engineering Shared Spatial Domain Core.
 *
 * Canonical SpatialReference registry, CRS governance, governed rebinding,
 * legacy TEXT reconciliation states. No GIS, PostGIS product features,
 * coordinate transforms, spatial analytics, geometry blobs, BIM/CAD extraction,
 * map product, sensor registry, telemetry, SHM, or AI spatial authority.
 *
 * Digital Twin remains 0.11.0-digital-thread (additive SpatialReference.id binding only).
 * PHASE_12N_READY is a flag only — do not start Phase 12N.
 */

export const ENGINEERING_SHARED_SPATIAL_DOMAIN_NAME =
  "Engineering Shared Spatial Domain" as const;
export const ENGINEERING_SHARED_SPATIAL_DOMAIN_KEY =
  "engineering_os_shared_spatial_domain" as const;
export const ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION =
  "0.2.0-spatial-core" as const;
export const ENGINEERING_SHARED_SPATIAL_DOMAIN_STATUS = "spatial_core" as const;
export const ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE = "12M" as const;

/** Discovery readiness retained from 12L. */
export const SHARED_SPATIAL_DOMAIN_DISCOVERY_READY = true as const;
export const SharedSpatialDomainDiscoveryReady = true as const;
export const sharedSpatialDomainDiscoveryReady = true as const;

export const SHARED_SPATIAL_DOMAIN_OWNERSHIP_LOCKED = true as const;
export const SharedSpatialDomainOwnershipLocked = true as const;
export const sharedSpatialDomainOwnershipLocked = true as const;
export const OwnershipLocked = true as const;

/**
 * Fully resolved: SpatialReference registry + ownership lock + DT consume-only
 * binding + legacy TEXT classified via reconciliation states + geometry external
 * + CRS reference ops (no transforms). Residual TEXT columns remain bridges
 * classified as LegacySpatialReconciliation — not competing canonical authority.
 */
export const SPATIAL_OWNERSHIP_FULLY_RESOLVED = true as const;
export const spatialOwnershipFullyResolved = true as const;

/** Phase 12M runtime: reference registry + governance (not GIS/transforms). */
export const SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED = true as const;
export const SharedSpatialDomainRuntimeImplemented = true as const;
export const sharedSpatialDomainRuntimeImplemented = true as const;

export const SHARED_SPATIAL_REFERENCE_REGISTRY_READY = true as const;
export const SharedSpatialReferenceRegistryReady = true as const;
export const sharedSpatialReferenceRegistryReady = true as const;

export const SPATIAL_REFERENCE_GOVERNANCE_READY = true as const;
export const SpatialReferenceGovernanceReady = true as const;
export const spatialReferenceGovernanceReady = true as const;

export const COORDINATE_REFERENCE_GOVERNANCE_READY = true as const;
export const CoordinateReferenceGovernanceReady = true as const;
export const coordinateReferenceGovernanceReady = true as const;

export const COORDINATE_REFERENCE_SYSTEM_REGISTRY_READY = true as const;
export const CoordinateReferenceSystemRegistryReady = true as const;
export const coordinateReferenceSystemRegistryReady = true as const;

export const LEGACY_SPATIAL_RECONCILIATION_READY = true as const;
export const LegacySpatialReconciliationReady = true as const;
export const legacySpatialReconciliationReady = true as const;

export const DIGITAL_TWIN_SPATIAL_BINDING_READY = true as const;
export const DigitalTwinSpatialBindingReady = true as const;
export const digitalTwinSpatialBindingReady = true as const;

/** ALWAYS false — Digital Twin must never own canonical spatial. */
export const DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL = false as const;
export const digitalTwinMayOwnCanonicalSpatial = false as const;

export const COORDINATE_TRANSFORMATION_IMPLEMENTED = false as const;
export const coordinateTransformationImplemented = false as const;
export const GIS_RUNTIME_IMPLEMENTED = false as const;
export const gisRuntimeImplemented = false as const;
export const SPATIAL_ANALYTICS_IMPLEMENTED = false as const;
export const spatialAnalyticsImplemented = false as const;
export const GEOMETRY_REPOSITORY_IMPLEMENTED = false as const;
export const geometryRepositoryImplemented = false as const;
export const POSTGIS_IMPLEMENTED = false as const;
export const postgisImplemented = false as const;
export const SENSOR_REGISTRY_IMPLEMENTED = false as const;
export const sensorRegistryImplemented = false as const;
export const SHM_RUNTIME_IMPLEMENTED = false as const;
export const shmRuntimeImplemented = false as const;
export const THREE_D_VIEWER_IMPLEMENTED = false as const;
export const threeDViewerImplemented = false as const;
export const MAP_PRODUCT_IMPLEMENTED = false as const;
export const mapProductImplemented = false as const;
export const BIM_CAD_EXTRACTION_IMPLEMENTED = false as const;
export const bimCadExtractionImplemented = false as const;
export const AI_SPATIAL_AUTHORITY_ENABLED = false as const;
export const aiSpatialAuthorityEnabled = false as const;
export const AUTOMATIC_LOCATION_APPROVAL_ENABLED = false as const;
export const automaticLocationApprovalEnabled = false as const;

export const DUPLICATE_SPATIAL_OWNERSHIP_DETECTED = false as const;
export const duplicateSpatialOwnershipDetected = false as const;
export const DUPLICATE_GEOMETRY_OWNERSHIP_DETECTED = false as const;
export const duplicateGeometryOwnershipDetected = false as const;
export const DUPLICATE_CRS_OWNERSHIP_DETECTED = false as const;
export const duplicateCrsOwnershipDetected = false as const;
export const DUPLICATE_LOCATION_REGISTER_DETECTED = false as const;
export const duplicateLocationRegisterDetected = false as const;

/**
 * Dedicated engineering_locations table is not required: SpatialReference
 * registry (engineering_spatial_references) is the canonical register.
 * LocationReference remains a thin alias over SpatialReference.
 */
export const ENGINEERING_LOCATIONS_TABLE_EXISTS = false as const;
export const engineeringLocationsTableExists = false as const;
export const SHARED_SPATIAL_PRODUCT_TABLES_INTRODUCED = true as const;
export const sharedSpatialProductTablesIntroduced = true as const;
export const SHARED_SPATIAL_PRODUCT_UI_IMPLEMENTED = false as const;
export const sharedSpatialProductUiImplemented = false as const;

export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false as const;
export const productionMemoryRepositoryAllowed = false as const;
export const PRODUCTION_DIGITAL_TWIN_READY = false as const;
export const productionDigitalTwinReady = false as const;

/** Flag only — do not start Phase 12N. */
export const PHASE_12N_READY = true as const;
export const phase12NReady = true as const;
/** Retained from 12L pin path. */
export const PHASE_12M_READY = true as const;
export const phase12MReady = true as const;

export const PUBLIC_CONTRACT_VERSION = "0.2.0-spatial-core" as const;

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

/** Residual TEXT location columns — classified via LegacySpatialReconciliation. */
export const RESIDUAL_TEXT_LOCATION_FIELDS = [
  "engineering_assets.location",
  "engineering_projects.location",
  "engineering_projects.site_name",
] as const;

export const FUTURE_LOCATION_REGISTER = "engineering_spatial_references" as const;

/** Digital Twin 12K certified identity (must not bump). */
export const DIGITAL_TWIN_12K_VERSION = "0.11.0-digital-thread" as const;
export const DIGITAL_TWIN_12K_CERTIFIED_COMMIT =
  "dc5d1d6775b172634cd50038d34f35c13c34c339" as const;
export const DIGITAL_TWIN_12K_HOSTED_RUN = "31269156189" as const;

/** Phase 12L discovery pin. */
export const PHASE_12L_VERSION = "0.1.0-spatial-discovery" as const;
export const PHASE_12L_CERTIFIED_COMMIT =
  "7d9bfbd792a034bae088dbb1db02876ca400929d" as const;
export const PHASE_12L_HOSTED_RUN = "31269729941" as const;

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

export const SPATIAL_REFERENCE_REVIEW_SLUG =
  "engineering_shared_spatial_domain.spatial_reference_review" as const;

export function getSharedSpatialDomainCoreDeclaration() {
  return {
    name: ENGINEERING_SHARED_SPATIAL_DOMAIN_NAME,
    key: ENGINEERING_SHARED_SPATIAL_DOMAIN_KEY,
    version: ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION,
    status: ENGINEERING_SHARED_SPATIAL_DOMAIN_STATUS,
    phase: ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE,
    SharedSpatialDomainDiscoveryReady,
    SharedSpatialDomainOwnershipLocked,
    OwnershipLocked,
    SharedSpatialDomainRuntimeImplemented,
    SharedSpatialReferenceRegistryReady,
    SpatialReferenceGovernanceReady,
    CoordinateReferenceGovernanceReady,
    CoordinateReferenceSystemRegistryReady,
    LegacySpatialReconciliationReady,
    DigitalTwinSpatialBindingReady,
    spatialOwnershipFullyResolved,
    coordinateTransformationImplemented,
    gisRuntimeImplemented,
    spatialAnalyticsImplemented,
    geometryRepositoryImplemented,
    postgisImplemented,
    duplicateSpatialOwnershipDetected,
    duplicateGeometryOwnershipDetected,
    duplicateCrsOwnershipDetected,
    duplicateLocationRegisterDetected,
    engineeringLocationsTableExists,
    sharedSpatialProductTablesIntroduced,
    sharedSpatialProductUiImplemented,
    productionMemoryRepositoryAllowed,
    productionDigitalTwinReady,
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
    phase12NReady,
    phase12LVersion: PHASE_12L_VERSION,
    phase12LCertifiedCommit: PHASE_12L_CERTIFIED_COMMIT,
    phase12LHostedRun: PHASE_12L_HOSTED_RUN,
    digitalTwin12KVersion: DIGITAL_TWIN_12K_VERSION,
    digitalTwin12KCertifiedCommit: DIGITAL_TWIN_12K_CERTIFIED_COMMIT,
    digitalTwin12KHostedRun: DIGITAL_TWIN_12K_HOSTED_RUN,
    spatialReferenceReviewSlug: SPATIAL_REFERENCE_REVIEW_SLUG,
    hierarchy:
      "RTB AI Platform → Engineering OS → Engineering Shared Spatial Domain (canonical SpatialReference registry) → consuming modules (Digital Twin additive binding, II, AI, …)" as const,
  };
}

/** @deprecated Prefer getSharedSpatialDomainCoreDeclaration (12M). */
export function getSharedSpatialDomainDiscoveryDeclaration() {
  return getSharedSpatialDomainCoreDeclaration();
}
