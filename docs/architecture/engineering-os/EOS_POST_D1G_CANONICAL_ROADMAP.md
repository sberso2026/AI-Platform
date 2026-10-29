# Post-D1G canonical roadmap

This is a new roadmap governance decision. It does not implement structural inspection, condition assessment, or any engineering method. The phase identifier EOS-D1H-0-STRUCTURAL-INSPECTION-CONDITION-ARCHITECTURE did not exist in the repository before this decision.

The prior read-only audit found that D1F-0 ended its numbered sequence at D1G and that the older structural completion plan still pointed its own next step at D1A. That audit result remains historical. This document is the current authoritative sequence after D1G.

## D1G closeout

D1G remains closed at EXTERNAL_SOLVER_INTEGRATION_IMPLEMENTED_WITH_SPACE_GASS_READ_ONLY_OFFLINE_CONFORMANCE_VALIDATED. Closeout commit f47c0fb4c8983aa44bf1669fd7ebccd4c66e62f1. Live provider validation, engineer validation, code conformance, and structural-analysis capability are not promoted. Offline connector conformance is not live validation. Live connectivity is not model validation.

## Next track and next phase

The next canonical D1 development track after this decision was D1H STRUCTURAL INSPECTION & CONDITION. That track is now closed at bounded runtime maturity. See the D1H closeout section.

The next canonical implementation phase after this decision was EOS-D1H-0-STRUCTURAL-INSPECTION-CONDITION-ARCHITECTURE. That architecture is defined in EOS_D1H_0_STRUCTURAL_INSPECTION_CONDITION_ARCHITECTURE.md. The bounded evidence foundation EOS-D1H-R1-STRUCTURAL-INSPECTION-EVIDENCE-FOUNDATION is implemented. The bounded finding, measurement, and human-validation foundation EOS-D1H-R2-STRUCTURAL-FINDING-MEASUREMENT-VALIDATION-FOUNDATION is implemented. The bounded condition-state, profile-bound condition-rating, and engineering-interpretation runtime EOS-D1H-R3-CONDITION-STATE-RATING-INTERPRETATION is implemented. The bounded temporal association, historical comparison, and analysis-result linkage runtime EOS-D1H-R4-TEMPORAL-HISTORY-ASSOCIATION-ANALYSIS-LINKAGE is implemented. The closeout EOS-D1H-R5-STRUCTURAL-INSPECTION-CONDITION-CLOSEOUT records that chain as complete with limitations. Structural adequacy, capacity assessment, repair design, deterioration prediction, causal diagnosis, and digital-twin implementation are not implemented.

## D1H purpose

D1H governs structural inspection and condition evidence. The historical completion-plan source covers cracking, corrosion, section loss, deformation, fatigue indicators, connection distress, foundation movement, and vibration evidence. This decision also includes inspection observations, measurements, AI detections, AI classifications, engineering interpretation, condition ratings, and human validation. None of these are implemented by this decision.

Future D1H reuses governed structural identities from D1A and D1F: structural system, member, connection, support, and foundation identity, together with project context, provenance, and the digital thread. It does not create a parallel structural object model.

## Evidence and authority

Future architecture uses the existing D0 inspection finding classes where they apply: observed defect, measurement, AI detection, AI classification, engineering interpretation, condition rating, and human validation. Observation is the observed-defect class. It is not a second taxonomy.

An observed defect is not an engineering condition decision. A measurement is not adequacy. An AI detection is not a validated defect. An AI classification is not an engineering interpretation. AI detection is not an engineering condition decision. AI classification is not condition acceptance. A condition rating is not repair approval. Inspection evidence is not engineering adequacy.

A condition observation does not automatically change design capacity. A crack, corrosion measurement, deformation, vibration observation, or section loss does not alter member capacity without an explicit governed engineering assessment method. A D1H finding does not automatically change analysis stiffness, support state, release state, section properties, loads, or materials.

Planned evidence source classes, not implemented here, are human inspection, photos, video, measurements, documents, instrumentation references, analysis-result references, and historical inspection records.

Evidence provenance for the future architecture must preserve who or what created the evidence, capture time, asset or member identity, source artifact, measurement units, location, classification source, human validation state, and version fingerprint.

Future AI may detect candidate defects, classify a candidate defect type, summarize inspection evidence, compare historical observations, and suggest review priorities. AI may not confirm engineering severity, declare a structure safe or unsafe, approve a condition rating, approve a repair, alter design capacity, or alter an analysis model without a governed human engineering workflow.

## Platform reuse

Future D1H reuses @rtb/inspection-intelligence. Repository-confirmed platform concepts include inspection sessions, defects, assessments, condition ratings, the structural_condition pack SDK, visual templates, and condition templates. No parallel inspection platform is planned. The generic inspection package is not D1H completion. Structural pack inspection models remain unimplemented.

## D1H-0 scope

EOS-D1H-0-STRUCTURAL-INSPECTION-CONDITION-ARCHITECTURE will define, and will not implement, structural inspection context, inspection-event identity, linkage to structural asset, member, connection, and foundation identity, evidence identity, finding taxonomy, measurement semantics, condition-state semantics, the AI evidence boundary, the human validation boundary, separation of severity from confidence, temporal history, provenance, fingerprints, invalidation, historical reproducibility, links to analysis results where appropriate, and the future handoff to D1I.

