D1K-0 cross-discipline structural interfaces architecture

Purpose

This phase defines how the Structural discipline pack will reference, request, receive, provide, validate, trace, review, invalidate, and hand off cross-discipline engineering information. It establishes the contract architecture. It does not operate an interface runtime. D1K remains the governed interface layer for Structural. It is not another engineering discipline, a multidisciplinary calculation engine, a global orchestration engine, a dependency-cycle engine, an approval engine, an optimization engine, a conflict-resolution engine, a BIM or CAD authoring system, or an AI engineering authority.

The source discipline remains authoritative for its source engineering information. Structural remains authoritative only for its own Structural decisions. D1K governs the exchange and the evidence trail between them.

Canonical scope

The post-D1J roadmap authorized EOS-D1K-0-CROSS-DISCIPLINE-STRUCTURAL-INTERFACES-ARCHITECTURE. That identifier did not exist before the roadmap decision. The canonical track name remains CROSS-DISCIPLINE STRUCTURAL INTERFACES. Runtime status remains not started. This phase defines interface identity, structural targets, counterparty discipline and domain, direction, allowlisted semantics, exact source references, authority, validation, units, coordinate systems, axis and sign conventions, applicability, requiredness, handoff and review state, compatibility diagnostics, provenance, fingerprints, history, staleness and invalidation, future internal and external reference seams, and the D1L evidence handoff.

Dependencies

Recorded dependencies are D1A and D1F. Cycle detection remains D9. D1K does not depend on D1J runtime. D1J stays COMPLETE_BOUNDED_WITH_LIMITATIONS at STRUCTURAL_OPTIMIZATION_CERTIFICATION_BOUNDED_RUNTIME_IMPLEMENTED. This phase does not promote D1J optimizer runtime, solver runtime, model mutation, engineer validation, conformance, or certification eligibility. D1G remains not certified.

Non-goals

No D2 through D8 engineering runtime. No D9 cross-discipline intelligence. No global cycle detection. No engineering formulas. No structural or other-discipline check engine. No automatic conflict resolution. No silent unit conversion, coordinate inference, or axis inference. No interface runtime, compatibility runtime, or external-reference runtime. No database migration. No BIM or CAD intelligence. No concept-to-detailed orchestration. No engineering approval and no certification.

Terminology

An interface record is the governed exchange evidence. A source reference pins one exact upstream engineering source. A diagnostic reports incompatibility or missing information and does not change either discipline's data. A handoff state describes request, provision, acknowledgement, review, or mismatch. None of those words means engineering approval. D0 status values declared, active, and retired remain lifecycle words and are not acceptance.

Existing architecture reused

D1K reuses the D0 EosCrossDisciplineInterface contract: interfaceId, relation, sourceDiscipline, targetDiscipline, sourceObject, targetObject, evidence, status, provenance, and humanReviewRequired. It reuses EOS_CROSS_DISCIPLINE_RELATIONS and EOS_DISCIPLINE_IDS. It reuses D1A structural object identity and D1F structural system, member, support, and foundation-interface identity. It reuses fingerprintCanonical. It reuses the existing digital thread. It reuses the existing unit compatibility function. Formal approval stays in the existing engineering-review decision workflow. No parallel interface identity, structural asset identity, unit system, digital thread, fingerprint algorithm, approval engine, or capability manifest is created.

Interface identity

A Structural interface keeps the D0 interfaceId. Added governed fields are tenant, workspace, project, the D1A or D1F structural target, the counterparty discipline, a registry semantic for the counterparty engineering domain, source and target discipline, the source engineering object, the receiving target, the governing relation, semantic identity, schema identity and version, the exact source reference and revision, authority, validation state, applicability, requiredness, evidence references, provenance, the existing human-review requirement, fingerprint, history, and staleness. The counterparty domain is a registry semantic. It is not a free-form discipline name.

Discipline ownership

Discipline order remains D1 structural, D2 civil, D3 geotechnical, D4 mechanical, D5 piping, D6 process, D7 electrical, D8 instrumentation and control, and D9 cross-discipline intelligence. Free-form discipline identity is prohibited. D1K does not re-author civil, geotechnical, mechanical, piping, process, electrical, or instrumentation and control engineering. Future seams for those disciplines stay governable before those packs exist, as references only.

Direction

Direction is sourceDiscipline, targetDiscipline, and a relation from the D0 allowlist. The names inbound to structural, outbound from structural, and bidirectional are not governing enums. A two-way exchange is not inferred because information could theoretically move both ways. It exists only when explicit governed relations say so.

Semantic and schema registry

