# EOS 2.0 cross-discipline interface graph

Phase: `EOS-2.0-ENGINEERING-LIFECYCLE-AND-DISCIPLINE-DESIGN-ARCHITECTURE`

Status: `ARCHITECTURE_DEFINED`. The graph is not implemented by this phase. Existing D8 handoff work, where present, remains a bounded I&C record and is not this graph.

## Graph

The primary engineering flow is:

`Process -> Mechanical -> Piping -> Structural -> Geotechnical -> Civil`

Electrical and Instrumentation and Control run in parallel and exchange interfaces with every node they affect. Civil and geotechnical also exchange directly. Structural and mechanical exchange equipment loads and support reactions. Piping and structural exchange pipe-rack and support reactions. Process and electrical exchange utility and driver demand. Process and I&C exchange control and trip intent. Electrical and I&C exchange power availability and I/O. Geotechnical and structural exchange foundation parameters and reactions.

An edge is not authority transfer. A process duty cited by mechanical is a source until mechanical adopts its own requirement. Adoption stays explicit and human.

## Interface record

Each `Interface` records:

- source discipline
- receiving discipline
- parameter or data
- units
- revision
- status
- due date
- owner
- assumption state
- acceptance state
- downstream dependants

The source revision and the receiving revision are both stored. A floating interface is rejected. Acceptance by the receiving discipline is not approval of the source discipline's design, and it is not approval of the receiving design.

Assumption state is `stated`, `open`, or `closed`. An open assumption cannot be hidden behind an accepted interface.

Downstream dependants are explicit links. They are not inferred from similar tags, drawing proximity, or AI similarity. This matches the existing rule that dependency is explicit.

## Status

Interface status is separate from design maturity and from approval. Minimum statuses are `proposed`, `issued`, `accepted`, `rejected`, and `superseded`. Rejected and superseded remain history.

A change to an accepted interface opens an impact assessment for the named downstream dependants. It does not recalculate them.

## What the graph does not do

The graph does not complete a HAZOP, a SIL study, a geotechnical investigation, or a structural analysis. It shows which parameter is owed, by whom, at which revision, and which objects depend on it. Human engineers accept or reject the interface.
