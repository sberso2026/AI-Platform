# EOS-D1M-R4 Unit, Coordinate, and Axis Reference Closeout

## Status

Phase: EOS-D1M-R4-UNIT-COORDINATE-AXIS-REFERENCE

Status: REFERENCE_CONTEXT_IMPLEMENTED

Maturity: STRUCTURAL_CAD_OR_BIM_UNIT_COORDINATE_AXIS_REFERENCE_IMPLEMENTED

Parent architecture: docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md

R1 closeout: docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md

R2 closeout: docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md

R3 closeout: docs/architecture/engineering-os/EOS_D1M_R3_GEOMETRY_SEMANTIC_EVIDENCE_CLOSEOUT.md

Runtime: packages/engineering-os/src/structural-systems/cad-bim-reference-context.ts

This phase records the reference frame required to interpret existing model evidence. It does not convert that evidence, transform it, or decide that it is structurally correct.

## 1. R1, R2, and R3 dependency chain

A reference context exists only for one current R3 geometry or semantic evidence record. That evidence already names the exact R1 artifact revision, R1 metadata fingerprint, R2 mapping, and mapping fingerprint. R4 copies those identifiers. It does not create an artifact, a mapping, or a replacement evidence record. A missing evidence id is rejected. A caller revision, mapping fingerprint, or evidence fingerprint that does not match the stored record is rejected.

## 2. Exact evidence binding

The context stores the evidence id and the evidence fingerprint. Numeric components and semantic source values stay on the R3 record. After a context is recorded, compared, confirmed, or superseded, those source values and the evidence fingerprint remain the values R3 recorded.

## 3. Unit-reference model

The source-declared unit string is copied exactly. A canonical unit is accepted only when that exact string is recognized by the existing unit-family lookup for an explicitly supplied quantity. The recognized families are the existing force, moment, distributed-force, stress, length, and deflection families. The canonical unit is the declared string itself. No parallel unit ontology is created.

## 4. Coordinate-reference model

Source placement uses the D1M coordinate identities already accepted by R3: local, project, shared, and global or site. An optional governed frame may be supplied only when it is one of the existing D1F coordinate systems: global, system, member local, section local, or analysis-provider local. A free-form name is rejected. A D1M identity is not rewritten into a D1F frame. No parallel coordinate system is created.

## 5. Axis and sign-reference model

A source-declared axis string is copied exactly and is never treated as a validated engineering axis. A governed axis is accepted only when it is one of the existing member-end axes UX, UY, UZ, RX, RY, and RZ. A sign convention is accepted only when it is one of the existing sign-convention fields: force sign, moment sign, local axis orientation, member-end convention, solver convention, or design-method convention. No parallel axis or sign system is created.

## 6. Unit compatibility

Comparison reuses the existing unit-family lookup and the D1K conclusion vocabulary. The same resolved family and the same unit string are matching. Different resolved families are incompatible. A length unit and a force unit are therefore incompatible. The comparison does not scale a number.

## 7. Coordinate compatibility

Source identities are compared only against the D1M identity list. Governed frames are compared only against the D1F list. The same known identity is matching. Two known but different identities are incompatible. Related names do not create a transformation.

## 8. Axis and sign compatibility

Governed axes and sign conventions use the same exact-identity rule against the existing axis and sign registries. A source label such as source-x is not in the axis registry, so it does not become a matching engineering axis. Different known axes are incompatible. No rotation is applied.

## 9. Compatibility vocabulary

Conclusions are the D1K convention states: matching, incompatible, missing, and unresolved. The aggregate uses the exported D1K aggregate function. There is no probably-compatible state and no confidence score.

## 10. Indeterminate handling

A missing unit, coordinate, axis, or sign produces missing. An unrecognized declared unit, including millimetre and millimetres, produces unresolved because the existing length family recognizes metre only. Missing and unresolved are not treated as matching, and they are not auto-accepted.

## 11. Unit compatibility versus conversion

Same-family units that are not the same string, such as N and kN, are unresolved with the D1K reason that conversion would be required. The diagnostic records that conversion was not performed. Source component values stay unchanged. Unit conversion runtime count is zero. Calling the existing numeric converters is not part of this runtime.

## 12. Coordinate compatibility versus transformation

A matching or incompatible coordinate result does not mean a transform is available. transformationRequired stays false. Coordinate transformation runtime count is zero.

## 13. Axis compatibility versus transformation

An axis result does not authorize rotation or a sign flip. Axis transformation runtime count is zero.

## 14. No axis inference

A missing axis stays missing. A missing sign stays missing. Line direction, geometry orientation, object class, shape, member name, and source labels are not used to invent an axis or a sign. Axis inference runtime count is zero.

## 15. No normalization

A caller-supplied canonical unit that differs from the declared unit is rejected. A request to normalize, infer a coordinate, infer an axis, or infer a sign is rejected. Declared strings are not trimmed or rewritten into a preferred spelling.

## 16. Authority

Recording authority is interface record authority. Confirmation authority is reviewer authority. The stored evidence authority remains the recorder. Engineering approver and certification authority stay empty. Administrator, engineering-approval authority, and certification authority are rejected. Reference authority is not engineering approval and is not certification authority.

