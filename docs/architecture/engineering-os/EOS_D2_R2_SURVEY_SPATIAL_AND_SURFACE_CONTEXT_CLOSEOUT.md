# EOS-D2-R2 Survey, Spatial, and Surface Context Closeout

## Result

R2 records Civil spatial reference, survey-source context, and surface context on exact R1 Civil identity. It does not generate terrain, interpolate a surface, invent survey observations, or calculate earthworks, roads, or drainage.

D2 runtime count is two. Survey, spatial, and surface context is ready. Grading and later Civil phases are not ready. R3 has not started.

## R1 binding

Every spatial, survey, and surface record cites an exact R1 context id and an exact R1 object id. The spatial record uses a COORDINATE_REFERENCE object. The survey record uses a SURVEY_SOURCE object. The surface record uses a SURFACE_REFERENCE object. Floating context labels are rejected. A newer Civil context is not substituted.

## Spatial reference

The caller supplies the coordinate reference system identifier, horizontal datum, vertical datum, project coordinate context, source authority, provenance, and currentness. Missing or inferred values are rejected. Coordinates are not stored.

## Survey source

A survey source cites its type, revision, optional supplied date, optional supplied organization, and the exact spatial reference. It does not contain observations. Presence of a survey source is not engineering validation.

## Surface context

Surface roles are EXISTING_SURFACE, DESIGN_SURFACE, IMPORTED_REFERENCE_SURFACE, and DERIVED_SURFACE_REFERENCE. EXISTING_SURFACE matches the architecture existing-surface field and still requires a survey-source citation. DESIGN_SURFACE is the proposed design role and is not approved grading. A surface context does not generate terrain and is not a validated surface.

## Currentness

Currentness uses the existing states CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. Supersession is explicit. Survey and surface records keep the spatial reference id they were given. They are not repointed when a later spatial reference is recorded.

## Authority, scope, fingerprint, and history

The recorder remains CIVIL_CONTEXT_AUTHORITY and is not Civil engineering authority. Tenant, workspace, and project must match the R1 record. Provenance is required. The fingerprint is fingerprintCanonical. Identical replay returns the existing record. Conflicting identity and a wrong fingerprint are rejected. Records are frozen and history is appended.

## Boundary

Survey observation, terrain generation, surface interpolation, grading, earthworks, quantity, road, drainage, hydrology, hydraulic, validation, approval, and certification runtime counts remain zero. D1 remains incomplete. D1N remains closed. D3 through D9 remain unstarted. No schema and no dependency were added.

## Security and release

The canonical security suite fails only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts. Both failures are the existing EOS-A16D import of EICAR_TEST_SIGNATURE from @rtb/engineering-review. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Production audit is critical 0, high 1, moderate 4. Release governance tests passed at 109. Release typecheck passed. Ledger integrity is ok. No new security or release regression was introduced.

## Next phase

The next phase is EOS-D2-R3-GRADING-AND-EARTHWORKS-CONTEXT, type GRADING_AND_EARTHWORKS_CONTEXT. Implement bounded governed grading and earthworks context using exact R1 identity and R2 spatial/surface references. Record grading zones, level/slope criteria, earthworks zones, explicit relationships, assumptions/evidence references, provenance, currentness and fingerprint. Do not calculate cut/fill quantities, optimize grading, perform slope stability, generate terrain, design roads, calculate drainage, or start D3-D9.
