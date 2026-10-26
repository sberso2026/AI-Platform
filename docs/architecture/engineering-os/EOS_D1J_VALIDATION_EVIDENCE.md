# EOS-D1J validation evidence

## 1. Exact D1J scope

The capability is the bounded structural optimization study record. It covers problem and baseline identity, five governed variable shapes, objective and required-check references, candidate lineage, comparison eligibility, Pareto composition, and a certification-readiness gate that remains not eligible. It does not search a design, generate candidates, run a solver, select a design, or certify one.

## 2. Historical D1J status

The historical track status remains COMPLETE_BOUNDED_WITH_LIMITATIONS. Engineer validation and conformance validation remain NOT_VALIDATED on the closeout snapshot. The pack flag D1J_VALIDATION_SATISFIED therefore stays false. This phase records separate evidence flags and does not rewrite that snapshot. The historical track was not reopened.

## 3. Validation semantics

Software-engineering validation here means traceable evidence that the bounded records behave as documented. It is not a qualified structural engineer review and not a project engineering approval. A study review record does not grant it. The authority is repository implementation and test evidence. A named human reviewer is not required for this evidence record. Final qualified structural review stays deferred.

## 4. Optimization truth boundaries

An optimization result is not an engineering decision, approval, certification, or regulatory approval. The executed candidate stays unapproved and unselected. The problem stays not optimization-ready and not certification-ready. A non-dominated candidate is not a selected design. A feasible evaluation is not an approved design. The composed set stores no selected winner and no certification flag.

## 5. Objective functions

Two objective classes are registered by the same rule. GOVERNED_QUANTITY and D1G_ANALYSIS_METRIC. The evidence run records both as MINIMIZE length in metres, sourced from owned quantity records. Direction is an explicit field. An unlisted direction is rejected. No default weight is stored. No default normalization is stored. A caller-supplied value of 999 is ignored. The owned source value 4 is the recorded value.

## 6. Constraints

Two constraint classes are registered. D1D_STEEL_MEMBER_CHECK for TENSION and D1E_CONCRETE_DESIGN_CHECK for FLEXURE. A constraint cites an allowlisted check kind, a target, and a declared applicability. It does not calculate the check. An empty required-check set is rejected. The required set used for the evidence run contains only the steel tension constraint. The concrete constraint remains defined and is not silently dropped.

## 7. Method traceability

Twenty-two implemented methods are traced. They are problem, baseline, variable, variable set, objective, objective set, constraint, required-check set, check reference, analysis reference, objective value, feasibility, candidate identity, lineage, candidate evidence, comparison eligibility, Pareto composition, human review, human selection, study manifest, readiness gate, and certification-eligibility assessment. Each row names its file, the git object id of that file, and the existing test file. The source is the internal R5 closeout matrix. No standard clause is claimed.

## 8. Method-implementation evidence

All twenty-two cases match the documented method. Mismatch count is 0. Blocked count is 0. Unimplemented search, generation, solver-in-the-loop optimization, model mutation, and automatic selection are limitations, not blocked methods. A match is not engineering conformance.

## 9. Parameter semantics

The parameter registry has five kinds: catalogue choice, enumeration, bounded quantity, integer count, and boolean choice. Each kind names its variable type, optimization type, and whether it is dimensional. None of them mutates a model.

## 10. Parameter limitations

Concrete model-parameter semantics remain NOT_AVAILABLE. All five kinds are traceable and all five are limited. Unresolved count is 0. An attempt to store a generic kind as a concrete assignment is rejected. The parameter-semantics status remains COMPLETE_WITH_LIMITATIONS. That disclosed limit is not treated as universal semantics, and it is not an extra pack gate.

## 11. Units and sign conventions

Length is accepted only in metres. A metre-to-metre pair is compatible. A millimetre pair is rejected, and a variable declared in millimetres is rejected. No silent conversion is applied. Sign convention is not applicable. Direction is an explicit objective field, and a numeric check result is not re-read as a pass or a fail.

## 12. Assumptions and defaults

No default objective weight, normalization, or search step is created. Direction is not inferred. A failed required check is not treated as feasible merely because other checks are absent from the verdict list. Unknown applicability is not treated as not applicable. The caller cannot establish a check verdict or an objective value.

## 13. Search-space rules

A bounded quantity uses the governed engineering minimum and maximum. The evidence variable searches from 2 m to 8 m inside the governed 1 m to 10 m domain. A search from 0 m to 12 m is rejected. A property-path parameter kind is rejected. The search domain is not expanded to an unsupported kind.

## 14. Feasibility semantics

