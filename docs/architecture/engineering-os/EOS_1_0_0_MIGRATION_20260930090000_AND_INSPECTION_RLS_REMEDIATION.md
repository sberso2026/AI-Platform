# EOS 1.0.0 migration 20260930090000 and inspection RLS remediation

Path: docs/architecture/engineering-os/EOS_1_0_0_MIGRATION_20260930090000_AND_INSPECTION_RLS_REMEDIATION.md

Production project wcydlhqiqdwgoaqrlget was not changed. Staging project rntonzigxwxcjlcsadip was not reset or deleted. The repository link remains the staging ref.

## Failing migration

FAILING_MIGRATION_ID: 20260930090000
FAILING_SQL_STATEMENT: CREATE TRIGGER engineering_lifecycle_decisions_same_scope BEFORE INSERT OR UPDATE ON engineering_lifecycle_gate_decisions
SQLSTATE: 42P01
ERROR_MESSAGE: relation "engineering_lifecycle_gate_decisions" does not exist
FAILED_OBJECT: engineering_lifecycle_gate_decisions
ROOT_CAUSE: ordering problem
DEPENDENCY_CAUSING_FAILURE: the trigger is created at line 154 and the table is created at line 164. The same file also creates the transitions trigger before engineering_lifecycle_transitions.

The failure was reproduced on a fresh restored production schema after the preceding pilot files had been applied. The statement ran inside a transaction that rolled back, so the fresh target was not left partial. The same-scope trigger for evaluations is valid because that table is created earlier in the file.

## Immutability

Production ledger count for 20260930090000: 0.
Staging ledger count for 20260930090000: 0.
Staging already has engineering_lifecycle_gate_decisions, engineering_lifecycle_transitions, and engineering_lifecycle_evaluations.

MIGRATION_20260930090000_PRODUCTION_LEDGER_STATUS: ABSENT
MIGRATION_20260930090000_STAGING_LEDGER_STATUS: ABSENT
MIGRATION_20260930090000_IMMUTABLE: YES

The historical file was not rewritten. Staging is a persistent shared database and already has the tables, so the file stays as applied evidence of the original order. Production execution must not run that file on a database where the tables are absent.

## Forward lifecycle substitute

CORRECTIVE_MIGRATION_CREATED: YES
The lifecycle substitute is 20260930090001_eos_a9a_lifecycle_trigger_order.sql.
It is the same DDL with the two trigger blocks after both tables exist. CREATE TABLE IF NOT EXISTS and DROP TRIGGER IF EXISTS keep it safe where staging already has the objects.

A second forward migration, 20261027170000_eos_inspection_rls_fail_closed.sql, replaces the fail-open inspection policies.

The executable pilot sequence omits 20260930090000 and includes both new files. Count: 41. A directory-wide db push is not the execution method, because it would still run the historical file first.

## Nine inspection leaks

The rehearsal role was authenticated, not service_role, postgres, or a BYPASSRLS role. authenticated.rolbypassrls is false. The session set request.jwt.claim.sub and request.jwt.claims with sub and role, and did not set tenant_id. No application code writes tenant_id into the JWT. Workspace and tenant membership rows were present. The harness is valid.

Each leak used SELECT. Actor role authenticated. Actor user the synthetic user A. Actor workspace A. Target workspace B. Expected deny. Actual result was one visible row. The active policy was the table's *_tenant_isolation policy. The expression was tenant_id::text = coalesce(request.jwt.claims tenant_id, tenant_id::text). When the claim is absent, that comparison is true for every row.

LEAK_ID 1. inspection_assignments. inspection_assignments_tenant_isolation.
LEAK_ID 2. inspection_attestations. inspection_attestations_tenant_isolation.
LEAK_ID 3. inspection_evidence_annotations. inspection_evidence_annotations_tenant_isolation.
LEAK_ID 4. inspection_offline_commands. inspection_offline_commands_tenant_isolation.
LEAK_ID 5. inspection_offline_entitlement_snapshots. inspection_offline_entitlement_snapshots_tenant_isolation.
LEAK_ID 6. inspection_offline_evidence_queue. inspection_offline_evidence_queue_tenant_isolation.
LEAK_ID 7. inspection_reporting_outputs. inspection_reporting_outputs_tenant_isolation.
LEAK_ID 8. inspection_workflow_instances. inspection_workflow_instances_tenant_isolation.
LEAK_ID 9. inspection_workflow_sla_timers. inspection_workflow_sla_timers_tenant_isolation.

