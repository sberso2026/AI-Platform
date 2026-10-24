# EOS-D3-R2 Site Investigation and Evidence Context Closeout

## Purpose

R2 records where Geotechnical investigation evidence came from and what factual records exist. It does not decide what the ground means for engineering design. One bounded runtime attaches investigation programs, investigation locations, borehole evidence, test-pit evidence, and source-document references to exact R1 identities.

D1 structural pack complete remains no. D1N stays closed. The Civil track remains complete with classification COMPLETE_BOUNDED_WITH_LIMITATIONS and runtime count eleven. D2 is not reopened. D3-0 architecture runtime flags stay at their historical zero. The R1 module runtime count stays one, and its site-investigation readiness flag stays false. The live R2 runtime count is two.

## Exact R1 reuse

The R2 store is created on an existing R1 store. Every record names a current R1 context and a current allowlisted R1 object in the same tenant, workspace, and project. A missing, floating, stale, or wrong-type object is rejected. No parallel Geotechnical identity system is created. Currentness reuses the existing states. Fingerprints reuse fingerprintCanonical. No second fingerprint algorithm is created. Recording evidence does not rewrite an R1 fingerprint.

## Investigation program and location

An investigation program binds to a GEOTECHNICAL_SITE_CONTEXT identity and records purpose, campaign reference, an allowlisted method, provider, date, provenance, and currentness. An investigation location binds to an INVESTIGATION_LOCATION identity and an existing program. A location requires a supplied evidence reference. A supplied position is stored only when the caller provides it. The runtime does not invent coordinates, elevations, or investigation positions.

## Borehole and test-pit evidence

Borehole evidence binds to a BOREHOLE identity and records a source log, drilling record, provider, date, optional factual depth text, and provenance. Test-pit evidence binds to a TEST_PIT identity and records a source log, excavation record, provider, date, and provenance. Presence of that evidence does not interpret stratigraphy and does not classify material. Layer lists and material-classification requests are rejected.

## Source documents

Source references may cite borehole logs, test-pit logs, field sheets, photographs, factual investigation reports, laboratory certificates as documents only, field-test records as documents only, geological information, groundwater observation records, instrument or export files, consultant reports, and historical investigation records. Provenance is required and preserved. A caller cannot mark evidence as fabricated. Evidence present is not engineering validation.

## Factual evidence versus interpretation

An observation is not an interpretation. A cited test record is not an engineering parameter. An engineering parameter is not a validated parameter. A recommendation is not approval. Groundwater and laboratory citations stay documentary. Parsed test values, groundwater interpretation, parameter derivation, foundation recommendations, calculations, validation, approval, and certification are rejected.

## Currentness, fingerprint, and history

Supersession marks the predecessor SUPERSEDED and appends history. It does not rewrite the predecessor fingerprint and does not auto-repoint later records. Replay of the same identity and fingerprint returns the existing record. A conflicting identity, a fingerprint mismatch, an AI or administrator recorder, or a spoofed provenance reference is rejected. Direct mutation is rejected. Tenant, workspace, and project scope is enforced.

## Authority and excluded phases

AI is not Geotechnical engineering authority. Admin is not Geotechnical engineering authority. D3 does not equal D1 or D2 authority. Evidence ingestion does not create engineering authority. R3 stratigraphy, groundwater interpretation, and material classification remain unstarted. R4 field and laboratory test-result runtime remains unstarted. Parameter, recommendation, calculation, discipline-interface, review, currentness-thread, and D9 source-contract counts remain zero. D4 through D9 remain unstarted. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 306 files and 1809 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory 1119441 on uuid. Release governance typecheck passed, tests passed at 122, artifact classification passed, and the ledger returned ok.

## Next phase

The next phase is EOS-D3-R3-STRATIGRAPHY-GROUNDWATER-AND-MATERIAL-CONTEXT, type STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT. It implements governed Geotechnical stratigraphy, groundwater and material-classification context using exact R1 identities and R2 evidence references. It records explicit interpreted layers and material classifications, groundwater observation and interpretation context, evidence traceability, authority, currentness, and limitations. It does not derive engineering design parameters, perform bearing, settlement, or slope calculations, issue foundation recommendations, perform automatic validation, or start D4 through D9. This closeout does not start that phase.
