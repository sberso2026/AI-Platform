# Phase 12A — Digital Twin Discovery

Status: discovery · Module version: `0.1.0-discovery` · Phase: 12A ·
Baseline: `project-controls-v1.0.0` = `b17fe4cfe2574520ec813a7b43ba7328a585d741`

## Overview

Phase 12A is a discovery phase for Digital Twin. It ships **no Digital Twin
product functionality**: no runtime orchestration, no live telemetry ingestion, no
simulation execution, no 3D viewer, no SHM runtime, no production twin
persistence schema, and no actuation.

What it does ship:

| Artefact | Purpose |
| --- | --- |
| `packages/digital-twin` | Discovery package: version, ownership lock, draft contracts, fidelity descriptors |
| `packages/digital-twin-certification` | Phase 12A gates A–AM and certification runner |
| Architecture docs (footprint, terminology, boundaries, fidelity, thread, ADR) | Locked architecture |
| `docs/contracts/DIGITAL_TWIN_PUBLIC_CONTRACTS_DRAFT.md` | Draft contract families `0.1.0-draft` |
| `.github/workflows/phase-12a-digital-twin-discovery.yml` | Hosted certification |

Declared state from `packages/digital-twin/src/version.ts`:

- `DIGITAL_TWIN_VERSION` = `0.1.0-discovery`
- `DIGITAL_TWIN_STATUS` = `discovery`
- `DIGITAL_TWIN_IMPLEMENTED` = `false` — no product exists
- `DIGITAL_TWIN_DISCOVERY_IMPLEMENTED` = `true`
- `productionDigitalTwinReady` (`PRODUCTION_DIGITAL_TWIN_READY`) = `false`

That last flag is load-bearing. Gate P asserts it stays `false`; `assertOwnershipLock()`
throws `digital_twin_product_forbidden_in_phase_12a` if production readiness is set.

## Ownership summary

Digital Twin owns **twin identity, twin state, representations, simulation state
(artefacts only), and digital thread model**. It consumes canonical asset and
project identity from Engineering OS shared domains. It does not own Asset
Intelligence, Inspection Intelligence, Project Intelligence, Project Controls,
SHM streams, or kernel telemetry ingestion.

## Frozen V1 baselines referenced (not moved)

| Tag | Commit |
| --- | --- |
| project-controls-v1.0.0 | b17fe4cfe2574520ec813a7b43ba7328a585d741 |
| asset-intelligence-v1.0.0 | 925e2ed74025cac6a145c346c17c53320efb8757 |
| project-intelligence-v1.0.0 | 34975b1cf660580d46287f24e746b8915903f768 |
| inspection-intelligence-v1.0.0 | d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09 |

Phase 12A does not move V1 tags. Gate AM verifies Project Controls V1 tag integrity.

## Certification gates

39 gates, A–AM, run by
`pnpm --filter @rtb/digital-twin-certification certify:phase12a`.

See `packages/digital-twin-certification/src/phase12a/gates.ts` for the authoritative list.

## Phase 12B readiness

When all gates pass locally and in CI:

- `phase12BReady` = `true` in certification artifact
- `PHASE_12B_READY` = `true` in version constants
- Discovery lock is complete; runtime implementation begins only in Phase 12B+

Phase 12A explicitly does **not** implement runtime, telemetry, simulation, viewer,
actuation, or production DB migrations for twin product schema.
