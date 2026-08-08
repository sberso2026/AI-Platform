/**
 * Shared Phase 12J solver capability HTTP helpers (extends 12I assurance).
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export function assuranceErr(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

export const ASSURANCE_GOVERNANCE = {
  twinSimulationFrameworkReady: true,
  simulationMethodQualificationReady: true,
  simulationProviderQualificationReady: true,
  simulationApplicationQualificationReady: true,
  simulationExecutionQualificationReady: true,
  simulationQualificationEligibilityReady: true,
  twinSimulationPackageReady: true,
  simulationPackageIntegrityReady: true,
  simulationReproducibilityReady: true,
  externalSolverAdapterFrameworkReady: true,
  firstRealEngineeringSolverAdapterImplemented: true,
  firstRealEngineeringSolverMethodCertified: true,
  firstRealSolverId: "calculix",
  externalSolverCountCertified: 1,
  silentSolverFallbackAllowed: false,
  realSolverExecutionCertified: true,
  calculixAdapterIntact: true,
  solverCapabilityRegistryReady: true,
  providerCompatibilityMatrixReady: true,
  capabilityDiscoveryReady: true,
  simulationPackageExtended: true,
  fourLayerQualificationIntact: true,
  digitalThreadIntelligenceReady: true,
  provenanceReady: true,
  integrityAssessmentReady: true,
  temporalTraversalReady: true,
  changeSetReady: true,
  knowledgeGraphReuseReady: true,
  duplicateKnowledgeGraphDetected: false,
  simulationExecutionImplemented: true,
  nativeEngineeringSolverImplemented: false,
  externalEngineeringSolverAdaptersImplemented: true,
  simulationOptimizationImplemented: false,
  automaticSimulationApprovalEnabled: false,
  predictiveTwinImplemented: false,
  shmRuntimeImplemented: false,
  spatialOwnershipFullyResolved: false,
  duplicateEngineeringToolFrameworkDetected: false,
  duplicateSolverOwnershipDetected: false,
  productionDigitalTwinReady: false,
  phase12IReady: true,
  phase12JReady: true,
  phase12KReady: true,
  phase12LReady: true,
} as const;

export function rejectSolverActivation(body: Record<string, unknown>, requestId: string) {
  const forbidden = [
    "nativeSolver",
    "solverBinary",
    "feaPayload",
    "activateAnsys",
    "activateAbaqus",
    "activateOpenSees",
    "activateOpenFOAM",
    "activateSap2000",
    "activateEtabs",
    "activateStaad",
    "activateSpaceGass",
  ];
  for (const key of forbidden) {
    if (key in body) {
      return assuranceErr(
        422,
        "external_or_native_solver_activation_forbidden",
        `Forbidden payload key: ${key}`,
        requestId,
      );
    }
  }
  return null;
}

export function rejectUnqualifiedDirectExecution(
  body: Record<string, unknown>,
  requestId: string,
) {
  if (body.executeWithoutQualification === true || body.bypassQualification === true) {
    return assuranceErr(
      422,
      "unqualified_direct_execution_forbidden",
      "Qualification chain required before real solver execution",
      requestId,
    );
  }
  return null;
}

/** Discovery must never execute. */
export function rejectExecuteOnDiscover(
  body: Record<string, unknown>,
  requestId: string,
) {
  const forbidden = [
    "execute",
    "autoExecute",
    "runOnDiscover",
    "executeOnDiscover",
    "spawnSolver",
    "runBenchmark",
  ];
  for (const key of forbidden) {
    if (key in body && body[key] !== undefined && body[key] !== false) {
      return assuranceErr(
        422,
        "capability_discovery_execute_forbidden",
        `Discovery is query-only; forbidden key: ${key}`,
        requestId,
      );
    }
  }
  return null;
}

export function parseJsonBody(req: Request): Promise<
  | { ok: true; body: Record<string, unknown>; requestId: string }
  | { ok: false; response: NextResponse }
> {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  return req
    .json()
    .then((body) => {
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return {
          ok: false as const,
          response: assuranceErr(400, "invalid_json", "Request body must be a JSON object", requestId),
        };
      }
      return { ok: true as const, body: body as Record<string, unknown>, requestId };
    })
    .catch(() => ({
      ok: false as const,
      response: assuranceErr(400, "invalid_json", "Request body must be JSON", requestId),
    }));
}
