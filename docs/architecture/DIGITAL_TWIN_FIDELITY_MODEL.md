# Digital Twin — Fidelity Model (Phase 12A)

Status: discovery · Implemented in code as reserved descriptors only

## Levels L0–L5

| Level | Name | Phase 12A status | Description |
| --- | --- | --- | --- |
| L0 | Reference | reserved | Identifier-only twin bound to canonical entity — kernel registry baseline |
| L1 | Tabular | future | Attribute snapshots without geometry |
| L2 | Graph-linked | future | KG-linked relationships — consumes existing KG |
| L3 | Spatial-lite | future | Anchors and bounding references — not full BIM |
| L4 | Simulation-ready | unavailable | Scenario bindings — simulation forbidden in 12A |
| L5 | Live-sync | unavailable | Telemetry-bound — live ingestion forbidden in 12A |

## Rules

- Phase 12A ships **descriptors only** in `packages/digital-twin/src/domain/fidelity-model.ts`
- `assertFidelityNotImplemented()` caps availability at **L0**
- Promoting a level requires explicit phase certification — not discovery drift
- Multiple `TwinRepresentationReference` entries per entity may target different levels

## Explicitly not implemented in Phase 12A

- Runtime fidelity promotion
- Geometry storage or mesh processing
- Simulation mesh binding
- Live telemetry sync loops
