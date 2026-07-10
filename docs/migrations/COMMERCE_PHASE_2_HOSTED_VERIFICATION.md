# Commerce Phase 2 Hosted Verification

Post-migration verification for hosted Supabase environments. Confirms schema, RLS, permissions, and RPC functions required by Phase 2 commerce enforcement.

## Script

```bash
pnpm --filter @rtb/platform-commerce commerce:verify-hosted-phase2
```

Source: `packages/platform-commerce/scripts/verify-hosted-phase2.ts`

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` | Yes* | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Schema probes |
| `SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | RLS smoke test |

\*When URL or service key is missing, script exits **0** with `SKIP` (CI-friendly).

## Migration versions checked

| Version | Migration file |
|---------|----------------|
| `20260209000000` | `batch_31_commerce_phase2.sql` |
| `20260209000001` | `batch_31_commerce_rls_permissions.sql` |
| `20260209000002` | `batch_31_commerce_backfill.sql` |
| `20260209000003` | (batch 31 continuation) |
| `20260209000004` | `commerce_entitlement_versions.sql` |

If `supabase_migrations.schema_migrations` is unavailable, table presence is used as fallback.

## Phase 2 tables

| Table | Purpose |
|-------|---------|
| `commercial_seat_assignments` | User seat assignments |
| `commercial_features` | Feature catalogue |
| `commercial_product_applications` | Product → application map |
| `commercial_plan_entitlements` | Plan grants |
| `commercial_subscription_changes` | Scheduled plan changes |
| `commercial_entitlement_overrides` | Admin overrides |
| `commercial_outbox_events` | Transactional outbox |
| `commercial_entitlement_versions` | Cache bust stamp |

## RLS tables verified present

`commercial_subscriptions`, `commercial_licenses`, `commercial_seats`, `commercial_subscription_events`, `commercial_seat_assignments`, `commercial_entitlement_overrides`, `commercial_outbox_events`

## RPC functions

| Function | Purpose |
|----------|---------|
| `create_default_tenant_roles` | Role seeding |
| `bump_commercial_entitlement_version` | Entitlement version increment |

## Permission seeds

Administrator roles (`slug = admin`) must include commerce permissions:

- `manage_subscriptions`
- `manage_licences`
- `manage_seats`
- `manage_overrides`
- `resource: commerce` entries

## RLS smoke test

When anon key is configured:

- Unauthenticated client `select` on `commercial_subscriptions` must return empty or error
- Non-empty anon result → **FAIL** (RLS misconfiguration)

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | PASS or SKIP |
| `1` | FAIL — see `[commerce:verify-hosted-phase2] FAIL:` lines |

## Recommended CI pipeline

```bash
pnpm db:migrate
pnpm db:types
pnpm --filter @rtb/platform-commerce commerce:verify-hosted-phase2
pnpm --filter @rtb/platform-commerce commerce:verify-backfill
pnpm --filter @rtb/platform-commerce test
```

RLS integration tests (`commerce-rls.test.ts`) require separate JWT fixtures and run only when `SUPABASE_TEST_URL` is set.

## Failure triage

| Failure | Action |
|---------|--------|
| Table missing | Re-run `pnpm db:migrate`; check migration order |
| Migration not applied | Apply specific `20260209*` file manually in Supabase SQL editor |
| Permission seed missing | Re-run `20260209000001` UPDATE on roles |
| Anon RLS leak | Review Batch 30/31 RLS policies on `commercial_subscriptions` |
| RPC missing | Apply `20260209000004_commerce_entitlement_versions.sql` |

## Related docs

- [COMMERCE_PHASE_2_BACKFILL.md](./COMMERCE_PHASE_2_BACKFILL.md)
- [COMMERCE_RLS_AND_PERMISSIONS.md](../security/COMMERCE_RLS_AND_PERMISSIONS.md)
