# Asset Intelligence V1.0 — Performance Baseline

- Module: `asset_intelligence` 1.0.0
- Verified by Phase 10K gate **AD**-adjacent documentation checks

## Scope and honesty statement

This is a **baseline**, not a performance guarantee. No latency SLO, no
throughput SLA and no capacity number is **not claimed** as a contractual
commitment for V1.0. What follows describes the shape of the work so operators
can size an environment and spot a regression.

## Cost model per operation

Every governed assessment is one transactional unit: read the current published
state, read the evidence it depends on, compute, write the new versioned state,
append a timeline entry, append an outbox event. There is no fan-out to an
external model provider, because V1.0 executes no predictive method.

| Surface | Dominant cost | Scales with |
| --- | --- | --- |
| Condition | Inspection evidence read | Evidence items per asset |
| Criticality | Single-state read/write | Constant |
| Reliability | Failure history read | Failure records per asset |
| Failure | Taxonomy lookup + state write | Taxonomy size (bounded, in-memory) |
| Time series ingest | Bulk insert | Points per batch |
| Change detection / trend | Windowed scan of time series | Points in window |
| Degradation | Trend + confidence composition | Points in window |
| Lifecycle | Reference read + state write | Constant |
| Decision context | Composition of published states | Number of contributing surfaces (bounded) |
| Risk / maintenance / priority | Composition of published states | Constant per asset |
| Fusion | Multi-source reconciliation | Number of registered sources |
| Predictive governance | Registry lookups + state write | Constant |
| Snapshot | Parallel reads across surfaces | Number of surfaces (bounded at 17) |

All of these are bounded-work operations. None iterates over the tenant's whole
asset population, and none performs an unbounded join.

## Known scaling characteristics

- **Time series is the only unbounded input.** Ingestion cost is linear in points
  per batch; change detection and trend are linear in points inside the analysis
  window, not in total history.
- **Snapshot is fan-out read.** It reads the latest published state per surface.
  Cost grows with the number of GA surfaces, which is frozen at V1.0.
- **Timeline is append-only.** Reads are indexed by asset and time; the timeline
  grows monotonically and should be treated as an archival concern, not a
  latency concern.
- **Outbox drains asynchronously.** Producer latency is independent of consumer
  lag.

## Reporting fields

Every certification artifact records `unexpected5xx` and
`requiredTestsSkipped`. A performance regression that manifests as timeouts will
surface as `unexpected5xx > 0` in the hosted gates.

## What is deliberately not measured

Predictive method execution time is not measured because no method executes.
Model inference cost is not measured because there is no inference. Any
published figure claiming either is not from this module.

## Regression detection

Compare against the previous certified run rather than against an absolute
number. A meaningful regression is a change in the *shape* of the cost model —
for example a surface that previously performed constant work beginning to scale
with asset count. That is an architectural defect, and it is what this baseline
exists to catch.
