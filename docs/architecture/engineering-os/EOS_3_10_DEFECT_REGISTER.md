# EOS 3.10 Integrated Defect Register

`EOS_3_UNRESOLVED_CRITICAL_DEFECT_COUNT=0`

`EOS_3_UNRESOLVED_HIGH_DEFECT_COUNT=0`

`EOS_3_UNRESOLVED_MEDIUM_DEFECT_COUNT=2`

`EOS_3_UNRESOLVED_LOW_DEFECT_COUNT=2`

| ID | Severity | Title | Status | Notes |
|----|----------|-------|--------|-------|
| EOS3-10-D001 | MEDIUM | Live LLM production behavior not validated | ACCEPTED_BOUNDED | AI claim SUPPORTED_WITH_LIMITATIONS; authority denials intact |
| EOS3-10-D002 | MEDIUM | Real third-party connectors not executed | ACCEPTED_BOUNDED | REAL_CONNECTOR_VALIDATION_STATUS=NOT_EXECUTED |
| EOS3-10-D003 | LOW | No formal GA performance SLO for EOS 3 | ACCEPTED_BOUNDED | Staging baselines; READY_WITH_LIMITATIONS |
| EOS3-10-D004 | LOW | GHSA-w5hq-g745-h8pq moderate advisory | ACCEPTED_BOUNDED | Canonical gates PASS_WITH_KNOWN_MODERATE |

No Critical or High defects remain unresolved.
