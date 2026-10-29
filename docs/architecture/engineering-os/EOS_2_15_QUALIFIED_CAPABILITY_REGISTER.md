# EOS 2.15 Qualified Capability Register

EOS 2.15R grants `QUALIFIED_BOUNDED` only where the hosted staging application produced the evidence below. Delivery-workflow qualification is not calculation qualification. D1 remains the existing bounded structural calculation scope.

| ID | Capability | State | Evidence boundary |
| --- | --- | --- | --- |
| EOS-LC | Lifecycle governance | QUALIFIED_BOUNDED | Hosted lifecycle page loaded `EOS-QA-001`. Stage and state are persisted for that project. No stage was skipped by this path. |
| EOS-BASIS | Design basis and requirements | QUALIFIED_BOUNDED | The qualification project retains its persisted basis, requirement, and input context, and the hosted overview reads the project. This is not a standards library. |
| EOS-IF | Interface intelligence | QUALIFIED_BOUNDED | Hosted P-101 revision. Mechanical is the source owner. Structural and electrical decisions are independent. Historical acceptance remains. The new revision starts pending and does not inherit acceptance. |
| EOS-CHG | Change impact | QUALIFIED_BOUNDED | Hosted change `chg-p101-runtime`. Deterministic discovery left structural and electrical candidates unassessed. A human role inserted the materiality decision. AI was denied. |
| EOS-FRZ | Design freeze and deliverables | QUALIFIED_BOUNDED | FEED fingerprint unchanged. `str-dwg` stayed revision 1 and potentially stale. Revalidation was recorded. Freeze, deliverable approval, and IFC release were denied for unauthorized roles. |
| EOS-AI | Engineering AI bounded role | QUALIFIED_BOUNDED | Hosted API returned four evidence-grounded answers and `approvalGranted=false`. This is the bounded advisor in the application, not an external model and not an approver. |
| EOS-SEC | Multi-tenant security | QUALIFIED_BOUNDED | Hosted workspace `eos-qa-b` did not see `EOS-QA-001`. Leak count 0. Unauthorized hosted actions were denied. |
| EOS-D1 | Structural D1 calculation | QUALIFIED_BOUNDED | Existing D1 scope only. The D1 review test passed. No formula was added or changed. |
| EOS-PR | Process delivery workflow | QUALIFIED_BOUNDED | Hosted Process Home rendered the qualification project. Calculations remain not qualified. |
| EOS-ME | Mechanical delivery workflow | QUALIFIED_BOUNDED | Hosted Mechanical Home and the P-101 source revision ran in the application. Equipment calculations remain not qualified. |
| EOS-PI | Piping delivery workflow | QUALIFIED_BOUNDED | Hosted Piping Home rendered the qualification project. Stress analysis remains not qualified. |
| EOS-ST | Structural delivery workflow | QUALIFIED_BOUNDED | Hosted Structural Home, receiver acceptance, materiality, and disposition ran in the application. This does not expand D1. |
| EOS-CV | Civil delivery workflow | QUALIFIED_BOUNDED | Hosted Civil Home rendered the qualification project. Civil calculations remain not qualified. |
| EOS-GE | Geotechnical delivery workflow | QUALIFIED_BOUNDED | Hosted Geotechnical Home rendered the qualification project. Geotechnical calculations remain not qualified. |
| EOS-EL | Electrical delivery workflow | QUALIFIED_BOUNDED | Hosted Electrical Home, receiver acceptance, and materiality ran in the application. Electrical studies remain not qualified. |
| EOS-IC | I&C delivery workflow | QUALIFIED_BOUNDED | Hosted Instrumentation Home rendered the qualification project. SIL and control calculations remain not qualified. |

`EXTERNAL_ENGINEERING_SOLVER_EXECUTION_GLOBALLY_QUALIFIED=NO`. Solver adapters remain metadata or import records.

Synthetic fixtures validate workflow behavior and provenance handling. They do not qualify engineering calculation correctness unless independently benchmarked against authoritative reference results.
