# EOS 3.11 Production Pilot Defect Disposition

## Counts (unchanged from EOS 3.10)

- Critical: 0
- High: 0
- Medium: 2
- Low: 2

`EOS_3_PRODUCTION_PILOT_DEFECT_GATE=PASS`

`EOS_3_ALL_MEDIUM_DEFECTS_PILOT_SAFE=YES`

## Medium defect 1 — EOS3-10-D001

| Field | Value |
|-------|-------|
| Description | Live LLM production behavior not validated |
| Affected capability | live_llm / generative AI |
| Severity rationale | Unvalidated live model path could alter behavior/isolation if enabled |
| Pilot exposure | None if live LLM remains DISABLED_NOT_VALIDATED |
| Workaround/control | OPTION B: exclude live LLM; config must not invoke providers |
| Detection/monitoring | Pilot config audit; deny live provider endpoints; usage attribution zero |
| Owner | EOS 3 release owner (post-GO) |
| Exit criterion | Staging live LLM validation PASS then explicit scope change + new GO |
| Pilot-blocking | NO |

`EOS_3_MEDIUM_DEFECT_1_REVIEWED=YES`

## Medium defect 2 — EOS3-10-D002

| Field | Value |
|-------|-------|
| Description | Real third-party connectors not executed |
| Affected capability | real_third_party_connectors |
| Severity rationale | Synthetic adapter evidence must not be over-claimed as real connector support |
| Pilot exposure | None if real connectors remain DISABLED |
| Workaround/control | Exclude real connectors; synthetic solver only; SPACE GASS not execution-certified |
| Detection/monitoring | Connector enablement audit; claim matrix freeze |
| Owner | EOS 3 release owner (post-GO) |
| Exit criterion | Named connector staging validation + claim matrix update + GO |
| Pilot-blocking | NO |

`EOS_3_MEDIUM_DEFECT_2_REVIEWED=YES`

## Low defects

| ID | Title | Disposition |
|----|-------|-------------|
| EOS3-10-D003 | No formal GA performance SLO | ACCEPTED_BOUNDED — pilot operational thresholds defined |
| EOS3-10-D004 | GHSA-w5hq-g745-h8pq | ACCEPTED_BOUNDED — PASS_WITH_KNOWN_MODERATE |

`EOS_3_LOW_DEFECTS_REVIEWED=YES`
