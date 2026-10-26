# EOS-D9-R3 Conflict Candidate Detection

## Exact R1 manifest reuse

D9-R3 is the third D9 runtime. Every candidate names source revisions that are still present on the governed D9-R1 source revision manifest, matched by contract identity, exact revision, and canonical fingerprint. A revision that is not on the manifest is rejected. The read-model runtime count stays 1 and remains ready. The R1 historical runtime count stays 1.

## Exact R2 observation reuse

A candidate must cite an explicit D9-R2 observation by identity and fingerprint. The observation runtime count stays 1 and remains ready. The R2 historical runtime count stays 2, and the R2 conflict-detection count stays 0. R2 did not start R3. The live D9 runtime count is 3.

## Candidate record model

A candidate has an identity, a canonical conflict class, a detection rule and detection version, both source endpoints, the exact observation identity and fingerprint, the detected inconsistency, uncertainty, a confidence band, a severity context, source basis, provenance, applicability, limitations, the D1 posture limitation, cited currentness, explicit thread links, lineage, authority metadata, scope, and fingerprint. It is not a confirmed engineering conflict, an engineering fact, an escalation, a recommendation, an engineering decision, or an approval.

## Canonical conflict taxonomy

Detection reuses D9_CONFLICT_CLASSES from the D9-0 architecture. The two active rules use CURRENTNESS_MISMATCH and SOURCE_REVISION_MISMATCH. No parallel taxonomy is created. A caller cannot substitute a different class for the class bound to the rule.

## Detection basis and rule semantics

Detection version D9-R3-DETECTION-1 has two explicit rules. EXPLICIT_DIFFERENCE_CURRENTNESS_STATE records a candidate only when an explicit-difference observation has two different source currentness tokens. EXPLICIT_RELATIONSHIP_REVISION_BINDING records a candidate only when an explicit-relationship observation cites a governed relationship whose revisions do not match the observation endpoints. If the rule predicate is false, no candidate is stored. The comparison is a token check. It is not an engineering calculation and it is not engineering validation.

## Exact revision semantics

The caller must supply both contract identities, both exact revisions, and both source fingerprints. Those values must match the observation endpoints and the manifest. Floating revisions are rejected. The candidate does not follow a source or an observation to a newer revision.

## D1 limitation handling

D1 still has no governed source contract and remains an incomplete pack. Every candidate copies the D1 standing limitation and records that the pack is not complete. D1 cannot be used as an exact-revision endpoint.

## Candidate versus confirmed conflict

Detection is provisional. confirmedConflict, engineeringFact, escalation, recommendation, engineeringDecision, approved, validated, and resolved stay false on the record. A fingerprint match does not confirm, validate, or approve the candidate.

## Uncertainty and confidence

Uncertainty text is required. Confidence bands are LOW, MODERATE, and HIGH. A high-confidence candidate is not a confirmed conflict. Low uncertainty is not engineering validation. An AI-assisted marker may be stored, and that proposal remains non-authoritative.

## Severity and classification

Severity context is INFORMATIONAL or REVIEW_CONTEXT. Severity is not an approved engineering priority and is not an escalation. A severity value outside that list is rejected.

## Provenance

Provenance is required and must cite both source contract identities, the observation identity, the detection rule, and detection version D9-R3-DETECTION-1.

## Source and basis

Source basis is required and must include the observation basis and both source basis references. The detected inconsistency must cite the rule and both contract identities.

## Applicability and limitations

Applicability must keep the observation applicability. Limitations must include both source limitation texts, the observation limitations, and the D1 standing limitation. The runtime does not drop them.

## Currentness

Canonical currentness states are reused. The candidate stores the cited currentness and the unchanged currentness of each source and of the observation. A current candidate is not a confirmed conflict. A stale candidate is not false. A superseded candidate is not invalid. No parallel currentness engine is created.

## Source-change behavior

The candidate remains bound to the revisions and fingerprints used when it was recorded. A later source revision does not repoint the candidate, recompute it, or confirm it.

