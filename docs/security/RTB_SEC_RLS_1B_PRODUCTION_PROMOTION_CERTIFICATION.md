# RTB-SEC-RLS-1B Production RLS Security Promotion Certification

Date: 2026-10-07  
Phase: controlled production promotion of certified RTB-SEC-RLS-1 and RTB-SEC-RLS-1A  
Verdict: **FAIL** — production identity verified; certified migrations were **not applied**

START_HEAD: `545d9bb614e2658c1175469d8297f1b95e04c9bc`  
Branch: `cursor/era-7a-engineering-review-pilot-gate`

This phase is not a rewrite of staging authorization. It proves whether the exact certified migrations can be promoted. They cannot, because production schema drift would make `20261007120000` fail closed on missing relations. No production SQL was written.

No secrets, connection strings, or customer row data are recorded here.

## Production identity

| Field | Value |
| --- | --- |
| PRODUCTION_PROJECT_REF | `wcydlhqiqdwgoaqrlget` |
| PRODUCTION_ENVIRONMENT_IDENTITY | Live Supabase project name **Engineering OS**; Vercel `rtb-ai-platform` certified EOS data plane (`docs/deployment/vercel-env-audit.md`); `apps/web/.env.local` `NEXT_PUBLIC_SUPABASE_URL` host matches this ref |
| STAGING_PROJECT_REF | `rntonzigxwxcjlcsadip` (RTB AI Platform Staging; repo-linked) |
| Distinct from staging | YES (`wcydlhqiqdwgoaqrlget` ≠ `rntonzigxwxcjlcsadip`) |
| Inspection Intelligence | not used (`hlqwihvksjgkshipoacd`) |
| RTB-Intranet-Production | not used (`vspyrlgvkpcsprzvrorb`) |
| RTB AI Platform Production project | **does not exist** in the live org project list |

`packages/customer-administration-certification` keeps `HOSTED_PRODUCTION_PROJECT_REFS = []`. That flag blocks customer-admin destructive certification; it does not name a second database. Repository deployment configuration for the shipped AI Platform web app (`rtb-ai-platform` / EOS pilot) is Engineering OS.

PRODUCTION_IDENTITY_VERIFIED = YES

## Certified migrations (unchanged)

| File | SHA-256 |
| --- | --- |
| `supabase/migrations/20261007120000_rtb_sec_rls_1_public_schema_remediation.sql` | `92a5fb257305c22a29d7b021e312b51f3762297bbf5908531c822081afa72d69` |
| `supabase/migrations/20261007140000_rtb_sec_rls_1a_least_privilege_closeout.sql` | `9e63a0ae1b1a70dc58affda9f9be6b71e4f9a6d403652fd3ec62e58240d99965` |

No genuine defect was found in the staging-certified SQL. Missing production objects are environment drift, not a reason to patch those files. CERTIFIED_MIGRATIONS_UNCHANGED = YES

## Pre-flight inventory (read-only)

Queried via temporary-workdir `supabase link --project-ref wcydlhqiqdwgoaqrlget` and `supabase db query --linked`. Repo staging link was not used for writes. Current database `postgres`, role `postgres`.

| Metric | Production (pre-migration) | Certified staging (post-1A) |
| --- | ---: | ---: |
| Public ordinary tables | 476 | 668 |
| RLS enabled | 473 | 668 |
| RLS disabled | 3 | 0 |
| FORCE RLS | 0 | 64 (unchanged in 1/1A) |
| Tables with anon grants | 476 | 0 |
| Anon grant rows | 3332 | 0 |
| Security migration versions | none | `20261007120000`, `20261007140000` |
| Migration ledger head | `20260901013000` | includes October 2026 RLS files |

RLS-disabled public tables on production:

1. `digital_twin_source_adapters`
2. `digital_twin_state_schemas`
3. `digital_twin_source_authority_policies`

Required objects:

| Object | Present |
| --- | --- |
| Digital Twin catalog tables (3) | YES |
| `asset_intelligence_failure_taxonomy` | YES |
| `tenant_memberships` / `roles` and required columns | YES |
| Roles `anon`, `authenticated`, `service_role`, `postgres` | YES |
| `get_user_tenant_ids`, `is_tenant_member`, `has_permission`, `is_platform_admin`, `handle_new_user` | YES |
| `security_assurance_compliance_frameworks` | NO |
| `security_assurance_compliance_framework_versions` | NO |
| `security_assurance_compliance_requirements` | NO |
| `security_assurance_compliance_control_mappings` | NO |
| `security_assurance_customer_claims` | NO |
| `rtb_public_table_security_classification` | NO |
| `rtb_anon_table_grant_exceptions` | NO |

