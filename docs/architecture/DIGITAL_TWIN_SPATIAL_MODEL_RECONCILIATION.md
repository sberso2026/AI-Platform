# Digital Twin — Spatial / Model Ownership Reconciliation (Phase 12F)

Status: representation · `duplicateModelOwnershipDetected = false`

## Inventory (pre-12F)

| Concern | Existing owner | Twin role |
| --- | --- | --- |
| Canonical locations / place refs | `engineering_os_shared_domain` (types + TEXT location fields) | Consume via thin wrappers |
| Canonical assets / projects | shared domain / shared project domain | Consume IDs only |
| Model file blobs | Platform Files / `engineering_documents` | Store `source_ref` / `fileId` pointers only |
| Twin representation refs | Digital Twin (`TwinRepresentationReference`, 12B) | Extend — still `stores_geometry_payload=false` |
| Representation versions | Digital Twin (12C) | Append/supersede only |
| Engineering time series | `asset_intelligence` | Unchanged — `duplicateTimeSeriesPlaneDetected=false` |
| Shared spatial domain package/tables | **None** as a dedicated Twin plane | Do **not** invent a Twin location registry |

## Ownership locks (12F)

| Flag / declaration | Value |
| --- | --- |
| `spatialCanonicalOwnership` | `existing_shared_spatial_domain_or_explicitly_reconciled_owner` |
| `sourceModelOwnership` | `external_or_existing_engineering_model_owner` |
| `duplicateModelOwnershipDetected` | **false** (asserted) |
| `duplicateTimeSeriesPlaneDetected` | **false** |
| `threeDViewerImplemented` | **false** |
| `automaticRepresentationMappingApprovalEnabled` | **false** |

## TwinSpatialReference

Thin wrapper only:

- `locationRef` / `assetRef` / `projectRef` → outward shared-domain IDs
- `coordinateReferenceSystem` **required**
- `unitSystem` required for spatial-aware refs
- CRS transformations must declare `sourceCRS`, `targetCRS`, `method`, `version`, `provenance`
- No GIS engine, no mesh store, no new Location hierarchy tables owned by Twin

## Asserted non-duplication

`duplicateModelOwnershipDetected=false` — Twin does not create a parallel Engineering Model registry or duplicate Platform Files / engineering_documents storage.
