# Project Controls Assurance Model (Phase 11K)

## Assurance Control Context

Thread identifier (`assuranceUnitId`) plus scope reference. Governs which advisory assurance intelligence assessment is being explored.

## Assurance Evidence

Identifier-only provenance references to composed context, forecast, decision, scenario, risk/opportunity, and upstream contributor states. No evidence payload copies in snapshots.

Fields include `sourceType`, `sourceRef`, `provenance`, and explicit forbids: `autoExecutionClaimed: false`, `approvalAuthorityClaimed: false`, `certificationClaimed: false`, `verificationClaimed: false`, `evidenceApprovalClaimed: false`, `registerMutationClaimed: false`, `cpmDerived: false`, `numericalPrecisionClaimed: false`.

## Assurance Confidence

Qualitative posture only (`high` | `medium` | `low` | `unavailable`) with evidence sufficiency outcomes: `sufficient`, `limited`, `insufficient`, `conflicting`, `stale`. No fabricated percentages.

## Assurance Synthesis

Contributor-level findings, cross-contributor conflicts, dependency gaps, stale-source indicators, and integrated assurance summary — advisory exploration only. `mutatesUpstreamContributors: false` is invariant.

## Assessment state

`AssuranceAssessmentState` records assurance posture, synthesis, contributor refs, confidence, and abstention when evidence is insufficient. `advisoryOnly: true`, `duplicateAssuranceOwnershipDetected: false`, `certificationClaimed: false`, `verificationClaimed: false` always.

## Semantics locks

- intelligence ≠ assurance
- assurance ≠ verification
- assurance ≠ certification
- assurance ≠ approval
- assurance ≠ compliance determination

Fail closed: missing or contradictory evidence yields `constrained`, `weak`, `insufficient`, `conflicting`, or `unknown` as appropriate. Never manufacture evidence to improve posture.
