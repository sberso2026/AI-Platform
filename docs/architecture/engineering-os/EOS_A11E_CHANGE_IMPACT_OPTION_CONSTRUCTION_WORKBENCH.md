# EOS-A11E Change Impact, Option Study & Construction Engineering Workbench

Product purpose: turn engineering changes and construction queries into actionable, governed engineering work. EOS answers “what does this change affect?”, “what work must be redone?”, “what options exist?”, and “what does construction need from engineering?” without becoming another change register or RFI dashboard.

## Change-domain ownership

Canonical Change remains A4 Change Intelligence (`engineering_changes`). A11E does not create a competing change identity. Impact Assessment, option studies, and construction response composition wrap the canonical Change record.

RELATED is not AFFECTED. POTENTIAL_IMPACT is not CONFIRMED_IMPACT. EOS never silently equates a Digital Thread relation with redesign.

## Impact Assessment

`EngineeringImpactAssessment` is a composition record. It evaluates potential consequences of Change, information change, interface change, RFI/TQ, field condition, configuration change, requirement change, decision change, assumption invalidation, and vendor-data change.

Identity: tenant, workspace, project (from the source object, not the UI project filter), source object type/id, assessment policy/version, Digital Thread fingerprint, created_by/at, status, potential/confirmed/dismissed impacts, required actions, provenance.

Governed states: DRAFT, ANALYSING, REVIEW_REQUIRED, IN_REVIEW, CONFIRMED, SUPERSEDED, CANCELLED. Never returned as assessment states: APPROVED_DESIGN, SAFE, IFC_READY.

## Potential vs confirmed impact

`discoverPotentialEngineeringImpacts` is deterministic. It traverses A8 Digital Thread with bounded depth/nodes/edges/relation types. Every candidate starts as POTENTIAL_IMPACT with a relation path, reason, source evidence, discipline (only when evidence exists), object type, and current state. No opaque AI relevance score. Human workflow may mark CONFIRMED_IMPACT, NOT_IMPACTED, NEEDS_INVESTIGATION, or DEFERRED.

## Digital Thread traversal

A8 `traverseThread` is reused. No second graph store. Default depth 6, hard max 8, node 200, edge 400. Truncation is reported as PARTIAL_TRAVERSAL. Completeness COMPLETE / PARTIAL / FAILED is traversal completeness, not a claim that all real engineering impacts were discovered. Human engineering review is always required.

## Impact policy

Policy `EOS-A11E-IMPACT-ASSESSMENT@1.0.0` forbids auto-confirm, automatic option winners, autonomous change approval, and autonomous field-change approval. Categories follow canonical object types (INFORMATION, REQUIREMENT, ASSUMPTION, INTERFACE, ANALYSIS, CALCULATION, DRAWING, DECISION, DELIVERABLE, CONFIGURATION, REVIEW, WORK_PLAN, HANDOVER, CONSTRUCTION). Disciplines are never broadcast.

## Impact packs

`EngineeringImpactPack` collects references only: source change, assessment, affected objects, relation paths, authoritative information, requirements, interfaces, assumptions, analyses, decisions, deliverables, configuration, review evidence, required actions. A11E_BINARY_DUPLICATION = NO.

## Human confirmation

Work UX actions: Confirm Impact, Not Impacted, Needs Investigation, Defer, Open Object, Create Engineering Action. Bulk confirmation is allowed only for the same evidence fingerprint.

## Option Studies

A5 Optimization Intelligence is reused (`computeParetoSet`). Decision Intelligence is reused for the human Decision. Criteria and weights are explicit, human-entered, visible, and versioned on the composition. EOS may display trade-offs and Pareto status. EOS may not select the preferred option or declare a best option unless reporting an already-recorded human Decision.

## Optimization reuse

No new optimization engine. No universal scalar score. No hidden best solution. Weights never auto-scalarize Pareto.

## Decision reuse

No new decision model. When impact or options require a decision, A11E records question, options, evidence, assumptions, trade-offs, human decision, and rationale through existing Decision Intelligence.

## Construction engineering workflow

Action-oriented construction surface inside `/engineering/work`. Use cases: RFI, TQ, field condition, site clash, vendor query, construction deviation, proposed field change, temporary works information request, as-built discrepancy. This is not a construction management system.

## RFI/TQ

A11E operates on existing canonical RFI/TQ objects, manually created engineering queries, or future connector-created queries. Real Aconex is not implemented. Context assembly gathers query, project, system/asset, location, current drawing/specification, calculation, analysis, vendor data, interfaces, requirements, assumptions, decisions, configuration, previous queries, open changes, and Digital Thread context.

## Field change

Proposed field change (example: move anchor bolts 75 mm) identifies potential impacts only where governed relationships exist. No technical acceptability conclusion.

## Commissioning

Commissioning deviation/query identifies engineering information, configuration, Decision, and handover impact. No automatic acceptance.

## Handover

Late change after handover package assembly marks handover information stale / refresh required using existing A10C semantics. No automatic handover acceptance change.

## Artifact generation

A11B generates Impact Assessment Report DOCX (`EAT-IMPACT-REPORT`), Option Study XLSX/DOCX/PPTX, RFI/TQ response, and technical memorandum. Status is DRAFT, ENGINEER REVIEW REQUIRED. No new Office-generation infrastructure.

## Pre-Issue Review

A11D is reused for impact, option, and construction-response artifacts. No duplicate review engine. Historical review is preserved; a new run is separate.

## Multi-project safety

Assessment project derives from the source Change / RFI / object. If the UI shows Project B while the source belongs to Project A, the assessment remains Project A only. CROSS_PROJECT_CONTAMINATION = NO.

## Binary-storage boundary

A11E_BINARY_DUPLICATION = NO. High-risk `engineering_generated_artifacts.content_base64` is not expanded. Postgres stores metadata, provenance, hashes, authorization, and lineage. Artifact bytes remain in existing generated-artifact storage.

## Malware boundary

Hosted ClamAV remains UNAVAILABLE. Returned external uploads stay fail-closed unless a controlled fixture / approved prescan path is used. DEFAULT_CAPTURE_POLICY remains DENY.

## Security / RLS

Live RLS on `engineering_impact_assessments`: same workspace allowed, same tenant other workspace denied, cross tenant denied, anonymous denied. AAL2 is reused. No new MFA code.

## A12 handoff

Recommended next phase: EOS-A12A Unified Engineering Workbench. Replace module-first daily usage with a lifecycle-aware Engineering Workbench that lets engineers continue work, start calculations and analyses, prepare reports/specifications, assess changes, respond to construction, run pre-issue reviews, and access governing information from one task-oriented experience.
