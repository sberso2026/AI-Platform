/**
 * Phase 12G — Digital Twin simulation-reviews HTTP API.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status });
}

const OPERATIONS = new Set(["submit_review", "decide_review", "get_review", "list_reviews"]);

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
    "autoApprove" in body ||
    "aiSelfApprove" in body
  ) {
    return err(
      422,
      "automatic_or_ai_approval_forbidden",
      "Automatic and AI self-approval are forbidden",
      requestId,
    );
  }
  const operation = typeof body.operation === "string" ? body.operation : "submit_review";
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
      result: "simulation-reviews_lookup_ready",
      items: [],
      ...GOVERNANCE,
    },
    { status: 200 },
  );
}
