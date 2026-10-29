# EOS-D1K internal integration evidence

Path: docs/architecture/engineering-os/EOS_D1K_INTERNAL_INTEGRATION_EVIDENCE.md

This record proves that existing D1 Structural records compose across their pack-level boundaries. It does not reopen the historical cross-discipline interface track and it does not take ownership of D9.

## 1. Exact internal-integration criterion

Scope: Satisfy the D1K structural-internal integration criterion without reopening D1K or taking over D9. D1K_INTERNAL_INTEGRATION_SATISFIED is true and D9_REOPENED stays false.

Pass criteria: D1K_INTERNAL_INTEGRATION_SATISFIED is true and D9_REOPENED stays false.

The historical pack-formula flag remains false because it aliases D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY. That ready flag stays false. The live evidence flag is the pack-level result for this phase. Historical track status remains COMPLETE_BOUNDED_WITH_LIMITATIONS. D1K_REOPENED stays false.

## 2. D1 component graph

Six components participate: D1F_IDENTITY, D1E_CHECK_REFERENCE, D1G_VALIDATION_BOUNDARY, D1H_INSPECTION, D1I_TWIN, and D1J_OPTIMIZATION.

D1A scope keys travel with the D1F catalog identity. D1M and D1N are closed bounded tracks and are not required edges for this criterion.

## 3. Required integration edges

E1 D1F_IDENTITY to D1H_INSPECTION.
E2 D1F_IDENTITY to D1I_TWIN.
E3 D1F_IDENTITY to D1J_OPTIMIZATION.
E4 D1E_CHECK_REFERENCE to D1J_OPTIMIZATION.
E5 D1G_VALIDATION_BOUNDARY to D1J_OPTIMIZATION.
E6 D1J_PARAMETER_LIMITATION to D1J_OPTIMIZATION.

## 4. Edge contracts

E1 uses the D1F catalog identity as input and a D1H inspection context as output. The context cites tenant-1, project-1, sys-1, and member mem-1. Provenance is the human inspector. A superseded catalog target is rejected. The inspection record does not grant engineering approval.

E2 uses the same system identity as input and the existing D1I twin reference as output. Replay keeps the twin fingerprint. A stale target is rejected. Twin state is not source engineering truth.

E3 uses the same system identity as input and the existing D1J optimization problem as output. Length in metres is compatible. Millimetres are rejected. Problem replay keeps the problem fingerprint. The result is reference-only.

E4 binds a D1E concrete check reference into the D1J constraint. The check is not executed. The flexure domain remains D1E_CONCRETE_DESIGN_CHECK. An infeasible candidate is not an approved design.

E5 binds the D1G validation boundary through the D1J analysis reference. Caller validation does not change the solver status. The solver status remains NOT_CERTIFIED and the reference does not promote authority. Technical validation is not qualified structural review.

E6 carries the D1J parameter-semantic limitation into the study result. The limitation text is retained. Concrete parameter semantics remain NOT_AVAILABLE. The optimization result is not an engineering decision.

## 5. Identity preservation

The inspection context, the twin target, and the optimization problem all cite structural system sys-1 and tenant tenant-1. The inspection target cites member mem-1. The three fingerprints differ, so one record is not silently substituted for another. Silent identity substitution is not allowed.

## 6. Revision preservation

Each edge records an exact source revision and an exact target revision from the frozen subject hashes. A newer artefact is not substituted for the referenced revision. Historical references are not automatically repointed. Floating revision substitution is not allowed.

## 7. Provenance

The inspection fingerprint, the twin fingerprint, and the optimization study fingerprint are retained. Source identity, source revision, method identity, evidence identity, result identity, and lineage stay on the records that already owned them. Source basis is preserved.

## 8. Currentness

The inspection context status RECORDED is not engineering approval. A superseded D1H catalog target is rejected as STALE_TARGET. A stale twin target is rejected as TARGET_STALE. Current is not validated. Stale is not invalid as a historical fact, and superseded is not invalid as a historical fact. Neither is accepted as current validated truth.

## 9. Limitations

The D1J study limitation text is present on the composed result. Parameter semantics remain COMPLETE_WITH_LIMITATIONS. Concrete semantics remain NOT_AVAILABLE. The composition cannot silently drop that limitation. D1G applicability, D1H inspection limits, and D1I twin-state limits stay on their owning records.

## 10. Units and sign conventions

Length metres is compatible with the governed length unit. Millimetres are rejected and are not converted. No unit is stripped. No signed engineering quantity is transformed across these edges, so sign-convention compatibility is NOT_APPLICABLE. There is no silent sign reversal.

## 11. Assumptions

The optimization objective direction remains the explicit MINIMIZE direction. Default weight stays null. The inspection target is not inferred. An assumption is not introduced silently. A legitimate assumption change would have to be explicit on the record that owns it.

## 12. Authority boundaries

