# Phase 13A — Engineering Model & Solver Interoperability Discovery

Status: interop_discovery · Module version: `0.1.0-interop-discovery` · Phase: 13A ·
Baseline: Digital Twin V1.0.0 `a94425ed009ca087c2f44c9d3757c0c82bd936b1` ·
Tag: `digital-twin-v1.0.0`

## Overview

Phase 13A discovers and locks Engineering Model & Solver Interoperability
architecture. It ships **no production interoperability runtime**: no ETABS,
SPACE GASS, SAP2000, Revit, Navisworks, or IFC ingestion adapters, and no
additional solver execution beyond Digital Twin V1 CalculiX linear-static.

**Do not start Phase 13B** in this phase — `PHASE_13B_READY=true` is a flag only.

What it ships:

| Artefact | Purpose |
| --- | --- |
| `packages/engineering-model-interoperability` | Discovery package: version, ownership/federation locks, draft contracts, provider matrix |
| `packages/engineering-model-interoperability-certification` | Phase 13A gates A–BE + runner |
| Architecture docs | Footprint, boundaries, ownership, IFC/solver/ETABS/SPACE GASS, federation model |
| `docs/contracts/ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACTS_DRAFT.md` | Draft `0.1.0-draft` |
| `.github/workflows/phase-13a-engineering-interoperability-discovery.yml` | Hosted certification |

## Declared flags

| Flag | Value |
| --- | --- |
| `InteropDiscoveryReady` | **true** |
| `EngineeringFederationModelLocked` | **true** |
| `ModelFederationBoundaryLocked` | **true** |
| `ResultFederationBoundaryLocked` | **true** |
| `SolverExecutionBoundaryLocked` | **true** |
| `IFCFirstClassInteroperabilityReserved` | **true** |
| `ETABSIntegrationDiscovered` | **true** |
| `SpaceGassIntegrationDiscovered` | **true** |
| `productionInteroperabilityRuntimeImplemented` | **false** (always) |
| `automaticAnalysisModelCertificationEnabled` | **false** (always) |
| `duplicateToolFrameworkDetected` | **false** |
| `sourceModelOwnershipPreserved` | **true** |
| `DigitalTwinV1Intact` | **true** |
| `phase13BReady` | **true** (flag only) |
| `releaseEligible` | **true** when gates pass |

## Digital Twin constraints

- Version **must** remain `1.0.0` (no bump, no phase13a under `packages/digital-twin`)
- Tag `digital-twin-v1.0.0` must not move from `a94425ed…`
- Reuse `EngineeringSolverAdapter` / Tool Framework / four-layer qualification
- Do **not** create a second solver framework
- Document reserved stubs without modifying DT package contents

## Certification

57 gates (A–BE), run by
`pnpm --filter @rtb/engineering-model-interoperability-certification certify:phase13a`.

Docs + unit + architecture gates only (no required browser E2E).

## Honest PASS path

Federation and ownership decisions are locked while
`productionInteroperabilityRuntimeImplemented=false`. Do **not** force runtime
flags true just to PASS.
