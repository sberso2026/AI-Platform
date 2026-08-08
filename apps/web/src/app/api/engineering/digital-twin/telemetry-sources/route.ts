/**
 * Phase 12E — Digital Twin telemetry sources HTTP API.
 * References only — rejects raw telemetry payloads.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const GOVERNANCE = {
  twinTelemetryBindingReady: true,
  storesRawTelemetry: false,
  engineeringTimeSeriesOwnership: "asset_intelligence",
  telemetryHistorianImplemented: false,
  sensorRegistryImplemented: false,
  shmSignalProcessingImplemented: false,
} as const;

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }
  if ("telemetryPayload" in body || "sensorData" in body || "points" in body) {
    return err(422, "telemetry_payload_forbidden", "Inline telemetry payloads are forbidden", requestId);
  }
  const tenantId = typeof body.tenantId === "string" ? body.tenantId : "";
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";
  const twinId = typeof body.twinId === "string" ? body.twinId : "";
  if (!tenantId || !workspaceId || !twinId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and twinId are required", requestId);
  }
  return NextResponse.json(
    { accepted: true, requestId, tenantId, workspaceId, twinId, operation: "register_source", ...GOVERNANCE },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  const twinId = url.searchParams.get("twinId") ?? "";
  if (!tenantId || !workspaceId || !twinId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and twinId are required", requestId);
  }
  return NextResponse.json(
    { requestId, tenantId, workspaceId, twinId, result: "telemetry_sources_ready", sources: [], ...GOVERNANCE },
    { status: 200 },
  );
}
