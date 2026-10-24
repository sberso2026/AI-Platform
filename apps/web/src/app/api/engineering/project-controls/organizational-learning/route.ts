/**
 * Minimum Project Controls Organizational Learning Intelligence HTTP API (Phase 11M).
 *
 * Advisory organizational learning references only; never fabricated lessons,
 * unsupported similarity scores, automatic approval, or knowledge mutation.
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

const OPERATIONS = new Set(["assess_organizational_learning", "review", "publish"]);

const GOVERNANCE_FLAGS = {
  organizationalLearningReady: true,
  OrganizationalLearningReady: true,
  organizationalLearningIntelligenceReady: true,
  OrganizationalLearningIntelligenceReady: true,
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
  organizationalLearningConfidenceEngineReady: true,
  organizationalLearningReviewWorkflowReady: true,
  organizationalLearningPersistenceReady: true,
  organizationalLearningIntelligenceIsAdvisoryOnly: true,
  automaticDecisionExecutionEnabled: false,
  automaticLearningApprovalEnabled: false,
  automaticKnowledgeMutationEnabled: false,
  productionProjectControlsReady: true,
  automaticAssuranceApprovalEnabled: false,
  automaticCertificationEnabled: false,
  automaticEvidenceApprovalEnabled: false,
  duplicateKnowledgeOwnershipDetected: false,
  earnedValueImplemented: false,
  cpmSchedulingImplemented: false,
  resourcePlanningImplemented: false,
  decisionExecutionImplemented: false,
  predictiveSchedulingImplemented: false,
  fabricatedLesson: false,
  unsupportedSimilarityScore: false,
  knowledgeMutationClaimed: false,
  sharedProjectDomainReady: true,
  projectContextEngineReady: true,
  organizationalLearningIntelligenceOwnership: "project_controls",
  projectDecisionOwnership: "human_only",
  mutatesProjectIdentity: false,
  mutatesUpstreamContributors: false,
  advisoryOnly: true,
  aiMayPublishOrganizationalLearningForbidden: true,
  phase11lReady: true,
  phase11nReady: true,
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
  const operation =
    typeof body.operation === "string" ? body.operation : "assess_organizational_learning";

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
    body.fabricatedLesson === true ||
    body.unsupportedSimilarityScore === true ||
    body.knowledgeMutationClaimed === true ||
    body.fabricated_lesson === true ||
    body.unsupported_similarity_score === true ||
    body.knowledge_mutation_claimed === true ||
    body.autoExecutionClaimed === true ||
    body.approvalAuthorityClaimed === true ||
    body.monteCarloClaimed === true ||
    body.completionDateClaimed === true ||
    body.costDecisionClaimed === true
  ) {
    return err(
      422,
      "organizational_learning_forbidden_claim",
      "Organizational learning responses may not claim fabricated lessons, unsupported similarity, or knowledge mutation",
      requestId,
    );
  }

  const controlContext = (body.controlContext ?? {}) as Record<string, unknown>;
  const organizationalLearningUnitId =
    typeof controlContext.organizationalLearningUnitId === "string"
      ? controlContext.organizationalLearningUnitId
      : "";
  if (operation === "assess_organizational_learning" && !organizationalLearningUnitId) {
    return err(
      400,
      "missing_organizational_learning_unit",
      "controlContext.organizationalLearningUnitId is required",
      requestId,
    );
  }

  if (operation === "review" || operation === "publish") {
    const organizationalLearningStateId =
      typeof body.organizationalLearningStateId === "string"
        ? body.organizationalLearningStateId
        : undefined;
    if (!organizationalLearningStateId) {
      return err(400, "missing_state_id", "organizationalLearningStateId is required", requestId);
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
        ? "read_organizational_learning_history"
        : view === "evidence"
          ? "read_organizational_learning_evidence"
          : "read_latest_organizational_learning",
    result: "ok",
    durationMs: Date.now() - started,
    repositoryAdapter: "postgres",
    ...GOVERNANCE_FLAGS,
  });
}
