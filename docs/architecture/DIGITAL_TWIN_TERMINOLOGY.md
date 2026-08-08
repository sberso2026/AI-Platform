# Digital Twin — Terminology (Phase 12A lock)

Status: discovery · Contract version: `0.1.0-draft`

## Twin identity model

one entity → multiple Twin representations allowed.

A physical or logical asset (or project, location, system) has exactly one
canonical identity in Engineering OS shared domain registers. Digital Twin may
create **multiple** module-owned Twin records / representation configs that all
reference the same canonical entity via `TwinTargetReference`.

**Twin references canonical entity** — never replaces it.

## Locked terms

| Term | Definition |
| --- | --- |
| **Digital Twin** | Module-owned representation bound to a canonical entity reference |
| **TwinTargetReference** | Stable pointer to canonical `assetId`, `projectId`, location, or system |
| **TwinRepresentationReference** | Fidelity config, geometry anchor, scenario binding for one Twin |
| **TwinState** | Derived snapshot (observed / derived / simulated / declared / unavailable) |
| **DigitalThread** | Provenance chain linking evidence, models, and observations to a Twin |
| **FidelityLevel** | L0–L5 classification — see fidelity model; L1+ unavailable in 12A |
| **SensorStreamReference** | SHM-owned live stream pointer — Twin binds, does not ingest duplicate plane |
| **TelemetryEventReference** | Kernel telemetry event pointer — see telemetry ADR |

## State categories

| Category | Meaning |
| --- | --- |
| `observed` | Direct measurement or inspection-linked observation |
| `derived` | Computed from other states (including AI advisory slices) |
| `simulated` | Scenario output — execution forbidden in Phase 12A |
| `declared` | Human-authored or imported static declaration |
| `unavailable` | Reserved slot; fidelity or source not yet implemented |

## Temporal model

- **Valid time** — when the real-world condition was true
- **Transaction time** — when the platform recorded the state
- **As-of query** — point-in-time read against twin history (not implemented in 12A)

## Engineering Module SDK reuse

Phase 12B+ registers Digital Twin through the existing Engineering Module SDK
(`packages/engineering-os/src/module-sdk`). No parallel module bootstrap path.

## AI governance

Digital Twin does **not** implement its own AI stack (`IMPLEMENTS_OWN_AI_STACK =
false`). It consumes Asset Intelligence, Inspection Intelligence, and Project
Intelligence public contracts as advisory inputs only.

## Security and privacy (architecture)

Twin metadata may reference tenant-scoped asset and inspection identifiers.
Cross-tenant binding is forbidden. Live sensor streams remain SHM-governed with
least-privilege read bindings into Twin — detailed enforcement deferred to 12B.
