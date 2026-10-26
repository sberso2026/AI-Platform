# EOS-D8-R11 D9 Source Contract Closeout

## Purpose

D8-R11 implements exactly one new Instrumentation and Control runtime: a read-only source contract that exposes governed D8 facts for future D9 consumption. The live D8 runtime count is 11. The live D9 source-contract runtime count is 1 and that runtime is ready. D9 integration remains 0. Architecture runtime counts remain 0, including the architecture source-contract count. D8-R11 does not mark the Instrumentation and Control discipline complete. D6 and D7 remain COMPLETE_BOUNDED_WITH_LIMITATIONS and are not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D9 remains unstarted. R12 remains unstarted.

## Exact R1 through R10 reuse

Every exported contract binds to one exact R1 object revision. The projection reads the stored R1 through R10 records for that revision and does not replace them with a floating current pointer. Subject categories that may be exposed are identity, measurement and tag context, instrument and device context, signal, I/O, and control-loop context, control-system and network context, safety, interlock, and shutdown context, requirements, assumptions, engineering decisions, changes, reassessments, discipline handoffs, review requests, findings, validation governance, currentness marks, explicit lineage, explicit thread relationships, and fingerprint status. A latest, current, newest, head, active, or now revision token is rejected. A wrong object revision is rejected. R11 does not rewrite R1 identity, R2 measurement and tag context, R3 instrument and device context, R4 signal, I/O, and loop context, R5 control-system context, R6 safety context, R7 change governance, R8 handoffs, R9 review and validation records, or R10 currentness, lineage, and thread records.

## Read-only source-contract semantics

The contract is a frozen projection. It records that no engineering fact, derived value, requirement, assumption, decision, or recommendation was created. It records that D9 was not started, that no conflict was detected or resolved, and that authority was not transferred. Replay of the same contract identifier and fingerprint returns the existing contract. A second contract for the same object revision and governed contract version is rejected. A different fingerprint for the same identifier is not written over the stored contract. History is appended and is not silently rewritten.

## Exposed D8 record categories

Identity exposes the object type, exact revision, fingerprint, source basis, provenance, discipline, and recorder authority, with validated design false and no new identity created. Measurement and tag context exposes stored measurement and tag records with validated process value and validated I&C design false. Instrument and device context exposes stored device records with validated instrument selection and vendor-data project validation false. Signal, I/O, and loop context exposes stored records with validated I/O design, control logic, allocation, and tuning false. Control-system context exposes stored system and network records with validated design and cybersecurity validation false. Safety context exposes stored alarm, interlock, shutdown, functional-safety, and cause-and-effect records with functional-safety validation, SIL verification, and implemented logic false. Requirements, assumptions, and decisions are exposed as stored statements. A requirement read is not adoption. An assumption read is not a validated fact. A decision read is not approval. Changes and reassessments are exposed inside currentness. A change read is not automatic redesign. A reassessment read is not validation. Handoffs expose the stored counterpart revision and fingerprint. A handoff read is not counterpart engineering truth, counterpart validation, or authority transfer. Reviews, findings, and validation records are exposed as governance. A review read is not engineering validated. A finding read is not engineering validated. A validation-record read is not approval. Evidence is the stored validation basis, not a new evidence record.

## Exact-revision export

Authoritative export requires the exact source revision. A convenience view still carries that revision, its fingerprint, and the canonical currentness state returned by the R10 currentness function. Floating current export is not allowed. Stale is not presented as current. Superseded is not presented as current. Reassessment required is not presented as current and is not validation.

## Currentness preservation

The contract copies the governed currentness state. Current is not validated. Stale is not invalid. Superseded is not invalid. Currentness marks are exposed with engineering validation, invalidity, and approval false. The contract does not add a currentness engine.

## Lineage preservation

Lineage and thread relationships are the explicit R10 edges whose endpoints are already in the exposed set. Each edge keeps its exact source and target revisions. Inferred lineage is rejected. Inference from a name, a tag, document proximity, or semantic similarity is rejected. Lineage is not engineering authority. A thread relationship does not adopt a requirement.

## Provenance

The D9-facing contract keeps source identity, the exact revision, the source basis, and the contract provenance. Stripping provenance is rejected.

## Applicability and limitations

Applicability is preserved and is limited to statements that name the contracted object. Limitations from the object and the exposed records are preserved, together with the standing limitation that the contract does not create facts, derive values, infer relationships, transfer authority, or start D9. Stripping limitations or applicability is rejected. The contract does not propagate a record outside its applicability.

