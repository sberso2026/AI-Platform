# EOS-D8-R4 Signal, I/O, and Control-Loop Context Closeout

## Purpose

D8-R4 implements exactly one new Instrumentation and Control runtime: governed signal, I/O, and control-loop context. The live D8 runtime count is 4. The live signal, I/O, and control-loop runtime count is 1. The R1 identity runtime count remains 1. The R2 measurement and tag runtime count remains 1. The R3 instrument and device context runtime count remains 1. Architecture runtime counts remain 0. D8-R4 does not mark the Instrumentation and Control discipline complete. D6 and D7 remain COMPLETE_BOUNDED_WITH_LIMITATIONS and are not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D9 remains unstarted.

## Exact R1 through R3 reuse

R4 reads exact R1 context and object revisions, exact R2 measurement revisions, and exact R3 device revisions. A signal, I/O record, loop, membership, or endpoint relationship stores the cited revision fingerprint. Floating revisions are rejected. A wrong fingerprint is rejected. R4 does not rewrite R1 objects, R2 measurements or tags, R3 devices, their fingerprints, or their history. Superseding an R1 identity does not repoint an existing signal, source, destination, measurement, or device fingerprint. Recording signal or loop context does not mark the R1 identity as signal, I/O, or control-loop design.

## Signal context

A signal context cites an exact current IAC_SIGNAL revision, a canonical signal type, and a canonical direction. Supported signal types are ANALOG_INPUT, ANALOG_OUTPUT, DIGITAL_DISCRETE_INPUT, DIGITAL_DISCRETE_OUTPUT, PULSE_FREQUENCY, SERIAL_NETWORK_REFERENCE, and OTHER_CANONICAL_SIGNAL. Directions are INPUT, OUTPUT, and BIDIRECTIONAL. A supplied unit and a supplied protocol reference may be preserved as supplied text. The unit is stored as supplied. A supplied signal type is not validated signal design. Signal context is not validated I/O design, control logic, or engineering validation.

## Exact source and destination

Every signal requires an explicit source object revision and an explicit destination object revision. Endpoints must be current governed objects of an allowlisted type: measurement point, instrument, I/O point, control-valve context, signal, or control loop. The source and destination must differ, and neither may be the signal object itself. Connectivity is not inferred from tag naming, loop number, shared equipment, the same process variable, drawing proximity, document co-occurrence, semantic similarity, or AI interpretation. A later endpoint relationship may restate the stored source or destination. A different endpoint is rejected and does not create a new path. R4 does not route a signal and does not create a signal path.

## Supplied I/O context

An I/O context cites an exact current IAC_IO_POINT revision and a canonical supplied I/O type. Supported types are ANALOG_INPUT, ANALOG_OUTPUT, DIGITAL_INPUT, DIGITAL_OUTPUT, PULSE, SERIAL_REFERENCE, and OTHER_CANONICAL_IO. A supplied channel, terminal, or marshalling reference may be preserved as supplied text. Automatic, allocated, or floating channel tokens are rejected. One current I/O context is kept per cited object revision. A supplied channel already held by another current I/O context is rejected. Supplied I/O type and channel context are not validated control-system configuration and are not I/O allocation performed by EOS. R4 does not allocate I/O, optimize an allocation, or assign a channel.

## Explicit control-loop membership

A loop context cites an exact current IAC_CONTROL_LOOP revision and a canonical purpose. Purposes are REGULATORY_CONTROL, INDICATION_ONLY, ON_OFF_CONTROL, MONITORING, and OTHER_CANONICAL_PURPOSE. Optional measurement, device, signal, or I/O references on the loop are exact revisions and do not create membership. Membership is a separate explicit record of kind MEASUREMENT, DEVICE, SIGNAL, or IO_POINT, and each member revision is exact. Tag naming and other inferred kinds are rejected. Loop purpose is not a validated control strategy. Loop context is not control-logic design, loop tuning, or validated control performance.

## Measurement and device relationships

A cited measurement must match an exact current R2 measurement revision. A cited device must match an exact current R3 device revision. Those references are not signal design and are not I/O allocation. Process measurement context is not I/O configuration. Instrument and device context is not signal design. R4 does not rewrite the measurement or the device.

## No calculation, tuning, logic, or configuration

