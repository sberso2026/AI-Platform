# EOS-TQ-UX-1 Architecture

Technical Query / RFI remains a **single canonical Engineering OS register**. This phase extends presentation, lifecycle actions, and UX on `engineering_technical_queries`. It does not add a second TQ system, workflow engine, identity model, document store, notification service, or AI stack.

## Canonical ownership

| Concern | Owner |
| --- | --- |
| TQ entity | `engineering_technical_queries` |
| Numbering | `EngineeringTechnicalQueryService` (`TQ-NNN`) |
| Status persist | `mapTechnicalQueryStatus` + workflow statuses in TEXT column (no second CHECK) |
| Extra fields | `metadata` JSON (suggested solution, classification, area/system, reviewer/approver, response basis, closeout) |
| Query text | `question` (locked after submit) |
| Client/technical response | `response` |
| Initiator | `requester_id` |
| Action By | `assigned_to` (+ `responder_id`) |
| People display | `profiles` + `workspace_memberships` + `roles` |
| References | `engineering_object_links` → documents/assets/actions/TQs |
| Attachments | Canonical document upload, then link |
| Audit | `engineering_timeline_events` / `engineering_activity_events` / `engineering_audit_links` |
| Notifications | Kernel `notifications.create` in-app only (`task.assigned`, `review.required`) |
| AI | Existing Ask Engineering AI / Director via `AskThisObjectLink` |
| Print | Browser print CSS (no new PDF stack) |

## API

- `GET /api/engineering/technical-queries` — presented register (`view`, filters, search)
- `GET /api/engineering/technical-queries/directory` — workspace people for assignment
- `GET /api/engineering/technical-queries/[id]` — detail + capabilities
- `POST /api/engineering/technical-queries` — create (`submit: true` for governed submit; omitted = legacy create)
- `PATCH /api/engineering/technical-queries` — `{ id, response }` remains valid; `{ id, action }` for save_draft, submit, assign, save_response_draft, submit_response, request_clarification, accept, close, reopen, comment, link

## Isolation

List/get/update remain tenant + workspace scoped through existing commerce guards and `workspace_id` checks. Cross-tenant rows are not returned. Viewer role cannot PATCH.

## Out of scope

- External email/system write
- Autonomous AI approval/close
- Duplicate workflow engine
- Production promotion
- External user invite
