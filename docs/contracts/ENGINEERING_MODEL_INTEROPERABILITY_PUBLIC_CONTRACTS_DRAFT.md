# Engineering Model Interoperability — Public Contracts (0.3.0-spacegass)

Status: **prerelease runtime** · Version: `0.3.0-spacegass` · Phase: 13C
spacegass

These contracts are **runtime-backed for IFC federation + SPACE GASS federation /
fail-closed solver adapter**. They are **not GA** (`1.0.0` forbidden).
ETABS and other native adapters remain unimplemented.

## Contract families

| Family | Intent |
| --- | --- |
| `EngineeringModelReference` | Federated external model identity; ownership stays with source application |
| `EngineeringModelAdapter` | Capability-flagged adapter surface (IFC + SPACE GASS production) |
| `EngineeringModelElementReference` | Element-level federated references |
| `EngineeringAnalysisResultReference` | Federated analysis results + trust classification |
| `ExternalSolverProviderReference` | Solver provider refs (DT CalculiX + interop SPACE GASS) |
| `EngineeringModelMapping` | Mapping states + human review |
| `EngineeringModelChangeImpact` | Version-to-version impact records |
| `SPACEGASSSolverAdapter` | Interop-hosted adapter conforming to DT `EngineeringSolverAdapter` |
| `SPACEGASSQualificationRecord` | Four-layer qualification (method→provider→application→execution) |

## EngineeringModelAdapter capabilities

### IFC (retained)

- `identifyModel`, `probeVersion`, `readMetadata`, `listElements`, `readElement`, `readUnits`

### SPACE GASS (13C)

- `identifyModel`, `probeVersion`, `readMetadata`, `listElements`, `readElement`,
  `listAnalysisResults`, `readAnalysisResult`, `readUnits`, `readMaterialsSummary`

Always **false**:

- `mutateModel`, `generateAnalysisModel`, geometry/viewer capabilities,
  model-adapter `solverExecutable=false`

## Trust classification

`source_declared` | `source_reviewed` | `externally_approved` |
`rtb_execution_certified` | `unknown`

Imported existing SPACE GASS / IFC results default to `source_declared` and must
never auto-claim `rtb_execution_certified`.

## SPACE GASS solver honesty

- `SPACEGASSSolverAdapterReady=true` (adapter implemented, fail-closed)
- `spaceGassHostedExecutionCertified=false` unless a real SPACE GASS binary is
  certified in the environment
- `silentSolverFallbackAllowed=false`

## Mapping review

Slug: `engineering_model_interoperability.mapping_review`  
No AI self-approval. Human confirmation required for canonical Asset / Project /
Spatial / Twin mappings.

## Non-goals

- No GA contract freeze (`1.0.0`)
- No ETABS / other CSI production adapters
- No automatic analysis-model certification APIs
- No second solver framework (must reuse DT `EngineeringSolverAdapter` shape)

## Stability

`PUBLIC_CONTRACT_VERSION` = `0.3.0-spacegass`. Must not claim `1.0.0`.
