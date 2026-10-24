# Project Controls Scenario Intelligence (Phase 11I)

Phase 11I adds **Scenario Intelligence** as the eighth active Project Context contributor.

Scenario Intelligence produces **exploratory scenario comparisons only** — never instructions, decisions-as-authority, preferred scenario selection, optimisation, or executions.

## Allowed scenario types

`maintain_current_posture` | `investigate` | `coordinate` | `prioritise` | `defer` | `recovery_planning` | `alternative_sequence` | `unknown`

## Forbidden

- Auto-execution (`automaticScenarioExecutionEnabled = false`)
- Preferred scenario selection / optimisation
- Schedule/cost/contract automatic changes
- Monte Carlo, unsupported percentages, numerical precision claims
- CPM, earned value, financial posting, predictive scheduling

## Consumes

- Project Context Composition Engine
- Forecast Intelligence (11G)
- Decision Support recommendations (11H)
- Progress / Schedule / Change / Cost / Productivity intelligence

Never mutates upstream contributors.

## Ownership

- `scenarioIntelligenceOwnership = project_controls`
- `projectDecisionOwnership = human_only`

## Review

`project_controls.scenario_review` via Engineering Workflow SDK: draft → pending_review → approved → rejected → published.

Scenarios are advisory; approval ≠ project/contract approval.

## Events (identifiers only)

- `engineering.project.scenario.updated`
- `engineering.project.scenario.reviewed`
- `engineering.project.scenario.published`

## HTTP

`/api/engineering/project-controls/scenario` — operations: `assess_scenario`, `compare_scenarios`, `review`, `publish`

## Persistence (batch_69)

- `project_controls_scenario_states`
- `project_controls_scenario_evidence`
- `project_controls_scenario_confidence`
- `project_controls_scenario_reviews`
- `scenario_state_ids` on snapshots
- `scenario_summary` on profiles
