# EOS-D1H-R2 structural finding, measurement, and human-validation foundation

This phase implements one bounded domain runtime for structural finding identity, governed evidence-to-finding linkage, quantified inspection measurement, and scoped human validation. It reuses the D1H-0 architecture and the D1H-R1 inspection context, structural target, coverage, evidence, provenance, history, and fingerprint conventions. It does not implement condition state, condition rating, engineering interpretation, severity scoring, repair recommendation, repair design, fitness for service, capacity reduction, analysis-model modification, deterioration prediction, computer vision, an AI detection engine, an AI measurement engine, or a digital twin.

Maturity is STRUCTURAL_FINDING_MEASUREMENT_VALIDATION_RUNTIME_FOUNDATION_IMPLEMENTED. That state is not structural condition assessment, engineer validation, or conformance validation. The structural-finding runtime count is one. The measurement runtime count is one. The human-validation runtime count is one. Condition-state, condition-rating, engineering-interpretation, severity, AI-detection, and engineering-formula counts are zero. No database migration is added. No parallel capability manifest is created.

Evidence is not a structural finding. A structural finding is not a condition rating. A measurement is not a condition rating. Human validation is not a condition rating and is not structural adequacy.

## Diagnostic and structural finding

The R1 runtime result still exposes findings and blockingFindings. Those names are retained for compatibility. Their values are runtime diagnostic codes, now also exposed as runtimeDiagnostics and blockingRuntimeDiagnostics with kind RUNTIME_DIAGNOSTIC and structuralFinding false. They are not D1H structural condition findings.

The R2 store keeps structural records in structuralFindings. The R2 runtime result reports findingIds, measurementIds, validationIds, runtimeDiagnostics, and blockingDiagnostics. A diagnostic code such as a missing unit or an unknown target cannot be stored as a structural finding. Finding type must be one of the D1H-0 categories.

## Finding identity and taxonomy

A structural finding records finding identity, inspection context, inspection session, the existing R1 structural target, finding type, location, supporting evidence identifiers, origin, authority, validation state, creator, time, provenance, version, fingerprint, and supersession. Finding types reuse the D1H-0 categories: cracking, corrosion, section loss, deformation, fatigue indicator, connection distress, foundation movement, vibration evidence, and other. A finding type is not a severity and is not a condition rating. Human confirmation of a finding is not a bad-condition claim, an unsafe claim, or a repair-required claim.

Origin is human recorded, imported, AI candidate, or derived from governed evidence. Origin does not set authority. Every finding requires at least one traceable R1 evidence record. A finding with no evidence is rejected. A photo, video, document, measurement evidence class, analysis result, or explicit negative observation does not create a finding by itself. An inspected-with-no-finding-recorded coverage state does not create a finding and is not good condition. An explicit negative observation remains evidence.

The target is the R1 target identity. No parallel finding-target model is created. A local finding requires an explicit location. Location is not guessed, and an AI-suggested location cannot govern. A bounded-region finding keeps the governed R1 parent. An orphan region is rejected.

## Evidence linkage and AI candidates

The evidence-to-finding link is a separate governed record. One evidence record may support several findings. Several evidence records may support one finding. The link records authority, provenance, version, and fingerprint. The link is never automatic. An AI-originated link cannot govern.

An AI candidate finding may be represented with model identity, model version, and execution fingerprint. This runtime does not run detection. The candidate does not govern and is not human-confirmed. There is no silent promotion path. A confirmation, when later authorized, is a separate human-validation record.

Finding validation states are unvalidated, human confirmed, superseded, stale, and invalid. They do not include safe, adequate, or compliant.

## Measurement

A measurement records identity, context, session, the R1 target, evidence, an optional finding, quantity name, value, unit, location, method, source, instrument reference, measurement time, uncertainty and accuracy when explicitly known, authority, validation state, provenance, version, fingerprint, and supersession. Quantity names reuse the existing structural quantity shape. Units reuse the existing canonical internal units. A unit is required. A missing unit is not inferred and is not treated as dimensionless. A dimensionless quantity must say so and must use an explicit dimensionless unit.

