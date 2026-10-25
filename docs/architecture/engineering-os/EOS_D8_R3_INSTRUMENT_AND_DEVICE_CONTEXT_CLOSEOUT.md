# EOS-D8-R3 Instrument and Device Context Closeout

## Purpose

D8-R3 implements exactly one new Instrumentation and Control runtime: governed instrument and device context. The live D8 runtime count is 3. The live instrument and device context runtime count is 1. The R1 identity runtime count remains 1. The R2 measurement and tag runtime count remains 1. Architecture runtime counts remain 0. D8-R3 does not mark the Instrumentation and Control discipline complete. D6 and D7 remain COMPLETE_BOUNDED_WITH_LIMITATIONS and are not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D9 remains unstarted.

## Exact R1 and R2 reuse

R3 reads exact R1 context and object revisions and exact R2 measurement and tag revisions. A device record stores the cited R1 object identity and fingerprint. A device-to-measurement relationship stores the cited device, measurement, and optional tag fingerprints. Floating revisions are rejected. A wrong fingerprint is rejected. R3 does not rewrite R1 objects, R2 measurements, R2 tags, their fingerprints, or their history. Superseding an R1 identity does not repoint an existing device or measurement record.

## Canonical device taxonomy

R3 reuses the D8-0 authoritative object types and the instrument-device class allowlist. An IAC_INSTRUMENT may carry SENSOR, TRANSMITTER, ANALYZER, SWITCH, GAUGE_OR_INDICATOR, ACTUATOR, POSITIONER, or INSTRUMENT_PACKAGE. An IAC_CONTROL_VALVE_CONTEXT may carry CONTROL_VALVE. Each device class is context inside the one R3 runtime. A class outside that allowlist is rejected. Freeform and unknown authoritative object types are rejected.

## Instrument and device semantics

A device context cites an exact current R1 instrument or control-valve revision, a canonical device class, and an optional canonical service context. Service context is PROCESS_MEASUREMENT_SERVICE, LOCAL_INDICATION, ON_OFF_SWITCHING, ANALYTICAL_SERVICE, FINAL_ELEMENT, PACKAGE_INSTRUMENT, or OTHER_CANONICAL_SERVICE. The presence of that context is not validated device selection, validated instrument design, or engineering validation. One current device context is kept per cited object revision.

## Device-to-measurement relationships

A relationship uses the explicit kind DEVICE_TO_MEASUREMENT. The device revision, the R2 measurement revision, and any cited R2 tag revision are exact. Relationships inferred from tag naming, variable type, service description, equipment proximity, drawing position, vendor data, semantic similarity, or AI interpretation are rejected. A measurement-point relationship is not instrument selection. A tag relationship is not a validated device assignment.

## Service, datasheet, and vendor context

Service or application context may be recorded when it is one of the canonical services. A datasheet reference requires both an identity and an exact revision. A vendor reference requires both a manufacturer and a model. Floating datasheet revisions are rejected. A datasheet, a vendor model, or a vendor-selected device is supplied context. It is not validated instrument design, project validation, or a project-validated selection.

## Supplied range and setpoint

A supplied range requires a low value, a high value, and a unit together. A supplied setpoint requires a value and a unit together. Units are stored as supplied and are part of the fingerprint. A missing unit is rejected. A floating or spoofed unit is rejected. The recorded unit is not silently replaced. A supplied range is not a validated range selection and is not a range calculated by EOS. A supplied setpoint is not a validated setpoint and is not a setpoint calculated by EOS. R3 does not derive, calculate, auto-select, or auto-adopt a range or a setpoint.

## Certification, marking, and hazardous-area context

Supplied certification and marking evidence may be preserved as supplied context. That evidence is not project validation, D8 certification, or a validated project selection. Hazardous-area suitability or marking may be preserved as supplied context. It is not a validated hazardous-area selection and is not code conformance. R3 does not classify hazardous areas.

## D4, D5, and D6 source references

When a Process source is referenced, R3 requires an exact source identity, an exact source revision, and a subject from the D8-0 D6 interface allowlist. The same exact-revision rule applies to a Mechanical or package reference and to a Piping reference, using the D4 and D5 interface allowlists. Floating source revisions are rejected. The stored source revision is not repointed. A Process requirement is not instrument selection. A Process condition is not a validated instrument range. Mechanical equipment or package context is not instrument selection and is not validated device design. Piping context is not instrument selection, and instrument context is not validated piping design. These references are not D4, D5, D6, or D7 runtime integration. D6 and D7 integration counts remain 0.

