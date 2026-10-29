# EOS-D1K-R1 Interface Identity and Source-Reference Foundation

## Purpose

D1K-R1 records a governed Structural cross-discipline interface identity and pins the exact source that identity relies on. The record answers who owns the interface, which Structural target it names, which allowlisted counterparty discipline participates, which D0 relation applies, and which source revision, authority, evidence, and provenance were used.

This phase does not decide whether that source is semantically, dimensionally, spatially, or directionally compatible with the Structural use.

## Parent authority

Parent architecture: docs/architecture/engineering-os/EOS_D1K_0_CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_ARCHITECTURE.md

Parent roadmap: docs/architecture/engineering-os/EOS_POST_D1J_CANONICAL_ROADMAP.md

D1K-0 status remains ARCHITECTURE_DEFINED. D1K-0 maturity remains STRUCTURAL_CROSS_DISCIPLINE_INTERFACE_ARCHITECTURE_DEFINED. The historical post-D1J readiness constant D1K_REFERENCE_RUNTIME_READY stays false. R1 records its own bounded readiness on D1K_R1_REFERENCE_RUNTIME_READY.

## Implemented scope

The runtime is an in-memory domain record in packages/engineering-os/src/structural-systems/interface-identity-foundation.ts. It extends the D0 EosCrossDisciplineInterface fields: interfaceId, relation, sourceDiscipline, targetDiscipline, sourceObject, targetObject, evidence, status, provenance, humanReviewRequired, and description.

The Structural target is a catalogued D1A StructuralObjectKind. D1F seams used by this foundation are STRUCTURAL_SYSTEM, MEMBER, SUPPORT, and FOUNDATION_INTERFACE. No second Structural asset identity is created.

Discipline identity is EOS_DISCIPLINE_IDS. Relation identity is EOS_CROSS_DISCIPLINE_RELATIONS. Evidence kind is EOS_EVIDENCE_SOURCE_KINDS. Fingerprints use fingerprintCanonical. No second fingerprint algorithm is introduced.

A governed registration requires a non-floating source revision, a source authority distinct from the record creator, an evidence reference, and a provenance reference. The stored record keeps that pin. Repeating the same registration returns the same record. A later revision is a new interface id. The prior record stays in history with its original revision. The catalog source is not mutated.

D0 status on an R1 record is declared. Record currency is CURRENT or SUPERSEDED. Neither state is engineering approval or design approval.

## Reused architecture

EosCrossDisciplineInterface and EOS_CROSS_DISCIPLINE_RELATIONS from the D0 discipline contract.

EOS_DISCIPLINE_IDS and EOS_EVIDENCE_SOURCE_KINDS.

STRUCTURAL_OBJECT_KINDS from D1A.

D1F structural system, member, support, and foundation-interface identity as target kinds.

fingerprintCanonical from the existing optimization-intelligence fingerprint module.

The D1J-R1 in-memory store, actor scope, and append-only history pattern.

No parallel digital thread, unit system, or approval engine is created. Formal approval remains the existing engineering-review decision workflow. This phase does not import that workflow.

## Runtime exclusions

R1 does not assess semantic, schema, unit, coordinate, or axis compatibility. It does not convert units, transform coordinates, or infer axis or sign conventions. It does not execute a handoff, request, acknowledgement, or conflict workflow. It does not approve an interface, a design, or engineering. It does not run Civil, Geotechnical, Mechanical, Piping, Process, Electrical, or Instrumentation and Control logic. It does not run D9 cycle detection or cross-discipline intelligence. It does not start D1L. It does not absorb D1M or D1N. It does not add an engineering formula. It does not change the database schema.

Source class labels from the D1K-0 registry may appear on a non-operational catalog fixture. A native D2 through D8 pack contract is rejected because those packs are not started. An operational external reference is rejected. D1K_R1_EXTERNAL_REFERENCE_READY and D1K_R1_INTERNAL_DISCIPLINE_INTEGRATION_READY stay false.

## Validation behavior

Registration fails closed for a missing interface id, a non-allowlisted discipline, a non-allowlisted relation, an unknown or non-canonical Structural target, a missing source, a floating latest or current revision, a revision mismatch, a fingerprint mismatch, missing evidence, invalid provenance, an AI or empty authority, a tenant mismatch, and a workspace or project mismatch. Missing values are not defaulted into engineering meaning.

AI authority cannot create the interface, the target, the source, the revision, the evidence, the provenance, or the source authority, and cannot approve the interface or the engineering.

## Readiness

D1K_R1_ARCHITECTURE_READY is true because D1K-0 already defined the architecture.

D1K_R1_REFERENCE_RUNTIME_READY is true because this phase can construct, validate, fingerprint, and preserve the bounded identity and exact source record.

D1K_R1_EXTERNAL_REFERENCE_READY, D1K_R1_INTERNAL_DISCIPLINE_INTEGRATION_READY, and D1K_R1_CROSS_DISCIPLINE_INTELLIGENCE_READY stay false.

The umbrella capability D1K.STRUCTURAL_INTERFACE_RUNTIME stays NOT_IMPLEMENTED. The bounded row D1K.R1.INTERFACE_IDENTITY_SOURCE_REFERENCE is IMPLEMENTED_BOUNDED and NOT_VALIDATED.

## Security and release

Tenant, workspace, and project scope are checked on the actor, the Structural target, and the source before a record is stored. A cross-scope source is not associated. No new dependency is added. No production table, migration, or RLS change is added. Release classification treats the runtime module as release-sensitive through the existing structural-systems path rule. This document does not claim GDPR, EU AI Act, NIS2, professional, or product certification.

## Known debt

Concrete C10 engineer review remains pending. D1F system-orchestrator human review remains pending. D1G live validation, engineer validation, and certified-solver status remain unmet. D1H, D1I, and D1J engineer validation remain pending. D1I and D1J conformance validation remain pending. D1J concrete parameter semantics remain NOT_AVAILABLE. GA security debt remains. R1 does not promote those statuses.

## Next phase

The next authorized phase is EOS-D1K-R2-SEMANTIC-UNIT-COORDINATE-AXIS-COMPATIBILITY. Its type is STRUCTURAL_INTERFACE_SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY. It may record semantic, schema, unit, coordinate, and axis compatibility diagnostics for a governed D1K-R1 pin. It must not convert units, transform coordinates, infer axis or sign conventions, execute a handoff, start D2 through D8, start D9, or approve engineering. R1 does not start that phase.

Closeout path: docs/architecture/engineering-os/EOS_D1K_R1_INTERFACE_IDENTITY_SOURCE_REFERENCE_FOUNDATION_CLOSEOUT.md
