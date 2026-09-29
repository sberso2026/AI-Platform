# EOS-A1 Bounded Context Ownership

Status: **FROZEN** for planning. No runtime ownership changes in EOS-A1.

Evidence HEAD: `0dd05bf124c19e1fbb8099f396a904ec86a2d020`

Rule: **one canonical owner per object**. Other modules may reference or project. They may not mint a second canonical instance.

Owner vocabulary:

- Platform Core / Platform Kernel
- Engineering Core (`@rtb/engineering-os` tables + registers)
- Engineering Review (`@rtb/engineering-review` + persistence)
- Project Intelligence
- Shared Intelligence (Platform Intelligence services: memory, retrieval, KG infra)
- Operational Digital Twin (kernel twin + `@rtb/digital-twin`)
- Optimization (future bounded context)
- Value (future bounded context)
- Project Controls (existing; **not** Engineering Decision owner)
- Other existing package (named)

---

## 1. Ownership matrix

| Object | Canonical owner | Current implementation | Future owner | Consumers | Duplication risk |
| --- | --- | --- | --- | --- | --- |
| Tenant, Workspace, User, Membership, Role | Platform Core | `tenants`, `workspaces`, `profiles`, memberships | same | all | Do not create engineering-specific identity |
| Project | Engineering Core | `engineering_projects` | same | ERA, PI, Controls, Review | PI must not own a second project root |
| Company, Discipline, Asset type | Engineering Core | `engineering_companies`, `engineering_disciplines`, `engineering_asset_types` | same | all engineering | Discipline catalogue vs `ENGINEERING_DISCIPLINES` const — keep aligned, one DB catalogue |
| Discipline Intelligence overlay | Engineering Core | `engineering_discipline_profiles` + participation/tool-binding tables (EOS-A7A) | same | Systems, Review, Optimization | Do not mint per-discipline OS tables or finding tables |
| System, Subsystem | Engineering Core | `engineering_systems.parent_system_id` (no subsystems table); TEXT labels remain on assets | Engineering Core table | Systems Intelligence, Discipline Intelligence, Optimization | **HIGH** if PI or twin invents system ids |
| Asset, Component (when tagged) | Engineering Core | `engineering_assets` | same | Review, Twin, Models, Value | Do not equate with System |
| Area, Location | Engineering Core (future) | `location` TEXT; mapping `spatial` | Engineering Core | Models, Construction | LOW until spatial object exists |
| Document, Document Version | Engineering Core | `engineering_documents`, `_versions` | same | ERA, PI ingestion | PI processing status ≠ document status |
| Drawing/Calc/Spec/Datasheet | Engineering Core | `document_type` + ERA roles | typed documents | ERA, Discipline Intel | **MEDIUM** if separate tables forked |
| Model, Model mapping | Engineering Core (interop) | `engineering_model_*` | same | Twin, Analysis, Review | Mapping ≠ Interface |
| Record (actions, risks, issues, TQs, lessons) | Engineering Core | batch_205 registers | same | Workflow, Review | Do not clone as PI registers |
| Evidence (review) | Engineering Review | `engineering_review_evidence` | same | Decision, Traceability | PI `evidence` JSONB is product-local, not ERA Evidence |
| Requirement | Engineering Core | `engineering_requirements` (EOS-A4); ERA extracts facts | Engineering Core | Review, Optimization, Systems | **HIGH** if PI Findings become the requirement store |
| Assumption | Engineering Core | `engineering_assumptions` (EOS-A2); ERA detector remains detection | Engineering Core | Decision, Review, Optimization | **HIGH** if each module keeps private assumptions |
| Interface | Engineering Core | `engineering_interfaces` + CONNECTS links | Engineering Core | Systems, Discipline, Review | Mapping/finding confusion |
| Change, Impact | Engineering Core | `engineering_changes`, `engineering_impacts` (EOS-A4). Project Controls change tables stay advisory | Engineering Core | Config, Value, Review | Do not merge Change/Impact |
| Configuration / Baseline / CI | Engineering Core | `engineering_configuration_baselines` + `_items` (EOS-A4); document revision remains Document Version | Engineering Core | Change, Decision, Twin | Do not merge with Change |
| **Decision** | **Engineering Core** | **`engineering_decisions`** | **Engineering Core + Decision Intelligence (same records)** | Review, Optimization, Value, Controls (read) | **HIGH** — PC `decision_unit`, vendor graphs |
| Alternative / Trade-off (decision) | Engineering Core | JSONB `alternatives` | child of Decision / shared with Optimization | Optimization | Duplicate alternative stores |
| Approval (engineering) | Engineering Core | `approval_status`, `approved_by` | same; Workflow SDK for routing | Review | Autonomous approval forbidden |
| Review Package, Run, Disposition, ERA Finding | Engineering Review | `engineering_review_*` | same | Core, PI (input adapter) | **HIGH** vs PI Findings / Workflow `EngineeringReviewRecord` |
| **PI Finding** | **Project Intelligence** | **`project_intelligence_findings`** | same | ERA (composition later) | **HIGH** if ERA swallows PI |
| Review Type / Scope | Engineering Review | run `scope` JSONB | same | — | Do not move to PI |
| Workflow instance | Platform Kernel + Engineering Workflow SDK | `workflow_instances` + `@rtb/engineering-os` SDK | same | Inspection, Review (routing only) | SDK `EngineeringReviewRecord` is **not** ERA |
| **Knowledge Graph node/edge** | **Platform Kernel (infra)** | `knowledge_nodes`, `knowledge_edges` | Platform KG hosts Engineering Digital Thread | PI, Core (`knowledge_node_id`) | **CONFIRMED** PI KG duplication (ADR-D3) |
| PI Knowledge Graph | Project Intelligence (projection) | `project_intelligence_knowledge_*`, `EngineeringKnowledgeGraph` | **converge to Platform KG**; PI remains projection | PI product UI | Do not add a third store |
| Engineering Digital Thread | Engineering OS composition over Core objects + `engineering_object_links` | Core payloads + governed links (EOS-A8A) | Platform KG may project later | all intelligence domains | Third graph **forbidden**; PI KG must not become SOT |
| Twin Thread composition | Operational Digital Twin | `digital_twin_thread_profiles/snapshots/references` (batch_84) | same — **references only** | Twin UI, simulation | **MEDIUM** naming collision with Engineering Digital Thread — do not expand into a KG |
| **Digital Twin object** | **Operational Digital Twin** | kernel `digital_twins` + module `digital_twin_identities` | **intentional two-layer** (ADR-D6) | Assets FKs | Do not use twin as thread |
| **Job / Execution Job** | **Platform Kernel JobService** (future convergence) | kernel `background_jobs`, commerce outbox/scheduler, PI claim jobs, `engineering_execution_jobs` | Kernel jobs + typed Engineering execution as a *kind* | Analysis, Review, commerce | **CONFIRMED** multi-queue (ADR-D4) |
| Analysis Engine / Adapter / Run | Engineering Core + execution host | adapters + execution jobs | same; Optimization consumes | Optimization, Review | Do not put solvers in ERA |
| Engineering Analysis Request / Plan / Result | Engineering Core (EOS-A7B) | `engineering_analysis_requests`, `_execution_plans`, `_results` | same — **not** Optimization Run | Review, Decision, Change, Optimization | Do not merge with `engineering_optimization_runs` |
| Optimization Study* and children | Optimization (future) | none | Optimization BC | Decision, Value, Review | Do not persist in A1 |
| Value objects* | Value (future) | none | Value BC | Decision, Optimization | Do not persist in A1 |
| **Feature flag / capability** | **Platform Commerce + Kernel flags** | capability `engineering_os`; flag `engineering_os_enabled` | **canonical name `engineering_os`** (commerce capability); flag becomes alias (ADR-D5) | `/engineering` entitlement | **CONFIRMED** dual names |
| Project Controls decision_unit | Project Controls | `project_controls_decision_states` | same — **advisory only** | Controls UI | Must not replace `engineering_decisions` |
| Inspection / SHM / vendor review | Named module packages | Inspection Intelligence; vendor archives | remain module-local **review tasks**, not ERA Finding | ERA may consume evidence | Duplicate findings stores |

