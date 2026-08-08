# ADR — BIM / GIS / Model Boundary

Status: Accepted (Phase 12L discovery) · Date: 2026-08-09

## Context

Digital Twin representation mapping already treats IFC/BIM/GIS as **source formats**
with external pointers. Inspection Intelligence reserves GIS compatibility as future.

## Decision

| Plane | Owner | Shared Spatial role |
| --- | --- | --- |
| BIM / IFC model binaries | external / Platform Files | **REFERENCES** only |
| GIS feature stores / tiles | external GIS systems | **MUST_NEVER_OWN** |
| Twin representation mappings | Digital Twin | consumes spatial refs |
| Spatial reference semantics | Shared Spatial Domain | **OWNS** |

Shared Spatial Domain is **not** a BIM authoring tool, GIS engine, or model vault.

## Consequences

- `gisRuntimeImplemented=false`, `threeDViewerImplemented=false`
- Representation formats may list `gis`/`ifc`/`bim` without implying ownership
- Model mutation remains forbidden for Twin and Shared Spatial Domain
