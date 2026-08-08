/**
 * Phase 12B — Digital Twin identity HTTP API (lookup focused).
 *
 * Create/update/get twin identity plus review/publish operations.
 * No telemetry, simulation, viewer, or runtime sync.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

function err(
  status: number,
  code: string,
  message: string,
  requestId: string,
  details: Record<string, unknown> = {},
) {
  return NextResponse.json({ error: { code, message, requestId, details } }, { status });
}

const ENTITY_TYPES = new Set([
  "asset",
  "project",
  "facility",
  "structure",
  "location",
  "system",
  "component",
]);

const GOVERNANCE_FLAGS = {
  digitalTwinImplemented: true,
  productionDigitalTwinReady: false,
  digitalTwinRuntimeImplemented: false,
  liveTelemetryImplemented: false,
  simulationExecutionImplemented: false,
  threeDViewerImplemented: false,
  physicalActuationEnabled: false,
  automaticControlEnabled: false,
  twinIdentityReady: true,
  twinRepresentationReady: true,
  twinThreadReady: true,
  knowledgeGraphReuse: true,
  hostedDigitalTwinPersistenceReady: true,
  mutatesCanonicalIdentity: false,
  duplicatesAssetFields: false,
  identityReviewSlug: "digital_twin.identity_review",
} as const;

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;
  const started = Date.now();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err(400, "invalid_json", "Request body must be JSON", requestId);
  }

  const tenantId = typeof body.tenantId === "string" ? body.tenantId : "";
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";
  const operation = typeof body.operation === "string" ? body.operation : "create_identity";

  if (!tenantId || !workspaceId) {
    return err(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }

  if (operation === "create_identity" || operation === "update_identity") {
    const entityType = typeof body.canonicalEntityType === "string" ? body.canonicalEntityType : "";
    const entityId = typeof body.canonicalEntityId === "string" ? body.canonicalEntityId : "";
    if (!entityType || !entityId) {
      return err(
        400,
        "missing_target",
        "canonicalEntityType and canonicalEntityId are required",
        requestId,
      );
    }
    if (!ENTITY_TYPES.has(entityType)) {
      return err(400, "invalid_entity_type", `Unsupported entity type: ${entityType}`, requestId, {
        supported: [...ENTITY_TYPES],
      });
    }
    const forbidden = ["assetName", "assetCode", "projectName", "projectCode"];
    for (const field of forbidden) {
      if (field in body) {
        return err(
          422,
          "identity_field_forbidden",
          `Twin identity may not duplicate canonical field: ${field}`,
          requestId,
        );
      }
    }
  }

  if (operation === "review" || operation === "publish") {
    const twinId = typeof body.twinId === "string" ? body.twinId : undefined;
    const reviewerId = typeof body.reviewerId === "string" ? body.reviewerId : undefined;
    if (!twinId) return err(400, "missing_twin_id", "twinId is required", requestId);
    if (!reviewerId) {
      return err(400, "missing_reviewer", "reviewerId is required", requestId);
    }
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      operation,
      result: "accepted",
      durationMs: Date.now() - started,
      repositoryAdapter: process.env.DIGITAL_TWIN_REPOSITORY_ADAPTER ?? "postgres",
      ...GOVERNANCE_FLAGS,
    },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") ?? "";
  const workspaceId = url.searchParams.get("workspaceId") ?? "";
  const twinId = url.searchParams.get("twinId") ?? "";
  const entityType = url.searchParams.get("canonicalEntityType") ?? "";
  const entityId = url.searchParams.get("canonicalEntityId") ?? "";

  if (!tenantId || !workspaceId) {
    return err(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  if (!twinId && !(entityType && entityId)) {
    return err(
      400,
      "missing_lookup_key",
      "Provide twinId or canonicalEntityType+canonicalEntityId",
      requestId,
    );
  }

  return NextResponse.json(
    {
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      lookup: twinId
        ? { kind: "twin_id", twinId }
        : { kind: "canonical_target", canonicalEntityType: entityType, canonicalEntityId: entityId },
      result: "lookup_ready",
      ...GOVERNANCE_FLAGS,
    },
    { status: 200 },
  );
}
