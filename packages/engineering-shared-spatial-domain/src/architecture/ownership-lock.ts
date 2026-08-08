/**
 * Phase 12M — Shared Spatial Domain ownership lock.
 *
 * SharedSpatialDomainOwnershipLocked = architecture decision locked.
 * spatialOwnershipFullyResolved = true when registry + ownership + DT consume
 * + legacy classified + geometry external + CRS ops are proven.
 */

import {
  CANONICAL_ASSET_IDENTITY_OWNERSHIP,
  CANONICAL_CRS_REFERENCE_OWNERSHIP,
  CANONICAL_LOCATION_REFERENCE_OWNERSHIP,
  CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
  CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
  COORDINATE_REFERENCE_GOVERNANCE_READY,
  COORDINATE_REFERENCE_SYSTEM_REGISTRY_READY,
  COORDINATE_TRANSFORMATION_IMPLEMENTED,
  DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL,
  DIGITAL_TWIN_SPATIAL_BINDING_READY,
  DUPLICATE_CRS_OWNERSHIP_DETECTED,
  DUPLICATE_GEOMETRY_OWNERSHIP_DETECTED,
  DUPLICATE_LOCATION_REGISTER_DETECTED,
  DUPLICATE_SPATIAL_OWNERSHIP_DETECTED,
  ENGINEERING_SHARED_SPATIAL_DOMAIN_KEY,
  ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION,
  ENGINEERING_TIME_SERIES_OWNERSHIP,
  GEOMETRY_BLOB_OWNERSHIP,
  GEOMETRY_REPOSITORY_IMPLEMENTED,
  GIS_RUNTIME_IMPLEMENTED,
  KNOWLEDGE_GRAPH_OWNERSHIP,
  LEGACY_SPATIAL_RECONCILIATION_READY,
  PHASE_12N_READY,
  POSTGIS_IMPLEMENTED,
  PRODUCTION_DIGITAL_TWIN_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PUBLIC_CONTRACT_VERSION,
  SHARED_SPATIAL_DOMAIN_DISCOVERY_READY,
  SHARED_SPATIAL_DOMAIN_OWNERSHIP_LOCKED,
  SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED,
  SHARED_SPATIAL_PRODUCT_UI_IMPLEMENTED,
  SHARED_SPATIAL_REFERENCE_REGISTRY_READY,
  SPATIAL_ANALYTICS_IMPLEMENTED,
  SPATIAL_OWNERSHIP_FULLY_RESOLVED,
  SPATIAL_REFERENCE_GOVERNANCE_READY,
  TWIN_SPATIAL_REFERENCE_OWNERSHIP,
} from "../version";

export type SpatialDomainOwner =
  | "engineering_os_shared_spatial_domain"
  | "engineering_os_shared_domain"
  | "engineering_os_shared_project_domain"
  | "digital_twin"
  | "asset_intelligence"
  | "inspection_intelligence"
  | "project_intelligence"
  | "project_controls"
  | "platform_kernel_knowledge_graph"
  | "platform_kernel_telemetry"
  | "shm"
  | "external_or_existing_engineering_model_owner"
  | "external_system"
  | "unresolved_residual_text";

export type SpatialBoundaryRelation =
  | "owns"
  | "consumes"
  | "references"
  | "reserved"
  | "must_never_own"
  | "forbidden";

export type SpatialOwnershipRow = {
  concern: string;
  owner: SpatialDomainOwner;
  relation: SpatialBoundaryRelation;
  notes: string;
};

export const SHARED_SPATIAL_DOMAIN_OWNERSHIP_MATRIX: readonly SpatialOwnershipRow[] = [
  {
    concern: "spatial_reference_semantics",
    owner: "engineering_os_shared_spatial_domain",
    relation: "owns",
    notes: "Canonical SpatialReference registry (engineering_spatial_references)",
  },
  {
    concern: "location_reference",
    owner: "engineering_os_shared_spatial_domain",
    relation: "owns",
    notes: "LocationReference is thin alias over SpatialReference",
  },
  {
    concern: "crs_reference_governance",
    owner: "engineering_os_shared_spatial_domain",
    relation: "owns",
    notes: "CRS identity registry; transforms remain forbidden",
  },
  {
    concern: "geometry_blobs",
    owner: "external_or_existing_engineering_model_owner",
    relation: "must_never_own",
    notes: "BIM/GIS/files remain external; Shared Spatial Domain owns refs only",
  },
  {
    concern: "twin_spatial_reference",
    owner: "digital_twin",
    relation: "owns",
    notes: "Thin TwinSpatialReference wrappers — consume SpatialReference.id",
  },
  {
    concern: "canonical_spatial_location",
    owner: "engineering_os_shared_spatial_domain",
    relation: "owns",
    notes: "Digital Twin MUST_NEVER_OWN canonical location registry",
  },
  {
    concern: "asset_identity",
    owner: "engineering_os_shared_domain",
    relation: "references",
    notes: "Asset identity remains shared domain; residual TEXT classified",
  },
  {
    concern: "project_identity",
    owner: "engineering_os_shared_project_domain",
    relation: "references",
    notes: "Project identity remains shared project domain",
  },
  {
    concern: "engineering_time_series",
    owner: "asset_intelligence",
    relation: "must_never_own",
    notes: "Time series stays Asset Intelligence",
  },
  {
    concern: "knowledge_graph",
    owner: "platform_kernel_knowledge_graph",
    relation: "references",
    notes: "KG shared; not a spatial authority",
  },
  {
    concern: "inspection_spatial_vocabulary",
    owner: "inspection_intelligence",
    relation: "consumes",
    notes: "II consumer vocabulary — not canonical owner",
  },
  {
    concern: "residual_text_location_fields",
    owner: "unresolved_residual_text",
    relation: "reserved",
    notes: "TEXT fields classified via LegacySpatialReconciliation; not auto-canonical",
  },
  {
    concern: "gis_runtime",
    owner: "engineering_os_shared_spatial_domain",
    relation: "forbidden",
    notes: "No GIS/PostGIS product runtime",
  },
  {
    concern: "coordinate_transformation_runtime",
    owner: "engineering_os_shared_spatial_domain",
    relation: "forbidden",
    notes: "Transforms not implemented; incompatible CRS abstains",
  },
  {
    concern: "spatial_analytics",
    owner: "engineering_os_shared_spatial_domain",
    relation: "forbidden",
    notes: "No spatial analytics; declared relationships ≠ geometric proof",
  },
  {
    concern: "sensor_registry",
    owner: "shm",
    relation: "must_never_own",
    notes: "Sensor registry / SHM out of scope",
  },
] as const;

