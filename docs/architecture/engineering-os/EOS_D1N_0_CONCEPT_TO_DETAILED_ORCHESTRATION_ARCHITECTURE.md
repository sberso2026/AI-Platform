# EOS-D1N-0 Concept-to-Detailed Orchestration Architecture

## Purpose

D1N owns Structural concept-to-detailed orchestration. It records orchestration state, progression context, prerequisite assessments, stage-transition requests, manifests, and workflow history. It does not own engineering truth. This phase writes that architecture and its implementation sequence. It does not start runtime.

The parent decisions are docs/architecture/engineering-os/EOS_D1N_FOUNDATIONAL_ARCHITECTURE_DECISIONS.md. Those decisions stay in force. This document formalizes them.

## Architectural position

Lifecycle Intelligence owns lifecycle-stage assignment. The stages CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, and DETAILED_DESIGN are the design span of that existing vocabulary. CONSTRUCTION, COMMISSIONING, OPERATIONS, and MODIFICATION stay outside D1N. D1N cites the assigned stage. It does not create a second stage enum and it does not assign the stage.

Engineering maturity remains evidence, completeness, and readiness. A stage pin is not that judgment. Gate readiness remains a machine evaluation. A gate decision remains a human decision. Structural object states such as validated and approved stay on the structural object lifecycle. Certification stays with D1L.

## Maturity states

No state uses a percentage-complete score.

CONCEPT is the earliest governed Structural progression context. It requires identity, project scope, a requirements context that is declared or explicitly not applicable, and an assumptions context that is declared or explicitly not material. Preliminary system concepts and unresolved decisions may be recorded as gaps or open items. Detailed calculations, a selected system, interface closure, and model evidence are not required. CONCEPT does not mean a concept has been accepted. Acceptance is a human gate.

PREFEASIBILITY cites comparative concept evidence, major assumptions, major system options, major constraints, and the gaps among them. Comparison uses existing option or decision references. Prefeasibility does not mean the engineering has been shown to be viable. Outstanding assumptions may remain.

FEASIBILITY cites a selected Structural direction through a governed decision reference, with interface context declared or explicitly not applicable. Analysis evidence is cited when it already exists and is otherwise an evidence gap. Feasibility is not engineering validation.

FEED cites design criteria, a system selection, interface evidence through D1K where an interface is in scope, and a current D1M handoff where model evidence is in scope. Review gates and currentness are part of the package. FEED is not final detailed design and not an issued-for-construction release. A FEED context may still be incomplete.

DETAILED_DESIGN is the highest D1N progression context. The FEED context must be current, and each in-scope evidence item is either a reference to an existing capability or an explicit condition held by a human gate. Detailed design does not mean every calculation is validated, every result is approved, the design is certified, the drawings are issued for construction, or the product is generally available.

## Transitions

The ordinary forward pairs are concept to prefeasibility, prefeasibility to feasibility, feasibility to FEED, and FEED to detailed design. A project need not invent a visit to a stage that its assigned lifecycle profile omits. D1N does not author a skip. A requested pair must be a pair the assigned lifecycle profile already allows. Back-transition remains lifecycle history, not a D1N rewrite.

Each transition has a prerequisite assessment, an evidence set of references, a gap list for what is missing, a rejection of stale inputs when the request is for a current transition, a human gate, an external authority for the decision, a transition request owned by D1N, a transition decision owned by the lifecycle gate, and an append-only history. The request and the decision are fingerprinted separately. The request fingerprint does not include the later decision.

A stage-transition request is not stage approval.

## Ownership

D1N owns orchestration state, the workflow progression record, the prerequisite assessment, the stage-transition request, the orchestration manifest, and workflow history.

D1N orchestrates requirements-gap follow-up, assumption-review requests, interface-evidence requests, citation of engineering evidence, inclusion of a current D1M handoff, and review-package requests. Coordinating a request does not resolve it.

D1N consumes D1A identity, requirements, assumptions, structural systems, D1K interface evidence, change and currentness, D1M evidence, and lifecycle-stage context. These records keep their existing identities.

External authorities remain decisions, human review, engineering validation, solver execution, conformance, concrete and material semantics, D1K interface governance, D1L certification governance, and the lifecycle gate decision.

