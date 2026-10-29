# EOS-D4-R10 Currentness and Digital Thread Closeout

## Purpose

R10 determines which exact Mechanical revision is current and how governed Mechanical records are explicitly connected through time. It may change governance state. It does not rewrite history, infer engineering lineage, silently repoint references, recalculate engineering, or transfer validation to a new revision.

R1 through R9 remain the earlier Mechanical runtimes at counts one through nine. R10 is the tenth Mechanical runtime and the one currentness and digital-thread runtime. Lineage edges, supersession records, and currentness marks are not separate runtimes. D4-0 architecture runtime flags stay at their historical zero. D1 structural pack complete remains no. D1N stays closed. Civil and Geotechnical remain complete and are not reopened.

## Canonical currentness, digital thread, and fingerprint

Currentness uses the canonical currentness states. Lineage uses the canonical digital-thread relation semantics and the canonical thread depth. Fingerprints use the canonical fingerprint. No parallel currentness engine, digital thread, or fingerprint algorithm is created.

## Exact R1-R9 binding

Every lineage endpoint, supersession, and currentness mark names an exact governed revision and its fingerprint. Subjects may be an R1 context or object, an R2 classification, service, membership, or description, an R3 design or performance record, an R4 vendor document or vendor data record, an R5 technical requirement, an R6 maintainability context, an R7 requirement, assumption, decision, change, or reassessment, an R8 handoff, or an R9 review request, finding, completion, or validation. Floating references such as latest or current are rejected as revisions. Historical edges keep the revision they cited.

## Explicit lineage

Lineage is recorded only when the relationship type is an explicit Mechanical relationship or a governed digital-thread relation. Identical tags, equipment or system membership, similar values, vendor relationships, filenames, semantic similarity, temporal proximity, and document co-occurrence do not create lineage. A candidate edge is not authoritative. Missing links are not invented.

## Supersession and currentness

An explicit supersession records the predecessor and successor and marks the predecessor superseded in the currentness thread. The predecessor engineering record is not deleted and its fingerprint is not rewritten. A superseded or stale mark is not exposed as current. History of the original edge is preserved.

## R7, R8, R9, and R4

A change that requires reassessment can be marked reassessment required. That mark is not validation and is not an invalidation of the engineering. Reassessment required does not recalculate or redesign. An R8 handoff can be marked stale without repointing its historical reference or its counterpart. An R9 review or validation stays bound to the revision it cited. A stale or superseded validation is not exposed as current, and prior review or validation does not transfer to a new revision. An R4 vendor document can be superseded by an explicit newer document revision. The older document remains. The newer revision is not adopted as engineering and does not alter R3, R5, or R6 content.

## Propagation, provenance, and history

Currentness propagates only along explicit authoritative relationships, and only within the canonical thread depth. Propagation updates governance marks. It does not recalculate, redesign, or validate engineering. Provenance is required and preserved. No currentness operation rewrites historical engineering truth. Tenant, workspace, and project scope is enforced.

## Authority and later-phase boundaries

AI and admin are not Mechanical engineering authority. AI cannot infer authoritative lineage or repoint history. An administrator cannot repoint history. Mechanical currentness does not become Structural, Civil, Geotechnical, Piping, Process, Electrical, or Instrumentation and Control authority. Equipment sizing and the other Mechanical calculations, automatic redesign, automatic validation, conformance, approval, and certification remain at count zero. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain at count zero. The D9 source contract and D9 runtime integration remain at count zero. D5 through D9 remain unstarted. No schema change. No new dependency.

## Integrity

Duplicate lineage, lineage replay, supersession replay, an invalid source or target revision, inferred lineage, stale-revision spoofing, currentness spoofing, fingerprint mismatch, provenance spoofing, authority spoofing, scope spoofing, cross-project lineage, cross-tenant lineage, and historical auto-repointing are rejected. Replay of the same record and fingerprint returns the existing record.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 327 files and 1830 tests. Web typecheck passed. Types typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance typecheck passed, tests passed at 143, and the ledger returned ok.

## Next phase

The next phase is EOS-D4-R11-D9-SOURCE-CONTRACT, type D9_SOURCE_CONTRACT. It implements one governed D4 Mechanical source contract for future D9 consumption using exact R1-R10 Mechanical revisions. It exposes governed Mechanical facts and metadata, including identity, equipment and system context, design and performance context, vendor evidence, technical requirements, maintainability, access and package context, requirements, assumptions, decisions and change, interfaces, review and validation, currentness, lineage, authority, limitations, provenance and fingerprint. It does not create new engineering facts, derive values, perform calculations, fabricate counterpart information, transfer authority, perform cross-discipline reasoning, or start D9 runtime. This closeout does not start that phase.
