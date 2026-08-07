# Project Controls — Phase 11A existing footprint

Status: discovery · Module version: `0.1.0-discovery` · Phase: 11A

Before Phase 11A, "Project Controls" already appeared in the repository in
several places. None of them is a product. This document is the complete
inventory of that footprint so that Phase 11B can reason from fact rather than
from memory.

## Classification

Every entry below is classified with exactly one of:

| Class | Meaning |
| --- | --- |
| `stub` | A declared module/route/nav entry that renders or resolves to nothing |
| `entitlement-only` | Commerce/permission wiring that gates access but fronts no product |
| `docs-only` | Prose or a fixture that names Project Controls as a future party |
| `none` | Nothing exists for real product behaviour |

The aggregate classification for Project Controls before Phase 11A is
**stub + entitlement-only + docs-only, and `none` for real product**.

## Inventory

### 1. Engineering OS module registry — `stub`

`packages/engineering-os/src/module-registry.ts`

A full module descriptor exists but is inert:

- `id` / `moduleKey` / `commerceApplicationKey`: `project_controls`
- `name`: "Project Controls", description "Cost, schedule, and progress controls"
- `version`: `0.0.0`
- `status`: `coming_soon`
- `enabled`: `false`
- `workspaceVisibility`: `assigned`
- `routes`: one entry, `/engineering/apps/project-controls` → component
  `ProjectControlsHome` (the component does not exist)
- `navigation`: one entry, `module-project-controls`, icon `BarChart3`, group
  `engineering`, order `22`
- `permissions`: `{ resource: "engineering", action: "read" }`
- `searchProviders`: `["project_controls.progress"]`
- `aiCapabilities`: `["project_controls.forecast"]`
- `eventHandlers`: `["project_controls.*"]`

The `searchProviders`, `aiCapabilities` and `eventHandlers` entries are
*declared names only*. No provider, capability or handler is registered against
them anywhere in the repository.

### 2. Commerce access policy — `entitlement-only`

`packages/platform-commerce/src/domain/commerce-access-policy.ts`

- `actions.read` → `applicationKey: "project_controls"`, action `action.read`
- `actions.write` → `applicationKey: "project_controls"`, action `action.write`
- Route policy `/engineering/project-controls` → application `project_controls`,
  action `access`
- Route policy `/engineering/actions` → application `project_controls`, action
  `access`

Actions (the engineering action register) are commercially attributed to the
`project_controls` application key even though the register itself is an
Engineering Core surface. This is a *commercial packaging* decision, not an
ownership claim, and Phase 11A does not change it.

### 3. Engineering service policies — `entitlement-only`

`packages/platform-commerce/src/domain/engineering-service-policies.ts`

`action.list`, `action.get`, `action.create` and `action.search` are all mapped
to `applicationKey: "project_controls"`.

### 4. Web route guard prefix — `entitlement-only`

`apps/web/src/lib/commerce/guards.ts`

`APPLICATION_BY_PATH_PREFIX` maps the prefix `/engineering/project-controls` to
the application key `project_controls`. No page is served under that prefix.

### 5. Engineering modules catalog page — `stub`

`apps/web/src/app/(platform)/engineering/modules/page.tsx`

A catalog card with `key: "project_controls"`, href
`/engineering/apps/project-controls`, `status: "coming_soon"`, icon
`BarChart3`. The href is a dead link by design.

### 6. Shared module key union — `stub`

`packages/types/src/engineering-modules.ts`

`project_controls` is a member of `EngineeringInitialModuleKey` and of the
`ENGINEERING_INITIAL_MODULE_KEYS` array.

### 7. Inspection Intelligence consumer contract — `docs-only`

`packages/inspection-intelligence/src/domain/consumer-contracts.ts`

`PROJECT_CONTROLS_CONSUMER_FIXTURE` declares Project Controls as a future
consumer of II public contracts with `ownership: "none"` and
`accessMode: "public_contracts_only"`, and explicitly forbids
`project_controls_ownership_via_ii`.

### 8. Inspection Intelligence event subscribers — `docs-only`

