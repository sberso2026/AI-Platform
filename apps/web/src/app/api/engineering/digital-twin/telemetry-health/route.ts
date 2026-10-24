/**
 * Phase 12E — Digital Twin telemetry health HTTP API (source health / freshness / quality).
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const GOVERNANCE = {
  twinTelemetryBindingReady: true,
  telemetryHistorianImplemented: false,
  shmSignalProcessingImplemented: false,
  sensorRegistryImplemented: false,
} as const;

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const twinId = url.searchParams.get("twinId") ?? "";
  const bindingId = url.searchParams.get("bindingId") ?? "";
  if (!twinId) {
    return err(400, "missing_twin_id", "twinId is required", requestId);
  }
  return NextResponse.json(
    {
      requestId,
      twinId,
      bindingId: bindingId || undefined,
      sourceHealth: "unknown",
      freshnessMs: null,
      quality: "unknown",
      sourceUnavailable: false,
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }
  if ("telemetryPayload" in body || "sensorData" in body) {
    return err(422, "telemetry_payload_forbidden", "Inline telemetry payloads are forbidden", requestId);
  }
  return err(405, "method_not_allowed", "Use GET for telemetry health", requestId);
}
