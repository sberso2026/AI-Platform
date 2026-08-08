# Phase 12B — Digital Twin Core Domain

**Version:** `0.2.0-core`  
**Status:** `core`  
**Phase:** `12B`  
**Public contracts:** `0.2.0-core-draft`

## Scope

Phase 12B implements the **core domain slice** of Digital Twin:

- Twin identity (references canonical entity — never duplicates Asset/Project fields)
- Representation references (BIM/IFC/CAD/drawing/GIS/point cloud/process diagram)
- State reference containers (observed/derived/operational/simulated — references only)
- Digital thread links (reuses platform timelines by reference)
- Typed relationships (represents/contains/connected_to/monitored_by/references/derived_from)
- Identity review workflow (`digital_twin.identity_review`)
- Hosted Postgres persistence (`batch_75`)
- Lookup-focused HTTP API

## Explicitly NOT in Phase 12B

- Live telemetry ingestion or time-series storage
- Simulation execution
- 3D viewer
- Runtime sync / digital twin runtime
- Physical actuation or automatic control
- Production GA (`productionDigitalTwinReady` remains `false`)

## Hybrid persistence

Kernel `digital_twins*` tables from Phase 1.5 are **preserved**. Module tables in `batch_75` add the product layer. Optional `kernel_twin_id` on `digital_twin_identities` supports REBIND to preserved kernel rows.

## Knowledge graph reuse

Relationships persist in `digital_twin_typed_relationships` (module plane; kernel `digital_twin_relationships` remains preserved) and document KG reuse via `has_digital_twin` / typed edges through Platform KG. **No new graph engine.**

## Review workflow

```
draft → pending_review → approved|rejected → published
```

No AI self-approval. Review slug: `digital_twin.identity_review`.

## Module tables (batch_75)

| Table | Purpose |
|-------|---------|
| `digital_twin_identities` | Core twin identity |
| `digital_twin_representations` | Representation references |
| `digital_twin_typed_relationships` | Typed relationships (module; avoids kernel table collision) |
| `digital_twin_thread_links` | Digital thread links |
| `digital_twin_state_references` | State reference containers |
| `digital_twin_reviews` | Identity review records |
| `digital_twin_outbox_events` | Domain outbox |

## HTTP surface

- `POST/GET /api/engineering/digital-twin/identity`
- `POST/GET /api/engineering/digital-twin/representation`
- `POST/GET /api/engineering/digital-twin/thread`

All responses include governance forbid flags. No telemetry APIs.

## Phase 12C readiness

`PHASE_12C_READY = true` — runtime, telemetry bindings, and simulation references are reserved for Phase 12C.

## Phase 12A baseline

- Certified commit: `2c5ed03f7de12cde9bfb71a9d430f5e342291303`
- Hosted run: `31253197987`
- Version: `0.1.0-discovery`

## Not GA

This phase does **not** claim General Availability. Module registry remains `coming_soon`.