## Sizing and selection zero matrix

Instrument selection, instrument sizing, control-valve sizing, and actuator sizing remain 0. A control-valve or actuator context may exist without EOS sizing that device. R3 does not calculate device performance, including accuracy, response time, capacity, turndown, or pressure drop. R3 does not derive, interpolate, extrapolate, or estimate a missing device attribute.

## R4 through R11 zero matrix

Signal, I/O, and control-loop context remains 0. Control-system architecture remains 0. Safety, interlock, and shutdown context remains 0. Requirements, assumptions, and change remains 0. Discipline interface runtime remains 0. Review and validation remains 0. Automatic validation, conformance, approval, and certification remain 0. Dedicated currentness runtime remains 0. D9 source-contract runtime and D9 integration remain 0. D9 remains unstarted. R3 does not perform signal engineering, I/O engineering, control-loop engineering, control-system design, alarm rationalization, interlock logic, shutdown logic, SIL calculation, SIL verification, or functional-safety engineering.

## Currentness, thread, fingerprint, lineage, and history

R3 reuses canonical currentness, the canonical digital thread, and the canonical fingerprint. No parallel engine, thread, or second fingerprint algorithm is created. Current is not validated. Stale and superseded are not invalid. Lineage is explicit. Replay of the same fingerprint returns the existing record. A fingerprint mismatch is rejected and is not repaired. Duplicate current device context for the same object revision is rejected. Historical fingerprints and endpoint revisions are preserved. Silent mutation is rejected. R3 does not mutate R1 identity or R2 measurement and tag context.

## Source, provenance, applicability, and scope

Authoritative device context requires traceable provenance and source basis. Basisless authoritative context is rejected. Applicability and limitations are required, and applicability is scoped to the cited object. Context is not propagated outside its applicability. Tenant, workspace, and project scope are enforced. Cross-tenant access is rejected.

## Authority boundaries

Instrumentation and Control context is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Electrical authority. AI and admin are not I&C engineering authority. AI cannot invent an authoritative device attribute, range, or setpoint, and cannot promote device context to a validated selection. Admin cannot promote ungoverned context into engineering truth. Duplicate, replay, and spoofing protections cover device revisions, ranges, setpoints, vendor data, datasheets, certification and marking, source basis, provenance, authority, scope, fingerprint, and historical repoint.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 372 files and 1875 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs@4.4.0. Release governance tests passed at 188, and the ledger returned ok. No schema change. No new dependency. The canonical D8 milestone count remains 13.

## Known limitations

R3 records supplied instrument and device context, including service, datasheet, vendor, range, setpoint, certification, marking, hazardous-area evidence, and explicit device-to-measurement relationships. The presence of that context does not become EOS instrument selection, sizing, range calculation, setpoint derivation, project validation, code conformance, approval, or certification. Later phases remain named and unstarted.

## Next phase

The next phase is EOS-D8-R4-SIGNAL-IO-AND-CONTROL-LOOP-CONTEXT, type SIGNAL_IO_AND_CONTROL_LOOP_CONTEXT. Its scope is to implement governed signal, I/O and control-loop context using exact R1 through R3 revisions. Support signal identity and type, exact source and destination relationships, supplied I/O type and channel reference, explicit loop membership, loop purpose, and measurement or device relationships. Preserve source, basis, applicability, limitations, provenance, and currentness. Do not perform signal design calculations, I/O allocation optimization, control-loop tuning, control-logic design, DCS, PLC, or SIS configuration, alarm, interlock, or shutdown logic, functional-safety validation, or D9 reasoning. Preserve SIGNAL_CONTEXT != VALIDATED_IO_DESIGN, IO_CONTEXT != VALIDATED_CONTROL_SYSTEM_CONFIGURATION, CONTROL_LOOP_CONTEXT != CONTROL_LOGIC_DESIGN, CONTROL_LOOP_CONTEXT != LOOP_TUNING, and CONTROL_LOOP_CONTEXT != VALIDATED_CONTROL_PERFORMANCE. This closeout names that phase and does not start it.
