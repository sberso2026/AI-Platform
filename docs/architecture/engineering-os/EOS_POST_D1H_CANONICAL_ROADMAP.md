# Post-D1H canonical roadmap

This is a new roadmap governance decision. The phase identifier EOS-D1I-0-STRUCTURAL-DIGITAL-TWIN-ARCHITECTURE did not exist in the repository before this decision. This document supersedes only the post-D1H scheduling sentence in EOS_POST_D1G_CANONICAL_ROADMAP.md. That earlier document remains the historical record of the D1G closeout and the D1H track.

## D1H closeout

EOS-D1H-R5-STRUCTURAL-INSPECTION-CONDITION-CLOSEOUT remains the D1H closeout. D1H status remains COMPLETE_BOUNDED_WITH_LIMITATIONS. D1H maturity remains STRUCTURAL_INSPECTION_CONDITION_BOUNDED_RUNTIME_IMPLEMENTED. This decision does not promote D1H to software engineer validation, method conformance, or structural adequacy automation.

## Next track and next phase

The next canonical D1 structural track is D1I STRUCTURAL DIGITAL TWIN. The name is not renamed here to structural health monitoring, asset monitoring, BIM, predictive maintenance, or asset integrity.

The next canonical implementation phase is EOS-D1I-0-STRUCTURAL-DIGITAL-TWIN-ARCHITECTURE. Its type is structural digital-twin architecture. It is architecture only. This decision does not implement a digital-twin runtime.

## D1I purpose

D1I is the governed structural temporal-state layer. It may reference and organize structural identity, design or reference state, analytical state, analysis-result state, inspection and condition state, measured state, inferred state, historical state, and an optional future monitoring or telemetry state. It preserves the authority and provenance of each source. A structural digital twin is not a 3D model, an analysis model, an inspection database, the latest solver result, a live sensor feed, or the digital thread.

## Digital thread

The digital thread records traceability and relationships across engineering work. The digital twin represents governed asset or system state through time. D1I reuses the existing digital thread. It does not create a parallel digital thread. The two interact and are not identical.

## Source of truth

D1I references canonical upstream objects. It does not re-author D1A structural identity, D1F structural-system state, D1G analysis results, or D1H evidence, findings, measurements, condition states, or temporal history. Future D1I reuses D1A and D1F identities for structural system, member, connection, support, and foundation where applicable. No parallel digital-twin asset identity is planned. Twin identity is not asset identity, and a twin requires a governed structural target. Scope is a structural system or another explicitly bounded asset or system scope. Whole-facility ownership is not inferred.

Future D1I references canonical analysis model identity, analysis run identity, raw, normalized, and governed result identity, result authority, provider provenance, and fingerprints from D1F and D1G. No parallel analysis-result domain is planned. Analytical state is not physical state. A solver result is not an observed state. A floating latest analysis reference is not allowed.

## D1H ownership

Future D1I may reference inspection context, evidence, finding, measurement, human validation, engineering interpretation, rating, condition state, association, continuity, measurement comparison, change evidence, and analysis link. Those references are identifiers and fingerprints only. D1I cannot mutate D1H history, supersede a D1H finding, supersede a D1H condition state, or change a D1H rating. Condition state remains owned by D1H. Current and historical condition references do not copy the condition body. Absence of a finding is not a healthy twin state. Absence of evidence is not a healthy twin state.

## State classes

Future architecture must keep these classes distinct: design or reference state, analytical state, observed state, measured state, engineering interpreted state, condition state, inferred state, predicted state, and optional telemetry state. Observed state is not analytical state. Measured state is not predicted state. Inferred state is not measured state and must be marked explicitly. Condition state is not structural adequacy. The latest state is not governing truth. A state class does not by itself confer authority. Prediction engines are not implemented. Confidence is not engineering certainty.

Design or reference state references governed design or system records and does not copy original design data. Analytical state references an exact model, run, and result context and is not physical truth. Observed state comes from governed inspection and observation sources and reuses D1H evidence and findings. Measured state comes from governed measurements and reuses D1H measured evidence. Future telemetry may later extend measured state and is not implemented here. Predicted state is model or forecast derived and is not observed state.

## Current, time, and history

Current effective state is governed. It is not database insertion order, not the newest timestamp alone, and not the latest solver run alone. Selecting it requires authority. AI cannot select the governing current state. Different classes may be current at the same time. One universal current state is not required. Component states do not automatically define system state. There is no universal health score and no automatic system-health aggregation. A digital twin is not a single numeric health score.

A temporal snapshot references the exact source states valid for a declared time and context. It does not copy source bodies. A historical snapshot references exact versions and fingerprints and does not float to a later source. Distinct times remain state effective time, observation time, measurement time, inspection time, analysis time, source capture time, record creation time, and snapshot time. Temporal order is not database insertion order and is not identifier order. Historical state remains reproducible after newer states exist. An as-of view uses records effective under those explicit temporal semantics. It is not current records filtered by creation date. A digital twin does not require continuous live connectivity.

