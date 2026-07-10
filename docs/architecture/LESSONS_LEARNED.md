# Lessons Learned Register

Capture engineering knowledge for retrieval, decisions, and AI reasoning.

## Routes

| Layer | Path |
|-------|------|
| UI | `/engineering/lessons` |
| API | `GET/POST /api/engineering/lessons` |

## Fields

| Field | Notes |
|-------|-------|
| `lesson_number` | Auto `LL-####` |
| `project`, `discipline`, `category` | Context |
| `lesson` | Core knowledge text |
| `recommendation` | Actionable guidance |
| `root_cause` | Optional RCA |
| `lesson_references` | JSON references (not SQL `references`) |

## Relationships

- Lesson `derived_from` Decision
- Lesson `references` Document

## AI Retrieval

Lessons indexed in Knowledge Graph as `engineering_lesson` nodes. AI queries like *"What lessons relate to anchor bolt failures?"* use search + KG traversal.

## Events

`engineering.lesson.created` → Timeline + Activity.

## Report Shell

Lessons Learned Report template at `/engineering/reports` (export later).
