# EOS-D1E-EU-C9-R4 solid slab orchestration

C9-R4 coordinates one ordinary non-prestressed solid reinforced-concrete slab. The canonical member type remains `SLAB`. No parallel slab object is introduced.

A section or strip check is not slab structural analysis. A punching check is not a global slab analysis. The orchestrator does not generate slab actions, strip widths, support reactions, or punching demand.

## Bounded scope

Explicit declared modes are strip flexure, one-way shear, punching, crack width, long-term context, cover requirement, reinforcement spacing, and basic anchorage. There is no complete-slab mode.

Strip identity, orientation (`X`, `Y`, `MAJOR`, or `MINOR`), and width are explicit governed inputs. Screen orientation and a stored global slab width are not substitutes.

## Method limits

C2 is used only when the strip is a rectangular pure-flexure section with explicit zero axial force and one governed moment. Orthogonal moments are not sent to C4. Nonzero axial force is not membrane analysis and is not sent to C3. C6 is not applicable and is not called. Torsion is not invoked as slab-strip torsion.

One-way shear stays inside the existing zero-axial method without design shear reinforcement. Punching stays inside the existing interior rectangular loaded-area method. Edge, corner, and opening cases are incomplete. Support position and opening state are explicit. The existing punching method is called; no second perimeter engine is added.

Crack width is the existing solid-slab check with explicit service stress. Deflection stays deferred. Explicit creep and shrinkage remain context and are not deflection. Calculated creep and shrinkage are unavailable.

Cover assembly is a calculation, not provided-cover compliance. Spacing is the equal-diameter clear-spacing check. Crossing orthogonal bars are not treated as parallel clear spacing, and a vertical layer is not inferred from coordinates. Basic anchorage is straight tension reinforcement with explicit stress and bond strength. Design anchorage and laps remain unavailable.

## Aggregation and records

Only required check nodes can satisfy the declared scope. Calculation and context nodes cannot. An empty required-check set cannot pass. Precedence is not-satisfied, then undetermined or invalid input, then incomplete, with every finding retained. Full standard coverage remains false.

The result carries the orchestrator identity, declared scope, strip and support references, executed methods, node roles, provenance, and a fingerprint of the governed inputs. A changed dependency rejects reuse of a previous fingerprint.

This is a bounded reference capability. It is not complete slab design, two-way analysis, engineering approval, or certified conformance. Engineer validation remains pending.

The next member phase is bounded rectangular wall-section orchestration. Wall orchestration is not implemented here.
