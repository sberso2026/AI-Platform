# EOS-A1 Canonical Engineering Domain Model

Status: **FROZEN** for planning (documentation-only in EOS-A1). EOS-A2 implemented persistence for Decision children and Assumptions — see `EOS_A2_IMPLEMENTATION.md`. A1 vocabulary is unchanged.

Evidence checkout: `C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\AI Platform`  
Evidence branch: `cursor/era-7a-engineering-review-pilot-gate`  
Evidence HEAD: `0dd05bf124c19e1fbb8099f396a904ec86a2d020`  
Evidence date: 2026-09-29 (EOS-A1)

This document freezes vocabulary, object identities, lifecycle semantics, and anti-definitions. Persistence recommendations are contracts for later phases. **No tables are created here.**

Related:

- `DOMAIN_RELATIONSHIP_MODEL.md`
- `BOUNDED_CONTEXT_OWNERSHIP.md`
- `TRACEABILITY_MATURITY_MODEL.md`
- `ENGINEERING_REVIEW_BOUNDARY.md`
- `DIGITAL_THREAD_ARCHITECTURE.md`
- `SYSTEMS_AND_DISCIPLINES_MODEL.md`
- `OPTIMIZATION_READINESS_CONTRACT.md`
- `EOS_A1_ADRS.md`

---

## 0. Freeze principles

1. RTB AI Platform is the enterprise platform. Engineering OS is a domain operating system on it.
2. Compose existing bounded contexts. Do not invent parallel identity, findings, graphs, jobs, or twins.
3. Prefer the smallest coherent model that can host Lifecycle, Systems, Discipline, Optimization, Decision, and Value Intelligence later.
4. Current implementation may be incomplete relative to this glossary. Incomplete does not mean invent a second object.
5. Identity uses existing platform conventions: `gen_random_uuid()` primary keys, `tenant_id` isolation, optional `workspace_id`, human-readable codes unique within tenant.

---

## 1. Organizational / security context

Do not redesign platform identity. Current owners remain Platform Core (`tenants`, `workspaces`, `tenant_memberships`, `workspace_memberships`, `profiles`, `roles`).

### 1.1 Tenant

**Is:** The commercial and security isolation root. Every engineering object that persists in this platform is tenant-scoped unless it is a system catalogue row (`is_system = true` on `engineering_disciplines` / `engineering_asset_types`).

**Is not:** A project, a workspace, or a company.

**Current:** `tenants`. Engineering tables FK `tenant_id`.

### 1.2 Workspace

**Is:** An operational collaboration boundary inside a tenant. Engineering Review packages require `workspace_id`. Engineering Core projects and assets allow nullable `workspace_id`.

**Is not:** A project. Multiple engineering projects may live in one workspace.

**Current:** `workspaces`. Commerce entitlement for Engineering OS is assigned at workspace/installation/seat, not by inventing a second workspace type.

### 1.3 Project

**Is:** The primary engineering delivery container. Canonical persistence: `engineering_projects` (`project_code`, `project_name`, `project_phase`, `status`). Unique `(tenant_id, project_code)`.

**Is not:** A system, an asset, a review package, or a commercial product licence.

**Lifecycle (current):** `draft | active | on_hold | completed | cancelled | archived`. Phase: `concept | feasibility | design | detailed_design | procurement | construction | commissioning | operations | decommissioning`.

### 1.4 Company

**Is:** An organisation that participates in engineering work (owner, consultant, contractor, vendor, fabricator, inspector, regulator, client). Canonical: `engineering_companies`.

**Is not:** A tenant. A tenant may host many companies.

### 1.5 User / Member

**Is:** A platform identity (`profiles`) plus membership (`tenant_memberships`, `workspace_memberships`, `engineering_project_members`).

**Is not:** Decision authority by itself. Authority is a role/capability on a Decision or Approval, not a new identity type.

### 1.6 Discipline

