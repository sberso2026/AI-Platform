EOS-D1J-R2 objective, constraint, and feasibility-reference foundation

This phase records governed objectives, constraints, exact evidence references, and a feasibility reference on top of the D1J-R1 problem. It reuses the D1J-0 architecture, the R1 problem, baseline, variable set, and parameter registry, and the optimization-intelligence fingerprint. It does not generate a candidate, run an optimizer, execute a solver, or calculate a design check.

An objective names an allowlisted source. The supported sources are a governed quantity record and a D1G analysis metric. Direction is explicit and is not inferred from the name. A dimensional objective uses the existing unit system. No default weight and no default normalization are created. The canonical number, unit, authority, and fingerprint come from the source record. A caller number, rate, or factor cannot establish that value. Cost and carbon are not recomputed here because the repository does not expose a canonical cost or carbon record for this reference layer to pin.

A constraint names an existing D1D steel member check kind or a D1E concrete limit state. Applicability is REQUIRED, a governed CONDITIONAL, or a governed NOT_APPLICABLE. Unknown applicability stays unresolved and is not treated as not applicable. A caller cannot waive a required check by declaring it not applicable. An empty required-check set is rejected.

Binding the objective set and required-check set creates a new problem identity and fingerprint. The historical R1 problem record is left unchanged. The R2 status is EVALUATION_REFERENCE_FOUNDATION_DEFINED. That status is not optimization-ready, candidate-generation-ready, or certification-ready. The only evaluation subject is the pinned R1 baseline.

A check reference stores the owning verdict. CHECK_SATISFIED, CHECK_NOT_SATISFIED, and CHECK_UNDETERMINED map to PASS, FAIL, and UNRESOLVED. A numeric metric without that verdict is not interpreted as pass or fail. An analysis reference pins the exact D1G result identity and keeps the certified solver status NOT_CERTIFIED. An analysis result does not satisfy a design check. A profile that requires a certified solver cannot become FEASIBLE while D1G remains uncertified.

Feasibility is orchestration of the exact required-check references. FEASIBLE requires every applicable required check to be a current authoritative PASS with sufficient assurance. One authoritative FAIL makes the reference INFEASIBLE even when another required check is missing, and completeness stays incomplete. Missing, stale, invalid, unsupported, or unresolved evidence without a FAIL is UNDETERMINED. Missing objective values change objective completeness and do not by themselves change structural feasibility. Objective values cannot offset a failed check or an undetermined feasibility state. Fixture evidence is not production engineering evidence and is not certification eligibility.

The R1 parameter registry remains a variable-shape allowlist. It does not identify a concrete engineering design parameter, so candidate assignment readiness is PARTIAL_GENERIC_SEMANTICS_ONLY. R3 may record candidate identity only where a later governed parameter semantic exists. It must not map these generic kinds onto model properties.

The next phase is EOS-D1J-R3-CANDIDATE-LINEAGE-COMPARISON-COMPOSITION. D1G remains uncertified.
