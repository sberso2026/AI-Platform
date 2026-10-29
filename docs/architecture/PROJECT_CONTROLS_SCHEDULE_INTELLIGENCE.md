# Project Controls Schedule Intelligence

Phase 11C. Package: `packages/project-controls` (`@rtb/project-controls`).
Version `0.3.0-schedule-intelligence`, status `schedule_intelligence`.

## Overview

Schedule Intelligence is the second implemented Project Controls capability. It
describes **what the available evidence supports** about declared milestone /
schedule posture, and it abstains when the evidence does not support a posture.

`SCHEDULE_INTELLIGENCE_READY = true`. Read that flag together with:

- `SCHEDULE_INTELLIGENCE_IS_ADVISORY_ONLY = true`
- `SCHEDULE_INTELLIGENCE_IS_CPM = false`
- `CPM_SCHEDULING_IMPLEMENTED = false`
- `FLOAT_COMPUTATION_IMPLEMENTED = false`
- `SCHEDULE_EXECUTION_IMPLEMENTED = false`

`productionProjectControlsReady` stays `false`. Progress Intelligence from 11B
remains intact (`PROGRESS_INTELLIGENCE_11B_INTACT = true`).

## This is not CPM

Schedule Intelligence never computes a critical path, float, forward/backward
pass, or schedule execution. The reserved `ScheduleProvider` interface (baseline,
activity network, critical path) remains `implemented: false` and throws
`not_implemented`.

| CPM / execution needs | Phase 11C position |
| --- | --- |
| Activity network | Not built. `ScheduleProvider.getActivityNetwork` throws |
| Critical path / float | Not computed. `assertNoCpm()` in schedule engine constructor |
| Schedule execution | `SCHEDULE_EXECUTION_IMPLEMENTED = false` |
| Earned value integration | `EARNED_VALUE_IMPLEMENTED = false` |

## Evidence model

`ScheduleEvidence` (`src/domain/schedule.ts`). Ten evidence kinds including
`baseline_declaration`, `milestone_declaration`, and `meeting_statement`.

Dates and postures are **declared by the source** — the engine never derives them
from a network calculation.

## Confidence and abstention

`ScheduleConfidenceEngine` scores the evidence basis. Five sufficiency outcomes
match progress: `sufficient`, `limited`, `insufficient`, `conflicting`, `stale`.
Insufficient, conflicting, or stale forces abstention — no advisory posture is
published.

## Review workflow

`SCHEDULE_REVIEW_WORKFLOW` mirrors progress review on the Engineering OS Workflow
SDK. `assertSchedulePublishable()` enforces approved review, reviewer presence, and
no self-approval before publish.

## Persistence

Batch 63 (`supabase/migrations/20260808030000_batch_63_project_controls_schedule.sql`):

- `project_controls_schedule_assessments`
- `project_controls_schedule_evidence`
- `project_controls_schedule_reviews`
- `project_controls_schedule_snapshots`
- `project_controls_schedule_timeline`

All rows CHECK-constrain `critical_path_computed = false`, `float_computed = false`,
`schedule_executed = false`, `advisory_only = true`, `mutates_project_identity = false`.

Outbox event types extended for `engineering.project.schedule.*`.

## Project Context Engine

The Project Context Engine now has **two active contributors**:

- `progress_intelligence` (11B)
- `schedule_intelligence` (11C)

`ProjectProfile.schedule` carries schedule rollups; `ProjectProfile.floatComputed`
is permanently `false`.

## HTTP API

- `POST/GET /api/engineering/project-controls/schedule` — governance flags include
  `cpmImplemented: false`, `scheduleExecutionImplemented: false`,
  `scheduleIntelligenceReady: true`
- Profile route lists both active contributors

## Domain events

Seven event types (progress + schedule + profile):

- `engineering.project.progress.updated|reviewed|published`
- `engineering.project.schedule.updated|reviewed|published`
- `engineering.project.profile.updated`

Payloads are identifiers only via `scheduleEventPayload()` — no dates or postures
in the event body.

## Certification

Phase 11C gates A–AQ (43 gates). Runner:
`pnpm --filter @rtb/project-controls-certification certify:phase11c`

Workflow: `.github/workflows/phase-11c-project-controls-schedule.yml`
