/**
 * Phase 12C — Representation versioning (append/supersede only — no overwrite).
 */

import type { RepresentationType } from "./representation";
import type { FidelityLevel } from "./fidelity-model";

export type SourceSystem = string;

export type RepresentationVersion = {
  representationVersionId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  representationType: RepresentationType;
  sourceSystem: SourceSystem;
  sourceRef: string;
  revision: string;
  effectiveDate: string;
  fidelityLevel: FidelityLevel;
  coordinateSystem?: string;
  units?: string;
  supersededBy?: string;
  createdAt: string;
  createdBy?: string;
  storesGeometryPayload: false;
  viewerEnabled: false;
  liveTelemetryBound: false;
  overwritesHistoricalVersion: false;
};

export function assertRepresentationAppendOnly(
  existing: RepresentationVersion[],
  incoming: Pick<RepresentationVersion, "representationType" | "revision" | "sourceRef">,
): void {
  const sameRevision = existing.find(
    (row) =>
      row.representationType === incoming.representationType &&
      row.revision === incoming.revision &&
      row.sourceRef === incoming.sourceRef &&
      !row.supersededBy,
  );
  if (sameRevision) {
    throw new Error("representation_version_overwrite_forbidden");
  }
}
