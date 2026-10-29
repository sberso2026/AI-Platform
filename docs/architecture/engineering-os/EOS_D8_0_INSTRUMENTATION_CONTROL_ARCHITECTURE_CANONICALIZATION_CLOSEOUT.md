# EOS-D8-0 Instrumentation and Control architecture canonicalization

D8-0 defines the Instrumentation and Control architecture only. D8_ARCHITECTURE_DEFINED and D8_ARCHITECTURE_READY are YES. D8_RUNTIME_STARTED remains NO. D8_RUNTIME_COUNT remains 0. This phase does not mark D8 complete, does not start R1, and does not claim instrument selection, engineering calculation, control logic, loop tuning, SIL verification, functional-safety validation, code conformance, approval, certification, D9 completion, or EOS general availability.

## Domain scope

The canonical domain is bounded I&C context and governed evidence: process measurement points, instruments and device classes, signals and I/O, control loops and control functions, alarms, interlocks, trips and shutdown intent, control-system context including DCS, PLC, SIS or ESD, RTU or SCADA, HMI, panels and marshalling, instrument and control power as source context, functional-safety source evidence, cause-and-effect source evidence, instrument data and specification context, and vendor evidence. Device classes and control-system classes are classifications, not additional authoritative object types. Not every category becomes a runtime in D8-0.

Out of scope: Process, Electrical, Mechanical, Piping, Structural, Civil, and Geotechnical design; instrument sizing and selection; control-valve and actuator sizing; control-loop tuning; PLC, DCS, or SIS logic design; automatic control-logic generation; SIL calculation and verification; functional-safety validation; OT cybersecurity certification; network hardening; conformance, approval, and certification; and multidisciplinary reasoning.

## Canonical object taxonomy

Authoritative allowlist: IAC_MEASUREMENT_POINT, IAC_INSTRUMENT, IAC_SIGNAL, IAC_IO_POINT, IAC_CONTROL_LOOP, IAC_CONTROL_SYSTEM_CONTEXT, IAC_ALARM_CONTEXT, IAC_INTERLOCK_CONTEXT, IAC_SHUTDOWN_CONTEXT, IAC_FUNCTIONAL_SAFETY_CONTEXT, IAC_CAUSE_EFFECT_CONTEXT, IAC_CONTROL_VALVE_CONTEXT, IAC_DOCUMENT_EVIDENCE, IAC_INTERFACE, IAC_GOVERNANCE_RECORD.

Governed records that are not object types: IAC_REQUIREMENT, IAC_ASSUMPTION, IAC_ENGINEERING_DECISION, IAC_EVIDENCE_REFERENCE.

Instrument classes that are not object types: SENSOR, TRANSMITTER, ANALYZER, SWITCH, GAUGE_OR_INDICATOR, ACTUATOR, POSITIONER, INSTRUMENT_PACKAGE.

Control-system classes that are not object types: DCS, PLC, SIS_OR_ESD, RTU_OR_SCADA, HMI, CONTROL_PANEL, MARSHALLING.

Functional-safety evidence classes that are not object types: hazard-analysis, SIF, SIL requirement, cause-and-effect, safety-requirement, proof-test, and vendor-certification references.

Freeform authoritative types are not allowed. Unknown authoritative types are not auto-accepted. D8_CANONICAL_OBJECT_TAXONOMY_DEFINED = YES. D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_DEFINED = YES.

## Truth-boundary matrix

Identity is not validated I&C design, engineering validation, code conformance, approval, or certification. A process measurement context is not a validated process value. A measurement point is not instrument selection. A measurement requirement is not a validated instrument design. Instrument context and a datasheet are not validated selection or design. Vendor instrument data is not project validation. Signal context is not validated I/O design. I/O context is not a validated control-system configuration. A control loop is not control-logic design, loop tuning, or validated control performance. Control-system context is not a validated control-system design, network design, or cybersecurity validation. An alarm is not completed rationalization, a validated priority, or an approved philosophy. An interlock is not implemented control logic. A trip is not validated shutdown logic. Shutdown intent is not functional-safety validation. Functional-safety context is not functional-safety validation. A SIL requirement is not SIL verified. A SIF context is not a validated SIF. Vendor safety certification is not project safety validation. Cause-and-effect context is not implemented control logic and is not functional-safety validation. A control-valve context is not validated valve sizing. An actuator context is not a validated actuator selection. A supplied range is not a validated range selection. A supplied setpoint is not a validated setpoint. A standards reference, including IEC 61508 or IEC 61511, is not compliance. SIL context is not functional-safety certification. OT cybersecurity context is not cybersecurity validated. Network context is not a secure network design.

## Process and Electrical interfaces

