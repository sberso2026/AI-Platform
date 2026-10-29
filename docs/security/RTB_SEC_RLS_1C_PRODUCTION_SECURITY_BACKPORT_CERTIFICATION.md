# RTB-SEC-RLS-1C Production Security Backport Certification

Date: 2026-10-07  
Phase: production schema security backport of RLS-1 / RLS-1A controls  
Verdict: **PASS_WITH_LIMITATIONS**

START_HEAD: `475e916318e499ce1f27f5b7daaf8a6ad78b0249`  
Branch: `cursor/era-7a-engineering-review-pilot-gate`  
Production: Engineering OS `wcydlhqiqdwgoaqrlget`  
Staging: RTB AI Platform Staging `rntonzigxwxcjlcsadip` (not modified)  
Inspection Intelligence / RTB-Intranet-Production: not used

RLS-1B correctly blocked direct apply of `20261007120000` because production lacks Security Assurance tables. This phase backports the **same security invariants** onto the current production catalog. It does not make production identical to staging.

No secrets or customer row data are recorded here.

## Why staging migrations were not applied

`20261007120000` issues `ALTER TABLE` / `COMMENT ON TABLE` for five `security_assurance_*` relations. Those relations do not exist on Engineering OS. Applying the staging file would fail closed (`42P01`). `20261007140000` depends on the classification table created by that file.

Certified staging files were left unchanged (SHA-256 unchanged from RLS-1B).

## Production baseline (re-queried)

| Metric | Before 1C |
| --- | ---: |
| Public ordinary tables | 476 |
| RLS disabled | 3 |
| FORCE RLS | 0 |
| Tables with anon grants | 476 |
| Unrestricted `SELECT TO public USING true` | 19 |
| Migration head | `20260901013000` |
| RLS-1 / RLS-1A ledger versions | absent |

### Three RLS-disabled tables

| TABLE | CLASSIFICATION | CURRENT_RLS | CURRENT_GRANTS | CURRENT_POLICIES | APPLICATION_USAGE | INTENDED_ACCESS | REMEDIATION |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `digital_twin_source_adapters` | PLATFORM_REFERENCE | disabled | GRANT ALL anon + authenticated | none | `createPostgresDigitalTwinRepository(ctx.supabase).listSourceAdapters` from `/api/engineering/digital-twin/workspace-snapshot` (user JWT). Writes via postgres adapter upsert. `/adapters` route uses in-memory `listSourceAdapters()`. | Authenticated SELECT; writes `is_platform_admin()` / service_role | ENABLE RLS + revoke anon + SELECT to authenticated |
| `digital_twin_state_schemas` | PLATFORM_REFERENCE | disabled | GRANT ALL anon + authenticated | none | Postgres repository get/list/upsert; no tenant column | same | same |
| `digital_twin_source_authority_policies` | PLATFORM_REFERENCE | disabled | GRANT ALL anon + authenticated | none | Postgres repository catalog; no tenant column | same | same |

No `tenant_id` / `workspace_id` / `user_id`. Staging RLS-1 already certified these as PLATFORM_REFERENCE.

## Control map

| PRODUCTION_OBJECT | STAGING_EQUIVALENT | CONTROL_IN_RLS_1 | CONTROL_IN_RLS_1A | APPLICABLE_TO_PRODUCTION | BACKPORT_ACTION |
| --- | --- | --- | --- | --- | --- |
| Digital Twin 3 catalogs | same names | ENABLE RLS, authenticated SELECT, admin writes | covered by global anon revoke | YES | backport |
| `asset_intelligence_failure_taxonomy` | same | classified PLATFORM_REFERENCE | tighten SELECT; writes `is_platform_admin()` | YES | backport |
| 19 unrestricted catalog SELECT policies | same policy class | not fully closed | TO authenticated `auth.uid() IS NOT NULL` | YES | backport |
| anon GRANT ALL on public tables | 659 staging tables | 8-table revoke | REVOKE ALL FROM anon/PUBLIC | YES (476 tables) | backport |
| `get_user_tenant_ids` / `is_tenant_member` / `has_permission` / `is_platform_admin` | same signatures; unpinned on production | reused | pin search_path, qualify, revoke anon EXECUTE | YES | backport bodies + grants |
| provisioning DEFINER helpers | same names | n/a | pin search_path without body change | YES (present) | pin only |
| `security_assurance_*` (5) | present on staging | ENABLE RLS, backend-only | n/a | **NOT_APPLICABLE_OBJECT_ABSENT** | skip; do not CREATE |
| other missing staging modules | later EOS/Review batches | n/a | n/a | NOT_APPLICABLE | skip; no schema sync |

