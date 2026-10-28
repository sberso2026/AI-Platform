# EOS 2.4 process capability matrix

`IMPLEMENTED` is not `VALIDATED`. `VALIDATED` is not `QUALIFIED`. An imported simulator result is not an EOS-qualified calculation. No hosted simulator is certified.

| Function | Lifecycle | State | External tool | Limitation |
| --- | --- | --- | --- | --- |
| Concept options and comparison | Concept | IMPLEMENTED | No | Missing cost, capacity, and vendor performance stay empty. |
| Feasibility workflow | Feasibility | IMPLEMENTED | No | Records only. |
| Mass-balance governance | Feasibility | IMPLEMENTED | No | Stores a supplied record. |
| Mass-balance calculation | Feasibility | NOT_IMPLEMENTED | No | This module does not close a balance. |
| Energy-balance governance | Feasibility | IMPLEMENTED | No | Stores a supplied duty record. |
| Thermodynamic properties | Feasibility | NOT_IMPLEMENTED | No | Properties are not calculated. |
| FEED workflow and baseline | FEED | IMPLEMENTED | No | Baseline stores revision identities. |
| PFD and P&ID governance | FEED | IMPLEMENTED | No | Identity, revision, and linkage. |
| PFD and P&ID drafting | FEED | NOT_IMPLEMENTED | Yes | EOS is not a drafting package. |
| Stream registry | All | IMPLEMENTED | No | A value requires a unit. |
| Equipment duty records | Feasibility | IMPLEMENTED | No | Process duty only. Mechanical design is later. |
| Utility demand records | Feasibility | IMPLEMENTED | No | Demand is not calculated here. |
| Hydraulic records | Detailed Engineering | IMPLEMENTED | No | Result is not calculated. |
| Hydraulic calculation | Detailed Engineering | NOT_IMPLEMENTED | Yes | No pressure-drop formula was added. |
| Line-sizing records | Detailed Engineering | IMPLEMENTED | No | Method remains not calculated. |
| Line-sizing calculation | Detailed Engineering | NOT_IMPLEMENTED | Yes | No sizing formula was added. |
| Relief records | Detailed Engineering | IMPLEMENTED | No | Status is external or not implemented. Rate is not invented. |
| Relief sizing | Detailed Engineering | NOT_IMPLEMENTED | Yes | No relief formula was added. |
| Control-valve records | Detailed Engineering | IMPLEMENTED | No | Cv is not calculated. |
| Aspen HYSYS | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. |
| Aspen Plus | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. |
| UniSim | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. |
| AFT Fathom and AFT Arrow | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. |
| Hosted simulator execution | Detailed Engineering | NOT_IMPLEMENTED | Yes | Not certified. |
| Process-safety action closure by AI | All | NOT_IMPLEMENTED | No | A human closes the action. |

IFC readiness is false while a readiness gap, an open safety action, or a missing authorized approval remains.
