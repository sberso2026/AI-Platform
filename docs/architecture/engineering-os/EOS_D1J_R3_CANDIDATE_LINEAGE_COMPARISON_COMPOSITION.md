# EOS-D1J-R3 Candidate Lineage Comparison Composition

R3 records governed design-candidate identity, immutable lineage, candidate-specific R2 evidence, comparison eligibility, and multi-objective composition. It does not generate candidates, run a search, execute a solver or an engineering check, mutate a structural or BIM model, choose a winner, or certify a design.

## R1 and R2 reuse

R3 uses the R1 problem, baseline, variable set, and parameter registry, and the R2 objective set, required-check set, check reference, analysis reference, objective-value reference, evidence set, and feasibility reference. Baseline evaluation subjects already recorded by R2 are not rewritten. A candidate subject is an additional D1J_CANDIDATE_REFERENCE.

The existing optimization-intelligence study alternatives stay in that study platform. R3 reuses only the deterministic non-dominance comparison. It does not create a second candidate platform or a second Pareto platform.

## Parameter semantics

R1 parameter kinds remain variable shape only. Readiness at the start of R3 is PARTIAL_GENERIC_SEMANTICS_ONLY. No concrete engineering parameter semantic was found, and R3 does not invent one. A generic kind such as GOVERNED_BOUNDED_QUANTITY, GOVERNED_CATALOGUE_CHOICE, or GOVERNED_INTEGER_COUNT is not a model property and cannot mutate a model.

Because no concrete semantic is registered, a variable assignment cannot be stored and cannot claim a design-state mapping. Candidates are reference-only. An assignment cannot enlarge the R1 search domain.

## Candidate identity and source

The allowlisted source is GOVERNED_DESIGN_STATE_REFERENCE. The resolver requires an exact id, version, and fingerprint, plus tenancy, structural scope, and authority. A caller fingerprint that does not match the pin is rejected. The pin body is not copied, and the reference does not float to a latest record.

Runtime origins are HUMAN_DEFINED and IMPORTED_GOVERNED. Registration authority does not approve, check, or validate the candidate. DETERMINISTIC_ENUMERATION and OPTIMIZATION_METHOD remain architecture names with no registration path.

A changed design state creates a successor candidate. The prior record stays in history.

## Lineage

Lineage runs from the baseline to a candidate, or from a candidate to a successor in the same problem fingerprint. A candidate cannot parent itself. A cycle is rejected. A parent in another problem is rejected. The child does not inherit the parent validation state.

## Candidate evidence

A check, objective value, or analysis is bound to a candidate only when the owning record carries that candidate design-state fingerprint. The same member id or system id is not enough. Baseline evidence is not reused for a candidate. Objective numbers come from the correlated source record. A caller number is not canonical. Feasibility is the R2 feasibility reference over that evidence. R3 does not recompute a check. Analysis references keep the D1G solver status NOT_CERTIFIED.

## Comparison and composition

Two candidates are eligible together only when the problem, baseline, variable set, objective definitions, required-check set, standard binding, and evaluation profile match, and when objective units and source validation class match. A different problem, baseline, objective set, check set, or standard is not a direct comparison.

The feasible non-dominated set contains only comparison-eligible candidates whose R2 feasibility is FEASIBLE. INFEASIBLE and UNDETERMINED candidates stay in their own populations and in history. Equal objective vectors are both non-dominated. No tolerance, weight, normalization, universal score, or global rank is introduced. TARGET is excluded from dominance because the objective definition has no governed target value. BAND is not a governed direction.

A non-dominated candidate is not a selected or approved design. Human selection is not implemented in R3.

## Provenance, history, and staleness

Fingerprints cover the candidate, evaluation subject, comparison eligibility, and candidate set. History is append-only. A repeated registration or composition returns the existing record. Staleness follows a changed design state, baseline, variable set, objective set, required-check set, evaluation profile, objective value, feasibility, or D1G readiness. Invalidation does not change the owning source and does not delete history.

## R4 handoff

The next phase is EOS-D1J-R4-CERTIFICATION-EVIDENCE-READINESS-GATE. R4 may record evidence without a certified solver. Certification eligibility still requires certified D1G, engineer validation, and conformance validation. R4 does not grant those validations. The handoff includes problem and baseline fingerprints, the parameter-semantic limit, candidate identity and lineage, R2 evaluation and feasibility, comparison eligibility, and the candidate set.
