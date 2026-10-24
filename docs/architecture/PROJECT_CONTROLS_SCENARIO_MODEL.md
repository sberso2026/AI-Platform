# Project Controls Scenario Model (Phase 11I)

## Scenario Control Context

Thread identifier (`scenarioUnitId`) plus scope reference. Governs which advisory scenario comparison is being explored.

## Scenario Evidence

Identifier-only provenance references to composed context, forecast assessments, decision assessments, and upstream contributor states. No evidence payload copies in snapshots.

Fields include `sourceType`, `sourceRef`, `provenance`, and explicit forbids: `autoExecutionClaimed: false`, `approvalAuthorityClaimed: false`, `cpmDerived: false`.

## Scenario Confidence

Qualitative posture only (`high` | `medium` | `low` | `unavailable`) with evidence sufficiency outcomes: `sufficient`, `limited`, `insufficient`, `conflicting`, `stale`. No fabricated percentages or Monte Carlo claims.

## Scenario Comparison

Multiple `ScenarioOption` entries compared via `ScenarioComparison`. `preferredScenarioSelected: false` and `optimisationPerformed: false` are invariant.

Each option carries assumptions, dependencies, constraints, uncertainties, and potential implications — advisory exploration only.

## Assessment state

`ScenarioAssessmentState` records comparison results, contributor refs, confidence, and abstention when evidence is insufficient. `advisoryOnly: true` always.