**Is:** A professional practice classification (Structural, Civil, Mechanical, Piping, Electrical, Instrumentation, Process, Geotechnical, Materials, Safety, Environmental, …). Canonical catalogue: `engineering_disciplines` plus `ENGINEERING_DISCIPLINES` in `@rtb/engineering-os`. EOS-A7A overlay: `EOS_A7A_MULTIDISCIPLINE_FOUNDATION.md`.

**Is not:** A System, a mini operating system, or an autonomous approval agent. Disciplines classify work and documents; they do not own system identity. See `SYSTEMS_AND_DISCIPLINES_MODEL.md`.

---

## 2. Engineering physical / functional context

### 2.1 SYSTEM vs ASSET (resolved)

| | System | Asset |
| --- | --- | --- |
| Nature | Functional / behavioural grouping | Identifiable physical or logical engineered item managed through lifecycle |
| Question it answers | What function does this grouping perform? | What item exists, is tagged, and is maintained? |
| Hierarchy | System contains subsystems (and may contain assets) | Asset may have parent assets (`parent_asset_id`) |
| Current persistence | **EOS-A3:** `engineering_systems`. TEXT `engineering_assets.system` / `.subsystem` remain legacy labels | `engineering_assets` (`asset_tag`, `asset_name`, unique `(tenant_id, asset_tag)`) |
| Future persistence | Hierarchy/self-parent and CONTAINS/USES membership (A3) | Remain `engineering_assets`. Do not rename to System |

**Rule:** Do not force System = Asset. A system may contain assets. An asset may participate in one or more systems where modelling permits (many-to-many via relationship, not by overloading `asset_tag`).

**Anti-definition:** A System is not a document, not a discipline, not a digital twin, and not a knowledge-graph node (a KG node may *represent* a system).

### 2.2 System

**Is:** A multidisciplinary functional grouping (Crushing System, Conveying System, Water System, Power System, Pumping System, Tailings System, …). Owned by Systems Intelligence conceptually; persisted later by Engineering Core.

**Hierarchy rules:**

1. A Project CONTAINS zero or more Systems.
2. A System MAY CONTAINS Subsystems.
3. Nesting depth is finite (recommended max: System / Subsystem / Component-group). Deeper trees are modelled as additional Systems with `DEPENDS_ON`, not infinite parent chains.
4. A System is multidisciplinary. Discipline does not own System identity.
5. Until a System table exists, TEXT `engineering_assets.system` is a **legacy label**, not the canonical object.

### 2.3 Subsystem

**Is:** A real object when it has its own identity, interfaces, or configuration items (for example Crushing / Primary Crusher circuit). It is hierarchy metadata only when it is a naming convenience with no independent interfaces, requirements, or assets.

**Rule:** Promote to a real Subsystem object when any of: allocated requirements, interfaces, configuration items, or review scope attach to it. Otherwise keep as System hierarchy metadata.

**Current:** TEXT column only. Do not treat existing strings as IDs.

### 2.4 Asset

**Is:** An identifiable engineered item (`asset_tag`) that can be designed, procured, installed, commissioned, operated, and linked to a twin (`digital_twin_id`) and a KG node (`knowledge_node_id`).

**Is not:** A System. Not a Component unless the component is tagged and lifecycle-managed as an asset.

**Current:** `engineering_assets` with optional `parent_asset_id`, `discipline_id`, `location` TEXT, `system`/`subsystem` TEXT, `criticality`.

### 2.5 Component

**Is:** A constituent of an Asset that is not independently lifecycle-managed as an Asset. May be represented as a child asset when it needs its own tag, maintenance, or twin.

**Is not:** A System. Not an Interface (an interface may exist *at* a component boundary).

**Current:** No dedicated table. Use parent/child assets or model elements (`engineering_model_elements`) until a Component object is justified.

### 2.6 Area

**Is:** A spatial grouping used for layout, construction, and operations (plant area, building, yard).

