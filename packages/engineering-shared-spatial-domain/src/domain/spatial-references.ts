/**
 * Phase 12M — Canonical spatial reference domain types.
 *
 * Declared relationships ≠ geometric proof.
 * No geometry intersection/containment computation.
 * Legacy TEXT must NOT silently become canonical — reconciliation states only.
 * Incompatible CRS → incompatible_crs abstain (fail-closed).
 */

import {
  CANONICAL_CRS_REFERENCE_OWNERSHIP,
  CANONICAL_LOCATION_REFERENCE_OWNERSHIP,
  CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
} from "../version";

export type SharedSpatialDomainOwner = typeof CANONICAL_SPATIAL_REFERENCE_OWNERSHIP;

export const SPATIAL_REFERENCE_TYPES = [
  "site",
  "facility",
  "structure",
  "zone",
  "level",
  "space",
  "asset_placement",
  "project_site",
  "linear_segment",
  "grid_point",
  "model_anchor",
  "external_place",
  "unknown",
] as const;

export type SpatialReferenceType = (typeof SPATIAL_REFERENCE_TYPES)[number];

export const SPATIAL_REFERENCE_STATUSES = [
  "draft",
  "in_review",
  "approved",
  "published",
  "superseded",
] as const;

export type SpatialReferenceStatus = (typeof SPATIAL_REFERENCE_STATUSES)[number];

export const CRS_KINDS = [
  "epsg",
  "project_grid",
  "bim_model",
  "external",
] as const;

export type CoordinateReferenceSystemKind = (typeof CRS_KINDS)[number];

export const SPATIAL_RELATIONSHIP_KINDS = [
  "located_at",
  "contained_by",
  "contains",
  "adjacent_to",
  "intersects",
  "crosses",
  "aligned_with",
  "positioned_on",
  "mapped_to",
  "references",
  "unknown",
] as const;

export type SpatialRelationshipKind = (typeof SPATIAL_RELATIONSHIP_KINDS)[number];

export const LEGACY_RECONCILIATION_STATES = [
  "unmapped",
  "candidate_match",
  "confirmed",
  "conflicting",
  "legacy_only",
  "unknown",
] as const;

export type LegacySpatialReconciliationState =
  (typeof LEGACY_RECONCILIATION_STATES)[number];

export const REVIEW_DECISIONS = [
  "approve",
  "reject",
  "request_changes",
  "abstain",
] as const;

export type SpatialReferenceReviewDecision = (typeof REVIEW_DECISIONS)[number];

export type SharedSpatialReferenceBase = {
  tenantId: string;
  workspaceId: string;
  owner: SharedSpatialDomainOwner;
};

/**
 * Canonical SpatialReference — registry identity for spatial REFERENCE semantics.
 * Hierarchy parent is organizational only — does NOT imply geometric containment.
 */
export type SpatialReference = SharedSpatialReferenceBase & {
  kind: "spatial_reference";
  id: string;
  /** Alias of id for consumers expecting spatialRefId. */
  spatialRefId: string;
  code?: string;
  name?: string;
  referenceType: SpatialReferenceType;
  /** Hierarchy parent — organizational; no geometry implication. */
  parentSpatialReferenceId?: string;
  crsId?: string;
  status: SpatialReferenceStatus;
  version: number;
  supersededById?: string;
  alignmentReference?: string;
  chainage?: string;
  station?: string;
  offset?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  /** Hierarchy never implies geometric containment/intersection. */
  hierarchyImpliesGeometry: false;
};

/**
 * LocationReference — thin alias/wrapper over SpatialReference.
 * Does not invent a separate location registry table.
 */
export type LocationReference = SharedSpatialReferenceBase & {
  kind: "location_reference";
  locationId: string;
  spatialReferenceId: string;
  code?: string;
  name?: string;
  crsId?: string;
  legacyTextLocation?: string;
  resolvedAt: string;
};

/**
 * CoordinateReferenceSystemReference — EPSG / project grid / BIM-model / external.
 * Identity + metadata only; no transform engine.
 */
