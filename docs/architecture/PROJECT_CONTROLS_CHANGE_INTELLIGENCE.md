# Project Controls Change Intelligence

Phase 11D. Package: `packages/project-controls` (`@rtb/project-controls`).
Version `0.4.0-change-intelligence`, status `change_intelligence`.

## Overview

Change Intelligence is the third implemented Project Controls capability, after
Progress (11B) and Schedule (11C). It describes **what the available evidence
supports** about a change candidate — its classification, its standing elsewhere,
and which project dimensions it may touch — and it abstains when the evidence
does not support a reading.

`CHANGE_INTELLIGENCE_READY = true`. Read that flag together with:

- `CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY = true`
- `CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY = false`
- `CHANGE_EXECUTION_IMPLEMENTED = false`
- `FINANCIAL_POSTING_IMPLEMENTED = false`
- `CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED = false`

`productionProjectControlsReady` stays `false`. Progress Intelligence
(`PROGRESS_INTELLIGENCE_11B_INTACT = true`) and Schedule Intelligence remain
intact.

## This is not change control

Change Intelligence is not a change control product. It never approves, prices,
executes or posts a change. The reserved `ChangeProvider` interface keeps the
product-side methods (`approveContractualChange`, `executeChange`, `priceChange`,
`getChangeImpact`) at `implemented: false`, throwing `not_implemented`.

| Change-control need | Phase 11D position |
| --- | --- |
| Contractual approval | Not built. `ChangeProvider.approveContractualChange` throws |
| Change execution | `CHANGE_EXECUTION_IMPLEMENTED = false` |
| Change pricing / quantum | `COST_ENGINE_IMPLEMENTED = false`, `ChangeProvider.priceChange` throws |
| Budget mutation / financial posting | `FINANCIAL_POSTING_IMPLEMENTED = false`, CHECK `budget_mutated = false` |
| Contingency drawdown | `CONTINGENCY_MANAGEMENT_IMPLEMENTED = false`, `ContingencyProvider` throws |
| Earned value / CPM / float / forecast | All `false`, unchanged from 11B/11C |
| Baseline management | `BaselineProvider` reserved; every method throws |

See [Change Authority Boundary](PROJECT_CONTROLS_CHANGE_AUTHORITY_BOUNDARY.md)
for why, and [Change Model](PROJECT_CONTROLS_CHANGE_MODEL.md) for the vocabulary.

## Engine pipeline

`ChangeIntelligenceEngine` (`src/domain/change-engine.ts`) runs two operations.

**Candidate creation** — `createCandidate(signals)` assembles a
`ChangeCandidate` from one or more `ChangeSignal`s, deriving a suggested
classification from the signals. The candidate is a subject for assessment;
`isApprovedChange` is permanently `false`.

**Assessment** — `assess(evidence)` runs:

```
evidence → validate forbid locks → ChangeConfidenceEngine → sufficiency
        → abstain?  yes → state with unknown status, unknown impacts
                    no  → status context + advisory impact contexts
        → ChangeIntelligenceState (versioned, method change_intelligence_advisory_v1)
```

Both constructors call `assertNoCostEngine()` and
`assertNoContractualApproval()`, so an engine cannot even be built in a tree
where those locks have been flipped.

## Confidence and abstention

`ChangeConfidenceEngine` (`src/domain/change-confidence.ts`) mirrors the progress
and schedule confidence engines and scores source diversity, provenance, review
status, freshness and declared conflicts. Six sufficiency outcomes:

| Outcome | Meaning | Abstains |
| --- | --- | --- |
| `sufficient` | Multiple corroborating reviewed sources | No |
| `limited` | Thin but usable basis | No |
| `insufficient` | Too little to support a reading | Yes |
| `conflicting` | Sources declare contradictory status contexts | Yes |
| `stale` | Newest evidence is beyond the freshness window | Yes |
| `revoked` | The supporting evidence has been withdrawn | Yes |

An abstained assessment publishes `changeStatusContext: "unknown"` and `unknown`
across every impact dimension. It cannot enter review.

## Review workflow

`CHANGE_REVIEW_WORKFLOW` (`project_controls.change_review`) runs on the
Engineering OS Workflow SDK:

```
draft → pending_review → approved | rejected | changes_requested → published
```

`assertChangePublishable()` requires an approved review, a reviewer distinct from
the assessor, and no contractual approval claim. Publishing supersedes the prior
version of the same change thread and emits
`engineering.project.change.superseded`.

## Persistence

Batch 64
(`supabase/migrations/20260808040000_batch_64_project_controls_change_intelligence.sql`):

| Table | Contents |
| --- | --- |
| `project_controls_change_candidates` | Candidates assembled from signals |
| `project_controls_change_states` | Versioned assessments |
| `project_controls_change_evidence` | Provenance records, no payloads |
| `project_controls_change_confidence` | Confidence scoring per assessment |
| `project_controls_change_reviews` | Review decisions |
| `project_controls_project_snapshots` | Shared, immutable, identifier-only |
| `project_controls_project_timeline` | Shared, append-only |

All tables carry tenant + workspace RLS and an FK to `engineering_projects(id)`.
Every change row CHECK-constrains the forbid locks: no earned value, no critical
path, no float, no cost integration, no budget mutation, no financial posting,
no forecast, no contingency drawdown, no change execution, no contractual
approval, no contractual authority, no core risk mutation,
`advisory_only = true`, `mutates_project_identity = false`.

Batches 61, 62 and 63 are untouched.

## Project Context Engine

The Project Context Engine now has **three active contributors**:

- `progress_intelligence` (11B)
- `schedule_intelligence` (11C)
- `change_intelligence` (11D)

`cost_intelligence` stays reserved for Phase 11E, alongside
`contingency_intelligence`, `productivity_intelligence`, `earned_value` and
`forecast`. `ProjectProfile.change` carries the change rollup;
`ProjectProfile.floatComputed` and `ProjectProfile.financialPostingPerformed` are
permanently `false`.

## HTTP API

- `POST/GET /api/engineering/project-controls/change` — operations
  `create_candidate`, `assess_change`, `review`, `publish`; reads `latest`,
  `history`, `evidence`, `candidates`, `timeline`. Governance flags include
  `changeIntelligenceReady: true`, `contractualAuthority: false`,
  `costEngineImplemented: false`, `financialPostingImplemented: false`,
  `earnedValueImplemented: false`
- `POST/GET /api/engineering/project-controls/snapshot` — create and read
  immutable project snapshots
- Profile route lists all three active contributors

## Domain events

Thirteen event types (progress + schedule + profile + change + snapshot):

- `engineering.project.change.assessed|reviewed|published|superseded`
- `engineering.project.change_candidate.created`
- `engineering.project.snapshot.created`

Payloads are identifiers only via `changeEventPayload()`,
`changeCandidateEventPayload()` and `snapshotEventPayload()` — no narratives, no
impact readings, no evidence in the event body. Governance on every event asserts
`floatComputed: false`, `financialPostingPerformed: false` and
`contractualApprovalClaimed: false`.

## Certification

Phase 11D gates A–AW (49 gates). Runner:
`pnpm --filter @rtb/project-controls-certification certify:phase11d`

Workflow: `.github/workflows/phase-11d-project-controls-change.yml`
