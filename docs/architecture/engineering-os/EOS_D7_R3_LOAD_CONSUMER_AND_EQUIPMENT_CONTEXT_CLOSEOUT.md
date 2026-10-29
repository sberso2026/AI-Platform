# EOS-D7-R3 Load, Consumer, and Equipment Context Closeout

## Purpose

D7-R3 implements exactly one new Electrical runtime: governed Electrical load, consumer, and equipment-supply context on exact D7-R1 identity revisions and exact D7-R2 system, source, and distribution revisions. The live Electrical runtime count is 3. The live load, consumer, and equipment runtime count is 1. The identity runtime count remains 1. The system, source, and distribution runtime count remains 1 on the R2 module. Architecture runtime counts remain 0. D7 is not complete. D6 remains COMPLETE_BOUNDED_WITH_LIMITATIONS and is not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D8 and D9 remain unstarted. R4 is not started.

## Exact R1 and R2 reuse

Every load, consumer, relationship, and equipment-supply record binds to an exact R1 object identity and revision fingerprint and, where a system, source, or distribution is cited, to the exact R2 record and fingerprint. The R3 store is created only when the supplied R2 store was built on the same R1 store. A floating reference is rejected. R3 does not mutate R2 system, source, or distribution records. A load record does not validate source capacity, resize a source, or reconfigure distribution. Historical references are not repointed.

## Load context

Load context is recorded only on an ELECTRICAL_LOAD identity. It stores an allowlisted statement role, an explicit operating or design case, a supplied magnitude, an allowlisted unit, duty and availability where stated, source, basis, applicability, limitations, provenance, and cited currentness. Load context is not a validated load calculation, not a load-flow result, and not validated Electrical design.

## Supplied and adopted distinction

A supplied load requirement and an adopted Electrical load are different records. Adoption is a new record that cites a current supplied load on the same object and the same case and requires an explicit adoption rationale. The supplied record is not rewritten and is not marked adopted. A supplied statement cannot carry an adoption pointer. A second current adopted load for the same object revision and case is rejected. Units are required and preserved. Silent unit conversion is rejected. Arithmetic or a non-decimal magnitude is rejected as a hidden load calculation. R3 does not derive a missing load.

## Consumer relationships

Consumer context is recorded only on an ELECTRICAL_CONSUMER identity. Consumer class is an allowlisted class, not a new object type. A consumer relationship must use an explicit kind: consumer to system, consumer to source, or consumer to distribution. Each endpoint binds the exact consumer revision and the exact R2 system, source, or distribution revision. Relationships inferred from tag names, equipment numbers, drawings, semantic similarity, or AI interpretation are rejected. Creating a later revision does not move an existing relationship. Consumer context is not validated equipment selection and is not feeder design.

## Equipment supply context

Equipment supply context is recorded only on an ELECTRICAL_MOTOR_DRIVE identity. It may cite the exact supplying Electrical system and, when present, the exact source and distribution revisions, together with supplied voltage and phase context, duty and availability, a supplied load requirement, source, basis, applicability, limitations, and provenance. Supply context is not validated equipment selection, not validated feeder design, and not validated cable design. R3 does not select Electrical equipment and does not size a transformer, generator, motor, switchgear, UPS, or battery.

## D4 and D6 reference boundaries

R3 may cite an exact D6 Process requirement revision or an exact D4 Mechanical context revision as source context. The cited revision must match the supplied store fingerprint and scope. A missing or spoofed revision is rejected. A Process requirement is not Electrical design. A Process power or load requirement is not an adopted Electrical load and is not a validated Electrical load. R3 does not auto-adopt a Process load requirement. Mechanical equipment duty is not Electrical motor design and is not an adopted Electrical load. Mechanical equipment selection is not a validated Electrical supply design. R3 does not auto-adopt mechanical duty as Electrical load. These citations are bounded source references. They do not start the requirements runtime or the discipline-interface runtime.

## Case applicability

Load and consumer context bind to an explicit case: normal, startup, shutdown, emergency, or another governed case. Recording a load for one case does not create or copy that load onto any other case. Duty and availability context may be supplied. Duty context is not reliability validation. Availability context is not redundancy-design validation. Applicability and limitations are explicit and must name the governed object and case. Context is not auto-propagated outside that applicability.

## Zero calculation and design matrix

Connected load, demand load, diversified load, and maximum demand calculation runtimes are 0. Load flow, short circuit, and motor-starting calculation runtimes are 0. Voltage drop, cable sizing, protection coordination, arc flash, grounding, power quality, harmonic, and battery or UPS calculation runtimes are 0. Feeder, cable, and rating runtime remains 0. Electrical calculation evidence remains 0. Protection, grounding, and hazardous-area runtime remains 0. Requirements, assumptions, and change remains 0. Discipline interface runtime remains 0. Review and validation, automatic engineering validation, conformance, approval, and certification remain 0. Dedicated currentness runtime remains 0. D9 source-contract runtime and D9 integration remain 0. D8 integration remains 0. Automatic Electrical design and redesign remain 0. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain 0.

## Currentness, thread, and fingerprint

R3 reuses canonical currentness, the canonical digital thread, and the canonical fingerprint. No parallel engine, thread, or second fingerprint algorithm is created. No dedicated currentness runtime is implemented. A current record is not validated. A stale or superseded record is not invalid. Supersession freezes the predecessor without changing the object revision or relationship endpoint fingerprints. Replay of the same record and fingerprint returns the existing record. Fingerprint mismatch does not write. Duplicate current adopted loads and duplicate consumer or supply relationships are rejected. Authority, provenance, scope, and fingerprint spoofing are rejected.

## Authority boundaries

Electrical authority is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Instrumentation and Control authority. AI and admin are not Electrical engineering authority. AI cannot invent an authoritative load, consumer relationship, or equipment-supply context. Admin cannot promote ungoverned R3 context to engineering truth. Tenant, workspace, and project scope is enforced. Cross-tenant access is rejected. Provenance and source basis are required and preserved. Basisless authoritative context is rejected.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 359 files and 1862 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 175, and the ledger returned ok. No schema change. No new dependency.

## Known limitations

R3 records what Electrical loads, consumers, and equipment-supply requirements have been explicitly supplied or adopted for exact Electrical revisions. It does not calculate load, perform load flow, short circuit, or motor starting, select or size equipment, design a feeder or cable, establish protection, grounding, or hazardous-area engineering, or validate engineering. A Process or Mechanical requirement remains source context and is not Electrical design.

## Next phase

The next phase is EOS-D7-R4-FEEDER-CABLE-AND-RATING-CONTEXT, type FEEDER_CABLE_AND_RATING_CONTEXT. Its scope is to implement governed feeder, cable and Electrical-rating context using exact R1-R3 revisions. Support exact feeder/cable relationships, supplied/adopted rating context, conductor/cable attributes where explicitly governed, installation/reference context and source/basis/provenance/currentness. Preserve feeder/cable context != cable sizing, supplied rating != validated rating, equipment rating context != validated selection, and do not calculate voltage drop, ampacity, cable size, short-circuit withstand, protection coordination or any other Electrical calculation. This closeout names that phase and does not start it.
