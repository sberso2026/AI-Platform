# EOS-D1L-R5 Evidence Invalidation and Supersession Closeout

## Change detection

R5 compares the historical manifest pinned by a certification decision with the current manifest for the same claim. A difference in claim fingerprint or scope, manifest fingerprint, evidence pin, standard fingerprint, or jurisdiction fingerprint is a governed change. Prose is not a change signal.

## Fingerprint dependencies

The comparison uses the fingerprints already stored by R1, R2, and R4. The same canonical fingerprint function covers invalidation events, supersession links, reevaluation requirements, and currentness records. No second hash is introduced.

## Eligibility staleness

When a governing fingerprint differs, the eligibility currentness record is stale and reevaluation is required. The stored R2 eligibility state and result fingerprint are not rewritten.

## Decision staleness

Decision currentness is a separate record. It can say the historical decision is stale. The decision row itself stays as it was recorded.

## Decision currentness

Current means the current manifest still matches the decision pins and no invalidation or supersession has been recorded. Invalidated and superseded are later currentness states. They are not external legal statuses.

## Invalidation

Invalidation is an append-only event. It says the historical decision may no longer be relied on for the current claim state. It does not delete the decision and does not change a positive decision into a negative one.

## Reason taxonomy

Reasons are limited to claim, manifest, evidence, stale evidence, validation, review, conformance, solver qualification, D1K change, stale D1K, standard profile, jurisdiction profile, requirement set, and mapping. An unknown reason is rejected. The recorded reason must be one of the differences actually detected.

## Supersession

A supersession links a predecessor manifest and decision to a later manifest for the same claim and workspace. The successor decision is absent until R4 records one. The predecessor decision is not overwritten.

## Lineage

The link lists the predecessor manifest, eligibility result, decision, successor manifest, and either the successor decision or an explicit marker that no decision has been recorded.

## Reevaluation

A reevaluation requirement names R2 as the evaluator and the detected reasons. R5 does not create an eligible result. A later eligibility call uses the existing R2 function, and a later decision uses the existing R4 function.

## R1 immutability

The historical manifest fingerprint is unchanged by detection, invalidation, and supersession.

## R2 immutability

The historical eligibility result fingerprint and its eligibility state remain unchanged when currentness becomes stale.

## R3 immutability

Profile records are not rewritten when a later manifest selects another standard or jurisdiction.

## R4 immutability

The historical decision field and decision fingerprint remain unchanged. Authority supersession does not rewrite the authority fingerprint stored on the decision, and authority expiry alone does not invalidate that decision.

## R2 reuse

R5 records that R2 must evaluate again. It does not contain a second eligibility engine.

## R4 reuse

A new certification decision is not created here. Recertification has to pass the existing R4 authority check. Supersession cannot set an auto-certify flag.

## D1K reuse

A changed or stale cross-discipline pin on the manifest is read from the D1K fields R1 already stored. R5 does not inspect raw cross-discipline payloads. A stale required D1K pin means the decision is not current.

## Authority change

A later authority record can supersede the authority used at decision time. The decision keeps the earlier authority fingerprint. Future authorization uses the later record. Past decisions are not rewritten and are not invalidated only because the assignment changed.

## Provenance

Invalidation and reevaluation records carry a provenance reference, the old manifest fingerprint, and the new manifest fingerprint where a current manifest exists.

## History

Currentness observations, invalidation events, supersession links, and reevaluation requirements are appended. They are not cleared by a caller flag.

## AI boundary

An AI actor cannot invalidate by judgment, waive reevaluation, or reactivate a decision. Reactivation is rejected for every caller.

## Administrator boundary

An administrator cannot clear invalidation or restore a decision to current. Technical authority is not a reversal path.

## No external revocation

Invalidation is an internal reliance state. There is no regulator action, license action, or external registry update.

## No certificate issuance

R5 does not issue a certificate and does not recertify a successor manifest. A successor manifest is not eligible and not certified merely because it supersedes an earlier one.

## Security and release

Lifecycle writes are limited to the tenant, workspace, and project of the historical manifest. A different workspace cannot supersede the decision. An unrelated claim cannot be presented as the successor. The known engineering-review and persistence baseline failures remain the pre-existing retrieval-boundary defect. Release classification treats this runtime and the capability manifest as release-sensitive and this closeout as not release-sensitive. This phase does not promote validation, conformance, solver certification, pack certification, or general availability.

## Remaining limitations

R5 does not itself run a new eligibility evaluation or a new certification decision. Those remain R2 and R4. It does not judge whether two calculations are equivalent. It does not close D1G debt. Structural pack certification remains incomplete, and certification runtime remains not ready until closeout.

## Readiness

Architecture, the eligibility model, and certification authority stay ready. Global certification eligibility stays unsatisfied. Certification runtime stays not ready because the track closeout remains.

## Next authorized phase

The next phase is EOS-D1L-R6-STRUCTURAL-GLOBAL-CERTIFICATION-GATE-CLOSEOUT. It verifies the certification-governance chain, records remaining blockers, and preserves unresolved engineering debt. It must not fabricate certification eligibility. That phase is not started here.
