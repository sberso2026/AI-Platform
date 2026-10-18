# EOS-D1H-0 structural inspection and condition architecture

This phase defines the governed architecture for D1H STRUCTURAL INSPECTION & CONDITION. It does not implement a condition engine, an inspection runtime, computer vision, repair design, capacity reduction, or a digital twin. The phase identifier was authorized by the post-D1G roadmap decision. It did not exist before that decision.

Maturity is STRUCTURAL_INSPECTION_CONDITION_ARCHITECTURE_DEFINED. Runtime counts for inspection, condition engine, and AI detection are zero. No engineering formula is added. No database migration is added.

## Roadmap authority

The current sequence is docs/architecture/engineering-os/EOS_POST_D1G_CANONICAL_ROADMAP.md. D1G stays closed at offline SPACE GASS read-only conformance. D1H is the next structural track. D1I structural digital twin remains later and unimplemented. D1J, D1K, and D1L remain unimplemented. D1M and D1N remain unimplemented boundaries. D2 through D9 stay in the existing pack order and are not started. Concrete C10 human review, D1F orchestrator human review, and SPACE GASS live validation remain pending. They do not block this architecture. They continue to block engineer-validated claims. GA security debt still blocks general availability.

## Platform reuse

D1H reuses @rtb/inspection-intelligence. Relevant existing contracts are the inspection session state machine, the generic defect record, engineering assessments, the condition-rating record and pack-specific scheme, the structural_condition pack SDK, visual and condition templates, evidence kinds and provenance, and D0 finding classes: observed defect, measurement, AI detection, AI classification, engineering interpretation, condition rating, and human validation.

The generic platform is not D1H. D1H adds structural target, coverage, finding, measurement, and authority semantics as references. It does not create a parallel session model, defect domain, condition-rating platform, or structural object model. A condition rating continues to use an existing scheme identifier. No universal rating scale is created. Schemes that vary by client, asset owner, jurisdiction, inspection standard, or project stay profile-bound. Location does not select a scheme.

## Structural identity

Targets reference existing identities. A structural system uses the D1A and D1F system identity. A member, connection, support, or foundation uses the corresponding D1F identity. A bounded region is attached to one of those objects. D1H does not define a new member, connection, support, or foundation.

## Inspection context and session

A structural inspection context records its identifier, tenant, workspace, project, structural system, the existing inspection session identifier, an explicit purpose, scope, time, coverage scope, method references, source authority, governance profile, provenance, version, fingerprint, and status. Purpose is one of routine, detailed, special, post-event, targeted, follow-up, or other. Purpose is declared. AI does not infer it from uploaded evidence.

The session identifier is the existing inspection-intelligence session. D1H does not create a second session lifecycle.

## Target and location

A local finding or measurement requires an explicit location. Location kinds are member station or range, connection region, foundation or support location, coordinate reference, surface or face, and image or video region. A location is not guessed. AI may suggest a candidate location. An unconfirmed AI location does not govern.

## Coverage and negative evidence

Coverage is explicit for a target, region, method, inspection event, access state, limitations, and provenance. The access results are not inspected, inaccessible, inspection scope unknown, inspected with no finding recorded, and inspected with findings. These are different states. No finding recorded is not good condition and is not proof that no defect exists. No evidence is not a healthy state. An explicit human statement that no relevant defect was observed applies only to the declared visible scope. It is not general negative evidence, and it does not prove a hidden condition. Coverage limitations are preserved.

## Evidence, observation, and finding

Evidence records identity, context, session, target, source class, source artifact, capture time, capture actor or system, location, method, unit where relevant, authority, validation state, provenance, version, and fingerprint. Source classes are human observation, photo, video, measurement, document, instrumentation reference, analysis-result reference, historical inspection reference, and AI-derived candidate evidence. These point at existing evidence artifacts. A derived record does not overwrite the source artifact.

An observation is a recorded statement tied to evidence. It is not an engineering finding. One observation may support zero, one, or many findings. One finding may cite many evidence items. Links do not merge records automatically.

A structural finding has a category, target, location where applicable, supporting evidence and observations, and a separate classification authority. Categories are cracking, corrosion, section loss, deformation, fatigue indicator, connection distress, foundation movement, vibration evidence, and other. No detection or assessment rule is implemented. Authority is human observation, governed import, or AI candidate. An AI candidate classification cannot govern.

## Identity across inspections

Association states are new finding, possible match, human-confirmed same condition, human-confirmed distinct, and superseded association. Geometric proximity, image similarity, and AI similarity do not make two observations the same defect. AI may suggest an association. Confirmation is human and scoped. Geometry, image, and proximity do not auto-merge findings.

## Measurement

A measurement records quantity, value, unit, location, method, source, instrument reference where known, time, explicit uncertainty when known, authority, provenance, and fingerprint. Quantity and unit are required. A missing unit is not inferred. Sources are human recorded, instrument measured, AI estimated, imported, and calculated by a later governed method. An AI estimate is not an instrument measurement. An uncalibrated AI numeric estimate cannot govern. A future calibrated estimate still records model identity, model version, scale basis, units, location, confidence or uncertainty, and validation state.

Conflicting measurements are preserved. They are not averaged. Duplicate evidence identity does not count as independent corroboration. A conflict requires a governed resolution and remains visible until that resolution exists.

## Severity and confidence

Severity is separate from AI confidence, detection confidence, measurement uncertainty, and condition rating. No universal minor, moderate, or severe thresholds are defined. No crack-width, corrosion, or section-loss threshold is defined. A later severity scheme must be profile-specific. Confidence is score metadata. It is not engineering severity, not a condition rating, not human validation, and not engineering certainty.

