# EOS-D9-R1 Source Contract Read Model

## 1. Exact D1-D8 source posture

D9-R1 is the first D9 runtime. It is a read-only index over governed discipline source contracts. Civil, Geotechnical, Mechanical, Piping, and Process entries must carry that discipline's D9 source-contract status, discipline token, and context authority. Electrical uses the same governed status, token, and authority. Instrumentation and Control must carry contract version D8-D9-SOURCE-CONTRACT-1 together with the I&C discipline token and context authority. A mismatched token, authority, or version is rejected. The read model does not bypass those contracts and does not become the authority for the source facts.

## 2. D1 incomplete-state handling

No governed D1 source contract exists. The read model records one non-authoritative D1 posture: the structural pack remains incomplete, no source contract is available, and the standing limitation is preserved. D1 is not treated as complete. The posture is not an engineering fact and has no invented revision.

## 3. Read-only architecture

The runtime count is 1. The read model cannot mutate a source record or a discipline state. Registered entries are frozen copies. Source input objects are not written back. Repoint and mutate operations are rejected. Architecture D9 runtime started remains false and the architecture runtime count remains 0. The live D9 runtime started flag is true and the live runtime count is 1.

## 4. Source revision manifest

A manifest is a source-revision record, not a reasoning record. It lists each authoritative entry by discipline, contract identity, exact revision, and fingerprint, plus the D1 incomplete posture. The manifest fingerprint is the canonical fingerprint of that exact set.

## 5. Exact revision semantics

Every authoritative entry requires an exact source revision. Floating revisions, including a revision token of current, are rejected. Historical references are not repointed. Replaying the same entry with the same fingerprint returns the original record. Replaying it with a different body is rejected.

## 6. Source discipline preservation

A Civil source stays Civil. A Process source stays Process. An Instrumentation and Control source stays Instrumentation and Control. The stored discipline token is the discipline module's own token. D9 read access does not equal any D1 through D8 authority.

## 7. Identity and currentness preservation

Contract identity, object identity, and object type are copied and not replaced. Currentness is limited to the canonical currentness states. A current record is not validated. A stale record is not invalid. A superseded record is not invalid.

## 8. Provenance

Provenance is required and stored. Stripping provenance is rejected.

## 9. Source and basis

Source basis is required, stored, and traceable. An empty basis is rejected.

## 10. Applicability and limitations

Applicability and limitations are required and stored. The read model does not drop them and does not propagate a source outside its applicability. This includes the D1 standing limitation.

## 11. Authority metadata

Each entry keeps the source discipline authority constant. The recorder authority is D9_SOURCE_READ_RECORDER. That recorder is not a discipline engineering authority. AI and admin cannot record, invent a source fact, invent a relationship, or promote an entry to engineering truth.

## 12. Lineage and history

Lineage edges must name both revisions explicitly. Inferred lineage is rejected. History appends created records and the D1 posture record. Past fingerprints stay attached to the revisions that were indexed.

## 13. Fingerprint and integrity

The read model reuses fingerprintCanonical. No second algorithm is created. A supplied fingerprint that does not match the canonical projection is rejected. Mismatches are not repaired or rebaselined. A fingerprint match is not validation or approval.

## 14. Normalization boundaries

The common query surface copies fields into a stable projection. That copy creates no engineering fact, performs no engineering derivation, and performs no numeric derivation.

## 15. Unit and value preservation

Source values stay text, and units stay text. The read model does not convert units, infer a missing value, or correct a source value.

## 16. No-new-fact matrix

The runtime creates no engineering fact, derived value, requirement, assumption, engineering decision, or recommendation. A read-model entry is not an inference. A manifest is not an engineering relationship. Grouping entry identifiers by discipline is not a cross-discipline inference.

## 17. No-inference matrix

The runtime does not infer relationships from name, tag, document proximity, or semantic similarity. Existing governed relationships are exposed only when both endpoints carry exact revisions. Observation, conflict detection, conflict confirmation, conflict resolution, escalation, recommendation, and engineering decision are rejected.

## 18. Zero future-runtime matrix

Cross-discipline observation, reasoning, conflict detection, conflict resolution, automatic conflict resolution, conflict governance and escalation, recommendation, engineering decision, conformance, approval, certification, automatic design, optimization, dedicated currentness and digital-thread, and review validation runtime counts are 0. D9 does not auto-validate D1 through D8 and does not mutate D1 through D8. R2 has not started.

## 19. Tenant, workspace, and project scope

A store and its recorder are bound to one tenant, workspace, and project. Cross-scope registration and reads are rejected. Duplicate contract identity inside that scope is rejected.

## 20. Security and release posture

The canonical security suite raw result is FAIL because the known baseline remains. Review tests are 1 failed and 21 passed across 22 files, and 1 failed, 123 passed, and 1 skipped across 125 tests. Persistence unit tests are 1 failed and 10 passed across 11 files, and 1 failed and 33 passed across 34 tests. Both failures are the existing EOS-A16D import boundary in packages/engineering-os/src/connectors/m365/eos-a16d-generic-binary-retrieval.test.ts. Known baseline failure count is 2. Known baseline root-cause count is 1. The fingerprint is unchanged. There is no new security regression. Secret scan passes with 618 files and 0 findings. Production audit metadata is 0 critical, 0 high, and 1 moderate: GHSA-w5hq-g745-h8pq on uuid 8.3.2 through exceljs 4.4.0. Release-governance tests pass: 199 tests, made of 177 classification tests, 7 recovery tests, and 15 guard tests. Release-governance typecheck passes. Release ledger integrity is ok. No schema change and no new dependency. Engineering OS tests pass: 383 files and 1887 tests. Web typecheck, pilot typecheck, and web lint pass. Pilot scoped typecheck passes with the existing isolated global debt and zero web TypeScript errors.

## 21. Explicit limitations

D9-R1 only indexes exact source revisions and the D1 incomplete posture. It does not observe, infer, detect conflicts, confirm conflicts, resolve conflicts, escalate, recommend, decide, validate, design, or certify. D1 remains incomplete. D2 through D8 remain closed. D6, D7, and D8 remain COMPLETE_BOUNDED_WITH_LIMITATIONS. D9 is not complete. EOS is not all-disciplines-complete and is not generally available.

## Next canonical phase

The next phase is EOS-D9-R2-CROSS-DISCIPLINE-OBSERVATION, type CROSS_DISCIPLINE_OBSERVATION. Scope: Record explicit cross-discipline observations against the exact D9-R1 source revision manifest. Preserve source discipline, exact revision, provenance, applicability, and limitations. An observation is not an inference, a conflict candidate, a confirmed conflict, an escalation, a recommendation, or an engineering decision. Do not start conflict detection, recommendation, validation, or source mutation. R2 is named and not started.
