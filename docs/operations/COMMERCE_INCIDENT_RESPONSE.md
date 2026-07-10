# Commerce Incident Response

Operational runbook for Commerce Phase 2 entitlement, subscription, and integration failures.

## Severity guide

| Severity | Examples |
|----------|----------|
| **SEV1** | All tenants denied Engineering OS; RLS leak (cross-tenant data visible) |
| **SEV2** | Single tenant cannot access paid product; scheduler stopped; outbox backlog > 1h |
| **SEV3** | Stale cache after revoke; UI catalogue fallback banner; single job errors |

## Quick diagnostics

| Symptom | First check |
|---------|-------------|
| 403 on Engineering OS | Entitlement Diagnose (`/system/subscriptions`) |
| 503 on API routes | Supabase connectivity; commerce service health |
| Wrong catalogue display | `catalogueFallback` flag on `/api/platform/commerce/catalog` |
| Access after revoke | Cache TTL (30s); see [COMMERCE_CACHE_INVALIDATION.md](./COMMERCE_CACHE_INVALIDATION.md) |
| Missing subscriptions | Backfill verification script |

### Entitlement diagnose steps

`EntitlementService.diagnose()` returns ordered steps:

`override_deny` → `override_allow` → `product` → `subscription` → `subscription_state` → `licences` → `application|feature` → `seat`

Match failing step to reason code in [PLATFORM_ENTITLEMENT_ENGINE.md](../architecture/PLATFORM_ENTITLEMENT_ENGINE.md).

## Common incidents

### 1. User denied — seat not assigned

**Cause:** Active subscription and licence but no row in `commercial_seat_assignments`.

**Fix:**

1. `/system/seats` → assign user to product pool
2. Or SQL: verify `commercial_seats.total_seats > assigned count`
3. Retest with fresh entitlement check

### 2. User denied — subscription inactive

**Cause:** Status `suspended`, `cancelled`, `expired`, or trial past end.

**Fix:**

1. `/system/subscriptions` — inspect status and dates
2. Resume/reactivate via lifecycle API if commercially appropriate
3. Run `expireTrials` only after confirming trial should end

### 3. Tenant has no subscription after migration

**Cause:** Backfill skipped or tenant created post-migration.

**Fix:**

1. Run `pnpm --filter @rtb/platform-commerce commerce:verify-backfill`
2. Manually provision via `commerce.subscriptions.create()` + `licenceIssuance.issueForSubscription()`
3. Assign seats to members

### 4. Cross-tenant data concern

**Cause:** RLS misconfiguration.

**Fix:**

1. Run `commerce:verify-hosted-phase2` — check anon RLS smoke
2. Run `commerce-rls.test.ts` with tenant JWT fixtures
3. **SEV1** — restrict API until policies confirmed; page security on-call

### 5. Outbox / scheduler stalled

**Cause:** Cron not running; `COMMERCE_SCHEDULER_SECRET` mismatch; handler exceptions.

**Fix:**

1. Check pending count on `commercial_outbox_events`
2. Manually `POST /api/platform/commerce/jobs/run` with secret header
3. Inspect `dead_letter` rows for `last_error`
4. See [COMMERCE_OUTBOX_PROCESSING.md](./COMMERCE_OUTBOX_PROCESSING.md)

### 6. Stale access after licence revoke

**Cause:** Multi-instance cache TTL.

**Fix:**

1. Confirm revoke persisted (`commercial_licenses.status = revoked`)
2. Wait 30s or restart instances
3. User retry; writes use `cachePolicy: fresh`

### 7. Emergency access grant

**Approved break-glass only:**

```sql
INSERT INTO commercial_entitlement_overrides (
  tenant_id, effect, override_type, reason, valid_until, created_by
) VALUES (
  '<tenant_id>', 'allow', 'manual', '<ticket_ref>', now() + interval '24 hours', '<admin_user_id>'
);
```

Document in change ticket. Remove or set `revoked_at` when resolved.

**Do not** disable RLS or delete subscription rows.

## Verification commands

```bash
# Schema + RLS + permissions
pnpm --filter @rtb/platform-commerce commerce:verify-hosted-phase2

# Legacy tenant provisioning
pnpm --filter @rtb/platform-commerce commerce:verify-backfill

# Unit + integration tests
pnpm --filter @rtb/platform-commerce test
```

## Escalation data to collect

- Tenant slug (not user email in logs)
- Subscription ID and status
- Entitlement diagnose output / reason code
- `correlationId` from API error response
- Scheduler `SchedulerRunResult` for failed jobs
- Timestamp and instance ID if multi-node

## Post-incident

1. Confirm entitlement version bumped for affected tenant
2. Verify outbox processed for any manual lifecycle changes
3. Update override/ticket documentation
4. Add regression test if code defect

## Known systemic risks (Phase 2)

- No billing webhook → manual `past_due` / `grace_period` transitions
- In-memory cache → brief inconsistent access across nodes
- Outbox no-op for unhandled event types (silent skip)
- `COMMERCE_AUTH_SECRET` default in dev — production misconfig causes service assertion failures

## Related docs

- [COMMERCE_CACHE_INVALIDATION.md](./COMMERCE_CACHE_INVALIDATION.md)
- [COMMERCE_LIFECYCLE_JOBS.md](./COMMERCE_LIFECYCLE_JOBS.md)
- [COMMERCE_PHASE_2_BACKFILL.md](../migrations/COMMERCE_PHASE_2_BACKFILL.md)
- [COMMERCE_RLS_AND_PERMISSIONS.md](../security/COMMERCE_RLS_AND_PERMISSIONS.md)