## Interpretation, condition state, and rating

An engineering interpretation references findings, evidence, target, author, reviewer, statement, basis, limitations, time, authority, validation state, provenance, and fingerprint. AI may draft one. An AI draft cannot govern.

A condition state is a governed assessment state, not raw evidence. It requires human authority. AI has no condition-state authority. The rating identifier and scheme identifier reuse the existing condition-rating record. A rating is not structural adequacy, member capacity, or a statement that repair is needed.

## Human validation

Validation names the role and the exact subject: evidence identity, finding classification, finding association, measurement, engineering interpretation, or condition rating. Roles are observer or inspector, engineer or reviewer, validator, and approver. These are workflow roles, not a legal registration conclusion. Validating one finding does not validate the rest of the inspection. Validation is not design approval, repair approval, or a declaration that the asset is safe. There is no automatic safe or unsafe class. A human observation is evidence and is not an engineering assessment unless the role and scope say so.

## Time

History is append-only. Evidence captured at one time, a finding created later, validation, a condition rating, and a later assessment remain distinct records. A new inspection does not overwrite a prior inspection. A new condition state does not overwrite a prior state. A new validation does not overwrite a prior validation. The later current state points at its predecessor. Current and historical states are both retained. A structural revision does not delete historical inspection evidence. It may mark a target reference stale.

Comparison across inspections may be represented later. This architecture does not predict corrosion rate, crack growth, fatigue life, or remaining life. An observed change is not a causal diagnosis.

## Analysis, capacity, and model protection

A D1H record may cite a governed D1F or D1G analysis result as context, including member force context, predicted deformation, or support reaction context. The reference does not reinterpret the result. An analysis result is not an observed condition. An analysis prediction is not a measured response. Measured response is not inferred response. Measured deformation is not analysis displacement unless an explicit comparison link is made, and even then they remain different records.

A finding does not change section dimensions, material strength, stiffness, capacity, or resistance. Measured section loss does not replace the design section. A finding does not change the analysis model, supports, releases, or loads. A crack measurement stores width, length, orientation, and location only when those values were explicitly measured. No crack severity formula exists. A fatigue indicator is a finding category, not a fatigue-life calculation. Corrosion evidence is not a corrosion-rate prediction. Foundation movement references a D1F foundation and is not settlement or geotechnical design. Connection distress references a D1F connection and is not bolt, weld, or connection capacity design.

## Provenance, fingerprints, and invalidation

The intended chain is project and context, structural object, inspection context and session, coverage, source evidence, observation, finding, measurement where present, engineering interpretation, condition state and rating, human validation, and a future D1I reference. A governing record preserves tenant, workspace, project, source, actor or system, timestamp, target, authority, version, fingerprint, and upstream evidence references. Cross-project and cross-tenant evidence binding is not allowed.

Fingerprints cover inspection context, coverage, evidence, finding, measurement, association, engineering interpretation, condition state, and human validation. An evidence fingerprint uses source artifact, capture metadata, target, location, method, measurement metadata, authority, and version. A finding fingerprint uses target, location, finding type, supporting evidence, authority, and version. A condition-state fingerprint uses finding and evidence references, rating profile, interpretation, applicable validation references, and version. User-interface state is not part of these fingerprints.

Invalidation causes are corrected source evidence, changed target identity, changed classification, corrected measurement, corrected location, changed association, changed rating profile, changed interpretation, and withdrawn or superseded validation. The prior record remains.

## AI and privacy

An AI detection candidate records model identity, model version, execution fingerprint, source evidence, candidate location, candidate class, confidence, time, and provenance. It is not a validated finding. Computer vision, crack detection, corrosion detection, damage segmentation, and video tracking are not implemented. Structural health monitoring streams, modal identification, and frequency extraction are not implemented. No new D1 structural-health-monitoring phase is created.

Photos and video remain asset and evidence records. D1H does not implement employee surveillance, worker scoring, behavior profiling, productivity scoring, or a person twin.

Repair recommendations may be referenced later through the existing recommendation records. This phase does not design a repair and does not give AI repair-approval authority. A condition state does not establish fitness for service.

## D1I handoff

A future structural digital twin may reference a structural object identity, the current governed condition state, condition history, evidence references, measurement references, human-validation references, provenance, fingerprints, and timestamps. It does not copy or re-author D1H evidence. D1I is not implemented. This phase creates no twin runtime.

## Proposed runtime sequence

The proposed sequence, not implemented here, is:

EOS-D1H-R1-STRUCTURAL-INSPECTION-EVIDENCE-FOUNDATION for inspection context, target linkage, coverage, evidence identity, source provenance, and historical preservation.

EOS-D1H-R2-STRUCTURAL-FINDING-MEASUREMENT-VALIDATION-FOUNDATION for findings, measurements, and scoped human validation.

EOS-D1H-R3-CONDITION-STATE-RATING-INTERPRETATION for condition state, profile-bound rating, and engineering interpretation.

EOS-D1H-R4-TEMPORAL-HISTORY-ASSOCIATION-ANALYSIS-LINKAGE for append-only history, confirmed cross-inspection association, and contextual analysis links.

EOS-D1H-R5-CLOSEOUT-AND-D1I-HANDOFF for closeout and the digital-twin reference handoff.

## R1 handoff

The next phase is EOS-D1H-R1-STRUCTURAL-INSPECTION-EVIDENCE-FOUNDATION. Its scope is a bounded runtime for structural inspection context, target linkage, inspection coverage, evidence identity, source provenance, and historical preservation, reusing inspection-intelligence and D1A and D1F identities, without condition rating or engineering acceptance.
