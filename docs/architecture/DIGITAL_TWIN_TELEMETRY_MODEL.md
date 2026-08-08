# Digital Twin Telemetry Model (Phase 12E)

Status: telemetry_binding — Not GA

## Scope

Phase 12E introduces governed **telemetry binding** in `@rtb/digital-twin`:

- `TelemetrySourceReference` — kernel or Asset Intelligence series references only
- `TelemetryChannelReference` — logical channel to twin attribute
- `TwinTelemetryBinding` — lifecycle draft → pending_review → approved → published → suspended → superseded → retired
- `TwinTelemetryProjectionEngine` — bounded projection into `ObservedTwinStateCandidate` via 12D ingestion (no direct publish)

## Ownership

| Concern | Owner | Twin relation |
|---------|-------|---------------|
| Engineering time series values | `asset_intelligence` | read-only via `EngineeringTimeSeriesReadPort` |
| Raw sensor/event ingestion | `platform_kernel_telemetry` | reference only |
| Binding metadata | `digital_twin` | owns |
| SHM signal processing | `shm` | not implemented (`shmSignalProcessingImplemented=false`) |

## Forbidden in 12E

- Raw telemetry value/history tables in Digital Twin (`stores_raw_telemetry=false`)
- Telemetry historian (`telemetryHistorianImplemented=false`)
- High-frequency ingestion plane duplicate
- Automatic telemetry state publication
- Interpolation (`not_implemented`)

## Version

`0.5.0-telemetry-binding` — public contracts `0.5.0-telemetry-binding-draft`
