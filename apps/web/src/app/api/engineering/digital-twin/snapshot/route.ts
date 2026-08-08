/**
 * Phase 12C — Digital Twin snapshot HTTP API.
 *
 * get/create snapshot with versioned state references only.
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
  return NextResponse.json({ error: { code, message, requestId, details } }, { status });
}

const GOVERNANCE_FLAGS = {
  digitalTwinImplemented: true,
  productionDigitalTwinReady: false,
  digitalTwinRuntimeImplemented: false,
  liveTelemetryImplemented: false,
  simulationExecutionImplemented: false,
  threeDViewerImplemented: false,
  physicalActuationEnabled: false,
  automaticControlEnabled: false,
  twinSnapshotReady: true,
  twinStateReady: true,
  hostedDigitalTwinPersistenceReady: true,
  storesTelemetryPayload: false,
} as const;

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
  const twinId = typeof body.twinId === "string" ? body.twinId : "";
  const stateIds = Array.isArray(body.stateIds) ? body.stateIds : [];

  if (!tenantId || !workspaceId || !twinId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and twinId are required", requestId);
  }
  if (stateIds.length === 0) {
    return err(422, "snapshot_requires_state_refs", "stateIds must be a non-empty array", requestId);
  }
  if ("telemetryPayload" in body || "sensorData" in body) {
    return err(422, "telemetry_payload_forbidden", "Inline telemetry payloads are forbidden", requestId);
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      twinId,
      operation: "create_snapshot",
      stateIdCount: stateIds.length,
      result: "accepted",
      durationMs: Date.now() - started,
      repositoryAdapter: process.env.DIGITAL_TWIN_REPOSITORY_ADAPTER ?? "postgres",
      ...GOVERNANCE_FLAGS,
    },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  const twinId = url.searchParams.get("twinId") ?? "";
  const snapshotId = url.searchParams.get("snapshotId") ?? "";

  if (!tenantId || !workspaceId) {
    return err(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  if (!twinId && !snapshotId) {
    return err(400, "missing_lookup_key", "Provide twinId or snapshotId", requestId);
  }

  return NextResponse.json(
    {
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      twinId: twinId || undefined,
      snapshotId: snapshotId || undefined,
      result: "snapshot_lookup_ready",
      ...GOVERNANCE_FLAGS,
    },
    { status: 200 },
  );
}
