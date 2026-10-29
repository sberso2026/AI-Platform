# ADR — TwinSpatialReference Migration / Rebinding Strategy

Status: Accepted (Phase 12M spatial_core) · Date: 2026-08-09

## Context

Phase 12F implemented `TwinSpatialReference` as thin wrappers over
`canonicalLocationId` + required CRS, persisted in `digital_twin_spatial_references`
(batch_79). Phase 12L designated Shared Spatial Domain as canonical owner.
Phase 12M materializes `engineering_spatial_references` (batch_85).

## Decision

**Additive dual-read rebinding (12M):**

1. Preferential optional field `sharedSpatialReferenceId` on `TwinSpatialReference`
   points at Shared Spatial Domain `SpatialReference.id`
2. Historical records without shared id remain valid (`bindingMode:
   legacy_location_pointer`)
3. batch_75–84 **untouched** (no destructive rewrite of batch_79)
4. Twin does **not** invent a location registry; `ownsCanonicalLocation: false`
5. Digital Twin version remains `0.11.0-digital-thread`
6. Shared Spatial Domain sets `DigitalTwinSpatialBindingReady=true` and
   `spatialOwnershipFullyResolved=true`; DT package may keep its own
   `spatialOwnershipFullyResolved=false` while residual dual-read persists

## Consequences

- No geometry migration into Twin or Shared Spatial Domain
- Digital Thread may reference kind `spatial_reference` (participation only)
- Contract family `TwinSpatialReferenceRebindingStrategy` documents the path
- batch_85 owns shared tables; DT outbox unchanged
