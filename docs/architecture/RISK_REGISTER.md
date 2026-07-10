# Risk Register

Engineering risk register with probability × consequence scoring and matrix view.

## Routes

| Layer | Path |
|-------|------|
| UI | `/engineering/risks` |
| API | `GET /api/engineering/risks?view=matrix` |
| API | `POST /api/engineering/risks` |

## Fields

| Field | Notes |
|-------|-------|
| `risk_number` | Auto `RSK-####` |
| `title`, `category`, `owner`, `discipline`, `project`, `asset` | Context |
| `probability`, `consequence` | 1–5 scale |
| `score` | Stored generated: `probability * consequence` |
| `mitigation`, `controls` | JSON controls array |
| `residual_score` | Post-mitigation (future bow-tie) |

## Risk Matrix

`GET ?view=matrix` returns:

```json
{
  "risks": [...],
  "cells": { "3x4": 2, "5x5": 1 }
}
```

UI renders heat-map grid (P1–P5 × C1–C5).

## Bow-tie Analysis

Schema supports `controls`, residual probability/consequence for future bow-tie UI.

## Relationships

- Decision `mitigates` Risk
- Asset `affected_by` Risk
- Issue may `create` Risk

## Workflow

`risk_review` workflow for periodic review cycles.

## AI

Mitigation suggestions in `ai_context`; queries like *"Show all open structural risks"* use search + KG.

## Events

`engineering.risk.created`, `engineering.risk.updated` on changes.