## 17. Provenance

Each context keeps the caller provenance reference and evidence reference. A blank or AI-labelled provenance reference is rejected. Provenance is part of the context fingerprint.

## 18. Fingerprints

The context fingerprint uses the canonical fingerprint function. It covers the evidence fingerprint, R1 metadata fingerprint, mapping fingerprint, declared unit, resolved unit, source coordinate, governed frame, declared axis, governed axis, sign convention, provenance, scope, and predecessor. It does not cover mutable status. A verified fingerprint is not engineering validation. No second fingerprint algorithm is introduced.

## 19. Immutability

The same context id with the same fingerprint returns the existing record. The same id with a different fingerprint is rejected. Silent mutation is rejected. Confirmation changes review status only and leaves the fingerprint unchanged. R3 source values are not assigned by this runtime.

## 20. History

Create, supersede, and confirm append history that retains the context fingerprint and evidence id. Supersession marks the predecessor superseded and records a new current context. Unit, coordinate, axis, and combined context history are preserved. Full staleness and change propagation remain outside this phase.

## 21. Conflict handling

A second current context for the same evidence, without naming the current context as predecessor, is a conflict. Nothing is rewritten to pick a preferred unit, frame, or axis. An explicit ambiguous request creates nothing.

## 22. Human-review boundary

A reviewer may confirm which declared reference context applies. Confirmation sets human review recorded and leaves engineering validation, structural adequacy, and certification false. Human review is not engineering validation.

## 23. AI boundary

An AI, LLM, or optimizer actor cannot record or confirm a reference. AI cannot invent a unit, coordinate system, axis, or sign convention, cannot resolve a conflict, and cannot mark the context engineering validated. AI conversion, coordinate transformation, and axis inference counts are zero.

## 24. D1K reuse

Unit family identity comes from the existing unit-family lookup. Coordinate, axis, and sign allowlists are the existing D1F and D1M registries. Conclusions and aggregation are the D1K convention states and aggregate function. The D1K diagnostic helpers that are private to the interface module are not copied into a second engine. No parallel D1M compatibility engine, unit system, coordinate system, or axis system is created. D1K internal discipline integration and cross-discipline intelligence remain not ready. No parallel cross-discipline interface is created.

## 25. D1L boundary

The D1L track remains complete and bounded with limitations. A compatible reference context is not certification eligible.

## 26. D1N boundary

D1N remains not absorbed. D1N runtime is not started and its count is zero.

## 27. D9 boundary

D9 remains not absorbed. D9 runtime, including global cycle detection, is not started. Counts are zero. D2 through D8 runtimes are not started.

## 28. Security evidence

Tenant, workspace, and project must match the evidence. Cross-tenant and cross-workspace or cross-project binding is rejected. Forged evidence fingerprints, substituted mapping fingerprints, and floating revisions are rejected. Administrator and AI authority do not gain engineering authority. This phase does not change the known security baseline in the engineering-review migration test and the persistence boundary test.

## 29. Release evidence

No dependency is added. No database schema is changed. The capability row is bounded, not validated, and framework only. The phase does not claim unit conversion, coordinate transformation, format support, parsing, structural interpretation, validation, conformance, solver certification, certification, or product release.

## 30. Readiness matrix

Architecture, source-reference runtime, and model-evidence runtime stay ready. Format-adapter runtime, structural-interpretation runtime, and change-governance runtime stay not ready. Model evidence is not demoted. This phase adds reference context around that evidence. Runtime count for the D1M track through this phase is four: source revision, object mapping, model evidence, and reference context. Unit, coordinate, and axis-sign reference counts are one each. Each compatibility count is one. Conversion, transformation, inference, parsing, extraction, ingestion, adapters, connectors, relationships, connectivity, load path, engineering-property interpretation, model correction, and CAD or BIM authoring counts are zero.

## 31. Remaining limitations

The context binds one current evidence record. It does not convert values, transform coordinates, infer axes, validate geometry, or approve structural meaning. Unknown source units that are absent from the existing unit families stay unresolved. A matching result only says the declared references are the same governed identity. It does not prove the source model is adequate.

## 32. Next authorized phase

The D1M architecture decomposition remains canonical. The next phase is EOS-D1M-R5-MODEL-RELATIONSHIP-EVIDENCE. Its scope is to record explicit relationship evidence among source-model objects and mapped structural targets using the exact R1 through R4 context, while keeping a declared model relationship distinct from validated structural connectivity or a load path. This closeout does not start that phase.

## Readiness held from earlier phases

D1M_ARCHITECTURE_READY remains yes.

D1M_SOURCE_REFERENCE_RUNTIME_READY remains yes.

D1M_MODEL_EVIDENCE_RUNTIME_READY remains yes.

D1M_FORMAT_ADAPTER_RUNTIME_READY remains no.

D1M_STRUCTURAL_INTERPRETATION_RUNTIME_READY remains no.

D1M_CHANGE_GOVERNANCE_RUNTIME_READY remains no.

Post-D1J structural debt remains preserved.

The D1G certification blocker remains preserved.

D1K limitations remain preserved.

General-availability security debt continues to block general availability.

The D1 structural pack remains incomplete.
