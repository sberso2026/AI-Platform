# EOS 2.12 change impact capability matrix

`IMPLEMENTED` means the assessment runtime records or checks the item. `DETERMINISTIC` means the result comes from rules or explicit edges. `AI_ASSISTED` means the text explains those results. `VALIDATED` means the domain tests exercise it. `HUMAN_DECISION_REQUIRED` means an engineer confirms the engineering consequence. `FUTURE_PHASE` means EOS 2.13. `NOT_IMPLEMENTED` means this phase does not do the work.

| Capability | State | Notes |
| --- | --- | --- |
| Change assessment record | IMPLEMENTED, VALIDATED | Composes on EOS-A4. Does not replace `engineering_changes`. |
| Impact candidate | IMPLEMENTED, DETERMINISTIC, VALIDATED | Starts `UNASSESSED`. Not a confirmed impact. |
| State machine | IMPLEMENTED, VALIDATED | Implementation is not verification. |
| Material and editorial rules | IMPLEMENTED, DETERMINISTIC, VALIDATED | Caller can supply a rule table. |
| Bounded graph discovery | IMPLEMENTED, DETERMINISTIC, VALIDATED | Depth limit 8. Cycles stop. No name matching. |
| Direct and indirect paths | IMPLEMENTED, DETERMINISTIC, VALIDATED | The path remains on the candidate. |
| Materiality | IMPLEMENTED, VALIDATED, HUMAN_DECISION_REQUIRED | AI cannot finalize it. |
| Discipline action | IMPLEMENTED, VALIDATED, HUMAN_DECISION_REQUIRED | The action is confirmed, not executed. |
| Calculation and model revalidation | IMPLEMENTED, VALIDATED | The prior result is kept. Recalculation is not run. |
| Requirement reverification | IMPLEMENTED, VALIDATED | Evidence id is kept. |
| Baseline deviation | IMPLEMENTED, DETERMINISTIC, VALIDATED | The frozen snapshot is not rewritten. |
| Multi-change and supersession | IMPLEMENTED, VALIDATED | One closure does not clear another change. |
| Procurement, construction, commissioning links | IMPLEMENTED, VALIDATED, BOUNDED | Only explicit edges. Not those management systems. |
| Project controls events | IMPLEMENTED, VALIDATED, BOUNDED | Application events. Not schedule forecasting. |
| TQ, decision, and action links | IMPLEMENTED, VALIDATED | Existing record ids only. |
| Register, graph, and discipline summary | IMPLEMENTED, VALIDATED | Focused counts and paths. |
| AI explanation | IMPLEMENTED, AI_ASSISTED, VALIDATED | Labeled separately from deterministic paths. |
| RLS and audit | IMPLEMENTED, VALIDATED | Workspace membership on the new tables. |
| Full design freeze and IFC deliverable control | FUTURE_PHASE | EOS 2.13. |
| Automatic recalculation | NOT_IMPLEMENTED | |
| Automatic deliverable revision | NOT_IMPLEMENTED | |
| Automatic baseline rewrite | NOT_IMPLEMENTED | |
| AI change approval | NOT_IMPLEMENTED | Authority remains no. |

A candidate dependency is not proof that a design is adequate or inadequate.
