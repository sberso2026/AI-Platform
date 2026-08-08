# Project Controls Decision Support Intelligence (Phase 11H)

Phase 11H adds **Decision Support Intelligence** as the seventh active Project Context contributor.

Decision Support produces **options and recommendations only** — never instructions, executions, project approvals, or contract authorisations.

## Allowed decision classes

`monitor` | `investigate` | `escalate` | `review` | `coordinate` | `defer` | `prioritise`

## Forbidden

- Auto-execution (`automaticDecisionExecutionEnabled = false`)
- Schedule/cost/contract automatic changes
- Forbidden classes: `approve`, `reject`, `execute`, `commit`, `authorise`, `instruct_contractor`
- CPM, earned value, financial posting, predictive scheduling

## Consumes

- Project Context Composition Engine
- Forecast Intelligence (11G)
- Progress / Schedule / Change / Cost / Productivity intelligence

Never mutates upstream contributors.

## Ownership

- `decisionSupportOwnership = project_controls`
- `projectRecommendationOwnership = project_controls`
- `projectDecisionOwnership = human_only`

## Review

`project_controls.decision_review` via Engineering Workflow SDK: draft → pending_review → approved → rejected → published.

Recommendations are advisory; approval ≠ project/contract approval.

## Events (identifiers only)

- `engineering.project.decision.updated`
- `engineering.project.decision.reviewed`
- `engineering.project.decision.published`

## HTTP

`/api/engineering/project-controls/decision` — operations: `assess_decision`, `review`, `publish`

## Persistence (batch_68)

- `project_controls_decision_states`
- `project_controls_decision_evidence`
- `project_controls_decision_confidence`
- `project_controls_decision_reviews`
- `decision_state_ids` on snapshots
- `decision_summary` on profiles
