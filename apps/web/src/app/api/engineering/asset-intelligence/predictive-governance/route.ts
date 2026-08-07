/**
 * Predictive method governance HTTP APIs (no production prediction endpoint).
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
  return NextResponse.json(
    { error: { code, message, requestId, details } },
    { status },
  );
}

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
  const assetId = typeof body.assetId === "string" ? body.assetId : "";
  const operation =
    typeof body.operation === "string" ? body.operation : "assess_objective_readiness";
  if (!tenantId || !workspaceId || !assetId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and assetId are required", requestId);
  }
  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      assetId,
      objectiveId: body.objectiveId ?? null,
      methodId: body.methodId ?? null,
      operation,
      result: "accepted",
      durationMs: Date.now() - started,
      repositoryAdapter: process.env.ASSET_INTELLIGENCE_REPOSITORY_ADAPTER ?? "postgres",
      predictiveMlEnabled: false,
      predictiveMethodsCertified: false,
      productionPredictiveExecutionEnabled: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      predictiveHealthContributionEnabled: false,
      containsPredictionOutput: false,
      aiMayPublishForbidden: true,
    },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  const assetId = url.searchParams.get("assetId") ?? "";
  const view = url.searchParams.get("view") ?? "objectives";
  if (!tenantId || !workspaceId) {
    return err(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  return NextResponse.json({
    requestId,
    tenantId,
    workspaceId,
    assetId: assetId || null,
    operation:
      view === "methods"
        ? "read_method_registry"
        : view === "eligibility"
          ? "read_method_eligibility"
          : view === "candidates"
            ? "read_method_candidates"
            : view === "qualifications"
              ? "read_qualifications"
              : view === "readiness"
                ? "read_objective_readiness"
                : "read_predictive_objectives",
    result: "ok",
    repositoryAdapter: "postgres",
    productionPredictiveExecutionEnabled: false,
    predictiveMlEnabled: false,
  });
}
