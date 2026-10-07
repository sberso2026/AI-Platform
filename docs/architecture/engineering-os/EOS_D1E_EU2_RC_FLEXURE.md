# EOS-D1E-EU-2 — Bounded Eurocode RC uniaxial flexure

First Eurocode reinforced-concrete flexure slice. Reuses the D1E-1 common RC section kernel and the D1E-EU-1 EN 1992 family/part/National Annex/NDP context. Not a numerical EN 1992 resistance engine.

## Scope

Uniaxial flexure (`MAJOR_AXIS` / `MINOR_AXIS`) for members whose governed D1C demand is pure or near-pure flexure. The EU adapter supplies flexure context, method registry, fail-closed code-parameter authority, result/check semantics, multi-country isolation, and inverse-design/optimization handoff. Geometry, kinematics, integration, and equilibrium remain the common D1E-1 kernel. Standard identity remains the D1E-EU-1 resolver.

## Non-scope

EN 1992 stress-block coefficients, ultimate strains, partial factors, design strengths, min/max reinforcement, cover, detailing, shear, punching, torsion, N-M / biaxial columns, crack-width design, long-term deflection, creep/shrinkage, development, laps, durability, prestress, fire, seismic, connections. No edition inference. No default National Annex. No guessed NDP values.

## EU-1 standard binding reuse

Family, generation, edition token, part, National Annex, NDP, project/calculation context, source precedence, conflict detection, and material-standard boundaries are reused from D1E-EU-1. This phase does not create a parallel Eurocode standard context. Pack-level edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`. Intended profile is not standard conformance. `EU_CONCRETE_PACK_CERTIFIED = NO`.

## Common D1E-1 reuse

Section geometry, reinforcement layout/containment/clearance, plane-section kinematics, generic material-response contract, discretization, integrator, and equilibrium solver are reused. No parallel EU section solver, integrator, or neutral-axis solver. Geometric clearance is not EN 1992 cover compliance.

## Uniaxial flexure and axial-action boundary

Major- and minor-axis methods are registered. Applicability is `PURE_OR_NEAR_PURE_FLEXURE_ONLY`. Non-zero axial action is `UNSUPPORTED_AXIAL_ACTION` / `CHECK_UNDETERMINED` — never ignored. General N-M and biaxial code design are absent.

## Material-property governance

Concrete and reinforcement properties must be explicitly governed. Grade/designation does not synthesize strength or modulus. EN 1992 remains separate from concrete product standards and reinforcement product standards. Characteristic/basic values remain distinct from design values; conversion requires a governed rule and is not implemented here.

## Concrete and reinforcement response

Eurocode compression-response, tension-treatment, and reinforcement-response frameworks exist as adapter metadata. Tension treatment is explicit per method and is not silently assumed. Response parameters remain unpopulated. Guessing is fail-closed.

## Stress-block / design-model, strain limits, partial factors

Stress-block, ultimate strains, and partial factors are required dependencies with `null` parameters and explicit National Annex/NDP capability flags. A future numerical method must bind generation, edition, part, Annex, and NDP before using those slots. No universal stress-block representation is assumed.

## National Annex / NDP dependencies

Code-profile methods declare National Annex dependency and NDP identifiers (`gamma_c`, `gamma_s`, `ecu`, `eta`, `lambda`) without values. There is no default Annex and no location inference. Missing required Annex or NDP yields `CHECK_UNDETERMINED`. Annex/NDP compatibility is validated by the EU-1 resolver before any numerical design path.

## Equilibrium workflow

Mechanics-reference methods equilibrate D1C moment with the D1E-1 elastic solver. Non-convergence is `CHECK_UNDETERMINED`; last iterate is not resistance. Neutral-axis geometry is mechanics, not code resistance. EN 1992 uniaxial methods remain `FRAMEWORK_ONLY` until edition, Annex/NDP, constitutive rules, stress block, strain limits, partial factors, applicability, and independent benchmark are governed.

## Method registry

Registered methods:

- `EU_RC_FLEXURE_ELASTIC_MAJOR` / `EU_RC_FLEXURE_ELASTIC_MINOR` — `MECHANICS_REFERENCE_ONLY`
- `EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR` / `EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR` — `FRAMEWORK_ONLY`

`IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS = NONE`.

## Result authority and checks

Result authorities: `MECHANICS_REFERENCE`, `CODE_PROFILE_REFERENCE`, `CODE_DESIGN_RESISTANCE`. Elastic reference is not EN 1992 flexural resistance. Mechanics demand ratio is not EN 1992 utilization. Code utilization is computed only when demand and governed design resistance are valid — currently never. Check states include `CHECK_UNDETERMINED` for unknown edition, missing part/Annex/NDP, missing material or design-model parameters, unsupported axial action, non-convergence, stale results, and unvalidated methods.

## Detailing and serviceability boundary

Future flexural resistance would not imply detailing, development, lap, cover, or durability compliance. Those numerical checks are absent here, as are shear, punching, torsion, crack-width design, long-term deflection, column stability, and prestress.

## Validation / conformance

Dimensions remain separate: implementation maturity, numerical validation, engineering validation, standard conformance. Current conformance: `INTENDED_PROFILE`. Independent D1E-1 elastic benchmarks do not validate EN 1992 material models, design strength, stress block, strain limits, partial factors, National Annex, NDP, or conformance. Human validation is required before HUMAN_VALIDATED / PILOT / CONFORMANCE_VALIDATED / CERTIFIED. Check satisfaction is not engineering approval.

## Multi-country and international contractual use

Synthetic National Annex identities isolate result context. Distinct standard generations cannot silently share numerical rules. A non-EU project may bind a contractual Eurocode concrete profile through the same pipeline without implying statutory EU compliance.

## Inverse design, optimization, MTO

Candidates pass D1E-1 geometry screening, EU standard-context resolution, material validation, and the EU flexure pipeline. The generative optimizer cannot alter National Annex, NDP set, generation, or edition. Optimizer and Pareto ranking reject `CHECK_UNDETERMINED` as design-valid. MTO reuses D1E-1 quantities. No default EU cost or carbon factors are added.

## AI authority

AI may identify missing standard context, missing Annex/NDP, missing material data, and unsupported geometry, and may explain deterministic results. AI may not select edition or Annex, invent NDP, concrete/reinforcement strength, partial factor, stress-block coefficient, strain limit, or code resistance, claim EN 1992 conformance, or approve design.

## Validation debt and next phase

EU-specific debt retains generation, edition/amendments, part applicability, National Annex data, NDP data, material models, design strengths, stress blocks, strain limits, partial factors, flexural resistance, axial-flexure, biaxial interaction, shear, punching, torsion, crack control, deflection, creep/shrinkage, cover, durability, detailing, anchorage/laps, second-order effects, prestress, fire, seismic, connections, third-party comparison, and human validation.

Canonical D1E roadmap after this slice: **D1E-US** ACI 318 family/edition/adoption bind then bounded methods.

Product claim: `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`. Maturity: `FRAMEWORK_PLUS_COMMON_MECHANICS`. Global structural maturity is unchanged. Global-first architecture is preserved; this is not an EU-only product.
