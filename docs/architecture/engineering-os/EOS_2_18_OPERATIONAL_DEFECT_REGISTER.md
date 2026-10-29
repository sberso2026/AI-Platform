# EOS 2.18 Operational Defect Register

`OPERATIONAL_DEFECT_REGISTER_COMPLETE=YES`

| ID | Severity | Status | Title |
| --- | --- | --- | --- |
| OP-018-001 | HIGH | Resolved | Production EOS 2 has no application path that persists a pilot workflow |
| OP-018-002 | HIGH | Resolved | Rollout-mode SQL can report success when it changes nothing |
| OP-018-003 | MEDIUM | Open | React hydration #418 on delivery lifecycle is intermittent and nonblocking |
| OP-018-004 | LOW | Open | Pilot host returns 404 for favicon.ico |

`OPERATIONAL_DEFECT_COUNT=4`

`RESOLVED_OPERATIONAL_DEFECT_COUNT=2`

`UNRESOLVED_OPERATIONAL_DEFECT_COUNT=2`

`CRITICAL_OPERATIONAL_DEFECT_COUNT=0`

`HIGH_OPERATIONAL_DEFECT_COUNT=0`

`MEDIUM_OPERATIONAL_DEFECT_COUNT=1`

`LOW_OPERATIONAL_DEFECT_COUNT=1`

`NO_UNRESOLVED_CRITICAL_OPERATIONAL_DEFECT=YES`

`NO_UNRESOLVED_HIGH_OPERATIONAL_DEFECT=YES`

No Critical defect was observed. EOS 2.18R closed both High defects. The remaining Medium and Low defects do not block the next operational validation. The cohort was not expanded.

## OP-018-001

Severity: HIGH. Status: Resolved by EOS 2.18R.

The enrolled pilot user can open Engineering Basis, structural delivery, interface, change impact, and design freeze. Those pages read. They do not create a persisted record.

Evidence:

- Page modules under `(eos2)` call `fetch` for GET.
- `engineering-basis`, `structural-delivery`, `interface-intelligence`, `change-impact`, and `design-freeze` POST handlers return an in-memory review and do not insert.
- `qualification-runtime` is the only inserter. It returns HTTP 403 `authority_denied` for `pilot_engineer` before insert. Its write path is the synthetic project `EOS-QA-001`, which must not be used as this pilot workflow.
- After the session, the approved workspace had 0 basis sets, 0 structural deliveries, 0 interface handoffs, 0 change cases, and 0 delivery lifecycles.

Impact: Engineering Basis, discipline, interface, revision, change-impact, deliverable, and design-freeze workflows are unusable in Production. This matches the High example "critical workflow unusable".

Resolution: `POST /api/engineering/pilot-workflow` and `eos2_18r_persist` persist the labelled validation project. Staging and Production both created, revised, reloaded, and audited the workflow. Evidence: `EOS_2_18R_WRITE_PATH_ROOT_CAUSE_AND_FIX.md` and `EOS_2_18R_PRODUCTION_REMEDIATION_EVIDENCE.md`.

## OP-018-002

Severity: HIGH. Status: Resolved by EOS 2.18R.

`ROLLOUT_MODE_PERSISTENCE_ISSUE_ASSESSED=YES`

`ROLLOUT_MODE_PERSISTENCE_RELIABILITY=PASS`

`ROLLOUT_MODE_PERSISTENCE_ROOT_CAUSE=jsonb_set does not create a missing eos2 parent on empty settings, so the first activation update changed nothing while its audit row claimed the new mode`

Evidence from EOS 2.17, reconfirmed by the current database:

- Settings started as `{}`. `jsonb_set(settings, '{eos2,mode}', ...)` does not create the missing intermediate `eos2` object. The update was a no-op.
- Audit action `eos2_controlled_pilot_activated` at `2026-10-29 04:26:43.213415+00` recorded the intended mode anyway.
- The correcting write concatenated `'{"eos2":{"mode":"controlled_pilot"}}'` and was audited as `eos2_rollout_mode_set` at `2026-10-29 04:28:03.14931+00`.
- This phase read `settings.eos2.mode` as `controlled_pilot` for the one pilot tenant. Enrolled workspace count is 1. Other enrolled workspaces are 0. The lifecycle page rendered for that workspace.

The failure is deterministic for that SQL shape. It is not a browser timing or session retry. The product has no rollout-mode API, so the operator statement is the write path. The first audit row does not distinguish a zero-row update from success, so the UI and database can diverge until a later read is compared with settings.

The successful retry is not a close. A later kill-switch or restore statement of the same `jsonb_set` shape can silently leave the previous mode in place.

Resolution: `eos2_18r_set_rollout_mode` writes the `eos2` object without a missing-parent no-op and audits only the persisted mode. Production cycled `controlled_pilot` to `off` and back. Each audit `persistedMode` matched the read-back. Enrollment stayed 1. Evidence: `EOS_2_18R_ROLLOUT_MODE_PERSISTENCE_REMEDIATION.md`.

## OP-018-003

Severity: MEDIUM. Status: Open.

`HYDRATION_418_ASSESSED=YES`

`HYDRATION_418_STATUS=INTERMITTENT`

`HYDRATION_418_SEVERITY=MEDIUM`

Route: `/engineering/delivery-lifecycle`. Browser: Microsoft Edge. React minified error #418 is a server/client markup mismatch.

The console preserved from earlier in this phase showed #418 while the page still rendered stage, maturity, and zero counts. After `console.clear()` and a hard reload, the new console showed only `GET /favicon.ico 404`. #418 did not recur on that reload. The page still showed the empty lifecycle and the qualification notice.

No data loss, navigation loss, or failed user action was observed. The page body is a client component whose view starts null. Header and sidebar timestamps run in effects, so they are not the confirmed source. The mismatch source was not isolated because the fresh reload did not reproduce the error.

EOS 2.18R did not edit the delivery lifecycle page. The persistence writes on Engineering Basis completed and reloaded. #418 was not observed on those writes. It remains intermittent and Medium. A reproducible mismatch that changes data or action results would be a blocker. This observation does not meet that bar.

## OP-018-004

Severity: LOW. Status: Open.

`GET https://eos-pilot.rtbea.com.au/favicon.ico` returned 404 on the reloaded lifecycle page. The page remained usable. This is cosmetic.

## Items that are not defects in this register

The known moderate advisory `GHSA-w5hq-g745-h8pq` (`exceljs` to `uuid`) is unchanged and is not a new operational defect.

The absence of a separate MDR route is the current design-freeze surface. It is classified `UX_LIMITATION` in the workflow evidence, not as an additional functional defect. The missing persist path is OP-018-001.
