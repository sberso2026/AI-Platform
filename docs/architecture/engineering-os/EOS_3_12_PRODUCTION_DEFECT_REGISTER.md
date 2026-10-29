# EOS 3.12 Production Pilot Defect Register

`EOS_3_PRODUCTION_PILOT_DEFECT_REGISTER_COMPLETE=YES`

`EOS_3_LOW_DEFECT_REASSESSMENT_COMPLETE=YES`

## Unresolved counts

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |

`EOS_3_GA_READINESS=NOT_READY` — insufficient Production Pilot evidence; medium defects remain open under controls; no Critical/High blockers.

## Medium

### EOS3-10-D001 — Live LLM not validated

| Field | Value |
|-------|-------|
| Production reassessment | PASS |
| Status | `OPEN_ACCEPTED` |
| Control | Live LLM remains `DISABLED_NOT_VALIDATED`; Production AI plans = 0 |
| Escalated | NO |
| Remediatable in 3.12 | NO (would expand scope; requires separate validation gate + GO) |

### EOS3-10-D002 — Real connectors not executed

| Field | Value |
|-------|-------|
| Production reassessment | PASS |
| Status | `OPEN_ACCEPTED` |
| Control | Real connectors `DISABLED`; Production connectors = 0 |
| Escalated | NO |
| Remediatable in 3.12 | NO (separate connector validation + GO) |

## Low

| ID | Title | Status |
|----|-------|--------|
| EOS3-10-D003 | No formal GA performance SLO | `OPEN_ACCEPTED` — pilot thresholds only; GA SLO not declared |
| EOS3-10-D004 | GHSA-w5hq-g745-h8pq | `OPEN_ACCEPTED` — `PASS_WITH_KNOWN_MODERATE` / `ACCEPTED_BOUNDED_RISK` reconfirmed |

## New defects discovered in EOS 3.12

None Critical/High/Medium. Observability gap (no request-level Production denial/read telemetry) noted as continued-assurance improvement, not opened as blocking defect.

## Hotfixes in EOS 3.12

`EOS_3_PILOT_HOTFIX_COUNT=0`

(Activation-era prefer-const deploy fix `429e0452` was completed under EOS 3.11R, not as a 3.12 Production hotfix.)

## Fix governance

`EOS_3_PILOT_FIX_GOVERNANCE=PASS` — no Production-affecting 3.12 code fixes applied; feature scope frozen to docs/assurance only.

`EOS_3_PILOT_FEATURE_SCOPE_FROZEN=YES`
