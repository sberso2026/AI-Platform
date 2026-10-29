# Digital Twin — Phase 12A existing footprint

Status: discovery · Module version: `0.1.0-discovery` · Phase: 12A · Baseline:
`project-controls-v1.0.0` = `b17fe4cfe2574520ec813a7b43ba7328a585d741`

Before Phase 12A, "Digital Twin" already appeared in the repository in several
places. None of them is a product module. This document is the complete inventory
so Phase 12B can reason from fact rather than memory.

## Classification

| Class | Meaning |
| --- | --- |
| `PRESERVE` | Keep as foundation; do not delete in discovery |
| `REBIND` | Existing behaviour must move under `@rtb/digital-twin` ownership in 12B+ |
| `CONSOLIDATE` | Boundary decision — consume, do not duplicate |
| `RESERVE` | Declared stub with no implementation |
| `RETIRE` | Documentation or naming drift to remove or defer |
| `DEFER` | Acknowledged but out of Phase 12A scope |

## Inventory

### 1. Engineering OS module registry — `RESERVE`

`packages/engineering-os/src/module-registry.ts`

- `id` / `moduleKey` / `commerceApplicationKey`: `digital_twin`
- `status`: `coming_soon`, `enabled`: `false`, `version`: `0.0.0`
- `routes`: `/engineering/apps/digital-twin` → `DigitalTwinHome` (component does not exist)
- `searchProviders`: `["digital_twin.assets"]` — declared names only
- `aiCapabilities`: `["digital_twin.context"]` — declared names only
- `eventHandlers`: `["digital_twin.*"]` — declared names only

### 2. Platform kernel digital twin service — `PRESERVE` / `REBIND`

`packages/platform-kernel/src/digital-twin/digital-twin-service.ts`
`packages/platform-kernel/src/digital-twin/index.ts`

Kernel `DigitalTwinService` registers and lists rows in `digital_twins` with
status history. Phase 12A **preserves** these tables and the service as
foundation. Phase 12B **REBINDs** via optional `kernel_twin_id` on
`digital_twin_identities` (`batch_75`) — kernel tables are not dropped or rewritten.
Auto-create and runtime orchestration remain deferred to Phase 12C+.

### 3. Kernel twin SQL tables — `PRESERVE`

`supabase/migrations/20260201000000_phase_15_kernel_tables.sql`

Tables: `digital_twin_types`, `digital_twins`, `digital_twin_relationships`,
`digital_twin_attributes`, `digital_twin_status_history`. Also `sensors.digital_twin_id`.

Documented in `docs/architecture/DIGITAL_TWIN.md`. No Phase 12A product migrations.

### 4. Engineering asset auto-twin-create — `REBIND`

`packages/engineering-os/src/services/core-services.ts`

On asset create, when `createDigitalTwin !== false`, the kernel registers an
`asset` twin and writes `engineering_assets.digital_twin_id`. Phase 12A locks
this as **REBIND**: the behaviour stays for compatibility but must be explicitly
owned and governed by the Digital Twin module in 12B (not silent kernel side-effect).

### 5. Engineering registers / asset page display — `PRESERVE`

`apps/web/src/app/(platform)/engineering/assets/[assetId]/page.tsx`

Displays linked `digital_twin_id` as read-only context. No twin product UI.

`supabase/migrations/20260203000000_batch_20_engineering_tables.sql`
`supabase/migrations/20260204000000_batch_205_register_tables.sql`

Register tables carry optional `digital_twin_id` FK — **PRESERVE**.

### 6. Platform telemetry service — `CONSOLIDATE`

`packages/platform-kernel/src/telemetry/telemetry-service.ts`

Kernel telemetry accepts optional `digital_twin_id`. Phase 12A **CONSOLIDATE**:
Digital Twin must not introduce a duplicate time-series ingestion plane. See
`DIGITAL_TWIN_TELEMETRY_AND_TIMESERIES_ADR.md`.

### 7. Asset Intelligence ownership matrix — `CONSOLIDATE`

`packages/asset-intelligence/src/architecture/ownership-lock.ts`

