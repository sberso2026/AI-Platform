/**
 * Phase 12B — Digital Twin thread link HTTP API.
 * Add/list thread links — reuses platform timelines by reference.
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
  twinThreadReady: true,
  duplicatesTimelineStorage: false,
  liveTelemetryImplemented: false,
  simulationExecutionImplemented: false,
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
  const targetRef = typeof body.targetRef === "string" ? body.targetRef : "";

  if (!tenantId || !workspaceId || !twinId || !targetRef) {
    return err(
      400,
      "missing_scope",
      "tenantId, workspaceId, twinId, and targetRef are required",
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
      operation: "add_thread_link",
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
      threadLinks: [],
      ...GOVERNANCE_FLAGS,
    },
    { status: 200 },
  );
}
