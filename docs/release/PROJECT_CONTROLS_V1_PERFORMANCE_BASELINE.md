# Project Controls V1.0 — Performance Baseline

Fixture-scale measurements only. **Enterprise throughput is not claimed** in V1.0.

## Scope

Benchmarks reflect certification fixture sizes (single tenant, single workspace, representative project scope) on hosted Supabase with Postgres repository adapter.

## Cost model per operation

| Operation | Fixture scale | Notes |
| --- | --- | --- |
| Assess progress | 1 scope, ≤10 evidence refs | Advisory draft state |
| Compose profile | 12 contributors | Read-only composition |
| Create snapshot | Identifier-only payload | Immutable append |
| List timeline | ≤100 events | Paginated read |

## Limits

No batch_74 migration — schema frozen at batches 61–73
- No in-memory production repository
- No parallel write fan-out beyond existing idempotency keys

Performance at customer scale requires a separate capacity study; V1.0 GA certifies correctness and governance, not unlimited scale.
