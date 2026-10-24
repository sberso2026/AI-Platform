/**
 * Phase 12J — Digital Twin capability-discovery HTTP API (query-only).
 */
import { NextResponse } from "next/server";
import {
  ASSURANCE_GOVERNANCE,
  assuranceErr,
  parseJsonBody,
  rejectExecuteOnDiscover,
  rejectSolverActivation,
} from "../_assurance";

const OPERATIONS = new Set(["discover", "get_capability", "list_capabilities"]);

export async function POST(req: Request) {
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { body, requestId } = parsed;
  const rejected = rejectSolverActivation(body, requestId);
  if (rejected) return rejected;
  const executeRejected = rejectExecuteOnDiscover(body, requestId);
  if (executeRejected) return executeRejected;
  const operation =
    typeof body.operation === "string" ? body.operation : "discover";
  if (!OPERATIONS.has(operation as string)) {
    return assuranceErr(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId);
  }
  return NextResponse.json(
    {
      accepted: true,
      requestId,
      operation,
      executed: false,
      autoQualified: false,
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
      result: "capability-discovery_lookup_ready",
      items: [],
      executed: false,
      unexpected5xx: 0,
      ...ASSURANCE_GOVERNANCE,
    },
    { status: 200 },
  );
}
