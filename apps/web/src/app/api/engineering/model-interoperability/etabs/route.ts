/**
 * Phase 13E — ETABS provider status, qualification, and fail-closed execution.
 * Export federation path — NOT live native COM.
 */
import { NextResponse } from "next/server";
import {
  createETABSSolverAdapter,
  createEtabsQualificationBundle,
  getEtabsProviderStatus,
  ETABS_BOUNDED_METHOD,
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
    const status = getEtabsProviderStatus();
    return NextResponse.json({
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "etabs",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      provider: status,
      federationPath: "export_fixture",
      liveNativeCom: false,
      existingExternalResultLabel: "EXISTING EXTERNAL RESULT",
      rtbCertifiedExecutionLabel: "RTB-CERTIFIED EXECUTION",
      ...INTEROP_GOVERNANCE,
    });
  }

  if (operation === "qualification") {
    const bundle = createEtabsQualificationBundle({
      evidenceId: requestId.slice(0, 8),
    });
    return NextResponse.json({
      ...INTEROP_GOVERNANCE,
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "etabs",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      selectedMethod: ETABS_BOUNDED_METHOD,
      qualification: bundle,
      ETABSHostedExecutionCertified: false,
      ETABSControlledExecutionCertified: false,
      federationPath: "export_fixture",
      liveNativeCom: false,
    });
  }

  if (operation === "list_methods") {
    return NextResponse.json({
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "etabs",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      methods: [
        {
          methodKey: "model_result_export_federation",
          lifecycle: "federation_proven",
        },
        { methodKey: ETABS_BOUNDED_METHOD, lifecycle: "reserved" },
      ],
      ...INTEROP_GOVERNANCE,
    });
  }

  const adapter = createETABSSolverAdapter();
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
    solverId: "etabs",
    methodKey:
      typeof body.methodKey === "string" ? body.methodKey : ETABS_BOUNDED_METHOD,
    artifactDir:
      typeof body.artifactDir === "string" ? body.artifactDir : "/tmp/etabs-exec",
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
      route: "etabs",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      modelRefId,
      execution: execResult,
      truthLabels: {
        existingExternalResult: "EXISTING EXTERNAL RESULT",
        rtbCertifiedExecution: "RTB-CERTIFIED EXECUTION",
        exportFederation: "EXPORT FEDERATION",
      },
      ...INTEROP_GOVERNANCE,
      ETABSHostedExecutionCertified: false,
      ETABSControlledExecutionCertified: false,
      silentSolverFallbackAllowed: false,
      federationPath: "export_fixture",
      liveNativeCom: false,
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
  const status = getEtabsProviderStatus();
  return NextResponse.json({
    accepted: true,
    requestId,
    operation: "provider_status",
    route: "etabs",
    tenantId,
    workspaceId,
    provider: status,
    federationPath: "export_fixture",
    liveNativeCom: false,
    ...INTEROP_GOVERNANCE,
  });
}
