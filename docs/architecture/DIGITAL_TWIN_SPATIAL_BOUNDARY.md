# Digital Twin — Spatial Boundary (Phase 12A)

Status: discovery · `THREE_D_VIEWER_IMPLEMENTED = false`

## Spatial boundary

Digital Twin may eventually anchor representations in space (L3 fidelity). Phase 12A
draws a hard boundary:

| Capability | Phase 12A |
| --- | --- |
| Spatial anchors (draft contract) | documented only |
| BIM/CAD ingestion | forbidden |
| Mesh storage | forbidden |
| **3D viewer** | **forbidden in Phase 12A** |
| Point cloud processing | forbidden |
| GIS map tile serving | forbidden |

## Consumes vs owns

- **Owns**: representation config that *references* spatial frames (draft)
- **Does not own**: canonical location registers (`engineering_os_shared_domain`)
- **Does not own**: rendering engine, WebGL scene graph, or viewer UI shell

## Integration pattern (future)

Spatial-lite (L3) binds to existing location / functional location refs on assets.
Full viewer implementation requires a dedicated phase with performance certification.

## Simulation boundary

Spatial outputs from simulation (L4) remain unavailable until simulation execution
is explicitly certified — not in discovery.
