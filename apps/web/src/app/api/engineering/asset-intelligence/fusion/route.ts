/**
 * Minimum Asset Multi-Source Fusion HTTP APIs.
 * Governed composition of published slices — never predictive execution.
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

const GOVERNANCE_FLAGS = {
  predictiveMlEnabled: false,
  predictiveMethodsCertified: false,
  predictiveMlExecuted: false,
  fusionHealthContributionEnabled: false,
  probabilityOfFailureCertified: false,
  rulClaimsCertified: false,
  accuracyClaimsCertified: false,
  autonomousReconciliationForbidden: true,
  createsCoreRisk: false,
  createsWorkOrder: false,
  mutatesCanonicalLifecycle: false,
  isHealthFactor: false,
  canonicalEngineeringRiskOwnership: "engineering_core",
  cmmsWorkOrderOwnership: "none_in_asset_intelligence",
  inspectionIntelligenceContractsConsumed: "1.0.0",
  aiMayPublishForbidden: true,
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
  const assetId = typeof body.assetId === "string" ? body.assetId : "";
  const operation = typeof body.operation === "string" ? body.operation : "assess_fusion";
  if (!tenantId || !workspaceId || !assetId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and assetId are required", requestId);
  }
  if (operation === "review" || operation === "publish") {
    const stateId = typeof body.fusionStateId === "string" ? body.fusionStateId : undefined;
    if (!stateId) {
      return err(400, "missing_state_id", "fusionStateId is required", requestId);
    }
  }
  const iiContractVersion =
    typeof body.inspectionIntelligenceContractVersion === "string"
      ? body.inspectionIntelligenceContractVersion
      : undefined;
  if (iiContractVersion && iiContractVersion !== "1.0.0") {
    return err(
      422,
      "ii_contract_version_forbidden",
      "Only Inspection Intelligence public contract 1.0.0 may be fused",
      requestId,
      { inspectionIntelligenceContractVersion: iiContractVersion },
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
      operation,
      result: "accepted",
      durationMs: Date.now() - started,
      repositoryAdapter: process.env.ASSET_INTELLIGENCE_REPOSITORY_ADAPTER ?? "postgres",
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
  const assetId = url.searchParams.get("assetId") ?? "";
  const view = url.searchParams.get("view") ?? "fusion";
  if (!tenantId || !workspaceId || !assetId) {
    return err(400, "missing_scope", "tenantId, workspaceId, and assetId are required", requestId);
  }
  return NextResponse.json({
    requestId,
    tenantId,
    workspaceId,
    assetId,
    operation:
      view === "history"
        ? "read_fusion_history"
        : view === "reconciliation"
          ? "read_reconciliation_records"
          : "read_fusion",
    result: "ok",
    repositoryAdapter: "postgres",
    ...GOVERNANCE_FLAGS,
  });
}
