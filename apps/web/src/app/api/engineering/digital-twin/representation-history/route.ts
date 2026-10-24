/**
 * Phase 12C — Representation version history HTTP API.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(
  status: number,
  code: string,
  message: string,
  requestId: string,
  details: Record<string, unknown> = {},
) {
  return NextResponse.json({ error: { code, message, requestId, details } }, { status });
}

const GOVERNANCE_FLAGS = {
  digitalTwinImplemented: true,
  productionDigitalTwinReady: false,
  representationVersioningReady: true,
  twinRepresentationReady: true,
  threeDViewerImplemented: false,
  liveTelemetryImplemented: false,
  storesGeometryPayload: false,
  overwritesHistoricalVersion: false,
} as const;

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  const twinId = url.searchParams.get("twinId") ?? "";

  if (!tenantId || !workspaceId || !twinId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and twinId are required", requestId);
  }

  return NextResponse.json(
    {
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      twinId,
      result: "representation_history_ready",
      ...GOVERNANCE_FLAGS,
    },
    { status: 200 },
  );
}

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;
  const started = Date.now();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }

  const tenantId = typeof body.tenantId === "string" ? body.tenantId : "";
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";
  const twinId = typeof body.twinId === "string" ? body.twinId : "";
  const revision = typeof body.revision === "string" ? body.revision : "";
  const sourceRef = typeof body.sourceRef === "string" ? body.sourceRef : "";

  if (!tenantId || !workspaceId || !twinId || !revision || !sourceRef) {
    return err(
      422,
      "representation_version_required",
      "tenantId, workspaceId, twinId, revision, and sourceRef are required",
      requestId,
    );
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      twinId,
      operation: "attach_representation_version",
      result: "accepted",
      durationMs: Date.now() - started,
      ...GOVERNANCE_FLAGS,
    },
    { status: 202 },
  );
}
