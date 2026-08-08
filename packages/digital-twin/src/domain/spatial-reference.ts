/**
 * Phase 12F — TwinSpatialReference (thin wrapper over shared location IDs).
 *
 * Does NOT create Location hierarchy tables. Canonical locations stay with
 * engineering_os_shared_domain.
 */

export type TwinSpatialReference = {
  spatialRefId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  /** Shared-domain location / place id — not Twin-owned. */
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
};

export function createTwinSpatialReference(input: {
  spatialRefId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  canonicalLocationId: string;
  coordinateReferenceSystem: string;
  zoneRef?: string;
  levelRef?: string;
  unitSystem?: string;
  notes?: string;
}): TwinSpatialReference {
  if (!input.coordinateReferenceSystem) {
    throw new Error("coordinate_reference_system_required");
  }
  const now = new Date().toISOString();
  return {
    spatialRefId: input.spatialRefId,
    twinId: input.twinId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    canonicalLocationId: input.canonicalLocationId,
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
  };
}

export {
  assertTransformationDeclared as assertCrsTransformationDeclared,
} from "./crs-governance";
