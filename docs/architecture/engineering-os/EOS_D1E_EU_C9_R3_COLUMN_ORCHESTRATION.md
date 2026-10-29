# EOS-D1E-EU-C9-R3 bounded rectangular RC column orchestration

C9-R3 routes one ordinary, non-prestressed, prismatic, rectangular reinforced-concrete column through methods that already exist. It does not add a resistance formula, a frame solver, or a general second-order analysis.

Section resistance and member stability stay separate. A uniaxial section check uses the existing axial-flexure method on an explicit axis. A biaxial section check uses the existing rectangular P-M-M method. Neither check is a member stability proof, and the biaxial section check does not add second-order effects.

The only member second-order path is an explicit uniaxial mode. It calls the existing nominal-curvature method and keeps that method's single handoff into the uniaxial section check as one composite result. The handoff's axial sign conversion and total moment are reused. They are not recalculated here. There is no handoff from that member method into the biaxial section method.

Effective length, first-order end moments, the effective creep ratio, and the reinforcement modulus are explicit inputs. The orchestrator does not infer support conditions, a sway condition, or an effective length, and it does not add a further imperfection moment. A creep coefficient from the serviceability long-term state is not substituted for the effective creep ratio. Supplied end moments already include the imperfection effect required by the bounded member method. Slenderness reported by that method is retained and is not turned into a neglect rule.

Requesting biaxial section resistance together with member second-order effects is incomplete. The uniaxial member method is not run on one axis and reported as biaxial member stability.

Pure axial force has no bending axis of its own. The uniaxial section method runs only when the axis is supplied. A column label does not start the member second-order method, and a missing end-moment state stays undetermined.

Flexure-only, column shear, and column crack-width requests stay outside this orchestrator. Punching is not applicable. Torsion runs only when the declared scope, transported action, and explicit inputs match the existing torsion method. Cover assembly is a calculation, not provided-cover compliance. Spacing uses the existing equal-diameter check and does not invent bar pairs. Basic anchorage stays a straight tension bar with explicit stress and bond strength. Compression anchorage, design anchorage, and laps are not satisfied by that tension check.

Check, calculation, and context roles are unchanged. Only required checks aggregate. An empty check set cannot pass. A failed check and an unavailable capability are both kept. Declared-scope completeness is false when a required item is missing, blocked, deferred, or undetermined. Full standard coverage remains false. The result is not engineering approval or certification.

Provenance keeps the member-method intermediate values, including slenderness, effective creep, curvature, second-order moment, and total moment. The member fingerprint covers section data, effective length, end moments, actions, materials, profile, creep input, modulus, scope, and graph version. A changed dependency invalidates reuse.

The next member phase is bounded solid-slab orchestration. This phase does not implement it.
