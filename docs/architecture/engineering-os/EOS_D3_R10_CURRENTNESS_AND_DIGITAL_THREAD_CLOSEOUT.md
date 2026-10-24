# EOS-D3-R10 Currentness and Digital Thread Closeout

## Purpose

R10 records which exact Geotechnical revisions are current, stale, superseded, or require reassessment, and how their lineage is traced. One bounded runtime covers explicit lineage, supersession, and currentness marks across R1 through R9. Currentness communicates state. It does not recalculate parameters, redesign foundation, excavation, or slope work, generate recommendations, transfer review or validation, or start a later runtime. The live D3 runtime count is ten.

D1 structural pack complete remains no. D1N stays closed. The Civil track remains complete with classification COMPLETE_BOUNDED_WITH_LIMITATIONS and runtime count eleven. D2 is not reopened. Earlier D3 modules keep their historical runtime counts of one through nine. The R9 currentness-thread readiness flag stays false, and R10 remains unstarted on that module. R11 is named and not started.

## Canonical reuse

R10 reuses the canonical currentness states CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. Historical revisions stay queryable as preserved superseded records. It reuses governed relation types, relation semantics, and the digital-thread default depth. Fingerprints use the existing canonical fingerprint function. No parallel D3 currentness engine, digital-thread engine, or second fingerprint algorithm was added.

## Exact revision lineage and supersession

Every lineage edge, supersession, and currentness mark binds to the revision already stored on the subject. Objects, evidence, changes, and most other records use their provenance reference. Requirements and handoffs use their source revision. Review and validation records use their subject revision. Floating revisions are rejected. A superseded record stays in history. Supersession does not delete it, mark it invalid, or rewrite existing lineage edges. The successor does not inherit the predecessor's review or validation.

## Explicit propagation

Currentness moves only along explicit governed relationships, including the D3 change dependencies for investigation evidence, stratigraphy and groundwater, parameter sets, foundation excavation and slope context, and D1 and D2 interfaces. Spatial proximity, the same borehole, the same material, similar text, semantic similarity, a shared document, and AI inference do not create an edge. A stale or reassessment-required mark propagates as that same state. A superseded predecessor asks dependents for reassessment. The engineering content of the dependent record stays unchanged.

## R7, R8, and R9

An R7 change can mark an explicitly related record stale or reassessment-required. That mark is not a recalculation, a redesign, or a validation. An R8 handoff stays bound to the source revision it was issued against. A later source revision does not repoint the handoff or its counterpart reference. A stale handoff is represented by a thread mark whose currentness is stale. An R9 review or validation stays on the revision that was reviewed. A stale review or validation mark is not current. A reassessment-required mark is not engineering validation. Evidence lineage records that an explicit evidence relationship exists. It does not establish that the engineering is validated.

## Integrity

Duplicate lineage, replayed supersession, stale source revisions, invalid edges, circular relationships, cross-project and cross-tenant references, authority spoofing, provenance spoofing, fingerprint mismatch, and unauthorized promotion back to current are rejected. AI cannot fabricate lineage. Records are frozen after they are written. History keeps the created fingerprints. Tenant, workspace, and project scope is enforced.

## Dependency remediation

The production audit that blocked the first R10 closeout reported a new high advisory, GHSA-mrhx-c7xc-m3w5, on zod 3.25.76. Zod is a direct production dependency of the web app, Engineering OS, platform-core, platform-commerce, platform-intelligence, platform-kernel, plugin-sdk, and project-intelligence. The installed version was 3.25.76 from the specifier ^3.25.36. Production imports are the plugin manifest schema, the platform event payload schema, and the document processing and answer status enums. The other direct owners declare Zod without importing it, and the audit still followed those production paths. The patched range is 4.6.6 and later. All eight direct specifiers now use ^4.6.6, and the lockfile resolves zod 4.6.7. No override was used. No new package was added. The single compatibility change is that record schemas now pass an explicit string key schema and a value schema, which is the Zod 4 form of the previous single-argument record. Schema creation, parsing, safe parsing, validation failure, optional fields, defaults, enums, objects, records, and UUID checks were exercised on those production schemas. Permissive UUID strings that the event schema already accepted still parse. Unions, refinements, and transforms are not used by these schemas. Typecheck of the owning packages passed. Platform-kernel tests passed at 13. Project-intelligence tests passed at 157 with one skipped. The plugin manifest compatibility test passed.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 314 files and 1817 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. Integration tests passed. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1. GHSA-mrhx-c7xc-m3w5 is no longer reported. The remaining moderate advisory is GHSA-w5hq-g745-h8pq on uuid 8.3.2 through exceljs, the same finding previously recorded as advisory 1119441. Release governance typecheck passed, tests passed at 130, artifact classification passed, and the ledger returned ok.

## Next phase

The next phase is EOS-D3-R11-D9-SOURCE-CONTRACT, type D9_SOURCE_CONTRACT. It exposes governed Geotechnical facts and metadata for future D9 consumption using exact D3 revisions, currentness, authority, provenance, investigation/evidence, stratigraphy/material/groundwater context, tests, parameters, recommendations, requirements/assumptions/decisions, interfaces, review/validation state, lineage, limitations and canonical fingerprint. The source contract must not create new engineering facts, transfer Geotechnical authority, perform cross-discipline reasoning, fabricate counterpart information, start D9 runtime or start D4-D8. This closeout does not start that phase.
