# Project Controls Progress Intelligence

Phase 11B. Package: `packages/project-controls` (`@rtb/project-controls`).
Version `0.2.0-progress-intelligence`, status `progress_intelligence`.

## Overview

Progress Intelligence is the first genuinely implemented Project Controls
capability. It describes **what the available evidence supports** about how far a
scope has advanced, and it abstains when the evidence does not support a number.

`PROGRESS_MEASUREMENT_IMPLEMENTED = true`. Read that flag together with the two
that qualify it:

- `PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY = true`
- `PROGRESS_MEASUREMENT_IS_EARNED_VALUE = false`

`productionProjectControlsReady` stays `false`. The module registry entry stays
`coming_soon`. There is no Project Controls product yet — there is a progress
intelligence slice.

## This is not earned value

Earned value needs a cost or quantity baseline and turns progress into value.
Progress Intelligence has neither and does not.

| Earned value needs | Phase 11B position |
| --- | --- |
| Budget / cost baseline | No cost engine, no budget ledger. `COST_ENGINE_IMPLEMENTED = false` |
| Planned value curve | No baseline, no S-curve, no time-phasing |
| BCWP / BCWS / ACWP | Not computed anywhere. `EARNED_VALUE_IMPLEMENTED = false` |
| CPI / SPI | Not computed. `CPM_SCHEDULING_IMPLEMENTED = false` |
| Weighting by budget or duration | Weighting is by **source trust only** |

`assertNoEarnedValue()` runs in the `ProgressIntelligenceEngine` constructor, so a
flipped flag fails at construction rather than producing an uncertified number.
Progress evidence carrying `derivedFromEarnedValue` or `derivedFromCostData`
throws `progress_evidence_may_not_derive_from_earned_value_or_cost`, and the
matching SQL columns are CHECK-constrained to false.

## Evidence model

`ProgressEvidence` (`src/domain/progress.ts`). Ten evidence kinds
(`site_observation`, `quantity_record`, `inspection_result`, `document_status`,
`milestone_attestation`, `meeting_statement`, `supplier_confirmation`,
`checklist_completion`, `photo_record`, `engineering_judgement`) across six source
types.

`indicatedCompletion` is a **reported** 0..1 figure from the source, optional so
qualitative evidence still counts toward sufficiency. `weight` is relative source
trust, not budget or duration.

## Confidence and abstention

`ProgressConfidenceEngine` (`src/domain/progress-confidence.ts`) scores the
evidence *basis*, not engineering correctness (`engineeringCorrectnessClaimed`
is permanently `false`). Five outcomes:

| `dataSufficiency` | Meaning | Engine result |
| --- | --- | --- |
| `sufficient` | Diverse, fresh, reviewed, agreeing | Indication published |
| `limited` | Usable but thin | Indication published, flagged advisory |
| `insufficient` | Too few, unreviewed, or nothing quantified | **Abstain** |
| `conflicting` | Declared conflict, or spread beyond threshold | **Abstain** |
| `stale` | Newest observation past the freshness horizon | **Abstain** |

Score components: evidence volume (0.30), freshness (0.20), source diversity
(0.20), review completeness (0.15), inter-source agreement (0.15). Defaults:
90-day freshness horizon, 0.45 sufficiency threshold, 0.35 disagreement
threshold, minimum 2 usable quantified observations.

When the engine abstains it records the assessment with
`assessmentClass: "abstained"`, `band: "unavailable"` and **no**
`indicatedCompletion`. It never reports a low-confidence number instead of
abstaining. The SQL constraint
`pc_progress_abstention_has_no_indication` enforces this at the row level, and an
abstained assessment never enters review —
`abstained_progress_assessment_not_reviewable`.

## Scopes

`project`, `phase`, `wbs_node`, `work_package`, `activity`, `milestone`. Every
scope except `project` requires a `referenceId` resolved through the Engineering
Shared Project Domain.

## Review workflow