Feasibility is FEASIBLE, INFEASIBLE, or UNDETERMINED. The evidence candidate with a satisfied tension check is FEASIBLE. The candidate with a not-satisfied tension check is INFEASIBLE and is kept out of the non-dominated set. Feasible does not mean approved. The candidate record itself stays unapproved.

## 15. Ranking semantics

Ranking is Pareto non-dominance among comparison-eligible feasible candidates. For two minimize objectives, the candidate at (4 m, 2 m) dominates the candidate at (6 m, 3 m). Two candidates with equal objective values both stay non-dominated. Global rank is null. There is no rank 1. A non-dominated result is not an engineering approval and not a certified design. Reversing candidate order does not change the set fingerprint.

## 16. Reproducibility

The same inputs, the same fixed clock 2026-06-21T00:00:00.000Z, and the same subject revisions produce the same problem fingerprint and the same composed-set fingerprint. Identical problem creation does not append a second history row.

## 17. Provenance

The problem pins tenant, system, baseline, binding, and fingerprint. Each objective pins source fingerprint, unit, and direction. Each candidate pins an exact design-state fingerprint and an explicit parent, which is null when none was supplied. Objective values cite the owned source. A caller value is not the source of truth.

## 18. Exact revision binding

Validation is bound to the git object ids of the foundation, objective, candidate, readiness, and closeout files. A floating reference is not allowed. Historical validation is not repointed. A new revision does not inherit this evidence.

## 19. Certification governance

Certification governance is the readiness gate. Current eligibility is NOT_ELIGIBLE. A caller label of certified on an analysis reference does not change the solver status, which stays NOT_CERTIFIED, and does not promote authority. A certification-eligibility claim is not supported while eligibility is NOT_ELIGIBLE. Eligibility is not a certified design, a professional certificate, a regulatory approval, or a design approval.

## 20. Conformance-evidence definition

Conformance evidence means the implementation follows the documented internal method. It does not mean engineering conformance to a standard, regulatory conformance, or project approval. That evidence is complete for the twenty-two implemented methods.

## 21. Applicability

Supported subjects are catalogued structural systems and members. Supported variable shapes are the five registry kinds. Supported objectives are the two source domains. Supported constraints are steel member checks and concrete limit states. Supported candidates are human-defined or governed-imported references. Unsupported conditions include property-path parameters, unlisted objective directions, empty required-check sets, units outside the declared family, search bounds outside the governed domain, and cross-tenant actors.

## 22. Limitations

Concrete parameter semantics are not available. Candidates are reference-only. Search, generation, solver-in-the-loop optimization, model mutation, and automatic selection are not implemented. A study review does not grant engineer validation or conformance validation. Limitations are retained on every matrix row and are not dropped by a later state in this evidence run.

## 23. Evidence matrix

Each of the twenty-two methods has capability, method, subject revision, internal source basis, implementation location, objective and constraint traceability, parameter-semantics status COMPLETE_WITH_LIMITATIONS, declared-unit status, existing-suite reference status, no-search optimization status, feasibility status, fixed-clock reproducibility, method match, internal-method conformance evidence, applicability, limitations, software-engineering validation recorded, and human structural review deferred.

## 24. Validation tests

The evidence test file names the required D1J categories and executes the study path above. Existing foundation, reference, composition, and readiness suites remain the method references. No test was added only to increase a count.

## 25. Defects discovered

None. The executed rejections and the Pareto result match the documented rules.

## 26. Defects fixed

None.

## 27. Remaining defects

None in D1J scope. Later-phase work for D1K is not a D1J defect.

## 28. Reused prior evidence

D1G technical execution does not satisfy D1J. D1H validation does not satisfy D1J. D1I validation does not satisfy D1J. The unit helper already used by D1J is reused for the metre check. No earlier phase result is repointed onto this revision.

## 29. Human-review deferral

Qualified structural review remains deferred pending the development baseline freeze. C10 and D1F remain unsatisfied. No reviewer identity or signature was created. This evidence does not fabricate final human review.

## 30. Authority boundaries

An AI actor is rejected. An optimization result does not grant engineering authority. Software validation does not equal structural approval. Admin authority is not engineering authority. Cross-tenant creation is rejected.

## 31. Non-conformance and non-certification

This evidence is not engineering conformance, certification, or regulatory approval. The optimization result is not an approved design and not a certified design. The structural pack remains incomplete. General availability is not claimed.

## 32. D1K handoff

The next phase is EOS-D1K-INTERNAL-INTEGRATION-EVIDENCE. Its purpose is to satisfy the D1K structural-internal integration criterion without reopening D1K or taking over D9. D1J evidence does not satisfy that phase. D1K stays incomplete. The review baseline stays unfrozen until D1K evidence is also complete.
