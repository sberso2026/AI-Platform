/**
 * Phase 12H — Digital Twin application-qualifications HTTP API.
 */
import { NextResponse } from "next/server";
import {
  ASSURANCE_GOVERNANCE,
  assuranceErr,
  parseJsonBody,
  rejectSolverActivation,
} from "../_assurance";

const OPERATIONS = new Set(["register_application_qualification","get_application_qualification","list_application_qualifications"]);

export async function POST(req: Request) {
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { body, requestId } = parsed;
  const rejected = rejectSolverActivation(body, requestId);
  if (rejected) return rejected;
  const operation = typeof body.operation === "string" ? body.operation : "register_application_qualification";
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
      result: "application-qualifications_lookup_ready",
      items: [],
      unexpected5xx: 0,
      ...ASSURANCE_GOVERNANCE,
    },
    { status: 200 },
  );
}
