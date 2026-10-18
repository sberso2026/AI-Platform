# EOS-D1I-0 Structural Digital Twin Architecture

## Roadmap authority

This architecture is authorized by the post-D1H canonical roadmap. The roadmap selected D1I as the next structural track and named this phase EOS-D1I-0-STRUCTURAL-DIGITAL-TWIN-ARCHITECTURE. That identifier did not exist before the governance decision. This document defines the architecture. It does not implement a digital-twin runtime.

D1H remains closed at COMPLETE_BOUNDED_WITH_LIMITATIONS with maturity STRUCTURAL_INSPECTION_CONDITION_BOUNDED_RUNTIME_IMPLEMENTED. This phase does not promote D1H engineer validation or conformance. It does not promote C10, D1F, or D1G live validation.

## Purpose

D1I composes governed references to existing structural identity, analytical state, and inspection or condition history. The twin is a temporal composition of those references. It is not a second engineering source of truth.

D1I may own twin identity, state-reference metadata, snapshot identity, current-state selection records, conflict records, as-of view definitions, and twin-specific provenance, fingerprints, and history. D1I must not own duplicate authoritative copies of structural identity, analysis results, inspection evidence, structural findings, measurements, condition ratings, or condition states.

## Digital Twin versus Digital Thread

The existing digital thread records who did what, when, why, using which evidence, versions, and decisions. It lives in the engineering-os digital-thread package and is reused. No parallel digital thread is created.

The digital twin answers what governed states and references describe the structural asset through time. The thread and the twin are different systems. A thread event is not a twin state, and a twin reference is not a replacement for the thread.

## Digital Twin versus analysis model

An analysis model, analysis run, and analysis result remain owned by D1F and, for an external provider result, by D1G. A twin may pin those identities. It does not become the model, the solver, or the result store. An analytical state is not a physical state. A solver result is not an observed state.

## Digital Twin versus inspection database

Inspection context, coverage, evidence, findings, measurements, human validation, engineering interpretation, rating schemes, ratings, condition states, associations, continuity, comparisons, change evidence, and analysis links remain owned by D1H. A twin may reference them. It does not copy their bodies, mutate them, supersede them, or delete them. Condition state stays owned by D1H. D1I does not re-author it.

## Digital Twin versus BIM and 3D

A digital twin is not a BIM model and is not a 3D model. This phase does not author BIM, author CAD, or run a 3D viewer. D1M and D1N are not absorbed.

## Ownership model

D1A and D1F own structural system, member, connection, support, and foundation identity. D1F and D1G own analysis models, runs, raw results, normalized results, governed results, cases, combinations, provider provenance, and model-validation evidence. D1H owns inspection and condition records. D1I owns only the reference composition: twin identity, state references, current-state selections, snapshots, and conflict records. Future telemetry source identity is a seam, not a runtime.

Including a source in a twin does not promote its authority and does not promote its validation state.

## Twin identity

A twin identity names the twin, tenant, workspace, project, scope, governed structural target, purpose, authority, governance profile, created time, version, fingerprint, and recorded status. Twin identity is not structural asset identity. The twin references the asset. It does not replace it.

An orphan twin is not allowed. Every twin binds a governed structural target: a structural system, member, connection, support, foundation, or another explicitly governed D1 target. No parallel asset model is created.

## Twin scope

Permitted scopes are a structural system or a bounded structural asset scope. A component twin does not imply a whole building, a whole facility, or a whole project.

## State references

A state reference belongs to D1I. The referenced engineering object stays upstream. The reference records the state class, source domain, source object type and identifier, source version, source fingerprint, source authority, source validation state, structural target, effective time, known-at time, source-specific times, reference status, limitations, provenance, version, and fingerprint.

The reference does not copy the source body. It does not float to the latest analysis, condition, measurement, finding, model, or evidence. Exact source object identity, version, and fingerprint are required where the source supports them.

## Source-domain taxonomy

Source domains are design or reference from D1A, structural system from D1F, analysis from D1F, external analysis result from D1G, inspection and condition from D1H, future telemetry, and other governed source. A source domain is not a state class.

## State-class taxonomy

State classes are design or reference, analytical, observed, measured, engineering interpreted, condition, inferred, predicted, and telemetry. A state class is not authority. Measured, analytical, and observed states do not govern automatically. Several classes may coexist for the same target.

Observed is not measured and is not analytical. Measured is not predicted and is not inferred. Condition is not structural adequacy. Design or reference state points at the source and does not copy the design body.

## Analytical references

