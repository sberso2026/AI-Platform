# Asset Intelligence — Health Composition

## Separation

| Component | Owns |
|-----------|------|
| **Health Index** (`health-index.ts`) | State model / fields / distinctness invariants |
| **Health Composition Engine** (`health-composer.ts`) | Multi-factor scoring, abstention, method tagging |
| **Asset Intelligence Engine** | Commands, persistence, timeline, review, events — calls the composer |

Do **not** embed composition algorithm in the Health Index module.

## Factors (Phase 10C)

- Condition (required evidence path for advisory health)
- Criticality (weighted into composite when assessed)
- Reliability — **reserved** factor slot for Phase 10D (not assessed in 10C)

## Claims

- Advisory only
- `accuracyClaimsCertified = false`
- `rulClaimsCertified = false`
- Health class remains distinct from conditionRating and criticalityRating
