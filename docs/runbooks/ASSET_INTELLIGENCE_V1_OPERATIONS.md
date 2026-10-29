# Asset Intelligence V1.0 — Operations Runbook

- Module: `asset_intelligence` 1.0.0 (`asset-intelligence-v1.0.0`)
- Health endpoint: `GET /api/engineering/asset-intelligence/health`
- Certification: `pnpm --filter @rtb/asset-intelligence-certification certify:phase10k`

## Deployment

1. Confirm the release tag `asset-intelligence-v1.0.0` points at the certified
   commit. The tag is immutable — never move it.
2. Apply Supabase migrations in lineage order. The V1.0 lineage is
   batch_55 → 55b → 56 → 57 → 58 → 59. Migrations are additive; batches 55–59
   are never rewritten.
3. Deploy the web application. Route `/engineering/apps/asset-intelligence` must
   render the `asset-intelligence-v1-ready` marker.
4. Verify `GET /api/engineering/asset-intelligence/health` returns every store
   as reachable.
5. Verify registry drift is clean: `assertNoModuleRegistryDrift()` must not throw.

## Daily checks

| Check | Expected | Action if not |
| --- | --- | --- |
| Health endpoint | all stores reachable | See "Persistence degradation" |
| Registry drift | `moduleRegistryDriftDetected: false` | Block deploys, see "Drift" |
| Outbox backlog | draining | See "Event backlog" |
| Predictive locks | all `false` | Treat as a P1 governance incident |

## Persistence degradation

Symptoms: health endpoint reports a store unreachable; assessments fail with
`optimistic_lock_conflict` or a repository error.

1. Confirm Supabase project availability and connection pool saturation.
2. Confirm RLS policies are intact — a policy change can present as an empty
   read rather than an error.
3. Asset Intelligence fails closed. It never falls back to an in-memory
   repository in production (`PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false`).
   Do not attempt to "unblock" by enabling a memory repository.
4. If a single store is degraded, only that surface is affected; published
   states in other surfaces remain readable.

## Event backlog

Events are appended to an outbox inside the same transaction as the state
change. If consumers lag:

1. Check outbox depth and the age of the oldest unprocessed row.
2. Events are idempotent by `(operation, idempotency key)`. Replaying is safe.
3. Never delete outbox rows to clear a backlog; the timeline is the audit trail.

## Drift

`assertNoModuleRegistryDrift()` throws when `version.ts`, the generated
manifest, the capability registry, the service registry, the event contracts or
the unavailable matrix disagree.

1. Read the thrown key, e.g. `drift:capability:<id>`.
2. Fix the source of truth (`version.ts` and the registries), then regenerate
   the manifest snapshot:
   `pnpm --filter @rtb/asset-intelligence-certification exec tsx scripts/generate-module-manifest.ts`
3. Never hand-edit `manifest/asset-intelligence-module-manifest.json`.

## Review workflow stalls

Assessments move draft → submitted → reviewed → approved → published. A stall is
usually a segregation-of-duties block: the submitter is also the only available
approver. Assign a second approver; do not disable
`ENGINEER_SELF_APPROVE_FORBIDDEN`.

## Predictive governance

Predictive governance records objectives, method eligibility, candidates and
qualifications. It executes nothing. If an operator reports "the prediction is
wrong", the correct response is that V1.0 produces no prediction — see
`docs/release/ASSET_INTELLIGENCE_V1_UNAVAILABLE_CAPABILITIES.md`.

## Entitlement and access issues

Entitlements are resolved server-side against Engineering OS. A user who loses a
seat loses access on the next request; there is no client-side cache to clear.
Access denial returns the standard commerce denial surface, not a 500.

## Escalation

| Condition | Severity |
| --- | --- |
| Any predictive/PoF/RUL lock observed as `true` | P1 |
| Health index shows a non-condition contribution | P1 |
| Canonical Risk or lifecycle mutated by Asset Intelligence | P1 |
| Hosted persistence unavailable | P2 |
| Single surface degraded | P3 |
| Registry drift detected in CI only | P3 |

See `ASSET_INTELLIGENCE_V1_INCIDENT_RESPONSE.md`.
