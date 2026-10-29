/**
 * Phase 12E — Digital Twin telemetry projection HTTP API (status / current projected state).
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const GOVERNANCE = {
  twinTelemetryProjectionReady: true,
  liveTelemetryImplemented: true,
  automaticTelemetryStatePublicationEnabled: false,
  storesRawTelemetry: false,
  interpolation: "not_implemented",
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
  return NextResponse.json(
    { accepted: true, requestId, operation: "project_binding", ...GOVERNANCE },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const bindingId = url.searchParams.get("bindingId") ?? "";
  return NextResponse.json(
    {
      requestId,
      bindingId: bindingId || undefined,
      result: "current_projected_state",
      projectedState: null,
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}
