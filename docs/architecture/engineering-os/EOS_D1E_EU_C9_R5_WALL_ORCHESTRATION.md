# EOS-D1E-EU-C9-R5 wall-section orchestration

This phase adds one bounded rectangular reinforced-concrete wall-section orchestrator. It routes supplied section actions and explicit detailing inputs to existing C2, C3, C4, and C8 methods. It does not add a resistance formula and it does not analyse a wall member.

A rectangular section check is not wall-member design, shear-wall design, global wall analysis, or wall stability. The product claim remains the Eurocode concrete mechanics reference, with the bounded sub-claim for wall-section orchestration only.

## Canonical wall and geometry

The runtime member type is the existing `WALL` element. `RECTANGULAR_WALL_SECTION` stays a derived section description. No parallel wall domain object is created.

Wall length and thickness are explicit inputs. `lengthMapsTo` says whether length occupies the section width or the section depth. The orchestrator does not swap those dimensions because one is larger. A rectangular section does not create wall height, restraint, storey interaction, or a global wall model.

Major and minor section axes are mapped explicitly to in-plane or out-of-plane roles. The two roles must differ. Screen orientation is not an axis source.

## Action authority and routing

Action effects are supplied. The orchestrator does not derive axial force, moments, shear, torsion, reactions, storey forces, or overturning from loads.

Exactly one declared section mode is accepted:

- Pure flexure with an explicit zero axial force and one active moment uses the existing rectangular pure-flexure method on that axis.
- Uniaxial N-M with a nonzero axial force and one active moment uses the existing rectangular uniaxial section method on that axis.
- Biaxial P-M-M with axial force and both moments uses the existing rectangular section surface. That surface is not biaxial wall-member analysis and it is not second-order analysis.
- Pure axial uses the uniaxial section method only when the section axis is supplied. The axis is not guessed.

A mode is not silently replaced by another section method.

## Exclusions

The isolated column second-order method is not reused for a wall. Effective length, slenderness, buckling, and P-delta are not inferred.

The existing beam and slab shear method is not treated as wall shear. Slab punching is not copied onto a wall. A rectangular wall section is not treated as a torsion member. Crack width remains limited to the existing beam and solid-slab contract. Deflection is unavailable.

Cover assembly is a calculation and is not provided-cover compliance. Spacing stays an equal-diameter adjacent-bar check with explicit aggregate, parameters, and face identity. Faces and bar pairs are not classified from coordinates. Basic anchorage stays a straight deformed bar in tension with explicit stress and bond. Compression anchorage, design anchorage, laps, boundary elements, and seismic wall detailing are unavailable.

## Aggregation, provenance, and claims

Node roles remain check, calculation, and context. Only required checks can satisfy the declared scope. A calculation or context result cannot pass the section. An empty required-check set cannot pass. A failed section check does not hide another unavailable request.

The execution graph is profile and geometry, then the supplied action tuple, then one applicable section node, then optional detailing or context nodes, then aggregation. The graph is acyclic. Full standard coverage stays false. Results carry method provenance and a fingerprint of identity, geometry, axis mapping, reinforcement, actions, materials, profile, scope, and graph version. A changed dependency rejects reuse of the previous fingerprint.

Engineer validation remains pending. Numerical agreement with the underlying methods is not engineer validation, certification, or formal conformance. The next phase is the C9 closeout, which reconciles beam, column, slab, and wall-section orchestration before an independent conformance gate.
