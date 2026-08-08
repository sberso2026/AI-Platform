/**
 * Phase 12L — Draft spatial reference types (0.1.0-draft).
 *
 * DRAFT ONLY. No persistence, no resolution runtime, no transforms.
 * Future registers (e.g. engineering_locations) are reserved, not created.
 */

import {
  CANONICAL_CRS_REFERENCE_OWNERSHIP,
  CANONICAL_LOCATION_REFERENCE_OWNERSHIP,
  CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
} from "../version";

export type SharedSpatialDomainOwner = typeof CANONICAL_SPATIAL_REFERENCE_OWNERSHIP;

export type SharedSpatialReferenceBase = {
  tenantId: string;
  workspaceId?: string;
  owner: SharedSpatialDomainOwner;
  /** Draft projections are read-only by contract. */
  readonly mutable: false;
};

/**
 * Draft CRS reference identity. Authority/code are declarative; no EPSG
 * database or transform engine ships in discovery.
 */
export type CoordinateReferenceSystemReference = SharedSpatialReferenceBase & {
  kind: "crs_reference";
  crsRefId: string;
  /** e.g. "EPSG:4326" — string identity only. */
  coordinateReferenceSystem: string;
  authority?: string;
  epsgCode?: number;
  description?: string;
  resolvedAt: string;
};

/**
 * Draft LocationReference — designated FUTURE owner of location identity.
 * No engineering_locations table exists yet; residual TEXT fields remain.
 */
export type LocationReference = SharedSpatialReferenceBase & {
  kind: "location_reference";
  locationId: string;
  code?: string;
  name?: string;
  parentLocationId?: string;
  projectId?: string;
  assetId?: string;
  siteId?: string;
  crsRefId?: string;
  /** Residual free-text bridge until register exists. */
  legacyTextLocation?: string;
  resolvedAt: string;
};

/**
 * Draft SpatialReference — composed pointer (location + CRS + optional local frame).
 * Digital Twin TwinSpatialReference remains a thin consumer wrapper.
 */
export type SpatialReference = SharedSpatialReferenceBase & {
  kind: "spatial_reference";
  spatialRefId: string;
  locationId?: string;
  crsRefId?: string;
  coordinateReferenceSystem: string;
  unitSystem?: string;
  localFrameId?: string;
  zoneRef?: string;
  levelRef?: string;
  notes?: string;
  resolvedAt: string;
};

/**
 * Declared (not executed) coordinate transformation provenance.
 * coordinateTransformationImplemented remains false.
 */
export type CoordinateTransformationDeclarationDraft = {
  kind: "coordinate_transformation_declaration";
  sourceCRS: string;
  targetCRS: string;
  transformationMethod: string;
  methodVersion: string;
  provenance: string;
  implemented: false;
};

export type LinearReferenceDraft = SharedSpatialReferenceBase & {
  kind: "linear_reference";
  linearRefId: string;
  routeId?: string;
  chainage?: string;
  station?: string;
  offset?: string;
  /** Reserved — no linear referencing runtime in 12L. */
  reserved: true;
  resolvedAt: string;
};

export type SharedSpatialDomainDraftReference =
  | CoordinateReferenceSystemReference
  | LocationReference
  | SpatialReference
  | LinearReferenceDraft;

export const SHARED_SPATIAL_DRAFT_REFERENCE_KINDS = [
  "crs_reference",
  "location_reference",
  "spatial_reference",
  "linear_reference",
] as const;

export function assertDraftSpatialReferenceReadOnly(
  reference: SharedSpatialDomainDraftReference,
): void {
  if (reference.owner !== CANONICAL_SPATIAL_REFERENCE_OWNERSHIP) {
    throw new Error("spatial_reference_owner_mismatch");
  }
  if (reference.mutable !== false) {
    throw new Error("spatial_reference_must_be_read_only");
  }
}

export function createDraftLocationReference(input: {
  tenantId: string;
  workspaceId?: string;
  locationId: string;
  code?: string;
  name?: string;
  legacyTextLocation?: string;
}): LocationReference {
  return {
    kind: "location_reference",
    owner: CANONICAL_LOCATION_REFERENCE_OWNERSHIP,
    mutable: false,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    locationId: input.locationId,
    code: input.code,
    name: input.name,
    legacyTextLocation: input.legacyTextLocation,
    resolvedAt: new Date().toISOString(),
  };
}

export function createDraftSpatialReference(input: {
  tenantId: string;
  workspaceId?: string;
  spatialRefId: string;
  coordinateReferenceSystem: string;
  locationId?: string;
  unitSystem?: string;
}): SpatialReference {
  if (!input.coordinateReferenceSystem?.trim()) {
    throw new Error("coordinate_reference_system_required");
  }
  return {
    kind: "spatial_reference",
    owner: CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
    mutable: false,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    spatialRefId: input.spatialRefId,
    locationId: input.locationId,
    coordinateReferenceSystem: input.coordinateReferenceSystem,
    unitSystem: input.unitSystem,
    resolvedAt: new Date().toISOString(),
  };
}

export function createDraftCrsReference(input: {
  tenantId: string;
  workspaceId?: string;
  crsRefId: string;
  coordinateReferenceSystem: string;
  authority?: string;
  epsgCode?: number;
}): CoordinateReferenceSystemReference {
  if (!input.coordinateReferenceSystem?.trim()) {
    throw new Error("coordinate_reference_system_required");
  }
  return {
    kind: "crs_reference",
    owner: CANONICAL_CRS_REFERENCE_OWNERSHIP,
    mutable: false,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    crsRefId: input.crsRefId,
    coordinateReferenceSystem: input.coordinateReferenceSystem,
    authority: input.authority,
    epsgCode: input.epsgCode,
    resolvedAt: new Date().toISOString(),
  };
}
