/**
 * Phase 12G — Digital Twin simulation-runs HTTP API.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const OPERATIONS = new Set(["execute_run", "get_run", "list_runs"]);

const GOVERNANCE = {
  twinSimulationFrameworkReady: true,
  simulationExecutionImplemented: true,
  nativeEngineeringSolverImplemented: false,
  simulationOptimizationImplemented: false,
  automaticSimulationApprovalEnabled: false,
  predictiveTwinImplemented: false,
  shmRuntimeImplemented: false,
  duplicateEngineeringToolFrameworkDetected: false,
} as const;

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }
  if (
    "nativeSolver" in body ||
    "publishObservedState" in body
  ) {
    return err(
      422,
      "native_solver_or_observed_publish_forbidden",
      "Native solvers and observed-state publication are forbidden",
      requestId,
    );
  }
  const operation = typeof body.operation === "string" ? body.operation : "execute_run";
  if (!OPERATIONS.has(operation)) {
    return err(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId);
  }
  return NextResponse.json({ accepted: true, requestId, operation, ...GOVERNANCE }, { status: 202 });
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const url = new URL(req.url);
  return NextResponse.json(
    {
      requestId,
      result: "simulation-runs_lookup_ready",
      items: [],
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}
