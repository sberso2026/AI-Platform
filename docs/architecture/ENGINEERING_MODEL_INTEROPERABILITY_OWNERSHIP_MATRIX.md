# Engineering Model Interoperability — Ownership Matrix (Phase 13A)

Status: interop_discovery · `EngineeringFederationModelLocked=true` ·
`sourceModelOwnershipPreserved=true` · Version `0.1.0-interop-discovery`

Aligned with
`packages/engineering-model-interoperability/src/architecture/ownership-lock.ts`.

## Ownership clarification

| Flag | Value | Meaning |
| --- | --- | --- |
| `EngineeringFederationModelLocked` | **true** | Federation architecture locked |
| `sourceModelOwnershipPreserved` | **true** | Federated ≠ RTB-owned |
| `productionInteroperabilityRuntimeImplemented` | **false** | Discovery only |
| `duplicateToolFrameworkDetected` | **false** | Reuse DT/ETF |
| `duplicateAssetOwnershipDetected` | **false** | Preserve shared domain |
| `duplicateProjectOwnershipDetected` | **false** | Preserve shared project domain |
| `duplicateSpatialOwnershipDetected` | **false** | Preserve shared spatial domain |
| `automaticAnalysisModelCertificationEnabled` | **false** | Always |

## Matrix

| Concern | Owner | Relation |
| --- | --- | --- |
| model_federation_semantics | `engineering_model_interoperability` | **OWNS** (discovery / draft contracts) |
| result_federation_semantics | `engineering_model_interoperability` | **OWNS** (discovery) |
| solver_execution_orchestration | `digital_twin` | **REUSES** EngineeringSolverAdapter |
| engineering_tool_framework | `platform_intelligence` | **REUSES** existing ETF |
| external_model_files | `source_client_engineering_application` | **MUST_NEVER_OWN** (RTB) |
| external_solver_binaries | `external_engineering_tool` | **MUST_NEVER_OWN** (RTB) |
| canonical_asset_identity | `engineering_os_shared_domain` | **REFERENCES** |
| canonical_project_identity | `engineering_os_shared_project_domain` | **REFERENCES** |
| canonical_spatial_reference | `engineering_os_shared_spatial_domain` | **REFERENCES** |
| digital_twin_identity | `digital_twin` | **REFERENCES** (V1 intact) |
| ifc_first_class_path | `engineering_model_interoperability` | **RESERVED** |
| production_interop_runtime | interop package | **FORBIDDEN** in 13A |
| second_solver_framework | — | **FORBIDDEN** |

## Preferred architecture (locked)

```
RTB AI Platform
  └── Engineering OS
        ├── Shared Asset Domain
        ├── Shared Project Domain
        ├── Shared Spatial Domain
        ├── Digital Twin (solver adapter + four-layer qualification)
        ├── Engineering Tool Framework (platform_intelligence)
        └── Engineering Model Interoperability (federation discovery)
              └── External source models / solvers (client-owned)
```

## See also

- `ENGINEERING_MODEL_INTEROPERABILITY_PHASE_13A.md`
- `ENGINEERING_MODEL_INTEROPERABILITY_BOUNDARY_MAP.md`
- `ENGINEERING_FEDERATION_MODEL.md`
