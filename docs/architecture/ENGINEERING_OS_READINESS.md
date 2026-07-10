# Engineering OS Readiness

## Purpose

Track readiness of Engineering OS on **RTB AI Platform**. Batch 2.0 delivered **Engineering OS Core**. This document marks Core as complete and points forward to Batch 2.1 (Project Intelligence).

Earlier revisions of this file gated *starting* Core. That gate is closed: Core is **Delivered**.

## Status Summary

| Layer | Status | Evidence |
|-------|--------|----------|
| Platform Core | Complete | Auth, tenants, workspaces, RBAC, audit |
| Platform Kernel (1.5) | Complete | AI Director, events, jobs, workflows, plugins |
| Platform Intelligence (1.75) | Complete | Ten control services + RLS + admin UI |
| Engineering OS Core (2.0) | **Delivered** | `@rtb/engineering-os`, `/engineering/*`, `/api/engineering/*` |
| Project Intelligence (2.1) | **Not started** | Registered in app catalog only |

## Feature Flag

| Key | Role |
|-----|------|
| `engineering_os_enabled` | Per-tenant gate for Engineering OS Core APIs / AI |

Legacy mention of `engineering_os` (experimental catalog key) may still exist in older seeds; **operational flag for Core is `engineering_os_enabled`**.

Enable per tenant (typically via `seed_tenant_engineering_os`) only after smoke checks pass for that environment.

## Core Completion Checklist

- [x] Plugin package `@rtb/engineering-os` with `createEngineeringOS`
- [x] Domain tables + RLS + indexes
- [x] Seed: disciplines, asset types, app registry, capabilities, tools, policies, prompts, agent
- [x] Roles extended (Engineering Owner/Manager/Lead/Engineer/…)
- [x] UI shells: dashboard, projects, assets, documents, AI, search, reports, settings, disciplines, companies
- [x] Application runtime registry (apps registered, product logic not built)
- [x] AI workspace enforces human review — no autonomous approval
- [x] Eval dataset `engineering_smoke`

## Forward Gate — Batch 2.1

See [BATCH_2_READINESS.md](./BATCH_2_READINESS.md). Project Intelligence is **registered**, not implemented.

Remaining before 2.1 build:

1. Accept Project Intelligence product scope
2. Implement app behind registry + permissions
3. Extend evals for project-analytics intents
4. Enable app installations per tenant after QA

## Explicitly Out of Scope (Still)

- Autonomous engineering approvals
- Full product apps (Inspection / Document / Meeting / Structural / Standards Intelligence, Project Controls)
- Claiming Project Intelligence is shipped

## Related Docs

- [ENGINEERING_OS.md](./ENGINEERING_OS.md)
- [ENGINEERING_OS_CORE.md](./ENGINEERING_OS_CORE.md)
- [BATCH_2_READINESS.md](./BATCH_2_READINESS.md)
- [RTB_AI_PLATFORM.md](./RTB_AI_PLATFORM.md)
- [PLATFORM_INTELLIGENCE_LAYER.md](./PLATFORM_INTELLIGENCE_LAYER.md)
- [POLICY_ENGINE.md](./POLICY_ENGINE.md)
- [FEATURE_FLAGS.md](./FEATURE_FLAGS.md)

## Decision Mark

| Field | Value |
|-------|-------|
| Engineering OS Core | **Delivered / Ready for Batch 2.1** |
| Ready to start Project Intelligence | Yes (Core prereqs met) — kickoff still required |
| Project Intelligence built | **No** |
| Owner action | Review Batch 2.1 scope → implement app → enable installs after QA |