## Observation-change behavior

The candidate remains bound to the observation fingerprint used when it was recorded. A later observation does not repoint or recompute the historical candidate.

## Digital thread, lineage, and fingerprint

The canonical digital thread module and fingerprintCanonical are reused. No parallel thread and no second fingerprint algorithm are created. Thread links name both sources and the observation explicitly. Lineage is copied from the source endpoints already stored on the observation. A supplied fingerprint that does not match is rejected and is not repaired.

## Authority matrix

D9 is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, Electrical, or Instrumentation and Control authority. The recorder authority is D9_CONFLICT_CANDIDATE_RECORDER. Source authority metadata stays on the endpoints.

## AI and admin boundaries

AI may propose a non-authoritative candidate marker. An AI proposal is not a confirmed conflict. AI and admin are not D9 engineering authority. They cannot confirm a conflict, promote a candidate to an engineering fact or an approval, or make an authoritative cross-discipline decision. An AI actor cannot record a governed candidate.

## No-confirmation matrix

R3 does not confirm an engineering conflict. Conflict detection count is 1. Confirmation is rejected. Admin confirmation without authority is rejected.

## No resolution, escalation, recommendation, or decision

Conflict resolution, automatic conflict resolution, conflict governance and escalation, recommendation, and engineering-decision counts are 0. R3 does not resolve, escalate, recommend, or decide. Conformance, approval, certification, automatic design, redesign, and optimization counts are 0. R3 does not validate or mutate D1 through D8.

## Future-runtime zero matrix

Dedicated currentness and digital-thread, and review validation, runtime counts are 0. R4 has not started. D9 is not complete.

## Security and release posture

The canonical security suite raw result is FAIL because the known baseline remains. Review tests are 1 failed and 21 passed across 22 files, and 1 failed, 123 passed, and 1 skipped across 125 tests. Persistence unit tests are 1 failed and 10 passed across 11 files, and 1 failed and 33 passed across 34 tests. Both failures are the existing EOS-A16D import boundary in packages/engineering-os/src/connectors/m365/eos-a16d-generic-binary-retrieval.test.ts. Known baseline failure count is 2. Known baseline root-cause count is 1. The fingerprint is unchanged. There is no new security regression. Secret scan passes with 618 files and 0 findings. Production audit metadata is 0 critical, 0 high, and 1 moderate: GHSA-w5hq-g745-h8pq on uuid 8.3.2 through exceljs 4.4.0. Release-governance tests pass: 201 tests, made of 179 classification tests, 7 recovery tests, and 15 guard tests. Release-governance typecheck passes. Release ledger integrity is ok. No schema change and no new dependency. Engineering OS tests pass: 385 files and 1891 tests. Web typecheck, pilot typecheck, and web lint pass. Pilot scoped typecheck passes with the existing isolated global debt and zero web TypeScript errors. Duplicate, replay, and scope spoofing are rejected.

## Explicit limitations

D9-R3 detects a provisional conflict candidate from exact source revisions and an explicit observation. It does not confirm the conflict, resolve it, escalate it, recommend a solution, decide, approve, validate a discipline, design, or mutate a source. D1 remains incomplete. D2 through D8 remain closed. D6, D7, and D8 remain COMPLETE_BOUNDED_WITH_LIMITATIONS. EOS is not all-disciplines-complete and is not generally available.

## Next canonical phase

The next phase is EOS-D9-R4-CONFLICT-GOVERNANCE-AND-ESCALATION, type CONFLICT_GOVERNANCE_AND_ESCALATION. Scope: Govern human handling of conflict candidates, including confirmation status, ownership, escalation, and disposition. A conflict candidate is not a confirmed engineering conflict. A confirmed engineering conflict is not a resolved conflict. An escalation is not an engineering decision, an approval, or conflict resolution. Closing a conflict is not engineering validation. Do not automatically resolve conflicts, recommend engineering solutions, make engineering decisions, approve designs, validate a discipline, or mutate a source record. R4 is named and not started.
