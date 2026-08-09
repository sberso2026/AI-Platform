/**
 * Phase 13B — Federated analysis result references.
 */
import { NextResponse } from "next/server";
import {
  INTEROP_GOVERNANCE,
  interopErr,
  parseInteropJsonBody,
  rejectForbiddenInteropPayload,
  requireScope,
} from "../_assurance";

const OPS = new Set(["reference", "get", "list"]);

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
      route: "results",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      resultRefId: typeof body.resultRefId === "string" ? body.resultRefId : null,
      modelRefId: typeof body.modelRefId === "string" ? body.modelRefId : null,
      ifcImportedImpliesRtbExecutionCertified: false,
      trustClassifications: [
        "source_declared",
        "source_reviewed",
        "externally_approved",
        "rtb_execution_certified",
        "unknown",
      ],
      ...INTEROP_GOVERNANCE,
    },
    { status: operation === "list" || operation === "get" ? 200 : 202 },
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
      route: "results",
      tenantId,
      workspaceId,
      ifcImportedImpliesRtbExecutionCertified: false,
      ...INTEROP_GOVERNANCE,
    },
    { status: 200 },
  );
}
