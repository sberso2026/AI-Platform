/**
 * Minimum Project Controls Project Snapshot HTTP API (Phase 11D).
 *
 * A snapshot is an immutable set of state identifiers plus the profile id. It
 * carries no evidence payloads, no indications and no dates copied from the
 * states it references, and it is never a second source of project identity.
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

const OPERATIONS = new Set(["create_snapshot"]);

const GOVERNANCE_FLAGS = {
  projectSnapshotReady: true,
  projectTimelineReady: true,
  changeIntelligenceReady: true,
  snapshotIsImmutable: true,
  containsEvidencePayloads: false,
  contractualAuthority: false,
  earnedValueImplemented: false,
  cpmImplemented: false,
  costEngineImplemented: false,
  financialPostingImplemented: false,
  productionProjectControlsReady: false,
  canonicalProjectIdentityOwnership: "engineering_os_shared_project_domain",
  mutatesProjectIdentity: false,
  isProjectRegistry: false,
  advisoryOnly: true,
} as const;

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
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const operation = typeof body.operation === "string" ? body.operation : "create_snapshot";

  if (!tenantId || !workspaceId || !projectId) {
    return err(
      400,
      "missing_scope",
      "tenantId, workspaceId, and projectId are required",
      requestId,
    );
  }
  if (!OPERATIONS.has(operation)) {
    return err(400, "unsupported_operation", `Unsupported operation: ${operation}`, requestId, {
      supported: [...OPERATIONS],
    });
  }
  if (body.evidence !== undefined) {
    return err(
      422,
      "snapshot_carries_identifiers_only",
      "A project snapshot references state identifiers and may not carry evidence payloads",
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
      projectId,
      operation,
      result: "accepted",
      schemaVersion: "project_controls_project_snapshot/1",
      durationMs: Date.now() - started,
      repositoryAdapter: process.env.PROJECT_CONTROLS_REPOSITORY_ADAPTER ?? "postgres",
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
  const projectId = url.searchParams.get("projectId") ?? "";
  const view = url.searchParams.get("view") ?? "latest";

  if (!tenantId || !workspaceId || !projectId) {
    return err(
      400,
      "missing_scope",
      "tenantId, workspaceId, and projectId are required",
      requestId,
    );
  }

  return NextResponse.json({
    requestId,
    tenantId,
    workspaceId,
    projectId,
    operation:
      view === "history"
        ? "read_snapshot_history"
        : view === "timeline"
          ? "read_project_timeline"
          : "read_latest_snapshot",
    result: "ok",
    schemaVersion: "project_controls_project_snapshot/1",
    repositoryAdapter: "postgres",
    ...GOVERNANCE_FLAGS,
  });
}
