/**
 * Phase 12F/12M — TwinSpatialReference (thin wrapper; consume-only).
 *
 * Phase 12M additive binding: preferentially references Shared Spatial Domain
 * SpatialReference.id via sharedSpatialReferenceId. Historical records without
 * shared id remain valid (dual-read). Does NOT invent a Twin location registry.
 * Digital Twin MUST_NEVER_OWN canonical spatial.
 */

export type TwinSpatialReference = {
  spatialRefId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  /**
   * Preferential binding to engineering_os_shared_spatial_domain SpatialReference.id.
   * Optional for dual-read compatibility with historical records.
   */
  sharedSpatialReferenceId?: string;
  /** Shared-domain location / place id — not Twin-owned. Legacy dual-read field. */
  canonicalLocationId: string;
  coordinateReferenceSystem: string;
  zoneRef?: string;
  levelRef?: string;
  unitSystem?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  ownsCanonicalLocation: false;
  createsLocationHierarchy: false;
  inventsLocationRegistry: false;
  /** Binding mode: shared_id when sharedSpatialReferenceId present. */
  bindingMode: "shared_spatial_reference" | "legacy_location_pointer";
};

export function createTwinSpatialReference(input: {
  spatialRefId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  canonicalLocationId: string;
  coordinateReferenceSystem: string;
  /** Preferential Shared Spatial Domain SpatialReference.id */
  sharedSpatialReferenceId?: string;
  zoneRef?: string;
  levelRef?: string;
  unitSystem?: string;
  notes?: string;
}): TwinSpatialReference {
  if (!input.coordinateReferenceSystem) {
    throw new Error("coordinate_reference_system_required");
  }
  if (!input.canonicalLocationId?.trim() && !input.sharedSpatialReferenceId?.trim()) {
    throw new Error("spatial_pointer_required");
  }
  const now = new Date().toISOString();
  const sharedId = input.sharedSpatialReferenceId?.trim() || undefined;
  return {
    spatialRefId: input.spatialRefId,
    twinId: input.twinId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sharedSpatialReferenceId: sharedId,
    canonicalLocationId: input.canonicalLocationId || sharedId || "",
    coordinateReferenceSystem: input.coordinateReferenceSystem,
    zoneRef: input.zoneRef,
    levelRef: input.levelRef,
    unitSystem: input.unitSystem,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    ownsCanonicalLocation: false,
    createsLocationHierarchy: false,
    inventsLocationRegistry: false,
    bindingMode: sharedId ? "shared_spatial_reference" : "legacy_location_pointer",
  };
}

/**
 * Resolve Twin spatial pointer preferring shared SpatialReference.id.
 * Historical records without shared id remain valid.
 */
export function resolveTwinSpatialBinding(ref: TwinSpatialReference): {
  mode: TwinSpatialReference["bindingMode"];
  sharedSpatialReferenceId?: string;
  canonicalLocationId: string;
  ownsCanonicalLocation: false;
} {
  if (ref.ownsCanonicalLocation !== false) {
    throw new Error("digital_twin_must_not_own_canonical_spatial");
  }
  if (ref.sharedSpatialReferenceId?.trim()) {
    return {
      mode: "shared_spatial_reference",
      sharedSpatialReferenceId: ref.sharedSpatialReferenceId,
      canonicalLocationId: ref.canonicalLocationId,
      ownsCanonicalLocation: false,
    };
  }
  return {
    mode: "legacy_location_pointer",
    canonicalLocationId: ref.canonicalLocationId,
    ownsCanonicalLocation: false,
  };
}

export {
  assertTransformationDeclared as assertCrsTransformationDeclared,
} from "./crs-governance";