Source is human recorded, instrument measured, AI estimated, imported, or governed calculated. An AI-estimated value requires model identity and model version, plus unit and location. It is not instrument measured, and an uncalibrated AI estimate cannot govern. This runtime does not implement an estimator.

A measurement may cite evidence only, or evidence plus a finding. A measurement does not require a finding. A finding does not require a measurement. A measured value does not update a section property, analysis geometry, capacity, or material property. No crack, section-loss, corrosion, deformation, fatigue, foundation, or vibration threshold is implemented. No severity scoring engine is implemented.

Measurement validation states are unvalidated, human validated, superseded, stale, and invalid. They do not include acceptable, pass, or fail as structural condition.

## Human validation

Human validation records identity, subject type, subject identity, subject version, an explicit scope statement, validator identity, workflow role, time, decision, limitations, authority, provenance, version, fingerprint, and supersession. Subject types are evidence identity, evidence-target link, structural finding, finding classification, finding location, evidence-finding link, measurement value, measurement unit, measurement location, and measurement method. They do not include structural adequacy, condition rating, repair approval, or asset safety.

Decisions are confirmed, rejected, needs correction, and superseded. They do not include safe, unsafe, pass design, or approved repair. Workflow roles reuse observer inspector, engineer reviewer, validator, and approver. A role label is not professional registration.

The validator must be present in the supplied authorization catalog for the same tenant, workspace, and project, with authorization true. This runtime does not impose a universal self-review prohibition. Validator identity and role are preserved, and independence is not claimed.

Validation applies only to its subject and scope. Validating a finding does not validate measurements. Validating a measurement does not validate the finding. Validating evidence does not validate condition. Validation does not propagate. It is not engineering acceptance, structural adequacy, asset safety, or repair approval.

## History, supersession, and invalidation

Finding, measurement, and validation history is append-only. A correction creates a successor and marks the predecessor superseded. The predecessor body is not overwritten. Withdrawing a validation does not delete the validation record, the finding, or the measurement.

If supporting R1 evidence or its target becomes stale, dependent findings and measurements become stale. A finding change marks validations scoped to that finding stale. A measurement change marks validations scoped to that measurement stale. Context supersession and withdrawn validator authority are invalidation causes. Invalidation does not delete the subject.

Findings are not matched across inspection sessions. Similar findings are not merged. AI similarity is not identity. Evidence from a different structural target is not linked unless it is the same target. Cross-project and cross-tenant bindings are rejected. Recording a finding does not create coverage. Missing coverage fails closed.

## Provenance, fingerprints, and completeness

Provenance runs from the structural system through the R1 context, coverage, and evidence, then the evidence-finding link, the structural finding, any related measurement, and any human validation of that finding. Finding, measurement, and validation fingerprints are deterministic. A change of finding type, location, supporting evidence, measurement value, unit, method, validation subject, scope, or decision changes the corresponding fingerprint.

Completeness is only for the declared R2 scope: complete for that scope, partial, incomplete, invalid, stale, or undetermined. Complete is not good condition, inspection adequacy, or structural adequacy. The runtime result is not a condition assessment or engineering acceptance. Events record finding, measurement, and validation capture, supersession, invalidation, and withdrawal. An event is not engineering approval.

## Boundaries and R3 handoff

The runtime does not change section properties, material properties, capacity, or the analysis model. It does not recommend or design a repair, assess fitness for service, or predict corrosion rate, fatigue life, or remaining life. It does not recognize faces, identify workers, or score people. AI data may be stored as non-governing candidate metadata only.

The next phase is EOS-D1H-R3-CONDITION-STATE-RATING-INTERPRETATION. It can rely on inspection context identity, structural target identity, coverage identity, evidence identity, structural finding identity, the evidence-finding link, measurement identity, human validation identity, authority, provenance, fingerprints, history and supersession, invalidation, and completeness. Its scope is bounded condition-state identity, profile-bound condition rating, and governed engineering interpretation, using R1 and R2 records, without equating a condition rating to structural adequacy, without automatic capacity reduction, without repair design, and without a digital twin.
