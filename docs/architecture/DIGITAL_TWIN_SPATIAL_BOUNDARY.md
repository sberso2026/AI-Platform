# Digital Twin — Spatial Boundary (Phase 12F)

Status: representation · `THREE_D_VIEWER_IMPLEMENTED = false`

See also: `DIGITAL_TWIN_SPATIAL_MODEL_RECONCILIATION.md`, `DIGITAL_TWIN_REPRESENTATION_MODEL.md`.

## Spatial boundary

| Capability | Phase 12F |
| --- | --- |
| Thin `TwinSpatialReference` wrappers | **implemented** (refs + CRS + unitSystem) |
| Canonical location registry | **forbidden** (shared domain owns) |
| BIM/IFC representation mapping | **implemented** (refs/metadata only) |
| Mesh / geometry payload storage | **forbidden** |
| **3D viewer** | **forbidden** (`threeDViewerImplemented=false`) |
| BIM authoring / source model mutation | **forbidden** |
| Point cloud processing | **forbidden** |
| GIS engine / map tile serving | **forbidden** |
| Representation navigation (resolve) | **implemented** (read-oriented UI/API) |

## Consumes vs owns

- **Owns**: representation source/element/mapping refs; thin spatial wrappers
- **Does not own**: canonical location registers (`engineering_os_shared_spatial_domain`, Phase 12L)
- **Does not own**: Engineering Model binaries (Platform Files / engineering_documents)
- **Does not own**: rendering engine, WebGL scene graph, or full BIM viewer shell

## CRS governance

`coordinateReferenceSystem` is required on spatial refs. Transformations must declare
`sourceCRS`, `targetCRS`, `method`, `version`, and `provenance`. No Twin GIS engine.

## Simulation boundary

Spatial outputs from simulation (L4) remain unavailable —
`simulationExecutionImplemented=false`.