## Source and basis

Source basis is required on every exposed item and remains traceable to the stored R1 through R10 record. A reassessment traces its basis through the explicit change it cites. The contract does not invent a basis.

## Authority preservation

The contract preserves recorder authority and states that D9 read access is not D8 engineering authority and is not counterpart engineering authority. D9 is not I&C engineering authority. Instrumentation and Control is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Electrical authority. AI and admin are not I&C engineering authority. AI cannot invent an authoritative source fact or relationship and cannot promote read access to engineering authority. Admin cannot bypass the authority boundary. Reviewer, validation, D9, and I&C engineering authority tokens are rejected as spoofing.

## No-new-fact matrix

The contract creates no new engineering fact, derived value, requirement, assumption, engineering decision, or recommendation. Creating any of those from the contract is rejected.

## No-derivation matrix

The contract performs no engineering derivation and no numeric derivation. It does not infer a missing engineering value. A supplied expression is rejected.

## D9 zero-runtime matrix

D9 runtime started remains false. D9 runtime count remains 0. D9 integration remains 0. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain 0. The contract does not start D9.

## No conflict or recommendation matrix

Cross-discipline conflict detection, conflict resolution, cross-discipline recommendation, and engineering recommendation are rejected. The contract may expose facts a future D9 runtime could read. It does not compare disciplines.

## Mutation boundaries

The contract does not mutate R1 through R10. It does not mutate Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Electrical records. A caller request to mutate upstream or a counterpart is rejected. The upstream snapshot is compared after the contract is stored.

## Validation, conformance, approval, and certification

Automatic engineering validation remains 0. The contract does not validate, and it does not promote a source or a current record to validated. Conformance, approval, and certification remain 0. Instrument sizing, instrument selection, control-valve sizing, actuator sizing, control-loop tuning, control-logic design, automatic control-logic generation, SIL calculation, SIL verification, and functional-safety validation remain 0. Automatic I&C design and redesign remain 0.

## Contract version, fingerprint, and history

The contract version is the governed D8-D9-SOURCE-CONTRACT-1 token bound to the existing architecture field list. No parallel contract-version engine is created. The projection fingerprint uses the canonical fingerprint function. A mismatch is rejected and is not repaired or rebaselined. History records creation and is not silently mutated. Duplicate contracts, replay with a different fingerprint, wrong revisions, currentness spoofing, lineage spoofing, provenance spoofing, authority spoofing, source-basis spoofing, limitation stripping, applicability stripping, validation-state spoofing, fingerprint spoofing, and historical auto-repoint are rejected. Tenant, workspace, and project scope are enforced. Cross-tenant access is rejected.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 380 files and 1883 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid@8.3.2 through exceljs@4.4.0. Release governance tests passed at 196, classification 174, recovery 7, and guard 15. The ledger returned ok. No schema change. No new dependency.

## Known limitations

R11 exposes governed Instrumentation and Control facts through a read-only, exact-revision source contract. It does not create engineering truth, transfer authority, mutate source records, start D9, detect or resolve cross-discipline conflicts, or generate recommendations. A current record is not validated. A fingerprint match is not approval. A lineage or thread read is not engineering authority. A handoff read is not counterpart truth. A review or finding read is not engineering validated. A validation-record read is not approval. Later phases remain named and unstarted.

## Next phase

The next phase is EOS-D8-R12-INSTRUMENTATION-CONTROL-BOUNDED-CLOSEOUT, type INSTRUMENTATION_CONTROL_BOUNDED_CLOSEOUT. Its scope is the bounded D8 closeout over D8-0 and R1 through R11. That closeout must verify the canonical milestone count of 13, that R1 through R11 substantive runtimes are ready, that the substantive runtime count is 11, and that R12 adds no engineering runtime. It must preserve zero I&C calculation and design automation, zero D9 runtime, a read-only D9 source contract, authority boundaries, canonical currentness, thread, and fingerprint, and review and validation truth boundaries. Limitations must stay explicit. D8 may be marked complete only as COMPLETE_BOUNDED_WITH_LIMITATIONS if those gates pass. That closeout must not claim engineering conformance, approval, certification, regulatory approval, automatic functional-safety validation, D9 completion, or EOS GA readiness. This closeout names that phase and does not start it.
