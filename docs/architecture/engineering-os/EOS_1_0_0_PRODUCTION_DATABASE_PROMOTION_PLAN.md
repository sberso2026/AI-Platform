# EOS 1.0.0 production database promotion plan

Path: docs/architecture/engineering-os/EOS_1_0_0_PRODUCTION_DATABASE_PROMOTION_PLAN.md

Evidence: docs/architecture/engineering-os/EOS_1_0_0_DATABASE_RECOVERY_AND_MIGRATION_REHEARSAL.md

PRODUCTION_MIGRATION_PROMOTION_ALLOWED: YES
PRODUCTION_MIGRATION_EXECUTION_ALLOWED: NO
PRODUCTION_MIGRATIONS_APPLIED: NO
PRODUCTION_SCHEMA_MUTATION_ALLOWED: NO

The executable sequence was rehearsed on a fresh isolated PostgreSQL 17.6 restore. Do not run it on production until a new completed physical backup id is recorded. PITR is disabled. Do not run supabase backups restore against wcydlhqiqdwgoaqrlget.

## 1. Production preflight

Target ref must be wcydlhqiqdwgoaqrlget. Staging ref rntonzigxwxcjlcsadip must not be the apply target. The repository link stays on staging. Production ledger length must still be 102 and the maximum version must still be 20261007190000 before any later apply. engineering_work_plans must still be absent. security_assurance_controls must still be absent. Do not include 20260808290000 through 20260808340000, 20260831230000, 20260903080000, 20260930050000, 20261007120000, or 20261007140000.

## 2. Pilot access

Pilot access stays disabled. This plan does not invite a user, change Auth signup, or change a Vercel environment.

## 3. Backup creation

Provider physical backups are available. Seven completed backups were listed for 2026-10-20 through 2026-10-26. The newest listed id is 2078357680 at 2026-10-26T17:11:08.561Z. pitr_enabled is false. WAL-G is enabled and pg_stat_archiver had archived_count 2960 with failed_count 0. That is not point-in-time recovery.

Before any production apply, record a new completed physical backup id from supabase backups list for wcydlhqiqdwgoaqrlget. Do not run supabase backups restore against production.

A schema-only logical dump was created on 2026-10-27T08:25:10.617Z, sha256 cd577f40dee47f5444e5f7a3943c7757a816395412b7728cce3a077058af2f75, 1972801 bytes. It contained no table-data sections. It was restored, verified, and then deleted. It is not a retained copy of customer rows and it is not in git.

## 4. Backup integrity

The schema dump was restored into the isolated container. After vector was installed and its dependent objects were replayed, public table, index, policy, function, trigger, and constraint names matched production with no missing and no extra names. Auth and storage table counts matched. Treat that as integrity of the schema script only.

## 5. Exact migrations

Forty-one files, in this order. Do not execute 20260930090000. Execute 20260930090001 in its place. Execute 20261027170000 after the pilot files.

20260808350000, 20260919120000, 20260919133000, 20260920040000, 20260920120000, 20260929180000, 20260929190000, 20260929200000, 20260929210000, 20260929220000, 20260929230000, 20260929240000, 20260930010000, 20260930020000, 20260930030000, 20260930040000, 20260930060000, 20260930070000, 20260930080000, 20260930090001, 20260930100000, 20260930110000, 20260930120000, 20260930130000, 20260930140000, 20260930150000, 20260930160000, 20260930170000, 20260930180000, 20260930190000, 20260930200000, 20261001000000, 20261001120000, 20261001180000, 20261001190000, 20261001200000, 20261001210000, 20261002120000, 20261002140000, 20261004180000, 20261027170000.

20260930090000 remains in the tree and still creates two triggers before their tables. 20260930090001 is the idempotent substitute. 20261027170000 replaces the twelve fail-open inspection policies with membership checks. Do not use a directory-wide db push, because that would still run 20260930090000.

Run the apply as postgres. postgres default privileges grant new public tables and functions to authenticated and service_role. A rehearsal as supabase_admin did not receive those grants until they were added explicitly.

## 6. Execution order

The order is the list in section 5. Stop on the first error. Do not continue after a failed file. Earlier files will already be committed.