**Is not:** A System (a system may span areas). Not a Location pin.

**Current:** No dedicated table. Spatial mapping exists as `engineering_model_mappings.target_kind = 'spatial'`.

### 2.7 Location

**Is:** A position or place reference (site, coordinates, room, chainage). Attribute of Asset/Area/Model element.

**Is not:** An Asset. Current `engineering_assets.location` is TEXT, not a Location object.

---

## 3. Engineering information

Canonical persistence today: `engineering_documents` + `engineering_document_versions`. Unique `(tenant_id, document_number, revision)`. Status: `draft | issued | for_review | approved | superseded | obsolete`.

### 3.1 Document

**Is:** A governed information object with a document number, title, type, revision, and lifecycle status. May attach to project, asset, and discipline.

**Is not:** Evidence by itself. Evidence *cites* a document (or a span within it).

### 3.2 Document Version

**Is:** A revision instance of a Document (`engineering_document_versions`, unique `(document_id, revision)`). The parent row also stores current revision (denormalized).

**Is not:** A new document number.

### 3.3 Drawing, Calculation, Specification, Datasheet

**Canonical approach (frozen):** **typed documents**, not separate persistence entities in EOS-A1.

Evidence:

- `engineering_documents.document_type` is already a type discriminator.
- ERA `REVIEW_DOCUMENT_ROLES`: `specification | drawing | calculation | basis | other`.

**Recommendation:**

| Kind | Now | Later |
| --- | --- | --- |
| Drawing, Calculation, Specification, Datasheet | Semantic subtypes of Document (`document_type` + ERA role) | Optional **projections** (views/indexes) if query patterns require them |
| Separate tables | **Forbidden** until a subtype needs independent lifecycle, identity, or RLS | Only if evidence shows typed-document columns cannot hold the semantics |

**Anti-definition:** A Calculation is not an Analysis Run. A Drawing is not a Model. A Specification is not a Requirement (it may *contain* or *trace to* requirements).

### 3.4 Model

**Is:** A structured engineering representation (IFC, analytical model, 3D/BIM). Current: `engineering_model_references` / `engineering_model_versions` / `engineering_model_elements` (batch_86). Distinct from Document even when a model file is also stored as a document.

**Is not:** An Analysis Run. Not a Digital Twin. Not a Digital Thread.

### 3.5 Record

**Is:** A structured register entry that is not a file-backed document (decision, action, risk, TQ, lesson). Engineering Core registers are Records.

**Is not:** A Document. A Record may link to Documents via `engineering_object_links` or attachments.

### 3.6 Evidence

**Is:** An attributable citation that a claim, finding, decision, or verification is based on (span, document revision, hash, extractor). ERA: `engineering_review_evidence` + domain type `FindingEvidence`.

**Is not:** The document itself. Not a Finding. Not a Disposition.

---

## 4. Requirements

**Current persistence:** `engineering_requirements` (EOS-A4). ERA detector `requirement_traceability_gap` remains document-extracted facts, not the register.

### 4.1 Requirement

**Is:** A governed need or constraint that a system, asset, or process must satisfy. Types (classification, not separate tables): functional, performance, safety, regulatory, client, design, operational, maintainability, environmental.

**Is not:** A Specification document. Not an Assumption. Not a Finding.

### 4.2 Requirement Source

**Is:** The origin (client brief, code, regulation, contract, parent requirement, lesson). Provenance, not a second requirement.

### 4.3 Acceptance Criterion

**Is:** A testable condition that must be true for the requirement to be accepted.

### 4.4 Verification Method

**Is:** How satisfaction is demonstrated (analysis, inspection, test, review, certification).

### 4.5 Verification Status

**Is:** Lifecycle of verification against a requirement (`unverified | in_progress | verified | waived | failed`), distinct from document status and from ERA finding verification.

### 4.6 Requirement Relationship

