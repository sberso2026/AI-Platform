# Project Controls Risk & Opportunity Model (Phase 11J)

## RiskOpportunity Control Context

Thread identifier (`riskOpportunityUnitId`) plus scope reference. Governs which advisory risk/opportunity intelligence assessment is being explored.

## RiskOpportunity Evidence

Identifier-only provenance references to composed context, forecast, decision, scenario, and upstream contributor states. No evidence payload copies in snapshots.

Fields include `sourceType`, `sourceRef`, `provenance`, and explicit forbids: `autoExecutionClaimed: false`, `approvalAuthorityClaimed: false`, `riskRegisterMutationClaimed: false`, `ownerAssignmentClaimed: false`, `treatmentExecutionClaimed: false`, `cpmDerived: false`.

## RiskOpportunity Confidence

Qualitative posture only (`high` | `medium` | `low` | `unavailable`) with evidence sufficiency outcomes: `sufficient`, `limited`, `insufficient`, `conflicting`, `stale`. No fabricated percentages or Monte Carlo claims.

## RiskOpportunity Synthesis

`RiskIntelligenceSignal` and `OpportunityIntelligenceSignal` entries with assumptions, dependencies, uncertainties, cross-contributor conflicts, and escalation indicators — advisory exploration only. `registerItemClaimed: false`, `ownerAssigned: false`, `treatmentExecuted: false` are invariant.

## Assessment state

`RiskOpportunityAssessmentState` records synthesis results, contributor refs, confidence, and abstention when evidence is insufficient. `advisoryOnly: true`, `riskRegisterMutated: false`, `duplicateRiskOwnershipDetected: false` always.
