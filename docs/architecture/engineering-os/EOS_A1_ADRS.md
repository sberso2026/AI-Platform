# EOS-A1 Architecture Decision Records (ADR-D1 to ADR-D6)

Status: **ACCEPTED** for planning. None of these ADRs authorize schema, data migration, queue refactor, flag migration, or runtime changes in EOS-A1.

Evidence HEAD: `0dd05bf124c19e1fbb8099f396a904ec86a2d020`  
Branch: `cursor/era-7a-engineering-review-pilot-gate`

Supersedes nothing in `ARCHITECTURE_DECISIONS.md` (ADR-001–014). Completes the six duplication ADRs required by EOS-A1. ADR-004 (Review bounded context) and ADR-005 (PI Findings) remain in force; D2 details composition.

---

## ADR-D1 — Canonical engineering decision ownership

**Decision:** `engineering_decisions` (Engineering Core, batch_205) is the canonical Engineering Decision object. Decision Intelligence is a capability **on those records**, not a replacement register.

**Context:**

| Implementation | Evidence | Role |
| --- | --- | --- |
| Engineering Core `engineering_decisions` | `decision_number`, `rationale`, `alternatives` JSONB, `confidence`, `approval_status`, `approved_by`, project/asset FKs, `knowledge_node_id` | **Canonical** |
| Project Controls `project_controls_decision_states` (+ evidence/confidence/reviews) | batch_68: *Decision Support is ADVISORY*; `decision_unit_id`; not project/contract approval | **Advisory controls** — must not merge |
| Vendor / legacy decision graphs | Standalone Engineering OS folder (read-only inventory) | **Archive / future adapter candidate** |
| Future Decision Intelligence | EOS-A2+ | Compose Core records (question, alternatives as children, trade-offs, assumption links) |

Replacement of `engineering_decisions` is **not** justified by repository evidence. Columns already cover rationale, alternatives, confidence, and approval.

**Consequences:**

- Do not merge Project Controls or vendor models in EOS-A1 or as a silent A2 rewrite.
- Controls may *link to* an `engineering_decisions.id` later; they must not become the engineering system of record.
- ERA Review Packages may relate to a Decision; they do not own it.
- Optimization Study outputs feed Decision via `SELECTS` Alternative — they do not create a parallel decision table.
- No data merge in this phase.

---

## ADR-D2 — Engineering Review vs PI Findings

**Decision:** Keep both stores. Semantic split:

- **PI Finding** = product/domain-specific **detected** finding (`project_intelligence_findings`).
- **ERA Finding** = **governed engineering-review** finding (`engineering_review_findings`).

PI Findings are not deleted and not silently redefined as ERA Findings.

**What PI owns:** candidate/confirmed detection lifecycle, source feature identity, PI-local evidence JSONB, duplicate/conflict handling, optional `core_record_*` pointers, soft delete.

**What ERA owns:** Review Package/Run, fail-closed Evidence, verification state, human Disposition, review scope/rules/provenance, `/review` security boundary.

**Future composition:** explicit promotion or citation PI → ERA (optional). Never implicit overwrite. ERA may already consume PI documents via `adapters/pi-input.ts` as untrusted snapshots.

**Must not be duplicated:** a third Core findings table; Optimization findings; graph-only findings; merging PI `deleted_at` rows into ERA without a migration ADR.

**Module / vendor:** Workflow SDK `EngineeringReviewRecord`, mapping reviews, Controls decision reviews, and legacy vendor tools are **not** ERA Findings.

**Consequences:** No adapters and no data migration in EOS-A1. Detailed boundary: `ENGINEERING_REVIEW_BOUNDARY.md`.

---

## ADR-D3 — Canonical Engineering Digital Thread graph

**Decision:** Do **not** add a third graph persistence layer. Platform Knowledge Graph (`knowledge_nodes` / `knowledge_edges`) is the future host/representation of the **Engineering Digital Thread**. PI Knowledge Graph remains a **projection** (CONFIRMED_DUPLICATION). Engineering `engineering_object_links` remain operational Core links that should later **project** onto Platform KG using the finite relation taxonomy.

