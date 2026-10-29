# EOS-D1E-EU-C4 — bounded Eurocode-profile biaxial N-Mx-My section interaction

Phase: EOS-D1E-EU-C4  
Parent: EOS-D1E-EU-C3 (PASS_WITH_LIMITATIONS)  
Mode: deterministic biaxial section resistance + N-Mx-My interaction surface + independent numerical validation

This phase extends C3 uniaxial N-M into a coupled biaxial section resistance surface. It is first-order section resistance, not column or member design.

## Scope

Supported:

- reinforced concrete rectangular sections
- N-Mx-My section resistance
- governed C1/C1C material rules and material integration
- axial domain inherited as a subset of C3 mechanics anchors
- first-order plane-section mechanics only

Method identity: `EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR`

Loaded and reused, not forked:

- C2 `EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR` / `_MINOR`
- C3 `EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR` / `_MINOR`
- C1/C1C governed rule pack (10 numerically validated supporting rules)

Excluded:

- member slenderness, second-order effects, effective length, buckling, imperfections, creep amplification
- general nonlinear member analysis, shell/solid FEA
- shear, punching, torsion, prestress, crack control, deflection, detailing, anchorage, laps
- formal EN 1992 conformance certification
- empirical elliptical, linear, or Bresler-style interaction equations

## Common biaxial kinematics

D1E-1 already represents the plane-section strain field:

`ε = ε0 − φx(y − y0) − φy(x − x0)`

Tension-positive. C4 reuses this field. No jurisdiction-specific kinematics replacement.

## Coupled equilibrium

D1E-1 `solveSectionEquilibrium` already solves the coupled residual system `(N, Mx, My)`. C4 reuses it for demand-state validation and reuses `solveAxialEquilibrium1d` for resistance search along a moment direction. No parallel Eurocode biaxial solver.

Section integration remains D1E-1 fiber + bar points. Resultants include `N`, `Mx`, and `My`.

## Rule dependency

C4 does not require additional Eurocode-specific numerical rules beyond the existing C1/C1C pack and C2/C3 mechanics. Additional required rule IDs: NONE. Audit: PASS.

## C3 axial domain inheritance

C3 axial-anchor validation remains PARTIAL. C4 does not enlarge the validated axial domain by computing a 3D surface.

Supported / numerically validated axial domain identifier:

`UNIAXIAL_NM_WITHIN_MECHANICS_ANCHORS_UNIFORM_EPS_CU2_TO_UNIFORM_EPS_YD`

Surface generation samples interior levels (0.75 of the C3 mechanics anchors) so extreme C3 anchors are not silently expanded.

## Section vs member design

The C4 surface is section resistance only. It is not column design, not second-order member effects, not slenderness, and not member buckling.

## Demand reuse

D1C `axial.valueN` and `moment.signed` are reused as `N_Ed` and `Mx_Ed`. Governed minor-axis demand is supplied as explicit `demandMyNm` (`My_Ed`). C4 does not calculate structural actions and does not create a parallel demand engine.

## Axis, signs, and units

Matches D1E-1 / C2 / C3:

- strain kinematics as above
- axial strain and axial force positive in tension
- positive major-axis moment (`Mx`) compresses the +y face
- positive minor-axis moment (`My`) compresses the +x face
- moment direction `θ` is a tracing coordinate: `φx ∝ cos θ`, `φy ∝ sin θ` in the canonical curvature mapping
- `θ` is not itself an engineering rule

Units are explicit: force N, moment N·m, length mm, strain m/m, stress MPa. No implicit N/kN, Nmm/kNm, Pa/MPa, or mm/m conversions.

## Geometry

Reuses D1E-1 section geometry, reinforcement geometry, bar locations, containment, and void rules.

Supported and numerically validated geometry: RECTANGULAR. Kernel capability for other outlines does not extend product validation.

## Material and NDP

Concrete and reinforcement design properties, constitutive response, strain limits, and tension treatment are reused from the governed pack. Partial factors/NDP use the existing resolver. No default National Annex. No location inference. No guessed NDP. Missing required NDP: UNDETERMINED / STANDARD_CONTEXT_INCOMPLETE. Test-only NDP fixtures remain `TEST_ONLY_NON_CONFORMANCE` and never become runtime defaults.

