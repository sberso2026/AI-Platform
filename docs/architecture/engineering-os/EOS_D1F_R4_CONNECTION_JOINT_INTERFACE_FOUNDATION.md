# EOS-D1F-R4 Connection and Joint Interface Foundation

## Scope

R4 is one runtime foundation for connection and joint identity. It connects physical topology, governed member-end action bindings, and bounded member evaluations to a physical connection, an analytical joint, a design-connection identity, member ends, and a force-transfer context.

It does not design a connection. Bolt, weld, plate, bearing, block shear, prying, end plate, base plate, anchor, concrete anchorage, beam-column joint, panel zone, gusset, stiffness, and joint-classification calculations are out of scope. Structural analysis and foundation design are also out of scope.

A physical connection is not an analytical joint. An analytical joint is not a design connection. A member-end action is not connection-design demand. A connection record is not connection adequacy.

## Authority

A governed connection fact uses human authored, human confirmed, governed imported, or explicit governed model authority. An unconfirmed candidate cannot govern. Geometric proximity, touching BIM elements, and visual or model inference do not create a governed connection. AI may suggest a classification or a missing interface. AI cannot create a governing connection, confirm a mapping, infer a release, select design forces, or approve adequacy.

## Entities

The physical connection reuses the R1 connection record and adds the structural system, connected member ends, node, version, and topology fingerprint. The analytical joint names the analysis model, node, analytical element ends, and coordinate reference. The design connection names the physical connection, profile, explicit family, required scope, and action-context references. Families such as shear, moment, brace, splice, base, and concrete joint are labels only. A family does not define stiffness, release, or capacity.

One physical connection may map to one or many analytical joints, and several physical details may map to one joint. The mapping carries authority. One-to-one mapping is not assumed.

## Member ends

Each member end keeps its physical member, design member, analytical element, explicit start or end, I or J orientation, node, and local coordinate system. Orientation is not guessed. Reversed analytical orientation stays recorded on the analytical end. R1 releases are reused. A connection type does not create a release, and a release does not create a connection type.

Joints may connect two, three, or more members without assuming a beam-column, splice, brace, or base detail unless that family is explicitly governed.

## Force transfer

The force-transfer context stores each governed R2 member-end action binding separately, with its case or combination, location, coordinate mapping, and sign convention. Raw unnormalized provider forces are rejected. Unverified, stale, nonconverged, and failed results are rejected. Model-validation evidence is required. An absent component stays absent. A zero is kept only when the source marks it explicit. Sign conversion is traceable and is not applied twice. Connection-local axes are not inferred.

The context does not sum vectors, take a maximum absolute component, build an envelope, or combine actions from different combinations. It does not assume the imported actions are in equilibrium. Equilibrium review is a deferred non-governing diagnostic and is not design demand. A transfer path is recorded only when it is explicitly authored, not inferred from a connection type.

## Interfaces and scope

Steel, base, and concrete joint interfaces expose identity, profile, member ends, and governed action references. Their design availability is not implemented. A support restraint is not connection capacity. Support reactions are references for a later foundation interface, not foundation adequacy. Geotechnical runtime and soil-parameter inference are not implemented.

Scope states distinguish a connection outside the declared scope, a required connection that is not evaluated, an interface that is complete for its declared scope, and design that remains unavailable. Interface completeness is not connection design, a pass, or adequacy. A satisfied member evaluation cannot hide a required connection gap. Historical R3 results are not rewritten.

R3 steel dispatch remains limited to the existing Eurocode tension route. R4 does not describe R3 as general Australian, European, and United States steel orchestration.

## Provenance and history

Provenance runs from the structural system through members, member ends, the physical connection, the analytical joint, the design connection, the action bindings, and the force-transfer context. Connection and force-transfer fingerprints sort member ends and action references, so collection order does not matter. Changes to ends, mapping, releases, bindings, cases, or sign conventions change the relevant fingerprint.

A topology, mapping, release, classification, action-binding, coordinate, sign, or profile change marks the affected interface or force-transfer context stale. A new result is stored beside the prior result. Events record creation, mapping, evaluation, and invalidation. An event is not engineering approval.

## Next phase

The next phase can consume the structural system, support identity, connection identity, member ends, force-transfer context, reaction references, coordinates, profile, provenance, fingerprints, and invalidation. It still does not design bearing capacity, settlement, footings, piles, rafts, or foundation reinforcement.
