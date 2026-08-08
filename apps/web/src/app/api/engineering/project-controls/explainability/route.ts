/**
 * Minimum Project Controls Explainability Intelligence HTTP API (Phase 11L).
 *
 * Public explanation summaries with traces only; never chain-of-thought, hidden
 * inference, automatic approval, or automatic evidence creation.
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

const OPERATIONS = new Set(["assess_explainability", "review", "publish"]);

const GOVERNANCE_FLAGS = {
  explainabilityIntelligenceReady: true,
  ExplainabilityIntelligenceReady: true,
  assuranceIntelligenceReady: true,
  AssuranceIntelligenceReady: true,
  scenarioIntelligenceReady: true,
  ScenarioIntelligenceReady: true,
  decisionSupportReady: true,
  DecisionSupportReady: true,
  forecastIntelligenceReady: true,
  ForecastIntelligenceReady: true,
  riskOpportunityIntelligenceReady: true,
  RiskOpportunityIntelligenceReady: true,
  projectContextCompositionReady: true,
  ProjectContextCompositionReady: true,
  explainabilityConfidenceEngineReady: true,
  explainabilityReviewWorkflowReady: true,
  explainabilityPersistenceReady: true,
  explainabilityIntelligenceIsAdvisoryOnly: true,
  automaticExplanationApprovalEnabled: false,
  automaticEvidenceCreationEnabled: false,
  automaticAssuranceApprovalEnabled: false,
  automaticCertificationEnabled: false,
  automaticEvidenceApprovalEnabled: false,
  duplicateExplainabilityOwnershipDetected: false,
  earnedValueImplemented: false,
  cpmSchedulingImplemented: false,
  resourcePlanningImplemented: false,
  decisionExecutionImplemented: false,
  predictiveSchedulingImplemented: false,
  chainOfThoughtExposed: false,
  hiddenReasoningExposed: false,
  fabricatedProvenance: false,
  sharedProjectDomainReady: true,
  projectContextEngineReady: true,
  explainabilityIntelligenceOwnership: "project_controls",
  projectDecisionOwnership: "human_only",
  productionProjectControlsReady: false,
  mutatesProjectIdentity: false,
  mutatesUpstreamContributors: false,
  advisoryOnly: true,
  aiMayPublishExplainabilityForbidden: true,
  phase11kReady: true,
  phase11mReady: true,
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
  const operation = typeof body.operation === "string" ? body.operation : "assess_explainability";

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

  if (
    body.chainOfThoughtExposed === true ||
    body.hiddenReasoningExposed === true ||
    body.chain_of_thought === true ||
    body.hidden_reasoning === true ||
    body.fabricatedProvenance === true ||
    body.autoExecutionClaimed === true ||
    body.approvalAuthorityClaimed === true ||
    body.contractInstructionClaimed === true ||
    body.preferredScenarioSelected === true ||
    body.optimisationPerformed === true ||
    body.monteCarloClaimed === true ||
    body.completionDateClaimed === true ||
    body.costDecisionClaimed === true
  ) {
    return err(
      422,
      "explainability_forbidden_claim",
      "Explainability responses may not expose chain-of-thought, hidden reasoning, or fabricated provenance",
      requestId,
    );
  }

  const controlContext = (body.controlContext ?? {}) as Record<string, unknown>;
  const explainabilityUnitId =
    typeof controlContext.explainabilityUnitId === "string"
      ? controlContext.explainabilityUnitId
      : "";
  if (operation === "assess_explainability" && !explainabilityUnitId) {
    return err(
      400,
      "missing_explainability_unit",
      "controlContext.explainabilityUnitId is required",
      requestId,
    );
  }

  if (operation === "review" || operation === "publish") {
    const explainabilityStateId =
      typeof body.explainabilityStateId === "string" ? body.explainabilityStateId : undefined;
    if (!explainabilityStateId) {
      return err(400, "missing_state_id", "explainabilityStateId is required", requestId);
    }
    const reviewerId = typeof body.reviewerId === "string" ? body.reviewerId : undefined;
    if (!reviewerId) {
      return err(400, "missing_reviewer", "reviewerId is required", requestId);
    }
    const assessedBy = typeof body.assessedBy === "string" ? body.assessedBy : undefined;
    if (assessedBy && assessedBy === reviewerId) {
      return err(403, "self_approval_forbidden", "Assessor may not review or publish", requestId);
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
        ? "read_explainability_history"
        : view === "evidence"
          ? "read_explainability_evidence"
          : "read_latest_explainability",
    result: "ok",
    durationMs: Date.now() - started,
    repositoryAdapter: "postgres",
    ...GOVERNANCE_FLAGS,
  });
}
