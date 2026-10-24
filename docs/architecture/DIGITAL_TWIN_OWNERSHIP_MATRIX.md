# Digital Twin — Ownership Matrix (Phase 12K digital thread)

Status: digital_thread · Aligned with `packages/digital-twin/src/architecture/ownership-lock.ts`

> **Phase 12K update:** Twin owns Digital Thread intelligence (refs-only composition,
> provenance, integrity detection). Digital Thread ≠ Knowledge Graph ≠ Timeline.
> `KnowledgeGraphReuseReady=true` · `duplicateKnowledgeGraphDetected=false`.
> Twin Thread (12B), TwinSnapshot, and TwinTimeline are **integrated by reference**.
> Preserves 12J/12I: `SolverCapabilityRegistryReady`, `FourLayerQualificationIntact`,
> `CalculiXAdapterIntact`, `RealSolverExecutionCertified`.

## Locked ownership boundaries

| Concern | Owner | Twin relation |
| --- | --- | --- |
| twin_identity | `digital_twin` | owns |
| twin_state | `digital_twin` | owns |
| twin_representation | `digital_twin` | owns |
| representation_mapping | `digital_twin` | owns (refs only; no model binaries) |
| twin_spatial_reference | `digital_twin` | owns thin wrappers only |
| spatial_canonical_location | `engineering_os_shared_spatial_domain` | consumes (12L reconciled; FullyResolved=false) |
| source_engineering_model | `external_or_existing_engineering_model_owner` | consumes (source_ref/fileId) |
| simulation_state | `digital_twin` | owns (separate simulated plane) |
| simulation_governance | `digital_twin` | owns (method/provider registries) |
| simulation_assurance | `digital_twin` | owns (four-layer qualification + packages) |
| simulation_package | `digital_twin` | owns (manifests/integrity; Platform Files refs) |
| solver_capability_registry | `digital_twin` | owns (capability catalog; no auto-execute) |
| external_engineering_solver_adapters | `external_engineering_tool` | consumes (CalculiX first; others reserved) |
| engineering_tool_framework | `platform_intelligence` | consumes (compatibility adapters) |
| digital_thread | `digital_twin` | owns (refs-only composition) |
| digital_thread_provenance | `digital_twin` | owns (metadata; fail-closed unknown) |
| asset_identity_canonical | `engineering_os_shared_domain` | consumes |
| project_identity_canonical | `engineering_os_shared_project_domain` | consumes |
| asset_lifecycle_canonical | `engineering_os_shared_domain` | forbidden |
| condition_intelligence | `asset_intelligence` | consumes |
| inspection_history | `inspection_intelligence` | consumes |
| project_knowledge | `project_intelligence` | consumes |
| project_controls_intelligence | `project_controls` | consumes |
| sensor_streams | `shm` | consumes |
| telemetry_ingestion_plane | `platform_kernel_telemetry` | consumes |
| knowledge_graph_nodes | `platform_kernel_knowledge_graph` | consumes (`duplicateKnowledgeGraphDetected=false`) |
| canonical_risk_register | `engineering_core` | forbidden |
| physical_actuation | `external_system` | forbidden |
| automatic_control_loops | `external_system` | forbidden |
| kernel_digital_twins_tables | `digital_twin` | preserve |

## Explicit non-duplication

| Flag | Value |
| --- | --- |
| `duplicateKnowledgeGraphDetected` | **false** |
| `duplicateTimeSeriesPlaneDetected` | false |
| `duplicateAssetOwnershipDetected` | false |
| `duplicateProjectOwnershipDetected` | false |
| `duplicateModelOwnershipDetected` | false |
| `duplicateSolverOwnershipDetected` | false |
| `duplicateEngineeringToolFrameworkDetected` | false |
| `spatialOwnershipFullyResolved` | false |
| `productionDigitalTwinReady` | false |
