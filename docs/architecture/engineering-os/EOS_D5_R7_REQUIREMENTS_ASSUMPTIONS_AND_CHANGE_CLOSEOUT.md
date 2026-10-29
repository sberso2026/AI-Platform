# EOS-D5-R7 Requirements Assumptions and Change Closeout

## Purpose

R7 governs what Piping requires, assumes, decides, changes, and must reassess. A change may invalidate currentness or create a reassessment obligation. It does not silently perform the engineering work needed to resolve that change.

## Governed records

A requirement, assumption, decision, change, reassessment, or currentness mark binds the exact R1 object, R2 line, R3 design condition, R4 component, R4 connection, R5 route, and R6 evidence revision. Source requirements stay unadopted until an explicit adoption rationale is recorded. A vendor requirement is not adopted by being cited. An assumption stays unvalidated. An engineering decision records a human context-authority choice and is not an AI recommendation, an admin action, or engineering validation. A change names an allowlisted category, a reason, and at least one explicit dependency whose target revision already exists. Tag similarity, shared line or system membership, geometry proximity, component adjacency, document co-occurrence, semantic similarity, and AI inference are rejected.

## What a change may do

Supersession keeps the prior record, its fingerprint, and its history. The prior record is not deleted and is not treated as invalid. Reassessment may be required or completed. Neither state is invalidation, recalculation, redesign, validation, or approval. An explicit dependency may receive a governed stale or reassessment-required mark. That mark stores the upstream fingerprint and does not rewrite the upstream record, its values, its units, its specification, its piping class, its component, its route, its isometric, its spool, or its NDE or test evidence.

## Boundaries that remain zero

R7 does not recalculate design conditions, stress, flexibility, or support loads. It does not change a specification or piping class, reselect or replace a component or valve, reroute piping, change geometry, or regenerate an isometric or spool. It does not rewrite NDE or test results or revalidate external evidence. Pipe sizing, hydraulics, pressure drop, wall thickness, branch reinforcement, flange rating, valve sizing, and component sizing remain at count zero. Automatic routing, route optimization, clash detection, and geometry solving remain at count zero. Discipline interfaces, review and validation governance, a dedicated currentness runtime, and the D9 source contract remain at count zero. Automatic redesign, validation, conformance, approval, and certification remain at count zero. Cross-discipline reasoning remains at count zero. D6, D7, D8, and D9 remain unstarted. R8 is named and not started.

## Preservation

Canonical requirement, assumption, decision, and change governance are reused. No parallel engine is created. Canonical currentness and fingerprint are reused. Provenance, applicability, limitations, and history are required. Scope is enforced by tenant, workspace, and project. Duplicate, replay, and spoofing controls reject a mismatched fingerprint, a wrong R1-R6 revision, an inferred dependency, an invented assumption, and a cross-scope reference. AI and admin authority cannot invent an assumption, record an engineering decision, or close reassessment as validated. D1 remains incomplete and is not reopened. D2, D3, and D4 remain complete and are not reopened. Live R5 count remains 5. Live R6 count remains 6. The R6 change runtime count remains 0. Live D5 runtime count is 7 on this module only. Architecture D5 runtime count remains 0. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. The Engineering OS suite passed 337 files and 1840 tests. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 153, and the ledger returned ok.

## Next phase

The next phase is EOS-D5-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS, type DISCIPLINE_INTERFACES_AND_HANDOFFS. It implements governed D5 Piping discipline interfaces and handoffs using exact R1-R7 revisions. It supports exact counterpart references and bounded handoffs with D1 Structural, D2 Civil, D3 Geotechnical, and D4 Mechanical, plus future contracts for D6 Process, D7 Electrical, and D8 Instrumentation and Control. It preserves discipline authority, currentness, limitations, and explicit counterpart semantics. It does not validate counterpart engineering, infer missing counterparts, transfer authority, recalculate or redesign Piping, perform cross-discipline reasoning, or start D6-D9 runtime. This closeout does not start that phase.
