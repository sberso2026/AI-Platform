# RTB AI Platform

Enterprise AI Platform — a modular foundation that powers multiple industry-specific Operating Systems from a shared intelligence core.

**Current phase: 2.0 — Engineering OS Core** (complete). Project Intelligence begins in Batch 2.1.

## Architecture

```
RTB AI Platform
├── apps/web                    Next.js dashboard, Command Centre, Engineering OS UI
├── packages/
│   ├── types                   Domain + kernel + intelligence + engineering types
│   ├── database                Supabase client, schema
│   ├── platform-core           Auth, audit, permissions, navigation
│   ├── platform-kernel         Platform kernel services (11 modules)
│   ├── platform-intelligence   Intelligence control layer (10 services)
│   ├── engineering-os          Engineering OS Core (Batch 2.0)
│   ├── plugin-sdk              Plugin manifest validation
│   └── ui                      Shared UI components
└── supabase/migrations         Versioned SQL with RLS
```

## Engineering OS Core (Batch 2.0)

| Module | Description |
|--------|-------------|
| Dashboard | Active projects, risk assets, AI runs, applications |
| Projects | Engineering project register with KG links |
| Assets | Asset register with Digital Twin links |
| Documents | Document register shell with events/KG |
| AI Workspace | Engineering AI wired to AI Director + policies |
| Search / Reports / Settings | Shell foundations for later applications |
| Application Runtime | Registry for future Engineering apps (not implemented) |

Feature flag: `engineering_os_enabled`

## Quick Start

```bash
pnpm install
cp .env.example apps/web/.env.local
supabase start && supabase db push
# Per tenant after migration:
# SELECT seed_tenant_intelligence('<tenant-id>');
# SELECT seed_tenant_engineering_os('<tenant-id>');
pnpm dev
```

## Engineering OS Routes

- `/engineering` — Dashboard
- `/engineering/projects` — Projects
- `/engineering/assets` — Assets
- `/engineering/documents` — Documents
- `/engineering/ai` — AI Workspace
- `/engineering/search` — Search shell
- `/engineering/reports` — Reports shell
- `/engineering/disciplines` — Disciplines
- `/engineering/companies` — Companies
- `/engineering/settings` — Settings

## Packages

| Package | Role |
|---------|------|
| `@rtb/types` | Shared domain types |
| `@rtb/database` | Supabase client + schema types |
| `@rtb/platform-core` | Auth, tenancy, permissions, navigation |
| `@rtb/platform-kernel` | Kernel services + AI Director |
| `@rtb/platform-intelligence` | Intelligence control layer |
| `@rtb/engineering-os` | Engineering OS Core product application |
| `@rtb/plugin-sdk` | Plugin manifest validation |
| `@rtb/ui` | Shared UI |
| `@rtb/web` | Next.js app |

## Tests

```bash
pnpm test
pnpm typecheck
pnpm build
```
