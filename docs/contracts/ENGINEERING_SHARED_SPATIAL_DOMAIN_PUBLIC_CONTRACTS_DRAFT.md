# Engineering Shared Spatial Domain — Public Contracts (0.2.0-spatial-core)

Status: **prerelease** · Version: `0.2.0-spatial-core` · Phase: 12M spatial_core

These contracts are **runtime-backed** for reference registry operations but are
**not GA** (`1.0.0` forbidden).

## Contract families

| Family | Intent |
| --- | --- |
| `SpatialReferenceCore` | Canonical SpatialReference identity, hierarchy, lifecycle, versioning |
| `LocationReferenceCore` | Thin alias over SpatialReference |
| `CoordinateReferenceSystemCore` | EPSG / project grid / BIM-model / external CRS identity |
| `CoordinateReferenceCore` | Optional x/y/z or lat/lon/elev WITH CRS (incompatible CRS → abstain) |
| `SpatialRelationshipReferenceCore` | Declared relationships (≠ geometric proof) |
| `LegacySpatialReconciliationCore` | TEXT classification states; candidate ≠ canonical |
| `SpatialReferenceReviewCore` | `engineering_shared_spatial_domain.spatial_reference_review` |
| `CoordinateTransformationDeclarationCore` | Declared transform provenance — **not executed** |
| `LinearReferenceReservation` | alignmentReference / chainage / station / offset semantics only |
| `TwinSpatialReferenceRebindingStrategy` | Additive `sharedSpatialReferenceId` dual-read binding |

## Non-goals

- No GIS query API
- No geometry payload contracts
- No PostGIS product types
- No sensor placement / telemetry / SHM runtime contracts
- No automatic CRS transforms
- No AI spatial authority / auto location approval

## Stability

`PUBLIC_CONTRACT_VERSION` = `0.2.0-spatial-core`. Must not claim `1.0.0`.
