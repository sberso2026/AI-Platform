# Engineering Model Interoperability — Boundary Map (Phase 13C)

Status: spacegass · Runtime: **IFC/openBIM + SPACE GASS**
(`IFCFederationReady=true`, `SpaceGassFederationReady=true`,
`productionInteroperabilityRuntimeImplemented=true`) · Version `0.3.0-spacegass`

## Independently governed concerns

| Concern | In 13C | Notes |
| --- | --- | --- |
| **Model Federation** | runtime (IFC + SPACE GASS) | Federated references; not ownership transfer |
| **Result Federation** | runtime refs | Trust-classified; imported ≠ rtb_execution_certified |
| **Solver Execution** | interop-hosted SPACE GASS adapter (fail-closed) | Consumes DT `EngineeringSolverAdapter`; DT package frozen CalculiX-only; `spaceGassHostedExecutionCertified=false` |
| **Model Authoring** | locked / not implemented | Remains in source applications |
| **Analysis Model Generation** | locked / not implemented | Never auto-certified |

## Honesty boundaries

- model accessible ≠ solver executable
- model federated ≠ model owned by RTB
- existing results ≠ RTB-generated results
- SPACE GASS / IFC imported ≠ `rtb_execution_certified`
- solver supported ≠ solver qualified ≠ project-approved ≠ execution-qualified ≠ engineering-approved
- silent solver fallback forbidden (`silentSolverFallbackAllowed=false`)

## In scope (13C)

- IFC/openBIM production federation (retained from 13B)
- SPACE GASS production model/result federation (fixture export format)
- `SPACEGASSSolverAdapter` fail-closed path + four-layer qualification
- batch_87 additive tables (no rewrite of batch_86)
- HTTP SPACE GASS route + UI readiness markers
- Public contracts `0.3.0-spacegass` (prerelease, not GA)

## Out of scope (forbidden in 13C)

| Capability | Status |
| --- | --- |
| Production ETABS / SAP2000 / SAFE / CSiBridge / STAAD adapters | forbidden |
| Production Revit / Navisworks / Tekla adapters | forbidden |
| Analysis-model generation / source-model mutation | forbidden |
| Full BIM viewer | forbidden (`fullBimViewerImplemented=false`) |
| Second solver / tool framework / SPACEGASSExecutionFramework | forbidden |
| Automatic analysis-model certification | forbidden |
| Silent fallback to CalculiX/fixture when SPACE GASS requested | forbidden |
| Phase 13D | not started (`phase13DReady` flag only) |
| Modifications to `packages/digital-twin/**` | forbidden |

## Digital Twin

Consume DT **1.0.0** public contracts only. Do not modify
`packages/digital-twin/**`. Tag `digital-twin-v1.0.0` must remain at
`a94425ed009ca087c2f44c9d3757c0c82bd936b1`.
