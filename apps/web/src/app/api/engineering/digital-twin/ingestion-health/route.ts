/**
 * Phase 12D — Digital Twin ingestion health HTTP API.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { listSourceAdapters } from "@rtb/digital-twin";

function err(
  status: number,
  code: string,
  message: string,
  requestId: string,
  details: Record<string, unknown> = {},
) {
  return NextResponse.json({ error: { code, message, requestId, details } }, { status });
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;

  const adapters = listSourceAdapters();
  const certified = adapters.filter((a) => a.status === "certified");
  const unhealthy = adapters.filter((a) => a.health === "unhealthy");
  const stubs = adapters.filter((a) => a.status === "readiness_stub");

  return NextResponse.json(
    {
      requestId,
      correlationId,
      status: unhealthy.length > 0 ? "degraded" : "healthy",
      adapterCount: adapters.length,
      certifiedAdapterCount: certified.length,
      readinessStubCount: stubs.length,
      unhealthyAdapterCount: unhealthy.length,
      digitalTwinRuntimeImplemented: true,
      automaticObservedStatePublicationEnabled: false,
      liveTelemetryImplemented: false,
      highFrequencyTelemetryImplemented: false,
      shmRuntimeImplemented: false,
      storesTelemetryPayload: false,
      autoPublishEnabled: false,
      unexpected5xx: 0,
    },
    { status: 200 },
  );
}

export async function POST() {
  const requestId = randomUUID();
  return err(405, "method_not_allowed", "Use GET for ingestion health", requestId);
}
