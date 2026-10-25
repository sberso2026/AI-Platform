# EOS-D8-R2 Process Measurement and Tag Context Closeout

## Purpose

D8-R2 implements exactly one new Instrumentation and Control runtime: governed process measurement point and tag context. The live D8 runtime count is 2. The live measurement and tag runtime count is 1. The R1 identity runtime count remains 1. Architecture runtime counts remain 0. D8-R2 does not mark the Instrumentation and Control discipline complete. D6 and D7 remain COMPLETE_BOUNDED_WITH_LIMITATIONS and are not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D9 remains unstarted.

## Exact R1 reuse

R2 reads exact R1 context and object revisions. A measurement, requirement, tag, or relationship record stores the cited object identity and fingerprint. Floating revisions are rejected. A wrong fingerprint is rejected. R2 does not rewrite R1 objects, fingerprints, or history. Superseding an R1 identity does not repoint an existing R2 record.

## Process measurement-point semantics

A measurement context cites an exact IAC_MEASUREMENT_POINT revision, a canonical measurement purpose, a canonical process-variable type, and an explicit location reference. Supported process-variable types are PRESSURE, TEMPERATURE, FLOW, LEVEL, COMPOSITION_ANALYZER, and POSITION_STATUS. The context may carry a supplied Process condition value and its supplied unit. That supplied condition is not a measured result, a validated process value, a process calculation, or a validated instrument range. R2 does not derive or estimate a process value.

## Measurement requirement semantics

A measurement requirement cites an existing measurement context, an exact R1 measurement-point revision, requirement text, and an exact D6 source revision. The requirement does not select an instrument and does not become a validated instrument design. A Process requirement reference is not I&C design and is not a validated instrument.

## Tag semantics

A tag context cites an exact R1 object revision and an explicit tag token. Tag presence is not validated I&C design and is not engineering validation. Tag relationships use the explicit kind TAG_TO_OBJECT and require the tag revision and the R1 object revision. Naming conventions, tag prefixes, document proximity, drawing position, semantic similarity, and AI interpretation are rejected. Relationships are not repointed when history changes.

## Measurement-object relationships

A measurement-point relationship uses the explicit kind MEASUREMENT_POINT_TO_OBJECT. Both endpoints are exact current R1 revisions, and the measurement context revision is exact. The relationship is not instrument selection.

## Exact D6 source revision

When a Process requirement or a supplied Process condition is referenced, R2 requires an exact source identity, an exact source revision, and a subject from the D8-0 D6 interface allowlist. Floating Process source references are rejected. The stored D6 revision is not repointed. Referencing that source is not D6 or D7 runtime integration. Both integration counts remain 0. A supplied Process condition does not become a measurement result or a validated instrument range.

## Units, source, provenance, applicability, and scope

A supplied numerical condition requires a unit. The unit is stored as supplied and is part of the fingerprint. A different unit does not silently replace the recorded unit. Authoritative context requires traceable provenance and source basis. Applicability and limitations are required. Context is not propagated outside its applicability. Tenant, workspace, and project scope are enforced. Cross-tenant access is rejected.

## Currentness, thread, fingerprint, lineage, and history

R2 reuses canonical currentness, the canonical digital thread, and the canonical fingerprint. No parallel engine, thread, or second fingerprint algorithm is created. No dedicated currentness runtime is implemented. Lineage is explicit. Replay of the same fingerprint returns the existing record. A fingerprint mismatch is rejected and is not repaired. Historical fingerprints and endpoint revisions are preserved.

## R3-R11 zero matrix

Instrument and device context remains 0. Signal, I/O, and control-loop context remains 0. Control-system architecture remains 0. Safety, interlock, and shutdown context remains 0. Requirements, assumptions, and change remains 0. Discipline interface runtime remains 0. Review and validation remains 0. Dedicated currentness runtime remains 0. D9 source-contract runtime and D9 integration remain 0. D9 remains unstarted.

## Calculation and design zero matrix

Instrument sizing, instrument selection, control-valve sizing, actuator sizing, control-loop tuning, control-logic design, automatic control-logic generation, SIL calculation, SIL verification, and functional-safety validation remain 0. R2 does not select or derive an instrument range. Automatic I&C design and redesign remain 0. Automatic validation, conformance, approval, and certification remain 0. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain 0.

## Authority boundaries

Instrumentation and Control context is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Electrical authority. AI and admin are not I&C engineering authority. AI cannot invent an authoritative process value, measurement requirement, measurement point, or tag relationship. Admin cannot promote ungoverned context into engineering truth.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 371 files and 1874 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs@4.4.0. Release governance tests passed at 187, and the ledger returned ok. No schema change. No new dependency.

## Known limitations

R2 records measurement purpose, process-variable type, supplied Process source context, tag identity, and explicit relationships. It does not establish a process value, an instrument selection, a validated range, signal or I/O design, control logic, functional-safety validation, engineering validity, code conformance, approval, or certification. Later phases remain named and unstarted.

## Next phase

The next phase is EOS-D8-R3-INSTRUMENT-AND-DEVICE-CONTEXT, type INSTRUMENT_AND_DEVICE_CONTEXT. Its scope is to implement governed instrument and device context using exact R1 identities, exact R2 measurement and tag context, and explicit upstream source revisions. Support canonical instruments and devices, supplied datasheet or vendor attributes, service context, supplied ranges and setpoints where explicitly sourced, and explicit device-to-measurement relationships. Preserve source, basis, applicability, limitations, provenance, and currentness. Do not perform instrument sizing or selection, range derivation, control-valve or actuator sizing, signal or I/O engineering, loop engineering, control-system design, alarm or interlock logic, functional-safety engineering, validation, or D9 reasoning. This closeout names that phase and does not start it.
