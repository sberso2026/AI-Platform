# EOS-D1K-R4 Internal and External Reference Composition Closeout

## Status

EOS-D1K-R4 composes a governed external or manual engineering reference into the existing structural interface chain. The runtime status is REFERENCE_COMPOSITION_DEFINED. The maturity state is STRUCTURAL_INTERFACE_INTERNAL_EXTERNAL_REFERENCE_COMPOSITION_IMPLEMENTED. Architecture readiness and reference-runtime readiness remain in place. Bounded external and manual composition is ready. Internal discipline integration and cross-discipline intelligence remain not ready.

## Source classification model

Classification reuses the existing allowlist: native EOS discipline source, external governed engineering source, and manual governed engineering reference. An unknown string is rejected. Display labels are not a classification.

## External reference runtime

An external composition reads a catalogued source of the external class and records an R1 interface pin. The source identity, revision, authority, evidence, and provenance come from that catalog entry. The composition does not copy a source body and does not mark the reference operational.

## Manual reference runtime

A manual composition uses the same pin path for a manual class. It preserves the recording actor and that actor's authority. The recording action does not authenticate the source, approve engineering, or declare the source correct.

## Native EOS source seam

The native seam checks that a native source has identity, revision, authority, evidence, provenance, and scope. A non-structural native source, or a source that claims a pack contract is exposed, is rejected because D2 through D8 are not started. A complete structural native contract remains admissible only as a seam assessment. Its live-provider flag stays false.

## Exact source requirements

Composition requires a catalogued source identity. A revision of latest or current is rejected. The resulting pin stores the catalog revision and the canonical source fingerprint.

## Authority

The source authority remains the catalog authority. The composer must be a human provider. A requester and an artificial authority are rejected. Source authority is not replaced by the recording actor.

## Evidence

Evidence identity and evidence kind come from the catalog. An unknown evidence kind is rejected. The runtime does not interpret a file body.

## Provenance

Provenance is the catalog provenance reference plus the recording actor and time stored by the R1 record. Empty or artificial provenance is rejected. Provenance is not invented.

## Revision and version pinning

The composed record pins the catalog revision. A later revision is a new interface through the existing supersession path. The predecessor revision stays in place.

## Source classification persistence

The composition result, the R1 record, and the source fingerprint include the source class. An external result stays external after compatibility diagnosis, provision, and supersession. A manual result stays manual.

## R1 integration

Composition calls the existing interface registration. The R1 fingerprint and exact source pin are the composed reference. A caller-supplied fingerprint that does not match the catalog fingerprint is rejected and is not rewritten into the catalog.

## R2 integration

Diagnosis of a composed reference calls the existing compatibility runtime. External and manual references use that same runtime. A successful composition does not mean the reference is compatible. An incompatible diagnostic is not reconciled.

## R3 integration

Provision and source change call the existing lifecycle runtime. A source change marks the predecessor stale and requires compatibility reevaluation on the successor. The prior composition result remains in the composition history.

## External source change behavior

The predecessor keeps its source identity, class, revision, and fingerprint. The successor is a new governed pin. Silent repointing is not available.

## Staleness behavior

Staleness is derived by the R3 replay when the predecessor source is superseded. It is tied to that source relationship.

## Human-review requirements

The composed pin preserves the human-review flag supplied to registration. Composition does not satisfy that review and does not approve the interface.

## Source admissibility

An admissible result means the source class, scope, revision, authority, evidence, and provenance were sufficient to create an R1 pin. It does not mean the source is compatible, accepted, correct, or approved.

## Invalid reference behavior

The runtime rejects an unknown class, a spoofed class, a class that does not match the requested composition path, a floating revision, a missing authority, an invalid evidence kind, an invalid provenance reference, a tampered fingerprint, an unauthorized actor, a cross-workspace source, an unsupported relation, and an arbitrary payload.

## Workspace isolation

The composer, the catalog source, and the structural target must share tenant, workspace, and project. Cross-workspace composition is rejected.

## Source-origin spoofing protections

Claiming a native class for an external or manual source is rejected. Composing a manual source through the external path is rejected. Composing an external source through the native seam is rejected. A non-structural native source cannot impersonate a started discipline pack.

## AI authority boundary

An artificial authority cannot compose a reference, invent metadata, or approve it. Free-form payload content is rejected rather than interpreted.

## No arbitrary payload bus

There is no function that accepts arbitrary engineering JSON as governed evidence. A payload field on a composition request is rejected.

## No generic file ingestion

No parser for documents, spreadsheets, CAD, BIM, images, or unstructured text was added. A document identity may be referenced as evidence.

## No new connector boundary

No SharePoint, drive, vendor, CAD, BIM, email, or webhook connector was added. An operational external reference flag remains unauthorized by the R1 pin.

## No transformation boundary

Composition does not convert units, transform coordinates, transform axes, transform signs, or transform schemas.

## No automatic conflict-resolution boundary

Composition does not resolve an R2 conflict and does not replace a conflicting source on its own. Automatic engineering conflict resolution remains zero.

## D2 through D9 boundaries

No civil, geotechnical, mechanical, piping, process, electrical, instrumentation, or global intelligence runtime is started. Cycle detection is not implemented. No engineering formula was added. D1L certification is not started. D1M and D1N remain unabsorbed. No production database schema was changed.

## Readiness assessment

External and manual composition is an executable governed runtime, so bounded external reference readiness is yes. Internal discipline integration remains no because the native seam has no live D2 through D8 provider. Cross-discipline intelligence remains no. Reference runtime readiness remains yes.

## Test evidence

Behavioral tests cover classification, external and manual composition, exact revision, floating rejection, authority, evidence, provenance, actor identity, workspace rejection, spoofing, fingerprint mismatch, R2 diagnosis, R3 provision and staleness, native seam rejection, payload rejection, and the transformation and approval boundaries.

## Security evidence

Composition enforces tenant, workspace, project, role, and source-class boundaries. The known engineering-review migration failure and persistence boundary failure remain the inherited baseline. They share one root cause.

## Release evidence

The composition runtime and capability manifest are release-sensitive. The closeout document is not. No validation, conformance, certification, or release-classification promotion is made.

## Remaining limitations

The next phase closes the bounded D1K track. It is not implemented here. Internal discipline engines remain unstarted. Cross-discipline intelligence remains unstarted. Engineer validation, conformance, certification, and GA remain unmet. The inherited debt ledger is unchanged: Concrete C10 engineer review pending. D1F system-orchestrator human review pending. D1G live validation pending. D1G engineer validation pending. D1G conformance and certified-solver status remain unmet. D1H engineer validation pending. D1I engineer validation pending. D1I conformance validation pending. D1J engineer validation pending. D1J conformance validation pending. D1J concrete parameter semantics remain NOT_AVAILABLE. GA security debt remains.

## Exact next authorized phase

The next authorized phase is EOS-D1K-R5-CROSS-DISCIPLINE-STRUCTURAL-INTERFACES-CLOSEOUT. Its scope is to close the bounded D1K track by recording architecture, reference runtime, compatibility, lifecycle governance, external and manual composition, and the future internal seam. It does not grant D9 intelligence, cycle detection, D1L certification, or engineering approval.
