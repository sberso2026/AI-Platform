# Customer Administration Runbook

Operational procedures for the Phase 4 Customer Administration Portal.

## Verify portal health

1. Sign in as tenant **owner**
2. Open **System Administration → Installed Products** (`/system/products`)
3. Confirm summary cards show non-zero or honest empty values (not placeholder text)
4. Open **Subscription & Billing** — verify subscriptions/invoices load or show empty state without API error
5. Open **Licences & Seats** — confirm pools match Supabase `commercial_licenses` / seat pool records

## Owner cannot see billing

**Symptom:** Owner receives 403 on `/api/platform/administration/subscription-billing`

**Checks:**

1. Confirm user `roleSlug` is `owner` (`GET /api/platform/nav-context`)
2. Verify commerce admin entitlement: user needs `commerce.admin` permission on tenant
3. Check session tenant matches subscription tenant

## Admin sees billing nav item but gets denied

**Expected behaviour.** Sidebar hides owner-only items for admins. If direct URL used, middleware redirects. No action required unless item appears in sidebar — then check `canSeeNavItem` owner filter.

## Installed Products shows fallback banner

**Symptom:** `CatalogueFallbackBanner` on `/system/products`

**Checks:**

1. Commerce catalog API: `GET /api/platform/commerce/catalog` — inspect `catalogueFallback` flag
2. Verify `commercial_products` and tenant subscriptions/licences exist
3. Confirm Supabase connectivity and RLS for commerce tables
4. See [COMMERCE_CACHE_INVALIDATION.md](./COMMERCE_CACHE_INVALIDATION.md)

## Installation progress stuck or wrong steps

**Symptom:** Customer steps on `/system/installations/[id]` don't match internal workflow

**Checks:**

1. `GET /api/platform/administration/installations/[id]/progress` — inspect raw `steps`
2. Compare internal steps: `ctx.commerce.installationLifecycle.getWorkflowProgress`
3. Review `CUSTOMER_INSTALLATION_STEP_DEFS` mapping in `installation-administration-service.ts`
4. For failed installs, check `commercial_installation_failures` and error reference code shown in UI
5. See [INSTALLATION_RUNBOOK.md](./INSTALLATION_RUNBOOK.md) for retry/provision procedures

## Growth Credits balance incorrect

**Checks:**

1. Query `commercial_growth_credit_accounts` for tenant
2. Sum ledger: `commercial_growth_credit_transactions` by type
3. Verify `expiringSoonAmount` — earned credits with `expires_at` within 30 days
4. Confirm Batch 33 migration applied: `20260211000000_batch_33_growth_credits.sql`

Award/adjust credits via commerce admin tools or direct service calls — not through UI write paths in Phase 4 (read-only portal).

## Usage metrics missing

**Checks:**

1. `GET /api/platform/commerce/usage` — confirm aggregates returned
2. Verify usage ingestion jobs are recording to `commercial_usage_records`
3. Allowances are presentation-layer defaults in `usage-administration-service.ts` — adjust metric keys there if product plans change

## My Account shows no products

**Expected** when user lacks Engineering OS entitlement.

**Checks:**

1. `POST /api/platform/commerce/entitlements/check` with user's workspace
2. Confirm seat assignment and active licence
3. Verify workspace membership in `workspaces` table

## Licence issue from portal

1. Open `/system/licenses-seats`
2. Use **Issue licence** dialog
3. On success, table refreshes via `load()` callback
4. Verify new row in `commercial_licenses` and entitlement cache bump

## Escalation paths

| Issue | First check | Escalation doc |
|-------|-------------|----------------|
| Entitlement denial | `/system/subscriptions` diagnose | [COMMERCE_INCIDENT_RESPONSE.md](./COMMERCE_INCIDENT_RESPONSE.md) |
| Installation failure | Installation progress reference code | [INSTALLATION_FAILURE_RECOVERY.md](./INSTALLATION_FAILURE_RECOVERY.md) |
| Commerce data stale | Entitlement/installation version | [COMMERCE_CACHE_INVALIDATION.md](./COMMERCE_CACHE_INVALIDATION.md) |

## Related documentation

- [CUSTOMER_ADMINISTRATION_PORTAL.md](../architecture/CUSTOMER_ADMINISTRATION_PORTAL.md)
- [PHASE_4_CERTIFICATION.md](../testing/PHASE_4_CERTIFICATION.md)