Simulated RLS-1 classification of current production public tables: **0 UNRESOLVED**. Drift is missing objects and a shorter catalog, not extra unscoped tables.

Canonical helpers on production today:

- `get_user_tenant_ids` / `is_tenant_member` / `has_permission`: SECURITY DEFINER, search_path **unpinned**, unqualified `tenant_memberships` (same semantics as staging before 1A)
- `is_platform_admin`: SECURITY DEFINER, `search_path=public` only
- Bodies match the 1A replacements except schema qualification and search_path pinning

Taxonomy already has `TO public` SELECT/INSERT/UPDATE policies (`qual=true` on SELECT/UPDATE). 1A would drop and recreate those if 1 had succeeded.

PRODUCTION_PUBLIC_TABLES = 476  
PRE_MIGRATION_RLS_DISABLED = 3  
PRE_MIGRATION_ANON_GRANTS = 476  
PRODUCTION_MIGRATION_HEAD = `20260901013000`  
SCHEMA_DRIFT_DETECTED = YES

## Migration compatibility

The exact certified files cannot apply in order.

`20261007120000` issues `ALTER TABLE public.<name> ENABLE ROW LEVEL SECURITY` and `COMMENT ON TABLE` for five `security_assurance_*` relations that do not exist on Engineering OS. PostgreSQL would stop with `42703`/`42P01` (undefined table). Later statements, including the classification register and Digital Twin ENABLE RLS, would not complete as a unit.

Those five tables were created in repository migrations `20260808330000` / `20260808340000`. Production ledger includes `20260808160000` (Digital Twin catalogs) and heads at `20260901013000`, but does **not** include the security-assurance batch versions. Staging received them; production did not.

`20261007140000` depends on the classification table created by the first file, then revokes anon on all public tables and replaces helpers. It cannot be applied first. Applying it alone is out of order.

No production-only conflicting policies require weakening 1/1A. Digital Twin tables have **zero** policies today (RLS off). Taxonomy policies are the same names 1A already drops.

| Gate | Result |
| --- | --- |
| Required Digital Twin / membership objects | YES |
| Required security_assurance tables | NO |
| Migration order 1 then 1A | would be correct **if** 1 could run |
| Destructive operation in certified SQL | NO (`DROP TABLE` / `TRUNCATE` / `DELETE FROM` absent) |
| SCHEMA_COMPATIBLE | **NO** |
| PRODUCTION_PROMOTION_BLOCKED | **YES** |

Certified migrations were not modified to force compatibility.

## Blast radius (would-be apply)

Anonymous PostgREST table access is not a production application path:

- Browser/server clients use the anon **key** for GoTrue (`signInWithPassword`, `signUp`) and authenticated JWTs thereafter
- Tenant bootstrap is `handle_new_user()` SECURITY DEFINER
- Webhooks, Edge-adjacent jobs, and Engineering OS/Digital Twin/Security Assurance application reads use authenticated or `service_role` backends
- Certification `anonClient` callers assert deny/empty, they do not require table grants

Revoking anon table privileges would match staging 1A and would not remove GoTrue. That blast radius would be acceptable **if** the migrations could apply. It is not a reason to weaken them.

No legitimate production-only anonymous table behavior was found that staging missed.

BLAST_RADIUS_ACCEPTABLE = YES (conditional on a compatible apply, which did not occur)

## Backup / recovery gate

`supabase backups list --project-ref wcydlhqiqdwgoaqrlget` (no restore executed):

- Physical backups present, status COMPLETED (daily; newest 2026-10-06)
- `walg_enabled`: true
- `pitr_enabled`: false
- CLI restore path exists: `supabase backups restore` (PITR subcommand; PITR not enabled on this project)
- Approved procedure: `docs/security/RTB_PLATFORM_BACKUP_RESTORE_RUNBOOK.md` and `docs/engineering-review/security/backup-recovery.md`

PRODUCTION_BACKUP_AVAILABLE = YES  
RECOVERY_PATH_VERIFIED = YES  
BACKUP_RECOVERY_GATE = PASS

