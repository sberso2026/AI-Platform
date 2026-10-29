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

`public.project_intelligence_document_embeddings` did not restore on stock Postgres 17. Public tables were 570 restored of 571. Policies were 1392 restored of 1489. The gap follows Supabase extension objects, including `supabase_vault`, which stock Postgres 17 does not provide. The promotion ledger and the tenant and workspace populations matched.

## Limitation

This is not point-in-time recovery. It is a verified logical backup of the Production state at the timestamp above.
