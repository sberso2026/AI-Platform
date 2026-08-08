# Engineering Shared Spatial Domain — Ownership Matrix (Phase 12L)

Status: discovery · `SharedSpatialDomainOwnershipLocked=true` ·
`spatialOwnershipFullyResolved=false`

Aligned with `packages/engineering-shared-spatial-domain/src/architecture/ownership-lock.ts`.

## Ownership clarification

| Flag | Value | Meaning |
| --- | --- | --- |
| `SharedSpatialDomainOwnershipLocked` | **true** | Architecture decision locked |
| `spatialOwnershipFullyResolved` | **false** | Competing residual TEXT + no register yet — honest PASS |
| `SharedSpatialDomainRuntimeImplemented` | **false** | Always false in discovery |
| `duplicateSpatialOwnershipDetected` | **false** | No proven second canonical authority |
| `duplicateGeometryOwnershipDetected` | **false** | Geometry stays external |

## Matrix

| Concern | Owner | Relation |
| --- | --- | --- |
| spatial_reference_semantics | `engineering_os_shared_spatial_domain` | **OWNS** |
| location_reference | `engineering_os_shared_spatial_domain` | **OWNS** (future register) |
| crs_reference_governance | `engineering_os_shared_spatial_domain` | **OWNS** |
| twin_spatial_reference (thin wrappers) | `digital_twin` | **OWNS** wrappers / **CONSUMES** shared refs |
| canonical_spatial_location registry | `engineering_os_shared_spatial_domain` | **OWNS** (DT **MUST_NEVER_OWN**) |
| geometry_blobs / BIM / GIS files | `external_or_existing_engineering_model_owner` | **MUST_NEVER_OWN** (shared spatial) |
| asset_identity | `engineering_os_shared_domain` | **REFERENCES** |
| project_identity | `engineering_os_shared_project_domain` | **REFERENCES** |
| engineering_time_series | `asset_intelligence` | **MUST_NEVER_OWN** |
| knowledge_graph | `platform_kernel_knowledge_graph` | **REFERENCES** (not spatial owner) |
| inspection spatial vocabulary | `inspection_intelligence` | **CONSUMES** |
| residual TEXT location fields | unresolved residual | **RESERVED** (keeps FullyResolved=false) |
| gis_runtime / transforms / analytics | shared spatial | **FORBIDDEN** in 12L |
| sensor_registry / SHM | `shm` / out of scope | **MUST_NEVER_OWN** |

## Preferred architecture (locked)

```
RTB AI Platform
  → Engineering OS
    → Shared Spatial Domain  (canonical spatial REFERENCE semantics)
    → Shared Asset / Project Domains (identity)
    → Digital Twin (CONSUMES / thin TwinSpatialReference)
    → Asset / Inspection / Project Intelligence (CONSUMES)
```

Geometry blobs remain in external BIM/GIS/files. Time series stays Asset Intelligence.
Knowledge Graph remains shared platform kernel — not a spatial authority.