`packages/inspection-intelligence/src/domain/engineering-events.ts`

`project_controls` is listed as a default subscriber name in the engineering
event envelope. No subscriber implementation exists.

### 9. Engineering OS module SDK future consumers — `docs-only`

`packages/engineering-os/src/module-sdk/index.ts`

`ENGINEERING_MODULE_SDK_FUTURE_CONSUMERS` includes `project_controls`.

### 10. Platform core commerce adapter — `entitlement-only`

`packages/platform-core/src/commerce/commerce-adapter.ts`

`project_controls` is a member of `AVAILABLE_ENGINEERING_APP_KEYS`.

### 11. Asset Intelligence ownership matrix — `docs-only`

`packages/asset-intelligence/src/architecture/ownership-lock.ts`

The frozen Asset Intelligence V1 matrix assigns the `cost_schedule` concern to
owner `project_controls` with the note "future PC", and includes
`project_controls` in its `DomainOwner` union. Phase 11A treats this as the
pre-existing, authoritative statement that cost and schedule belong to Project
Controls, and does not modify the file.

### 12. Asset Intelligence failure engine limitation — `docs-only`

`packages/asset-intelligence/src/domain/failure-engine.ts`

Emits the limitation string `no_project_controls_auto_create`, i.e. Asset
Intelligence already declares that it will never create Project Controls
records.

### 13. Engineering seed SQL — `stub`

`supabase/migrations/20260203000002_batch_20_engineering_seed.sql`

- A discipline row `('project_controls', 'Project Controls', 'Project controls')`
- An `engineering_modules` registry row for `project_controls`, status
  `registered`, version `0.0.0`, route `/engineering/apps/project-controls`,
  enabled `FALSE`

### 14. Commerce backfill SQL — `entitlement-only`

`supabase/migrations/20260209000002_batch_31_commerce_backfill.sql`

- `commercial_product_applications` row for `project_controls`
- An `application_access` entitlement definition for `project_controls`

### 15. Commerce role seed SQL — `entitlement-only`

`supabase/migrations/20260209000003_batch_31_commerce_role_seed.sql`

A `Project Controls User` role (`project-controls-user`) granting generic
`engineering:read` / `engineering:execute` permissions.

### 16. Signup provisioning SQL — `entitlement-only`

`supabase/migrations/20260206000000_fix_signup_provisioning.sql`

The same `Project Controls User` role is provisioned for new tenants.

## Confirmed absences before Phase 11A

These were verified absent immediately before this phase:

- No `packages/project-controls` package existed.
- No `packages/project-controls-certification` package existed.
- No `apps/web/src/app/(platform)/engineering/apps/project-controls` page,
  layout or shell component existed. The registry's `ProjectControlsHome`
  component reference resolves to nothing.
- No `apps/web/src/app/api/engineering/project-controls` API surface existed.
- No Project Controls domain SQL product tables existed. No migration creates a
  `project_controls_*` table; every SQL reference is a registry seed row, a
  commercial application row, a discipline row or a role row.
- No cost, schedule, progress, change, contingency or earned value logic existed
  anywhere in the repository.

## Coexistence: registry entry vs discovery package

Phase 11A adds `packages/project-controls` at `0.1.0-discovery` while the
Engineering OS module registry entry stays at `version: "0.0.0"`,
`status: "coming_soon"`, `enabled: false`.

This is deliberate and is not drift:

- The **registry entry** describes what the *platform* will expose to tenants.
  Nothing is exposed, so it stays `coming_soon`.
- The **discovery package** describes what the *engineering team* has decided
  about boundaries. It ships constants and an ownership lock, no runtime.

The two versions are allowed to differ precisely because the discovery package
is not a module release. They converge in Phase 11B, when the registry entry is
the thing that gets a real version. Until then, Phase 11A gate O asserts the
registry entry is unchanged, and gate N asserts the discovery package is
`0.1.0-discovery`.

## What Phase 11A changed in this footprint

Nothing. Every file listed above is untouched by Phase 11A. The phase adds only
the discovery package, the certification package, these documents, the CI
workflow and the architecture test.
