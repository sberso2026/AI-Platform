# EOS-D5-R3 Design Conditions and Specification Context Closeout

## Purpose

R3 records which Piping design conditions, specifications, and classes have been explicitly adopted, with exact basis, authority, applicability, limitations, and units. It does not calculate those values, infer them from service context, or treat a specification or code reference as proof of adequacy or conformance.

## Design conditions

A design-condition record binds an exact R1 line revision and an exact R2 line-context revision. Design pressure, design temperature, and any supplied operating, vacuum, test, or corrosion value keep the supplied unit. Silent unit changes are rejected. A Process-source reference may be stored. It is not itself the adopted Piping design condition, and it is not adopted automatically. Explicit adoption is attributable to Piping context authority. The adopted record remains engineering input. It is not a calculated result, a validated design, or code conformance.

## Specification, class, and material

Specification context records a specification reference, piping class, descriptive material family, rating and schedule context, and a code or standard reference. Assignment must be explicit. Service name, line tag, pressure, temperature, material, document context, a neighboring line, and AI similarity do not assign a class. Applicability names the bound object, and limitations are required. The record does not propagate to another line. R2 service context may be cited by exact revision and is not mutated. A code reference is not conformance or certification. Material context is not a material-selection calculation and is not a validated material selection.

## Boundaries that remain zero

Components, routing, stress and support, test evidence, requirements, interfaces, review, a dedicated currentness runtime, and the D9 source contract remain at count zero. All Piping calculations remain at count zero, including hidden calculation. Automatic redesign, validation, conformance, approval, and certification remain at count zero. D6, D7, D8, and D9 remain unstarted.

## Preservation

Canonical currentness, fingerprint, provenance, and history are reused. A later condition supersedes the prior record in place and does not rewrite its fingerprint. D1 remains incomplete and is not reopened. D2, D3, and D4 remain complete and are not reopened. Live R1 count remains 1. Live R2 count remains 2. Live D5 runtime count is 3 on this module only. Architecture D5 runtime count remains 0. The R2 design-condition count remains 0. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. The Engineering OS suite passed 333 files and 1836 tests. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 149, and the ledger returned ok.

## Next phase

The next phase is EOS-D5-R4-COMPONENT-CONNECTION-AND-VALVE-CONTEXT, type COMPONENT_CONNECTION_AND_VALVE_CONTEXT. It implements governed Piping component, connection, valve, specialty, and equipment-connection context using exact R1-R3 identities, service, design-condition, and specification context. It preserves Mechanical equipment and nozzle authority, explicit component identity, and specification applicability. It does not calculate component sizing, pressure rating, branch reinforcement, valve sizing, or flange adequacy, and it does not implement routing, fabrication, stress, support, test evidence, review, validation, interfaces, or D9 runtime. This closeout does not start that phase.
