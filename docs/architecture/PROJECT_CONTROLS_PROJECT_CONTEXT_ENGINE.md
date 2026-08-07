# Project Controls Project Context Engine

Phase 11B. `packages/project-controls/src/domain/project-context-engine.ts`.
`PROJECT_CONTEXT_ENGINE_READY = true`.

## Purpose

The Project Context Engine composes a `ProjectProfile`: one project-level view of
the intelligence Project Controls owns, built from per-scope progress
assessments plus a resolved `ProjectReference`.

Its value in 11B is as much structural as functional. It fixes the *shape* of the
profile now, with seven of eight contributors declared `reserved`, so later phases
add values into an existing contract instead of renegotiating it.

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
| `cost_intelligence` | reserved | No cost engine; ledgers stay with `platform_commerce_finance` |
| `schedule_intelligence` | reserved | No CPM, float or schedule execution |
| `change_intelligence` | reserved | No change control workflow |
| `contingency_intelligence` | reserved | No contingency drawdown |
| `productivity_intelligence` | reserved | No unit rates or productivity factors |
| `earned_value` | reserved | Reserved **and forbidden** to implement |
| `forecast` | reserved | Reserved **and forbidden** to implement |

`assertProjectProfileContributorsComplete()` proves the list covers every declared
key, that Phase 11B has exactly one active contributor and that it is
`progress_intelligence`, and that `earned_value` and `forecast` are still
reserved. Every composed profile echoes `activeContributorKeys` and
`reservedContributorKeys`, so a consumer can tell absent-because-reserved from
absent-because-no-data.

## Composition

`compose({ tenantId, workspaceId, projectReference, progress })`.

Assessments outside the given tenant, workspace and project are dropped rather
than trusted, and the drop is recorded as `out_of_scope_progress_ignored`.

The `progress` summary reports `scopesAssessed`, `scopesAbstained`,
`publishedScopes`, `latestAssessmentAt`, plus a project-scope
`projectScopeIndication` and `projectScopeBand` taken from the newest
`project`-scope assessment. Sub-scope indications are **never rolled up into a
project percentage** — rolling up needs budget or duration weighting, which is
earned value. Sub-scopes contribute to counts only.

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

An abstained profile carries `abstentionReason`
(`no_progress_intelligence_available` or `all_progress_assessments_abstained`) and
no indication. `reasons` always includes the
`reserved_contributors:<keys>` marker, so an API consumer never has to infer why a
field is missing.

## Versioning and persistence

Profiles are versioned and superseded through `supersedesId`, stored in
`project_controls_project_profiles` under tenant + workspace RLS.
`ProjectControlsEngine.composeProjectProfile()` resolves the reference, reads the
latest progress per scope, composes, and emits
`engineering.project.profile.updated`.

## Exposure

`POST|GET /api/engineering/project-controls/profile`, returning the profile plus
`activeContributors`, `reservedContributors` and the governance flags
(`earnedValueImplemented: false`, `cpmImplemented: false`,
`costEngineImplemented: false`, `productionProjectControlsReady: false`).
