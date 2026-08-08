/**
 * Phase 12J — Digital Twin solver-compatibility HTTP API (query-only matrix).
 */
import { NextResponse } from "next/server";
import {
  ASSURANCE_GOVERNANCE,
  assuranceErr,
  parseJsonBody,
  rejectExecuteOnDiscover,
  rejectSolverActivation,
} from "../_assurance";

const OPERATIONS = new Set(["query_compatibility", "list_compatibility", "get_adapter_governance"]);

export async function POST(req: Request) {
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { body, requestId } = parsed;
  const rejected = rejectSolverActivation(body, requestId);
  if (rejected) return rejected;
  const executeRejected = rejectExecuteOnDiscover(body, requestId);
  if (executeRejected) return executeRejected;
  const operation =
    typeof body.operation === "string" ? body.operation : OPERATIONS.values().next().value;
  if (!OPERATIONS.has(operation as string)) {
    return assuranceErr(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId);
  }
  return NextResponse.json(
    {
      accepted: true,
      requestId,
      operation,
      executable: false,
      unexpected5xx: 0,
      ...ASSURANCE_GOVERNANCE,
    },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  return NextResponse.json(
    {
      requestId,
      result: "solver-compatibility_lookup_ready",
      items: [],
      unexpected5xx: 0,
      ...ASSURANCE_GOVERNANCE,
    },
    { status: 200 },
  );
}
