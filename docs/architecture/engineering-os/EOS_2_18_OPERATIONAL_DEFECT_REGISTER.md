# EOS 2.18 Operational Defect Register

`OPERATIONAL_DEFECT_REGISTER_COMPLETE=YES`

| ID | Severity | Status | Title |
| --- | --- | --- | --- |
| OP-018-001 | HIGH | Resolved | Production EOS 2 has no application path that persists a pilot workflow |
| OP-018-002 | HIGH | Resolved | Rollout-mode SQL can report success when it changes nothing |
| OP-018-003 | MEDIUM | Open | React hydration #418 on delivery lifecycle is intermittent and nonblocking |
| OP-018-004 | LOW | Open | Pilot host returns 404 for favicon.ico |
| OP-018-005 | MEDIUM | Open | Legacy Engineering Basis overview counters stay zero while EOS 2 panel matches database |

`OPERATIONAL_DEFECT_COUNT=5`

`RESOLVED_OPERATIONAL_DEFECT_COUNT=2`

`UNRESOLVED_OPERATIONAL_DEFECT_COUNT=3`

`CRITICAL_OPERATIONAL_DEFECT_COUNT=0`

`HIGH_OPERATIONAL_DEFECT_COUNT=0`

`MEDIUM_OPERATIONAL_DEFECT_COUNT=2`

`LOW_OPERATIONAL_DEFECT_COUNT=1`

`NO_UNRESOLVED_CRITICAL_OPERATIONAL_DEFECT=YES`

`NO_UNRESOLVED_HIGH_OPERATIONAL_DEFECT=YES`

No unresolved Critical or High defect remains. EOS 2.18R closed OP-018-001 and OP-018-002. EOS 2.18 operational validation confirmed those remediations remain effective and added OP-018-005 for the legacy overview counter mismatch. Remaining Medium/Low items do not block controlled pilot expansion readiness when the validation panel is treated as authoritative.

## OP-018-001

Severity: HIGH. Status: Resolved by EOS 2.18R. Reconfirmed resolved in EOS 2.18.

Resolution: `POST /api/engineering/pilot-workflow` and `eos2_18r_persist` persist the labelled validation project. Independent EOS 2.18 revise_basis 3→4, reload, logout, and database second read remained consistent.

Evidence: `EOS_2_18R_WRITE_PATH_ROOT_CAUSE_AND_FIX.md`, `EOS_2_18R_PRODUCTION_REMEDIATION_EVIDENCE.md`, `EOS_2_18_PRODUCTION_WORKFLOW_EVIDENCE.md`.

## OP-018-002

Severity: HIGH. Status: Resolved by EOS 2.18R. Reconfirmed resolved in EOS 2.18.

`ROLLOUT_MODE_PERSISTENCE_RELIABILITY=PASS`

`ROLLOUT_AUDIT_STATE_MATCH=PASS`

Resolution: `eos2_18r_set_rollout_mode` writes the `eos2` object without a missing-parent no-op and audits only the persisted mode. EOS 2.18 non-mutating check: database mode `controlled_pilot` = latest audit `persistedMode=controlled_pilot` = UI controlled-pilot behaviour. Full destructive re-toggle not required given 2.18R cycle proof plus current consistency.

Evidence: `EOS_2_18R_ROLLOUT_MODE_PERSISTENCE_REMEDIATION.md`.

## OP-018-003

Severity: MEDIUM. Status: Open.

`HYDRATION_418_ASSESSED=YES`

`HYDRATION_418_STATUS=INTERMITTENT_NONBLOCKING`

`HYDRATION_418_SEVERITY=MEDIUM`

Route: `/engineering/delivery-lifecycle`. Browser: Microsoft Edge. This operational-validation run did not reproduce #418. Prior intermittent observations remain. No data loss, action failure, navigation failure, or persistence impact observed. Remains Medium and nonblocking for pilot expansion readiness.

## OP-018-004

Severity: LOW. Status: Open.

`GET https://eos-pilot.rtbea.com.au/favicon.ico` returns 404. Cosmetic only.

## OP-018-005

Severity: MEDIUM. Status: Open.

`LEGACY_OVERVIEW_COUNTER_ASSESSED=YES`

`LEGACY_OVERVIEW_COUNTER_STATUS=UX_LIMITATION`

Root cause: `GET /api/engineering/engineering-basis` returns `view: emptyView(...)` from an in-memory unpersisted `createBasisGraph`, while persisted `rows` are unused by the overview counters. The controlled validation panel matches database state; overview counters remain zero. Not Blocking while panel authority is explicit. Would become Blocking if the zeros were presented as the sole authoritative engineering-state counts without an accurate alternate surface.

## Items that are not defects in this register

Known moderate advisory `GHSA-w5hq-g745-h8pq` (`exceljs` → `uuid`) is unchanged and is not a new operational defect.

Ask Engineering AI abstention for EOS 2 pilot tables not in the Ask retrieval corpus is a retrieval limitation with correct abstention behaviour, not a calculation invention defect.

Absence of a separately named MDR route remains `UX_LIMITATION`, not an additional functional defect, while design-freeze/deliverable surfaces remain usable for controlled pilot.