R4 does not calculate a signal design and does not derive, interpolate, extrapolate, or estimate a missing signal attribute. Loop tuning, control-logic design, and automatic control-logic generation remain 0. Instrument selection, instrument sizing, control-valve sizing, and actuator sizing remain 0. R4 does not configure DCS, PLC, SIS, or SCADA, and it does not assign a controller or a control-system node.

## R5 through R11 zero matrix

Control-system architecture remains 0. Safety, interlock, and shutdown context remains 0. A signal or loop does not create an alarm, interlock, trip, or shutdown function. Requirements, assumptions, and change remains 0. Discipline interface runtime remains 0. Review and validation remains 0. Automatic validation, conformance, approval, and certification remain 0. Dedicated currentness runtime remains 0. D9 source-contract runtime and D9 integration remain 0. D9 remains unstarted. SIL calculation, SIL verification, and functional-safety validation remain 0. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain 0. Automatic I&C design and redesign remain 0.

## Currentness, thread, fingerprint, lineage, and history

R4 reuses canonical currentness, the canonical digital thread, and the canonical fingerprint. No parallel engine, thread, or second fingerprint algorithm is created. Current is not validated. Stale and superseded are not invalid. Lineage is explicit. Replay of the same fingerprint returns the existing record. A fingerprint mismatch is rejected and is not repaired. Historical channel and endpoint revisions are preserved when a later record supersedes an earlier one. Silent mutation is rejected.

## Source, provenance, applicability, and scope

Authoritative signal, I/O, and loop context requires traceable provenance and source basis. Basisless authoritative context is rejected. Applicability and limitations are required, and applicability is scoped to the cited object. Context is not propagated outside its applicability. Tenant, workspace, and project scope are enforced. Cross-tenant access is rejected.

## Authority boundaries

Instrumentation and Control context is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Electrical authority. A Process requirement is not D8 control logic. A Process trip or shutdown intent is not D8 control-loop design. An Electrical power interface is not D8 I/O configuration. Electrical trip context is not D8 control-logic design. Electrical protection context is not D8 I&C implementation. AI and admin are not I&C engineering authority. AI cannot invent a signal relationship, an I/O assignment, or a loop membership, and cannot promote signal context to validated I/O design or loop context to a validated control strategy. Admin cannot promote ungoverned context into engineering truth. Duplicate, replay, and spoofing protections cover signals, endpoint relationships, I/O context, channel assignment, loops, membership, revisions, authority, provenance, source basis, scope, fingerprint, and historical repoint.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 373 files and 1876 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs@4.4.0. Release governance tests passed at 189, and the ledger returned ok. No schema change. No new dependency. The canonical D8 milestone count remains 13.

## Known limitations

R4 records supplied signal identity, signal type, direction, explicit source and destination revisions, supplied I/O type and channel or terminal or marshalling references, loop purpose, and explicit loop membership. The presence of that context does not become validated I/O design, control logic, I/O allocation, loop tuning, validated control performance, a validated control strategy, control-system configuration, alarm or interlock or shutdown logic, functional-safety validation, code conformance, approval, or certification. Later phases remain named and unstarted.

## Next phase

The next phase is EOS-D8-R5-CONTROL-SYSTEM-ARCHITECTURE-CONTEXT, type CONTROL_SYSTEM_ARCHITECTURE_CONTEXT. Its scope is to implement governed control-system architecture context using exact R1 through R4 revisions. Support supplied DCS, PLC, SIS, and SCADA node context, HMI and control-panel context, controller or node identity, supplied system hierarchy, supplied network or interface context, supplied cabinet, panel, or marshalling references, and explicit relationships to signals, I/O, and loops. Preserve source, basis, applicability, limitations, provenance, and currentness. Do not configure DCS, PLC, SIS, or SCADA systems, generate control logic, optimize networks, perform cybersecurity validation, rationalize alarms, implement interlock or shutdown logic, perform SIL verification, or start D9 reasoning. Preserve CONTROL_SYSTEM_CONTEXT != VALIDATED_CONTROL_SYSTEM_DESIGN, CONTROL_SYSTEM_CONTEXT != VALIDATED_NETWORK_DESIGN, CONTROL_SYSTEM_CONTEXT != CYBERSECURITY_VALIDATED, CONTROL_SYSTEM_NODE_CONTEXT != CONTROLLER_CONFIGURATION, and NETWORK_CONTEXT != SECURE_NETWORK_DESIGN. This closeout names that phase and does not start it.
