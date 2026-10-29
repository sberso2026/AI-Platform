# EOS 2.18R Rollout Mode Persistence Remediation

`OP_018_002_ROOT_CAUSE_CONFIRMED=YES`

`jsonb_set` on `{eos2,mode}` does not create a missing `eos2` object when `settings` is null, `{}`, or has no `eos2` key. The EOS 2.17 activation wrote nothing and still inserted `eos2_controlled_pilot_activated` at `2026-10-29 04:26:43.213415+00`. A later concatenation repaired the row. The product had no mode API, so that operator statement was the write path.

## Repair

`eos2_18r_set_rollout_mode` replaces the `eos2` object in one assignment. It merges an existing `eos2` object and creates one when the parent is missing. It locks the tenant row with `FOR UPDATE`. Invalid modes return `invalid_mode` and `auditedSuccess=false` with no success audit. A non-owner authenticated caller gets `eos2_rollout_mode_rejected` and no success audit.

Success audit `eos2_rollout_mode_set` is inserted only after `RETURNING` shows the persisted mode equals the requested mode. The audit stores `persistedMode`, not merely the requested mode. The application route `POST /api/engineering/eos2-rollout-mode` reads `tenants.settings` back after the function and returns 409 if the read does not match. The pilot engineer cannot call that route. Owner, admin, or the operator path can.

Staging proved the expression for null, `{}`, missing `eos2`, an existing mode, and an invalid mode. Production then cycled the live tenant `controlled_pilot` to `off` and back to `controlled_pilot`. Each read-back matched the audit `persistedMode`. Enrollment stayed 1. While the mode was `off`, Engineering Basis redirected to `EOS 2 is not enabled`, and the EOS 1 project page for Pilot-0001 still rendered. The mode was restored before closeout.

Concurrent calls serialize on the tenant row lock. Two simultaneous database sessions were not opened. The lock and the sequential production cycle are the concurrency evidence.
