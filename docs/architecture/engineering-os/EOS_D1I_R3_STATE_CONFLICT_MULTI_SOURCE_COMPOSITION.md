# EOS-D1I-R3 State Conflict and Multi-Source Composition

This phase records explicit compatibility assessments, conflict candidates, human confirmation, review and disposition, and multi-source composition on exact D1I-R1 state references and D1I-R2 selections, snapshots, and temporal views. It reuses twin identity, source resolution, authority, validation metadata, effective time, known-at time, selection lanes, and history reconstruction. It does not create a second twin, reference, or temporal runtime.

A difference is not a conflict. A conflict is not a runtime error. A review does not rewrite a source. A resolution is not universal truth.

## Compatibility

An assessment is purpose-scoped. The allowlisted registry covers measured with measured, analytical with measured, analytical with observed, condition with condition, interpretation with interpretation, and observed with observed. Each pair names the comparator version and the required basis. There is no generic comparator and no caller-supplied expression or module.

An unsupported pair is recorded as comparability unresolved. It is not a conflict. Different structural targets are not comparable. Geometry is not used to infer a relationship. Different effective times are not treated as simultaneous. The assessment records a knowledge cutoff, using the trusted clock when the caller omits one.

Physical comparison requires an explicit quantity. Units are checked with the existing unit compatibility function. R3 does not add a converter. Incompatible units or dimensions stay not comparable. Location, axis, sign, measurement method, and analysis case, combination, and location must be explicit when the pair requires them. Missing axis or sign stays unresolved. No axis mapping is inferred.

Condition states are comparable only when the D1H rating-scheme identifier, version, and fingerprint all match. The same scheme identifier and version with a different fingerprint are not the same semantics. A cross-scheme pair is not a conflict.

An analytical value and a measurement may both be recorded. A difference between them is not a conflict, a model error, or damage. R3 does not compute a new numeric difference and does not apply a default tolerance or a percent threshold. A future governed profile may define acceptance criteria. None is applied in this phase. When the declared basis is complete and the descriptive values differ, the assessment can say a difference was observed and still create no conflict.

## Conflict, review, and composition

A conflict candidate is created only after an explicit comparable assessment. A candidate is not a confirmed conflict. Deterministic detection does not turn numeric inequality into a candidate. An AI actor may record a candidate for review and cannot confirm, reject, or dispose of it. Confirmation and confirmation of no conflict require governed human authority and use the trusted clock. The caller cannot backdate the review.

Conflict types are analysis versus measurement, analysis versus observation, measurement versus measurement, condition versus condition, interpretation versus interpretation, source authority, temporal, source version, current-selection inconsistency, and other governed conflict.

A composition lists the exact references, selections, assessments, conflicts, and unresolved pairings for a declared scope. It does not copy source bodies, synthesize a value, average values, or pick a winner. Analytical, observed, measured, interpreted, and condition references can appear together. Missing state stays missing. Incomparable references stay in the composition. Unresolved comparability is not filled in. Completeness against the declared scope is not the absence of conflict, not health, and not adequacy. A conflict is not an unsafe or damaged determination. Absence of conflict is not a safe determination.

Review outcomes are confirm conflict, confirm no conflict, requires more evidence, defer, acknowledge parallel states, and refer to the current-state selection workflow. Review does not promote source validation and is not analysis-model validation. Disposition is a separate purpose-scoped record. It does not change the R2 current selection. Choosing a different current reference requires a separate R2 selection operation. Resolution does not change a D1H condition, an analysis model, or capacity, and it does not run a solver.

## Time, provenance, and invalidation

Each conflict keeps the source effective times and known-at times, the candidate recorded time, and the confirmation time on the successor record. A query as known at a time before confirmation does not report the confirmed conflict. A disposition recorded later is absent from an earlier query. A source registered after an earlier cutoff does not rewrite the conflict history known at that cutoff. Creating a conflict does not change an existing R2 snapshot, and a later snapshot does not rebind an older conflict.

Fingerprints cover the twin, target, exact reference identities, assessment, temporal context, basis, status, and version. Composition fingerprints sort reference and conflict identities, so input order does not matter. Provenance runs from the structural target through the twin and R1 references, through R2 views, snapshots, and selections, to the assessment, conflict, review, disposition, and composition.

History is append-only. Confirmation creates a successor and leaves the candidate record in place. A stale, invalid, or superseded participating reference appends a stale or invalid history event and does not delete the conflict or rewrite the reference. A current-selection change appends staleness on a composition that depended on the prior active selection. A retired comparator version or rating-scheme fingerprint does the same. Withdrawn review authority appends staleness on the review and disposition. Invalidation does not mutate the upstream source.

There is no universal source or state-class priority. Higher authority, more validations, higher advisory confidence, a later source, a majority, or the current selection does not choose a winner or hide the other evidence.

## Boundary and next phase

R3 does not implement telemetry, sensor analytics, model calibration, solver execution, adequacy, capacity, prediction, deterioration, causal diagnosis, or repair. It does not implement a person twin. Cross-project and cross-tenant operations are rejected.

The repository sequence names the next phase EOS-D1I-R4-EXTERNAL-TELEMETRY-MONITORING-REFERENCE-INTERFACE. Its scope is a reference interface for external telemetry and monitoring, without sensor analytics, without SHM diagnosis, and without automatic engineering inference. That phase can use twin identity, state-reference identity, state class, source domain, effective time, known-at time, current selection, snapshot, temporal view, compatibility assessment, state conflict, review, disposition, multi-source composition, provenance, fingerprints, history, and staleness.
