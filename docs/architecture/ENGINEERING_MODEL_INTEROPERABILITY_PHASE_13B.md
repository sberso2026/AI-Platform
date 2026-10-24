# Phase 13B — Engineering Model Interoperability Core Runtime + IFC/openBIM Federation

Status: ifc_federation · Module version: `0.2.0-ifc-federation` · Phase: 13B ·
Baseline: Digital Twin V1.0.0 `a94425ed009ca087c2f44c9d3757c0c82bd936b1` ·
Tag: `digital-twin-v1.0.0` · Phase 13A pin: `5d238f24…` / hosted `31288157345`

## Overview

Phase 13B is the **first production-capable runtime** of Engineering Model
Interoperability. It promotes `@rtb/engineering-model-interoperability` from
discovery to a bounded IFC/openBIM federation runtime:

| Artefact | Purpose |
| --- | --- |
| Domain package `0.2.0-ifc-federation` | Runtime refs, IFC adapter, federation service, persistence |
| `batch_86` migration | Hosted tables (ids + metadata; Platform Files refs for binaries) |
| HTTP routes `/api/engineering/model-interoperability/*` | Models, versions, elements, mappings, reviews, change-impacts, results |
| Thin UI marker | `data-testid="engineering-model-ifc-federation-ready"` |
| Certification | 72 gates A–BT + Playwright (`CERTIFY_BROWSER=1`) |

**Do not start Phase 13C** — `PHASE_13C_READY=true` is a flag only.

## Declared flags

| Flag | Value |
| --- | --- |
| `EngineeringModelInteroperabilityRuntimeReady` | **true** |
| `IFCFederationReady` | **true** |
| `productionInteroperabilityRuntimeImplemented` | **true** |
| `ifcProductionAdapterImplemented` | **true** |
| `sourceModelOwnershipPreserved` | **true** |
| `digitalTwinMayOwnSourceModel` | **false** |
| `duplicateModelOwnershipDetected` | **false** |
| `solverExecutionImplemented` | **false** |
| `modelMutationImplemented` | **false** |
| `analysisModelGenerationImplemented` | **false** |
| `fullBimViewerImplemented` | **false** |
| `automaticAnalysisModelCertificationEnabled` | **false** |
| `additionalExternalSolverExecutionImplemented` | **false** |
| `productionMemoryRepositoryAllowed` | **false** |
| `DigitalTwinV1Intact` | **true** |
| `phase13CReady` | **true** (flag only) |

## Scope honesty

- **In:** IFC/openBIM federation metadata (GlobalId, project/storey/elements),
  mapping review (`engineering_model_interoperability.mapping_review`),
  change-impact + result references with trust classification.
- **Out:** production ETABS / SPACE GASS / SAP2000 / Revit / Navisworks / Tekla
  adapters; solver execution; model mutation/authoring; analysis-model
  generation; full BIM viewer; PG binary storage.

IFC imported results default to `source_declared` — never
`rtb_execution_certified` by import alone.

## Parser

Bounded STEP/IFC text extractor (`bounded_step_text_extractor` /
`0.2.0-ifc-federation-step-1`). Supported schemas: IFC2X3, IFC4, IFC4X3.
Fail-closed on unsupported schema / malformed HEADER. Unsupported entities are
recorded as limitations (not silently discarded). Node + Vitest + CI friendly
(no GPU).

## Certification

72 gates (A–BT), run by
`CERTIFY_BROWSER=1 pnpm --filter @rtb/engineering-model-interoperability-certification certify:phase13b`.
