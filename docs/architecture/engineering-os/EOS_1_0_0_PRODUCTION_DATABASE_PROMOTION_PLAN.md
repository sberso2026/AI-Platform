# EOS 1.0.0 production database promotion plan

Path: docs/architecture/engineering-os/EOS_1_0_0_PRODUCTION_DATABASE_PROMOTION_PLAN.md

Evidence: docs/architecture/engineering-os/EOS_1_0_0_DATABASE_RECOVERY_AND_MIGRATION_REHEARSAL.md

Recovery: docs/architecture/engineering-os/EOS_1_0_0_PRODUCTION_DATA_RECOVERY_READINESS.md

PRODUCTION_MIGRATION_PROMOTION_ALLOWED: YES
PRODUCTION_MIGRATION_EXECUTION_ALLOWED: YES
PRODUCTION_DATA_RECOVERY_READY: YES
PRODUCTION_MIGRATIONS_APPLIED: NO
PRODUCTION_SCHEMA_MUTATION_ALLOWED: NO
FRESH_PRE_MIGRATION_BACKUP_REQUIRED: YES

The executable sequence was rehearsed on a fresh isolated PostgreSQL 17.6 restore. A data-bearing logical backup was restored to a separate isolated database and matched production. This plan does not apply that sequence. The later execution phase must create a new backup after this rehearsal backup has been deleted, and that new backup timestamp must be earlier than the migration start. PITR is disabled. Do not run supabase backups restore against wcydlhqiqdwgoaqrlget as a test.

## 1. Production preflight

Target ref must be wcydlhqiqdwgoaqrlget. Staging ref rntonzigxwxcjlcsadip must not be the apply target. The repository link stays on staging. Production ledger length must still be 102 and the maximum version must still be 20261007190000 before any later apply. engineering_work_plans must still be absent. security_assurance_controls must still be absent. Do not include 20260808290000 through 20260808340000, 20260831230000, 20260903080000, 20260930050000, 20261007120000, or 20261007140000.

## 2. Pilot access

Pilot access stays disabled. This plan does not invite a user, change Auth signup, or change a Vercel environment.

## 3. Backup creation

Provider physical backups remain available. Seven completed backups were listed again for 2026-10-20 through 2026-10-26. The newest listed id is 2078357680 at 2026-10-26T17:11:08.561Z. pitr_enabled is false. WAL-G is enabled. pg_stat_archiver had archived_count 2970 and failed_count 0 at the readiness read. The provider restore command is a point-in-time restore of the same project. It has no isolated target. It was not run.

The rehearsed recovery route is a PostgreSQL 17.6 logical dump of public, auth, storage, and supabase_migrations. The schema file had no COPY data. The data file used COPY. Two provider version tables omitted by the dump tool, auth.schema_migrations and storage.migrations, were exported separately and included in the restore. The files were stored outside the repository, restricted to the current user, integrity-hashed, restored, and then deleted. They are not the backup that execution may use.

FRESH_PRE_MIGRATION_BACKUP_REQUIRED: YES. Immediately before production migration, create a new data-bearing logical backup of the same schemas, record its sha256 and timestamp, and require that timestamp to be earlier than the migration start. Do not reuse the deleted rehearsal files.

## 4. Backup integrity

The isolated restore matched production on 513 tables, 154663 rows, the row-count manifest, and the table-content manifest. Public tables 478, indexes 1249, constraints 3520, validated foreign keys 1652, invalid foreign keys 0, policies 1120, functions 168, triggers 141. Storage policies 4. Auth users, storage bucket rows, and storage object metadata counts matched. Sequence state matched. Normalized table grants matched. Production database size and migration ledger were unchanged after the read.

## 5. Exact migrations

Forty-one files, in this order. Do not execute 20260930090000. Execute 20260930090001 in its place. Execute 20261027170000 after the pilot files.

20260808350000, 20260919120000, 20260919133000, 20260920040000, 20260920120000, 20260929180000, 20260929190000, 20260929200000, 20260929210000, 20260929220000, 20260929230000, 20260929240000, 20260930010000, 20260930020000, 20260930030000, 20260930040000, 20260930060000, 20260930070000, 20260930080000, 20260930090001, 20260930100000, 20260930110000, 20260930120000, 20260930130000, 20260930140000, 20260930150000, 20260930160000, 20260930170000, 20260930180000, 20260930190000, 20260930200000, 20261001000000, 20261001120000, 20261001180000, 20261001190000, 20261001200000, 20261001210000, 20261002120000, 20261002140000, 20261004180000, 20261027170000.

20260930090000 remains in the tree and still creates two triggers before their tables. 20260930090001 is the idempotent substitute. 20261027170000 replaces the twelve fail-open inspection policies with membership checks. Do not use a directory-wide db push, because that would still run 20260930090000.

Run the apply as postgres. postgres default privileges grant new public tables and functions to authenticated and service_role. A rehearsal as supabase_admin did not receive those grants until they were added explicitly.