Restore was not executed. PITR is not enabled; physical provider backups are the verified recovery path.

## Pre-promotion gate

| Condition | Value |
| --- | --- |
| PRODUCTION_IDENTITY_VERIFIED | YES |
| SCHEMA_COMPATIBLE | NO |
| MIGRATION_ORDER_VERIFIED | YES (order is defined; apply blocked) |
| DESTRUCTIVE_OPERATION | NO |
| BLAST_RADIUS_ACCEPTABLE | YES |
| PRODUCTION_BACKUP_AVAILABLE | YES |
| RECOVERY_PATH_VERIFIED | YES |
| CERTIFIED_MIGRATIONS_UNCHANGED | YES |

Write was refused because SCHEMA_COMPATIBLE = NO.

## Migration application evidence

MIGRATION_1_APPLIED = NO  
MIGRATION_1A_APPLIED = NO  
MIGRATION_LEDGER_CORRECT = NO (security versions absent; expected until a compatible apply)

No rollback was required because no write occurred.

## Post-migration metadata

Not applicable. Production remains at the pre-flight state:

- POST_MIGRATION_RLS_DISABLED = 3 (unchanged)
- POST_MIGRATION_ANON_GRANTS = 476 (unchanged)
- UNJUSTIFIED_ANON_GRANTS = 476 (still GRANT ALL on every public ordinary table, including the three RLS-disabled Digital Twin catalogs)
- UNJUSTIFIED_PUBLIC_CATALOG_ACCESS = still present on taxonomy `TO public` / `qual=true` policies
- CANONICAL_AUTH_HELPER_SEARCH_PATH_SAFE = NO (unpinned / `search_path=public`)
- UNSAFE_SECURITY_DEFINER_FUNCTIONS = canonical helpers not 1A-hardened
- CLIENT_SERVICE_ROLE_EXPOSURE = 0 (static scan; no `NEXT_PUBLIC` service_role bind)

## Authorization / smoke tests

Safe production cross-tenant live tests were **not** run (no customer records manufactured; apply did not occur).

| Test | Result |
| --- | --- |
| ANON_PRODUCTION_TEST | NOT_RUN_PROMOTION_BLOCKED |
| AUTHENTICATED_PRODUCTION_TEST | NOT_RUN_PROMOTION_BLOCKED |
| PRODUCTION_CROSS_TENANT_LIVE_TEST | NOT_RUN_SAFETY_CONSTRAINT |
| PRODUCTION_WORKSPACE_ISOLATION_TEST | NOT_RUN_SAFETY_CONSTRAINT |
| BACKEND_COMPATIBILITY_TEST | NOT_RUN_PROMOTION_BLOCKED |
| APPLICATION_SMOKE_TEST | NOT_RUN_PROMOTION_BLOCKED |

Staging certification (RLS-1 / 1A) remains the live authorization evidence. It does not certify Engineering OS.

## Security Advisor

Programmatic Advisor UI results were not collected.

SECURITY_ADVISOR_EQUIVALENT_CHECK = metadata inventory only (pre-flight)  
SECURITY_ADVISOR_UI_RECHECK_REQUIRED = YES

## Remaining limitations / next phase

1. Exact certified `20261007120000` cannot run on Engineering OS until the five `security_assurance_*` tables exist **or** a later additive migration uses `to_regclass` existence guards. This phase must not rewrite the certified files.
2. Production is also behind many non-RLS repository migrations after `20260901013000`. Those are out of scope and must not be bulk-pushed as part of RLS promotion.
3. Active production authorization defects remain: RLS disabled on three Digital Twin catalogs; anon GRANT ALL on 476 public tables; unpinned canonical helpers.
4. Do not apply 1A without 1. Do not apply a modified fragment of 1.
5. Inspection Intelligence and RTB-Intranet-Production stay out of scope.

NEXT_RECOMMENDED_PHASE: **RTB-SEC-RLS-1C** — production-compatible promotion of the same controls (existence-guarded additive SQL or prior apply of the missing security-assurance schema), then re-run this gate. Do not weaken RLS or invent a new authorization architecture.

PRODUCTION_SECURITY_CERTIFICATION = NOT_CERTIFIED  
RLS_SECURITY_INCIDENT_CLOSED = NO
