# EOS-D1M-R1 CAD or BIM Artifact Source Revision Foundation Closeout

## Canonical scope

This phase records one governed reference to an exact CAD or BIM source artifact revision. The reference carries source class, source-system identity, source authority, provenance, a declared content fingerprint, and tenant, workspace, and project scope. It also pins a D1A structural system as context. It does not parse the artifact, ingest a file, map an object, extract geometry, convert units, infer axes, start a connector, or treat the reference as engineering validation.

## Source-reference runtime

The runtime is an in-memory store. recordCadBimSourceRevision creates one current reference. An exact repeat returns the same reference. A different body for the same reference id is rejected. No production schema was added and no dependency was added.

## Artifact identity

The artifact id is the identity. The display name is stored and is not part of the metadata fingerprint. A different display name does not create a different reference. The filename is not the identity.

## Exact revision

A blank revision is rejected. The tokens latest, current, newest, head, active model, current BIM, and current drawing are rejected. Nothing in this phase resolves those tokens to a newer revision.

## Source classification

The allowlist is the D1K source classes: native EOS discipline source, external governed engineering source, and manual governed reference. Any other class is rejected.

## Source-system identity

A source-system id is required metadata. Recording it does not start a live connector. A request to mark the source system as a live connector is rejected.

## Source authority

The source authority stored on the reference is source authority. The actor who records it must be interface-record authority. A model author is not an engineering approver. Source authority is not certification authority. An administrator is not source engineering authority. AI is not source authority.

## Provenance

Provenance and evidence are required. The recorded provenance keeps the actor, source class, source system, revision, source authority, content fingerprint, fingerprint provenance, timestamp, and scope. Missing provenance is rejected. AI text in provenance is rejected. Nothing is filled in.

## Content fingerprint

The content fingerprint is a declared source fingerprint. Its provenance and evidence are required. It is not marked EOS-verified. A caller cannot force verification. The metadata fingerprint uses fingerprintCanonical over the governed reference fields and does not include the display name. No second hash algorithm was added. The revision and the content fingerprint are separate fields. Changing either one changes the metadata fingerprint. Identical declared content is not engineering equivalence.

## Scope

Tenant, workspace, and project come from the recording actor and must match the structural system context. A caller-supplied workspace or tenant that differs is rejected. A locator may be a governed key. Path traversal, a file URI, and an unrestricted local path are rejected. The locator is not fetched.

## Immutability and history

The stored revision, artifact id, and metadata fingerprint are not rewritten. A silent repoint is rejected. An explicit successor uses a new reference id and a predecessor id. The predecessor becomes superseded and its metadata fingerprint stays the same. History records creation and supersession. This is not source polling, automated revision detection, or change-impact analysis.

## What the reference is not

The reference stores no payload and no parsed model. A payload on the request is rejected. A declared format such as IFC or RVT is descriptive metadata. Format support stays false and adapter support stays not claimed. A source workflow state such as approved or published is stored as source metadata. It does not become EOS engineering approval and it does not become certification. A pinned revision is not engineering validation. A content fingerprint is not engineering validation.

## Boundaries that stay closed

No parser, file ingestion, geometry extraction, semantic extraction, relationship extraction, unit conversion, coordinate transformation, axis inference, model correction, CAD authoring, or BIM authoring is implemented. Each of those entry points rejects the call. No vendor connector is implemented. No source object is identified and no source object is mapped to a structural member. That mapping is the next phase.

## D1A, D1K, D1L, D1N, and D9

The structural context reuses the D1A structural system kind. No parallel structural identity is created. Source class, authority separation, scope rejection, and fingerprintCanonical are the D1K primitives. No parallel cross-discipline interface is created. D1K internal integration and D1K intelligence stay not ready. D1L stays complete with limitations. A source reference is not certification eligibility. D1N stays not absorbed and is not started. D9 is not absorbed. D2 through D8 are not started. Global cycle detection is not started. The structural pack stays incomplete.

## AI

AI cannot record a reference, supply a fingerprint, or supply provenance. AI cannot mark the reference engineering validated.

## Security and release

Scope, authority, revision, fingerprint, and history checks are the source-spoofing controls. AAL2 is unchanged because this recorder is not an administrator and not a certification authority. No validation, conformance, solver certification, format support, or product claim is promoted. GA security debt still blocks general availability. D1G live validation, engineer validation, conformance, and certified-solver status stay unmet. The post-D1J debt, including unavailable concrete parameter semantics, stays open.

## Next phase

The next phase is EOS-D1M-R2-SOURCE-OBJECT-STRUCTURAL-TARGET-MAPPING. It may record a mapping from one source-model object on an exact R1 revision to one existing D1A structural target, with evidence, authority, provenance, fingerprint, and history. It does not extract geometry or semantics, parse a file, ingest a payload, or let AI approve the mapping. This closeout does not start that phase.
