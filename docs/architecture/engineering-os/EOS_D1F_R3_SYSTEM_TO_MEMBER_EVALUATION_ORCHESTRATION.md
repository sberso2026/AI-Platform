# EOS-D1F-R3 System-to-Member Evaluation Orchestration

## Scope

R3 is one deterministic orchestrator. It evaluates an explicit declared scope by sending governed member entries to existing steel and concrete checks. It does not analyse a frame, truss, plate, shell, or finite-element model. It does not distribute loads, invent actions, or choose a governing case.

System evaluation is not structural analysis. A member result that is satisfied for its declared scope is not whole-structure adequacy, engineering approval, or formal conformance.

## Evaluation plan

A System Evaluation Plan states the structural system, topology fingerprint, project context, standard profile, declared scope, required entries, informational entries, authority, provenance, version, fingerprint, and status.

Permitted governing authorities are human authored, human confirmed, governed imported, and explicit governed model. An unconfirmed candidate, including an AI proposal, cannot execute governing checks.

Statuses are draft, governed, stale, invalid, superseded, and archived. Only a governed plan can execute.

## Required and informational entries

Each entry names the physical member, design member, material domain, member type, capability, profile, generation, declared scope, selected action binding, and provenance. Material, member type, standard, and jurisdiction are explicit. They are not inferred from a name, a section label, geometry alone, a location, or an AI suggestion.

A required check participates in system aggregation. An informational check may be executed and cannot satisfy a missing required member. An empty required set cannot pass. An unsupported required member stays incomplete.

## Action selection

Every check that needs structural actions uses one or more current R2 binding identifiers. Copied action values without a binding do not execute. Before execution the binding must be verified and governed, complete for its declared scope, current for topology, model, and result set, and accompanied by model-validation evidence. Failed, nonconverged, unverified imported, and stale bindings do not execute. An absent component stays absent.

If more than one binding is a candidate, the plan must name the selected binding or a traceable governed envelope. R3 does not take a maximum absolute value of axial force, shear, moment, or torsion. It does not combine components from different combinations into a synthetic tuple. A critical or governing location label does not govern unless provenance says why that location was selected.

## Routing

Steel routing in this phase calls the existing Eurocode tension check only, and only for an EU profile. Australian, European, and United States rules are not reused across jurisdictions. A profile or jurisdiction mismatch fails closed.

Concrete routing calls the existing C9 beam, column, solid-slab, and wall-section orchestrators. Beam checks stay inside the declared beam scope. Column checks keep the existing uniaxial second-order handoff and do not send that handoff to biaxial section design or general second-order analysis. Slab checks keep supplied strip and section actions, without a two-way solver or generated reactions. Wall checks remain section-only and are not wall-member design.

Concrete human review stays pending. R3 does not describe these checks as engineer validated or conformance validated.

## Results and aggregation

Member states are satisfied for the declared bounded scope, not satisfied, incomplete, undetermined, invalid, or stale. Satisfied does not mean complete member design or code conformance. The underlying validation and conformance state is copied and is not raised.

System aggregation is fail closed. Any required member that is not satisfied makes the system not satisfied, while incomplete, stale, and unavailable findings remain visible. Invalid and undetermined precede incomplete. Incomplete precedes stale. Bounded satisfaction requires every required member to be satisfied for the executed declared scope. Completeness is separate from satisfaction: a completed evaluation may conclude not satisfied.

The permitted claim is satisfied for the executed declared bounded evaluation scope. The result does not say the structure is safe, adequate, or compliant, and it does not represent a complete building.

## Omissions

Connection design and foundation design are not implemented. If the plan requires either, the system records the capability unavailable and cannot pass. A support reaction is not foundation adequacy. Member checks are not load-path validation. R3 does not automate analysis-model validation.

## Provenance, fingerprints, and history

Provenance runs from the structural system through topology, analysis model and run, normalized result, action binding, evaluation plan, member evaluation, underlying design result, and system aggregation.

Member and system fingerprints cover the plan, identity, capability, profile, bindings, topology and result fingerprints, method fingerprint, and declared scope. Member order does not change the system fingerprint. A change of plan, binding, profile, method, or required set changes the fingerprint.

A topology, result, plan, profile, or method change marks the affected evaluation stale. A stale member cannot govern the system. A new evaluation is stored beside the prior result.

## AI boundary

AI may explain findings, summarize failed members, suggest an investigation order, suggest candidate plan additions, and identify missing evidence. AI may not select governing actions, change the required set, override a failed check, approve an unsupported member, promote acceptance, or change jurisdiction or profile. A human engineering decision remains required.

## C10 and the next phase

Concrete C10 remains pending qualified human review. This phase does not modify review packs or promote validation, conformance, or certification.

The next phase can consume system identity, member identity, connection identity, member-end references, governed action bindings, the evaluation plan, member evaluation identity, provenance, fingerprints, and invalidation. It still does not design bolts, welds, base plates, or concrete joints.
