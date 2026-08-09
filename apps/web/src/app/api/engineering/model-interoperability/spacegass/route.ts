/**
 * Phase 13C — SPACE GASS provider status, qualification, and fail-closed execution.
 */
import { NextResponse } from "next/server";
import {
  createSPACEGASSSolverAdapter,
  createSpaceGassFourLayerQualificationBundle,
  getSpaceGassProviderStatus,
  SPACEGASS_BOUNDED_METHOD,
} from "@rtb/engineering-model-interoperability";
import {
  INTEROP_GOVERNANCE,
  interopErr,
  parseInteropJsonBody,
  rejectForbiddenInteropPayload,
  requireScope,
} from "../_assurance";

const OPS = new Set([
  "provider_status",
  "qualification",
  "request_execution",
  "list_methods",
]);

export async function POST(req: Request) {
  const parsed = await parseInteropJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { body, requestId, correlationId } = parsed;

  const forbidden = rejectForbiddenInteropPayload(body, requestId);
  if (forbidden) return forbidden;

  const scope = requireScope(body, requestId);
  if (scope instanceof NextResponse) return scope;

  const operation = typeof body.operation === "string" ? body.operation : "provider_status";
  if (!OPS.has(operation)) {
    return interopErr(400, "invalid_operation", `Unknown operation: ${operation}`, requestId);
  }

  if (operation === "provider_status") {
    const status = getSpaceGassProviderStatus();
    return NextResponse.json({
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "spacegass",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      provider: status,
      existingExternalResultLabel: "EXISTING EXTERNAL RESULT",
      rtbCertifiedExecutionLabel: "RTB-CERTIFIED EXECUTION",
      ...INTEROP_GOVERNANCE,
    });
  }

  if (operation === "qualification") {
    const bundle = createSpaceGassFourLayerQualificationBundle({
      evidenceId: requestId.slice(0, 8),
    });
    return NextResponse.json({
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "spacegass",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      selectedMethod: SPACEGASS_BOUNDED_METHOD,
      qualification: bundle,
      spaceGassHostedExecutionCertified: false,
      ...INTEROP_GOVERNANCE,
    });
  }

  if (operation === "list_methods") {
    return NextResponse.json({
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "spacegass",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      methods: [{ methodKey: SPACEGASS_BOUNDED_METHOD, lifecycle: "qualified" }],
      ...INTEROP_GOVERNANCE,
    });
  }

  // request_execution — fail-closed via SPACEGASSSolverAdapter
  const adapter = createSPACEGASSSolverAdapter();
  const modelRefId =
    typeof body.modelRefId === "string" ? body.modelRefId : "unknown";
  const projectId =
    typeof body.projectId === "string" ? body.projectId : undefined;
  const approved = Array.isArray(body.projectApprovedProviders)
    ? (body.projectApprovedProviders as unknown[])
        .filter((p): p is string => typeof p === "string")
        .join(",")
    : typeof body.projectApprovedProviders === "string"
      ? body.projectApprovedProviders
      : "";

  const execResult = await adapter.execute({
    requestId,
    adapterId: adapter.adapterId,
    solverId: "spacegass",
    methodKey:
      typeof body.methodKey === "string" ? body.methodKey : SPACEGASS_BOUNDED_METHOD,
    artifactDir:
      typeof body.artifactDir === "string" ? body.artifactDir : "/tmp/spacegass-exec",
    inputArtifactRefs: [],
    timeoutMs: typeof body.timeoutMs === "number" ? body.timeoutMs : 5000,
    unitSystem: typeof body.unitSystem === "string" ? body.unitSystem : "SI",
    unitCode: typeof body.unitCode === "string" ? body.unitCode : "N_mm_t",
    defaultsManifestVersion:
      typeof body.defaultsManifestVersion === "string"
        ? body.defaultsManifestVersion
        : "1",
    metadata: {
      modelRefId,
      projectId: projectId ?? "",
      projectApprovedProviders: approved,
      platformFileRef:
        typeof body.platformFileRef === "string" ? body.platformFileRef : "",
    },
  });

  const failClosed = execResult.status === "failed";
  return NextResponse.json(
    {
      accepted: !failClosed,
      failClosed,
      requestId,
      correlationId,
      operation: "request_execution",
      route: "spacegass",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      modelRefId,
      execution: execResult,
      spaceGassHostedExecutionCertified: false,
      silentSolverFallbackAllowed: false,
      truthLabels: {
        existingExternalResult: "EXISTING EXTERNAL RESULT",
        rtbCertifiedExecution: "RTB-CERTIFIED EXECUTION",
      },
      ...INTEROP_GOVERNANCE,
    },
    { status: failClosed ? 422 : 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  if (!tenantId || !workspaceId) {
    return interopErr(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  const status = getSpaceGassProviderStatus();
  return NextResponse.json({
    accepted: true,
    requestId,
    operation: "provider_status",
    route: "spacegass",
    tenantId,
    workspaceId,
    provider: status,
    ...INTEROP_GOVERNANCE,
  });
}
