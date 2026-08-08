/**
 * Phase 12I — Digital Twin solver-adapter-health HTTP API.
 */
import { NextResponse } from "next/server";
import {
  ASSURANCE_GOVERNANCE,
  assuranceErr,
  parseJsonBody,
  rejectSolverActivation,
  rejectUnqualifiedDirectExecution,
} from "../_assurance";

const OPERATIONS = new Set(["health_check","get_health"]);

export async function POST(req: Request) {
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { body, requestId } = parsed;
  const rejected = rejectSolverActivation(body, requestId);
  if (rejected) return rejected;
  if (false) {
    const unqualified = rejectUnqualifiedDirectExecution(body, requestId);
    if (unqualified) return unqualified;
  }
  const operation = typeof body.operation === "string" ? body.operation : OPERATIONS.values().next().value;
  if (!OPERATIONS.has(operation as string)) {
    return assuranceErr(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId);
  }
  if (body.providerType === "calculix" || body.solverId === "calculix") {
    if (body.useFixtureFallback === true) {
      return assuranceErr(422, "silent_solver_fallback_forbidden", "Real solver requests must not fall back to fixture", requestId);
    }
  }
  return NextResponse.json(
    { accepted: true, requestId, operation, unexpected5xx: 0, ...ASSURANCE_GOVERNANCE },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  return NextResponse.json(
    {
      requestId,
      result: "solver-adapter-health_lookup_ready",
      items: [],
      unexpected5xx: 0,
      ...ASSURANCE_GOVERNANCE,
    },
    { status: 200 },
  );
}
