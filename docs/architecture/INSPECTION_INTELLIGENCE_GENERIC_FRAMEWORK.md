# Inspection Intelligence — Generic Inspection Framework

**Phase:** 9A · **Status:** LOCKED (architecture only)

## Purpose

Reusable inspection engine inherited by every future inspection discipline. No commercial feature depth in 9A.

## Core entities

| Entity | Ownership | Notes |
|--------|-----------|-------|
| `inspection_plan` | Inspection Intelligence | Scope, assets refs, cadence |
| `inspection_template` | Inspection Intelligence | Reusable checklist structure |
| `inspection_template_revision` | Inspection Intelligence | Immutable revision history |
| `inspection_session` | Inspection Intelligence | One execution instance |
| `inspection_assignment` | Inspection Intelligence | Inspector / crew assignment |
| `inspection_observation` | Inspection Intelligence | Qualitative / structured findings |
| `measurement` | Inspection Intelligence | See measurement framework |
| `inspection_evidence` | Inspection Intelligence | Links to Platform Files + metadata |
| `defect` | Inspection Intelligence | Process defect record (not Core register) |
| `recommendation` | Inspection Intelligence | Suggested actions |
| `inspection_review` | Inspection Intelligence | Review workflow state |
| `inspection_approval` | Inspection Intelligence | Approval workflow state |
| `inspection_report_derivative` | Inspection Intelligence | Reporting derivatives only |

## Canonical references (never owned here)

Every entity that needs context references Engineering OS shared-domain IDs:

- `project_id`, `asset_id`, `location_id`, `document_id`, `document_revision_id`
- `company_id`, `person_id` / `user_id`, `equipment_id`, `tag_id`, `package_id`, `discipline_id`
- `workspace_id`, `tenant_id` (Platform identity / workspace — not owned by II)

## Lifecycle state machine

States: Draft, Planned, Scheduled, Assigned, Started, Paused, Resumed, Completed, Submitted, Reviewed, Approved, Rejected, Verified, Closed, Cancelled, Archived.

Recurrence fields (plan/template): `frequency`, `interval`, `next_due_at`, `overdue`, history links, revision lineage.

## Workflow

Use **Platform Workflow Engine** for review/approval transitions. Do not embed a private workflow runtime.

## AI

Use **Platform AI Runtime** for assistive proposals only. Human review required before Core mutations. No private AI stack.

## Extension points

- Taxonomy tags / custom classifications
- Checklist item types
- Measurement methods / instruments
- Evidence MIME / capture channels
- Spatial reference kinds
- Mobile offline sync adapters (reserved)
- AI Vision inference adapters (reserved)
- Sensor streaming adapters (reserved)

## Non-goals (9A)

No production templates UI, no session execution UX, no measurements pipeline, no defect product depth.