D6 Process remains the upstream process authority. The D8-to-D6 interface reuses the existing D6-R8 future contract subjects: PROCESS_CONTROL_INTENT, PROCESS_MEASUREMENT_REQUIREMENT, ALARM_OR_TRIP_PROCESS_INTENT, SETPOINT_SOURCE_CONTEXT, CONTROL_VALVE_PROCESS_REQUIREMENT, PROCESS_SAFEGUARDING_REQUIREMENT. D8_D6_INTERFACE_ARCHITECTURE_DEFINED = YES. D8_D6_INTERFACE_COMPATIBLE_WITH_EXISTING_D6_R8_CONTRACT = YES. D8_D6_RUNTIME_INTEGRATION_COUNT = 0. A Process requirement is not D8 I&C design. A Process measurement requirement is not a validated D8 instrument. Trip or shutdown intent is not D8 control-logic design. Process safety intent is not functional-safety validation.

D7 Electrical remains Electrical authority. The D8-to-D7 interface reuses the existing D7-R8 future contract subjects: instrument and control power, UPS or DC supply, electrical status signals, motor-control and MCC interfaces, trip or interlock electrical context, emergency power, control-panel power, and functional-safety electrical supply context. D8_D7_INTERFACE_ARCHITECTURE_DEFINED = YES. D8_D7_INTERFACE_COMPATIBLE_WITH_EXISTING_D7_R8_CONTRACT = YES. D8_D7_RUNTIME_INTEGRATION_COUNT = 0. A power interface is not D8 I&C design. An Electrical trip context is not D8 control-logic design. Electrical protection context is not D8 implementation and is not functional-safety validation. D7 is not reopened.

## Other discipline boundaries

D4 Mechanical future subjects remain the existing package, monitoring, trip or alarm, and control-interface subjects. Mechanical equipment context is not D8 I&C design. I&C context is not Mechanical design. D5 Piping future subjects remain control-valve or instrument connections, inline instruments, tappings, actuated valves, measurement connections, and package instrumentation boundaries. Piping context is not D8 I&C design. Instrument context is not validated Piping design. Justified future source contexts exist for D1 support and mounting, D2 trenches, ducts, buildings and site interfaces, and D3 site evidence. D8 does not inherit Structural, Civil, or Geotechnical authority.

## Measurement, instrument, signal, and control architecture

Architecture carries measurement-point identity, instrument identity, signal identity and type, source device, destination system, I/O type, channel or reference context, control-loop identity, and control-system node context. None of those contexts select a device, size a valve or actuator, tune a loop, or generate control logic.

## Alarm, interlock, trip, shutdown, and functional safety

Architecture carries supplied alarm, interlock, trip, shutdown, cause-and-effect, and functional-safety source context, including hazard-analysis, SIF, SIL requirement, proof-test, and vendor-certification references. D8-0 does not claim IEC 61508, IEC 61511, or any jurisdiction-specific functional-safety regime.

## Calculation and design zero matrix

All of the following runtime counts are 0: instrument identity, measurement context, instrument device context, signal and I/O and control loop, control-system architecture, safety and interlock and shutdown, requirements and assumptions and change, discipline interface, review and validation, dedicated currentness and digital thread, D9 source contract, instrument sizing, instrument selection, control-valve sizing, actuator sizing, control-loop tuning, control-logic design, automatic control-logic generation, SIL calculation, SIL verification, functional-safety validation, automatic I&C design, automatic I&C redesign, automatic engineering validation, conformance, approval, certification, and cross-discipline reasoning, conflict detection, conflict resolution, and recommendation. D8_RUNTIME_COUNT = 0.

## Authority matrix

D8 is not D1, D2, D3, D4, D5, D6, or D7 authority. AI, admin, and D9 are not D8 I&C engineering authority. AI cannot invent an authoritative instrument, signal, control loop, interlock, or SIF, and cannot promote context to validated engineering.

## Governance reuse

D8 reuses canonical EOS identity, revision, lifecycle, maturity, provenance, scope, requirement, assumption, decision, change, review and validation, currentness, digital thread, fingerprint, lineage, and interface patterns. No parallel currentness engine, digital thread, fingerprint algorithm, requirement engine, assumption engine, decision engine, change engine, or review engine is created. A source requirement is not an adopted D8 requirement and is not auto-adopted. An assumption is not a validated fact. An AI recommendation is not a D8 engineering decision. Change is not automatic redesign or revalidation. Review requested is not completed. Review completed is not validated. A closed finding is not validated. Validation is not conformance, approval, certification, or regulatory approval. Current is not validated. Stale is not invalid. Superseded is not invalid.

## Exact revision, lineage, and history

Exact revision references are required. Floating authoritative references are not allowed. Historical references are not auto-repointed. History preservation is required. Silent history mutation is not allowed. Explicit lineage is required. Inferred lineage is not allowed. Source and basis are required and traceable. Applicability and limitations are required. Provenance is required and preserved. Tenant, workspace, and project scope is defined. Cross-tenant access is not allowed.

## Jurisdiction and standards

The architecture carries jurisdiction, applicable standards, edition or version, project rules, client standards, and regulatory references through the existing jurisdiction profile set. No jurisdiction is hardcoded as global truth. No new jurisdiction profile id is added. EU-oriented governance remains a high-bar baseline and is not an EU-only engineering rule.

## Future D9 source contract

