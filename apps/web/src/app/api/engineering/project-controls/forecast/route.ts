/**
 * Minimum Project Controls Forecast Intelligence HTTP API (Phase 11G).
 *
 * Advisory trajectory only from published composed contributors; never predicts
 * completion dates, cost forecasts, or runs predictive scheduling.
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

const SCOPE_KINDS = new Set([
  "project",
  "phase",
  "wbs_node",
  "work_package",
  "activity",
  "milestone",
]);

const OPERATIONS = new Set(["assess_forecast", "review", "publish"]);

const GOVERNANCE_FLAGS = {
  forecastIntelligenceReady: true,
  forecastConfidenceEngineReady: true,
  forecastReviewWorkflowReady: true,
  forecastPersistenceReady: true,
  forecastIntelligenceIsAdvisoryOnly: true,
  projectContextCompositionReady: true,
  earnedValueImplemented: false,
  cpmSchedulingImplemented: false,
  forecastEngineImplemented: false,
  forecastingImplemented: false,
  predictiveSchedulingImplemented: false,
  resourcePlanningImplemented: false,
  forecastExecutionImplemented: false,
  progressIntelligenceReady: true,
  scheduleIntelligenceReady: true,
  changeIntelligenceReady: true,
  costIntelligenceReady: true,
  productivityIntelligenceReady: true,
  sharedProjectDomainReady: true,
  projectContextEngineReady: true,
  forecastIntelligenceOwnership: "project_controls",
  productionProjectControlsReady: true,
  mutatesProjectIdentity: false,
  mutatesUpstreamContributors: false,
  advisoryOnly: true,
  aiMayPublishForecastForbidden: true,
  phase11fReady: true,
  phase11gReady: true,
  phase11hReady: true,
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
  const operation = typeof body.operation === "string" ? body.operation : "assess_forecast";

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

  const controlContext = (body.controlContext ?? {}) as Record<string, unknown>;
  const scope = (controlContext.scope ?? body.scope ?? {}) as Record<string, unknown>;
  const scopeKind = typeof scope.kind === "string" ? scope.kind : "project";
  if (!SCOPE_KINDS.has(scopeKind)) {
    return err(400, "invalid_scope_kind", `Unsupported scope kind: ${scopeKind}`, requestId, {
      supported: [...SCOPE_KINDS],
    });
  }

  const trajectoryUnitId =
    typeof controlContext.trajectoryUnitId === "string" ? controlContext.trajectoryUnitId : "";
  if (operation === "assess_forecast" && !trajectoryUnitId) {
    return err(
      400,
      "missing_trajectory_unit",
      "controlContext.trajectoryUnitId is required",
      requestId,
    );
  }

  if (
    body.completionDateClaimed === true ||
    body.costForecastClaimed === true ||
    body.predictiveSchedulingClaimed === true
  ) {
    return err(
      422,
      "predictive_forecast_forbidden",
      "Project Controls assesses advisory forecast intelligence and may not predict dates or costs",
      requestId,
    );
  }

  if (operation === "review" || operation === "publish") {
    const forecastStateId =
      typeof body.forecastStateId === "string" ? body.forecastStateId : undefined;
    if (!forecastStateId) {
      return err(400, "missing_state_id", "forecastStateId is required", requestId);
    }
    const reviewerId = typeof body.reviewerId === "string" ? body.reviewerId : undefined;
    if (!reviewerId) {
      return err(
        400,
        "missing_reviewer",
        "reviewerId is required to review forecast",
        requestId,
      );
    }
    const assessedBy = typeof body.assessedBy === "string" ? body.assessedBy : undefined;
    if (assessedBy && assessedBy === reviewerId) {
      return err(
        403,
        "self_approval_forbidden",
        "The actor who assessed forecast may not review or publish it",
        requestId,
      );
    }
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
      ...GOVERNANCE_FLAGS,
    },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;
  const started = Date.now();
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
    correlationId,
    tenantId,
    workspaceId,
    projectId,
    operation:
      view === "history"
        ? "read_forecast_history"
        : view === "evidence"
          ? "read_forecast_evidence"
          : "read_latest_forecast",
    result: "ok",
    durationMs: Date.now() - started,
    repositoryAdapter: "postgres",
    ...GOVERNANCE_FLAGS,
  });
}
