# EOS-D5-R10 Currentness and Digital Thread Closeout

## Purpose

R10 determines which exact Piping revisions are current and how they are traceably connected through the D5 digital thread. It preserves history and explicit lineage. It does not silently repoint records, invent relationships, change engineering truth, or promote stale review or validation evidence into current truth.

## Governed records

One runtime records an explicit lineage edge, a supersession, and a currentness mark. Every edge names exact R1-R9 revisions: identity and object, system line and service, design condition and specification, component connection and valve, route isometric spool and weld, stress support NDE and test evidence, requirement change and reassessment, interface handoff, and review finding completion and validation. The relationship is an explicit Piping link or a canonical governed relation. A candidate edge is recorded and is not used to propagate currentness. Canonical thread depth is reused.

Supersession keeps the predecessor record and its fingerprint. The predecessor is exposed as superseded. It is not deleted. Existing lineage edges keep their original endpoints. A later revision does not receive the prior review or the prior validation.

A currentness mark may be stale, superseded, or reassessment-required. Propagation follows only an explicit authoritative relationship. A reassessment-required record is not exposed as validated and is not exposed as unchanged current engineering. A stale or superseded validation is not exposed as current. The underlying validation record is not rewritten. A stale handoff is not exposed as current, and its counterpart reference is not rewritten.

## Boundaries that remain zero

R10 does not mutate a design condition, specification, component, route, evidence record, change record, interface handoff, or validation state. It does not replace an adopted condition or adopt a new specification revision. It does not infer lineage from tags, line numbers, filenames, similarity, proximity, or timestamps. Pipe sizing, hydraulics, pressure drop, wall thickness, branch reinforcement, flange rating, valve sizing, component sizing, stress, flexibility, and support-load calculation remain at count zero. Automatic routing, route optimization, clash detection, geometry solving, and automatic redesign remain at count zero. Automatic validation, conformance, approval, and certification remain at count zero. The D9 source contract and D9 integration remain at count zero. Cross-discipline reasoning remains at count zero. D6, D7, D8, and D9 remain unstarted. R11 is named and not started.

## Preservation

Canonical currentness states, digital-thread relation semantics, thread depth, and fingerprint are reused. No parallel currentness engine, digital thread, or fingerprint algorithm is created. Provenance and history are required. Scope is enforced by tenant, workspace, and project. Duplicate, replay, and spoofing controls reject a mismatched fingerprint, a floating revision, an inferred relationship, an unauthorized actor, a false second supersession, and a cross-scope reference. AI cannot infer authoritative lineage. Admin cannot silently repoint history. D1 remains incomplete and is not reopened. D2, D3, and D4 remain complete and are not reopened. Live R9 count remains 9. The R9 dedicated thread count remains 0. Live D5 runtime count is 10 on this module only. The dedicated currentness runtime count is 1. Architecture D5 runtime count remains 0. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. The Engineering OS suite passed 340 files and 1843 tests. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 156, and the ledger returned ok.

## Next phase

The next phase is EOS-D5-R11-D9-SOURCE-CONTRACT, type D9_SOURCE_CONTRACT. It implements exactly one governed D5 Piping source contract for future D9 consumption using exact R1-R10 revisions. It exposes existing governed Piping facts and metadata, including identity, system line and service context, design conditions, specifications and classes, components connections and valves, routing and fabrication, stress support and test evidence, requirements assumptions decisions and change, interfaces, review and validation, currentness, lineage, authority, limitations, provenance and fingerprint. The source contract must not create new engineering facts, derive values, perform calculations, fabricate counterparts, infer lineage, transfer engineering authority or perform D9 reasoning. D9 runtime must remain 0. This closeout does not start that phase.
