# EOS 2.5 mechanical capability matrix

`IMPLEMENTED` is not `VALIDATED`. `VALIDATED` is not `QUALIFIED`. Vendor data is not EOS-qualified engineering. No external mechanical calculation is certified.

| Function | Lifecycle | State | External tool | Limitation |
| --- | --- | --- | --- | --- |
| Concept workflow | Concept | IMPLEMENTED | No | Technology options are records. |
| Option comparison | Concept | IMPLEMENTED | No | Cost, reliability, and performance are not invented. |
| Feasibility workflow | Feasibility | IMPLEMENTED | No | Preliminary records only. |
| Equipment register | Feasibility | IMPLEMENTED | No | Tag and service. Not a second equipment master. |
| Datasheets | Feasibility | IMPLEMENTED | No | Revision and duty linkage. |
| Material selection record | Feasibility | IMPLEMENTED | No | Stores a supplied selection. |
| Material science calculation | Feasibility | NOT_IMPLEMENTED | No | Corrosion science is not calculated. |
| FEED workflow | FEED | IMPLEMENTED | No | Baseline stores revision identities. |
| Detailed engineering workflow | Detailed Engineering | IMPLEMENTED | No | Governance records. |
| Rotating equipment workflow | Detailed Engineering | IMPLEMENTED | No | Pump performance is not calculated. |
| Static equipment workflow | Detailed Engineering | IMPLEMENTED | No | Pressure-vessel code compliance is not claimed. |
| Package equipment workflow | Detailed Engineering | IMPLEMENTED | No | Boundary and responsibility record. |
| Heat exchanger mechanical record | Detailed Engineering | IMPLEMENTED | No | Mechanical configuration only. Thermal duty stays with Process. |
| Design conditions | All | IMPLEMENTED | No | Linked to a process source where supplied. |
| Mass states | All | IMPLEMENTED | No | A value without a unit is refused. |
| Nozzle and interface identity | All | IMPLEMENTED | No | Allowable load is not invented. |
| Maintenance and access | All | IMPLEMENTED | No | Intervals are not invented. |
| Lifting and handling | All | IMPLEMENTED | No | A record is not an engineered lift. |
| Reliability requirements | All | IMPLEMENTED | No | Statistics are not fabricated. |
| Vendor data governance | Detailed Engineering | VENDOR_DEPENDENT | Yes | Acceptance is not package approval. |
| Vendor revision control | Detailed Engineering | IMPLEMENTED | No | Previous checksum is kept. |
| Calculation provenance | Detailed Engineering | IMPLEMENTED | No | Registers an external or imported reference. |
| Pressure-vessel calculation | Detailed Engineering | NOT_IMPLEMENTED | Yes | No wall thickness or MAWP formula. |
| Pump performance calculation | Detailed Engineering | NOT_IMPLEMENTED | Yes | No shaft power or hydraulic formula. |
| Nozzle allowable calculation | Detailed Engineering | NOT_IMPLEMENTED | Yes | No allowable-load formula. |
| Fatigue and rotordynamics | Detailed Engineering | NOT_IMPLEMENTED | Yes | Not calculated. |
| External mechanical tool adapter | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. Execution is not certified. |
| Hosted mechanical calculation | Detailed Engineering | NOT_IMPLEMENTED | Yes | Not certified. |
| Stale process and vendor detection | All | IMPLEMENTED | No | Marks dependents. Does not overwrite them. |
| Mechanical AI context | All | IMPLEMENTED | No | Labels facts and required human decisions. Cannot approve. |

IFC readiness is false while a readiness gap, an unreviewed vendor revision, an unresolved interface, or a missing authorized approval remains.

Bounded limitations that stay in force: no pressure-vessel code claim, no rotating-equipment performance claim, no nozzle allowable load, no engineered lift from the lifting record, no reliability statistic, no maintenance interval invented by EOS, and no automatic enrollment of existing mechanical projects.
