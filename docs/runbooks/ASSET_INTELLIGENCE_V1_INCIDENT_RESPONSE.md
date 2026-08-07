# Asset Intelligence V1.0 — Incident Response Runbook

- Module: `asset_intelligence` 1.0.0 (`asset-intelligence-v1.0.0`)
- Companion runbooks: `ASSET_INTELLIGENCE_V1_OPERATIONS.md`,
  `ASSET_INTELLIGENCE_V1_RECOVERY.md`, `ASSET_INTELLIGENCE_V1_ROLLBACK.md`

## Severity model

| Severity | Definition | Target response |
| --- | --- | --- |
| P1 | A governance lock is broken, or Asset Intelligence mutated canonical Engineering state | Immediate; halt deploys |
| P2 | Hosted persistence unavailable; module unusable for a tenant | 1 hour |
| P3 | A single surface degraded or a drift check failing in CI | Next business day |
| P4 | Cosmetic or documentation defect | Backlog |

## P1 — governance lock breach

Triggers: any of `PRODUCTION_PREDICTIVE_EXECUTION_ENABLED`,
`PREDICTIVE_ML_ENABLED`, `PREDICTIVE_METHODS_CERTIFIED`,
`PROBABILITY_OF_FAILURE_CERTIFIED`, `RUL_CLAIMS_CERTIFIED`,
`ACCURACY_CLAIMS_CERTIFIED`, `RISK_CORE_AUTO_MUTATION_ALLOWED` or any
`*_HEALTH_CONTRIBUTION_ENABLED` observed as `true` in a deployed build; or a
predicted value appearing in an API response, event payload or UI surface.

1. Freeze deploys for the module.
2. Capture the deployed commit SHA and the artifact from the last Phase 10K
   certification run.
3. Roll back to the last certified build — see `ASSET_INTELLIGENCE_V1_ROLLBACK.md`.
4. Re-run `certify:phase10k` against the rolled-back commit and confirm every
   lock gate passes.
5. Record the breach against the release tag. Do not move the tag.

## P1 — canonical state mutation

Triggers: a canonical Engineering Risk record, canonical asset lifecycle state,
asset identity record or CMMS work order changed as a result of an Asset
Intelligence operation.

1. Identify the mutating operation from the intelligence timeline and the audit
   log; the timeline is append-only and is the authoritative sequence.
2. Restore the canonical record from its owning module's history. Asset
   Intelligence must not be the actor performing the restore.
3. Roll back the Asset Intelligence build.
4. Confirm `createsCoreRisk: false`, `createsWorkOrder: false` and
   `mutatesCanonicalLifecycle: false` in the engine of the restored build.

## P2 — hosted persistence unavailable

1. Confirm scope: one store, one tenant, or the whole project.
2. Check Supabase availability, connection saturation and RLS policy state.
3. The module fails closed. Do not enable an in-memory repository as a
   workaround — production refuses it and the refusal is correct.
4. Once persistence returns, replay the outbox; events are idempotent.
5. If data loss is suspected, follow `ASSET_INTELLIGENCE_V1_RECOVERY.md`.

## P2 — tenant isolation suspicion

Triggers: a user reports seeing another tenant's or workspace's intelligence.

1. Treat as a security incident and notify platform security immediately.
2. Reproduce with a real JWT for the reporting user; capture the request ID.
3. Verify RLS is enabled on every `asset_intelligence_*` table and that the
   anonymous role reads zero rows.
4. Do not mitigate by filtering in application code. RLS is the control.

## P3 — surface degradation

A single surface (for example priority or fusion) failing while others succeed
is usually a store-level issue or an evidence-sufficiency abstention. Confirm
whether the surface is returning an error or a governed abstention — an
abstention is correct behaviour and is not an incident.

## P3 — registry drift

`assertNoModuleRegistryDrift()` throwing in CI blocks release but does not
affect a running deployment. Fix the source of truth and regenerate the manifest
snapshot; see the Operations runbook.

## Evidence to capture for every incident

- Deployed commit SHA and release tag
- Request IDs and correlation IDs for affected operations
- Relevant intelligence timeline entries (never edited, only read)
- The Phase 10K certification artifact for the deployed build
- Whether any governance lock reported a non-default value

## Communication

Advisory outputs are decision support. When communicating an incident that
affected an advisory surface, state plainly that no automated action was taken
on the customer's behalf, because V1.0 takes none.
