/**
 * Phase 13B — Engineering model references.
 */
import { NextResponse } from "next/server";
import {
  INTEROP_GOVERNANCE,
  interopErr,
  parseInteropJsonBody,
  rejectForbiddenInteropPayload,
  rejectInlineEntitlementDenial,
  requireScope,
  requiredInteropEntitlement,
} from "../_assurance";

const OPS = new Set([
  "create",
  "get",
  "list",
  "federate_ifc",
  "federate_spacegass",
  "federate_etabs",
]);

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

  const write = operation !== "get" && operation !== "list";
  const entitlement = requiredInteropEntitlement("models", write);
  const denied = rejectInlineEntitlementDenial(body, requestId, entitlement);
  if (denied) return denied;

  const modelRefId =
    typeof body.modelRefId === "string"
      ? body.modelRefId
      : typeof body.id === "string"
        ? body.id
        : undefined;

  if ((operation === "get") && !modelRefId) {
    return interopErr(400, "missing_model_ref_id", "modelRefId is required", requestId);
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "models",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      modelRefId: modelRefId ?? null,
      owner: "source_client_engineering_application",
      federationOwner: "engineering_model_interoperability",
      ...INTEROP_GOVERNANCE,
    },
    { status: operation === "get" || operation === "list" ? 200 : 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  const modelRefId = url.searchParams.get("modelRefId");

  if (!tenantId || !workspaceId) {
    return interopErr(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      operation: modelRefId ? "get" : "list",
      route: "models",
      tenantId,
      workspaceId,
      modelRefId,
      owner: "source_client_engineering_application",
      federationOwner: "engineering_model_interoperability",
      ...INTEROP_GOVERNANCE,
    },
    { status: 200 },
  );
}
