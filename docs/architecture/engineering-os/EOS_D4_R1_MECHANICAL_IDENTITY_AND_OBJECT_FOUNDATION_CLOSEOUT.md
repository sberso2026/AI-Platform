# EOS-D4-R1 Mechanical Identity and Object Foundation Closeout

## Purpose

R1 records one governed Mechanical context and the object identities that context owns. An equipment identity is not equipment duty, mass, or a vendor datasheet. A design-condition identity is not a design pressure. A performance identity is not a calculated capacity. Those engineering conclusions remain later phases.

D1 structural pack complete remains no. D1N stays closed. The Civil track remains complete with classification COMPLETE_BOUNDED_WITH_LIMITATIONS and runtime count eleven. The Geotechnical track remains complete with the same classification and runtime count eleven. D1, D2, and D3 are not reopened. D4-0 architecture runtime flags stay at their historical zero. The live R1 runtime count is one.

## D4-0 taxonomy reuse

Object types are the exact D4-0 allowlist: mechanical system context, mechanical equipment, rotating equipment, static equipment, mechanical package, component context, equipment requirement, design-condition context, performance context, interface point, vendor document context, maintainability context, governance record, requirement, assumption, decision, and evidence reference. An unknown or freeform type is rejected. No second authoritative object model is created.

## Mechanical context

One Mechanical context binds tenant, workspace, project, discipline MECHANICAL, a cited lifecycle stage, provenance, authority MECHANICAL_CONTEXT_AUTHORITY, currentness, and a canonical fingerprint. The context is not an engineering design and is not engineering-validated. The recorder is not Mechanical engineering authority.

## Object identity

Each object identity carries a stable identifier, an allowlisted type, tenant/workspace/project scope, a cited maturity stage, an exact revision through its fingerprint and predecessor, explicit relationships, provenance, currentness, and immutable history. Identity is not engineering content and is not validated engineering.

## Lifecycle and maturity

Maturity reuses CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, and DETAILED_DESIGN. Automatic maturity progression is rejected. A caller cannot advance maturity by recording an identity.

## Scope isolation

Tenant, workspace, and project must match the recorder. Cross-tenant, cross-workspace, and cross-project operations are rejected, including a relationship whose target belongs to another scope.

## Relationships

Relationships are only PARENT and OBJECT_REFERENCE to a current object in the same context and scope. Shared names, shared tags, co-occurrence in a document, spatial closeness, semantic similarity, and commonly associated equipment types do not create an authoritative relationship.

## Provenance, fingerprint, currentness, and history

Provenance is required and preserved. An ungoverned or assistant-authored provenance token is rejected. Fingerprints reuse fingerprintCanonical. The same identity inputs produce the same fingerprint. No second fingerprint algorithm and no parallel currentness engine are created. Currentness on an R1 record is CURRENT or SUPERSEDED. Supersession marks the predecessor SUPERSEDED, appends history, and leaves the predecessor fingerprint unchanged. Direct mutation is rejected. Replay of the same identity and fingerprint returns the existing record. A conflicting identity, a fingerprint mismatch, a type substitution, or a duplicate current identity is rejected.

## Authority boundaries

AI is not Mechanical engineering authority. Admin is not Mechanical engineering authority. D4 does not equal D1, D2, D3, D5, D6, D7, or D8 authority. A source requirement is not a Mechanical interpretation. A process condition is not a Mechanical design condition. A Mechanical design condition is not a validated design condition. Vendor data is not engineering approval. Reviewed is not validated. Validated is not conformant, approved, or certified. R1 does not implement those substantive states.

## Prohibition and runtime state

Runtime has started. Runtime count is one. Equipment context, design conditions, performance, vendor data, mechanical requirements content, maintainability, requirements and change, discipline interfaces, review and validation, the dedicated currentness thread, the D9 source contract, equipment sizing, rotating and static calculations, vibration analysis, fatigue analysis, design optimization, approval, certification, and cross-discipline reasoning remain zero. D5 through D9 remain unstarted. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 318 files and 1821 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance typecheck passed, tests passed at 134, and the ledger returned ok.

## Next phase

The next phase is EOS-D4-R2-EQUIPMENT-AND-SYSTEM-CONTEXT, type EQUIPMENT_AND_SYSTEM_CONTEXT. It records equipment and system context on exact R1 identities, including classification, service or function, package or system membership, equipment category, and governed descriptive Mechanical context. It does not implement design conditions, performance data, vendor data, equipment sizing or calculations, discipline interfaces, review or validation, or D5 through D9 runtime. This closeout does not start that phase.
