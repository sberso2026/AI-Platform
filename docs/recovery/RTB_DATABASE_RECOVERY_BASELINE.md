# RTB Database Recovery Baseline

**Phase:** RTB-REL-1B / RTB-SEC-REL-1D  
**Date:** 2026-10-07  
**Status:** CURRENT-STATE recovery documented; residual DEFINER lockdown applied on production  
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
5. If restoring a **production dump** that already contains `provision_signup_commercial_defaults`, apply `supabase/migrations/20261007180000_rtb_sec_rel_1d_residual_signup_commercial_lockdown.sql` (same lockdown as the recovery copy). Do not replay blocked historical versions.

**RESIDUAL_FUNCTION_REQUIRED_FOR_CLEAN_BOOTSTRAP = NO.** A clean Engineering OS reset does not create the function. The 1D migration no-ops if it is absent and still records the ledger version.

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
| `search_path` (post-1D) | `pg_catalog, public` |
| EXECUTE (pre-1D) | PUBLIC, anon, authenticated, service_role, postgres |
| EXECUTE (post-1D, production 2026-10-07) | postgres, service_role only |
| Fingerprint pre-1D | `69634f687e16947f52d71c760d5c0287` |
| Fingerprint post-1D | `4d6d64fffe4ecc5eaf178d97a3c9925a` (search_path pin; body not rewritten as historical SQL) |
| Called from `handle_new_user` | NO |
| Called from `handle_new_tenant` | NO |
| Other procedure callers | none |

Observed body (current-state contract, **not** recovered 1021 SQL): given tenant and user IDs, idempotently ensure an Engineering OS `trial` subscription (plan `d1000000-0000-4000-8000-000000000002`), product/application/feature licenses from that plan, a seat pool, a seat assignment, and a commercial installation. Refuses the internal UAT plan. Accepts caller-supplied tenant/user IDs with no membership check.

REL-1D applied that lockdown to production on 2026-10-07. PUBLIC/anon/authenticated execute is revoked. The function body was not copied into live migrations as historical 1021 SQL.

## Security invariants

- Do not grant anon/PUBLIC execute on SECURITY DEFINER writers.
- DEFINER helpers must use `search_path = pg_catalog, public`.
- Signup must not let a caller obtain another tenant, another workspace, platform-admin, or commercial entitlements for an arbitrary tenant ID.
- Business OS historical SQL must not be promoted onto Engineering OS production.
- Blocked historical ledger versions remain blocked.

## Release-manifest interaction

| Version | Historical provenance | Current-state recoverability |
| --- | --- | --- |
| `20260810210000` | `UNRESOLVED_BLOCKED` | `NOT_REQUIRED` — residual function quarantined by `20261007180000` |
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

## Production grant status (REL-1D applied)

`20261007180000` revoked PUBLIC/anon/authenticated execute and pinned `search_path`. Anon RPC of the residual function returns 401.

REL-1E (`20261007190000`) then classified the remaining 28 untrusted DEFINER functions, restricted backend/trigger/PI execute to postgres/service_role, and added tenant-caller gates on remaining authenticated writers. See `docs/security/RTB_PRIVILEGED_RPC_REGISTER.md`.
