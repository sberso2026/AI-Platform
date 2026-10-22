# EOS-D1M-R5 Model Relationship Evidence Closeout

## Status

Phase: EOS-D1M-R5-MODEL-RELATIONSHIP-EVIDENCE

Status: MODEL_RELATIONSHIP_EVIDENCE_IMPLEMENTED

Maturity: STRUCTURAL_CAD_OR_BIM_MODEL_RELATIONSHIP_EVIDENCE_IMPLEMENTED

Parent architecture: docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md

R1 closeout: docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md

R2 closeout: docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md

R3 closeout: docs/architecture/engineering-os/EOS_D1M_R3_GEOMETRY_SEMANTIC_EVIDENCE_CLOSEOUT.md

R4 closeout: docs/architecture/engineering-os/EOS_D1M_R4_UNIT_COORDINATE_AXIS_REFERENCE_CLOSEOUT.md

Runtime: packages/engineering-os/src/structural-systems/cad-bim-model-relationship.ts

This phase records a relationship the source model declares between two exact endpoints. It does not decide that the relationship is structural connectivity or a load path.

## 1. R1 through R4 dependency chain

A relationship exists only when both endpoints are current R2 mappings. Each mapping already names its R1 artifact revision and metadata fingerprint. The supporting record is a current R3 evidence item on one of those mappings. The reference context is a current R4 context for that same evidence. R5 copies those identifiers. It does not create an artifact, a mapping, evidence, or a reference context.

## 2. Relationship endpoint identity

Each endpoint stores its role, mapping id, mapping fingerprint, source-object id, and structural target id. The subject is endpoint A. The object is endpoint B. The same mapping cannot be both endpoints.

## 3. Exact artifact revisions

Each endpoint stores its artifact id, source revision, and R1 metadata fingerprint. A floating revision is rejected. A caller revision that does not match the mapping is rejected. Cross-artifact evidence is governed: both artifacts must be exact and in the same tenant, workspace, and project. Different artifact ids are recorded as different artifacts. They are not merged.

## 4. Exact R2 mappings

Caller mapping fingerprints, source-object ids, and target ids must match the stored mappings when supplied. Substituting any of them is rejected. R5 cannot create or redirect a mapping.

## 5. Supporting evidence

The relationship stores the R3 evidence id and evidence fingerprint. The evidence must be current and belong to the subject or object mapping. A forged evidence fingerprint is rejected. Recording the relationship does not change evidence values.

## 6. R4 reference context

The relationship stores the R4 context id and context fingerprint. The context must be current and must cite the same evidence. A forged context fingerprint is rejected. Compatible reference context is not structural validation. R5 does not convert units, transform coordinates, or reinterpret compatibility.

## 7. Relationship type

The type must be one of the architecture allowlist: contains, connected to, supported by, hosted by, member of, references, or adjacent to. Free-form text is rejected. The stored source type is not an engineering relationship type. The engineering relationship type stays empty.

## 8. Direction and roles

Direction is subject to object. Roles stay subject and object in the order supplied. A request to reverse direction is rejected. Reusing the same relationship id with the endpoints swapped is rejected. A separately identified reverse declaration may be recorded as its own evidence. It does not rewrite the first record.

## 9. Relationship authority

Recording authority is interface record authority. Confirmation authority is reviewer authority. Administrator, engineering-approval authority, and certification authority are rejected. Relationship authority is not engineering approval and is not certification authority.

## 10. Provenance

Each record keeps the provenance reference and evidence reference. A blank or AI-labelled reference is rejected. Provenance is part of the fingerprint.

## 11. Fingerprint

The fingerprint uses the canonical fingerprint function. It covers ordered endpoints, revisions, mapping fingerprints, relationship type, direction, roles, evidence fingerprint, context fingerprint, provenance, scope, and predecessor. Mutable status is outside the hash. A verified fingerprint is not connectivity validation and is not load-path validation. No second algorithm is introduced.

## 12. Immutability

The same id and the same fingerprint return the existing record. The same id with different endpoints or type is rejected. Silent mutation and silent endpoint repointing are rejected. Confirmation changes review status only.

## 13. History

Create, supersede, and confirm append history that retains the relationship fingerprint. Supersession keeps the same endpoints and type, marks the predecessor superseded, and records a new current relationship. Full staleness remains outside this phase.

## 14. Duplicate governance