The future read-only contract is defined and not implemented. It is specified to expose exact revision, object or source type, source and basis, provenance, applicability, limitations, currentness, authority, review and validation state, explicit lineage, and fingerprint, covering measurement or instrument, signal or I/O or control loop, control system, alarm or interlock or shutdown, functional-safety context, requirements, assumptions, decisions, evidence, and interfaces. It creates no engineering fact, derives no value, and transfers no I&C authority. D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0. D8_D9_RUNTIME_INTEGRATION_COUNT = 0. D9_RUNTIME_STARTED = NO. D9_RUNTIME_COUNT = 0.

## Canonical phase decomposition

D8_CANONICAL_PHASE_DECOMPOSITION_DEFINED = YES. Milestone count is 13: D8-0 plus twelve implementation phases. D8_R1_STARTED remains false.

- D8-0 EOS-D8-0-INSTRUMENTATION-CONTROL-ARCHITECTURE-CANONICALIZATION, type INSTRUMENTATION_CONTROL_ARCHITECTURE_CANONICALIZATION
- R1 EOS-D8-R1-INSTRUMENTATION-CONTROL-IDENTITY-AND-OBJECT-FOUNDATION, type INSTRUMENTATION_CONTROL_IDENTITY_AND_OBJECT_FOUNDATION
- R2 EOS-D8-R2-PROCESS-MEASUREMENT-AND-TAG-CONTEXT, type PROCESS_MEASUREMENT_AND_TAG_CONTEXT
- R3 EOS-D8-R3-INSTRUMENT-AND-DEVICE-CONTEXT, type INSTRUMENT_AND_DEVICE_CONTEXT
- R4 EOS-D8-R4-SIGNAL-IO-AND-CONTROL-LOOP-CONTEXT, type SIGNAL_IO_AND_CONTROL_LOOP_CONTEXT
- R5 EOS-D8-R5-CONTROL-SYSTEM-ARCHITECTURE-CONTEXT, type CONTROL_SYSTEM_ARCHITECTURE_CONTEXT
- R6 EOS-D8-R6-SAFETY-INTERLOCK-AND-SHUTDOWN-CONTEXT, type SAFETY_INTERLOCK_AND_SHUTDOWN_CONTEXT
- R7 EOS-D8-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE, type REQUIREMENTS_ASSUMPTIONS_AND_CHANGE
- R8 EOS-D8-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS, type DISCIPLINE_INTERFACES_AND_HANDOFFS
- R9 EOS-D8-R9-REVIEW-AND-VALIDATION-GOVERNANCE, type REVIEW_AND_VALIDATION_GOVERNANCE
- R10 EOS-D8-R10-CURRENTNESS-AND-DIGITAL-THREAD, type CURRENTNESS_AND_DIGITAL_THREAD
- R11 EOS-D8-R11-D9-SOURCE-CONTRACT, type D9_SOURCE_CONTRACT
- R12 EOS-D8-R12-INSTRUMENTATION-CONTROL-BOUNDED-CLOSEOUT, type INSTRUMENTATION_CONTROL_BOUNDED_CLOSEOUT

The next phase is R1 only. It is limited to governed I&C object identity, revision, lifecycle, source, provenance, and currentness. It does not implement measurement engineering, device sizing or selection, signals, I/O, control loops, control-system design, functional safety, review, or D9 integration.

## Security and release posture

Known baseline security failure count is 2. Known baseline security root-cause count is 1. Both packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts fail on the pre-existing EOS-A16D import of @rtb/engineering-review from packages/engineering-os/src/connectors/m365/eos-a16d-generic-binary-retrieval.test.ts. The fingerprint is unchanged. No new security regression. Raw security suite result is FAIL. Security regression gate is PASS. Hosted RLS remains 2 tests with 1 skipped. Persistence unit result is 1 failed and 10 passed (11 files), 1 failed and 33 passed (34 tests). Review result is 1 failed and 21 passed (22 files), 1 failed, 123 passed, and 1 skipped (125 tests), with integration 2 passed. Secret scan PASS, 618 files, 0 findings. Dependency audit critical 0, high 0, moderate 1, GHSA-w5hq-g745-h8pq uuid via exceljs@4.4.0. No new critical or high dependency vulnerability. Release-governance tests PASS, measured count 185 (classification 163, recovery 7, guard 15). Release-governance typecheck PASS. Release ledger integrity ok true. Release artifact consistency PASS. No schema change. No new dependency. D1 remains incomplete and unreopened. D2 through D7 remain complete and unreopened. D6 and D7 status remain COMPLETE_BOUNDED_WITH_LIMITATIONS.

Engineering OS suite: 369 files, 1872 tests, PASS. Web app typecheck PASS. Web pilot typecheck PASS with PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. Engineering OS typecheck PASS. Lint PASS with pre-existing warnings.

## Limitations

D8-0 does not perform Instrumentation and Control engineering calculations, device sizing or selection, control-system design, control-logic design, functional-safety validation, SIL verification, alarm rationalization, control-loop tuning, network design, validation, conformance determination, approval, or certification. It does not start D9. It does not complete EOS. D1 structural pack completeness and the pre-existing EOS-A16D and uuid advisory remain outside this phase.
