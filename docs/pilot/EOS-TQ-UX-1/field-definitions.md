# EOS-TQ-UX-1 Field definitions

Canonical table: `engineering_technical_queries`. New operational fields that have no column are stored in `metadata` so source truth is not duplicated.

| Certification field | Storage | Notes |
| --- | --- | --- |
| tq_number | `tq_number` | System-generated `TQ-NNN` |
| title | `title` | Subject; defaults from query |
| query | `question` | Required on submit; locked after draft |
| suggested_solution | `metadata.suggested_solution` | Initiator proposal, not approval |
| client_response | `response` | Client / technical response |
| response_basis | `metadata.response_basis` | Evidence narrative |
| project_id | `project_id` | Canonical project |
| initiator_user_id | `requester_id` | Displayed as name/role, never UUID in UI |
| action_by_user_id | `assigned_to` | Displayed as name/role/company |
| reviewer_user_id | `metadata.reviewer_user_id` | Optional |
| approver_user_id | `metadata.approver_user_id` | Optional technical authority |
| discipline | `discipline_id` → `engineering_disciplines.name` | |
| area | `metadata.area` | |
| system | `metadata.system` | |
| subsystem | `metadata.subsystem` | |
| asset_id | `asset_id` | Canonical asset |
| work_package | `metadata.work_package` | |
| contract_package | `metadata.contract_package` | |
| classification | `metadata.classification` | Configurable list in workflow module |
| priority | `priority` | Stored `low/medium/high/critical`; UI Normal = medium |
| status | `status` | See workflow.md |
| date_raised | `created_at` / `metadata.date_raised` | |
| response_due_at | `response_due` | Required on submit |
| response_submitted_at | `metadata.response_submitted_at` | |
| accepted_at | `metadata.accepted_at` | |
| closed_at | `closed_date` / `metadata.closed_at` | |
| closeout_comments | `metadata.closeout_comments` | |

References use `engineering_object_links` rather than copying document/asset rows.
