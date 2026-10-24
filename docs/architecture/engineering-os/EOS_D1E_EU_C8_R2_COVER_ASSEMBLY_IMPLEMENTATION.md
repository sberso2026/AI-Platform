# EOS-D1E-EU-C8-R2 bounded cover assembly

## Scope

This phase implements one governed cover-assembly reference method:

`EU_RC_COVER_ASSEMBLY_EN1992_REFERENCE`

The capability scope is `COVER_ASSEMBLY_ONLY`. It reuses profile `EU-EN1992-1-1-GEN1-C8-DETAILING-REFERENCE`, generation `EN1992-1-1-GEN1`. The profile is not a National Annex.

The pack-level formula fingerprint remains `PARTIAL` because spacing, anchorage, and laps are unbound. The two cover rules have complete expressions, so each now has its own deterministic formula fingerprint. That cover-subpack fingerprint check is `PASS`.

The method assembles:

- minimum cover as the maximum of the bond component, the durability component, and the profile absolute-minimum term
- nominal cover as that minimum plus the explicit deviation allowance

It does not look up durability cover from exposure class, infer structural class or design working life, or implement spacing, anchorage, laps, fire cover, or seismic detailing.

## Explicit inputs

Bond cover, durability cover, and deviation allowance are explicit governed inputs. A missing value fails closed. Zero is an explicit non-negative value and is not inserted when an input is missing. Negative values, NaN, and infinity are rejected. No upper bound is invented.

The absolute minimum is the profile parameter `absoluteMinimumCoverMm`. The runtime reads that parameter. It does not carry a separate cover literal.

Durability cover and deviation allowance are nationally determined inputs. The reference profile does not supply them. An unresolved NDP state fails closed.

## Context that does not calculate cover

Exposure, material, and execution context may be stored with the result. Exposure context does not generate the durability component. A request to derive durability cover from exposure, or to apply a default deviation allowance, fails closed.

## Geometry and compliance

D1E modelled cover and geometric clearance remain geometry. They are not this EN 1992 cover check. The R1 profile did not bind a provided-cover comparison, so this method does not emit member compliance. A successful result state is `COVER_REQUIREMENT_CALCULATED`. A failed binding is `FAIL_CLOSED`.

## Validation

Golden cases reconstruct the maximum and the addition independently of the runtime evaluator. Rule authority remains a single governed source. Numerical benchmark independence is separate and passes under exact algebraic millimetre comparison.

Engineer validation remains pending. Formal standard conformance is not claimed. The product claim remains the Eurocode concrete mechanics reference capability.

## What stays open

Durability lookup, spacing, anchorage, and laps stay unimplemented. Spacing is not implementation-ready. The next phase is `EOS-D1E-EU-C8-R3-SPACING-AUTHORITY`, limited to recovery of the minimum-clear-spacing rule pack.

Results carry input provenance, the profile parameter source, rule identifiers and versions, and a fingerprint. A changed input or profile binding invalidates the result. Stale reuse is not allowed. The assembly can recheck a future candidate only from explicit components. It does not invent bond cover, durability cover, or deviation allowance.
