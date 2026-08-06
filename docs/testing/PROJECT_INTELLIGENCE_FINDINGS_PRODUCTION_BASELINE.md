# Project Intelligence Findings Intelligence — Production Baseline (Phase 8E)

**Target:** hosted staging  
**Scope:** fixture-scale — not an enterprise capacity claim

## Fixture assumptions

| Dimension | Baseline |
|-----------|----------|
| Candidate intake sources | document + meeting + manual |
| Concurrent review sessions | 1–4 |
| Findings per fixture workspace | ≤ hundreds |
| Teams live | out of scope |

## Observed fixture-scale expectations

| Metric | Expectation |
|--------|-------------|
| Candidate intake | Sub-second domain accept |
| Duplicate detection | Deterministic thresholds; human merge |
| Evidence loading | Citations required for AI findings |
| Review queue load | Fixture list; typically &lt; 2s |
| Lifecycle transition | Server-enforced; typically &lt; 1s |
| Conversion proposal | Human-gated; no auto Core write |
| Pattern analysis | Minimum evidence threshold; abstention |
| Dashboard / handoff queries | Fixture-scale aggregation |

Exact p50/p95 recorded in certification artifacts when hosted gates execute.

## Known scaling boundaries

- Fixture corpus ≪ production finding volume  
- Pattern analysis must not claim unsupported causation  
- Broad Reporting Intelligence authoring is out of Phase 8E scope  
