# EOS 2.7 civil capability matrix

`IMPLEMENTED` is not `VALIDATED`. `VALIDATED` is not `QUALIFIED`. An imported Civil 3D or hydraulic-model result is not an EOS-qualified calculation. No hosted civil calculation is certified.

| Function | Lifecycle | State | External tool | Limitation |
| --- | --- | --- | --- | --- |
| Concept site options | Concept | IMPLEMENTED | No | Quantities are not invented. |
| Option comparison | Concept | IMPLEMENTED | No | Cost and schedule stay empty unless supplied. |
| Feasibility workflow | Feasibility | IMPLEMENTED | No | Preliminary records only. |
| Survey registry | Feasibility | IMPLEMENTED | No | A datum mismatch fails closed. |
| Topographic and design surfaces | Feasibility | IMPLEMENTED | Yes | Datum must match the current survey. |
| Grading records | Feasibility | IMPLEMENTED | No | Surfaces are not calculated here. |
| Grading surface calculation | Feasibility | NOT_IMPLEMENTED | Yes | No surface formula. |
| Earthworks records | Feasibility | IMPLEMENTED | Yes | Cut and fill need units when supplied. |
| Cut and fill calculation | Feasibility | NOT_IMPLEMENTED | Yes | Bulking factors are not invented. |
| Drainage records | Feasibility | IMPLEMENTED | Yes | Flow is stored only when supplied. |
| Drainage flow calculation | Feasibility | NOT_IMPLEMENTED | Yes | No runoff formula. |
| Stormwater cases | Feasibility | IMPLEMENTED | No | Project-specific case names. |
| Catchments and channels | Feasibility | IMPLEMENTED | No | Identity and linkage. |
| Culvert records | Feasibility | IMPLEMENTED | No | Size is not calculated. |
| Culvert sizing | Detailed Engineering | NOT_IMPLEMENTED | Yes | No hydraulic formula. |
| Road records | Feasibility | IMPLEMENTED | No | Width needs a unit when supplied. |
| Pavement records | Feasibility | IMPLEMENTED | No | Thickness is not designed here. |
| Pavement thickness design | Detailed Engineering | NOT_IMPLEMENTED | Yes | No pavement formula. |
| Hardstand records | Feasibility | IMPLEMENTED | No | Use and temporary status. |
| Trench records | Feasibility | IMPLEMENTED | No | Stability is not calculated. |
| Excavation stability | Detailed Engineering | NOT_IMPLEMENTED | Yes | No stability formula. |
| Underground corridors and crossings | FEED | IMPLEMENTED | No | Not full clash intelligence. |
| Clash intelligence | Detailed Engineering | NOT_IMPLEMENTED | Yes | Recorded conflicts only. |
| Flood interface | FEED | IMPLEMENTED | No | Not a flood model. |
| Flood model | Detailed Engineering | NOT_IMPLEMENTED | Yes | Level is not calculated. |
| Quantity records | Feasibility | IMPLEMENTED | No | A value needs a unit. Not procurement-grade. |
| Geotechnical handoff contract | FEED | IMPLEMENTED | No | Parameters are not invented. EOS 2.8 is not started. |
| Civil 3D | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata or import only. Not synchronized. |
| 12d Model | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata or import only. Not synchronized. |
| Hosted civil calculation | Detailed Engineering | NOT_IMPLEMENTED | Yes | Not certified. |
| Civil AI context | All | IMPLEMENTED | No | Labels facts and required human decisions. Cannot approve. |

IFC readiness is false while a readiness gap, a stale grading or quantity record, an unresolved interface, a missing flood basis, or a missing authorized approval remains.

Bounded limitations that stay in force: no grading calculation, no cut/fill calculation, no drainage-flow calculation, no culvert sizing, no pavement design, no flood model, no excavation stability, no invented geotechnical parameter, no structural capacity claim, no certified Civil 3D or 12d execution, no bidirectional model synchronization, and no automatic enrollment of existing civil projects.
