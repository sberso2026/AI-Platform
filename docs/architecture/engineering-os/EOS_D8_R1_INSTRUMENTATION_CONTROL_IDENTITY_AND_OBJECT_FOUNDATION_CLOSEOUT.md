# EOS-D8-R1 Instrumentation and Control Identity and Object Foundation Closeout

## Purpose

D8-R1 implements exactly one Instrumentation and Control runtime: governed I&C identity and exact revision. The live D8 runtime count is 1 and the live identity runtime count is 1. Architecture runtime counts remain 0. D8-R1 does not mark the Instrumentation and Control discipline complete. D6 and D7 remain COMPLETE_BOUNDED_WITH_LIMITATIONS and are not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D9 remains unstarted.

## D8-0 architecture reuse

The D8-0 architecture is the authoritative foundation. R1 reuses its canonical object taxonomy, maturity states, currentness states, fingerprint participation, digital-thread participation, authority boundaries, and the 13-milestone phase decomposition. No alternate identity architecture is introduced. D8_R1_STARTED remains false on the architecture file. The live runtime start and count live only on the R1 identity module.

## Taxonomy and allowlist

Authoritative object types are IAC_MEASUREMENT_POINT, IAC_INSTRUMENT, IAC_SIGNAL, IAC_IO_POINT, IAC_CONTROL_LOOP, IAC_CONTROL_SYSTEM_CONTEXT, IAC_ALARM_CONTEXT, IAC_INTERLOCK_CONTEXT, IAC_SHUTDOWN_CONTEXT, IAC_FUNCTIONAL_SAFETY_CONTEXT, IAC_CAUSE_EFFECT_CONTEXT, IAC_CONTROL_VALVE_CONTEXT, IAC_DOCUMENT_EVIDENCE, IAC_INTERFACE, and IAC_GOVERNANCE_RECORD. Freeform and unknown authoritative object types are rejected. Instrument classes such as SENSOR, TRANSMITTER, ANALYZER, SWITCH, GAUGE_OR_INDICATOR, ACTUATOR, POSITIONER, and INSTRUMENT_PACKAGE are not object types. Control-system classes such as DCS, PLC, SIS_OR_ESD, RTU_OR_SCADA, HMI, CONTROL_PANEL, and MARSHALLING are not object types. Governed records that are not object types remain IAC_REQUIREMENT, IAC_ASSUMPTION, IAC_ENGINEERING_DECISION, and IAC_EVIDENCE_REFERENCE.

## Identity and revision

Each authoritative identity records object identity, discipline INSTRUMENTATION_CONTROL, a canonical object type, exact revision identity, tenant, workspace, project, cited lifecycle stage, provenance, source basis, applicability, limitations, recorder, fingerprint, and currentness. The recorder authority is IAC_CONTEXT_AUTHORITY. Floating revisions such as latest are rejected. Identity proves governed existence of the object and revision. It does not prove validated I&C design, engineering validation, code conformance, approval, or certification. Creating a revision freezes the predecessor as superseded and keeps the predecessor object identity and fingerprint. Historical references are not repointed. Replay of the same identity and fingerprint returns the existing record. A conflicting identity or revision in the same governed scope is rejected. Silent mutation is rejected.

## Lifecycle and maturity

Lifecycle and maturity use the canonical D8 maturity states. The caller must cite a stage. R1 does not advance maturity automatically. Lifecycle state is not validation. Maturity is not validation and is not approval.

## Source, basis, provenance, applicability, and scope

Authoritative identity requires traceable provenance and source basis. Basisless authoritative identity is rejected. Applicability and limitations are required and are part of the fingerprint. Identity is not propagated outside its stated applicability. Identity creation, retrieval, and revision require tenant, workspace, and project scope. Cross-tenant, cross-workspace, and cross-project operations are rejected. AI and admin cannot invent an authoritative identity, promote an unknown object type, or bypass the allowlist. AI and admin are not I&C engineering authority.

## Currentness, thread, fingerprint, lineage, and history

R1 reuses canonical currentness, the canonical digital thread, and the canonical fingerprint. No parallel currentness engine, digital thread, or second fingerprint algorithm is created. No dedicated currentness runtime is implemented. Participation is limited to identity and explicit revision relationships. Relationship kinds are PARENT and OBJECT_REFERENCE. Inferred lineage is rejected. A current record is not validated. A stale or superseded record is not invalid. Fingerprint mismatch is reported as an integrity failure and is not repaired or rebaselined. History records creation and supersession without rewriting the historical fingerprint.

## Authority matrix

Instrumentation and Control identity is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Electrical authority. A Process requirement is not I&C design. A Process measurement requirement is not a validated instrument. An Electrical power interface is not I&C design. An Electrical protection context is not an I&C implementation. Recording an identity does not transfer discipline authority.

## Future runtime zero matrix

Process measurement and tag context remains 0. Instrument and device context remains 0. Signal, I/O, and control-loop context remains 0. Control-system architecture context remains 0. Safety, interlock, and shutdown context remains 0. Requirements, assumptions, and change remains 0. Discipline interface runtime remains 0. Review and validation remains 0. Dedicated currentness and digital-thread runtime remains 0. D9 source-contract runtime and D9 integration remain 0. D9 remains unstarted. Identity of a measurement point, instrument, signal, loop, alarm, interlock, control-system object, or safety-related object does not create those later contexts.

## Calculation and design zero matrix

Instrument sizing, instrument selection, control-valve sizing, actuator sizing, control-loop tuning, control-logic design, automatic control-logic generation, SIL calculation, SIL verification, and functional-safety validation remain 0. Automatic I&C design and redesign remain 0. Automatic engineering validation, conformance determination, approval, and certification remain 0. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain 0. R1 does not perform instrument sizing or selection, signal engineering, I/O engineering, control-loop engineering, control-system design, alarm rationalization, interlock logic, shutdown logic, or functional-safety engineering.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 370 files and 1873 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs@4.4.0. Release governance tests passed at 186, and the ledger returned ok. No schema change. No new dependency.

## Known limitations

R1 records that an Instrumentation and Control object and revision exist. It does not establish process measurement, instrument selection, signal or I/O design, control logic, loop tuning, functional-safety validation, engineering validity, code conformance, approval, or certification. Later phases remain named and unstarted.

## Next phase

The next phase is EOS-D8-R2-PROCESS-MEASUREMENT-AND-TAG-CONTEXT, type PROCESS_MEASUREMENT_AND_TAG_CONTEXT. Its scope is to implement governed process measurement point and Instrumentation and Control tag context using exact R1 identities and exact upstream source revisions where explicitly governed. Support measurement purpose, process variable type, source Process requirement reference, tag identity, and explicit measurement-point relationships. Preserve source, basis, applicability, limitations, provenance, and currentness. Do not implement instrument sizing or selection, signal or I/O engineering, control-loop engineering, control-system design, alarm or interlock logic, functional-safety engineering, validation, or a D9 runtime. This closeout names that phase and does not start it.
