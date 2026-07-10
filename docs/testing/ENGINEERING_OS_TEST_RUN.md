# Engineering OS Test Run Guide

Batch **2.06** — internal test readiness for Engineering OS Core.

## Prerequisites

1. Supabase running with migrations through `20260205000000_batch_206_demo_data.sql`
2. Tenant created with active user membership
3. `seed_tenant_engineering_os(tenant_id)` executed for the tenant
4. User logged into the web app

## Quick Start

1. Open **Engineering OS → Health Check** (`/engineering/health`)
2. Confirm all checks are `ok` or `degraded` (not `error`)
3. Click **Seed Demo Data**
4. Open **Test Runner** (`/engineering/test-runner`)
5. Click **Run Automated Checks**
6. Manually verify AI Workspace and policy items

## Test Checklist

### Access

| Step | How to verify |
|------|----------------|
| Login | User session active; API returns 401 when logged out |
| Tenant access | `tenant_memberships` row with `status=active` |
| Feature flag | Health check shows `engineering_os_enabled` enabled |

### Core Entities

| Step | Route | Expected |
|------|-------|----------|
| Project creation | `/engineering/projects` | List shows DEMO-PRJ-* after seed |
| Asset creation | `/engineering/assets` | 5 demo assets |
| Document registration | `/engineering/documents` | 4 demo documents |

### Intelligence Registers

| Register | Route | Demo count |
|----------|-------|------------|
| Decisions | `/engineering/decisions` | 3 (all `approval_status=pending`) |
| Actions | `/engineering/actions` | 5 |
| Risks | `/engineering/risks` | 3 |
| Issues | `/engineering/issues` | 2 |
| Technical Queries | `/engineering/technical-queries` | 2 |
| Lessons Learned | `/engineering/lessons` | 2 |

**Decision approval:** Decisions require human approval. Verify no autonomous approval path exists in AI Workspace.

### Intelligence Surfaces

| Step | Route | Expected |
|------|-------|----------|
| Dashboard counts | `/engineering` | Non-zero register counts after seed |
| Search | `/engineering/search?q=demo` | Matches across registers |
| Timeline | `/engineering/timeline` | Demo events present |
| Activity feed | `/engineering/activity` | Demo activity events |

### AI & Policy

| Step | How to verify |
|------|----------------|
| AI Workspace | `/engineering/ai` — submit prompt, receive response with meta |
| Policy review | Prompt with "approve" triggers `requiresReview: true` |

### Security

| Step | How to verify |
|------|----------------|
| RLS | Data scoped to tenant; second tenant sees no demo records |

## Demo Data API

```http
POST /api/engineering/demo/seed
POST /api/engineering/demo/reset
```

Demo records are marked `metadata.demo = true`. Reset **only** deletes demo-flagged records.

## SQL Functions

```sql
SELECT seed_engineering_os_demo_data('<tenant-uuid>');
SELECT reset_engineering_os_demo_data('<tenant-uuid>');
```

## Health Check API

```http
GET /api/engineering/health
```

Returns installation status, platform subsystem probes, and demo data presence.

## Pass Criteria

- All automated Test Runner checks pass (except manual/skipped)
- Demo seed + reset cycle works without affecting non-demo data
- Decision approval remains human-only
- Timeline and activity populate after seed

## Related Docs

- [PROJECT_INTELLIGENCE_INTEGRATION.md](../architecture/PROJECT_INTELLIGENCE_INTEGRATION.md)
- [ENGINEERING_OS_API_CONTRACTS.md](../architecture/ENGINEERING_OS_API_CONTRACTS.md)
- [ENGINEERING_REGISTERS.md](../architecture/ENGINEERING_REGISTERS.md)
