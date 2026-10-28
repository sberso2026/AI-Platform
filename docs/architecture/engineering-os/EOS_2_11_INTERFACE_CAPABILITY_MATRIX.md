# EOS 2.11 interface capability matrix

`IMPLEMENTED` means the handoff runtime can record and check the item. `VALIDATED` means the domain tests exercise it. `QUALIFIED` is not claimed. `BOUNDED` means the check is deterministic and limited. `FUTURE_PHASE` means EOS 2.12. `NOT_IMPLEMENTED` means this phase does not do the work.

| Capability | State | Notes |
| --- | --- | --- |
| Canonical handoff revision | IMPLEMENTED, VALIDATED | Composes EOS 2.1. Does not replace `engineering_interfaces` or D1K. |
| State machine | IMPLEMENTED, VALIDATED | Source issue and receiver acceptance are separate. States are not skipped. |
| Revision control | IMPLEMENTED, VALIDATED | A new revision preserves the prior value and resets acceptance. |
| Source ownership | IMPLEMENTED, VALIDATED | A receiver cannot overwrite a source value. |
| Receiver acceptance | IMPLEMENTED, VALIDATED | Acceptance is not design approval. |
| Multi-receiver acceptance | IMPLEMENTED, VALIDATED | Each receiver keeps its own status. |
| Interface packages | IMPLEMENTED, VALIDATED, BOUNDED | Package membership keeps interface ids. Company form templates are not hard-coded. |
| Unit intelligence | IMPLEMENTED, VALIDATED | Deterministic factors. No LLM arithmetic. |
| Coordinate and axis governance | IMPLEMENTED, VALIDATED | Mismatch is reported. No automatic transform. |
| Value conflict | IMPLEMENTED, VALIDATED | A candidate is flagged. The source of truth is not chosen automatically. |
| Dependency graph | IMPLEMENTED, VALIDATED, BOUNDED | Depth limit 8. Circular edges are refused. |
| Stale propagation | IMPLEMENTED, VALIDATED, BOUNDED | Linked records become potentially stale. They are not recalculated. |
| Diagnostics | IMPLEMENTED, VALIDATED | Not every diagnostic is a blocker. |
| Duplicate, orphan, circular | IMPLEMENTED, VALIDATED | |
| Register, matrix, graph view | IMPLEMENTED, VALIDATED, BOUNDED | Focused counts and bounded traversal. Not an uncontrolled project graph. |
| Discipline and project readiness | IMPLEMENTED, VALIDATED | Readiness is not discipline design approval. |
| Criticality and due dates | IMPLEMENTED, VALIDATED | AI cannot assign critical criticality. |
| Exceptions and disputes | IMPLEMENTED, VALIDATED, BOUNDED | A condition, a rejection rationale, and a linked query or decision id. |
| Baseline and stage gates | IMPLEMENTED, VALIDATED | The baseline stores immutable revisions. Gates do not approve the stage. |
| Project controls events | IMPLEMENTED, VALIDATED, BOUNDED | Application events only. Not a Primavera replacement. |
| TQ and decision links | IMPLEMENTED, VALIDATED | Existing workflow ids only. |
| Eight-discipline handoffs | IMPLEMENTED, VALIDATED | Synthetic P-101 chain. |
| AI interface context | IMPLEMENTED, VALIDATED | No acceptance, value change, or automatic recalculation. |
| RLS and audit | IMPLEMENTED, VALIDATED | Workspace membership on the new tables. |
| Autonomous change impact | FUTURE_PHASE | EOS 2.12. |
| Automatic engineering recalculation | NOT_IMPLEMENTED | Human review decides whether a result must change. |
| External interface-system sync | BOUNDED | Adapter operations are the in-module functions. No live external system is required. |
| Construction management | NOT_IMPLEMENTED | Construction readiness is a later use of these handoffs. |

Acceptance of an interface is not engineering approval, design approval, project certification, or regulatory approval.
