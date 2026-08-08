# Project Controls Productivity Intelligence

Phase 11F. Package `@rtb/project-controls`, version `0.6.0-productivity-intelligence`, status `productivity_intelligence`.

## Overview

Productivity Intelligence is the fifth Project Context Engine contributor. It assesses **what evidence supports** about execution efficiency posture and abstains when evidence is insufficient.

Flags: `PRODUCTIVITY_INTELLIGENCE_READY = true`, `PRODUCTIVITY_INTELLIGENCE_IS_ADVISORY_ONLY = true`, `PRODUCTIVITY_ANALYSIS_IMPLEMENTED = false` (unit-rate `ProductivityProvider` stays reserved), `PHASE_11G_READY = true` (readiness flag only).

## Pipeline

```
evidence → ProductivityConfidenceEngine → sufficiency
  → abstain? → unknown posture
  → else → productivityPosture + evidence-backed factors
  → ProductivityAssessmentState (method productivity_intelligence_advisory_v1)
```

## Review and events

- Workflow: `project_controls.productivity_review`
- Events: `engineering.project.productivity.updated|reviewed|published`
- HTTP: `/api/engineering/project-controls/productivity`
- Tables (batch 66): `project_controls_productivity_states`, `productivity_evidence`, `productivity_confidence`, `productivity_reviews`

## Active contributors (5)

`progress_intelligence`, `schedule_intelligence`, `change_intelligence`, `cost_intelligence`, `productivity_intelligence`

Reserved: contingency, earned value, forecast.

## Forbidden

Workforce management, payroll, timesheets, resource planning/leveling, labour costing, labour productivity %, forecasting, EV/CPI/SPI, CPM, financial posting, cost engine execution.
