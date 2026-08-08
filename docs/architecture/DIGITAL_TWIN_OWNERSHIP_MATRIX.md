# Digital Twin — Ownership Matrix (Phase 12H simulation assurance)

Status: simulation_assurance · Aligned with `packages/digital-twin/src/architecture/ownership-lock.ts`

> **Phase 12H update:** Twin owns multi-layer simulation qualification, eligibility,
> packages, integrity, and reproducibility as **Digital Twin simulation assurance**.
> External solver adapters remain reserved stubs
> (`externalEngineeringSolverAdaptersImplemented=false`). General Engineering Tool
> Framework remains with `platform_intelligence`. Certified executable path is
> `deterministic_fixture` only (`nativeEngineeringSolverImplemented=false`).

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
| simulation_state | `digital_twin` | owns (separate simulated plane) |
| simulation_governance | `digital_twin` | owns (method/provider registries) |
| simulation_assurance | `digital_twin` | owns (four-layer qualification + packages) |
| simulation_package | `digital_twin` | owns (manifests/integrity; Platform Files refs) |
| external_engineering_solver_adapters | `external_or_existing_engineering_model_owner` | forbidden (stubs only) |
| engineering_tool_framework | `platform_intelligence` | consumes (compatibility adapters) |
| digital_thread | `digital_twin` | owns |
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
- Canonical location / place registers (`spatialOwnershipFullyResolved=false`)
- Engineering model file binaries
- A Twin-owned BIM/CAD authoring or 3D viewer plane
- A competing general Engineering Tool Framework
- Native FEA/CFD/physics solvers
- Asset Intelligence condition / predictive models
- Inspection / PI / PC authoritative planes
- SHM sensor stream ingestion or structural solvers
- A duplicate telemetry / time-series plane
- A new knowledge graph subsystem
- Physical actuation or closed-loop automatic control

## Simulation firewall

Simulated Twin State **never** silently replaces Observed / Derived / Operational state.
`simulationExecutionImplemented=true` is bounded orchestration + fixture only.

## Control and actuation

`PHYSICAL_ACTUATION_ENABLED = false` and `AUTOMATIC_CONTROL_ENABLED = false`.

## KG typed relationships

Digital Twin **consumes** existing knowledge graph nodes and edge types (including
simulation string constants). It does not introduce a parallel graph store.
