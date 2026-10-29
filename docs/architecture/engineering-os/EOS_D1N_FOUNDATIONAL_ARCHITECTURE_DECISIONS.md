# D1N Foundational Architecture Decisions

## Decision

D1M remains closed with limitations. D1N remains not absorbed, and this decision does not start it. The missing decisions were the design progression, what D1N owns, what it may take in, and what it may emit. Those decisions are recorded here. The architecture that turns them into an implementation decomposition is the next phase, and this document does not write that decomposition.

## Design progression

Engineering OS already names the engineering lifecycle as CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, DETAILED_DESIGN, CONSTRUCTION, COMMISSIONING, OPERATIONS, and MODIFICATION. Lifecycle stage is engineering context. It is not schedule, not engineering maturity, not a configuration baseline, and not approval. Engineering maturity remains the separate question of evidence, completeness, and readiness. A FEED context may still be incomplete.

D1N uses the design span of that existing vocabulary and no other stage names. The progression is CONCEPT, then PREFEASIBILITY, then FEASIBILITY, then FEED, then DETAILED_DESIGN. CONSTRUCTION, COMMISSIONING, OPERATIONS, and MODIFICATION stay lifecycle stages and are outside D1N. D1N does not create a parallel maturity enum and does not own lifecycle-stage assignment. Lifecycle Intelligence remains the owner of stage assignment. D1N cites the current stage context.

A progression stage is not engineering validation, not engineering approval, and not certification. Structural object states such as validated and approved stay on the structural object lifecycle. Traceability maturity and deliverable maturity stay on their own models. Gate readiness stays a machine evaluation. Gate decision stays a human decision.

## What each stage requires

CONCEPT may be cited when requirements context is declared or explicitly not applicable, and assumptions are declared or explicitly not material. Validation is not an entry condition. Open assumptions may remain.

PREFEASIBILITY may be cited when the concept context is current. Alternatives are cited from an existing option study or decision. They are not invented by orchestration. Assumption review may still be partial.

FEASIBILITY may be cited when a preferred concept is cited by a governed decision. Interface context is declared or explicitly not applicable. Missing analysis evidence is an evidence gap. It is not filled in by the orchestration record.

FEED may be cited when design criteria and the structural system selection are cited, interface evidence is cited through D1K where an interface is in scope, and model evidence is cited only through a current D1M handoff where model evidence is in scope. FEED does not mean the engineering is complete.

DETAILED_DESIGN may be cited when the FEED context is current and each required evidence item for that scope is either a reference to an existing capability or an explicit outstanding condition accepted by a human gate. Detailed design context is not an issued-for-construction drawing and not a certification.

## Transitions

D1N records a stage-transition request. It does not issue the gate decision. The decision remains a Lifecycle Intelligence human decision: approved to transition, approved with conditions, not approved, deferred, or waived. AI cannot approve a transition, waive a criterion, or advance a stage. An administrator cannot supply that engineering authority.

A current transition request consumes current evidence. Stale D1M evidence cannot be presented as current input. A changed dependency marks the affected orchestration state as requiring reevaluation. The previous stage context is not silently retained as proof that the engineering is still current. Historical records stay reconstructable. No second currentness engine and no second lifecycle engine are created.

Permitted outstanding limitations include open assumptions, unsatisfied validation, incomplete human review, open interfaces, and the recorded D1K and D1L limitations. Those limitations may travel with the orchestration record. They do not become a validation, an approval, or a certification because the stage context moved.

## Ownership

D1N owns orchestration state, the workflow progression record, the prerequisite assessment, the stage-transition request, the orchestration manifest, and workflow history.

D1N orchestrates follow-up only. It may request a requirements gap to be closed, request assumption review, request interface evidence, cite engineering evidence another capability already produced, include a current D1M handoff in the package, and request a review package. Orchestrating a request does not produce the engineering result.

D1N consumes D1A identity, requirements, assumptions, structural system definitions, D1K interface evidence, change and currentness, D1M evidence, and lifecycle stage context.

