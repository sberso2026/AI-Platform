/**
 * Phase 12F — TwinRepresentationElementReference (no geometry blob).
 */

export type TwinRepresentationElementReference = {
  elementRefId: string;
  representationSourceId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  /** External element id within the source model (e.g. IFC GUID). */
  externalElementId: string;
  elementType?: string;
  displayName?: string;
  parentElementRefId?: string;
  createdAt: string;
  updatedAt: string;
  storesGeometryPayload: false;
};

export function createTwinRepresentationElementReference(input: {
  elementRefId: string;
  representationSourceId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  externalElementId: string;
  elementType?: string;
  displayName?: string;
  parentElementRefId?: string;
}): TwinRepresentationElementReference {
  const now = new Date().toISOString();
  return {
    elementRefId: input.elementRefId,
    representationSourceId: input.representationSourceId,
    twinId: input.twinId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    externalElementId: input.externalElementId,
    elementType: input.elementType,
    displayName: input.displayName,
    parentElementRefId: input.parentElementRefId,
    createdAt: now,
    updatedAt: now,
    storesGeometryPayload: false,
  };
}

export function assertElementReferenceNoGeometry(
  element: TwinRepresentationElementReference,
): void {
  if (element.storesGeometryPayload) {
    throw new Error("representation_element_geometry_forbidden");
  }
}
