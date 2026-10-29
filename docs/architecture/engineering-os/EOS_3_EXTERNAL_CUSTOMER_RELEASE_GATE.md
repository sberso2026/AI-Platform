# EOS 3 External Customer Release Gate

`PHASE=EOS-3-EXTERNAL-CUSTOMER-RELEASE-GATE`

## Purpose

Assess whether bounded EOS 3.0 GA is ready for **controlled** external customer release.  
Does **not** onboard customers, remove hold, enable public signup, or mutate frozen GA baseline.

Core: `TECHNICAL_GA != EXTERNAL_CUSTOMER_RELEASE`

## Baseline verified

| Item | Value |
|------|-------|
| Version / status / activation | `3.0.0` / `GENERAL_AVAILABILITY` / `ACTIVE_CONTROLLED_GA` |
| Maintenance / program | `ACTIVE` / `CLOSED` |
| Ledger | `170` |
| Tag | `engineering-os-v3.0.0` |
| Baseline / evidence / closeout FPs | verified match |
| Hold / authorized / public signup | ACTIVE / NO / NO |
| Production enrollments | 1 internal; 0 unapproved; leak 0; migration jobs 0 |

`EOS_3_EXTERNAL_RELEASE_BASELINE_VERIFIED=YES`  
`EOS_3_0_GA_BASELINE_MUTATION_ALLOWED=NO`  
`EOS_3_EXTERNAL_CUSTOMER_BOUNDARY_VERIFIED=PASS`

## Initial release model (definition only)

| Field | Value |
|-------|-------|
| Mode | `CONTROLLED_EXTERNAL_CUSTOMER_RELEASE` |
| Class | `DESIGN_PARTNER` |
| Target count | `1` |
| Access | entitlement + enrollment / DENY |
| Activation this gate | **NO** |
| New entitlements/enrollments | **0** |
| External customer count | **0** |
| Human GO | `NOT_ISSUED` |

## Defect / risk dispositions (external)

| ID | Review | Disposition |
|----|--------|-------------|
| D001 | PASS | `ACCEPTABLE_WITH_CONTROL` (NOT_SUPPORTED + disabled) |
| D002 | PASS | `ACCEPTABLE_WITH_CONTROL` |
| D003 | PASS | `ACCEPTABLE_WITH_CONTROL` (no formal SLO; disclose best-effort) |
| D004 | PASS | `ACCEPTABLE_WITH_CONTROL` (GHSA controlled invite-only) |
| Defect gate | PASS | Critical=0 High=0 |

## Backup / recovery for external

WAL-G yes; PITR `NO`. For initial invite-only design partner:  
`EOS_3_EXTERNAL_CUSTOMER_PITR_REQUIREMENT=ACCEPTED_WITH_CONTRACTUAL_LIMITATION`  
Justification: cohort size 1; contractual recovery limitation disclosed; restore procedure documented; broader public/commercial scale should reopen PITR track.

`EOS_3_EXTERNAL_CUSTOMER_BACKUP_RECOVERY_REVIEW=PASS_WITH_LIMITATIONS`

## Readiness / decision

| Field | Value |
|-------|-------|
| Technical readiness | `READY_WITH_LIMITATIONS` |
| Legal/commercial status | `INCOMPLETE` |
| Release decision | `TECHNICALLY_READY_PENDING_LEGAL_COMMERCIAL_AND_HUMAN_GO` |
| Hold remains | ACTIVE |
| Recommended next | `EOS-3-EXTERNAL-CUSTOMER-LEGAL-COMMERCIAL-READINESS` |

## Security gate (docs + existing GA evidence)

Baseline regression PASS; migration guard PASS; AI/LLM/connector boundaries PASS; leak 0; secret scan / dependency audit `NOT_EXECUTED_DOCS_ONLY` (no runtime change); no new blocking issue; release governance PASS.
