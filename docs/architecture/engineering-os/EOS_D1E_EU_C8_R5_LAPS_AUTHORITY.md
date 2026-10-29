# EOS-D1E-EU-C8-R5 Lap Authority

Parent profile: `EU-EN1992-1-1-GEN1-C8-DETAILING-REFERENCE`.
No lap sub-profile is bound. Generation remains `EN1992-1-1-GEN1`. This is not a national annex.

## Candidate scope

Ordinary non-prestressed reinforced concrete. Individual straight deformed bars of one nominal diameter, in tension. Hooks, bends, bundles, welded mesh, prestress, seismic laps, couplers, and mechanical splices stay outside the candidate scope.

## What the lecture states

The same JRC Eurocode 2 training lecture used for spacing and anchorage states a design lap length. That length is a product of named factors and the basic required anchorage length, and it is not less than a minimum length.

The named factors are bar shape, concrete cover, confinement by non-welded transverse reinforcement, confinement by transverse pressure, and the percentage of bars lapped within a zone. The percentage factor is shown as an expression. The shape, cover, transverse-reinforcement, and pressure factors are named without expressions.

The minimum length is also shown. It depends on the percentage factor, the basic required anchorage length, the bar diameter, and an absolute length. It is not a separate lap method that can be used while the factor product remains incomplete.

Worked lap tables for one building are a different scope. They are not a second general rule.

## Level A and Level B

Level A, a basic tension lap, is not feasible. The lecture does not state a lap length that omits the unquantified factors.

Level B, the design lap, is not feasible. The factor product is incomplete.

No capability is selected. No method id is assigned.

## Lap basis

The lap expression uses the basic required anchorage length already implemented for one straight bar in tension. It does not use the design anchorage length. Basic anchorage is not treated as design anchorage, and it is not treated as the lap length.

Full design anchorage is not the missing prerequisite. The missing pieces are the lap factors for shape, cover, transverse reinforcement, and transverse pressure.

Design steel stress and design bond strength remain the explicit inputs inside the basic anchorage length. Yield strength is not substituted. Bond condition is not applied a second time. An explicit substitute for the basic anchorage length is not adopted, because the lecture names that length and the missing factors would remain.

## Other dependencies

Lap percentage is visible inside the unbound product. It is not defaulted, and it is not a sufficient lap rule by itself.

Clear spacing is not stated as a lap coefficient. A minimum-clear-spacing check result is not a lap factor.

Required nominal cover is not actual lap cover. The cover factor expression is not recovered.

Transverse reinforcement is named and not quantified. Ordinary stirrups are not assumed to satisfy it.

Staggered laps are mentioned as arrangement guidance on an earlier slide. That guidance is not a length rule.

The percentage is described as bars lapped within a zone. The model does not choose that zone.

Provided lap length, if a later method is ever governed, would be an explicit supplied length. No new bar-path solver is added.

## Decision

Disposition: laps deferred after this targeted recovery.
Runtime lap method count: 0.
The historical lap flag stays unset.
Existing cover, spacing, and basic anchorage methods stay in place.
Design anchorage stays unimplemented.

## Next routing

`EOS-D1E-EU-C8-R6-CLOSEOUT`. Close the C8 track with cover, spacing, and basic required anchorage implemented. Laps stay deferred. Do not open another generic lap search.

Product claim remains `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`. Conformance remains `INTENDED_PROFILE`. The pack is not certified. Engineer validation remains pending.
