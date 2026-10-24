# Digital Twin / Asset Intelligence Engineering Time Series Reconciliation

Status: locked (Phase 12E)

## Authoritative owner

**Asset Intelligence** owns `asset_intelligence_time_series` (batch_55).

```typescript
engineeringTimeSeriesOwnership = "asset_intelligence"
ENGINEERING_TIME_SERIES_OWNERSHIP = "asset_intelligence"
```

Digital Twin MUST NOT create `digital_twin_*` time-series value or history tables.
Certification gate: `duplicateTimeSeriesPlaneDetected = false`.

## Read port

`EngineeringTimeSeriesReadPort` in `@rtb/digital-twin`:

- `latestObservation`, `window`, `aggregate`, `quality`, `freshness`
- Memory stub for unit tests only
- Postgres adapter reads `asset_intelligence_time_series` **without writing**

## Kernel telemetry

`platform_kernel_telemetry` retains raw sensors/events. Twin stores **references** via `TelemetrySourceReference.externalRef` — never inline payloads.

## SHM

Structural Health Monitoring signal processing is future work. Phase 12E sets `shmSignalProcessingImplemented=false`.
