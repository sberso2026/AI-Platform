# EOS 2.17 Controlled Pilot Activation

## Result

`EOS_2_PRODUCTION_CONTROLLED_PILOT_ENABLED=NO`

`EOS_2_PRODUCTION_ENROLLED_WORKSPACE_COUNT=0`

`INITIAL_COHORT_MATCHES_APPROVED_PLAN=YES`

The continuation confirmed the same state for workspace `5c85d773-3b79-43b2-b138-c6251f566768`: 0 enrollment rows and 0 tenants in `controlled_pilot`. No enrollment write was made.

Authenticated pre-enablement smoke was not run. The execution sequence keeps the cohort off until that smoke passes. Staging workspace `eos-qa-a` was not copied.

`LEGACY_PROJECT_AUTO_MIGRATION=NO`

The existing EOS 1 project on the pilot workspace was not migrated. Its count remains 1.

## After EOS 2.17R authentication

`EOS_2_PRODUCTION_ROLLOUT_MODE=CONTROLLED_PILOT`

`EOS_2_APPROVED_WORKSPACE_ENROLLED=YES`

`EOS_2_PRODUCTION_ENROLLED_WORKSPACE_COUNT=1`

`EOS_2_UNAPPROVED_WORKSPACE_ENROLLMENT_COUNT=0`

`EOS_2_PRODUCTION_ENROLLMENT_AUDIT=PASS`

The enrolled workspace is `5c85d773-3b79-43b2-b138-c6251f566768` on tenant `eos-controlled-pilot`. The enrollment audit is `eos2_controlled_pilot_activated` at `2026-10-29 04:26:43.213415+00`. The mode write that persisted is `eos2_rollout_mode_set` at `2026-10-29 04:28:03.14931+00`. No other workspace and no other tenant were enrolled. The kill-switch test set the mode to `off` and restored `controlled_pilot` without dropping the enrollment row or the additive schema. The project count remained 1.