## 6. Execution order

The order is the list in section 5. Stop on the first error. Do not continue after a failed file. Earlier files will already be committed.

## 7. Validation after critical migrations

After 20260930090001, engineering_lifecycle_gate_decisions and engineering_lifecycle_transitions must both exist, and each must have its same-scope trigger. Do not execute 20260930090000. After 20260930160000, engineering_work_plans must exist. After 20261001200000, engineering_generated_artifacts.storage_kind must exist. After 20261001210000, storage.buckets must contain engineering-artifacts with public false, and storage.objects must have the restrictive client policy. security_assurance_controls must remain absent.

## 8. Data transformation validation

Do not run 20260831230000. An isolated transaction showed that it changes handle_new_user and that rollback restores the later body. 20260901013000 is already applied.

Do not run 20260903080000. Production already has the gpt-4o-mini row. An isolated transaction showed the conflict update keeps one row, rewrites display and support flags, and inserts model_routes. Rollback removed the synthetic rows. No row loss was observed. The rewrite is still unwanted.

## 9. RLS validation

Use two synthetic workspaces and two users. User A must read workspace A and not workspace B. User B must read workspace B and not workspace A. An unauthenticated role must read neither.

The remediated rehearsal passed that matrix. 20261027170000 replaces the twelve fail-open inspection policies. Cross-tenant leak count on the migrated isolated database was 0. Do not weaken the engineering workspace policies.

## 10. Storage validation

Synthetic files only. User A must read the tenant A object and not the tenant B object. User B must read the tenant B object and not the tenant A object. An unauthenticated role must read neither. Authenticated and anon roles must not read engineering-artifacts. The isolated rehearsal passed this matrix. The document policy keys the first folder to the tenant id.

## 11. Application smoke validation

The remediation phase recorded GA application schema compatibility PASS against the migrated isolated database. Do not point the live RLS suite at production. Its schema test applies a hosted migration.

## 12. Stop conditions

Stop on migration SQL failure, an unexpected row-count change, data-transformation validation failure, RLS failure, any cross-tenant read, or application compatibility failure. Also stop if the target ref is wrong, if an excluded file is included, if 20260930090000 is executed, if the fresh pre-migration backup is missing or its timestamp is not earlier than the migration start, or if security_assurance_controls would be created.

For each stop: stop the apply, assess which files committed, recover from the fresh logical backup, validate the restored counts and content manifest, and abort. Do not resume a partially migrated production database.

## 13. Recovery action

There is no automatic rollback. Files before a failure are already committed. 20260930010000 can insert system discipline rows. 20261001210000 can insert or update one storage.buckets row and replace a storage.objects policy. Neither writes storage object bytes.

Recovery uses LOGICAL_RESTORE of the fresh pre-migration backup into a replacement or restored database. PROVIDER_RESTORE was not rehearsed and must not be used as a test against wcydlhqiqdwgoaqrlget. A reviewed FORWARD_FIX is only for a later migration file. It does not undo committed data changes.

## 14. Promotion decision

PRODUCTION_MIGRATION_PROMOTION_ALLOWED: YES
PRODUCTION_DATA_RECOVERY_READY: YES
PRODUCTION_MIGRATION_EXECUTION_ALLOWED: YES

The executable 41-file sequence passed on a fresh isolated restore. Inspection cross-tenant reads are zero. The data-bearing recovery route passed on a separate isolated restore. Production migrations were not applied. Execution still requires a new backup taken immediately before the apply. See EOS_1_0_0_MIGRATION_20260930090000_AND_INSPECTION_RLS_REMEDIATION.md and EOS_1_0_0_PRODUCTION_DATA_RECOVERY_READINESS.md.

## Gate

EXACT_TARGET_SCHEMA_DEFINED: YES
ACTUAL_REQUIRED_MIGRATION_SET_FINAL: YES
FINAL_REQUIRED_MIGRATION_COUNT: 41
BACKUP_AVAILABLE: physical backups listed; data-bearing logical restore rehearsed; PITR disabled
RESTORE_PATH_VERIFIED: YES for the data-bearing logical restore; NO for provider PITR
FRESH_PRE_MIGRATION_BACKUP_REQUIRED: YES
MANUAL_RESTORE_VERIFICATION_REQUIRED: YES for a new backup taken immediately before any production apply
STAGING_MIGRATION_REHEARSAL: NOT_PERFORMED. The shared staging project was not used as the restore target.
POST_MIGRATION_RLS_REHEARSAL: PASS
CROSS_TENANT_LEAK_COUNT: 0
GA_APPLICATION_SCHEMA_COMPATIBILITY: PASS
PRODUCTION_MIGRATION_PROMOTION_ALLOWED: YES
PRODUCTION_DATA_RECOVERY_READY: YES
PRODUCTION_MIGRATION_EXECUTION_ALLOWED: YES
