# EOS-D1E-EU-C8-R4B Basic Anchorage Implementation

Method: `EU_RC_BASIC_REQUIRED_ANCHORAGE_EN1992_REFERENCE`.
Profile: `EU-EN1992-1-1-GEN1-C8-ANCHORAGE-BASIC-REFERENCE`.
Parent: `EU-EN1992-1-1-GEN1-C8-DETAILING-REFERENCE`.
Generation: `EN1992-1-1-GEN1`.

The capability is a basic required straight-bar anchorage reference. It is not a design anchorage length, a complete Eurocode anchorage method, a certified claim, or an anchorage detailing autodesign.

## Bounded scope

One straight deformed bar in ordinary non-prestressed reinforced concrete, in tension. The nominal bar diameter, design steel stress, and design bond strength are explicit. A comparison also needs an explicit available length and an explicit critical-section reference. Hooks, bends, bundles, mesh, prestress, compression, design modifiers, minimum design anchorage, and laps are rejected.

## Formula

`basicRequiredAnchorageLengthMm = (nominalBarDiameterMm / basicAnchorageDiameterDivisor) * (designSteelStressMPa / designBondStrengthMPa)`.

The diameter divisor is the profile parameter `EU_C8_R4_BASIC_ANCHORAGE_DIAMETER_DIVISOR`. Its value, units, authority, and sources are read from that parameter. The runtime file does not carry a second copy of the value. Bar diameter, available length, and the result are millimetres. Design steel stress and design bond strength are megapascals. `N/mm2` is accepted as the same stress unit. Length inputs may be millimetres, centimetres, or metres.

## Explicit stress and bond strength

Design steel stress is a tension magnitude supplied with provenance, authority, applicability, and validation state. Design yield strength is not substituted for it. A zero tension magnitude is an explicit input and produces a zero basic required length. A negative value fails closed.

Design bond strength is an explicit governed input because the bond-stress derivation is not bound. It needs the same provenance fields plus profile applicability. It is not defaulted, and bond-condition or bar-diameter factors are not applied again. A zero or negative bond strength fails closed. Concrete tensile strength is not derived, and neither a mean nor an effective tensile value is substituted.

Bond condition remains not required for this method and is not defaulted.

## Basic length and design length

The result field is the basic required length. Design anchorage is not implemented. A satisfied comparison means the supplied available length is at least that basic length. The result carries the warning `BASIC_REQUIRED_LENGTH_ONLY`. It does not establish full design anchorage compliance. No minimum design length and no modification factor is applied. Required nominal cover is not an anchorage modifier. A spacing check result is not an anchorage factor.

Calculation without an available length is supported. A requested comparison fails closed when the available length or the critical section is missing. The method does not choose the critical section and does not solve a bar path. Utilization, when the available length is greater than zero, is the basic required length divided by the available length. A zero available length does not divide; the comparison still uses the two lengths.

## Provenance and invalidation

The result records the bar, both provenances, the divisor parameter and its sources, the critical section when used, the rule, and the profile version. Input, material, and profile fingerprints feed the result fingerprint. A changed governing input invalidates reuse. The same inputs reproduce the same result. Inverse recheck calls the same method and does not invent stress, bond strength, bar extension, a hook, or transverse reinforcement. Optimization and Pareto selection reject an undetermined check.

## Validation limit

Numerical checks reconstruct the length from the profile divisor outside the runtime method. Engineer validation remains pending. Numerical validation is not engineer validation and is not formal conformance. The product claim remains `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`. The pack is not certified.

## Next routing

Lap length is not implemented. The next phase is `EOS-D1E-EU-C8-R5-LAPS-AUTHORITY`, a targeted lap rule recovery. It has to decide whether a bounded lap method can use this basic length while design-anchorage factors remain deferred.
