# EOS 2.19 Performance and Reliability Baseline

`PRODUCTION_PERFORMANCE_BASELINE_ESTABLISHED=YES`

`PRODUCTION_PERFORMANCE_STATUS=DEGRADED_NONBLOCKING`

`PRODUCTION_RELIABILITY_SOAK=PASS`

No formal SLO is claimed.

## Unauthenticated edge samples (n=5 each, curl -L)

| Surface | Median (s) | P95/max sample (s) | Errors |
| --- | --- | --- | --- |
| Login | 0.235 | 0.344 | 0 |
| Engineering landing (redirect/login chain) | 0.338 | 0.820 | 0 |
| Engineering Basis | 0.282 | 0.517 | 0 |
| Structural | 0.304 | 0.315 | 0 |
| Interface | 0.289 | 0.300 | 0 |
| Change-impact | 0.293 | 0.307 | 0 |
| Design-freeze | 0.294 | 0.315 | 0 |

Timeouts: 0. These are public edge/login-redirect timings, not authenticated interactive work.

## Authenticated interactive reference (EOS 2.18 + this phase)

Prior authenticated Production session observations remain the interactive baseline: page settle roughly 3–5 s; representative write ~3.7 s; representative GET ~5 s; Ask abstention ~5 s class. No formal SLO. Classification remains DEGRADED_NONBLOCKING for pilot use.

Obvious N+1 remediation was not performed without authenticated profiling evidence in this phase beyond the counter/hydration correctness fixes.

## Reliability soak

| Metric | Value |
| --- | --- |
| `RELIABILITY_OPERATION_COUNT` | 28 |
| `RELIABILITY_FAILURE_COUNT` | 0 |

Operations counted across this phase and carried EOS 2.18 Production pilot evidence: login/logout cycle, project/EOS1 navigation, Engineering Basis read/revise/reload, discipline/interface/change/deliverable/freeze reads, pilot-workflow retry protection, Ask retrieval abstention, refresh, unauthorized probes, staging/production smoke GETs, canonical gate packs. No lost writes and no duplicate governed records observed on exercised paths.
