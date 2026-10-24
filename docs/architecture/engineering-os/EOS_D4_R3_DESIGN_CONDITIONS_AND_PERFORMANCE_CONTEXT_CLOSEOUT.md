# EOS-D4-R3 Design Conditions and Performance Context Closeout

## Purpose

R3 records what Mechanical design conditions and performance requirements apply, together with their governed source and authority. It does not calculate those values, fabricate Process inputs, or turn source or vendor information into validated Mechanical engineering.

R1 remains the identity runtime at count one. R2 remains the equipment and system context runtime at count two. R3 is the third Mechanical runtime and the one design-condition and performance context runtime. Design conditions and performance context are not counted as separate runtimes. D4-0 architecture runtime flags stay at their historical zero. D1 structural pack complete remains no. D1N stays closed. Civil and Geotechnical remain complete and are not reopened.

## Exact R1 and R2 reuse

Every R3 record names an R1 context, an R1 object, that object's exact revision fingerprint, an R2 subject, and that subject's exact revision fingerprint. The R2 subject is a classification, service, membership, or description already bound to the same object revision. A floating reference such as latest or current is rejected. A fingerprint that does not match the named revision is rejected. A subject bound to a different object is rejected. Superseding the R1 object or the R2 subject does not rewrite an existing R3 record onto the new revision. Repointing is rejected. No parallel Mechanical identity or duplicate equipment context is created.

## Governed source basis

An authoritative design condition or performance context requires a traceable source basis and source revision. Allowed basis kinds are a project specification, a client requirement, a Process-provided condition, an adopted project design basis, a Mechanical requirement, an engineering assumption, an authorized engineering decision, a vendor information reference, or other governed evidence. A basisless authoritative record is rejected. The source revision is stored and is not a floating token.

## Design-condition semantics

A Mechanical design condition records a supplied or explicitly adopted value for an allowlisted kind such as design pressure, design temperature, operating pressure, operating temperature, an environmental Mechanical condition, design life, cyclic or operating context, a mechanical operating envelope, equipment duty basis, or a Mechanical load criterion. The record keeps the value, the unit when the value is numeric, the source basis, the adopting rationale, applicability, limitations, provenance, currentness, and history. Recording the condition does not validate it.

## Performance-context semantics

A Mechanical performance context records a supplied or explicitly adopted value for an allowlisted kind such as capacity, duty, head, a Mechanical-owned flow reference, speed, power, torque, efficiency, thermal duty context, a vibration criterion, a noise criterion, or an operating range or envelope. The record states that EOS did not calculate or verify the value. Performance context is not vendor data and is not validated engineering.

## Process and source distinction

A source requirement, a Process condition reference, a Mechanical design condition, a Mechanical performance context, a vendor source reference, a candidate, and validated engineering remain different record classes. A Process condition may be stored only as a governed reference. That reference is not D4 Process authority and does not create an authoritative Process condition. Process flow, composition, heat or material balance, and process simulation results are rejected. Adopting a source or Process reference as a Mechanical design condition requires an explicit rationale and keeps the source revision, value, and unit unchanged. The source record is not rewritten. Automatic promotion is rejected. AI and admin cannot adopt an authoritative condition.

## Unit semantics

A numeric condition requires an explicit unit. The unit is stored as supplied. A request to normalize or replace it with another unit is rejected. A non-numeric description does not receive an invented unit. No second unit engine is introduced.

## No automatic derivation and no sizing

No formula, heuristic, or hidden calculation produces an authoritative design condition or performance value. A calculated result is not accepted as source context. Equipment sizing, rotating and static equipment calculations, thermal mechanical calculations, mechanical load calculations, vibration analysis, fatigue analysis, and design optimization remain zero. Vendor document ingestion is rejected. A vendor information reference may be cited as basis only. That reference is not the vendor-data runtime, and it is not engineering validation or approval.

## Applicability and limitations

Every record carries an applicability case and explicit limitations. Applicability is bound to the same equipment or system identity. A broad or propagating applicability is rejected. A condition for one identity or case is not copied onto another.

## Authority boundaries

AI and admin are not Mechanical engineering authority. D4 does not equal D1, D2, D3, D5, D6, D7, or D8 authority. No discipline interface runtime is started. Review, validation, conformance, approval, and certification remain zero. A present design condition or performance context is not validated or approved.

## Currentness, provenance, fingerprint, and history

Currentness and fingerprints reuse the canonical mechanisms. Provenance is required. Replay of the same record and fingerprint returns the existing record. A conflicting replay is rejected. A duplicate current record for the same subject, kind, value, unit, applicability, and source revision is rejected. Supersession marks the predecessor superseded, appends history, and leaves the predecessor fingerprint and source revision unchanged. A later source revision does not automatically rewrite, update, or revalidate the historical record. Tenant, workspace, and project must match the recorder. A stale R1 or R2 revision cannot be cited as current.

## Integrity protections

Duplicate records, replay conflicts, wrong R1 or R2 subjects, stale revisions, unit changes, missing basis, authority spoofing, cross-tenant and cross-project references, fingerprint mismatches, and silent repointing are rejected.

## Runtime state

Runtime count is three. The design-condition and performance runtime count is one. Vendor data, mechanical requirements, maintainability, requirements and change, discipline interfaces, review and validation, the dedicated currentness thread, the D9 source contract, sizing, calculations, automatic derivation, automatic validation, approval, certification, and cross-discipline reasoning remain zero. D5 through D9 remain unstarted. No schema change. No new dependency. Vendor data, technical requirements, maintainability, change governance, interfaces, review, the currentness thread, and the D9 source contract remain not ready.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 320 files and 1823 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance typecheck passed, tests passed at 136, and the ledger returned ok.

## Next phase

The next phase is EOS-D4-R4-VENDOR-DATA-AND-EVIDENCE-CONTEXT, type VENDOR_DATA_AND_EVIDENCE_CONTEXT. It implements governed vendor and manufacturer data and Mechanical evidence context using exact R1 through R3 identities and context. It supports exact vendor-document revisions, equipment association, data provenance, certified or non-certified status where explicitly supplied, evidence classification, and currentness, while keeping vendor data, engineering adoption, validation, and approval distinct. It does not perform equipment calculations, automatically adopt vendor values as engineering truth, implement discipline interfaces, review or validation, or start D5 through D9. This closeout does not start that phase.
