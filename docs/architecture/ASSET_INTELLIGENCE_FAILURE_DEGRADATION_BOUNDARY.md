# Asset Intelligence — Failure / Time Series / Degradation / RUL Boundaries

## Failure Intelligence (Phase 10E)

Answers: **what failure mode/mechanism exists or is supported by evidence?**

## Engineering Time Series + Trend Intelligence (Phase 10F)

Answers:

- what ordered observations exist?
- what change signals are supported?
- what trend direction/shape is supported over a window?

## Governed Degradation Analysis (Phase 10F)

Answers: **how is deterioration progressing over time (advisory)?**

## Future RUL / Predictive (out of scope)

Answers: remaining useful life / forecast claims — **not certified in 10F**.

## Locked boundaries

- Failure presence must not silently become a degradation trend
- Change detection is not predictive ML
- Trend slope hints are not certified rate predictions
- Degradation analysis is not RUL
- Observed condition ≠ trend ≠ degradation ≠ RUL ≠ certified PoF
- HealthCompositionEngine may only consume reviewed/published states, and only via an explicit composition version when contribution is enabled
- Phase 10F prefers degradation/trend health contribution **disabled**
- `probabilityOfFailureCertified = false`
- `rulClaimsCertified = false`
- `accuracyClaimsCertified = false`
