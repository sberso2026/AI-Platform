# Engineering Model Interoperability — IFC Strategy (Phase 13A)

Status: interop_discovery · `IFCFirstClassInteroperabilityReserved=true`

## Decision

IFC / openBIM is a **first-class vendor-neutral interoperability path**.

IFC is **not the sole pathway**. Native product adapters (ETABS, SPACE GASS,
Revit, etc.) remain optional and independently governed.

## Implications

| Topic | Lock |
| --- | --- |
| Vendor-neutral exchange | Prefer IFC/openBIM where it reduces lock-in |
| Native adapters | Allowed as optional; never required for all providers |
| Model ownership | Federated IFC references do not transfer ownership to RTB |
| Geometry blobs | Remain external / source-owned |
| Production ingestion | **Not implemented** in 13A |
| Sole pathway claim | **Forbidden** — `ifcSolePathway=false` |

## Capability class (discovery flags)

For `ifc_openbim`:

- `modelFederationSupported=true`
- `resultFederationSupported=true` (where result exchange exists)
- `analysisModelGenerationSupported=true` (future generation — not auto-certified)
- `solverExecutionSupported=false` (IFC is not a solver)
- `productionAdapterImplemented=false`

## Non-goals (13A)

- No IFC parser / writer production runtime
- No automatic BIM→analysis model certification
- No replacement of native CSI / SPACE GASS adapters by IFC-only policy
