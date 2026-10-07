# RTB-SEC-REL-1D — residual signup commercial DEFINER lockdown

**Date:** 2026-10-07  
**Production:** Engineering OS `wcydlhqiqdwgoaqrlget`  
**Migration:** `20261007180000_rtb_sec_rel_1d_residual_signup_commercial_lockdown.sql`  
**Applied to production:** YES  
**Applied to staging:** NO  
**Start HEAD:** `9f8437f797d77d402080102dac5cd2b00164e38e`

THIS IS NOT reconstruction of `20260810210000` or `20260810220000`.

## Static safety review (pre-apply)

| Check | Value |
| --- | --- |
| DROP_FUNCTION | NO |
| CUSTOMER_DATA_WRITE | NO |
| ENTITLEMENT_DATA_WRITE | NO |
| SUBSCRIPTION_DATA_WRITE | NO |
| ROLE_ASSIGNMENT_CHANGE | NO |
| RLS_WEAKENING | NO |
| ANON_GRANT_ADDED | NO |
| AUTHENTICATED_GRANT_ADDED | NO |
| UNRELATED_SCHEMA_CHANGE | NO |
| FEATURE_DEPLOYMENT | NO |

## Pre-state

| Check | Value |
| --- | --- |
| Function | `public.provision_signup_commercial_defaults(uuid, uuid)` |
| Fingerprint | `69634f687e16947f52d71c760d5c0287` |
| SECURITY DEFINER | YES |
| search_path | `public` |
| EXECUTE | PUBLIC, anon, authenticated, service_role, postgres |
| Runtime callers | none |

## Post-state (reconfirmed after apply)

| Check | Value |
| --- | --- |
| Function present | YES |
| SECURITY DEFINER | YES |
| Owner | postgres |
| search_path | `pg_catalog, public` |
| EXECUTE | postgres, service_role |
| Ledger `20261007180000` | YES |
| Fingerprint | `4d6d64fffe4ecc5eaf178d97a3c9925a` (search_path pin only) |
| Anon RPC | 401 denied (dummy UUIDs; no entitlement writes) |
| Authenticated RPC | NOT_RUN_SAFETY_CONSTRAINT (no safe production cert user in env) |
| Anon table REST | tenants/profiles/commercial_subscriptions/commercial_licenses = 401 |
| service_role tenants | 200 |
| Health / deployment | 200 / 200 |
| Customer data modified | NO |

## Backup / recovery gate

`supabase backups list --project-ref wcydlhqiqdwgoaqrlget` (no restore executed):

- Latest physical backup id `1887331311`, status `COMPLETED`, `2026-10-06T17:06:30.275Z`
- `walg_enabled`: true
- `pitr_enabled`: false
- Region: `ap-southeast-2`
- Runbook: `docs/security/RTB_PLATFORM_BACKUP_RESTORE_RUNBOOK.md`

## Additional DEFINER findings (not auto-remediated)

Production still exposes 28 SECURITY DEFINER functions to PUBLIC, anon, and/or authenticated (74 grant rows). `provision_signup_commercial_defaults` is **not** among them (`quarantined_untrusted = false`).

Equivalent-class writers (caller `p_tenant_id`, no `auth.uid()` / membership check, untrusted EXECUTE remain):

- `bump_commercial_entitlement_version`
- `bump_commercial_installation_version`
- `create_default_tenant_roles`
- `provision_tenant_kernel_defaults`
- `reset_engineering_os_demo_data`
- `seed_engineering_os_demo_data`
- `seed_tenant_engineering_os`
- `seed_tenant_engineering_registers`
- `seed_tenant_intelligence`
- `seed_tenant_workflows`

**ADDITIONAL_CRITICAL_FINDING = YES.** REL-1D does not rewrite them.

Intentional authenticated helpers: `get_user_tenant_ids`, `is_tenant_member`, `has_permission`, `is_platform_admin`. Trigger neighbors and Project Intelligence job RPCs remain `REQUIRES_REVIEW`.

## Historical versions

`20260810210000` and `20260810220000` remain `UNRESOLVED_BLOCKED`.

**RESIDUAL_FUNCTION_REQUIRED_FOR_CLEAN_BOOTSTRAP = NO.**
