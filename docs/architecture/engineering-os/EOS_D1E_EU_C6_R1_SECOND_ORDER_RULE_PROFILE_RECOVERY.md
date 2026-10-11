# EOS-D1E-EU-C6-R1 — nominal-curvature reference profile

This phase binds one first-generation member second-order profile. It does not evaluate the second-order moment.

## Selected method

Family: nominal curvature. Profile: `EU-EN1992-1-1-GEN1-C6-NOMINAL-CURVATURE-REFERENCE`. Generation: first-generation EN 1992-1-1. This is a reference implementation profile. It is not a National Annex.

Nominal stiffness was not selected. It needs a separate stiffness-factor chain and was not required for the bounded uniaxial member.

## Bounded scope

Isolated prismatic rectangular member, uniaxial bending, compression, explicit effective length, explicit end moments, explicit reinforcement, explicit effective depth, and an explicit effective creep ratio. The resulting design axial force and design moment are handed to the existing uniaxial N-M resistance. Biaxial handoff is not part of this profile.

This is not frame stability, eigenvalue buckling, or general nonlinear analysis.

## Sources

- JRC Eurocode 2 workshop, J.C. Walraven, 2 February 2008, published by the European Commission Joint Research Centre. Primary source for the nominal-curvature member model, equivalent end moment, and creep-factor structure.
- MASESOFT EN 1992 training note. Corroborates the design-moment split, the second-order eccentricity, and the curvature-distribution bounds.
- Blueprints open formula implementation for EN 1992-1-1:2004. Corroborates the curvature correction and the nominal second-order moment.
- Public nominal-curvature formula notes. Corroboration only.

A licensed standard PDF is not required for this binding and is not stored.

## Contracts

Effective length is an explicit input. It is not inferred from support labels.

Slenderness is `l0 / i`, with `i = sqrt(I / Ac)` taken from the existing gross-section geometry. The profile does not offer a path that neglects second-order effects. A conflicting slenderness-limit expression was rejected rather than repaired.

End moments already include imperfection. No inclination and no minimum eccentricity are invented. The equivalent first-order moment uses weights 0.6 and 0.4, with the larger end moment controlling the lower bound.

The curvature-distribution factor is chosen by the designer between 8 and 10. The profile does not pick one.

Effective creep is an explicit input. No creep coefficient is defaulted, and the long-term model is not implemented.

Concrete modulus is not required. Reinforcement modulus is an explicit input. Design strengths stay on the existing declared-NDP material path.

The uniaxial resistance receives a tension-positive axial force equal to the negative of the compression magnitude, plus the total design moment. No resistance formula is copied here.

## Conflicts

The slenderness-limit notation conflict is rejected, so that limit is outside this profile. The curvature-factor assumptions stay as bounds. The imperfection-placement difference is closed by requiring the supplied first-order moments to include imperfection. Nothing is averaged.

No National Annex value is guessed. The permitted balanced-axial simplification 0.4 is a recorded reference-profile parameter, not a national choice.

## Readiness

Profile validation and fail-closed resolution are implemented. The numerical method count is zero. Engineer validation remains pending. Conformance stays an intended profile. The next phase is the deterministic evaluation and independent numerical check.
