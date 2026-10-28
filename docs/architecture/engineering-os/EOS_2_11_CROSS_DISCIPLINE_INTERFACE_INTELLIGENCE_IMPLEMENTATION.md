# EOS 2.11 cross-discipline interface intelligence implementation

Phase: `EOS-2.11-CROSS-DISCIPLINE-INTERFACE-INTELLIGENCE`

Status: common handoff governance is implemented for Process, Mechanical, Piping, Structural, Civil, Geotechnical, Electrical, and Instrumentation and Control. EOS 2.12 autonomous change-impact reasoning is not started. No engineering formula, calculation engine, or qualified D1 result was changed.

## Canonical model

`packages/engineering-os/src/interface-intelligence` is the handoff runtime. It composes the EOS 2.1 lifecycle and baseline functions. It does not replace the existing `engineering_interfaces` table from EOS-A3 and it does not call or rewrite D1K interface writers. `canonicalInterfaceReplaced` and `d1kReplaced` stay false.

An interface revision records source discipline, receiving disciplines, source object, parameter, value, unit, coordinate system, axis convention, datum, transformation reference, revision, lifecycle stage, maturity, criticality, due date, provenance, and audit. A package keeps the individual interface ids. A dependency edge uses a controlled relation. Downstream inputs, models, calculations, and deliverables can be linked and marked `potentially_stale`.

## State machine and revision

Source path: `draft` to `ready_for_issue` to `issued`, or `cancelled`. Receipt, review, acceptance, conditional acceptance, and rejection are receiver decisions and cannot be skipped from the source path. A superseded revision cannot become current again.

A material change creates a new revision, keeps the previous value, clears receiver acceptance, and marks linked downstream records potentially stale. The previous revision is not mutated. Nothing is recalculated, and no structural conclusion is written.

## Ownership and acceptance

Only the source discipline can create or issue the handoff. Only the receiving discipline, recorded as the acting role, can receive, review, accept, accept with conditions, or reject. The same person may act under more than one role. The audit stores the role used for the action. AI cannot accept, reject, assign critical criticality, or change a source value. Acceptance is the receiver's current basis for downstream work. It is not engineering review, design approval, project certification, or regulatory approval.

## Units, coordinates, and conflicts

Unit comparison uses a fixed factor table for force, pressure, mass, length, and power. `1600 kPa` and `1.6 MPa` compare as compatible equivalents. `kPa` and `kN` are a unit mismatch. The stored value is not converted in place. Coordinate and axis checks report a missing system, a missing datum, a frame mismatch, or an axis mismatch unless a governed transformation id is already recorded. The runtime does not transform coordinates.

A shared parameter with different normalized values is a value-conflict candidate. The runtime does not decide which discipline is wrong.

## Graph, diagnostics, and gates

Traversal is bounded at depth 8. A new edge that would close a path back to its source is refused. Diagnostics include missing source, missing receiver, missing unit, unit mismatch, coordinate and axis problems, overdue, unaccepted, rejected, conditional acceptance, assumption, stale downstream, baseline mismatch, duplicate, orphan, and circular dependency. Severity remains a review input. FEED and Detailed Engineering gates report blockers. They do not approve the stage.

A baseline stores the interface id, revision, and acceptance state. A later revision does not rewrite that snapshot and sets an impact-review requirement. Full impact reasoning remains EOS 2.12.

## Project controls, TQ, and AI

Interface create, issue, receive, accept, reject, supersede, and overdue actions are audit and event records. Technical Query and Engineering Decision integration stores the existing record id. It does not create a second query workflow.

AI context may describe facts, interface values, conflicts, stale dependencies, assumptions, and the human decision that is required. It cannot accept an interface, change a source value, or conclude that a foundation is inadequate.

## Migration and UI

`supabase/migrations/20261029060000_eos_2_11_interface_intelligence.sql` uses a 14-digit timestamp with hour `06`. It sorts after `20261029040000`. It adds workspace-scoped handoff, receiver, package, dependency, dependent, baseline revision, event, and audit tables. Row level security uses tenant membership and workspace membership. Inserts also require engineering execute. There is no delete policy and no change to `engineering_interfaces`.

`/engineering/interface-intelligence` shows the unclassified handoff summary, discipline counts, matrix, diagnostics, and advisory. The existing `/engineering/interfaces` register remains the A3 register. Discipline delivery pages are not replaced. Instrumentation links to the new summary.

## Demonstration

Domain tests use synthetic project `EOS Cross-Discipline Interface Intelligence Demo` and asset chain `Synthetic Feed Pump System P-101`. They cover the eight disciplines, a mass revision from 12000 kg to 14000 kg, unit equivalence, unit mismatch, coordinate mismatch, superseded nozzle use, rejection with a technical-query id, conditional acceptance that blocks detailed engineering, an overdue critical interface, and an immutable FEED baseline. Production migration and deployment stay deferred.
