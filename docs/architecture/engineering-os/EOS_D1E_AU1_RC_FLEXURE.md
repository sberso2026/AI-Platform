# EOS-D1E-AU-1 — Bounded AU uniaxial RC flexure

First Australian reinforced-concrete design slice. AS 3600 family profile binding plus D1E-1 kernel reuse. Not a numerical AS 3600 capacity engine.

## Scope

Uniaxial flexure (`MAJOR_AXIS` / `MINOR_AXIS`) for members whose governed D1C demand is pure or near-pure flexure. The AU adapter supplies profile, method registry, fail-closed code-parameter authority, result/check semantics, and inverse-design/optimization handoff. Geometry, kinematics, integration, and equilibrium remain the common D1E-1 kernel.

## Non-scope

AS 3600 stress-block coefficients, ultimate strains, strength-reduction factors, min/max reinforcement, cover, detailing, shear, punching, torsion, N-M / biaxial columns, crack control, long-term deflection, creep/shrinkage, development, laps, durability, prestress, connections, seismic. No edition inference.

## AS 3600 profile binding

Family `AS 3600` is bound through the existing D1B standard-context adapter. Pack-level edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`. Intended profile is not standard conformance. `AU_CONCRETE_PACK_CERTIFIED = NO`.

## Common D1E-1 reuse

Section geometry, reinforcement layout/containment/clearance, plane-section kinematics, generic material-response contract, discretization, integrator, and equilibrium solver are reused. No parallel AU section solver, integrator, or neutral-axis solver. Geometric clearance is not AS 3600 cover compliance.

## Flexure context and demand

`AuConcreteFlexureContext` records member, section, materials, layout, axis, D1C moment demand, standard context, material-response refs, and unpopulated stress-block / strain-limit / strength-factor refs. D1C moment is consumed; structural actions are not recalculated. Non-zero axial action is `UNSUPPORTED_SCOPE` / `CHECK_UNDETERMINED` — never ignored.

## Material governance

Concrete and reinforcement properties must be explicitly governed. Grade/designation does not synthesize strength or modulus. AU catalogues are adapter-ready and unpopulated.

## Material response, stress block, strain limits, strength factor

AU compression/tension/reinforcement response frameworks exist as adapter metadata. Tension treatment is explicit per method. Stress-block, ultimate strains, and design factors are required dependencies with `null` parameters. Guessing is fail-closed. No AS 3600 stress block in the common kernel.

## Equilibrium workflow

Mechanics-reference methods equilibrate D1C moment with the D1E-1 elastic solver. Non-convergence is `CHECK_UNDETERMINED`; last iterate is not strength. Neutral-axis geometry is mechanics, not code capacity. AS 3600 uniaxial methods remain `FRAMEWORK_ONLY` until edition, constitutive rules, stress block, strain limits, factor, applicability, and independent benchmark are governed.

## Result authority and checks

Result authorities: `MECHANICS_REFERENCE`, `CODE_PROFILE_REFERENCE`, `CODE_DESIGN_CAPACITY`. Elastic reference is not AS 3600 flexural capacity. Mechanics demand ratio is not AS 3600 utilization. Code utilization is computed only when demand and governed design capacity are valid — currently never. Check states include `CHECK_UNDETERMINED` for missing edition/parameters, non-convergence, unsupported axial action, stale results, and unvalidated methods.

## Detailing and serviceability boundary

Future flexural capacity would not imply detailing, development, lap, cover, or durability compliance. Those checks are absent here.

## Validation / conformance

Dimensions remain separate: implementation maturity, numerical validation, engineering validation, standard conformance. Current conformance: `INTENDED_PROFILE`. Human validation is required before HUMAN_VALIDATED / PILOT / CONFORMANCE_VALIDATED / CERTIFIED. Check satisfaction is not engineering approval.

## Inverse design, optimization, MTO

Candidates pass D1E-1 geometry screening then the AU flexure pipeline. Optimizer rejects `CHECK_UNDETERMINED`. MTO reuses D1E-1 quantities. No default rates or carbon factors.

## AI authority

AI may identify missing inputs and explain deterministic results. AI may not invent f'c, fy, stress-block parameters, strains, phi, capacity, or conformance, and may not approve design.

## Validation debt and next phase

AU-specific debt covers edition/amendment, constitutive models, stress block, strain limits, strength factor, code flexure, ductility, min/max reo, cover, durability, shear, punching, axial-flexure, biaxial, second-order, crack control, deflection, creep/shrinkage, development, laps, detailing, prestress, connections, seismic, human validation, and third-party comparison.

Canonical D1E roadmap after this slice: **D1E-EU** EN 1992 family/part/annex/NDP bind then bounded methods.

Product claim: `AU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`. Maturity: `FRAMEWORK_PLUS_COMMON_MECHANICS`. Global structural maturity is unchanged.
