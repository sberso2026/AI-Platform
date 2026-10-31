# E2E Performance Validation

Comparable warm-route method: `unauth_GET_*_post_settle_n15_gap200ms` (n=15).

| Route | P95 (ms) |
| --- | ---: |
| Home | 343 |
| My Work | 226 |
| Work Package | 324 |
| Engineering Design | 293 |

Interaction journey P95 = **1665 ms**  
Method: `unauth_GET_my_wp_ed_my_n10`  
Includes: My Work → WP work-packages → Engineering Design → return My Work.

Home deep engineering query count = 0. No new blocking waterfall.
Prior UX-5 baselines: Home 445 / My Work 218 / WP 212 / ED 244 — Validation-1 adds no UI request chains.
