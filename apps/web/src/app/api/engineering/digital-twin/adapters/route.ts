/**
 * Phase 12D — Digital Twin source adapters HTTP API.
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
  storesTelemetryPayload: false,
  autoPublishEnabled: false,
} as const;

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? requestId;
  const url = new URL(req.url);
  const adapterId = url.searchParams.get("adapterId") ?? "";

  const adapters = listSourceAdapters();
  if (adapterId) {
    const adapter = adapters.find((a) => a.adapterId === adapterId);
    if (!adapter) {
      return err(404, "adapter_not_found", `Adapter not found: ${adapterId}`, requestId);
    }
    return NextResponse.json(
      { requestId, correlationId, adapter, ...GOVERNANCE_FLAGS },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      requestId,
      correlationId,
      adapters,
      certifiedCount: adapters.filter((a) => a.status === "certified").length,
      ...GOVERNANCE_FLAGS,
    },
    { status: 200 },
  );
}
