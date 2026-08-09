# Digital Twin V1.0 — Operations Runbook

## Deployment

Deploy module pin `digital-twin-v1.0.0` with Shared Spatial Domain `0.2.0-spatial-core`. Apply migration lineage batches 75–85 (no batch_86).

## Daily checks

- Health endpoints respond
- RLS still denies anon reads
- Solver adapter health fail-closed when ccx unavailable
- No secret exposure in logs

## Escalation

Governance lock breach, tenant isolation failure, or silent fixture fallback detection are Sev-1.
