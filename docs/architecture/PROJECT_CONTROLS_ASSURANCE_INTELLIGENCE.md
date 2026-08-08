# Project Controls Assurance Intelligence (Phase 11K)

Phase 11K adds **Assurance Intelligence** as the tenth active Project Context contributor.

**Critical boundary:** assurance intelligence is **not** verification, certification, approval, compliance determination, or evidence approval. Project Controls owns advisory *assurance posture about Project Controls intelligence* only. Humans remain assurance, verification, and certification authorities.

## Assurance postures

`strong` | `adequate` | `constrained` | `weak` | `insufficient` | `conflicting` | `unknown`

## Finding taxonomy

`complete` | `incomplete` | `stale` | `conflicting` | `missing_source` | `missing_provenance` | `unsupported` | `dependency_gap` | `unavailable` | `unknown`

## Forbidden

- Automatic assurance approval, certification, or evidence approval
- Formal engineering assurance ownership claim by AI
- Project compliance certification or verification authority
- Schedule/cost/change approval or register mutation
- Unsupported numerical confidence percentages or fabricated evidence
- CPM, earned value, financial posting, predictive scheduling
- Duplicate Document Control / QA/QC / Engineering Assurance ownership (`duplicateAssuranceOwnershipDetected = false`)

## Consumes

- All existing Project Controls contributor outputs and evidence metadata
- Project Context Composition Engine
- Progress through Risk & Opportunity intelligence (11B–11J)

Never mutates upstream contributors.

## Ownership

- `assuranceIntelligenceOwnership = project_controls` (intelligence ONLY)
- `assuranceAuthorityOwnership = human_only`
- `AssuranceIntelligenceReady = true`

## Review

`project_controls.assurance_review` via Engineering Workflow SDK: draft → pending_review → approved → rejected → published.

Assurance findings are advisory only; no AI self-approval.

## Events (identifiers only)

- `engineering.project.assurance.updated`
- `engineering.project.assurance.reviewed`
- `engineering.project.assurance.published`

## HTTP

`/api/engineering/project-controls/assurance` — operations: `assess_assurance`, `review`, `publish`

## Persistence (batch_71)

- `project_controls_assurance_states`
- `project_controls_assurance_evidence`
- `project_controls_assurance_confidence`
- `project_controls_assurance_reviews`
- `assurance_state_ids` on snapshots
- `assurance_summary` on profiles
