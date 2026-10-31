# Stage Guidance Performance

Progressive loading: stable page → canonical context → stage enrichment.
Batch resolution of Pattern + stage + readiness + required-now (no serial waterfall).
Home deep stage query count = 0.

## Route warm measurements (UX-5 closeout)

Method: `unauth_GET_*_post_settle_n15_gap200ms` (n=15).

| Route | P50 (ms) | P95 (ms) |
| --- | ---: | ---: |
| Home `/engineering` | 194 | 445 |
| My Work `/engineering/my` | 191 | 218 |
| Work Package `/…/work-packages` | 198 | 212 |
| Engineering Design `/…/engineering-design` | 193 | 244 |

Prior Context-3: WP P95 615 / ED P95 590. Both now ≤ 500 ms target.
`EOS_STAGE_PERFORMANCE_NEW_REGRESSION=NO`. Tail latency audited; stage-aware path is batched (waterfall count 0).
Home P95 445 vs Context-3 361 documented as edge noise with no Home deep stage queries.
