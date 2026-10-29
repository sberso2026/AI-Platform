# EOS-D1M-0 CAD or BIM Intelligence Architecture

## Purpose

D1M is the structural discipline's governed intelligence layer for references to CAD or BIM artifacts and the engineering-relevant evidence those artifacts can supply. It defines how EOS can know which artifact is cited, where it came from, which exact revision is in use, who has authority over that source, which structural target it relates to, which source objects are represented, what geometry and semantic evidence exist, which coordinate, unit, and axis systems apply, which relationships are explicitly represented, what is source fact rather than EOS interpretation, what changes when the source changes, and how that evidence enters the digital thread. AI may assist only inside the limits below. D1M is not an engineering approval engine.

## Scope

This phase defines that architecture. It covers artifact and source identity, exact revision, provenance, authority, structural target linkage, object identity, geometry evidence, semantic evidence, coordinates, units, axes, relationships, the file and API boundary, supported formats, immutability, change detection, fingerprints, the digital thread, human review, AI limits, D1K reuse, D1L evidence use, the D1N handoff, and the D9 boundary.

## Non-goals

This phase does not implement a parser, a geometry engine, a model transformation, an authoring tool, a BIM coordination engine, or automatic engineering interpretation. It does not authorize CAD or BIM authoring, a vendor connector, unrestricted file ingestion, silent model repair, design approval, certification, D1N orchestration, D9 reasoning, or D2 through D8 runtime.

## Dependencies

D1M reuses D1A structural object kinds, the D1K source classes and authority classes, D1K semantic governance for cross-discipline meaning, D1K unit, coordinate, and axis compatibility, fingerprintCanonical, and the existing digital thread. It reuses the engineering-review decision workflow for engineering approval and D1L for certification governance. It depends on the closed D1L track only as a predecessor. It does not reopen D1L.

## Source artifact distinct from later stages

Four stages stay distinct. The source artifact is the exact external or internal CAD or BIM artifact. The parsed representation is a machine-readable derivative of that source. The structural interpretation is a governed reading of selected objects, attributes, geometry, or relationships. Engineering truth is validated information supported by engineering authority and evidence. A source artifact is not a parsed model. A parsed model is not a structural interpretation. A structural interpretation is not engineering validation. A successful parse is not engineering correctness. Presence of a model is not engineering validation.

## Source artifact identity

A governed artifact identity has an artifact id, source class, source system, model identity, exact revision, tenant, workspace, project, source authority, provenance, evidence reference, content fingerprint, metadata fingerprint, reference timestamp, and predecessor where the artifact supersedes another. The filename alone is not identity.

## Exact revision

A reference pins one exact source revision. Latest model, current BIM, latest drawing, latest Revit, and newest IFC are not references. Any such phrase must first be resolved deterministically to an exact revision and a content fingerprint, and that pin is what EOS stores. A floating CAD or BIM source is not allowed.

## Source classification

The source classes are the D1K classes: a native EOS discipline source, an external governed engineering source, and a manual governed reference. No new source class is created. Free-form source classification is not authoritative.

## Authority

Authority classes are the D1K classes. Model authorship is source authority. It is not engineering approval authority. The actor who records a reference does not become the approver. Reviewer authority, receiving structural authority, engineering approval authority, and certification authority stay distinct. An administrator is not an engineering approver by holding an administrative role.

## Provenance

Provenance is required. It cites the source system, the actor or system that recorded the reference, the evidence used, and the fingerprint of the pinned revision. Missing provenance stays missing.

## D1A structural identity

Structural targets use the D1A object kinds. D1M does not create a parallel building, member, or system identity because the object originated in a model.

## Source object identity

A source object id belongs to the source system. Examples that a future phase might encounter include a vendor object id, a drawing entity handle, or a source GUID. Naming those examples does not support any format. A source object id is not an EOS structural object id. They are not interchangeable.

## Structural target mapping

A future mapping preserves the source object id, the source artifact revision, the structural target id and kind, the mapping basis, provenance, the actor authority, the fingerprint, and history. A fuzzy suggestion is not an authoritative mapping. If confidence is recorded later, it is non-authoritative. AI may not invent a source object id, a structural target id, a revision, provenance, authority, or a mapping, and may not approve a mapping.

## Geometry evidence

