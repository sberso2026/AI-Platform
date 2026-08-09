/**
 * Phase 13B — Engineering model elements.
 */
import { NextResponse } from "next/server";
import {
  INTEROP_GOVERNANCE,
  interopErr,
  parseInteropJsonBody,
  rejectForbiddenInteropPayload,
  requireScope,
} from "../_assurance";

const OPS = new Set(["get", "list"]);

export async function POST(req: Request) {
  const parsed = await parseInteropJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { body, requestId, correlationId } = parsed;
  const forbidden = rejectForbiddenInteropPayload(body, requestId);
  if (forbidden) return forbidden;
  const scope = requireScope(body, requestId);
  if (scope instanceof NextResponse) return scope;
  const operation = typeof body.operation === "string" ? body.operation : "list";
  if (!OPS.has(operation)) {
    return interopErr(400, "invalid_operation", `Unknown operation: ${operation}`, requestId);
  }
  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "elements",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      modelRefId: typeof body.modelRefId === "string" ? body.modelRefId : null,
      elementRefId:
        typeof body.elementRefId === "string" ? body.elementRefId : null,
      storesGeometryBlob: false,
      ...INTEROP_GOVERNANCE,
    },
    { status: 200 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  if (!tenantId || !workspaceId) {
    return interopErr(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  return NextResponse.json(
    {
      accepted: true,
      requestId,
      operation: "list",
      route: "elements",
      tenantId,
      workspaceId,
      storesGeometryBlob: false,
      ...INTEROP_GOVERNANCE,
    },
    { status: 200 },
  );
}
