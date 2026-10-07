# RTB Database Recovery Baseline

**Phase:** RTB-REL-1B  
**Date:** 2026-10-07  
**Status:** CURRENT-STATE recovery documented  
**Production:** Engineering OS `wcydlhqiqdwgoaqrlget`  
**Staging:** `rntonzigxwxcjlcsadip`

THIS IS A CURRENT-STATE RECOVERY BASELINE.  
IT IS NOT THE ORIGINAL SQL FOR `20260810210000` OR `20260810220000`.

**DO NOT REPLAY BLOCKED HISTORICAL VERSIONS FROM INFERRED SQL.**

## Canonical reconstruction path

A supported Engineering OS environment is reconstructed from repository-owned live migrations:

1. Apply `supabase/migrations/` in timestamp order (existing Supabase reset/push path).
2. Do **not** copy `docs/release/historical-migrations/` into `supabase/migrations/`.
3. Do **not** apply Business OS historical artifacts to Engineering OS.
4. Do **not** invent SQL for blocked ledger versions `20260810210000` or `20260810220000`.
5. If restoring a **production dump** that already contains `provision_signup_commercial_defaults`, apply the lockdown artifact in `docs/recovery/sql/rtb_rel_1b_current_state_signup_commercial_lockdown.sql` under an explicit security-remediation approval. Do not apply it merely to make git match production.

The lockdown SQL is **not** a live migration. It is not production-eligible until a later security phase applies it deliberately.

## Required bootstrap objects (supported path)

| Object | Source | Notes |
| --- | --- | --- |
| `handle_new_user()` | `supabase/migrations/20260901013000_batch_99_invite_no_stray_tenant.sql` plus RLS-1C `search_path` pin | Canonical signup / invite trigger |
| `generate_tenant_slug`, `create_default_tenant_roles`, `handle_new_tenant` | `20260206000000_fix_signup_provisioning.sql` | Tenant/workspace/roles |
| Commerce catalog (`commercial_products`, `commercial_plans`, trial plan `d1000000-0000-4000-8000-000000000002`) | `20260208000002_batch_30_commerce_seed.sql` and later commerce migrations | Catalog only; not auto-assigned at signup |
| Product provisioning | `ProvisioningOrchestrator` → `seed_tenant_engineering_os` | After commercial installation, not during `handle_new_user` |
| Engineering document storage | App `ensureDocumentBucket()` on `engineering-documents` | Service-role mediated; not `tenant-documents` |
| Generated artifacts bucket | `20261001210000_eos_a14a_artifact_object_storage.sql` | `engineering-artifacts` |
| RLS helpers and public-schema invariants | RLS-1C `20261007160000` | Production security backport |

## Signup provisioning dependency

Supported signup is **GoTrue insert → `handle_new_user`**. That function:

- creates/updates `profiles`
- joins invited users to an existing tenant (no new tenant)
- otherwise inserts a signup tenant with `settings.created_via = signup`
- attaches owner membership and default workspace membership
- does **not** call `provision_signup_commercial_defaults`

`provision_signup_commercial_defaults(uuid, uuid)` exists on production as an **orphaned residual**. Repository application code, Edge/API routes, and `handle_new_user` / `handle_new_tenant` do not reference it.

**FUNCTION_CURRENTLY_REQUIRED = NO** for the supported Engineering OS path.

## Residual function (observed, not historical reconstruction)

Read-only production inspection (2026-10-07):

| Property | Observed value |
| --- | --- |
| Signature | `provision_signup_commercial_defaults(p_tenant_id uuid, p_user_id uuid) RETURNS void` |
| Language | plpgsql |
| Volatility | VOLATILE |
| Owner | postgres |
| SECURITY DEFINER | YES |
| `search_path` | `public` only (not `pg_catalog, public`) |
| EXECUTE | PUBLIC, anon, authenticated, service_role, postgres |
| Fingerprint (md5 of `pg_get_functiondef`) | `69634f687e16947f52d71c760d5c0287` |
| Called from `handle_new_user` | NO |
| Called from `handle_new_tenant` | NO |
| Other procedure callers | none |

Observed body (current-state contract, **not** recovered 1021 SQL): given tenant and user IDs, idempotently ensure an Engineering OS `trial` subscription (plan `d1000000-0000-4000-8000-000000000002`), product/application/feature licenses from that plan, a seat pool, a seat assignment, and a commercial installation. Refuses the internal UAT plan. Accepts caller-supplied tenant/user IDs with no membership check.

That grant posture is an **active least-privilege defect**. The recovery lockdown revokes PUBLIC/anon/authenticated execute and pins `search_path`. It does not copy the body into `supabase/migrations/`.

## Security invariants

- Do not grant anon/PUBLIC execute on SECURITY DEFINER writers.
- DEFINER helpers must use `search_path = pg_catalog, public`.
- Signup must not let a caller obtain another tenant, another workspace, platform-admin, or commercial entitlements for an arbitrary tenant ID.
- Business OS historical SQL must not be promoted onto Engineering OS production.
- Blocked historical ledger versions remain blocked.

## Release-manifest interaction

| Version | Historical provenance | Current-state recoverability |
| --- | --- | --- |
| `20260810210000` | `UNRESOLVED_BLOCKED` | `NOT_REQUIRED` — residual function is orphaned; lockdown artifact only |
| `20260810220000` | `UNRESOLVED_BLOCKED` | `INDEPENDENT` / `OBSOLETE` for supported EOS document storage |
| Business OS `20260818*` / `20260819*` | `RECOVERED_FROM_TRUSTED_HISTORY` | Staging-only sibling product; not in this reconstruction path |

Refreshing hosted ledgers must not delete those rows. Promotion of blocked or staging-only IDs must fail closed.

## How unresolved historical versions are treated

Keep them on the hosted ledger as historical facts. Do not delete, rename, or fill them with invented statements. Do not mark them `RECOVERED`. Disaster recovery of the **supported** system does not replay them.

## How current-state baseline differs from historical migration recovery

| Question | Answer |
| --- | --- |
| What SQL ran in August 2026? | Still unknown for the two production ledger-only versions |
| What is required today to reconstruct supported Engineering OS? | Live `supabase/migrations/` plus this lockdown file only when the residual function is already present |
| May we dump production function DDL and call it `20260810210000`? | **No** |

## Isolated reconstruction

This phase did not spin up a disposable Postgres. Static verification covers: required signup SQL present in live migrations; residual function absent from live migrations; lockdown SQL does not impersonate historical versions; promotion guard remains fail-closed.

## Production grant defect (unapplied)

Live production still has anon/PUBLIC execute on the residual DEFINER function. RTB-REL-1B does **not** modify production. Follow-on security remediation must apply the lockdown (or equivalent REVOKE + `search_path` pin) under its own approval. Until then, treat unauthenticated RPC of `provision_signup_commercial_defaults` as a live risk.
