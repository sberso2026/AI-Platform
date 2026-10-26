# EOS-D9-R5 Recommendation Support

## Exact R1-R4 evidence chain

D9-R5 is the fifth D9 runtime. Every recommendation binds to an exact D9-R4 governance fingerprint, the exact D9-R3 candidate fingerprint named on that governance record, the exact D9-R2 observation fingerprint, and the exact D9-R1 source revisions and fingerprints. A floating conflict reference is rejected. A governance, candidate, observation, or source revision that does not match the governed record is rejected. Historical records are not auto-repointed. The read-model count stays 1. The observation count stays 1. The conflict-detection count stays 1. The governance runtime count stays 1. The R4 historical runtime count stays 4, and the R4 recommendation count stays 0. R4 did not start R5. The live D9 runtime count is 5. The architecture recommendation count stays 0.

## Recommendation record

A recommendation record has an identity, the advisory type, the recommendation version D9-R5-RECOMMENDATION-1, the governance identity and fingerprint, the candidate identity and fingerprint, the observation identity and fingerprint, both source endpoints, a statement, a rationale, evidence, assumptions, uncertainty, a confidence band, at least two alternatives with ranks, a review status, source basis, provenance, applicability, limitations, the D1 posture, cited currentness, source currentness, authority metadata, explicit thread links, lineage, tenant workspace and project scope, and a fingerprint. The record stays advisory.

## Evidence traceability

Evidence is required. It must name the governance record, the candidate, and both source contracts. Exact source revisions are required. An unsupported recommendation is rejected.

## Recommendation versus decision

A recommendation is not an engineering decision. The engineering-decision runtime count stays 0. Recording, reviewing, or accepting a recommendation does not create a decision. Canonical decision governance is reused. No parallel decision engine is created. A supplied decision identity is rejected.

## Recommendation versus approval

A recommendation is not an approval. Reviewed is not approved. Accepted as advice is not approved. A review status of APPROVED is rejected. The approval runtime count stays 0.

## Recommendation versus conflict resolution

A recommendation is not conflict resolution. The governed conflict stays governed independently. Conflict resolution and automatic conflict resolution counts stay 0. The candidate remains unconfirmed. The governance record remains unresolved.

## Recommendation versus design change

A recommendation is not an automatic design change. The runtime does not apply a recommendation, mutate a design, or create a design change. It does not adopt or change a requirement. It does not promote an assumption to a fact. Automatic design, redesign, and optimization counts stay 0.

## AI recommendation boundaries

AI may generate a non-persisted recommendation candidate. That draft must carry uncertainty, limitations, and evidence. It is not an engineering decision, an approval, conflict resolution, or a validated solution. An AI actor cannot record a recommendation. An opaque authoritative recommendation is rejected.

## Alternatives, ranking, and confidence

At least two alternatives are required. Rank is informational. The top rank is not an engineering decision and is not an approved solution. Confidence is LOW, MODERATE, or HIGH. High confidence is not engineering validation. High rank is not an approved engineering solution.

## Human review

Human review is supported. Review statuses are UNREVIEWED, REVIEWED, and ACCEPTED_AS_ADVICE. A reviewed recommendation is not an engineering decision and is not validated. An accepted recommendation is not approved engineering, not conflict resolution, and not an automatic change. An explicit decision remains separately governed.

## D1 limitation handling

D1 remains an incomplete pack. Every recommendation copies the D1 standing limitation and records that the pack is not complete. D9 does not treat D1 as complete and does not ignore D1 limitations.

## Source discipline and authority

Source discipline, source identity, and authority metadata are copied from the governed endpoints. D9 is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, Electrical, or Instrumentation and Control authority. AI and admin are not D9 engineering authority. The recorder authority is D9_RECOMMENDATION_RECORDER. Admin cannot promote a recommendation to a decision or an approval, and cannot auto-apply a recommendation.

## Source and basis

Source basis is required and must include the governance basis and both source basis references.

## Provenance

Provenance is required and must cite the governance identity, the candidate identity, the observation identity, both source contracts, and recommendation version D9-R5-RECOMMENDATION-1. Provenance stripping is rejected.

## Applicability and limitations

Applicability must keep the governance applicability. The runtime does not propagate a recommendation outside that applicability. Limitations must include the governance limitations, both source limitation texts, and the D1 standing limitation. Limitation stripping is rejected.

## Assumptions

Assumptions are required and stay explicit. An assumption is not a validated fact. Promoting an assumption to a fact is rejected.

