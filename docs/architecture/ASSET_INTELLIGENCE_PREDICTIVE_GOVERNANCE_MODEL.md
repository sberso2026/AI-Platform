# Asset Intelligence — Predictive Method Governance (Phase 10J)

## Purpose

Establish governance, qualification and certification **prerequisites** before
Asset Intelligence may execute predictive methods.

**Predictive readiness ≠ permission to predict.**  
**Method qualification ≠ certified predictive accuracy.**  
**Asset Intelligence V1 remains releasable without PoF/RUL/ML certification.**

Phase 10J does **not** enable production predictive execution by default.

## Terminology (locked)

| Term | Meaning |
|------|---------|
| Predictive Objective | Specific future quantity/event under consideration |
| Predictive Readiness | Evidence suitability for a **specific** objective |
| Predictive Method | Defined deterministic/statistical/physics/hybrid/ML methodology |
| Method Eligibility | Applicability given objective, data, assumptions |
| Method Qualification | Reproducible fixture-based acceptability within domain |
| Method Certification | Formal production approval for a bounded use case |
| Predictive Method Candidate | Proposal to evaluate/use a method — **not** a predicted value |
| Prediction | Actual future-state output from an executed method |
| Probability of Failure | Reserved objective — uncertified in 10J |
| Remaining Useful Life | Reserved objective — uncertified in 10J |

## Architecture

```
Published governed intelligence
        ↓
MultiSourceFusionEngine
        ↓
SourceReconciliationEngine
        ↓
PredictiveReadinessAssessor (objective-specific)
        ↓
PredictiveMethodEligibilityEngine
        ↓
PredictiveMethodCandidate
        ↓
Method Qualification Framework
        ↓
Governed Review
        ↓
Qualified Method State
```

No production prediction output by default.

## Objective-specific readiness

Readiness is assessed **per objective**, not as one global flag.

Example:
- condition_trend_projection = sufficient
- degradation_rate_estimation = limited
- probability_of_failure = not_ready
- remaining_useful_life = not_ready

## Method classes (equal governance)

deterministic | statistical | physics_based | hybrid | machine_learning

ML is **not** privileged over physics or statistical methods.

## Production execution policy

```
productionPredictiveExecutionEnabled = false
predictiveMlEnabled = false
predictiveMethodsCertified = false
probabilityOfFailureCertified = false
rulClaimsCertified = false
predictiveHealthContributionEnabled = false
containsPredictionOutput = false
autonomousExecutionForbidden = true
```

These are defaults for the whole of Phase 10J, not per-request options. Nothing
in the phase — not readiness, not eligibility, not a passed qualification, not
an approved review — flips any of them. Enabling production predictive
execution is a later, separately certified decision.

A governed approval therefore grants exactly what it says: the record is
accepted. It never grants execution (`grantsProductionExecution = false`) and
never grants certification (`grantsCertification = false`).

## Freshness policy

Evidence age is judged against a named, versioned policy
(`predictive_freshness_default_v1`) rather than an implicit rule, so that a
readiness verdict can be re-derived later:

| State | Meaning | Effect on readiness |
|-------|---------|---------------------|
| fresh | Within `maxEvidenceAgeDays` | No downgrade |
| aging | Past `maxEvidenceAgeDays` | Downgrade to limited |
| stale | Past `staleAfterDays` | Downgrade to not_ready |
| unknown | Age not supplied | Downgrade to limited |

Stale evidence makes a method ineligible; unknown or aging evidence makes it at
best conditionally eligible.

## Reserved objectives — PoF and RUL

`probability_of_failure` and `remaining_useful_life` are registered so that the
platform can name them precisely, and reserved so that it cannot claim them.
Throughout Phase 10J:

- objective readiness is forced to `not_ready`, in code and by database check
  constraint;
- every method is `ineligible` for them, whatever the evidence;
- `probabilityOfFailureCertified` and `rulClaimsCertified` remain false.

Neither may appear in a safety case, a fitness-for-service determination, or an
inspection-interval decision.

## Source Trust (reserved)

Source Trust — a per-source credibility model — is **reserved and not
implemented** (`SOURCE_TRUST_MODEL_READY = false`). Evidence Confidence answers
"how good is this evidence?", not "how much do we trust this source?", and the
two must not be conflated. Until a Source Trust model is designed and certified,
no code may weight, rank or discount a source by presumed trustworthiness.

## Boundaries

- Evidence Confidence ≠ Source Trust ≠ Predictive Accuracy
- Source Trust model reserved only
- Predictive governance does not mutate Risk / Maintenance / Priority / Core Risk / CMMS
- Health composition unchanged
- Fusion provenance preserved on every candidate

## Version

`0.10.0-predictive-governance`