## D1H-0 non-goals

That architecture phase excludes automatic engineering condition acceptance, repair design, fitness-for-service calculations, remaining-life prediction, fatigue-life calculations, corrosion-rate prediction, structural capacity reduction, automatic defect-severity engineering decisions, digital-twin runtime, live sensor processing, and autonomous inspection approval, unless a later explicit governance decision adds one of those subjects.

## Later structural tracks

D1I STRUCTURAL DIGITAL TWIN remains after D1H and is not implemented. D1H is not D1I. D1H may later produce condition evidence that D1I can reference. No D1 structural health monitoring phase is created. Where an existing digital-twin ownership note says structural health monitoring owns live structural and sensor streams, that seam stays with that note.

D1J Structural Optimization Certification remains not implemented. Its dependency on a certified solver is unmet by the offline SPACE GASS connector. D1J is not started.

D1K Cross-Discipline Structural Interfaces remains not implemented. D1F seams exist. D1K runtime does not. D1K is not started.

D1L Structural Global Certification Gate remains not implemented. D1G closeout is not completion of the structural pack.

D1M CAD or BIM intelligence and D1N concept-to-detailed orchestration remain unimplemented boundaries. This decision does not add scope that the repository did not already state.

## Discipline pack order

The canonical pack order remains D1_STRUCTURAL, D2_CIVIL, D3_GEOTECHNICAL, D4_MECHANICAL, D5_PIPING, D6_PROCESS, D7_ELECTRICAL, D8_INSTRUMENTATION_CONTROL, D9_CROSS_DISCIPLINE_INTELLIGENCE. D2 Civil and D3 Geotechnical stay planned. This decision does not start D2 or D3. D2 does not follow from D1G closeout alone. D1F foundation interfaces are not D3 implementation.

## Debt that remains

Concrete C10 human review pending, D1F system-orchestrator human review pending, and SPACE GASS live validation pending do not block D1H architecture. They continue to block engineer-validated and conformance claims.

The known GA security debt remains two failing assertions and one EOS-A16D root cause. It blocks general availability. It does not block bounded D1H architecture work.

## Claims permitted by this decision

Post-D1G roadmap canonicalized. D1H selected as the next track. D1H-0 architecture phase authorized.

Claims not made: D1H implemented, structural condition assessment implemented, structural inspection model implemented, D1 complete, D2 started, D3 started, inspection AI has engineering authority, condition rating equals adequacy, D1G live validation, concrete engineer validation, D1F orchestration engineer validation, or GA security debt resolved.

No database migration and no engineering formula are added.

## D1H closeout

EOS-D1H-R5-STRUCTURAL-INSPECTION-CONDITION-CLOSEOUT closes the D1H track at STRUCTURAL_INSPECTION_CONDITION_BOUNDED_RUNTIME_IMPLEMENTED. Status is COMPLETE_BOUNDED_WITH_LIMITATIONS. The canonical chain is D1H-0 architecture, R1 inspection context and evidence, R2 finding measurement and scoped human validation, R3 interpretation and profile-bound condition rating and condition state, and R4 association, continuity, historical comparison, change evidence, and governed analysis linkage. Registered rating-scheme content is frozen for an id and version, and temporal comparison also requires the scheme fingerprint captured at assessment time.

This maturity means a governed structural inspection and condition information runtime exists with bounded temporal continuity. It does not mean software engineer validation, method conformance, structural adequacy automation, capacity assessment, repair approval, fitness for service, deterioration forecasting, causal diagnosis, or a digital twin. Record-level human validation of an inspection subject is not validation of the D1H software.

Remaining D1H debt is software engineer validation pending, method conformance pending, no structural adequacy automation, no capacity assessment from condition, no repair design, no fitness-for-service, no deterioration prediction, no causal diagnosis, no computer-vision runtime, no SHM runtime, no digital-twin runtime, no automatic cross-scheme rating translation, rating-scheme profile governance required, and AI remains advisory. Concrete C10 human review, D1F system-orchestrator human review, SPACE GASS live validation, and the GA security debt remain. They do not block this bounded closeout. The GA security debt still blocks general availability.

D1I STRUCTURAL DIGITAL TWIN remains unimplemented. This roadmap names that track and does not define an exact implementation phase identifier. The next authorized development step is EOS-ROADMAP-POST-D1H-CANONICALIZATION. That roadmap governance step must formally record this closeout, confirm D1I as the next structural track, define its first governed architecture phase and boundaries, reuse D1H condition history by reference, and prevent digital-twin state from reauthoring or overriding D1H inspection and condition evidence. D2 is not started by this closeout. D1J, D1K, and D1L remain not implemented. D1M and D1N remain unimplemented boundaries.

## Scheduling successor

The closeout finding above is preserved. It recorded that no exact D1I implementation phase identifier existed at D1H closeout. The later governance decision EOS-ROADMAP-POST-D1H-CANONICALIZATION is recorded in EOS_POST_D1H_CANONICAL_ROADMAP.md. That successor supersedes only the post-D1H scheduling sentence. It does not rewrite this historical D1G or D1H record.

