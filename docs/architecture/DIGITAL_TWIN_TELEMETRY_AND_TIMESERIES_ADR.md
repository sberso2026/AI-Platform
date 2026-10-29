# ADR: Digital Twin Telemetry and Time Series

Status: accepted (Phase 12E telemetry binding lock)

## Context

The platform already exposes:

- `packages/platform-kernel/src/telemetry/telemetry-service.ts` — tenant-scoped
  telemetry with optional `digital_twin_id`
- **Asset Intelligence** `asset_intelligence_time_series` (batch_55) — authoritative engineering time series
- SHM-owned sensor streams (future module)

Digital Twin Phase 12E adds **binding and bounded projection** without becoming a second ingestion plane.

## Decision

**CONSOLIDATE** on:

1. `platform_kernel_telemetry` — raw sensors/events (Twin stores references only)
2. `asset_intelligence` — engineering time series values (`EngineeringTimeSeriesReadPort`, read-only)

Digital Twin stores **TelemetrySourceReference**, **TelemetryChannelReference**, and **TwinTelemetryBinding** metadata — **no duplicate time-series plane** (`duplicateTimeSeriesPlaneDetected=false`).

## Phase 12E update

- `LIVE_TELEMETRY_IMPLEMENTED = true` — bounded binding/projection ONLY
- `telemetryHistorianImplemented = false`
- `shmSignalProcessingImplemented = false`
- Never create `digital_twin_*` telemetry value/history tables

## Alternatives rejected

1. **Twin-owned time-series store** — rejected (duplicate plane, ownership conflict)
2. **AI-owned telemetry plane** — rejected (violates AI/twin boundary)
3. **SHM-only with no kernel bridge** — rejected ( loses unified event bus )

## Compliance

Gate AD and ownership row `telemetry_ingestion_plane` enforce this ADR in certification.
