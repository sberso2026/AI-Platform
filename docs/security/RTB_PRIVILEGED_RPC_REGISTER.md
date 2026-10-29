# RTB Privileged RPC Register

**Phase:** RTB-SEC-REL-1E  
**Date:** 2026-10-07  
**Production:** Engineering OS `wcydlhqiqdwgoaqrlget`  
**Scope:** every production `SECURITY DEFINER` function that was executable by PUBLIC, anon, or authenticated before 1E.

This is the canonical privileged RPC inventory. New SECURITY DEFINER functions must be added here with runtime class, allowed callers, authorization mechanism, search_path, and privileged effect before untrusted EXECUTE is granted.

Historical ledger versions `20260810210000` and `20260810220000` remain `UNRESOLVED_BLOCKED`.

## Summary after 1E

| Class | Count | Untrusted EXECUTE |
| --- | ---: | --- |
| A — SAFE_CLIENT_RPC | 4 | authenticated only |
| B — SAFE_BACKEND_RPC | 19 | none (postgres/service_role; `handle_new_user` also `supabase_auth_admin`) |
| F — UNSAFE_ACTIVE mitigated | 5 | authenticated only, with `rtb_sec_rel_1e_assert_tenant_caller` |
| G — UNSAFE_UNUSED (1D residual) | 1 | none (`provision_signup_commercial_defaults`) |
| C / D / E / H | 0 | — |
| PUBLIC execute remaining | 0 | |
| anon execute remaining | 0 | |

## Authorization gate

`public.rtb_sec_rel_1e_assert_tenant_caller(uuid)` allows `service_role`, `is_platform_admin()`, or canonical `is_tenant_member(p_tenant_id)`. It is not a public RPC.

Remaining limitation: authenticated membership is not the same as commerce `demo.admin` or installation-admin authority. Direct authenticated RPC by any tenant member is still possible for the five F wrappers. Cross-tenant caller-supplied IDs are denied.

## Register