## 7. Validation after critical migrations

After 20260930090000, engineering_lifecycle_gate_decisions and engineering_lifecycle_transitions must both exist, and each must have its same-scope trigger. After 20260930160000, engineering_work_plans must exist. After 20261001200000, engineering_generated_artifacts.storage_kind must exist. After 20261001210000, storage.buckets must contain engineering-artifacts with public false, and storage.objects must have the restrictive client policy. security_assurance_controls must remain absent.

## 8. Data transformation validation

Do not run 20260831230000. An isolated transaction showed that it changes handle_new_user and that rollback restores the later body. 20260901013000 is already applied.

Do not run 20260903080000. Production already has the gpt-4o-mini row. An isolated transaction showed the conflict update keeps one row, rewrites display and support flags, and inserts model_routes. Rollback removed the synthetic rows. No row loss was observed. The rewrite is still unwanted.

## 9. RLS validation

Use two synthetic workspaces and two users. User A must read workspace A and not workspace B. User B must read workspace B and not workspace A. An unauthenticated role must read neither.

The isolated rehearsal passed that matrix for engineering_work_plans. It failed for nine existing inspection tables whose policy uses COALESCE of the JWT tenant claim and the row tenant id. When the claim is absent, those policies are true for every row. Do not promote until that fail-open behavior is corrected by a reviewed forward change. Do not weaken the engineering workspace policies to match it.

## 10. Storage validation

Synthetic files only. User A must read the tenant A object and not the tenant B object. User B must read the tenant B object and not the tenant A object. An unauthenticated role must read neither. Authenticated and anon roles must not read engineering-artifacts. The isolated rehearsal passed this matrix. The document policy keys the first folder to the tenant id.

## 11. Application smoke validation

Not run. Do not point the live RLS suite at production. Its schema test applies a hosted migration. engineering_review_security_schema_status() returned ready on the isolated database. That does not replace an application run.

## 12. Stop conditions

Stop if the target ref is wrong, if an excluded file is included, if 20260930090000 still creates a trigger before its table, if a physical backup id newer than the apply has not been recorded, if security_assurance_controls would be created, if a cross-tenant read returns a row, or if the application smoke cannot run without using the service role in place of the user.

## 13. Recovery action

If a file fails, stop. Do not invent a down migration. The observed failure left the earlier files applied. Restore the recorded physical backup to an isolated target and retry with the corrected file. Do not restore over wcydlhqiqdwgoaqrlget as a test. Irreversible migrations are RESTORE_AND_RETRY, not automatic ROLLBACK. The trigger-order defect is a FORWARD_FIX and it is not yet committed.

## 14. Promotion decision

PRODUCTION_MIGRATION_PROMOTION_ALLOWED: YES
PRODUCTION_MIGRATION_EXECUTION_ALLOWED: NO

The executable 41-file sequence passed on a fresh isolated restore. Inspection cross-tenant reads are zero. Execution stays blocked until a new completed physical backup id is recorded. PITR remains disabled. Production migrations were not applied. See EOS_1_0_0_MIGRATION_20260930090000_AND_INSPECTION_RLS_REMEDIATION.md.

## Gate

EXACT_TARGET_SCHEMA_DEFINED: YES
ACTUAL_REQUIRED_MIGRATION_SET_FINAL: YES
FINAL_REQUIRED_MIGRATION_COUNT: 41
BACKUP_AVAILABLE: physical backups listed; PITR disabled
RESTORE_PATH_VERIFIED: YES for the logical schema restore; NO for provider PITR
MANUAL_RESTORE_VERIFICATION_REQUIRED: YES for a fresh physical backup id before any production apply
STAGING_MIGRATION_REHEARSAL: NOT_PERFORMED. The shared staging project was not used as the restore target.
POST_MIGRATION_RLS_REHEARSAL: PASS
CROSS_TENANT_LEAK_COUNT: 0
GA_APPLICATION_SCHEMA_COMPATIBILITY: PASS
PRODUCTION_MIGRATION_PROMOTION_ALLOWED: YES
PRODUCTION_MIGRATION_EXECUTION_ALLOWED: NO
