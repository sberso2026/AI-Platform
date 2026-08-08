# Project Controls Project Context Engine

Phase 11E. `packages/project-controls/src/domain/project-context-engine.ts`.
`PROJECT_CONTEXT_ENGINE_READY = true`.

## Purpose

The Project Context Engine composes a `ProjectProfile`: one project-level view of
the intelligence Project Controls owns, built from per-scope progress, schedule,
change and cost assessments plus a resolved `ProjectReference`.

Its value is as much structural as functional. It fixes the *shape* of the
profile now, with four of eight contributors active and four declared
`reserved`, so later phases add values into an existing contract instead of
renegotiating it.

## Not a project registry

The profile is derived and disposable. `isProjectRegistry: false` and
`mutatesProjectIdentity: false` on every row, CHECK-constrained in SQL.

Identity fields (`projectCode`, `projectName`, `projectPhase`, `projectStatus`)
are copied from the `ProjectReference` the caller resolved through the Engineering
Shared Project Domain, and the engine throws `project_reference_owner_mismatch`
if the reference did not come from that owner. They are display copies with a
composition timestamp; the shared domain remains the only place to read current
identity.

## Contributors

`PROJECT_PROFILE_CONTRIBUTORS` is ordered and stable, so profile versions diff
cleanly.

| Contributor | Status | Note |
| --- | --- | --- |
| `progress_intelligence` | **active** | Advisory evidence-driven progress |
| `schedule_intelligence` | **active** | Advisory schedule posture; not CPM or execution |
| `change_intelligence` | **active** | Advisory change assessment; never contractual approval |
| `cost_intelligence` | **active** | Advisory cost posture and variance attribution; no ledger or posting |
| `contingency_intelligence` | reserved | No contingency drawdown |
| `productivity_intelligence` | reserved | No unit rates or productivity factors |
| `earned_value` | reserved | Reserved **and forbidden** to implement |
| `forecast` | reserved | Reserved **and forbidden** to implement |

`assertProjectProfileContributorsComplete()` proves the list covers every declared
key, that Phase 11E has exactly four active contributors
(`progress_intelligence`, `schedule_intelligence`, `change_intelligence`,
`cost_intelligence`), and that `earned_value` and `forecast` are still
reserved. Every composed profile echoes `activeContributorKeys` and
`reservedContributorKeys`, so a consumer can tell absent-because-reserved from
absent-because-no-data.

## Composition

`compose({ tenantId, workspaceId, projectReference, progress, schedule, change, cost })`.

Assessments outside the given tenant, workspace and project are dropped rather
than trusted, and the drop is recorded as `out_of_scope_*_ignored`.

Each contributor summary reports scope counts, latest assessment timestamps and
project-scope posture where applicable. Sub-scope indications are **never rolled
up into a project percentage** — rolling up needs budget or duration weighting,
which is earned value.

Aggregate confidence is deliberately pessimistic: `lowestConfidenceClass` takes
the weakest class across all scopes, and `dominantSufficiency` reports the most
common sufficiency verdict. Composing many scopes cannot manufacture confidence
that no single scope had.

## Profile classes

| `profileClass` | When |
| --- | --- |
| `composed` | Assessments exist, none abstained, at least one published |
| `partially_composed` | Some scopes abstained, or nothing published yet |
| `abstained` | No relevant assessments, or every one abstained |

An abstained profile carries `abstentionReason` and no indication. `reasons`
always includes the `reserved_contributors:<keys>` marker, so an API consumer
never has to infer why a field is missing.

## Versioning and persistence

Profiles are versioned and superseded through `supersedesId`, stored in
`project_controls_project_profiles` under tenant + workspace RLS.
`ProjectControlsEngine.composeProjectProfile()` resolves the reference, reads the
latest intelligence per scope, composes, and emits
`engineering.project.profile.updated`.

## Exposure

`POST|GET /api/engineering/project-controls/profile`, returning the profile plus
`activeContributors`, `reservedContributors` and the governance flags
(`earnedValueImplemented: false`, `cpmImplemented: false`,
`costEngineImplemented: false`, `financialPostingImplemented: false`,
`costIntelligenceReady: true`, `phase11fReady: true`,
`productionProjectControlsReady: false`).
