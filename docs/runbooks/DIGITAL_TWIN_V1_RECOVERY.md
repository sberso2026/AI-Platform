# Digital Twin V1.0 — Recovery

## Recovery objectives

Restore twin identity/state/snapshots/timeline/bindings/simulation packages/qualification/solver/thread/spatial bindings without rewriting ownership.

## Restore procedure

1. Restore database backup including batches 75–85
2. Verify migration lineage
3. Verify RLS
4. Probe twin tables non-destructively
5. Confirm SSD spatial refs still resolve

## Verification checklist

Ownership-preserving restore; `productionMemoryRepositoryAllowed=false`.
