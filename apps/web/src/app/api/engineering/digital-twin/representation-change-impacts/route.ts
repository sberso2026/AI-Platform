/**
 * Phase 12F — Digital Twin representation change impacts HTTP API.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const OPERATIONS = new Set(["record_impact", "list_impacts", "classify_impact"]);

const GOVERNANCE = {
  twinRepresentationMappingReady: true,
  threeDViewerImplemented: false,
  storesGeometryPayload: false,
} as const;

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }
  if ("geometryPayload" in body || "modelBinary" in body) {
    return err(422, "geometry_payload_forbidden", "Geometry payloads are forbidden", requestId);
  }
  const operation = typeof body.operation === "string" ? body.operation : "record_impact";
  if (!OPERATIONS.has(operation)) {
    return err(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId);
  }
  return NextResponse.json({ accepted: true, requestId, operation, ...GOVERNANCE }, { status: 202 });
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const twinId = url.searchParams.get("twinId") ?? "";
  return NextResponse.json(
    {
      requestId,
      twinId: twinId || undefined,
      result: "change_impacts_lookup_ready",
      impacts: [],
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}
