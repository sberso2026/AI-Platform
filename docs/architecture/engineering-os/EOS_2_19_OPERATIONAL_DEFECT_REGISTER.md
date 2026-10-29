# EOS 2.19 Operational Defect Register

`OPERATIONAL_DEFECT_REGISTER_COMPLETE=YES`

Carries forward EOS 2.18 history. Resolved items are not deleted.

| ID | Severity | Status | Title |
| --- | --- | --- | --- |
| OP-018-001 | HIGH | Resolved | Production EOS 2 had no application persist path |
| OP-018-002 | HIGH | Resolved | Rollout-mode SQL success/audit divergence |
| OP-018-003 | MEDIUM | Resolved | React hydration #418 from capability cache SSR/client divergence |
| OP-018-004 | LOW | Open | Favicon 404 |
| OP-018-005 | MEDIUM | Resolved | Legacy overview counters contradictory without scope label |
| OP-019-001 | LOW | Open | Ask corpus excludes EOS 2 pilot-workflow tables (correct abstention; GA retrieval extension pending) |

`OPERATIONAL_DEFECT_COUNT=6`

`RESOLVED_OPERATIONAL_DEFECT_COUNT=4`

`UNRESOLVED_OPERATIONAL_DEFECT_COUNT=2`

`CRITICAL_OPERATIONAL_DEFECT_COUNT=0`

`HIGH_OPERATIONAL_DEFECT_COUNT=0`

`MEDIUM_OPERATIONAL_DEFECT_COUNT=0`

`LOW_OPERATIONAL_DEFECT_COUNT=2`

`NO_UNRESOLVED_CRITICAL_OPERATIONAL_DEFECT=YES`

`NO_UNRESOLVED_HIGH_OPERATIONAL_DEFECT=YES`

## OP-018-003 resolution

Root cause: `useEngineeringCapabilities` read `sessionStorage` during `useState` initialization, changing Ask/nav chrome vs SSR. Fixed by SSR-safe defaults and post-mount cache/fetch. Status RESOLVED pending Production soak; severity was Medium intermittent nonblocking and did not corrupt engineering state.

## OP-018-005 resolution

Overview remains a scaffold `emptyView`, but UI/API now declare `unpersisted_scaffold` and show persisted basis-set count with explicit non-authoritative labelling. Status: `UX_LIMITATION_WITH_NONMISLEADING_LABEL` / RESOLVED for consistency gate `LEGACY_OVERVIEW_COUNTER_STATE_CONSISTENT=PASS`.

## OP-019-001

Ask abstention for EOS 2 tables is correct behaviour today. Tracked as Low/enhancement for GA retrieval extension, not a High defect.
