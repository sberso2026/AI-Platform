# Phase 12C — Digital Twin State, Versioning and Governed State Management

**Version:** `0.3.0-state`  
**Status:** `state`  
**Phase:** `12C`  
**Public contracts:** `0.3.0-state-draft`

## Scope

Phase 12C implements **governed twin state** on top of the Phase 12B core slice:

- Governed `TwinState` with lifecycle: draft → pending_review → published → superseded → archived
- Immutable `TwinStateVersion` history (append only)
- `RepresentationVersion` with supersede semantics (no overwrite)
- `TwinSnapshot` with versioned state references only
- Append-only `TwinTimelineEvent` log
- State review workflow (`digital_twin.state_review`)
- Hosted Postgres persistence (`batch_76`)
- State/snapshot/representation-history HTTP APIs

## Explicitly NOT in Phase 12C

- Live telemetry ingestion or time-series storage
- Simulation execution
- 3D viewer
- Runtime sync / digital twin runtime
- Physical actuation or automatic control
- Production GA (`productionDigitalTwinReady` remains `false`)

## Governed state model

Observed ≠ derived ≠ simulated. Simulated remains reserved with `simulationExecuted = false`. All state rows require provenance (`sourceModule`, `sourceRef`, `capturedAt`) and an external reference — fail closed without provenance.

## Review workflow

```
draft → pending_review → approved|rejected → published
```

State review slug: `digital_twin.state_review`. Identity review (`digital_twin.identity_review`) retained from 12B. No AI self-approval.

## Module tables (batch_76)

| Table | Purpose |
|-------|---------|
| `digital_twin_states` | Governed twin state rows |
| `digital_twin_state_versions` | Immutable state version history |
| `digital_twin_representation_versions` | Immutable representation versions |
| `digital_twin_snapshots` | Versioned state reference snapshots |
| `digital_twin_timeline_events` | Append-only timeline |
| `digital_twin_state_reviews` | State review records |

Outbox extended additively for state/snapshot event types. **batch_75 is not modified.**

## HTTP surface

- `POST/GET /api/engineering/digital-twin/state`
- `POST/GET /api/engineering/digital-twin/snapshot`
- `GET/POST /api/engineering/digital-twin/representation-history`

Plus retained 12B routes (identity, representation, thread). All responses include governance forbid flags.

## Phase 12D readiness

`PHASE_12D_READY = true` — runtime, telemetry bindings, and simulation execution remain reserved for Phase 12D.

## Certified baselines

| Phase | Commit | Hosted run | Version |
|-------|--------|------------|---------|
| 12A | `2c5ed03f7de12cde9bfb71a9d430f5e342291303` | `31253197987` | `0.1.0-discovery` |
| 12B | `5e1bb22486a9fdd6385fb980daf0150a330eca9b` | `31255221472` | `0.2.0-core` |

## Not GA

This phase does **not** claim General Availability. Module registry remains `coming_soon`.
