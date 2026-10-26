# EOS-D1I validation evidence

## 1. Scope

D1I is the bounded structural digital-twin reference layer. The methods in this evidence are twin identity, exact state reference, lane current selection, immutable snapshot, as-of effective view, as-known view, compatibility, state conflict, conflict review, multi-source composition, monitoring source, device reference, channel reference, target binding, telemetry data reference, and telemetry state reference.

Streaming, sensor analytics, structural health diagnosis, model calibration, structural adequacy, capacity assessment, prediction, remaining life, and repair design remain outside the implemented scope. D1I adds no new engineering formula. The twin does not own upstream engineering truth.

## 2. Historical track

The historical digital-twin track status is COMPLETE_BOUNDED_WITH_LIMITATIONS. This phase does not reopen it. The closeout snapshot keeps the software-engineer validation count at 0 and the method-conformance validation count at 0. Those constants stay frozen so the historical closeout, debt, resequencing, D1G, and D1H verifications remain true. The pack formula flag D1I_VALIDATION_SATISFIED stays false because it is defined from those frozen counts. This phase records a separate evidence result.

## 3. Truth boundary

A digital-twin record is not the physical asset. A current reference is not a governing physical state. A current selection is not structural truth, engineering validation, engineering approval, safety, or adequacy. The twin is not a BIM model, a 3D model, an analysis model, an inspection database, or a telemetry platform. Observed, measured, interpreted, analytical, inferred, predicted, and telemetry states stay distinct classes. An analysis result is not an observed state. Effective time is not known-at time. AI cannot select governing physical truth.

## 4. Software-engineering validation

Software-engineering validation means traceable evidence that the bounded twin rules behave as documented: identity, provenance, currentness, history, lineage, transitions, declared units, assumptions, applicability, and limitations. Record-level human governance of a twin subject is a separate runtime and is explicitly not software-engineer validation. The authority for this evidence is the repository implementation and its tests. Qualified structural engineering review remains deferred.

## 5. Twin identity

createTwin binds the record to a tenant, workspace, project, and a current governed structural target. The recorded status does not replace structural identity and does not copy upstream bodies. A second tenant cannot create that twin. This evidence executed that identity path against a fixed clock and a system target named sys-1.

## 6. State provenance

The created record carries a fingerprint, a trusted created-at time, a registration actor, and an authority. The creation event does not grant engineering approval. State references, selections, snapshots, conflicts, and monitoring records keep their own provenance under the R5 coverage matrix.

## 7. Currentness

Reference statuses distinguish current, historical, stale, unresolved, invalid, and superseded. Monitoring source statuses distinguish stale, superseded, and invalid. Current does not mean validated. Stale does not mean invalid. Superseded does not mean invalid. A superseded structural target is rejected for a new twin. A current binding does not cover earlier telemetry, and a closed binding does not cover later telemetry.

## 8. History

Selection history is append-only. Late data does not rewrite a prior known-at view. An identical create replay returns the same record and does not append a second history row. Upstream bodies are not rewritten when a reference becomes stale.

## 9. Lineage

The first history row names a null predecessor explicitly. Supersession adds a successor and leaves the predecessor identity intact. A relationship is not authority, requirement adoption, or engineering validation. Inferred lineage without a recorded predecessor is not allowed.

## 10. State transitions

A twin is created only against a current target. A changed purpose under the same twin id is rejected. A stale target is rejected. R2 does not silently switch a stale selection to another reference. Conflict disposition does not change the R2 selection. These rules are the documented state machine for this bounded layer.

## 11. Method traceability

Sixteen methods name a method id, capability, implementation file, git blob, and the existing D1I test file. The source is the internal R5 closeout matrix. No published-standard clause is claimed.

## 12. Implementation mapping

Identity and state references live in the reference foundation. Selection, snapshot, as-of, and as-known views live in temporal governance. Compatibility, conflict, review, and composition live in conflict composition. Monitoring source, device, channel, binding, telemetry reference, and telemetry state live in the monitoring reference. This phase does not change those modules.

