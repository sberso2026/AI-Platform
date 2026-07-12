# Project Intelligence Document Security

**Phase:** 6C-2

## Enforcement chain

Tenant → Workspace → User → Subscription → Licence → Engineering OS → Project Intelligence install → Seat → Role → Permission

UI hiding never replaces API/RLS enforcement.

## Storage

- Private Platform storage; signed short-lived URLs only
- Server-side retrieval after tenant/workspace checks
- MIME + extension + size validation (PDF / TXT / DOCX, 25 MiB freeze)
- No client-supplied arbitrary storage paths
- No public service-role browser exposure
- Legacy buckets: migration/equivalence adapter only — not permanent runtime

## RLS

All `project_intelligence_document_*` tables enable RLS with:

- `tenant_id = ANY(get_user_tenant_ids())`
- workspace membership via `workspace_memberships`
- manage policies gated by `has_permission('engineering', 'admin', tenant_id)` (same pattern as batch 34 mappings)

Identity columns `tenant_id`, `workspace_id`, and `engineering_document_id` are immutable after insert (trigger).

Audit: `project_intelligence_document_audit` (insert + select under tenant/workspace scope).

## Error contract

Document domain uses `document_*` codes (see `documents/errors.ts`), nested as:

```json
{ "error": { "code": "document_access_denied", "message": "...", "details": {} } }
```
