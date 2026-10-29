/**
 * Phase 12M — SpatialReference CRUD / lookup / resolve.
 */
import { NextResponse } from "next/server";
import {
  parseSpatialJsonBody,
  rejectForbiddenSpatialPayload,
  requireScope,
  spatialErr,
  SPATIAL_GOVERNANCE,
} from "../_assurance";

const OPS = new Set([
  "create",
  "update",
  "get",
  "list",
  "resolve",
  "supersede",
  "publish",
]);

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

  const spatialReferenceId =
    typeof body.spatialReferenceId === "string"
      ? body.spatialReferenceId
      : typeof body.id === "string"
        ? body.id
        : undefined;

  if (
    (operation === "get" ||
      operation === "resolve" ||
      operation === "update" ||
      operation === "supersede" ||
      operation === "publish") &&
    !spatialReferenceId
  ) {
    return spatialErr(
      400,
      "missing_spatial_reference_id",
      "spatialReferenceId is required",
      requestId,
    );
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "spatial-references",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      spatialReferenceId: spatialReferenceId ?? null,
      owner: "engineering_os_shared_spatial_domain",
      hierarchyImpliesGeometry: false,
      ...SPATIAL_GOVERNANCE,
    },
    { status: operation === "get" || operation === "list" || operation === "resolve" ? 200 : 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  const spatialReferenceId = url.searchParams.get("spatialReferenceId");

  if (!tenantId || !workspaceId) {
    return spatialErr(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      operation: spatialReferenceId ? "get" : "list",
      route: "spatial-references",
      tenantId,
      workspaceId,
      spatialReferenceId,
      owner: "engineering_os_shared_spatial_domain",
      ...SPATIAL_GOVERNANCE,
    },
    { status: 200 },
  );
}