`project_controls.progress_review`, built on the `@rtb/engineering-os` Workflow
SDK, mirroring the Asset Intelligence lifecycle review pattern:

`draft → pending_review → approved | changes_requested | rejected`, with
`changes_requested → pending_review` on resubmit.

Publication requires an approved review plus a reviewer who is not the assessor.
`assertPublishable()` throws `progress_publish_requires_approved_review`,
`progress_publish_requires_reviewer` or `progress_self_approval_forbidden`.
`AI_MAY_PUBLISH_PROGRESS_FORBIDDEN = true` and
`AUTONOMOUS_PROGRESS_PUBLICATION_ALLOWED = false`.

## Role matrix

| Role | Assess | Review | Approve | Publish |
| --- | --- | --- | --- | --- |
| `viewer` | | | | |
| `project_controls_engineer` | yes | | | |
| `reviewer` | | yes | | |
| `approver` | | yes | yes | yes |
| `admin` | yes | yes | yes | yes |

Segregation of duties: `SELF_APPROVE_FORBIDDEN_CAPABILITIES` covers
`progress.approve` and `progress.publish`. No capability exists for any reserved
concern — `assertNoReservedCapabilities()` proves it.

## Persistence

Port + memory adapter in `src/domain/persistence.ts`; Supabase adapter in
`src/domain/postgres-repository.ts`; factory in `src/domain/repository-factory.ts`
which throws `production_memory_repository_forbidden` when production selects
memory. `PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false`.

Versioned states with supersede chains, optimistic locking via
`optimistic_lock_conflict`, published-state immutability
(`published_progress_assessment_immutable`), idempotency keys, and a PC-local
outbox.

Tables (batch_62): `project_controls_progress_assessments`,
`project_controls_progress_evidence`, `project_controls_progress_reviews`,
`project_controls_progress_snapshots`, `project_controls_progress_timeline`,
`project_controls_project_profiles`, `project_controls_idempotency`,
`project_controls_outbox_events`.

RLS is tenant + workspace: `get_user_tenant_ids()` plus `workspace_memberships`.
`project_id` is a foreign key into `engineering_projects` — Project Controls never
writes it.

## Events

- `engineering.project.progress.updated`
- `engineering.project.progress.reviewed`
- `engineering.project.progress.published`
- `engineering.project.profile.updated`

Every payload carries governance flags: `advisoryOnly: true`,
`earnedValueComputed: false`, `criticalPathComputed: false`,
`costIntegrated: false`, `forecastProduced: false`,
`mutatesProjectIdentity: false`, `autonomousPublication: false`.

## HTTP

- `POST|GET /api/engineering/project-controls/progress`
- `POST|GET /api/engineering/project-controls/profile`

Nested error contract: `{ error: { code, message, requestId, details } }`.
Responses carry `earnedValueImplemented: false`, `cpmImplemented: false`,
`costEngineImplemented: false` and `productionProjectControlsReady: false`.

## Reserved providers

`src/domain/reserved-providers.ts` publishes `ScheduleProvider`, `CostProvider`,
`EarnedValueProvider`, `ForecastProvider`, `ChangeProvider` and
`ProductivityProvider` as interfaces only. Every method throws
`not_implemented:<provider>.<capability>`, and `implemented` is `false` on each.

A future phase that implements one must flip the corresponding `*_IMPLEMENTED`
flag in `version.ts` and add its own certification gates.

## Relationship to Phase 11A

Phase 11A (`0.1.0-discovery`, certified at `b9a3a6091ec4af1eb1ebdd9749da497ce5af9700`,
hosted run `31179910364`) proved the *absence* of a Project Controls product.
Phase 11B supersedes the 11A absence gates that covered the progress slice
specifically: the discovery package now has a `src/domain` directory, PC-owned
SQL tables and two API routes. Every 11A gate about cost, schedule, earned value,
CPM, forecasting, product UI and module GA still holds and is re-asserted by the
Phase 11B gate set.
