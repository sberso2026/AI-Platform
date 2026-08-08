# Digital Twin — Ownership Matrix (Phase 12F representation)

Status: representation · Aligned with `packages/digital-twin/src/architecture/ownership-lock.ts`

> **Phase 12F update:** Twin owns representation source/element/mapping references
> and thin spatial wrappers. Canonical locations stay with
> `engineering_os_shared_domain`. Engineering model binaries stay with Platform
> Files / `engineering_documents`. `duplicateModelOwnershipDetected=false`.

## Locked ownership boundaries

| Concern | Owner | Twin relation |
| --- | --- | --- |
| twin_identity | `digital_twin` | owns |
| twin_state | `digital_twin` | owns |
| twin_representation | `digital_twin` | owns |
| representation_mapping | `digital_twin` | owns (refs only; no model binaries) |
| twin_spatial_reference | `digital_twin` | owns thin wrappers only |
| spatial_canonical_location | `engineering_os_shared_domain` | consumes |
| source_engineering_model | `external_or_existing_engineering_model_owner` | consumes (source_ref/fileId) |
| simulation_state | `digital_twin` | owns |
| digital_thread | `digital_twin` | owns (implemented in 12B core) |
| asset_identity_canonical | `engineering_os_shared_domain` | consumes |
| project_identity_canonical | `engineering_os_shared_project_domain` | consumes |
| asset_lifecycle_canonical | `engineering_os_shared_domain` | forbidden |
| condition_intelligence | `asset_intelligence` | consumes |
| inspection_history | `inspection_intelligence` | consumes |
| project_knowledge | `project_intelligence` | consumes |
| project_controls_intelligence | `project_controls` | consumes |
| sensor_streams | `shm` | consumes |
| telemetry_ingestion_plane | `platform_kernel_telemetry` | consumes |
| knowledge_graph_nodes | `platform_kernel_knowledge_graph` | consumes |
| canonical_risk_register | `engineering_core` | forbidden |
| physical_actuation | `external_system` | forbidden |
| automatic_control_loops | `external_system` | forbidden |
| kernel_digital_twins_tables | `digital_twin` | preserve |

## What Digital Twin does NOT own

- Canonical asset or project identity registers
- Canonical location / place registers (shared domain — thin `TwinSpatialReference` only)
- Engineering model file binaries (Platform Files / engineering_documents)
- A Twin-owned BIM/CAD authoring or 3D viewer plane
- Asset Intelligence condition, health, or predictive models
- Inspection records or II workflows (inspection→element adapter reserved if II contracts insufficient)
- Project Intelligence knowledge derivatives
- Project Controls cost/schedule/progress intelligence (frozen V1 consumption only)
- SHM sensor stream ingestion or structural solvers
- A duplicate telemetry / time-series plane
- A new knowledge graph subsystem (reuse typed KG relationships only)
- Financial ledgers, work orders, or CMMS execution
- Physical actuation or closed-loop automatic control

## Identity ownership decision

Twin is a **representation layer**. `TwinTargetReference.canonicalId` must always
point at Engineering OS shared domain identity. Twin must not become the asset
registry.

## Control and actuation

`PHYSICAL_ACTUATION_ENABLED = false` and `AUTOMATIC_CONTROL_ENABLED = false` for
Phase 12A. Any future actuation path requires explicit human-gated architecture and
certification — not discovery defaults.

## Commercial boundary (architecture only)

Commerce may eventually meter `digital_twin_computations` (see usage portal).
Phase 12A documents entitlement placeholders only — no GA packaging or module enable.

## KG typed relationships

Digital Twin **consumes** existing knowledge graph nodes and edge types (e.g.
`has_digital_twin`). It does not introduce a parallel graph store.