## Anon grant analysis

Login/signup use GoTrue (`signInWithPassword`, `signUp`). Tenant bootstrap is `handle_new_user()` SECURITY DEFINER. Webhooks and Engineering OS routes use authenticated or service_role clients. No legitimate unauthenticated PostgREST table client was found.

No exception rows were inserted into `rtb_anon_table_grant_exceptions`.

## Canonical helpers

Production bodies already filtered `tenant_memberships` by `auth.uid()` and `status = 'active'`. Drift vs staging-certified 1A was search_path (null / `public`) and unqualified names. 1C replaced the four functions with the certified 1A text (schema-qualified, `SET search_path = pg_catalog, public`) and revoked EXECUTE from `anon` / PUBLIC.

## SECURITY DEFINER remediations

| FUNCTION | PURPOSE | OWNER | BEFORE | EXECUTE | RISK | STAGING_EQUIVALENT | REMEDIATION |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `get_user_tenant_ids()` | tenant membership array | postgres | search_path unpinned | PUBLIC+anon | search_path hijack | 1A pinned | replace + revoke anon |
| `is_tenant_member(uuid)` | membership predicate | postgres | unpinned | PUBLIC+anon | same | 1A | same |
| `has_permission(text,text,uuid)` | role permission check | postgres | unpinned | PUBLIC+anon | same | 1A | same |
| `is_platform_admin()` | platform operator bypass | postgres | `search_path=public` | PUBLIC+anon | same | 1A | same |
| `handle_new_user` and seed/slug helpers | provisioning | postgres | `search_path=public` | unchanged | search_path | 1A pin-only | `ALTER ... SET search_path` if present |

## Migration

File: `supabase/migrations/20261007160000_rtb_sec_rls_1c_production_security_backport.sql`  
Apply: `packages/engineering-review-persistence/scripts/rtb-sec-rls-1c-apply-production.ts`  
Target: `wcydlhqiqdwgoaqrlget` only  
Result: applied (checksum `e1c0380d0bf8ba1d959f1aebca641a39508092a78d1fccb991196e0dc3dba241`)

Impact manifest:

- NO DROP TABLE / TRUNCATE / DELETE FROM
- NO Security Assurance CREATE TABLE
- NO unrelated feature migrations
- NO FORCE RLS / RLS weakening
- NO credential or user-data modification
- Existence RAISE for expected Digital Twin / helper / membership objects
- `EXCEPTION WHEN insufficient_privilege` only for hosted default-privilege revoke (same as 1A)
- No `EXCEPTION WHEN OTHERS`

Backup gate (reconfirmed, no restore executed): physical backups COMPLETED, `walg_enabled` true, PITR false, runbook present.

## Post-migration metadata

| Metric | After 1C |
| --- | ---: |
| Public ordinary tables | 478 (+ classification + exception registers) |
| RLS disabled | 0 |
| Anon grant tables | 0 |
| Unrestricted SELECT TO public | 0 |
| UNRESOLVED classifications | 0 |
| Guard `rtb_sec_rls_public_violations()` | empty |
| Canonical helper search_path | `pg_catalog, public` |
| Security Assurance tables | still absent |
| Ledger | `20261007160000` present; 1 / 1A **not** present (correct) |

## Safe live tests

| Probe | Result |
| --- | --- |
| Anon REST DT adapters / schemas / tenants / profiles / taxonomy | 401 |
| Anon RPC `get_user_tenant_ids` | 401 |
| service_role SELECT adapters | 200 |
| Password-grant authenticated JWT | NOT_RUN_SAFETY_CONSTRAINT (no approved production cert user in `apps/web/.env.local`) |
| Cross-tenant / cross-workspace | NOT_RUN_SAFETY_CONSTRAINT |
| `https://eos-pilot.rtbea.com.au/api/health` | 200 |
| `https://eos-pilot.rtbea.com.au/api/deployment/status` | 200 |

## Remaining limitations

1. Security Advisor UI was not collected (`SECURITY_ADVISOR_UI_RECHECK_REQUIRED = YES`).
2. Authenticated user-JWT and live cross-tenant tests were not run against production customer accounts.
3. Production remains behind many non-security repository migrations after `20260901013000`. Do not bulk-push them to “match staging.”
4. Direct apply of staging `20261007120000` remains unsafe until/unless Security Assurance tables exist; 1C is the production path.
5. Pre-existing `@rtb/engineering-review-persistence` typecheck `rootDir` and `boundary.test.ts` failures are unchanged.

PRODUCTION_SECURITY_CERTIFICATION = CERTIFIED  
RLS_SECURITY_INCIDENT_CLOSED = YES