## Currentness

Canonical currentness states are reused. The record stores the cited currentness and the unchanged currentness of each source. A current recommendation is not an engineering decision. A stale recommendation is not wrong. A superseded recommendation is not invalid. No parallel currentness engine is created.

## Source and conflict change behavior

A later source revision does not repoint, regenerate, or apply a recommendation. A later conflict or governance change does not repoint or regenerate a historical recommendation. The recommendation stays bound to the evidence used when it was recorded.

## Thread, lineage, and fingerprint

The canonical digital thread module and fingerprintCanonical are reused. No parallel thread and no second fingerprint algorithm are created. Thread links name the governance record, the candidate, both sources, and the observation. Lineage is copied from the governed source endpoints. Inferred lineage is rejected. A supplied fingerprint that does not match is rejected and is not repaired. A fingerprint match is not engineering validation and is not approval. History is append-only. Silent mutation is rejected.

## No-resolution matrix

Conflict resolution count is 0. Automatic conflict resolution count is 0. R5 does not resolve a conflict.

## No-decision matrix

Engineering-decision count is 0. Approval count is 0. Conformance count is 0. Certification count is 0. R5 does not decide, approve, validate a discipline, or certify.

## No-source-mutation matrix

R5 does not mutate Structural, Civil, Geotechnical, Mechanical, Piping, Process, Electrical, or Instrumentation and Control source records. It does not auto-validate any of those disciplines.

## Future-runtime zero matrix

The dedicated currentness and digital-thread runtime count is 0. The review and validation runtime count is 0. R6 has not started. R8 remains closeout-only and unstarted. D9 is not complete.

## Duplicate, replay, and scope

A repeated recommendation identity with the same fingerprint returns the existing record. A repeated identity with a different body is rejected as replay. A new identity with the same governance fingerprint and statement is rejected as a duplicate. Cross-tenant access is rejected. Tenant, workspace, and project scope is enforced.

## Security and release posture

The canonical security suite raw result is FAIL because the known baseline remains. Review tests are 1 failed and 21 passed across 22 files, and 1 failed, 123 passed, and 1 skipped across 125 tests. Persistence unit tests are 1 failed and 10 passed across 11 files, and 1 failed and 33 passed across 34 tests. Both failures are the existing EOS-A16D import boundary in packages/engineering-os/src/connectors/m365/eos-a16d-generic-binary-retrieval.test.ts. Known baseline failure count is 2. Known baseline root-cause count is 1. The fingerprint is unchanged. There is no new security regression. The RLS guard tests in the persistence unit suite pass aside from that known boundary failure. Secret scan passes with 618 files and 0 findings. Production audit metadata is 0 critical, 0 high, and 1 moderate: GHSA-w5hq-g745-h8pq on uuid 8.3.2 through exceljs 4.4.0. Release-governance tests pass: 203 tests, made of 181 classification tests, 7 recovery tests, and 15 guard tests. Release-governance typecheck passes. Release ledger integrity is ok. No schema change and no new dependency. Engineering OS tests pass: 387 files and 1895 tests. Web typecheck, pilot typecheck, and web lint pass. Pilot scoped typecheck passes with the existing isolated global debt, IGNORE_BUILD_ERRORS_REQUIRED true, and zero web TypeScript errors. Lint exits 0 with pre-existing warnings.

## Explicit limitations

D9-R5 records evidence-traceable advisory recommendations, including AI-generated candidate drafts and ranked alternatives. Every recommendation remains advisory. It does not become an engineering decision, an approval, conflict resolution, discipline validation, requirement adoption, an automatic design change, or a mutation of source truth. D1 remains incomplete. D2 through D8 remain closed. D6, D7, and D8 remain COMPLETE_BOUNDED_WITH_LIMITATIONS. EOS is not all-disciplines-complete and is not generally available.

## Next canonical phase

The next phase is EOS-D9-R6-CURRENTNESS-AND-DIGITAL-THREAD, type CURRENTNESS_AND_DIGITAL_THREAD. Scope: Provide a dedicated D9 currentness and digital-thread runtime over exact source, observation, conflict-candidate, governance, and recommendation revisions. Current is not validated. Stale is not invalid. Superseded is not invalid. A current conflict is not a resolved conflict. A current recommendation is not an engineering decision. A digital-thread relationship is not engineering authority. Lineage is not validation. A fingerprint match is not approval. Do not decide, approve, resolve, validate a discipline, or mutate a source record. R6 is named and not started.
