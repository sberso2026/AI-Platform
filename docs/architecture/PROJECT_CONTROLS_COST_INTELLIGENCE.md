# Project Controls Cost Intelligence

Phase 11E. Package `@rtb/project-controls`, version `0.5.0-cost-intelligence`, status `cost_intelligence`.

## Overview

Cost Intelligence is the fourth Project Context Engine contributor (after progress, schedule, change). It assesses **what evidence supports** about cost posture and variance context, and abstains when basis or currency alignment is insufficient.

Flags: `COST_INTELLIGENCE_READY = true`, `COST_INTELLIGENCE_IS_ADVISORY_ONLY = true`, `PHASE_11F_READY = true` (readiness flag only — Phase 11F not implemented).

## Pipeline

```
evidence + costBasisRef + changeIntelligence refs
  → CostConfidenceEngine → sufficiency
  → abstain? → unknown posture / insufficient_evidence attribution
  → else → costPosture + varianceAttribution
  → CostIntelligenceState (method cost_intelligence_advisory_v1)
```

## Review & events

- Workflow: `project_controls.cost_review`
- Events: `engineering.project.cost.assessed|reviewed|published|superseded|variance_attributed`
- HTTP: `/api/engineering/project-controls/cost`
- Tables (batch 65): `project_controls_cost_states`, `cost_evidence`, `cost_confidence`, `cost_reviews`

## Active contributors (4)

`progress_intelligence`, `schedule_intelligence`, `change_intelligence`, `cost_intelligence`

Reserved: contingency, productivity, earned value, forecast.
