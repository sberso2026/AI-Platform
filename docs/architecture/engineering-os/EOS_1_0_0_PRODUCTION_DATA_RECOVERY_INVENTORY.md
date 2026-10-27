# EOS 1.0.0 production data recovery inventory

Path: docs/architecture/engineering-os/EOS_1_0_0_PRODUCTION_DATA_RECOVERY_INVENTORY.md

Production project wcydlhqiqdwgoaqrlget was read for aggregate metadata only. No production row values are recorded here. Staging project rntonzigxwxcjlcsadip was not used as a restore target and was not reset.

## Database profile

PostgreSQL 17.6. Database size 174861459 bytes. Extensions: pg_stat_statements 1.11, pgcrypto 1.3, plpgsql 1.0, supabase_vault 0.3.1, uuid-ossp 1.1, vector 0.8.2. The vector type and extension are in public.

Schemas required for this recovery: public, auth, storage, and supabase_migrations.

Public tables 478. Auth tables 27. Storage tables 8. Combined base tables in those three schemas: 513. Estimated planner rows were not used for the match. Exact combined row count: 154663.

Public indexes 1249. Public constraints 3520. Validated public foreign keys 1652. Invalid public foreign keys 0. Public policies 1120. Public functions 168. Public triggers 141. Public views 0. Storage policies 4. One sequence exists across public, auth, and storage.

Migration ledger count 102. Maximum version 20261007190000. Version 20260930090000 is absent. engineering_work_plans is absent. security_assurance_controls is absent. engineering_disciplines is present.

## Affected data classes

The approved 41-file sequence can change application data and storage metadata.

20260930010000 inserts up to three system engineering_disciplines rows when those keys are absent. It does not update or delete existing discipline rows. Current discipline rows: 1066. Primary-key count: 1066. Rows whose tenant id is null: 13.

20261001210000 inserts or updates the engineering-artifacts storage.buckets row and replaces a restrictive policy on storage.objects. That bucket is absent now. Storage bucket rows: 2. Storage object metadata rows: 35. The migration does not insert storage.objects rows and does not read or write object bytes.

Other INSERT and UPDATE text in the 41 files sits inside functions or triggers. Those statements do not run while the migration is applied. New application tables created by the sequence start empty. The two previously measured data transformations, 20260831230000 and 20260903080000, stay excluded.

Auth statements in the 41 files read auth.uid or auth.role. They do not insert, update, or delete auth rows. Auth user count: 1589.

MIGRATIONS_TOUCH_APPLICATION_DATA: YES
MIGRATIONS_TOUCH_AUTH_DATA: NO
MIGRATIONS_TOUCH_STORAGE_METADATA: YES
MIGRATIONS_TOUCH_STORAGE_OBJECT_CONTENT: NO

Auth rows and storage object metadata are still inside the logical backup so the restored database matches the pre-migration database. Storage object bytes live outside the database. They are unchanged by this migration set, so a blob backup is not required for this migration.

STORAGE_OBJECT_BACKUP_REQUIRED_FOR_THIS_MIGRATION: NO

## Provider backups

Seven completed physical backups were listed, from 2026-10-20 through 2026-10-26. Newest id 2078357680 at 2026-10-26T17:11:08.561Z. pitr_enabled is false. walg_enabled is true. pg_stat_archiver archived_count 2970, failed_count 0, last archived at 2026-10-27 09:28:36 UTC. The list does not publish a retention number beyond those seven completed backups. Backup existence is not a rehearsed provider restore.

## What this inventory does not contain

No names, email addresses, document text, engineering content, tokens, credentials, or table-row values are stored in this file.
