# EOS-D8-R5 Control-System Architecture Context Closeout

## Purpose

D8-R5 implements exactly one new Instrumentation and Control runtime: governed control-system architecture context. The live D8 runtime count is 5. The live control-system architecture runtime count is 1. The R1 identity runtime count remains 1. The R2 measurement and tag runtime count remains 1. The R3 instrument and device context runtime count remains 1. The R4 signal, I/O, and control-loop runtime count remains 1. Architecture runtime counts remain 0. DCS, PLC, SIS, HMI, panel, cabinet, and network objects are context inside this one runtime. D8-R5 does not mark the Instrumentation and Control discipline complete. D6 and D7 remain COMPLETE_BOUNDED_WITH_LIMITATIONS and are not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D9 remains unstarted.

## Exact R1 through R4 reuse

R5 reads exact R1 context and object revisions and exact current R4 signal, I/O, and loop revisions. A system, node, membership, hierarchy, interface, network, or relationship stores the cited revision fingerprint. Floating revisions are rejected. A wrong fingerprint is rejected. R5 does not rewrite R1 objects, R2 measurements or tags, R3 devices, R4 signals, I/O records, or loops, their fingerprints, or their history. Superseding an R1 identity does not repoint an existing system, node, or R4 member fingerprint. Recording control-system context does not mark the R1 identity as control-system design.

## Control-system context and system type

A control-system context cites an exact current IAC_CONTROL_SYSTEM_CONTEXT revision and a canonical system type. Canonical types are DCS, PLC, SIS_OR_ESD, RTU_OR_SCADA, HMI, CONTROL_PANEL, and MARSHALLING. An unknown type is rejected. A supplied system type is not a validated system selection. Control-system context is not validated control-system design, control-system configuration, or engineering validation. R5 does not configure DCS, PLC, SIS, SCADA, or RTU.

## Node and controller context

A node context cites an exact current IAC_CONTROL_SYSTEM_CONTEXT revision and a canonical node role. Roles are CONTROLLER, DCS_NODE, PLC_NODE, SIS_NODE, SCADA_NODE, RTU_NODE, REMOTE_IO, OPERATOR_STATION, and ENGINEERING_STATION. Those roles are context, not new object types. One current node is kept per cited object revision. Node context is not controller configuration and is not validated controller selection. R5 does not auto-assign a node, a controller, a signal to a controller, or I/O to a controller.

## System membership and supplied hierarchy

Membership is an explicit SYSTEM_MEMBER record between an exact current system revision and an exact current node revision. Membership is not inferred from naming conventions, network-address similarity, vendor family, tag prefixes, document co-occurrence, topology proximity, semantic similarity, or AI interpretation. A supplied hierarchy is an explicit SUPPLIED_PARENT record between two current system or node revisions. Hierarchy is not validated system architecture. R5 does not generate a hierarchy. Recording a hierarchy does not create membership. A second current parent for the same child is rejected. A replay of the same parent and child returns the existing record.

## Signal, I/O, and loop relationships

A relationship is an explicit SIGNAL_TO_SYSTEM, SIGNAL_TO_NODE, IO_TO_SYSTEM, IO_TO_NODE, LOOP_TO_SYSTEM, or LOOP_TO_NODE record. The target is an exact current system or node revision. The member is an exact current R4 signal, I/O, or loop revision. A mismatched fingerprint is rejected and is not repaired. A signal-to-system relationship is not validated system configuration. A signal-to-node relationship is not controller configuration. An I/O-to-system relationship is not validated I/O configuration. An I/O-to-controller relationship is not I/O allocation performed by EOS. A loop-to-system relationship is not a validated control strategy. A loop-to-controller relationship is not control logic implemented.

## HMI, panel, cabinet, and marshalling context

HMI, operator-station, engineering-station, control-panel, cabinet, and marshalling context are supplied interface records on an exact current object revision. A supplied reference may be preserved as text. HMI context is not HMI configuration and is not validated HMI design. R5 does not configure an HMI and does not generate HMI or operator graphics. Panel context is not validated panel design and is not panel layout design. Cabinet context is not validated cabinet design. Marshalling context is not validated termination design and is not I/O allocation. R5 does not perform termination design and does not assign a marshalling terminal or a termination.

## Network, protocol, and cybersecurity context

A network or interface context requires two different exact current node revisions. A supplied segment, protocol, vendor, and cybersecurity reference may be preserved as supplied text. Endpoints are not inferred from IP-like values, names, tags, vendor type, or proximity. A supplied protocol is not validated network configuration. Network context is not validated network design, secure network design, or cybersecurity validation. A supplied cybersecurity or security-zone reference is context only and is not a validated security architecture. R5 does not configure a network, switch, router, or firewall, assign a network address, design or optimize a network, or calculate bandwidth, capacity, or redundancy. R5 does not validate cybersecurity, certify OT security, or determine network security compliance.

## Zero configuration and design matrix

