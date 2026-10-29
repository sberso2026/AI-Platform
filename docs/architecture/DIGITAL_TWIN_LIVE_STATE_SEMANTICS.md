# Digital Twin Live State Semantics (Phase 12E)

Status: telemetry_binding draft

## current_projected_state

Bounded live semantics expose **projected** twin attribute values derived from Asset Intelligence engineering time series — not raw telemetry storage.

Fields per binding projection:

- `projectedValue`, `unit`, `quality`, `gapHandling`, `sourceHealth`
- `projectionMethod` — one of: latest_valid_observation, mean/min/max/count_over_window, last_known_valid
- `observedAt`, `projectedAt`, `freshnessMs`
- `engineeringSeriesId`, `sourceRef` (reference string)
- `storesRawTelemetry: false`, `autoPublishEnabled: false`, `interpolation: not_implemented`

## Not implemented

| Capability | Flag |
|------------|------|
| Telemetry historian | `telemetryHistorianImplemented=false` |
| High-frequency plane | `highFrequencyTelemetryImplemented=false` |
| Sensor registry | `sensorRegistryImplemented=false` |
| SHM signal processing | `shmSignalProcessingImplemented=false` |
| Auto publish | `automaticTelemetryStatePublicationEnabled=false` |

Projections with unacceptable quality create outbox events (`quality_rejected`, `stale_detected`, `source_unavailable`) and may create ingestion candidates only when binding lifecycle is `published` and quality is acceptable.
