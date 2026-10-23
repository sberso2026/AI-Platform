# EOS-D3-R4 Field and Laboratory Test Context Closeout

## Purpose

R4 records what the field or laboratory actually measured. It does not decide which parameter the engineer should use for design. One bounded runtime stores supplied field-test and laboratory-test results on exact R1 identities, exact R2 evidence, and exact R3 context where the caller supplies it.

D1 structural pack complete remains no. D1N stays closed. The Civil track remains complete with classification COMPLETE_BOUNDED_WITH_LIMITATIONS and runtime count eleven. D2 is not reopened. Earlier D3 modules keep their historical runtime counts: one, two, and three. The R3 field-and-lab readiness flag stays false. The live R4 runtime count is four.

## Upstream binding

A field test binds to a FIELD_TEST_RECORD identity, an investigation location, and a FIELD_TEST_DATA source document. A laboratory test binds to a LAB_TEST_RECORD identity, a supplied specimen reference, and a LABORATORY_REPORT. Optional stratigraphy, material-classification, and groundwater references must name existing R3 records in the same scope. Floating or missing upstream references are rejected. Recording a test does not rewrite R1, R2, or R3 fingerprints.

## Field and laboratory results

Field categories include SPT, CPT, CPTu, DCP, field vane, pressuremeter, plate load, permeability or infiltration, in-situ density, and an explicit other-field category. Laboratory categories include moisture content, particle size, Atterberg limits, density, compaction, CBR, consolidation, shear strength, triaxial, direct shear, permeability, rock, chemical or aggressivity, and an explicit other-lab category. Each record stores the supplied method reference, measured result, unit, provider, date, limitations, provenance, and currentness. A quantitative result without a unit is rejected. An invented method or result is rejected.

## Units, specimens, and authority

A unit conversion is stored only when the original value, original unit, and transformation provenance are all supplied. The source evidence reference is not overwritten. Laboratory tests require a governed specimen reference. A test without source evidence is rejected. AI and administrator actors are not Geotechnical engineering authority. Fabricated results and approvals are rejected. An AI-generated interpretation is not engineering authority.

## Boundaries

A measured result is not an engineering parameter and is not a validated design value. Correlations, cohesion, friction angle, modulus, undrained strength, design permeability, design CBR, bearing pressure, and settlement or slope parameters are rejected. Recommendations and calculations are rejected. Recording a test cannot mutate R3 stratigraphy, material classification, or groundwater context. Supersession keeps the predecessor fingerprint and evidence links. A later source revision does not repoint an existing test. Replay of the same identity and fingerprint returns the existing record. Tenant, workspace, and project scope is enforced.

## Exclusions

Parameter, calculation, inference, recommendation, bearing, settlement, slope, earth-pressure, ground-improvement, validation, approval, certification, discipline-interface, and D9 counts remain zero. D4 through D9 remain unstarted. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 308 files and 1811 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory 1119441 on uuid. Release governance typecheck passed, tests passed at 124, artifact classification passed, and the ledger returned ok.

## Next phase

The next phase is EOS-D3-R5-GEOTECHNICAL-PARAMETER-CONTEXT, type GEOTECHNICAL_PARAMETER_CONTEXT. It implements governed Geotechnical parameter context using exact R1 identities and explicit R2-R4 evidence and test references. It records authoritative or candidate parameter values, units, source basis, derivation or reference method where supplied, applicability, authority, provenance, currentness, and limitations, while preserving the distinction between raw test results, interpreted parameters, and validated design parameters. It does not perform foundation, bearing, settlement, or slope calculations, issue foundation recommendations, automatically validate parameter values, or start D4 through D9. This closeout does not start that phase.