function assertFullyResolvedConditions(): void {
  const conditions = {
    registry: SHARED_SPATIAL_REFERENCE_REGISTRY_READY,
    ownership: SHARED_SPATIAL_DOMAIN_OWNERSHIP_LOCKED,
    runtime: SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED,
    governance: SPATIAL_REFERENCE_GOVERNANCE_READY,
    crsGovernance: COORDINATE_REFERENCE_GOVERNANCE_READY,
    crsRegistry: COORDINATE_REFERENCE_SYSTEM_REGISTRY_READY,
    legacy: LEGACY_SPATIAL_RECONCILIATION_READY,
    dtBinding: DIGITAL_TWIN_SPATIAL_BINDING_READY,
    geometryExternal:
      GEOMETRY_BLOB_OWNERSHIP === "external_or_existing_engineering_model_owner" &&
      !GEOMETRY_REPOSITORY_IMPLEMENTED,
    noTransforms: !COORDINATE_TRANSFORMATION_IMPLEMENTED && !GIS_RUNTIME_IMPLEMENTED,
    noDuplicate:
      !DUPLICATE_SPATIAL_OWNERSHIP_DETECTED &&
      !DUPLICATE_GEOMETRY_OWNERSHIP_DETECTED &&
      !DUPLICATE_CRS_OWNERSHIP_DETECTED &&
      !DUPLICATE_LOCATION_REGISTER_DETECTED,
    dtMayNotOwn: !DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL,
  };
  const failed = Object.entries(conditions)
    .filter(([, ok]) => !ok)
    .map(([name]) => name);
  if (failed.length > 0) {
    throw new Error(`spatial_ownership_fully_resolved_conditions_ unmet:${failed.join(",")}`);
  }
  if (!SPATIAL_OWNERSHIP_FULLY_RESOLVED) {
    throw new Error("spatial_ownership_fully_resolved_must_be_true_when_conditions_met");
  }
}