R5 does not configure DCS, PLC, SIS, SCADA, or RTU. Control-logic design and automatic control-logic generation remain 0. Loop tuning remains 0. R5 does not allocate I/O, optimize an allocation, or assign a channel. Controller sizing, control-system capacity sizing, and I/O capacity sizing are not performed. Instrument sizing, instrument selection, control-valve sizing, and actuator sizing remain 0. Automatic I&C design and redesign remain 0. Automatic engineering validation, conformance, approval, and certification remain 0.

## R6 through R11 zero matrix

Safety, interlock, and shutdown context remains 0. R5 does not rationalize alarms and does not create alarm, interlock, trip, or shutdown context. SIL calculation, SIL verification, and functional-safety validation remain 0. Requirements, assumptions, and change remains 0. Discipline interface runtime remains 0. Review and validation remains 0. Dedicated currentness runtime remains 0. D9 source-contract runtime and D9 integration remain 0. D9 remains unstarted. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain 0.

## Currentness, thread, fingerprint, lineage, and history

R5 reuses canonical currentness, the canonical digital thread, and the canonical fingerprint. No parallel engine, thread, or second fingerprint algorithm is created. Current is not validated. Stale and superseded are not invalid. Lineage is explicit. Replay of the same fingerprint returns the existing record. A fingerprint mismatch is rejected and is not repaired. Historical protocol and endpoint revisions are preserved when a later record supersedes an earlier one. Silent mutation and historical auto-repoint are rejected.

## Source, provenance, applicability, and scope

Authoritative control-system context requires traceable provenance and source basis. Basisless authoritative context is rejected. Applicability and limitations are required, and applicability is scoped to the cited objects. Context is not propagated outside its applicability. Tenant, workspace, and project scope are enforced. Cross-tenant access is rejected.

## Authority boundaries

Instrumentation and Control context is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Electrical authority. A Process requirement is not D8 control-system design. A Process control requirement is not validated D8 control-system architecture. A Process trip or shutdown intent is not D8 control-logic design. An Electrical power interface is not D8 control-system design and is not validated control-panel design. Electrical trip context is not D8 control-logic design. Electrical protection context is not D8 I&C implementation. AI and admin are not I&C engineering authority. AI cannot invent a system hierarchy, a node relationship, a network topology, or a controller assignment, and cannot promote control-system context to validated design or network context to secure network design. Admin cannot promote ungoverned context into engineering truth. Duplicate, replay, and spoofing protections cover systems, nodes, membership, hierarchy, network endpoints, protocol, HMI, panel, cabinet, marshalling, source basis, provenance, authority, scope, fingerprint, and historical repoint.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 374 files and 1877 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs@4.4.0. Release governance tests passed at 190, and the ledger returned ok. No schema change. No new dependency. The canonical D8 milestone count remains 13.

## Known limitations

R5 records supplied control-system type, node role, explicit system membership, supplied hierarchy, supplied HMI, panel, cabinet, and marshalling references, explicit network endpoints, supplied protocol and cybersecurity references, and explicit relationships to exact R4 signal, I/O, and loop revisions. The presence of that context does not become validated control-system design, controller configuration, I/O allocation, control logic, network design, cybersecurity validation, alarm or interlock or shutdown engineering, functional-safety validation, code conformance, approval, or certification. Later phases remain named and unstarted.

## Next phase

The next phase is EOS-D8-R6-SAFETY-INTERLOCK-AND-SHUTDOWN-CONTEXT, type SAFETY_INTERLOCK_AND_SHUTDOWN_CONTEXT. Its scope is to implement governed alarm, interlock, trip, shutdown and functional-safety source context using exact D8 R1 through R5 revisions and explicit upstream source revisions. Support alarms and supplied priorities, interlock intent, trip intent, shutdown intent, permissive context, cause-and-effect source references, safety-function or SIF source context, supplied SIL requirements, supplied safety-requirement references, vendor safety-certification evidence, proof-test evidence, and explicit relationships to measurement, device, signal, loop, and control-system context. Preserve source, basis, applicability, limitations, provenance, and currentness. Do not rationalize alarms, generate interlock, trip, or shutdown logic, calculate or verify SIL, calculate PFD or PFH, design SIF architecture, perform functional-safety validation, configure SIS, determine compliance, approve or certify engineering, or start D9 reasoning. Preserve ALARM_CONTEXT != ALARM_RATIONALIZATION_COMPLETE, INTERLOCK_CONTEXT != CONTROL_LOGIC_IMPLEMENTED, TRIP_CONTEXT != VALIDATED_SHUTDOWN_LOGIC, SHUTDOWN_INTENT != FUNCTIONAL_SAFETY_VALIDATED, SIL_REQUIREMENT != SIL_VERIFIED, SIF_CONTEXT != SIF_VALIDATED, CAUSE_EFFECT_CONTEXT != CONTROL_LOGIC_IMPLEMENTED, and VENDOR_SAFETY_CERTIFICATION != PROJECT_SAFETY_VALIDATION. This closeout names that phase and does not start it.
