# EOS-D1H-R3 condition state, rating, and interpretation

This phase implements one bounded domain runtime for structural condition state, profile-bound condition rating, and governed engineering interpretation. It reuses the D1H-0 architecture, the D1H-R1 inspection context, target, coverage, and evidence, and the D1H-R2 finding, measurement, human-validation, provenance, and history records. It does not determine structural adequacy, reduce capacity, design a repair, assess fitness for service, predict deterioration, or implement a digital twin.

Maturity is STRUCTURAL_CONDITION_STATE_RATING_INTERPRETATION_RUNTIME_IMPLEMENTED. That state is not structural adequacy assessment, capacity assessment, engineer validation, or conformance validation. The condition-state, condition-rating, and engineering-interpretation runtime counts are one each. Automatic rating, severity scoring, capacity assessment, repair design, and engineering-formula counts are zero. No database migration is added. No parallel capability manifest is created.

A finding is not a condition rating. A measurement is not a condition rating. A condition rating is not structural adequacy, member capacity, asset safety, or a repair decision.

## Rating schemes

The inspection-intelligence platform already defines pack-specific condition-rating schemes. The inventory known to this phase is structural_ordinal_1_5 version 1.0.0 in the structural_condition pack, and generic_numeric_0_100 version 1.0.0 in the generic pack. That platform rejects use of incompatible schemes together. This runtime does not register either scheme as a production default, does not copy its aggregation, and does not create a second generic rating product.

A rating scheme used here is an explicit governed catalog record: scheme identity, scheme version, profile reference, scheme authority, applicability, target kinds, value definitions, provenance, fingerprint, and status. Applicability may name a project, asset owner, client, inspection standard, asset class, and target kinds. Those fields are matched only when supplied. They are not inferred from geography, jurisdiction, file name, client name, asset type, finding type, or an AI recommendation. Scheme authority must be human. An AI authority cannot select a scheme.

A rating value is a code and label defined by that scheme, plus an optional description reference and an explicit order only when the scheme supplies one. Order is not inferred from alphabetic labels or from parsing a numeric-looking code. A code such as 1 or 2 is a scheme label. It is not a continuous engineering quantity, and it is not averaged. Different schemes are not compared, translated, normalized, or treated as the same order. A test-only scheme cannot be stored as a production default. There is no production default scheme.

## Condition state

A condition state records identity, inspection context, inspection session, the existing R1 target and target kind, assessment scope, optional scheme and rating, optional interpretation, assessment basis, supporting findings, measurements, evidence, and validations, coverage references and their limitations, an input-validation summary, authority, status, limitations, provenance, version, and fingerprint. The target is the R1 target. No parallel target model is created. Member, connection, support, foundation, bounded region, and structural system are explicit target levels when the selected scheme lists that kind. Member ratings do not create, average, or worst-case a system rating. A system condition state exists only when it is explicitly authored.

Effective states are current, historical, superseded, stale, and invalid. A new current state for the same target, scheme version, and assessment scope supersedes the prior current state and leaves the prior record in place.

Absence of findings does not create a good rating and is not good condition. Coverage is referenced and its limitations are kept. Full, partial, and inaccessible coverage do not select or degrade a rating. Supporting findings, measurements, and evidence must belong to the same target and context. Referencing them does not determine the rating. The input-validation summary records each support as human-confirmed or unvalidated. Unvalidated inputs are not promoted. More validations do not raise the rating or a confidence score.

A draft or unrated condition state may omit a rating. It still requires an explicit assessment basis. A current state requires a rating. A rating may omit a full interpretation when the assessment basis is explicit.

## Engineering interpretation and rating authority

An engineering interpretation records the target, supporting references, author, optional reviewer, statement, engineering basis references, limitations, assumptions, authority, provenance, version, and fingerprint. A governing interpretation requires human authority and at least one basis reference that is not model memory alone. An AI draft may be stored and does not govern. It is not promoted automatically. An interpretation is not structural adequacy, a capacity assessment, or repair approval.

A condition rating records the scheme identity and version, the scheme value code, target, assessment basis, optional interpretation, supporting references, limitations, assessor authority, time, provenance, version, and fingerprint. Unknown schemes cannot govern, including imported ratings. Changing or retiring a scheme version marks dependent ratings and condition states stale. No automatic rating engine selects a value from findings, measurements, defect counts, coverage, validation counts, analysis results, or AI confidence. Analysis results remain contextual. A prediction is not an observed condition and is not a measurement.

Condition validation reuses the R2 validator authorization catalog and workflow roles. R3 adds scoped subjects for condition state, condition rating, and engineering interpretation. Validation of those subjects is not structural adequacy or asset safety. Reviewer identity and role are preserved. Independence is not inferred. The R2 self-review policy is unchanged: there is no universal self-review prohibition and no independence claim.

## History, provenance, invalidation, and result

Interpretation, rating, and condition-state history is append-only. A correction creates a successor. The predecessor body remains reproducible. Supersession is an explicit link and an effective state. This phase does not associate the same defect across inspections and does not predict a condition trend.

Fingerprints are deterministic for the scheme, interpretation, rating, and condition state. A change of scheme version, rating value, target, interpretation, supporting finding, supporting measurement, validation reference, coverage limitation, or authority changes the relevant fingerprint.

Provenance runs from the structural system through context, coverage, evidence, finding, measurement, human validation, interpretation, rating scheme, rating, and condition state. Invalidation covers stale evidence, corrected findings and measurements, withdrawn validation, corrected interpretation, scheme change, target staleness, coverage correction, context supersession, and withdrawn authority. Upstream R1 and R2 staleness propagates. Withdrawing a validation does not delete the condition state. Conflicting measurements are not averaged. Conflicting findings are not resolved. Conflicting interpretations are not merged.

Completeness is only for the declared condition scope: complete for that scope, partial, incomplete, invalid, stale, or undetermined. Complete is not good condition or structural adequacy. The runtime result reports target, interpretation, rating, and condition-state identifiers, scope, completeness, runtime diagnostics, and blocking runtime diagnostics. Diagnostic codes are not structural findings. The result is not structural adequacy or repair approval. Events record interpretation, rating, and condition-state capture, supersession, and invalidation. An event is not engineering approval.

## Boundaries and handoff

The runtime does not change section properties, material properties, capacity, supports, releases, loads, or the analysis model. It does not create analysis input from a rating. A measured section loss does not update a design section. It does not recommend or design a repair, classify safe or unsafe, or treat a good label as safe or a poor label as unsafe. It does not assess fitness for service or predict corrosion rate, fatigue life, remaining life, or crack growth. AI does not receive engineering, rating, or condition authority. The runtime does not recognize faces or profile people. No digital-twin runtime is implemented.

A future digital-twin reference may cite condition-state identity, target, effective state, scheme and version, rating value, interpretation, evidence, finding, measurement, and validation identifiers, provenance fingerprint, and time. Evidence is not copied.

The next phase is EOS-D1H-R4-TEMPORAL-HISTORY-ASSOCIATION-ANALYSIS-LINKAGE. It can rely on inspection context, structural target, coverage, evidence, finding, measurement, human validation, engineering interpretation, rating scheme and version, condition rating, condition state, authority, provenance, fingerprints, history, supersession, invalidation, and completeness. Its scope is bounded cross-inspection finding association, condition-state temporal continuity, historical change comparison, and governed analysis-result linkage, without deterioration prediction, causal diagnosis, capacity modification, or a digital twin.
