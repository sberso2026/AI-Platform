# ADR — Shared Spatial Ownership

Status: Accepted (Phase 12L discovery) · Date: 2026-08-09

## Context

Inventory shows no dedicated shared spatial package prior to 12L, no
`engineering_locations` table, and TEXT-only locations on assets/projects.
Digital Twin holds thin `TwinSpatialReference` wrappers and a placeholder
`SPATIAL_CANONICAL_OWNERSHIP`.

## Decision

**Engineering OS → Shared Spatial Domain** owns canonical spatial **REFERENCE**
semantics (`LocationReference`, `SpatialReference`, CRS refs).

- `SharedSpatialDomainOwnershipLocked = true`
- `spatialOwnershipFullyResolved = false` until registers exist and residual TEXT
  fields are reconciled
- Digital Twin **MUST_NEVER_OWN** the canonical location registry
- Asset/Project domains remain identity owners; they do not become spatial authorities

## Consequences

- New package `@rtb/engineering-shared-spatial-domain` at `0.1.0-spatial-discovery`
- DT `SPATIAL_CANONICAL_OWNERSHIP` reconciled to `engineering_os_shared_spatial_domain`
- No product tables or runtime in 12L
