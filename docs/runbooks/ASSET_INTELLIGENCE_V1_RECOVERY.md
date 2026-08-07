# Asset Intelligence V1.0 — Backup and Recovery Runbook

- Module: `asset_intelligence` 1.0.0 (`asset-intelligence-v1.0.0`)
- Certification flag: `ASSET_INTELLIGENCE_BACKUP_RESTORE_CERTIFIED`
- Verified by Phase 10K gate **BI** (backup/restore certification)

## What is backed up

All Asset Intelligence state lives in hosted Supabase Postgres under the
`asset_intelligence_*` table namespace created by migrations batch_55 → 59.
There is no module-local file store, cache or queue holding authoritative state.

| Class | Recovery expectation |
| --- | --- |
| Published intelligence states | Must be recoverable exactly; they are engineering records |
| Draft / submitted states | Recoverable; may be re-derived if lost |
| Intelligence timeline | Must be recoverable exactly; append-only audit trail |
| Outbox events | Recoverable; replay is idempotent |
| Idempotency keys | Recoverable; loss causes at-most duplicate work, not corruption |

Backups are taken by the platform Supabase backup policy. Asset Intelligence
does not operate a separate backup schedule and must not introduce one.

## Recovery objectives

| Objective | Target |
| --- | --- |
| RPO | Platform Supabase point-in-time recovery window |
| RTO | Restore duration of the platform database plus a Phase 10K verification pass |

These are inherited platform targets. Asset Intelligence does not claim a
better RPO/RTO than the database it sits on.

## Restore procedure

1. **Declare scope.** Whole project, single tenant, or a single table? Asset
   Intelligence tables are tenant- and workspace-scoped by RLS, so a tenant
   restore is a filtered restore, never a table drop.
2. **Freeze writes.** Disable the module route for affected tenants so no new
   intelligence is published into a database that is about to move backwards.
3. **Restore the database** using the platform Supabase point-in-time restore to
   the chosen timestamp. Restore into a staging project first when the incident
   allows it.
4. **Verify migration lineage.** The restored database must contain batch_55,
   55b, 56, 57, 58 and 59. A restore that predates a migration must have the
   missing migrations reapplied in order. Migrations are additive; never rewrite
   batches 55–59 to make a restore fit.
5. **Verify readability, non-destructively.** For every `asset_intelligence_*`
   table, run a `count`-only head select as the service role, and a read as the
   anonymous role which must return zero rows. This is exactly what the Phase
   10K hosted gates do and it mutates nothing.
6. **Verify RLS.** Row Level Security must be enabled on every restored table.
   A restore that drops policies is a security incident, not a recovery success.
7. **Verify governance locks.** Re-read the predictive, PoF, RUL and health
   contribution constraints; the `CHECK` constraints in batch_59 must still be
   present.
8. **Replay the outbox.** Events are idempotent by operation and idempotency key.
9. **Unfreeze writes** and re-run
   `pnpm --filter @rtb/asset-intelligence-certification certify:phase10k`.
   Treat a PASS as the completion criterion for the recovery.

## Partial recovery

If only one surface is corrupted (for example fusion states), prefer restoring
that table's rows for the affected tenant over a whole-project restore. Because
published states are versioned and superseded rather than overwritten, the prior
published version is usually still present and can be re-published through the
normal governed review path — which is preferable to a database restore.

## What recovery does not do

Recovery never reconstructs a predicted value, because none was ever stored.
Recovery never re-derives canonical asset identity or canonical lifecycle —
those belong to the Engineering OS Shared Asset Domain and are restored by that
owner.

## Verification checklist

- [ ] Migration lineage batch_55 → 59 present and in order
- [ ] Every `asset_intelligence_*` table readable by service role
- [ ] Anonymous role reads zero rows from every table
- [ ] RLS enabled on every table
- [ ] batch_59 governance `CHECK` constraints present
- [ ] Intelligence timeline continuous for affected assets
- [ ] Phase 10K certification PASS against the restored environment