Candidate geometry evidence includes points, lines, curves, surfaces, solids, member extents, section geometry, orientation, levels or grids, and object placement. Listing them does not authorize extraction. Source geometry is distinct from an engineering interpretation of that geometry. Extracted geometry is not validated geometry. Validated geometry is not confirmation of structural adequacy. A correctly read beam shape does not prove the beam is adequate.

## Semantic evidence

Candidate semantic evidence includes object type, material label, section label, member category, level, system membership, property-set value, and source classification. Listing them does not authorize capture. A source-declared value is not an EOS-governed engineering semantic identity. Unknown or unsupported source text stays unknown. A similar label is not mapped to a structural kind. Where meaning crosses a discipline boundary, D1K semantic governance is reused.

## Units

Source units, property units where a property carries one, the governed expected unit, and the compatibility state are explicit. Compatibility reuses the existing unit-pair check. Silent conversion is not allowed. This phase does not convert units and does not create a unit system.

## Coordinates

Local, project, shared, and global or site coordinates are different identities. They are not interchangeable. An engineering interpretation that depends on placement requires an explicit coordinate identity. A missing identity stays missing. D1K coordinate compatibility is reused. This phase does not transform coordinates.

## Axes and sign conventions

Axis and sign conventions reuse D1K. A geometric appearance does not assign a structural local axis. A missing convention stays unresolved.

## Relationships

Source evidence may later record that an object contains, is connected to, is supported by, is hosted by, is a member of, references, or is adjacent to another object. Those kinds are model evidence. They are not D1K cross-discipline relations. BIM connectivity is not validated structural connectivity. A model relationship is not an engineering load path. D1M may expose relationship evidence. It does not infer or certify a load path.

## Material, section, load, support, and reinforcement

A material name is not a validated engineering material. A section property is not a validated design property. A load in a model is not a validated structural load. A support, restraint, or release in a model is not a validated analysis boundary condition. Reinforcement or detailing in a model is source evidence. It is not validated reinforcement, code-compliant detailing, or an approved construction detail.

## File format boundary

No format is supported. Support is not claimed for IFC, RVT, DWG, DXF, Tekla native files, a neutral exchange, or a structured API.

IFC is classified only as a candidate future adapter. A separate interoperability package already contains a bounded IFC federation adapter. That adapter is not D1M runtime. This architecture does not adopt it and does not claim IFC compliance or certification. If a later phase takes up IFC, it must keep the IFC artifact, the IFC schema version, the IFC object identity, the parsed IFC evidence, and the structural interpretation distinct.

RVT, DWG, DXF, and Tekla native files are unsupported in this architecture. EOS does not assume it can parse proprietary formats directly. A later phase may choose a supported vendor API, an exported neutral format, or a governed integration connector. This phase selects none of those strategies.

A neutral exchange and a structured API are candidate boundaries only. They are not authorized ingestion paths.

## File ingestion boundary

A source reference, file ingestion, a parsed model, and a governed structural interpretation are separate stages. A workflow may keep a governed reference and never ingest the file. Ingestion does not by itself create a parsed model or an interpretation. This phase does not implement generic engineering-file ingestion.

## API and connector boundary

A future API boundary distinguishes source metadata, model content, artifact download, change or event notification, and authentication. It is not one unrestricted connector that can inject engineering truth. No external connector is implemented. Autodesk, Revit, ACC, Tekla, Bentley, Navisworks, SharePoint, Google Drive, OneDrive, Dropbox, and other vendor APIs are not started. An arbitrary CAD or BIM payload bus is not authorized. D1M exposes governed evidence, not a generic transport.

## Immutability and history

An exact revision used as evidence stays immutable. If the source changes, the old revision and the old evidence remain, and a new superseding pin is added. Prior references are not silently mutated. History is append-only.

## Change detection

Future change classes are an artifact revision change, an object added or removed, a geometry change, a semantic property change, a coordinate-basis change, a unit-metadata change, an axis change, a relationship change, and a source-authority change. This phase does not detect those changes at runtime. Detecting a change is not a determination of engineering impact. Whether a geometry change matters structurally requires downstream engineering logic or human review.

The same filename with different content, the same model id with a new revision, a source revision that disagrees with the content fingerprint, and upload metadata that conflicts with the fingerprint are conflicts. They are not resolved silently, and latest is not chosen automatically.

