/**
 * Phase 12J — Digital Twin capability-reviews HTTP API (digital_twin.capability_review).
 */
import { NextResponse } from "next/server";
import {
  ASSURANCE_GOVERNANCE,
  assuranceErr,
  parseJsonBody,
  rejectExecuteOnDiscover,
  rejectSolverActivation,
} from "../_assurance";

const OPERATIONS = new Set(["start_review", "submit_review", "decide_review", "get_review"]);

export async function POST(req: Request) {
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { body, requestId } = parsed;
  const rejected = rejectSolverActivation(body, requestId);
  if (rejected) return rejected;
  const executeRejected = rejectExecuteOnDiscover(body, requestId);
  if (executeRejected) return executeRejected;
  if (
    body.decidedBy === "ai" ||
    body.decidedBy === "system_auto" ||
    body.aiSelfApproval === true ||
    body.automaticApproval === true
  ) {
    return assuranceErr(
      422,
      "automatic_or_ai_self_approval_forbidden",
      "Capability reviews forbid AI/system self-approval",
      requestId,
    );
  }
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
      reviewSlug: "digital_twin.capability_review",
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
      result: "capability-reviews_lookup_ready",
      items: [],
      reviewSlug: "digital_twin.capability_review",
      unexpected5xx: 0,
      ...ASSURANCE_GOVERNANCE,
    },
    { status: 200 },
  );
}
