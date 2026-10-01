# EOS-A11A Engineering Work Generator

Purpose: prepare the engineer’s desk so governed engineering work can start without manually reconstructing project context. Engineering OS moves from an information/governance platform toward an engineering work-execution platform. A11A is the governed work-preparation layer. It is not another dashboard, chatbot, task register, project-management system, or WBS/work-package system.

## Terminology boundary

`EngineeringWorkTemplate` is a versioned governed definition of how a class of engineering work is prepared.

`EngineeringWorkPlan` is a project-specific generated context and action plan for performing an engineering task. It stores references only. It is not a WBS package, construction work package, Review Package, Deliverable, workflow engine, schedule activity, or human task register.

Kernel WorkflowService, JobService, and the Event Bus are reused. A11A does not duplicate them.

## Work types

A small catalog is code-governed: CONCEPT_STUDY, OPTION_STUDY, PRELIMINARY_SIZING, DESIGN_CALCULATION, ENGINEERING_ANALYSIS, DESIGN_REPORT, SPECIFICATION, DESIGN_REVIEW, CHANGE_ASSESSMENT, RFI_TQ_RESPONSE, COMMISSIONING_ENGINEERING, HANDOVER_PREPARATION.

Templates map to A10C information work types where needed (FOUNDATION_CALCULATION, CROSS_DISCIPLINE_INTERFACE, CONSTRUCTION_CLARIFICATION, SUBSYSTEM_HANDOVER). Templates are versioned (`v1`). Historical plans keep `templateCode@templateVersion` provenance and are not silently reinterpreted after a catalog update. A live admin editor is not required for A11A; template mutation remains AAL2-protected settings.write if an editor is added later.

## Project, discipline, and lifecycle context

Project context is reused from A9. The engineer does not type a raw project ID. Ambiguous project choice is resolved by selecting from authorized EOS projects. Discipline/system/asset are inferred from selected engineering objects when deterministic; otherwise the engineer is asked. Lifecycle comes from A9 Lifecycle Intelligence and the selected template. Mixed lifecycle state remains supported.

## Work readiness and authoritative inputs

A11A reuses A10C `getRequiredInformationForWork(...)` and `resolveWorkReadiness(...)`. It does not implement another readiness engine.

A11A reuses A10A authority/freshness. Each applicable input exposes type, source, authority purpose, revision/version where supplied, freshness, and provenance. AUTHORITATIVE_FOR_PURPOSE is not engineering approval and is not a claim of technical correctness.

## Requirements, Assumptions, Interfaces, Decisions, Analysis, Deliverables

The Work Plan references canonical records. It does not copy them.

- Requirements include why they are applicable.
- Assumptions are existing governed assumptions. Missing information may be carried by a documented assumption only where the template policy is ALLOW_WITH_ASSUMPTIONS. EOS does not invent assumptions. Missing blocking information cannot be bypassed merely by clicking Start.
- Interfaces remain Interface-owned. The plan shows provider/consumer and information state.
- Decisions are shown as governed relations. Previous decisions are not inferred to remain technically valid.
- Analysis context prepares a future Analysis Request. A7C real solver execution remains DEFERRED_EXTERNAL_DEPENDENCY.
- Deliverable Expectations are referenced. Generating a plan does not change maturity.

## Digital Thread

Reuse the existing Digital Thread. Typical composition: Requirement → Information → Interface → Analysis → Decision → Deliverable. Work Plan relations use existing USES / DEPENDS_ON semantics (`engineering_work_plan` as a root). No separate work graph or new graph store.

## Generator

`generateEngineeringWorkPlan(...)` is deterministic. It consumes authorized project, work type, selected context, optional discipline/system/asset, A10C readiness, and a context snapshot. It returns the plan, readiness, gaps, referenced objects, expected outputs, action contracts, provenance, input fingerprint, and explanations.

No engineering conclusion is generated merely by creating the plan. Option studies do not select a winner.

## Explainability

The plan answers: why information/requirements/interfaces are included; why work is BLOCKED or READY WITH CONDITIONS; which template/version generated it. AI may summarize, explain gaps, suggest candidate next actions, and draft non-authoritative narrative. AI may not select governing information, invent requirements or inputs, approve work, choose technical design, pick an option-study winner, or override deterministic readiness.

## Fingerprint and staleness

