# EOS 2.16 Controlled Production Promotion Readiness

## Decision

`PRODUCTION_PROMOTION_READINESS=READY_WITH_LIMITATIONS`

`PRODUCTION_PROMOTION_EXECUTED=NO`

EOS 2.16R resolved RD-001. EOS 2 now has a separate fail-closed rollout gate, explicit workspace enrollment, and a kill switch that leaves EOS 1.0 available. The affected hosted qualification was rerun on preview `dpl_GgVBzbU9N2ZnR5fR41fWwdnYDhbC`. Production was not migrated and was not redeployed. Remaining limitations are the absent point-in-time recovery, the known moderate dependency advisory, and the existing calculation and solver exclusions.

## Provenance

| Role | Commit or deployment |
| --- | --- |
| Prior qualified application runtime | `af6612bdebe40616dab18525ceab4dc70f03621e` |
| New qualified hosted runtime | `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01` |
| Qualification report | `9d6fb55c39bbbc10e148a0b37268142e3a2bb72b` |
| EOS 2.15R pointer | `b7ac95e8c634b0118e7547541b7479b2653b4a3a` |
| New qualified staging deployment | `dpl_GgVBzbU9N2ZnR5fR41fWwdnYDhbC` |
| Production promotion candidate | `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01` |
| Current Production application | `0c1ec9e06eea59ac089753f3c930f1a599b14648` |
| Current Production deployment | `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` |

`git diff --name-only af6612bdebe40616dab18525ceab4dc70f03621e..b7ac95e8c634b0118e7547541b7479b2653b4a3a` contains only the seven EOS 2.15 qualification documents. No application, dependency, configuration, migration, security, or engineering-runtime file changed. The difference is `DOCUMENTATION_ONLY` and `EVIDENCE_ONLY`. Runtime equivalence of that range is verified. This readiness commit is also documentation. It is not the Production deployment candidate.

The promotion candidate is the deployed runtime `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01`. A later documentation commit is not the candidate. Engineering formulas and result semantics are unchanged from `af6612bdebe40616dab18525ceab4dc70f03621e`. Build identity was re-read. Staging is preview `dpl_GgVBzbU9N2ZnR5fR41fWwdnYDhbC` and Supabase `rntonzigxwxcjlcsadip`. Production remains the commit and deployment above and Supabase `wcydlhqiqdwgoaqrlget`.

## Qualification boundary

EOS 2.15R `QUALIFIED_BOUNDED` is unchanged. Delivery workflows are qualified. Deterministic calculations outside the existing D1 scope are not. External solver execution is not globally qualified. Synthetic project `EOS-QA-001` must not be copied to Production.

## Migration delta

Production ledger count 144, maximum `20261027233000`. Staging ledger count 146, maximum `20261029120000`. The pending set is the thirteen EOS 2.x delivery versions plus `20261029120000`. Count 14. Duplicate pending count 0. Production does not contain the enrollment table. Details and hashes are in the migration manifest.

The thirteen delivery files create new tables, indexes, triggers, and policies. `20261029120000` creates only `eos2_workspace_enrollment`, with `enrolled` defaulting to false and no inserted rows. None of the fourteen files `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, or `DROP TABLE`. `DROP` statements remove only a trigger or policy on a table the same file creates, and only if it already exists. Classification is `ADDITIVE_SAFE`. Destructive count 0. Irreversible count 0. No business-data migration is required. A missing lifecycle row means `not_classified`; old projects are not backfilled.

Ledger `statements` bodies are null, so integrity is not a stored checksum. It is the filename and name match, the SHA-256 of each repository file, and a column-count match of all 113 rehearsal tables against staging. Mismatch count 0.

Version `20261028240000` is a 14-digit repository key. Its clock hour is not a legal time. It is already the staging version and must not be renamed.

## Rehearsal

Isolated Postgres 16, not Production and not staging. Prerequisite stubs were `tenants`, `workspaces`, `update_updated_at`, `engineering_core_workspace_matches_tenant`, `get_user_tenant_ids`, `engineering_core_workspace_member`, and `has_permission`. A marker row was inserted first. The thirteen files then applied in order in 6372 ms, including client overhead. Result: marker survived, 113 `engineering_%` tables, 0 without RLS, 227 policies, 126 triggers. This duration is not a Production timing claim. Lock risk is short exclusive locks on new empty relations. No existing Production table is altered.

## Compatibility and order

`EOS_1_APP_WITH_EOS_2_SCHEMA_COMPATIBLE=YES`. Commit `0c1ec9e06eea59ac089753f3c930f1a599b14648` does not reference `engineering_delivery_lifecycles`. The delta only adds relations.

`EOS_2_APP_WITH_EOS_1_SCHEMA_COMPATIBLE=NO`. The EOS 2 routes read the new tables. Migrations must be applied before the EOS 2 application is deployed.

`POST_MIGRATION_APP_ROLLBACK_COMPATIBLE=YES`. Rolling the application back to `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` leaves the additive tables unused. Do not drop them to roll back.

## RD-001

RD-001 was High. The root cause was that EOS 2 used only the `engineering-os` entitlement, which is already active for the existing Production installations. Suspending that product would also suspend EOS 1.0.

Remediation is the separate rollout decision in `EOS_2_16R_EOS_2_ROLLOUT_CONTROL_REMEDIATION.md`. Hosted evidence is `EOS_2_16R_ROLLOUT_CONTROL_VALIDATION_EVIDENCE.md`. The resolution runtime is `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01`.

Residual risk is unchanged and is not a rollout blocker: point-in-time recovery is not enabled, `GHSA-w5hq-g745-h8pq` remains a known moderate advisory, calculations outside D1 and external solvers stay unqualified, and receiver or impact decisions are inserted because those tables do not grant update. Status is RESOLVED. Unresolved Critical count 0. Unresolved High count 0.

## Recovery

Production backups are enabled. Point-in-time recovery is not enabled. WAL-G is enabled. Seven completed physical backups are visible, the latest at `2026-10-28T17:07:26.140Z`, region `ap-southeast-2`. No RPO or RTO figure is defined here. Restore authority is the human release authority. The restore target is a non-production project unless that authority explicitly chooses otherwise. After restore, compare ledger count, maximum version, and build identity before any further action.

EOS 2.17 must verify a new completed Production backup taken after GO and before migration. That checkpoint is not verified now. `PRE_PROMOTION_BACKUP_REQUIREMENT_DEFINED=YES`.

## What remains safe

No Production migration was applied. Production was not redeployed. No feature flag was changed. No pilot user or legacy project was migrated. No synthetic qualification data was copied.
