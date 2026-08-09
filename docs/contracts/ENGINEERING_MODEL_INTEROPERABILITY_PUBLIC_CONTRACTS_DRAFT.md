# Engineering Model Interoperability — Public Contracts (0.2.0-ifc-federation)

Status: **prerelease runtime** · Version: `0.2.0-ifc-federation` · Phase: 13B
ifc_federation

These contracts are **runtime-backed for IFC federation only**. They are
**not GA** (`1.0.0` forbidden). Native adapters remain unimplemented.

## Contract families

| Family | Intent |
| --- | --- |
| `EngineeringModelReference` | Federated external model identity; ownership stays with source application |
| `EngineeringModelAdapter` | Capability-flagged adapter surface (IFC production) |
| `EngineeringModelElementReference` | Element-level federated references |
| `EngineeringAnalysisResultReference` | Federated analysis results + trust classification |
| `ExternalSolverProviderReference` | Solver provider refs (execution still DT-owned) |
| `EngineeringModelMapping` | Mapping states + human review |
| `EngineeringModelChangeImpact` | Version-to-version impact records |

## EngineeringModelAdapter capabilities (13B IFC)

IFC production adapter enables:

- `identifyModel`, `probeVersion`, `readMetadata`, `listElements`, `readElement`, `readUnits`

Always **false** in 13B:

- `mutateModel`, `generateAnalysisModel`, geometry/viewer capabilities,
  solver execution on the model adapter (`solverExecutable=false`)

## Trust classification

`source_declared` | `source_reviewed` | `externally_approved` |
`rtb_execution_certified` | `unknown`

IFC imported results default to `source_declared` and must never auto-claim
`rtb_execution_certified`.

## Mapping review

Slug: `engineering_model_interoperability.mapping_review`  
No AI self-approval. Human confirmation required for canonical Asset / Project /
Spatial / Twin mappings.

## Non-goals

- No GA contract freeze (`1.0.0`)
- No production native adapters
- No automatic analysis-model certification APIs
- No second solver execution API outside Digital Twin `EngineeringSolverAdapter`

## Stability

`PUBLIC_CONTRACT_VERSION` = `0.2.0-ifc-federation`. Must not claim `1.0.0`.
