# EOS 2.6 piping capability matrix

`IMPLEMENTED` is not `VALIDATED`. `VALIDATED` is not `QUALIFIED`. An imported CAESAR II or AutoPIPE result is not an EOS-qualified calculation. No hosted stress solver is certified.

| Function | Lifecycle | State | External tool | Limitation |
| --- | --- | --- | --- | --- |
| Concept routing options | Concept | IMPLEMENTED | No | Quantities and stress adequacy are not invented. |
| Option comparison | Concept | IMPLEMENTED | No | Cost and schedule stay empty unless supplied. |
| Feasibility workflow | Feasibility | IMPLEMENTED | No | Preliminary records only. |
| Line list | Feasibility | IMPLEMENTED | No | Delivery record. Not a second identity master. |
| Design conditions | Feasibility | IMPLEMENTED | No | Process remains the owner. A value needs a unit. |
| Piping class | Feasibility | IMPLEMENTED | No | Recording a class is not approval. |
| Material selection record | Feasibility | IMPLEMENTED | No | Corrosion is not calculated. |
| Routing metadata | Feasibility | IMPLEMENTED | No | EOS is not a 3D authoring tool. |
| Hydraulic sizing | Feasibility | NOT_IMPLEMENTED | Yes | Pipe size is not calculated. |
| Pipe-size calculation | Feasibility | NOT_IMPLEMENTED | Yes | A size needs a supplied source. |
| FEED workflow and baseline | FEED | IMPLEMENTED | No | Baseline stores revision identities. |
| Stress-critical register | FEED | IMPLEMENTED | No | AI may propose. A human confirms. |
| Detailed engineering workflow | Detailed Engineering | IMPLEMENTED | No | Governance records. |
| Stress model registry | Detailed Engineering | IMPLEMENTED | Yes | Solver metadata and provenance. |
| Stress cases | Detailed Engineering | IMPLEMENTED | No | Case names only. No jurisdictional formula. |
| Stress result provenance | Detailed Engineering | IMPLEMENTED | Yes | Fixture or imported value. Compliance stays false. |
| Deterministic stress engine | Detailed Engineering | NOT_IMPLEMENTED | Yes | No expansion, sustained, or occasional formula. |
| Support and restraint records | Detailed Engineering | IMPLEMENTED | No | A reaction needs a unit. Not structural design. |
| Structural support design | Detailed Engineering | NOT_IMPLEMENTED | No | Structural owns support steel. |
| Nozzle interface | FEED | IMPLEMENTED | No | Allowable load is not invented. |
| Nozzle load comparison | Detailed Engineering | IMPLEMENTED | No | Compared only when both values exist. Acceptability is not declared. |
| Tie-in register | Feasibility | IMPLEMENTED | No | Field verification needs evidence. |
| Valve records | Feasibility | IMPLEMENTED | No | Valve sizing is not calculated. |
| Valve sizing | Detailed Engineering | NOT_IMPLEMENTED | Yes | No sizing formula. |
| Special piping items | FEED | IMPLEMENTED | No | Extensible item type. |
| Test requirements | FEED | IMPLEMENTED | No | Test pressure is not calculated. |
| Test pressure calculation | Detailed Engineering | NOT_IMPLEMENTED | Yes | No test-pressure formula. |
| MTO | Feasibility | IMPLEMENTED | No | A quantity needs a unit. Not a procurement claim. |
| CAESAR II | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata or import only. Not certified. |
| AutoPIPE | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata or import only. Not certified. |
| AVEVA E3D | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. No bidirectional sync. |
| Plant 3D | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. No bidirectional sync. |
| Bidirectional model sync | Detailed Engineering | NOT_IMPLEMENTED | Yes | Not implemented. |
| Hosted stress execution | Detailed Engineering | NOT_IMPLEMENTED | Yes | Not certified. |
| Piping AI context | All | IMPLEMENTED | No | Labels facts and required human decisions. Cannot approve. |

IFC readiness is false while a readiness gap, an unresolved nozzle comparison, an open tie-in, a stale stress model, or a missing authorized approval remains.

Bounded limitations that stay in force: no pipe-size calculation, no stress or flexibility calculation, no code-compliance claim, no invented nozzle allowable, no automatic nozzle acceptance, no structural support design, no field verification without evidence, no certified CAESAR II or AutoPIPE execution, no bidirectional 3D synchronization, and no automatic enrollment of existing piping projects.
