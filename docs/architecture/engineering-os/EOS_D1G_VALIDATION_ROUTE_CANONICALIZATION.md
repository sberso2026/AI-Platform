# EOS-D1G validation route canonicalization

This phase defines the D1G validation route. It does not execute the route, invent validation numbers, certify a solver, satisfy C10 or D1F review, or complete the structural pack.

Baseline before this phase: ef68e230a577aac080bf89dd8c080f3dbf095bcc. The debt inspection recorded 15 milestones, 7 complete and 8 remaining. That starting snapshot stays on the debt module. The live roadmap now counts this phase complete: 15 total, 8 complete, 7 remaining. The phase list is unchanged. The historical token D1G_VALIDATION_ROUTE_PHASE remains NOT_DEFINED on the post-D1I roadmap. The pack formula still has the route uncompleted, so the structural pack stays incomplete.

Machine-readable contract: packages/engineering-os/src/structural-systems/d1g-validation-route-canonicalization.ts. Status: COMPLETE. Maturity: VALIDATION_ROUTE_DEFINED_NOT_EXECUTED. New substantive runtime count: 0.

## Purpose and scope

D1G is external solver integration. The implemented track translates provider records into D1F inputs, ingests a result package, and reads a SPACE GASS model through a bounded read-only connector. It does not solve a structure.

D1G validation has to keep these questions separate:

- Numerical comparison of a reference result and the ingested EOS result.
- Method-implementation match against the documented mapping. A match is not engineering conformance.
- Reproducibility of fingerprints for an exact revision.
- Qualified structural engineer review of that evidence.
- Applicability of the comparison.
- Limitations that stay attached to the evidence.

The route does not establish member design correctness, code conformance, solver certification, or regulatory approval.

## Evidence classes

Accepted classes are closed-form analytical benchmark, independent calculation, third-party reference output, method-implementation evidence, reproducibility record, qualified structural engineer review, live provider session, and connector regression replay.

Mandatory for a later execution PASS:

- One independent reference comparison, satisfied by a closed-form analytical benchmark, an independent calculation, or a third-party reference output.
- Method-implementation evidence for the documented units, signs, axes, and identities.
- A reproducibility record for the exact revision.
- A qualified structural engineer review of the D1G evidence. C10 and D1F reviews do not count as this review.

Optional:

- A live provider session. It is required only to satisfy the live-validation flag.
- A second provider. The D1G closeout says a second commercial provider would be useful and is not required.
- Connector regression replay. Offline replay of a synthetic snapshot through the same mapper may support reproducibility. It is not independent validation.

## Analytical benchmark route

A closed-form benchmark is an accepted form of the independent comparison where a governing solution exists for the compared quantity. The later record must name the benchmark identity, governing solution, inputs, units, expected result, tolerance, applicability, limitations, provenance, and exact revision. The expected result is the analytical statement. The EOS result is the ingested output. This phase does not fill those numbers. An EOS fixture compared only with itself is not this benchmark.

## Reference comparison route

A reference comparison is provider-neutral. It names the provider or reference source, provider version, model identity, model revision, inputs, boundary conditions, material definition, load definition, analysis assumptions, units, reference outputs, EOS outputs, comparison method, difference, tolerance, result, limitations, and provenance. No commercial product is mandatory. SPACE GASS may be used because the read-only connector exists. It is not required.

A reference match is evidence only. It is not EOS certification, engineering approval, or regulatory approval.

## Provider boundary

Acceptable independent sources are an analytical reference, an independent calculation that was not produced by the mapper under test, a third-party solver or reference output, and a qualified structural engineer.

EOS offline replay of the same mapper, and an EOS output compared only with an EOS output, are rejected as independent validation. Self-reference is not independent validation.

## Tolerance

Every numeric comparison must name the quantity, unit, absolute or relative rule, tolerance value, justification, numerical precision, applicability range, exceptions, and source. Identity, sign, axis, and fingerprint checks are exact. This phase creates no default tolerance value. A result inside a tolerance is not engineering conformance, certification, or approval.

## Applicability and limitations

Every accepted item states element or result type, analysis type, material model, geometry range, load condition, boundary condition, linear or nonlinear assumption, static or dynamic scope, units, and provider or model version, where those fields apply. Limitations are mandatory. They cannot be dropped. Evidence does not extend to an undeclared capability.

## Capability and evidence matrix

Execution status of every row is NOT_EXECUTED.

