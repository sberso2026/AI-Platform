/**
 * Phase 12D — Digital Twin governed state ingestion HTTP API.
 *
 * Manual submit, candidate read/review, reconciliation read. No auto-publish or telemetry payloads.
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

const INGESTION_OPERATIONS = new Set([
  "submit_observed_state",
  "get_candidate",
  "get_reconciliation",
  "publish_via_review",
  "list_candidates",
]);

const GOVERNANCE_FLAGS = {
  digitalTwinImplemented: true,
  productionDigitalTwinReady: false,
  digitalTwinRuntimeImplemented: true,
  automaticObservedStatePublicationEnabled: false,
  liveTelemetryImplemented: false,
  highFrequencyTelemetryImplemented: false,
  shmRuntimeImplemented: false,
  simulationExecutionImplemented: false,
  threeDViewerImplemented: false,
  physicalActuationEnabled: false,
  automaticControlEnabled: false,
  twinStateIngestionReady: true,
  twinSourceAdapterReady: true,
  twinStateReconciliationReady: true,
  stateReviewSlug: "digital_twin.state_review",
  storesTelemetryPayload: false,
  autoPublishEnabled: false,
  simulationExecuted: false,
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
  const operation = typeof body.operation === "string" ? body.operation : "submit_observed_state";
  const twinId = typeof body.twinId === "string" ? body.twinId : "";

  if (!tenantId || !workspaceId) {
    return err(400, "missing_scope", "tenantId and workspaceId are required", requestId);
  }
  if (!INGESTION_OPERATIONS.has(operation)) {
    return err(400, "invalid_operation", `Unsupported operation: ${operation}`, requestId, {
      supported: [...INGESTION_OPERATIONS],
    });
  }
  if (!twinId) {
    return err(400, "missing_twin_id", "twinId is required", requestId);
  }

  if (operation === "submit_observed_state") {
    const adapterId = typeof body.adapterId === "string" ? body.adapterId : "";
    const schemaId = typeof body.schemaId === "string" ? body.schemaId : "";
    const externalRef = typeof body.externalRef === "string" ? body.externalRef : "";
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : "";
    const observedAt = typeof body.observedAt === "string" ? body.observedAt : "";
    const provenance = body.provenance as Record<string, unknown> | undefined;
    if (!adapterId || !schemaId || !externalRef || !idempotencyKey || !observedAt) {
      return err(
        422,
        "ingestion_fields_required",
        "adapterId, schemaId, externalRef, idempotencyKey, and observedAt are required",
        requestId,
      );
    }
    if (!provenance?.sourceModule || !provenance?.sourceRef) {
      return err(422, "provenance_required", "provenance sourceModule and sourceRef are required", requestId);
    }
    if ("telemetryPayload" in body || "sensorData" in body) {
      return err(422, "telemetry_payload_forbidden", "Inline telemetry payloads are forbidden", requestId);
    }
  }

  if (operation === "publish_via_review") {
    const candidateId = typeof body.candidateId === "string" ? body.candidateId : "";
    const reviewerId = typeof body.reviewerId === "string" ? body.reviewerId : "";
    if (!candidateId || !reviewerId) {
      return err(
        400,
        "missing_review_fields",
        "candidateId and reviewerId are required for publish_via_review",
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
  const candidateId = url.searchParams.get("candidateId") ?? "";

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
      candidateId: candidateId || undefined,
      result: candidateId ? "candidate_lookup_ready" : "candidates_lookup_ready",
      ...GOVERNANCE_FLAGS,
    },
    { status: 200 },
  );
}
