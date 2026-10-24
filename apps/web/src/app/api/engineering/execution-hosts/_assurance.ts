/**
 * Phase 13D.1 — Controlled Engineering Execution Host HTTP assurance helpers.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export function execHostErr(
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

export const EXEC_HOST_GOVERNANCE = {
  ControlledEngineeringExecutionHostReady: true,
  EngineeringExecutionHostRegistryReady: true,
  EngineeringExecutionJobReady: true,
  EngineeringExecutionHostHealthReady: true,
  ProviderHostProbeReady: true,
  ExecutionWorkspaceIsolationReady: true,
  EngineeringExecutionArtifactHandlingReady: true,
  silentSolverFallbackAllowed: false,
  SPACEGASSLiveExecutionCertified: false,
  ETABSAdapterImplemented: false,
  ETABSExecutionCertified: false,
  analysisModelGenerationImplemented: false,
  duplicateToolFrameworkDetected: false,
  DigitalTwinV1Intact: true,
  releaseEligible: true,
  phase13DReCertificationReady: true,
  publicContractVersion: "0.1.0-execution-host",
  unexpected5xx: 0,
} as const;

export async function parseExecHostJsonBody(req: Request): Promise<
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
      response: execHostErr(
        400,
        "invalid_json",
        "Request body must be JSON",
        requestId,
      ),
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
    return execHostErr(
      400,
      "missing_scope",
      "tenantId and workspaceId are required",
      requestId,
    );
  }
  return { tenantId, workspaceId };
}

export function rejectForbiddenExecHostPayload(
  body: Record<string, unknown>,
  requestId: string,
) {
  const forbidden = [
    "licenseKey",
    "licenseSecret",
    "modelBinary",
    "executeSolver",
    "silentSolverFallback",
    "fallbackProvider",
    "generateAnalysisModel",
    "qualifyMethod",
    "qualifyProvider",
  ];
  for (const key of forbidden) {
    if (key in body && body[key] !== undefined && body[key] !== false) {
      return execHostErr(
        422,
        "forbidden_payload",
        `Payload key '${key}' is not allowed on execution-host routes`,
        requestId,
        { key },
      );
    }
  }
  return null;
}
