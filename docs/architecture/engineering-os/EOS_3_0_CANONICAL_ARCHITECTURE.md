# EOS 3.0 Canonical Architecture

`EOS_3_CANONICAL_LAYER_MODEL_DEFINED=YES`

`EOS_3_CANONICAL_OBJECT_MODEL_DEFINED=YES`

`EOS_3_SYSTEMS_ENGINEERING_ARCHITECTURE_DEFINED=YES`

`EOS_3_CONFIGURABLE_LIFECYCLE_MODEL_DEFINED=YES`

`EOS_3_PROJECT_TO_ASSET_DIGITAL_THREAD_DEFINED=YES`

`EOS_3_DECISION_INTELLIGENCE_BOUNDARY_DEFINED=YES`

`EOS_3_OPTIMIZATION_INTELLIGENCE_BOUNDARY_DEFINED=YES`

`EOS_3_KNOWLEDGE_INTELLIGENCE_ARCHITECTURE_DEFINED=YES`

`EOS_3_AI_AUTHORITY_BOUNDARY_DEFINED=YES`

`EOS_3_AI_EVIDENCE_CLASSIFICATION_DEFINED=YES`

`EOS_3_AI_ORCHESTRATION_ARCHITECTURE_DEFINED=YES`

`EOS_3_DETERMINISTIC_CALCULATION_ARCHITECTURE_DEFINED=YES`

`EOS_3_D1_MIGRATION_STRATEGY_DEFINED=YES`

`EOS_3_NON_D1_CALCULATION_STATUS=NOT_QUALIFIED`

`EOS_3_EXTERNAL_SOLVER_BOUNDARY_DEFINED=YES`

`EOS_3_DMS_BOUNDARY_DEFINED=YES`

`EOS_3_CONSTRUCTION_BOUNDARY_DEFINED=YES`

`EOS_3_INTEGRATION_ARCHITECTURE_DEFINED=YES`

`EOS_3_API_STRATEGY_DEFINED=YES`

`EOS_3_EVENT_ARCHITECTURE_DEFINED=YES`

`EOS_3_WORKFLOW_ENGINE_DECISION=EVOLVE_EXISTING`

`EOS_3_DATA_ARCHITECTURE_DEFINED=YES`

`EOS_3_RETRIEVAL_AUTHORITY_MODEL_DEFINED=YES`

`EOS_3_UNIVERSAL_PROVENANCE_MODEL_DEFINED=YES`

`EOS_3_GLOBAL_COMPLIANCE_FOUNDATION_DEFINED=YES`

`EOS_3_SECURITY_BASELINE_DEFINED=YES`

## Canonical layer model

| # | Layer | Disposition |
| --- | --- | --- |
| 1 | Identity / Tenant / Workspace | PRESERVE |
| 2 | Entitlement / Product / Installation | PRESERVE (`INHERIT_EOS_2_GA`) |
| 3 | Project Intelligence | EVOLVE |
| 4 | Engineering Basis | EVOLVE |
| 5 | Discipline Delivery | EVOLVE |
| 6 | Interface Intelligence | EVOLVE |
| 7 | Change Intelligence | EVOLVE |
| 8 | Review Intelligence | EVOLVE |
| 9 | Knowledge Intelligence | NEW_IN_EOS_3 (formalize / deepen) |
| 10 | Optimization Intelligence | NEW_IN_EOS_3 (first-class boundary) |
| 11 | Decision Intelligence | NEW_IN_EOS_3 (first-class boundary) |
| 12 | Deliverables / Configuration / Baseline | EVOLVE |
| 13 | Inspection Intelligence | EVOLVE (digital thread handoff) |
| 14 | Asset Intelligence | EVOLVE (continuity, not CMMS replacement) |
| 15 | Project Controls | PRESERVE (bounded integration, not ERP) |
| 16 | AI Reasoning / Assistant | EVOLVE |
| 17 | Audit / Provenance | EVOLVE (universal fields) |
| 18 | Security / Governance | PRESERVE + EVOLVE |
| 19 | Integration / Connector Layer | EVOLVE |
| 20 | Deterministic Calculation / Solver Boundary | EVOLVE (hybrid; independent qualification) |

## Canonical object model

| Object | EOS 3 disposition |
| --- | --- |
| Project | EXTENDED |
| Engineering Basis | EXTENDED |
| Requirement | EXTENDED (systems-engineering emphasis) |
| System | NEW_VERSION / stronger first-class use |
| Discipline Object | EXTENDED |
| Revision | UNCHANGED semantics; EXTENDED provenance |
| Interface | EXTENDED |
| Change / Impact | EXTENDED |
| Deliverable / Baseline | EXTENDED |
| Decision | NEW_VERSION (Decision Intelligence) |
| Assumption | EXTENDED |
| Calculation | EXTENDED (qualification state explicit) |
| Review | EXTENDED |
| Evidence / Source | EXTENDED |
| Asset / Inspection | EXTENDED (thread continuity) |
| Optimization Run | NEW_IN_EOS_3 |

