/**
 * Minimum Project Controls Productivity Intelligence HTTP API (Phase 11F).
 *
 * Advisory only. Assesses execution efficiency posture from evidence; never
 * manages workforce, never processes timesheets/payroll, never computes labour %.
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

const OPERATIONS = new Set(["assess_productivity", "review", "publish"]);

const GOVERNANCE_FLAGS = {
  productivityIntelligenceReady: true,
  productivityConfidenceEngineReady: true,
  productivityReviewWorkflowReady: true,
  productivityPersistenceReady: true,
  productivityIntelligenceIsAdvisoryOnly: true,
  resourcePlanningImplemented: false,
  timesheetSystemImplemented: false,
  payrollImplemented: false,
  labourCostEngineImplemented: false,
  earnedValueImplemented: false,
  forecastEngineImplemented: false,
  forecastingImplemented: false,
  costIntelligenceReady: true,
  progressIntelligenceReady: true,
  scheduleIntelligenceReady: true,
  changeIntelligenceReady: true,
  sharedProjectDomainReady: true,
  projectContextEngineReady: true,
  productivityIntelligenceOwnership: "project_controls",
  productionProjectControlsReady: false,
  mutatesProjectIdentity: false,
  advisoryOnly: true,
  aiMayPublishProductivityForbidden: true,
  phase11fReady: true,
  phase11gReady: true,
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
  const operation = typeof body.operation === "string" ? body.operation : "assess_productivity";

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

  const controlUnitId =
    typeof controlContext.controlUnitId === "string" ? controlContext.controlUnitId : "";
  if (operation === "assess_productivity" && !controlUnitId) {
    return err(400, "missing_control_unit", "controlContext.controlUnitId is required", requestId);
  }

  if (
    body.workforceManagementClaimed === true ||
    body.labourProductivityPercentClaimed === true ||
    body.timesheetProcessed === true ||
    body.payrollProcessed === true
  ) {
    return err(
      422,
      "workforce_management_forbidden",
      "Project Controls assesses productivity intelligence and may not manage workforce or labour %",
      requestId,
    );
  }

  if (operation === "assess_productivity") {
    const evidence = Array.isArray(body.evidence) ? body.evidence : [];
    const forbiddenEvidence = evidence.some(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        ((item as Record<string, unknown>).derivedFromTimesheet === true ||
          (item as Record<string, unknown>).derivedFromPayroll === true ||
          (item as Record<string, unknown>).labourProductivityPercentClaimed === true ||
          (item as Record<string, unknown>).resourcePlanningClaimed === true),
    );
    if (forbiddenEvidence) {
      return err(
        422,
        "evidence_source_forbidden",
        "Productivity evidence may not derive from timesheets, payroll or claim labour metrics",
        requestId,
      );
    }
  }

  if (operation === "review" || operation === "publish") {
    const productivityStateId =
      typeof body.productivityStateId === "string" ? body.productivityStateId : undefined;
    if (!productivityStateId) {
      return err(400, "missing_state_id", "productivityStateId is required", requestId);
    }
    const reviewerId = typeof body.reviewerId === "string" ? body.reviewerId : undefined;
    if (!reviewerId) {
      return err(
        400,
        "missing_reviewer",
        "reviewerId is required to review productivity",
        requestId,
      );
    }
    const assessedBy = typeof body.assessedBy === "string" ? body.assessedBy : undefined;
    if (assessedBy && assessedBy === reviewerId) {
      return err(
        403,
        "self_approval_forbidden",
        "The actor who assessed productivity may not review or publish it",
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
        ? "read_productivity_history"
        : view === "evidence"
          ? "read_productivity_evidence"
          : "read_latest_productivity",
    result: "ok",
    durationMs: Date.now() - started,
    repositoryAdapter: "postgres",
    ...GOVERNANCE_FLAGS,
  });
}
