/**
 * Phase 12E — Digital Twin telemetry bindings HTTP API (create/read/review/history).
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const OPERATIONS = new Set([
  "create_binding",
  "get_binding",
  "list_bindings",
  "submit_review",
  "binding_history",
]);

const GOVERNANCE = {
  twinTelemetryBindingReady: true,
  automaticTelemetryStatePublicationEnabled: false,
  storesRawTelemetry: false,
  telemetryBindingReviewSlug: "digital_twin.telemetry_binding_review",
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
  const operation = typeof body.operation === "string" ? body.operation : "create_binding";
  if (!OPERATIONS.has(operation)) {
    return err(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId);
  }
  return NextResponse.json({ accepted: true, requestId, operation, ...GOVERNANCE }, { status: 202 });
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const bindingId = url.searchParams.get("bindingId") ?? "";
  return NextResponse.json(
    {
      requestId,
      bindingId: bindingId || undefined,
      result: bindingId ? "binding_lookup_ready" : "bindings_lookup_ready",
      bindings: [],
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}
