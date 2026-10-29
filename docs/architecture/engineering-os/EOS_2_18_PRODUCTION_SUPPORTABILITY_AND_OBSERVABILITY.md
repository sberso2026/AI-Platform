# EOS 2.18 Production Supportability and Observability

`PRODUCTION_SUPPORTABILITY_VALIDATION=PASS`

`PRODUCTION_OBSERVABILITY_OPERATIONAL=YES`

`PRODUCTION_INCIDENT_RESPONSE_EXERCISE=PASS`

`PRODUCTION_EOS_2_KILL_SWITCH_READY=YES`

`PRODUCTION_USABILITY_ASSESSMENT_COMPLETE=YES`

`PILOT_USER_FEEDBACK_CAPTURED=NO`

`PRODUCTION_OPERATIONAL_AUDIT_VALIDATION=FAIL`

## Support identification

| Question | Answer |
| --- | --- |
| Which deployment | `dpl_9UhYQdVBkiBA6mAd4ajBHRFndhYZ` on `https://eos-pilot.rtbea.com.au` |
| Which runtime | `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01` |
| Which rollout state | `controlled_pilot` on one tenant |
| Which enrollment | Default Workspace `5c85d773-3b79-43b2-b138-c6251f566768`, enrolled count 1, other enrolled count 0 |
| Which database | `wcydlhqiqdwgoaqrlget`, ledger 158 |
| Recent visible errors | favicon 404; freeze-approve 403; hydration #418 not reproduced on the fresh reload |
| Rollback target | `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`, not executed |
| Defect class | OP-018-001 High, OP-018-002 High, OP-018-003 Medium, OP-018-004 Low |

Support can identify the deployment, runtime, mode, and enrollment without changing them. Disabling EOS 2 remains the operator mode write used in EOS 2.17. It was not repeated, because the pilot was not disrupted and the current mode read matches the rendered lifecycle page.

`ROLLBACK_TRIGGERED=NO`

`ROLLBACK_LEVEL=NONE`

`EOS_2_CONTROLLED_PILOT_REMAINS_ENABLED=YES`

## Observability

Visible during this phase:

- Browser console and network: favicon 404 and the freeze-approve 403.
- Application response: HTTP 403 with no workflow insert.
- Database: rollout mode and enrollment counts are readable. Workflow tables for the pilot workspace are readable and empty.
- Prior rollout audit rows remain the record of activation, the failed-looking first write, the successful second write, kill-switch disable, and restore.

Limits:

- `denied()` on the qualification runtime returns before inserting `engineering_delivery_audit`. The incident 403 is visible in the browser and is not a new audit row.
- Page redirects to access-denied do not always insert an audit row. That was already true in EOS 2.17.
- No separate telemetry product was opened. Engineering content was not added to telemetry.
- Auth-failure volume was not remeasured. This session was already authenticated.

Those limits do not hide the denied action or the rollout state. Observability is sufficient to diagnose this phase.

## Incident exercise

Action: from the authenticated pilot session, `POST /api/engineering/qualification-runtime` with body `{ "action": "freeze-approve" }`. No acting role was sent. `vendor-revision` was not used.

Result:

- The browser showed HTTP 403 Forbidden.
- The console logged `incident 403`.
- The user received a denial, not a freeze.
- Counts taken after the call remained 0 for basis, structural delivery, interfaces, changes, and lifecycles.
- No service disruption was created.

`PRODUCTION_INCIDENT_RESPONSE_EXERCISE=PASS`

## Audit of the workflow

`PRODUCTION_OPERATIONAL_AUDIT_VALIDATION=FAIL`

The required chain for a created basis, discipline object, revision, interface, change, materiality action, deliverable, and freeze was not present, because those records were not created. AI queries against that workflow were not issued.

The rollout audit from EOS 2.17 is still the mode history. It does not by itself satisfy the workflow audit requirement, and OP-018-002 records that the first mode audit did not match the database.

## Kill switch

The kill switch was not toggled. EOS 2.17 already proved disable and restore, and repeating it would interrupt the only enrolled workspace.

Readiness evidence this phase: mode is `controlled_pilot`, enrolled count is 1, and `/engineering/delivery-lifecycle` rendered for that workspace. The control remains the same operator write. It is ready, and OP-018-002 says that write must not use a `jsonb_set` shape that can no-op.

## Usability

`PRODUCTION_USABILITY_ASSESSMENT_COMPLETE=YES`

Concrete friction:

- The pilot pages explain that records appear after they are created, and they provide no create control.
- Discipline, interface, change, and freeze views can be opened. They cannot be completed.
- Design freeze is the deliverable surface. Nothing in the navigation is named MDR.
- The workspace and role stay visible, so current context is clear while the workflow is empty.
- EOS 1 still answers `/engineering/projects`. EOS 2 is a separate gated surface. The empty EOS 2 pages do not themselves explain that the write path is absent.
- A denied freeze POST is an HTTP 403 in the console. The page does not show an authority-denial message for that call because the call was issued from the console, not from a page button that handles the error.
- Hydration #418, when it appears, is console noise on a page that still renders.
- Favicon 404 is console noise.

Aesthetics were not scored. The missing write path is the High defect, not a styling finding.

## Pilot feedback

`PILOT_USER_FEEDBACK_CAPTURED=NO`

No separate feedback was given by the authorized pilot user during this phase. None was invented.
