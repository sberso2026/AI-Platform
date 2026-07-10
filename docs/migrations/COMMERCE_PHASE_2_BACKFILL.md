# Commerce Phase 2 Tenant Backfill

Migration `20260209000002_batch_31_commerce_backfill.sql` provisions legacy access for existing tenants. Companion seed data is in the same migration file (plan entitlements, product applications, features).

## Preconditions

1. Batch 30 commerce tables applied
2. Batch 31 Phase 2 schema applied (`20260209000000`–`20260209000001`)
3. Engineering OS product seeded: `c1000000-0000-4000-8000-000000000001`
4. Enterprise plan seeded: `d1000000-0000-4000-8000-000000000001`

## Behaviour

For each **active** tenant without an Engineering OS subscription:

1. Creates `active` subscription with `metadata.source = migration_legacy_access`
2. Records `subscription.activated` in `commercial_subscription_events`
3. Issues `product` licence (`max_seats: 100`)
4. Issues `application` licences for all rows in `commercial_product_applications` for Engineering OS
5. Creates seat pool `default` with `total_seats: 100`
6. Assigns seats to all active `tenant_memberships`

## Idempotency

Skips tenants that already have a non-deleted `commercial_subscriptions` row for Engineering OS (`product_id = c1000000-0000-4000-8000-000000000001`).

Licence and seat inserts use `NOT EXISTS` guards to avoid duplicates on re-run.

## Plan entitlements seeded

| Plan | Entitlements |
|------|--------------|
| Enterprise (`d1000000-...0001`) | All Engineering OS applications, `ai_ocr` feature, 100 seats |
| Starter (`d1000000-...0002`) | `project_intelligence`, 5 seats |

## Rollback

**Do not** delete subscriptions in production to roll back.

| Goal | Procedure |
|------|-----------|
| Temporary access relief | Create time-bound `commercial_entitlement_overrides` with documented approval |
| Disable enforcement | Not supported — use override deny per tenant with audit trail |
| Full revert | Restore database snapshot from pre-migration backup |

## Verification script

```bash
# Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
pnpm --filter @rtb/platform-commerce commerce:verify-backfill
```

Script: `packages/platform-commerce/scripts/verify-backfill.ts`

Per-tenant checks:

- Exactly one Engineering OS subscription
- Status `active`
- Active product licence
- Application licence for each `commercial_product_applications` row
- Seat pool present; legacy tenants expect `total_seats = 100`
- Active seat assignments ≥ active tenant members
- `subscription.activated` event exists
- Global `engineering-os` plan entitlement exists

Logging uses tenant slug only (no user PII).

## Manual SQL spot-check

```sql
SELECT t.slug, s.status, s.metadata->>'source' AS source,
       COUNT(DISTINCT cl.id) FILTER (WHERE cl.license_type = 'application') AS app_licences,
       cs.total_seats,
       COUNT(sa.id) FILTER (WHERE sa.status = 'active') AS seats_assigned
FROM tenants t
JOIN commercial_subscriptions s ON s.tenant_id = t.id
  AND s.product_id = 'c1000000-0000-4000-8000-000000000001'
  AND s.deleted_at IS NULL
LEFT JOIN commercial_licenses cl ON cl.subscription_id = s.id AND cl.deleted_at IS NULL
LEFT JOIN commercial_seats cs ON cs.tenant_id = t.id
  AND cs.product_id = 'c1000000-0000-4000-8000-000000000001'
LEFT JOIN commercial_seat_assignments sa ON sa.seat_pool_id = cs.id AND sa.deleted_at IS NULL
WHERE t.status = 'active'
GROUP BY t.slug, s.status, s.metadata, cs.total_seats;
```

## Post-backfill steps

1. Run `commerce:verify-backfill` — exit 0
2. Run `commerce:verify-hosted-phase2` — exit 0
3. Spot-check entitlement diagnose for a legacy tenant user in `/system/subscriptions`
4. Confirm Engineering OS access for a member with seat assignment

## Known limitations

- New tenants created after migration need explicit subscription provisioning (not covered by backfill)
- Backfill does not create `commercial_outbox_events` for activation (subscription event table only)
- Trial plan (`d1000000-...0002`) is seeded but not auto-assigned
- Members added after backfill do not auto-receive seats — use seat admin or assignment job

## Related docs

- [COMMERCE_PHASE_2_HOSTED_VERIFICATION.md](./COMMERCE_PHASE_2_HOSTED_VERIFICATION.md)
- [COMMERCE_RLS_AND_PERMISSIONS.md](../security/COMMERCE_RLS_AND_PERMISSIONS.md)
