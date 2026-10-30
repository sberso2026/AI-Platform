# EOS-3 Impact State Semantics

`EOS_IMPACT_STATE_SEMANTICS=PASS`  
`EOS_DEPENDENCY_NOT_EQUAL_INVALIDITY=PASS`

| State | Meaning |
| --- | --- |
| CURRENT | No known upstream change requiring attention |
| CHANGE_DETECTED | Directly relevant upstream object changed |
| POTENTIALLY_AFFECTED | Explicit dependency path; consequence undetermined |
| REVIEW_RECOMMENDED | Change may matter; review determines consequence |
| REVIEW_REQUIRED | Materiality/dependency rules require review |
| REASSESSMENT_REQUIRED | Decision relied on material changed information |
| STALE | Object no longer reflects current upstream state |
| INVALIDATED | Strong governed evidence premise no longer valid (not a generic warning) |
| RESOLVED_NO_CHANGE | Authorized no-change conclusion |
| RESOLVED_REVISED | Closed after revised engineering under human authority |

Automatic calculation invalidation / decision reversal / deliverable withdrawal / engineering approval: **NO**.
