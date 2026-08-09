# Engineering Model Interoperability — Boundary Map (Phase 13E)

Status: etabs_federation · Runtime: **IFC/openBIM + SPACE GASS + ETABS export federation**
(`IFCFederationReady=true`, `SpaceGassFederationReady=true`,
`ETABSModelFederationReady=true`,
`productionInteroperabilityRuntimeImplemented=true`) · Version `0.4.0-etabs-federation`

## Independently governed concerns

| Concern | In 13E | Notes |
| --- | --- | --- |
| **Model Federation** | runtime (IFC + SPACE GASS + ETABS export) | Federated references; not ownership transfer |
| **Result Federation** | runtime refs | Trust-classified; imported ≠ rtb_execution_certified |
| **Solver Execution** | interop-hosted SPACE GASS + ETABS adapters (fail-closed) | Consumes DT `EngineeringSolverAdapter`; hosted/controlled certified=false |
| **Model Authoring** | locked / not implemented | Remains in source applications |
| **Analysis Model Generation** | locked / not implemented | Never auto-certified |

## Honesty boundaries

- model accessible ≠ solver executable
- model federated ≠ model owned by RTB
- existing results ≠ RTB-generated results
- ETABS / SPACE GASS / IFC imported ≠ `rtb_execution_certified`
- ETABS export federation ≠ live native COM
- solver supported ≠ solver qualified ≠ project-approved ≠ execution-qualified ≠ engineering-approved
- silent solver fallback forbidden (`silentSolverFallbackAllowed=false`)

## In scope (13E)

- IFC/openBIM production federation (retained)
- SPACE GASS production model/result federation (retained; live still false)
- ETABS export/fixture model + result federation
- `ETABSSolverAdapter` fail-closed path + qualification records
- CSIInteropCore internal helper (not business domain)
- batch_89 additive tables (no rewrite of batch_86/87/88)
- HTTP ETABS route + UI readiness markers
- Public contracts `0.4.0-etabs-federation` (prerelease, not GA)

## Out of scope (forbidden in 13E)

| Capability | Status |
| --- | --- |
| Live native ETABS COM / hosted / controlled execution certified | forbidden / false |
| Production SAP2000 / SAFE / CSiBridge / STAAD adapters | forbidden |
| Production Revit / Navisworks / Tekla adapters | forbidden |
| Analysis-model generation / source-model mutation | forbidden |
| Full BIM viewer | forbidden (`fullBimViewerImplemented=false`) |
| Second solver / tool framework | forbidden |
| Automatic analysis-model certification | forbidden |
| Silent fallback to CalculiX/SPACE GASS/fixture when ETABS requested | forbidden |
| SPACE GASS live certification flip | forbidden (Phase 13D blocked status preserved) |
| Phase 13F | not started (`phase13FReady` flag only) |
| Modifications to `packages/digital-twin/**` | forbidden |

## Digital Twin

Digital Twin V1 remains `1.0.0` at tag `digital-twin-v1.0.0`
(`a94425ed009ca087c2f44c9d3757c0c82bd936b1`). Interop is additive outside the DT package.
