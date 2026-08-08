/**
 * Minimum Project Controls Change Intelligence HTTP API (Phase 11D).
 *
 * Advisory only. This surface assesses what evidence supports about a change.
 * It is not contractual change authority: it never approves, prices or executes
 * a change, never posts to a ledger, never computes earned value, CPM or float,
 * and never mutates canonical project identity.
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

const CHANGE_CLASSES = new Set([
  "scope",
  "design",
  "schedule",
  "cost",
  "technical",
  "contractual",
  "regulatory",
  "procurement",
  "construction",
  "quality",
  "safety",
  "asset_interface",
  "other",
]);

const OPERATIONS = new Set([
  "assess_change",
  "create_candidate",
  "review",
  "publish",
]);

const GOVERNANCE_FLAGS = {
  changeIntelligenceReady: true,
  changeConfidenceEngineReady: true,
  changeReviewWorkflowReady: true,
  changePersistenceReady: true,
  changeIntelligenceIsAdvisoryOnly: true,
  contractualAuthority: false,
  contractualChangeApprovalByAiAllowed: false,
  changeExecutionImplemented: false,
  costEngineImplemented: false,
  costIntelligenceImplemented: false,
  budgetLedgerImplemented: false,
  financialPostingImplemented: false,
  earnedValueImplemented: false,
  cpmImplemented: false,
  floatComputationImplemented: false,
  forecastingImplemented: false,
  contingencyManagementImplemented: false,
  productionProjectControlsReady: false,
  progressIntelligenceReady: true,
  scheduleIntelligenceReady: true,
  sharedProjectDomainReady: true,
  projectContextEngineReady: true,
  canonicalProjectIdentityOwnership: "engineering_os_shared_project_domain",
  financialLedgerOwnership: "external_finance_or_future_finance_domain",
  mutatesProjectIdentity: false,
  advisoryOnly: true,
  aiMayPublishChangeForbidden: true,
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
  const operation = typeof body.operation === "string" ? body.operation : "assess_change";

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

  const scope = (body.scope ?? {}) as Record<string, unknown>;
  const scopeKind = typeof scope.kind === "string" ? scope.kind : "project";
  if (!SCOPE_KINDS.has(scopeKind)) {
    return err(400, "invalid_scope_kind", `Unsupported scope kind: ${scopeKind}`, requestId, {
      supported: [...SCOPE_KINDS],
    });
  }
  const scopeReferenceId =
    typeof scope.referenceId === "string" ? scope.referenceId : undefined;
  if (scopeKind !== "project" && !scopeReferenceId) {
    return err(
      400,
      "missing_scope_reference",
      "scope.referenceId is required for non-project scopes",
      requestId,
    );
  }

  const changeClass = typeof body.changeClass === "string" ? body.changeClass : undefined;
  if (changeClass && !CHANGE_CLASSES.has(changeClass)) {
    return err(400, "invalid_change_class", `Unsupported change class: ${changeClass}`, requestId, {
      supported: [...CHANGE_CLASSES],
    });
  }

  if (body.contractualApprovalClaimed === true) {
    return err(
      422,
      "contractual_approval_forbidden",
      "Project Controls assesses change intelligence and may not claim contractual approval",
      requestId,
      { contractualAuthority: false },
    );
  }

  if (operation === "create_candidate") {
    const signals = Array.isArray(body.signals) ? body.signals : [];
    if (signals.length === 0) {
      return err(
        400,
        "missing_signals",
        "At least one change signal is required to create a candidate",
        requestId,
      );
    }
    const forbiddenSignal = signals.some(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        ((item as Record<string, unknown>).contractualApprovalClaimed === true ||
          (item as Record<string, unknown>).mutatesBudget === true),
    );
    if (forbiddenSignal) {
      return err(
        422,
        "signal_claim_forbidden",
        "Change signals may not claim contractual approval or mutate a budget",
        requestId,
      );
    }
  }

  if (operation === "assess_change") {
    if (!changeClass) {
      return err(400, "missing_change_class", "changeClass is required to assess", requestId, {
        supported: [...CHANGE_CLASSES],
      });
    }
    const evidence = Array.isArray(body.evidence) ? body.evidence : [];
    const forbiddenEvidence = evidence.some(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        ((item as Record<string, unknown>).derivedFromEarnedValue === true ||
          (item as Record<string, unknown>).mutatesCoreRisk === true ||
          (item as Record<string, unknown>).mutatesBudget === true ||
          (item as Record<string, unknown>).contractualApprovalClaimed === true),
    );
    if (forbiddenEvidence) {
      return err(
        422,
        "evidence_source_forbidden",
        "Change evidence may not derive from earned value, mutate core risk or budget, or claim contractual approval",
        requestId,
      );
    }
  }

  if (operation === "review" || operation === "publish") {
    const changeStateId =
      typeof body.changeStateId === "string" ? body.changeStateId : undefined;
    if (!changeStateId) {
      return err(400, "missing_state_id", "changeStateId is required", requestId);
    }
    const reviewerId = typeof body.reviewerId === "string" ? body.reviewerId : undefined;
    if (!reviewerId) {
      return err(400, "missing_reviewer", "reviewerId is required to review change", requestId);
    }
    const assessedBy = typeof body.assessedBy === "string" ? body.assessedBy : undefined;
    if (assessedBy && assessedBy === reviewerId) {
      return err(
        403,
        "self_approval_forbidden",
        "The actor who assessed a change may not review or publish it",
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
      scope: { kind: scopeKind, projectId, referenceId: scopeReferenceId },
      changeClass,
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
  const scopeKind = url.searchParams.get("scopeKind") ?? "project";
  const scopeReferenceId = url.searchParams.get("scopeReferenceId") ?? undefined;
  const changeClass = url.searchParams.get("changeClass") ?? undefined;
  const view = url.searchParams.get("view") ?? "latest";

  if (!tenantId || !workspaceId || !projectId) {
    return err(
      400,
      "missing_scope",
      "tenantId, workspaceId, and projectId are required",
      requestId,
    );
  }
  if (!SCOPE_KINDS.has(scopeKind)) {
    return err(400, "invalid_scope_kind", `Unsupported scope kind: ${scopeKind}`, requestId, {
      supported: [...SCOPE_KINDS],
    });
  }
  if (scopeKind !== "project" && !scopeReferenceId) {
    return err(
      400,
      "missing_scope_reference",
      "scopeReferenceId is required for non-project scopes",
      requestId,
    );
  }
  if (changeClass && !CHANGE_CLASSES.has(changeClass)) {
    return err(400, "invalid_change_class", `Unsupported change class: ${changeClass}`, requestId, {
      supported: [...CHANGE_CLASSES],
    });
  }

  return NextResponse.json({
    requestId,
    tenantId,
    workspaceId,
    projectId,
    scope: { kind: scopeKind, projectId, referenceId: scopeReferenceId },
    changeClass,
    operation:
      view === "history"
        ? "read_change_history"
        : view === "evidence"
          ? "read_change_evidence"
          : view === "candidates"
            ? "read_change_candidates"
            : view === "timeline"
              ? "read_project_timeline"
              : "read_latest_change",
    result: "ok",
    repositoryAdapter: "postgres",
    ...GOVERNANCE_FLAGS,
  });
}
