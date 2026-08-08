# Digital Twin — Asset Intelligence Boundary (Phase 12A)

Status: discovery · Extends `ASSET_INTELLIGENCE_DIGITAL_TWIN_BOUNDARY.md`

| Concern | Owner |
| --- | --- |
| Asset intelligence state | Asset Intelligence |
| Twin representation, simulation, geometry, runtime/sensor-bound twin | Digital Twin (future) |
| Canonical assetId | Engineering OS Shared Domain |

## Rules (locked)

1. Both modules reference canonical Asset IDs via public contracts
2. AI must not create Twin ownership — `twin_state` owner remains `digital_twin`
3. Twin must not become the asset registry
4. Asset Intelligence V1 surface is frozen — Phase 12A does not modify AI packages
5. Twin consumes **condition_intelligence** and advisory slices — never mutates AI models

## condition_intelligence

Asset Intelligence owns derived condition intelligence. Digital Twin may display
thread links to published AI slices but does not recompute health indices or
predictive signals.

## Time series

AI time series analytics stay in Asset Intelligence bounded context. Twin binds
**references** to kernel telemetry events — see telemetry ADR. No duplicate
time-series plane inside `@rtb/digital-twin`.

## Knowledge graph

Reuse typed relationships (`has_digital_twin`, asset KG nodes). No new KG subsystem.
