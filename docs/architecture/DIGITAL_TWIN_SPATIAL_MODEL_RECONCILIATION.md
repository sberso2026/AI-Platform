# Digital Twin — Spatial / Model Ownership Reconciliation (Phase 12F → 12L)

Status: representation + 12L ownership reconciliation ·
`duplicateModelOwnershipDetected = false` · `spatialOwnershipFullyResolved = false`

## Inventory (pre-12F / pre-12L)

| Concern | Existing owner | Twin role |
| --- | --- | --- |
| Canonical locations / place refs | Shared Spatial Domain (12L decision); historically TEXT + types only | Consume via thin wrappers |
| Canonical assets / projects | shared domain / shared project domain | Consume IDs only |
| Model file blobs | Platform Files / `engineering_documents` | Store `source_ref` / `fileId` pointers only |
| Twin representation refs | Digital Twin (`TwinRepresentationReference`, 12B) | Extend — still `stores_geometry_payload=false` |
| Representation versions | Digital Twin (12C) | Append/supersede only |
| Engineering time series | `asset_intelligence` | Unchanged — `duplicateTimeSeriesPlaneDetected=false` |
| Shared spatial domain package/tables | **None prior to 12L**; discovery package added in 12L (no product tables) | Do **not** invent a Twin location registry |

## Ownership locks (12F + 12L)

| Flag / declaration | Value |
| --- | --- |
| `spatialCanonicalOwnership` | `engineering_os_shared_spatial_domain` (12L reconciled) |
| `sourceModelOwnership` | `external_or_existing_engineering_model_owner` |
| `duplicateModelOwnershipDetected` | **false** (asserted) |
| `duplicateTimeSeriesPlaneDetected` | **false** |
| `spatialOwnershipFullyResolved` | **false** (no register; residual TEXT) |
| `threeDViewerImplemented` | **false** |
| `automaticRepresentationMappingApprovalEnabled` | **false** |

See also: `ENGINEERING_SHARED_SPATIAL_DOMAIN_*` docs and
`adr/ADR_TWIN_SPATIAL_REFERENCE_REBINDING.md`.

## TwinSpatialReference

Thin wrapper only:

- `locationRef` / `assetRef` / `projectRef` → outward shared-domain IDs
- `coordinateReferenceSystem` **required**
- `unitSystem` required for spatial-aware refs
- CRS transformations must declare `sourceCRS`, `targetCRS`, `method`, `version`, `provenance`
- No GIS engine, no mesh store, no new Location hierarchy tables owned by Twin

## Asserted non-duplication

`duplicateModelOwnershipDetected=false` — Twin does not create a parallel Engineering Model registry or duplicate Platform Files / engineering_documents storage.
