# Engineering Model Interoperability — Public Contracts (0.4.0-etabs-federation)

Status: **prerelease runtime** · Version: `0.4.0-etabs-federation` · Phase: 13E
status: etabs_federation

These contracts are **runtime-backed for IFC federation + SPACE GASS federation +
ETABS export federation / fail-closed solver adapters**. They are **not GA**
(`1.0.0` forbidden). SAP2000 / SAFE / CSiBridge remain unimplemented.
ETABS path is **export federation** — not live native COM.

## Contract families

| Family | Intent |
| --- | --- |
| `EngineeringModelReference` | Federated external model identity; ownership stays with source application |
| `EngineeringModelAdapter` | Capability-flagged adapter surface (IFC + SPACE GASS + ETABS) |
| `EngineeringModelElementReference` | Element-level federated references |
| `EngineeringAnalysisResultReference` | Federated analysis results + trust classification |
| `ExternalSolverProviderReference` | Solver provider refs (DT CalculiX + interop SPACE GASS + ETABS) |
| `EngineeringModelMapping` | Mapping states + human review |
| `EngineeringModelChangeImpact` | Version-to-version impact records |
| `SPACEGASSSolverAdapter` | Interop-hosted adapter conforming to DT `EngineeringSolverAdapter` |
| `SPACEGASSQualificationRecord` | Four-layer qualification (method→provider→application→execution) |
| `ETABSModelAdapter` | Export/fixture federation adapter |
| `ETABSSolverAdapter` | Fail-closed adapter conforming to DT `EngineeringSolverAdapter` |
| `ETABSQualificationRecord` | Federation / adapter / policy / fail-closed qualification |
| `CSIInteropCore` | Internal session/error/metadata helper only (not business domain) |

## EngineeringModelAdapter capabilities

### IFC (retained)

- `identifyModel`, `probeVersion`, `readMetadata`, `listElements`, `readElement`, `readUnits`

### SPACE GASS (retained)

- `identifyModel`, `probeVersion`, `readMetadata`, `listElements`, `readElement`,
  `listAnalysisResults`, `readAnalysisResult`, `readUnits`, `readMaterialsSummary`

### ETABS (13E export federation)

- `identifyModel`, `probeVersion`, `readMetadata`, `listElements`, `readElement`,
  `listAnalysisResults`, `readAnalysisResult`, `readUnits`, `readMaterialsSummary`
- Element kinds: joint, frame, area, link, story, section, material, group,
  load_pattern, load_case, combination

Always **false**:

- `mutateModel`, `generateAnalysisModel`, geometry/viewer capabilities,
  model-adapter `solverExecutable=false`, `liveNativeCom=false`

## Trust classification

`source_declared` | `source_reviewed` | `externally_approved` |
`rtb_execution_certified` | `unknown`

Imported existing ETABS / SPACE GASS / IFC results default to `source_declared`
and must never auto-claim `rtb_execution_certified`.

## ETABS solver honesty

- `ETABSSolverAdapterReady=true` (adapter implemented, fail-closed)
- `ETABSHostedExecutionCertified=false`
- `ETABSControlledExecutionCertified=false`
- `silentSolverFallbackAllowed=false` (never CalculiX / SPACE GASS / fixture substitute)
- Federation path label: **export_fixture** (not live native COM)

## Mapping review

Slug: `engineering_model_interoperability.mapping_review`  
No AI self-approval. Human confirmation required for canonical Asset / Project /
Spatial / Twin mappings. IFC coexistence mapping hints retained for ETABS elements.

## Versioning

Public contract version **0.4.0-etabs-federation** is a prerelease. GA `1.0.0`
is forbidden until explicitly certified.
