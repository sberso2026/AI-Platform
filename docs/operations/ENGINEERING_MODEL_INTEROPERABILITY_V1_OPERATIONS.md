# Engineering Model Interoperability V1.0 — Operations

## Health and observability

Health checks are registered per service (`emi.health.*`). Request IDs and correlation IDs are required on HTTP boundaries. Metrics and structured logs must never emit secrets, model binaries, or vendor license material.

## Logging, metrics, audit

Audit is required on registration/mapping/review mutations. Idempotency keys apply to write paths. Concurrency uses optimistic locks / version fields where persisted. Adapter, parser, mapping-conflict, provider-unavailable, and execution-host health failures are fail-closed.

## Security

- JWT authentication with role matrix probes
- RLS on interoperability tables (batches 86–89)
- Tenant and workspace isolation; IDOR fail-closed on scope mismatch
- Entitlements enforced server-side (`engineering_model.read|register|map|review`, `engineering_result.read`, `ifc.federation`, `etabs.federation`, `spacegass.federation`, `execution_host.read|admin`, `external_solver.execute`)
- `external_solver.execute` does **not** imply provider availability
- Secret isolation; path safety; parser safety; command-injection prevention
- Provider fallback prohibition (`silentSolverFallbackAllowed=false`)

## Platform Files and adapters

Model binaries stay outside Postgres. Platform Files carry artifacts. Adapter/parser failures and model version drift surface explicit errors. Mapping conflicts require human review.

## Backup / restore / migration lineage

Migration lineage is batches **86–89**. Prefer **no batch_90**. Backup/restore covers RTB-owned references, mappings, governance, result references, host metadata, and provenance — not external source model binaries.

## Failure handling and degradation

If ETABS is requested and unavailable: do not use CalculiX, SPACE GASS, or fixture silently. If SPACE GASS is requested and unavailable: do not use CalculiX, ETABS, or fixture silently. Phase 13D remains `blocked_external_dependency`.

## Rollback / incident handling

Rollback pins module versions without rewriting certified migrations. Incidents covering governance lock breach, tenant isolation, or false live-execution claims are severity-critical.
