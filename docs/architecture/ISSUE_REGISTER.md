# Issue Register

Engineering issues requiring investigation. Issues may promote to Decision, Risk, or Action.

## Routes

| Layer | Path |
|-------|------|
| UI | `/engineering/issues` |
| API | `GET/POST /api/engineering/issues` |
| Promote | `POST` body `{ action: "promote_to_decision", id }` |

## Fields

| Field | Notes |
|-------|-------|
| `issue_number` | Auto `ISS-####` |
| `issue_type`, `category` | Classification |
| `discovered_by` | User reference |
| `project`, `asset`, `discipline` | Context |
| `impact`, `status` | Severity and lifecycle |
| `investigation`, `resolution` | Narrative fields |

## Lifecycle

Typical flow: `open` → `investigating` → `resolved` / `closed`

Promotion paths:

- Issue → Decision (`becomes`)
- Issue → Risk (`creates`)
- Issue → Action (`creates`)

## Workflow

`issue_investigation` workflow for structured investigation.

## Events

`engineering.issue.created` → Timeline + Activity.

## AI

Investigation summaries and root-cause drafts in `ai_context`.
