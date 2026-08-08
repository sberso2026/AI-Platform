/**
 * Phase 12M — Coordinate reference systems registry.
 */
import { NextResponse } from "next/server";
import {
  parseSpatialJsonBody,
  rejectForbiddenSpatialPayload,
  requireScope,
  spatialErr,
  SPATIAL_GOVERNANCE,
} from "../_assurance";

const OPS = new Set(["create", "get", "list"]);

export async function POST(req: Request) {
  const parsed = await parseSpatialJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { body, requestId, correlationId } = parsed;

  const forbidden = rejectForbiddenSpatialPayload(body, requestId);
  if (forbidden) return forbidden;

  const scope = requireScope(body, requestId);
  if (scope instanceof NextResponse) return scope;

  const operation = typeof body.operation === "string" ? body.operation : "list";
  if (!OPS.has(operation)) {
    return spatialErr(400, "invalid_operation", `Unknown operation: ${operation}`, requestId);
  }

  if (operation === "create") {
    const crs = typeof body.coordinateReferenceSystem === "string" ? body.coordinateReferenceSystem : "";
    if (!crs.trim()) {
      return spatialErr(
        400,
        "coordinate_reference_system_required",
        "coordinateReferenceSystem is required",
        requestId,
      );
    }
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "coordinate-reference-systems",
      transformImplemented: false,
      ...SPATIAL_GOVERNANCE,
    },
    { status: operation === "create" ? 202 : 200 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  if (!tenantId || !workspaceId) {
    return spatialErr(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  return NextResponse.json(
    {
      accepted: true,
      requestId,
      operation: "list",
      route: "coordinate-reference-systems",
      transformImplemented: false,
      tenantId,
      workspaceId,
      ...SPATIAL_GOVERNANCE,
    },
    { status: 200 },
  );
}
