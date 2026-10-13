# EOS-D1E-EU-C9-R2 bounded RC beam orchestration

C9-R2 evaluates one ordinary, non-prestressed, rectangular reinforced-concrete beam by calling existing C2–C8 methods. It does not add a resistance formula, a beam analysis solver, or a design approval.

Section routing uses D1C axial presence and explicit major and minor moment fields. Canonical zero is the exact zero already stored by that action, not a new tolerance. Pure flexure on one axis selects the matching C2 method and does not also run C3. Nonzero axial with one active axis selects C3 only. Both active axes select C4. Pure axial selects C3 only when the section axis is supplied; otherwise the section check is blocked.

Check nodes can affect member acceptance. Cover assembly and basic-anchorage calculation return a calculated value and do not count as satisfied. Explicit long-term state is context and does not count as satisfied. An empty required-check set cannot pass.

Punching and nominal-curvature second-order analysis are not applicable to this beam scope and are not invoked. Shear stays inside the existing zero-axial method without design shear reinforcement. Torsion runs only with a transported torsion action and the existing method inputs. Crack width is the only serviceability check. Deflection, design anchorage, laps, calculated creep, and calculated shrinkage stay unavailable and make the member result incomplete.

A satisfied result means the declared bounded scope executed. It is not complete EN 1992 beam design, engineering approval, or certification. The product claim remains the mechanics reference capability, with the bounded sub-claim of beam orchestration. Column orchestration is the next phase and is not started here.
