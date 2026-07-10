# Project Intelligence Integration

Batch **2.06** — integration contract for the **existing** Project Intelligence app.

## Principle

Project Intelligence is a **separate application**. It must **not** duplicate Engineering Core registers.

| Entity | Owner | Project Intelligence action |
|--------|-------|----------------------------|
| Projects | Engineering Core | Map via `engineering_project_id` |
| Decisions | Engineering Core | `GET/POST /api/engineering/decisions` |
| Actions | Engineering Core | `GET/POST /api/engineering/actions` |
| Risks | Engineering Core | `GET/POST /api/engineering/risks` |
| Issues | Engineering Core | `GET/POST /api/engineering/issues` |
| Technical Queries | Engineering Core | `GET/POST /api/engineering/technical-queries` |
| Lessons Learned | Engineering Core | `GET/POST /api/engineering/lessons` |

Project Intelligence adds **analytics, UX, and workflows** on top — not parallel data stores.

## Project Mapping

```typescript
interface ProjectIntelligenceProjectMapping {
  engineering_project_id: string;          // canonical
  project_intelligence_project_id: string; // external app ID
  engineering_project_code: string;
  metadata?: { last_sync_at?: string; sync_status?: string };
}
```

Store mapping in Project Intelligence's database. Engineering Core `engineering_projects` remains canonical.

## API Surface

### Context

| API | Purpose |
|-----|---------|
| `GET /api/engineering/projects` | List/link projects |
| `GET /api/engineering/timeline?projectId=` | Project timeline |
| `GET /api/engineering/activity?projectId=` | Project activity |
| `GET /api/engineering/search` | Cross-register search |
| `GET /api/engineering/health` | Integration health |

### Registers (filter by `projectId` query param where supported)

See [ENGINEERING_OS_API_CONTRACTS.md](./ENGINEERING_OS_API_CONTRACTS.md).

## Events

### Subscribe (Engineering → Project Intelligence)

- `engineering.project.created` / `engineering.project.updated`
- `engineering.decision.created` / `engineering.decision.approved`
- `engineering.action.created` / `engineering.action.closed`
- `engineering.risk.created`
- `engineering.issue.created`
- `engineering.technical_query.created`
- `engineering.lesson.created`

### Publish (Project Intelligence → Platform)

- `project_intelligence.sync.requested`
- `project_intelligence.sync.completed`

See [ENGINEERING_OS_EVENT_CONTRACTS.md](./ENGINEERING_OS_EVENT_CONTRACTS.md).

## Knowledge Graph

Project Intelligence creates edges **through Engineering Core** object links:

- `contains`, `references`, `supports`, `mitigates`, `creates`, `derived_from`

Do not create duplicate KG nodes for register entities.

## Workflow Hooks

Use Engineering Core workflow definitions (seeded per tenant):

| Hook | Slug |
|------|------|
| Decision approval | `engineering-decision-approval` |
| Risk review | `engineering-risk-review` |
| TQ response | `engineering-tq-workflow` |
| Action close-out | `engineering-action-closeout` |
| Issue investigation | `engineering-issue-investigation` |

**Decisions always require human approval** — Project Intelligence must not auto-approve.

## TypeScript Contracts

```typescript
import {
  PROJECT_INTELLIGENCE_APP_KEY,
  PROJECT_INTELLIGENCE_REGISTER_APIS,
  PROJECT_INTELLIGENCE_INTEGRATION_RULES,
  type ProjectIntelligenceIntegrationClient,
  type ProjectIntelligenceProjectMapping,
} from "@rtb/types";
```

## What NOT to Build in Project Intelligence

- Duplicate decision/action/risk/issue/TQ/lesson tables
- Duplicate approval workflows for engineering decisions
- Separate timeline/activity stores for register events
- Autonomous engineering decision approval

## Test Readiness

Before integrating Project Intelligence:

1. Run [ENGINEERING_OS_TEST_RUN.md](../testing/ENGINEERING_OS_TEST_RUN.md)
2. Seed demo data and verify register APIs
3. Confirm health check passes

## Next Batch

Project Intelligence implementation (Batch 2.1+) consumes this contract — UI, analytics, and sync logic only.
