/**
 * Phase 12F — Digital Twin representation sources HTTP API.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const OPERATIONS = new Set(["register_source", "get_source", "list_sources", "version_source"]);

const GOVERNANCE = {
  twinRepresentationMappingReady: true,
  representationNavigationImplemented: true,
  threeDViewerImplemented: false,
  storesGeometryPayload: false,
  storesSourceModelBinary: false,
  authoringEnabled: false,
  automaticRepresentationMappingApprovalEnabled: false,
  duplicateModelOwnershipDetected: false,
} as const;

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }
  if (
    "geometryPayload" in body ||
    "mesh" in body ||
    "modelBinary" in body ||
    "authoringPayload" in body
  ) {
    return err(
      422,
      "source_model_binary_forbidden",
      "Geometry payloads and model binaries are forbidden",
      requestId,
    );
  }
  const operation = typeof body.operation === "string" ? body.operation : "register_source";
  if (!OPERATIONS.has(operation)) {
    return err(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId);
  }
  return NextResponse.json({ accepted: true, requestId, operation, ...GOVERNANCE }, { status: 202 });
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const representationSourceId = url.searchParams.get("representationSourceId") ?? "";
  return NextResponse.json(
    {
      requestId,
      representationSourceId: representationSourceId || undefined,
      result: representationSourceId ? "source_lookup_ready" : "sources_lookup_ready",
      sources: [],
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}
