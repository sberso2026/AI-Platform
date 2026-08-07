# Asset Intelligence — Health Composition

## Separation

| Component | Owns |
|-----------|------|
| **Health Index** (`health-index.ts`) | State model / fields / distinctness invariants |
| **Health Composition Engine** (`health-composer.ts`) | Versioned multi-factor scoring, abstention, method tagging |
| **Asset Health Profile** | Dimensional health contract (condition / reliability / criticality context) |
| **Asset Intelligence Engine** | Commands, persistence, timeline, review, events — calls the composer |

## Versioned methods

| Method | Status |
|--------|--------|
| `compose_condition_criticality_v1` | Historical Phase 10C — preserved for audit/replay |
| `compose_condition_reliability_v2` | **Default Phase 10D** — condition + reliability + evidence confidence |

In v2, criticality is **context only** (`criticalityIsHealthFactor = false`).

## Claims

- Advisory only
- `accuracyClaimsCertified = false`
- `rulClaimsCertified = false`
- `probabilityOfFailureCertified = false`
