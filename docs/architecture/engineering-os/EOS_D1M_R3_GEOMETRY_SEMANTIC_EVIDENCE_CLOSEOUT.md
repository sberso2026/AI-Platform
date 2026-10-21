# EOS-D1M-R3 Geometry and Semantic Evidence Closeout

## Status

Phase: EOS-D1M-R3-GEOMETRY-SEMANTIC-EVIDENCE

Status: MODEL_EVIDENCE_IMPLEMENTED

Maturity: STRUCTURAL_CAD_OR_BIM_GEOMETRY_SEMANTIC_EVIDENCE_IMPLEMENTED

Parent architecture: docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md

R1 closeout: docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md

R2 closeout: docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md

Runtime: packages/engineering-os/src/structural-systems/cad-bim-model-evidence.ts

This phase records what a source declares about geometry and semantics. It does not decide whether the source is correct.

## 1. R1 dependency

Every evidence record binds to the exact D1M-R1 artifact revision already pinned by its mapping. The revision, artifact id, and R1 metadata fingerprint are copied from that record. A floating revision is rejected. R3 does not create a second artifact identity.

## 2. R2 dependency

Every evidence record binds to one current D1M-R2 source-object mapping. The source object, structural target, and mapping fingerprint come from that mapping. R3 cannot create a mapping or a structural target. A missing mapping is rejected.

## 3. Exact revision binding

Caller-supplied revision text must match the mapping. A mismatch is rejected. Evidence is not moved onto a later artifact revision.

## 4. Exact mapping binding

Caller-supplied source object, structural target, and mapping fingerprint must match the mapping when they are supplied. Substituting any of them is rejected. Evidence does not follow a successor mapping by itself.

## 5. Geometry evidence model

Geometry evidence uses the architecture candidate allowlist: point, line, curve, surface, solid, member extent, section geometry, orientation, level or grid, and object placement. A free-form type is rejected. The record stores the exact declared numeric components and optional labels. Component count is bounded. This is not a geometry kernel, and no Boolean, mesh, solid-modelling, repair, tessellation, or clash operation exists. CAD_BIM_GEOMETRY_RUNTIME_COUNT for this phase is governed geometry evidence only.

## 6. Semantic evidence model

Semantic evidence uses the architecture candidate allowlist: object type, material label, section label, member category, level, system membership, property-set value, and source classification. The source property name and the exact source value are stored. A free-form engineering type is rejected. CAD_BIM_SEMANTIC_RUNTIME_COUNT for this phase is governed source semantic evidence only.

## 7. Evidence authority

The recorder is interface record authority. That authority is stored separately from the source authority on the artifact. It is not engineering approval authority and it is not certification authority. Administrator authority cannot record or confirm evidence.

## 8. Provenance

Provenance records the artifact reference, exact revision, source object, mapping and its fingerprint, structural target, evidence reference, source authority, evidence authority, recording actor, and timestamp. Missing provenance is rejected.

## 9. Geometry fingerprint

The geometry fingerprint is the canonical EOS fingerprint of the mapping, revision, source object, target, geometry type, exact components and labels, declared unit, coordinate identity, declared axis, context status, provenance reference, scope, and predecessor. Lifecycle status is outside the fingerprint.

## 10. Semantic fingerprint

The semantic fingerprint uses the same canonical algorithm and binds the mapping, revision, source property name, exact source value, semantic type, declared unit when present, provenance, scope, and predecessor.

## 11. Evidence immutability

An existing evidence id cannot be rewritten with a different value. Silent geometry mutation and silent semantic mutation are refused operations.

## 12. Evidence history

Creation, supersession, and human confirmation are appended. A successor uses a new evidence id and names its predecessor. The predecessor value and fingerprint remain readable. This history is not source-change or staleness governance.

## 13. Geometry versus validation

Recorded geometry is declared source evidence. It is not validated EOS geometry, not geometry validation, and not structural adequacy. A confirmed review does not change those flags. A fingerprint proves record integrity only.

## 14. Semantics versus engineering semantics

A source value remains a source value. It is not a governed engineering semantic. Unknown labels are not mapped to structural kinds. Requesting an inferred engineering meaning is rejected.

