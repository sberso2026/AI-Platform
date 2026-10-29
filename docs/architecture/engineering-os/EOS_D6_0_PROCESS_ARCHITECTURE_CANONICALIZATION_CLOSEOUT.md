# EOS-D6-0 Process Architecture Canonicalization Closeout

## Purpose

D6-0 defines what Process engineering truth Engineering OS may govern and where that authority ends. It establishes the canonical Process architecture before any substantive Process runtime. Process streams, conditions, duties, safety requirements, and evidence stay distinct from Piping, Mechanical, Electrical, and Instrumentation and Control design truth. Architecture is not engineering validation or conformance.

## Scope and authority

D6 owns bounded Process engineering context and governed Process evidence: systems, units, streams, fluid and service context, phase and composition context, operating and design cases, Process-source conditions, design basis, requirements, assumptions, decisions, utility context, calculation evidence, equipment duty, relief and process-safety context, control intent and measurement requirements, document evidence, interfaces, review and validation requirements, currentness, lineage, and a future D9 source contract. D6 is not Structural, Civil, Geotechnical, Mechanical, Piping, Electrical, or Instrumentation and Control authority. AI and admin are not Process engineering authority and are not Process reviewer authority.

## Object taxonomy

Authoritative object types are allowlisted. Freeform and unknown types are not accepted. The adopted types are PROCESS_SYSTEM, PROCESS_UNIT, PROCESS_STREAM, PROCESS_SERVICE, PROCESS_FLUID, PROCESS_COMPOSITION_CONTEXT, PROCESS_OPERATING_CASE, PROCESS_DESIGN_CASE, PROCESS_CONDITION, PROCESS_DESIGN_BASIS, PROCESS_CALCULATION_EVIDENCE, PROCESS_EQUIPMENT_DUTY, PROCESS_UTILITY_REQUIREMENT, PROCESS_RELIEF_SCENARIO, PROCESS_SAFETY_CONTEXT, PROCESS_CONTROL_INTENT, PROCESS_MEASUREMENT_REQUIREMENT, PROCESS_DOCUMENT_EVIDENCE, PROCESS_INTERFACE, and PROCESS_GOVERNANCE_RECORD. Process area is consolidated into process unit. Process phase is a classification, not an object. Balance and calculation kinds are evidence classes. Depressuring is a relief-scenario class. Requirements, assumptions, decisions, and evidence references are governed record types.

## Truth and evidence boundaries

A process stream is not a piping line, and stream identity is not line identity. A stream may reference an exact D5 line later. That reference does not transfer D5 authority. A process service is not a piping service and does not auto-create one. A process condition is not a piping design condition. A process-source condition is not an adopted piping design condition. D6 does not create that adoption. A process equipment duty is not mechanical equipment design and is not a validated mechanical selection. Process control intent is not I&C design. A measurement requirement is not instrument design. A setpoint context is not a validated control configuration. A process electrical requirement is not electrical design. Calculation evidence is not a validated process design and is not code conformance. A relief scenario is not relief-device design. A relief requirement is not a validated device selection. A hazard finding is not an approved safeguard. Process-safety context is not functional-safety validation. A process document is not process identity. A process diagram is not a validated process design.

## Governance reuse

Identity, currentness, digital thread, fingerprint, requirements, assumptions, decisions, and change reuse the canonical EOS mechanisms. No parallel engine is created. Exact revision references are required. Explicit lineage is required. Inferred lineage and historical auto-repoint are not allowed. A source requirement is not an adopted process requirement. An assumption is not a validated fact. An AI recommendation is not a process engineering decision. Review and validation governance are defined and have no runtime. A reviewed record is not validated. A validated record is not conformant, approved, or certified.

## Interfaces and D9

The D4 interface reuses the existing Mechanical future process contract and adds utility and process-side package subjects. The D5 interface uses the existing D5-R8 future contract subjects and does not replace that contract. D7 and D8 interfaces are future Process-side requirements only. No direct D1, D2, or D3 interface is defined. No interface validates counterpart engineering or transfers authority. Integration counts are zero. The future D9 source contract exposes existing Process truth only. Its runtime count is zero. D9 integration is zero. D9 runtime is unstarted at count zero. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation are zero.

## Phase decomposition

The canonical phase count is 12, the length of the Process sequence. The phases are EOS-D6-R1-PROCESS-IDENTITY-AND-OBJECT-FOUNDATION, EOS-D6-R2-PROCESS-SYSTEM-STREAM-AND-SERVICE-CONTEXT, EOS-D6-R3-OPERATING-AND-DESIGN-BASIS-AND-CONDITIONS, EOS-D6-R4-PROCESS-EVIDENCE-AND-BALANCES, EOS-D6-R5-EQUIPMENT-DUTY-AND-UTILITY-CONTEXT, EOS-D6-R6-PROCESS-SAFETY-AND-RELIEF-CONTEXT, EOS-D6-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE, EOS-D6-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS, EOS-D6-R9-REVIEW-AND-VALIDATION-GOVERNANCE, EOS-D6-R10-CURRENTNESS-AND-DIGITAL-THREAD, EOS-D6-R11-D9-SOURCE-CONTRACT, and EOS-D6-R12-PROCESS-BOUNDED-CLOSEOUT.

## Runtime

D6 runtime is not started. D6 runtime count is 0. Identity, system stream and service, design basis and condition, evidence, equipment duty, process safety and relief, requirements, interfaces, review and validation, currentness, and the D9 source contract runtime counts are 0. Every Process calculation runtime is 0. Automatic calculation, redesign, validation, conformance, approval, and certification counts are 0. D7 and D8 are not started. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. The Engineering OS suite passed 343 files and 1846 tests. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Failure count is 2 and root cause count is 1. Hosted RLS passed with 2 tests and 1 skipped. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 159, and the ledger returned ok.

## Preservation

D1 remains incomplete and is not reopened. D2, D3, D4, and D5 remain complete bounded with limitations and are not reopened. D6 is not engineering-validated, conformant, approved, certified, or generally available.

## Next phase

The next phase is EOS-D6-R1-PROCESS-IDENTITY-AND-OBJECT-FOUNDATION, type PROCESS_IDENTITY_AND_OBJECT_FOUNDATION. Its scope is to implement exact governed Process identities and the canonical Process object taxonomy with tenant, workspace, and project scope, lifecycle and maturity, provenance, canonical currentness, and the canonical fingerprint. It must not implement system, stream, or service technical context, operating or design conditions, calculation evidence, equipment duty, process-safety context, requirements, interfaces, review, the D9 source contract, or any Process calculation. This closeout names that phase and does not start it.
