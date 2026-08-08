# Engineering Shared Spatial Domain — Public Contracts Draft

Status: **draft** · Version: `0.1.0-draft` · Phase: 12L discovery

These contracts are **not** GA and are **not** runtime-backed.

## Contract families

| Family | Intent |
| --- | --- |
| `SpatialReferenceCore` | Composed spatial pointer (location + CRS + optional local frame) |
| `LocationReferenceCore` | Canonical location identity (future `engineering_locations`) |
| `CoordinateReferenceSystemCore` | CRS identity / authority / EPSG code declaration |
| `CoordinateTransformationDeclarationCore` | Declared transform provenance — **not executed** |
| `LinearReferenceReservation` | Chainage/station reserved — no runtime |
| `TwinSpatialReferenceRebindingStrategy` | How DT thin wrappers rebind to shared refs later |

## Non-goals

- No GIS query API
- No geometry payload contracts
- No PostGIS types
- No sensor placement runtime contracts
- No automatic CRS transforms

## Stability

Draft contracts may evolve in Phase 12M+ without implying production readiness.
`PUBLIC_CONTRACT_VERSION` remains `0.1.0-draft` for this discovery package.
