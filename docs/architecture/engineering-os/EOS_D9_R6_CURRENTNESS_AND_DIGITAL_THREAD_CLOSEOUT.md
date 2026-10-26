# EOS-D9-R6 Currentness and Digital Thread

## R1-R5 runtime inventory

D9-R6 is the sixth D9 runtime. The source-contract read model count stays 1 and ready. The observation count stays 1 and ready. The conflict-detection count stays 1 and ready. The conflict-governance count stays 1 and ready. The recommendation count stays 1 and ready. The R5 historical runtime count stays 5, and the R5 dedicated currentness count stays 0. R5 did not start R6. The live D9 runtime count is 6. The review and validation runtime count stays 0.

## Exact revision architecture

Every currentness assessment binds to the exact recommendation fingerprint, the exact governance fingerprint, the exact candidate fingerprint, the exact observation fingerprint, and the exact source revisions and fingerprints named on that recommendation. A floating source revision is rejected. A fingerprint that does not match is rejected and is not repaired. Historical R1-R5 records stay bound to the revisions used when they were recorded.

## Source currentness

Source currentness is copied from the manifest entries. A current source record is not engineering validated. A stale source record is not engineering invalid. The assessment does not rewrite the source entry.

## Observation currentness

Observation currentness is the cited currentness on the exact observation. A current observation is not validated. A stale observation is not false. A superseded observation is not invalid.

## Conflict-candidate currentness

Candidate currentness is the cited currentness on the exact candidate. A current candidate is not a confirmed conflict. A stale candidate is not false. A superseded candidate is not invalid. The candidate remains unconfirmed.

## Conflict-governance currentness

Governance currentness is the cited currentness on the exact governance record. A current confirmed status is not a resolved conflict. A current escalation is not an engineering decision. A current disposition is not approval. A current closure is not engineering validation. The governance record remains unresolved.

## Recommendation currentness

Recommendation currentness is the cited currentness on the exact recommendation. A current recommendation is not an engineering decision, an approval, or conflict resolution. A stale recommendation is not wrong. A superseded recommendation is not invalid. R6 does not generate or regenerate a recommendation. The recommendation count stays 1.

## Explicit dependency model

A dependency must name an existing governed record or an exact source endpoint already on the chain, together with its fingerprint and an exact revision. Inferred dependencies from names, tags, proximity, timestamps, or semantic similarity are rejected.

## Source-change behavior

A later source revision does not repoint a dependent record, recompute an observation, redetect or reconfirm a conflict, resolve a conflict, regenerate a recommendation, or revalidate a record. The assessment stays on the revisions it cited.

## Reassessment boundaries

Canonical states are CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. Reassessment required is not stale and is not a failed validation. A recorded reassessment completion is not engineering validation. Current is not validated. Stale is not invalid. Superseded is not invalid. No parallel currentness engine is created.

## Digital-thread relationship model

The canonical digital thread module is reused. No parallel thread is created. Allowed relationships are source to observation, observation to candidate, candidate to governance, governance to recommendation, source to derived record, and predecessor to successor. The relationship must match the subject or an explicit source endpoint already on the chain. A thread relationship is not engineering authority, requirement adoption, engineering validation, approval, or conflict resolution.

## Explicit lineage

Lineage must match a predecessor and successor already stored on a cited source entry, and the successor must be that entry's exact revision. Inferred lineage is rejected. Lineage is not validation and is not authority.

## Historical reference preservation

History is append-only. A repeated assessment identity with the same fingerprint returns the existing record. A repeated identity with a different body is rejected. Historical references are not auto-repointed. Silent mutation is rejected.

## Fingerprint and integrity

fingerprintCanonical is reused. No second fingerprint algorithm is created. A supplied fingerprint that does not match is rejected. Mismatch does not auto-repair or rebaseline the record. A fingerprint match is not validation, approval, or conflict resolution.

## Source and basis

Source basis is required and must include the recommendation basis and both source basis references.

## Provenance

Provenance is required and must cite the recommendation, governance record, candidate, observation, both source contracts, and currentness version D9-R6-CURRENTNESS-1. Provenance stripping is rejected.

