# EOS 1.0.0 production data recovery readiness

Path: docs/architecture/engineering-os/EOS_1_0_0_PRODUCTION_DATA_RECOVERY_READINESS.md

Inventory: docs/architecture/engineering-os/EOS_1_0_0_PRODUCTION_DATA_RECOVERY_INVENTORY.md

Production project wcydlhqiqdwgoaqrlget was not migrated and its schema and application data were not modified. The repository link remains staging project rntonzigxwxcjlcsadip. Staging was not reset or deleted.

PRODUCTION_SCHEMA_MUTATED: NO
PRODUCTION_DATA_MUTATED: NO
PRODUCTION_MIGRATIONS_APPLIED: NO

After the backup read, the production ledger was still 102 versions, maximum 20261007190000, and 20260930090000 was still absent. Database size was still 174861459 bytes. engineering_work_plans and security_assurance_controls were still absent.

## Provider route

PROVIDER_BACKUP_AVAILABLE: YES
PROVIDER_BACKUP_COUNT: 7
LATEST_PROVIDER_BACKUP_IDENTIFIABLE: YES
LATEST_PROVIDER_BACKUP_ID: 2078357680
LATEST_PROVIDER_BACKUP_TIMESTAMP: 2026-10-26T17:11:08.561Z
BACKUP_RETENTION: seven completed daily backups observed from 2026-10-20 through 2026-10-26. No separate retention count was returned.
PITR_AVAILABLE: NO
WAL_ARCHIVE_STATUS: WAL-G enabled, archiver active, failed_count 0

supabase backups restore accepts only a project ref and a timestamp. It restores that same project. It is a backups_write operation. It cannot target an isolated project. PITR is disabled. The command was not run.

PROVIDER_RESTORE_REHEARSAL_PERFORMED: NO
PROVIDER_RESTORE_TARGET: NONE
PROVIDER_RESTORE_RESULT: NOT_AVAILABLE
PROVIDER_RESTORE_PATH_VERIFIED: NO

## Logical route

A PostgreSQL 17.6 pg_dump of public, auth, storage, and supabase_migrations was taken through the linked production project. The schema file is plain SQL, 1973272 bytes, sha256 de465dea7adc4ddb8424117b9dd4d0cdcbf08f2210d6a274d5ecdd84bc564012, with 514 CREATE TABLE statements and no COPY data. The data file is COPY format, 124935482 bytes, sha256 72aa9e0396fbb75d6e08eedc931bdc057406e626a327fcefc52cbd304b35a395, with 512 COPY statements.

The dump tool omitted auth.schema_migrations (82 rows) and storage.migrations (73 rows). Those are provider version tables, not application rows. Their rows were exported separately into the same protected directory and loaded after the main restore. supabase_migrations.schema_migrations was present in the COPY dump. Its count is 102.

The files were written outside the repository in a directory whose inherited access was removed and granted only to the current user and SYSTEM. No connection string was written into the dump logs. The files were not committed. They were deleted after the restore matched.

DATA_BEARING_LOGICAL_BACKUP_CREATED: YES
DATA_BEARING_BACKUP_FORMAT: PostgreSQL 17.6 plain schema SQL plus COPY data
DATA_BEARING_BACKUP_PROTECTED: YES
DATA_BEARING_BACKUP_INTEGRITY_VERIFIED: YES

## Isolated restore

A new container, eos-data-restore, used image public.ecr.aws/supabase/postgres:17.6.1.141 and listened only on 127.0.0.1:55434. It was not the production project and not the staging project. The vector extension was created in public before the schema load, matching production. Schema load and data load completed with zero errors. The two omitted provider version tables were then loaded.

DATA_RESTORE_TARGET_ISOLATED: YES
DATA_RESTORE_TARGET_PRODUCTION: NO
DATA_RESTORE_REHEARSAL_PERFORMED: YES
DATA_RESTORE_REHEARSAL_RESULT: PASS

## Completeness

Production and the restore both returned:

Row-count manifest ca91f08c23d32c95c866837f19f3cf27 across 513 tables and 154663 rows.
Table-content manifest e64cfd56f3469e8c03b181aeaa43fdb0.
Public tables 478, indexes 1249, constraints 3520, validated foreign keys 1652, invalid foreign keys 0, policies 1120, functions 168, triggers 141, views 0.
Storage policies 4, storage buckets 2, storage object metadata rows 35, engineering-artifacts bucket absent.
Auth users 1589.
Discipline rows 1066, null tenant rows 13, discipline primary-key count 1066.
Sequence manifest 72013e64666cac2015d5faf0a3dd04f2 for 1 sequence.
Normalized grant manifest 9e380f5044ed7f2d7159516202db142a for 514 relations. Unordered ACL text differed for 22 auth relations, and the checked sample was the same grant set in a different array order.

AFFECTED_TABLE_COUNT_MATCH: YES
AFFECTED_ROW_COUNT_MATCH: YES
REFERENTIAL_INTEGRITY_MATCH: YES
DATA_COMPLETENESS_VERIFIED: YES
AUTH_DATA_RECOVERY_COVERED: YES
STORAGE_METADATA_RECOVERY_COVERED: YES

The content manifest is a hash of per-table row hashes. The underlying rows were not written to this document.

## Recovery procedure

Create the fresh backup immediately before migration. Record its sha256 and timestamp. Start the migration only when that timestamp is earlier than the migration start and the hash has been recorded.

Stop on migration SQL failure, unexpected row-count change, data-transformation validation failure, RLS failure, cross-tenant access, or application compatibility failure.

For each stop: stop the apply, assess which files have committed, recover with LOGICAL_RESTORE of that fresh backup, validate the restored count and content manifests, and abort. Do not resume the partially migrated production database. Do not claim an automatic rollback. A FORWARD_FIX does not undo a committed discipline insert or bucket upsert.

PROVIDER_RESTORE remains unavailable as a rehearsed isolated path. Do not run it against production to practice recovery.

## Decision

DATA_BEARING_BACKUP_AVAILABLE: YES
AFFECTED_DATA_COVERAGE_COMPLETE: YES
BACKUP_INTEGRITY_VERIFIED: YES
ISOLATED_DATA_RESTORE: PASS
RECOVERY_PROCEDURE_DEFINED: YES
FRESH_PRE_MIGRATION_BACKUP_REQUIRED: YES
TEMPORARY_REHEARSAL_DATA_CLEANED: YES

PRODUCTION_DATA_RECOVERY_READY: YES
PRODUCTION_MIGRATION_PROMOTION_ALLOWED: YES
PRODUCTION_MIGRATION_EXECUTION_ALLOWED: YES

This document does not apply the 41 migrations. The next phase is EOS-1.0.0-PRODUCTION-MIGRATION-CONTROLLED-EXECUTION. It must take its own fresh backup first.
