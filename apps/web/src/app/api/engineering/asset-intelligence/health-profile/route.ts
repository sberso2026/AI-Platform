/**
 * Health profile read / recomposition contract surface.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(
  status: number,
  code: string,
  message: string,
  requestId: string,
  details: Record<string, unknown> = {},
) {
  return NextResponse.json(
    { error: { code, message, requestId, details } },
    { status },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  const assetId = url.searchParams.get("assetId") ?? "";
  if (!tenantId || !workspaceId || !assetId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and assetId are required", requestId);
  }
  return NextResponse.json({
    requestId,
    tenantId,
    workspaceId,
    assetId,
    operation: "read_health_profile",
    compositionMethod: "compose_condition_reliability_v2",
    criticalityIsHealthFactor: false,
    healthComposedBy: "health_composition_engine",
    result: "ok",
  });
}

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }
  const tenantId = typeof body.tenantId === "string" ? body.tenantId : "";
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";
  const assetId = typeof body.assetId === "string" ? body.assetId : "";
  if (!tenantId || !workspaceId || !assetId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and assetId are required", requestId);
  }
  return NextResponse.json(
    {
      accepted: true,
      requestId,
      tenantId,
      workspaceId,
      assetId,
      operation: "recompose_health",
      compositionMethod: "compose_condition_reliability_v2",
      criticalityIsHealthFactor: false,
      healthComposedBy: "health_composition_engine",
      result: "accepted",
    },
    { status: 202 },
  );
}
