# EOS 2.17 Controlled Production Promotion Execution

## Decision

`FINAL_PRE_PROMOTION_GO_NO_GO=GO`

`HUMAN_PRODUCTION_GO_AUTHORITY=YES`

`AI_PRODUCTION_GO_AUTHORITY=NO`

`PRODUCTION_MIGRATION_APPLIED=YES`

`PRODUCTION_REDEPLOYED=YES`

`EOS_2_PRODUCTION_CONTROLLED_PILOT_ENABLED=NO`

An earlier attempt on this branch stopped before any Production change because there was no post-GO backup, no named signatory, and no named workspace. This execution started only after Silvestre Berso issued GO and the pre-migration fingerprint still matched.

## What ran

The post-GO logical backup completed at `2026-10-29T03:30:07.828Z`, SHA-256 `7ec6a70389874eeb14bc7972000a8972df1e8506e863997b8c1e510f4bf5f6b0`, 35239632 bytes. It is outside git. The temporary backup role was removed.

The fourteen approved migrations were applied in version order to `wcydlhqiqdwgoaqrlget`. Ledger is 158, maximum `20261029120000`. All fourteen versions are present once. `eos2_workspace_enrollment` exists and has 0 rows. No tenant has `settings.eos2.mode = controlled_pilot`. The pilot workspace still has 1 engineering project. No synthetic project was copied.

The qualified tree `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01` was deployed to Production. Live identity is that commit, deployment `dpl_9UhYQdVBkiBA6mAd4ajBHRFndhYZ`, environment `production`, Supabase `wcydlhqiqdwgoaqrlget`, dirty false. The CLI upload does not set `VERCEL_GIT_COMMIT_SHA`, so the deploy supplied `NEXT_PUBLIC_BUILD_SHA` with the worktree commit. That is the value the existing identity route already reads. An earlier CLI deployment, `dpl_9QcyzEHQTVi8QciYuXkAc8XvZ2cC`, reported commit `unknown` and was replaced before any cohort step.

Rollback deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` was the serving deployment until this deploy. It was not deleted.

## What did not run

Authenticated pilot login, EOS 1 workflow smoke, and cross-workspace UI smoke were not run in the first execution. The continuation reached the Production login page and stopped there. The pilot account password is not available in this session, and authentication was not bypassed. The named workspace remains unenrolled. EOS 2 remains disabled for every Production workspace.

`LEGACY_PROJECT_AUTO_MIGRATION=NO`

`SYNTHETIC_PRODUCTION_TRANSFER=NO`

## EOS 2.17R authentication and activation

The continuation above stopped before login. This later phase authenticated the approved pilot through the normal login page, completed the pre-enablement denials, and enrolled only workspace `5c85d773-3b79-43b2-b138-c6251f566768`.

`PRODUCTION_PROMOTION_STATUS=PROMOTED_CONTROLLED_PILOT`

`EOS_2_PRODUCTION_ROLLOUT_MODE=CONTROLLED_PILOT`

`EOS_2_PRODUCTION_ENROLLED_WORKSPACE_COUNT=1`

`MIGRATION_REEXECUTION_ATTEMPTED=NO`

Ledger remains 158, maximum `20261029120000`. The live deployment remains `dpl_9UhYQdVBkiBA6mAd4ajBHRFndhYZ`. The bounded workflow did not write Production engineering records. Evidence is in `EOS_2_17R_PRODUCTION_PILOT_AUTHENTICATION_AND_ACTIVATION.md`.
