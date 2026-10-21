# EOS-D1M-R2 Source Object Structural Target Mapping Closeout

## Status

Phase: EOS-D1M-R2-SOURCE-OBJECT-STRUCTURAL-TARGET-MAPPING

Status: SOURCE_OBJECT_MAPPING_IMPLEMENTED

Maturity: STRUCTURAL_CAD_OR_BIM_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_IMPLEMENTED

Parent architecture: docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md

R1 closeout: docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md

Runtime: packages/engineering-os/src/structural-systems/cad-bim-object-mapping.ts

This phase records identity correspondence. It does not establish engineering correctness.

## 1. R1 dependency

Every mapping requires one existing D1M-R1 source revision record. The mapping reads that record. It does not create a second artifact identity, a second provenance system, or a second fingerprint algorithm. The R1 object-mapping operation remains refused. Mapping lives only in this phase.

## 2. Exact artifact-revision binding

The mapping stores the R1 reference id, artifact id, source revision, and R1 metadata fingerprint. A caller cannot supply latest, current, or another floating token. A caller-supplied revision that differs from the R1 record is rejected. There is no operation that advances a mapping onto a newer artifact revision.

## 3. Source-object identity

The source object id is supplied through the mapping operation. Its origin is declared source identity. EOS does not claim that it found the object inside a file. A recorded source object id is not independently verified model content.

## 4. Source object versus D1A identity

The source object id and the structural target id are different fields. A source object id is not a structural object id. The same external object id on two artifact revisions produces two revision-specific mappings and is not treated as engineering-equivalent.

## 5. Existing structural target requirement

The target must already exist in the supplied D1A catalog and must use a canonical structural object kind. A missing target is rejected. R2 does not generate a member, invent a placeholder, or create a parallel structural identity.

## 6. Mapping identity

One mapping id binds one source object on one exact artifact revision to one existing structural target. A repeated identical request returns the same record. A second active mapping for the same artifact revision and source object is a conflict unless an explicit successor names the prior mapping. Two different source objects may name the same structural target. That shared-target case is not a conflict.

## 7. Mapping evidence

An authoritative mapping requires an evidence id and an allowlisted evidence kind. Empty or free-form evidence is rejected. Evidence supports the identity correspondence. Evidence present does not mean the engineering properties of either side are validated.

## 8. Mapping authority

The recorder authority is interface record authority. That authority is stored on the mapping. It is not engineering approval authority and it is not certification authority. Administrator authority cannot record or confirm a mapping.

## 9. Mapping provenance

Provenance records the artifact reference, exact revision, source object, structural target, evidence, recording actor, timestamp, and R1 metadata fingerprint. Missing provenance is rejected. Provenance is not invented when the caller omits it.

## 10. Mapping fingerprint

The mapping fingerprint is the canonical EOS fingerprint of the material identity fields: mapping id, artifact reference, exact revision, R1 metadata fingerprint, source object, structural target kind and id, evidence, provenance reference, scope, and predecessor. Lifecycle status is outside the fingerprint so confirmation cannot rewrite it. No second hashing algorithm is introduced. A verified fingerprint proves record integrity. It does not prove engineering correctness.

## 11. Mapping immutability

An existing mapping cannot be silently retargeted. Changing the source object, the structural target, or the evidence under the same mapping id is rejected. Repointing and automatic artifact-revision upgrade are refused operations.

## 12. History

Creation, supersession, and human confirmation are appended. A successor uses a new mapping id and names its predecessor. The predecessor remains readable, including its original fingerprint. This history is not source-change, staleness, or engineering-impact governance. That remains a later phase.

## 13. Ambiguity

An ambiguous mapping request is rejected. R2 does not choose a structural target when the caller marks the correspondence ambiguous.

## 14. Human-review boundary

A reviewer authority may confirm an existing current mapping. Confirmation records that a human accepted the identity correspondence. It does not change the source object, the target, or the fingerprint. Confirmation is not structural adequacy, geometry validation, semantic validation, design approval, or certification.

