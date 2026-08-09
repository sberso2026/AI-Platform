# Engineering Model Interoperability — Public Contracts (0.1.0-draft)

Status: **draft** · Version: `0.1.0-draft` · Phase: 13A interop_discovery

These contracts are **discovery shapes only**. They are **not GA**
(`1.0.0` forbidden) and are **not runtime-backed** in Phase 13A.

## Contract families

| Family | Intent |
| --- | --- |
| `EngineeringModelReference` | Federated external model identity; ownership stays with source application |
| `EngineeringModelAdapter` | Capability-flagged adapter surface (interfaces only) |
| `EngineeringModelElementReference` | Element-level federated references |
| `EngineeringAnalysisResultReference` | Federated analysis results; provenance distinguishes external vs RTB-generated |
| `ExternalSolverProviderReference` | Solver provider refs with supported/qualified/approved/execution/engineering flags |

## EngineeringModelAdapter capabilities (draft)

Interfaces may declare (all default **unimplemented** in 13A):

- `identifyModel`
- `probeVersion`
- `readMetadata`
- `listElements`
- `readElement`
- `listAnalysisResults`
- `readAnalysisResult`
- `readGeometrySummary`
- `readUnits`
- `readMaterialsSummary`
- `exportExchangeSnapshot`
- `mutateModel`
- `generateAnalysisModel`

`solverExecutable` on model adapters is always **false** — model accessible ≠
solver executable.

## Non-goals

- No production adapter implementations
- No GA contract freeze (`1.0.0`)
- No automatic analysis-model certification APIs
- No second solver execution API outside Digital Twin `EngineeringSolverAdapter`

## Stability

`PUBLIC_CONTRACT_VERSION` = `0.1.0-draft`. Must not claim `1.0.0`.
