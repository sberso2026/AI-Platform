# Asset Intelligence — Reliability Model

## Separation

Reliability is distinct from condition and criticality.

## Assessment types

- **qualitative** — class/label only; never represented as a probability
- **semi_quantitative** — ordered scores with explicit limitations
- **quantitative** — numeric metrics only when data prerequisites are satisfied

## Reserved metrics (calculate only when sufficient)

availability, MTBF, MTTR, failure rate, successful-operation probability, observed continuity, failure frequency

Each metric declares method, units, timeWindow, dataSufficiency, confidence, assumptions, limitations, provenance.

If insufficient: `status = unavailable` — do not invent values.

## Claims

- `quantitativeReliabilityCertified = false` unless dedicated fixture gates prove deterministic calculations
- Even then: no general predictive accuracy claim
- `probabilityOfFailureCertified = false`
- `rulClaimsCertified = false`