**Is:** A typed link between requirements (`DERIVES_FROM`, `CONFLICTS_WITH`, `REFINES`, `SUPERSEDES`). Use the governed relation taxonomy, not free text.

### 4.7 Requirement Allocation

**Is:** Binding a requirement to a System, Asset, Interface, or Discipline package. Relation: `ALLOCATED_TO`.

---

## 5. Assumptions

Assumption Intelligence is a **horizontal capability**, not a top-level product.

**Current:** ERA detector `unsupported_assumption` extracts assumption-like claims from documents. **EOS-A2:** first-class `engineering_assumptions` in Engineering Core. ERA detector is detection, not the register.

### 5.1 Assumption

**Is:** A statement taken as true for design, analysis, decision, or review, whose invalidation can change outcomes. Reusable by Requirements, Decisions, Optimization, Review, Risk, Change, and Analysis.

**Is not:** A Requirement (requirements are obligations; assumptions are accepted uncertainties). Not a Finding (a finding may *report* an unsupported assumption).

### 5.2 Assumption Source

**Is:** Who/what asserted it (document revision, engineer, code default, vendor data).

### 5.3 Confidence

**Is:** Qualifying belief in the assumption (numeric 0–1 already used on decisions/findings, or enumerated). Not a substitute for Validation Status.

### 5.4 Validation Status

**Is:** `unvalidated | accepted | validated | expired | invalidated`.

### 5.5 Dependency

**Is:** Other objects that consume the assumption (`USED_BY`). Invalidating an assumption must be able to locate dependents via Digital Thread relations.

### 5.6 Expiry / Review Condition

**Is:** A date, stage, or event that forces revalidation (for example “valid until geotech report Rev C”).

---

## 6. Interfaces

### 6.1 Interface (canonical object)

**Is:** A governed boundary between two (or more) engineering objects, disciplines, or responsibilities. Types (classification): physical, functional, process, mechanical, piping, structural, electrical, control, data, information, responsibility, contract, schedule.

**Is not:** A model mapping. Not a review finding.

### 6.2 Three-way distinction (resolved)

| Concept | Meaning | Current evidence |
| --- | --- | --- |
| **Interface object** | The engineering boundary itself (what connects, who owns each side, what is transferred) | `engineering_interfaces` + CONNECTS (EOS-A3) |
| **Model mapping** | Correspondence between a model element and a platform object | `engineering_model_mappings` (`target_kind`: asset, project, spatial, twin, element, unknown) |
| **Review finding** | A governed observation from an ERA (or other) review run | `engineering_review_findings` / PI findings |

A mapping may *evidence* an interface. A finding may *report* a broken or missing interface. Neither is the Interface.

**Owner:** Engineering Core (future). Systems Intelligence and Discipline Intelligence consume it. ERA may review it.

---

## 7. Change and impact

### 7.1 Change vs Impact (resolved)

**Change** is a controlled modification to an engineering baseline, requirement, configuration, design, system, asset, information object, or project condition.

**Impact** is a consequence or potentially affected object/result caused by a change or other event.

They are not the same object. A Change AFFECTS objects; an Impact is CAUSED_BY a Change (or other event) and describes the consequence.

**Current:** `engineering_changes` and `engineering_impacts` (EOS-A4). Project Controls change candidates remain MODULE_LOCAL advisory records.

### 7.2 Change attributes (conceptual)

- **Change source:** client instruction, RFI, site condition, review disposition, optimization decision, non-conformance.
- **Affected object:** any canonical engineering object (via relation `AFFECTS`).
- **Disposition:** proposed / approved / rejected / implemented / closed.
- **Verification requirement:** what evidence is required after implementation.

### 7.3 Impact attributes (conceptual)

- **Impact type:** technical, safety, cost, schedule, interface, requirement, configuration, operability.
- **Propagation:** first-order vs follow-on impacts (finite hops; not an unbounded graph walk at write time).
- **Severity:** aligned to existing criticality/severity enumerations where possible (`low | medium | high | critical`).

