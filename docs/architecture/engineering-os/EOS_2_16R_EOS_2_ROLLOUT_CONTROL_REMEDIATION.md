# EOS 2.16R EOS 2 Rollout Control Remediation

## Decision

RD-001 is resolved. EOS 2 access is no longer the same thing as an active `engineering-os` product entitlement.

`EOS 2 access` is all of the following:

1. authenticated user
2. active `engineering-os` product entitlement
3. tenant rollout mode exactly `controlled_pilot`
4. explicit workspace enrollment row with `enrolled = true`
5. workspace membership enforced by existing RLS
6. the existing role or permission required by the action

Any missing, malformed, or unreadable decision is deny.

## Source of truth

| Decision | Source | Default |
| --- | --- | --- |
| Global rollout | `tenants.settings.eos2.mode` | missing or any value other than `controlled_pilot` is off |
| Emergency force-off | server environment `EOS_2_ROLLOUT=off` | unset does not enable EOS 2; the value cannot force EOS 2 on |
| Workspace enrollment | `eos2_workspace_enrollment` | no row, or `enrolled` not boolean true, is deny |
| Product entitlement | existing commerce entitlement for `engineering-os` | unchanged; required, not sufficient |
| Role | existing auth context and action checks | enrollment does not grant engineering authority |

Client storage, cookies, and hard-coded installation counts are not authoritative. The count of existing Production installations is exposure evidence, not an authorization rule.

`EOS_CONTROLLED_PILOT_ENABLED` remains the older pilot-profile switch. It is not the EOS 2 gate. Reusing it alone would not isolate a workspace.

## Server enforcement

The parent `/engineering` layout still checks only the product entitlement, so EOS 1.0 stays available.

EOS 2 pages live in the route group `engineering/(eos2)`. URLs are unchanged. That layout requires authentication, the product entitlement, and `readEos2Access`. Denial redirects to `/access-denied?reason=eos2_not_enabled` with the message `EOS 2 is not enabled for this workspace.`

EOS 2 route handlers use `withEos2Api`. That runs the existing engineering API guard and then the same access decision. Denial is HTTP 403, code `eos2_not_enabled`. EOS 1.0 handlers remain on `withEngineeringApi`.

The qualification mutation is `POST /api/engineering/qualification-runtime`. There is no separate server-action file on these pages. That POST is behind `withEos2Api`.

The engineering AI route remains the EOS 1.0 assistant. It does not read EOS 2 enrollment or delivery tables. A non-enrolled session cannot reach EOS 2 data through it. AI cannot enroll a workspace.

## Enrollment authority

`POST /api/engineering/eos2-enrollment` allows only role `owner` or `admin`. Engineer, pilot engineer, member, viewer, and `ai` are denied. The database policy also requires `has_permission('tenant','admin', tenant_id)` for insert and update. A denied enrollment does not write a row.

The enrollment row stores `enrolled_at` or `disabled_at`, `authority_role`, `actor_id`, and `reason`. Disable is the same API with `enrolled` false.

## Audit

Application denials insert `engineering_delivery_audit` action `eos2_access_denied`. An authorized enrollment or disable inserts `eos2_workspace_enrolled` or `eos2_workspace_disabled`. The audit write is best-effort and does not turn a denial into a success. Secrets are not logged.

## Schema

Migration `20261029120000_eos_2_16r_rollout_enrollment` creates `eos2_workspace_enrollment`. It is additive. `enrolled` defaults to false. The file inserts no rows. RLS is enabled. Select requires tenant membership and workspace membership. Insert and update require tenant admin. It was applied on staging only.

## Production configuration for EOS 2.17

Do not enable EOS 2 in this phase. After a future Production deployment:

1. Leave `EOS_2_ROLLOUT` unset, or set it to `off` only as an emergency force-off.
2. Leave every Production tenant without `settings.eos2.mode = controlled_pilot`. Missing mode is off.
3. Run Production smoke tests, the EOS 1.0 regression, and the security checks.
4. A human release authority then sets the approved tenant mode to `controlled_pilot` and enrolls only the named workspace through the enrollment API.
5. Validate that workspace, then monitor.

No other tenant or workspace becomes eligible.
