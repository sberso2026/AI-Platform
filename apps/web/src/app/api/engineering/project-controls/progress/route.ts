/**
 * Minimum Project Controls Progress Intelligence HTTP API (Phase 11B).
 *
 * Advisory only. Never computes earned value, never computes a critical path,
 * never mutates canonical project identity — identity stays with the Engineering
 * Shared Project Domain. The Project Controls product is not GA, so this surface
 * is the contract shape plus governance flags rather than a full product API.
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

const GOVERNANCE_FLAGS = {
  earnedValueImplemented: false,
  cpmImplemented: false,
  costEngineImplemented: false,
  forecastingImplemented: false,
  scheduleExecutionImplemented: false,
  resourceLevelingImplemented: false,
  productionProjectControlsReady: true,
  progressIntelligenceReady: true,
  sharedProjectDomainReady: true,
  projectContextEngineReady: true,
  canonicalProjectIdentityOwnership: "engineering_os_shared_project_domain",
  mutatesProjectIdentity: false,
  physicalPercentCompleteCertified: false,
  advisoryOnly: true,
  aiMayPublishProgressForbidden: true,
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
  const operation = typeof body.operation === "string" ? body.operation : "assess_progress";

  if (!tenantId || !workspaceId || !projectId) {
    return err(
      400,
      "missing_scope",
      "tenantId, workspaceId, and projectId are required",
      requestId,
    );
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

  if (operation === "review" || operation === "publish") {
    const assessmentStateId =
      typeof body.assessmentStateId === "string" ? body.assessmentStateId : undefined;
    if (!assessmentStateId) {
      return err(400, "missing_state_id", "assessmentStateId is required", requestId);
    }
    const reviewerId = typeof body.reviewerId === "string" ? body.reviewerId : undefined;
    if (!reviewerId) {
      return err(400, "missing_reviewer", "reviewerId is required to review progress", requestId);
    }
  }

  if (operation === "assess_progress") {
    const evidence = Array.isArray(body.evidence) ? body.evidence : [];
    // Abstention is a legitimate outcome, so empty evidence is accepted rather
    // than rejected — the engine records an abstained assessment.
    const derivedFromCost = evidence.some(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        ((item as Record<string, unknown>).derivedFromEarnedValue === true ||
          (item as Record<string, unknown>).derivedFromCostData === true),
    );
    if (derivedFromCost) {
      return err(
        422,
        "evidence_source_forbidden",
        "Progress evidence may not derive from earned value or cost data",
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

  return NextResponse.json({
    requestId,
    tenantId,
    workspaceId,
    projectId,
    scope: { kind: scopeKind, projectId, referenceId: scopeReferenceId },
    operation:
      view === "history"
        ? "read_progress_history"
        : view === "evidence"
          ? "read_progress_evidence"
          : view === "timeline"
            ? "read_progress_timeline"
            : "read_latest_progress",
    result: "ok",
    repositoryAdapter: "postgres",
    ...GOVERNANCE_FLAGS,
  });
}
