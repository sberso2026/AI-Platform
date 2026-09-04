# Route audit

## PI_HTML_RESPONSE_ROUTES (pre-repair)

- `GET /api/engineering/project-intelligence/health`
- `GET /api/engineering/project-intelligence/projects/{projectId}/command-centre`
- `GET /api/engineering/project-intelligence/projects/{projectId}/schedule`
- `GET /api/engineering/project-intelligence/projects/{projectId}/cost-progress`
- `GET /api/engineering/project-intelligence/projects/{projectId}/risk-change`
- `GET /api/engineering/project-intelligence/projects/{projectId}/queries-decisions`
- `GET /api/engineering/project-intelligence/projects/{projectId}/reports`
- `GET /api/engineering/project-intelligence/projects/{projectId}/analyst`
- `GET /api/engineering/project-intelligence/projects/{projectId}/forecasting`

```
PI_PRIMARY_FAILING_ROUTE=GET /api/engineering/project-intelligence/projects/{projectId}/command-centre
PI_FAILURE_STATUS=500
PI_FAILURE_CONTENT_TYPE=text/html; charset=utf-8
```

Response prefix: `<!DOCTYPE html>` (Next.js `/500`, `X-Matched-Path: /500`).

## Post-repair contract

All listed routes initialize without `pdf-parse`. Handlers return JSON through `withEngineeringApi` / `withEngineeringApiParams`.

| View | Route | Auth miss | Missing project | Service failure |
|---|---|---|---|---|
| Overview | `.../command-centre` | JSON 401 | JSON 400 `project_required` | JSON 500 `PI_DATA_ERROR` dataset=overview |
| Schedule | `.../schedule` | JSON 401 | JSON 400 | dataset=schedule |
| Cost | `.../cost-progress` | JSON 401 | JSON 400 | dataset=cost |
| Risk & Change | `.../risk-change` | JSON 401 | JSON 400 | dataset=risk-change |
| Decisions | `.../queries-decisions` | JSON 401 | JSON 400 | dataset=decisions |
| Reports GET | `.../reports` | JSON 401 | optional project on GET | dataset=reports |
| Reports POST | `.../reports` | JSON 401 | JSON 400 | dataset=reports |
| Analyst GET | `.../analyst` | JSON 401 | optional project on GET | dataset=analyst |
| Analyst POST | `.../analyst` | JSON 401 | JSON 400 | dataset=analyst |
| Engineering | command-centre + documents + meetings | JSON 401 | page empty state | independent unavailable panels |
| Health | `.../health` | JSON 401 | n/a | dataset=health |

Document processing routes may still load `@rtb/project-intelligence/parsers`. That is intentional.