## 15. AI boundary

AI cannot create an authoritative mapping, confirm a mapping, invent a source object id, or invent a structural target id. There is no AI matching runtime. A numeric confidence score cannot make a mapping authoritative.

## 16. Administrator boundary

Generic administration is not mapping authority and is not engineering mapping authority.

## 17. No target auto-creation

A request to create a target is rejected. The catalog is not extended by the mapping operation.

## 18. No object discovery

R2 does not discover source objects by reading a CAD or BIM artifact.

## 19. No parsing

R2 does not parse a file and does not ingest a payload.

## 20. No geometry

R2 does not read coordinates, bounding boxes, vertices, lengths, orientations, sections, solids, or surfaces.

## 21. No semantics

R2 does not interpret source class, material, section, member type, property sets, or labels as structural semantics.

## 22. No geometry matching

R2 does not decide that a shape is a structural member.

## 23. No semantic matching

R2 does not match labels such as a beam or column name. Such a correspondence is accepted only when the caller supplies it as governed mapping evidence, not when R2 infers it.

## 24. No engineering validation equivalence

A recorded source object, a recorded mapping, a mapping authority, mapping evidence, a confirmed review, and a verified fingerprint are each not engineering validation.

## 25. No certification equivalence

A recorded mapping is not a certification. Mapping authority is not certification authority. A D1M mapping does not make a claim eligible for D1L certification.

## 26. D1A reuse

The target kind comes from the existing structural object kinds. R2 does not define a parallel structural identity.

## 27. D1K boundary

Cross-discipline governance remains the D1K model. R2 does not create a D1M cross-discipline interface. D1K internal integration and cross-discipline intelligence remain unavailable.

## 28. D1L boundary

The D1L track remains complete with limitations. This mapping does not reopen it and does not satisfy certification eligibility.

## 29. D1N boundary

Concept-to-detailed orchestration is not absorbed and has no runtime in this phase.

## 30. D9 boundary

D9 is not absorbed. Global cycle detection is not implemented.

## 31. Security evidence

Scope is enforced for the actor, the R1 reference, and the structural target. Tenant mismatch is a cross-tenant rejection. Workspace or project mismatch is a cross-project rejection. A source object cannot be mapped through an artifact reference outside the actor scope. A structural target from another workspace, project, or tenant is rejected. A fabricated target id is rejected. AI and administrator authority are rejected. The known engineering-review security baseline is unchanged by this phase.

## 32. Release evidence

The mapping runtime and the capability manifest are release-sensitive. The closeout document is not. The capability is implemented and bounded, not validated, and framework only. This phase does not claim format support, parser support, geometry intelligence, semantic intelligence, engineering validation, conformance, solver certification, certification, D1 completion, or product general availability.

## 33. Remaining limitations

Geometry and semantic evidence are not recorded. Units, coordinates, and axes are not interpreted. Source relationships are not inferred. Format adapters and vendor connectors are not implemented. Change, staleness, and engineering impact remain unimplemented. The structural pack remains incomplete. The D1G certification blocker, post-D1J debt, D1K limitations, and general-availability security debt remain.

## 34. Exact next authorized phase

EOS-D1M-R3-GEOMETRY-SEMANTIC-EVIDENCE

Type: CAD_OR_BIM_GEOMETRY_SEMANTIC_EVIDENCE

Scope: record governed geometry and semantic evidence for an exact D1M-R1 artifact revision and an exact D1M-R2 source-object mapping. Keep source-derived evidence distinct from validated engineering truth. Do not parse a file, infer an unknown label, convert units, or treat the evidence as structural adequacy.

R3 is not started by this closeout.

## Object runtime meaning

CAD_BIM_OBJECT_RUNTIME_COUNT for this phase is the source-object identity reference runtime. It is not a parsed-object runtime and it is not an extracted-object runtime. Object extraction remains zero.
