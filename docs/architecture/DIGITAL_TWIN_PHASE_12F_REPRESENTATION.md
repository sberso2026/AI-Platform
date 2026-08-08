# Phase 12F — Digital Twin Spatial Context, BIM/IFC Representation Mapping & Navigation

Status: representation · Version: `0.6.0-representation` · Phase: `12F`

## Baseline

| Pin | Value |
| --- | --- |
| Phase 12E commit | `b871e8c3eb9e1293604610bacdd410ecb4da5684` |
| Phase 12E hosted run | `31260082507` |
| Phase 12E version | `0.5.0-telemetry-binding` |

## Scope delivered

- `TwinRepresentationSourceReference` — formats ifc/bim/cad/drawing/gis/point_cloud/schematic/other; reference only
- `TwinRepresentationElementReference` — no geometry blob
- `TwinRepresentationMapping` — versioned; published not silently overwritten
- Mapping review workflow `digital_twin.representation_mapping_review`
- `TwinSpatialReference` — thin shared-domain location wrappers + CRS governance
- `TwinRepresentationNavigationService` — read-oriented navigation (not a 3D viewer)
- `RepresentationChangeImpact` classification
- Domain events for representation registered/versioned and mapping lifecycle
- Knowledge graph typed relationships as refs only (platform KG reuse)
- Migration `batch_79` only (batch_75–78 untouched)
- HTTP surfaces under `/api/engineering/digital-twin/representation-*`
- UI marker `digital-twin-representation-ready`
- Certification gates A–BH

## Explicitly out of scope

- Full 3D / BIM viewer (`threeDViewerImplemented=false`)
- BIM/CAD authoring or source model mutation
- Model binary storage in Twin tables
- Historian / SHM runtime / simulation execution / physical actuation
- Own AI stack / automatic mapping approval
- Phase 12G implementation (flag only: `PHASE_12G_READY=true`)
- Moving V1 release tags

## Ready flags

`TwinRepresentationMappingReady=true`, `TwinRepresentationNavigationReady=true`,
`representationNavigationImplemented=true`, prior phase ready flags retained,
`productionDigitalTwinReady=false`.
