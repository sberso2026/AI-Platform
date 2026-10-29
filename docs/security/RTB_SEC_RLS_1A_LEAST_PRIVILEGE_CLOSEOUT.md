# RTB-SEC-RLS-1A Least-Privilege Closeout

Date: 2026-10-07  
Environment: STAGING / NON-PRODUCTION  
Target project: RTB AI Platform Staging `rntonzigxwxcjlcsadip`  
Follows: [RTB-SEC-RLS-1](./RTB_SEC_RLS_1_PUBLIC_SCHEMA_CERTIFICATION.md)  
START_HEAD: `44a2a1e4662a123704511f7d2dd34aa4aa40e3e1`  
Migration: `supabase/migrations/20261007140000_rtb_sec_rls_1a_least_privilege_closeout.sql`  
Production: not modified

## Verdict

PASS_WITH_LIMITATIONS for staging least-privilege closeout. No cross-tenant or cross-workspace leak was observed. Anonymous table privileges on public ordinary tables are gone.

## Anon grants

| | Before | After |
| --- | ---: | ---: |
| Public tables with anon SELECT | 659 | 0 |
| Public tables with anon INSERT/UPDATE/DELETE/TRUNCATE | 659 | 0 |
| Unjustified anon grants | 659 tables (GRANT ALL) | 0 |
| Reviewed exceptions | n/a | none (`rtb_anon_table_grant_exceptions` empty) |

Justification: login, signup, and password reset use GoTrue only. Tenant bootstrap is `handle_new_user()` SECURITY DEFINER. No unauthenticated PostgREST table client was found.

Authenticated and service_role table grants were not revoked.

`ALTER DEFAULT PRIVILEGES` for role `postgres` was applied. Changing default privileges for `supabase_admin` was denied by hosted permissions and is recorded as a limitation. The extended guard fails if a new public table later appears with anon grants.

## Catalog policies

Unrestricted policies found: 21, all on PLATFORM_REFERENCE tables (none on tenant/workspace/user data).

| Action | Count | Disposition |
| --- | ---: | --- |
| SELECT USING true TO public | 19 | Tightened to `TO authenticated USING (auth.uid() IS NOT NULL)` — intentional catalog read |
| INSERT/UPDATE true on `asset_intelligence_failure_taxonomy` | 2 | Tightened to `is_platform_admin()` — public API is GET-only / in-memory registry |

UNJUSTIFIED_PUBLIC_CATALOG_ACCESS = 0 after tightening.

## Canonical helpers

| Function | Before | After |
| --- | --- | --- |
| `get_user_tenant_ids()` | SECURITY DEFINER, search_path unpinned, EXECUTE to PUBLIC+anon | `SET search_path = pg_catalog, public`; objects schema-qualified; EXECUTE authenticated+service_role |
| `is_tenant_member(uuid)` | same | same hardening |
| `has_permission(text,text,uuid)` | same | same hardening |
| `is_platform_admin()` | search_path=public | `pg_catalog, public`; EXECUTE no longer granted to anon |

Live RPC: Tenant A JWT returns only Tenant A; Tenant B JWT returns only Tenant B; anon cannot execute.

Related provisioning DEFINER functions (`handle_new_user`, slug/seed helpers) were `ALTER FUNCTION ... SET search_path = pg_catalog, public` without body changes.

## Live evidence

- Guard `rtb_sec_rls_public_violations()` empty
- Anon CRUD denied on representative tables (401 after GRANT revoke)
- Authenticated commercial_features and DT adapter SELECT still work
- Taxonomy write by ordinary tenant JWT denied
- ERA-3 review package tenant/workspace isolation 11/11
- ERA-6 core project/document isolation 8/8
- EOS-A11A work-plan isolation 2/2
- RLS-1 live certification 6/6 after composing 1A

## Remaining limitations

1. Security Advisor UI still requires a manual recheck.
2. Hosted role cannot revoke `supabase_admin` default table privileges; new dashboard-created tables might grant anon until the guard fails.
3. Production is not migrated.
4. Pre-existing `@rtb/engineering-review-persistence` typecheck `rootDir` failures are unchanged.
5. Apply order is 1 then 1A. Re-applying only 1 replaces the guard body; hosted tests apply both.

PRODUCTION_MIGRATION_APPLIED: NO

Combined RLS-1 + RLS-1A is suitable for **controlled production promotion** after staging soak and Advisor UI confirmation. It does not require a new authorization architecture.
