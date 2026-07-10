# Decision Register

Engineering decisions require **human approval** — the platform never autonomously approves engineering decisions.

## Purpose

Capture formal engineering decisions with recommendation, rationale, alternatives, consequences, and approval workflow.

## Routes

| Layer | Path |
|-------|------|
| UI | `/engineering/decisions` |
| API | `GET/POST /api/engineering/decisions` |
| Approve | `POST` body `{ action: "approve", id }` |

## Fields

| Field | Notes |
|-------|-------|
| `decision_number` | Auto-generated `DEC-####` |
| `title`, `description` | Core object fields |
| `decision_type`, `category` | Classification |
| `engineering_discipline` | Via `discipline_id` |
| `project`, `asset` | `project_id`, `asset_id` |
| `recommendation`, `rationale` | Decision content |
| `alternatives` | JSON array |
| `consequences` | Impact narrative |
| `confidence` | 0–1 AI/human confidence |
| `review_status`, `approval_status` | Workflow states |
| `approved_by`, `decision_date` | Set on approval |

## Relationships

Decisions link to:

- Risks (`mitigates`)
- Actions (`creates`)
- Documents (`supports`)
- Assets (`affected_by`)
- Technical Queries (`references`)
- Lessons Learned (`derived_from`)

Links stored in `engineering_object_links` with optional KG edges.

## Workflow

`decision_approval` workflow seeded per tenant. `workflow_instance_id` stored on record.

## AI

- AI recommendation panel supported via `ai_context` and Engineering AI workspace
- Approval keywords trigger policy review (`approve`, `sign off`, `certify`)
- AI may draft recommendations; **approval is always human**

## Events

- `engineering.decision.created`
- `engineering.decision.approved`

Both appear on Timeline and Activity feed.
