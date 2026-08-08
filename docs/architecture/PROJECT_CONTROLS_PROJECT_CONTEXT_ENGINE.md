# Project Controls Project Context Engine

Phase 11L. `packages/project-controls/src/domain/project-context-engine.ts`.
`PROJECT_CONTEXT_ENGINE_READY = true`. Phase 11G added
`ProjectContextCompositionEngine` (`project-context-composition.ts`) and activated
`forecast` as the sixth contributor. Phase 11H activates `decision_support` as
the seventh contributor. Phase 11I activates `scenario_intelligence` as the eighth contributor. Phase 11J activates `risk_opportunity_intelligence` as the ninth contributor. Phase 11K activates `assurance_intelligence` as the tenth contributor. Phase 11L activates `explainability_intelligence` as the eleventh contributor.

## Purpose

The Project Context Engine composes a `ProjectProfile`: one project-level view of
the intelligence Project Controls owns, built from per-scope progress, schedule,
change and cost assessments plus productivity assessments and a resolved `ProjectReference`.

Its value is as much structural as functional. It fixes the *shape* of the
profile now, with eleven of thirteen contributors active and two declared
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
| `productivity_intelligence` | **active** | Advisory execution efficiency posture; no workforce mgmt or labour % |
| `forecast` | **active** | Advisory trajectory from composed contributors; not completion date or cost forecast |
| `decision_support` | **active** | Advisory options/recommendations; not auto-execution or contract approval |
| `scenario_intelligence` | **active** | Exploratory scenario comparison; no preferred selection or optimisation |
| `risk_opportunity_intelligence` | **active** | Advisory risk/opportunity signals; not register mutation or owner assignment |
| `assurance_intelligence` | **active** | Advisory assurance posture about PC intelligence; not verification, certification, or approval |
| `explainability_intelligence` | **active** | Public explanation summaries with traces; not chain-of-thought, hidden inference, approval, or verification |
| `contingency_intelligence` | reserved | No contingency drawdown |
| `earned_value` | reserved | Reserved **and forbidden** to implement |

`assertProjectProfileContributorsComplete()` proves the list covers every declared
key, that Phase 11L has exactly eleven active contributors
(`progress_intelligence`, `schedule_intelligence`, `change_intelligence`,
`cost_intelligence`, `productivity_intelligence`, `forecast`, `decision_support`, `scenario_intelligence`, `risk_opportunity_intelligence`, `assurance_intelligence`, `explainability_intelligence`), and that
`contingency_intelligence` and `earned_value` are still reserved. Every composed profile echoes `activeContributorKeys` and
`reservedContributorKeys`, so a consumer can tell absent-because-reserved from
absent-because-no-data.

## Composition layer (Phase 11G)

`ProjectContextCompositionEngine` composes published Progress, Schedule, Change,
Cost and Productivity outputs without collapsing them into an opaque score.
Forecast Intelligence consumes this composed context only and never mutates upstream
contributors. Decision Support Intelligence consumes composed context plus forecast
and upstream contributors, producing advisory options/recommendations only.
Scenario Intelligence consumes composed context, forecast, and decision support,
producing exploratory scenario comparisons only — never preferred selection or auto-execution.
Risk & Opportunity Intelligence consumes composed context, forecast, decision support, and scenario intelligence,
producing advisory risk/opportunity signals only — never register mutation, owner assignment, or treatment execution.
Assurance Intelligence consumes all contributor outputs and evidence metadata,
producing advisory assurance posture only — never verification, certification, approval, or evidence approval.
Explainability Intelligence consumes all contributor outputs plus evidence/timeline/governance metadata,
producing public reason summaries with dependency/provenance/timeline traces only — never chain-of-thought, hidden inference, automatic approval, or fabricated provenance. Traceability ≠ approval ≠ verification.
`PROJECT_CONTEXT_COMPOSITION_READY = true`.

## Profile composition

`compose({ tenantId, workspaceId, projectReference, progress, schedule, change, cost, productivity, forecast, decision, scenario, riskOpportunity, assurance, explainability })`.

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
`costIntelligenceReady: true`, `productivityIntelligenceReady: true`,
`forecastIntelligenceReady: true`, `decisionSupportReady: true`,
`projectContextCompositionReady: true`,
`phase11fReady: true`, `phase11gReady: true`, `phase11hReady: true`,
`phase11iReady: true`,
`productionProjectControlsReady: false`).
