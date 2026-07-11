# Installation Lifecycle (Phase 3)

## Separation of concerns

| Layer | Responsibility |
|-------|----------------|
| **Subscription** | What the tenant purchased or is trialing |
| **Licence** | What the tenant is entitled to use |
| **Installation** | What has been provisioned and activated |
| **Assignment** | Which workspaces/users may use the installed product |
| **Provisioning** | Idempotent workflow creating configuration, roles, prompts, policies |

Commercial entitlement alone does **not** imply successful installation.  
Installation alone does **not** bypass licence enforcement.

## Physical schema

Phase 3 extends `commercial_installations` (product installations) and `commercial_application_installations`.

Additional tables (Batch 32):

- `commercial_installation_requests`
- `commercial_installation_workflows` / `commercial_installation_steps`
- `commercial_installation_failures`
- `commercial_installation_health_checks`
- `commercial_installation_dependencies`
- `commercial_workspace_product_assignments`
- `commercial_provisioning_runs` / `commercial_provisioning_steps`
- `commercial_installation_versions` (cache invalidation)

## State machine

Product states: `not_installed` → `requested` → `queued` → `provisioning` → `validating` → `active` (+ suspend/upgrade/uninstall paths).

Implemented in `@rtb/platform-commerce` → `InstallationStateMachine` and `InstallationLifecycleService`.

Every transition:

1. Validates server-side
2. Writes immutable `commercial_installation_events`
3. Emits commerce outbox event
4. Bumps `commercial_installation_versions`

## Engineering OS provisioning

`ProvisioningOrchestrator` calls `seed_tenant_engineering_os(p_tenant_id)` — idempotent, no duplicate disciplines/roles/prompts.

Signup trigger **no longer** auto-seeds Engineering OS (Batch 32 backfill migration).

## Entitlement integration

`EntitlementService` requires active product installation (`active` or `degraded`) after licence checks.

Workspace-scoped assignments enforced when workspace assignments exist.

## API routes

**Product installations**

- `GET/POST /api/platform/installations`
- `GET /api/platform/installations/[id]`
- `POST .../suspend`, `.../resume`, `.../upgrade`, `.../rollback`, `.../uninstall`
- `GET .../health`, `.../events`
- `GET/POST /api/platform/workspace-product-assignments`

**Application installations**

- `GET/POST /api/platform/app-installations`
- `POST /api/platform/app-installations/request`
- `GET /api/platform/app-installations/[id]`
- `POST .../start`, `.../suspend`, `.../resume`, `.../upgrade`, `.../rollback`, `.../uninstall`
- `GET .../health`, `.../events`

## Application ownership

`commercial_application_installations` is authoritative. `engineering_application_installations` is runtime registration only.

## UI

- `/system/products/[slug]/install`
- `/system/products/[slug]/health`
- Product card **Install** action wired to installation API

## Scheduler jobs

- `installationHealthCheck`
- `installationRetry`
- `suspendInstallationsOnSubscriptionSuspension`

## Cache

`bump_commercial_installation_version(tenant_id)` invalidates installation-sensitive reads alongside entitlement version bumps.

Entitlement cache entries are version-stamped; stale decisions are rejected when DB `entitlement_version` or `installation_version` differs (multi-instance consistency bound: next guarded request after write).

## Phase 4 — Customer installation progress UI

Phase 4 exposes installation workflow state to tenant administrators through a customer-readable progress view — without exposing internal step keys directly.

### Routes

| Route | Purpose |
|-------|---------|
| `/system/installations/[installationId]` | Installation progress page |
| `/system/products/[slug]/install` | Product install initiation |
| `/system/applications/[slug]/install` | Application install initiation |

### Administration API

`GET /api/platform/administration/installations/[installationId]/progress`

Calls:

1. `ctx.commerce.installations.getById`
2. `ctx.commerce.installationLifecycle.getWorkflowProgress`
3. `ctx.commerce.installationHealth.check`
4. Product lookup for slug/name display

Maps internal workflow steps to customer steps via `mapInstallationProgress()` in `packages/platform-core/src/administration/installation-administration-service.ts`.

### Customer step mapping

Internal lifecycle steps (`entitlement_verified`, `dependencies_validated`, `provisioning`, `validation`, `workspace_assignment`, `activation`) are translated to ten customer-facing steps. Mapping rules ensure future steps remain `pending` until the workflow actually completes them (regression test in `installation-administration.test.ts`).

### Failure presentation

When installation status is `failed`, the progress view includes:

- Human-readable explanation from workflow step error message
- Reference code (`error_code` or `INSTALLATION_FAILED`)
- Retry affordance (reload progress; retry uses Phase 3 installation API)

### Health integration

Customer `healthStatus` on the progress view uses `normalizeHealthStatus()` combining installation status with latest health check outcome — distinct from raw installation state machine status.

See [CUSTOMER_ADMINISTRATION_PORTAL.md](./CUSTOMER_ADMINISTRATION_PORTAL.md) and [PRODUCT_DETAIL.md](../ui/PRODUCT_DETAIL.md).
