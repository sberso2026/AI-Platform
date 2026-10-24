# EOS-D6-R7 Requirements, Assumptions, and Change Closeout

## Purpose

R7 records the Process requirements, assumptions, engineering decisions, changes, supersession, and reassessment that are explicitly governed for exact Process revisions. One substantive runtime is added. The live runtime count is 7. The architecture runtime count and the architecture requirements-assumptions-change count remain 0. The R6 process-safety runtime count remains 1 and its live runtime count remains 6. The R6 re-export of the requirements-assumptions-change count remains 0. R7 does not recalculate, redesign, revalidate, approve, or infer dependencies.

## What governance governs

Every requirement, assumption, decision, change, and reassessment binds to an exact current Process identity and the exact current stream or system context for that subject. A source requirement stays distinct from an adopted Process requirement. Adoption restates the same statement and source revision under Process authority and does not flip the source record. An assumption stays unvalidated and is not a validated fact. An engineering decision requires a governed human actor, selects one alternative, and is not an AI recommendation, an admin action, or an approval. A change names its reason, source, and at least one explicit dependency at an exact current fingerprint. Reassessment records that reassessment is required or that the reassessment activity was completed. Completion is not validation, approval, or conformance. Supersession freezes the predecessor in place, keeps its fingerprint, and appends history. Canonical requirement, assumption, decision, change, currentness, digital thread, and fingerprint mechanisms are reused. No parallel engine is created.

## Boundaries that stay closed

A changed source or basis does not rewrite an adopted Process condition, a design basis, supplied evidence, a duty, a utility requirement, a safety context, identity history, or stream and system context. Explicitly linked dependents may be marked stale or reassessment-required. Unlinked records stay current. Shared tags, shared systems, document proximity, matching values, and AI interpretation do not create dependencies or staleness. Requirement changes do not update Mechanical, Piping, Electrical, or I&C engineering. Assumption changes do not recalculate Process design or invalidate every dependent. A superseded decision is not deleted and its history is not rewritten. AI and admin are not Process engineering authority. Admin cannot close a reassessment as validated. Tenant, workspace, and project scope is enforced. Provenance and source basis are required.

## Runtimes that remain zero

Discipline interfaces, review and validation, the dedicated currentness runtime, the D9 source contract, and D9 integration remain at count zero. Every Process calculation remains at count zero. Validation, conformance, approval, and certification remain zero. Cross-discipline reasoning remains zero. D7, D8, and D9 remain unstarted. D1 remains incomplete. D2 through D5 remain complete bounded and are not reopened. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. Web app typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. The Engineering OS suite passed 350 files and 1853 tests. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Failure count is 2 and root cause count is 1. Hosted RLS passed with 2 tests and 1 skipped. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 166, and the ledger returned ok.

## Next phase

The next phase is EOS-D6-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS, type DISCIPLINE_INTERFACES_AND_HANDOFFS. Its scope is to implement canonical D6 Process discipline interfaces and handoffs across exact R1-R7 revisions. Support exact governed Process-to-D4 Mechanical, D5 Piping, future D7 Electrical and future D8 I&C handoff records, plus justified D1-D3 references where canonical. Require explicit exact counterpart revisions, preserve source and counterpart authority, integrate R7 change/reassessment currentness, prohibit fabricated counterparts, inferred relationships, automatic mutation or validation of counterpart engineering, and keep D9/cross-discipline reasoning runtime at zero. This closeout names that phase and does not start it.
