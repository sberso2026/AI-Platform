# EOS 2.17R Backup Recovery Verification

## Result

`PRE_PROMOTION_BACKUP_VERIFIED=YES`

`PRE_PROMOTION_BACKUP_INTEGRITY_VERIFIED=YES`

`PRE_PROMOTION_BACKUP_RECOVERABILITY_VERIFIED=YES`

`BACKUP_MATCHES_PRE_PROMOTION_FINGERPRINT=YES`

`POINT_IN_TIME_RECOVERY_ENABLED=NO`

`RECOVERY_MODE=VERIFIED_LOGICAL_BACKUP`

The completed physical backup `2097755872` at `2026-10-28T17:07:26.140Z` was not used as the promotion checkpoint. Point-in-time recovery is not enabled. The management API cannot create an on-demand physical backup.

## Checkpoint

| Item | Value |
| --- | --- |
| Mechanism | `pg_dump` custom format from the authoritative Production database |
| Project | `wcydlhqiqdwgoaqrlget` |
| Database version | Postgres 17.6 |
| Completion | `2026-10-29T01:56:35.075Z` |
| Size | 35239632 bytes |
| SHA-256 | `392be8e01ce0adb4cca3aeff3c681c4c4833020dab0aeeb1547c7de913e6f1a8` |
| Location | Outside the git repository. The dump is not committed. |

A short-lived database role was created only for the dump and was removed afterward. A follow-up count of that role is 0. No EOS 2 enrollment row was created. The role password is not recorded.

## Fingerprint bound to the backup

Read before the dump and again after it:

| Item | Value |
| --- | --- |
| Commit | `0c1ec9e06eea59ac089753f3c930f1a599b14648` |
| Deployment | `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` |
| Ledger | 144, maximum `20261027233000` |
| Approved EOS 2 versions present | 0 |
| EOS 2 enrollment table | Absent |
| Tenants in `controlled_pilot` | 0 |

If any of those values change before EOS 2.17 execution, this backup must be taken again.

## Restore

The dump was restored into a new isolated Postgres 17 container that was not published as a shared environment. The container and its network were removed after the checks.

| Check | Production | Restored |
| --- | --- | --- |
| Ledger count | 144 | 144 |
| Maximum version | `20261027233000` | `20261027233000` |
| Tenants | 2701 | 2701 |
| Workspaces | 3589 | 3589 |
| EOS 2 enrollment table | Absent | Absent |
| EOS 1 pilot tenant `eos-controlled-pilot` | 1 | 1 |
| Workspaces in that tenant | 1 | 1 |

`public.project_intelligence_document_embeddings` did not restore on stock Postgres 17. Public tables were 570 restored of 571. Policies were 1392 restored of 1489. The promotion ledger and the tenant and workspace populations matched. That stock result is retained. It is not the recovery conclusion.

## Closeout classification

`MISSING_RESTORE_POLICY_CLASSIFICATION_COMPLETE=YES`

`APPLICATION_OWNED_RLS_POLICY_RESTORE_PARITY=PASS`

`DOCUMENT_EMBEDDINGS_RECOVERY_PATH_VERIFIED=YES`

`PR_001_RESIDUAL_RECOVERY_GAP_CLOSED=YES`

The same dump was restored again into an isolated `pgvector/pgvector:pg17` container that was not published. The container and its network were removed after the checks. The checksum was re-read first and still matched `392be8e01ce0adb4cca3aeff3c681c4c4833020dab0aeeb1547c7de913e6f1a8`.

Production has extensions `vector` and `supabase_vault`. The embeddings table has `embedding jsonb` and `embedding_vector vector(1536)`. Migration `20260712180000` creates the table. Migration `20260712200000` installs `vector` and adds the vector column. The backup contains the table definition and its rows. On the pgvector image the table restored, `vector` was installed, and the row count was 1537. Production has the same row count and the same two policies on that table. Stock Postgres 17 is not a full recovery target for this schema.

The first pgvector pass restored 1394 public policies and no storage policies. The 95 missing policies were all `CREATE POLICY` statements rejected because the isolated database had no `authenticated` role. Classification of those 95:

| Class | Count | Cause |
| --- | --- | --- |
| Application-owned public-schema RLS | 87 | Missing Supabase role `authenticated` |
| Storage-managed policies | 8 | Missing Supabase role `authenticated` |
| Supabase Auth-managed policies | 0 | No `auth` schema policies are in the Production policy catalog |
| Extension/platform-managed objects | `supabase_vault` and `vault.secrets` | The isolated image has no `supabase_vault` control file |

Production policy catalog is 1481 public policies and 8 storage policies, 1489 total. After the isolated database was given the `authenticated`, `anon`, and `service_role` roles that already exist on the Supabase recovery target, the post-data section was replayed. Public policies were 1481 and storage policies were 8. The ordered policy-name fingerprint was `4cf95ff1a5867d4fdd659cdaedce7ee5` on both Production and the restore. No application-owned RLS policy remained missing. `vault.secrets` still does not restore without `supabase_vault`. That object is platform-managed and is not an application RLS policy.

## Limitation

This is not point-in-time recovery. It is a verified logical backup of the Production state at the timestamp above.
