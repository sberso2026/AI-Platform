# EOS 1.0.0 database recovery and migration rehearsal

Path: docs/architecture/engineering-os/EOS_1_0_0_DATABASE_RECOVERY_AND_MIGRATION_REHEARSAL.md

Phase: EOS-1.0.0-PRODUCTION-DATABASE-RECOVERY-REHEARSAL-AND-MIGRATION-FINALIZATION

Production project wcydlhqiqdwgoaqrlget was not migrated, reset, or repaired. Staging project rntonzigxwxcjlcsadip was not reset or deleted. The repository link remains the staging ref.

PRODUCTION_SCHEMA_MUTATED: NO
PRODUCTION_MIGRATIONS_APPLIED: NO
PRODUCTION_MIGRATION_PROMOTION_ALLOWED: NO

## Recovery capability

Production PostgreSQL server_version is 17.6. The provider image used for the logical dump is public.ecr.aws/supabase/postgres:17.6.1.141.

Installed extensions read from production: pg_stat_statements 1.11, pgcrypto 1.3, plpgsql 1.0, supabase_vault 0.3.1, uuid-ossp 1.1, vector 0.8.2.

supabase backups list for wcydlhqiqdwgoaqrlget returned seven completed physical backups, from 2026-10-20 through 2026-10-26. The newest listed id is 2078357680, inserted_at 2026-10-26T17:11:08.561Z, status COMPLETED, is_physical_backup true. physical_backup_data was an empty object. The list does not state a retention policy beyond those seven rows.

pitr_enabled: false. PITR_AVAILABLE: NO. This was read from the backup API. It was not inferred.

walg_enabled: true. pg_stat_archiver on production reported archived_count 2960, failed_count 0, and last_archived_time present. WAL_ARCHIVE_STATUS: WAL-G enabled and the archiver is succeeding. That is not a tested point-in-time restore.

supabase backups restore is a PITR write against the named project. It was not run. PROVIDER_RESTORE_PATH_VERIFIED: NO.

LOGICAL_BACKUP_CAPABILITY: YES. supabase db dump --schema public,auth,storage produced a schema script. The script contained no COPY sections and no pg_dump data-section markers. INSERT text inside it is function source, not dumped rows.

## Schema backup and logical restore

A schema-only dump was written outside the repository, then deleted after this evidence was recorded. It is not a retained data backup and it was not committed.

BACKUP_TIMESTAMP: 2026-10-27T08:25:10.617Z
BACKUP_FORMAT: SCHEMA_ONLY_SQL
BACKUP_BYTES: 1972801
BACKUP_SHA256: cd577f40dee47f5444e5f7a3943c7757a816395412b7728cce3a077058af2f75
BACKUP_INTEGRITY_VERIFIED: YES, by restore and object-name comparison, not by the hash alone.

The isolated target was a new local container named eos-restore-rehearsal, image public.ecr.aws/supabase/postgres:17.6.1.141, PostgreSQL 17.6. It is not production and it is not the canonical staging project. Docker Desktop was started for this container only.

The first restore missed vector, so project_intelligence_document_embeddings and pi_document_vector_search were absent. CREATE EXTENSION vector was run on the local container, and the statements for that table and function were replayed from the same schema script. After that replay, name sets matched production for public tables (478), indexes (1249), policies (1120), non-extension functions (50), triggers (141), and constraints (3520). Auth tables were 27 on both sides. Storage tables were 8 on both sides. Storage policies were 4 on both sides. Missing and extra counts were 0 in each of those sets.

Migration ledger rows are not in a schema-only dump. Production still has 102 ledger versions, maximum 20261007190000. That count was re-read after the rehearsal.

PRE_MIGRATION_LOGICAL_BACKUP_CREATED: YES
MANUAL_BACKUP_ACTION_REQUIRED: YES

Minimum manual action before any later production apply: record a new completed physical backup id from supabase backups list for wcydlhqiqdwgoaqrlget. Do not run supabase backups restore against that project. PITR is disabled, so the restore command is not a safe test.

## Final migration dispositions

Apparent files absent from the production ledger: 51. Repository SQL files: 151. Production ledger length: 102.

Excluded from the pilot sequence:

- 20260808290000 through 20260808340000. Six Security Assurance files. EXCLUDE_FROM_PILOT.
- 20260831230000. SUPERSEDED by 20260901013000, which is already applied.
- 20260903080000. ALREADY_EFFECTIVE. The production model_registry row for gpt-4o-mini was already present. Count previously observed: 1.
- 20260930050000. EXCLUDE_FROM_PILOT. Index only. Not required to open the pilot.
- 20261007120000. SUPERSEDED. Not in the pilot sequence.
- 20261007140000. SUPERSEDED. Not in the pilot sequence.

DESTRUCTIVE_MIGRATION_INCLUDED_IN_PILOT_PLAN: NO. After rehearsal, security_assurance_controls was still absent.

