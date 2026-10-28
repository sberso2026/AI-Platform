# EOS 2.15 Qualified Capability Register

No capability below is granted `QUALIFIED_BOUNDED` by this gate except the previously qualified D1 structural calculation scope, which was not expanded and was not invalidated. Delivery workflows are `VALIDATED`. External solvers are `NOT_CERTIFIED`.

| ID | Capability | State | Scope | Limitation |
| --- | --- | --- | --- | --- |
| EOS-LC | Lifecycle governance | VALIDATED | Concept, Feasibility, FEED, Detailed Engineering. No stage skip. | Signed-in lifecycle page was not observed. |
| EOS-BASIS | Design basis and requirements | VALIDATED | Project basis, discipline inheritance, requirement evidence, input revision. | Not a standards library. |
| EOS-IF | Interface intelligence | VALIDATED | Source ownership, receiver acceptance, revision, units, coordinates, bounded traversal, stale propagation. | Acceptance is not design approval. No automatic resolution. |
| EOS-CHG | Change impact | VALIDATED | Explicit dependency discovery, candidate impacts, human materiality, reverification, baseline deviation. | A candidate impact is not proof of material engineering impact. |
| EOS-FRZ | Design freeze and deliverables | VALIDATED | Exact revision, immutable baseline, review, approval, release, stale detection, supersession, IFC purpose CONSTRUCTION. | Freeze is not design approval. IFC is not regulatory certification. EOS is not an enterprise DMS. |
| EOS-AI | Engineering AI | VALIDATED | Evidence-grounded explanation and abstention. | No approval, acceptance, materiality, freeze, release, recalculation, or baseline mutation. |
| EOS-SEC | Multi-tenant security | VALIDATED | Hosted authenticated-role isolation for EOS-QA-001 returned leak count 0. | The browser session was not completed. |
| EOS-D1 | Structural D1 calculation | QUALIFIED_BOUNDED | Existing qualified D1 scope only. | No new formula qualification. Existing D1 limits remain. |
| EOS-PR | Process delivery workflow | VALIDATED | Basis, streams, cases, model registry, balance governance, duties, utilities, PFD/P&ID governance. | Thermodynamic, hydraulic, line, relief, and valve calculations are NOT_QUALIFIED. Simulators are EXTERNAL_TOOL_DEPENDENT. |
| EOS-ME | Mechanical delivery workflow | VALIDATED | Equipment, datasheets, vendor data, mass records, maintenance and lifting governance. | Vessel, pump, fatigue, nozzle, and rotordynamic calculations are NOT_QUALIFIED. |
| EOS-PI | Piping delivery workflow | VALIDATED | Line list, classes, routing governance, stress registry and provenance, supports, nozzles, tie-ins. | Pipe sizing and stress analysis are NOT_QUALIFIED. CAESAR II and AutoPIPE are NOT_CERTIFIED. |
| EOS-ST | Structural delivery workflow | VALIDATED | Delivery workflow separate from D1. | D1 qualification is not expanded by the delivery workflow. |
| EOS-CV | Civil delivery workflow | VALIDATED | Survey, datum, grading records, drainage records, roads, quantities, interfaces. | Grading, drainage, pavement, and flood calculations are NOT_QUALIFIED. |
| EOS-GE | Geotechnical delivery workflow | VALIDATED | Investigation, ground model, parameter provenance, recommendations, handoffs. | Bearing, settlement, pile, slope, liquefaction, and excavation calculations are NOT_QUALIFIED. |
| EOS-EL | Electrical delivery workflow | VALIDATED | Load list, SLD governance, model registry, study provenance, cable and protection records. | Load flow, short circuit, protection, cable sizing, arc flash, earthing, and UPS calculations are NOT_QUALIFIED. |
| EOS-IC | I&C delivery workflow | VALIDATED | Index, I/O, narratives, cause and effect, alarms, SIF governance, FAT/SAT records. | SIL calculation, instrument sizing, tuning, and logic generation are NOT_QUALIFIED. |

Synthetic fixtures validate workflow behavior and provenance handling. They do not qualify engineering calculation correctness unless independently benchmarked against authoritative reference results.

External tools, including Aspen HYSYS, Aspen Plus, UniSim, AFT, SPACE GASS, CAESAR II, AutoPIPE, AVEVA E3D, Plant 3D, Civil 3D, 12d Model, PLAXIS, GeoStudio, ETAP, PowerFactory, SKM, and EasyPower, are `METADATA_ONLY` or `IMPORT_ONLY` and `NOT_CERTIFIED`. `EXTERNAL_ENGINEERING_SOLVER_EXECUTION_GLOBALLY_QUALIFIED=NO`.
