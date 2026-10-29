# EOS 2.16 Production Rollback Runbook

This runbook is for a future EOS 2.17 execution. Do not run it in EOS 2.16.

## Application rollback target

| Item | Value |
| --- | --- |
| Deployment | `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` |
| Commit | `0c1ec9e06eea59ac089753f3c930f1a599b14648` |
| Environment | Vercel production |
| Database | `wcydlhqiqdwgoaqrlget` |
| Feature-flag state | Unchanged. No EOS 2 flag was enabled. |

Verified by production build identity during this phase.

## Database rollback

Keep the additive EOS 2.x tables. Do not run a down migration. EOS 1.0 does not read them. Dropping them is allowed only before any EOS 2 row exists and only with explicit human authority. If EOS 2 rows exist and must be removed, restore the pre-promotion backup instead of deleting Production rows by hand.

## Rollback triggers

Stop and contain on any one of: cross-workspace data leak, authorization bypass, authentication failure that blocks the pilot, migration failure, data corruption, critical application failure, EOS 1.0 pilot regression, baseline integrity failure, release-authority failure, audit failure, or qualified D1 regression. A cross-workspace leak is an immediate stop. AI must not execute the rollback.

## Procedure

1. Prerequisite: human release authority declares rollback. Evidence: the named GO/NO-GO record. Expected: a human decision. Failure: stop and escalate. AI recommendation is not authority.
2. Action: return Production traffic to deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` in project `rtb-ai-platform`. Evidence: a new production build-identity read. Expected: commit `0c1ec9e06eea59ac089753f3c930f1a599b14648`, deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`, Supabase `wcydlhqiqdwgoaqrlget`. Failure: leave the last known production deployment in place and escalate. Do not deploy another commit to compensate.
3. Action: read the Production migration ledger. Evidence: count and maximum version. Expected: if migration had not started, count 144 and maximum `20261027233000`. If migration completed, count 158 and maximum `20261029120000`, with the fourteen versions present once. Failure: stop and use the backup plan. Do not replay or edit versions.
4. Action: smoke-test the restored EOS 1.0 path: health, login, logout, one existing pilot workspace, and one protected route. Evidence: the smoke record. Expected: the pilot path works and no EOS 2 synthetic project is present. Failure: escalate as EOS 1.0 regression.
5. Action: if the database must return to the pre-promotion backup, restore that backup to a non-production target first, validate ledger and row presence, then restore Production only under the same human authority. Evidence: backup id and post-restore ledger. Expected: ledger matches the captured pre-promotion fingerprint. Failure: do not continue promotion.

## Authority

`AI_PRODUCTION_PROMOTION_AUTHORITY=NO`

`AI_PRODUCTION_ROLLBACK_AUTHORITY=NO`

Workspace owner, admin, and pilot engineer are not the Production release authority. The authority is the human who signs the GO/NO-GO checklist under the release-governance production identity check for `wcydlhqiqdwgoaqrlget`.
