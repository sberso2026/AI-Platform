# EOS-D1E-EU-C5-T4 bounded torsion implementation

## Selected reference profile

Runtime method `EU_RC_TORSION_EN1992_RECTANGULAR_REFERENCE` reuses profile `EU-EN1992-1-1-GEN1-TORSION-REFERENCE`.

- Profile type: `REFERENCE_IMPLEMENTATION_PROFILE`
- Generation: `EN1992-1-1-FIRST_GENERATION`
- Binding: `packages/engineering-os/src/structural-concrete/eu-c5/profile-binding.ts`
- This is not a national annex and not formal EN 1992 conformance.

## Bounded scope

Reinforced concrete, solid or hollow rectangle, explicit D1C `MEMBER_TORSION` in N.m, explicit width and height, explicit hollow wall thickness when hollow, designer `cotTheta` inside the bound domain, declared `alpha_cc`, `gamma_c`, and `gamma_s`, explicit transverse and longitudinal reinforcement, and linear shear-torsion interaction when shear is non-zero.

Out of scope: automatic reinforcement design, M-T, N-T, full N-M-V-T, cracking or threshold reinforcement, prestress, T/L/I sections, FEA, and general torsion analysis.

## Required inputs

`TEd`, `VEd`, `VRd,max` when `|VEd| > 0`, section kind, width, height, actual wall thickness for hollow sections, `cotTheta`, `fck`, concrete elastic modulus, longitudinal and transverse `fyk`, reinforcement elastic modulus, a positive reinforcement reference area used only to satisfy the existing C1 characteristic bundle, `alpha_cc`, `gamma_c`, `gamma_s`, an NDP source reference, provided `Asw/s`, and provided `ΣAsl`.

## NDP fail-closed behavior

`alpha_cc`, `gamma_c`, and `gamma_s` are not defaulted and are not stored on the reference profile. A missing, non-finite, or non-positive value returns `CHECK_UNDETERMINED` with `MISSING_NDP`. No authoritative resistance or utilization is emitted.

## C1 / C1C reuse

Design concrete strength uses `evaluateEuC1ConcreteDesignProperties`. Design reinforcement strength uses `evaluateEuC1ReinforcementDesignProperties`. Partial factors stay on the existing gamma rules. The caller supplies `projectOverrideRef` and does not invent a country annex.

## Geometry, strut angle, and strength reduction

Effective wall thickness is outer area divided by outer circumference, further limited by the actual wall on a hollow rectangle. Enclosed area and effective perimeter use the centre-line rectangle. The closed shear-flow factor is the bound profile constant, not a resistance by itself.

`cotTheta` has no default. The lower and upper bounds are read from the bound profile parameters. A value outside that domain is invalid input.

Strength reduction uses the bound `nuCoefficient` and `nuFckDivisor` with the declared `fck`. Non-prestressed `alphaCw` is the bound profile value. A prestressed request fails closed.

## Checks

Maximum torsional resistance, transverse reinforcement, and longitudinal reinforcement are deterministic checks of explicit input. The method does not choose bar size or spacing.

Shear-torsion interaction is the bound linear sum. `VEd = 0` is the governed zero-shear end of that sum. Non-zero shear requires an explicit `VRd,max`; the torsion method does not calculate shear resistance.

Cracking and threshold reinforcement are not implemented. That exclusion applies only to this bounded method.

## Check states and utilization

`CHECK_SATISFIED`, `CHECK_NOT_SATISFIED`, and `CHECK_UNDETERMINED` are separate for the strut interaction, transverse reinforcement, and longitudinal reinforcement. The governing check is the failed check that has no finite ratio, otherwise the largest individual ratio. Utilization is that governing ratio. It is not a blended synthetic interaction.

Sign is preserved on the demand. Resistance uses magnitude because closed shear flow on the symmetric rectangle reverses with the sign of torsion.

## Golden cases and independence

Expected values in `eos-d1e-eu-c5-t4.test.ts` are reconstructed from the bound symbolic operations in the test file. They do not call the runtime torsion evaluator to produce the expected number. Tolerance is `1e-9` relative for equivalent transported units and `1e-6` N.m absolute for the closed-form resistance. External software comparison is not available and is not treated as conformance.

## Provenance, fingerprints, and invalidation

A successful result records the profile, C1 design strengths, and D1C member torsion. The fingerprint includes demand, geometry, reinforcement, materials, NDP source, `cotTheta`, profile version, and method version. A change in any governing dependency changes the fingerprint. A stale result must not be reused. Historical reproduction uses the same inputs, profile version, and rule versions.

## Validation and conformance

Numerical validation is not engineer validation and is not formal standard conformance. Engineer validation remains `PENDING_HUMAN_ENGINEERING_REVIEW`. The product claim remains `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`. The pack is not certified.

Remaining debt: engineer review, explicit national-annex conformance, formal EN 1992 conformance, third-party software comparison, second-order effects, serviceability, detailing, anchorage and laps, and prestress.

## C6 handoff

Bounded shear, interior rectangular punching, and this rectangular torsion method are the C5 closeout. The next conceptual phase is RC second-order / stability. That handoff does not authorize complete Eurocode concrete design.