An analytical reference pins the analysis model, model version and fingerprint, analysis run and run fingerprint, result or result set, case or combination, location, authority class, and model-validation state where the source has one. Raw, normalized, and governed result classes stay distinct. A failed or nonconverged result may remain a historical reference when D1F policy allows it. It cannot govern physical truth. An analysis reference does not float to a newer run.

## Observed, measured, interpreted, and condition references

Observed state references D1H observation or evidence or finding semantics. Measured state references a governed D1H measurement. A future telemetry source may supply an additional measured reference only through a later governed implementation. Engineering interpreted state references D1H interpretation. Condition state references D1H condition state.

## Inferred and predicted categories

An inferred state, when a later phase records one, must preserve method identity, inputs, method version, authority, validation, uncertainty or confidence where supplied, and fingerprint. No inference engine is implemented. Inferred is not measured.

Predicted state is an architectural category for a forecast or model projection reference. No prediction engine is implemented. Predicted is not measured. Agreement between a prediction and a measurement is not model validation. Disagreement is not damage.

## Authority and validation

Every reference preserves the upstream authority and the exact upstream validation state. A stale source cannot remain the current governing reference without review. An invalid source cannot govern. A reference does not upgrade either field merely by inclusion in a twin.

## Exact source pinning

Reference statuses are current reference, historical reference, stale reference, unresolved reference, invalid reference, and superseded reference. None of those statuses means the reference follows the latest source.

## Bitemporal semantics

Effective time, also called valid time, is when the source state applies to the physical or engineering context. It is taken from governed source semantics. It is not inferred from record creation alone.

Known-at time, also called recorded time, is when EOS had the reference available under the governed record history. An inspection that occurred on 1 June and was entered on 10 June has effective time 1 June and known-at time 10 June.

What is now known about 1 June is a different question from what EOS knew on 1 June. As-of-effective time and as-known-at time are not the same query.

Source-specific times are preserved when the source supplies them: inspection time, measurement time, capture time, analysis-run time, condition effective time, validation time, and source creation time.

## As-of views and late data

An as-of-effective view constructs the references whose governed validity covers a declared effective time. An as-known-at view constructs what EOS knew at a declared recorded time.

A late inspection, late measurement, late validation, corrected historical source, or late analysis result may change what EOS now knows about the past. It does not rewrite what EOS knew at the earlier known-at time, and it does not rewrite an already recorded snapshot. A correction may inform a later reconstructed effective view according to explicit source history.

## Current-state governance

A current effective state is a governed selection scoped by twin, structural target, state class, source domain where applicable, and purpose. There is no single universal current state. Current analytical state and current observed state can coexist.

Selection requires explicit authority. AI cannot select the governing current state. The newest record, the latest timestamp, and the latest solver run do not become current automatically.

A selection record preserves the selection authority, selection scope, selection basis, selected source reference, selected-at time, limitations, version, and fingerprint.

## Snapshots

A snapshot names the twin, purpose, effective time and requested temporal context, known-at time where applicable, state-reference identifiers, current-selection references, conflict references, creator, authority, provenance, version, and fingerprint. A snapshot stores references only. It does not copy source bodies.

Once recorded, a historical snapshot stays pinned to the exact versions and fingerprints it named. It does not float to a later source. Completeness is relative to the declared snapshot scope and may be complete for that scope, partial, incomplete, stale, invalid, or undetermined. A complete snapshot is not a healthy structure and is not structural adequacy.

A current snapshot may later be stale and may be superseded by a new snapshot. It is not mutated in place.

Absence of a state reference is not zero, not healthy, and not unchanged.

## Conflicts

A state conflict names the twin, structural target, the state references in disagreement, the conflict type, status, comparison basis, authority, review references, limitations, provenance, version, and fingerprint.

Conflict types include analysis versus measurement, analysis versus observation, measurement versus measurement, condition assessment versus condition assessment, interpretation versus interpretation, authority conflict, temporal conflict, source-version conflict, and other. An engineering disagreement is not automatically a software error.

Conflicts are preserved. They are not auto-resolved and not auto-averaged. If one source is later selected as governing, that selection requires explicit authority. AI may identify an apparent discrepancy, summarize differences, suggest evidence to review, and suggest a candidate explanation for human review. AI may not select truth, overwrite sources, or resolve the engineering conflict.

## Model, capacity, prediction, and repair boundaries

No automatic model calibration is implemented. Measured, observed, condition, and inferred state do not update an analysis model. A state change does not trigger a solver. State does not change capacity, section properties, or material properties. Structural adequacy is not implemented, and twin state is not adequacy. No automatic condition-rating engine is implemented.

