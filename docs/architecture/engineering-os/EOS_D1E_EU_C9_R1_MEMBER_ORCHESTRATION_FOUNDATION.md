# EOS-D1E-EU-C9-R1 member orchestration foundation

This phase records how existing Eurocode concrete methods may be composed for a member. It does not add a resistance formula, a second-order solver, a deflection method, a lap method, or a beam, column, slab, or wall runtime orchestrator.

Orchestration does not create engineering authority. It cannot invent a missing method, widen a method's declared scope, replace a deferred method, or turn a fail-closed result into a pass.

Existing domain types are beam, column, slab, and wall. Solid slab is the crack-width member kind already used under slab. A rectangular wall section is a wall plus the existing rectangular section geometry. No new member type is introduced.

The selected first workflow is an ordinary non-prestressed rectangular beam. That beam can later call uniaxial flexure, zero-axial shear without design shear reinforcement, explicit torsion, the bounded crack-width check, cover assembly, equal-diameter clear spacing, and basic required tension anchorage. Punching is not a beam check. Nominal curvature is not a beam check. Deflection, design anchorage, and laps stay unavailable.

Columns may later use uniaxial and biaxial rectangular section checks, and the isolated prismatic rectangular uniaxial compression method. That compression method hands one design moment to the uniaxial section check, with the axial sign converted once. It does not feed the biaxial section check. It is not a frame or P-delta analysis.

Solid slabs may later use a rectangular strip in flexure, interior rectangular punching, and the crack-width check. Wall sections may later use rectangular section checks only. Neither is a shell or nonlinear wall analysis.

A deferred or unimplemented required check makes the member result incomplete. A missing input makes it undetermined. A failed check makes it not satisfied. None of those states is a pass, and none is full Eurocode compliance, engineering approval, or certification.

The next phase is bounded beam orchestration using only the methods already verified.
