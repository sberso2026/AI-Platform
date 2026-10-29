# Digital Twin V1.0 — Operational Certification

## Health and observability

Health checks are registered per service (`dt.health.*`). Request IDs and correlation IDs are required on HTTP boundaries. Metrics and structured logs must never emit secrets or raw solver credentials.

## Logging, metrics, audit

Audit is required on mutations. Idempotency keys apply to write paths. Concurrency uses optimistic locks. Timeouts apply to external solver sandbox execution.

## Security

- JWT authentication with real role matrix probes
- RLS on all Digital Twin tables (batches 75–85)
- Tenant and workspace isolation; IDOR fail-closed on scope mismatch
- Entitlements enforced server-side (`digital_twin.read|assess|submit|review|approve|publish|admin`)

## Solver sandbox and artifacts

External CalculiX (ccx 2.21) runs fail-closed. `silentFixtureFallbackEnabled=false` and `silentSolverFallbackAllowed=false`. Solver artifacts are referenced via Platform Files; integrity hashes seal simulation packages.

## Backup / restore / migration lineage

Migration lineage is batches **75–85** only. No batch_86. Backup/restore must preserve ownership (DT owns twin surfaces; SSD owns spatial refs; AI owns time series). Rollback pins module versions without rewriting migrations.

## Failure handling and degradation

External solver failure modes are fail-closed. Missing provenance yields `unknown` (never fabricate). Production memory repositories are forbidden.

## Secrets

Solver credentials and Supabase keys never appear in artifacts, logs, or browser fixtures.
