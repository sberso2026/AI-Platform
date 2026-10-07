# EOS-D1E-US-2 — Bounded ACI-profile RC uniaxial flexure

First US/ACI-profile reinforced-concrete flexure slice. Reuses the D1E-1 common RC section kernel and the D1E-US-1 ACI family/edition/building-code/local-amendment context. Not a numerical ACI 318 resistance engine.

## Scope

Uniaxial flexure (`MAJOR_AXIS` / `MINOR_AXIS`) for members whose governed D1C demand is pure or near-pure flexure. The US adapter supplies flexure context, method registry, fail-closed code-parameter authority, result/check semantics, building-code versus ACI-profile separation, and inverse-design/optimization handoff. Geometry, kinematics, integration, and equilibrium remain the common D1E-1 kernel. Standard identity remains the D1E-US-1 resolver.

## Non-scope

ACI stress-block coefficients, ultimate strains, strength-reduction factors, strain/ductility thresholds, min/max reinforcement, cover, detailing, shear, punching, torsion, N-M / biaxial columns, crack control, long-term deflection, development, anchorage, laps, durability, prestress, seismic, connections, second-order column design. No edition inference. No guessed ACI numerical parameters.

## US-1 standard binding reuse

Family, edition token, amendment/errata, building-code adoption, local amendment, direct-contract ACI profile, project/calculation context, source precedence, conflict detection, and material-standard boundaries are reused from D1E-US-1. This phase does not create a parallel US standard context. Pack-level edition, amendment, and errata remain `UNKNOWN_PENDING_CONFIRMATION`. ACI profile is not building-code compliance. Direct-contract ACI flexure is not building-code compliance. `US_CONCRETE_PACK_CERTIFIED = NO`.

## Common D1E-1 reuse

Section geometry, reinforcement layout/containment/clearance, plane-section kinematics, generic material-response contract, discretization, integrator, and equilibrium solver are reused. No parallel US section solver, integrator, or neutral-axis solver. Geometric clearance is not ACI cover compliance.

## Uniaxial flexure and axial-action boundary

Major- and minor-axis methods are registered. Applicability is `PURE_OR_NEAR_PURE_FLEXURE_ONLY`. Non-zero axial action is `UNSUPPORTED_AXIAL_ACTION` / `CHECK_UNDETERMINED` — never ignored. General N-M and biaxial code design are absent.

## Material-property governance

Concrete and reinforcement properties must be explicitly governed. Grade/designation does not synthesize strength or modulus. ACI remains separate from concrete product standards and reinforcement product standards.

## Strength layers

Mechanics reference, code nominal strength, code design strength, building-code compliance, and engineering approval remain distinct. Steel LRFD/ASD semantics are not reused.

## Stress-block / strain / strength-reduction

Stress-block, ultimate strains, strain thresholds, and strength-reduction factors are required dependencies with `null` parameters. A future numerical method must bind edition, amendment/errata, adoption, and local amendments before using those slots. Guessing is fail-closed.

## Equilibrium workflow

Mechanics-reference methods equilibrate D1C moment with the D1E-1 elastic solver. Non-convergence is `CHECK_UNDETERMINED`; last iterate is not resistance. Neutral-axis geometry is mechanics, not ACI code strength. ACI uniaxial methods remain `FRAMEWORK_ONLY` until edition, constitutive rules, stress block, strain rule, strength-reduction factor, applicability, and independent benchmark are governed.

## Method registry

Registered methods:

- `US_RC_FLEXURE_ELASTIC_MAJOR` / `US_RC_FLEXURE_ELASTIC_MINOR` — `MECHANICS_REFERENCE_ONLY`
- `US_RC_FLEXURE_ACI_UNIAXIAL_MAJOR` / `US_RC_FLEXURE_ACI_UNIAXIAL_MINOR` — `FRAMEWORK_ONLY`

`IMPLEMENTED_US_CONCRETE_CODE_FLEXURE_METHODS = NONE`.

## Result authority and checks

Result authorities: `MECHANICS_REFERENCE`, `CODE_PROFILE_REFERENCE`, `CODE_NOMINAL_STRENGTH`, `CODE_DESIGN_STRENGTH`. Elastic reference is not ACI flexural strength. Mechanics demand ratio is not ACI utilization. Code utilization is computed only when demand and governed design strength are valid — currently never. Check states include `CHECK_UNDETERMINED` for unknown edition, missing building-code or local-amendment context, missing material or design-model parameters, unsupported axial action, non-convergence, stale results, and unvalidated methods. ACI flexure check is not building-code compliance and is not engineering approval.

## Validation / conformance

Dimensions remain separate: implementation maturity, numerical validation, engineering validation, standard conformance. Current conformance: `INTENDED_PROFILE`. Independent D1E-1 elastic benchmarks do not validate ACI material models, nominal/design strength, stress block, strain limits, strength-reduction factors, adoption, local amendments, or conformance. Human validation is required before HUMAN_VALIDATED / PILOT / CONFORMANCE_VALIDATED / CERTIFIED.

## Inverse design, optimization, MTO

Candidates pass D1E-1 geometry screening, US standard-context resolution, material validation, and the US flexure pipeline. The generative optimizer cannot alter ACI edition, building-code adoption, local amendments, or load-standard context. Optimizer and Pareto ranking reject `CHECK_UNDETERMINED` as design-valid. MTO reuses D1E-1 quantities. No default US cost or carbon factors are added.

## AI authority

AI may identify missing standard context, missing adoption/amendment, missing material data, and unsupported geometry, and may explain deterministic results. AI may not select edition or building code, invent local amendments, concrete/reinforcement strength, stress-block coefficient, strain threshold, or strength-reduction factor, claim ACI conformance or building-code compliance, or approve design.

## Three-jurisdiction kernel

AU, EU, and US continue to use the same geometry, kinematics, integration, and equilibrium infrastructure with isolated authority adapters. AU/EU parameters must not leak into US; US parameters must not leak into AU, EU, or the common kernel.

## Validation debt and next phase

US-specific debt retains edition/amendments/errata, building-code adoption, load-standard context, local amendments, material models, stress blocks, strain limits, strength-reduction factors, flexural resistance, axial-flexure, biaxial interaction, shear, punching, torsion, crack control, deflection, cover, durability, detailing, anchorage/laps, second-order effects, prestress, seismic, connections, third-party comparison, and human validation.

AU, EU, and US bounded uniaxial-flexure architecture is now complete at framework-plus-common-mechanics. Canonical D1E next phase is **D1E architecture closeout**. Do not invent another generic framework phase. EU conformance remains a later governed-parameter track, not a missing adapter.

Product claim: `US_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`. Maturity: `FRAMEWORK_PLUS_COMMON_MECHANICS`. Global structural maturity is unchanged. Global-first architecture is preserved.
