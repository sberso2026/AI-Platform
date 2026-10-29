/**
 * Phase 12M — Spatial reference reviews (no AI self-approval).
 */
import { NextResponse } from "next/server";
import {
  parseSpatialJsonBody,
  rejectForbiddenSpatialPayload,
  requireScope,
  spatialErr,
  SPATIAL_GOVERNANCE,
} from "../_assurance";

const OPS = new Set(["record", "list"]);
const DECISIONS = new Set(["approve", "reject", "request_changes", "abstain"]);

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

  if (operation === "record") {
    const decision = typeof body.decision === "string" ? body.decision : "";
    const spatialReferenceId =
      typeof body.spatialReferenceId === "string" ? body.spatialReferenceId : "";
    if (!spatialReferenceId || !DECISIONS.has(decision)) {
      return spatialErr(
        400,
        "invalid_review",
        "spatialReferenceId and valid decision are required",
        requestId,
      );
    }
    if (body.aiSelfApproval === true) {
      return spatialErr(
        422,
        "ai_self_approval_forbidden",
        "AI may not self-approve spatial references",
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
      route: "reviews",
      workflowSlug: "engineering_shared_spatial_domain.spatial_reference_review",
      aiSelfApproval: false,
      ...SPATIAL_GOVERNANCE,
    },
    { status: operation === "record" ? 202 : 200 },
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
      route: "reviews",
      workflowSlug: "engineering_shared_spatial_domain.spatial_reference_review",
      aiSelfApproval: false,
      tenantId,
      workspaceId,
      ...SPATIAL_GOVERNANCE,
    },
    { status: 200 },
  );
}
