/**
 * Phase 12M — Legacy TEXT spatial reconciliation (never auto-canonical).
 */
import { NextResponse } from "next/server";
import {
  parseSpatialJsonBody,
  rejectForbiddenSpatialPayload,
  requireScope,
  spatialErr,
  SPATIAL_GOVERNANCE,
} from "../_assurance";

const OPS = new Set(["classify", "confirm", "get", "list"]);
const STATES = new Set([
  "unmapped",
  "candidate_match",
  "confirmed",
  "conflicting",
  "legacy_only",
  "unknown",
]);

export async function POST(req: Request) {
  const parsed = await parseSpatialJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { body, requestId, correlationId } = parsed;

  const forbidden = rejectForbiddenSpatialPayload(body, requestId);
  if (forbidden) return forbidden;

  const scope = requireScope(body, requestId);
  if (scope instanceof NextResponse) return scope;

  const operation = typeof body.operation === "string" ? body.operation : "list";
  if (!OPS.has(operation)) {
    return spatialErr(400, "invalid_operation", `Unknown operation: ${operation}`, requestId);
  }

  if (operation === "classify") {
    const state = typeof body.state === "string" ? body.state : "unmapped";
    if (!STATES.has(state)) {
      return spatialErr(400, "invalid_reconciliation_state", `Unknown state: ${state}`, requestId);
    }
    if (body.isCanonical === true || body.autoCanonical === true) {
      return spatialErr(
        422,
        "legacy_auto_canonical_forbidden",
        "Legacy TEXT must not silently become canonical",
        requestId,
      );
    }
  }

  if (operation === "confirm") {
    const confirmedId =
      typeof body.confirmedSpatialReferenceId === "string"
        ? body.confirmedSpatialReferenceId
        : "";
    if (!confirmedId) {
      return spatialErr(
        400,
        "confirmed_spatial_reference_id_required",
        "confirmedSpatialReferenceId is required",
        requestId,
      );
    }
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      operation,
      route: "legacy-reconciliation",
      isCanonical: false,
      candidateIsNotCanonical: true,
      ...SPATIAL_GOVERNANCE,
    },
    { status: operation === "classify" || operation === "confirm" ? 202 : 200 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  if (!tenantId || !workspaceId) {
    return spatialErr(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  return NextResponse.json(
    {
      accepted: true,
      requestId,
      operation: "list",
      route: "legacy-reconciliation",
      isCanonical: false,
      tenantId,
      workspaceId,
      ...SPATIAL_GOVERNANCE,
    },
    { status: 200 },
  );
}
