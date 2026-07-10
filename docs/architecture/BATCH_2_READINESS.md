# Batch 2.1 Readiness — Project Intelligence

## Purpose

Gate for starting **Project Intelligence** (first Engineering product app) on RTB AI Platform. Prerequisites are Engineering OS Core (Batch 2.0).

This document does **not** claim Project Intelligence is implemented.

## Core Delivered (Batch 2.0)

| Area | Status |
|------|--------|
| Package `@rtb/engineering-os` | Delivered |
| Routes `/engineering/*` + APIs `/api/engineering/*` | Delivered |
| Flag `engineering_os_enabled` | Delivered (default off; seed can enable per tenant) |
| Projects / assets / documents / search / settings | Delivered |
| Application registry + install toggles | Delivered (registry only) |
| AI workspace + review policies | Delivered (no autonomous approval) |
| `seed_tenant_engineering_os` | Delivered |

## Readiness Criteria for Batch 2.1

- [x] Engineering OS Core package and UI shells
- [x] Domain tables + RLS
- [x] `project_intelligence` row in `engineering_application_registry`
- [x] Capability `engineering_project_management` seeded
- [x] Permissions `engineering.view`, `engineering.ai.use` defined
- [x] Policy: engineering decisions require human review
- [x] Eval smoke dataset `engineering_smoke`
- [ ] Product scope / UX for Project Intelligence accepted
- [ ] App package (or Core module slice) with real analytics APIs
- [ ] Tenant install path exercised end-to-end with flag + permissions
- [ ] Security review of app-specific tools/prompts

## Explicitly Out of Scope Until Kickoff

- Project Intelligence UI under `/engineering/apps/project-intelligence`
- Appraisal / schedule / risk product logic
- Enabling `project_intelligence` for production tenants by default

## Suggested Kickoff Sequence

1. Accept Batch 2.1 scope (analytics vs decision-support MVP)
2. Implement app behind registry enablement + `engineering_os_enabled`
3. Bind new tools/prompts to existing Policy Engine
4. Smoke evals for project analytics intents (still no autonomous approval)
5. Enable app installations per tenant after QA

## Related

- [ENGINEERING_OS.md](./ENGINEERING_OS.md)
- [ENGINEERING_OS_APPLICATION_RUNTIME.md](./ENGINEERING_OS_APPLICATION_RUNTIME.md)
- [ENGINEERING_OS_READINESS.md](./ENGINEERING_OS_READINESS.md)
- [ENGINEERING_OS_AI.md](./ENGINEERING_OS_AI.md)

## Decision Mark

| Field | Value |
|-------|-------|
| Engineering OS Core | **Delivered** |
| Ready to start Project Intelligence | **Yes — Core ready**; product kickoff still required |
| Project Intelligence built | **No** |
