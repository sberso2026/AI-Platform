# EOS-D5-0 Piping Architecture Canonicalization Closeout

## Purpose

D5-0 defines who owns Piping truth, how Piping records are identified and governed, how Piping interfaces with other disciplines, and how future Piping evidence will reach D9. It does not perform Piping design calculations, routing, stress analysis, material selection, validation, conformance determination, or multidisciplinary reasoning. D5 runtime remains zero. R1 is not started.

## Ownership and scope

D5 owns bounded Piping engineering context for plant and project piping systems assigned to Piping. Governed context is distinct from calculation runtime. In scope are Piping-owned system, line, service, design-condition, specification, component, connection, routing, support-requirement, stress-evidence, fabrication, inspection, and test records, plus requirements, assumptions, decisions, evidence, interfaces, review, currentness, lineage, and a future D9 source contract.

Out of scope are Process engineering, Mechanical equipment design, Structural support design, Civil underground and site design, Geotechnical engineering, Electrical engineering, Instrumentation and Control design, pressure-vessel Mechanical design, and multidisciplinary reasoning. Long-distance pipeline engineering has no separate canonical place in the discipline roadmap. D5 is PIPING. It is not absorbed unless a later canonical project architecture explicitly includes it.

## Taxonomy and identity

The object taxonomy is PIPING_SYSTEM_CONTEXT, PIPING_LINE, PIPING_SERVICE_CONTEXT, PIPING_DESIGN_CONDITION_CONTEXT, PIPING_SPECIFICATION_CONTEXT, PIPING_COMPONENT_CONTEXT, PIPING_VALVE_CONTEXT, PIPING_SPECIALTY_CONTEXT, PIPING_CONNECTION_CONTEXT, PIPING_ROUTE_CONTEXT, PIPING_SUPPORT_REQUIREMENT_CONTEXT, PIPING_STRESS_FLEXIBILITY_CONTEXT, PIPING_FABRICATION_CONTEXT, PIPING_TEST_INSPECTION_CONTEXT, PIPING_INTERFACE_POINT, and PIPING_GOVERNANCE_RECORD. Component kinds and drawing formats are classifications or fabrication context, not extra authoritative object types. Freeform types are not accepted. Identity reuses canonical EOS identity, currentness, digital thread, and fingerprint. No parallel identity, currentness, digital-thread, or fingerprint system is created.

## Truth boundaries

A line identity is not a Process stream. A service context is not a Process design. Line membership is not inferred. A Process condition is not a Piping design condition, and D5 does not create Process authority. A source condition is not an adopted design condition. A design condition is not a validated design. A specification reference is not code conformance. A piping class is not a validated material selection. A present component is not validated. A Mechanical nozzle context is not Piping design, and a Piping connection is not Mechanical equipment design. A route context is not clash-free, constructable, or optimized. A support requirement is not Structural design or structural adequacy. A stress result is not validated Piping design and is not Structural support validation. A heat-tracing requirement is not Electrical design. An isometric is not Piping identity. A spool document is not validated. A test requirement is not a completed test. A completed test, an NDE result, a test result, an observation, a source requirement, and vendor data are not promoted into validation, conformance, or adoption.

## Interfaces and D9

Future contracts are defined toward D1, D2, D3, D4, D6, D7, and D8. The D4 contract reuses the existing D4 future Piping subjects and extends them. Authority is not transferred. D6, D7, and D8 remain unstarted. The future D9 source contract is defined and remains at runtime count zero. It does not create engineering facts or transfer authority. Cross-discipline reasoning remains zero. D9 remains unstarted at count zero.

## Calculation zero-state and phases

Pipe sizing, hydraulics, pressure drop, wall thickness, branch reinforcement, flange rating, stress, flexibility, support load, route optimization, automatic routing, spatial clash detection, automatic redesign, automatic validation, conformance, approval, and certification remain at count zero. The canonical sequence has twelve phases, from Piping identity through Piping bounded closeout. R1 is the next phase and is not executed here.

## Preservation

D1 remains incomplete and is not reopened. D2, D3, and D4 remain complete bounded and are not reopened. Live D4 runtime remains 11. Architecture-historical D4 runtime on the D4-0 contract remains 0. D5 runtime started remains no. D5 runtime count is 0. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 330 files and 1833 tests. Web app typecheck passed. Types typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 146, and the ledger returned ok.

## Next phase

The next phase is EOS-D5-R1-PIPING-IDENTITY-AND-OBJECT-FOUNDATION, type PIPING_IDENTITY_AND_OBJECT_FOUNDATION. It implements exact governed Piping identities and the canonical object taxonomy with tenant, workspace, and project scope, lifecycle and maturity, provenance, canonical currentness, and canonical fingerprint. It does not implement line or service technical context, design conditions, specifications, components, routing, stress or support, review and validation, interfaces, the D9 source contract, or calculations. This closeout does not start that phase.