## Resistance search

For each target axial force `N` and moment direction `θ`:

1. If `θ` is a principal axis (0, π/2, π, 3π/2), reuse the applicable C3 method (mandatory C3/C2 anchors).
2. Otherwise search admissible plane-section strain states along that direction using governed `εcu2` vertex pivot, then `εyd` tension-vertex family, D1E-1 integration, and 1D κ bisection for axial equilibrium.

The boundary vector is `(Mx_R, My_R)`. No elliptical/linear/Bresler formula is used.

## Interaction contracts

Point result includes `N_R`, `Mx_R`, `My_R`, moment direction, strain state, equilibrium residual, material/geometry/reinforcement fingerprints, rule/NDP/solver versions, validation/conformance state, and provenance.

Surface result includes method ID, validated geometry, supported axial domain, axial levels, moment directions, boundary points, sampling configuration, method/rule fingerprints, validation state, and conformance state.

Same governed inputs and versions reproduce the same surface within defined tolerances.

## Principal-axis and C2 anchors

At `My = 0`, C4 reproduces applicable C3 major-axis N-M.  
At `Mx = 0`, C4 reproduces applicable C3 minor-axis N-M.  
At `N = 0` and `My = 0`, C4 reproduces C2 major-axis resistance.  
At `N = 0` and `Mx = 0`, C4 reproduces C2 minor-axis resistance.

## Surface resolution and interpolation

Convergence criterion: polar `|M|` at representative `N` of an 8-direction trace vs 16-direction trace relative change ≤ 0.08; axial-level 3 vs 5 at `θ = π/4` relative `|M|` change ≤ 0.08.

Interpolation is deterministic polar piecewise-linear in `(N, θ)`. Conservative radius is the minimum of adjacent axial levels. Interpolation is bounded by generated resistance points. If interpolation/numerical uncertainty can change demand classification, the check returns UNDETERMINED rather than optimistic SATISFIED.

No ungoverned scalar EN 1992 interaction utilization is defined. Any proximity indicator is geometric/numerical only.

## Demand-point classification

For governed `(N_Ed, Mx_Ed, My_Ed)`, classification is polar `|M|` versus resistance radius:

- SATISFIED
- NOT_SATISFIED
- UNDETERMINED (missing NDP, unsupported axial/geometry, solver failure, surface invalid, stale result, unsupported profile, insufficient validation, or boundary uncertainty)

Optimizer/Pareto paths reject UNDETERMINED as feasible.

## Symmetry and asymmetry

Symmetric sections must satisfy expected polar symmetry within tolerance. Asymmetric reinforcement is not mirrored automatically.

## Numerical tolerances

Separate tolerances are defined for axial equilibrium, Mx/My equilibrium, C3/C2 anchors, interpolation, angular/axial-level/mesh convergence, continuity, symmetry, unit consistency, and boundary uncertainty.

Non-convergence fails closed. No guessed surface point.

Surface topology validation requires non-negative polar radius and non-negative ring area. Convexity is not assumed.

## Unsupported scope / member-stability boundary

C4 does not implement second-order effects, slenderness, member buckling, shear, punching, torsion, crack control, deflection, detailing, anchorage, laps, or prestress. Section P-M-M is not member capacity and not column stability.

## Engineer validation and conformance

Engineer validation: PENDING_HUMAN_ENGINEERING_REVIEW.  
Numerical biaxial validation does not equal standard conformance.  
`EU_CONCRETE_STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`  
`EU_CONCRETE_PACK_CERTIFIED = NO`  
Product claim: `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`

External software comparison: NOT_AVAILABLE.

## Inverse design, optimization, and AI

C4 may be used for deterministic candidate recheck under `N`, `Mx`, `My` inside validated scope. Generative models cannot bypass C4. Optimization and Pareto cannot treat UNDETERMINED as feasible. AI assistance is advisory only: no numerical, material, NDP, solver, surface, conformance, or engineering-approval authority.

## Next-phase handoff

Canonical next phase: `EOS-D1E-EU-C5` — validated bounded Eurocode RC shear / punching / torsion using the same kernel and rule pack.
