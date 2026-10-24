# EOS-D4-R4 Vendor Data and Evidence Context Closeout

## Purpose

R4 governs what a vendor or manufacturer supplied and the evidence supporting it. It does not convert vendor information, test evidence, or certificates into adopted, validated, approved, or certified Mechanical engineering.

R1 remains the identity runtime at count one. R2 remains the equipment and system context runtime at count two. R3 remains the design-condition and performance context runtime at count three. R4 is the fourth Mechanical runtime and the one vendor-data and evidence runtime. Document types and evidence classes are not separate runtimes. D4-0 architecture runtime flags stay at their historical zero. D1 structural pack complete remains no. D1N stays closed. Civil and Geotechnical remain complete and are not reopened.

## Exact R1-R3 binding

Every R4 record names an R1 context, an R1 object, that object's exact revision fingerprint, an R2 subject and revision fingerprint, and an R3 record and revision fingerprint. The R2 subject must already be bound to that object revision. The R3 record must already be bound to the same object revision. Floating references such as latest or current are rejected. A fingerprint mismatch is rejected. A subject bound to a different object is rejected. Recording vendor evidence does not rewrite R1, R2, or R3. Repointing is rejected.

## Vendor and manufacturer identity

A record stores the vendor or manufacturer identity, the source organization, the exact document reference, the exact revision, an issue or source date when supplied, provenance, the equipment association, and currentness. Vendor identity is not inferred from a filename or ungoverned metadata.

## Exact document revision

The document revision is an explicit token. A newer revision is a new record. The prior record remains in history with its original revision and fingerprint. It is not deleted and it is not silently replaced. The newer revision is not adopted as Mechanical engineering.

## Evidence classification

Evidence class must be an allowlisted class, including architecture evidence classes and vendor information kinds such as datasheet, drawing, certified or vendor drawing, manual, performance curve, inspection or test report, certificate, manufacturer literature, deviation, qualification or exception, and project-supplied Mechanical evidence. A freeform or unknown class is rejected.

## Equipment association

Association uses the exact governed equipment or package identity and its revision. Similar tags, filenames, text similarity, document proximity, and vendor naming conventions do not create an association.

## Vendor data and source status

Supplied values such as dimensions, mass, center of gravity, nozzle information, ratings, and performance points are stored only when present in the governed source. Numeric values require an explicit unit and are not converted. A source status is stored only when the source explicitly supplies one, including preliminary, for information, for review, approved by vendor, certified by vendor, as-built, or superseded. A missing status is not invented. Vendor certification is a source status. It is not EOS validation, project approval, or regulatory certification.

## Vendor data versus engineering adoption

Vendor data remains a vendor claim. It is not Mechanical engineering adoption, validated engineering, approval, or EOS certification. Evidence is not Mechanical validation, approval, or conformance. AI, admin, and the vendor party cannot invent a vendor value or adopt it as engineering. Engineering adoption is rejected inside R4.

## Performance curves, inspection, and certificates

A performance curve may be stored as evidence. It is not validated Mechanical performance. Interpolation, duty-point calculation, and equipment selection are rejected. An inspection or test record keeps the stated result. A stated pass is not Mechanical validation or project approval. A certificate is external evidence. Storing it does not mean EOS issued or verified a certification.

## R3 non-mutation

If a vendor value differs from the bound R3 design or performance value, both records remain. The vendor record may note the source difference, and that note does not accept either value. R3 is not revised, invalidated, or recalculated. Change governance remains later.

## Currentness, provenance, fingerprint, and history

Currentness and fingerprints reuse the canonical mechanisms. Provenance and limitations are required. Replay of the same record and fingerprint returns the existing record. A conflicting replay is rejected. A duplicate current document identity, revision, class, and value is rejected. Supersession marks the predecessor superseded, appends history, and leaves the predecessor fingerprint and revision unchanged. Tenant, workspace, and project must match the recorder. A stale R1, R2, or R3 revision cannot be cited as current.

## Integrity and boundaries

Duplicate identity, replay, wrong equipment, stale revision, fabricated vendor identity, status spoofing, unit change, cross-scope reference, authority spoofing, and silent repointing are rejected. Equipment sizing and calculations, performance-curve calculation, review, validation, conformance, approval, certification, and discipline interfaces remain zero. Nozzle information may be recorded as evidence and does not start a Piping or other counterpart runtime. D5 through D9 remain unstarted. No schema change. No new dependency. Technical requirements, maintainability, change governance, interfaces, review, the currentness thread, and the D9 source contract remain not ready.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 321 files and 1824 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance typecheck passed, tests passed at 137, and the ledger returned ok.

## Next phase

The next phase is EOS-D4-R5-MECHANICAL-REQUIREMENTS-AND-TECHNICAL-CONTEXT, type MECHANICAL_REQUIREMENTS_AND_TECHNICAL_CONTEXT. It implements governed Mechanical technical requirements and equipment-specific technical context using exact R1 through R4 identities, design and performance context, and vendor evidence. It preserves source and basis, authority, applicability, and limitations. It does not size or calculate, automatically resolve vendor and engineering discrepancies, implement maintainability or package context, discipline interfaces, review or validation, or start D5 through D9. This closeout does not start that phase.
