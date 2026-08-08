/**
 * Phase 12G — Digital Twin simulation-validation HTTP API.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const OPERATIONS = new Set(["validate_result", "get_validation", "list_validations"]);

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
    "autoValidate" in body ||
    "autoApprove" in body
  ) {
    return err(
      422,
      "auto_validation_forbidden",
      "Automatic validation/approval is forbidden",
      requestId,
    );
  }
  const operation = typeof body.operation === "string" ? body.operation : "validate_result";
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
      result: "simulation-validation_lookup_ready",
      items: [],
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}
