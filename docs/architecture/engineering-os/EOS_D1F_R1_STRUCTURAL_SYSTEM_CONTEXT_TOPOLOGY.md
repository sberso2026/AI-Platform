# EOS-D1F-R1 Structural System Context and Topology

## Runtime scope

D1F-R1 is one bounded runtime foundation for structural-system context and physical topology. It represents the system. It does not analyse the system. Topology is not analysis, connectivity is not a load path, a support record is not a structural response, and this runtime is not a structural solver.

The runtime reuses the D1F-0 structural-system contract and fingerprint architecture, the D1A member, node, support, and connection identities, the D1B structural design context, and the D1C length-unit check. It does not create a parallel structural domain, member model, node model, support model, load model, combination engine, material engine, rule registry, unit engine, or fingerprint engine.

No persistence migration is required.

## Authority model

Every governed topology fact carries an authority. The canonical classes are EXPLICIT_GOVERNED_MODEL, HUMAN_AUTHORED, HUMAN_CONFIRMED, GOVERNED_IMPORTED, UNCONFIRMED_CANDIDATE, and INVALID. Only the first four can govern, and only when the origin is explicit. Proximity and model-proposed origins cannot govern. An unconfirmed candidate cannot govern. Confirming a candidate requires an explicit human action. Automatic confirmation is rejected.

Topology authority does not authorize a cross-project binding and does not weaken tenant, workspace, project, or authentication controls.

## System identity

A structural system records its id, tenant, workspace, project, discipline, D1B context, system version, topology version, status, unit-system reference, global coordinate-system reference, provenance, and fingerprint.

Status is DRAFT, GOVERNED, STALE, INVALIDATED, SUPERSEDED, or ARCHIVED. Analysed, safe, approved, and pass are not topology lifecycle states.

## Member binding

A physical member reuses the canonical member id and member kind. It binds a start node, an end node, optional section and material references, authority, provenance, and status. The member kind must be explicit, governed imported, or human confirmed. A model-proposed kind or a geometry-only kind is non-governing metadata.

## Nodes

A node records its id, coordinates, coordinate-system reference, authority, provenance, and status. Coordinates require an explicit unit accepted by the existing length-unit check and an explicit coordinate system. Unitless coordinates are rejected. Identical coordinates produce an advisory finding and do not merge the nodes.

## Connectivity

Connectivity edges are member-to-node, member-to-member, member-to-support, or connection-to-member. Each edge carries authority. Governed edges and candidate edges are separate. Candidate edges are omitted from the governed topology fingerprint and may be hashed only as a candidate fingerprint.

## Supports and restraints

A support records its id, a node or member reference, an explicit support type, restraint components, optional spring metadata, authority, provenance, and status. Translational and rotational axes are explicit. Spring stiffness is stored only when a finite value and a unit are supplied. The runtime does not invent or calculate stiffness.

## Releases

A release records the member, the end, the released degrees of freedom, a local-axis reference, authority, and provenance. A release is not inferred from a connection classification, a BIM symbol, or a member type.

## Connections

A connection records its id, the connected physical entities, an explicit classification when one is supplied, authority, provenance, and status. The runtime does not calculate connection capacity and does not design bolts, welds, or base plates. A connection classification does not create a release.

## Coordinates, sign metadata, and units

Coordinate-system records cover global, system, member-local, section-local, and analysis-provider-local frames. A transform reference names the source system, target system, method and version, authority, and provenance. It does not apply numerical analysis transformations. A missing coordinate system, an ambiguous local axis, an invalid member axis, or an unsupported transform fails closed. Screen orientation does not define an engineering axis.

Directional structural semantics require explicit force-sign, moment-sign, member-end, local-axis, and design-method convention metadata. An implicit solver convention is rejected.

The system requires a unit-system reference. Dimensioned coordinates require units. Existing length normalization is reused for coordinates.

## Validation, components, anomalies, and completeness

Validation detects duplicate member and node ids, dangling and unknown references, missing authority, invalid units, invalid coordinates, invalid release ends, and invalid restraint axes. Blocking findings make the topology invalid. Missing system or project identity leaves completeness undetermined.

Connected components are counted from governed member endpoints and governed member-to-member edges. The count is graph topology only. Orphan nodes, isolated members, unused supports, and unreferenced connections are anomalies. An anomaly is not automatically an engineering error. Finding severity is INFO, WARNING, or BLOCKING_INVALID_TOPOLOGY.

Declared scope is complete only when identity, required governing members and nodes, resolved references, units, coordinate systems, and acceptable authority are present and no blocking finding exists. Complete topology is not analysis-ready and is not design-ready.

## Mappings

Physical-to-analytical mappings record one-to-one, one-to-many, or many-to-one identity and authority. Analytical elements in this runtime contain identity only. Design mappings name a steel member or a concrete member and do not execute checks. Mapping authority is required. A model-proposed mapping cannot govern.

Load-case and combination identifiers may be referenced. Load is not distributed and member forces are not calculated. A human may author a load-path annotation. A model-proposed annotation cannot govern, and an annotation is not analysis.

## Provenance, events, fingerprints, and invalidation

Provenance records the subject, source origin, authority, system id, and revision. Origins are manual human input, a future governed CAD or BIM import, a future governed external-model import, or an existing repository entity. Origin does not imply correctness.

The runtime records system creation, topology change, member addition and removal, node change, support change, release change, connectivity confirmation, and topology invalidation. An event records a change. It is not engineering approval.

The governed fingerprint covers system identity, governed members, nodes, coordinate systems, the unit system, governed connectivity, supports, restraints, releases, governed mappings, and authority. It excludes screen selection, viewport, display color, and unconfirmed candidate connectivity. Equivalent governed topology produces the same fingerprint regardless of collection order.

A change to connectivity, supports, releases, coordinates, or governed mappings changes the fingerprint and can invalidate a future analysis result. A later revision does not silently reuse an earlier analysis binding. Historical revisions remain traceable: a new revision marks the prior result superseded and does not overwrite it.

## AI boundary and analysis boundary

The runtime gives a model no authority over the structural system, connectivity, supports, releases, axes, mappings, load paths, or engineering acceptance. Candidate duplicates, candidate connectivity, candidate classifications, and candidate anomalies remain advisory.

This runtime does not implement stiffness matrices, frame or truss analysis, finite-element analysis, P-delta, eigenvalues, modal or dynamic analysis, shell or plate analysis, action effects, reactions, displacements, connection design, or foundation design.

## R2 handoff

R2 can bind analysis models, analysis runs, result sets, and member action effects to the stable R1 identity: structural system, physical members, nodes, coordinate systems, unit system, topology fingerprint, mapping identities, authority, and provenance. R2 owns the analysis-result contract and member action binding. It does not add a structural solver.
