# Engineering Model Interoperability — Ownership Matrix (Phase 13E)

Status: etabs_federation · `ETABSModelFederationReady=true` ·
`SpaceGassFederationReady=true` · `IFCFederationReady=true` ·
`sourceModelOwnershipPreserved=true` · Version `0.4.0-etabs-federation`

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
| `productionInteroperabilityRuntimeImplemented` | **true** | IFC + SPACE GASS + ETABS |
| `IFCFederationReady` | **true** | IFC/openBIM production path retained |
| `SpaceGassFederationReady` | **true** | SPACE GASS production federation |
| `ETABSModelFederationReady` | **true** | ETABS export federation |
| `ETABSResultFederationReady` | **true** | ETABS result export federation |
| `ETABSAdapterImplemented` | **true** | Model + solver adapters |
| `ETABSSolverAdapterReady` | **true** | Fail-closed adapter ready |
| `ETABSHostedExecutionCertified` | **false** | No live COM in CI |
| `ETABSControlledExecutionCertified` | **false** | Not controlled-host certified |
| `SPACEGASSLiveExecutionCertified` | **false** | Phase 13D blocked (not falsified) |
| `ControlledEngineeringExecutionHostReady` | **true** | Via EEH dependency |
| `SPACEGASSSolverAdapterReady` | **true** | Interop-hosted fail-closed adapter |
| `spaceGassHostedExecutionCertified` | **false** | No live SPACE GASS binary in CI |
| `duplicateToolFrameworkDetected` | **false** | Reuse DT/ETF contracts |
| `automaticAnalysisModelCertificationEnabled` | **false** | Always |
| `SAP2000AdapterImplemented` | **false** | Forbidden in 13E |
| `SAFEAdapterImplemented` | **false** | Forbidden in 13E |
| `CSiBridgeAdapterImplemented` | **false** | Forbidden in 13E |

## Matrix

| Concern | Owner | Relation |
| --- | --- | --- |
| model_federation_semantics | `engineering_model_interoperability` | **OWNS** |
| result_federation_semantics | `engineering_model_interoperability` | **OWNS** |
| ifc_federation_runtime | `engineering_model_interoperability` | **IMPLEMENTS** |
| spacegass_federation_runtime | `engineering_model_interoperability` | **IMPLEMENTS** |
| etabs_federation_runtime | `engineering_model_interoperability` | **IMPLEMENTS** (export federation) |
| csi_interop_core | `engineering_model_interoperability` | **IMPLEMENTS** (internal helper only) |
| spacegass_solver_adapter_host | `engineering_model_interoperability` | **IMPLEMENTS** (consume DT contracts) |
| etabs_solver_adapter_host | `engineering_model_interoperability` | **IMPLEMENTS** (consume DT contracts) |
| solver_execution_orchestration | `digital_twin` | **REUSES** EngineeringSolverAdapter |
| engineering_tool_framework | `platform_intelligence` | **REUSES** existing ETF |
| external_model_files | `source_client_engineering_application` | **MUST_NEVER_OWN** (RTB) |
| external_solver_binaries | `external_engineering_tool` | **MUST_NEVER_OWN** (RTB) |
| canonical_asset_identity | `engineering_os_shared_domain` | **REFERENCES** |
| canonical_project_identity | `engineering_os_shared_project_domain` | **REFERENCES** |
| canonical_spatial_reference | `engineering_os_shared_spatial_domain` | **REFERENCES** |
| digital_twin_identity | `digital_twin` | **REFERENCES** (V1 intact) |
| ifc_first_class_path | `engineering_model_interoperability` | **OWNS** (coexists with SPACE GASS + ETABS) |
| production_sap2000_adapter | — | **FORBIDDEN** in 13E |
| production_safe_adapter | — | **FORBIDDEN** in 13E |
| production_csibridge_adapter | — | **FORBIDDEN** in 13E |
| second_solver_framework | — | **FORBIDDEN** |
| full_bim_viewer | — | **FORBIDDEN** (`fullBimViewerImplemented=false`) |

## Preferred architecture (locked)

RTB AI Platform → Engineering OS → Engineering Model Interoperability
(IFC + SPACE GASS + ETABS export federation; fail-closed solver adapters
consume-only DT contracts) → Digital Twin V1 remains CalculiX-only inside frozen
package; external models/solvers remain source-owned; SPACE GASS live blocked;
ETABS live COM not certified.
