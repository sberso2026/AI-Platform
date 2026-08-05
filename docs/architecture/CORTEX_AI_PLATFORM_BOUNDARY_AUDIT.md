# Cortex AI — Platform Boundary Audit

**Phase:** 7A  
**Method:** Inventory classification only — no destructive data moves.

## Classification legend

| Class | Meaning |
|-------|---------|
| Platform Core | Reusable shared services |
| Shared Connector | Provider adapters / connector framework |
| Engineering OS | Domain OS package / routes |
| Project Intelligence | Engineering module under Eng OS |
| Certification/Test | Cert packages and workflows |
| Legacy or misplaced | Couples domain concerns into core; remediate carefully |

## Packages

| Path | Classification | Notes |
|------|----------------|-------|
| `packages/types` | Platform Core | Shared contracts; OS runtime types added in 7A |
| `packages/database` | Platform Core | Supabase client |
| `packages/platform-core` | Platform Core (+ Legacy) | Auth, nav, tenancy; Eng catalog keys in commerce adapter = Legacy |
| `packages/platform-kernel` | Platform Core | AI Director, events, jobs, workflow, KG, memory |
| `packages/platform-intelligence` | Platform Core | Tools, policies, prompts, models, cost |
| `packages/platform-commerce` | Platform Core (+ Legacy) | Commerce engine; some Eng path policies |
| `packages/plugin-sdk` | Platform Core | Manifest validation |
| `packages/ui` | Platform Core | Shared UI |
| `packages/engineering-os` | Engineering OS | Domain OS |
| `packages/project-intelligence` | Project Intelligence | Documents / Meetings |
| `packages/reference-os` | Certification/Test | Cert-only second OS |
| `packages/*-certification` | Certification/Test | Including `cortex-platform-certification` |
| `apps/web` | Mixed | Platform shell + Eng + PI routes |

## Platform Core allowlist (services)

Tenants, identity, workspaces, users/roles, installation, licensing/subscriptions, billing, audit, notifications, workflow, event bus, jobs, AI Director, model/prompt registries, policy/cost, agent runtime, KG/memory infrastructure, connector framework, marketplace/plugin lifecycle, observability, secrets, health, release governance.

## Must remain outside Platform Core

Engineering projects, assets, registers, inspections, TQs, engineering documents/calculations, PI intelligence derivatives, Eng-only workflows.

## Ambiguous / Legacy (tracked)

1. `OPERATING_SYSTEMS` static status — remediated to catalog + install-derived.
2. `ENGINEERING_NAVIGATION` always in `FULL_NAVIGATION` — remediated by install-gated visibility.
3. Commerce `/engineering/meetings` application key vs PI feature — documented under meeting stub analysis; not deleted in 7A.
4. `meeting_intelligence` stub — keep disabled.

## Destructive moves

**None in Phase 7A.**
