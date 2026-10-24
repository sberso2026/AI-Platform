# Digital Twin Source Authority Model

**Phase:** 12D  
**Version:** `0.4.0-ingestion`

## Principle

Source authority in the Digital Twin module is **class-based**, not a universal ranking of sources. No adapter may auto-publish observed state, regardless of precedence within its class.

## Authority classes

| Source class | Relation to Twin | Auto-publish | Notes |
|--------------|------------------|--------------|-------|
| `manual` | Governed human entry | Forbidden | Requires `digital_twin.state_review` |
| `asset_intelligence` | Consumes AI V1 public contracts | Forbidden | References only — no private coupling |
| `project_controls` | Consumes PC V1 public contracts | Forbidden | References only |
| `inspection_intelligence` | Readiness stub | Forbidden | Insufficient contract for ingestion |
| `project_intelligence` | Readiness stub | Forbidden | Insufficient contract for ingestion |
| `telemetry_reference` | Reference binding only | Forbidden | No telemetry payload ingestion |

## Reconciliation interaction

The `TwinStateReconciliationEngine` evaluates candidates against published twin state. Outcomes include `accepted`, `accepted_with_review`, `conflicting`, `rejected`, `superseded`, and `unknown`. All outcomes block auto-publish (`autoPublishBlocked = true`).

## Policy storage

Class rules are persisted in `digital_twin_source_authority_policies` with `universal_ranking_forbidden = true` enforced by CHECK constraint.
