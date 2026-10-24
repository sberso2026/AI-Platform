# EOS-D5-R8 Discipline Interfaces and Handoffs Closeout

## Purpose

R8 governs what exact Piping information crosses a discipline boundary and which exact counterpart it refers to. A handoff cites that counterpart. It does not fabricate the receiving discipline's truth, transfer engineering authority, validate counterpart engineering, or become multidisciplinary reasoning.

## Governed handoffs

One runtime records a Piping interface handoff. It binds the exact R1 object, R2 line, R3 design condition, R4 component, R4 connection, R5 route, R6 evidence, and R7 requirement, assumption, decision, or change. The counterpart is an exact revision that already exists. Structural handoffs pin a D1 interface whose disciplines are structural and piping. Civil, geotechnical, and mechanical handoffs pin the corresponding identity object by its provenance revision. Support and restraint requirements, buried piping and trench context, settlement-related requirements, and nozzle or package context are handoff subjects. They are not structural design, civil design, geotechnical conclusions, or mechanical equipment design.

## Future contracts

Process, electrical, and instrumentation and control contracts name the future handoff subjects. A supplied counterpart identifier for those disciplines is rejected. A missing counterpart stays awaiting or not yet available and is not complete. Those runtimes stay unstarted.

## Currentness and change

Canonical interface statuses and canonical currentness are reused. No parallel handoff framework or currentness engine is created. A newer source or counterpart revision does not rewrite a historical handoff. Supersession keeps the prior fingerprint and the prior counterpart revision. An exact R7 change may mark a handoff stale or reassessment-required. That mark keeps the handoff fingerprint and the counterpart pin. It does not recalculate, redesign, revalidate, or repoint the counterpart, and it does not mutate R3 through R7 engineering records.

## Boundaries that remain zero

Interface completeness is not counterpart validation. Authority stays with the receiving discipline. Pipe sizing, hydraulics, pressure drop, wall thickness, branch reinforcement, flange rating, valve sizing, component sizing, stress, flexibility, and support-load calculation remain at count zero. Automatic routing, route optimization, clash detection, geometry solving, and automatic redesign remain at count zero. Review and validation governance, a dedicated currentness runtime, and the D9 source contract remain at count zero. Automatic validation, conformance, approval, and certification remain at count zero. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain at count zero. D6, D7, D8, and D9 remain unstarted. R9 is named and not started.

## Preservation

Canonical fingerprint is reused. Provenance, applicability, limitations, and history are required. Scope is enforced by tenant, workspace, and project. Duplicate, replay, and spoofing controls reject a mismatched fingerprint, a wrong or stale source revision, a wrong or stale counterpart revision, a fabricated counterpart, an inferred counterpart, an authority spoof, and a cross-scope handoff. AI and admin are not Piping engineering authority. D1 remains incomplete and is not reopened. D2, D3, and D4 remain complete and are not reopened. Live R7 count remains 7. The R7 interface runtime count remains 0. Live D5 runtime count is 8 on this module only. The discipline-interface runtime count is 1. Architecture D5 runtime count remains 0. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. The Engineering OS suite passed 338 files and 1841 tests. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 154, and the ledger returned ok.

## Next phase

The next phase is EOS-D5-R9-REVIEW-AND-VALIDATION-GOVERNANCE, type REVIEW_AND_VALIDATION_GOVERNANCE. It implements canonical Piping review and validation governance across exact R1-R8 revisions. It supports review requests, reviewer authority, findings, disposition, completion, validation basis and state, and reassessment linkage, while preserving review distinct from validation, conformance, approval, and certification. AI and admin must not become Piping reviewer authority. It does not mutate engineering records, validate counterpart engineering, perform calculations, perform cross-discipline reasoning, or start R10-R12 or D6-D9 runtime. This closeout does not start that phase.
