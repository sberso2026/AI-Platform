# Engineering Shared Spatial Domain — Existing Footprint (Phase 12L)

Status: discovery · Package version: `0.1.0-spatial-discovery` · Phase: 12L ·
Baseline HEAD: `dc5d1d6775b172634cd50038d34f35c13c34c339` (Phase 12K PASS) ·
Hosted 12K: `31269156189`

## Executive finding

**Prior to Phase 12L: no dedicated shared spatial package** and **no `engineering_locations`
table**. Canonical location ownership was declared (`engineering_os_shared_domain` /
placeholder `existing_shared_spatial_domain_or_explicitly_reconciled_owner`) but never
materialized. Locations are predominantly **TEXT** on assets/projects.
`TwinSpatialReference` (Phase 12F) is a thin Digital Twin wrapper only.
`spatialOwnershipFullyResolved` remains **false**.

Phase 12L introduces `@rtb/engineering-shared-spatial-domain` as the designated **future
owner of spatial REFERENCE semantics**. It does **not** implement runtime, GIS, PostGIS,
transforms, analytics, or product tables.

## Package inventory

| Surface | Role | Notes |
| --- | --- | --- |
| `packages/engineering-shared-spatial-domain` (**new, 12L**) | **OWNS** draft reference semantics + ownership locks | Discovery only |
| `packages/digital-twin` | **OWNS** thin `TwinSpatialReference`; **CONSUMES** location/CRS ids | Remains `0.11.0-digital-thread` |
| `packages/engineering-shared-project-domain` | **REFERENCES** reserved `LocationReference` type | No location resolver; nearest = project TEXT |
| `packages/engineering-os` | De facto TEXT `location` read/write on assets/projects | Not a spatial register |
| `packages/types` | `EngineeringLocation` interface; `location?: string` | Typed; limited/no SQL |
| `packages/inspection-intelligence` | **CONSUMES** `AssetReferenceLocation` vocabulary | Not canonical owner |
| `packages/asset-intelligence` | Hierarchy kind `"location"`; `locationId?` | Consumes shared-domain ids |
| `packages/platform-kernel` | `sensors.location` JSONB | Placement metadata, not CRS registry |
| `packages/project-intelligence` | `source_coordinates` JSONB | Document layout coords, not GIS |
| Prior dedicated `engineering-shared-spatial*` | **Absent before 12L** | Confirmed |

## Database footprint

### TEXT-only engineering locations (batch_20)

| Table | Columns |
| --- | --- |
| `engineering_projects` | `site_name TEXT`, `location TEXT` |
| `engineering_assets` | `location TEXT` |

Residual free-text fields (documented in discovery flags as
`RESIDUAL_TEXT_LOCATION_FIELDS`): `engineering_assets.location`,
`engineering_projects.location`, and `engineering_projects.site_name`.
No FK, no hierarchy, no CRS.

### Digital Twin spatial (batch_75–79; do not modify in 12L)

| Table / migration | Spatial columns |
| --- | --- |
| `digital_twin_representations` (batch_75) | `coordinate_system text`; `stores_geometry_payload=false` |
| `digital_twin_representation_versions` (batch_76) | `coordinate_system text` |
| `digital_twin_spatial_references` (batch_79) | `location_ref`, `canonical_location_id`, CRS, `zone_ref`, `level_ref` |
| Representation sources/elements | CRS / `geometry_ref` pointers only |

### Absent

- `engineering_locations` table — **does not exist**
- PostGIS extensions / geometry columns — **none**
- latitude/longitude/EPSG SQL columns — **none**
- chainage / stationing / linear reference SQL — **none**
- batch_85 / shared-spatial product migrations — **none in 12L**

## Type / code footprint

| Path | Finding |
| --- | --- |
| `packages/digital-twin/src/domain/spatial-reference.ts` | `TwinSpatialReference` thin wrapper; `ownsCanonicalLocation: false` |
| `packages/digital-twin/src/domain/crs-governance.ts` | CRS declaration types; `GIS_ENGINE_IMPLEMENTED=false` |
| `packages/types/src/engineering-domain.ts` | `EngineeringLocation` interface without SQL backing |
| `packages/engineering-os/src/domain-sdk/index.ts` | `EngineeringLocationRef` |
| `packages/engineering-shared-project-domain/src/references.ts` | Reserved `LocationReference` |
| `packages/inspection-intelligence/.../asset-reference.ts` | `AssetReferenceLocation` consumer vocabulary |

## Unowned / conflicting concepts (honest)

| Concept | Status |
| --- | --- |
| Declared vs actual location owner | Declared shared-domain; no register → **unresolved** |
| TEXT locations without registry | Residual consumers; not a second canonical authority |
| Twin `canonical_location_id` | Points at non-materialized ids |
| `zone_ref` / `level_ref` | Twin-local only today |
| `coordinate_system` vs `coordinate_reference_system` | Naming drift; no normalization layer |
| Linear referencing | Zero runtime footprint; reserved in 12L drafts |

## Flags after Phase 12L discovery

| Flag | Value | Meaning |
| --- | --- | --- |
| `SharedSpatialDomainOwnershipLocked` | **true** | Decision locked: shared spatial owns refs |
| `spatialOwnershipFullyResolved` | **false** | No register; residual TEXT remains |
| `SharedSpatialDomainRuntimeImplemented` | **false** | Always false in 12L |
| `duplicateSpatialOwnershipDetected` | **false** | Competing TEXT consumers ≠ duplicate authority |
| Digital Twin version | `0.11.0-digital-thread` | Unchanged; not GA |

## Protected baselines

batch_75–84 Digital Twin migrations must remain untouched.
V1 tags (Project Controls, Asset/Project/Inspection Intelligence) must not move.
