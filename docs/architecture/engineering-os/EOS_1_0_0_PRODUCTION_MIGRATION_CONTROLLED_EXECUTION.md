# EOS 1.0.0 production migration controlled execution

Path: docs/architecture/engineering-os/EOS_1_0_0_PRODUCTION_MIGRATION_CONTROLLED_EXECUTION.md

Production project wcydlhqiqdwgoaqrlget received the approved 41-file sequence. Staging project rntonzigxwxcjlcsadip was not the apply target and was not reset. The repository link remains the staging ref. No Vercel deployment was performed. No user was invited. Public signup and Microsoft 365 were not changed.

PILOT_ACCESS_ENABLED: NO
CONTROLLED_PRODUCTION_PILOT_READY: NO
FIRST_PILOT_USER_CAN_BE_INVITED: NO

## Preflight

START_HEAD: fac6e67fbe70a12ced66671a8bed3710002e31f3
WORKTREE_CLEAN_AT_START: YES
PRODUCTION_AND_STAGING_SEPARATE: YES

The production baseline matched the readiness inventory before any migration. PostgreSQL 17.6. Ledger count 102. Maximum version 20261007190000. Version 20260930090000 absent. Excluded versions absent. engineering_work_plans absent. security_assurance_controls absent. engineering_disciplines present. Vector type in public. Public tables 478, indexes 1249, constraints 3520, invalid foreign keys 0, policies 1120, functions 168, triggers 141. Auth users 1589. Storage buckets 2. Storage object metadata rows 35. engineering-artifacts bucket absent. Row-count manifest ca91f08c23d32c95c866837f19f3cf27 across 513 tables and 154663 rows.

PRODUCTION_PRE_MIGRATION_BASELINE_MATCH: YES

The approved sequence was loaded from section 5 of the promotion plan. Count 41. It uses 20260930090001 instead of 20260930090000 and ends with 20261027170000. No excluded file is in the sequence. A directory-wide db push was not used.

APPROVED_MIGRATION_SET_LOADED: YES
APPROVED_MIGRATION_COUNT: 41
APPROVED_MIGRATION_SEQUENCE_MATCHES_REHEARSAL: YES

## Fresh backup

The backup completed before the first migration statement. Schema file 1973272 bytes, sha256 de465dea7adc4ddb8424117b9dd4d0cdcbf08f2210d6a274d5ecdd84bc564012, 514 CREATE TABLE statements, no COPY data. That schema hash matches the schema file restored and verified in the readiness phase. Data file 124935482 bytes, sha256 5fc5fe0abb8006c8c1021a92dffe436342a33287261b24ad84ebf4433ec12da2, 512 COPY statements. The data-file hash differs from the earlier rehearsal file because pg_dump writes a one-time token. The live row-count manifest still matched the verified baseline. Provider version tables auth.schema_migrations (82 rows) and storage.migrations (73 rows) were exported into the same protected directory. The directory is outside the repository, not committed, and restricted to the current user and SYSTEM. The files are retained for the pilot stabilization window.

FRESH_PRE_MIGRATION_BACKUP_CREATED: YES
FRESH_BACKUP_TIMESTAMP: 2026-10-27T09:51:46.742Z
FRESH_BACKUP_FORMAT: PostgreSQL 17.6 plain schema SQL plus COPY data, plus the two provider version tables
FRESH_BACKUP_PROTECTED: YES
FRESH_BACKUP_INTEGRITY_VERIFIED: YES
PRE_MIGRATION_BACKUP_RETAINED: YES

Pre-migration invariants, recorded as hashes only: model registry manifest 93fb1e6b35ca839cc4ecebdb110af4da, handle_new_user definition hash 0bdaa0dd5ba390373fc02baf080d09f7, discipline rows 1066, invalid foreign keys 0.

## Execution

Each file ran as postgres inside one transaction that also inserted its ledger version. The first successful file started at 2026-10-27T09:58:57.707Z, after the backup timestamp. Two earlier launch attempts failed before opening a database connection and did not change the ledger.

