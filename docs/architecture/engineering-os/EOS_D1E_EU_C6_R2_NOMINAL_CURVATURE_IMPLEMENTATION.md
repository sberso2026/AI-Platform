# EOS-D1E-EU-C6-R2 — bounded nominal curvature

The runtime method is `EU_RC_SECOND_ORDER_EN1992_NOMINAL_CURVATURE_REFERENCE`. It uses the unchanged reference profile `EU-EN1992-1-1-GEN1-C6-NOMINAL-CURVATURE-REFERENCE`.

## Scope

Isolated prismatic rectangular member, uniaxial bending, compression. Effective length, end moments, effective creep, reinforcement area, reinforcement modulus, and effective depth are explicit inputs. The method does not select them.

It does not perform frame analysis, global P-delta, eigenvalue buckling, nonlinear frame analysis, FEA, or shell stability. Nominal stiffness is not implemented. Second-order effects are always included for this profile. There is no neglect decision.

## Actions and imperfections

Compression is a positive magnitude. The C3 handoff converts it once to the tension-positive axial force `-NEd`. End moments already include imperfection. No extra inclination is added. The equivalent first-order moment uses the profile weights and the sign-consistent lower bound. A positive second-order moment is then applied along that equivalent moment.

Opposite-sign end moments are accepted when the larger absolute end moment is `M02`. A zero smaller end moment is accepted. A zero larger end moment, or a reversed order, is rejected.

## Chain

Gross area and second moment come from the existing section geometry. Slenderness is effective length divided by the radius of gyration of that gross section. Design strengths come from the existing concrete and reinforcement design-property rules. Missing declared partial factors fail closed.

Curvature correction, creep factor, nominal curvature, second-order eccentricity, and second-order moment use the bound profile parameters, including the designer-selected curvature factor between the profile bounds 8 and 10. `nBal` is the profile value. Reinforcement modulus is not defaulted.

## C3

The member check is the existing uniaxial N-M demand check. A completed second-order calculation is not itself a member pass. Without a C3 request the check stays undetermined. C4 is not called.

## Validation

Independent closed-form checks cover the component chain, creep, length, compression, both curvature-factor bounds, end-moment signs, unit equivalence between millimetres and metres, fail-closed inputs, fingerprint invalidation, and the C3 sign handoff. No external software comparison was available. Engineer validation and formal conformance remain pending.

## Next

Serviceability, cracking, and long-term effects are the later scope. This method does not predict creep.
