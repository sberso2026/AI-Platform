# EOS-A4 Implementation — Requirements, Change, Impact & Configuration Intelligence

Status: **implemented** and applied to staging `rntonzigxwxcjlcsadip`.

Evidence branch: `cursor/era-7a-engineering-review-pilot-gate`  
Migration: `supabase/migrations/20260929210000_eos_a4_requirements_change_impact_configuration.sql`

Does not implement Optimization, Value Intelligence, discipline engines, Platform KG migration, or Digital Twin redesign.

---

## Part 1 classification (existing concepts)

| Concept | Classification |
| --- | --- |
| ERA `requirement_traceability_gap` / extracted requirements | PROJECTION (document facts, not the canonical Requirement) |
| PI document-structure `requirements[]` | MODULE_LOCAL / PROJECTION |
| Compliance Intelligence seed requirements | MODULE_LOCAL |
| `project_controls_change_candidates` / `_states` | MODULE_LOCAL (advisory; not engineering change authority) |
| Asset lifecycle `status` | NOT_EQUIVALENT |
| `engineering_documents.revision` / document versions | NOT_EQUIVALENT (Document Version ≠ Configuration Baseline) |
| Model mapping `state` | NOT_EQUIVALENT |
| Digital Twin / thread snapshots | DIGITAL_TWIN_ONLY |
| A1 taxonomy `ALLOCATED_TO`, `AFFECTS`, `CAUSED_BY` | CANONICAL_CANDIDATE (already in `relationship_governed` CHECK from A2) |
| No `engineering_requirements` / `_changes` / `_impacts` / `_configuration_*` before A4 | confirmed |

Project Controls change intelligence is **not** absorbed. Core Change is a separate canonical object.

---

## Requirement architecture

Canonical table: `engineering_requirements`.

Identity: `id`, `tenant_id`, `workspace_id` (NOT NULL), `project_id`, `requirement_code` unique `(tenant_id, workspace_id, requirement_code)`, `title`.

Content: `statement`, `requirement_type`, `source`, `rationale`.

Governance: `status` (`draft|active|superseded|retired|waived`), `priority`, `owner_id`, `verification_status`, `acceptance_criteria`.

Provenance: `created_by`, `created_at`, `updated_at`.

**REQUIREMENT ≠ DOCUMENT.** Documents may evidence a requirement (`VERIFIED_BY`). They are not the requirement.

**REVIEW FINDING ≠ REQUIREMENT.** ERA/PI findings remain their bounded contexts.

---

## Requirement types

Governed vocabulary (no free-text writes):

`FUNCTIONAL | PERFORMANCE | SAFETY | REGULATORY | CLIENT | DESIGN | OPERABILITY | MAINTAINABILITY | ENVIRONMENTAL`

A1 listed “operational”; A4 uses **OPERABILITY** as specified for this phase.

---

## Acceptance / verification model

**Approach A** (smallest coherent design): structured fields on `engineering_requirements`.

- `acceptance_criteria` TEXT summary
- `verification_method` `ANALYSIS | INSPECTION | TEST | DEMONSTRATION | REVIEW | CERTIFICATION`
- `verification_status` `unverified | in_progress | verified | waived | failed`
- `verification_evidence_ref` plus optional `VERIFIED_BY` object link to `document` or `review_package`

No child `engineering_requirement_acceptance_criteria` / `_verifications` tables. Commissioning workflows are out of scope.

---

## Requirement allocation

Governed `engineering_object_links` only. Relation: **ALLOCATED_TO**.

Allowed targets: `system`, `asset`, `interface`, `document`.

No parallel allocation table. Cross-tenant/workspace links fail at RLS (`engineering_object_link_resolve` + `engineering_core_link_endpoint_allowed`).

Requirement–requirement: only **DEPENDS_ON** (already in A1 taxonomy). `DERIVED_FROM` / `REFINES` were not added; they are not required by implemented A4 APIs.

Assumption composition: **ASSUMPTION USED_BY REQUIREMENT**. Assumption data is not copied onto the requirement row.

---

## Change architecture

Canonical table: `engineering_changes`.

Types: `DESIGN | SCOPE | TECHNICAL | SAFETY | REGULATORY | INTERFACE | REQUIREMENT | CONFIGURATION | OTHER`

Statuses (controlled engineering change, not generic tasks):  
`proposed → assessing → approved → implementing → implemented → verified`  
with `rejected` / `cancelled` terminals. Application-layer transition map; no autonomous approval.

---

## Impact architecture

Canonical table: `engineering_impacts`. **Impact is not a Change.**

Types: `TECHNICAL | SAFETY | COST | SCHEDULE | INTERFACE | REQUIREMENT | CONFIGURATION | OPERABILITY`

`status`: `candidate | confirmed | rejected | closed`

- `candidate` = **DISCOVERED_DEPENDENCY** / proposed consequence
- `confirmed` = **CONFIRMED_ENGINEERING_IMPACT** after an explicit human confirm

Cause: **IMPACT CAUSED_BY CHANGE** via object links (not a JSON affected-object list).

Targets: **IMPACT AFFECTS ENGINEERING_OBJECT**.

---

## Change vs Impact

Change answers “what changed?”. Impact answers “what consequence was identified?”. Traversal never auto-confirms.

---

## Finite impact propagation

`traverseImpactCandidates`:

- start at a Change
- whitelist: `ALLOCATED_TO`, `CONTAINS`, `USES`, `AFFECTS`, `DEPENDS_ON`, `CONNECTS`, `USED_BY`
- max depth 4
- cycle-safe (`seen` set)
- tenant-scoped link query (workspace membership already on the objects)
- returns `DISCOVERED_DEPENDENCY` only
- does **not** insert Impact rows

