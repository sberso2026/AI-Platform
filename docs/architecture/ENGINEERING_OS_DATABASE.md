# Engineering OS Database

## Purpose

Batch 2.0 schema for Engineering OS Core on RTB AI Platform.

Migrations:

- `20260203000000_batch_20_engineering_tables.sql`
- `20260203000001_batch_20_engineering_rls.sql`
- `20260203000002_batch_20_engineering_seed.sql`
- `20260207000000_discipline_dedupe.sql` — unique indexes, seed idempotency, duplicate cleanup

## Tables

| Table | Notes |
|-------|--------|
| `engineering_disciplines` | System (`tenant_id` NULL) + tenant copies |
| `engineering_companies` | Company types: owner, consultant, contractor, … |
| `engineering_company_contacts` | Contacts per company |
| `engineering_asset_types` | System + tenant type catalog |
| `engineering_projects` | Unique `(tenant_id, project_code)` |
| `engineering_project_members` | User ↔ project + `role_slug` |
| `engineering_assets` | Unique `(tenant_id, asset_tag)`; parent hierarchy |
| `engineering_documents` | Unique `(tenant_id, document_number, revision)` |
| `engineering_document_versions` | Revision history |
| `engineering_tags` / `engineering_entity_tags` | Tags on project/asset/document/company |
| `engineering_application_registry` | Global app catalog |
| `engineering_application_installations` | Per-tenant installs |
| `engineering_settings` | One row per tenant |
| `engineering_audit_links` | Entity ↔ audit event refs |

## Key Indexes

- Projects: tenant, workspace, `(tenant_id, status)`, `(tenant_id, project_code)`
- Assets: tenant, workspace, project, tag, status, parent
- Documents: tenant, workspace, project, number, status
- Companies / tags / settings / audit / installations: tenant (+ type / entity as needed)
- Disciplines / asset types: unique key per tenant; unique system key when `tenant_id` IS NULL

### Disciplines uniqueness

| Scope | Constraint |
|-------|------------|
| Tenant | `UNIQUE (tenant_id, discipline_key) WHERE tenant_id IS NOT NULL` |
| System | `UNIQUE (discipline_key) WHERE tenant_id IS NULL AND is_system = TRUE` |

System and tenant rows may share the same `discipline_key` in storage.
The user-facing list (`EngineeringDisciplineService.list`) returns **one row per key/name**, preferring the tenant copy.

Debug: `GET /api/engineering/disciplines?debug=1` may include a `source` field (`system` | `tenant`).

## RLS Pattern

All domain tables enable RLS.

| Pattern | Policy intent |
|---------|----------------|
| Select | `tenant_id = ANY(get_user_tenant_ids())` (system catalogs also allow `tenant_id IS NULL`) |
| Insert/Update | Tenant membership + `has_permission('engineering', 'execute', …)` |
| Delete / admin manage | `has_permission('engineering', 'admin', …)` |
| App registry | Globally readable (`SELECT USING (TRUE)`) |
| Installations / settings | Admin manage |

Document versions inherit access via parent `engineering_documents` tenant check.

## Seed Function: `seed_tenant_engineering_os`

`CREATE OR REPLACE FUNCTION seed_tenant_engineering_os(p_tenant_id UUID)`

Per-tenant bootstrap (idempotent):

1. Enable feature flag `engineering_os_enabled` (production, 100%)
2. Insert `engineering_settings` row
3. Copy system disciplines to tenant **only when that key is not already present**
4. Insert Engineering capabilities, tools, policies, prompts, agent `engineering-director`
5. Ensure knowledge node/edge types for project/asset/document
6. Call `seed_tenant_engineering_registers` when available

Also seeded globally: system disciplines & asset types, application registry rows, feature definition, `engineering_smoke` eval dataset, extended default roles (incl. Engineering Owner/Manager/Lead/Engineer/…).

### Duplicate cleanup

Migration `20260207000000_discipline_dedupe.sql` merges duplicate tenant discipline rows
with the same key, remaps FKs from assets/documents/registers onto the kept row, then deletes extras.

## Related

- [ENGINEERING_OS_CORE.md](./ENGINEERING_OS_CORE.md)
- [ENGINEERING_OS_PERMISSIONS.md](./ENGINEERING_OS_PERMISSIONS.md)
- [DATABASE.md](./DATABASE.md)
