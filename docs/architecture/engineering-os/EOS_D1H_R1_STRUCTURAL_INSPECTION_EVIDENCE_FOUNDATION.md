# EOS-D1H-R1 structural inspection evidence foundation

This phase implements one bounded domain runtime for structural inspection context, structural target linkage, explicit inspection coverage, evidence identity, source provenance, and append-only history. It reuses the D1H-0 contracts. It does not implement a finding engine, a measurement engine, a condition rating, engineering interpretation, human engineering validation, repair design, capacity reduction, computer vision, AI detection, or a digital twin.

Maturity is STRUCTURAL_INSPECTION_EVIDENCE_RUNTIME_FOUNDATION_IMPLEMENTED. The evidence-foundation runtime count is one. Finding, measurement, condition-state, condition-rating, engineering-interpretation, human-validation, and AI-detection runtime counts are zero. No engineering formula is added. No database migration is added. Full D1H is not implemented.

## Platform and identity reuse

The runtime requires an existing inspection-intelligence session identifier. It does not create a second session lifecycle or a session state machine. Structural targets reference existing D1A and D1F identities for the structural system, member, connection, support, and foundation. A bounded region must name one of those governed parents plus region metadata. An orphan region is rejected. Artifact references use existing platform artifact identity and content fingerprints. Analysis-result references use existing D1A and D1F result identity. No parallel file repository, inspection platform, or structural object model is created.

## Context, purpose, and method

A context records tenant, workspace, project, structural system, inspection session, declared purpose, declared scope, inspection time, coverage scope, method references, source authority, governance profile, provenance, version, fingerprint, and status. Status is draft, recorded, or superseded. Those states are not engineering approval. Purpose is one of the D1H-0 declared purposes and is not inferred. A method reference is not a statement that the method is adequate.

## Targets and location

The runtime checks that the target exists, matches its kind, belongs to the same tenant, workspace, project, and structural system, and is current. Unknown, stale, unconfirmed, and inferred targets fail closed. Filename, image, proximity, and model suggestions do not select a governing target. A stale target is not rebound to a replacement object. A local target requires an explicit location. Location is not guessed from a filename or from media.

## Coverage and negative evidence

Coverage records the context, session, target, region, method, access state, limitations, authority, provenance, version, and fingerprint. The access states remain not inspected, inaccessible, inspection scope unknown, inspected with no finding recorded, and inspected with findings. No finding recorded is not defect-free, healthy, or good condition. Inaccessible is not inspected and is not proof of no defect. Coverage limitations are kept. Coverage authority must be human. AI cannot set a governing coverage state. Inspected coverage is not structural adequacy. Several member coverage records do not make the whole system complete, and zero findings do not make the structure clear or safe.

An explicit negative observation is human evidence that no relevant visible defect was seen inside a declared target, method, and scope. It stores that scope and the coverage limitations. It does not create a defect, a finding, a good-condition claim, or a hidden-condition claim. Evidence can exist with no finding. Observations are not forced into the observed-defect class.

## Evidence and artifacts

Evidence records identity, context, session, target, source class, source artifact when required, capture time, capture actor, location, method, unit when supplied, authority, unvalidated state, provenance, version, fingerprint, and derivation reference. Source classes are the D1H-0 classes. A photo, video, document, or instrumentation reference requires an existing artifact. A human observation or measurement source class may omit an artifact. Measurement remains identity only. An analysis-result reference requires an existing result and is not an observed condition or a measured response. A historical reference must point at prior evidence and the same source artifact. It does not re-author that evidence. AI-derived candidate evidence requires the source evidence, model identity, model version, and execution fingerprint, and it cannot govern. This phase does not run AI inference.

A missing required artifact fails closed. Duplicate evidence identifiers fail. Matching content fingerprints are retained as separate records and are not independent corroboration. Derived evidence points at its source and cannot form a cycle. The raw source record is not overwritten. Recorded evidence is not human-validated, and a schema-valid record is not engineering-valid. The source actor is not engineering authority.

## History, correction, and invalidation

Context creation, coverage recording, evidence capture, derivation, supersession, and invalidation are appended. A new context, coverage record, or evidence record does not overwrite the prior record. A correction creates a successor. The predecessor remains reproducible. Current, historical, superseded, and stale states are distinct. Invalidation covers target revision, source correction, location correction, coverage correction, authority withdrawal, provenance correction, upstream supersession, and context supersession. Invalidation does not delete history. A structural revision does not erase evidence.

## Provenance, fingerprints, and completeness

The provenance chain is project, structural system, existing inspection session, inspection context, target, coverage, evidence, and source artifact or reference. Derived evidence continues to its source and raw artifact. Provenance preserves tenant, workspace, project, actor or system, time, authority, version, and fingerprint.

Context, coverage, and evidence fingerprints are deterministic. Method order does not change a context fingerprint. A governed change of target, coverage state, limitation, source artifact, location, method, authority, or version changes the relevant fingerprint.

Completeness for this phase is only complete for the declared evidence scope, partial, incomplete, invalid, stale, or undetermined. Complete evidence is not good condition, inspection adequacy, or engineering acceptance. The runtime result summarizes context, session, system, targets, coverage, evidence, scope, completeness, diagnostic issues, provenance, and fingerprint. It is not a condition assessment or an inspection approval. Events record context, coverage, evidence, derivation, supersession, and invalidation. An event is not engineering approval.

## Boundaries

AI assistance stays advisory. Coverage and target authority stay human. Evidence does not change section properties, material properties, capacity, the analysis model, supports, releases, or loads. Photos, video, measurements, and negative observations do not create defects or condition ratings. The runtime does not recognize faces, identify workers, or score behavior or productivity. D1I is not implemented.

## R2 handoff

The next phase is EOS-D1H-R2-STRUCTURAL-FINDING-MEASUREMENT-VALIDATION-FOUNDATION. It can rely on inspection context identity, inspection session identity, structural target identity, coverage identity, evidence identity, source artifact reference, evidence authority, provenance, fingerprints, history and supersession, invalidation, and completeness. Its scope is bounded structural finding identity, evidence-to-finding linkage, inspection measurement runtime, and scoped human validation, without condition rating, engineering condition acceptance, capacity reduction, repair design, or digital-twin implementation.