Final pilot sequence, 40 files, execution order:

1. 20260808350000 APPLY_AS_ORIGINAL
2. 20260919120000 APPLY_AS_ORIGINAL
3. 20260919133000 APPLY_AS_ORIGINAL
4. 20260920040000 APPLY_AS_ORIGINAL
5. 20260920120000 APPLY_AS_ORIGINAL
6. 20260929180000 APPLY_AS_ORIGINAL
7. 20260929190000 APPLY_AS_ORIGINAL
8. 20260929200000 APPLY_AS_ORIGINAL
9. 20260929210000 APPLY_AS_ORIGINAL
10. 20260929220000 APPLY_AS_ORIGINAL
11. 20260929230000 APPLY_AS_ORIGINAL
12. 20260929240000 APPLY_AS_ORIGINAL
13. 20260930010000 APPLY_AS_ORIGINAL
14. 20260930020000 APPLY_AS_ORIGINAL
15. 20260930030000 APPLY_AS_ORIGINAL
16. 20260930040000 APPLY_AS_ORIGINAL
17. 20260930060000 APPLY_AS_ORIGINAL
18. 20260930070000 APPLY_AS_ORIGINAL
19. 20260930080000 APPLY_AS_ORIGINAL
20. 20260930090000 REPLACE_WITH_SAFE_FORWARD_MIGRATION
21. 20260930100000 APPLY_AS_ORIGINAL
22. 20260930110000 APPLY_AS_ORIGINAL
23. 20260930120000 APPLY_AS_ORIGINAL
24. 20260930130000 APPLY_AS_ORIGINAL
25. 20260930140000 APPLY_AS_ORIGINAL
26. 20260930150000 APPLY_AS_ORIGINAL
27. 20260930160000 APPLY_AS_ORIGINAL
28. 20260930170000 APPLY_AS_ORIGINAL
29. 20260930180000 APPLY_AS_ORIGINAL
30. 20260930190000 APPLY_AS_ORIGINAL
31. 20260930200000 APPLY_AS_ORIGINAL
32. 20261001000000 APPLY_AS_ORIGINAL
33. 20261001120000 APPLY_AS_ORIGINAL
34. 20261001180000 APPLY_AS_ORIGINAL
35. 20261001190000 APPLY_AS_ORIGINAL
36. 20261001200000 APPLY_AS_ORIGINAL
37. 20261001210000 APPLY_AS_ORIGINAL
38. 20261002120000 APPLY_AS_ORIGINAL
39. 20261002140000 APPLY_AS_ORIGINAL
40. 20261004180000 APPLY_AS_ORIGINAL

35 of those 40 files enable row security or create a policy. The other five are 20260919133000, 20260920120000, 20260930020000, 20260930040000, and 20261001200000.

ACTUAL_REQUIRED_MIGRATION_SET_FINAL: YES as this disposition list. The repository file for 20260930090000 is not yet the safe replacement.

## Repository file that failed

20260930090000 was applied as stored in the repository. It failed at the trigger statement before engineering_lifecycle_gate_decisions exists. The following trigger statements also precede engineering_lifecycle_transitions. The CREATE TABLE statements for those two tables are later in the same file. No production change was made. The first 19 files in the sequence had already committed on the isolated database. PostgreSQL did not roll them back. Recovery class for this failure: RESTORE_AND_RETRY. There is no automatic down migration.

A temporary copy used only inside the local container moved those two trigger blocks to after their tables. That copy is not in git. With that copy, all 40 steps completed on the isolated database. Elapsed time for the 40 local steps was 7833 milliseconds. That pass does not make the repository file safe to run.

SAFE_FORWARD_REPLACEMENT_COUNT: 1
MIGRATION_REHEARSAL: FAIL for the repository sequence.

## Data transformations

Both transforming files were executed only inside rolled-back transactions on the isolated database. Neither remains applied there. Neither is in the pilot sequence.

20260831230000 replaces handle_new_user. Before the file, the invite marker offset in the function was 312. After the file, the marker was still present at offset 298, so the body changed. Rollback restored offset 312. This is a function replacement, not a row copy. It stays superseded by 20260901013000.

20260903080000 updates model_registry on conflict and inserts model_routes. The schema-only database has no model_providers row, so the file fails its provider foreign key on an empty catalog. A synthetic provider and a synthetic gpt-4o-mini row were inserted inside a transaction. Before: count 1, display synthetic-before. After the file: count 1, display OpenAI GPT-4o mini (chat), and 10 route rows for the two synthetic tenants. Rollback returned model_registry to 0 rows. The conflict path did not delete the row. It did overwrite display_name, status, supports_text, and supports_tools. Cost columns are not in the update list. The file stays excluded because production already has the row and a replay would still rewrite it and insert routes.