export function assertSharedSpatialDomainOwnershipLock(): {
  ok: true;
  SharedSpatialDomainDiscoveryReady: true;
  SharedSpatialDomainOwnershipLocked: true;
  SharedSpatialDomainRuntimeImplemented: true;
  SharedSpatialReferenceRegistryReady: true;
  SpatialReferenceGovernanceReady: true;
  CoordinateReferenceGovernanceReady: true;
  CoordinateReferenceSystemRegistryReady: true;
  LegacySpatialReconciliationReady: true;
  DigitalTwinSpatialBindingReady: true;
  spatialOwnershipFullyResolved: true;
  duplicateSpatialOwnershipDetected: false;
  duplicateGeometryOwnershipDetected: false;
  digitalTwinMayOwnCanonicalSpatial: false;
  coordinateTransformationImplemented: false;
  gisRuntimeImplemented: false;
  geometryRepositoryImplemented: false;
  publicContractVersion: typeof PUBLIC_CONTRACT_VERSION;
  phase12NReady: true;
  canonicalSpatialReferenceOwnership: typeof CANONICAL_SPATIAL_REFERENCE_OWNERSHIP;
} {
  if (ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION !== "0.2.0-spatial-core") {
    throw new Error("shared_spatial_domain_version_mismatch");
  }
  if (ENGINEERING_SHARED_SPATIAL_DOMAIN_KEY !== "engineering_os_shared_spatial_domain") {
    throw new Error("shared_spatial_domain_key_mismatch");
  }
  if (!SHARED_SPATIAL_DOMAIN_DISCOVERY_READY) {
    throw new Error("shared_spatial_domain_discovery_not_ready");
  }
  if (!SHARED_SPATIAL_DOMAIN_OWNERSHIP_LOCKED) {
    throw new Error("shared_spatial_domain_ownership_must_be_locked");
  }
  if (!SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED) {
    throw new Error("shared_spatial_domain_runtime_required_in_phase_12m");
  }
  if (
    CANONICAL_SPATIAL_REFERENCE_OWNERSHIP !== "engineering_os_shared_spatial_domain" ||
    CANONICAL_LOCATION_REFERENCE_OWNERSHIP !== "engineering_os_shared_spatial_domain" ||
    CANONICAL_CRS_REFERENCE_OWNERSHIP !== "engineering_os_shared_spatial_domain"
  ) {
    throw new Error("canonical_spatial_refs_must_be_shared_spatial_domain");
  }
  if (GEOMETRY_BLOB_OWNERSHIP !== "external_or_existing_engineering_model_owner") {
    throw new Error("geometry_blobs_must_remain_external");
  }
  if (TWIN_SPATIAL_REFERENCE_OWNERSHIP !== "digital_twin") {
    throw new Error("twin_spatial_reference_owner_mismatch");
  }
  if (DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL) {
    throw new Error("digital_twin_must_not_own_canonical_spatial");
  }
  if (CANONICAL_ASSET_IDENTITY_OWNERSHIP !== "engineering_os_shared_domain") {
    throw new Error("asset_identity_must_remain_shared_domain");
  }
  if (CANONICAL_PROJECT_IDENTITY_OWNERSHIP !== "engineering_os_shared_project_domain") {
    throw new Error("project_identity_must_remain_shared_project_domain");
  }
  if (ENGINEERING_TIME_SERIES_OWNERSHIP !== "asset_intelligence") {
    throw new Error("time_series_must_remain_asset_intelligence");
  }
  if (KNOWLEDGE_GRAPH_OWNERSHIP !== "platform_kernel_knowledge_graph") {
    throw new Error("knowledge_graph_must_remain_platform_kernel");
  }
  if (
    COORDINATE_TRANSFORMATION_IMPLEMENTED ||
    GIS_RUNTIME_IMPLEMENTED ||
    SPATIAL_ANALYTICS_IMPLEMENTED ||
    POSTGIS_IMPLEMENTED ||
    GEOMETRY_REPOSITORY_IMPLEMENTED
  ) {
    throw new Error("forbidden_spatial_capabilities_enabled");
  }
  if (
    DUPLICATE_SPATIAL_OWNERSHIP_DETECTED ||
    DUPLICATE_GEOMETRY_OWNERSHIP_DETECTED ||
    DUPLICATE_CRS_OWNERSHIP_DETECTED ||
    DUPLICATE_LOCATION_REGISTER_DETECTED
  ) {
    throw new Error("duplicate_spatial_or_geometry_ownership");
  }
  if (SHARED_SPATIAL_PRODUCT_UI_IMPLEMENTED) {
    throw new Error("shared_spatial_product_ui_forbidden");
  }
  if (PRODUCTION_MEMORY_REPOSITORY_ALLOWED) {
    throw new Error("production_memory_repository_forbidden");
  }
  if (PRODUCTION_DIGITAL_TWIN_READY) {
    throw new Error("production_digital_twin_must_remain_false");
  }
  if (PUBLIC_CONTRACT_VERSION !== "0.2.0-spatial-core") {
    throw new Error("public_contracts_must_be_spatial_core_prerelease");
  }
  if (!PHASE_12N_READY) {
    throw new Error("phase_12n_ready_flag_required");
  }

  const twinOwnsCanonical = SHARED_SPATIAL_DOMAIN_OWNERSHIP_MATRIX.some(
    (row) =>
      row.concern === "canonical_spatial_location" && row.owner === "digital_twin",
  );
  if (twinOwnsCanonical) {
    throw new Error("digital_twin_may_not_own_canonical_spatial_location");
  }

  assertFullyResolvedConditions();

  return {
    ok: true,
    SharedSpatialDomainDiscoveryReady: true,
    SharedSpatialDomainOwnershipLocked: true,
    SharedSpatialDomainRuntimeImplemented: true,
    SharedSpatialReferenceRegistryReady: true,
    SpatialReferenceGovernanceReady: true,
    CoordinateReferenceGovernanceReady: true,
    CoordinateReferenceSystemRegistryReady: true,
    LegacySpatialReconciliationReady: true,
    DigitalTwinSpatialBindingReady: true,
    spatialOwnershipFullyResolved: true,
    duplicateSpatialOwnershipDetected: false,
    duplicateGeometryOwnershipDetected: false,
    digitalTwinMayOwnCanonicalSpatial: false,
    coordinateTransformationImplemented: false,
    gisRuntimeImplemented: false,
    geometryRepositoryImplemented: false,
    publicContractVersion: PUBLIC_CONTRACT_VERSION,
    phase12NReady: true,
    canonicalSpatialReferenceOwnership: CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
  };
}
