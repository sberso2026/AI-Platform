/**
 * Phase 12M — Coordinate references (scalars WITH CRS; incompatible CRS abstain).
 */
import { NextResponse } from "next/server";
import {
  parseSpatialJsonBody,
  rejectForbiddenSpatialPayload,
  requireScope,
  spatialErr,
  SPATIAL_GOVERNANCE,
} from "../_assurance";

const OPS = new Set(["create", "get", "list", "compare_crs"]);

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
    const crsId = typeof body.crsId === "string" ? body.crsId : "";
    if (!crsId.trim()) {
      return spatialErr(400, "crs_id_required", "crsId is required", requestId);
    }
  }

  if (operation === "compare_crs") {
    const left = typeof body.leftCrsId === "string" ? body.leftCrsId.trim() : "";
    const right = typeof body.rightCrsId === "string" ? body.rightCrsId.trim() : "";
    if (!left || !right || left !== right) {
      return spatialErr(
        422,
        "incompatible_crs",
        "Coordinate references with incompatible CRS must abstain",
        requestId,
        { leftCrsId: left || null, rightCrsId: right || null },
      );
    }
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "coordinates",
      storesGeometryBlob: false,
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
      route: "coordinates",
      storesGeometryBlob: false,
      tenantId,
      workspaceId,
      ...SPATIAL_GOVERNANCE,
    },
    { status: 200 },
  );
}
