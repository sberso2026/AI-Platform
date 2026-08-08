# ADR: Digital Twin Telemetry and Time Series

Status: accepted (Phase 12A architecture lock)

## Context

The platform already exposes:

- `packages/platform-kernel/src/telemetry/telemetry-service.ts` — tenant-scoped
  telemetry with optional `digital_twin_id`
- Asset Intelligence analytics over inspection and condition history
- SHM-owned sensor streams (future module)

Digital Twin needs observation bindings without becoming a second ingestion plane.

## Decision

**CONSOLIDATE** on `platform_kernel_telemetry` as the single telemetry ingestion
plane. Digital Twin stores **TelemetryEventReference** bindings and thread links
only — no duplicate time-series database, stream processor, or retention policy
inside `@rtb/digital-twin` — **no duplicate time-series plane**.

## Consequences

- Positive: one retention, one billing meter, one security audit surface
- Positive: AI time series stay in Asset Intelligence bounded context
- Negative: Twin live-sync (L5) depends on kernel/SHM roadmap — explicit phase gate
- Phase 12A: `LIVE_TELEMETRY_IMPLEMENTED = false` in discovery lock

## Alternatives rejected

1. **Twin-owned time-series store** — rejected (duplicate plane, ownership conflict)
2. **AI-owned telemetry plane** — rejected (violates AI/twin boundary)
3. **SHM-only with no kernel bridge** — rejected ( loses unified event bus )

## Compliance

Gate AD and ownership row `telemetry_ingestion_plane` enforce this ADR in certification.
