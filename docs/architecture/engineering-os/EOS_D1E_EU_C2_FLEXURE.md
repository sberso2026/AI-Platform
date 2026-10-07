# EOS-D1E-EU-C2 — Bounded Eurocode-profile RC uniaxial flexural resistance

C2 is the first numerical uniaxial flexural-resistance capability on the Eurocode concrete track. It reuses the frozen D1E architecture, the D1E-1 RC section kernel, D1C moment demand, and the governed C1/C1C/C1C-constitutive rule pack. It is not architecture expansion, not axial-flexure member design, not biaxial design, and not formal EN 1992 conformance certification.

## Scope

Supported:

- reinforced concrete
- uniaxial bending about the major or minor axis
- positive and negative moment signs, without assuming section symmetry
- material integration of governed concrete and reinforcement response
- governed design properties and declared NDP partial-factor resolution
- rectangular geometry as the numerically validated product claim

Explicitly excluded: general N-M interaction, biaxial interaction, column stability, shear, punching, torsion, prestress, fire, seismic, connections, detailing, crack control, and long-term deflection.

Method IDs (canonical, reused):

- `EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR`
- `EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR`

## Zero-axial applicability

C2 is pure flexure. The supported axial equilibrium target is zero applied axial action. A nonzero axial component is `UNSUPPORTED_SCOPE` / `CHECK_UNDETERMINED`. It is not silently ignored and is not transformed into pure flexure. General N-M belongs to EU-C3.

## Axis and moment-sign convention

D1E-1 sign conventions are reused. Positive major-axis curvature produces compression at +y. Positive minor-axis curvature produces compression at +x. Demand sign selects the compression face. Resistance is reported in N·m with the same convention. Neutral-axis location is a mechanics state, not code resistance.

## Geometry validation scope

The common material-integration engine can integrate many D1E-1 shapes. C2 product claim and independent numerical validation cover `RECTANGULAR` only. Other shapes return unsupported scope.

## D1C demand reuse

C2 consumes governed D1C section actions. It does not create load combinations and does not recalculate structural analysis. The D1C uniaxial moment is applied to the requested method axis.

## Material and NDP dependencies

C2 consumes, and does not duplicate:

- C1 characteristic properties and ULS concrete tension omission (`NO_TENSION`)
- R1 declared-NDP `gamma_c` / `gamma_s` / `alpha_cc` and `fcd` / `fyd` identities
- constitutive parabola-rectangle concrete response and horizontal-bilinear reinforcement response for fck ≤ 50 MPa

There is no default National Annex, no location-inferred annex, and no guessed NDP. Missing required NDP fails closed. Test-only NDP fixtures are labelled `TEST_ONLY_NON_CONFORMANCE` and never become runtime defaults. Adapter stress-block `eta`/`lambda` slots remain unpopulated; C2 uses material integration, not a simplified stress block.

## Resistance-state search

For each trial, plane-section strain is deterministic: `ε = ε0 − φx(y−y0) − φy(x−x0)`. The governing bounded ULS state sets the extreme concrete compressive strain to governed `εcu2` and solves axial equilibrium `N = 0` by a kernel 1D bracketed bisection on the neutral-axis coordinate. Concrete and reinforcement stresses come from the governed constitutive binders through `integrateSectionWithMaterialResponse`. Non-convergence fails closed; the last iterate is not accepted capacity.

## Result semantics

The result distinguishes mechanics-reference resistance, design-rule resistance, standard conformance, building/contract compliance, and engineering approval. C2 reports a design-rule resistance moment with `CODE_PROFILE_REFERENCE` authority. It does not label EN 1992 certified resistance. `en1992Utilization` remains null. A design-rule utilization is reported only when demand and resistance share a valid governed context. Check states are `CHECK_SATISFIED`, `CHECK_NOT_SATISFIED`, or `CHECK_UNDETERMINED`. Flexural resistance is not detailing compliance and not member conformance.

## Independent benchmarks and tolerances

Expected values come from an independent equivalent-rectangular compression-block hand calculation (published first-generation η = 1, λ = 0.8 for fck ≤ 50 MPa) plus bilinear reinforcement. Production uses parabola-rectangle fiber integration. That model-form difference is recorded. Separate tolerances apply to equilibrium residual, resistance comparison, mesh convergence, and unit consistency. External commercial-software comparison is `NOT_AVAILABLE` and does not block numerical reference capability.

## Engineer validation and conformance

Implemented methods are numerically validated. Engineer validation remains `PENDING_HUMAN_ENGINEERING_REVIEW`. Exact edition/profile remains unconfirmed. Conformance remains `INTENDED_PROFILE`. The pack is not certified. Numerical flexure validation is not standard conformance. Product claim remains `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`.

## AI authority

AI may explain the calculation, summarize the governing section state, identify missing inputs, and suggest candidate sections or validation cases. AI may not alter material parameters, select NDP, invent strain limits, change solver results, override failed equilibrium, claim conformance, or approve design.

## Next-phase handoff

Canonical next phase: `EOS-D1E-EU-C3` — validated bounded Eurocode RC axial-flexure / P-M interaction using the same kernel and rule pack.