## Conflict

A state conflict is an explicit governed record. Examples include an analysis and measurement discrepancy, conflicting condition assessments, conflicting measurements, conflicting interpretations, and different source authority states. Conflicts are preserved. They are not automatically reconciled, averaged, overwritten, or selected. Analysis does not override observation. Observation does not override analysis. An engineering disagreement is not always a software error. Disagreement is not damage and is not a model error. Agreement between measured and predicted values is not model validation. AI may summarize a conflict and cannot resolve it.

## Authority and excluded runtimes

Every future state reference preserves source authority, validation state, time, version, fingerprint, and provenance. Provenance names the source domain, source object, source version, source fingerprint, state class, authority, effective time, the applicable capture or run or inspection time, validation state, and project, workspace, and tenant. A twin or snapshot fingerprint derives from those references. It does not hash copied source bodies into a second authoritative version. Invalidation marks staleness when structural identity, an analysis result, a condition state, a measurement, a rating scheme, authority, or a source state changes. Invalidation does not mutate the upstream source. D1I history preserves twin snapshots, state-reference changes, current-state selections, and conflict records without rewriting upstream history.

Human engineering authority remains required for governing current-state selection, conflict resolution, and engineering interpretation. AI may summarize state, compare sources, identify discrepancies, suggest stale references, suggest review priority, and suggest candidate associations. AI may not select governing physical truth, approve a condition, declare structural adequacy, declare a structure safe or unsafe, modify a structural model, or approve a repair.

This decision implements no telemetry runtime, no structural health monitoring runtime, and no new D1 structural health monitoring phase. Future sensor or monitoring functionality remains a seam for a later roadmap decision. It implements no automatic model calibration, no automatic model update from measured, condition, or inferred state, no automatic capacity, section-property, or material-property change, no solver execution, and no automatic solver trigger. It implements no automatic condition-rating engine, no deterioration prediction, no predictive maintenance, no causal diagnosis, no structural adequacy runtime, and no repair recommendation or repair design. It is not BIM and it does not author BIM or CAD. A 3D view is not the twin. There is no person twin and no employee surveillance.

## D1I-0 authorization

EOS-D1I-0-STRUCTURAL-DIGITAL-TWIN-ARCHITECTURE is authorized to define, and not to implement, twin identity, the state-source reference model, state classes, time semantics, current and effective state, snapshot semantics, conflict semantics, source authority, source validation, provenance, fingerprints, invalidation, history, as-of views, D1H condition references, D1F and D1G analytical references, a future telemetry seam, the AI authority boundary, and the D1J, D1K, and D1M seams.

Its non-goals are telemetry runtime, structural health monitoring runtime, automatic calibration, model updating, a prediction engine, a deterioration engine, an adequacy engine, a repair engine, solver execution, optimization, CAD or BIM authoring, a 3D requirement, and a person twin.

A later architecture review may consider a bounded sequence of twin identity and state references, temporal snapshot and as-of and current-state governance, state conflict and observed or measured or analytical composition, an optional telemetry reference boundary, and closeout. That sequence is provisional. This decision does not canonicalize those later identifiers.

## Later structural tracks and packs

D1J Structural Optimization Certification is not started. D1K Cross-Discipline Structural Interfaces is not started. D1L Structural Global Certification Gate is not started. D1M CAD or BIM intelligence and D1N concept-to-detailed orchestration remain unimplemented boundaries. D1I does not absorb D1M or D1N.

The canonical pack order remains D1 structural, D2 civil, D3 geotechnical, D4 mechanical, D5 piping, D6 process, D7 electrical, D8 instrumentation and control, and D9 cross-discipline intelligence. This decision does not start D2 or D3. Closing D1H does not complete the structural pack.

## Debt that remains

D1H software engineer validation and D1H method conformance remain pending. Concrete C10 human review, D1F system-orchestrator human review, and SPACE GASS live validation remain pending. That validation debt does not block this architecture authorization. It continues to block engineer-validated and conformance claims.

The known GA security debt remains two failing assertions and one EOS-A16D root cause. It blocks general availability. It does not block this D1I architecture authorization.

## Claims permitted by this decision

Post-D1H roadmap canonicalized. D1I selected as the next structural track. EOS-D1I-0-STRUCTURAL-DIGITAL-TWIN-ARCHITECTURE authorized.

Claims not made: D1I runtime implemented, digital twin implemented, digital twin equals digital thread, digital twin equals analysis model, digital twin equals latest solver result, D1I owns D1H records, D1I mutates D1H history, analysis state equals physical state, inferred state equals measured state, predicted state equals observed state, AI selects governing truth, newest record governs, conflicts are automatically reconciled, a sensor stream is required, automatic calibration exists, automatic model update exists, capacity assessment exists, deterioration prediction exists, safe or unsafe determination exists, repair design exists, a person twin exists, D1J started, D1K started, D1L started, D2 started, D3 started, D1 complete, D1H engineer validated, or GA security debt resolved.

No database migration and no engineering formula are added.
