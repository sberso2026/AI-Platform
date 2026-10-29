# EOS 2.17R Production Pilot Authentication and Activation

## Decision

`PHASE=EOS-2.17R-PRODUCTION-PILOT-AUTHENTICATION-AND-ACTIVATION`

`VERDICT=PASS_WITH_LIMITATIONS`

`PRODUCTION_PROMOTION_STATUS=PROMOTED_CONTROLLED_PILOT`

`READY_FOR_NEXT_PHASE=YES`

`NEXT_PHASE=EOS-2.18-PRODUCTION-PILOT-OPERATIONAL-VALIDATION`

This phase continued the deployed, disabled cohort. It did not restart EOS 2.17, reapply migrations, redeploy, or start EOS 2.18.

## Authentication

Method: the normal Production login page at `https://eos-pilot.rtbea.com.au`. The approved pilot user authenticated interactively. The browser-saved credential filled the password field. The agent clicked Sign In and did not type, read, store, or reset the password.

Result: authentication succeeded. Logout and login were repeated the same way.

MFA: not challenged.

Session handling: the authenticated browser session was used only for this validation. Session cookies, access tokens, refresh tokens, and browser-storage dumps were not written to Git, logs, or this record.

`PRODUCTION_PILOT_INTERACTIVE_LOGIN_COMPLETED=YES`

`PRODUCTION_AUTH_SESSION_HANDLING_SECURE=YES`

## Pre-enablement

EOS 1 smoke passed before enrollment: the signed-in identity was the approved pilot membership, the workspace was `eos-controlled-pilot / default`, the role was `pilot_engineer`, the existing project `Pilot-0001` was readable, EOS 1 navigation worked, and logout/login worked. No schema error was shown.

While the workspace was entitled and not enrolled:

- Command Centre stated EOS 2 is not enabled for this workspace.
- `/engineering/delivery-lifecycle` redirected to `/access-denied?reason=eos2_not_enabled`.
- EOS 2 API requests returned 403 `eos2_not_enabled`.
- The enrollment POST returned 403 `eos2_enrollment_denied` and did not write.
- Entitlement alone did not grant EOS 2.

The pilot project opened from the unrelated owner workspace rendered `Project not found`. That workspace's project list did not show `Pilot-0001`. Leak count was 0. Rollback deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` was Ready.

`PRODUCTION_EOS_1_AUTHENTICATED_SMOKE_TEST=PASS`

`PRODUCTION_ENTITLED_NOT_ENROLLED_DENIAL_TEST=PASS`

`PRODUCTION_PRE_ENABLEMENT_RLS_TEST=PASS`

`PRE_ENABLEMENT_CROSS_WORKSPACE_LEAK_COUNT=0`

`PRODUCTION_PRE_ENABLEMENT_SECURITY_GATE=PASS`

## Activation

Only tenant `eos-controlled-pilot` was set to `controlled_pilot`. Only workspace `5c85d773-3b79-43b2-b138-c6251f566768` was enrolled. The first `jsonb_set` path did not create a missing `eos2` object and did not persist the mode. A second scoped write persisted `controlled_pilot` and recorded `eos2_rollout_mode_set`. The enrollment row records actor, workspace, tenant, previous absence, enrolled state, timestamp `2026-10-29 04:26:43.213415+00`, authority `human_production_release_authority`, and the controlled-pilot reason. Unapproved enrolled workspaces: 0. Tenants in `controlled_pilot`: 1.

`EOS_2_PRODUCTION_ROLLOUT_MODE=CONTROLLED_PILOT`

`EOS_2_APPROVED_WORKSPACE_ENROLLED=YES`

`EOS_2_PRODUCTION_ENROLLED_WORKSPACE_COUNT=1`

`EOS_2_UNAPPROVED_WORKSPACE_ENROLLMENT_COUNT=0`

`EOS_2_PRODUCTION_ENROLLMENT_AUDIT=PASS`

## EOS 2 access

The approved pilot session opened the lifecycle, Engineering Basis, structural, process, mechanical, piping, civil, geotechnical, electrical, instrumentation and control, interface, change impact, and design-freeze routes. Each rendered in the pilot workspace and stated that the page does not approve, calculate, or certify. Counts were 0. There is no separate MDR route; design freeze is the deliverable surface. No `EOS-QA-001` record was created.

