# Cockpit Performance Model

Progressive loading:

1. Stable page structure  
2. Canonical base context  
3. Attention / priority enrichment  
4. Dependencies / impact / discipline  

No full graph traversal on initial load. No Home deep cockpit queries.
Batch APIs for My Work. Route warm P50/P95 measured with documented method.

## Route warm measurements (Context-3 closeout)

Method: `unauth_GET_*_post_settle_n15_gap200ms` (sample count 15).

| Route | P50 (ms) | P95 (ms) |
| --- | ---: | ---: |
| Home `/engineering` | 180 | 361 |
| My Work `/engineering/my` | 173 | 232 |
| Work Package `/engineering/projects/PILOT-001/work-packages` | 179 | 615 |
| Engineering Design `/engineering/projects/PILOT-001/engineering-design` | 175 | 590 |

Prior Context-2 baselines: Home P95 334 / P50 189; My Work P95 454 / P50 178.
Home: P50 improved; P95 +27 ms within edge noise — `EOS_HOME_COCKPIT_REGRESSION=NO`.
My Work: both improved — `EOS_MY_WORK_COCKPIT_REGRESSION=NO`.
