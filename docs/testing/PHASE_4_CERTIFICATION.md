# Phase 4 Customer Administration Certification

Phase 4 certifies the Customer Administration Portal: real Commerce and Installation Lifecycle integration, owner-only billing isolation, Growth Credits schema, and administration view-model correctness.

## Scope

| Area | Verification |
|------|--------------|
| Administration services | View mappers, health normalization, installation step translation |
| API routes | Auth, owner guards, commerce admin entitlement |
| UI pages | System Administration nav, all Phase 4 routes load with live data |
| Growth Credits | Batch 33 migration, RLS, `GrowthCreditService` |
| No fabricated state | Empty/error paths when commerce records absent |
| Access control | Owner vs admin vs viewer route matrix |

## Gates

| Gate | Scope |
|------|-------|
| A | Unit tests — `installation-administration.test.ts`, navigation tests, commerce adapter |
| B | Typecheck and production build (`apps/web`) |
| C | Hosted Batch 33 schema — growth credit tables and RLS policies |
| D | Administration API smoke — authenticated owner/admin JWT against hosted Supabase |
| E | Owner-only enforcement — admin receives 403 on subscription-billing and growth-credits APIs |
| F | Playwright E2E — System Administration pages, my-account, installation progress |
| G | Installation progress mapping — customer steps do not skip ahead of workflow |
| H | Real data path — catalog, subscriptions, licences, usage from commerce services |
| I | Legacy route compatibility — `/system/subscriptions`, `/system/licenses` still reachable |
| J | Build identity — certification server matches committed SHA |

## Unit test commands

```bash
pnpm --filter @rtb/platform-core test administration
pnpm --filter @rtb/platform-core test navigation
pnpm --filter @rtb/platform-core test nav-visibility
```

Key assertion: `mapInstallationProgress` does not mark `activation_complete` while status is `provisioning`.

## E2E scenarios

| Test | Expected |
|------|----------|
| Owner opens `/system/products` | 200, summary cards from catalog API |
| Owner opens `/system/subscription-billing` | Subscriptions/invoices table or empty state |
| Admin opens `/system/subscription-billing` | Redirect or 403 at API |
| Owner opens `/system/growth-credits` | Balance cards + disclaimer |
| Admin opens `/system/licenses-seats` | Pool table from commerce |
| Viewer opens `/my-account` | Assigned products per entitlement |
| Viewer opens `/system/products` | Redirect to `/engineering` |
| Installation progress page | Real workflow steps from lifecycle service |
| Flow N uninstall | Scenario-specific HTTP statuses — see `docs/api/INSTALLATION_UNINSTALL.md` |

## Uninstall certification

Required scenarios (exact HTTP status, no 5xx acceptance):

| Scenario | Status | Error code |
|----------|--------|------------|
| Owner happy path (no dependants) | 200 | — |
| Unauthenticated | 401 | — |
| Viewer / engineer | 403 | `commerce_permission_denied` |
| Missing installation | 404 | `installation_not_found` |
| Invalid lifecycle state | 409 | `invalid_installation_transition` |
| Active dependent applications | 422 | `active_dependencies_exist` |

Tests: `src/uninstall-http-certification.ts`, `playwright/flow-n-uninstall.spec.ts`

Reuse patterns from `packages/commerce-certification/e2e/` and `packages/installation-certification/playwright/`.

## Schema verification

Confirm on hosted Supabase:

```sql
SELECT tablename FROM pg_tables
WHERE tablename IN (
  'commercial_growth_credit_accounts',
  'commercial_growth_credit_transactions'
);
```

Verify RLS enabled and policies reference `get_user_tenant_ids()` and `has_permission('commerce', 'admin', ...)`.

## Manual certification checklist

- [ ] Installed Products summary reflects live seat/subscription data
- [ ] Product detail shows real licence dimensions for Engineering OS
- [ ] Subscription & Billing shows actual invoices or honest empty state
- [ ] Licences & Seats pools match `commercial_licenses` and seat pools
- [ ] Usage table reflects `commercial_usage` aggregates
- [ ] Growth Credits account reads from Batch 33 tables
- [ ] `/system/installations/[id]` shows mapped customer workflow steps
- [ ] No `CatalogueFallbackBanner` in production with live commerce
- [ ] Owner-only nav items hidden for admin role in sidebar

## Artifacts

Store certification output under `docs/certification/` or package artifacts when harness is added:

- `phase-4-certification.json`
- Playwright report
- Schema verification log

## Dependencies

Requires Phase 2 Commerce and Phase 3 Installation certification baselines:

- [COMMERCE_PHASE_2_CERTIFICATION.md](../certification/COMMERCE_PHASE_2_CERTIFICATION.md)
- [PHASE_3_CERTIFICATION.md](./PHASE_3_CERTIFICATION.md)

## Environment

Hosted Supabase, valid tenant fixtures with Engineering OS subscription/licence/installation, `COMMERCE_AUTH_SECRET` for JWT test users.