- D1G.R1 adapter foundation. Scope is translation into D1F inputs for a declared fixture. Independent comparison and human review are required. Tolerance is required. Limitation: translation is not structural analysis.
- D1G.R2 package ingestion. Scope is units, identity, and provenance for a version 1 package. Method evidence and human review are required. Numeric tolerance is not the check. Limitation: ingestion is not engineering acceptance.
- D1G.R4 member station-force import. Scope is native components, station distance, and node A as origin, for the bounded filtered pilot. Independent comparison, tolerance, and human review are required. Major and minor design axes are not implied.
- D1G.R4 support reaction-force import. Scope is Fx, Fy, and Fz. Independent comparison, tolerance, and human review are required. Reaction moments are outside this capability.
- D1G.R5 connector closeout reproducibility. Scope is fingerprint equality for an exact revision. A reproducibility record and human review are required. Offline replay is not independent validation and is not live connectivity.
- Live connectivity. Scope is one governed live read. This evidence is optional for pack route completion and required for the live-validation flag. It is not executed.
- Reaction-moment import and solver execution are out of scope. They are not implemented and are not given evidence requirements.

## Live, engineer, and conformance routes

Live validation is defined and not executed. D1G_LIVE_VALIDATED stays false. A future live record must bind one provider, version, model revision, governed read, comparison, tolerance, applicability, and limitations. Missing live evidence blocks only the live flag when the mandatory independent comparison is present.

Engineer validation is defined and not satisfied. The reviewer is a qualified structural engineer, named with authority, bound to the exact D1G subject revision, limited to that evidence, and required to keep limitations. AI and admin are not structural engineering authority. AI may prepare a comparison and may not accept it.

Conformance validation, in repository truth, means bounded acceptance that the ingested result matches the documented mapping and the stated applicability. It does not mean the design conforms to a standard. Method match is not conformance. A selected standard is not conformance. A validation pass is not engineering conformance. The conformance flag stays unsatisfied.

## Record, revision, and new revision

A D1G evidence record names the evidence id, capability, subject revision, evidence type, provider, provider version, input or model revision, reference result, EOS result, units, comparison rule, tolerance, tolerance basis, result, applicability, limitations, source, provenance, reviewer, review authority, review status, currentness, lineage, and fingerprint. No database schema is added.

The revision must be exact. Floating references are prohibited. A historical reference is not automatically repointed. A new D1G revision does not inherit validation, engineer review, or conformance.

## Human authority and untouched debt

C10 qualified review stays pending. D1F engineer review stays pending. D1H, D1I, and D1J validation stay unsatisfied. D1K internal integration stays unsatisfied. D1K, D1L, and D1N stay closed. D2 through D9 stay closed. D9 remains complete with limitations. Project certification eligibility and certified-solver status stay outside the pack formula. The solver status remains NOT_CERTIFIED.

## Execution acceptance

PASS requires the mandatory evidence, exact revision binding, justified numeric tolerances, applicability, limitations, and the qualified D1G review. PASS does not certify the solver or complete the pack.

FAIL when a comparison is outside its justified tolerance, a mandatory field is missing, self-reference is offered as independent evidence, a limitation is dropped, the revision does not match, or an AI or admin identity is recorded as the structural engineer.

BLOCKED when the independent reference, the tolerance basis, or the qualified structural engineer is not available.

Current execution status is NOT_EXECUTED.

## External evidence

Later execution needs an independent reference that this repository does not yet contain, a tolerance basis stated by that evidence, and a qualified structural engineer. This phase does not claim any of those were obtained. C10 and D1F human reviews remain separately required and are not part of this route.

## Security and release posture

Product security debt stays separate from structural validation debt. The known engineering-review import boundary, the moderate uuid advisory through exceljs, and GA security debt are not fixed here. They do not become D1G evidence. GA security debt can still block general availability later. The pack formula does not require that debt to be cleared.

## Next phase

The ordered remaining list places EOS-D1-QUALIFIED-STRUCTURAL-REVIEW next. Its type is QUALIFIED_STRUCTURAL_REVIEW. Scope: record C10 and D1F qualified human review against exact revisions, and accept the phase only when both reviews are satisfied by traceable human evidence. Review completion is not engineering validation. D1G route execution remains a later phase. Its dependency on this route definition is satisfied, and it is not the next ordered phase.

## Limitations

No validation evidence was produced. No tolerance number was chosen. No solver was certified. The structural pack is not complete. General availability remains false. No schema changed. No dependency was added.
