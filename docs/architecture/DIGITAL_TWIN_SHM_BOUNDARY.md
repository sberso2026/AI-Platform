# Digital Twin — SHM Boundary (Phase 12A)

Status: discovery · `SENSOR_STREAM_OWNERSHIP = shm`

## Owns

| Concern | Owner |
| --- | --- |
| sensor_streams | `shm` |
| structural solvers | `shm` (future module) |
| live waveform / accelerometer ingestion | `shm` |

## Consumes

Digital Twin **consumes** `SensorStreamReference` bindings:

- Stream id, sampling metadata, quality flags
- Read-only subscription handles governed by SHM entitlements
- No direct device driver or edge gateway ownership in Twin

## Forbidden in Phase 12A

- SHM runtime implementation inside `@rtb/digital-twin`
- Duplicate sensor ingestion pipeline
- Automatic control loops driven by SHM streams
- Physical actuation based on structural alerts

## Thread integration

SHM segments appear as Digital Thread links of type `sensor_stream_segment` —
provenance only in 12A.
