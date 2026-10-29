/**
 * Phase 12F — Digital Twin representation versions HTTP API (history).
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const GOVERNANCE = {
  representationVersioningReady: true,
  storesGeometryPayload: false,
  overwritesHistoricalVersion: false,
  threeDViewerImplemented: false,
} as const;

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }
  if ("modelBinary" in body || "geometryPayload" in body || body.overwrite === true) {
    return err(422, "version_overwrite_or_binary_forbidden", "Binary/overwrite forbidden", requestId);
  }
  return NextResponse.json(
    { accepted: true, requestId, operation: "version_history", ...GOVERNANCE },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const sourceId = url.searchParams.get("sourceId") ?? "";
  return NextResponse.json(
    {
      requestId,
      sourceId: sourceId || undefined,
      result: "representation_versions_lookup_ready",
      versions: [],
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}