## 15. Material boundary

A material label such as Concrete is source text. It does not become a validated engineering material.

## 16. Section boundary

A section label is source text. It does not become a validated design section.

## 17. Load boundary

A load property value is source text. It does not become a validated structural load.

## 18. Support boundary

A support property value is source text. It does not become a validated analysis boundary condition.

## 19. Reinforcement boundary

A reinforcement property value is source text. It does not become validated design reinforcement.

## 20. Unit boundary

A declared source unit is stored exactly. No unit is converted. Compatibility is not evaluated here. The D1K unit architecture is cited and no parallel unit system is created.

## 21. Coordinate boundary

A declared coordinate identity must be one of the architecture identities: local, project, shared, or global or site. Those identities are not interchangeable. Coordinates are not transformed. The D1K coordinate architecture is cited.

## 22. Axis boundary

A declared source axis string is stored as source text. It is not assigned as an engineering axis. Axes are not inferred. The D1K axis and sign architecture is cited.

## 23. Unknown-context handling

When unit, coordinate, or axis context is absent, the record status is unresolved pending the unit, coordinate, and axis phase. Nothing is guessed.

## 24. Evidence conflict handling

A second current record for the same mapping, evidence type, and source property is a conflict. R3 does not choose a preferred value. An explicit successor may replace the prior record and keeps the prior record readable.

## 25. Human-review boundary

A reviewer may confirm a current evidence record as the governed source record. Confirmation does not change the value or the fingerprint. It does not establish structural adequacy, design approval, conformance, or certification.

## 26. AI boundary

AI cannot record evidence, confirm evidence, invent a source property, infer an unknown engineering semantic, or mark evidence engineering-validated. There is no AI extraction runtime.

## 27. No parsing

R3 does not parse a CAD or BIM file and does not discover objects from a file.

## 28. No ingestion

R3 does not ingest a source file. Declaring evidence does not mean EOS extracted it from a file.

## 29. No format adapter

No format adapter is implemented. A declared format label does not mean that format is supported.

## 30. No connectors

No external connector is implemented.

## 31. No relationship inference

Source relationships, structural connectivity, and adjacency are not derived from geometry or semantics.

## 32. No load-path inference

Geometry and semantic evidence are not used to derive a load path.

## 33. D1K reuse

Unit, coordinate, and axis architecture flags are the existing architecture flags. Cross-discipline governance remains D1K. No parallel interface is created. D1K internal integration and intelligence remain unavailable.

## 34. D1L boundary

The D1L track remains complete with limitations. Model evidence does not make a claim eligible for certification.

## 35. D1N boundary

Concept-to-detailed orchestration is not absorbed and has no runtime.

## 36. D9 boundary

D9 is not absorbed. Global cycle detection is not implemented.

## 37. Security evidence

Tenant, workspace, and project scope are taken from the actor, the R1 reference, and the R2 mapping. A foreign mapping is rejected. Revision, source-object, target, and fingerprint substitution are rejected. AI and administrator authority are rejected. The known engineering-review security baseline is unchanged.

## 38. Release evidence

The evidence runtime and the capability manifest are release-sensitive. The closeout document is not. The capability is implemented and bounded, not validated, and framework only. This phase does not claim parser support, validated geometry, validated semantics, structural interpretation, engineering validation, conformance, certification, D1 completion, or product general availability.

## 39. Readiness matrix

Architecture ready: yes. Source reference runtime ready: yes. Model evidence runtime ready: yes, bounded to source-derived evidence. Format adapter runtime ready: no. Structural interpretation runtime ready: no. Change governance runtime ready: no. The structural pack remains incomplete. Upstream D1G, post-D1J, D1K, and general-availability security debt remain.

## 40. Exact next authorized phase

EOS-D1M-R4-UNIT-COORDINATE-AXIS-REFERENCE

Type: CAD_OR_BIM_UNIT_COORDINATE_AXIS_REFERENCE

Scope: govern exact unit, coordinate-system, and axis or sign references for D1M geometry and semantic evidence using canonical D1K-compatible primitives. Determine compatibility and explicit reference context. Do not silently convert geometry, transform coordinates, or invent engineering axes.

R4 is not started by this closeout.