Out of scope are D9 multidisciplinary reasoning, D2 through D8 discipline engineering, construction through modification, structural calculation authorship, certification issuance, and CAD or BIM interpretation.

## Inputs

Identity and context are required: one tenant, one workspace, one project, and a scope. A missing scope is a gap. Identity is not invented.

A standards-profile reference is optional until a standards-sensitive request, including progression toward FEED or detailed design, cites one. The reference is the existing profile. It is not a certification and not a claim that the profile makes the work eligible.

Requirements and assumptions are required as context: declared, or explicitly none applicable or none material. Decisions are optional at concept and required as a citation once a selected direction is claimed. Systems are optional while concepts remain open and required as a citation once a system selection is in scope. Interfaces are optional when none are applicable and otherwise a D1K evidence citation. Engineering-evidence references are optional at concept and prefeasibility and are citations or explicit gaps afterward. A D1M handoff is optional until model evidence is in scope, and then it must be a current R8 handoff. Currentness is required for a current transition. Human gate state is required as a consumed state and may be not-yet-evaluated.

Every authoritative reference is identified, provenance-bearing, fingerprinted, and scoped. Missing required input becomes a gap. Stale input cannot support a current transition.

## Outputs

An orchestration-state record and a design-progression context pin are orchestration state. A prerequisite assessment, an evidence-gap list, and workflow history are information. A next-action request is a recommendation. An engineering-review request, a human-decision request, a stage-transition request, and a downstream handoff package are requests. An orchestration manifest binds the cited inputs. An alternative-branch reference points at a branch record.

None of these outputs is an engineering approval, an engineering validation, or a certification.

## Prerequisites

Lifecycle vocabulary, gate-decision vocabulary, fingerprints, provenance, and tenant, workspace, and project scope are available. Requirements, assumptions, and decisions registers are available. The D1M handoff, D1K interface records, D1L certification governance, and option or decision alternatives are available with limitations. Engineering validation, a certified solver, C10 engineer review, D1F human review, D1K intelligence, and D1N orchestration runtime are not available. A human gate decision and a certification decision require external authority. D9 and D2 through D8 are future dependencies. Available with limitations is not treated as available.

## Human gates and authority

Concept acceptance, design-criteria acceptance, major system selection, assumption acceptance, progression advancement, detailed-design release, and exceptions or deviations require human authority. The orchestration actor may record state and requests. Evidence authority stays with the source track. Requirements, assumptions, and decisions keep their existing authorities. The reviewer and the approver are human. Lifecycle gate authority issues the transition decision. D1K remains interface authority. D1L remains certification authority. An administrator is not an engineer, an approver, a certifier, an assumption acceptor, or an alternative selector. Existing human-review mechanisms may be cited. C10 and D1F human review remain incomplete, so a citation is not a claim that review is finished.

## AI and alternatives

AI may recommend a next action, point at a missing prerequisite, summarize cited evidence, identify a stale dependency, compare cited alternatives, prepare a review package, and explain a progression gap. AI may not invent evidence, approve an assumption, approve engineering, validate engineering, authorize a stage transition, select a design alternative, certify, override stale evidence, or rewrite history.

A branch has its own identity, a parent orchestration context, evidence references, branch-specific assumption citations, decision citations, and currentness. Record states are open, decision cited, and retained historical. Selected or rejected is the cited decision, not a D1N ranking. Rejected and unselected branches remain reconstructable. There is no alternative-ranking runtime. D1N cannot approve an alternative on its own.

## Currentness, provenance, and history

A changed upstream dependency marks the affected orchestration state as requiring reevaluation. The prior stage pin is not silently kept as proof that the work is still current. Currentness is read from the existing lifecycle and D1M mechanisms. No second currentness engine and no second lifecycle engine are created.

D1N identities exist only for an orchestration context, a manifest, a progression record, a stage-transition request, and an alternative-branch reference. Project, asset, system, evidence, and model identity are reused. Fingerprints reuse the canonical fingerprint. No second algorithm is defined. History is append-only. A later reader can reconstruct the stage context, evidence set, requirements, assumptions, decisions, currentness, prerequisite assessment, requested transition, human decision citation, and branch state. Historical records are not mutated to simplify the present.

