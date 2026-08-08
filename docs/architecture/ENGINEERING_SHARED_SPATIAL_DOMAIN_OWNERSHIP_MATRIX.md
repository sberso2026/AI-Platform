# Engineering Shared Spatial Domain — Ownership Matrix (Phase 12M)

Status: spatial_core · `SharedSpatialDomainOwnershipLocked=true` ·
`spatialOwnershipFullyResolved=true` · Version `0.2.0-spatial-core`

Aligned with `packages/engineering-shared-spatial-domain/src/architecture/ownership-lock.ts`.

## Ownership clarification

| Flag | Value | Meaning |
| --- | --- | --- |
| `SharedSpatialDomainOwnershipLocked` | **true** | Architecture decision locked |
| `spatialOwnershipFullyResolved` | **true** | Registry + ownership + DT consume + legacy classified + geometry external + CRS ops |
| `SharedSpatialDomainRuntimeImplemented` | **true** | Reference registry + governance (not GIS/transforms) |
| `DigitalTwinSpatialBindingReady` | **true** | Additive consume of `SpatialReference.id` |
| `digitalTwinMayOwnCanonicalSpatial` | **false** | Always |
| `duplicateSpatialOwnershipDetected` | **false** | No second canonical authority |
| `coordinateTransformationImplemented` | **false** | Always in 12M |
| `gisRuntimeImplemented` | **false** | Always in 12M |
| `geometryRepositoryImplemented` | **false** | Always in 12M |

## Matrix

| Concern | Owner | Relation |
| --- | --- | --- |
| spatial_reference_semantics | `engineering_os_shared_spatial_domain` | **OWNS** (`engineering_spatial_references`) |
| location_reference | `engineering_os_shared_spatial_domain` | **OWNS** (thin alias over SpatialReference) |
| crs_reference_governance | `engineering_os_shared_spatial_domain` | **OWNS** |
| twin_spatial_reference (thin wrappers) | `digital_twin` | **OWNS** wrappers / **CONSUMES** shared `SpatialReference.id` |
| canonical_spatial_location registry | `engineering_os_shared_spatial_domain` | **OWNS** (DT **MUST_NEVER_OWN**) |
| geometry_blobs / BIM / GIS files | `external_or_existing_engineering_model_owner` | **MUST_NEVER_OWN** (shared spatial) |
| asset_identity | `engineering_os_shared_domain` | **REFERENCES** |
| project_identity | `engineering_os_shared_project_domain` | **REFERENCES** |
| engineering_time_series | `asset_intelligence` | **MUST_NEVER_OWN** |
| knowledge_graph | `platform_kernel_knowledge_graph` | **REFERENCES** (not spatial owner) |
| inspection spatial vocabulary | `inspection_intelligence` | **CONSUMES** |
| residual TEXT location fields | classified residual | **RESERVED** via `LegacySpatialReconciliation` (not auto-canonical) |
| gis_runtime / transforms / analytics | shared spatial | **FORBIDDEN** |
| sensor_registry / SHM | `shm` / out of scope | **MUST_NEVER_OWN** |

## Preferred architecture (locked)

```
RTB AI Platform
  └── Engineering OS
        └── Engineering Shared Spatial Domain  (canonical SpatialReference registry)
              ├── Digital Twin          (TwinSpatialReference consume-only binding)
              ├── Asset Intelligence    (consumer)
              ├── Inspection Intelligence (consumer vocabulary)
              ├── Project Intelligence  (consumer)
              └── Project Controls      (consumer)
```

## See also

- `ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE_12M.md`
- `ENGINEERING_SHARED_SPATIAL_DOMAIN_BOUNDARY_MAP.md`
- `adr/ADR_TWIN_SPATIAL_REFERENCE_REBINDING.md`
