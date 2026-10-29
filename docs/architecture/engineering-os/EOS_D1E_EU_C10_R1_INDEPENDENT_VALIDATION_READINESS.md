# EOS-D1E-EU-C10-R1 independent validation readiness

C10-R1 records the evidence architecture for the bounded Eurocode concrete capabilities through C9. It does not execute independent benchmarks, engineer review, national-profile validation, or a conformance decision.

Readiness is not validation. Numerical validation is not independent validation. Independent validation is not engineer validation. Engineer validation is not formal standard conformance. A first-generation reference profile is not a validated national profile.

The maturity chain remains reference implemented, numerically validated, engineer validated, and conformance validated. No intermediate certification label is added.

## Independent validation

An expected result is independent only when it is not produced by the same production implementation or copied from that implementation's internal path. Acceptable categories are a published example, an independent hand calculation, an independent spreadsheet, recognized or certified external software, a peer-reviewed result, an engineer-authored calculation, or a formal vector from a governed source.

Production-versus-itself, a helper versus its evaluator, a formula copied into a test, and a model-generated expected value are not independent validation.

## Inventory

Implemented and queued for later validation: C2 flexure, C3 uniaxial axial-flexure, C4 biaxial section resistance, C5 shear, punching, and torsion, C6 nominal curvature, C7 crack width, C7 explicit long-term state, C8 cover assembly, minimum clear spacing, and basic required anchorage, and the four C9 orchestrators.

Deferred and kept out of that queue: deflection, calculated creep, calculated shrinkage, durability cover lookup, provided-cover compliance, unequal-diameter spacing, bundles, mesh, prestress spacing, design bond and bond condition, design anchorage and its minimum, compression anchorage, hooks and bends, laps, biaxial second-order, general P-delta, general structural analysis, two-way slab analysis, wall stability, wall shear, and wall global analysis.

## Evidence and gaps

Every implemented capability is numerically exercised and fail-closed, with provenance and fingerprints. None is engineer validated or conformance validated. External software comparison remains unavailable. National profile and NDP value validation are missing.

Source authority is present for every implemented numerical method. The unsourced implemented-rule count is zero. C2 through C6 have corroborating sources or recorded hand derivations. C7 crack width, C7 explicit long-term state, and the three implemented C8 methods remain single governed sources. C9 orchestrators inherit the underlying methods. Orchestrator-to-method agreement proves routing, not formula truth.

`READY_WITH_LIMITATIONS` means the capability is implemented and defined well enough to enter independent validation. It does not mean near conformance.

## Plans

Method benchmarks require a representative case, a boundary case, unit equivalence, a fail-closed case, a profile mismatch, an independent expected value, and an external or reference comparison where one exists. C7 and C8 independent execution stays blocked until a second governed source exists. A model must not invent that expected value.

Engineer validation is a qualified human review bound to version, profile, benchmark set, exceptions, and limitations. Identity details stay out of product runtime. Developer assertion and a passing test are not that review. Scope is method, orchestrator, and profile, not one pack-wide signature.

National-profile evidence needs jurisdiction, edition, amendment, annex identity, NDP identity and values, units, source, effective version, applicability, and a profile fingerprint. Annex text is not required in the repository. Location does not select a profile.

Tolerances are category-specific: exact algebra, floating-point algebra, iterative equilibrium, interaction surface, engineering rounding, and external-tool comparison. Display rounding does not set the numerical tolerance.

Conformance, if ever claimed, is method, profile, and scope specific. One validated method does not certify the concrete pack. Deferred capabilities stay outside that scope until implemented and validated. Evidence is version-bound; a changed formula fingerprint makes older evidence stale.

The sequence is readiness, method and member benchmarks, engineer-validation evidence, national profile and NDP validation, cross-method integration, then a final evidence decision. The final phase evaluates recorded evidence and cannot create missing evidence.

The product claim remains the mechanics reference capability.
