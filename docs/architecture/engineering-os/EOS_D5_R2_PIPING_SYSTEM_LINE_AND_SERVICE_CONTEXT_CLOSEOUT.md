# EOS-D5-R2 Piping System, Line, and Service Context Closeout

## Purpose

R2 records descriptive Piping system, line, and service or function context on exact R1 identity revisions. It explains what a system or line is and what service or function it represents. It does not turn that description into Process design, Piping design conditions, specifications, component engineering, routing, stress or support, testing, or calculated engineering truth.

## Context

System context records a name, description, classification, function, grouping, scope, source basis, limitations, and provenance. Line context records a tag, description, classification, function, scope, source basis, and provenance against an exact line revision. Service context records a governed function and description against an exact service identity. A supplied Process source reference stays source context. It does not create an authoritative Process condition and it does not adopt a Piping design condition.

## Membership and association

System and line membership is an explicit relationship between exact line and system revisions. Line and service association is an explicit relationship between exact line and service revisions. Tag patterns, naming similarity, document location, a common service name, a common vendor, drawing proximity, semantic similarity, and AI inference are rejected. Similar tags do not create membership.

## Boundaries that remain zero

Design conditions and specifications, components and valves, routing and fabrication, stress, support, and test evidence, requirements and change, interfaces, review and validation, a dedicated currentness runtime, and the D9 source contract remain at count zero. All Piping calculations remain at count zero. Cross-discipline reasoning remains zero. D6, D7, D8, and D9 remain unstarted.

## Preservation

Canonical currentness, fingerprint, provenance, and history are reused. Historical context is superseded in place and is not repointed. D1 remains incomplete and is not reopened. D2, D3, and D4 remain complete and are not reopened. Live R1 runtime count remains 1. Live D5 runtime count is 2 on this module only. Architecture D5 runtime count remains 0. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. The Engineering OS suite passed 332 files and 1835 tests. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 148, and the ledger returned ok.

## Next phase

The next phase is EOS-D5-R3-DESIGN-CONDITIONS-AND-SPECIFICATION-CONTEXT, type DESIGN_CONDITIONS_AND_SPECIFICATION_CONTEXT. It implements governed Piping design-condition and specification or class context using exact R1-R2 identities and explicit source basis. It preserves the distinction between Process-source conditions and adopted Piping design conditions, specification references and code conformance, and material or class context and validated material selection. It does not perform sizing, hydraulics, wall thickness, flange rating, or other calculations, and it does not implement components, routing, stress or support, review or validation, interfaces, or D9 runtime. This closeout does not start that phase.
