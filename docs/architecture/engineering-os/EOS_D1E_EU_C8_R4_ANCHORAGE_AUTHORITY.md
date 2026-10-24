# EOS-D1E-EU-C8-R4 Anchorage Authority

Parent profile: `EU-EN1992-1-1-GEN1-C8-DETAILING-REFERENCE`.
Anchorage sub-profile: `EU-EN1992-1-1-GEN1-C8-ANCHORAGE-BASIC-REFERENCE`.
Generation: `EN1992-1-1-GEN1`. Version: `c8-r4-basic-anchorage-1`.
This sub-profile is not a national annex.

## Candidate scope

Ordinary non-prestressed reinforced concrete. One straight deformed bar in tension. Nominal bar diameter, design steel stress, and design bond strength are explicit. Hooks, bends, welded bars, bundles, compression anchorage, seismic anchorage, and prestressing are outside this scope.

## Level A and Level B

Level A is the basic required anchorage length. It is feasible and selected.

Level B is the design anchorage length, including bar-shape, cover or confinement, transverse reinforcement, welded transverse reinforcement, transverse pressure, and the minimum design length. Those factors are named on the same lecture slides and their expressions are not recovered. Level B is not selected.

Basic required length is not treated as design anchorage length.

## Source

Governed source: JRC Eurocode 2 Background and Applications, Brussels, 20-21 October 2011, anchorage-length slides. The basic length slide was read from the lecture figure. Public availability does not by itself make a source authoritative. One governed source is recorded. Worked length tables for a particular building are a different scope. A section heading that also mentions mesh and tendons is a different scope. The unquantified design-length factors are a different method. No unresolved conflict is averaged or selected by model memory.

## Basic anchorage rule

`basicRequiredAnchorageLengthMm = (nominalBarDiameterMm / basicAnchorageDiameterDivisor) * (designSteelStressMPa / designBondStrengthMPa)`.

The diameter divisor is the profile parameter `EU_C8_R4_BASIC_ANCHORAGE_DIAMETER_DIVISOR`, value 4, dimensionless, standard-defined for this reference profile. Stress is in MPa, bar diameter is in millimetres, bond strength is in MPa, and the length is in millimetres.

Rule id: `EU_C8_R4_LB_RQD_BASIC`.
Method id: `EU_RC_BASIC_REQUIRED_ANCHORAGE_EN1992_REFERENCE`.

## Bar diameter

Nominal bar diameter. It is not inferred.

## Design steel stress

Route: explicit design steel stress. The lecture anchors the force in the bar at that stress. Design yield strength is not substituted for it. The selected scope uses the tension magnitude. A negative stress fails closed. Compression is not opened from the tension rule.

## Design bond strength

The lecture also shows a bond-stress product that names a concrete tensile design property, a bond-condition factor, and a bar-diameter factor. The bar-diameter factor is only identified for bars above 32 mm; its coefficient is not stated. The tensile-property derivation is not on the selected slide. The bond-condition diagram is visible and is not a complete classifier.

That derivation is not bound. The selected method takes `designBondStrengthMPa` as an explicit governed input. Provenance, units, and applicability are required. The product cannot invent the value. This is not a claim that the Eurocode bond-property calculation is implemented.

No C1 tensile route is reused. No parallel concrete material model is added. A later derivation would need a governed tensile design property before it could be bound.

## Bond condition

State: diagram visible, classifier not bound.
Contract: not required while design bond strength is explicit.
It is not defaulted to good bond.

## Force state

Tension only.

## Available length and critical section

Available anchorage length is an explicit supplied length. The critical section is an explicit reference, required when a comparison is requested. The resolver does not choose either. No new geometric path solver is added. D1E reinforcement geometry remains the geometry source for a later implementation.

## Future result

A later implementation may report the method, profile, bar, nominal diameter, design steel stress, explicit design bond strength, basic required length, available length when supplied, and a check state of satisfied, not satisfied, or undetermined. This phase returns no calculated length.

## Modification factors

Bar shape is not required for the basic required length. No identity factor is assumed for a straight bar.

Cover and confinement are named and not quantified. Required nominal cover from the cover assembly is not actual anchorage cover.

The spacing check result is not a confinement factor. Spacing geometry may be reused later only where the semantics match.

Transverse reinforcement is named and not quantified.
Welded transverse bars and transverse pressure are outside the selected scope.
The minimum design anchorage length is visible as a floor on the design length and is deferred with Level B. Its coefficients are not stored.

## NDP

The selected basic rule has no nationally determined parameter. No NDP value is guessed. A national annex is not required and is not inferred from location. Spacing zero-input allowances are not evidence for anchorage coefficients.

Project inputs: design steel stress, design bond strength, available anchorage length, and critical-section reference. Nominal diameter is geometry.

## Profile binding

The resolver fails closed for a missing or stale profile, a generation or version mismatch, an unsupported bar or force state, a missing diameter, stress, or bond strength, a request to derive bond strength, a request to substitute yield strength, a defaulted bond condition, a Level B modifier, cover or spacing results used as confinement, a lap request, a national-annex claim, and an unresolved source conflict. A comparison also requires the available length and the critical section.

Formula fingerprint validation: PASS.
Profile pack validation: PASS.
Provenance is complete for the one bound numerical parameter. Unprovenanced parameter count: 0.
Runtime method count: 0.

## Remaining debt

Reduced: basic anchorage rule-profile authority.

Remaining: anchorage runtime numerical validation, design anchorage modification factors, minimum design anchorage, laps, durability cover lookup, engineer validation, national profile validation, formal conformance, and C7 deflection.

Future lap length on the same lecture depends on the basic anchorage length. Lap rules are not bound.

## Next routing

`EOS-D1E-EU-C8-R4B-ANCHORAGE-IMPLEMENTATION`: bounded straight-bar anchorage implementation and numerical validation.

Product claim remains `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`. Conformance remains `INTENDED_PROFILE`. The pack is not certified. Engineer validation remains pending and is not required before the reference implementation. Assistance stays advisory.
