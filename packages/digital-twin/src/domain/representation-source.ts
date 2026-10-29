/**
 * Phase 12F — TwinRepresentationSourceReference (reference only — no file blob).
 */

import type { FidelityLevel } from "./fidelity-model";

export const REPRESENTATION_SOURCE_FORMATS = [
  "ifc",
  "bim",
  "cad",
  "drawing",
  "gis",
  "point_cloud",
  "schematic",
  "other",
] as const;

export type RepresentationSourceFormat = (typeof REPRESENTATION_SOURCE_FORMATS)[number];

export const REPRESENTATION_SOURCE_STATUSES = [
  "draft",
  "registered",
  "versioned",
  "superseded",
  "retired",
] as const;

export type RepresentationSourceStatus = (typeof REPRESENTATION_SOURCE_STATUSES)[number];

/** Reference to an external engineering model / drawing — never the binary itself. */
export type TwinRepresentationSourceReference = {
  representationSourceId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  format: RepresentationSourceFormat;
  /** Platform Files fileId or external source_ref — never a blob. */
  sourceRef: string;
  fileId?: string;
  displayName: string;
  version: string;
  fidelityLevel: FidelityLevel;
  coordinateReferenceSystem?: string;
  status: RepresentationSourceStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  storesGeometryPayload: false;
  storesSourceModelBinary: false;
  authoringEnabled: false;
  viewerEnabled: false;
};

export function createTwinRepresentationSourceReference(input: {
  representationSourceId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  format: RepresentationSourceFormat;
  sourceRef: string;
  fileId?: string;
  displayName: string;
  version: string;
  fidelityLevel: FidelityLevel;
  coordinateReferenceSystem?: string;
  createdBy?: string;
}): TwinRepresentationSourceReference {
  const now = new Date().toISOString();
  return {
    representationSourceId: input.representationSourceId,
    twinId: input.twinId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    format: input.format,
    sourceRef: input.sourceRef,
    fileId: input.fileId,
    displayName: input.displayName,
    version: input.version,
    fidelityLevel: input.fidelityLevel,
    coordinateReferenceSystem: input.coordinateReferenceSystem,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    storesGeometryPayload: false,
    storesSourceModelBinary: false,
    authoringEnabled: false,
    viewerEnabled: false,
  };
}

export function assertRepresentationSourceReferenceOnly(
  source: TwinRepresentationSourceReference,
): void {
  if (
    source.storesGeometryPayload ||
    source.storesSourceModelBinary ||
    source.authoringEnabled ||
    source.viewerEnabled
  ) {
    throw new Error("representation_source_geometry_or_authoring_forbidden");
  }
}
