/**
 * Phase 12L — Shared Spatial Domain ownership lock.
 *
 * SharedSpatialDomainOwnershipLocked = architecture decision locked.
 * spatialOwnershipFullyResolved = false until a later phase materializes
 * registers and retires residual TEXT location fields.
 */

import {
  CANONICAL_ASSET_IDENTITY_OWNERSHIP,
  CANONICAL_CRS_REFERENCE_OWNERSHIP,
  CANONICAL_LOCATION_REFERENCE_OWNERSHIP,
  CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
  CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
  COORDINATE_TRANSFORMATION_IMPLEMENTED,
  DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL,
  DUPLICATE_GEOMETRY_OWNERSHIP_DETECTED,
  DUPLICATE_SPATIAL_OWNERSHIP_DETECTED,
  ENGINEERING_LOCATIONS_TABLE_EXISTS,
  ENGINEERING_SHARED_SPATIAL_DOMAIN_KEY,
  ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION,
  ENGINEERING_TIME_SERIES_OWNERSHIP,
  GEOMETRY_BLOB_OWNERSHIP,
  GIS_RUNTIME_IMPLEMENTED,
  KNOWLEDGE_GRAPH_OWNERSHIP,
  PHASE_12M_READY,
  POSTGIS_IMPLEMENTED,
  PUBLIC_CONTRACT_VERSION,
  SENSOR_REGISTRY_IMPLEMENTED,
  SHARED_SPATIAL_DOMAIN_DISCOVERY_READY,
  SHARED_SPATIAL_DOMAIN_OWNERSHIP_LOCKED,
  SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED,
  SHARED_SPATIAL_PRODUCT_TABLES_INTRODUCED,
  SHARED_SPATIAL_PRODUCT_UI_IMPLEMENTED,
  SHM_RUNTIME_IMPLEMENTED,
  SPATIAL_ANALYTICS_IMPLEMENTED,
  SPATIAL_OWNERSHIP_FULLY_RESOLVED,
  THREE_D_VIEWER_IMPLEMENTED,
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
    notes: "Canonical SpatialReference / LocationReference / CRS ref semantics (decision locked; register deferred)",
  },
  {
    concern: "location_reference",
    owner: "engineering_os_shared_spatial_domain",
    relation: "owns",
    notes: "Future engineering_locations register; TEXT fields are residual until implementation",
  },
  {
    concern: "crs_reference_governance",
    owner: "engineering_os_shared_spatial_domain",
    relation: "owns",
    notes: "CRS identity and declaration rules; transforms reserved for later phase",
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
    notes: "Thin TwinSpatialReference wrappers only — consumes shared location/CRS refs",
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
    notes: "Asset identity remains shared domain; assets may carry residual TEXT location",
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
    notes: "II consumer vocabulary (AssetReferenceLocation) — not canonical owner",
  },
  {
    concern: "residual_text_location_fields",
    owner: "unresolved_residual_text",
    relation: "reserved",
    notes: "engineering_assets.location / engineering_projects.location TEXT — keeps FullyResolved=false",
  },
  {
    concern: "gis_runtime",
    owner: "engineering_os_shared_spatial_domain",
    relation: "forbidden",
    notes: "No GIS/PostGIS/runtime in discovery",
  },
  {
    concern: "coordinate_transformation_runtime",
    owner: "engineering_os_shared_spatial_domain",
    relation: "forbidden",
    notes: "Transforms declared only; not implemented",
  },
  {
    concern: "spatial_analytics",
    owner: "engineering_os_shared_spatial_domain",
    relation: "forbidden",
    notes: "No spatial analytics in discovery",
  },
  {
    concern: "sensor_registry",
    owner: "shm",
    relation: "must_never_own",
    notes: "Sensor registry / SHM out of scope for Shared Spatial Domain",
  },
] as const;

export function assertSharedSpatialDomainOwnershipLock(): {
  ok: true;
  SharedSpatialDomainDiscoveryReady: true;
  SharedSpatialDomainOwnershipLocked: true;
  SharedSpatialDomainRuntimeImplemented: false;
  spatialOwnershipFullyResolved: false;
  duplicateSpatialOwnershipDetected: false;
  duplicateGeometryOwnershipDetected: false;
  digitalTwinMayOwnCanonicalSpatial: false;
  publicContractVersion: typeof PUBLIC_CONTRACT_VERSION;
  phase12MReady: true;
  canonicalSpatialReferenceOwnership: typeof CANONICAL_SPATIAL_REFERENCE_OWNERSHIP;
} {
  if (ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION !== "0.1.0-spatial-discovery") {
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
  if (SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED) {
    throw new Error("shared_spatial_domain_runtime_forbidden_in_phase_12l");
  }
  if (SPATIAL_OWNERSHIP_FULLY_RESOLVED) {
    throw new Error(
      "spatial_ownership_must_remain_unresolved_until_register_and_text_retirement",
    );
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
    SENSOR_REGISTRY_IMPLEMENTED ||
    SHM_RUNTIME_IMPLEMENTED ||
    THREE_D_VIEWER_IMPLEMENTED
  ) {
    throw new Error("spatial_runtime_capabilities_forbidden_in_phase_12l");
  }
  if (DUPLICATE_SPATIAL_OWNERSHIP_DETECTED || DUPLICATE_GEOMETRY_OWNERSHIP_DETECTED) {
    throw new Error("duplicate_spatial_or_geometry_ownership");
  }
  if (ENGINEERING_LOCATIONS_TABLE_EXISTS || SHARED_SPATIAL_PRODUCT_TABLES_INTRODUCED) {
    throw new Error("shared_spatial_product_tables_forbidden_in_discovery");
  }
  if (SHARED_SPATIAL_PRODUCT_UI_IMPLEMENTED) {
    throw new Error("shared_spatial_product_ui_forbidden_in_discovery");
  }
  if (PUBLIC_CONTRACT_VERSION !== "0.1.0-draft") {
    throw new Error("public_contracts_must_be_draft_in_phase_12l");
  }
  if (!PHASE_12M_READY) {
    throw new Error("phase_12m_ready_flag_required");
  }

  const twinOwnsCanonical = SHARED_SPATIAL_DOMAIN_OWNERSHIP_MATRIX.some(
    (row) =>
      row.concern === "canonical_spatial_location" && row.owner === "digital_twin",
  );
  if (twinOwnsCanonical) {
    throw new Error("digital_twin_may_not_own_canonical_spatial_location");
  }

  return {
    ok: true,
    SharedSpatialDomainDiscoveryReady: true,
    SharedSpatialDomainOwnershipLocked: true,
    SharedSpatialDomainRuntimeImplemented: false,
    spatialOwnershipFullyResolved: false,
    duplicateSpatialOwnershipDetected: false,
    duplicateGeometryOwnershipDetected: false,
    digitalTwinMayOwnCanonicalSpatial: false,
    publicContractVersion: PUBLIC_CONTRACT_VERSION,
    phase12MReady: true,
    canonicalSpatialReferenceOwnership: CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
  };
}