A SHA-256 fingerprint is computed from governed identities/versions/context, not secret file contents. After generation, changed governing input makes the Work Plan CURRENT, POTENTIALLY_STALE, STALE, or REGENERATE_REQUIRED. This is Work Plan context staleness, not a declaration that completed engineering is invalid.

Refresh Engineering Context / Regenerate Work Plan creates a new plan with `supersedesPlanId`. Historical provenance is retained. The refresh result shows new/superseded information, new requirements, changed interfaces, new decisions, and changed readiness.

## Expected outputs and action contracts

Templates define expected output types (calculation workbook, analysis request, design report, specification, drawing input, option study, review package, RFI/TQ response, handover package). A11A does not generate XLSX, DOCX, PPTX, PDF, or CAD. That is EOS-A11B.

Actions include Open Governing Source, Request Missing Information, Create/Link Assumption, Prepare Calculation/Analysis/Report/Specification/Option Study, Create Review, Assess Change, Prepare RFI/TQ Response, Prepare Handover, Start Engineering Work, Refresh Engineering Context. Future artifact actions are AVAILABLE_CONTRACT or DEFERRED_IMPLEMENTATION, not executed.

## Start Work and Continue Work

READY allows start. READY_WITH_CONDITIONS shows conditions and requires acknowledgment where the template policy says so. BLOCKED cannot fake a successful start. Corrective actions remain: request missing information, review stale information, resolve unaccepted information, or create a governed assumption where permitted.

Minimal plan status: DRAFT, READY, IN_PROGRESS, BLOCKED, COMPLETED, CANCELLED, SUPERSEDED. A12B owns broader human work coordination.

Continue Work resumes an existing plan: work type, project, system/asset, readiness, latest context, expected outputs, and current actions.

## Lifecycle workflows

Certified preparation workflows: Concept study, Option study, multidisciplined Feasibility, FEED structural engineering, Detailed Design foundation calculation, Construction RFI/TQ response, Commissioning engineering query, Handover preparation. None of these generate engineering design or Office artifacts in A11A.

## UI

`/engineering/work` is the start-work surface. Primary actions are Start Engineering Work and Continue Work. The A10B engineering-state day summary remains visible and is not an employee productivity score. Plan detail lives at `/engineering/work/plans/[id]`.

## Managed Repository privacy

A10B is preserved. DEFAULT_CAPTURE_POLICY = DENY. Personal/unmanaged local files remain OUTSIDE EOS and cannot silently enter a Work Plan.

## Work events and assurance

A10B `EngineeringWorkEvent` is reused: ENGINEERING_WORK_PLAN_CREATED, ENGINEERING_WORK_STARTED, ENGINEERING_WORK_BLOCKED, ENGINEERING_WORK_CONTEXT_REFRESHED, ENGINEERING_WORK_COMPLETED. These are material engineering workflow events, not desktop activity. No new Event Bus.

Candidate assurance conditions: WORK_PLAN_REQUIRED_INFORMATION_MISSING, WORK_PLAN_GOVERNING_INFORMATION_STALE, WORK_PLAN_CONTEXT_CHANGED. No automatic Finding, Issue, Defect, or technical rejection.

Audit covers governed mutations. Time-at-desk scoring, work-rate scoring, engineer rankings, and keystroke/activity inference are prohibited.

## Security / RLS / AAL2

Live RLS: authorized engineer creates/reads own workspace plans; same-tenant other-workspace deny; cross-tenant deny; anonymous deny. Admin-only delete. Normal Work Plan creation uses existing work API AAL2 policy. No new MFA code. A9 identity assurance is not reopened.

## A11B handoff

A11A prepares what should be generated, which template/context applies, which inputs should be used, and which actions are available. A11B generates governed editable Excel calculations, Word reports/specifications, and presentation artifacts from Work Plan context while preserving formulas, provenance, source references, user editability, managed-repository privacy, and human engineering review.

## Limitations

- No actual XLSX/DOCX/PPTX/PDF/CAD generation
- No real AutoCAD, Office add-in, SharePoint, Teams, Outlook, or Aconex connectors
- No real solver execution (A7C remains DEFERRED_EXTERNAL_DEPENDENCY)
- Templates are a code catalog, not a live admin editor
- No employee productivity monitoring
- READY_FOR_CONTROLLED_PILOT remains NO
- READY_FOR_PRODUCTION remains NO
