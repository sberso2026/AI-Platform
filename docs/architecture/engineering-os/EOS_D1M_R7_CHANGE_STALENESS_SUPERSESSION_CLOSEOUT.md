# EOS-D1M-R7 Change, Staleness, and Supersession Closeout

## Status

Phase: EOS-D1M-R7-CHANGE-STALENESS-SUPERSESSION

Status: CHANGE_GOVERNANCE_IMPLEMENTED

Maturity: STRUCTURAL_CAD_OR_BIM_CHANGE_STALENESS_SUPERSESSION_IMPLEMENTED

Parent architecture: docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md

R1 closeout: docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md

R2 closeout: docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md

R3 closeout: docs/architecture/engineering-os/EOS_D1M_R3_GEOMETRY_SEMANTIC_EVIDENCE_CLOSEOUT.md

R4 closeout: docs/architecture/engineering-os/EOS_D1M_R4_UNIT_COORDINATE_AXIS_REFERENCE_CLOSEOUT.md

R5 closeout: docs/architecture/engineering-os/EOS_D1M_R5_MODEL_RELATIONSHIP_EVIDENCE_CLOSEOUT.md

R6 closeout: docs/architecture/engineering-os/EOS_D1M_R6_FILE_API_ADAPTER_BOUNDARY_CLOSEOUT.md

Runtime: packages/engineering-os/src/structural-systems/cad-bim-change-governance.ts

This phase records whether an existing D1M record is current, stale, or superseded. It does not decide whether changed engineering is correct. A changed fingerprint means the governed evidence changed. It does not mean the structure became unsafe.

## 1. R1 through R6 dependency chain

R7 cites records that R1 through R6 already govern. It stores an immutable snapshot, the exact fingerprint, and the explicit dependency links the caller supplies. It does not call the R1 source recorder, the R2 mapping recorder, the R3 evidence recorders, the R4 reference recorder, the R5 relationship recorder, or the R6 adapter recorder. A replacement still has to name an exact record, fingerprint, class, provenance, and reason.

## 2. Change-event model

A change event has an id, record class, change class, prior subject, prior fingerprint, new subject, new fingerprint, actor, authority, provenance, reason, timestamp, and scope. Registration is explicit. There is no background poll and no vendor monitor.

## 3. Change classes

The governed classes are artifact revision, content fingerprint, mapping, geometry evidence, semantic evidence, unit reference, coordinate reference, axis reference, relationship, adapter version, contract version, and capability declaration. A change class is accepted only for its matching record class.

## 4. Exact prior and new references

The prior subject must already exist. The supplied prior fingerprint must match the stored fingerprint. The new subject is a new id with a new fingerprint. The same subject cannot supersede itself. An identical fingerprint is not a change.

## 5. Currentness model

Currentness reuses the canonical states CURRENT, STALE, and SUPERSEDED. D1K already uses SUPERSEDED and STALE_DEPENDENCY. D1L already evaluates CURRENT, STALE, and SUPERSEDED. R7 does not treat STALE as the D1L INVALIDATED state. Current means current relative to the exact governing dependencies recorded here. It does not mean latest in an external source, engineering validated, or structurally adequate.

## 6. Staleness model

A record becomes stale when an explicit governing dependency is superseded or itself becomes stale. Stale means reevaluation is required. It does not mean the record is invalid, engineering incorrect, or certification revoked.

## 7. Supersession model

Supersession appends a successor and marks the prior subject SUPERSEDED. The prior snapshot, fingerprint, provenance, and dependency list stay as they were recorded. Superseded does not mean deleted.

## 8. Bounded propagation rules

Propagation walks only dependency links that were registered on the records. It is recursive along those links. It does not invent a link, build a generic graph engine, or search for a global cycle. A record with no explicit dependency stays current.

## 9. R1 propagation

An artifact revision change supersedes that artifact subject. Mappings and later evidence that explicitly cite the old artifact become stale. Their dependency pointers stay on the old artifact. They are not repointed to the new revision.

## 10. R2 propagation

A mapping change supersedes that mapping. Geometry and semantic evidence that explicitly cite it become stale. Upstream artifact records are not inferred to be stale. The evidence is not remapped.

## 11. R3 propagation

A geometry or semantic change supersedes that evidence subject. Reference context and relationships that explicitly cite it become stale. The new evidence is not treated as validated geometry or as an engineering change determination. Unrelated evidence stays current.

## 12. R4 propagation

A unit, coordinate, or axis and sign context change supersedes that context. Relationships that explicitly cite it become stale. Source evidence is not converted or transformed.

## 13. R5 propagation

A relationship change supersedes that relationship. A later record becomes stale only when it explicitly depends on that relationship. R7 does not infer topology, connectivity, or a load path.

## 14. R6 lifecycle effects

An adapter version, contract version, or capability declaration change supersedes that adapter-context subject. A historical submission that explicitly depends on the old contract becomes stale for current adapter context. Its provenance snapshot is not rewritten. The old version remains reconstructable.

## 15. Change versus engineering impact

Detecting a change, including a content-fingerprint change, sets engineering impact determined to false. R7 can say reevaluation is required. It cannot say the design is unsafe.

