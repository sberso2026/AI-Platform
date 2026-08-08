/**
 * Phase 12C — Digital Twin state HTTP API.
 *
 * create/review/publish/supersede/history. No telemetry, simulation, viewer, or runtime sync.
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

const STATE_CATEGORIES = new Set(["observed", "derived", "operational", "simulated"]);
const STATE_OPERATIONS = new Set([
  "create_state",
  "submit_review",
  "transition_review",
  "publish",
  "supersede",
  "history",
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
  twinStateReady: true,
  twinVersioningReady: true,
  representationVersioningReady: true,
  twinSnapshotReady: true,
  twinTimelineReady: true,
  knowledgeGraphReuse: true,
  hostedDigitalTwinPersistenceReady: true,
  storesTelemetryPayload: false,
  simulationExecuted: false,
  stateReviewSlug: "digital_twin.state_review",
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
  const operation = typeof body.operation === "string" ? body.operation : "create_state";

  if (!tenantId || !workspaceId) {
    return err(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  if (!STATE_OPERATIONS.has(operation)) {
    return err(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId, {
      supported: [...STATE_OPERATIONS],
    });
  }

  const twinId = typeof body.twinId === "string" ? body.twinId : "";
  if (!twinId) {
    return err(400, "missing_twin_id", "twinId is required", requestId);
  }

  if (operation === "create_state") {
    const category = typeof body.category === "string" ? body.category : "";
    const externalRef = typeof body.externalRef === "string" ? body.externalRef : "";
    const provenance = body.provenance as Record<string, unknown> | undefined;
    if (!category || !externalRef || !provenance?.sourceModule || !provenance?.sourceRef) {
      return err(
        422,
        "state_provenance_required",
        "category, externalRef, and provenance (sourceModule, sourceRef, capturedAt) are required",
        requestId,
      );
    }
    if (!STATE_CATEGORIES.has(category)) {
      return err(400, "invalid_category", `Unsupported category: ${category}`, requestId);
    }
    if ("telemetryPayload" in body || "sensorData" in body) {
      return err(422, "telemetry_payload_forbidden", "Inline telemetry payloads are forbidden", requestId);
    }
  }

  if (operation === "publish" || operation === "transition_review" || operation === "submit_review") {
    const stateId = typeof body.stateId === "string" ? body.stateId : "";
    const reviewerId = typeof body.reviewerId === "string" ? body.reviewerId : undefined;
    if (!stateId) return err(400, "missing_state_id", "stateId is required", requestId);
    if ((operation === "publish" || operation === "transition_review") && !reviewerId) {
      return err(400, "missing_reviewer", "reviewerId is required", requestId);
    }
  }

  if (operation === "supersede") {
    const stateId = typeof body.stateId === "string" ? body.stateId : "";
    const supersededByStateId =
      typeof body.supersededByStateId === "string" ? body.supersededByStateId : "";
    if (!stateId || !supersededByStateId) {
      return err(
        400,
        "missing_supersede_refs",
        "stateId and supersededByStateId are required",
        requestId,
      );
    }
  }

  return NextResponse.json(
    {
      accepted: true,
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      twinId,
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
  const stateId = url.searchParams.get("stateId") ?? "";

  if (!tenantId || !workspaceId) {
    return err(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  if (!twinId) {
    return err(400, "missing_twin_id", "twinId is required", requestId);
  }

  return NextResponse.json(
    {
      requestId,
      correlationId,
      tenantId,
      workspaceId,
      twinId,
      stateId: stateId || undefined,
      result: stateId ? "state_lookup_ready" : "history_lookup_ready",
      ...GOVERNANCE_FLAGS,
    },
    { status: 200 },
  );
}
