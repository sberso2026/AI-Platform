# EOS-D1H-R4 temporal history, association, and analysis linkage

This phase records bounded cross-inspection finding association, condition-state continuity, measurement comparison, change evidence, and analysis-result linkage. It reuses the D1H-0 architecture and the R1, R2, and R3 runtimes. It reuses D1A and D1F structural target identity and D1F and D1G analysis model, run, result, authority, and provider provenance. It does not create a parallel inspection, finding, condition, or analysis-result domain.

## Association

An association names two existing findings, their inspection contexts, one structural target, a cardinality, a status, basis references, authority, limitations, and separate capture, inspection, finding-recorded, and record-created timestamps. Status values distinguish a possible match, a human-confirmed same condition, a human-confirmed distinct condition, unresolved continuity, split lineage, and merged lineage. A possible match is not identity proof. Proximity, image similarity, the same target, and the same location do not confirm the same finding. AI may record only a non-governing candidate. Confirmation requires human authority. One prior finding may relate to several later findings, and several prior findings may relate to one later finding. Association does not merge or delete finding records. A stale target is not rebound. Cross-project and cross-tenant association are rejected.

## Condition continuity

Continuity stores references to two immutable R3 condition states. It does not copy or re-author those states. The same rating code is not an unchanged physical condition. A different rating code is not physical deterioration. Rating values are not compared across schemes or scheme versions. This runtime does not treat a scheme as permitting numeric comparison. Chronological order uses the recorded inspection and condition-effective timestamps. Record order and a project location do not assign time or a timezone.

## Measurement comparison and change evidence

Two measurements are comparable only when the target, quantity, location, method, source, and measurement basis all match, and both values pass the existing unit converters or already share one canonical unit. Unknown basis is not treated as compatible. An unvalidated measurement stays unvalidated. An exact difference is stored only for a comparable, validated pair. That difference is descriptive arithmetic. It is not a deterioration rate, a forecast, a trend fit, a cause, or evidence that a repair was effective. Change evidence keeps the prior and current references, the comparability state, the observed difference, and the two timestamps.

## Analysis linkage

A link binds one catalogued D1F result identity: model id, model version, model fingerprint, run id, run fingerprint, result-set id, normalized result id, result class, authority state, run status, case, combination, location, and D1G provider provenance. It does not bind a latest or current result token. A later run does not move an existing link. A changed result fingerprint marks the link stale. Failed and nonconverged runs remain referenceable and cannot govern condition. The analysis timestamp and the inspection timestamp stay separate, and a different structural-state reference remains a visible temporal mismatch. A predicted value is not a measured value. Agreement is not model validation. Disagreement is not a damage diagnosis. Measurement and condition state do not update the analysis model. Association, comparison, change evidence, and analysis links do not modify capacity or a condition rating, and they do not create an engineering interpretation.

## Provenance, history, and handoff

Fingerprints cover association, continuity, comparison, change evidence, and analysis links. History is append-only. Supersession retains the predecessor. Upstream finding, measurement, target, condition-state, rating-scheme, and analysis-result changes mark dependent records stale and do not delete them. Conflicting associations and comparisons are preserved. A future D1I reference returns identities, provenance, fingerprints, and timestamps. It does not re-author D1H history. Deterioration prediction, causal diagnosis, and digital-twin runtime are not implemented.

The next phase is EOS-D1H-R5-STRUCTURAL-INSPECTION-CONDITION-CLOSEOUT. It audits the bounded D1H chain and the D1I handoff without structural adequacy automation, capacity modification, repair design, deterioration prediction, causal diagnosis, or digital-twin implementation.