## Neighbours

D1M stays closed. The R8 handoff is the only model entry. D1N does not parse, reinterpret, reopen, bypass currentness, or invent model evidence.

D1K owns interface governance. D1N may request interface evidence and may cite what D1K has recorded. Internal integration and cross-discipline intelligence stay not ready. D1N is not that intelligence.

D1L owns eligibility and certification decisions. D1N may later request an evidence package under D1L rules. It does not determine eligibility, issue or revoke certification, bypass a claim dependency, or edit D1L history. D1L remains complete with limitations.

D9 may later cite a Structural orchestration state. That citation is not a D9 runtime and not a substitute for multidisciplinary intelligence. D9 runtime remains zero. D2 through D8 are not orchestrated as if their runtimes existed. Their runtime count remains zero.

The digital thread stays the existing one: D1A identity, requirements, assumptions, decisions, systems and interfaces, engineering evidence, a current D1M handoff where applicable, currentness, D1N orchestration state, the prerequisite assessment, the human gate, the progression request, and workflow history.

## Debt and security

C10, D1F, D1G, D1H, D1I, D1J, D1K, and D1L limitations do not block this architecture. They remain limitations. D1N may orchestrate citations and requests. It may not declare concrete review complete, the D1F orchestrator human-reviewed, a solver live-validated or certified, inspection or twin evidence engineer-validated, optimization conformant, D1K intelligent, or a certification eligible. Concrete parameter semantics stay unavailable. General-availability security debt still blocks general availability. The structural pack stays incomplete.

Records are tenant, workspace, and project scoped. Least privilege, authority separation, provenance, auditability, immutable history, currentness integrity, and human oversight apply. Spoofed authority, a cross-scope reference, and a fingerprint mismatch are conflicts, not prompts to trust the label. AI involvement stays visible. Privileged authentication rules are not weakened, and this architecture adds no authentication runtime. Standards context stays configurable. Privacy by design, residency and transfer controls, and cybersecurity foundations are requirements on later runtime. This architecture does not claim GDPR compliance, EU AI Act compliance, NIS2 compliance, or legal certification.

## Readiness and decomposition

Architecture is defined and ready. Orchestration runtime, stage-transition runtime, prerequisite runtime, and alternative-branch runtime are zero. No database schema changes. No dependency is added.

The sequence is identity and state, then design-progression context, then prerequisite assessment and evidence gaps, then stage-transition request governance, then human decision and review-gate integration, then alternative-branch governance, then currentness and reassessment, then D1M, D1K, and D1L handoff integration, then closeout. The identifiers are EOS-D1N-R1-ORCHESTRATION-IDENTITY-AND-STATE-FOUNDATION, EOS-D1N-R2-DESIGN-PROGRESSION-CONTEXT, EOS-D1N-R3-PREREQUISITE-ASSESSMENT-AND-EVIDENCE-GAPS, EOS-D1N-R4-STAGE-TRANSITION-REQUEST-GOVERNANCE, EOS-D1N-R5-HUMAN-DECISION-AND-REVIEW-GATE-INTEGRATION, EOS-D1N-R6-ALTERNATIVE-DESIGN-BRANCH-GOVERNANCE, EOS-D1N-R7-CURRENTNESS-STALENESS-AND-REASSESSMENT, EOS-D1N-R8-D1M-D1K-D1L-HANDOFF-INTEGRATION, and EOS-D1N-R9-CONCEPT-TO-DETAILED-ORCHESTRATION-CLOSEOUT.

R1 may record one orchestration context and cannot assess prerequisites or request a transition. R2 may pin a progression context and cannot treat the pin as validation. R3 may record gaps and cannot invent the missing evidence. R4 may record a transition request and cannot approve it. R5 may cite a human gate and cannot complete the open review debt. R6 may record a branch reference and cannot select the design. R7 may mark reassessment required and cannot restore currentness by itself. R8 may cite D1M, D1K, and D1L and cannot absorb them. R9 may close the bounded track and cannot complete the structural pack.

## Next phase

The next phase is EOS-D1N-R1-ORCHESTRATION-IDENTITY-AND-STATE-FOUNDATION. It records one governed orchestration context and does not perform an engineering action. This architecture does not start it.
