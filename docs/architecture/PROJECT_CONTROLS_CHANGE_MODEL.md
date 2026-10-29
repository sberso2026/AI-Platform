# Project Controls Change Model

Phase 11D. Package: `packages/project-controls` (`@rtb/project-controls`).
Version `0.4.0-change-intelligence`, status `change_intelligence`.

This document fixes the vocabulary. Most change-control failures in engineering
organisations are vocabulary failures: someone reads "change detected" as "change
approved". The model below keeps those concepts separate by construction.

## The six concepts

| Concept | Type | What it is | What it is not |
| --- | --- | --- | --- |
| Change Signal | `ChangeSignal` | A raw observation that *something may have changed* — a document reference, a meeting statement, an instruction, an RFI response, a site observation | Not a change. Not evidence. Not reviewed |
| Change Candidate | `ChangeCandidate` | A named subject for assessment, assembled from one or more signals | **Not an approved change.** `isApprovedChange` is permanently `false` |
| Change Reference | `ChangeReference` | A pointer to a change instrument that lives under some *other* authority — an external change order, a variation instruction, a contract amendment | Not owned by Project Controls. `ownedByProjectControls` is permanently `false` |
| Change Assessment | `ChangeIntelligenceState` | What the evidence supports about a candidate or reference, at a version, with confidence | Not an approval, not a determination, not a quantum |
| Change Status Context | `pending` / `approved_context` / `rejected_context` / `unknown` | What the evidence says about the change's standing **elsewhere** | Not Project Controls granting or withholding approval |
| Change Impact | `ChangeImpactContexts` | Advisory contexts across scope, schedule, cost, risk, quality, procurement | Not a quantum, not a delay analysis, not a cost estimate |

## Candidate is not an approved change

This is the load-bearing distinction of Phase 11D.

A `ChangeCandidate` is a *question*: "is this a change, and what does it touch?"
An approved change is an *answer given by a contractual authority*, which is not
Project Controls. The gap between them is enforced in four places:

1. `ChangeCandidate.isApprovedChange: false` and
   `ChangeCandidate.contractualApprovalClaimed: false` are literal `false` types,
   not booleans — the compiler rejects any other value.
2. `assertCandidateIsNotApprovedChange()` re-checks at runtime.
3. The `project_controls_change_candidates` table CHECK-constrains
   `is_approved_change = false` and `contractual_approval_claimed = false`.
4. `assertChangePublishable()` throws
   `change_assessment_approval_is_not_contractual_approval` if a publish attempt
   claims otherwise.

## Change classification

Thirteen classes describe **what kind of change is being assessed**:

`scope` · `design` · `schedule` · `cost` · `technical` · `contractual` ·
`regulatory` · `procurement` · `construction` · `quality` · `safety` ·
`asset_interface` · `other`

`cost` here is a *subject* classification, not a quantum. A change classified
`cost` means "this candidate concerns cost"; it never means Project Controls
priced it. `CHANGE_CLASSIFICATION_COST_IS_SUBJECT_NOT_QUANTUM = true` records
that reading in code.

## Change status context

The status context describes the change's standing **in the authority that owns
it**, as reported by evidence:

- `pending` — evidence indicates the change is raised but not determined
- `approved_context` — evidence indicates an authority has approved it elsewhere
- `rejected_context` — evidence indicates an authority has rejected it elsewhere
- `unknown` — evidence does not support any reading, or the assessment abstained

`approved_context` is a *report about someone else's decision*. It is never
Project Controls approving anything. Contradictory declarations across sources
produce `conflicting` sufficiency and force abstention rather than a guess.

## Change impact contexts

Each impact dimension takes one advisory value:

- `suspected` — evidence hints at an effect
- `supported` — evidence supports an effect
- `unknown` — evidence is silent or insufficient
- `not_applicable` — the dimension does not apply to this change class

There is no `days`, no `amount`, no `percentage`. `impact.cost = "supported"`
means "the evidence supports a cost effect", not "the cost effect is X".

## Evidence

`ChangeEvidence` records provenance and never duplicates payloads: it carries
`sourceType`, `sourceRef`, `sourceKey`, `provenance`, `reviewStatus`,
`observedAt`, `sourceVersion` and an optional per-item `confidence`. The content
stays in the owning system.

Four forbid locks are literal `false` on every evidence item:
`derivedFromEarnedValue`, `mutatesCoreRisk`, `mutatesBudget`,
`contractualApprovalClaimed`.

## Confidence and abstention

`ChangeConfidence` reports one of six sufficiency outcomes: `sufficient`,
`limited`, `insufficient`, `conflicting`, `stale`, `revoked`. The last four force
abstention — the assessment publishes no status context and no impact reading.

Confidence is about *evidential support*, never contractual certainty.
`contractualCertaintyClaimed` is permanently `false`.

## Project snapshot and timeline

Phase 11D introduces two shared project-level structures:

- `ProjectTimelineEvent` — append-only record of project-level intelligence
  events (assessment, review, publication, snapshot). Governance flags on each
  entry assert `advisoryOnly: true`, `financialPostingPerformed: false`,
  `contractualApprovalClaimed: false`.
- `ProjectSnapshot` — an immutable capture referencing progress, schedule and
  change state identifiers plus the profile id. It carries **identifiers only**:
  `containsEvidencePayloads` is permanently `false`.

## Related documents

- [Change Authority Boundary](PROJECT_CONTROLS_CHANGE_AUTHORITY_BOUNDARY.md)
- [Change Intelligence engine overview](PROJECT_CONTROLS_CHANGE_INTELLIGENCE.md)
- [Ownership matrix](PROJECT_CONTROLS_OWNERSHIP_MATRIX.md)
- [Boundary map](PROJECT_CONTROLS_BOUNDARY_MAP.md)
