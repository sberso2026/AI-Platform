# Engineering Model Interoperability — IFC Strategy (Phase 13B)

Status: ifc_federation · `IFCFederationReady=true` ·
`ifcProductionAdapterImplemented=true` · Version `0.2.0-ifc-federation`

## Decision

IFC / openBIM is a **first-class vendor-neutral interoperability path** and the
**only production adapter** in Phase 13B.

IFC is **not the sole pathway** long-term. Native product adapters (ETABS,
SPACE GASS, Revit, etc.) remain optional and unimplemented in 13B.

## Runtime

| Topic | Lock |
| --- | --- |
| Production adapter | `IFCModelAdapter` (`ifc_openbim`) |
| Parser | Bounded STEP/IFC text extractor (`0.2.0-ifc-federation-step-1`) |
| Supported schemas | IFC2X3, IFC4, IFC4X3 (fail-closed otherwise) |
| Geometry / viewer | Not extracted / `fullBimViewerImplemented=false` |
| Binaries | Platform Files string refs — no PG binary storage |
| Model ownership | Federated IFC references do not transfer ownership to RTB |
| Unsupported entities | Recorded as limitations (not silently discarded) |

## Capability class

For `ifc_openbim`:

- `modelFederationSupported=true`
- `resultFederationSupported=true`
- `analysisModelGenerationSupported=true` (future — not implemented / not auto-certified)
- `solverExecutionSupported=false`
- `productionAdapterImplemented=true` (**13B**)

All other providers remain `productionAdapterImplemented=false`.

## Non-goals (13B)

- No production native CSI / SPACE GASS / Revit / Navisworks / Tekla adapters
- No automatic BIM→analysis model certification
- No full 3D BIM viewer
- No GPU-dependent parsing in CI