20260808350000 2026-10-27T09:58:57.707Z 2026-10-27T09:59:04.793Z PASS
20260919120000 2026-10-27T09:59:04.795Z 2026-10-27T09:59:11.896Z PASS
20260919133000 2026-10-27T09:59:11.899Z 2026-10-27T09:59:18.837Z PASS
20260920040000 2026-10-27T09:59:18.839Z 2026-10-27T09:59:25.835Z PASS
20260920120000 2026-10-27T09:59:25.836Z 2026-10-27T09:59:32.780Z PASS
20260929180000 2026-10-27T09:59:32.781Z 2026-10-27T09:59:41.397Z PASS
20260929190000 2026-10-27T09:59:41.398Z 2026-10-27T09:59:48.512Z PASS
20260929200000 2026-10-27T09:59:48.513Z 2026-10-27T09:59:55.965Z PASS
20260929210000 2026-10-27T09:59:55.967Z 2026-10-27T10:00:04.313Z PASS
20260929220000 2026-10-27T10:00:04.314Z 2026-10-27T10:00:13.179Z PASS
20260929230000 2026-10-27T10:00:13.180Z 2026-10-27T10:00:20.327Z PASS
20260929240000 2026-10-27T10:00:20.328Z 2026-10-27T10:00:28.872Z PASS
20260930010000 2026-10-27T10:00:28.873Z 2026-10-27T10:00:36.979Z PASS
20260930020000 2026-10-27T10:00:36.980Z 2026-10-27T10:00:44.217Z PASS
20260930030000 2026-10-27T10:00:44.220Z 2026-10-27T10:00:51.691Z PASS
20260930040000 2026-10-27T10:00:51.691Z 2026-10-27T10:00:58.491Z PASS
20260930060000 2026-10-27T10:00:58.492Z 2026-10-27T10:01:05.511Z PASS
20260930070000 2026-10-27T10:01:05.512Z 2026-10-27T10:01:12.460Z PASS
20260930080000 2026-10-27T10:01:12.461Z 2026-10-27T10:01:19.545Z PASS
20260930090001 2026-10-27T10:01:19.546Z 2026-10-27T10:01:27.628Z PASS
20260930100000 2026-10-27T10:01:27.629Z 2026-10-27T10:01:34.414Z PASS
20260930110000 2026-10-27T10:01:34.415Z 2026-10-27T10:01:41.504Z PASS
20260930120000 2026-10-27T10:01:41.505Z 2026-10-27T10:01:48.433Z PASS
20260930130000 2026-10-27T10:01:48.434Z 2026-10-27T10:01:55.628Z PASS
20260930140000 2026-10-27T10:01:55.629Z 2026-10-27T10:02:02.533Z PASS
20260930150000 2026-10-27T10:02:02.534Z 2026-10-27T10:02:09.582Z PASS
20260930160000 2026-10-27T10:02:09.583Z 2026-10-27T10:02:16.946Z PASS, work-plan isolation PASS
20260930170000 2026-10-27T10:02:24.053Z 2026-10-27T10:02:31.018Z PASS
20260930180000 2026-10-27T10:02:31.020Z 2026-10-27T10:02:38.181Z PASS
20260930190000 2026-10-27T10:02:38.183Z 2026-10-27T10:02:45.343Z PASS
20260930200000 2026-10-27T10:02:45.344Z 2026-10-27T10:02:52.272Z PASS
20261001000000 2026-10-27T10:02:52.273Z 2026-10-27T10:02:59.261Z PASS
20261001120000 2026-10-27T10:02:59.263Z 2026-10-27T10:03:07.515Z PASS
20261001180000 2026-10-27T10:03:07.517Z 2026-10-27T10:03:16.801Z PASS
20261001190000 2026-10-27T10:03:16.802Z 2026-10-27T10:03:25.618Z PASS
20261001200000 2026-10-27T10:03:25.620Z 2026-10-27T10:03:35.392Z PASS
20261001210000 2026-10-27T10:03:35.394Z 2026-10-27T10:03:47.934Z PASS
20261002120000 2026-10-27T10:04:50.017Z 2026-10-27T10:04:57.313Z PASS
20261002140000 2026-10-27T10:04:57.315Z 2026-10-27T10:05:04.841Z PASS
20261004180000 2026-10-27T10:05:04.842Z 2026-10-27T10:05:12.153Z PASS
20261027170000 2026-10-27T10:05:12.155Z 2026-10-27T10:05:19.299Z PASS

