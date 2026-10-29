# EOS-D7-R6 Protection, Grounding, and Hazardous-Area Context Closeout

## Purpose

D7-R6 implements exactly one new Electrical runtime: governed protection, grounding/earthing, and hazardous-area context on exact D7-R1 identity revisions, exact D7-R2 system, source, and distribution revisions, exact D7-R3 load, consumer, and equipment-supply revisions, exact D7-R4 feeder, cable, and rating revisions, and exact D7-R5 calculation-evidence revisions. The live Electrical runtime count is 6. The live protection, grounding, and hazardous-area runtime count is 1. Earlier runtime counts stay on their own modules: identity 1, system source and distribution 2, load consumer and equipment 3, feeder cable and rating 4, calculation evidence 5. Architecture runtime counts remain 0, including the architecture protection runtime count of 0. D7 is not complete. D6 remains COMPLETE_BOUNDED_WITH_LIMITATIONS and is not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D8 and D9 remain unstarted. R7 is not started.

## Exact R1-R5 reuse

Every R6 record binds to an exact R1 object identity and revision fingerprint. The R6 store is created only when the supplied R5 store, and the R1 through R4 stores held by that R5 store, were built on the same R1 store. Where a system, source, or distribution record is cited, the record binds the exact R2 revision. Where a load, consumer, or equipment-supply record is cited, the record binds the exact R3 revision. Where a feeder, cable, or rating record is cited, the record binds the exact R4 revision. Where calculation evidence is cited, the record binds the exact R5 evidence revision and the expected evidence class. A floating reference, including latest, current, newest, head, or active, is rejected for revisions and source documents. Historical references are not repointed. R6 does not mutate R1, R2, R3, R4, or R5 records. Citing a feeder, cable, or load does not create a protection setting.

## Protection-device context

Protective-device context is recorded only on an ELECTRICAL_PROTECTION_CONTEXT identity. Device classes are an allowlist: breaker, fuse, relay, protection function, and other canonical protection-device type. A freeform device type is rejected. Protective-device context is not validated protection design and not validated device selection. The canonical Electrical object taxonomy is reused. BREAKER is not an object type.

## Supplied and adopted protection-setting semantics

A supplied protection setting and an adopted protection setting are different records. Adoption is a new record that cites a current supplied setting on the same object and the same setting category, in the same unit and the same supplied value, and requires an explicit adoption rationale. The supplied record is not rewritten and is not marked adopted. A supplied setting cannot carry an adoption pointer. A second current setting of the same role, object revision, and category is rejected. An adopted setting is not a validated setting. A setting present is not coordination validated, not a protection calculation, and not code conformance. Units are required, allowlisted for the category, and preserved. Silent unit conversion is rejected. Expressions are rejected.

## Protection-evidence boundary

An exact R5 protection-coordination evidence revision may be cited. The evidence class must be protection coordination. A wrong fingerprint or a wrong evidence class is rejected. Citing evidence does not adopt the evidence result, does not recalculate the study, and does not turn the evidence into a validated protection setting. An exact R5 arc-flash evidence revision may be cited on the protective-device record. Arc-flash evidence is not a validated arc-flash assessment. R6 does not generate a label or determine a PPE category.

## Grounding and earthing context

Grounding and earthing context is recorded only on an ELECTRICAL_GROUNDING_CONTEXT identity. Roles are grounding system, earthing system, bonding, and grounding requirement. Bonding stays inside grounding context and is not a new object type. A supplied resistance value, when present, keeps its ohm unit and is not a ground-resistance calculation. Grounding context is not validated grounding design and not code conformance. Grounding relationships are explicit. Kinds are equipment grounding and bonding connection. Each relationship binds the exact grounding-record revision and the exact subject identity revision. Inferred relationships are rejected. An exact R5 grounding evidence revision may be cited. Citing it does not adopt the result, recalculate the study, or treat the evidence as code conformance. R6 does not calculate step or touch voltage, size a grounding conductor, or design a ground grid.

## Hazardous-area source and classification semantics

