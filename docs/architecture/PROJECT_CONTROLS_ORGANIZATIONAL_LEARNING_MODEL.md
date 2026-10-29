# Project Controls Organizational Learning Model (Phase 11M)

## OrganizationalLearningControlContext

Scoped organizational learning unit reference (`organizationalLearningUnitId`) used by the advisory engine.

## OrganizationalLearningEvidence

Evidence references with provenance metadata only (no payload copies, no fabricated lessons, no unsupported similarity scores).

## OrganizationalLearningConfidence

Qualitative confidence from evidence/provenance/historical completeness (`sufficient | limited | insufficient | conflicting | incomplete`).

## OrganizationalLearningAssessmentState

Public advisory state with:

- `taxonomyClass` + integrated basis summary (not a recommendation)
- `learningItems[]` with historical/lesson/pattern/outcome references
- Traces: knowledge provenance, timeline, cross-project references (jsonb on state)
- `contributingContributors`, `evidenceRefs`, `governanceRefs`
- `OrganizationalLearningSnapshot` for profile/snapshot rollups

## Governance locks (always false)

- `fabricatedLesson`
- `unsupportedSimilarityScore`
- `knowledgeMutationClaimed`
- `automaticLearningApprovalClaimed`
- `automaticKnowledgeMutationClaimed`
- `recommendationClaimed`
- `predictionClaimed`
- `optimisationClaimed`
- `mutatesUpstreamContributors`

## Persistence (batch_73)

- `project_controls_organizational_learning_states`
- `project_controls_organizational_learning_evidence`
- `project_controls_organizational_learning_confidence`
- `project_controls_organizational_learning_reviews`

Snapshot/profile extensions: `organizational_learning_state_ids`, `organizational_learning_summary`.
