# Engineering Shared Project Domain

Phase 11B. Package: `packages/engineering-shared-project-domain` (`@rtb/engineering-shared-project-domain`).
Version: `0.1.0-shared-project-domain`. Owner key: `engineering_os_shared_project_domain`.

## Overview

The Engineering Shared Project Domain is the **identity layer** for projects and
the project hierarchy. It answers "which project is this, and where does this
thing sit inside it". It answers nothing about how a project is performing.

It is the sibling of the shared domain that already owns canonical asset identity
(`engineering_os_shared_domain`). Phase 11A recorded project identity ownership as
the placeholder `engineering_core` and explicitly deferred unifying the two
spellings to Phase 11B. This package is that unification.

## Identity ownership decision

| Concern | Owner | Physical store |
| --- | --- | --- |
| Canonical project identity | `engineering_os_shared_project_domain` | `engineering_projects` (batch_20) |
| Canonical project hierarchy | `engineering_os_shared_project_domain` | batch_61 reference tables |
| Canonical asset identity | `engineering_os_shared_domain` | `engineering_assets` |
| Canonical engineering risk | `engineering_core` | `engineering_risks` |

`CANONICAL_PROJECT_IDENTITY_OWNERSHIP = "engineering_os_shared_project_domain"`.

## Document unification: logical owner vs physical store

Two things are deliberately kept apart:

- The **logical owner** is the Engineering Shared Project Domain. It defines the
  reference types, the resolution port, and the rule that consumers may read but
  never write.
- The **physical store** is `engineering_projects`, which already existed before
  Phase 11B and is **not modified, replaced or forked**. Batch_61 adds hierarchy
  reference tables beside it; batch_20 stays untouched.

Nothing in Phase 11B introduces a second project table. There is exactly one
project record, and exactly one logical owner of it.

## Reference types

All published from `src/references.ts`. Every reference carries `owner` and
`mutable: false`, so a consumer cannot forge or mutate identity through the type
system.

| Type | Backing table |
| --- | --- |
| `ProjectReference` | `engineering_projects` |
| `PhaseReference` | `engineering_project_phases` |
| `WbsReference` | `engineering_wbs_nodes` |
| `WorkPackageReference` | `engineering_work_packages` |
| `ActivityReference` | `engineering_activities` |
| `MilestoneReference` | `engineering_milestones` |
| `CalendarReference` | reserved (type published, no table yet) |
| `OrganizationReference` | reserved (nearest existing: `engineering_companies`) |
| `DisciplineReference` | `engineering_disciplines` (batch_20) |
| `LocationReference` | reserved (nearest existing: `engineering_projects.location`) |

`ProjectScope` (`kind` + `projectId` + optional `referenceId`) is the shape a
consumer attaches its own intelligence to.

## Resolution port

`SharedProjectDomainPort` is **read-only by construction** — it exposes no write
method, so identity mutation is impossible rather than merely discouraged.

```ts
resolveProjectReference(query): Promise<ProjectReference | null>
resolvePhaseReference / resolveWbsReference / resolveWorkPackageReference
resolveActivityReference / resolveMilestoneReference
resolveScope({ scope }): Promise<SharedProjectDomainReference | null>
```

Adapters:

- `MemorySharedProjectDomainPort` — tests and certification units only.
- `PostgresSharedProjectDomainPort` — reads `engineering_projects` and the
  batch_61 tables through Supabase.
- `createSharedProjectDomainPort()` — factory; throws
  `production_memory_repository_forbidden` if production selects memory.

`requireProjectReference()` fails closed with `project_reference_not_found`, which
is the single well-known error code for unknown identity.

## Consumers

`SANCTIONED_PROJECT_REFERENCE_CONSUMERS`: `project_intelligence`,
`project_controls`, `asset_intelligence`, `inspection_intelligence`,
`engineering_core`. All read-only.

Project Controls consumes `ProjectReference` **only**. It never writes
`engineering_projects` and never keeps a competing project record; the
denormalised `project_code` / `project_name` columns on
`project_controls_project_profiles` are display copies of a resolved reference,
constrained by `is_project_registry = false`.

## What this layer must never contain

`PROGRESS_MEASUREMENT_IN_SHARED_DOMAIN`, `EARNED_VALUE_IN_SHARED_DOMAIN`,
`CPM_IN_SHARED_DOMAIN`, `COST_IN_SHARED_DOMAIN` and
`FORECASTING_IN_SHARED_DOMAIN` are all `false`, asserted by
`assertSharedProjectDomainOwnershipLock()`. The batch_61 tables reinforce it in
SQL: `contains_progress_measurement`, `contains_earned_value`,
`contains_cost_data` and `contains_computed_schedule` are CHECK-constrained to
false, and `identity_owner` is CHECK-constrained to
`engineering_os_shared_project_domain`.

`engineering_milestones.target_date` is a declared contractual or target date. It
is never a scheduling engine output — there is no scheduling engine.

## Migration

`supabase/migrations/20260808010000_batch_61_shared_project_domain_references.sql`

Additive. RLS mirrors `engineering_projects`: `get_user_tenant_ids()` for SELECT,
plus `has_permission('engineering', 'execute', tenant_id)` for INSERT/UPDATE and
`has_permission('engineering', 'admin', tenant_id)` for DELETE.
