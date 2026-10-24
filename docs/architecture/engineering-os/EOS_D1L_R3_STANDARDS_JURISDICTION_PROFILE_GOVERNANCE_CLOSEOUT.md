# EOS-D1L-R3 Standards and Jurisdiction Profile Governance Closeout

## Standard-profile model

R3 binds a governed standard profile to an existing R1 catalog profile. Identity is the catalog profile id, family, code, edition, amendment, version, and fingerprint. Display names are not authoritative. The publisher, adopting authority, EOS maintainer, provenance, and lifecycle status are recorded with that identity. Active status means the profile may be selected. It does not mean the engineering is compliant, certified, or legally approved.

## Family and edition

The standard family is stored separately from the edition and version. A family value that equals the edition or version is rejected. Selecting a family does not resolve the latest edition.

## Amendments

The amendment is an explicit catalog field. A base edition and the same edition plus an amendment are different profiles with different fingerprints. An amendment is not implied by the base edition.

## Jurisdiction-profile model

A jurisdiction profile reuses the existing jurisdiction id allowlist and the R1 catalog version and fingerprint. Country and region are governed metadata. Free-form text is not an identity. The profile is not inferred from a user location or an IP address, and a request to infer either is rejected.

## Standard and jurisdiction mapping

A mapping names one standard profile, one jurisdiction profile, one claim type, one claim scope, and one requirement set. It has its own id, version, authority, provenance, lifecycle, and fingerprint. A published standard is not treated as adopted, and an adopted profile is not treated as proof that a claim conforms.

## Requirement-set model

A requirement set names the mandatory, conditional, and advisory requirement ids for one claim type and scope. It has an id, version, authority, provenance, and fingerprint from the existing canonical fingerprint function. It does not contain engineering equations.

## Requirement mapping

Resolution returns the mapping and requirement set whose standard, jurisdiction, claim type, and claim scope match the pinned manifest. The applicable list is the mandatory ids, plus conditional ids whose governed trigger is present, plus authorized project additions.

## Mandatory, conditional, and advisory

Mandatory ids stay on the applicable list. A caller flag that downgrades them is rejected. Conditional ids use the allowlisted triggers for a declared consequence profile or a declared cross-discipline dependency. Advisory ids stay advisory. No model interprets whether a requirement applies.

## Authority

Registration requires the profile-governance authority. That role is not the certification authority, not an administrator, and not an AI actor. An evidence producer may resolve and may ask R2 to evaluate. A profile governor may not evaluate eligibility. The user who selects a profile is not recorded as the publisher of the standard.

## Provenance

Each standard profile, jurisdiction profile, mapping, and requirement set stores a provenance reference. Empty provenance is rejected. Provenance is not invented from a display name.

## Versioning

Edition, standard version, jurisdiction version, mapping version, and requirement-set version must be exact. Floating tokens such as latest, current, newest, applicable edition, and latest amendment are rejected. Nothing is upgraded because a newer external edition exists.

## Fingerprints

Standard and jurisdiction fingerprints are the R1 catalog fingerprints. Mapping and requirement-set fingerprints use the same canonical fingerprint function over their governed fields. No second hash algorithm is introduced. A different amendment, edition, or requirement list produces a different fingerprint.

## History

Registration and supersession append history rows that keep the record id and fingerprint. Older rows are not overwritten.

## Supersession

A successor profile is added and the predecessor is marked superseded. The predecessor fingerprint remains. Manifests that pinned the predecessor still resolve to it. The successor is not written onto those manifests.

## Precedence

Composition order is the base certification architecture, then the jurisdiction profile, then the standard profile, then the consequence or reliability profile seam, then an authorized project or client overlay. The order is returned with every resolution.

## Profile conflict

Two active mappings for the same standard, jurisdiction, claim type, and claim scope return a profile-conflict diagnostic with no selected mapping. Unknown standards, unknown jurisdictions, and combinations without a mapping are explicit diagnostics. No weaker generic requirement set is substituted. The automatic resolution count is zero.

## Project and client overlay

An overlay may add requirement ids. It may not remove a mandatory id. There is no free-text override.

## R1 integration

Resolution reads the manifest pins and compares a fingerprint of the manifest before and after. A change fails closed. R3 does not replace the standard or jurisdiction references on an existing manifest. A new manifest is required to pin a successor profile.

## R2 integration

When a mapping resolves, an evidence producer may call the existing R2 evaluator with the exact standard fingerprint, jurisdiction fingerprint, requirement-set id, requirement-set version, requirement-set fingerprint, and mapping fingerprint. R2 remains the only eligibility evaluator. A profile governor cannot make that call.

## Reevaluation after profile change

A successor active profile for the same family sets successor reevaluation required. The previous R2 result stays in its store with its original eligibility state and fingerprint. Eligibility does not move to the successor by itself.

## Consequence and reliability seam

A conditional requirement can name the existing consequence-profile trigger. R3 does not calculate a consequence class or a reliability factor.

## AI boundary

AI cannot register a standard or jurisdiction profile, change requirement severity, waive a requirement, resolve a conflict, or mark a claim certified.

## Legal-compliance boundary

R3 stores governed profile metadata. It does not interpret statutes, issue a legal opinion, or decide that a jurisdiction is legally certified. EU high-bar governance remains an architecture foundation, not a legal certification.

## No code calculation

R3 does not add load, strength, resistance, combination, detailing, or reliability equations, and it does not download or scrape standards.

## No certification decision

The resolution carries a null certification authority. There is no certification decision, issuance, or revocation runtime. Certification runtime, certification eligibility, and certification authority stay not ready. The eligibility model stays ready.

## D1K boundary

Cross-discipline evidence remains the D1K pin on the manifest. R3 does not add another cross-discipline interface. A profile cannot mark a solver certified, and the current D1G uncertified status stays in force.

## D2 through D9 boundaries

No civil, geotechnical, mechanical, piping, process, electrical, instrumentation, global reasoning, or cycle-detection runtime is started. D1M and D1N are not absorbed. No database schema is changed.

## Security and release

Profile registration is tenant, workspace, and project scoped. In-place version mutation is rejected. The known engineering-review and persistence baseline failures remain the pre-existing retrieval-boundary defect. Release classification treats the profile runtime and capability manifest as release-sensitive and the closeout document as not release-sensitive. This phase does not promote validation, conformance, solver certification, certification, or general availability.

## Remaining limitations

Profiles and mappings are in-memory governed records. They do not judge whether a calculation satisfies a clause, and they do not authorize a certifier. Structural pack certification remains incomplete. General-availability security debt still blocks general availability.

## Next authorized phase

The next phase is EOS-D1L-R4-CERTIFICATION-AUTHORITY-DECISION-RECORD. It may define certification-authority identity and a decision record that can act only on an exact eligible result and exact evidence and profile fingerprints. It must not bypass eligibility or fabricate engineering validation. That phase is not started here.
