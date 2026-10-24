# EOS-D3-R1 Geotechnical Identity and Object Foundation Closeout

## Purpose

R1 records one governed Geotechnical context and the object identities that context owns. A borehole identity is not a borehole log. A parameter-set identity is not a Geotechnical parameter. A foundation-context identity is not a foundation recommendation. Investigation findings and engineering conclusions remain later phases.

D1 structural pack complete remains no. D1N stays closed. The Civil track remains complete with classification COMPLETE_BOUNDED_WITH_LIMITATIONS and runtime count eleven. D2 is not reopened. D3-0 architecture runtime flags stay at their historical zero. The live R1 runtime count is one.

## Canonical primitives reused

Object identity is the governed identifier inside tenant, workspace, and project scope. No parallel Geotechnical identity system is created. Currentness reuses the existing states, and a superseded revision keeps the fingerprint it was recorded with. Fingerprints reuse fingerprintCanonical. No second fingerprint algorithm is created. Maturity reuses CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, and DETAILED_DESIGN. Automatic maturity progression is rejected.

## Context and object taxonomy

One Geotechnical context binds tenant, workspace, project, discipline GEOTECHNICAL, a cited lifecycle stage, provenance, authority GEOTECHNICAL_CONTEXT_AUTHORITY, currentness, and a canonical fingerprint. Object identities use the D3-0 allowlist only: site context, investigation location, borehole, test pit, stratigraphic layer, groundwater observation, field-test record, laboratory-test record, material classification, parameter set, foundation context, excavation context, slope context, earthworks material context, pavement subgrade context, ground improvement context, geohazard context, and the governance record types. An unknown or freeform type is rejected. A caller-supplied category that disagrees with the allowlist is rejected.

## Identity versus engineering content

Creating an identity does not create borehole data, test-pit data, stratigraphy, groundwater data, a material classification result, field or laboratory test data, a parameter, a calculation, or a recommendation. Those inputs are rejected. The stored record has no log, depth, test result, or parameter value.

## Scope, relationships, and history

Tenant, workspace, and project must match the recorder. Cross-tenant, cross-workspace, and cross-project operations are rejected. Relationships are only PARENT and OBJECT_REFERENCE to a current object in the same context and scope. Proximity, name similarity, and inferred links are rejected. One current context exists per tenant, workspace, and project. Replay of the same identity and fingerprint returns the existing record. A conflicting identity, a fingerprint mismatch, an AI or administrator recorder, or a spoofed provenance reference is rejected. Supersession marks the predecessor SUPERSEDED and appends history. It does not rewrite the predecessor fingerprint. Direct mutation is rejected.

## Authority

AI is not Geotechnical engineering authority. Admin is not Geotechnical engineering authority. The recorder is GEOTECHNICAL_CONTEXT_AUTHORITY and is not the engineering authority. D3 does not equal D1 or D2 authority. No D1 or D2 interface runtime is implemented. Observation is not interpretation. A test result is not an engineering parameter. An engineering parameter is not validated. A recommendation is not approval.

## Prohibition and runtime state

Runtime has started. Runtime count is one. Site investigation, borehole data, test-pit data, stratigraphy, groundwater data, field and laboratory test data, parameters, calculations, recommendations, review and validation, approval, certification, discipline interfaces, the dedicated currentness thread, the D9 source contract, and cross-discipline reasoning remain zero. D4 through D9 remain unstarted. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 305 files and 1808 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory 1119441 on uuid. Release governance typecheck passed, tests passed at 121, and the ledger returned ok.

## Next phase

The next phase is EOS-D3-R2-SITE-INVESTIGATION-AND-EVIDENCE-CONTEXT, type SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT. It records investigation and evidence context on exact R1 identities. It does not interpret stratigraphy, derive parameters, calculate, recommend foundations, validate engineering, or start D4 through D9. This closeout does not start that phase.
