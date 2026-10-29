# EOS 3.0 Final GA Defect Register (Frozen)

`EOS_3_GA_DEFECT_REGISTER_FROZEN=YES`  
`PHASE=EOS-3.14-GA-POST-ACTIVATION-ASSURANCE-AND-PROGRAM-CLOSEOUT`

| Severity | Unresolved at closeout |
|----------|------------------------|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |

## Medium (OPEN_ACCEPTED_FOR_GA)

### D001 — Live LLM not validated

Status: `OPEN_ACCEPTED_FOR_GA`  
Control: claimed `NOT_SUPPORTED`; Production path `DISABLED_NOT_VALIDATED`; policy deny.  
`EOS_3_D001_CONTROL_ASSURANCE=PASS`

### D002 — Real third-party connectors not executed

Status: `OPEN_ACCEPTED_FOR_GA`  
Control: claimed `NOT_SUPPORTED`; connectors disabled; synthetic-only solver claim.  
`EOS_3_D002_CONTROL_ASSURANCE=PASS`

## Low (OPEN_ACCEPTED)

| ID | Disposition |
|----|-------------|
| D003 No formal GA SLO | OPEN_ACCEPTED — limitations register |
| D004 GHSA-w5hq-g745-h8pq | OPEN_ACCEPTED — ACCEPTED_BOUNDED_RISK |

## Closeout rule

Program closeout requires Critical=0 and High=0 — satisfied. Medium/Low remain accepted under documented controls and do not reopen the EOS 3.0 baseline.
