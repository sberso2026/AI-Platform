/**
 * Minimum failure intelligence HTTP APIs.
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
  const operation = typeof body.operation === "string" ? body.operation : "assess_failure";
  if (!tenantId || !workspaceId || !assetId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and assetId are required", requestId);
  }
  if (operation === "review_failure") {
    return NextResponse.json(
      {
        accepted: true,
        requestId,
        correlationId,
        tenantId,
        workspaceId,
        assetId,
        operation: "review_failure",
        result: "accepted",
        durationMs: Date.now() - started,
        repositoryAdapter: process.env.ASSET_INTELLIGENCE_REPOSITORY_ADAPTER ?? "postgres",
        aiMayPublishForbidden: true,
        probabilityOfFailureCertified: false,
      },
      { status: 202 },
    );
  }
  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      assetId,
      operation: "assess_failure",
      result: "accepted",
      durationMs: Date.now() - started,
      repositoryAdapter: process.env.ASSET_INTELLIGENCE_REPOSITORY_ADAPTER ?? "postgres",
      failureHealthContributionEnabled: false,
      probabilityOfFailureCertified: false,
      accuracyClaimsCertified: false,
      rulClaimsCertified: false,
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
  const view = url.searchParams.get("view") ?? "failure";
  if (!tenantId || !workspaceId || !assetId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and assetId are required", requestId);
  }
  return NextResponse.json({
    requestId,
    tenantId,
    workspaceId,
    assetId,
    operation:
      view === "mechanism"
        ? "read_failure_mechanism"
        : view === "history"
          ? "read_failure_history"
          : view === "taxonomy"
            ? "query_failure_taxonomy"
            : "read_failure",
    result: "ok",
    repositoryAdapter: "postgres",
    taxonomyVersion: "1.0.0",
  });
}
