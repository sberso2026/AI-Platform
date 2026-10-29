# EOS 3.12A Production Pilot Defect Register

`EOS_3_PRODUCTION_PILOT_DEFECT_REGISTER_COMPLETE=YES`

## Counts

| Severity | Unresolved |
|----------|------------|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |

## Medium reassessment

| ID | Reassessment | Status |
|----|--------------|--------|
| EOS3-10-D001 Live LLM not validated | PASS | `OPEN_ACCEPTED` — still DISABLED_NOT_VALIDATED; 0 live provider invocations |
| EOS3-10-D002 Real connectors not executed | PASS | `OPEN_ACCEPTED` — still DISABLED; connectors=0 |

Do not close solely because capability remains excluded.

## Low

| ID | Status |
|----|--------|
| EOS3-10-D003 No formal GA SLO | `OPEN_ACCEPTED` |
| EOS3-10-D004 GHSA-w5hq-g745-h8pq | `OPEN_ACCEPTED` / ACCEPTED_BOUNDED_RISK |

## New defects in 3.12A

None Critical/High/Medium from the assurance campaign.

## Hotfixes

`EOS_3_PILOT_HOTFIX_COUNT=0`  
`EOS_3_PILOT_FIX_GOVERNANCE=PASS`  
`EOS_3_PILOT_FEATURE_SCOPE_FROZEN=YES` — assurance data + documentation only; no product capability expansion.
