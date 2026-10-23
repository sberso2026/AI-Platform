# EOS-D3-R3 Stratigraphy, Groundwater, and Material Context Closeout

## Purpose

R3 records what the investigated ground is interpreted to be. It does not decide authoritative design parameters or calculate what that ground can support. One bounded runtime attaches stratigraphic interpretation, material classification, and groundwater context to exact R1 identities and exact R2 evidence references.

D1 structural pack complete remains no. D1N stays closed. The Civil track remains complete with classification COMPLETE_BOUNDED_WITH_LIMITATIONS and runtime count eleven. D2 is not reopened. D3-0 architecture runtime flags stay at their historical zero. The R1 module runtime count stays one. The R2 module runtime count stays two, and its stratigraphy readiness flag stays false. The live R3 runtime count is three.

## Exact R1 and R2 binding

Every interpretation names a current R1 context and a current allowlisted R1 object in the same tenant, workspace, and project. Stratigraphy binds to a STRATIGRAPHIC_LAYER identity, material classification to a MATERIAL_CLASSIFICATION identity, and groundwater context to a GROUNDWATER_OBSERVATION identity. Each record also names exact R2 evidence. A missing, floating, stale, or wrong-type reference is rejected when the interpretation is current. No parallel identity system is created. Recording an interpretation does not rewrite an R1 or R2 fingerprint, and it does not mark borehole evidence as stratigraphy.

## Stratigraphy

A stratigraphic interpretation records a supplied depth interval, material description, layer sequence, interpretation source, limitations, an investigation-location reference, and a borehole or test-pit evidence reference. It also retains every explicit source-document reference, including a borehole log or test-pit log that matches the cited evidence. The interpretation is not the raw log. Automatic creation of authoritative stratigraphy is rejected.

## Material classification

A classification records a supplied classification system, a supplied result, a material description, limitations, and exact evidence. It may also name an existing stratigraphic interpretation. The runtime does not invent a classification from a description. A classification is not an engineering parameter set and does not confirm design suitability.

## Groundwater

Groundwater context records a supplied observation, date, measurement method, interpreted statement, seasonal limitation, investigation location, and a groundwater observation source document. An observed water level is not a design groundwater level. Requests to invent or authorize a design groundwater level are rejected.

## Evidence, authority, and history

Authoritative interpretation requires governed evidence. Multiple explicit sources are preserved, and undocumented sources are not inferred. AI and administrator actors are not Geotechnical engineering authority. An AI-generated flag is not an authoritative interpretation. Provenance is required. Fingerprints reuse fingerprintCanonical. Supersession marks the predecessor superseded and appends history without rewriting its fingerprint or evidence links. If later R2 evidence supersedes a source, the existing interpretation stays bound to the original evidence. A current interpretation cannot cite superseded evidence. A reassessment record can remain bound to that historical evidence. Silent mutation and automatic repointing are rejected. Tenant, workspace, and project scope is enforced. Replay of the same identity and fingerprint returns the existing record.

## Exclusions

Field and laboratory test-result runtime remains unstarted. Parameter, calculation, inference, recommendation, bearing, settlement, slope, earth-pressure, ground-improvement, validation, approval, certification, discipline-interface, and D9 counts remain zero. D4 through D9 remain unstarted. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 307 files and 1810 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory 1119441 on uuid. Release governance typecheck passed, tests passed at 123, artifact classification passed, and the ledger returned ok.

## Next phase

The next phase is EOS-D3-R4-FIELD-AND-LAB-TEST-CONTEXT, type FIELD_AND_LAB_TEST_CONTEXT. It implements governed Geotechnical field-test and laboratory-test result context using exact R1 identities and R2/R3 evidence references. It records supplied test types, methods, results, units, specimen or sample references, source evidence, authority, provenance, currentness, and limitations without deriving authoritative design parameters, performing Geotechnical calculations, issuing recommendations, automatically validating engineering, or starting D4 through D9. This closeout does not start that phase.