The registry separates relation, engineering semantic, schema identity, schema version compatibility, source authority, and evidence identity. The D0 relation allowlist is the starting vocabulary. A later semantic is added only by a governed allowlist revision. Caller-supplied arbitrary JSON does not become governed engineering semantics. No generic interface payload engine is authorized.

Exact source references

A future record pins source object identity, document or model or data identity, revision, evidence, authority, the canonical fingerprint of that source, provenance, and a timestamp where the source carries one. The word latest is not an exact reference. The interface keeps a governed reference or evidence link. It does not silently copy an uncontrolled source body.

Authority

Source authority stays with the originating discipline or the external source. Interface-record authority may record and trace the exchange only. Reviewer authority may review. Receiving Structural authority may rely on the interface when making a Structural decision and does not become the author of the source value. Engineering approval authority stays in the engineering-review workflow. Certification authority stays with a future D1L assessment. Registering an interface does not promote source authority. Accepting an interface does not promote engineering validation.

Validation and applicability

Validation state records whether the pinned source, semantic, schema, units, coordinate system, and axis convention were checked. That check does not approve the engineering value. Applicability is declared. Unknown applicability is not treated as not applicable.

Units

D1K reuses the existing EOS unit system. No parallel unit system is created. Silent conversion is prohibited. Where a quantity has units, the architecture preserves source unit, expected receiving unit, compatibility, whether conversion would be required, the governing conversion method if a later phase supports one, and validation state. This phase implements no conversion runtime. A unit mismatch is an interface diagnostic. It is not automatically a structural design failure.

Coordinate systems

Where spatial or vector information is exchanged, source coordinate system, receiving coordinate system, project or global or local identity where applicable, transformation identity where applicable, compatibility, and unresolved transformation are explicit. Coordinate identity is not inferred from geometry. This phase implements no coordinate transformation.

Axis and sign conventions

Loads, reactions, moments, displacements, accelerations, pressures used as directional structural inputs, and other directional quantities require an explicit axis and sign convention. The convention is not inferred from numeric values. States are matching, incompatible, missing, and unresolved. Automatic reconciliation is not authorized.

Requiredness and lifecycle

Required input, provided input, requested output, provided output, acknowledged handoff, and unresolved interface are distinct engineering meanings. They are not the D0 lifecycle values declared, active, and retired. Lifecycle state and engineering acceptance stay separate.

Handoff and review

Handoff states are requested, provided, acknowledged, under review, response pending, changed, superseded, rejected, unresolved mismatch, and stale dependency. Review of an engineering decision reuses the existing engineering-review workflow. No second approval engine is created. An accepted interface is not an approved engineering decision. A closed interface is not an approved design.

Compatibility diagnostics

The architecture can represent, without resolving, missing interface information, a missing required source, semantic incompatibility, schema or version incompatibility, unit mismatch, coordinate mismatch, axis mismatch, sign-convention mismatch, a stale source, a superseded source, insufficient authority, missing evidence, invalid provenance, a pending counterparty response, and an unresolved engineering conflict. A diagnostic is evidence. It is not structural failure. It does not authorize D1K to change either discipline's engineering data.

Staleness, history, provenance, and fingerprints

When an upstream source changes, the existing interface revision remains traceable, the prior source reference remains visible, and the dependent interface may become stale. Receiving evidence must be able to see that stale state. D1K does not mutate the upstream source and does not repoint the record to latest. History is append-only. Provenance reuses the digital thread. Fingerprints reuse fingerprintCanonical for the interface definition, the exact source reference, the semantic and schema identity, the compatibility state, and the handoff or review state where one exists. No second fingerprint algorithm is added.

Digital thread

The intended trace is source engineering evidence, then the governed source reference, then the D1K interface identity, then compatibility or review state, then receiving Structural evidence, then a downstream Structural decision or check, then future D1L evidence where a certification claim uses the interface. This phase defines that chain. It does not create a parallel thread and it does not write thread records.

Internal and external seams

A future native EOS-to-EOS interface may cite a D2 through D8 source only after that pack exposes a canonical source contract. Those packs are planned and are not started. This architecture does not fabricate their contracts and does not implement the seam.

A separate seam covers engineer-entered governed references, imported evidence, externally generated discipline data, and approved document or model references. That seam keeps external source identity, authority, provenance, revision, evidence, semantic identity, units, coordinate or axis convention where relevant, and human review. It must not be labeled as a native D2 through D8 output. No external-reference runtime is authorized.

AI boundary

AI may later summarize an interface, identify a missing input, identify a stale reference, explain a mismatch, draft a query, highlight a pending response, and organize evidence. AI may not invent an engineering input, infer a missing authoritative value, invent a counterparty response, change source authority, approve an interface, approve engineering, resolve a governing conflict, silently reconcile units or coordinates or axis conventions, create a design input without evidence, override review, grant conformance, or grant certification.

