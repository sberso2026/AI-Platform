/**
 * Phase 12B — Twin representation references (references only, no geometry storage).
 */

import type { FidelityLevel } from "./fidelity-model";

export const REPRESENTATION_TYPES = [
  "bim",
  "ifc",
  "cad",
  "drawing",
  "gis",
  "point_cloud",
  "process_diagram",
] as const;

export type RepresentationType = (typeof REPRESENTATION_TYPES)[number];

export const REPRESENTATION_STATUSES = [
  "draft",
  "active",
  "superseded",
  "archived",
  "unavailable",
] as const;

export type RepresentationStatus = (typeof REPRESENTATION_STATUSES)[number];

/** Reference to an external representation artefact — not the artefact itself. */
export type TwinRepresentationReference = {
  representationId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  representationType: RepresentationType;
  sourceRef: string;
  version: string;
  fidelityLevel: FidelityLevel;
  coordinateSystem?: string;
  units?: string;
  status: RepresentationStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  // References only — no geometry payload
  storesGeometryPayload: false;
  viewerEnabled: false;
  liveTelemetryBound: false;
};
