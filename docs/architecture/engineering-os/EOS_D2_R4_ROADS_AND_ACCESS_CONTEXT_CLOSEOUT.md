# EOS-D2-R4 Roads and Access Context Closeout

## Result

R4 records governed roads and access context on exact R1 Civil identity and applicable R2 spatial/surface and R3 grading references. It does not design road geometry, generate or optimize an alignment, design a profile, generate a corridor, calculate pavement, or start drainage.

D2 runtime count is four. Roads and access context is ready. Drainage and later Civil phases are not ready. R5 has not started.

## R1, R2, and R3 binding

Every roads record cites an exact R1 context and exact R1 objects for the alignment, profile, corridor, and pavement context. The spatial citation is an exact R2 spatial-reference id. Surface citations are non-empty exact R2 surface-context ids. The grading citation is an explicit grading-context id or an explicit null when grading is not applicable. Floating labels, including latest, are rejected. A missing grading citation is rejected. A newer surface or grading context is not substituted.

## Road, alignment, profile, and corridor context

The record stores the supplied object identities and caller-supplied criteria. Criteria kinds are road classification, design speed, horizontal geometry, vertical geometry, lane width, grade limit, access constraint, clearance, and standard reference. The recorder cannot invent criteria. Storing criteria does not mean the road design is complete, the alignment was generated, the profile was designed, or the corridor model was generated. Those runtime counts remain zero.

## Access relationships

Access relationships use the existing R1 relationship kinds PARENT and OBJECT_REFERENCE. Access roles are road to site, road to platform, access route to a civil object, access constraint, and crossing interface. Proximity and inferred relationships are rejected.

## Pavement boundary

Pavement type, subgrade, traffic, and standards may be recorded only as optional explicit references or explicit null. R4 does not determine subgrade, determine material, or calculate pavement. Geotechnical authority is not created here. Pavement engineering calculation runtime count remains zero.

## Assumptions and evidence

Assumption and evidence citations are existing R1 CIVIL_ASSUMPTION and CIVIL_EVIDENCE_REFERENCE objects. An evidence citation is not engineering validation or engineering approval.

## Currentness, provenance, fingerprint, and history

Currentness uses CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. A CURRENT record requires CURRENT upstream records. A STALE record may cite a superseded upstream record exactly. Supersession does not repoint surface or grading ids on other records. Provenance is required. The fingerprint is fingerprintCanonical. Identical replay returns the existing record. Conflicting identity and a wrong fingerprint are rejected. Records are frozen and history is appended. Tenant, workspace, and project must match the upstream record. The recorder remains CIVIL_CONTEXT_AUTHORITY and is not Civil engineering authority.

## Boundary

Road geometric design, alignment generation, alignment optimization, profile design, corridor generation, pavement engineering calculation, automatic grading design, earthworks calculation, quantity calculation, drainage, hydrology, hydraulics, civil validation, approval, and certification runtime counts remain zero. D1 integration, D3 integration, D4 through D8 integration, and D9 integration runtime counts remain zero. D1 remains incomplete. D1N remains closed. D3 through D9 remain unstarted. No schema was added.

## Dependency-audit drift and security remediation

The previously accepted production audit was critical 0, high 1, moderate 4. The first R4 gate, before any dependency file changed, reported critical 1, high 2, moderate 3. R4 added no package and did not change package manifests or the lockfile before remediation. The count change came from newly published advisory data against the already installed next 15.5.24 and its transitive source-map-js 1.2.1.

The new critical finding was next, unauthenticated image-optimization exposure when SVG files are used, vulnerable through 15.5.27 and patched at 15.5.28. The new next high was an App Router server-action denial of service, same patched version. Two new next moderate cache-poisoning advisories were patched at 15.5.27. The new source-map-js high was vulnerable below 1.2.2. It is reached through apps/web, next, and postcss. postcss already allowed source-map-js 1.2.1 and above on the same line, and the lockfile had resolved 1.2.1. The existing uuid 8.3.2 moderate advisory remains. Its patched line is 11.1.1 or newer, which is a major upgrade through exceljs, so it was left as previously accepted moderate debt.

Remediation kept the existing packages and moved only the required versions. next moved from 15.5.24 to 15.5.28 in the web dependency and the existing pnpm override. eslint-config-next and its plugin moved from 15.5.24 to 15.5.28 so the existing lint toolchain matches that pin. source-map-js moved from 1.2.1 to 1.2.2 through an override of the already installed transitive package. No new package was added. The audit check was not disabled or reclassified. After remediation the production audit is critical 0, high 0, moderate 1. The remaining moderate finding is the pre-existing uuid advisory.

## Security and release

The canonical security suite fails only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts. Both failures are the existing EOS-A16D import of EICAR_TEST_SIGNATURE from @rtb/engineering-review. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 0 findings. Production audit is critical 0, high 0, moderate 1. Release governance tests passed at 111. Release typecheck passed. Ledger integrity is ok. No new security or release regression was introduced. The security gate was not weakened.

## Next phase

The next phase is EOS-D2-R5-DRAINAGE-AND-STORMWATER-CONTEXT, type DRAINAGE_AND_STORMWATER_CONTEXT. Implement bounded governed drainage/stormwater context using exact Civil identity and applicable R2-R4 references. Record catchment, drainage-network, node/link, pit/manhole, channel, culvert, outfall and detention/retention context plus rainfall/runoff criteria references, provenance, currentness and fingerprint. Do not perform hydrology, hydraulics, pipe sizing, flood modelling, drainage optimization, terrain generation, grading calculations, road calculations, quantity takeoff, or start D3-D9.
