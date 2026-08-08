# ADR — TwinSpatialReference Migration / Rebinding Strategy

Status: Accepted (Phase 12L discovery) · Date: 2026-08-09

## Context

Phase 12F implemented `TwinSpatialReference` as thin wrappers over
`canonicalLocationId` + required CRS, persisted in `digital_twin_spatial_references`
(batch_79). There is no shared location register to resolve against today.

## Decision

**Non-destructive rebinding strategy:**

1. Keep `TwinSpatialReference` **as-is** (functional) through 12L
2. Shared Spatial Domain becomes the designated owner of LocationReference / CRS refs
3. When a future phase materializes `engineering_locations` (or equivalent):
   - Rebind Twin `canonical_location_id` / `location_ref` to shared LocationReference ids
   - Prefer additive columns or resolution ports over destructive table rewrites
   - Do **not** migrate geometry into Twin or Shared Spatial Domain
4. Until then:
   - `spatialOwnershipFullyResolved = false`
   - Twin continues `ownsCanonicalLocation: false`
   - Residual TEXT fields remain documented bridges

## Consequences

- batch_79 untouched in 12L
- No destructive migration scripts
- Certification proves DT is not canonical spatial owner
- Contract family `TwinSpatialReferenceRebindingStrategy` documents the path
