# EOS-D5-R5 Routing Arrangement and Fabrication Context Closeout

## Purpose

R5 records where Piping is intended to run and how it is represented for arrangement and fabrication. It does not convert route geometry, isometrics, spools, or weld context into claims of clash-free routing, constructability, stress adequacy, fabrication completion, inspection acceptance, or engineering validation.

## Routing and arrangement

A routing record binds an exact R1 route identity, an exact R2 line revision, an exact R3 specification revision, and exact R4 component and connection revisions. Source and destination ends are explicit object revisions. Drawing geometry, proximity, line graphics, point-cloud proximity, AI semantic matching, and adjacent components do not create a route. Supplied slope, elevation, and geometry context keep the supplied value and unit. They are not hydraulic validation and they are not a solved geometry. Arrangement context is descriptive. It is not spatial validation, clash-free status, access validation, or maintainability validation. An arrangement may cite an exact D4 access or maintenance revision. If that counterpart is absent, the limitation is recorded and no Mechanical access record is fabricated. Citing D4 access does not validate maintainability or Mechanical access, and it does not transfer Mechanical authority.

## Fabrication, isometric, spool, and weld

Fabrication context may record shop or field classification, a supplied status, a requirement, and an evidence reference. The status is not fabrication completion and is not engineering validation. An isometric records a document identity and an exact document revision. The drawing is not the Piping object identity and is not engineering validation. A newer isometric revision supersedes the prior record and does not rewrite its fingerprint or document revision. A spool stays tied to the exact component and connection revisions and is not a claim that the spool has been fabricated. A weld or joint record is descriptive. It is not weld acceptance, an NDE pass, or code conformance. Inspection and test conclusions remain with the future R6 runtime.

## Boundaries that remain zero

Automatic routing, route optimization, clash detection, geometry solving, and constructability determination remain at count zero, including a hidden spatial solver. Stress, flexibility, support-load, pipe sizing, hydraulic, pressure-drop, wall-thickness, branch-reinforcement, flange-rating, valve-sizing, and component-sizing calculations remain at count zero. Requirements, interfaces, review, a dedicated currentness runtime, and the D9 source contract remain at count zero. Automatic redesign, validation, conformance, approval, and certification remain at count zero. Cross-discipline reasoning remains at count zero. D6, D7, D8, and D9 remain unstarted. R6 is named and not started. R5 does not mutate R4 component or connection records.

## Preservation

Canonical currentness and fingerprint are reused. Source and basis are required and traceable. Applicability and limitations are explicit and are not propagated to another object. Provenance and history are preserved. Duplicate, replay, and spoofing controls reject a mismatched fingerprint, a wrong or stale R1-R4 revision, an inferred route, a fabricated D4 access counterpart, and a cross-scope reference. AI and admin authority cannot invent a route, fabrication context, or weld context. D1 remains incomplete and is not reopened. D2, D3, and D4 remain complete and are not reopened. Live R4 count remains 4. The R4 routing runtime count remains 0. Live D5 runtime count is 5 on this module only. Architecture D5 runtime count remains 0. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. The Engineering OS suite passed 335 files and 1838 tests. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 151, and the ledger returned ok.

## Next phase

The next phase is EOS-D5-R6-STRESS-SUPPORT-AND-TEST-EVIDENCE-CONTEXT, type STRESS_SUPPORT_AND_TEST_EVIDENCE_CONTEXT. It implements governed Piping stress and flexibility, support and restraint, and inspection, NDE, and test evidence context using exact R1-R5 revisions. It records externally produced or explicitly supplied analysis and test evidence, load cases, result references, support requirements, test requirements, and observed results without implementing stress, flexibility, support-load, or test calculations, Structural support validation, code-conformance determination, review and validation governance, or D9 reasoning. This closeout does not start that phase.
