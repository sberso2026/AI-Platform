/**
 * Phase 12E — Digital Twin telemetry channels HTTP API.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const GOVERNANCE = {
  twinTelemetryBindingReady: true,
  storesRawTelemetry: false,
} as const;

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
  return NextResponse.json({ accepted: true, requestId, operation: "register_channel", ...GOVERNANCE }, { status: 202 });
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const twinId = url.searchParams.get("twinId") ?? "";
  return NextResponse.json(
    { requestId, twinId, result: "telemetry_channels_ready", channels: [], ...GOVERNANCE },
    { status: 200 },
  );
}