**Context:**

- Core objects already FK `knowledge_node_id`.
- PI has `project_intelligence_knowledge_*` and `EngineeringKnowledgeGraph`.
- Digital Twin Phase 12K (`digital_twin_thread_*`, batch_84) already stores **twin-scoped thread references** with `knowledge_graph_reuse = true` and `composition_mode = references_only`. That is **not** a third graph store; it is also **not** the Engineering Digital Thread of record.
- `@rtb/digital-twin` ownership-lock currently says the module **owns** concern `digital_thread`. EOS-A1 interprets that as ownership of **Twin Thread composition**, not of enterprise engineering provenance.

**Goal:** one writer of canonical *engineering* thread edges on Platform KG; PI reads a projection; Twin Thread continues to reference KG/Core objects without duplicating payloads.

**Consequences:** No Neo4j, no new `engineering_digital_thread_*` graph tables, no PI KG expansion as thread-of-record, no widening of `digital_twin_thread_*` into a general engineering graph in A1–A2. Taxonomy frozen in `DOMAIN_RELATIONSHIP_MODEL.md`. Architecture: `DIGITAL_THREAD_ARCHITECTURE.md`.

---

## ADR-D4 — Job execution ownership

**Decision:** Document existing multiple queues; **do not refactor** in EOS-A1. Future convergence principle: **Platform Kernel JobService** is the shared executor. Engineering execution, PI claim jobs, and commerce outbox/scheduler become **clients or job kinds**, not peer kernels.

**Current evidence (CONFIRMED_DUPLICATION):**

| Queue / worker | Context |
| --- | --- |
| Kernel `background_jobs` / JobService | Platform |
| Commerce outbox / scheduler | Entitlement, billing, provision |
| PI claim jobs | Project Intelligence processing |
| `engineering_execution_jobs` | Engineering analysis/execution host |

**Consequences:** Analysis/Optimization later must not add a fifth independent kernel. A later ADR may pick the physical merge; A1 only freezes the principle. Review runs may enqueue work but ERA does not own a global job OS.

---

## ADR-D5 — Feature flag canonicalization

**Decision:** Canonical **product/capability** name is **`engineering_os`** (commerce catalogue / entitlement; product id `c1000000-0000-4000-8000-000000000001`). `engineering_os_enabled` is a **feature gate flag**, not a second product. Future: the flag should alias the same semantic (enable surfaces only when the capability exists), not mint a parallel Engineering OS.

**Context:** CONFIRMED_DUPLICATION of `engineering_os` vs `engineering_os_enabled`. `/engineering` uses `requireProductEntitlement(..., "engineering-os")`.

**Consequences:** Do not migrate flags in EOS-A1. Do not introduce a third name (`eos`, `engineeringOS`, etc.) in new docs or APIs. Semantic owner of the **capability** is Platform Commerce; owner of the **gate flag** is Platform Kernel flags. Engineering OS consumes both; it does not own a private flag store.

---

## ADR-D6 — Digital Twin separation

**Decision:** Operational Digital Twin and Engineering Digital Thread are distinct. Preserve existing **intentional** kernel twin vs module twin separation.

**Why thread ≠ twin:** Thread answers “how are engineering objects related, with provenance?” Twin answers “what is the operational/physical state?” Storing thread as telemetry (or twin as object_links) would collapse Change/Configuration/Review history into runtime state.

**Kernel vs module:**

- Kernel `digital_twins` — platform identity; Core FKs `digital_twin_id`.
- Module `@rtb/digital-twin` / `digital_twin_identities.kernel_twin_id` — product twin, including Phase 12K Twin Thread **references**.

Evidence does not require a merge ADR. A future merge would need a dedicated ADR with dual-write evidence.

**Consequences:** Engineering Digital Thread lives toward Platform KG (ADR-D3). Twin Thread composition stays on the module (batch_84), by reference only. Twin runtime is unchanged in EOS-A1. Assets may be `REPRESENTED_BY` a twin without the twin owning System/Asset identity.
