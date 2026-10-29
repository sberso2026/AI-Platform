# EOS 2.17 Controlled Pilot Activation

## Result

`EOS_2_PRODUCTION_CONTROLLED_PILOT_ENABLED=NO`

`EOS_2_PRODUCTION_ENROLLED_WORKSPACE_COUNT=0`

`INITIAL_COHORT_MATCHES_APPROVED_PLAN=YES`

The approved plan says the first Production cohort is one workspace named by the human release authority at GO. No workspace was named. No enrollment row was created. The global mode was not switched to `controlled_pilot`. Staging workspace `eos-qa-a` was not copied.

Pilot authentication, route smoke, workflow, authority probes, and the live kill-switch toggle were not run. There is no Production EOS 2 cohort to exercise.

`LEGACY_PROJECT_AUTO_MIGRATION=NO`

Existing EOS 1.0 projects were left unchanged.
