# ADR — Geometry Ownership

Status: Accepted (Phase 12L discovery) · Date: 2026-08-09

## Context

Representation sources already forbid storing geometry payloads
(`stores_geometry_payload=false`). Model binaries live in Platform Files /
`engineering_documents` or external BIM/GIS systems.

## Decision

**Geometry blobs stay external.** Shared Spatial Domain **MUST_NEVER_OWN** geometry
payloads, meshes, point clouds, or GIS feature stores.

- `GEOMETRY_BLOB_OWNERSHIP = external_or_existing_engineering_model_owner`
- `duplicateGeometryOwnershipDetected = false`
- Twin may store `geometry_ref` / `source_ref` / `fileId` pointers only

## Consequences

- No PostGIS geometry columns in 12L
- No mesh/IFC blob ingestion into Shared Spatial Domain
- Later phases may add reference registers, not twin-owned geometry warehouses
