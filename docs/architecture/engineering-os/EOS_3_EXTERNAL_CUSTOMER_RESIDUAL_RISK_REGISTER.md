# EOS 3 External Customer Residual Risk Register

`EOS_3_EXTERNAL_RESIDUAL_RISK_REGISTER_COMPLETE=YES`  
`EOS_3_UNOWNED_RESIDUAL_RISK_COUNT=0`  
`EOS_3_EXTERNAL_RESIDUAL_ITEM_OWNER_COVERAGE=100_PERCENT`

| Risk ID | Linked item | Description | Residual risk | Owner | Control / path | Status |
|---------|-------------|-------------|---------------|-------|----------------|--------|
| RR-001 | RG-001 | Activation without accepted contract | Medium | Silvestre Berso | Hold ACTIVE; no entitlement until GO | OPEN |
| RR-002 | RG-002 | Unclear commercial terms | Low–Medium | Silvestre Berso | Human-gated entitlement | OPEN |
| RR-003 | RG-003 | Unconfirmed insurance | Medium | Silvestre Berso | No coverage claimed; confirmation required | OPEN |
| RR-004 | RG-004 | Non-standard terms without escalation | Conditional | Silvestre Berso | Risk-based path APPROVED; apply per customer | MITIGATED_PATH |
| RR-005 | RG-005 | Cohort expansion without approval | Medium | Silvestre Berso | Cohort=1 invite-only defined; approval pending | OPEN |
| RR-006a | RG-006 | PITR unavailable | Medium | Silvestre Berso | WAL-G + restore procedure; formal acceptance pending | OPEN |
| RR-006b | RG-006 | GHSA-w5hq-g745-h8pq | Low–Moderate | Silvestre Berso | Dependency audit; controlled invite; formal acceptance pending | OPEN |
| RR-007 | RG-007 | Ambiguous release authority | High if bypassed | Silvestre Berso | Hold ACTIVE; designation required | OPEN |
| RR-008 | RG-008 | Unauthorized release without GO | Critical if bypassed | Designated authority (TBD) | Hold ACTIVE; GO NOT_ISSUED | OPEN |

No implementation defects. All residual risks are governance-owned.
