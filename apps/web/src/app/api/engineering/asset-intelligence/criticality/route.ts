/**
 * Minimum criticality intelligence HTTP API.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

type NestedError = {
  error: {
    code: string;
    message: string;
    requestId: string;
    details: Record<string, unknown>;
  };
};

function err(
  status: number,
  code: string,
  message: string,
  requestId: string,
  details: Record<string, unknown> = {},
) {
  const body: NestedError = { error: { code, message, requestId, details } };
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;
  const started = Date.now();

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
    return err(400, "missing_scope", "tenantId, workspaceId, and assetId are required", requestId, {
      tenantId: Boolean(tenantId),
      workspaceId: Boolean(workspaceId),
      assetId: Boolean(assetId),
    });
  }

  // Route validates contract shape; engine wiring is application-layer.
  const durationMs = Date.now() - started;
  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      assetId,
      operation: "assess_criticality",
      result: "accepted",
      durationMs,
      repositoryAdapter: process.env.ASSET_INTELLIGENCE_REPOSITORY_ADAPTER ?? "postgres",
      healthComposedBy: "health_composition_engine",
      accuracyClaimsCertified: false,
      rulClaimsCertified: false,
    },
    { status: 202 },
  );
}
