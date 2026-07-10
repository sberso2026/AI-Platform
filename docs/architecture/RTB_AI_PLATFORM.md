# RTB AI Platform

## Purpose

RTB AI Platform is the shared enterprise foundation for domain Operating Systems. Domain OSes (Engineering, Industrial, Fleet, etc.) install as plugins — they do not fork or modify platform core.

Batch 1.75 adds the Platform Intelligence Control Layer on top of the Phase 1.5 kernel.

## Hierarchy

```
RTB AI Platform
├── Platform Core          auth, tenants, workspaces, RBAC, audit
├── Platform Kernel        AI Director, events, jobs, workflows, plugins
├── Platform Intelligence  tools, policies, prompts, models, cost, evals…
└── Domain Operating Systems (installable apps / plugins)
    ├── Engineering OS     (Batch 2.0 Core — installed)
    ├── Industrial OS
    ├── Fleet OS
    └── …
```

## Design Rules

| Rule | Meaning |
|------|---------|
| Platform ≠ OS | Shared control plane; OSes are domain products |
| Installable apps | Each OS is a plugin with capability bounds |
| No fork | Domain logic lives in plugins, not core packages |
| Tenant isolation | RLS + `tenant_id` on domain tables |

## Packages

| Package | Role |
|---------|------|
| `@rtb/platform-core` | Auth, navigation, permissions |
| `@rtb/platform-kernel` | AI Director and kernel services |
| `@rtb/platform-intelligence` | Batch 1.75 control services |
| `@rtb/engineering-os` | Engineering OS Core (Batch 2.0) |
| `@rtb/plugin-sdk` | Manifest, validation, install contract |
| `@rtb/types` / `@rtb/database` | Shared contracts and Supabase |

## Surfaces

| Surface | Route / Entry |
|---------|---------------|
| Command Centre | `/command-centre` |
| Kernel admin | `/platform/*` (agents, events, jobs…) |
| Intelligence admin | `/platform/tools`, `/platform/policies`, … |
| Engineering OS | `/engineering/*`, APIs `/api/engineering/*` |
| Operating Systems | `/operating-systems` |

## Engineering OS (Batch 2.0)

Engineering OS Core is **installed** as the first domain OS:

- Package `@rtb/engineering-os` → `createEngineeringOS(supabase, kernel)`
- Feature flag `engineering_os_enabled` (per-tenant)
- Tenant seed `seed_tenant_engineering_os`
- Application registry holds future apps (Project Intelligence, etc.) — **registered only**, not implemented

Docs: [ENGINEERING_OS.md](./ENGINEERING_OS.md), [ENGINEERING_OS_READINESS.md](./ENGINEERING_OS_READINESS.md), [BATCH_2_READINESS.md](./BATCH_2_READINESS.md)

## Integration Points

- Kernel exposes `createPlatformKernel()` → includes `intelligence` via `createPlatformIntelligence()`
- Plugins declare capabilities; Policy Engine enforces OS scope and review gates
- Engineering AI runs via AI Director with mandatory human review for engineering decisions (no autonomous approval)

See also: [PLATFORM_INTELLIGENCE_LAYER.md](./PLATFORM_INTELLIGENCE_LAYER.md)
