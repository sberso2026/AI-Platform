# EOS 2.9 electrical capability matrix

`IMPLEMENTED` is not `VALIDATED`. `VALIDATED` is not `QUALIFIED`. An imported ETAP, PowerFactory, SKM, or EasyPower result is not an EOS-qualified calculation. A supplied motor power is not an electrical study result.

| Function | Lifecycle | State | External tool | Limitation |
| --- | --- | --- | --- | --- |
| Concept supply options | Concept | IMPLEMENTED | No | Capacity and cost are not invented. |
| Option comparison | Concept | IMPLEMENTED | No | Cost and schedule stay empty unless supplied. |
| Load list | Feasibility | IMPLEMENTED | No | A power value needs a unit. |
| Operating cases | Feasibility | IMPLEMENTED | No | Process scenarios stay owned by Process. |
| Voltage levels | Feasibility | IMPLEMENTED | No | Record only. |
| Sources and generators | Feasibility | IMPLEMENTED | No | Adequacy is not calculated. |
| Transformers | Feasibility | IMPLEMENTED | Yes | Impedance and adequacy are not invented. Vendor data stays vendor dependent. |
| Switchgear and MCC | Feasibility | IMPLEMENTED | No | Fault withstand is not certified. |
| Single-line diagram | FEED | IMPLEMENTED | No | Governance record. Not a CAD platform. |
| Power-system model registry | FEED | IMPLEMENTED | Yes | Metadata and checksum only. |
| Load flow | Detailed Engineering | NOT_IMPLEMENTED | Yes | A fixture may be stored. Load flow is not calculated. |
| Short circuit | Detailed Engineering | NOT_IMPLEMENTED | Yes | Fault levels are not calculated. |
| Protection records | FEED | IMPLEMENTED | Yes | AI cannot approve a setting. Settings are not calculated. |
| Protection coordination | Detailed Engineering | NOT_IMPLEMENTED | Yes | A fixture may be stored. |
| Motor starting | Detailed Engineering | NOT_IMPLEMENTED | Yes | Starting performance is not calculated. |
| Voltage drop | Detailed Engineering | NOT_IMPLEMENTED | Yes | Voltage drop is not calculated. |
| Cable records and schedule | FEED | IMPLEMENTED | No | Size is not calculated. Civil route stays owned by Civil. |
| Cable sizing | Detailed Engineering | NOT_IMPLEMENTED | Yes | Selected size is not calculated. |
| Earthing | FEED | IMPLEMENTED | Yes | Resistance is not calculated. Resistivity is not inferred. |
| Lightning | FEED | IMPLEMENTED | No | Compliance is not claimed. |
| Lighting | FEED | IMPLEMENTED | Yes | Lux levels are not invented. |
| Hazardous-area interface | FEED | IMPLEMENTED | No | Electrical does not create the classification. |
| Arc flash | Detailed Engineering | NOT_IMPLEMENTED | Yes | Incident energy is not calculated. |
| Harmonics | Detailed Engineering | NOT_IMPLEMENTED | Yes | Distortion is not calculated. |
| UPS, battery, and emergency power | FEED | IMPLEMENTED | Yes | Autonomy and capacity are not calculated. |
| I&C interface contract | FEED | IMPLEMENTED | No | Full I&C design is not implemented. |
| ETAP | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. Not certified. |
| PowerFactory | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. Not certified. |
| SKM | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. Not certified. |
| EasyPower | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. Not certified. |
| Electrical AI context | All | IMPLEMENTED | No | Labels evidence and required human decisions. Cannot approve settings. |

IFC readiness is false while a readiness gap, a stale study, an unresolved interface, an unreviewed protection record, or a missing authorized approval remains.

Bounded limitations that stay in force: no load-flow calculation, no short-circuit calculation, no protection-setting calculation, no motor-starting calculation, no voltage-drop calculation, no cable-sizing calculation, no arc-flash calculation, no earthing calculation, no harmonic calculation, no battery or UPS autonomy calculation, no certified external solver, no structural capacity claim, no hazardous-area classification by Electrical, and no automatic enrollment of existing electrical projects.