## 16. Stale versus invalid

Stale records keep engineeringIncorrect, invalid, and certificationRevoked false. Stale is not invalid and is not certification revoked.

## 17. Superseded versus deleted

Superseded and stale records remain in the store. Delete operations are rejected. The subject count for a superseded id stays one.

## 18. Reevaluation-required semantics

A stale record has reevaluation required. That flag is not engineering invalidity, engineering revalidation, or recertification. Clearing the flag without a governed successor is rejected.

## 19. No automatic revalidation

No runtime revalidates engineering because a dependency changed. The revalidation operation is rejected.

## 20. No automatic reinterpretation

No runtime reinterprets geometry, semantics, or structural meaning. The reinterpretation operation is rejected.

## 21. No automatic recertification

No runtime recertifies evidence. D1L remains the certification authority. Staleness does not revoke a D1L decision, and currentness does not make evidence certification eligible.

## 22. Lifecycle authority

Recording a change requires interface record authority. Engineering approval authority, certification authority, administrator authority, and AI parties are rejected. Lifecycle authority is not engineering approval and is not certification authority. Administrator authority is not lifecycle engineering authority.

## 23. Provenance

Every registration and change requires a provenance reference and, for a change, a reason. A blank or AI-authored provenance reference is rejected. The actor, authority, timestamp, and scope are stored on the change event.

## 24. Fingerprints

Change fingerprints and supersession fingerprints both use the canonical fingerprint. No second algorithm is introduced. A fingerprint change is not an engineering impact. Replay of the same change id and fingerprint returns the existing event.

## 25. Immutable history

Historical snapshots are frozen at registration. Status changes do not rewrite them. Mutation and history-rewrite operations are rejected. History events are appended for created, superseded, and stale-recorded.

## 26. Historical reconstruction

Reconstruction returns the frozen snapshot, record class, and currentness for a prior subject after it has been superseded. The prior revision and provenance remain readable.

## 27. AI boundary

AI cannot invent a change event, suppress staleness, mark a stale record current, determine engineering impact, revalidate, recertify, or rewrite history.

## 28. Admin boundary

An administrator cannot arbitrarily supersede evidence, clear staleness without a governed reevaluation, rewrite supersession history, or bypass currentness rules.

## 29. No polling

External change polling and vendor change monitoring runtime counts are zero. Both operations are rejected.

## 30. No parsing, adapters, or connectors

Parse, object extraction, file ingestion, format adapter, vendor connector, and arbitrary URL fetch runtime counts are zero. R7 adds no parser and no format support.

## 31. No global graph reasoning

Generic dependency-graph runtime count is zero. Global model dependency reasoning runtime count is zero. Inferred dependency propagation is rejected.

## 32. No global cycle detection

Global cycle detection runtime count is zero. Direct self-supersession and self-dependency are rejected as local integrity checks, not as a global cycle engine.

## 33. D1K boundary

Cross-discipline governance and the D1K handoff vocabulary are reused. No parallel D1M cross-discipline interface is created. Internal discipline integration and cross-discipline intelligence remain not ready.

## 34. D1L boundary

The D1L track remains complete with limitations. R7 does not mutate D1L eligibility or historical certification decisions. Staleness is not certification revoked. Currentness is not certification eligible.

## 35. D1N boundary

D1N remains not absorbed. D1N runtime is not started and its runtime count is zero.

## 36. D9 boundary

D9 is not absorbed. D9 runtime is not started. D9 runtime count and global cycle detection remain zero. D2 through D8 runtime is not started and its count is zero.

## 37. Security evidence

Tenant, workspace, and project scope are enforced. Cross-tenant and cross-project changes are rejected. Fingerprint substitution, record-class substitution, missing provenance, and inferred dependencies are rejected. No schema change and no new dependency were added. The known security baseline remains the pre-existing pair of failures with one root cause. This phase does not treat that raw suite as passing and does not add a regression.

## 38. Release evidence

The capability row is implemented bounded, not validated, framework only, and release-classified with the existing global classification. It does not claim automated engineering impact, revalidation, reinterpretation, recertification, vendor monitoring, format support, parsing, structural interpretation, conformance, certification, or product general availability.

## 39. Readiness matrix

Architecture ready: yes. Source-reference runtime ready: yes. Model-evidence runtime ready: yes. Adapter-boundary runtime ready: yes. Format-adapter runtime ready: no. Structural interpretation runtime ready: no. Change-governance runtime ready: yes. D1 structural pack complete: no. Post-D1J debt, the D1G certification blocker, D1K limitations, and GA security debt remain preserved.

## 40. Exact next authorized phase

EOS-D1M-R8-D1K-D1L-D1N-EVIDENCE-HANDOFF. Type: CAD_OR_BIM_D1K_D1L_D1N_EVIDENCE_HANDOFF. Scope: hand current D1M evidence to D1K interface governance, D1L certification evidence governance, and future D1N orchestration. Do not make D1K intelligence ready, certify through D1M, start D1N orchestration, start D9, create multidisciplinary reasoning, bypass currentness, or treat stale evidence as current handoff evidence. R8 is not started by this phase.
