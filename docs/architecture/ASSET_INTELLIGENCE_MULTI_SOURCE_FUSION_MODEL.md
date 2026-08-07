# Asset Intelligence — Multi-Source Fusion & Predictive Readiness (Phase 10I)

## Purpose

Phase 10I establishes **governed multi-source intelligence fusion** and
**source reconciliation**, then assesses whether evidence is sufficient for any
**future** predictive methods.

Phase 10I does **not** execute predictive ML.
It does **not** certify Probability of Failure or RUL.

## Distinct concepts (locked)

| Concept | Role in 10I |
|---------|-------------|
| Published intelligence slices | Fusion inputs (published/approved only) |
| Multi-Source Fusion State | Governed composition of contributing sources |
| Source Reconciliation | Conflict detection and resolution records |
| Predictive Readiness | Readiness assessment only — no prediction execution |
| Health / Criticality / Risk / Priority / Lifecycle | Remain semantically separate |

Do **not** collapse sources into one opaque score.

## Allowed sources (governed)

- Asset Intelligence published slices (condition, reliability, criticality context,
  failure, trend, degradation, lifecycle, decision context, risk, maintenance
  recommendation, priority)
- Inspection Intelligence public contracts `1.0.0` only
- Project Intelligence approved shared/public contracts only

Forbidden in 10I:
- private II SQL / repositories / services
- private PI coupling
- raw SHM / IoT streams as production fusion authority
- CMMS execution records as ownership

## Engines

1. `MultiSourceFusionEngine` — compose `AssetFusionState`
2. `SourceReconciliationEngine` — produce `SourceReconciliationRecord`
3. `PredictiveReadinessAssessor` — produce `PredictiveReadinessState`

None may:
- run predictive ML
- emit certified PoF / RUL
- alter Health Index
- mutate canonical lifecycle
- auto-create Core Risk
- create work orders
- publish autonomously

## Published-slice rule

Only slices whose `reviewStatus` is `published` or `approved` may contribute to a
fusion state. Draft, in-review, rejected, superseded, and abstained slices are
recorded as `excluded` with a `not_published:<status>` note and never influence
the fusion class. Inspection Intelligence contributions are additionally
restricted to public contract `1.0.0`; any other contract version is excluded
with `ii_contract_must_be_1.0.0`.

## Autonomous resolution forbidden

`SourceReconciliationEngine` detects and records conflicts; it never resolves
them. Every conflict is written as a `SourceReconciliationRecord` entry carrying
`autonomousResolutionForbidden: true` and an outcome that defers to people
(`require_human_review` or `abstain_conflict`). No engine, job, or AI actor may
pick a winning source, merge conflicting states, or publish a reconciliation
outcome without a governed human review.

## Predictive readiness outcomes

`sufficient` | `limited` | `insufficient` | `conflicting` | `not_ready`

`not_ready` / `insufficient` / `conflicting` ⇒ predictive methods remain disabled.

## Health boundary

### Fusion vs Health

Fusion / reconciliation / readiness are **not** Health factors.
`FUSION_HEALTH_CONTRIBUTION_ENABLED = false` and every fusion and readiness state
carries `isHealthFactor: false`. Health composition methods remain unchanged from
Phase 10H (`compose_condition_reliability_v2`); Phase 10I adds no new Health
inputs, weights, or methods.

### Predictive boundary

`PREDICTIVE_ML_ENABLED = false` and `PREDICTIVE_METHODS_CERTIFIED = false` for the
whole of Phase 10I. Readiness describes *whether evidence could one day support*
predictive methods; it never runs them, and it never emits a certified
Probability of Failure or Remaining Useful Life claim.

## Version

`0.9.0-fusion-readiness`
