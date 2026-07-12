# Project Intelligence Mapping

**Phase:** 6B  
**Table:** `project_intelligence_project_mappings`  
**Audit:** `project_intelligence_mapping_audit`

---

## Purpose

Map legacy standalone Project Intelligence projects to Engineering Core projects **without** migrating register data in Phase 6B.

---

## Mapping statuses

`discovered` → `candidate` → `matched` / `conflict` → `pending_review` → `approved` → `migrated` → `verified`

Terminal / recovery: `failed`, `rolled_back`, `retired`

---

## Rules

1. One **active** mapping per Engineering Core project per workspace.  
2. One **active** mapping per legacy PI project (per `legacy_source_system`).  
3. Confidence score ∈ [0, 1]; low confidence cannot be auto-approved.  
4. Cross-tenant and cross-workspace mappings prohibited.  
5. `migration_source` is immutable after approval (trigger enforced).  
6. Approval does **not** migrate decisions/actions/risks/documents.  
7. All review actions are audited with immutable `event_id`.

---

## Review UI

Route: `/engineering/apps/project-intelligence/migration`

Actions: approve, reject, mark conflict, defer, (create Core project via Core services only).

---

## Events

Publish (tenant + workspace scoped, idempotent):

- `project_intelligence.mapping.discovered`
- `project_intelligence.mapping.candidate_created`
- `project_intelligence.mapping.conflict_detected`
- `project_intelligence.mapping.approved`
- `project_intelligence.mapping.rejected`
- `project_intelligence.sync.requested`
- `project_intelligence.sync.completed`
- `project_intelligence.sync.failed`
