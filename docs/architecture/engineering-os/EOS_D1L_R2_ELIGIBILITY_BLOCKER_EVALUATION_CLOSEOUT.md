# EOS-D1L-R2 Eligibility and Blocker Evaluation Closeout

## R1 dependency

R2 evaluates one current R1 certification claim and the exact evidence manifest that belongs to it. A free-form claim, a mismatched manifest, or a fingerprint that does not match the stored manifest is rejected. R2 does not replace or repoint that manifest.

## Requirement resolution

The requirement set is the governed D1L-R2 set, version 1. It selects design, analysis, validation, engineer-review, conformance, solver, D1K, standard, and jurisdiction requirements from the claim type, scope, and the diagnostics already pinned on the manifest. A caller cannot disable a requirement, supply a different rule set, or add free-form rules. An unknown rule is rejected. A mandatory requirement that cannot be evaluated does not pass.

## Claim eligibility

The result states are blocked, pending, eligible, indeterminate, and stale. Eligible means the deterministic rules found no hard blocker, pending condition, or indeterminate dependency for that scoped claim. Eligible is not certified. One eligible claim does not make the structural pack certification-ready, and it does not satisfy the broader D1L certification-eligibility state. Certification runtime and certification authority remain not ready.

## Blockers and advisories

Hard blockers cover missing, stale, invalid, and insufficiently authorized evidence, failed or missing validation, failed or pending engineer review, missing or failed conformance, unqualified solver qualification, unresolved parameter semantics, and the D1K conditions below. Pending review or validation keeps the claim pending. Advisories cover deferred standards-clause governance and the general-availability security debt. An advisory does not block eligibility. Passing evidence does not offset a hard blocker. There is no weighted score and no confidence score.

## Evidence and authority

R2 reads the pinned evidence state. Presence of a pin is not sufficiency. Engineer review counts only when the recorded review state is satisfied and the recorded authority is an engineer reviewer. Conformance counts only when its recorded state is satisfied and its authority is the conformance authority. R2 does not create the review, the conformance result, or a solver certification. Administrator and AI authority on evidence are insufficient.

## D1G and claim-specific debt

An analysis-result claim, and any claim whose manifest pins solver qualification, carries the current D1G debt as hard blockers: live validation, engineer validation, conformance, and certified-solver status. A design-check claim with no solver pin does not receive those blockers. Concrete C10 review blocks only a claim whose pinned evidence declares that review pending. D1F orchestrator review blocks only a structural-system claim whose pinned evidence declares that dependency. D1H and D1I debt block only claims whose pinned evidence declares those dependencies. An optimization-study claim carries the pending D1J engineer and conformance debt. Unavailable concrete parameter semantics block only a claim whose pinned evidence declares that use. None of this debt is closed here.

## D1K

R2 uses the D1K interface, revision, and fingerprints pinned by R1. Stale required D1K evidence, an unresolved conflict, and incompatibility are hard blockers. Indeterminate or missing compatibility stays indeterminate and is not treated as compatible. A recorded human disposition does not approve certification. The pin is not replaced with a later interface.

## Profiles

The exact standard edition, version, and fingerprint, and the exact jurisdiction version and fingerprint, are required. Floating versions are blockers. R2 does not upgrade either profile and does not fall back to a generic profile. Clause-level standards and jurisdiction rules remain for the next phase and are reported as an advisory, not guessed. A consequence or reliability profile is required only when the pinned evidence declares that requirement. No class factor is calculated. If that required profile was not supplied, the claim is blocked.

## Freshness, history, and provenance

The result fingerprint binds the claim fingerprint, manifest fingerprint, requirement-set version, blocker states, and eligibility state through the existing canonical fingerprint. A changed evidence fingerprint makes the prior current result stale and requires a new manifest before a new eligible result. The previous eligible result remains in history. Provenance points at the manifest provenance and names the deterministic evaluator as the producer. The evaluator is not an AI actor and not an administrator. Overrides and waivers are rejected.

## Boundaries

There is no certification decision, issuance, or revocation. No conformance runtime, engineer-validation runtime, solver certification, solver, or engineering formula was added. D2 through D9, cycle detection, and global dependency reasoning were not started. D1M and D1N were not absorbed. No production schema changed. The structural pack is not complete.

## Security and release

Workspace and tenant scope are enforced. Rule changes, requirement deletion, and administrator overrides are rejected. Engineer validation, conformance, solver certification, certification issuance, and product general availability were not promoted. General-availability security debt remains an advisory to engineering eligibility and continues to block product general availability. The inherited security suite remains a raw failure on the known migration and persistence boundary tests.

## Next authorized phase

The next phase is EOS-D1L-R3-STANDARDS-JURISDICTION-PROFILE-GOVERNANCE. It governs the exact standards, editions, jurisdiction profiles, and requirement mappings used by D1L. It does not issue certification. That phase is not started here.
