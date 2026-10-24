# Asset Intelligence — Engineering Time Series, Trend Intelligence
# and Governed Degradation Analysis (Phase 10F)

## Purpose

Phase 10F introduces three foundational capabilities:

1. **Engineering Time Series** — governed representation of ordered engineering observations over time
2. **Change Detection Engine** — bounded, non-ML detection of supported change signals
3. **Trend Confidence** — evidence sufficiency and confidence for trend conclusions

These support **Governed Degradation Analysis** (advisory until reviewed/published).

## Concept separation (locked)

| Concept | Answers |
|---------|---------|
| Failure Intelligence (10E) | What failure mode/mechanism is supported by evidence? |
| Engineering Time Series | What ordered observations exist for a measurable attribute? |
| Change Detection | Where do supported change points or regime shifts appear? |
| Trend Intelligence | What direction/shape of change is supported over a window? |
| Degradation Analysis | How is deterioration progressing (qualitative / semi-quantitative)? |
| Future RUL / predictive ML | What remaining life or forecast is claimed? (**out of scope**) |

Do **not** collapse these concepts.

## Engineering Time Series

A time series is intelligence **about** a canonical asset attribute — not a sensor registry and not SHM runtime.

Required fields (logical):

- seriesId, tenantId, workspaceId, assetId
- attributeKey (e.g. wall_thickness, vibration_rms, crack_length)
- unit, orientation (increasing_worse | decreasing_worse | neutral)
- points: [{ observedAt, value, quality?, evidenceRef? }]
- samplingHint, windowStart, windowEnd
- sourceRefs, provenance, taxonomy/context refs
- status: draft | ingested | reviewed | superseded

Rules:

- Points are immutable once accepted into a published series version
- New observations → new series version or append under governed ingest
- No raw evidence duplication from Inspection Intelligence private stores
- SHM / twin streams remain reserved sources until activated

## Change Detection Engine

Responsibilities:

- evaluate a bounded Engineering Time Series window
- emit change candidates: step_change | slope_change | level_shift | volatility_increase | insufficient_data
- require Trend Confidence / Evidence Confidence inputs
- abstain when points are insufficient, conflicting, stale, or revoked
- never fabricate probability of failure or RUL from a change point

Method class for Phase 10F: **rule-based / statistical heuristic only**  
Forbidden: predictive ML models, neural forecasts, certified PoF.

## Trend Confidence

Evaluate:

- point count / window coverage
- freshness
- source diversity
- measurement quality flags
- conflict / superseded points
- calibration where applicable
- lineage integrity

Outcomes: sufficient | limited | insufficient | conflicting | stale | revoked

Insufficient / conflicting / stale / revoked → **abstain** from governed trend/degradation conclusions.

## Trend Intelligence

Produces advisory trend states:

- trendDirection: improving | stable | degrading | indeterminate
- trendClass: qualitative (required) | semi_quantitative (optional, uncertified)
- slopeHint (optional; not certified rate prediction)
- window, method, confidence, evidence refs
- reviewStatus

## Governed Degradation Analysis

Produces advisory degradation states that may reference:

- time series refs
- change detection refs
- trend state refs
- published failure mode/mechanism context (optional; never auto-derived solely from failure presence)

Degradation answers progression of deterioration — not failure mode identity.

Root claims:

- no predictive ML
- no certified RUL
- no PoF from trend alone
- AI may suggest; may not publish

## Health composition boundary

Do not mutate:

- compose_condition_criticality_v1
- compose_condition_reliability_v2

Reserved failure contribution method remains disabled unless separately certified.

Degradation contribution to Health Index remains **disabled** in Phase 10F unless a new composition version is explicitly introduced and evidence-justified. Prefer disabled.

## Version

`0.6.0-timeseries`
