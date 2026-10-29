# EOS-D1E-EU-C3 — bounded Eurocode-profile uniaxial N-M section interaction

Phase: EOS-D1E-EU-C3  
Parent: EOS-D1E-EU-C2 (PASS_WITH_LIMITATIONS)  
Mode: deterministic section resistance + N-M interaction + independent numerical validation

This phase extends C2 from zero applied axial force to bounded nonzero axial force combined with uniaxial moment. It is section N-M resistance, not column or member design.

## Scope

Supported:

- reinforced concrete rectangular sections
- major-axis and minor-axis N-M
- positive and negative moment where reinforcement geometry supports the strain field
- compression and tension axial domains between mechanics anchors derived from the governed constitutive pack

Excluded:

- biaxial P-M-M
- slenderness, second-order effects, effective length, buckling, imperfection amplification
- shear, punching, torsion, prestress, fire, seismic, connections
- formal EN 1992 conformance certification

Method IDs:

- `EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR`
- `EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MINOR`

C2 methods `EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR` / `_MINOR` remain loaded and are reused, not forked.

## Section resistance vs member design

C3 evaluates section resultants `(N_R, M_R)` from plane-section kinematics, governed material response, and D1E-1 integration/equilibrium.

It does not compute column resistance, slenderness, or second-order member effects. Neutral-axis location is a mechanics state, not code resistance.

## Axis and sign conventions

Matches D1E-1:

- strain kinematics `ε = ε0 − φx(y−y0) − φy(x−x0)`
- axial strain and axial force positive in tension
- positive major-axis moment compresses the +y face
- positive minor-axis moment compresses the +x face

Units are explicit: force N, moment N·m, length mm, strain m/m, stress MPa. D1C demand is reused (`axial.valueN`, `moment.signed` in N·m). C3 does not recalculate load combinations.

## Geometry

Algorithm geometry is the D1E-1 kernel. Product-validated geometry for C3 is RECTANGULAR only.

## Material and NDP dependencies

Reused governed rules (10 implemented / 10 numerically validated):

- characteristic concrete and reinforcement properties
- concrete tension treatment (ULS NO_TENSION)
- `gamma_c`, `gamma_s`, `fcd`, `fyd`
- parabola-rectangle concrete compression and `εc2` / `εcu2` for fck ≤ 50 MPa
- horizontal bilinear reinforcement response

Partial factors remain NDP-declared. No default National Annex. TEST_ONLY_NON_CONFORMANCE fixtures never become runtime defaults. Missing NDP fails closed as UNDETERMINED / STANDARD_CONTEXT_INCOMPLETE.

## Rule-dependency audit

C3 does not invent additional Eurocode-specific axial-capacity reduction, reinforcement ultimate-strain caps, balanced-failure classification, or member-stability rules. Those remain ungoverned and out of C3 product claim.

Axial applicability is the mechanics interval between:

- uniform compressive strain `ε = −εcu2` (high-compression anchor, not labelled EN 1992 `N_Rd`)
- uniform tensile strain at the governed yield kink `εyd = fyd/Es` (tension anchor)

Targets outside that interval return UNSUPPORTED_SCOPE. Nonzero axial force is never silently ignored.

## Interaction generation

Governed strain-domain trace:

1. Compression-controlled family: extreme concrete strain = `εcu2` (same C2 pivot), axial equilibrium at `N_target` via D1E-1 bracketed bisection.
2. Tension-controlled family where required: extreme tension-face strain = `εyd`, same integrator/solver, rejected if concrete strain would exceed `εcu2`.
3. Curve representation samples those states. Sampling density is not itself an engineering rule.

Demand-point classification solves at `N_Ed` and compares `|M_Ed|` with `|M_R|`. It does not use an ungoverned linear `N/N_R + M/M_R` interaction.

Piecewise-linear interpolation of a sampled curve is deterministic. Conservative adjacent-point magnitude is retained for interpolation-error checks. Direct solve remains the demand-check authority.

## Convergence and validation

- C2 N = 0 results are a mandatory regression anchor.
- Independent goldens use the published first-generation equivalent-rectangular block (η = 1, λ = 0.8 for fck ≤ 50 MPa) plus bilinear reinforcement at a prescribed axial target. Production uses parabola-rectangle fiber integration. Assumption differences are recorded.
- Mesh refinement on representative N-M states.
- Solver: normal, tension-side, unreachable axial target, iteration limit.
- External commercial software comparison: NOT_AVAILABLE.

## Result semantics

Authority layers remain separate: section mechanics, numerically validated EU-profile reference method, standard conformance, member design, engineering approval.

Results carry method, axis, sign, `N_R`, `M_R`, units, residual, strain family, fingerprints (geometry, reinforcement, material rules, NDP, method version, integration, solver, curve-generation), validation state, and INTENDED_PROFILE conformance.

Stale results cannot be reused. Engineer validation remains PENDING_HUMAN_ENGINEERING_REVIEW. Pack stays uncertified. Product claim remains `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`.

## AI authority

AI may explain the calculation, summarize the governing section state, identify missing inputs, and suggest candidate sections or validation cases. AI may not alter material parameters, select NDP, invent strain limits, change solver results, override interaction curves, claim conformance, or approve design.

## Inverse design and optimization

C3 may be used as a deterministic N-M recheck when method applicability is satisfied. Generative models cannot bypass C3. Optimizers and Pareto ranking reject UNDETERMINED, unsupported scope, non-convergence, stale results, missing NDP, and unvalidated methods.

## Next phase

Canonical next phase: `EOS-D1E-EU-C4` — validated bounded Eurocode RC biaxial P-M-M section interaction using the same kernel and rule pack.
