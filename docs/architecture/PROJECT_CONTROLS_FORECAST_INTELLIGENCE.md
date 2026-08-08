# Project Controls Forecast Intelligence (Phase 11G)

Forecast Intelligence is **advisory trajectory posture** derived from published composed
contributor outputs (Progress, Schedule, Change, Cost, Productivity). It is not
predictive scheduling, not completion date prediction, not earned value, and not a
budget or financial forecast.

## Ownership

- `forecastIntelligenceOwnership = project_controls`
- `projectContextCompositionOwnership = project_controls`
- `ForecastProvider` (predictive completion/cost methods) stays **reserved / not_implemented**

## Review

Workflow: `project_controls.forecast_review` — draft → pending_review → approved →
rejected → published. No AI self-approval.

## Events

- `engineering.project.forecast.updated`
- `engineering.project.forecast.reviewed`
- `engineering.project.forecast.published`

## HTTP

`POST /api/engineering/project-controls/forecast` — operations: `assess_forecast`, `review`, `publish`

## Persistence (batch_67)

- `project_controls_forecast_states`
- `project_controls_forecast_evidence`
- `project_controls_forecast_confidence`
- `project_controls_forecast_reviews`

Shared snapshot/profile extended with `forecast_state_ids` / `forecast_summary`.
