# EOS-D2-R3 Grading and Earthworks Context Closeout

## Result

R3 records governed grading-zone context and earthworks-zone context on exact R1 Civil identity and exact R2 surface context. It does not design grading, generate terrain, calculate cut or fill, optimize earthworks, validate slope stability, or perform Geotechnical engineering.

D2 runtime count is three. Grading and earthworks context is ready. Roads and later Civil phases are not ready. R4 has not started.

## R1 and R2 binding

Every grading and earthworks record cites an exact R1 context and an exact R1 object. A grading record uses a GRADING_ZONE object. An earthworks record uses an EARTHWORKS_ZONE object and an exact grading-context id. Surface citations are exact R2 surface-context ids. Floating labels are rejected. A newer surface or grading context is not substituted.

## Grading context

The caller supplies surface references, explicit level and slope criteria, explicit zone relationships, assumption-object citations, evidence-object citations, lifecycle stage, provenance, and currentness. Criteria present does not mean grading design is complete, slope stability is validated, or the context is engineering-approved. The recorder cannot invent authoritative levels or slopes.

## Earthworks context

An earthworks record cites the grading context, the same class of exact surface references, an explicit excavation or fill context, and any supplied material or constraint citations. Those citations do not calculate volume, mass haul, balance, compaction performance, or disposal. Quantity is not validated.

## Geotechnical boundary

Fill classification, excavation constraint, groundwater condition, allowable slope, compaction criterion, and material suitability may be recorded only as supplied citations. D2 is not D3 Geotechnical authority. Slope-stability and material-validation runtime counts remain zero.

## Assumptions and evidence

Assumption and evidence citations are existing R1 CIVIL_ASSUMPTION and CIVIL_EVIDENCE_REFERENCE objects. R3 does not create a parallel assumption-governance capability. An evidence citation is not engineering validation.

## Currentness, provenance, fingerprint, and history

Currentness uses CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. Supersession is explicit. Earthworks records keep the grading-context id they were given, and grading records keep the surface ids they were given. Provenance is required. The fingerprint is fingerprintCanonical. Identical replay returns the existing record. Conflicting identity and a wrong fingerprint are rejected. Records are frozen and history is appended. Tenant, workspace, and project must match the upstream record. The recorder remains CIVIL_CONTEXT_AUTHORITY and is not Civil engineering authority.

## Boundary

Terrain generation, surface interpolation, automatic grading, grading optimization, cut and fill quantity, earthworks calculation, mass haul, quantity calculation, slope stability, material validation, road design, drainage, hydrology, hydraulics, utility geometry, validation, approval, and certification runtime counts remain zero. D1 remains incomplete. D1N remains closed. D3 through D9 remain unstarted. No schema and no dependency were added.

## Security and release

The canonical security suite fails only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts. Both failures are the existing EOS-A16D import of EICAR_TEST_SIGNATURE from @rtb/engineering-review. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Production audit is critical 0, high 1, moderate 4. Release governance tests passed at 110. Release typecheck passed. Ledger integrity is ok. No new security or release regression was introduced.

## Next phase

The next phase is EOS-D2-R4-ROADS-AND-ACCESS-CONTEXT, type ROADS_AND_ACCESS_CONTEXT. Implement bounded governed roads/access context using exact R1 identity and applicable R2/R3 references. Record road/alignment/profile/corridor identity and design-criteria context, access relationships, pavement context references, provenance, currentness and fingerprint. Do not perform road geometric calculations, alignment optimization, pavement engineering calculations, grading calculations, drainage calculations, quantity takeoff, or start D3-D9.
