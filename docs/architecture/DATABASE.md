# Database Schema

## Entity Relationship

```
auth.users
    │
    └── profiles (1:1)
            │
            ├── tenant_memberships ──► tenants
            │         │                    │
            │         └── roles            ├── workspaces
            │                              │       └── workspace_memberships
            │                              ├── installed_plugins
            │                              ├── audit_events
            │                              ├── command_centre_sessions
            │                              │       └── command_centre_messages
            │                              └── platform_settings
            └── command_centre_sessions (user_id)
```

## Tables

### tenants

Organization-level isolation boundary.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | TEXT | Display name |
| slug | TEXT | Unique URL identifier |
| status | TEXT | active, suspended, archived |
| settings | JSONB | Branding, timezone, locale |

**Triggers:** Auto-creates default roles and workspace on insert.

### profiles

Extends `auth.users` with platform-specific fields.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | FK → auth.users |
| email | TEXT | Synced from auth |
| full_name | TEXT | |
| avatar_url | TEXT | |
| status | TEXT | active, invited, suspended, deactivated |
| metadata | JSONB | Job title, preferences |

**Triggers:** Auto-created on auth.users insert.

### roles

Tenant-scoped RBAC roles.

| Column | Type | Notes |
|--------|------|-------|
| permissions | JSONB | Array of {resource, action, scope?} |
| is_system | BOOLEAN | Cannot be deleted if true |

**System roles:** owner, admin, member, viewer (created per tenant).

### workspaces

Logical environments within a tenant.

| Column | Type | Notes |
|--------|------|-------|
| type | TEXT | default, project, department, sandbox |
| settings | JSONB | Default OS, feature flags |

### audit_events

**Immutable.** Updates and deletes are blocked by triggers.

| Column | Type | Notes |
|--------|------|-------|
| action | TEXT | create, read, update, delete, login, approve, etc. |
| resource_type | TEXT | Entity type |
| resource_id | TEXT | Entity identifier |
| metadata | JSONB | Contextual data |
| ip_address | INET | Request origin |
| user_agent | TEXT | Client info |

### command_centre_sessions / command_centre_messages

AI conversation persistence for the Command Centre.

### platform_settings

Key-value settings scoped to tenant or workspace.

## Row Level Security

All tables have RLS enabled. Key policies:

| Table | Policy | Rule |
|-------|--------|------|
| tenants | select_member | User must be active tenant member |
| roles | manage_admin | Requires role:admin permission |
| audit_events | select | Requires audit:read permission |
| audit_events | insert | Any active tenant member |
| command_centre_sessions | select | Own sessions or command_centre:admin |

## Helper Functions

- `get_user_tenant_ids()` — Returns UUID[] of user's active tenants
- `is_tenant_member(tenant_id)` — Boolean membership check
- `has_permission(resource, action, tenant_id)` — RBAC check
- `create_default_tenant_roles(tenant_id)` — Provisions system roles

## Migrations

| File | Purpose |
|------|---------|
| `20260101000000_platform_core.sql` | Core tables, triggers |
| `20260101000001_rls_policies.sql` | RLS policies and helper functions |
| `20260101000002_seed_data.sql` | Default role provisioning |

## Rollback Strategy

Each migration is additive. Rollback:

1. Drop RLS policies
2. Drop tables in reverse dependency order
3. Drop helper functions

Production rollbacks require a new forward migration that reverses changes.

## Future Schema (Phase 2+)

- `knowledge_documents`, `knowledge_chunks` (with pgvector embeddings)
- `workflows`, `workflow_runs`, `workflow_tasks`
- `digital_twin_assets`, `sensor_readings`
- `ai_agent_sessions`, `ai_tool_executions`