---

## 8. Configuration

### 8.1 Change vs Configuration (resolved)

| Capability | Question |
| --- | --- |
| Change Intelligence | What changed? |
| Configuration Intelligence | What was valid at a specific state or point in time? |

Do not merge them. A Change may *produce* a new Configuration Baseline. A Configuration Item’s effective state is not a Change record.

### 8.2 Configuration objects (conceptual; no persistence in A1)

| Object | Definition |
| --- | --- |
| Configuration | The set of Configuration Items and their effective states for a defined context (project / system / asset) |
| Configuration Baseline | A named, frozen configuration at a decision or stage gate |
| Configuration Item | An object under configuration control (document revision, model version, asset, requirement set, software) |
| Effective State | What is valid *now* (or at query time) |
| Revision State | The revision identity of an item (document revision, model version) |
| Design Freeze | Baseline after which changes require formal Change |
| IFC State | Issued-for-construction configuration (not the IFC file format; the construction-issue state). File-format IFC remains an Analysis/Model adapter concern |
| Installed State | What is physically installed |
| As-Built State | Recorded constructed configuration |
| Commissioned State | Configuration accepted into operation |
| Supersession | Typed replacement of a prior item/revision (`SUPERSEDES`) |

**Current:** `engineering_configuration_baselines` + `engineering_configuration_items` (EOS-A4). Document `status`/`revision` remains a Document Version, not a Configuration Baseline.

---

## 9. Decision

Canonical persistence: **`engineering_decisions`** (batch_205). EOS-A1 extends/composes this register. It does **not** replace it (ADR-D1).

Current columns already include: `decision_number`, `title`, `description`, `decision_type`, `category`, `status`, `priority`, `recommendation`, `rationale`, `alternatives` JSONB, `consequences`, `confidence`, `review_status`, `approval_status`, `approved_by`, `decision_date`, project/asset/company FKs, `knowledge_node_id`, `digital_twin_id`, `workflow_instance_id`.

### 9.1 Canonical decision elements

| Element | Definition | Current vs future |
| --- | --- | --- |
| Decision | Governed engineering choice with identity `decision_number` | Table exists |
| Decision Question | The question the decision answers | Attribute/future child; not a parallel register |
| Alternative | A considered option | JSONB `alternatives` today; may become child rows later |
| Trade-off | Comparison of alternatives against criteria | Conceptual; shared with Optimization |
| Rationale | Why the selected alternative was chosen | `rationale` column |
| Supporting Evidence | Citations backing the choice | Via object links / future evidence FKs |
| Assumption | Assumptions the decision is BASED_ON | Future relation; reuse Assumption object |
| Risk | Risks accepted or created | `engineering_risks` register exists separately |
| Decision Authority | Role/person entitled to decide | `owner_id` / `approved_by`; not vendor graph |
| Approval | Recorded authorization | `approval_status`, `approved_by` |
| Confidence | Qualifying belief | `confidence NUMERIC(5,4)` |
| Effective Date | When the decision applies | `decision_date` |
| Supersession | Replacement by a later decision | Future `SUPERSEDES` relation |
| Related Optimization Study | Optional link | Future; not a column today |
| Related Review Package | Optional link | Future; ERA package id |
| Related Configuration | Optional link | Future baseline id |

**Anti-definition:** An Engineering Decision is not a Project Controls advisory `decision_unit`, not a vendor graph node, and not an ERA Finding.

---

## 10. Engineering Review

See `ENGINEERING_REVIEW_BOUNDARY.md` for full boundary. Summary:

| Object | Canonical | Current |
| --- | --- | --- |
| Review Package | Governed set of documents + scope for review | `engineering_review_packages` |
| Review Run | One execution of the review engine against a package | `engineering_review_runs` |
| ERA Finding | Governed engineering-review finding | `engineering_review_findings` |
| PI Finding | Product/domain-specific detected finding | `project_intelligence_findings` |
| Evidence | Attributable support for a finding | `engineering_review_evidence` |
| Disposition | Human action on a finding | `engineering_review_dispositions` (`assign | accept | reject | modify | close | reopen`) |
| Verification | Evidence-verification state of a finding | `FINDING_VERIFICATION_STATES` |
| Review Type | Kind of review (design, interdisciplinary, code, constructability, …) | Not a table; future attribute of package |
| Review Scope | What objects/disciplines/documents are in the run | `engineering_review_runs.scope` JSONB |

**ERA Finding vs PI Finding:** PI Finding is not deleted or silently redefined. Composition is documented in ADR-D2. No data migration in A1.

---

## 11. Digital Thread

**Is:** Relationship continuity and provenance across canonical engineering objects (Requirement → System → Asset → Assumption → Analysis → Alternative → Decision → Configuration → Drawing → Review → Approval → Construction → Commissioning → Operation).

**Is not:** Operational Digital Twin.

Thread **node identity** is the canonical object id (UUID) plus type. Thread **relation** is a typed, directed, tenant-scoped edge with provenance and optional temporal validity. See `DIGITAL_THREAD_ARCHITECTURE.md` and ADR-D3.

Do **not** create a third graph store. Platform Knowledge Graph (`knowledge_nodes` / `knowledge_edges`) is the future host. PI KG remains a projection pending convergence. Existing `digital_twin_thread_*` tables are twin-scoped **reference composition** (batch_84), not the Engineering Digital Thread of record and not a graph database.

---

## 12. Operational Digital Twin

**Is:** Representation of operational or physical asset/system *state* (live or simulated).

**Is not:** Digital Thread. Not a System identity object.

**Current intentional separation (ADR-D6):**

- Kernel: `digital_twins` (`packages/platform-kernel`). Engineering assets/decisions FK `digital_twin_id`.
- Module: `@rtb/digital-twin` + `digital_twin_identities.kernel_twin_id`.

Preserve unless a later ADR proves merge. Engineering Digital Thread must not be stored as twin telemetry.

---

## 13. Analysis / execution (conceptual only)

| Object | Definition | Current evidence |
| --- | --- | --- |
| Engineering Model | Structured model used as analysis input | `engineering_model_*` + IFC |
| Analysis Engine | Solver or checker (SPACE GASS, ETABS, future) | Adapter packages / execution host |
| Analysis Adapter | Anti-corruption mapping to/from an engine | IFC / SPACE GASS / ETABS adapters |
| Analysis Run | One invocation of an engine against a model/config | Future; jobs exist |
| Execution Job | Platform/engineering job executing work | Multiple queues (ADR-D4); `engineering_execution_jobs`, kernel `background_jobs`, PI claim jobs, commerce outbox |
| Analysis Result | Structured output of a run | Future |
| Evidence Package | Results + inputs bound as Evidence for review/decision | Compose ERA Evidence; do not fork |

Do not implement adapters or new queues in EOS-A1.

---

## 14. Optimization (name and define only)

Implementation belongs to EOS-A5+. No persistence in A1. See `OPTIMIZATION_READINESS_CONTRACT.md`.

| Object | Definition |
| --- | --- |
| Optimization Study | Governed study that searches alternatives against objectives and constraints |
| Objective | Quantity to maximize/minimize/target |
| Constraint | Hard or soft limit from requirements, interfaces, physics, or policy |
| Design Variable | Independent variable the study may change |
| Scenario | Context bundle (loads, prices, configs, assumptions) |
| Alternative | A feasible or candidate design point (shared concept with Decision) |
| Optimization Run | One execution of a study |
| Optimization Result | Structured outcome of a run |
| Trade-off | Comparison across objectives |
| Pareto Set | Non-dominated alternatives |
| Sensitivity Result | How outputs move with inputs/assumptions |
| Uncertainty Input | Characterized uncertainty feeding the study |
| Economic Evaluation | Cost/value assessment of alternatives (feeds Value Intelligence) |