D9 and D1L

D9 owns cross-discipline intelligence and global cycle detection. D1K may later expose governed interface references and states. D9 may later consume them. D1K does not implement that intelligence, a dependency graph, multidisciplinary reasoning, cycle detection, or global interface optimization.

D1L remains the structural global certification gate and is not started. If a cross-discipline input materially affects a future Structural certification claim, that claim must be able to identify the exact D1K interface evidence. Interface acceptance is not that gate.

D1M and D1N

CAD or BIM intelligence remains an unimplemented boundary. A BIM or CAD artifact may later be an evidence reference. D1K does not author geometry, synchronize a model, or create elements. Concept-to-detailed orchestration remains an unimplemented boundary. An interface is not permission to orchestrate a multidisciplinary design workflow.

Readiness

Architecture readiness is true because this contract is defined. Reference runtime, external reference runtime, internal discipline integration, and cross-discipline intelligence remain false. Defining the architecture does not promote those layers.

Security and privacy

The architecture does not weaken tenant isolation, workspace isolation, authentication, authorization, least privilege, AAL2, admin authority, provenance, evidence integrity, release governance, or secret handling. A cross-discipline reference is not an authority bypass. Future authorization stays bound to project and workspace, discipline, engineering object, source reference, evidence, reviewer, and administrator. Cross-tenant and cross-workspace references are prohibited. Personal data is not introduced by default. AI output is not governed numeric truth. The architecture is jurisdiction-agnostic. It does not hard-code an EU-only product and it does not claim GDPR, EU AI Act, or NIS2 compliance. Those remain governance foundations for a later validated control set. No new security runtime is implemented. No database table, migration, or RLS change is made. Future persistence, if any, is a later requirement.

Known debt

Concrete C10 engineer review, D1F system-orchestrator human review, D1G live validation, D1G engineer validation, D1G conformance and certified-solver status, D1H engineer validation, D1I engineer validation, D1I conformance validation, D1J engineer validation, D1J conformance validation, and D1J concrete parameter semantics remain unresolved. GA security debt remains. None of these is closed or promoted by this architecture. They do not block this architecture phase.

Future runtime boundary

Nothing in this document is operational. Interface records are not stored. Compatibility is not executed. External references are not ingested. Internal packs are not connected. Cycle detection is not run.

Acceptance

Acceptance is that the reused contracts are named, the boundaries above are explicit, runtime counts stay at zero, no formula is added, no parallel system is created, and the next bounded step is identified without being started.

Deferred work

The exact later sequence determined here is an interface identity and source-reference foundation, then semantic and unit and coordinate and axis compatibility, then handoff and response and change and conflict governance, then internal and external reference composition, then closeout. Only the identity and source-reference foundation is the next authorized step. It records the D0 extension and an exact source pin. It does not assess compatibility, execute a handoff, start another discipline, convert units, infer coordinates or axes, or approve engineering.

Source classification

| Class | Meaning | Native pack claim |
| --- | --- | --- |
| Native EOS discipline source | A future source exposed by a canonical D1 through D8 pack contract | Only when that pack contract exists |
| External governed engineering source | Evidence produced outside EOS and pinned by identity, revision, and authority | No |
| Manual governed reference | An engineer-entered reference with the same exact-source requirements | No |

Compatibility dimensions

| Dimension | What must be explicit | Automatic repair |
| --- | --- | --- |
| Semantics | Allowlisted semantic identity | No |
| Schema and version | Schema identity and version | No |
| Units | Source unit, receiving unit, compatibility | No |
| Coordinates | Source and receiving system | No |
| Axis and sign | Convention identity | No |
| Source freshness | Exact revision and stale state | No |
| Authority | Source authority class | No |
| Evidence completeness | Required evidence present or missing | No |

Authority boundaries

| Class | May record | May validate the pin | May acknowledge | May review | May approve engineering |
| --- | --- | --- | --- | --- | --- |
| Source authority | The source value | No, it authors the value | No | No | No |
| Interface-record authority | The exchange | The pin only | No | No | No |
| Reviewer authority | Review evidence | No | No | Yes | No |
| Receiving Structural authority | Reliance in a Structural decision | No | Yes, as receipt | No | No |
| Engineering approval authority | The approval record in engineering review | No | No | Yes | Yes |
| Certification authority | A future D1L evidence reference | No | No | No | No |

Readiness layers

| Layer | State after this phase |
| --- | --- |
| Architecture ready | Yes |
| Reference runtime ready | No |
| External reference ready | No |
| Internal discipline integration ready | No |
| Cross-discipline intelligence ready | No |
