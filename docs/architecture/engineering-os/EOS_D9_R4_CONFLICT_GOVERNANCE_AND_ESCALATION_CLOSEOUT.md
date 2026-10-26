# EOS-D9-R4 Conflict Governance and Escalation

## R1-R3 exact-revision reuse

D9-R4 is the fourth D9 runtime. Every governance record binds to an exact D9-R3 candidate fingerprint, the exact D9-R1 source revisions named on that candidate, and the exact D9-R2 observation fingerprint. A floating candidate reference is rejected. A source or observation revision that does not match the candidate is rejected. The read-model count stays 1. The observation count stays 1. The conflict-detection count stays 1. The R3 historical runtime count stays 3, and the R3 escalation count stays 0. R3 did not start R4. The live D9 runtime count is 4.

## Candidate governance lifecycle

A governance record has an identity, an action, a derived status, the candidate identity and fingerprint, both source endpoints, the observation identity and fingerprint, the human authority, optional owner, optional responsible discipline, confirmation status, escalation fields, disposition, closure status, evidence, rationale, source basis, provenance, applicability, limitations, the D1 posture, cited currentness, explicit thread links, lineage, scope, and fingerprint. The candidate record itself is not rewritten.

## Candidate review

Review is a separate action. It requires the human recorder. A reviewed record stays unconfirmed. Review is not confirmation and is not resolution.

## Conflict confirmation semantics

Confirmation status is supported as an explicit human action. A confirmed governance status is not conflict resolution, engineering validation, or approval. The R3 candidate remains unconfirmed. Confirmation does not promote the candidate object into a confirmed engineering conflict.

## Confirmation authority

Confirmation requires the governance recorder and a human authority identity that matches the actor. The confirmation basis must cite that human authority, both source contracts, and the evidence. AI cannot confirm. Admin authority cannot confirm.

## Ownership and responsible discipline

Ownership requires an explicit owner identity. That owner is not source-discipline authority. Responsible discipline must be one of the two source disciplines already named on the candidate. The assignment is context. It is not an engineering decision and it does not transfer authority.

## Escalation semantics

Escalation records a reason, a human recipient, a required inspection action, and an informational severity context. An escalation is not an engineering decision, an approval, conflict resolution, or engineering validation. Severity context is not an approved priority. An AI suggestion is non-authoritative and is not stored as an escalation.

## Disposition

Disposition is ACKNOWLEDGED, HELD, or RETURNED_FOR_EVIDENCE. Disposition is not an engineering decision, conflict resolution, or approval.

## Closure governance

Closure requires the same human governance authority. A closed governance record is not engineering validation, discipline validation, approval, or conformance. Closure does not resolve the engineering conflict.

## No-resolution boundary

Conflict resolution and automatic conflict resolution counts are 0. R4 does not generate resolution engineering. A source change does not resolve or close a governance record.

## No-recommendation boundary

Recommendation count is 0. R4 does not generate an engineering recommendation or a cross-discipline recommendation. R5 has not started.

## No-decision boundary

Engineering-decision count is 0. Approval count is 0. R4 does not decide or approve. Conformance and certification counts are 0. Automatic design, redesign, and optimization counts are 0.

## D1 limitation handling

D1 still has no governed source contract and remains an incomplete pack. Every governance record copies the D1 standing limitation and records that the pack is not complete.

## Source and basis

Source basis is required and must include the candidate basis and both source basis references.

## Provenance

Provenance is required and must cite the candidate identity, both source contracts, the observation identity, and governance version D9-R4-GOVERNANCE-1.

## Applicability and limitations

Applicability must keep the candidate applicability. Limitations must include the candidate limitations, both source limitation texts, and the D1 standing limitation. The runtime does not drop them.

## Currentness

Canonical currentness states are reused. The record stores the cited currentness and the unchanged currentness of each source. A current confirmed status is not a resolved conflict. A stale confirmed status is not false. A superseded record is not invalid. No parallel currentness engine is created.

## Source and candidate change behavior

The governance record stays bound to the candidate fingerprint and source revisions used when it was recorded. A later source revision does not repoint, resolve, or close it. A later candidate does not repoint the record or reconfirm the conflict.

## Thread, lineage, and fingerprint

The canonical digital thread module and fingerprintCanonical are reused. No parallel thread and no second fingerprint algorithm are created. Thread links name the candidate, both sources, and the observation. Lineage is copied from the candidate endpoints. A supplied fingerprint that does not match is rejected and is not repaired. A fingerprint match is not confirmation, resolution, validation, or approval.

## Authority matrix

D9 is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, Electrical, or Instrumentation and Control authority. The recorder authority is D9_CONFLICT_GOVERNANCE_RECORDER. Source authority metadata stays on the endpoints.

## AI and admin boundaries

AI and admin are not D9 engineering authority. AI cannot confirm, resolve, decide, or approve. Admin cannot confirm or resolve without engineering authority, and cannot promote an escalation to approval.

## Future-runtime zero state

Dedicated currentness and digital-thread, and review validation, runtime counts are 0. R5 has not started. D9 is not complete.

## Security and release posture

The canonical security suite raw result is FAIL because the known baseline remains. Review tests are 1 failed and 21 passed across 22 files, and 1 failed, 123 passed, and 1 skipped across 125 tests. Persistence unit tests are 1 failed and 10 passed across 11 files, and 1 failed and 33 passed across 34 tests. Both failures are the existing EOS-A16D import boundary in packages/engineering-os/src/connectors/m365/eos-a16d-generic-binary-retrieval.test.ts. Known baseline failure count is 2. Known baseline root-cause count is 1. The fingerprint is unchanged. There is no new security regression. Secret scan passes with 618 files and 0 findings. Production audit metadata is 0 critical, 0 high, and 1 moderate: GHSA-w5hq-g745-h8pq on uuid 8.3.2 through exceljs 4.4.0. Release-governance tests pass: 202 tests, made of 180 classification tests, 7 recovery tests, and 15 guard tests. Release-governance typecheck passes. Release ledger integrity is ok. No schema change and no new dependency. Engineering OS tests pass: 386 files and 1893 tests. Web typecheck, pilot typecheck, and web lint pass. Pilot scoped typecheck passes with the existing isolated global debt and zero web TypeScript errors. Duplicate, replay, and scope spoofing are rejected.

## Explicit limitations

D9-R4 governs human handling of exact conflict candidates. It may record review, confirmation status, ownership, escalation, disposition, and closure. It does not resolve the engineering conflict, recommend a solution, decide, approve, validate a discipline, or mutate source truth. D1 remains incomplete. D2 through D8 remain closed. D6, D7, and D8 remain COMPLETE_BOUNDED_WITH_LIMITATIONS. EOS is not all-disciplines-complete and is not generally available.

## Next canonical phase

The next phase is EOS-D9-R5-RECOMMENDATION-SUPPORT, type RECOMMENDATION_SUPPORT. Scope: Provide bounded, evidence-traceable recommendation support for governed conflicts. A recommendation is not an engineering decision, an approval, conflict resolution, or an automatic design change. Preserve human engineering authority, exact source revisions, applicability, and limitations. Do not decide, approve, resolve a conflict, validate a discipline, or mutate a source record. R5 is named and not started.
