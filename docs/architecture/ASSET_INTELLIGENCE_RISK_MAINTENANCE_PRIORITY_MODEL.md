# Asset Intelligence — Risk, Maintenance Recommendation & Priority Model (Phase 10H)

## Purpose

Asset Intelligence owns **advisory intelligence ABOUT** risk context, maintenance
recommendations, and priority attention — not canonical Engineering Core risk
records and not CMMS/work-order execution.

## Distinct concepts (locked)

| Concept | Owner | Answers |
|---------|-------|---------|
| Health | asset_intelligence (HealthCompositionEngine) | Condition + Reliability + Evidence Confidence |
| Criticality | asset_intelligence (context-only) | Importance/consequence of unavailability |
| Reliability | asset_intelligence | Capability to perform required function |
| Failure Intelligence | asset_intelligence | Supported failure mode/mechanism/cause/effect |
| Trend / Degradation | asset_intelligence | How deterioration changes over time |
| Lifecycle Intelligence | asset_intelligence | Interpreted lifecycle context |
| Risk Signal | asset_intelligence | Advisory risk attention from published slices |
| Risk Candidate | asset_intelligence | Handoff candidate for human-gated Core conversion |
| Canonical Risk | engineering_core | Authoritative risk register record |
| Maintenance Recommendation | asset_intelligence | Advisory intervention ABOUT the asset |
| Work Order | CMMS/EAM (none in AI) | Execution record |
| Asset Priority Context | asset_intelligence | Dimensional attention context (not opaque score) |

Do **not** collapse these concepts into one opaque score.

## Decision Context

`AssetDecisionContextEngine` prepares published, governed intelligence context for:

- `RiskSignalEngine`
- `MaintenanceRecommendationEngine`
- `AssetPriorityContextEngine`

It has **no autonomous decision authority**. It does not publish, create Core Risk,
create work orders, alter Health, mutate canonical lifecycle, or calculate PoF/RUL.

## Risk Signal classes (advisory examples)

normal_context, attention, elevated_attention, consequence_sensitive,
insufficient_evidence, conflicting_context

Not certified Probability of Failure. Not universal industry risk ratings.

## Risk Candidate handoff

```
AssetRiskCandidate → human review → authorised Engineering Core adapter → Core Risk
```

`riskCoreAutoMutationAllowed = false`

## Maintenance Recommendation classes (taxonomy)

monitor, reinspect, condition_reassessment, engineering_assessment,
repair_assessment, replacement_assessment, life_extension_assessment,
operational_restriction_assessment, shutdown_assessment, no_action,
insufficient_evidence

These are **recommendation classes**, not work orders.
`cmmsWorkOrderOwnership = none_in_asset_intelligence`

## Priority Profile

Prefer dimensional `AssetPriorityProfile` over universal numeric score.
Classes (decision-support only): routine, monitor, attention, high_attention,
urgent_review, insufficient_evidence

Dimensions preserved: health, criticality, risk, failure, degradation, lifecycle,
maintenance recommendation, evidence confidence.

## Health boundary

Risk, Priority, Lifecycle, Failure, Degradation, Criticality are **not** Health factors.
Health composition methods remain unchanged (`compose_condition_reliability_v2` current).

## Published-slice rule

Only published/approved governed states may drive Decision Context outputs.
Draft / rejected / revoked / superseded are excluded.

## Boundaries

### Risk Signal vs Canonical Risk

Risk Signal ≠ canonical Engineering Core risk. Asset Intelligence must not create or
mutate Core Risk records; `riskCoreAutoMutationAllowed = false` and Risk Candidates
require a human-gated Engineering Core adapter.

### Maintenance Recommendation vs Work Order

Recommendation ≠ work order. Phase 10H does **not** create CMMS ownership, scheduling,
execution, or completion state (`cmmsWorkOrderOwnership = none_in_asset_intelligence`).

### Priority vs Health

Priority ≠ Health. Priority context is decision support over preserved dimensions and is
never a Health Index factor (`priorityHealthContributionEnabled = false`,
`riskHealthContributionEnabled = false`).

### Risk vs Failure vs Degradation

Failure presence alone ≠ risk conclusion, and degradation alone ≠ priority escalation.
Each remains a separately governed slice with its own review lifecycle.

### Digital Twin, SHM, Project Controls, Maintenance/CMMS

Consume-only drafts. No implementations, adapters, or write paths exist in Phase 10H —
see `ASSET_INTELLIGENCE_CROSS_MODULE_CONTRACT_DRAFTS_10H.md`.

## Abstention

Insufficient, conflicting, stale, or revoked evidence forces abstention rather than a
fabricated conclusion. Trend Confidence abstention excludes trend/degradation slices from
the Decision Context.

## Governed review

Risk Signals, Maintenance Recommendations, and Priority Profiles each move through the
Engineering Workflow SDK (`asset_intelligence.risk_review`,
`asset_intelligence.maintenance_recommendation_review`,
`asset_intelligence.priority_review`). Engineers may assess and submit but never
self-approve or publish; AI may never approve or publish.

## Not certified in Phase 10H

Probability of Failure, RUL, quantitative reliability, accuracy claims, predictive ML,
and multi-source fusion all remain uncertified and unimplemented.

## Version

`0.8.0-risk-priority`