AI authority is rejected on the inspection context. The inspection engineeringApproval field is false. The twin engineeringApproval field is false. The optimization candidate approved field is false and certification is false. A calculation result, an inspection record, a digital-twin state, and an optimization result are not engineering approval. AI authority and admin authority are not engineering authority.

## 13. D1F integration

D1F integration status is PASS for the identity and check-reference binding that this architecture actually provides. The shared system and member identity are preserved. The D1E check is referenced and is not executed. Units, the explicit objective direction, provenance, and failure codes are retained. This phase does not run a new system-to-member calculation.

## 14. D1G integration

D1G integration status is PASS. The technical validation route remains executed. The analysis reference keeps certified solver status NOT_CERTIFIED and does not promote authority. D1G technical validation is not qualified structural review.

## 15. D1H integration

D1H integration status is PASS. The context and member target keep system sys-1, member mem-1, tenant tenant-1, and project project-1. Provenance and the fingerprint are retained. A duplicate context id is rejected. A superseded target is rejected. The record does not become engineering approval.

## 16. D1I integration

D1I integration status is PASS. The twin cites the same system and tenant. Replay keeps the fingerprint. A duplicate twin id, a cross-tenant reference, and a stale target are rejected. Digital-twin reference is not source engineering truth. Current twin state is not engineering validation.

## 17. D1J integration

D1J integration status is PASS. The study consumes the governed system identity, the exact problem revision, the length unit, and the retained parameter limitation. A feasible candidate is not approved. An infeasible candidate is excluded from the non-dominated set. The optimization result is not an engineering decision, an approved design, or a certified design.

## 18. D1M and D1N applicability

D1M internal integration is not required. D1N internal integration is not required. Both historical tracks stay closed. Their status for this phase is NOT_REQUIRED.

## 19. End-to-end scenario

One scenario was executed. It passed. None failed.

The scenario is: governed structural subject sys-1 in tenant-1 and project-1, member mem-1, then a D1H inspection context, the existing D1I twin reference, and the existing D1J study. Identity, revision, provenance, currentness, units, limitations, and authority boundaries remain on the downstream records.

## 20. Failure propagation

Failure propagation was tested. A missing or superseded target, a duplicate identity, a cross-tenant scope, an AI authority, an incompatible unit, and an infeasible check do not become successful downstream engineering records. A failed upstream result cannot silently promote.

## 21. Duplicate, replay, and idempotency

Duplicate protection passes: a repeated inspection context id is rejected and a repeated twin id is rejected. Replay protection passes: the twin fingerprint and the optimization fingerprint match their replays. Idempotency passes for those replays.

## 22. Tenant and project scope

Tenant scope is preserved. The inspection, twin, and optimization records cite tenant-1. Cross-tenant internal flow is rejected. No integration case relies on cross-tenant access.

## 23. Evidence matrix

The six edges each record source, target, source revision, target revision, and a passing status for contract, identity, units, revision, provenance, currentness, limitation, assumption, authority boundary, failure behavior, and integration test. The matrix is complete.

## 24. Reproducibility

The scenario uses the fixed clock 2026-06-21T00:00:00.000Z, the D1F implementation revision 1db11bfc7481dc01fabedb320d44d156f2dc4f37, the D1F contract revision 27e902bdba212fcc79adf2c27a99b686f80d7192, and the subject revisions already frozen for D1G, D1H, D1I, and D1J. Result fingerprints are the inspection, twin, and optimization fingerprints retained by the execution.

## 25. Defects found

No integration defect was discovered.

## 26. Defects fixed

No defect was fixed. Runtime files for D1G, D1H, D1I, and D1J were not changed.

## 27. Previous validation reruns

No previously validated component was changed, so no previous validation was rerun. Stale validation evidence is not retained as current for a changed component.

## 28. D9 ownership boundary

D9 remains COMPLETE_BOUNDED_WITH_LIMITATIONS and was not reopened. D1K does not take over global cross-discipline intelligence, conflict intelligence, or recommendation intelligence. A separate D1-to-D9 source-contract pack gate is not required. The existing ownership boundary was not modified.

## 29. Review-baseline freeze

The review baseline is frozen in docs/architecture/engineering-os/EOS_D1_STRUCTURAL_REVIEW_BASELINE.md. Material change after that freeze requires reassessment. The historical freeze flag inside the resequencing module remains false so earlier phase checks stay bound to their own revisions. The live freeze flag for this phase is true.

## 30. Final human-review handoff

Qualified structural review status is READY_FOR_QUALIFIED_HUMAN_REVIEW. C10 qualified human review remains unsatisfied. D1F engineer review remains unsatisfied. Qualified human review is still required for D1 closeout. This integration pass is not that review. The baseline freeze is not that review. The structural pack remains incomplete. The next phase is EOS-D1-QUALIFIED-STRUCTURAL-REVIEW. This phase does not perform that review.
