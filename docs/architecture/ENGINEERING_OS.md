# Engineering OS

## Purpose

Engineering OS is the first domain Operating System on **RTB AI Platform**. Batch 2.0 delivers **Engineering OS Core** — shared foundation for projects, assets, documents, disciplines, companies, search, reporting shell, settings, and AI workspace.

Package: `@rtb/engineering-os` via `createEngineeringOS(supabase, kernel)`.

## Product Application Model

```
RTB AI Platform
└── Engineering OS Core (@rtb/engineering-os)
    ├── Core modules (dashboard, projects, assets, documents, …)
    └── Application Runtime (registry only in Batch 2.0)
        ├── Project Intelligence      ← registered, not built
        ├── Inspection Intelligence   ← registered, not built
        ├── Project Controls          ← registered, not built
        ├── Document / Meeting / Structural / Standards Intelligence
        └── Engineering Reports app   ← registered, not built
```

Core owns shared entities and UX shells. Future apps install on top via the application registry — they do not fork Core.

## Hierarchy

| Layer | Role |
|-------|------|
| Platform Core / Kernel / Intelligence | Auth, RBAC, AI Director, policies, prompts, flags |
| Engineering OS Core | Domain entities, services, `/engineering/*` UI |
| Engineering Applications | Product apps (Batch 2.1+); registry populated now |

## Surfaces

| Surface | Path |
|---------|------|
| UI | `/engineering/*` |
| API | `/api/engineering/*` |
| Feature flag | `engineering_os_enabled` (per-tenant) |
| Seed | `seed_tenant_engineering_os(tenant_id)` |

## Design Rules

| Rule | Meaning |
|------|---------|
| Platform ≠ OS | Domain logic lives in `@rtb/engineering-os`, not platform packages |
| Core first | Apps depend on Core capabilities; Core does not depend on apps |
| No autonomous approval | Engineering AI never approves design/safety decisions alone |
| Tenant isolation | RLS + `tenant_id` on all domain tables |
| Flag-gated | APIs/AI check `engineering_os_enabled` before use |

## Status (Batch 2.0)

**Delivered:** Engineering OS Core (entities, services, UI shells, registry, policies, seed).

**Not delivered:** Project Intelligence and other registered apps — see [BATCH_2_READINESS.md](./BATCH_2_READINESS.md).

## Related Docs

- [ENGINEERING_OS_CORE.md](./ENGINEERING_OS_CORE.md)
- [ENGINEERING_OS_APPLICATION_RUNTIME.md](./ENGINEERING_OS_APPLICATION_RUNTIME.md)
- [ENGINEERING_OS_DATABASE.md](./ENGINEERING_OS_DATABASE.md)
- [ENGINEERING_OS_AI.md](./ENGINEERING_OS_AI.md)
- [ENGINEERING_OS_PERMISSIONS.md](./ENGINEERING_OS_PERMISSIONS.md)
- [ENGINEERING_OS_READINESS.md](./ENGINEERING_OS_READINESS.md)
- [RTB_AI_PLATFORM.md](./RTB_AI_PLATFORM.md)
