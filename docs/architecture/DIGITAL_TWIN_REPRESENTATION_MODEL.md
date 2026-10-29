# Digital Twin — Representation Model (Phase 12F terminology lock)

Status: representation · Version: `0.6.0-representation` · `threeDViewerImplemented = false`

## Terminology lock

| Term | Definition | Owns / does not |
| --- | --- | --- |
| **Engineering Model** | Authoritative BIM/IFC/CAD/drawing/GIS/point-cloud/schematic artefact held by an external or existing engineering model owner (Platform Files / `engineering_documents`). | Twin does **not** own model binaries |
| **Twin Representation** | Module-owned reference config that points at an Engineering Model via `source_ref` / `fileId` — extends Phase 12B `TwinRepresentationReference` | Twin owns references + version history |
| **Element** | Named component/object within a representation (`TwinRepresentationElementReference`) — identifier and metadata only | No geometry blob |
| **Spatial Ref** | Thin `TwinSpatialReference` wrapping shared-domain location / asset / project IDs plus CRS + unit system | No Twin location registry |
| **Geometry Ref** | Pointer to geometry in an external model (element external id, GUID, etc.) | Never stores mesh/solid payloads |
| **Mapping** | Versioned `TwinRepresentationMapping` linking Twin / entity / state / telemetry / inspection targets to representation elements | Published mappings are not silently overwritten |
| **Navigation** | Read-oriented resolve Twin/entity/state/telemetry/inspection → elements | Visual/navigation ≠ full 3D/BIM viewer |
| **Viewer** | Interactive 3D/BIM rendering shell | **Forbidden** in 12F (`threeDViewerImplemented=false`) |
| **Authoring** | Creating or mutating source Engineering Models | **Forbidden** (`viewer_authoring_enabled=false`) |

## Formats (source reference)

`ifc | bim | cad | drawing | gis | point_cloud | schematic | other`

## Mapping methods

| Method | Role |
| --- | --- |
| `manual_confirmed` | Human-confirmed mapping |
| `external_id_match` | Deterministic external id equality |
| `canonical_reference_match` | Shared-domain canonical id match |
| `deterministic_metadata_match` | Deterministic metadata rule match |
| `ai_assisted_match` | **Suggest only** — never auto-approves |

## Confidence

`confirmed | high | medium | low | conflicting | unknown`

## Fidelity

Representation mapping **declares** fidelity (12A L0–L5 model). No auto-promotion. No simulation fidelity claim (`simulationExecutionImplemented=false`).

## Change impact

`unaffected | review_required | mapping_invalid | unknown`