The first storage check used an invalid comparison against get_user_tenant_ids(). That query error was not a policy failure. The corrected check passed, and the remaining four files then ran. The first inspection cross-insert check treated an empty insert as success. The corrected check used workspace identifiers captured before the role change. It passed for select, own insert, own update, own delete, cross insert, cross update, cross delete, the other user, and the anonymous role. Both checks ran as authenticated, not service_role, and rolled back. No synthetic user or storage object remained.

MIGRATION_START_TIMESTAMP: 2026-10-27T09:58:57.707Z
PRODUCTION_MIGRATION_EXECUTION: PASS
PRODUCTION_MIGRATIONS_APPLIED: YES
APPLIED_MIGRATION_COUNT: 41
FAILED_MIGRATION_COUNT: 0
STOP_CONDITION_TRIGGERED: NO
RECOVERY_TRIGGERED: NO
RECOVERY_METHOD: NONE
RECOVERY_RESULT: NOT_REQUIRED
PRE_MIGRATION_STATE_RESTORED: NOT_REQUIRED

## Validation

The two data-transforming files 20260831230000 and 20260903080000 were not in the approved sequence and were not executed. After the 41 files, the model registry manifest and the handle_new_user definition hash were unchanged. Discipline rows moved from 1066 to 1069, which is the three system rows inserted by 20260930010000. Invalid foreign keys remained 0. Storage object metadata remained 35. Auth users remained 1589.

PRODUCTION_DATA_TRANSFORMATION_VALIDATED: YES
PRODUCTION_DATA_TRANSFORMATION_LOSS_DETECTED: NO

Public tables 571, matching the rehearsed target. Decisions and transitions exist. The decisions same-scope trigger count is 1. security_assurance_controls is absent. Fail-open coalesce tenant policies: 0. engineering-artifacts exists and is not public. Storage buckets 3.

PRODUCTION_TARGET_SCHEMA_MATCH: YES
UNEXPECTED_PRODUCTION_SCHEMA_DRIFT_COUNT: 0

Work-plan isolation passed for user A and user B, and anonymous access was denied. Inspection isolation passed for select, insert, update, and delete, including the opposite user and the anonymous role. Storage isolation passed for the tenant-documents folder and denied engineering-artifacts to the authenticated user. Anonymous storage access was denied. Synthetic rows were rolled back.

PRODUCTION_RLS_VALIDATION: PASS
CROSS_WORKSPACE_DATA_LEAK_COUNT: 0
PRODUCTION_STORAGE_ISOLATION: PASS
PRODUCTION_AFFECTED_DATA_INTEGRITY: PASS
REFERENTIAL_INTEGRITY: PASS

engineering_review_security_schema_status() returned core_workspace_member, projects_policy_workspace, documents_policy_workspace, and review_tables_ready true. engineering_documents, engineering_projects, engineering_decisions, engineering_work_plans, engineering_pre_issue_reviews, engineering_generated_artifacts, audit_events, inspection_assignments, knowledge_nodes, and model_registry are present. This is database compatibility, not a deployed application smoke test.

PRODUCTION_GA_DATABASE_COMPATIBILITY: PASS

Ledger count 143. All 41 approved versions are present. Excluded versions remain absent. Maximum version 20261027170000. No ledger row was inserted except by the successful transaction for that file.

PRODUCTION_MIGRATION_LEDGER_VALID: YES
UNEXPECTED_LEDGER_ENTRY_COUNT: 0
MISSING_APPROVED_MIGRATION_COUNT: 0

## Decision

PRODUCTION_DATABASE_GA_READY: YES

Pilot access is still closed. The next phase is EOS-1.0.0-CONTROLLED-PRODUCTION-PILOT-DEPLOYMENT-EXECUTOR. It must re-evaluate deployment, domain, auth, environment, monitoring, and live smoke blockers. It must not treat this database result as permission to invite a user.