export type CoordinateReferenceSystemReference = SharedSpatialReferenceBase & {
  kind: "crs_reference";
  crsId: string;
  crsKind: CoordinateReferenceSystemKind;
  /** e.g. "EPSG:4326" — string identity. */
  coordinateReferenceSystem: string;
  authority?: string;
  epsgCode?: number;
  metadata?: Record<string, unknown>;
  description?: string;
  status: SpatialReferenceStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  transformImplemented: false;
};

/**
 * CoordinateReference — x/y/z or lat/lon/elev WITH CRS.
 * Components are optional scalars (jsonb/text in persistence) — not geometry blobs.
 */
export type CoordinateReference = SharedSpatialReferenceBase & {
  kind: "coordinate_reference";
  coordinateReferenceId: string;
  spatialReferenceId?: string;
  crsId: string;
  x?: number;
  y?: number;
  z?: number;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  createdAt: string;
  updatedAt: string;
  storesGeometryBlob: false;
};

/**
 * Declared spatial relationship — semantic only.
 * Declared relationship ≠ geometric proof. No intersection/containment computation.
 */
export type SpatialRelationshipReference = SharedSpatialReferenceBase & {
  kind: "spatial_relationship";
  relationshipId: string;
  fromSpatialReferenceId: string;
  toSpatialReferenceId: string;
  relationshipKind: SpatialRelationshipKind;
  /** Explicit: declaration is not geometric proof. */
  geometricProof: false;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Legacy TEXT reconciliation — candidate ≠ canonical.
 * Never silently promotes legacy TEXT to canonical SpatialReference.
 */
export type LegacySpatialReconciliation = SharedSpatialReferenceBase & {
  kind: "legacy_spatial_reconciliation";
  reconciliationId: string;
  sourceTable: string;
  sourceColumn: string;
  sourceRecordId: string;
  legacyText: string;
  state: LegacySpatialReconciliationState;
  /** Candidate match only — never auto-canonical. */
  candidateSpatialReferenceId?: string;
  confirmedSpatialReferenceId?: string;
  isCanonical: false;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SpatialReferenceReview = SharedSpatialReferenceBase & {
  kind: "spatial_reference_review";
  reviewId: string;
  spatialReferenceId: string;
  decision: SpatialReferenceReviewDecision;
  reviewerId?: string;
  rationale?: string;
  /** AI may never self-approve. */
  aiSelfApproval: false;
  createdAt: string;
};

export type CoordinateCompatibilityResult =
  | { ok: true; compatible: true }
  | { ok: false; compatible: false; code: "incompatible_crs"; message: string };

/**
 * Fail-closed CRS compatibility check. Different CRS ids → abstain.
 * Does NOT transform coordinates.
 */
export function assertCoordinateCrsCompatible(input: {
  leftCrsId: string;
  rightCrsId: string;
}): CoordinateCompatibilityResult {
  const left = input.leftCrsId?.trim();
  const right = input.rightCrsId?.trim();
  if (!left || !right) {
    return {
      ok: false,
      compatible: false,
      code: "incompatible_crs",
      message: "crs_id_required_on_both_sides",
    };
  }
  if (left !== right) {
    return {
      ok: false,
      compatible: false,
      code: "incompatible_crs",
      message: `crs_mismatch:${left}!=${right}`,
    };
  }
  return { ok: true, compatible: true };
}

export function assertHierarchyDoesNotImplyGeometry(
  reference: SpatialReference,
): void {
  if (reference.hierarchyImpliesGeometry !== false) {
    throw new Error("hierarchy_must_not_imply_geometry");
  }
}

export function assertLegacyNotAutoCanonical(
  reconciliation: LegacySpatialReconciliation,
): void {
  if (reconciliation.isCanonical !== false) {
    throw new Error("legacy_must_not_be_auto_canonical");
  }
  if (
    reconciliation.state === "candidate_match" &&
    reconciliation.confirmedSpatialReferenceId
  ) {
    throw new Error("candidate_match_must_not_confirm_canonical");
  }
}

export function createSpatialReference(input: {
  id: string;
  tenantId: string;
  workspaceId: string;
  referenceType: SpatialReferenceType;
  code?: string;
  name?: string;
  parentSpatialReferenceId?: string;
  crsId?: string;
  status?: SpatialReferenceStatus;
  version?: number;
  alignmentReference?: string;
  chainage?: string;
  station?: string;
  offset?: string;
  notes?: string;
}): SpatialReference {
  const now = new Date().toISOString();
  return {
    kind: "spatial_reference",
    owner: CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
    id: input.id,
    spatialRefId: input.id,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    code: input.code,
    name: input.name,
    referenceType: input.referenceType,
    parentSpatialReferenceId: input.parentSpatialReferenceId,
    crsId: input.crsId,
    status: input.status ?? "draft",
    version: input.version ?? 1,
    alignmentReference: input.alignmentReference,
    chainage: input.chainage,
    station: input.station,
    offset: input.offset,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    hierarchyImpliesGeometry: false,
  };
}

export function createLocationReferenceFromSpatial(
  spatial: SpatialReference,
  legacyTextLocation?: string,
): LocationReference {
  return {
    kind: "location_reference",
    owner: CANONICAL_LOCATION_REFERENCE_OWNERSHIP,
    tenantId: spatial.tenantId,
    workspaceId: spatial.workspaceId,
    locationId: spatial.id,
    spatialReferenceId: spatial.id,
    code: spatial.code,
    name: spatial.name,
    crsId: spatial.crsId,
    legacyTextLocation,
    resolvedAt: new Date().toISOString(),
  };
}

export function createCrsReference(input: {
  crsId: string;
  tenantId: string;
  workspaceId: string;
  crsKind: CoordinateReferenceSystemKind;
  coordinateReferenceSystem: string;
  authority?: string;
  epsgCode?: number;
  metadata?: Record<string, unknown>;
  description?: string;
  status?: SpatialReferenceStatus;
  version?: number;
}): CoordinateReferenceSystemReference {
  if (!input.coordinateReferenceSystem?.trim()) {
    throw new Error("coordinate_reference_system_required");
  }
  const now = new Date().toISOString();
  return {
    kind: "crs_reference",
    owner: CANONICAL_CRS_REFERENCE_OWNERSHIP,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    crsId: input.crsId,
    crsKind: input.crsKind,
    coordinateReferenceSystem: input.coordinateReferenceSystem,
    authority: input.authority,
    epsgCode: input.epsgCode,
    metadata: input.metadata,
    description: input.description,
    status: input.status ?? "draft",
    version: input.version ?? 1,
    createdAt: now,
    updatedAt: now,
    transformImplemented: false,
  };
}

export function createCoordinateReference(input: {
  coordinateReferenceId: string;
  tenantId: string;
  workspaceId: string;
  crsId: string;
  spatialReferenceId?: string;
  x?: number;
  y?: number;
  z?: number;
  latitude?: number;
  longitude?: number;
  elevation?: number;
}): CoordinateReference {
  if (!input.crsId?.trim()) {
    throw new Error("crs_id_required");
  }
  const now = new Date().toISOString();
  return {
    kind: "coordinate_reference",
    owner: CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    coordinateReferenceId: input.coordinateReferenceId,
    spatialReferenceId: input.spatialReferenceId,
    crsId: input.crsId,
    x: input.x,
    y: input.y,
    z: input.z,
    latitude: input.latitude,
    longitude: input.longitude,
    elevation: input.elevation,
    createdAt: now,
    updatedAt: now,
    storesGeometryBlob: false,
  };
}

export function createSpatialRelationship(input: {
  relationshipId: string;
  tenantId: string;
  workspaceId: string;
  fromSpatialReferenceId: string;
  toSpatialReferenceId: string;
  relationshipKind: SpatialRelationshipKind;
  notes?: string;
}): SpatialRelationshipReference {
  const now = new Date().toISOString();
  return {
    kind: "spatial_relationship",
    owner: CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    relationshipId: input.relationshipId,
    fromSpatialReferenceId: input.fromSpatialReferenceId,
    toSpatialReferenceId: input.toSpatialReferenceId,
    relationshipKind: input.relationshipKind,
    geometricProof: false,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
}

export function createLegacySpatialReconciliation(input: {
  reconciliationId: string;
  tenantId: string;
  workspaceId: string;
  sourceTable: string;
  sourceColumn: string;
  sourceRecordId: string;
  legacyText: string;
  state?: LegacySpatialReconciliationState;
  candidateSpatialReferenceId?: string;
  notes?: string;
}): LegacySpatialReconciliation {
  const state = input.state ?? "unmapped";
  if (state === "confirmed") {
    throw new Error("use_confirmLegacyMapping_for_confirmed_state");
  }
  const now = new Date().toISOString();
  return {
    kind: "legacy_spatial_reconciliation",
    owner: CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    reconciliationId: input.reconciliationId,
    sourceTable: input.sourceTable,
    sourceColumn: input.sourceColumn,
    sourceRecordId: input.sourceRecordId,
    legacyText: input.legacyText,
    state,
    candidateSpatialReferenceId: input.candidateSpatialReferenceId,
    isCanonical: false,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
}

export function confirmLegacyMapping(
  reconciliation: LegacySpatialReconciliation,
  confirmedSpatialReferenceId: string,
): LegacySpatialReconciliation {
  if (!confirmedSpatialReferenceId?.trim()) {
    throw new Error("confirmed_spatial_reference_id_required");
  }
  if (reconciliation.state === "candidate_match" && !reconciliation.candidateSpatialReferenceId) {
    throw new Error("candidate_required_before_confirm");
  }
  return {
    ...reconciliation,
    state: "confirmed",
    confirmedSpatialReferenceId,
    isCanonical: false,
    updatedAt: new Date().toISOString(),
  };
}

export function createSpatialReferenceReview(input: {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  spatialReferenceId: string;
  decision: SpatialReferenceReviewDecision;
  reviewerId?: string;
  rationale?: string;
  aiSelfApproval?: boolean;
}): SpatialReferenceReview {
  if (input.aiSelfApproval === true) {
    throw new Error("ai_self_approval_forbidden");
  }
  return {
    kind: "spatial_reference_review",
    owner: CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    reviewId: input.reviewId,
    spatialReferenceId: input.spatialReferenceId,
    decision: input.decision,
    reviewerId: input.reviewerId,
    rationale: input.rationale,
    aiSelfApproval: false,
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Draft factories retained for 12L compatibility (map onto core types)
// ---------------------------------------------------------------------------

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
    tenantId: input.tenantId,
    workspaceId: input.workspaceId ?? "",
    locationId: input.locationId,
    spatialReferenceId: input.locationId,
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
  return createSpatialReference({
    id: input.spatialRefId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId ?? "",
    referenceType: "unknown",
    notes: input.unitSystem
      ? `crs=${input.coordinateReferenceSystem};unit=${input.unitSystem}`
      : `crs=${input.coordinateReferenceSystem}`,
  });
}

export function createDraftCrsReference(input: {
  tenantId: string;
  workspaceId?: string;
  crsRefId: string;
  coordinateReferenceSystem: string;
  authority?: string;
  epsgCode?: number;
}): CoordinateReferenceSystemReference {
  return createCrsReference({
    crsId: input.crsRefId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId ?? "",
    crsKind: input.epsgCode != null ? "epsg" : "external",
    coordinateReferenceSystem: input.coordinateReferenceSystem,
    authority: input.authority,
    epsgCode: input.epsgCode,
  });
}

export function assertDraftSpatialReferenceReadOnly(reference: {
  owner: string;
}): void {
  if (reference.owner !== CANONICAL_SPATIAL_REFERENCE_OWNERSHIP) {
    throw new Error("spatial_reference_owner_mismatch");
  }
}

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