One current relationship is allowed for a type and an ordered endpoint pair. A second active record of that pair is a conflict. Nothing is merged or dropped silently.

## 15. Ambiguity and conflict

An explicit ambiguous request creates nothing. A conflicting second record creates nothing and does not select a winner.

## 16. Source relationship versus structural connectivity

Connected to, supported by, hosted by, contains, references, adjacent to, and member of remain source evidence. Structural connectivity validated stays false on record and on confirmation. Recording or authorizing the evidence does not validate connectivity. Evidence presence does not validate connectivity.

## 17. Source relationship versus load path

Load-path validated stays false. Contains is not a load path. Supported by is not a validated support condition. Recording or authorizing the evidence does not validate a load path.

## 18. AI boundary

An AI, LLM, or optimizer actor cannot record or confirm a relationship. AI cannot invent an endpoint or a type, cannot mark connectivity validated, and cannot mark a load path. AI relationship inference count is zero.

## 19. Human-review boundary

A reviewer may confirm what the source declares. Confirmation leaves connectivity, load path, engineering validation, and certification false. Human review is not structural validation.

## 20. No geometry inference

Touching, intersection, alignment, proximity, and overlap do not create a relationship. Geometry inference count is zero.

## 21. No semantic inference

Labels and property names do not create a relationship. Semantic inference count is zero.

## 22. No topology inference

Explicit records do not complete a graph. Topology inference count is zero. A local pair of opposite declarations is two records. It is not cycle reasoning.

## 23. No load-path reasoning

Load-path inference and load-path validation counts are zero. Connectivity inference and connectivity validation counts are zero.

## 24. No clash detection

Clash detection count is zero. Relationship evidence is not clash detection.

## 25. No global dependency reasoning

Global dependency reasoning count is zero. Transitive inference count is zero. Relationship composition count is zero. A chain of explicit relationships does not create a new relationship.

## 26. No global cycle detection

Global cycle detection count is zero. D9 remains the owner of global cycle intelligence. A cycle among source declarations is not classified as an engineering error.

## 27. D1K boundary

D1K cross-discipline governance is reused as the boundary these source kinds are not. No parallel cross-discipline interface is created. D1K internal integration and cross-discipline intelligence remain not ready.

## 28. D1L boundary

The D1L track remains complete and bounded with limitations. Relationship evidence is not certification eligible.

## 29. D1N boundary

D1N remains not absorbed. D1N runtime is not started and its count is zero.

## 30. D9 boundary

D9 remains not absorbed. D9 runtime is not started and its count is zero. Multidisciplinary coordination count is zero.

## 31. Security evidence

Tenant, workspace, and project must match both endpoints, the evidence, and the context. Cross-tenant, cross-workspace, and cross-project relationships are rejected. Forged revisions, mappings, endpoints, evidence, and contexts are rejected. This phase does not change the known security baseline in the engineering-review migration test and the persistence boundary test. It does not weaken administrator, AI, or authentication-assurance guards.

## 32. Release evidence

No dependency is added. No database schema is changed. The capability row is bounded, not validated, and framework only. The phase does not claim connectivity, load path, topology, clash detection, coordination, parsing, format support, structural interpretation, validation, conformance, certification, or product release.

## 33. Readiness matrix

Architecture, source-reference runtime, and model-evidence runtime stay ready. Format-adapter runtime, structural-interpretation runtime, and change-governance runtime stay not ready. Relationship runtime count is one and means explicit evidence only. D1M runtime count through this phase is five. Unit conversion, coordinate transformation, axis inference, axis transformation, geometry transformation, parsing, extraction, ingestion, adapters, connectors, engineering-property interpretation, model correction, and CAD or BIM authoring counts are zero.

## 34. Reporting-schema normalization

Fields whose names describe a regression, escalation, weakening, bypass, unauthorized promotion, or prohibited action are reported NO when the condition did not occur and YES when it occurred. Gate and test results remain PASS or FAIL. This normalization is reporting only. Runtime flags are unchanged.

## 35. Next authorized phase

The D1M architecture decomposition remains canonical. The next phase is EOS-D1M-R6-FILE-API-ADAPTER-BOUNDARY. Its scope is to define the governed boundary by which a future format adapter or API may supply R1 through R5 evidence, including adapter contract, source authentication, format capability, parser trust, evidence provenance, unsupported formats, and file versus API separation. That boundary is not arbitrary format support and is not a vendor integration. This closeout does not start that phase.

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