## Applicability and limitations

Applicability must keep the recommendation applicability. The runtime does not propagate an assessment outside that applicability. Limitations must include the recommendation limitations, the governance limitations, both source limitation texts, and the D1 standing limitation. Limitation stripping is rejected.

## D1 limitation handling

D1 remains an incomplete pack. Every assessment copies the D1 standing limitation and records that the pack is not complete. D9 does not treat D1 as complete and does not ignore D1 limitations.

## Authority matrix

D9 is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, Electrical, or Instrumentation and Control authority. The recorder authority is D9_CURRENTNESS_THREAD_RECORDER. AI and admin are not D9 engineering authority.

## AI and admin boundaries

AI cannot mark a record current without a basis, invent lineage, or rebaseline a fingerprint. Admin cannot bypass currentness governance, invent lineage, or rebaseline a fingerprint. An AI note is non-authoritative and is not stored as an assessment.

## Zero automatic recomputation matrix

R6 does not decide, approve, resolve a conflict, validate a discipline, mutate a source, design, redesign, or optimize. Engineering-decision, conflict-resolution, automatic-resolution, conformance, approval, certification, design, redesign, and optimization counts stay 0.

## Future-runtime zero matrix

The review and validation runtime count is 0. R7 has not started. R8 remains closeout-only and unstarted. D9 is not complete.

## Duplicate, replay, and scope

A new identity with the same subject, prior state, assessed state, dependency fingerprint, and relationship is rejected as a duplicate. Cross-tenant access is rejected. Tenant, workspace, and project scope is enforced.

## Security and release posture

The canonical security suite raw result is FAIL because the known baseline remains. Review tests are 1 failed and 21 passed across 22 files, and 1 failed, 123 passed, and 1 skipped across 125 tests. Persistence unit tests are 1 failed and 10 passed across 11 files, and 1 failed and 33 passed across 34 tests. Both failures are the existing EOS-A16D import boundary in packages/engineering-os/src/connectors/m365/eos-a16d-generic-binary-retrieval.test.ts. Known baseline failure count is 2. Known baseline root-cause count is 1. The fingerprint is unchanged. There is no new security regression. The RLS guard tests in the persistence unit suite pass aside from that known boundary failure. Secret scan passes with 618 files and 0 findings. Production audit metadata is 0 critical, 0 high, and 1 moderate: GHSA-w5hq-g745-h8pq on uuid 8.3.2 through exceljs 4.4.0. Release-governance tests pass: 204 tests, made of 182 classification tests, 7 recovery tests, and 15 guard tests. Release-governance typecheck passes. Release ledger integrity is ok. No schema change and no new dependency. Engineering OS tests pass: 388 files and 1897 tests. Web typecheck, pilot typecheck, and web lint pass. Pilot scoped typecheck passes with the existing isolated global debt, IGNORE_BUILD_ERRORS_REQUIRED true, and zero web TypeScript errors. Lint exits 0 with pre-existing warnings.

## Explicit limitations

D9-R6 records explicit currentness and digital-thread relationships across exact R1-R5 revisions. Currentness, lineage, thread relationships, and fingerprint integrity are not engineering validation, authority, conflict resolution, an engineering decision, approval, conformance, certification, or a source mutation. D1 remains incomplete. D2 through D8 remain closed. D6, D7, and D8 remain COMPLETE_BOUNDED_WITH_LIMITATIONS. EOS is not all-disciplines-complete and is not generally available.

## Next canonical phase

The next phase is EOS-D9-R7-REVIEW-AND-VALIDATION-GOVERNANCE, type REVIEW_AND_VALIDATION_GOVERNANCE. Scope: Govern review and validation records over exact D9 currentness, thread, lineage, and fingerprint revisions. Review completed is not engineering validated. A closed finding is not engineering validated. D9 validation is not source-discipline validation, conformance, approval, or certification. A reviewed recommendation is not an engineering decision. A reviewed conflict is not a resolved conflict. Do not decide, approve, resolve, certify, validate a source discipline, or mutate a source record. R7 is named and not started.
