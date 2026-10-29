# EOS-D9-R2 Cross-Discipline Observation

## 1. Exact R1 source-manifest reuse

D9-R2 is the second D9 runtime. It records observations only against the governed D9-R1 source revision manifest. Both endpoints must already be authoritative manifest entries, matched by contract identity, exact revision, and canonical fingerprint. A revision that is not on the manifest is rejected. The read-model runtime count stays 1 and remains ready. The R1 historical runtime count stays 1. The live D9 runtime count is 2.

## 2. Observation record model

An observation has an identity, a type of explicit difference or explicit relationship, both source endpoints, the explicit statement, source basis, provenance, applicability, limitations, the D1 posture limitation, cited currentness, optional governed relationship identity, scope, and fingerprint. It is not an inference, an engineering fact, a conflict candidate, a confirmed conflict, an escalation, a recommendation, an engineering decision, or an approval.

## 3. Exact revision semantics

Each endpoint keeps the exact revision indexed by R1. Floating revisions are rejected. The observation does not follow a source to a newer revision.

## 4. Source-discipline preservation

Source discipline, discipline token, object identity, and object type are copied from the manifest entry. An observation does not convert source ownership to D9. The two endpoints must belong to different disciplines.

## 5. D1 limitation handling

D1 still has no governed source contract and remains an incomplete pack. Every observation copies the D1 standing limitation and records that the pack is not complete. D1 cannot be used as an exact-revision endpoint.

## 6. Observation versus inference

The statement must be explicit. Statements that draw a conclusion, such as declaring a design incorrect or deciding a result, are rejected. The runtime does not infer missing values, derive numbers, or infer relationships from name, tag, document proximity, or semantic similarity.

## 7. Observation versus conflict

An observed difference is not a conflict candidate and is not a confirmed engineering conflict. Conflict detection, confirmation, and resolution are rejected. An explicit relationship copied from a source contract does not transfer authority, adopt a requirement, validate, or approve.

## 8. Source and basis

Source basis is required. Each endpoint also keeps the basis stored on its source entry.

## 9. Provenance

Provenance is required and must cite both source contract identities. Each endpoint also keeps its source provenance. Stripping provenance is rejected.

## 10. Applicability and limitations

Applicability is required. Observation limitations must include both source limitation texts and the D1 standing limitation. The runtime copies source limitations from the manifest and does not drop them.

## 11. Currentness

Canonical currentness states are reused. The observation stores the cited currentness and the unchanged currentness of each source. A current observation is not validated. A stale observation is not invalid. A superseded observation is not invalid. No parallel currentness engine is created.

## 12. Thread, lineage, and fingerprint

The canonical digital thread and fingerprintCanonical are reused. No parallel thread and no second fingerprint algorithm are created. Lineage on each endpoint is the explicit lineage already stored on the source entry. A supplied observation fingerprint that does not match is rejected and is not repaired. A fingerprint match is not validation or approval.

## 13. Source-change behavior

The observation remains bound to the revisions and fingerprints used when it was recorded. A source change does not repoint the observation and does not recompute it. History appends the created record and does not rewrite it.

## 14. Authority matrix

D9 is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, Electrical, or Instrumentation and Control authority. The recorder authority is D9_OBSERVATION_RECORDER. That role is not a discipline engineering authority.

## 15. AI and admin boundaries

AI and admin are not D9 engineering authority. They cannot promote an observation to an engineering fact, a conflict, or engineering truth, and they cannot confirm a conflict or make an authoritative cross-discipline decision.

## 16. No-conflict matrix

Conflict detection, conflict resolution, and automatic conflict resolution counts are 0. R2 does not create a conflict candidate, confirm a conflict, or resolve a conflict.

## 17. No-recommendation and no-decision matrix

Recommendation and engineering-decision counts are 0. R2 does not recommend or decide. Conformance, approval, certification, automatic design, redesign, and optimization counts are 0. R2 does not validate or mutate D1 through D8.

## 18. Future-runtime zero matrix

Conflict governance and escalation, dedicated currentness and digital-thread, and review validation runtime counts are 0. R3 has not started. D9 is not complete.

## 19. Security and release posture

The canonical security suite raw result is FAIL because the known baseline remains. Review tests are 1 failed and 21 passed across 22 files, and 1 failed, 123 passed, and 1 skipped across 125 tests. Persistence unit tests are 1 failed and 10 passed across 11 files, and 1 failed and 33 passed across 34 tests. Both failures are the existing EOS-A16D import boundary in packages/engineering-os/src/connectors/m365/eos-a16d-generic-binary-retrieval.test.ts. Known baseline failure count is 2. Known baseline root-cause count is 1. The fingerprint is unchanged. There is no new security regression. Secret scan passes with 618 files and 0 findings. Production audit metadata is 0 critical, 0 high, and 1 moderate: GHSA-w5hq-g745-h8pq on uuid 8.3.2 through exceljs 4.4.0. Release-governance tests pass: 200 tests, made of 178 classification tests, 7 recovery tests, and 15 guard tests. Release-governance typecheck passes. Release ledger integrity is ok. No schema change and no new dependency. Engineering OS tests pass: 384 files and 1889 tests. Web typecheck, pilot typecheck, and web lint pass. Pilot scoped typecheck passes with the existing isolated global debt and zero web TypeScript errors. Duplicate, replay, and scope spoofing are rejected.

## 20. Explicit limitations

D9-R2 records explicit observations over exact governed source revisions. It does not detect conflicts, confirm conflicts, escalate, recommend, decide, validate, design, or mutate a source. D1 remains incomplete. D2 through D8 remain closed. D6, D7, and D8 remain COMPLETE_BOUNDED_WITH_LIMITATIONS. EOS is not all-disciplines-complete and is not generally available.

## Next canonical phase

The next phase is EOS-D9-R3-CONFLICT-CANDIDATE-DETECTION, type CONFLICT_CANDIDATE_DETECTION. Scope: Detect governed conflict candidates from exact D9-R1 source revisions and explicit D9-R2 observations. A conflict candidate is not a confirmed engineering conflict, an escalation, a recommendation, an engineering decision, or an approval. Preserve uncertainty, source traceability, applicability, and limitations. Do not confirm conflicts, resolve conflicts, escalate, recommend, decide, approve, validate a discipline, or mutate a source record. R3 is named and not started.
