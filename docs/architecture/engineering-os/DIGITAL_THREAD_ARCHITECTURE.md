# EOS-A1 Digital Thread Architecture

Status: **IMPLEMENTED** for EOS-A8A composition and EOS-A8B Platform KG projection. No new graph store. No KG SOT migration.

See `EOS_A8A_ENGINEERING_DIGITAL_THREAD.md`, `EOS_A8B_PLATFORM_KG_PROJECTION.md`, `EOS_A8B_C_KG_WORKSPACE_SECURITY.md`, and `EOS_A8C_ENGINEERING_ASSURANCE_INTELLIGENCE.md`.

**Canonical rule (EOS-A8A / A8B):**

- Relational Core + governed `engineering_object_links` = **source of truth**
- Platform Knowledge Graph = projection / query acceleration / future intelligence (A8B derived, disposable)
- PI Knowledge Graph = product-specific projection
- Twin Thread `digital_twin_thread_*` = twin-scoped references, not Engineering Digital Thread

Evidence HEAD: EOS-A8A `a91c478aec97d9dad39e75ffca6f72fced5f3610` plus EOS-A8B projection onto `knowledge_nodes` / `knowledge_edges`.

ADR-D3 and ADR-D6 apply.

---

## 1. Digital Thread (definition)

**Engineering Digital Thread** is relationship continuity and provenance across canonical engineering objects over time.

Example path:

Requirement → System → Asset → Assumption → Analysis → Alternative → Decision → Configuration → Drawing → Review → Approval → Construction → Commissioning → Operation

**Is not:**

- Operational Digital Twin (state of a physical/operational object).
- A document management folder tree.
- An unconstrained “related items” bag.
- A third graph database.

---

## 2. Thread node identity

A thread **node** is a canonical engineering object already identified in `CANONICAL_DOMAIN_MODEL.md`.

| Field | Rule |
| --- | --- |
| `object_type` | Governed type name (project, system, asset, document, decision, era_finding, …) |
| `object_id` | Existing UUID (or documented external id for models) |
| `tenant_id` | Always |
| Optional pins | `revision`, `valid_at`, `workspace_id`, `project_id` |

Do not mint a parallel thread-only UUID. Current Core rows already carry `knowledge_node_id` (project, asset, document, decision, action) as a **representation pointer** into Platform KG — that is `REPRESENTED_BY`, not a second identity.

---

## 3. Thread relation

A thread **relation** is a typed directed edge from the taxonomy in `DOMAIN_RELATIONSHIP_MODEL.md`.

Required on thread-class edges:

- `relation_type` (finite code)
- `from_type` / `from_id` / `to_type` / `to_id`
- `tenant_id`
- `created_at`
- provenance (`created_by` and/or source record)

Optional:

- `valid_from` / `valid_to` (temporal validity)
- `evidence_id` (when the edge itself is evidenced)
- `confidence` (only when inferred)

---

## 4. Knowledge graph relationship and ownership

| Store | Evidence | A1 decision |
| --- | --- | --- |
| Platform KG `knowledge_nodes` / `knowledge_edges` | Kernel tables (phase_15) | **Canonical graph infrastructure.** Future host of **Engineering Digital Thread**. |
| PI KG `project_intelligence_knowledge_*` + `EngineeringKnowledgeGraph` | PI package | **CONFIRMED duplication.** Remains a product projection. Must not be expanded as the thread of record. |
| `engineering_object_links` | batch_205 | Operational Core links. May **project** into Platform KG; must not become a second semantic standard. |
| Twin thread composition `digital_twin_thread_*` | batch_84 (`20260808230000_batch_84_digital_twin_digital_thread.sql`); `@rtb/digital-twin` `digital-thread-reference.ts` | **Twin-scoped reference metadata**, not a graph store and not the Engineering Digital Thread of record. Constraints already require `by_reference`, `knowledge_graph_reuse = true`, `composition_mode = references_only`, and forbid duplicate KG (`duplicate_knowledge_graph_detected = false`). |
| New Neo4j / third Postgres graph / event-sourced thread DB | none | **FORBIDDEN.** |

**Naming (resolved):** `@rtb/digital-twin` Phase 12K uses the label “Digital Thread Intelligence.” That concern is **Twin Thread composition** (references hanging off `twin_id`). **Engineering Digital Thread** in EOS-A1 is the cross-object provenance graph for Engineering OS. They must not be merged by renaming. Twin Thread may `REPRESENTED_BY` / reference KG nodes; it must not write a parallel edge taxonomy as system of record.

**Goal:** Platform Knowledge Graph may later **project** the Engineering Digital Thread for query acceleration. Engineering Core remains system of record for object payloads **and** governed links. KG stores **typed projections**, not a forked document/decision body. Twin Thread tables remain twin-owned **reference indexes**.

EOS-A8A implements bounded authorized traversal over Core links. It does **not** migrate source of truth into Platform KG.

Convergence sequence (planning only):

1. Freeze relation taxonomy (this phase).
2. Constrain new `engineering_object_links.relationship` values to the taxonomy (later).
3. Project Core links + ERA/Decision pointers onto `knowledge_edges`.
4. Point PI KG reads at Platform KG or keep PI as a derived index — **one writer of canonical thread edges**.

Do not execute that sequence in EOS-A1.

EOS-A7B Analysis Requests and Results participate in the existing thread via Core rows and `engineering_object_links` (`DEPENDS_ON`, `USES`, `USED_BY` historical dual-read, `REVIEWS`, `SUPPORTED_BY`, `AFFECTS`). EOS-A8A is the composition/traversal layer. No new graph store. See `EOS_A8A_ENGINEERING_DIGITAL_THREAD.md`.

---

## 5. Provenance

Every thread edge that affects safety, approval, or verification must be reconstructible:

- Who asserted it
- When
- From which source record (document revision, review run, mapping review, decision id)
- Whether a human confirmed it

ERA already stores run `provenance` JSONB and evidence rows. Decision stores `approved_by` / dates. Model mappings store review decisions. The thread must **cite** those records, not copy blobs into the graph.

---

## 6. Temporal relationships

Configuration Intelligence queries “what was valid at T?”. Thread edges that allocate, baseline, supersede, or use assumptions must support time or revision pins.

Digital Twin time-series (operational state) is **not** thread temporality. Do not store SCADA samples as thread edges.

---

## 7. Digital Thread vs Digital Twin

| | Digital Thread | Digital Twin |
| --- | --- | --- |
| Question | How are engineering objects related, with provenance, across lifecycle? | What is the operational/physical state of an asset or system? |
| Nodes | Canonical engineering objects | Twin instances (`digital_twins`, module identities) |
| Edges | Governed engineering relations | Telemetry, topology-for-operations, simulation coupling |
| Owner | Platform KG (infra) + Engineering Core (payloads) | Operational Digital Twin (kernel + module) |
| Example | Decision EDN-014 BASED_ON Assumption X, AFFECTS Baseline BL-04 | Crusher CR-101 running hours, bearing temp, installed liner set |

An asset MAY be `REPRESENTED_BY` a twin (`engineering_assets.digital_twin_id`). That pointer is not a thread substitute.

**Intentional kernel vs module twin separation** is preserved (ADR-D6):

- Kernel `digital_twins` — platform twin identity.
- `@rtb/digital-twin` / `digital_twin_identities.kernel_twin_id` — module product.

Neither layer is the Engineering Digital Thread.
