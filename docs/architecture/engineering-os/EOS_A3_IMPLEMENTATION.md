# EOS-A3 Implementation — Systems & Interface Intelligence

Status: **implemented** and applied to staging `rntonzigxwxcjlcsadip`.

Evidence branch: `cursor/era-7a-engineering-review-pilot-gate`  
Migration: `supabase/migrations/20260929200000_eos_a3_systems_interface_intelligence.sql`

Does not implement Requirements, Change, Impact, Configuration, Optimization, or Value Intelligence.

---

## Competing “system” concepts (Part 1)

| Concept | Classification |
| --- | --- |
| `engineering_assets.system` / `.subsystem` TEXT | LEGACY_LABEL |
| `engineering_assets.parent_asset_id` | NOT_RELEVANT (asset breakdown, not system membership) |
| `engineering_coordinate_reference_systems` | NOT_RELEVANT (CRS) |
| `engineering_model_mappings` / IFC element correspondence | EXTERNAL_MAPPING |
| Digital Twin / Kernel Twin tables | DIGITAL_TWIN_ONLY |
| PI KG node types | MODULE_LOCAL |
| Project Controls / schedule “system” language | MODULE_LOCAL |
| `engineering_disciplines.is_system` | NOT_RELEVANT (catalogue flag) |
| Nav label “Engineering Systems” → `/engineering/modules` | MODULE_LOCAL (product modules) |
| **No `engineering_systems` table existed before A3** | confirmed on staging |

---

## System model

Canonical table: `engineering_systems`.

Identity: `id`, `tenant_id`, `workspace_id` (NOT NULL), `project_id`, `system_code` unique `(tenant_id, workspace_id, system_code)`, `name`.

Hierarchy: `parent_system_id` self-FK **ON DELETE RESTRICT**. A subsystem is another System row. **No `engineering_subsystems` table.**

Governance: `status` (`draft|active|inactive|superseded|archived`), `criticality` (`low|medium|high|critical`), `owner_id`.

Provenance: `created_by`, `created_at`, `updated_at`, `metadata`.

Systems are multidisciplinary. There is no `discipline_id` on the System row and no `structural_systems` / `mechanical_systems` tables.

**SYSTEM ≠ ASSET.** Assets remain `engineering_assets`.

---

## System vs Asset / participation

Many-to-many via governed `engineering_object_links`:

- **CONTAINS** — the asset is part of the system architecture/scope.
- **USES** — the system depends on an asset that may belong primarily elsewhere (shared utility).

Do not use a single `engineering_assets.system_id`.

---

## Hierarchy integrity

Trigger `engineering_system_hierarchy_guard` (same pattern as A2 supersession):

- no self-parent
- parent must share tenant, workspace, and project
- cycle walk (A→B→A and A→B→C→A) rejected (max 64 hops)

---

## Legacy `engineering_assets.system`

**PRESERVED.** Not dropped, not rewritten, not auto-migrated.

Staging profile at A3 apply: **0** `engineering_assets` rows (populated labels = 0). No deterministic mapping job is required. Future migration may map distinct labels to `engineering_systems` + CONTAINS only after human review.

---

## Interface model

Canonical table: `engineering_interfaces`.

Identity: `interface_code` unique `(tenant_id, workspace_id, interface_code)`, `name`.

Types (CHECK, uppercase A1 taxonomy):  
PHYSICAL, FUNCTIONAL, PROCESS, MECHANICAL, PIPING, STRUCTURAL, ELECTRICAL, CONTROL, DATA, INFORMATION, RESPONSIBILITY, CONTRACT, SCHEDULE.

Directionality: `undirected | directed | bidirectional` (physical often undirected).

Status: `identified | defined | agreed | verified | closed | superseded`.  
`identified` = known to exist; `verified`/`agreed` require ≥ 2 endpoints in the service layer.

---

## Endpoint architecture: OBJECT_LINKS

**Selected:** `INTERFACE --CONNECTS--> system | asset | document | decision | assumption | project`

Metadata on the link: `{ endpoint_role, direction }`. Duplicate identical endpoints rejected by existing unique `(from_type, from_id, to_type, to_id, relationship)`.

No `engineering_interface_endpoints` table (would duplicate object_links).

Discipline/company catalogue endpoints are deferred: those rows often have NULL `workspace_id`, and A2C link RLS is fail-closed on NULL workspace.

Delete of System/Interface while links exist is **RESTRICT** (`engineering_core_prevent_delete_while_linked`). Unlink first.

---

## Interface vs model mapping vs finding

| Object | Question | Persistence |
| --- | --- | --- |
| Interface | Where do systems/assets/responsibilities interact? | `engineering_interfaces` + CONNECTS |
| Model mapping | Which model element corresponds to a Core object? | `engineering_model_mappings` unchanged |
| Finding | What did Review observe about an object? | ERA / PI findings unchanged |

---

## Decision / Assumption / ERA composition

Reuse A1/A2 verbs only: Decision `AFFECTS` System; Assumption `USED_BY` System/Interface; Decision `SUPPORTED_BY` Interface. ERA may later `REVIEWS` / `FOUND_IN` these objects; A3 does not change ERA Finding semantics.

`engineering_object_link_resolve` now includes `system` and `interface`.

---

## RLS

A2C pattern: tenant + `engineering_core_workspace_member`. NULL workspace rejected on INSERT. Ownership immutable. `service_role` bypasses RLS; tenant-admin JWT is membership-scoped.

---

## APIs / UI / audit

- `GET/POST/PATCH /api/engineering/systems` — list, get, create, update, set parent, link/unlink asset
- `GET/POST/PATCH /api/engineering/interfaces` — list, get, create, update, add/remove CONNECTS endpoint, set status

Tenant/workspace taken from `withEngineeringApi` context (`ctx.tenantId`, `ctx.workspaceId`), not from untrusted body fields for isolation.

UI: `/engineering/systems`, `/engineering/interfaces` (Explore: Core records / Registers). No graph/3D/optimization UI.

Audit: `EngineeringObjectFramework.publishCreated` / `recordTimeline` (created, renamed, parent changed, asset linked/unlinked, status, endpoint add/remove, classification, criticality). No second audit subsystem.

---

## Staging

Applied via `npx supabase db query --linked` (not `db push`) to `rntonzigxwxcjlcsadip`. Ledger `20260929200000` `eos_a3_systems_interface_intelligence`. PostgREST schema reload issued. Production `wcydlhqiqdwgoaqrlget` not targeted.

---

## Known limitations

- Discipline/company/responsibility endpoints not first-class in A3 (workspace-null catalogue rows).
- Next.js routes were not live-called against a running web server; PostgREST JWT is the enforcement proof.
- Legacy TEXT labels are empty on staging; no backfill.
- Commerce actions reuse `asset.read` / `asset.write` (same pattern as assumptions reusing decision permissions).
- `packages/engineering-os` `tsc` still has pre-existing errors outside A3 files.

READY_FOR_EOS-A4: **YES** — Requirements, Change, Impact & Configuration can bind to System/Interface via `ALLOCATED_TO` / `AFFECTS` / `CAUSED_BY` / `BASELINES` already in the governed CHECK.
