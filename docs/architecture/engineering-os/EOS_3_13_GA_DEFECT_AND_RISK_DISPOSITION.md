# EOS 3.13 GA Defect and Risk Disposition

`EOS_3_GA_DEFECT_GATE=PASS`

| Severity | Unresolved |
|----------|------------|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |

## Medium

### D001 — Live LLM not validated

`EOS_3_D001_GA_REVIEW=PASS`  
`EOS_3_D001_GA_STATUS=OPEN_ACCEPTED_FOR_GA`

Control: capability claimed `NOT_SUPPORTED`; Production path remains `DISABLED_NOT_VALIDATED`; feature flag / policy deny. Does not affect a `SUPPORTED` claim.

### D002 — Real third-party connectors not executed

`EOS_3_D002_GA_REVIEW=PASS`  
`EOS_3_D002_GA_STATUS=OPEN_ACCEPTED_FOR_GA`

Control: capability claimed `NOT_SUPPORTED`; connectors disabled; synthetic-only solver claim. Does not affect a `SUPPORTED` claim.

`EOS_3_MEDIUM_DEFECT_GA_ACCEPTANCE=PASS`

## Low

`EOS_3_LOW_DEFECT_GA_REVIEW_COMPLETE=YES`

| ID | GA disposition |
|----|----------------|
| D003 No formal GA SLO | OPEN_ACCEPTED — limitation #10 |
| D004 GHSA-w5hq-g745-h8pq | OPEN_ACCEPTED — see dependency risk |

## Dependency risk acceptance (frozen)

`EOS_3_GA_DEPENDENCY_RISK_ACCEPTANCE=PASS`  
`GHSA_W5HQ_G745_H8PQ_STATUS=ACCEPTED_BOUNDED_RISK`

| Field | Value |
|-------|-------|
| Advisory | GHSA-w5hq-g745-h8pq |
| Disposition | ACCEPTED_BOUNDED_RISK |
| Exploitability | Bounded per prior EOS 2/3 canonical gate assessment |
| Mitigations | Dependency audit gate; no new High/Critical blockers |
| Owner | EOS 3 release owner (post human GA GO) |
| Review trigger | Dependency upgrade / new advisory / exploitability change |
| Expiry/reassessment | Next security regression or package bump |

## PITR risk acceptance

`EOS_3_PITR_ENABLED=NO`  
`EOS_3_PITR_GA_RISK_ACCEPTED=YES`

| Field | Value |
|-------|-------|
| Backup | WAL-G physical backups (latest known COMPLETED id 2097755872) |
| Restore path | WAL-G restore + logical snapshot recovery; no PITR point-in-time |
| Operational risk | Recovery granularity limited to backup/snapshot points |
| Owner | Founder / platform operations |
| Limitation | Registered in GA limitations #9 |
