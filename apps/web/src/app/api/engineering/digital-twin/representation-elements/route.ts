/**
 * Phase 12F — Digital Twin representation elements HTTP API.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const OPERATIONS = new Set(["register_element", "get_element", "list_elements", "resolve_element"]);

const GOVERNANCE = {
  twinRepresentationMappingReady: true,
  representationNavigationImplemented: true,
  threeDViewerImplemented: false,
  storesGeometryPayload: false,
  authoringEnabled: false,
} as const;

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }
  if ("geometryPayload" in body || "mesh" in body || "triangles" in body) {
    return err(422, "geometry_payload_forbidden", "Geometry payloads are forbidden", requestId);
  }
  const operation = typeof body.operation === "string" ? body.operation : "register_element";
  if (!OPERATIONS.has(operation)) {
    return err(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId);
  }
  return NextResponse.json({ accepted: true, requestId, operation, ...GOVERNANCE }, { status: 202 });
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const elementRefId = url.searchParams.get("elementRefId") ?? "";
  return NextResponse.json(
    {
      requestId,
      elementRefId: elementRefId || undefined,
      result: elementRefId ? "element_lookup_ready" : "elements_lookup_ready",
      elements: [],
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}