## Fingerprints

Fingerprints reuse fingerprintCanonical. No second algorithm is created. Later phases may fingerprint the artifact revision, the parsed representation, object evidence, geometry evidence, semantic evidence, and mapping evidence as separate subjects. A content fingerprint mismatch is a conflict.

## Digital thread

The chain stays on the existing digital thread: CAD or BIM source artifact, exact source revision, parsed source evidence, source object identity, governed structural target mapping, geometry and semantic evidence, downstream structural evidence, and D1L certification evidence only where a claim uses that evidence. No parallel CAD or BIM audit thread is created.

## D1K reuse

D1K remains the authority for structural cross-discipline interfaces. D1M may later supply model-derived evidence that an interface cites. D1M does not replace D1K and does not create a second cross-discipline interface. D1K internal discipline integration remains not ready. D1K cross-discipline intelligence remains not ready. This architecture does not create D2 through D8 providers.

## D1L evidence handoff

D1L remains closed with limitations. Certification runtime and certification authority stay as the closeout recorded them. Certification eligibility stays unsatisfied. D1M does not rewrite D1L history and does not alter a certification decision. Governed model evidence is not certification eligibility. D1L remains responsible for certification governance. A future claim may cite D1M evidence through the existing certification chain.

## D1N handoff

D1N remains concept-to-detailed orchestration and is not absorbed. The handoff is defined. D1M may later expose model identities, source revisions, governed objects, geometry evidence, semantic evidence, relationships, model changes, provenance, and fingerprints. D1N may later orchestrate workflows that read that evidence. D1M does not orchestrate concept-to-detailed design. Geometry generated by a later track is not source-verified CAD or BIM evidence.

## D9 boundary

D9 remains responsible for multidisciplinary intelligence, global dependency reasoning, global cycle detection, cross-discipline optimization, and autonomous coordination. None of that is absorbed or started. D1M is not a multidisciplinary BIM coordination platform.

Clash detection is not classified as D1M structural intelligence. A structural-internal geometric coincidence check would belong to a future structural geometry check, not to this track. Cross-discipline clash detection belongs to D9. An engineering conflict that crosses a discipline boundary belongs to D1K, and global conflict reasoning belongs to D9. None of these checks is implemented.

## Human review

Human review is required for an ambiguous object mapping, an unsupported semantic mapping, coordinate uncertainty, unit ambiguity, geometry inconsistency, source-authority ambiguity, a model revision conflict, or an uncertain structural relationship. AI cannot clear those reviews.

## AI authority

AI may summarize model metadata, explain stated object properties, identify missing metadata, suggest a candidate mapping, identify a possible inconsistency, draft a review question, compare revisions, and summarize a geometry or semantic change. Those outputs remain advisory unless a later deterministic rule says otherwise.

AI may not invent geometry, silently repair geometry, fabricate a missing object, invent a material, a section property, reinforcement, a load, or a restraint, invent a source revision or authority, approve a mapping, approve a structural interpretation, certify a model, or certify engineering adequacy.

## Security model

Future controls cover source authentication, artifact authorization, revision integrity, fingerprint integrity, provenance, workspace isolation, mapping authority, AI authority, file and API adapters, and untrusted file handling. Spoofing controls must later reject a fake source system, a fake revision, forged metadata, cross-workspace substitution, authority impersonation, and a content fingerprint mismatch. No parser sandbox is implemented in this phase, and no security library is added.

## Untrusted files

If a later phase authorizes ingestion, CAD and BIM files are untrusted inputs. That later work should consider parser isolation, resource limits, decompression bombs, malformed files, unsafe embedded content, excessive geometry, external references, path traversal, and parser vulnerabilities. Those controls are requirements on a future phase, not a runtime added here.

## Data governance and scope

Evidence is scoped to one tenant, one workspace, and one project. A model from another workspace does not become evidence without a governed authorization, and this phase does not create that authorization. Cross-tenant and cross-workspace references are not allowed. Least privilege, data minimization, tenant isolation, workspace isolation, data-residency extensibility, controlled external references, auditability, and provenance remain in force. EU-grade privacy, cybersecurity, human oversight, AI transparency, and auditability are a high-bar baseline. Deployment is not hard-coded to the European Union. No legal compliance or certification is claimed.