\* Named in glossary; **no table in this phase**.

---

## 2. Decision (attention)

| Question | Answer |
| --- | --- |
| Canonical owner | Engineering Core (`engineering_decisions`) |
| Current implementation | batch_205 register + UI registers |
| Future owner | Same rows; Decision Intelligence is a capability **on** those rows |
| Must not own | Project Controls advisory units; vendor decision graphs |
| ADR | ADR-D1 |

---

## 3. Finding (attention)

| Kind | Owner | Store | May compose later |
| --- | --- | --- | --- |
| ERA Finding | Engineering Review | `engineering_review_findings` | PI Finding as *input signal* |
| PI Finding | Project Intelligence | `project_intelligence_findings` | Optional link `core_record_type/id` or future `era_finding_id` |
| Document Intelligence finding rows | PI / Document Intel | `project_intelligence_document_findings` (source rows per batch_41 comment) | Feed PI Findings |
| Vendor / module review notes | Named module | module tables / Workflow SDK record | Evidence for ERA, not a fourth findings product |

ADR-D2. Do not delete PI Findings. Do not silently redefine them as ERA Findings.

---

## 4. Knowledge Graph node/edge (attention)

| Layer | Owner | Role |
| --- | --- | --- |
| Platform KG | Platform Kernel | Canonical graph infrastructure; future Engineering Digital Thread host |
| PI KG | Project Intelligence | Product projection; CONFIRMED duplication |
| Engineering object_links | Engineering Core | Operational register links until projected |

ADR-D3: no third graph persistence layer.

---

## 5. Digital Twin object (attention)

Kernel twin = platform identity/state hook. Module twin = engineering/operations product (`@rtb/digital-twin`) linked via `kernel_twin_id`. Intentional separation. Digital Thread is not a twin. ADR-D6.

---

## 6. Job (attention)

Multiple queues exist. Future principle: Kernel JobService is the shared executor; Engineering execution jobs, PI claim jobs, and commerce outbox become **job kinds or clients**, not peer kernels. No queue refactor in A1. ADR-D4.

---

## 7. Feature flag (attention)

| Name | Layer | Current use |
| --- | --- | --- |
| `engineering_os` | Commerce product/capability key | Catalogue id `c1000000-0000-4000-8000-000000000001`; `/engineering` entitlement |
| `engineering_os_enabled` | Feature flag | Kernel/app flag for enabling surfaces |

Canonical **semantic** name for the product capability: **`engineering_os`**. `engineering_os_enabled` is a **gate flag** that should eventually alias the same semantic, not a second product. No migration in A1. ADR-D5.

---

## 8. Consumers vs owners (summary)

Engineering OS intelligence domains (Lifecycle, Systems, Discipline, Optimization, Decision, Value) are **consumers and future owners of *new* objects in their context**. They are not allowed to fork:

- identity
- `engineering_projects` / `engineering_assets` / `engineering_documents`
- `engineering_decisions`
- ERA findings
- PI findings
- Platform KG
- Kernel jobs
- Kernel/module twins
