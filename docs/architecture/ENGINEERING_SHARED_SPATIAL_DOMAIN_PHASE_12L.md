# Phase 12L — Engineering Shared Spatial Domain Discovery

Status: discovery · Module version: `0.1.0-spatial-discovery` · Phase: 12L ·
Baseline: Phase 12K PASS `dc5d1d6775b172634cd50038d34f35c13c34c339` ·
Hosted 12K: `31269156189`

## Overview

Phase 12L discovers and locks Shared Spatial Domain ownership. It ships **no spatial
runtime**: no GIS, PostGIS, coordinate transforms, spatial analytics, sensor registry,
SHM, or `engineering_locations` product tables.

**Do not start Phase 12M** in this phase — `PHASE_12M_READY=true` is a flag only.

What it ships:

| Artefact | Purpose |
| --- | --- |
| `packages/engineering-shared-spatial-domain` | Discovery package: version, ownership lock, draft refs/contracts |
| `packages/engineering-shared-spatial-domain-certification` | Phase 12L gates A–BE + runner |
| Architecture docs + ADRs | Footprint, matrix, boundaries, CRS/geometry/BIM/linear/Twin rebinding |
| `docs/contracts/ENGINEERING_SHARED_SPATIAL_DOMAIN_PUBLIC_CONTRACTS_DRAFT.md` | Draft `0.1.0-draft` |
| `.github/workflows/phase-12l-shared-spatial-domain-discovery.yml` | Hosted certification |

## Declared flags

| Flag | Value |
| --- | --- |
| `SharedSpatialDomainDiscoveryReady` | **true** |
| `SharedSpatialDomainOwnershipLocked` | **true** |
| `SharedSpatialDomainRuntimeImplemented` | **false** (always) |
| `spatialOwnershipFullyResolved` | **false** (honest — no register / residual TEXT) |
| `coordinateTransformationImplemented` | **false** |
| `gisRuntimeImplemented` | **false** |
| `spatialAnalyticsImplemented` | **false** |
| `duplicateSpatialOwnershipDetected` | **false** |
| `phase12MReady` | **true** (flag only) |
| `releaseEligible` | **true** when gates pass |

## Digital Twin constraints

- Version **must** remain `0.11.0-digital-thread` (no GA / 1.0.0 bump)
- `TwinSpatialReference` remains functional thin wrappers
- `productionDigitalTwinReady=false`
- DT `spatialOwnershipFullyResolved=false`
- `SPATIAL_CANONICAL_OWNERSHIP` reconciled to `engineering_os_shared_spatial_domain`
- batch_75–84 untouched; V1 tags untouched

## Certification

57 gates (A–BE), run by
`pnpm --filter @rtb/engineering-shared-spatial-domain-certification certify:phase12l`.

Docs + unit + architecture gates only (no required browser E2E).

## Honest PASS path

Ownership decision is locked (`OwnershipLocked=true`) while
`spatialOwnershipFullyResolved=false` until a later implementation phase creates
domain registers and retires residual TEXT location fields. Do **not** force
`spatialOwnershipFullyResolved=true` just to PASS.
