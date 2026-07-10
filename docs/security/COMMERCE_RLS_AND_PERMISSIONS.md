# Commerce RLS and Permissions

Row-level security and role permissions for Commerce Phase 2 tables. Migrations: `20260209000001_batch_31_commerce_rls_permissions.sql` (extends Batch 30 RLS).

## Permission model

Commerce actions use the `commerce` resource:

| Action | Typical role | Capability |
|--------|--------------|------------|
| `read` | member, viewer, engineer | View catalogue and own tenant commerce data |
| `admin` | tenant `admin` | Full commerce administration |
| `manage_subscriptions` | admin | Subscription lifecycle |
| `manage_licences` | admin | Licence issue/revoke |
| `manage_seats` | admin | Seat pool and assignments |
| `manage_overrides` | admin | Entitlement overrides |
| `manage_trials` | admin | Trial start/extend |
| `manage_billing` | owner | Billing accounts (owner-only UI) |
| `manage_products` | platform admin | Global catalogue writes |
| `manage_marketplace` | platform admin | Marketplace listings |

RLS write checks use `has_permission('commerce', 'admin', tenant_id)` for tenant-scoped tables.

Seed migration backfills `admin` and read-only roles. Verification: `commerce:verify-hosted-phase2` checks administrator role seeds.

## RLS by table

### Tenant-scoped (membership via `get_user_tenant_ids()`)

| Table | SELECT | INSERT/UPDATE/DELETE |
|-------|--------|----------------------|
| `commercial_subscriptions` | Tenant member | `commerce:admin` |
| `commercial_licenses` | Tenant member | `commerce:admin` |
| `commercial_seats` | Tenant member | `commerce:admin` |
| `commercial_subscription_events` | Tenant member | Service role only (immutable) |
| `commercial_seat_assignments` | Tenant member, `deleted_at IS NULL` | `commerce:admin` |
| `commercial_subscription_changes` | Tenant member | `commerce:admin` |
| `commercial_entitlement_overrides` | Tenant member | `commerce:admin` |
| `commercial_entitlement_versions` | Tenant member | Via RPC `bump_commercial_entitlement_version` |

### Global catalogue (platform admin write)

| Table | SELECT | WRITE |
|-------|--------|-------|
| `commercial_plan_entitlements` | All authenticated | `is_platform_admin()` |
| `commercial_features` | All authenticated | `is_platform_admin()` |
| `commercial_product_applications` | All authenticated | `is_platform_admin()` |
| `commercial_application_features` | All authenticated | `is_platform_admin()` |

### Platform admin only

| Table | Policy |
|-------|--------|
| `commercial_outbox_events` | `is_platform_admin()` for SELECT and ALL |

Tenant-facing audit reads outbox licence events through `CommerceAuditService` (service role), not direct client access.

## Cross-tenant isolation

Integration test: `packages/platform-commerce/src/tests/rls/commerce-rls.test.ts`

Requires env:

- `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`
- `COMMERCE_RLS_TENANT_A_JWT`, `COMMERCE_RLS_TENANT_B_JWT`, `COMMERCE_RLS_TENANT_B_ID`

Asserts tenant A JWT cannot read or write tenant B rows on subscriptions, licences, seats, events, seat assignments, overrides, outbox.

## API permission enforcement

Web commerce routes (`/api/platform/commerce/*`) check session permissions via `requireCommerceAdmin()` or owner role before invoking `@rtb/platform-commerce` services.

Engineering routes use entitlement checks, not commerce admin permissions — a member with a seat can access Engineering OS without `commerce:admin`.

## Scheduler and service role

- `POST /api/platform/commerce/jobs/run` accepts `x-commerce-scheduler-secret` header (bypasses user RLS via service client)
- Fallback: authenticated `owner` role with user-scoped commerce client

## Operational verification

```bash
pnpm --filter @rtb/platform-commerce commerce:verify-hosted-phase2
```

Checks: Phase 2 tables, migration versions `20260209000000`–`20260209000004`, RLS smoke (anon cannot read subscriptions), role permission seeds, RPC functions.

See [COMMERCE_PHASE_2_HOSTED_VERIFICATION.md](../migrations/COMMERCE_PHASE_2_HOSTED_VERIFICATION.md).

## Known limitations

- Outbox table is not tenant-readable — tenant audit is service-mediated only
- `commercial_subscription_events` immutability enforced by trigger, not RLS
- Platform admin bypass is required for catalogue publishing — no delegated publisher role yet
- Cross-tenant RLS tests skip when JWT env vars are unset

## Related docs

- [ENGINEERING_COMMERCE_ROUTE_ENFORCEMENT.md](./ENGINEERING_COMMERCE_ROUTE_ENFORCEMENT.md)
- [PLATFORM_COMMERCE_MIGRATION.md](../architecture/PLATFORM_COMMERCE_MIGRATION.md)
