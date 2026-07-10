# Engineering Timeline

Aggregated chronological view of all Engineering OS activity.

## Routes

| Layer | Path |
|-------|------|
| UI | `/engineering/timeline` |
| API | `GET /api/engineering/timeline?projectId=` |

## Data Model

Table: `engineering_timeline_events`

| Column | Purpose |
|--------|---------|
| `event_type` | e.g. `engineering.decision.approved` |
| `object_type`, `object_id` | Source register object |
| `project_id`, `asset_id` | Scope filters |
| `title`, `summary` | Display |
| `actor_id` | Who triggered the event |
| `occurred_at` | Sort key |

## Auto-Aggregated Events

Timeline merges activity from:

- Project created / updated
- Asset added
- Document uploaded
- Decision approved
- Action completed
- Issue raised
- Risk updated
- Technical query answered
- Lesson captured

`EngineeringObjectFramework.publishCreated()` writes timeline rows on register create. Approval and status changes write additional events from register services.

## Service

`EngineeringTimelineService.list(tenantId, limit, projectId?)` — tenant-scoped, RLS enforced.

## Future

- Real-time subscriptions via Supabase realtime on `engineering_timeline_events`
- Cross-link to object detail pages

## Related

Activity feed (`/engineering/activity`) provides real-time-oriented event stream; Timeline is chronological audit-style history.