Pre-existing rows assign `twin_state` and `simulation_state` to owner
`digital_twin`. Phase 12A adopts this without modifying the frozen AI V1 surface.

### 8. Asset Intelligence ↔ Twin boundary doc — `PRESERVE`

`docs/architecture/ASSET_INTELLIGENCE_DIGITAL_TWIN_BOUNDARY.md`

Historical boundary statement — preserved; extended by Phase 12A docs.

### 9. Inspection Intelligence event fanout — `RESERVE`

`packages/inspection-intelligence/src/domain/engineering-events.ts`
`packages/inspection-intelligence/src/architecture/event-flow.ts`

Lists `digital_twin` as a fanout target name. No subscriber implementation.

### 10. Engineering module SDK — `PRESERVE`

`packages/engineering-os/src/module-sdk/index.ts`

`digital_twin` listed as a module key for future SDK consumers. Phase 12B reuses
Engineering Module SDK — no parallel twin SDK.

### 11. Commerce / permissions seeds — `RESERVE`

`supabase/migrations/20260209000003_batch_31_commerce_role_seed.sql`
`supabase/migrations/20260201000003_admin_kernel_permissions.sql`

Permission `{ resource: "digital_twin", action: "execute" }` — entitlement stub only.

### 12. Usage portal metric name — `RESERVE`

`packages/platform-core/src/administration/usage-administration-service.ts`

`digital_twin_computations` quota name — architecture/commerce placeholder only.

### 13. DATABASE.md legacy name — `RETIRE` / `DEFER`

`docs/architecture/DATABASE.md`

Documents `digital_twin_assets` and `sensor_readings` without a matching
`CREATE TABLE` for `digital_twin_assets` in migrations. Phase 12A classifies
`digital_twin_assets` as **RETIRE/DEFER** — use kernel `digital_twins` as the
preserved foundation; do not introduce a parallel `digital_twin_assets` table in
discovery.

### 14. Digital thread — `DEFER` (new model)

No `digital_thread` table or package exists in the repository before Phase 12A.
Phase 12A defines the **new model** in `DIGITAL_THREAD_MODEL.md` only.

### 15. Project Controls V1 reference — `CONSOLIDATE`

`packages/project-controls/src/version.ts`

PC V1 declares `DIGITAL_TWIN_OWNERSHIP = "external_future"`. Phase 12A discovery
package supersedes that placeholder for architecture lock purposes without
modifying the frozen PC V1 tag surface.

### 16. Engineering modules catalog page — `RESERVE`

`apps/web/src/app/(platform)/engineering/modules/page.tsx`

Catalog may list Digital Twin as `coming_soon`. No product page is served.

### 17. Shared module key union — `RESERVE`

`packages/types/src/engineering-modules.ts`

`digital_twin` is a member of engineering module key unions.

### 18. Engineering seed SQL — `stub`

`supabase/migrations/20260203000002_batch_20_engineering_seed.sql`

Registry seed row for `digital_twin` module at version `0.0.0`, disabled.

## Coexistence: registry entry vs discovery package

The Engineering OS registry keeps `digital_twin` at `coming_soon` / `enabled: false`
while `packages/digital-twin` ships discovery constants only. Enabling the module
or GA packaging is forbidden in Phase 12A.

## Confirmed absences before Phase 12A

- No `packages/digital-twin` runtime (Phase 12A adds skeleton only)
- No Digital Twin product SQL tables beyond preserved kernel foundation
- No `/engineering/apps/digital-twin` page implementation
- No live telemetry ingestion in `@rtb/digital-twin`
- No simulation execution, 3D viewer, SHM runtime, or actuation
- No `digital_thread` persistence
- No batch migrations for twin production schema in Phase 12A

## Phase 12B core additions (`batch_75`)

Phase 12B introduces module product tables without dropping kernel foundation:

- `digital_twin_identities` — optional `kernel_twin_id` for REBIND
- `digital_twin_representations`, `digital_twin_relationships`, `digital_twin_thread_links`
- `digital_twin_state_references`, `digital_twin_reviews`, `digital_twin_outbox_events`

Still absent after 12B: telemetry tables, simulation execution, runtime sync, 3D viewer.
