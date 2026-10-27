# EOS 1.0.0 production migration reconciliation

Path: docs/architecture/engineering-os/EOS_1_0_0_PRODUCTION_MIGRATION_RECONCILIATION.md

Live read on 2026-10-27. No migration was applied.

Production project wcydlhqiqdwgoaqrlget, schema_migrations catalog, highest version 20261007190000. The live version list matches the production ledger in docs/release/migration-manifest.json. Count of applied production versions: 102.

Staging project rntonzigxwxcjlcsadip remains a different project. A linked read returned 131 applied versions. The repository supabase link file was left on staging. The production read used a temporary workdir only.

Repository SQL files: 151. Files whose version is absent from the live production catalog: 51.

## Counts

TOTAL_APPARENT_PENDING: 51
ACTUAL_REQUIRED_PENDING: 43
ALREADY_EFFECTIVE: 0
SUPERSEDED: 2
STAGING_ONLY: 6
DEVELOPMENT_ONLY: 0
SAFE_FORWARD: 3
DATA_TRANSFORMING: 2
RLS_SENSITIVE: 38
DESTRUCTIVE: 1
NOT_FOR_PRODUCTION: 8

The destructive file is 20261007120000. It is superseded by the production backport 20261007160000, which is already applied. It is not a production candidate. 20261007140000 is the other superseded file. Together with the six security-assurance staging-only files, eight files are not for production.

The 43 actual pending files are the 38 RLS-sensitive files, the 2 data-transforming files, and the 3 additive files. None were applied.

## Live object check

On production, engineering_work_plans, engineering_generated_artifacts, engineering_pre_issue_reviews, and engineering_m365_connections are absent. knowledge_nodes is present. The pending EOS tables are not already effective under another version.

## Why nothing was applied

The three additive files are not independent:

- 20260930020000 adds columns to engineering_external_tool_profiles. That table is created by an unapplied RLS-sensitive migration.
- 20260930050000 adds indexes on knowledge_nodes and knowledge_edges. The tables exist. The index is not required to open an invite-only pilot, so it was not applied.
- 20261001200000 adds storage columns to engineering_generated_artifacts. That table is absent.

20260831230000 replaces handle_new_user. That changes signup and invite tenant assignment. It is not a safe forward data fix.

20260903080000 inserts a chat model registry row. It is not required for the pilot gate.

The 38 RLS-sensitive files create the Engineering OS workspace, review, artifact, connector, and calculation tables and their policies. Applying them would change production schema and row security. This phase did not complete a per-policy proof that each one is safe to execute, so they stay unapplied.

PRODUCTION_MIGRATION_STATUS: BLOCKED

Backup before a mutation was not freshly verified. Provider backup remains the documented restore path. PITR is not claimed. MIGRATION_RECOVERY_ACCEPTABLE: NO for applying this set. No production schema change was made.
