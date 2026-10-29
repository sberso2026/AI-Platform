# EOS-D1L-R4 Certification Authority and Decision Record Closeout

## R1 dependency

A certification decision names one current R1 claim and the exact evidence manifest recorded for it. A missing claim or manifest is rejected. The decision stores the claim fingerprint and the manifest fingerprint. R4 does not replace, repoint, or edit that claim or manifest.

## R2 dependency

The decision names one existing R2 eligibility result and its result fingerprint. R4 does not evaluate requirements again and does not contain a second eligibility engine. A missing result, a floating eligibility reference, or a result whose stored fingerprint no longer matches its governed content is rejected.

## R3 dependency

The decision copies the standard fingerprint, jurisdiction fingerprint, requirement-set identity, requirement-set version, requirement-set fingerprint, and mapping fingerprint from the eligibility result that R3 supplied. R4 does not resolve profiles again and does not create another profile catalog. A result without that profile context cannot be decided.

## Certification-authority identity

An authority record binds one actor, one tenant, one workspace, one project, the permitted claim types, the permitted claim scopes, one standard profile, and one jurisdiction profile. The actor who registers the record must be that same actor and must already hold the certification-authority role. Display name, email, and job title are not identity.

## Authority evidence

The record requires an authority evidence reference and a provenance reference. Empty or floating evidence is rejected. R4 does not invent credentials.

## Authority scope

The authority must cover the claim type, claim scope, standard profile, and jurisdiction profile on the manifest. A narrower scope does not expand to other claims. One permitted scope does not become a global certification authority.

## Authority versioning

A successor authority record can be added. The predecessor is marked superseded and keeps its fingerprint. A decision already recorded keeps the authority identity and fingerprint used at decision time.

## Administrator separation

An administrator cannot register certification authority and cannot record a certification decision. Technical administration does not imply engineering certification authority.

## AI separation

An AI actor cannot register authority, record a decision, waive a blocker, or impersonate a certifier. AI may only assist outside this authoritative operation.

## Engineer-review separation

Engineer-review authority is a different role. Holding it does not create certification authority, even when that reviewer satisfied the review evidence on the claim.

## Profile-governance separation

The actor who maintains standards and jurisdiction profiles cannot record a certification decision.

## Exact eligibility

A positive decision requires the R2 state to be eligible and the result to be current. The decision pins that result fingerprint. Eligible is not certified until this separate operation is recorded.

## Stale eligibility

A stale eligibility result cannot support a positive decision. That check happens before the decision is stored. It is not post-decision invalidation.

## Profile fingerprints

The standard fingerprint, jurisdiction fingerprint, requirement-set fingerprint, and mapping fingerprint on the decision are the values already stored on the eligibility result.

## Requirement-set version

The decision stores the requirement-set version from that same result. A caller-supplied different version is rejected.

## Mapping fingerprint

The decision stores the mapping fingerprint from that same result. A caller-supplied different mapping fingerprint is rejected.

## Certification-decision record

The record contains the decision id, claim, manifest, eligibility result, profile fingerprints, authority identity and fingerprint, decision, decision scope, decision evidence reference, provenance, decision time, and decision fingerprint. The positive outcome is certified. A denial uses the architecture vocabulary and is not a waiver.

## Decision scope

The stored scope is the manifest claim scope. A wider requested scope is rejected.

## Decision fingerprint

The decision fingerprint uses the existing canonical fingerprint over the stable governed fields. Decision time is not part of that fingerprint. No second hash algorithm is introduced.

## Decision provenance

Provenance names the decision evidence reference and the provenance reference supplied with the authorized decision. It is not inferred from a role.

## Decision history

Authority registration, authority supersession, and decision recording append history. An exact repeat of the same decision returns the existing record. A second different decision for the same manifest is rejected rather than overwritten.

## Immutable dependency references

After the decision is stored, the manifest fingerprint, eligibility fingerprint, and profile fingerprint remain the values captured before the write. A failed integrity check stops the operation.

## No generic waiver

Flags that force certification, skip eligibility, ignore blockers, or waive a hard blocker are rejected for every actor, including a certifier, an administrator, and an AI actor.

## No external certificate issuance

The decision record sets external certificate issuance to false. There is no certificate number, document, seal, or filing operation. A positive decision is not an external certificate and is not product release or general availability.

## R5 invalidation boundary

Repointing a decision and invalidating a decision are rejected in this phase. Revocation runtime is not implemented. The pinned fingerprints are what a later phase can compare when evidence changes.

## D1G debt

The certified-solver status remains not certified. A decision on one eligible design-check claim does not qualify the solver and does not clear live validation, engineer validation, or conformance debt.

## D1K boundary

Where a claim depends on cross-discipline evidence, the decision relies on the R2 result for the manifest that already pins the D1K evidence. R4 does not evaluate that interface again.

## D2 through D9

No civil, geotechnical, mechanical, piping, process, electrical, instrumentation, global reasoning, or cycle-detection runtime is started. D1M and D1N are not absorbed. No database schema is changed.

## Security and release

Decisions require the existing assurance-level check to resolve aal2. An administrator session is not a substitute. Tenant, workspace, and project must match. Spoofed actor ids and forged authority fingerprints are rejected. The known engineering-review and persistence baseline failures remain the pre-existing retrieval-boundary defect. Release classification treats the decision runtime and capability manifest as release-sensitive and this closeout as not release-sensitive. This phase does not promote validation, conformance, solver certification, pack certification, or general availability.

## Readiness

Architecture and the eligibility model stay ready. Certification authority is ready because identity, evidence, scope, and the decision check are implemented and tested. Certification runtime stays not ready because invalidation and closeout remain. Global certification eligibility stays unsatisfied.

## Next authorized phase

The next phase is EOS-D1L-R5-EVIDENCE-INVALIDATION-SUPERSESSION. It governs stale detection, invalidation, supersession, and lineage after a result or decision exists. It must not rewrite historical decisions. That phase is not started here.
