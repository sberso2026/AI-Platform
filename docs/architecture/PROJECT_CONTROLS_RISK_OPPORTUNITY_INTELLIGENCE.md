# Project Controls Risk & Opportunity Intelligence (Phase 11J)

Phase 11J adds **Risk & Opportunity Intelligence** as the ninth active Project Context contributor.

**Critical boundary:** AI intelligence signals are **not** formal project risks or opportunities. Project Controls owns advisory *intelligence signals* only. The canonical engineering risk register remains owned by `engineering_core`. Humans decide whether a published signal becomes a governed register item.

## Risk signals

`emerging` | `increasing` | `persistent` | `interacting` | `unresolved` | `evidence_gap` | `unknown`

## Opportunity signals

`recovery` | `mitigation` | `coordination` | `sequencing` | `productivity` | `cost_avoidance` | `schedule_protection` | `unknown`

## Forbidden

- Automatic risk-register or opportunity-register mutation
- Automatic owner assignment or treatment execution
- Schedule/cost/contract automatic changes
- Monte Carlo, unsupported percentages, fabricated quantitative exposure
- CPM, earned value, financial posting, predictive scheduling
- Duplicate Risk Register ownership (`duplicateRiskOwnershipDetected = false`)

## Consumes

- Project Context Composition Engine
- Forecast Intelligence (11G)
- Decision Support (11H)
- Scenario Intelligence (11I)
- Progress / Schedule / Change / Cost / Productivity intelligence

Never mutates upstream contributors.

## Ownership

- `riskOpportunityIntelligenceOwnership = project_controls`
- `projectDecisionOwnership = human_only`
- Canonical engineering risk remains `engineering_core`

## Review

`project_controls.risk_opportunity_review` via Engineering Workflow SDK: draft → pending_review → approved → rejected → published.

Signal approval ≠ register item creation. Humans retain register and treatment authority.

## Events (identifiers only)

- `engineering.project.risk_opportunity.updated`
- `engineering.project.risk_opportunity.reviewed`
- `engineering.project.risk_opportunity.published`

## HTTP

`/api/engineering/project-controls/risk-opportunity` — operations: `assess_risk_opportunity`, `review`, `publish`

## Persistence (batch_70)

- `project_controls_risk_opportunity_states`
- `project_controls_risk_opportunity_evidence`
- `project_controls_risk_opportunity_confidence`
- `project_controls_risk_opportunity_reviews`
- `risk_opportunity_state_ids` on snapshots
- `risk_opportunity_summary` on profiles