## Systems engineering

EOS 3 deepens requirements traceability, system decomposition, interface contracts, verification/validation evidence, configuration, design maturity, change propagation, decisions/assumptions — without claiming a full ALM/PLM replacement.

## Configurable lifecycle

Lifecycle stage names/profiles are configurable (concept, feasibility, pre-FEED, FEED, detailed design, construction support, commissioning, operations, maintenance, modification, decommissioning, and customer-specific aliases). No hard-coded single industry stage set.

## Project → asset digital thread

Supported continuity: project → design → construction **evidence** → commissioning interfaces → asset → inspection → maintenance → modification.

Boundary: not construction ERP, not full CMMS, not warehouse/logistics. Hand-offs via governed objects + connectors.

## Decision Intelligence

Compare alternatives; structure tradeoffs; evidence matrices; consequence modelling; decision records; uncertainty/assumptions; **human decision checkpoints**. Never autonomous decision authority.

## Optimization Intelligence

Distinguish and label:

- deterministic optimization;
- heuristic search;
- AI-assisted proposal generation;
- qualified engineering solver execution;
- unqualified external solver execution.

Do not blur labels or borrow D1 qualification.

## Knowledge Intelligence

Canonical object graph + indexed corpora + revision-aware retrieval + structured records + provenance + source authority + abstention + optional knowledge graph facets (project / enterprise / standards / lessons / jurisdiction). Embeddings are secondary, never sole SoR.

## AI authority and evidence

AI may summarize, infer, compare, recommend, draft, explain, retrieve, reason over evidence.

AI may **not** approve engineering, issue IFC, release deliverables, certify compliance, finalize materiality, sign decisions, or impersonate responsible engineer.

Evidence labels: `FACT` | `INFERENCE` | `ASSUMPTION` | `RECOMMENDATION` | `RESULT` | `HUMAN_DECISION`.

Orchestration may use multi-agent/tool patterns only under human oversight, least privilege, scoped tools, evidence traceability, and deterministic boundaries. More agents ≠ better engineering.

## Deterministic calculation / D1 / solvers

Architecture: **hybrid** — modular embedded calculations + connector/API/file exchange for external solvers; hosted execution optional and separately governed.

`IMPLEMENTED != VALIDATED != QUALIFIED` preserved.

D1 strategy: `PRESERVE_COMPATIBLE` (default). Requalify/supersede only if semantics change.

Non-D1: `NOT_QUALIFIED` until separate tracks complete.

External solvers: connector ≠ file exchange ≠ API execution ≠ hosted execution ≠ result ingestion ≠ validation ≠ qualification.

## DMS / construction boundaries

EOS manages engineering objects, metadata, provenance, links, controlled deliverable states, evidence. Integrates with SharePoint/Aconex/Documentum/etc. — not a full DMS claim.

Construction: design-to-construction handoff, TQs, field change, redlines, inspection evidence, commissioning interfaces — not full construction management.

## Integration / API / events / workflow

Integrations via adapters: documents, analysis tools, CAD/BIM, plant design, project controls, asset/inspection, historians, AI providers, IdP.

APIs: internal/external versioning, auth, tenant context, idempotency, audit, rate limits, optional webhooks.

Events (controlled, not cascade-unbounded): revision created, interface/requirement changed, impact declared, deliverable stale, baseline frozen, review completed, decision changed, calculation superseded — each with actor, workspace, source, object, revision, timestamp, authority, audit linkage.

Workflow: **EVOLVE_EXISTING** governed states (draft → IFR → reviewed → accepted/rejected → superseded → frozen → released). No unconstrained generic no-code engine by default.

## Data / retrieval / provenance

Separate: transactional SoR, engineering object graph, search index, vector store, analytics, telemetry, audit ledger, object storage. Authoritative state is not embeddings-only.

Retrieval precedence:

1. canonical structured engineering state  
2. approved controlled documents  
3. indexed enterprise knowledge  
4. secondary references  
5. model inference (never source evidence)

Universal provenance: tenant, workspace, project, object, revision, source, actor, authority, timestamp, method, tool/solver/model, evidence classification, qualification status where applicable.

## Compliance / security baseline

EU-level controls as high-bar global foundation (GDPR/privacy-by-design, EU AI Act readiness, human oversight, transparency, provenance, NIS2-oriented cybersecurity, least privilege, auditability, residency, jurisdiction/standards profiles). Not EU-only product. SOC 2-ready Trust & Security principles inherited — **not certified**.