**Anti-definition:** Optimization is not Decision Intelligence (it produces alternatives and evidence; Decision SELECTS). Not a third findings system. Not a new graph store.

---

## 15. Value (name and define only)

No persistence in A1. Owned conceptually by a future Value bounded context.

| Object | Definition |
| --- | --- |
| Value Baseline | Reference value position before a change or study |
| Value Opportunity | Identified potential improvement |
| Projected Value | Estimated future value of an alternative |
| Approved Value | Value accepted by authority (tied to Decision/Approval) |
| Committed Value | Value locked into plan/contract/configuration |
| Realized Value | Observed value after implementation |
| Verified Value | Realized value with acceptance evidence |
| Benefit Attribution | Allocation of value to systems, decisions, or changes |
| Value Confidence | Qualifying belief in a value figure |

**Anti-definition:** Value objects are not cost-control WBS rows. Project Controls may *feed* cost/schedule inputs; it does not own Value Intelligence objects.

---

## 16. Identity rules

Platform convention: UUID PK via `gen_random_uuid()`. Do not introduce a second GUID scheme.

| Object | Tenant | Workspace | Project | Global reuse | Immutable ID | Human code | Versioned | Temporal | Soft delete | Auditable | External ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tenant | n/a | no | no | n/a | yes | slug/name | no | no | platform | yes | yes |
| Workspace | yes | n/a | no | no | yes | name | no | no | platform | yes | yes |
| Project | yes | optional | n/a | no | yes | `project_code` | no | phase/status | no (status) | yes | yes |
| Company | yes | no | no | tenant-reusable | yes | name/reg | no | no | status | yes | yes |
| User/Member | via membership | via membership | via `engineering_project_members` | platform user | profile UUID | email | no | no | membership | yes | yes |
| Discipline | optional (system rows null tenant) | no | no | system catalogue reusable | yes | `discipline_key` | no | no | no | yes | yes |
| System | yes | optional | yes | no | yes (future) | system code | config baselines | yes | future | yes | yes |
| Subsystem | yes | optional | yes | no | yes when real object | code | as System | yes | future | yes | yes |
| Asset | yes | optional | optional | tenant tag unique | yes | `asset_tag` | via config | yes | status | yes | yes |
| Component | yes | optional | optional | no | if tagged as asset | optional | no unless asset | no | no | yes | optional |
| Area / Location | yes | optional | optional | location may be shared | future | code/text | no | no | no | yes | optional |
| Document | yes | optional | optional | no | yes | `document_number` | yes (`revision`) | status | superseded | yes | yes |
| Document Version | via document | via document | via document | no | yes | revision | is a version | yes | no | yes | yes |
| Model | yes | yes (batch_86) | via mapping | no | model_ref_id | model id | model versions | mapping state | superseded | yes | yes |
| Record (registers) | yes | optional | optional | no | yes | `*_number` | no | dates | no | yes | yes |
| Evidence | yes | yes (ERA) | yes (ERA) | no | yes | none required | immutable preferred | created_at | revoke, don’t edit | yes | yes |
| Requirement | yes | optional | yes | no | future | req code | yes | yes | future | yes | yes |
| Assumption | yes | optional | optional | **reusable across objects** | future | optional | no | expiry | invalidate | yes | yes |
| Interface | yes | optional | yes | no | future | IFC/tag style | yes | yes | future | yes | yes |
| Change | yes | optional | yes | no | future | change no. | versions | yes | no | yes | yes |
| Impact | yes | optional | yes | no | future | optional | no | yes | no | yes | optional |
| Configuration / CI / Baseline | yes | optional | yes | no | future | baseline code | **is versioning** | **yes** | supersede | yes | yes |
| Decision | yes | optional | optional | no | yes | `decision_number` | supersession | `decision_date` | no | yes | yes |
| Review Package/Run/Finding | yes | **required** | **required** | no | yes | name/ids | run is instance | timestamps | archive | yes | yes |
| PI Finding | yes | **required** | optional | no | yes | none | events | `deleted_at` | **yes** | yes | yes |
| Thread relation | yes | optional | optional | no | yes | n/a | no | validity window | no | provenance | via node ids |
| Digital Twin | kernel/module scoped | module yes | via asset | no | yes | twin id | state over time | **yes** | module rules | yes | yes |
| Execution Job | yes where present | varies | varies | no | yes | job id | retries | timestamps | no | yes | no |
| Optimization / Value objects | yes | optional | yes | no | future | study/value codes | runs/versions | yes | no | yes | yes |

