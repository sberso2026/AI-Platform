# ADR — CRS Governance

Status: Accepted (Phase 12L discovery) · Date: 2026-08-09

## Context

Digital Twin Phase 12F already requires `coordinateReferenceSystem` on spatial refs
and declares transform provenance fields without a GIS engine.

## Decision

Shared Spatial Domain owns **CRS reference governance**:

- CRS identity strings (e.g. `EPSG:4326`), optional authority/epsgCode
- Transformation **declarations** must include `sourceCRS`, `targetCRS`, method,
  version, and provenance
- `coordinateTransformationImplemented = false` — no execution engine in 12L
- `gisRuntimeImplemented = false`

## Consequences

- Draft `CoordinateReferenceSystemReference` types ship in discovery package
- Twin continues to require CRS on `TwinSpatialReference`
- Naming drift (`coordinate_system` vs `coordinate_reference_system`) documented for
  later normalization — not fixed destructively in 12L