DATA_TRANSFORMING_MIGRATION_COUNT: 2
DATA_TRANSFORMATION_VALIDATED: YES
DATA_TRANSFORMATION_LOSS_DETECTED: NO

## Rehearsed schema

The local database, after the reordered step, had 571 public tables and 146 engineering tables. security_assurance_controls was absent. licence_type on engineering_external_tool_profiles was present. storage_kind on engineering_generated_artifacts was present. engineering_work_plans, engineering_generated_artifacts, engineering_pre_issue_reviews, engineering_m365_connections, and engineering_external_tool_profiles were present.

engineering_review_security_schema_status() returned review_tables_ready true, core_workspace_member true, projects_policy_workspace true, and documents_policy_workspace true.

The 40 files were applied as supabase_admin. postgres default privileges grant new public tables to authenticated and service_role. Those grants were missing on the new tables and were applied on the local database to match that default. A later production apply must run as postgres so the defaults attach. This grant correction was not a production change.

TARGET_SCHEMA_MATCH: YES for the isolated result after the trigger reorder. UNEXPECTED_SCHEMA_DRIFT_COUNT: 0 against the production object-name sets before the pilot files, plus the expected new engineering objects above. The repository file does not reach that result.

## RLS rehearsal

Synthetic users, tenants, workspaces, and memberships were inserted on the local database only. Signup trigger on_auth_user_created was disabled for that insert and then enabled again. No production rows were copied.

engineering_work_plans, one row in each workspace:

- User A saw 1 row and 0 rows in workspace B.
- User B saw 1 row and 0 rows in workspace A.
- The anon role received a permission error from get_user_tenant_ids and saw 0 rows.

A broader insert attempted every row-security table that has tenant_id and workspace_id. 398 such tables. 79 accepted a generic synthetic row for workspace B. User A saw workspace B rows in 9 tables. User B saw their own row in those same 9. Anonymous visibility of those rows was 0.

The 9 tables are inspection_assignments, inspection_attestations, inspection_evidence_annotations, inspection_offline_commands, inspection_offline_entitlement_snapshots, inspection_offline_evidence_queue, inspection_reporting_outputs, inspection_workflow_instances, and inspection_workflow_sla_timers.

Their policy shape, read from inspection_assignments, is tenant_id compared with COALESCE of request.jwt.claims tenant_id and the row tenant_id. When the claim is absent, the comparison is true for every row. These policies were already in the restored production schema. They were not added by the 40 pilot files. The rehearsal JWT set the subject claim and did not set request.jwt.claims tenant_id.

POST_MIGRATION_RLS_REHEARSAL: FAIL
CROSS_TENANT_LEAK_COUNT: 9

## Storage rehearsal

Synthetic storage rows only. tenant-documents objects were named with the synthetic tenant ids. engineering-artifacts objects were named with the synthetic workspace ids. The engineering-artifacts bucket is not public.

- User A saw the tenant A document and not the tenant B document.
- User B saw the tenant B document and not the tenant A document.
- User A saw 0 engineering-artifacts objects. The restrictive policy denies anon and authenticated for that bucket.
- The anon role saw 0 storage objects.

Storage isolation is by the tenant folder on tenant-documents, not by workspace id. For these two tenants that matched the two workspaces, the denial matrix held.

POST_MIGRATION_STORAGE_ISOLATION: PASS

## Application compatibility

The GA web application was not started against the isolated database. The live RLS vitest suite was not run. That suite's schema test calls a hosted migration apply, which this phase must not point at production. The schema status function used by the review adapter did return ready on the isolated database. That is not an application run.

GA_APPLICATION_SCHEMA_COMPATIBILITY: NOT_RUN

## Failure recovery

MIGRATION_FAILURE_RECOVERY_PROCEDURE_DEFINED: YES

Observed class for 20260930090000: the failing file stops, earlier files stay applied, and there is no automatic rollback. Production strategy for this DDL set is RESTORE_AND_RETRY from a recorded physical backup onto an isolated target, then a corrected forward file. Do not claim ROLLBACK for the applied prefix. FORWARD_FIX is the disposition of the trigger order inside 20260930090000, and it is not yet the file in git.

## Promotion decision

PRODUCTION_MIGRATION_PROMOTION_ALLOWED: NO

The logical schema restore was real. The pilot set is classified. Both data transforms were measured and rolled back. The repository sequence still fails, nine existing inspection policies leak when the tenant claim is absent, and the GA application was not run. Production migrations remain unapplied.

The later remediation is recorded in EOS_1_0_0_MIGRATION_20260930090000_AND_INSPECTION_RLS_REMEDIATION.md. That phase did not rewrite 20260930090000. It added 20260930090001 and 20261027170000, rehearsed 41 files from a fresh restore, and recorded cross-tenant leak count 0. This document remains the evidence of the original failure.
