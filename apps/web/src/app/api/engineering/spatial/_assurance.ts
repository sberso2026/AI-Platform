/**
 * Phase 12M — Shared Spatial Domain HTTP assurance helpers.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export function spatialErr(
  status: number,
  code: string,
  message: string,
  requestId: string,
  details: Record<string, unknown> = {},
) {
  return NextResponse.json({ error: { code, message, requestId, details } }, { status });
}

export const SPATIAL_GOVERNANCE = {
  SharedSpatialDomainDiscoveryReady: true,
  SharedSpatialDomainOwnershipLocked: true,
  SharedSpatialDomainRuntimeImplemented: true,
  SharedSpatialReferenceRegistryReady: true,
  SpatialReferenceGovernanceReady: true,
  CoordinateReferenceGovernanceReady: true,
  CoordinateReferenceSystemRegistryReady: true,
  LegacySpatialReconciliationReady: true,
  DigitalTwinSpatialBindingReady: true,
  spatialOwnershipFullyResolved: true,
  digitalTwinMayOwnCanonicalSpatial: false,
  coordinateTransformationImplemented: false,
  gisRuntimeImplemented: false,
  spatialAnalyticsImplemented: false,
  geometryRepositoryImplemented: false,
  productionDigitalTwinReady: false,
  productionMemoryRepositoryAllowed: false,
  phase12NReady: true,
  unexpected5xx: 0,
} as const;

export async function parseSpatialJsonBody(req: Request): Promise<
  | { ok: true; body: Record<string, unknown>; requestId: string; correlationId: string }
  | { ok: false; response: NextResponse }
> {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    return { ok: true, body, requestId, correlationId };
  } catch {
    return {
      ok: false,
      response: spatialErr(400, "invalid_json", "Request body must be JSON", requestId),
    };
  }
}

export function requireScope(
  body: Record<string, unknown>,
  requestId: string,
): { tenantId: string; workspaceId: string } | NextResponse {
  const tenantId = typeof body.tenantId === "string" ? body.tenantId : "";
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";
  if (!tenantId || !workspaceId) {
    return spatialErr(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  return { tenantId, workspaceId };
}

export function rejectForbiddenSpatialPayload(
  body: Record<string, unknown>,
  requestId: string,
) {
  const forbidden = [
    "geometry",
    "geometryBlob",
    "wkt",
    "wkb",
    "geojson",
    "postgis",
    "transformCoordinates",
    "intersect",
    "containsGeometry",
    "aiApprove",
    "aiSelfApproval",
    "autoApproveLocation",
  ];
  for (const key of forbidden) {
    if (key in body && body[key] !== undefined && body[key] !== false) {
      return spatialErr(
        422,
        "forbidden_spatial_capability",
        `Forbidden payload key: ${key}`,
        requestId,
      );
    }
  }
  return null;
}
