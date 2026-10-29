/**
 * Phase 12F — CRS governance types (types only — no GIS engine).
 */

export type CoordinateReferenceSystemDeclaration = {
  coordinateReferenceSystem: string;
  authority?: string;
  epsgCode?: number;
  description?: string;
};

export type CoordinateTransformationDeclaration = {
  sourceCRS: string;
  targetCRS: string;
  transformationMethod: string;
  methodVersion: string;
  provenance: string;
};

export function assertCoordinateReferenceSystemRequired(
  crs: string | undefined | null,
): asserts crs is string {
  if (!crs || !crs.trim()) {
    throw new Error("coordinate_reference_system_required");
  }
}

export function assertTransformationDeclared(
  transformation: CoordinateTransformationDeclaration,
): void {
  if (
    !transformation.sourceCRS ||
    !transformation.targetCRS ||
    !transformation.transformationMethod ||
    !transformation.methodVersion ||
    !transformation.provenance
  ) {
    throw new Error("coordinate_transformation_incomplete");
  }
}

export const GIS_ENGINE_IMPLEMENTED = false as const;
export const gisEngineImplemented = false as const;