## Retention and source of truth

EOS prefers a reference, governed metadata, or bounded extracted evidence over an uncontrolled copy of a complete source payload. The allowed future modes are reference, governed metadata, extracted evidence, and a content snapshot. Which large binary store to use is not decided. For an external source, EOS is an evidence consumer and a governed reference holder. It does not own the external model. For a manual reference, EOS holds the reference only. EOS is source of record only when an already authorized authoring track created the artifact. D1M does not author artifacts and does not become that owner.

## Readiness

Architecture is ready. Source-reference runtime is not ready. Model-evidence runtime is not ready. Format-adapter runtime is not ready. Structural-interpretation runtime is not ready. Change-governance runtime is not ready. The historical post-D1L flag that said this architecture was not yet written stays false, because it records that earlier decision. The readiness flag for this phase is the architecture contract.

## Preserved state

D1L stays complete with limitations. Certification eligibility stays unsatisfied. The structural pack stays incomplete. D1G live validation, engineer validation, conformance, and certified-solver status stay unmet. Concrete C10 review, D1F human review, D1H validation, D1I validation and conformance, D1J validation, conformance, and unavailable concrete parameter semantics stay open. GA security debt still blocks general availability. D1N stays not absorbed. D2 through D9 stay unstarted. No database schema changes. No dependency is added. No validation, conformance, solver certification, certification, or product claim is promoted.

## Future phase decomposition

The canonical sequence is an artifact and exact source-revision foundation, then source-object and structural-target mapping, then geometry and semantic evidence, then unit, coordinate, and axis reference, then model relationship evidence, then the file and API adapter boundary, then change, staleness, and supersession, then the D1K, D1L, and D1N evidence handoff, then closeout. The identifiers are EOS-D1M-R1-CAD-OR-BIM-ARTIFACT-SOURCE-REVISION-FOUNDATION, EOS-D1M-R2-SOURCE-OBJECT-STRUCTURAL-TARGET-MAPPING, EOS-D1M-R3-GEOMETRY-SEMANTIC-EVIDENCE, EOS-D1M-R4-UNIT-COORDINATE-AXIS-REFERENCE, EOS-D1M-R5-MODEL-RELATIONSHIP-EVIDENCE, EOS-D1M-R6-FILE-API-ADAPTER-BOUNDARY, EOS-D1M-R7-CHANGE-STALENESS-SUPERSESSION, EOS-D1M-R8-D1K-D1L-D1N-EVIDENCE-HANDOFF, and EOS-D1M-R9-CAD-OR-BIM-INTELLIGENCE-CLOSEOUT.

R1 may record one exact artifact revision and cannot parse, ingest, map, or interpret. R2 cannot let AI approve a mapping. R3 cannot validate adequacy or auto-map an unknown label. R4 cannot convert units or infer axes. R5 cannot treat a relationship as a load path. R6 cannot add a parser or a connector. R7 cannot decide engineering impact. R8 cannot certify, orchestrate, or absorb D1K, D1L, or D1N. R9 cannot complete the structural pack.

## Next authorized phase

The next phase is EOS-D1M-R1-CAD-OR-BIM-ARTIFACT-SOURCE-REVISION-FOUNDATION. It records one governed reference to an exact CAD or BIM source artifact revision, including source class, authority, provenance, content fingerprint, and tenant, workspace, and project scope. It does not parse the artifact, ingest a file, map an object, extract geometry, convert units, infer axes, start a connector, or treat the reference as engineering validation. This architecture does not start that phase.

## Acceptance criteria

The architecture is accepted when the four evidence stages are distinct, D1A identity is reused, source classes and authority classes are the D1K classes, revision pins are exact, no format is claimed as supported, fingerprints and the digital thread are the existing ones, D1K, D1L, D1N, and D9 stay in their own roles, every runtime count is zero, and the next phase is the artifact and source-revision foundation.

## Explicit non-claims

This architecture does not claim that a model is validated, that a parse is correct engineering, that geometry is adequacy, that connectivity is a load path, that a BIM material, section, load, support, or reinforcement record is validated design input, that a source approved or published state is EOS approval or certification, that IFC or any vendor format is supported, that an existing interoperability adapter is D1M, that AI may invent missing truth, or that the structural pack is complete.
