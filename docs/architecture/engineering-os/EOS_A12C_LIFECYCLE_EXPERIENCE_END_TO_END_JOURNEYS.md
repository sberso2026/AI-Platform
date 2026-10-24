# EOS-A12C Lifecycle Experience Hardening & End-to-End Engineering Journeys

A12C answers: if engineering starts with a requirement, concept, assumption, or initial information today, can EOS preserve enough governed context so the same engineering story can be followed through design, construction, commissioning, and handover?

The canonical engineer route remains `/engineering/work`. A12C hardens and connects that surface. It does **not** create a parallel Workbench, a Lifecycle V2 domain, or a new source of engineering truth.

## Purpose

Lifecycle progression should **mature** engineering context, not restart it. A12C is UX/journey orchestration over:

- A9 Lifecycle Intelligence
- A10A–A10C information, work context, requirements, and handover
- A11A Work Generator
- A11B artifact automation and A12A template resolver
- A11C–A11E tool, review, and change/impact
- A12B My Engineering Day

Journey definitions are **code/configuration-level UX**. Canonical objects remain source-owned. Digital Thread remains relationships.

## Canonical lifecycle

A9 stages are reused:

CONCEPT → PREFEASIBILITY → FEASIBILITY → FEED → DETAILED_DESIGN → CONSTRUCTION → COMMISSIONING → OPERATIONS → MODIFICATION

**HANDOVER is not a tenth canonical stage.** Handover is an A10C experience, typically entered from commissioning context (`HANDOVER_PREPARATION` Work Plan).

Non-linear behaviour is preserved: backward transitions, mixed state, rework, overlap, and partial systems progressing differently. Process may be FEED while a structural package is Detailed Design and a construction package is Construction. The Workbench shows mixed scope when A9 assignments exist; it does not flatten them into one misleading project-wide state.

Lifecycle gates remain A9-controlled. Creating a next-stage Work Plan does **not** approve a gate or advance stage.

## Non-linear and mixed lifecycle

Default profile still allows FEED ↔ Detailed Design, Construction ↔ Detailed Design, Operations → Modification, and Modification back into design/construction/commissioning. Mixed `scopedStates` are returned on the Workbench payload. Engineers work through normal tasks; lifecycle context guides those tasks.

## Concept journey

Start Concept Study from the Workbench. Assemble governing information, record assumptions, identify missing information, define initial systems, create alternatives / Option Study, generate a Concept artifact through the A12A resolver, and record a human Decision. No final-design claim.

Concept assumptions that continue into Prefeasibility are marked **VALIDATE**, not copied as PFS facts.

## PFS journey

Continue into Prefeasibility work inherits Concept requirements, decisions, and information. Option refinement, constraint review, and a PFS artifact reuse A11A/A11B. Economic values are not invented.

## Feasibility journey

Continue into Feasibility work carries multidiscipline context: process/mechanical, structural, civil/geotechnical dependency, interfaces, requirements, analysis context, option/decision context, and deliverable expectation. Preliminary coordination information is **not** automatically marked suitable for FEED.

## FEED journey

FEED Work Plans reuse design basis, mechanical loads, geotechnical data, and interfaces when those objects already exist. Engineers can prepare calculation, analysis, Design Report, Specification, Pre-Issue Review, and vendor-change impact. Artifact generation uses the template resolver.

## Detailed Design journey

Continue into Detailed Design creates a **new** Work Plan for that stage. A previous FEED `DESIGN_CALCULATION` plan is not superseded merely because Detailed Design uses the same work type. Inherited context is referenced. Returned-artifact, Pre-Issue Review, 1250 kN → 1380 kN load change, and Work Plan refresh reuse A11C–A11E.

## Construction journey

Construction can open current applicable drawing/reference, calculation context, Decision history, specification, configuration/baseline, open Changes, and interfaces without recreating those records. Latest revision is not automatically construction-approved.

RFI/TQ or field clash: open RFI/TQ, see current context, assess impact, prepare response Work Plan, generate response artifact, run Pre-Issue Review, record human Decision. No automatic field approval.

## Commissioning journey

Commissioning uses current governed configuration, accepted changes, open conditions, vendor information, system identity, and test/commissioning information requirements. A test deviation becomes a query/change for human Decision. No automatic test acceptance.

## Handover experience

Reuse A10C. Open Handover Package: required / missing / stale / superseded information, acceptance state, final configuration, linked commissioning evidence. Completeness remains COMPLETE / PARTIAL / INCOMPLETE / STALE / CONFLICTED. No universal percentage complete. Human acceptance remains required.

A late approved engineering change after package assembly makes affected handover context **STALE** / refresh required. Digital Thread explains why (AFFECTS / DEPENDS_ON). Completeness is not silently retained.

## Operations / Modification continuity

A12C does not build Asset Management OS. Operations-reference context can compose design requirement, datasheet, vendor information, design Decision, drawing, commissioning evidence, operating limit, and modification history (example: Pump P-101).

Modification remains an A9 stage. Future modification can trace to original design basis, current configuration, previous Changes, Decisions, and operating information. This is not a full MOC platform.

## Digital Thread continuity

End-to-end relations remain source-owned:

Requirement → Concept → Option → Decision → Design Basis → Interface → Analysis → Calculation → Drawing → Review → Deliverable → Change → Construction RFI → Decision → Revised Configuration → Commissioning Evidence → Handover Package.

User-facing explanations reuse A8 `explainThreadObject`: why related, why affected, what changed, what evidence supports this, where the decision came from. Raw graph dumps are not the primary UI.