| Function | Class | Allowed callers | Effects | Authorization | search_path | Repository callers | Disposition |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `get_user_tenant_ids()` | A | authenticated, service_role, postgres | READ_ONLY membership | `auth.uid()` | pg_catalog, public | RLS policies, identity | NO_CHANGE |
| `is_tenant_member(uuid)` | A | authenticated, service_role, postgres | READ_ONLY membership | `auth.uid()` | pg_catalog, public | RLS policies | NO_CHANGE |
| `has_permission(text,text,uuid)` | A | authenticated, service_role, postgres | READ_ONLY permission | `auth.uid()` + role JSON | pg_catalog, public | RLS / commerce cert | NO_CHANGE |
| `is_platform_admin()` | A | authenticated, service_role, postgres | READ_ONLY admin flag | JWT `platform_admin` / service_role | pg_catalog, public | RLS | NO_CHANGE |
| `handle_new_user()` | B | postgres, service_role, supabase_auth_admin | USER_WRITE / TENANT_WRITE trigger | trigger on `auth.users`; not a client RPC | pg_catalog, public | signup trigger | RESTRICT_TO_BACKEND |
| `handle_new_tenant()` | B | postgres, service_role | ROLE_WRITE / TENANT_WRITE trigger | trigger | pg_catalog, public | tenant insert trigger | RESTRICT_TO_BACKEND |
| `handle_new_tenant_kernel()` | B | postgres, service_role | TENANT_WRITE trigger | trigger | pg_catalog, public | tenant insert trigger | RESTRICT_TO_BACKEND |
| `generate_tenant_slug(text)` | B | postgres, service_role | READ_ONLY slug uniqueness | trigger/DEFINER neighbor | pg_catalog, public | `handle_new_user` | RESTRICT_TO_BACKEND |
| `create_default_tenant_roles(uuid)` | B | postgres, service_role | ROLE_WRITE | trigger + admin fixtures | pg_catalog, public | `handle_new_tenant`; cert admin RPC | RESTRICT_TO_BACKEND |
| `provision_tenant_kernel_defaults(uuid)` | B | postgres, service_role | TENANT_WRITE | trigger neighbor | pg_catalog, public | `handle_new_tenant` | RESTRICT_TO_BACKEND |
| `seed_tenant_engineering_registers(uuid)` | B | postgres, service_role | TENANT_WRITE | called from seed wrapper / DEFINER | pg_catalog, public | `seed_tenant_engineering_os` impl | RESTRICT_TO_BACKEND |
| `seed_tenant_intelligence(uuid)` | B | postgres, service_role | TENANT_WRITE | trigger neighbor | pg_catalog, public | `handle_new_tenant` | RESTRICT_TO_BACKEND |
| `seed_tenant_workflows(uuid)` | B | postgres, service_role | TENANT_WRITE | trigger neighbor | pg_catalog, public | `handle_new_tenant` | RESTRICT_TO_BACKEND |
| `pi_document_claim_jobs(...)` | B | postgres, service_role | JOB_CONTROL | service worker | pg_catalog, public, pg_temp | `ProjectIntelligenceDocumentWorker` via service client | RESTRICT_TO_BACKEND |
| `pi_document_enqueue_processing(...)` | B | postgres, service_role | JOB_CONTROL | service client; Core document tenant match | pg_catalog, public, pg_temp | `durable-enqueue.ts` via service client | RESTRICT_TO_BACKEND |
| `pi_document_ensure_core_document(...)` | B | postgres, service_role | WORKSPACE_WRITE | service client | pg_catalog, public, pg_temp | `documents-service.ts` service client | RESTRICT_TO_BACKEND |
| `pi_document_lexical_search(...)` | B | postgres, service_role | READ_ONLY (caller tenant/workspace filter; no `auth.uid()`) | service client after API authz | pg_catalog, public, pg_temp | `PostgresDocumentIndexAdapter` via service client | RESTRICT_TO_BACKEND |
| `pi_document_vector_search(...)` | B | postgres, service_role | READ_ONLY same pattern | service client | pg_catalog, public, pg_temp | same | RESTRICT_TO_BACKEND |
| `pi_document_release_expired_leases()` | B | postgres, service_role | JOB_CONTROL | service worker | pg_catalog, public, pg_temp | document worker | RESTRICT_TO_BACKEND |
| `pi_document_renew_lease(...)` | B | postgres, service_role | JOB_CONTROL | service worker | pg_catalog, public, pg_temp | document worker | RESTRICT_TO_BACKEND |
| `pi_document_set_embedding_vector(...)` | B | postgres, service_role | JOB_CONTROL | service worker | pg_catalog, public, pg_temp | document worker | RESTRICT_TO_BACKEND |
| `pi_meeting_claim_jobs(...)` | B | postgres, service_role | JOB_CONTROL | service worker | pg_catalog, public | meeting worker | RESTRICT_TO_BACKEND |
| `pi_meeting_release_expired_leases()` | B | postgres, service_role | JOB_CONTROL | service worker | pg_catalog, public | meeting worker | RESTRICT_TO_BACKEND |
| `seed_engineering_os_demo_data(uuid)` | F mitigated | authenticated, service_role, postgres | DEMO_TEST_DATA_WRITE | assert tenant caller; API also `demo.admin` | pg_catalog, public | `EngineeringDemoDataService` user JWT | REVOKE_PUBLIC/ANON + MINIMAL_AUTHORIZATION_HARDENING |
| `reset_engineering_os_demo_data(uuid)` | F mitigated | authenticated, service_role, postgres | DEMO_TEST_DATA_WRITE | same | pg_catalog, public | same | same |
| `seed_tenant_engineering_os(uuid)` | F mitigated | authenticated, service_role, postgres | TENANT_WRITE | assert tenant caller | pg_catalog, public | `ProvisioningOrchestrator` user JWT | same |
| `bump_commercial_entitlement_version(uuid)` | F mitigated | authenticated, service_role, postgres | ENTITLEMENT_WRITE (version stamp only) | assert tenant caller | pg_catalog, public | `EntitlementVersionRepository` user JWT | same |
| `bump_commercial_installation_version(uuid)` | F mitigated | authenticated, service_role, postgres | ENTITLEMENT_WRITE (version stamp only) | assert tenant caller | pg_catalog, public | `InstallationVersionRepository` user JWT | same |
| `provision_signup_commercial_defaults(uuid,uuid)` | G | postgres, service_role | ENTITLEMENT_WRITE residual | quarantined in REL-1D | pg_catalog, public | none | already quarantined |
| `rtb_sec_rel_1e_assert_tenant_caller(uuid)` | B | postgres, service_role | NOT_REQUIRED_READ_ONLY gate | itself | pg_catalog, public | F wrappers | new; not a public RPC |

Impl functions renamed behind F wrappers (`*_rtb_1e_impl`) keep original write semantics and are postgres/service_role only.
