# Engineering Model Interoperability — Boundary Map (Phase 13B)

Status: ifc_federation · Runtime: **IFC/openBIM only**
(`IFCFederationReady=true`, `productionInteroperabilityRuntimeImplemented=true`)

## Independently governed concerns

| Concern | In 13B | Notes |
| --- | --- | --- |
| **Model Federation** | runtime (IFC) | Federated references; not ownership transfer |
| **Result Federation** | runtime refs | Trust-classified; IFC import ≠ rtb_execution_certified |
| **Solver Execution** | locked / not implemented | Reuse Digital Twin adapter; `solverExecutionImplemented=false` |
| **Model Authoring** | locked / not implemented | Remains in source applications |
| **Analysis Model Generation** | locked / not implemented | Never auto-certified |

## Honesty boundaries

- model accessible ≠ solver executable
- model federated ≠ model owned by RTB
- existing results ≠ RTB-generated results
- IFC imported ≠ `rtb_execution_certified`
- solver supported ≠ solver qualified ≠ project-approved ≠ execution-qualified ≠ engineering-approved

## In scope (13B)

- IFC/openBIM production federation adapter + parser governance
- batch_86 product tables (Platform Files refs; no PG binaries)
- Mapping review slug `engineering_model_interoperability.mapping_review`
- HTTP + thin UI readiness marker
- Public contracts `0.2.0-ifc-federation` (prerelease, not GA)

## Out of scope (forbidden in 13B)

| Capability | Status |
| --- | --- |
| Production ETABS / SPACE GASS / SAP2000 adapters | forbidden |
| Production Revit / Navisworks / Tekla adapters | forbidden |
| Solver execution / additional external solvers | forbidden |
| Model mutation / authoring | forbidden |
| Analysis-model generation | forbidden |
| Full BIM viewer | forbidden (`fullBimViewerImplemented=false`) |
| Second solver / tool framework | forbidden |
| Automatic analysis-model certification | forbidden |
| Phase 13C | not started (`phase13CReady` flag only) |

## Digital Twin

Consume DT **1.0.0** public contracts only. Do not modify
`packages/digital-twin/**`. Tag `digital-twin-v1.0.0` must remain at
`a94425ed009ca087c2f44c9d3757c0c82bd936b1`.
