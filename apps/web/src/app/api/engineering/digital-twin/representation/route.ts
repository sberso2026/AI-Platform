/**
 * Phase 12B — Digital Twin representation HTTP API.
 * Attach/list representation references — no geometry, no viewer.
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

const REP_TYPES = new Set([
  "bim",
  "ifc",
  "cad",
  "drawing",
  "gis",
  "point_cloud",
  "process_diagram",
]);

const GOVERNANCE_FLAGS = {
  digitalTwinImplemented: true,
  liveTelemetryImplemented: false,
  threeDViewerImplemented: false,
  storesGeometryPayload: false,
  viewerEnabled: false,
  twinRepresentationReady: true,
} as const;

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }

  const tenantId = typeof body.tenantId === "string" ? body.tenantId : "";
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";
  const twinId = typeof body.twinId === "string" ? body.twinId : "";
  const repType = typeof body.representationType === "string" ? body.representationType : "";
  const sourceRef = typeof body.sourceRef === "string" ? body.sourceRef : "";

  if (!tenantId || !workspaceId || !twinId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and twinId are required", requestId);
  }
  if (!repType || !sourceRef) {
    return err(
      400,
      "missing_representation",
      "representationType and sourceRef are required",
      requestId,
    );
  }
  if (!REP_TYPES.has(repType)) {
    return err(400, "invalid_representation_type", `Unsupported type: ${repType}`, requestId);
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      twinId,
      operation: "attach_representation",
      ...GOVERNANCE_FLAGS,
    },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
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
      tenantId,
      workspaceId,
      twinId,
      representations: [],
      ...GOVERNANCE_FLAGS,
    },
    { status: 200 },
  );
}
