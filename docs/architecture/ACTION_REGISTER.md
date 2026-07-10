# Action Register

Track engineering actions originating from decisions, risks, issues, inspections, meetings, AI, or future applications.

## Routes

| Layer | Path |
|-------|------|
| UI | `/engineering/actions` (table + kanban) |
| API | `GET/POST /api/engineering/actions` |

## Fields

| Field | Notes |
|-------|-------|
| `action_number` | Auto `ACT-####` |
| `title`, `owner`, `discipline`, `project`, `asset` | Standard object fields |
| `priority`, `status`, `due_date`, `completion_date` | Lifecycle |
| `originating_object`, `originating_type` | `originating_object_id`, `originating_object_type` |

## Origins

Actions may originate from:

- Decisions, Risks, Issues
- Inspections, Meetings (future apps)
- AI recommendations
- Project Intelligence (future)

## Views

- **Table** — list with due dates and status
- **Kanban** — columns: `open`, `in_progress`, `completed`, `cancelled`
- Calendar view — planned in future UI enhancement

## Workflow

`action_closeout` workflow for completion sign-off.

## AI

AI priority suggestions stored in `ai_context`; search includes open actions by title.

## Events

`engineering.action.created` → Timeline + Activity.