Hazardous-area context is recorded only on an ELECTRICAL_HAZARDOUS_AREA_CONTEXT identity. It stores a supplied classification source document and exact source revision, an allowlisted zone or division, an allowlisted atmosphere, an optional allowlisted group, an optional allowlisted temperature class, and an area location reference. This is a source reference. It is not a classification performed by EOS, not a validated hazardous-area classification, and not code conformance. The hazardous-area classification runtime count is 0.

## Equipment-suitability evidence boundary

Equipment-suitability context cites an exact equipment identity and an exact hazardous-area record revision. Supplied and adopted suitability are different records. Adoption is explicit. Suitability context is not validated equipment selection and not code conformance. Supplied certification evidence is not EOS certification. Supplied marking is not validated project selection. R6 does not match equipment to a hazardous area, select hazardous-area equipment, or approve suitability.

## Jurisdiction and standard posture

R6 reuses the D7 jurisdiction-extensible standards architecture. A jurisdiction profile, when supplied, must be an allowlisted profile id. No single jurisdiction is hardcoded as global truth. A standard reference may be stored. A standard reference present does not determine conformance.

## Calculation zero matrix

Protection coordination, breaker trip, relay setting, arc flash, grounding, and hazardous-area classification are not calculated. Electrical calculation runtime count remains 0. Load, load flow, short circuit, motor starting, voltage drop, cable sizing, protection coordination, arc flash, grounding, power quality, harmonic, and battery or UPS calculation runtime counts remain 0. Hazardous-area classification runtime count remains 0. Requirements, assumptions, and change remains 0. Discipline interface runtime remains 0. Review and validation, automatic engineering validation, conformance determination, approval, and certification remain 0. Dedicated currentness runtime remains 0. D9 source-contract runtime and D7-D9 integration remain 0. D7-D8 integration remains 0. Protection context is not instrumentation and control implementation and not functional-safety validation. Automatic Electrical design and redesign remain 0. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain 0.

## Currentness, thread, and fingerprint

R6 reuses canonical currentness, the canonical digital thread, and the canonical fingerprint. No parallel engine, thread, or second fingerprint algorithm is created. No dedicated currentness runtime is implemented. A current record is not validated. A stale or superseded record is not invalid. Supersession freezes the predecessor without changing the bound revision fingerprint. Replay of the same record and fingerprint returns the existing record. Fingerprint mismatch does not write. Duplicate current device, protection relationship, protection setting, grounding, grounding relationship, hazardous-area, and suitability records are rejected. Authority, provenance, scope, unit, source, and fingerprint spoofing are rejected. Lineage is explicit. Inferred lineage is rejected. Silent mutation is rejected.

## Authority boundaries

Electrical authority is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Instrumentation and Control authority. AI and admin are not Electrical engineering authority. AI cannot invent an authoritative protection setting, grounding context, or hazardous-area classification, and cannot approve equipment suitability. Admin cannot promote ungoverned R6 context to engineering truth. Tenant, workspace, and project scope is enforced. Cross-tenant access is rejected. Provenance and source basis are required and preserved. Basisless authoritative context is rejected. Applicability and limitations are explicit, and context is not auto-propagated outside that applicability.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 362 files and 1865 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 178, and the ledger returned ok. No schema change. No new dependency.

## Known limitations

R6 records what protection, grounding/earthing, and hazardous-area context has been explicitly supplied or adopted for exact Electrical revisions. It does not calculate a protection setting, coordinate protection, calculate arc flash, design grounding, classify a hazardous area, or validate equipment selection. A supplied setting is not an adopted setting, and an adopted setting is not a validated setting. Coordination evidence remains evidence. Grounding evidence remains evidence. A hazardous-area source reference is not an EOS classification. Equipment marking and certification evidence are not project approval, code conformance, or validated Electrical selection.

## Next phase

The next phase is EOS-D7-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE, type REQUIREMENTS_ASSUMPTIONS_AND_CHANGE. Its scope is to implement canonical Electrical requirement, assumption, engineering-decision, change, supersession and reassessment governance across exact D7 R1-R6 revisions. Reuse canonical EOS governance. Preserve source requirement != adopted Electrical requirement, assumption != validated fact, AI recommendation != Electrical engineering decision, and change/reassessment must not automatically recalculate loads, load flow, cable sizing, protection settings, grounding, hazardous-area suitability, redesign, revalidate, approve or determine conformance. This closeout names that phase and does not start it.