No corrosion, crack-growth, fatigue-life, remaining-life, or future-state engine is implemented. No causal diagnosis is implemented. No repair recommendation engine and no repair design are implemented. No predictive-maintenance engine is implemented.

A component state, the worst component, and an average of components do not define system state automatically. No universal health score is created. The twin is not a health score.

## Telemetry and SHM seam

A future telemetry or structural-health-monitoring reference, if a later phase adds one, must name the telemetry source, the sensor or system, the measurement channel, the sampling or time identity, the quality state, the raw versus processed distinction, provenance, and fingerprint. No sensor ingestion and no SHM diagnosis runtime are implemented. A sensor value does not govern physical state automatically. No separate D1 SHM phase is created. The twin works from inspection history, analysis state, and condition state when no live sensors exist.

## Provenance

The provenance graph is twin to state reference to exact upstream source, snapshot to exact state references, conflict to exact conflicting references, and current selection to the chosen reference. Each record carries authority, time, version, and fingerprint.

Every future D1I-owned semantic record preserves tenant, workspace, project, twin, structural target, actor or system, authority, effective time, known-at time, source references, version, and fingerprint. Cross-project and cross-tenant references are not allowed.

## Fingerprints

Future fingerprints are deterministic for twin identity, state reference, current-state selection, snapshot, and state conflict. A state-reference fingerprint includes the upstream source fingerprint. A snapshot fingerprint includes the canonical sorted state-reference identities and fingerprints plus the declared temporal context. A conflict fingerprint includes the canonical sorted conflicting references, the conflict type, and the target.

## Invalidation and history

Invalidation covers a stale structural target, a corrected or superseded upstream source, a source fingerprint mismatch, withdrawn source authority, withdrawn validation, a superseded current selection, a rating-scheme change, a stale analysis result, and a stale D1H condition. Invalidation marks the D1I reference. It does not mutate the upstream source.

A historical snapshot remains reproducible after a referenced source becomes stale. The snapshot is not rewritten. History is append-only for twin versions, state-reference changes, current selections, snapshot creation, conflict records, and conflict supersession. Historical reproducibility is required.

## AI authority

AI may later assist with state summaries, source comparisons, conflict identification, stale-reference identification, candidate current-state suggestions, candidate association suggestions, and review prioritization. AI cannot author a measured state without a governed source, convert inferred state into measured state, select governing truth, approve a condition, declare adequacy, declare safe or unsafe, change an analysis model, or approve a repair.

## Privacy

No person twin, employee surveillance, worker productivity scoring, or person profiling is implemented.

## Neighbouring tracks

D1J Structural Optimization Certification remains unimplemented. A future D1J may consume D1I state only through a later seam. D1K Cross-Discipline Structural Interfaces remains unimplemented. D1M CAD and BIM and D1N concept-to-detailed orchestration are not absorbed. D2 and D3 are not started. The D1 structural pack is not complete.

## Runtime sequence

The canonical sequence is:

EOS-D1I-0-STRUCTURAL-DIGITAL-TWIN-ARCHITECTURE, this architecture phase.

EOS-D1I-R1-TWIN-IDENTITY-STATE-REFERENCE-FOUNDATION, bounded twin identity, governed structural-target binding, exact upstream state references, state-class and source-domain metadata, authority, provenance, fingerprints, staleness, and history, without snapshots, current-state orchestration, conflict resolution, telemetry runtime, or engineering inference.

EOS-D1I-R2-TEMPORAL-SNAPSHOT-CURRENT-AS-OF-STATE-GOVERNANCE, temporal snapshots and current and as-of state governance.

EOS-D1I-R3-STATE-CONFLICT-MULTI-SOURCE-COMPOSITION, preserved conflicts and multi-source composition.

EOS-D1I-R4-EXTERNAL-TELEMETRY-MONITORING-REFERENCE-INTERFACE, a reference interface without sensor analytics or SHM diagnosis.

EOS-D1I-R5-STRUCTURAL-DIGITAL-TWIN-CLOSEOUT.

R1 is the next implementation phase. This document does not implement it. Runtime counts for twins, state references, snapshots, current-state selectors, conflicts, telemetry, model calibration, prediction, and new engineering formulas are zero. No database migration is required.

Maturity of this phase is STRUCTURAL_DIGITAL_TWIN_ARCHITECTURE_DEFINED. It is not a runtime, engineer-validated, or conformance-validated digital twin.
