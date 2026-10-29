# Engineering Shared Spatial Domain — Phase 12M Core

Status: **spatial_core** · Version: `0.2.0-spatial-core` · Phase: **12M**

Baseline: Phase 12L PASS @ `7d9bfbd792a034bae088dbb1db02876ca400929d` · hosted `31269729941`

## Scope

Canonical **SpatialReference** registry, CRS governance, coordinate references
(WITH CRS), declared relationships, legacy TEXT reconciliation states, review
workflow, persistence adapters, Engineering OS HTTP routes, and additive Digital
Twin binding to `SpatialReference.id`.

## Decision: `spatialOwnershipFullyResolved = true`

Proven when all of the following hold (asserted in ownership-lock):

| Condition | Evidence |
| --- | --- |
| Registry ready | `engineering_spatial_references` + `SharedSpatialReferenceRegistryReady` |
| Ownership locked | `SharedSpatialDomainOwnershipLocked` |
| Runtime (refs only) | `SharedSpatialDomainRuntimeImplemented` |
| CRS ops (no transforms) | CRS registry + `assertCoordinateCrsCompatible` fail-closed |
| Legacy classified | `LegacySpatialReconciliation` states; candidate ≠ canonical |
| Geometry external | `geometryRepositoryImplemented=false`; blobs external |
| DT consume-only | `DigitalTwinSpatialBindingReady`; `digitalTwinMayOwnCanonicalSpatial=false` |

Residual TEXT columns remain bridges classified via reconciliation — not a
competing canonical authority. Digital Twin keeps its own
`spatialOwnershipFullyResolved=false` (dual-read / residual pointers).

## Tables (batch_85)

| Table | PK |
| --- | --- |
| `engineering_spatial_references` | `spatial_reference_id` |
| `engineering_spatial_relationships` | `relationship_id` |
| `engineering_coordinate_reference_systems` | `crs_id` |
| `engineering_coordinate_references` | `coordinate_reference_id` |
| `engineering_spatial_reference_reviews` | `review_id` |
| `engineering_legacy_spatial_reconciliations` | `reconciliation_id` |
| `engineering_shared_spatial_outbox_events` | `outbox_id` |

No PostGIS types. No geometry blobs. batch_75–84 untouched.

## Critical forbids (retained)

No GIS product, PostGIS features, coord transforms, spatial analytics, geometry
repository, BIM/CAD extraction, map product, sensor registry, telemetry, SHM,
actuation, auto location approval, AI spatial authority.

Declared relationship ≠ geometric proof.

## Twin binding

Additive optional `sharedSpatialReferenceId` on `TwinSpatialReference`.
Historical records without shared id remain valid (`bindingMode:
legacy_location_pointer`). DT version remains `0.11.0-digital-thread`.

## Phase 12N

`PHASE_12N_READY=true` is a **flag only** — do not start Phase 12N.