## 13. Parameter and state semantics

A state reference pins source domain, object type, object id, version, fingerprint, authority, validation, effective time, known-at time, and limitations. A numeric telemetry sample is not stored. A channel names its quantity and unit. A raw number does not imply an engineering meaning that the metadata does not state.

## 14. Units and sign

A channel without a unit is rejected. Force units that the existing converter accepts, kilonewton and newton, are compatible with each other. An unsupported force unit is not compatible. This evidence executed that compatibility check. D1I defines no signed-quantity convention. A directional channel axis is an explicit field, and a missing required axis is rejected. Sign convention is not applicable.

## 15. Assumptions and defaults

Silent engineering assumptions are not allowed. Purpose and governance profile are required. Unknown calibration is not calibrated. Unknown clock synchronization is not synchronized. A caller checksum does not establish source truth. The newest reference is not selected automatically.

## 16. Applicability

The valid domain is one tenant, workspace, and project, with a current governed structural target and an explicit purpose and profile. Supported records are the sixteen implemented methods. Unsupported conditions include streaming, sample storage, automatic model update, and cross-tenant access.

## 17. Limitations

Every evidence row keeps the limitation that the record does not establish physical truth, adequacy, capacity, certification, or engineering approval. Limitations cannot be dropped silently. The historical product-claim limits stay on the closed twin track.

## 18. Evidence matrix

Each method has a source, location, subject revision, existing test coverage, method-match status MATCH, applicability, limitations, software-engineering validation status EVIDENCE_RECORDED, and human structural review status DEFERRED. The identity row records the executed create, replay, duplicate rejection, cross-tenant rejection, and stale-target rejection. The channel row records the executed unit-compatibility check.

## 19. Tests

The evidence module executes the identity path and the unit-compatibility check at load and fails closed if they change. The existing D1I architecture, reference, temporal, conflict, monitoring, and closeout suites remain the regression evidence. This phase adds one evidence test file.

## 20. Reproducibility

Subject revisions are git blobs of the reference, temporal, conflict, monitoring, and closeout files. The same inputs and the same clock produce the same twin fingerprint. Replay returns that fingerprint.

## 21. Exact revision binding

Validation requires the exact subject revision. A floating source reference count remains zero. Historical validation is not automatically repointed. A new implementation revision does not inherit this evidence.

## 22. Defects discovered

None. The executed identity path matches the documented create, replay, tenant, and stale-target rules.

## 23. Defects fixed

None. Runtime files were not changed.

## 24. Remaining defects

None inside D1I. D1J and D1K still have their own unsatisfied evidence. That is later-phase scope, not a defect found by executing D1I.

## 25. Reused D1G and D1H evidence

D1G technical execution does not satisfy D1I. D1H validation evidence does not satisfy D1I. A D1H finding may later be pinned as an observed-state reference. That pin is a pointer. It does not transfer D1G route completion or D1H method evidence into twin validation.

## 26. Human review

Qualified structural review stays DEFERRED_PENDING_DEVELOPMENT_BASELINE_FREEZE. C10 is not satisfied. D1F is not satisfied. No reviewer identity is recorded. Every matrix row keeps human structural review deferred.

## 27. Authority

AI is not engineering authority. An administrator is not engineering authority. A twin update is not engineering approval. A current twin state is not engineering validation. Software validation is not structural approval.

## 28. Non-conformance

This validation is not engineering conformance, certification, or regulatory approval. A passing test is not conformance. A twin state is not conformance.

## 29. Downstream handoff

The next phase is EOS-D1J-VALIDATION-EVIDENCE, type D1J_VALIDATION_EVIDENCE. Its scope is to record D1J engineer validation and conformance evidence without reopening the optimization track, until D1J_VALIDATION_SATISFIED is true, while parameter semantics remain a disclosed limitation. D1I evidence does not satisfy that phase. D1J, D1K, the qualified review, and the pack closeout remain incomplete. The review baseline stays unfrozen. The structural pack stays incomplete. The completed milestone count is 11 of 15.
