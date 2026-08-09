# Engineering Model Interoperability — Ownership Matrix (Phase 13B)

Status: ifc_federation · `IFCFederationReady=true` ·
`sourceModelOwnershipPreserved=true` · Version `0.2.0-ifc-federation`

Aligned with
`packages/engineering-model-interoperability/src/architecture/ownership-lock.ts`.

## Ownership clarification

| Flag | Value | Meaning |
| --- | --- | --- |
| `modelInteroperabilityOwnership` | `engineering_model_interoperability` | Federation runtime owner |
| `EngineeringFederationModelLocked` | **true** | Federation architecture locked |
| `sourceModelOwnershipPreserved` | **true** | Federated ≠ RTB-owned |
| `digitalTwinMayOwnSourceModel` | **false** | DT must not own source models |
| `duplicateModelOwnershipDetected` | **false** | No competing model owner |
| `productionInteroperabilityRuntimeImplemented` | **true** | IFC federation runtime |
| `IFCFederationReady` | **true** | IFC/openBIM production path |
| `duplicateToolFrameworkDetected` | **false** | Reuse DT/ETF |
| `duplicateAssetOwnershipDetected` | **false** | Preserve shared domain |
| `duplicateProjectOwnershipDetected` | **false** | Preserve shared project domain |
| `duplicateSpatialOwnershipDetected` | **false** | Preserve shared spatial domain |
| `automaticAnalysisModelCertificationEnabled` | **false** | Always |
| `externalModelOwnership` | `source_client_engineering_application` | Source-owned |

## Matrix

| Concern | Owner | Relation |
| --- | --- | --- |
| model_federation_semantics | `engineering_model_interoperability` | **OWNS** |
| result_federation_semantics | `engineering_model_interoperability` | **OWNS** |
| ifc_federation_runtime | `engineering_model_interoperability` | **IMPLEMENTS** |
| solver_execution_orchestration | `digital_twin` | **REUSES** EngineeringSolverAdapter |
| engineering_tool_framework | `platform_intelligence` | **REUSES** existing ETF |
| external_model_files | `source_client_engineering_application` | **MUST_NEVER_OWN** (RTB) |
| external_solver_binaries | `external_engineering_tool` | **MUST_NEVER_OWN** (RTB) |
| canonical_asset_identity | `engineering_os_shared_domain` | **REFERENCES** |
| canonical_project_identity | `engineering_os_shared_project_domain` | **REFERENCES** |
| canonical_spatial_reference | `engineering_os_shared_spatial_domain` | **REFERENCES** |
| digital_twin_identity | `digital_twin` | **REFERENCES** (V1 intact) |
| ifc_first_class_path | `engineering_model_interoperability` | **OWNS** (runtime) |
| production_native_adapters | — | **FORBIDDEN** in 13B |
| second_solver_framework | — | **FORBIDDEN** |
| full_bim_viewer | — | **FORBIDDEN** (`fullBimViewerImplemented=false`) |

## Preferred architecture (locked)

RTB AI Platform → Engineering OS → Engineering Model Interoperability
(IFC federation runtime) → consume Digital Twin V1 public contracts;
external models/solvers remain source-owned.
