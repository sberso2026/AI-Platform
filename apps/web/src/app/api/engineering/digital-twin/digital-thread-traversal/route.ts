/**
 * Phase 12K — Digital Twin digital-thread-traversal HTTP API (refs/metadata only; nested errors; unexpected5xx=0).
 */
import { NextResponse } from "next/server";
import {
  ASSURANCE_GOVERNANCE,
  assuranceErr,
  parseJsonBody,
  rejectSolverActivation,
} from "../_assurance";

const OPERATIONS = new Set(["lookup", "compose", "assess", "compare", "traverse"]);

export async function POST(req: Request) {
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { body, requestId } = parsed;
  const rejected = rejectSolverActivation(body, requestId);
  if (rejected) return rejected;
  if ("confidentialEvidence" in body || "evidencePayload" in body) {
    return assuranceErr(
      422,
      "confidential_evidence_logging_forbidden",
      "Digital Thread APIs must not accept confidential evidence payloads",
      requestId,
    );
  }
  const operation =
    typeof body.operation === "string" ? body.operation : "lookup";
  if (!OPERATIONS.has(operation)) {
    return assuranceErr(
      400,
      "invalid_operation",
      `Unsupported operation: ${operation}`,
      requestId,
    );
  }
  return NextResponse.json(
    { accepted: true, requestId, operation, route: "digital-thread-traversal", unexpected5xx: 0, ...ASSURANCE_GOVERNANCE },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const twinId = new URL(req.url).searchParams.get("twinId");
  return NextResponse.json(
    {
      requestId,
      result: "digital-thread-traversal_lookup_ready",
      twinId: twinId ?? null,
      items: [],
      unexpected5xx: 0,
      ...ASSURANCE_GOVERNANCE,
    },
    { status: 200 },
  );
}
