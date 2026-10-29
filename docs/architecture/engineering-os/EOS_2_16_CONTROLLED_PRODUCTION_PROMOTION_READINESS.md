# EOS 2.16 Controlled Production Promotion Readiness

## Decision

`PRODUCTION_PROMOTION_READINESS=NOT_READY`

`PRODUCTION_PROMOTION_EXECUTED=NO`

The qualified EOS 2.0 runtime can be identified, the Production migration delta is known, and an isolated rehearsal of that delta passed. Production was not migrated and was not redeployed. Promotion is not ready because the current application has no EOS 2-only control that can stay off while the existing EOS 1.0 pilot remains available.

## Provenance

| Role | Commit or deployment |
| --- | --- |
| Qualified hosted runtime | `af6612bdebe40616dab18525ceab4dc70f03621e` |
| Qualification report | `9d6fb55c39bbbc10e148a0b37268142e3a2bb72b` |
| EOS 2.15R pointer | `b7ac95e8c634b0118e7547541b7479b2653b4a3a` |
| Qualified staging deployment | `dpl_Am7AhnHwv7Hjdymx4e73AXrfv75C` |
| Production promotion candidate | `af6612bdebe40616dab18525ceab4dc70f03621e` |
| Current Production application | `0c1ec9e06eea59ac089753f3c930f1a599b14648` |
| Current Production deployment | `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` |

`git diff --name-only af6612bdebe40616dab18525ceab4dc70f03621e..b7ac95e8c634b0118e7547541b7479b2653b4a3a` contains only the seven EOS 2.15 qualification documents. No application, dependency, configuration, migration, security, or engineering-runtime file changed. The difference is `DOCUMENTATION_ONLY` and `EVIDENCE_ONLY`. Runtime equivalence of that range is verified. This readiness commit is also documentation. It is not the Production deployment candidate.

Build identity was re-read. Staging remains the qualified preview and Supabase `rntonzigxwxcjlcsadip`. Production remains the commit and deployment above and Supabase `wcydlhqiqdwgoaqrlget`.

## Qualification boundary

EOS 2.15R `QUALIFIED_BOUNDED` is unchanged. Delivery workflows are qualified. Deterministic calculations outside the existing D1 scope are not. External solver execution is not globally qualified. Synthetic project `EOS-QA-001` must not be copied to Production.

## Migration delta

Production ledger count 144, maximum `20261027233000`, EOS 2.x versions 0. Staging ledger count 145, maximum `20261029100000`, EOS 2.x versions 13, duplicate rows 0. The pending set is the thirteen versions `20261028120000` through `20261029100000`. Production does not contain those tables. Details and hashes are in the migration manifest.

The thirteen files create new tables, indexes, triggers, and policies. They do not `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, or `DROP TABLE`. `DROP` statements remove only a trigger or policy on a table the same file creates, and only if it already exists. Classification is `ADDITIVE_SAFE`. Destructive count 0. Irreversible count 0. No business-data migration is required. A missing lifecycle row means `not_classified`; old projects are not backfilled.

Ledger `statements` bodies are null, so integrity is not a stored checksum. It is the filename and name match, the SHA-256 of each repository file, and a column-count match of all 113 rehearsal tables against staging. Mismatch count 0.

Version `20261028240000` is a 14-digit repository key. Its clock hour is not a legal time. It is already the staging version and must not be renamed.

## Rehearsal

Isolated Postgres 16, not Production and not staging. Prerequisite stubs were `tenants`, `workspaces`, `update_updated_at`, `engineering_core_workspace_matches_tenant`, `get_user_tenant_ids`, `engineering_core_workspace_member`, and `has_permission`. A marker row was inserted first. The thirteen files then applied in order in 6372 ms, including client overhead. Result: marker survived, 113 `engineering_%` tables, 0 without RLS, 227 policies, 126 triggers. This duration is not a Production timing claim. Lock risk is short exclusive locks on new empty relations. No existing Production table is altered.

## Compatibility and order

`EOS_1_APP_WITH_EOS_2_SCHEMA_COMPATIBLE=YES`. Commit `0c1ec9e06eea59ac089753f3c930f1a599b14648` does not reference `engineering_delivery_lifecycles`. The delta only adds relations.

`EOS_2_APP_WITH_EOS_1_SCHEMA_COMPATIBLE=NO`. The EOS 2 routes read the new tables. Migrations must be applied before the EOS 2 application is deployed.

`POST_MIGRATION_APP_ROLLBACK_COMPATIBLE=YES`. Rolling the application back to `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` leaves the additive tables unused. Do not drop them to roll back.

## Cohort control blocker

RD-001, High, unresolved. `/engineering` is gated by `requireProductEntitlement` for product `engineering-os`. Production has 396 active installations of that product. The EOS 2 pages use that same layout. `EOS_CONTROLLED_PILOT_ENABLED` exists on the pilot profile and is not read by the layout. Setting it to `0` does not hide EOS 2. Suspending the `engineering-os` installation would also suspend the EOS 1.0 pilot. The `feature_flags` table is not consulted by the EOS 2 routes.

There is therefore no current control that deploys the qualified runtime and keeps EOS 2 off for the existing population. EOS 2.17 must not deploy until a bounded cohort control is implemented and the affected hosted qualification is rerun. This phase does not add that control, because a runtime change would no longer be the qualified commit.

## Recovery

Production backups are enabled. Point-in-time recovery is not enabled. WAL-G is enabled. Seven completed physical backups are visible, the latest at `2026-10-28T17:07:26.140Z`, region `ap-southeast-2`. No RPO or RTO figure is defined here. Restore authority is the human release authority. The restore target is a non-production project unless that authority explicitly chooses otherwise. After restore, compare ledger count, maximum version, and build identity before any further action.

EOS 2.17 must verify a new completed Production backup taken after GO and before migration. That checkpoint is not verified now. `PRE_PROMOTION_BACKUP_REQUIREMENT_DEFINED=YES`.

## What remains safe

No Production migration was applied. Production was not redeployed. No feature flag was changed. No pilot user or legacy project was migrated. No synthetic qualification data was copied.
