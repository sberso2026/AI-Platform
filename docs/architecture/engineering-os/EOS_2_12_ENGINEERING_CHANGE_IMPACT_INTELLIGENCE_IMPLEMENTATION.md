# EOS 2.12 engineering change impact intelligence implementation

Phase: `EOS-2.12-ENGINEERING-CHANGE-IMPACT-INTELLIGENCE`

Status: deterministic candidate-impact discovery and governed human assessment are implemented across Process, Mechanical, Piping, Structural, Civil, Geotechnical, Electrical, and Instrumentation and Control. EOS 2.13 design-freeze and deliverable governance is not started. No engineering formula, calculation engine, or qualified D1 result was changed.

## Change and impact

A change records that an authoritative value moved from one revision to another. An impact is a separate candidate that another object may need engineering action. Discovery creates candidates with materiality `UNASSESSED`. It does not classify every downstream object as materially impacted.

`packages/engineering-os/src/change-impact` is the assessment runtime. `engineering_changes` remains the EOS-A4 change. `engineering_impacts` remains the EOS-A4 impact. `engineering_impact_assessments` remains the EOS-A11E assessment. `a4Replaced` and `d1kReplaced` stay false. The optional `canonical_change_id` can point at an existing change. This module does not replace those records.

## State, materiality, and authority

The change path runs from draft through screening, assessment, approval for implementation, implementation, verification, and closure. Implementation does not mean verified. Verification does not mean project or regulatory certification. Owner, admin, and AI cannot approve, verify, or close a change. AI cannot finalize materiality or assign critical severity. The affected discipline records materiality and confirms a proposed action. The audit stores the acting role.

Materiality can be no material impact, information only, potential, material, or still requiring review. A closure is refused while an unassessed candidate or an unconfirmed material action remains, unless an explicit exception is recorded.

## Discovery

Traversal follows explicit dependency edges only. Depth is clamped at 8. A repeated node stops the walk. Direct and indirect candidates keep the path from the changed object. Confidence for an explicit edge is `CONFIRMED_DEPENDENCY`. Similar names do not create edges.

A material field such as operating mass, design pressure, design temperature, groundwater, a trip requirement, motor power, a nozzle, a support reaction, a finished level, or a ground-model boundary is classified by rule. A description change is editorial. A reviewer-name change is administrative. Unknown fields stay unknown. The rule table can be replaced by the caller.

## What is not done automatically

Confirming `RECALCULATE`, `REMODEL`, or a deliverable revision records the required action. It does not run a calculation, change a stored result, revise a deliverable, or rewrite a frozen baseline. A baseline snapshot stays on the revision it captured. A later value produces `BASELINE_REVALIDATION_REQUIRED` for a material change. A verified requirement whose governing input changed becomes `reverification_required`, and its evidence id is kept.

## Linked work

Technical Query, Engineering Decision, and Action integration stores the existing record id. Procurement, construction, and commissioning objects appear only when an explicit edge reaches them. Project-control events are the assessment audit events. They are not a schedule or cost forecast.

## AI

The advisory states fact, the stored change, deterministic paths, and that materiality needs a human decision. It does not approve the change or declare a foundation unsafe. AI inference is not treated as dependency proof.

## Migration and UI

`supabase/migrations/20261029080000_eos_2_12_change_impact_intelligence.sql` uses hour `08` and sorts after `20261029060000`. It adds workspace-scoped assessment, candidate, action, event, and audit tables. Row level security uses tenant and workspace membership. Inserts also require engineering execute. There is no delete policy.

`/engineering/change-impact` shows the unclassified readiness counts and discipline summaries. Interface intelligence links to it. Discipline delivery pages are not replaced.

## Demonstration

Domain tests use `EOS Engineering Change Impact Intelligence Demo` and synthetic system `P-101`. They cover the mass, temperature, piping reaction, groundwater, motor power, trip, civil level, and nozzle changes, plus a no-material disposition, a material recalculation request, two open impacts on one model, an immutable FEED baseline, and requirement reverification. Production migration and deployment stay deferred.
