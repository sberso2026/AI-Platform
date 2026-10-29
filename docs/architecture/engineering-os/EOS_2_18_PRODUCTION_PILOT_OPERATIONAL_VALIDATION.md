# EOS 2.18 Production Pilot Operational Validation

## Decision

`PHASE=EOS-2.18-PRODUCTION-PILOT-OPERATIONAL-VALIDATION`

`VERDICT=BLOCKED`

`PRODUCTION_PILOT_OPERATIONAL_STATUS=NOT_VALIDATED`

`READY_FOR_NEXT_PHASE=NO`

`NEXT_PHASE=EOS-2.18R-PRODUCTION-WORKFLOW-PERSISTENCE-REMEDIATION`

EOS 2.0 remains `QUALIFIED_BOUNDED` and `PROMOTED_CONTROLLED_PILOT`. This phase did not redeploy, reapply migrations, change enrollment, change rollout mode, alter formulas, or start EOS 2.19.

The controlled pilot cannot yet be validated as an operational engineering platform. The Production application can render the enrolled workspace and can deny unauthorized actions, and it cannot persist an Engineering Basis, discipline object, interface, revision, change, or deliverable through the authenticated application.

## Preserved production baseline

| Item | Value |
| --- | --- |
| Qualified runtime | `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01` |
| Production deployment | `dpl_9UhYQdVBkiBA6mAd4ajBHRFndhYZ` |
| Production host | `https://eos-pilot.rtbea.com.au` |
| Production Supabase | `wcydlhqiqdwgoaqrlget` |
| Migration ledger | `158` (`max(version)=20261029120000`) |
| Rollout mode | `controlled_pilot` |
| Mode tenants | `1` |
| Enrolled workspaces | `1` |
| Other enrolled workspaces | `0` |
| Tenant | `eos-controlled-pilot` (`4f7da5fe-4ffb-453d-9d63-b74ff36aba2a`) |
| Workspace | Default Workspace `5c85d773-3b79-43b2-b138-c6251f566768` |
| Existing projects in that workspace | `1` |
| `CONTROLLED_PRODUCTION_PILOT_VALIDATION` | `0` |

`MIGRATION_REEXECUTION_ATTEMPTED=NO`

`APPLICATION_RUNTIME_CHANGED=NO`

`ENGINEERING_RUNTIME_CHANGED=NO`

`ENGINEERING_FORMULAS_CHANGED=NO`

`ENGINEERING_RESULT_SEMANTICS_CHANGED=NO`

`QUALIFIED_D1_BASELINE_INVALIDATED=NO`

`LEGACY_PROJECT_AUTO_MIGRATION=NO`

`ROLLBACK_TRIGGERED=NO`

The existing project `Pilot-0001` was not modified. No customer engineering project was used. No synthetic staging project, including `EOS-QA-001`, was transferred.

## Why the workflows did not pass

The EOS 2 pages under `(eos2)` load their APIs with GET. Those GET handlers can select existing rows. Their POST handlers build an in-memory review and do not insert.

The only EOS 2 route that inserts workflow rows is `POST /api/engineering/qualification-runtime`. That route refuses `pilot_engineer`, `pilot-engineer`, `ai`, `owner`, and `admin` before any insert. If a non-blocked role called `vendor-revision`, the route would write the synthetic qualification project `EOS-QA-001`. That action was not called.

A bounded validation project was not created through EOS 1 either. An EOS 1 project row would not give EOS 2 a place to store a basis, discipline object, interface, change, or deliverable.

Direct SQL inserts were not used. They would not be creation through the Production application.

Post-session database counts for workspace `5c85d773-3b79-43b2-b138-c6251f566768`:

| Object | Count |
| --- | --- |
| Engineering Basis sets | 0 |
| Structural deliveries | 0 |
| Interface handoffs | 0 |
| Change-impact cases | 0 |
| Delivery lifecycles | 0 |
| Projects named `CONTROLLED_PRODUCTION_PILOT_VALIDATION` | 0 |

`PRODUCTION_PILOT_VALIDATION_PROJECT_READY=NO`

`DISCIPLINES_WRITTEN_COUNT=0`

`PRODUCTION_ENGINEERING_BASIS_WORKFLOW=FAIL`

`PRODUCTION_DISCIPLINE_OBJECT_WORKFLOW=FAIL`

`PRODUCTION_INTERFACE_WORKFLOW=FAIL`

`PRODUCTION_REVISION_WORKFLOW=FAIL`

`PRODUCTION_CHANGE_IMPACT_WORKFLOW=FAIL`

`PRODUCTION_DELIVERABLE_WORKFLOW=FAIL`

`PRODUCTION_DESIGN_FREEZE_WORKFLOW=FAIL`

## Assessments that were completed

React hydration `#418` was assessed on `/engineering/delivery-lifecycle` in Microsoft Edge. A fresh hard reload did not reproduce it. The earlier observation in this session still rendered the page. Status `INTERMITTENT`, severity `MEDIUM`. No runtime patch and no deploy.

The EOS 2.17 rollout-mode persistence issue was assessed. `jsonb_set` on an empty settings object does not create the missing `eos2` parent, so the first activation update did not change mode while its audit row claimed success. The later concatenation write persisted. The database mode is now `controlled_pilot` and the enrolled lifecycle page still renders, so the current UI and database agree. The same operator statement can still no-op, and the product has no mode-setting API. Reliability is `FAIL`. This remains High.

Authenticated reads of the basis, structural, interface, change-impact, and design-freeze APIs returned HTTP 200. A hard reload of delivery lifecycle completed. Measured times are in the performance record. No formal SLO exists. Status `DEGRADED`.

`POST /api/engineering/qualification-runtime` with `{ "action": "freeze-approve" }` returned HTTP 403. The browser console showed the denial. The workflow counts above were taken after that call and remained zero. EOS 1 `GET /engineering/projects` returned HTTP 200 in the same session.

The kill switch was not toggled again. Mode remains `controlled_pilot`, enrollment remains 1, and the lifecycle route still rendered for the enrolled workspace.

No pilot-user feedback was collected. That is recorded as `NO`.

## Gate result

Security and release suites were re-executed. They passed, except `pnpm audit --prod` exiting on the already-known moderate `GHSA-w5hq-g745-h8pq` through `exceljs`. That advisory is not a new blocker and was not audit-fixed.

`SECURITY_RELEASE_REGRESSION_GATE=PASS`

Operational success still fails because two High defects are unresolved:

1. The Production application cannot persist the controlled-pilot workflow.
2. An operator rollout-mode write can still silently no-op.

`NO_UNRESOLVED_HIGH_OPERATIONAL_DEFECT=NO`

Remediation is a governed application persist path for the bounded pilot workflow, plus a rollout write that cannot report success when it changes nothing. That work is EOS 2.18R. It is not a silent Production patch and it is not EOS 2.19.
