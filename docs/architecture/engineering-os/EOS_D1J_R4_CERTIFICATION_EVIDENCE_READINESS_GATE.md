# EOS-D1J-R4 Certification Evidence Readiness Gate

R4 records an optimization-study evidence package. It pins the R1 problem, baseline, and variable set, the R2 objective set, required-check set, and evaluation profile, and the R3 candidate set, evaluations, feasibility, and comparison. It records a human review and a human selection. It does not run an optimization search, generate a candidate, execute a solver, execute an engineering check, or change a structural model.

Certification in this phase means a governed process-evidence and readiness assessment. It does not mean professional certification, regulatory approval, design certification, or solver certification. A complete evidence package can exist while certification eligibility stays NOT_ELIGIBLE.

## Upstream reuse

R4 uses the R1, R2, and R3 runtimes. It does not create a second study runtime and it does not promote D1G, D1I, D1D, D1E, or the earlier D1J phases. Concrete parameter semantics remain NOT_AVAILABLE. Variable-assignment references remain zero. Candidates stay reference-only records. The manifest discloses that limitation and does not describe those candidates as EOS-generated designs.

## Manifest

The study manifest pins exact fingerprints for the problem, baseline, variable set, parameter-semantic status, objective set, required-check set, evaluation profile, candidate set, evaluations, feasibility, comparison, selected candidate, reviews, selection, D1G readiness, D1J engineer-validation status, and D1J conformance-validation status. A reference of latest is rejected. List order is canonicalized before the fingerprint is computed. Study evidence cites that manifest. It is not a design model and it is not an engineering approval.

## Human review

The reviewer identity comes from the authenticated human actor. An AI, system, or optimizer authority cannot be the reviewer of record, and a caller cannot name a different person. Review scope is limited to the candidate record, its evidence, or the study record. The outcomes are REVIEW_RECORDED, REVIEW_RECORDED_WITH_LIMITATIONS, and NOT_ACCEPTED_FOR_STUDY. Those outcomes are study records. They do not grant software engineer validation or conformance validation, and they do not rewrite feasibility or Pareto classification. A later review supersedes the earlier record. The earlier record stays in history.

## Human selection

A completed selected study requires a human selection. The selected candidate must belong to the pinned candidate set. An unregistered candidate cannot be selected. Non-dominated status does not select a candidate. A dominated candidate may be selected only with an explicit rationale. That selection leaves the candidate dominated, leaves the objective set unchanged, and does not create a hidden objective. An infeasible or undetermined selection may be retained for audit and cannot become certification-eligible. Selection purpose is either PREFERRED_FOR_FURTHER_DEVELOPMENT or SELECTED_OPTIMIZATION_ALTERNATIVE. Neither purpose is formal design approval. Formal approval remains in the existing engineering-review decision workflow. R4 does not call that workflow and does not create a second approval engine. Professional registration is not inferred from the actor role.

## Selected evidence and completeness

Selected-candidate evidence reuses the R3 correlation between the candidate and its design-state fingerprint. Baseline evidence cannot stand in for that candidate. Completeness is COMPLETE_FOR_DECLARED_SCOPE, PARTIAL, INCOMPLETE, STALE, INVALID, or UNDETERMINED. A package without a selection, without a review, or without the selected candidate's required objective or check evidence is not complete. Completeness does not decide eligibility.

## Readiness and eligibility

Readiness stays in separate layers: ARCHITECTURE_READY, FIXTURE_TEST_READY, PILOT_RUNTIME_READY, LIVE_SOLVER_RUNTIME_READY, ENGINEER_VALIDATED, CONFORMANCE_VALIDATED, and CERTIFICATION_ELIGIBLE. Architecture and the bounded fixture tests of R1, R2, and R3 are ready. Fixture readiness is not live validation. Pilot runtime, live solver runtime, engineer validation, and conformance validation are not ready. The canonical D1G solver status remains NOT_CERTIFIED. Offline connector conformance is not certified-solver status. No SPACE GASS session is executed.

Eligibility is the conjunction of a current complete manifest, a feasible selected candidate, human review, human selection, certified D1G, D1J engineer validation, and D1J conformance validation. Dominance alone is not a blocker. A comparison-ineligible selection is not represented as supported by the trade-off comparison. The caller cannot set certified, eligible, engineer-validated, or conformance-validated flags. There is no admin override and no AI override. With the current canonical sources, eligibility is NOT_ELIGIBLE. That result is not a certificate and not a design approval.

## Provenance, history, and staleness

Review, selection, manifest, and eligibility fingerprints are deterministic. Recorded time comes from the store clock. A caller cannot backdate a record. History is append-only. A new review, selection, or eligibility assessment does not rewrite the previous record. A change to the baseline, variable set, objective set, required-check set, candidate, evaluation, feasibility, candidate set, review, selection, D1G readiness, engineer-validation status, or conformance-validation status marks the manifest stale. A stale manifest cannot support certification eligibility. Invalidation does not delete history and does not change the upstream source authority.

## R5 handoff

The next canonical phase is EOS-D1J-R5-STRUCTURAL-OPTIMIZATION-CERTIFICATION-CLOSEOUT. R5 may close the bounded track and cannot grant D1G certification, engineer validation, conformance validation, or certification eligibility. Current NOT_ELIGIBLE status does not by itself block that closeout. The handoff preserves the study evidence, manifest, human review, human selection, selected-candidate evidence, completeness, readiness layers, D1G NOT_CERTIFIED, absent D1J engineer validation, absent D1J conformance validation, eligibility NO, the parameter-semantic limitation, provenance, fingerprints, history, and staleness. No optimizer runtime is included.
