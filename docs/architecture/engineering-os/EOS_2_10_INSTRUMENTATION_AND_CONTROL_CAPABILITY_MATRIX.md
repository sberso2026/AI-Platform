# EOS 2.10 instrumentation and control capability matrix

`IMPLEMENTED` is not `VALIDATED`. `VALIDATED` is not `QUALIFIED`. A recorded SIF is not a verified SIS design. An imported control-system configuration is not validated control logic. A supplied SIL target is process-safety dependent and is not calculated here.

| Function | Lifecycle | State | External tool | Limitation |
| --- | --- | --- | --- | --- |
| Concept control options | Concept | IMPLEMENTED | No | Vendor performance is not invented. |
| Option comparison | Concept | IMPLEMENTED | No | Cost and schedule stay empty unless supplied. |
| Instrument index | Feasibility | IMPLEMENTED | No | A range is not invented. A value needs a unit. |
| I/O list | Feasibility | IMPLEMENTED | No | A signal needs source, destination, and allocation. |
| Control loops | Feasibility | IMPLEMENTED | No | Tuning constants are not generated. |
| Control narratives | FEED | IMPLEMENTED | No | AI text stays proposed. |
| Cause and effect | FEED | IMPLEMENTED | No | AI cannot approve the logic. |
| Alarms and rationalization | FEED | IMPLEMENTED | No | Setpoints are not invented. AI cannot approve them. |
| Trips and interlocks | FEED | IMPLEMENTED | No | A setpoint needs an authorized source. |
| SIF governance | FEED | IMPLEMENTED | No | A safety function is not allocated to the BPCS. |
| SIL target | FEED | PROCESS_SAFETY_DEPENDENT | No | The target is not determined in this module. |
| SIS verification | Detailed Engineering | NOT_IMPLEMENTED | Yes | An imported fixture may be stored. Performance is not calculated. |
| Instrument sizing | Detailed Engineering | NOT_IMPLEMENTED | Yes | Cv and instrument size are not calculated. |
| Control tuning | Detailed Engineering | NOT_IMPLEMENTED | Yes | Tuning constants are not generated. |
| Detector coverage | Detailed Engineering | NOT_IMPLEMENTED | Yes | Coverage is not modeled. |
| Logic generation | Detailed Engineering | NOT_IMPLEMENTED | Yes | PLC, DCS, and SIS logic are not generated. |
| Package interfaces | FEED | VENDOR_DEPENDENT | Yes | Package signals are not invented. |
| Panels, cabinets, junction boxes, marshalling | FEED | IMPLEMENTED | No | Governance records. |
| Instrument cables | FEED | IMPLEMENTED | No | Signal cables stay separate from power cables. |
| Networks and protocols | FEED | IMPLEMENTED | Yes | Secrets are not stored. Interoperability is not claimed. |
| OT cybersecurity requirements | FEED | IMPLEMENTED | No | Requirements only. Access and firewall rules are not changed. |
| FAT, SAT, and commissioning | Detailed Engineering | IMPLEMENTED | No | A pass needs evidence. Safety tests are not closed automatically. |
| Instrument database | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. Not certified. |
| Control platform | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. Not certified. |
| I&C AI context | All | IMPLEMENTED | No | Labels evidence and required human decisions. Cannot determine SIL. |

IFC readiness is false while a readiness gap, a stale process or package reference, an unreviewed cause-and-effect record, a SIF without an authorized source, or a missing authorized approval remains.

Bounded limitations that stay in force: no SIL determination, no SIL performance calculation, no instrument sizing, no control tuning, no detector-coverage model, no control-logic generation, no certified external configuration, no stored network secrets, no OT access changes, no BPCS allocation of a safety function, and no automatic enrollment of existing I&C projects.