External authorities remain the decision register, human review, engineering validation, solver execution, conformance, concrete and material semantics, D1K interface governance, D1L certification governance, and the lifecycle gate decision.

Out of scope are D9 multidisciplinary and global reasoning, D2 through D8 discipline engineering, construction through modification, authorship of structural calculations, certification issuance, and CAD or BIM interpretation.

## Neighbouring tracks

D1M is a consumed and orchestrated input. The existing R8 handoff is the only D1M entry. D1N does not parse CAD or BIM, does not interpret a model, and does not reopen D1M.

D1K owns interface governance. D1N consumes governed interface evidence. Internal discipline integration and cross-discipline intelligence remain not ready. D1N does not promote them and does not become cross-discipline intelligence.

D1L owns certification eligibility and certification decisions. D1N may request preparation of an evidence package under D1L rules. Orchestration is not certification. D1L remains complete with limitations, and eligibility remains unsatisfied.

D9 may later cite a Structural orchestration state. That citation is not authorized now. D9 runtime remains zero. D2 through D8 remain unstarted. D1N can be specified for Structural work before those disciplines exist.

## Inputs and outputs

Authoritative inputs are references. Each reference is identified, current where the transition is current, fingerprinted, provenance-bearing, scoped to one tenant, workspace, and project, and attributed to an authority. The categories are identity and context, a standards-profile reference, requirements, assumptions, decisions, systems, interfaces, engineering-evidence references, the current D1M handoff, currentness, and human gate state. A missing required input becomes an evidence gap. It is not invented.

Outputs are an orchestration-state record, a design-progression context pin, a prerequisite assessment, an evidence-gap list, a next-action request, an engineering-review request, a human-decision request, a stage-transition request, an orchestration manifest, workflow history, an alternative-branch reference, and a downstream handoff package. None of these is an approved calculation, a validated engineering value, a solver result, a final design, an issued drawing, a conformance determination, or a certification.

## Alternatives, authority, and debt

One concept may cite more than one alternative. Each alternative stays separately traceable through an existing option or decision record. Selection requires decision authority. A rejected alternative remains reconstructable. This decision does not add branching runtime.

The orchestration actor may record state and requests. The reviewer and the approver remain human. Certification authority remains D1L. Interface authority remains D1K. Source and evidence authority for a model remains D1M. AI may later suggest sequence, point at gaps, summarize evidence, compare cited alternatives, recommend a next action, and prepare a review package. AI may not approve a transition, fabricate evidence, declare engineering validated, certify, override stale evidence, or override a human gate. An administrator has the same prohibition.

Concrete C10 review, D1F human review, D1G live validation, engineer validation, conformance, and certified-solver status, D1H engineer validation, D1I engineer and conformance validation, D1J engineer and conformance validation, D1J concrete parameter semantics, D1K integration and intelligence, and D1L eligibility remain open. They do not block these decisions. They do block any claim that D1N has validated, reviewed, conformed, or certified the work it orchestrates. General-availability security debt still blocks general availability. The structural pack remains incomplete.

## Privacy, security, and jurisdiction

Orchestration records stay inside tenant, workspace, and project scope. Least privilege, human oversight, auditability, provenance, and immutable history stay in force. Standards context stays a configurable profile and is not hard-coded to one jurisdiction. Privacy by design, data-residency and transfer controls, transparent AI involvement, and cybersecurity foundations remain architectural requirements. This decision does not claim legal certification, GDPR compliance, EU AI Act compliance, or NIS2 compliance.

## Next phase

The next phase is EOS-D1N-0-CONCEPT-TO-DETAILED-ORCHESTRATION-ARCHITECTURE. Its type is concept-to-detailed orchestration architecture. It is authorized and not ready, because the implementation decomposition has not been written. It formalizes these decisions into that architecture. It does not start D1N runtime. The historical D1M closeout that left the next phase unnamed stays unchanged.
