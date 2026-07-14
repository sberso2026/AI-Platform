# Project Intelligence Meeting Versioning

Phase: 6C-3C  
Status: authoritative  
Product: Engineering OS → Project Intelligence → Meetings  

## Version axes

A meeting preserves independent version axes:

| Axis | Field / table | Purpose |
|------|---------------|---------|
| Session | `project_intelligence_meeting_sessions.id` | Durable meeting identity |
| Lifecycle state | `state_version` | Optimistic concurrency for status transitions |
| Transcript revision set | `revision_number` on segments + revisions table | Ordered spoken content lineage |
| Processing | `project_intelligence_meeting_processing_runs` | One active AI/normalization run |
| Proposal set | proposals tied to `processing_run_id` | Extracted candidates |
| Minutes | `project_intelligence_meeting_minutes` + versions | Immutable MoM drafts |
| Review | review items / review_state | Human governance |
| Approval | approval audit events | Irreversible decision record |
| Evidence | evidence rows + citation payload | Grounding artifacts |

## Relationship

```
Meeting session
  → Transcript revision set
    → Processing run
      → Proposal set
        → Minutes draft version
          → Review changes
            → Approved minutes version
              → Completed meeting record
```

## Artifact metadata (required)

Every generated or approved artifact MUST reference:

- `meeting_session_id`
- meeting `state_version` at generation time
- transcript revision set / checksum
- `processing_run_id`
- `model` and `prompt_version` (when AI-generated)
- evidence version / citation set
- `correlation_id`
- `created_at`
- `created_by` or `generated_by`

## Immutability rules

1. Never overwrite previously issued minutes; create a new version.
2. Approved/issued minutes content hash is immutable.
3. Revising a transcript segment keeps the original logical sequence identity.
4. Late transcript events never renumber committed history.
5. Converted Core records store backlinks; proposals become `converted_to_core`.
6. Legal hold prevents deletion of evidence and issued artifacts.

## Phase 6C-3C boundaries

- Users enqueue processing; workers own `processing` → `minutes_draft`.
- Humans own review, approval, issue, and Core conversion.
- AI cannot approve, issue, or write Core.

## Provider mapping axes (6C-3D / 6C-3E)

Teams provider mappings attach to an existing PI meeting session without creating a second session axis:

- Provider connection is tenant/workspace scoped.
- `provider_meeting_id` maps idempotently onto `project_intelligence_meeting_sessions`.
- Transcript ingest still respects `logical_sequence` → `revision_number` → `server_received_at`.
- Live Entra certification does not bypass versioning, outbox, or human review boundaries.
