# EOS 3 Post-GA Risk and Defect Backlog

`EOS_3_POST_GA_DEFECT_BACKLOG_IMPORTED=YES`  
`EOS_3_POST_GA_SECURITY_RISK_REGISTER_ACTIVE=YES`  
`EOS_3_PITR_ENHANCEMENT_BACKLOG_ITEM_CREATED=YES`  
`EOS_3_FORMAL_SLO_TRACK_DEFINED=YES`

Imported from frozen GA closeout. Do not close without evidence.

## Defect backlog

### D001 — Live LLM not validated

| Field | Value |
|-------|-------|
| Severity | Medium |
| Status | `OPEN_ACCEPTED_FOR_GA` |
| Affected capability | Live generative LLM / AI orchestration |
| GA control | Claimed `NOT_SUPPORTED`; Production `DISABLED_NOT_VALIDATED`; policy deny |
| Owner | EOS 3 release owner |
| Remediation trigger | Approved `EOS-3-LIVE-LLM-QUALIFICATION` track |
| Acceptance review | Next security regression, capability-track approval, or 2027-04-30 |
| Qualification impact if fixed | Requires new AI qualification evidence; does not inherit D1/GA claims |

### D002 — Real third-party connectors not executed

| Field | Value |
|-------|-------|
| Severity | Medium |
| Status | `OPEN_ACCEPTED_FOR_GA` |
| Affected capability | Real enterprise connectors / solver adapters |
| GA control | Claimed `NOT_SUPPORTED`; connectors disabled; synthetic-only |
| Owner | EOS 3 release owner |
| Remediation trigger | Approved `EOS-3-REAL-CONNECTOR-VALIDATION` (+ per-connector security) |
| Acceptance review | Next security regression, connector track approval, or 2027-04-30 |
| Qualification impact if fixed | Per-connector; availability ≠ solver qualification |

### D003 — No formal GA SLO

| Field | Value |
|-------|-------|
| Severity | Low |
| Status | `OPEN_ACCEPTED` |
| Affected capability | Reliability/performance claims |
| GA control | Limitation retained; no formal SLO claimed |
| Owner | Platform operations |
| Remediation trigger | `EOS-3-GA-SLO-MATURATION` using observed Production evidence |
| Acceptance review | After 90 days post-GA Production evidence or 2027-01-31 |
| Qualification impact if fixed | None expected if SLO is operational, not engineering-semantic |

### D004 — GHSA-w5hq-g745-h8pq

| Field | Value |
|-------|-------|
| Severity | Low (dependency moderate) |
| Status | `OPEN_ACCEPTED` / `ACCEPTED_BOUNDED_RISK` |
| Affected capability | Dependency surface (see security risk register) |
| GA control | Canonical dependency audit disposition |
| Owner | EOS 3 release owner |
| Remediation trigger | Package bump with clean audit or exploitability change |
| Acceptance review | Every dependency audit / package bump |
| Qualification impact if fixed | None if dependency-only |

## Security risk register

### GHSA-w5hq-g745-h8pq

| Field | Value |
|-------|-------|
| Status | `ACCEPTED_BOUNDED_RISK` |
| Package/path | Tracked via production dependency audit (canonical gate) |
| Exploitability | Bounded per prior EOS 2/3 canonical gate assessment |
| Current mitigation | Dependency audit gate; no new High/Critical blockers; known-moderate disposition |
| Owner | EOS 3 release owner |
| Review trigger | Dependency upgrade; new advisory; exploitability change |
| Expiry/reassessment | Next `SECURITY_RELEASE_REGRESSION_GATE` or package bump |

## Recovery enhancement backlog

### BL-REC-001 — PITR / recovery hardening

| Field | Value |
|-------|-------|
| Track | `EOS-3-PITR-AND-RECOVERY-HARDENING` |
| Current state | PITR `NO`; WAL-G physical backups + logical snapshots available |
| Representation rule | Do **not** claim PITR availability |
| Owner | Platform operations |
| Trigger | Customer recovery RPO requirement or external-customer readiness |
| State | `PROPOSED` |

## Formal SLO maturation track

### BL-SLO-001 — GA SLO maturation

| Field | Value |
|-------|-------|
| Track | `EOS-3-GA-SLO-MATURATION` |
| Current | `FORMAL_GA_SLO_DEFINED=NO` |
| Rule | Targets must derive from observed Production evidence, not arbitrary aspirational SLAs |
| State | `PROPOSED` |
