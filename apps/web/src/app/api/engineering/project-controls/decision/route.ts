/**
 * Minimum Project Controls Decision Support HTTP API (Phase 11H).
 *
 * Advisory options and recommendations only; never auto-executes decisions,
 * schedule changes, cost changes, or contract instructions.
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

const OPERATIONS = new Set(["assess_decision", "review", "publish"]);

const GOVERNANCE_FLAGS = {
  decisionSupportReady: true,
  decisionConfidenceEngineReady: true,
  decisionReviewWorkflowReady: true,
  decisionPersistenceReady: true,
  decisionSupportIsAdvisoryOnly: true,
  forecastIntelligenceReady: true,
  projectContextCompositionReady: true,
  automaticDecisionExecutionEnabled: false,
  automaticScheduleChangeEnabled: false,
  automaticCostChangeEnabled: false,
  automaticContractInstructionEnabled: false,
  earnedValueImplemented: false,
  cpmSchedulingImplemented: false,
  progressIntelligenceReady: true,
  scheduleIntelligenceReady: true,
  changeIntelligenceReady: true,
  costIntelligenceReady: true,
  productivityIntelligenceReady: true,
  resourcePlanningImplemented: false,
  decisionExecutionImplemented: false,
  predictiveSchedulingImplemented: false,
  sharedProjectDomainReady: true,
  projectContextEngineReady: true,
  decisionSupportOwnership: "project_controls",
  projectRecommendationOwnership: "project_controls",
  projectDecisionOwnership: "human_only",
  productionProjectControlsReady: true,
  mutatesProjectIdentity: false,
  mutatesUpstreamContributors: false,
  advisoryOnly: true,
  aiMayPublishDecisionForbidden: true,
  phase11gReady: true,
  phase11hReady: true,
  phase11iReady: true,
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
  const operation = typeof body.operation === "string" ? body.operation : "assess_decision";

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

  const decisionUnitId =
    typeof controlContext.decisionUnitId === "string" ? controlContext.decisionUnitId : "";
  if (operation === "assess_decision" && !decisionUnitId) {
    return err(
      400,
      "missing_decision_unit",
      "controlContext.decisionUnitId is required",
      requestId,
    );
  }

  if (
    body.autoExecutionClaimed === true ||
    body.approvalAuthorityClaimed === true ||
    body.contractInstructionClaimed === true ||
    body.completionDateClaimed === true ||
    body.costDecisionClaimed === true
  ) {
    return err(
      422,
      "decision_execution_forbidden",
      "Project Controls assesses advisory decision support and may not execute or approve projects/contracts",
      requestId,
    );
  }

  if (operation === "review" || operation === "publish") {
    const decisionStateId =
      typeof body.decisionStateId === "string" ? body.decisionStateId : undefined;
    if (!decisionStateId) {
      return err(400, "missing_state_id", "decisionStateId is required", requestId);
    }
    const reviewerId = typeof body.reviewerId === "string" ? body.reviewerId : undefined;
    if (!reviewerId) {
      return err(
        400,
        "missing_reviewer",
        "reviewerId is required to review decision support",
        requestId,
      );
    }
    const assessedBy = typeof body.assessedBy === "string" ? body.assessedBy : undefined;
    if (assessedBy && assessedBy === reviewerId) {
      return err(
        403,
        "self_approval_forbidden",
        "The actor who assessed decision support may not review or publish it",
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
        ? "read_decision_history"
        : view === "evidence"
          ? "read_decision_evidence"
          : "read_latest_decision",
    result: "ok",
    durationMs: Date.now() - started,
    repositoryAdapter: "postgres",
    ...GOVERNANCE_FLAGS,
  });
}
