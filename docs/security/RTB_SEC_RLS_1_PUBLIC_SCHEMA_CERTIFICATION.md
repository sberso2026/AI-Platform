# RTB-SEC-RLS-1 Public Schema RLS Remediation and Tenant Isolation Certification

Date: 2026-10-07  
Environment: STAGING / NON-PRODUCTION  
Target project: RTB AI Platform Staging `rntonzigxwxcjlcsadip`  
Production: not modified  
Inspection Intelligence project: not modified

START_HEAD: `a3a4ae0cbc1a3a324dc9b5cdefc92f3c47221c22`  
Branch: `cursor/era-7a-engineering-review-pilot-gate`  
Migration: `supabase/migrations/20261007120000_rtb_sec_rls_1_public_schema_remediation.sql`

## Verdict

PASS_WITH_LIMITATIONS for staging authorization boundaries on API-exposed `public` ordinary tables.

A clean Security Advisor dashboard is not the evidence. Evidence is hosted PostgreSQL metadata, REST JWT tests, and a regression guard.

## Hosted inventory (before)

- Public ordinary tables: 667
- RLS enabled: 659
- RLS disabled: 8
- FORCE RLS: 64 (unchanged this phase)

RLS-disabled tables (postgres owner, no tenant/workspace columns, GRANT ALL to anon + authenticated + service_role, zero policies):

1. `digital_twin_source_adapters`
2. `digital_twin_state_schemas`
3. `digital_twin_source_authority_policies`
4. `security_assurance_compliance_frameworks`
5. `security_assurance_compliance_framework_versions`
6. `security_assurance_compliance_requirements`
7. `security_assurance_compliance_control_mappings`
8. `security_assurance_customer_claims`

Repository migrations `20260808160000`, `20260808330000`, and `20260808340000` created those objects without RLS. Hosted state matched migration intent for those eight (schema drift was missing RLS, not extra tables).

## Classification (after; 668 public ordinary tables)

Includes the new `rtb_public_table_security_classification` register.

| Classification | Count |
| --- | ---: |
| WORKSPACE_SCOPED | 489 |
| TENANT_SCOPED | 114 |
| PLATFORM_REFERENCE | 34 |
| BACKEND_ONLY | 30 |
| USER_SCOPED | 1 |
| PROJECT_SCOPED | 0 |
| PUBLIC_INTENTIONAL | 0 |
| UNRESOLVED | 0 |
| UNCLASSIFIED | 0 |

Canonical authorization reuse:

- Tenant membership: `get_user_tenant_ids()`, `tenant_memberships` (existing policies; not duplicated)
- Workspace membership: `workspace_memberships` (existing policies; not duplicated)
- Platform admin writes: `is_platform_admin()`
- Service/backend: `service_role` (BYPASSRLS; FORCE RLS not applied)

## Remediated policy matrix

| TABLE | CLASSIFICATION | CURRENT_RLS | ANON | AUTHENTICATED | INTENDED_READ | INTENDED_WRITE | SOURCE |
| --- | --- | --- | --- | --- | --- | --- | --- |
| digital_twin_source_adapters | PLATFORM_REFERENCE | enabled | none | SELECT | authenticated JWT | `is_platform_admin()` / service_role | workspace-snapshot user JWT `select *` |
| digital_twin_state_schemas | PLATFORM_REFERENCE | enabled | none | SELECT | authenticated JWT | `is_platform_admin()` / service_role | catalog; no client write routes |
| digital_twin_source_authority_policies | PLATFORM_REFERENCE | enabled | none | SELECT | authenticated JWT | `is_platform_admin()` / service_role | catalog; no client write routes |
| security_assurance_compliance_frameworks | BACKEND_ONLY | enabled, no client policies | none | none | service_role | service_role | in-memory seeds; no PostgREST usage |
| security_assurance_compliance_framework_versions | BACKEND_ONLY | enabled, no client policies | none | none | service_role | service_role | same |
| security_assurance_compliance_requirements | BACKEND_ONLY | enabled, no client policies | none | none | service_role | service_role | same |
| security_assurance_compliance_control_mappings | BACKEND_ONLY | enabled, no client policies | none | none | service_role | service_role | same |
| security_assurance_customer_claims | BACKEND_ONLY | enabled, no client policies | none | none | service_role | service_role | no tenant_id; profiles/packages are separate tenant tables |

Policies use `auth.uid() IS NOT NULL` for Digital Twin SELECT (not unrestricted true). Writes use `is_platform_admin()`. FORCE RLS was not set.

## Tests

| Suite | Result |
| --- | --- |
| `rtb_sec_rls_public_violations()` hosted RPC | empty (0 violations) |
| `pg_class` public `relrowsecurity=false` | 0 rows |
| Anon REST SELECT/INSERT/UPDATE/DELETE on 8 tables | denied |
| Authenticated DT SELECT | allowed; writes denied for Tenant A and Tenant B |
| Authenticated SA SELECT/INSERT | denied |
| service_role DT canary insert/delete | allowed |
| ERA-3 live JWT tenant/workspace isolation (`live-rls.test.ts`) | 11 passed |
| Static migration/credential guards | 6 passed |

## Service credentials

- Browser `NEXT_PUBLIC_*` exposes URL + anon key only (`apps/web/src/lib/supabase/public-config.ts`).
- `SUPABASE_SERVICE_ROLE_KEY` is server-only (`apps/web/src/lib/supabase/service.ts`).
- No `NEXT_PUBLIC_*SERVICE_ROLE*` bindings found in `apps/web/src`.
- CREDENTIAL_ROTATION_REQUIRED = NO. Secret values were not printed.

## Views / SECURITY DEFINER

- No public views or materialized views select the eight remediated tables.
- New guard function: `SECURITY DEFINER`, `search_path = pg_catalog, public`, no table-name parameters, execute granted only to `service_role`.
- Existing `is_platform_admin()`: `search_path = public` (pre-existing).
- Existing `get_user_tenant_ids()`: missing pinned `search_path` (pre-existing; not used by the eight tables). Remaining limitation.

## Regression guard

`public.rtb_sec_rls_public_violations()` fails closed when:

- a public ordinary table has RLS disabled, or
- a public ordinary table has no classification row, or
- a classification is `UNRESOLVED`, or
- anon still holds grants on the remediated set

Wired into `test:rls` via `src/rtb-sec-rls-1-live.test.ts` and CI path `supabase/migrations/*rtb_sec_rls_1*`.

## Remaining limitations

1. Security Advisor UI was not queried programmatically. Equivalent PostgreSQL check is clean. `SECURITY_ADVISOR_UI_RECHECK_REQUIRED = YES`.
2. Other public tables still commonly `GRANT ALL` to `anon` while RLS is enabled. This phase did not revoke those grants. RLS-filtered anon SELECT returning zero rows is not a cross-tenant leak, but grant hygiene is a follow-on phase.
3. Existing `USING (true)` SELECT policies on some PLATFORM_REFERENCE catalogs (commerce features, plugins, inspection pack registry, etc.) were not tightened. Do not weaken; later hardening only.
4. `get_user_tenant_ids()` / related helpers should pin `search_path` in a dedicated helper-hardening phase.
5. Production was not migrated. Staging certification is not production cutover.
6. Package `typecheck` still fails pre-existing `rootDir` / implicit-any errors in unrelated scripts. Not repaired.

## Application regression

Legitimate Digital Twin authenticated SELECT remains available for workspace-snapshot. Security Assurance engines continue to use in-memory seeds and do not require PostgREST. ERA-3 review package isolation still holds.
