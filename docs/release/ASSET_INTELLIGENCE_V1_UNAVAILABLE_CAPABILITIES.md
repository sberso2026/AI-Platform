# Asset Intelligence V1.0 — Unavailable Capabilities

Machine-readable source:
`packages/asset-intelligence/src/domain/unavailable-capabilities.ts`
(`ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES`).

Each row below is backed by a flag in `packages/asset-intelligence/src/version.ts`.
The flag is the control; this document is the explanation. Phase 10K gates fail
the release if any boolean-governed row is not `false`.

## UNAVAILABLE — not production functions of V1.0

| Capability | Governing flag | Value | User-facing label |
| --- | --- | --- | --- |
| Predictive execution | `PRODUCTION_PREDICTIVE_EXECUTION_ENABLED` | `false` | UNAVAILABLE — not a production function of V1.0 |
| Probability of Failure (PoF) | `PROBABILITY_OF_FAILURE_CERTIFIED` | `false` | UNAVAILABLE — not a production function of V1.0 |
| Remaining Useful Life (RUL) | `RUL_CLAIMS_CERTIFIED` | `false` | UNAVAILABLE — not a production function of V1.0 |
| Machine-learning predictive methods | `PREDICTIVE_ML_ENABLED` | `false` | UNAVAILABLE — suspended from execution in V1.0 |
| Certified predictive methods | `PREDICTIVE_METHODS_CERTIFIED` | `false` | UNAVAILABLE — no method is certified in V1.0 |
| Accuracy claims | `ACCURACY_CLAIMS_CERTIFIED` | `false` | UNAVAILABLE — no accuracy claim is certified in V1.0 |
| Predictive contribution to Asset Health | `PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED` | `false` | UNAVAILABLE — health is composed from condition evidence only |
| Automatic canonical Risk mutation | `RISK_CORE_AUTO_MUTATION_ALLOWED` | `false` | UNAVAILABLE — risk signals are advisory |
| CMMS work order execution | `CMMS_WORK_ORDER_OWNERSHIP` | `none_in_asset_intelligence` | UNAVAILABLE — recommendations only, no work orders |
| Digital Twin | — | no ownership | UNAVAILABLE — no Digital Twin ownership in V1.0 |

## RESERVED — modelled, deliberately not implemented

| Capability | Governing flag | Value | User-facing label |
| --- | --- | --- | --- |
| Quantitative reliability (MTBF, failure rate) | `QUANTITATIVE_RELIABILITY_CERTIFIED` | `false` | RESERVED — qualitative reliability only in V1.0 |
| Source trust model | `SOURCE_TRUST_MODEL_READY` | `false` | RESERVED — modelled but not implemented in V1.0 |

## What "predictive governance is GA" actually means

Asset Intelligence V1.0 ships a complete predictive **governance** framework:

- a registry of predictive objectives, each marked `certified: false`
- objective-specific readiness assessment
- a registry of predictive methods across deterministic, statistical,
  physics-based, hybrid and machine-learning classes
- method eligibility evaluation with explicit abstention reasons
- predictive method candidates that carry `containsPredictionOutput: false`
- fixture-bounded qualification where `qualificationGrantsExecution` is false
- a governed review workflow where `grantsProductionExecution` is false

The framework decides *whether a method could ever be trusted for an objective*.
It never runs one. Readiness is not permission to predict, and qualification is
not certified accuracy.

## Why PoF and RUL are unavailable rather than "coming soon"

PoF and RUL are registered objectives that are permanently not-ready in V1.0.
Making them available requires method certification with validated acceptance
criteria — an engineering assurance activity, not a feature flag. Nothing in the
V1.0 codebase can be configured to produce a PoF or RUL value.

## Health index boundary

The Asset Health Index is composed from condition evidence only. The following
all carry `healthContribution: false` and a `false` contribution flag:
criticality, failure, degradation, lifecycle, risk, priority, fusion, predictive
governance. Batch_59 enforces `CHECK (is_health_factor = false)` at the
database level.

## Enforcement points

| Layer | Enforcement |
| --- | --- |
| `version.ts` | Boolean locks, single source of truth |
| Domain | `assertUnavailableCapabilitiesClosed()`, `assertNoCertifiedMethods()` |
| Registries | `maturity: "unavailable"` with `implementationRef: null` |
| HTTP | Routes echo `containsPredictionOutput: false` and the governance locks |
| Database | `CHECK` constraints in batch_59 |
| UI | Predictive execution, PoF and RUL rendered as UNAVAILABLE |
| CI | Phase 10K gates AK–AN and BD |
