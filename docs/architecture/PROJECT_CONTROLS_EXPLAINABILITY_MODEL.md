# Project Controls Explainability Model (Phase 11L)

## ExplainabilityControlContext

Scoped explainability unit reference (`explainabilityUnitId`) used by the advisory engine.

## Explainability Evidence

Evidence references with provenance metadata only (no payload copies, no chain-of-thought).

## Explainability Confidence

Qualitative confidence from evidence/provenance/trace completeness (`sufficient | limited | insufficient | conflicting | incomplete`).

## ExplainabilityAssessmentState

Public advisory state with:

- `explanationStatus` + integrated reason summary (not chain-of-thought)
- `contributorExplanations[]` with evidence refs and missing-evidence notes
- Traces: dependency, provenance, timeline (jsonb on state)
- `assumptionRefs`, `confidenceSourceRefs`, `governanceRefs`
- `ExplainabilitySnapshot` for profile/snapshot rollups

## Governance locks (always false)

- `chainOfThoughtExposed`
- `hiddenReasoningExposed`
- `fabricatedProvenance`
- `automaticEvidenceCreationClaimed`
- `automaticExplanationApprovalClaimed`
- `mutatesUpstreamContributors`

## Persistence (batch_72)

- `project_controls_explainability_states`
- `project_controls_explainability_evidence`
- `project_controls_explainability_confidence`
- `project_controls_explainability_reviews`

Snapshot/profile extensions: `explainability_state_ids`, `explainability_summary`.