## Work Plan transitions

A next-stage Work Plan is generated by A11A `continueIntoNextLifecycle`:

- previous plan remains historical/current for its own stage
- new plan references `relatedObjectType=engineering_work_plan`
- snapshot inherits requirements, decisions, interfaces, analyses, information
- assumptions get CONTINUE / VALIDATE / RETIRE
- A9 gate is not advanced

Handoff summary is concise: Inherited Context, New Requirements, Open Assumptions, Unresolved Interfaces, Outstanding Information, Decisions, Required Engineering Work.

## Information and deliverable maturity

A10C readiness still governs use. Concept may proceed with documented assumption; Detailed Design may require accepted information. Deliverable maturity remains A9C dimensions: CONTENT, TRACEABILITY, COORDINATION, REVIEW, CONFIGURATION, SUPPORTING_EVIDENCE. Review expectations strengthen through lifecycle; Concept artifacts are not failed for missing Detailed Design evidence.

Change impact presentation adapts (concept/option, discipline/interface, analysis/calculation/drawing, field/configuration, test/handover). The engine remains A11E.

## Template governance through lifecycle

All generated artifacts reuse the A12A resolver:

PROJECT_CLIENT_APPROVED > COMPANY_OFFICIAL > EOS_DEFAULT.

Certified across Concept, FEED, Detailed Design, Construction response, and Handover artifacts. Historical provenance retains original template/version. Company-template binary upload remains **DEFERRED**. No new `content_base64` columns. Artifact binary storage risk remains **HIGH**.

SME tenants with no company templates use EOS Default professional templates. Enterprise fixtures may overlay Company Official and Project/Client-approved templates.

## My Engineering Day integration

A12B Attention is reused. Lifecycle transitions do not create FYI storms. Stage-appropriate tasks: Review assumption; Review vendor input; Run Pre-Issue Review; Prepare RFI response; Assess test deviation; Provide missing final information.

## Human gates

Human authority is retained for option selection, engineering approval, review disposition, impact confirmation, Change approval, RFI/TQ issue, field-change acceptance, commissioning acceptance, and handover acceptance.

AI may summarize lifecycle context, explain inherited assumptions, summarize changes, draft narrative, suggest questions, and identify information gaps from canonical facts. AI may not advance lifecycle, approve a gate, select an option, approve design, confirm impact, or accept commissioning/handover.

A9 append-only transition/audit is not bypassed.

## UX friction fixes

- Lifecycle-specific empty state: “No FEED Work Plan exists for this system.” → Start FEED Engineering Work
- Blocked work explains the exact missing/unaccepted input and offers Open Information / Request Update / Create Assumption where policy permits
- Continue into next lifecycle work from Workbench and Work Plan
- Back to Work / Continue Engineering Work on the plan page
- Mixed lifecycle labels in the project header
- Inherited Context panel
- Ask EOS lifecycle prompts
- Template resolution remains automatic and compact
- Project selector contrast from A12A/A12B is preserved
- Specialist modules remain behind an explicit escape, not the primary journey

## Browser HITL and AAL2

A12C requires a **fresh** staging Next process corresponding to A12C HEAD, then legitimate human AAL2. Password login may reach AAL1. Authenticator TOTP must be entered by the operator. Do not bypass MFA, copy cookies, inject TOTP secrets, or weaken `requireMfa`.

Authenticated HITL after AAL2: `/engineering/work`, My Engineering Day, authorized project, Work Plan, governing information, artifact generation, template, download, Pre-Issue Review, Impact, return to Workbench, Attention, no dead end.

Multi-project and lifecycle browser HITL (FEED vs Detailed Design vs Construction actions) must be completed in the same AAL2 session or reported honestly.

## Feature-freeze assessment

A12C is the last lifecycle-experience hardening phase before intended feature freeze:

- **CORE_ENGINEERING_FEATURE_SET_COMPLETE** is assessed after journeys are structurally connected on the canonical Workbench.
- **FEATURE_FREEZE_RECOMMENDED** only if no major lifecycle journey remains structurally broken.

After freeze: A13 CONNECT, A14 HARDEN, A15 PROVE, A16 RELEASE. No new major engineering intelligence domain before v1.0 unless a critical pilot gap is proven.

## Production blockers (A13/A14 handoff)

- `engineering_generated_artifacts.content_base64` HIGH-risk storage
- Hosted ClamAV unavailable; fail-closed external upload preserved
- Company-template binary storage/upload DEFERRED
- Real enterprise connectors not implemented
- Certified solver / tool execution not certified (A7C remains deferred external dependency)
- Real calculation-template certification EXAMPLE_ONLY
- Browser HITL / human AAL2 status as recorded in the A12C result block
- Semantic AI Review UNAVAILABLE
- PDF export DEFERRED
- Desktop Bridge, Office add-ins, CAD plugins not implemented

## Post-freeze backlog (non-blocking)

Semantic AI Review, PDF export, Desktop Bridge implementation, Office add-ins, CAD plugins, additional certified calculation definitions, additional engineering-tool adapters, advanced visualization, computer-vision review, Value Intelligence if still post-freeze.

## A13 handoff

Recommended next phase: **EOS-A13A Enterprise Connector Foundation & Microsoft 365 Integration**.

Connect the certified Engineering OS work model to real managed enterprise repositories and collaboration systems, beginning with SharePoint/Microsoft 365 patterns, while preserving Managed Repository allowlist (`DEFAULT_CAPTURE_POLICY = DENY`), source ownership, project isolation, information authority, EngineeringWorkEvent materiality, and no-surveillance boundaries.