The unrelated owner workspace, while the tenant mode was already `controlled_pilot`, still received `EOS 2 is not enabled` and a direct lifecycle redirect to `eos2_not_enabled`. It was not enrolled.

`PRODUCTION_EOS_2_PILOT_AUTHENTICATION_TEST=PASS`

`PRODUCTION_EOS_2_ROUTE_SMOKE_TEST=PASS`

`NON_PILOT_ENGINEERING_OS_INSTALLATION_EOS_2_DENIAL=PASS`

## Bounded workflow

`PRODUCTION_EOS_2_PILOT_WORKFLOW_TEST=PASS_WITH_LIMITATIONS`

Empty-state reads were exercised. No Engineering Basis item, discipline object, interface, or revision was written. The only existing project is the EOS 1 pilot demo, and a new Production write was not justified. `Pilot-0001` was not altered and was not auto-migrated. Its count remains 1.

`LEGACY_PROJECT_AUTO_MIGRATION=NO`

`EOS_1_LEGACY_PROJECT_ACCESS_PRESERVED=YES`

`SYNTHETIC_DATA_PRODUCTION_TRANSFER=NO`

## Isolation, authority, and kill switch

After enrollment, the pilot project URL from the unrelated workspace still rendered `Project not found`. Leak count remained 0.

The authenticated `pilot_engineer` session received HTTP 403, with no write, for enrollment, materiality, receiver acceptance, freeze approval, deliverable approval, and IFC release. The acting role `ai` is in the same blocked set and was rejected before any write.

Kill switch: pilot lifecycle access worked; mode was set to `off` at `2026-10-29 04:50:04.28082+00` while the enrollment row stayed; the lifecycle route then denied access; `Pilot-0001` still opened; the project count stayed 1; mode was restored to `controlled_pilot` at `2026-10-29 04:51:32.37969+00`; the lifecycle route rendered again. Unapproved enrollment stayed 0. The additive schema was not removed. Application rollback and database recovery were not executed.

`PRODUCTION_RLS_REGRESSION=PASS`

`CROSS_WORKSPACE_PRODUCTION_LEAK_COUNT=0`

`PRODUCTION_AUTHORITY_BOUNDARY_TEST=PASS`

`PRODUCTION_EOS_2_KILL_SWITCH_TEST=PASS`

## Observability and release

Observed signals: Production deployment `dpl_9UhYQdVBkiBA6mAd4ajBHRFndhYZ` Ready on `https://eos-pilot.rtbea.com.au`; rollback deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` Ready; interactive login success; pre-enrollment 403 denials and `eos2_access_denied` audit rows; post-enrollment route renders; kill-switch denial and restore audits. No separate error-stream dashboard was queried. A delivery-lifecycle hydration console error, React minified #418, did not block the route.

Release-governance was executed this phase: 220 passed. Persistence unit tests: 37 passed, 1 skipped. Secret scan: 624 files, 0 findings. EOS 2 rollout unit tests: 4 passed. Engineering-review: 166 passed, 1 skipped, including the import-boundary assertion. Platform-core: 162 passed. Design freeze, interface, change impact, and the qualified D1 review tests: 8 passed. Dependency audit reports the existing moderate `GHSA-w5hq-g745-h8pq` through exceljs/uuid. It was not treated as a new blocker and was not auto-fixed.

`PRODUCTION_OBSERVABILITY_VALIDATED=YES`

`POST_PROMOTION_MONITORING_SNAPSHOT_CAPTURED=YES`

`PRODUCTION_AUDIT_TRAIL_COMPLETE=YES`

`SECURITY_RELEASE_REGRESSION_GATE=PASS`

`QUALIFIED_D1_BASELINE_INVALIDATED=NO`

## Authority preserved

`AI_PRODUCTION_PROMOTION_AUTHORITY=NO`

`AI_PRODUCTION_ROLLBACK_AUTHORITY=NO`

`AI_ENGINEERING_APPROVAL_AUTHORITY=NO`

`AI_RELEASE_AUTHORITY=NO`

`AI_IFC_RELEASE_AUTHORITY=NO`

`EOS_2_0_QUALIFICATION_STATUS=QUALIFIED_BOUNDED`

`ENGINEERING_FORMULAS_CHANGED=NO`

`ENGINEERING_RESULT_SEMANTICS_CHANGED=NO`

`APPLICATION_RUNTIME_CHANGED=NO`

`MIGRATION_REEXECUTION_ATTEMPTED=NO`
