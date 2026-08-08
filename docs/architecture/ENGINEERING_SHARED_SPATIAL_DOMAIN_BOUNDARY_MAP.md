# Engineering Shared Spatial Domain — Boundary Map (Phase 12M)

Status: spatial_core · Runtime: **reference registry + governance** (not GIS)

## In scope (12M)

- Canonical `SpatialReference` registry (`engineering_spatial_references`)
- CRS registry, coordinate references (WITH CRS), declared relationships
- Legacy TEXT reconciliation states (candidate ≠ canonical)
- Review workflow `engineering_shared_spatial_domain.spatial_reference_review`
- Memory + Postgres persistence adapters
- Engineering OS HTTP under `/api/engineering/spatial/*`
- Additive DT binding to `SpatialReference.id` (dual-read)
- Public contracts `0.2.0-spatial-core` (prerelease, not GA)
- `spatialOwnershipFullyResolved=true` when ownership-lock conditions proven

## Out of scope (forbidden in 12M)

| Capability | Status |
| --- | --- |
| GIS engine / map product | forbidden (`gisRuntimeImplemented=false`) |
| PostGIS product features | forbidden |
| Coordinate transformation execution | forbidden (`coordinateTransformationImplemented=false`) |
| Spatial analytics / intersection / containment compute | forbidden |
| Geometry blob repository | forbidden (`geometryRepositoryImplemented=false`) |
| BIM/CAD extraction | forbidden |
| Sensor registry / SHM / telemetry / actuation | forbidden |
| AI spatial authority / auto location approval | forbidden |
| Digital Twin as canonical spatial owner | forbidden (`digitalTwinMayOwnCanonicalSpatial=false`) |
| Phase 12N | flag only (`PHASE_12N_READY=true`) — **do not start** |

## Module boundaries

```
RTB AI Platform
  └── Engineering OS
        └── Shared Spatial Domain (OWNS SpatialReference / CRS refs)
              ├── HTTP /api/engineering/spatial/*
              ├── batch_85 tables (no geometry / no PostGIS types)
              └── Consumers
                    ├── Digital Twin (additive sharedSpatialReferenceId)
                    ├── Asset / Inspection / Project Intelligence
                    └── Project Controls
```

## Declared vs proven

Declared spatial relationships are **semantic only**. They do not constitute
geometric proof and must not trigger intersection/containment computation.
