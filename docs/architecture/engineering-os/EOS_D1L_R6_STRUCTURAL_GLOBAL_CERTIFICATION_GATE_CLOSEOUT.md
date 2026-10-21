# EOS-D1L-R6 Structural Global Certification Gate Closeout

## Purpose

D1L governs whether a scoped structural claim has an exact evidence package, a deterministic eligibility result, an authorized human decision, and a later statement of whether that decision is still current. Completing the track means that machinery is present and bounded. It does not mean a current claim is eligible, certified, or approved by a regulator.

## Architecture

The D1L-0 architecture remains the parent statement. It separates claim identity, evidence, eligibility, profiles, authority, and later change. Its historical readiness flags stay as they were written at architecture time. This closeout does not rewrite them.

## Claim and evidence

R1 records one scoped claim and one exact evidence manifest. The claim identity, scope, structural target, standard fingerprint, jurisdiction fingerprint, and evidence pins are stored. A later manifest is a new record linked by predecessor. The earlier manifest is marked superseded and is not rewritten.

## Eligibility

R2 resolves the requirements for that claim and returns a deterministic state. Hard blockers are not offset. A fixture can be eligible. Eligible is not certified. The historical eligibility result stays stored when later evidence changes.

## Profiles

R3 binds the exact standard edition, jurisdiction version, requirement set, and mapping used by the evaluation. A later profile version does not rewrite the profile used at decision time. R3 calls the existing R2 evaluation.

## Authority and decision

R4 records one decision by a scoped certification authority. A positive decision requires the current eligible result and matching fingerprints. An administrator, an evidence producer, and an AI actor are rejected. The decision scope cannot exceed the claim scope. The decision record states that no external certificate was issued.

## Invalidation and supersession

R5 compares the historical manifest with the current successor. A governing fingerprint change makes eligibility and decision currentness stale. Invalidation is an appended event. Supersession records lineage and does not create a decision. The historical decision field stays as recorded. Reevaluation names R2. A later decision must call R4 again.

## End-to-end workflow

A governed fixture creates the claim and manifest, pins the standard and jurisdiction, resolves the profile, evaluates eligibility, rejects an unauthorized decision, records an authorized decision inside the claim scope, then changes one evidence fingerprint. The old eligibility state remains eligible as history, current reliance becomes stale and then invalidated, the successor is not certified, and reevaluation is required. That fixture is not production evidence that structural debt is closed.

## Readiness

Architecture is ready. The eligibility model is ready because R2 exists. Certification authority is ready because R4 exists. The certification-governance runtime is ready because R1 through R5 form one tested chain. Current certification eligibility is not satisfied. The historical architecture constants that said the model, runtime, and authority were not ready remain unchanged.

## Current eligibility

D1G live validation, engineer validation, conformance, and certified-solver status remain unmet. A claim that depends on that solver stays blocked. A bounded claim that does not depend on it can still be evaluated. That does not clear the global debt.

## Authority readiness

The authority runtime can record a scoped certifier and reject other roles. That does not mean every project and jurisdiction already has a certifier.

## D1G and claim-specific debt

D1G remains certification-blocking where the claim depends on the solver. Concrete C10 review remains blocking for a concrete design-check claim that depends on it. D1F system-orchestrator review remains blocking for a system-scope claim that depends on it. D1H engineer validation remains blocking for a claim that uses inspection-condition evidence. D1I validation remains blocking for a claim that uses twin or D1I conformance evidence. D1J validation and unavailable concrete parameter semantics remain blocking for an optimization-study claim that uses them. None of these are closed here.

## D1K

Live internal discipline integration is not ready. Cross-discipline intelligence is not ready. D1L reads governed D1K pins. It does not implement D2 through D8 or D9.

## External issuance and revocation

A positive decision is not an external certificate. Invalidation is not regulatory revocation. Both issuance and revocation runtimes stay absent.

## AI and administrator boundaries

AI cannot grant certification, mark a claim certified, waive a hard blocker, reactivate an invalidated decision, recertify, or rewrite history. An administrator cannot override a hard blocker or reactivate a decision. Technical administration is not certification authority. Profile governance and engineer review are not certification authority.

## Digital thread and fingerprints

The chain is structural target, engineering evidence, claim, manifest, profiles, eligibility, authority, decision, currentness, and audit history. The same canonical fingerprint function covers each record. No second hash and no parallel thread are added.

## Reconstruction

The decision stores the claim, scope, manifest, evidence fingerprints, standard, jurisdiction, requirement set, eligibility result, authority, and decision. Later change does not alter those stored values. A separate currentness record says whether the decision is still current, which governed reason applies, what superseded it, and whether reevaluation is required.

## Security and release

Tenant, workspace, and project scope stay on the records. Known engineering-review and persistence failures remain the pre-existing retrieval-boundary defect. Release classification treats this closeout runtime and the capability manifest as release-sensitive and this document as not release-sensitive. This closeout does not promote validation, conformance, solver certification, pack certification, or general availability.

## GA security debt

GA security debt still blocks general availability. Closing D1L does not make the product generally available.

## Maturity and completion

The maturity is a bounded certification-governance runtime. The track status is complete with limitations. Track completion is not eligibility, is not certification of every structural claim, and is not completion of the structural pack.

## Structural pack

D1M remains not absorbed. Its recorded scope is that CAD or BIM intelligence remains an unimplemented boundary. No architecture phase identifier is canonical, so this closeout does not name or start one. D1N remains not absorbed. Its recorded scope is that concept-to-detailed orchestration remains an unimplemented boundary. The structural pack stays incomplete. D2 through D9 stay not started.

## Next phase

The next structural subject is that D1M boundary, and D1N remains after it. Because the repository has no canonical phase name, type, or authorized architecture phase for D1M, the next phase is not canonicalized and is not ready to start. This closeout does not execute it.

## Non-claims

D1L does not claim that all structural calculations are validated, that all solvers are certified, that all structural claims are eligible, that all designs are certified, that certification is regulatory approval, that certification is professional statutory sign-off, that the product is generally available, that the structural pack is complete, or that multidisciplinary or D9 intelligence exists. There is no certification confidence score and no weighted score.