RLS_LEAK_INVENTORY_COUNT: 9
RLS_ROOT_CAUSE_COUNT: 1
RLS_ROOT_CAUSES: FAIL_OPEN_COALESCE_OF_MISSING_JWT_TENANT_CLAIM

The same expression also exists on inspection_media_stages, inspection_offline_packages, and inspection_workflow_audit. Those three were not in the original nine because the generic insert did not land a row. The corrective migration covers all twelve. They are the same root cause, not additional leaks from this inventory.

## Remediation

Historical inspection migrations stay unchanged. They are already on the production ledger. The new function inspection_workspace_visible is security invoker. It requires a non-null tenant, a non-null workspace, membership from get_user_tenant_ids, and a workspace_memberships row for auth.uid(). Policies are FOR ALL TO authenticated, with the same expression for USING and WITH CHECK. Public execute on the helper is revoked. Anonymous roles have no policy.

RLS_SECURITY_POSTURE_WEAKENED: NO

## Fresh rehearsal

A new local container, eos-restore-rehearsal, PostgreSQL 17.6 image 17.6.1.141, received a new schema-only restore of production. The dump had no COPY sections. Public tables after restore: 478, including project_intelligence_document_embeddings. The container is not production and not staging.

The historical file was then executed inside a transaction and failed with SQLSTATE 42P01. That transaction rolled back. The executable sequence of 41 files then completed with zero failures. The last file was 20261027170000.

After that run the database had 571 public tables, engineering_work_plans, both lifecycle tables, the decisions same-scope trigger, and no security_assurance_controls.

## Data transformations

Both transforming files were executed again only inside rolled-back transactions.

20260831230000 moved the invite marker offset from 312 to 298. Rollback restored 312. It stays out of the pilot sequence.

20260903080000 kept one synthetic model_registry row and changed its display name. Rollback returned the table to 0 rows. No row was deleted. It stays out of the pilot sequence.

DATA_TRANSFORMATION_VALIDATED: YES
DATA_TRANSFORMATION_LOSS_DETECTED: NO

## Isolation after remediation

User A, as authenticated, saw one inspection_assignments row in workspace A and zero in workspace B. Insert, update, and delete of the workspace A row succeeded. Insert into workspace B was denied. Update and delete of workspace B changed zero rows. User B saw one row and zero rows in workspace A. The anonymous role was denied.

The same user A session saw zero rows in all twelve remediated inspection tables when only workspace B rows existed. No public policy still uses the coalesce tenant fallback.

Storage, with synthetic objects only: user A saw the tenant A file and not the tenant B file, and saw zero engineering-artifacts objects. User B saw the tenant B file and not the tenant A file. The anonymous role saw zero storage objects.

POST_MIGRATION_RLS_REHEARSAL: PASS
CROSS_TENANT_LEAK_COUNT: 0
POST_MIGRATION_STORAGE_ISOLATION: PASS

## Application compatibility

The GA web server was not started. The integration test src/pilot-migration-rls-remediation.test.ts ran against this database. It used the authenticated role, not the service role, and checked inspection read and write isolation plus engineering_review_security_schema_status(). That function reported review_tables_ready and core_workspace_member. The migrated database also has engineering_documents, engineering_projects, engineering_decisions, engineering_work_plans, engineering_pre_issue_reviews, engineering_generated_artifacts, audit_events, inspection_assignments, knowledge_nodes, and model_registry.

GA_APPLICATION_SCHEMA_COMPATIBILITY: PASS
MIGRATED_STATE_RLS_EVIDENCE_PRECEDENCE: YES

## Data recovery

Schema recovery was verified by the fresh restore. Seven completed physical backups remain listed, newest id 2078357680 at 2026-10-26T17:11:08.561Z. pitr_enabled is false. The provider restore command was not run.

SCHEMA_RECOVERY_VERIFIED: YES
DATA_RECOVERY_MECHANISM_AVAILABLE: YES
PRODUCTION_DATA_RECOVERY_READY: NO
PROVIDER_RESTORE_PATH_VERIFIED: NO
MANUAL_BACKUP_OR_RESTORE_ACTION_REQUIRED: YES

Before any production execution, record a new completed physical backup id. Do not run supabase backups restore against wcydlhqiqdwgoaqrlget.

PRODUCTION_MIGRATION_PROMOTION_ALLOWED: YES
PRODUCTION_MIGRATION_EXECUTION_ALLOWED: NO
PRODUCTION_MIGRATIONS_APPLIED: NO