**Assumption reuse:** globally reusable *within tenant*, not globally across tenants.

---

## 17. Lifecycle semantics (object-local)

Do not impose a single universal status enum on all objects. Use:

- **Object-local status** as implemented today (project, document, review package, finding, decision).
- **Traceability maturity** as a cross-cutting overlay (`TRACEABILITY_MATURITY_MODEL.md`), not a replacement status column in A1.

Document example (current): `draft → for_review → issued/approved → superseded/obsolete`.  
Review package (current): `draft → ready → in_review → completed | archived`.  
Decision (current): `status` plus separate `review_status` and `approval_status`.

---

## 18. Examples

**Crushing circuit**

- Project `ER-A1` CONTAINS System `CRUSH-01` (Crushing).
- System CONTAINS Subsystem `CRUSH-01-PRI` and USES Asset `CR-101` (primary crusher, `asset_tag`).
- Requirement `CAP-50` ALLOCATED_TO System `CRUSH-01`.
- Assumption `ORE-UCS-P50` USED_BY Calculation document `CALC-CR-101-001` Rev B.
- Interface `IF-CR-CV-01` CONNECTS Asset `CR-101` to Conveying System.
- Decision `EDN-014` SELECTS Alternative “single toggle jaw” BASED_ON that assumption.
- Review Package reviews the calculation + datasheet; ERA Finding reports unsupported assumption if evidence is missing.

**What not to do**

- Do not create Asset `CRUSH-01` to mean the crushing system.
- Do not store the requirement allocation only as a PI finding.
- Do not create a third KG to hold the thread.

---

## 19. Anti-definitions (summary)

| Do not treat as the same | Why |
| --- | --- |
| System = Asset | Functional grouping vs lifecycle item |
| Digital Thread = Digital Twin | Provenance graph vs operational state |
| Change = Impact | Modification vs consequence |
| Change = Configuration | Event vs valid-state-at-time |
| Interface = Model mapping | Boundary vs correspondence |
| Interface = Finding | Object vs observation |
| Drawing/Calc/Spec = separate tables | Typed documents first |
| ERA Finding = PI Finding | Governed review vs product detection |
| Engineering Decision = PC decision_unit | Engineering register vs advisory controls |
| Assumption product = top-level OS | Horizontal capability |
| Discipline = System owner | Views, not identity |
| Optimization Study = Decision | Produces alternatives; Decision selects |
| Evidence = Document | Citation vs file |

---

## 20. Canonical object count (A1 freeze)

Named glossary objects in this freeze: **78** (organizational 6, physical 6, information 9, requirements 7, assumptions 6, interface 1, change/impact 2, configuration 11, decision elements 16 with reuse of Assumption/Evidence, review 8, thread 2, twin 1, analysis 7, optimization 13, value 9). Shared reused concepts (Evidence, Alternative, Trade-off, Assumption) are defined once and referenced.

This count is a vocabulary freeze, not a table count. Most objects have **no table yet** and must not be created in EOS-A1.
