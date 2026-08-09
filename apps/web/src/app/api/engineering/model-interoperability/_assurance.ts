/**
 * Phase 13B — Engineering Model Interoperability HTTP assurance helpers.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export function interopErr(
  status: number,
  code: string,
  message: string,
  requestId: string,
  details: Record<string, unknown> = {},
) {
  return NextResponse.json({ error: { code, message, requestId, details } }, { status });
}

export const INTEROP_GOVERNANCE = {
  EngineeringModelInteroperabilityRuntimeReady: true,
  IFCFederationReady: true,
  InteropDiscoveryReady: true,
  EngineeringFederationModelLocked: true,
  sourceModelOwnershipPreserved: true,
  digitalTwinMayOwnSourceModel: false,
  duplicateModelOwnershipDetected: false,
  productionInteroperabilityRuntimeImplemented: true,
  automaticAnalysisModelCertificationEnabled: false,
  solverExecutionImplemented: false,
  additionalExternalSolverExecutionImplemented: false,
  modelMutationImplemented: false,
  analysisModelGenerationImplemented: false,
  fullBimViewerImplemented: false,
  productionMemoryRepositoryAllowed: false,
  modelBinaryStorageInPostgres: false,
  DigitalTwinV1Intact: true,
  phase13CReady: true,
  unexpected5xx: 0,
} as const;

export async function parseInteropJsonBody(req: Request): Promise<
  | { ok: true; body: Record<string, unknown>; requestId: string; correlationId: string }
  | { ok: false; response: NextResponse }
> {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    return { ok: true, body, requestId, correlationId };
  } catch {
    return {
      ok: false,
      response: interopErr(400, "invalid_json", "Request body must be JSON", requestId),
    };
  }
}

export function requireScope(
  body: Record<string, unknown>,
  requestId: string,
): { tenantId: string; workspaceId: string } | NextResponse {
  const tenantId = typeof body.tenantId === "string" ? body.tenantId : "";
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";
  if (!tenantId || !workspaceId) {
    return interopErr(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  return { tenantId, workspaceId };
}

export function rejectForbiddenInteropPayload(
  body: Record<string, unknown>,
  requestId: string,
) {
  const forbidden = [
    "modelBinary",
    "geometryBlob",
    "executeSolver",
    "mutateModel",
    "generateAnalysisModel",
    "aiApprove",
    "aiSelfApproval",
    "autoConfirmMapping",
    "fullBimViewer",
  ];
  for (const key of forbidden) {
    if (key in body && body[key] !== undefined && body[key] !== false) {
      return interopErr(
        422,
        "forbidden_interop_capability",
        `Forbidden payload key: ${key}`,
        requestId,
      );
    }
  }
  return null;
}
