# Engineering Shared Spatial Domain — Boundary Map (Phase 12L)

Status: discovery · Runtime: **not implemented**

## In scope (discovery)

- Ownership locks and architecture ADRs
- Draft reference types: `SpatialReference`, `LocationReference`, CRS refs
- Draft public contracts `0.1.0-draft`
- Reconciliation of Digital Twin `SPATIAL_CANONICAL_OWNERSHIP` to
  `engineering_os_shared_spatial_domain`
- Certification gates for discovery readiness

## Out of scope (forbidden in 12L)

| Capability | Status |
| --- | --- |
| Spatial runtime / registers | forbidden (`SharedSpatialDomainRuntimeImplemented=false`) |
| GIS engine / map tiles | forbidden (`gisRuntimeImplemented=false`) |
| PostGIS | forbidden |
| Coordinate transformation execution | forbidden (`coordinateTransformationImplemented=false`) |
| Spatial analytics | forbidden |
| Sensor registry / SHM | forbidden |
| 3D viewer | forbidden |
| Production DB tables (`engineering_locations`) | deferred |
| Phase 12M implementation | flag only (`phase12MReady=true`) — **do not start Phase 12M** |

## Module boundaries

```
Engineering Shared Spatial Domain (12L discovery)
  OWNS: LocationReference, SpatialReference, CRS ref semantics (draft)
  FORBIDDEN: geometry blobs, GIS/PostGIS runtime, transforms, analytics

Consumers (CONSUMES / REFERENCES):
  - Digital Twin → thin TwinSpatialReference wrappers (unchanged)
  - Inspection / Asset / Project Intelligence → consumer vocabulary
  - Shared Project Domain → reserved LocationReference type

Identity owners (remain unchanged):
  - engineering_os_shared_domain → assets
  - engineering_os_shared_project_domain → projects

External geometry / models:
  - Platform Files / engineering_documents / BIM / GIS files
```

## Digital Twin relationship

Digital Twin **is not** the Shared Spatial Domain. It continues to own twin identity,
state, representation mappings, simulation, and digital thread. For spatial:

- **OWNS**: thin `TwinSpatialReference` records (batch_79) — functional, unchanged
- **CONSUMES/REFERENCES**: future shared LocationReference / CRS refs
- **MUST_NEVER_OWN**: canonical location registry, geometry blobs, GIS runtime

See `docs/architecture/adr/ADR_TWIN_SPATIAL_REFERENCE_REBINDING.md`.
