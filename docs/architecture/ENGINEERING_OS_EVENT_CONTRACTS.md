# Engineering OS Event Contracts

Batch **2.06** — Event Bus contracts for Engineering Core and Project Intelligence.

**Source:** `engineering-os` (core) | `project-intelligence` (sync)

## Envelope

```typescript
interface EngineeringEventEnvelope {
  eventType: EngineeringEventType;
  tenantId: string;
  workspaceId?: string;
  source: "engineering-os" | "project-intelligence";
  payload: Record<string, unknown>;
  occurredAt: string; // ISO 8601
}
```

## Core Engineering Events

| Event | When | Key payload fields |
|-------|------|-------------------|
| `engineering.project.created` | Project created | `project_id`, `project_code` |
| `engineering.project.updated` | Project updated | `project_id`, `changes` |
| `engineering.asset.created` | Asset created | `asset_id`, `asset_tag` |
| `engineering.document.uploaded` | Document registered | `document_id`, `document_number` |
| `engineering.decision.created` | Decision raised | `object_id`, `title`, `approval_status: pending` |
| `engineering.decision.approved` | Human approval | `object_id`, `approved_by` |
| `engineering.action.created` | Action created | `object_id`, `title` |
| `engineering.action.closed` | Action completed | `object_id`, `completion_date` |
| `engineering.risk.created` | Risk registered | `object_id`, `score` |
| `engineering.risk.updated` | Risk updated | `object_id` |
| `engineering.issue.created` | Issue raised | `object_id`, `title` |
| `engineering.technical_query.created` | TQ submitted | `object_id`, `tq_number` |
| `engineering.technical_query.answered` | TQ answered | `object_id`, `response` |
| `engineering.lesson.created` | Lesson captured | `object_id`, `lesson_number` |
| `engineering.demo.seeded` | Demo data seeded | `counts` |
| `engineering.demo.reset` | Demo data reset | `deleted` |

## Project Intelligence Sync Events

| Event | Publisher | Purpose |
|-------|-----------|---------|
| `project_intelligence.sync.requested` | Project Intelligence | Request register sync for a project |
| `project_intelligence.sync.completed` | Project Intelligence | Report sync completion |

### `project_intelligence.sync.requested` payload

```json
{
  "engineering_project_id": "uuid",
  "project_intelligence_project_id": "external-id",
  "sync_scope": ["decisions", "actions", "risks"],
  "requested_by": "user-uuid"
}
```

### `project_intelligence.sync.completed` payload

```json
{
  "engineering_project_id": "uuid",
  "project_intelligence_project_id": "external-id",
  "records_synced": { "decisions": 3, "actions": 5 },
  "completed_at": "2026-02-05T12:00:00Z"
}
```

## TypeScript

```typescript
import {
  ENGINEERING_CORE_EVENT_TYPES,
  PROJECT_INTELLIGENCE_EVENT_TYPES,
  ENGINEERING_EVENT_SOURCE,
  isEngineeringEventType,
  type EngineeringEventPayloadMap,
} from "@rtb/types";
```

## Subscribers

| Consumer | Events |
|----------|--------|
| Timeline / Activity | All `engineering.*` register events |
| Project Intelligence | Register lifecycle + sync events |
| Notifications | `engineering.decision.approved`, high-severity risks |
| Audit | All write events |

## Rules

1. Engineering decisions publish `engineering.decision.approved` only after **human** approval
2. Project Intelligence must not publish `engineering.decision.approved`
3. Sync events are advisory — canonical data remains in Engineering Core tables
