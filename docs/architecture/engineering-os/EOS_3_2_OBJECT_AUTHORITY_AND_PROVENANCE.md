# EOS 3.2 Object Authority and Provenance

`EOS_3_OBJECT_AUTHORITY_MODEL=PASS`

`EOS_3_AI_AUTHORITY_BOUNDARY=PASS`

`EOS_3_OBJECT_PROVENANCE_COVERAGE=PASS`

`EOS_3_SOURCE_OWNERSHIP_COVERAGE=PASS`

`EOS_3_OBJECT_EVENT_INTEGRATION=PASS`

`EOS_3_OBJECT_LIFECYCLE_COMPATIBILITY=PASS`

`EOS_3_OBJECT_JURISDICTION_COMPATIBILITY=PASS`

## Authority boundaries

| Concern | Rule |
| --- | --- |
| Interface | Source owns source state; receiver owns acceptance; AI cannot accept |
| Change materiality | AI may propose; human finalizes |
| Decision | AI may compare options; cannot be recorded as decision-maker |
| Review | AI may assist preparation; cannot impersonate reviewer |
| Deliverable | AI cannot approve/release |
| Baseline freeze | Human authority role required |
| IFC release | AI denied |

## Provenance

All new/extended EOS 3 objects use EOS 3.1 universal provenance (`buildEos3Provenance`). Engineering objects require `sourceOwnerId`.

## Events

Bounded envelopes for `OBJECT_CREATED`, `REVISION_CREATED`, `DECISION_RECORDED`, `BASELINE_FROZEN`, etc. Events do not bypass authorization and do not autogenerate cascades.

## Lifecycle / jurisdiction

Objects carry `lifecycleState` + optional `lifecycleProfileKey` and `jurisdictionProfileRef` without hard-coding a global stage vocabulary or embedding standards text.
