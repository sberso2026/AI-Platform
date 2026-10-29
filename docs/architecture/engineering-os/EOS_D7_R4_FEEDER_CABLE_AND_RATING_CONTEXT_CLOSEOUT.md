# EOS-D7-R4 Feeder, Cable, and Rating Context Closeout

## Purpose

D7-R4 implements exactly one new Electrical runtime: governed feeder, cable, and Electrical-rating context on exact D7-R1 identity revisions, exact D7-R2 system, source, and distribution revisions, and exact D7-R3 load, consumer, and equipment-supply revisions. The live Electrical runtime count is 4. The live feeder, cable, and rating runtime count is 1. The identity runtime count remains 1. The system, source, and distribution runtime count remains 1 on the R2 module. The load, consumer, and equipment runtime count remains 1 on the R3 module. Architecture runtime counts remain 0. D7 is not complete. D6 remains COMPLETE_BOUNDED_WITH_LIMITATIONS and is not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D8 and D9 remain unstarted. R5 is not started.

## Exact R1-R3 reuse

Every feeder, cable, rating, endpoint, and relationship record binds to an exact R1 object identity and revision fingerprint. Where a system, source, or distribution is cited, the record binds to the exact R2 revision. Where a load, consumer, or equipment-supply record is cited, the record binds to the exact R3 revision. The R4 store is created only when the supplied R2 and R3 stores were built on the same R1 store. A floating reference is rejected. R4 does not mutate R2 or R3 records. A feeder or cable record does not validate source or distribution capacity. Historical references are not repointed.

## Feeder context

Feeder context is recorded only on an ELECTRICAL_FEEDER identity. It stores an allowlisted feeder role, an optional exact rating citation, source, basis, applicability, limitations, provenance, and cited currentness. Feeder context is not validated feeder design, not validated cable selection, and not protection coordination.

## Cable context

Cable context is recorded only on an ELECTRICAL_CABLE identity. Explicitly supplied attributes may include conductor material, core count, insulation context, a supplied size attribute, and an allowlisted size unit. A supplied size is stored as context. It is not a cable size calculated by EOS and it is not a derived conductor size. Cable context is not validated cable sizing, not validated ampacity, not a validated voltage-drop result, and not validated short-circuit withstand.

## Feeder-cable relationships

A feeder endpoint must use an explicit kind: source, distribution, system, load, consumer, or equipment supply. Each endpoint binds the exact feeder revision and the exact target revision. A feeder-cable relationship must use the explicit feeder-to-cable kind and binds the exact feeder revision and the exact cable revision. Endpoints and relationships inferred from tag names, equipment numbers, topology proximity, drawings, semantic similarity, or AI interpretation are rejected. Creating a later revision does not move an existing endpoint or relationship. Citing a load does not size a feeder, size a cable, or select a breaker.

## Supplied and adopted rating semantics

Rating context is recorded only on an ELECTRICAL_EQUIPMENT_RATING identity. A supplied Electrical rating and an adopted Electrical rating are different records. Adoption is a new record that cites a current supplied rating on the same object and the same rating category, in the same unit, and requires an explicit adoption rationale. The supplied record is not rewritten and is not marked adopted. A supplied statement cannot carry an adoption pointer. A second current rating of the same role, object revision, and category is rejected. An adopted rating is not a validated rating, not an engineering calculation, not validated equipment selection, not validated system design, and not code conformance. Rating categories are limited to voltage, current, power, frequency, interrupting or withstand context, and insulation or system rating context. Units are required, allowlisted for the category, and preserved. Silent unit conversion is rejected.

## Installation and reference semantics

Cable context may record an explicit installation environment, routing category, installation method, and ambient context. Installation reference context is not validated installation design. R4 does not derive a derating factor from installation context. A supplied derating factor is rejected.

## Calculation zero matrix

Cable sizing, ampacity, current-carrying capacity, derating, voltage drop, short-circuit withstand, and thermal withstand are not calculated. Breaker selection, protection-device selection, and cable-protection coordination are not performed. Load, load flow, short circuit, motor starting, voltage drop, cable sizing, protection coordination, arc flash, grounding, power quality, harmonic, and battery or UPS calculation runtimes remain 0. Electrical calculation evidence remains 0. Protection, grounding, and hazardous-area runtime remains 0. Requirements, assumptions, and change remains 0. Discipline interface runtime remains 0. Review and validation, automatic engineering validation, conformance, approval, and certification remain 0. Dedicated currentness runtime remains 0. D9 source-contract runtime and D9 integration remain 0. D8 integration remains 0. Automatic Electrical design and redesign remain 0. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain 0.

## No sizing or selection posture

R4 records requirements and supplied or adopted context only. It does not select a cable, size a conductor, select a breaker, or coordinate protection. Load context does not auto-size a feeder or cable and does not auto-select a breaker. Equipment rating context is not validated equipment selection and is not validated system design.

## Currentness, thread, and fingerprint

R4 reuses canonical currentness, the canonical digital thread, and the canonical fingerprint. No parallel engine, thread, or second fingerprint algorithm is created. No dedicated currentness runtime is implemented. A current record is not validated. A stale or superseded record is not invalid. Supersession freezes the predecessor without changing object, feeder, cable, or endpoint revision fingerprints. Replay of the same record and fingerprint returns the existing record. Fingerprint mismatch does not write. Duplicate current feeder, cable, endpoint, relationship, and rating records are rejected. Authority, provenance, scope, and fingerprint spoofing are rejected.

## Authority boundaries

Electrical authority is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Instrumentation and Control authority. AI and admin are not Electrical engineering authority. AI cannot invent an authoritative feeder relationship, cable relationship, or rating. Admin cannot promote ungoverned R4 context to engineering truth. Tenant, workspace, and project scope is enforced. Cross-tenant access is rejected. Provenance and source basis are required and preserved. Basisless authoritative context is rejected.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 360 files and 1863 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 176, and the ledger returned ok. No schema change. No new dependency.

## Known limitations

R4 records what feeder, cable, and rating context has been explicitly supplied or adopted for exact Electrical revisions. It does not size a cable, calculate ampacity, derating, voltage drop, or short-circuit withstand, select a breaker, coordinate protection, or validate engineering. A supplied rating is not an adopted rating, and an adopted rating is not a validated rating.

## Next phase

The next phase is EOS-D7-R5-ELECTRICAL-CALCULATION-EVIDENCE, type ELECTRICAL_CALCULATION_EVIDENCE. Its scope is to implement governed external/supplied Electrical calculation and study evidence using exact R1-R4 revisions. Support evidence packages for canonical studies such as load calculation, load flow, short circuit, motor starting, voltage drop, cable sizing/ampacity, protection coordination, arc flash, grounding, power quality, harmonics and battery/UPS sizing where repository taxonomy permits. Preserve calculation evidence != calculation performed by EOS, evidence result != adopted Electrical design, evidence != validation/conformance/approval, and keep every Electrical calculation runtime at zero. This closeout names that phase and does not start it.