Example: CHG AFFECTS R-01 ALLOCATED_TO SYS-01 CONTAINS A-01 → candidates R-01, SYS-01, A-01.

---

## Configuration architecture

`engineering_configuration_baselines` is a named valid set of objects at a stage.

Types: `DESIGN | FEED | IFC | INSTALLED | AS_BUILT | COMMISSIONED | OPERATIONAL | MODIFICATION`  
(`IFC` = Issued-for-Construction **state**, not the IFC file format.)

Statuses: `draft | frozen | superseded | archived`.

New baselines are always `draft`. A Change does **not** auto-create a baseline.

Flow remains: Existing Baseline → Change → Impact Assessment → Engineering Work → Verification → **controlled** New Baseline.

---

## Configuration items and snapshot semantics

`engineering_configuration_items` stores a **point-in-time snapshot**: `object_type`, `object_id`, optional `revision_ref`, `object_code_snapshot`, `object_title_snapshot`, `effective_state`, `captured_at`, `provenance`.

**Limitation:** Core objects generally lack a full historical version model. The snapshot is the captured fields, not a reconstructed “object as of date” from event sourcing. `revision_ref` is populated only when a revision identity is supplied (typically document revision). It is **not fabricated**.

Live object rows may continue to change after freeze. Historical validity is the item row, not a join to today’s object.

Delete of a referenced object while an item exists is **RESTRICT** (`engineering_core_prevent_delete_while_configuration_item`).

Items must resolve to the same tenant/workspace as the baseline.

---

## Baseline immutability

Once `frozen` / `superseded` / `archived`:

- identity fields cannot be rewritten
- items cannot be added or removed
- frozen baselines cannot be deleted
- the allowed mutation is `frozen → superseded|archived`

Supersession: create a new **draft** baseline with `supersedes_baseline_id` and governed **SUPERSEDES** link; mark the prior frozen baseline `superseded`; optionally copy item snapshots into the new draft. Traceability is the FK + SUPERSEDES link, not an in-place rewrite.

---

## Change vs Configuration

Change = controlled modification. Configuration = which combination was valid at a baseline. They are different tables and different questions.

---

## Configuration vs Document Version

A Document Version is one information-object revision. A Configuration Baseline can include many documents, systems, decisions, and interfaces **together**. A4 does not merge document versioning into configuration management.

---

## Digital Thread contribution

Relational identity stays in Engineering Core. Thread edges stay in governed `engineering_object_links`. No third graph store.

Chain now expressible:

Requirement —ALLOCATED_TO→ System/Asset/Interface  
Assumption —USED_BY→ Requirement  
Change —AFFECTS→ Engineering Object  
Impact —CAUSED_BY→ Change; Impact —AFFECTS→ Object  
Configuration Baseline —items snapshot→ Object (+ SUPERSEDES prior baseline)  
Decision —BASED_ON / SUPPORTED_BY / SELECTS→ existing A2 objects, composable with Change/Impact

ERA Review may later `REVIEWS` Requirement/Change/Impact/Baseline. Findings are not auto-promoted.

PI Findings remain PI-owned. `FORBIDDEN_DIRECT_CORE_WRITES` includes the new Core tables.

---

## Relation taxonomy

No new relation **names**. A4 writes existing A1 codes:

| Code | A4 use |
| --- | --- |
| ALLOCATED_TO | Requirement → System/Asset/Interface/Document |
| AFFECTS | Change/Impact → engineering object |
| CAUSED_BY | Impact → Change |
| DEPENDS_ON | Requirement → Requirement |
| USED_BY | Assumption → Requirement |
| VERIFIED_BY | Requirement → Document/Review Package |
| BASED_ON | Change → Decision |
| SUPERSEDES | Baseline → prior Baseline |
| SELECTS / SUPPORTED_BY | reuse A2 where semantically valid |

`DERIVED_FROM` / `REFINES` not added.

---

## RLS / security

A2C/A3 workspace fail-closed:

`tenant_id = ANY(get_user_tenant_ids()) AND engineering_core_workspace_member(workspace_id)`

Insert/update also require `has_permission('engineering','execute')`. Delete requires admin + workspace membership.

Object-link resolve extended with `requirement`, `change`, `impact`, `configuration_baseline`.

---

## APIs

`/api/engineering/requirements` — list, get, create, update, allocate/unallocate, link assumption/evidence  
`/api/engineering/changes` — list, get, create, update, link/unlink AFFECTS, BASED_ON decision, discover candidates  
`/api/engineering/impacts` — list, get, create, update, confirm/reject, link cause/affected  
`/api/engineering/configuration` — list, get, create, add/remove item, freeze, supersede, compare

---

## UI

Minimal registers (no graph visualization, no Optimization UI):

- `/engineering/requirements`
- `/engineering/changes` (impacts nested; no dedicated Impact register)
- `/engineering/configuration`

---

## Audit

Reuses `EngineeringObjectFramework` timeline/activity (`publishCreated`, `recordTimeline`). No new audit subsystem.

Material events: requirement create/statement/allocation/verification/acceptance; change create/status/affected; impact create/severity/status/cause; baseline create/item add-remove/freeze/supersede.

---

## Limitations

1. Snapshot fidelity is captured fields, not a full object-version history.
2. Requirement–requirement graph is DEPENDS_ON only.
3. Impact traversal is bounded and advisory.
4. No autonomous change approval or automatic new baseline.
5. Model objects are not first-class configuration-item resolve types unless they already resolve through `engineering_object_link_resolve`.
