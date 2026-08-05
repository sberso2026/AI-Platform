# Project Intelligence Meeting Intelligence — Production Baseline (Phase 8D)

**Target:** hosted staging  
**Scope:** fixture-scale — not an enterprise capacity claim

## Fixture assumptions

| Dimension | Baseline |
|-----------|----------|
| Concurrent sessions | 1–4 |
| Transcript segments per session | ≤ hundreds (fixture) |
| Providers under test | manual (+ Teams fixture in dedicated jobs) |
| Teams live | out of scope for production readiness |

## Observed fixture-scale expectations

| Metric | Expectation |
|--------|-------------|
| Session creation | Sub-second API accept |
| Segment persistence | Persist-before-broadcast; typically &lt; 1s |
| Reconnect / replay | Resume cursor; bounded backoff |
| Processing enqueue | Transactional; typically &lt; 2s |
| Worker claim | SKIP LOCKED multi-worker exclusion |
| Minutes / proposals | Provider-bound; human review required |
| Core conversion | Idempotent after approve |
| Provider health | Manual always; Teams live not production-ready |

Exact p50/p95 recorded in certification artifacts when hosted gates execute.

## Known scaling boundaries

- Fixture corpus ≪ production meeting volume  
- Provider rate limits dominate when Teams Graph is enabled  
- Live Teams remains conditionally_deferred
