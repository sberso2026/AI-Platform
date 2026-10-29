# RTB-SEC-REL-1E — privileged RPC authorization audit and hardening

**Date:** 2026-10-07  
**Production:** Engineering OS `wcydlhqiqdwgoaqrlget`  
**Migration:** `20261007190000_rtb_sec_rel_1e_privileged_rpc_authorization_hardening.sql`  
**Applied to production:** YES  
**Applied to staging:** NO  
**Start HEAD:** `bf98cf74c39b619ea5c10204c26e713122b6fd52`

THIS IS NOT reconstruction of `20260810210000` or `20260810220000`.

## Static safety review

| Check | Value |
| --- | --- |
| FUNCTIONS_DROPPED | NO |
| CUSTOMER_DATA_MODIFIED | NO |
| ENTITLEMENT_DATA_MODIFIED | NO |
| RLS_WEAKENED | NO |
| NEW_PUBLIC_EXECUTE_GRANTS | 0 |
| NEW_ANON_EXECUTE_GRANTS | 0 |
| UNRELATED_FEATURE_DEPLOYMENT | NO |
| HISTORICAL_LEDGER_MODIFIED | NO |

Authenticated EXECUTE was retained only on A helpers and five F wrappers that now call `rtb_sec_rel_1e_assert_tenant_caller`.

## Inventory

DEFINER_FUNCTIONS_IN_SCOPE before 1E: **28** (74 grant rows). No unclassified functions.

## Post-apply

| Metric | Value |
| --- | --- |
| PUBLIC executable DEFINER | 0 |
| anon executable DEFINER | 0 |
| authenticated executable DEFINER | 9 (4 A + 5 F) |
| Ledger `20261007190000` | YES |
| Anon RPC (dummy tenant) | 401 on seed/reset/seed_os/bump/roles/kernel/PI lease |
| Health / deployment | 200 / 200 |
| service_role tenants | 200 |

Canonical register: `docs/security/RTB_PRIVILEGED_RPC_REGISTER.md`.
