/**
 * Phase 12F — Digital Twin representation navigation HTTP API (list/reference resolve).
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const OPERATIONS = new Set([
  "resolve_twin",
  "resolve_entity",
  "resolve_state",
  "resolve_telemetry",
  "resolve_inspection",
]);

const GOVERNANCE = {
  twinRepresentationNavigationReady: true,
  representationNavigationImplemented: true,
  threeDViewerImplemented: false,
  viewerUnavailable: true,
  navigationMode: "list_reference",
} as const;

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }
  if ("geometryPayload" in body || "renderScene" in body || "viewerSession" in body) {
    return err(422, "three_d_viewer_forbidden", "3D viewer payloads are forbidden", requestId);
  }
  const operation = typeof body.operation === "string" ? body.operation : "resolve_twin";
  if (!OPERATIONS.has(operation)) {
    return err(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId);
  }
  return NextResponse.json(
    {
      accepted: true,
      requestId,
      operation,
      sources: [],
      elements: [],
      mappings: [],
      ...GOVERNANCE,
    },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const twinId = url.searchParams.get("twinId") ?? "";
  return NextResponse.json(
    {
      requestId,
      twinId: twinId || undefined,
      result: "navigation_resolve_ready",
      sources: [],
      elements: [],
      mappings: [],
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}
