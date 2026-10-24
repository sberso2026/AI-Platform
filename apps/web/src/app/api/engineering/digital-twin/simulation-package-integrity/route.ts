/**
 * Phase 12H — Digital Twin simulation-package-integrity HTTP API.
 */
import { NextResponse } from "next/server";
import {
  ASSURANCE_GOVERNANCE,
  assuranceErr,
  parseJsonBody,
  rejectSolverActivation,
} from "../_assurance";

const OPERATIONS = new Set(["verify_integrity","get_integrity"]);

export async function POST(req: Request) {
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { body, requestId } = parsed;
  const rejected = rejectSolverActivation(body, requestId);
  if (rejected) return rejected;
  const operation = typeof body.operation === "string" ? body.operation : "verify_integrity";
  if (!OPERATIONS.has(operation)) {
    return assuranceErr(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId);
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
      result: "simulation-package-integrity_lookup_ready",
      items: [],
      unexpected5xx: 0,
      ...ASSURANCE_GOVERNANCE,
    },
    { status: 200 },
  );
}
