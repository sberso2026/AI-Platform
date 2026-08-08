/**
 * Minimum Project Controls Cost Intelligence HTTP API (Phase 11E).
 *
 * Advisory only. Assesses cost posture from evidence; never posts to a ledger,
 * never mutates a budget, never computes earned value or a forecast.
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

const OPERATIONS = new Set(["assess_cost", "review", "publish"]);

const GOVERNANCE_FLAGS = {
  costIntelligenceReady: true,
  costConfidenceEngineReady: true,
  costReviewWorkflowReady: true,
  costPersistenceReady: true,
  costIntelligenceIsAdvisoryOnly: true,
  costEngineImplemented: false,
  budgetLedgerImplemented: false,
  financialPostingImplemented: false,
  earnedValueImplemented: false,
  forecastEngineImplemented: false,
  forecastingImplemented: false,
  contingencyManagementImplemented: false,
  changeIntelligenceReady: true,
  progressIntelligenceReady: true,
  scheduleIntelligenceReady: true,
  sharedProjectDomainReady: true,
  projectContextEngineReady: true,
  financialLedgerOwnership: "external_finance_or_future_finance_domain",
  costIntelligenceOwnership: "project_controls",
  productionProjectControlsReady: false,
  mutatesProjectIdentity: false,
  advisoryOnly: true,
  aiMayPublishCostForbidden: true,
  phase11fReady: true,
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
  const operation = typeof body.operation === "string" ? body.operation : "assess_cost";

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

  const currencyCode =
    typeof controlContext.currencyCode === "string" ? controlContext.currencyCode : "";
  if (operation === "assess_cost" && !currencyCode) {
    return err(400, "missing_currency", "controlContext.currencyCode is required", requestId);
  }

  if (body.financialPostingClaimed === true || body.budgetMutated === true) {
    return err(
      422,
      "financial_posting_forbidden",
      "Project Controls assesses cost intelligence and may not post or mutate ledgers",
      requestId,
    );
  }

  if (operation === "assess_cost") {
    const evidence = Array.isArray(body.evidence) ? body.evidence : [];
    const forbiddenEvidence = evidence.some(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        ((item as Record<string, unknown>).derivedFromEarnedValue === true ||
          (item as Record<string, unknown>).mutatesBudget === true ||
          (item as Record<string, unknown>).financialPostingClaimed === true ||
          (item as Record<string, unknown>).forecastDerived === true),
    );
    if (forbiddenEvidence) {
      return err(
        422,
        "evidence_source_forbidden",
        "Cost evidence may not derive from earned value, mutate budget, claim posting or derive from forecast",
        requestId,
      );
    }
  }

  if (operation === "review" || operation === "publish") {
    const costStateId = typeof body.costStateId === "string" ? body.costStateId : undefined;
    if (!costStateId) {
      return err(400, "missing_state_id", "costStateId is required", requestId);
    }
    const reviewerId = typeof body.reviewerId === "string" ? body.reviewerId : undefined;
    if (!reviewerId) {
      return err(400, "missing_reviewer", "reviewerId is required to review cost", requestId);
    }
    const assessedBy = typeof body.assessedBy === "string" ? body.assessedBy : undefined;
    if (assessedBy && assessedBy === reviewerId) {
      return err(
        403,
        "self_approval_forbidden",
        "The actor who assessed cost may not review or publish it",
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
        ? "read_cost_history"
        : view === "evidence"
          ? "read_cost_evidence"
          : "read_latest_cost",
    result: "ok",
    repositoryAdapter: "postgres",
    ...GOVERNANCE_FLAGS,
  });
}
