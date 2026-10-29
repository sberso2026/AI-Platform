# EOS-D6-R3 Operating and Design Basis and Conditions Closeout

## Purpose

R3 records the Process operating cases, design cases, Process design basis, operating conditions, and design conditions that are explicitly known for exact Process revisions. One substantive runtime is added. The live runtime count is 3. The architecture runtime count and the architecture design-basis condition count remain 0. The R2 system-stream-service runtime count remains 2. The R1 identity runtime count remains 1. R3 does not calculate, infer, or derive engineering values.

## What context governs

Every R3 record binds to an exact current R1 Process identity and, where the subject is a stream or system, an exact current R2 context revision. An operating-case record names the case, type, scope, source, applicability, and limitations. A design-case record does the same for a design case. A design-basis record carries a supplied statement, source document, optional exact case linkages, and an explicit assumption only when one is governed. Operating and design conditions carry a supplied quantity, role, value, and unit, bound to one explicit current case record. Adoption is a separate governed record that restates the same value and unit. Supplied property values may be recorded with source and units. Canonical currentness, digital thread, and fingerprint are reused. No parallel engine is created.

## Boundaries that stay closed

An operating case is not a calculated condition or a validated Process design. A design case is not a calculated design or a validated design. A design basis is not validated Process design or code conformance. A design condition is not a validated Process design and is not a Piping design condition. A supplied condition is not an adopted condition, and adoption is never automatic. Operating conditions are not promoted into design conditions. Units stay as supplied. Missing values are not derived, interpolated, estimated, or normalized into engineering truth. A Process condition does not create or write a D5 adopted Piping design condition, and a cited D5 line must be the exact revision already bound on the R2 stream. Fluid, phase, and composition citations reuse exact R2 records and do not calculate composition, equilibrium, or thermodynamics. A supplied property is not a validated property model. Conditions do not propagate outside their stated applicability. Case-condition relationships are explicit. History is preserved by supersession. AI and admin are not Process engineering authority.

## Runtimes that remain zero

Process evidence, equipment duty, process safety and relief, requirements, interfaces, review, the dedicated currentness runtime, the D9 source contract, and D9 integration remain at count zero. Every Process calculation, mass balance, energy balance, hydraulic, pressure drop, duty, relief, depressuring, utility, automatic redesign, validation, conformance, approval, and certification count remains zero. Cross-discipline reasoning remains zero. D7, D8, and D9 remain unstarted. D1 remains incomplete. D2 through D5 remain complete bounded and are not reopened. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. Web app typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. The Engineering OS suite passed 346 files and 1849 tests. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Failure count is 2 and root cause count is 1. Hosted RLS passed with 2 tests and 1 skipped. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 162, and the ledger returned ok.

## Next phase

The next phase is EOS-D6-R4-PROCESS-EVIDENCE-AND-BALANCES, type PROCESS_EVIDENCE_AND_BALANCES. Its scope is to implement governed Process calculation evidence and balance context using exact R1-R3 revisions. Support externally produced or explicitly supplied mass-balance, energy-balance, hydraulic, pressure-drop, thermodynamic/property and related Process calculation evidence, including exact case references, values, units, source tools, assumptions, applicability, limitations and provenance, without implementing those calculations inside EOS or promoting evidence into validation, conformance or approval. This closeout names that phase and does not start it.
