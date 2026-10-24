# EOS-D5-R4 Component Connection and Valve Context Closeout

## Purpose

R4 records which Piping components, valves, specialties, and connections exist and how they are explicitly associated with governed lines, specifications, and equipment interfaces. It does not turn recorded component data into calculated sizing, pressure adequacy, branch reinforcement, valve selection, flange adequacy, or Mechanical counterpart validation.

## Component, valve, and specialty context

Each component record binds an exact R1 component identity, an exact R2 line revision, and an exact R3 specification or class revision. Component identity is supplied. Drawing proximity, line graphics, neighboring text, tag similarity, BOM adjacency, AI semantic matching, and a shared vendor do not create identity. Supplied size, material, and rating context are stored as given. They are not calculated size or calculated pressure rating. Specification applicability does not mean the component is adequate, and a class reference does not mean the component is validated. A component being present does not mean it is engineering-validated. Branch-connection context does not calculate reinforcement and does not assert a code-compliant branch. Flange context does not assert flange adequacy or code conformance. Valve context may record tag, type, supplied size and rating, actuation context, and a supplied fail position. It is not valve sizing, process-control design, validated valve selection, electrical design, or instrumentation and control design. Specialty context records a supplied specialty item and does not imply engineering adequacy. Automatic component, valve, and specialty selection is rejected.

## Connections and Mechanical counterparts

Connection records require an explicit relationship between exact revisions. Geometry and proximity do not create a connection. Connection context is not connection adequacy and is not stress validation. An equipment connection may cite an exact governed D4 equipment or interface revision. If that counterpart is absent, the limitation is recorded and no Mechanical object is fabricated. A Piping connection does not become Mechanical equipment design, and a Mechanical nozzle context does not become Piping design. D5 does not take D4, D7, or D8 authority.

## Boundaries that remain zero

Routing and fabrication, stress and support, test evidence, requirements, discipline interfaces, review, a dedicated currentness runtime, and the D9 source contract remain at count zero. Pipe sizing, hydraulics, pressure drop, wall thickness, branch reinforcement, flange rating, valve sizing, component sizing, stress, flexibility, and support-load calculations remain at count zero, including hidden calculation. Automatic redesign, validation, conformance, approval, and certification remain at count zero. Cross-discipline reasoning remains at count zero. D6, D7, D8, and D9 remain unstarted. R5 is named and not started.

## Preservation

Canonical currentness and fingerprint are reused. Source and basis are required and traceable. Applicability and limitations are explicit and are not propagated to another object. Provenance and history are preserved. Superseding a component keeps the prior fingerprint. Duplicate, replay, and spoofing controls reject a mismatched fingerprint, a wrong line, specification, or equipment revision, an inferred connection, a fabricated counterpart, and a cross-scope reference. AI and admin authority cannot invent a component, connection, or valve or promote a candidate to engineering truth. D1 remains incomplete and is not reopened. D2, D3, and D4 remain complete and are not reopened. Live R1 count remains 1. Live R2 count remains 2. Live R3 count remains 3. The R3 component runtime count remains 0. Live D5 runtime count is 4 on this module only. Architecture D5 runtime count remains 0. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. The Engineering OS suite passed 334 files and 1837 tests. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 150, and the ledger returned ok.

## Next phase

The next phase is EOS-D5-R5-ROUTING-ARRANGEMENT-AND-FABRICATION-CONTEXT, type ROUTING_ARRANGEMENT_AND_FABRICATION_CONTEXT. It implements governed Piping routing, arrangement, fabrication, isometric, spool and weld/joint context using exact R1-R4 revisions. It records supplied or adopted route constraints, slopes, elevations, arrangement context, and fabrication evidence without automatic routing, geometry solving, clash detection, constructability determination, stress analysis, or multidisciplinary optimization. It preserves explicit connection and component relationships and Mechanical access and maintenance boundaries. This closeout does not start that phase.
