# Engineering Model Interoperability — Boundary Map (Phase 13A)

Status: interop_discovery · Runtime: **none** (`productionInteroperabilityRuntimeImplemented=false`)

## Independently governed concerns

| Concern | In 13A | Notes |
| --- | --- | --- |
| **Model Federation** | locked | Federated references to external models; not ownership transfer |
| **Result Federation** | locked | Federated references to existing analysis results |
| **Solver Execution** | locked | Reuse Digital Twin `EngineeringSolverAdapter` + ETF qualification |
| **Model Authoring** | locked | Remains in source engineering applications |
| **Analysis Model Generation** | locked | Never auto-certified (`automaticAnalysisModelCertificationEnabled=false`) |

## Honesty boundaries

- model accessible ≠ solver executable
- model federated ≠ model owned by RTB
- existing results ≠ RTB-generated results
- solver supported ≠ solver qualified ≠ project-approved ≠ execution-qualified ≠ engineering-approved

## In scope (13A)

- Discovery package + certification gates
- Architecture / ownership / federation locks
- Draft contracts `0.1.0-draft`
- Provider capability inventory (flags only)
- IFC first-class path reservation (not sole pathway)
- ETABS / SPACE GASS integration discovery (not implementation)

## Out of scope (forbidden in 13A)

| Capability | Status |
| --- | --- |
| Production interoperability runtime | forbidden |
| Production ETABS / SPACE GASS / SAP2000 adapters | forbidden |
| Production Revit / Navisworks / Tekla / IFC ingestion | forbidden |
| Second solver / tool framework | forbidden (`duplicateToolFrameworkDetected=false`) |
| Automatic analysis-model certification | forbidden |
| Silent solver substitution | forbidden (abstain) |
| Digital Twin V1 mutation / tag move | forbidden |
| Phase 13B | flag only — **do not start** |

## Module boundaries

```
RTB AI Platform
  └── Engineering OS
        └── Engineering Model Interoperability (discovery / federation semantics)
              ├── Draft contracts + provider matrix
              └── Reuses
                    ├── Digital Twin EngineeringSolverAdapter
                    ├── ETF / Platform Tool Registry (platform_intelligence)
                    └── Shared Asset / Project / Spatial domains (refs only)
              └── External (source-owned)
                    ├── Client engineering models
                    └── External solvers
```
