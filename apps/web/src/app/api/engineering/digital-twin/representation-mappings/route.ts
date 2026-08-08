/**
 * Phase 12F — Digital Twin representation mappings HTTP API (create/read/review).
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const OPERATIONS = new Set([
  "create_mapping",
  "get_mapping",
  "list_mappings",
  "submit_review",
  "publish_mapping",
  "mapping_history",
]);

const GOVERNANCE = {
  twinRepresentationMappingReady: true,
  representationNavigationImplemented: true,
  threeDViewerImplemented: false,
  automaticRepresentationMappingApprovalEnabled: false,
  duplicateModelOwnershipDetected: false,
  storesGeometryPayload: false,
  authoringEnabled: false,
  representationMappingReviewSlug: "digital_twin.representation_mapping_review",
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
    "autoApprove" in body ||
    body.autoApproved === true
  ) {
    return err(
      422,
      "mapping_binary_or_auto_approve_forbidden",
      "Geometry payloads and auto-approval are forbidden",
      requestId,
    );
  }
  const operation = typeof body.operation === "string" ? body.operation : "create_mapping";
  if (!OPERATIONS.has(operation)) {
    return err(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId);
  }
  return NextResponse.json({ accepted: true, requestId, operation, ...GOVERNANCE }, { status: 202 });
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const mappingId = url.searchParams.get("mappingId") ?? "";
  return NextResponse.json(
    {
      requestId,
      mappingId: mappingId || undefined,
      result: mappingId ? "mapping_lookup_ready" : "mappings_lookup_ready",
      mappings: [],
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}
