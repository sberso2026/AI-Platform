# EOS-D3-R5 Geotechnical Parameter Context Closeout

## Purpose

R5 governs which Geotechnical parameters exist, where they came from, where they apply, and who adopted them. It does not calculate what those parameters mean for a foundation, excavation, or slope. One bounded runtime stores supplied candidate and governed parameter records on exact R1 identities and explicit R2, R3, and R4 references.

D1 structural pack complete remains no. D1N stays closed. The Civil track remains complete with classification COMPLETE_BOUNDED_WITH_LIMITATIONS and runtime count eleven. D2 is not reopened. Earlier D3 modules keep their historical runtime counts: one, two, three, and four. The R4 parameter-readiness flag stays false. The live R5 runtime count is five. The parameter capability count is one.

## Upstream binding

A parameter record binds to a GEOTECHNICAL_PARAMETER_SET identity and at least one governed source-evidence reference. Optional stratigraphy, material-classification, and groundwater references must name existing R3 records in the same scope. A direct test result or correlation basis must name an existing R4 field or laboratory test, and that test's evidence must be included. Floating or missing upstream references are rejected. Recording a parameter does not rewrite R1, R2, R3, or R4 fingerprints. A later source revision does not repoint an existing parameter.

## Parameter semantics

Categories include unit weight, density, cohesion, friction angle, undrained strength, stiffness, Poisson ratio, compressibility, consolidation, permeability, subgrade, bearing-related, settlement-related, lateral soil, rock, an explicitly adopted groundwater design assumption, and an explicit other category. Each record stores the supplied value, unit, source basis, derivation or reference method, applicability, limitations, provenance, and currentness. A quantitative value without a unit is rejected. A missing source basis or method is rejected. Applicability must name the condition; a blanket scope is rejected.

## Candidate, adopted, and validated

CANDIDATE and GOVERNED_ADOPTED are distinct. An adopted value is not a validated design parameter. A request to mark a parameter validated, conformant, approved, or certified is rejected. An AI-generated value may be stored only as a candidate. AI cannot invent an authoritative value or promote a candidate. AI and administrator actors are not Geotechnical engineering authority.

## Boundaries

A measured test result is not automatically a design parameter. An SPT blow count is not rewritten into a friction angle. Parameter recording does not mutate R3 stratigraphy, material classification, or groundwater context. Automatic derivation and inference stay at zero. Recommendations, bearing, settlement, slope, earth-pressure, and ground-improvement calculations stay at zero. Supersession keeps the predecessor fingerprint, evidence links, and test links. Replay of the same identity and fingerprint returns the existing record. A second current authoritative value for the same object, category, and applicability is rejected. Tenant, workspace, and project scope is enforced. A unit conversion is stored only when the original value, original unit, and transformation provenance are all supplied.

## Exclusions

Validation, approval, certification, discipline-interface, and D9 counts remain zero. D4 through D9 remain unstarted. R6 is named and not started. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 309 files and 1812 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1. The single moderate advisory remains 1119441 on uuid 8.3.2 through exceljs, the same GHSA-w5hq-g745-h8pq finding. Release governance typecheck passed, tests passed at 125, artifact classification passed, and the ledger returned ok.

## Next phase

The next phase is EOS-D3-R6-FOUNDATION-EXCAVATION-AND-SLOPE-CONTEXT, type FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT. It implements bounded governed Geotechnical foundation, excavation and slope engineering context using exact R1-R5 references. It records foundation-related Geotechnical context, excavation constraints, slope and geohazard context, and supplied engineering recommendations or criteria with authority, evidence, provenance, currentness, and limitations. It does not perform bearing-capacity, settlement, slope-stability, or earth-pressure calculations, automatically generate recommendations, validate engineering, or start D4 through D9. This closeout does not start that phase.
