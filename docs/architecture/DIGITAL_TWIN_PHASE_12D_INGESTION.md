# Phase 12D — Digital Twin Governed State Ingestion

**Version:** `0.4.0-ingestion`  
**Status:** `ingestion`  
**Phase:** `12D`  
**Public contracts:** `0.4.0-ingestion-draft`

> Phase 12C baseline pinned at commit `07b5ccc843395bd02633163dc654668da9f17658` (hosted run `31256556800`, version `0.3.0-state`). See [DIGITAL_TWIN_PHASE_12C_STATE.md](./DIGITAL_TWIN_PHASE_12C_STATE.md).

## Scope

Phase 12D adds **governed observed-state ingestion** on top of Phase 12C:

- `DigitalTwinSourceAdapter` metadata contract with certified adapters (`manual_governed`, `asset_intelligence_public_contract`, `project_controls_public_contract`)
- `TwinStateSchemaRegistry` — versioned schemas, no unrestricted blobs
- `TwinSourceFreshnessPolicy` — fresh | aging | stale | expired | unknown
- Unit governance — `unitSystem` / `unitCode` required for quantitative values
- `ObservedTwinStateCandidate` — candidate ≠ published
- `TwinStateReconciliationEngine` — class-based reconciliation outcomes
- `TwinSourceAuthorityPolicy` — no universal source ranking ([authority model](./DIGITAL_TWIN_SOURCE_AUTHORITY_MODEL.md))
- `DigitalTwinStateIngestionEngine` — validate → candidate → reconcile → review (default no auto-publish)
- Hosted Postgres persistence (`batch_77`)
- HTTP APIs: adapters, ingestion, ingestion-health

## Bounded runtime

`digitalTwinRuntimeImplemented = true` for **bounded state-ingestion runtime ONLY**. This is not live telemetry, SHM, simulation, 3D viewer, or actuation.

## Explicitly NOT in Phase 12D

- Automatic observed-state publication (`automaticObservedStatePublicationEnabled = false`)
- Live or high-frequency telemetry ingestion
- SHM runtime, simulation execution, 3D viewer
- Physical actuation or automatic control
- Duplicate time-series plane
- Production GA

## Ingestion flow

```
adapter + schema validate → candidate received → freshness check
  → reconcile → pending_review (digital_twin.state_review)
  → human publish → twin state + snapshot + timeline
```

## Module tables (batch_77)

| Table | Purpose |
|-------|---------|
| `digital_twin_source_adapters` | Adapter metadata registry |
| `digital_twin_state_schemas` | Versioned state schemas |
| `digital_twin_state_candidates` | Observed state candidates |
| `digital_twin_state_reconciliation` | Reconciliation outcomes |
| `digital_twin_source_authority_policies` | Class-based authority rules |
| `digital_twin_ingestion_idempotency` | Idempotency / replay detection |

Outbox extended additively for candidate events. **batch_75 and batch_76 are not modified.**

## HTTP surface

- `GET /api/engineering/digital-twin/adapters`
- `POST/GET /api/engineering/digital-twin/ingestion`
- `GET /api/engineering/digital-twin/ingestion-health`

## Certification

51 gates (A–AY) via `pnpm --filter @rtb/digital-twin-certification certify:phase12d`.

## Not GA

`productionDigitalTwinReady` remains `false`. Phase 12E readiness flag is set for downstream planning only — Phase 12E is not implemented in this slice.
