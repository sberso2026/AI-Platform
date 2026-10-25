# EOS-D8-R10 Currentness and Digital Thread Closeout

## Purpose

D8-R10 implements exactly one new Instrumentation and Control runtime: exact-revision currentness, lineage, fingerprint verification, and explicit digital-thread relationships. The live D8 runtime count is 10. The live dedicated currentness and digital-thread runtime count is 1 and that runtime is ready. Architecture runtime counts remain 0, including the architecture dedicated-currentness count. D8-R10 does not mark the Instrumentation and Control discipline complete. D6 and D7 remain COMPLETE_BOUNDED_WITH_LIMITATIONS and are not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D9 remains unstarted. R11 remains unstarted.

## Exact R1 through R9 reuse

Every currentness mark, lineage edge, thread relationship, and supersession binds to an exact R1 context and an exact subject revision from R1 through R9. Subject kinds are identity, measurement, instrument or device, signal, I/O, control loop, control system, safety context, requirement, assumption, engineering decision, change, reassessment, discipline handoff, review, finding, and validation record. Floating revisions are rejected. A wrong fingerprint is rejected and is not repaired. R10 does not rewrite R1 identity, R2 measurement and tag context, R3 instrument and device context, R4 signal, I/O, and loop context, R5 control-system context, R6 safety context, R7 change governance, R8 handoffs, or R9 review and validation records.

## Canonical currentness, thread, and fingerprint

R10 reuses the canonical currentness states, the canonical governed-relation check, canonical relation semantics, the canonical thread depth, and the canonical fingerprint algorithm. No parallel I&C currentness engine, no parallel digital thread, and no second fingerprint algorithm are created.

## Exact revision currentness

Current, stale, and superseded are supported as governed states. A transition requires an explicit source basis, provenance, applicability, and limitations. Stale and reassessment-required transitions also require a current R7 change whose explicit dependencies cover the cited revision. Currentness is not inferred from semantic similarity or from tag similarity. Current is not validated, approved, or conformant. Stale is not invalid. Superseded is not invalid.

## Lineage

Revision lineage is an explicit predecessor and successor pair. Both revisions are exact. The successor is required when a lineage or supersession record is written. Inferred lineage is rejected, including inference from a name, a tag, document proximity, or semantic similarity. Lineage is not validation, approval, or engineering authority. A self-link and a duplicate edge are rejected. Replay of the same identifier and fingerprint returns the existing edge.

## Fingerprint verification

Verification compares the supplied fingerprint with the stored exact revision. A match is not validation, approval, or conformance. A mismatch throws and does not write, repair, or rebaseline the stored fingerprint. AI cannot rebaseline a fingerprint. Admin cannot rebaseline a fingerprint without governance, and R10 provides no such override.

## Historical references

History is appended. Supersession records that a predecessor is superseded for thread exposure and does not rewrite existing edge endpoints, does not change the predecessor record, and does not invalidate the prior revision. Historical references are not auto-repointed. Silent mutation of R1 through R9 is rejected.

## R7 change and reassessment currentness

A governed change can support a stale or reassessment-required mark only for a record the change explicitly depends on, or for a later record bound to that same object revision when the caller names that change. An unrelated record is not marked stale. The change does not repoint historical references. Reassessment required is a separate governed mark. It is not stale and it is not validation. Reassessment completed is not current and is not validated. A completed reassessment cannot be cited to mark the revision current. The change and reassessment records are not rewritten.

## R8 handoff currentness

A handoff currentness mark requires the exact counterpart revision and fingerprint stored on the handoff. A floating counterpart reference is rejected. A mismatched counterpart fingerprint is rejected and does not repoint the handoff. A current handoff is not counterpart validated. A stale handoff is not counterpart invalid. A superseded handoff is not counterpart invalid.

## R9 review and validation currentness

A current review mark is not engineering validated. A stale review is not invalid. A superseded review is not invalid. A current validation record is not approved. A stale validation record is not validation failed. A superseded validation record is not invalid. Validation stays bound to the revision that was validated. A new revision does not inherit the prior validation or the prior approval. Supersession records validationInherited and approvalInherited as false.

## Digital-thread relationships

Thread relationships are explicit governed relations between exact revisions. They carry provenance, source basis, applicability, and limitations. They do not transfer engineering authority, adopt a requirement, validate, or approve. Linking records does not create a new engineering fact. Inference from a name, a tag, document proximity, semantic similarity, or an AI actor is rejected. AI does not create an authoritative thread relationship.

## Source, provenance, applicability, and scope

Source basis and provenance are required and stored. Applicability must name the cited subject. Limitations are required. A transition is not propagated outside that applicability. Tenant, workspace, and project scope are enforced. Cross-tenant access is rejected.

## Authority and non-authority

Instrumentation and Control is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Electrical authority. R10 does not mutate those counterpart records. AI and admin are not I&C engineering authority. AI cannot mark a record current without a governed basis, cannot invent lineage, and cannot promote currentness to validation. Admin cannot promote currentness to engineering truth.

## Zero engineering and design matrix

Automatic engineering validation remains 0, and R10 does not perform it. Conformance, approval, and certification remain 0. Instrument sizing, instrument selection, control-valve sizing, actuator sizing, control-loop tuning, control-logic design, automatic control-logic generation, SIL calculation, SIL verification, and functional-safety validation remain 0. Automatic I&C design and redesign remain 0. The D9 source contract and D9 integration remain 0. D9 remains unstarted with runtime count 0. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain 0. Thread navigation is not D9 intelligence. The canonical D8 milestone count remains 13. No database schema change. No new dependency.

## Duplicate, replay, and spoofing

Duplicate lineage and thread edges are rejected. Replay of the same identifier and fingerprint returns the existing record. A different fingerprint for the same identifier does not overwrite it. Wrong revisions, wrong historical endpoints, wrong counterpart revisions, currentness spoofing, lineage spoofing, fingerprint spoofing, and scope spoofing are rejected. Historical auto-repoint and unauthorized fingerprint rebaseline are rejected.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 379 files and 1882 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid@8.3.2 through exceljs@4.4.0. Release governance tests passed at 195, and the ledger returned ok. No schema change. No new dependency.

## Known limitations

R10 governs exact-revision currentness, explicit lineage, fingerprint verification, and explicit digital-thread relationships. A current record is not validated, approved, or conformant. A fingerprint match is not approval. Lineage and a thread relationship do not transfer engineering authority. A current handoff is not counterpart validated. A current review is not engineering validated. A current validation record is not approved. A new revision does not inherit validation or approval. Historical references stay on the cited revision. Later phases remain named and unstarted.

## Next phase

The next phase is EOS-D8-R11-D9-SOURCE-CONTRACT, type D9_SOURCE_CONTRACT. Its scope is to implement the read-only D8 source contract for future D9 cross-discipline intelligence. The contract may expose governed D8 facts and relationships from exact R1 through R10 revisions, including identities, measurement and tag context, instruments and devices, signals, I/O and loops, control-system context, safety, interlock and shutdown context, requirements, assumptions and decisions, changes and reassessments, interfaces and handoffs, review and validation governance, currentness, lineage, provenance, and limitations. D9 source contract is not D9 runtime. D9 read access does not transfer D8 authority. The source contract does not create a new engineering fact, derived value, requirement, assumption, engineering decision, or recommendation. D9 remains unstarted. Do not perform cross-discipline reasoning, conflict detection, conflict resolution, or recommendations during R11. This closeout names that phase and does not start it.
