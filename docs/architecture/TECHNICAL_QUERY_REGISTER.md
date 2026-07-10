# Technical Query Register

Engineering RFIs and technical queries (TQs) with threaded discussion foundation.

## Routes

| Layer | Path |
|-------|------|
| UI | `/engineering/technical-queries` |
| API | `GET/POST /api/engineering/technical-queries` |

## Fields

| Field | Notes |
|-------|-------|
| `tq_number` | Auto `TQ-####` |
| `question` | Primary content (also `title`) |
| `requester`, `responder` | `requester_id`, `responder_id` |
| `discipline`, `project` | Context |
| `linked_document` | `document_id` |
| `response`, `response_due`, `status` | Response lifecycle |

## Features

- **Threaded discussions** — via `engineering_object_comments`
- **AI draft response** — `ai_context` + Engineering AI workspace
- **Linked decisions** — `engineering_object_links` + KG edges

## Workflow

`tq_response` workflow for assign/respond/close.

## Relationships

- Technical Query `references` Document
- Decision may `support` response

## Events

`engineering.technical_query.created`, answer events on response update.

## AI Queries

*"Summarise unresolved technical queries"* — search + filter `status != answered`.
