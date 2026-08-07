/**
 * Minimum Project Controls Project Profile HTTP API (Phase 11C).
 *
 * Reads the Project Context Engine output. Advisory only: the profile carries
 * progress and schedule intelligence plus reserved contributors not yet
 * implemented. It never becomes a second source of project identity.
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

const ACTIVE_CONTRIBUTORS = ["progress_intelligence", "schedule_intelligence"] as const;

const RESERVED_CONTRIBUTORS = [
  "cost_intelligence",
  "change_intelligence",
  "contingency_intelligence",
  "productivity_intelligence",
  "earned_value",
  "forecast",
] as const;

const GOVERNANCE_FLAGS = {
  earnedValueImplemented: false,
  cpmImplemented: false,
  floatComputationImplemented: false,
  costEngineImplemented: false,
  forecastingImplemented: false,
  scheduleExecutionImplemented: false,
  productionProjectControlsReady: false,
  progressIntelligenceReady: true,
  scheduleIntelligenceReady: true,
  sharedProjectDomainReady: true,
  projectContextEngineReady: true,
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
  const operation = typeof body.operation === "string" ? body.operation : "compose_profile";

  if (!tenantId || !workspaceId || !projectId) {
    return err(
      400,
      "missing_scope",
      "tenantId, workspaceId, and projectId are required",
      requestId,
    );
  }
  if (operation !== "compose_profile") {
    return err(400, "unsupported_operation", `Unsupported operation: ${operation}`, requestId, {
      supported: ["compose_profile"],
    });
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
      durationMs: Date.now() - started,
      repositoryAdapter: process.env.PROJECT_CONTROLS_REPOSITORY_ADAPTER ?? "postgres",
      activeContributorKeys: ACTIVE_CONTRIBUTORS,
      reservedContributorKeys: RESERVED_CONTRIBUTORS,
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
    operation: view === "history" ? "read_profile_history" : "read_latest_profile",
    result: "ok",
    repositoryAdapter: "postgres",
    activeContributorKeys: ACTIVE_CONTRIBUTORS,
    reservedContributorKeys: RESERVED_CONTRIBUTORS,
    ...GOVERNANCE_FLAGS,
  });
}
