# EOS-D3-R11 D9 Source Contract Closeout

## Purpose

R11 exposes one bounded Geotechnical source contract for future D9 consumption. The contract projects governed D3 facts and metadata that already exist on exact revisions from R1 through R10. It does not create engineering facts, derive parameters, generate recommendations, calculate, transfer Geotechnical, Structural, or Civil authority, infer lineage, fabricate a missing counterpart, reason across disciplines, or start D9 or D4 through D8. The live D3 runtime count is eleven. The D9 source-contract runtime count is one. D9 remains unstarted.

D1 structural pack complete remains no. D1N stays closed. The Civil track remains complete with classification COMPLETE_BOUNDED_WITH_LIMITATIONS and runtime count eleven. D2 is not reopened. Earlier D3 modules keep their historical runtime counts of one through ten. On the R10 module the D9 source contract stays unready and R11 stays unstarted. R12 is named and not started.

## Canonical contract reuse

The contract reuses the architecture field list for object identity, object type, exact revision, lifecycle, currentness, provenance, authority, assumptions, requirements, decisions, evidence, geotechnical parameters, investigation context, D1 interface records, D2 interface records, limitations, lineage, review and validation state, and canonical fingerprint. Nested stratigraphy, material classification, groundwater, field and laboratory tests, foundation excavation and slope context, changes, and interface handoffs sit beside those fields in the same contract. No parallel D3-to-D9 interchange architecture was created. Fingerprints use the existing canonical fingerprint function. No second fingerprint algorithm was added.

## Exact revision binding

Every exported item binds to the revision already stored on the source record. Objects, evidence, and most records use their provenance reference. Requirements and handoffs use their source revision. Review and validation records use their subject revision. Floating revisions such as latest or current are rejected as a source revision. A later source revision does not repoint a recorded contract. Replay of the same contract identity, fingerprint, tenant, and exact revision returns the existing contract. A different fingerprint for the same contract identity is rejected.

## Source categories

Where a governed record is in scope, the contract exposes identity, investigation and evidence context, stratigraphy, material classification, groundwater context, field and laboratory test records, geotechnical parameters, foundation excavation slope and ground-improvement context, requirements, assumptions, decisions, change and reassessment state, interfaces and handoffs, review and validation state, currentness, and lineage. Scope follows the contract object and descendants already linked by an explicit parent object identity. Exposure stays bounded to those stored records.

## Truth classification

The contract keeps observation, interpretation, test result, parameter, recommendation, requirement, assumption, decision, change, interface, review, and validation as distinct classes. An observation is not an interpretation. A test result is not an engineering parameter. An engineering parameter is not a validated design parameter. A recommendation is not an approval. Parameter values are copied with validated-design and test-result flags false. Recommendation text is copied with approved false.

## Authority, currentness, and review

Each item carries Geotechnical context authority. Consuming the contract does not make D9, an AI actor, or an administrator the Geotechnical authority. Currentness is one of current, stale, reassessment required, or superseded. A stale or superseded source is not exposed as current. A reassessment-required source is not exposed as validated. Review state and validation state are both explicit. Reviewed is not validated. Validated is not conformant, approved, or certified. Represented-as-validated is true only when the contract currentness is current and a validation on that exact object revision is validated with engineering validated.

## Provenance, lineage, limitations, and fingerprint

Provenance identifies the originating D3 record, the exact revision, source evidence where it applies, authority, adoption context, lineage, and currentness. Lineage reuses the R10 edges whose source or target is the contract object pin or an in-scope evidence record. Inferred lineage is rejected and is not auto-repointed. Applicable source limitations are copied, including the standing limitation that this contract is for future D9 consumption and does not create facts or transfer authority. When currentness is not current, that currentness is also stated in the limitations. The canonical fingerprint covers the projection before the fingerprint field is attached.

## Missing counterparts and D1 and D2

R8 handoff metadata is reused. A handoff is complete only when its status is complete and a counterpart pin exists. A missing counterpart stays null and the handoff stays incomplete. Structural handoffs remain D1 interface references. Civil handoffs remain D2 interface references. Other counterpart disciplines stay interface metadata. The contract does not reproduce D1 or D2 engineering as D3-owned facts and does not transfer Structural or Civil authority.

## Integrity

Duplicate contract identity, replay, wrong revision, stale source cited as current, superseded source cited as current, cross-project access, cross-tenant access, authority spoofing, provenance spoofing, fingerprint mismatch, fabricated lineage, and fabricated counterpart data are rejected. Source snapshots of objects, evidence, parameters, recommendations, handoffs, and validations must remain unchanged. Records are frozen after they are written. History keeps the created fingerprints. Tenant, workspace, and project scope is enforced. No schema change and no new dependency were added.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 315 files and 1818 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. Integration tests passed. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1. The moderate advisory remains GHSA-w5hq-g745-h8pq on uuid 8.3.2 through exceljs. Release governance typecheck passed, tests passed at 131, artifact classification passed, and the ledger returned ok.

## Next phase

The next phase is EOS-D3-R12-GEOTECHNICAL-BOUNDED-CLOSEOUT, type GEOTECHNICAL_BOUNDED_CLOSEOUT. It performs bounded D3 track closeout across R1-R11. Verify architecture-to-runtime traceability, exact readiness states, discipline boundaries, D9 source-contract integrity, security/release posture and unresolved limitations. Do not add substantive D3 runtime, perform engineering calculations, close D1 debt, start D4-D9 runtime, or claim project/engineering validation, certification, conformance or GA readiness. This closeout does not start that phase.
