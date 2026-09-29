# EOS-A1 Engineering Review Boundary

Status: **FROZEN** for planning. No ERA/PI runtime, schema, or data migration in EOS-A1.

Evidence HEAD: `0dd05bf124c19e1fbb8099f396a904ec86a2d020`

Packages: `@rtb/engineering-review` (engine), `@rtb/engineering-review-persistence` (hosted store).  
Migration: `supabase/migrations/20260919120000_engineering_review_persistence.sql`.

ADR-014 (EOS-A0C): ERA packages are the Review bounded-context seed. This document plus ADR-D2 freeze composition with PI Findings.

---

## 1. Existing ERA packages and tables

### 1.1 Domain engine (`packages/engineering-review/src`)

Evidence objects (not exhaustive): `review-package.ts`, `review-run.ts`, `finding.ts`, `evidence.ts`, `disposition.ts`, `lifecycle.ts`, `review-scope.ts`, `ownership.ts`, `adapters/pi-input.ts`.

| Concept | Code contract |
| --- | --- |
| Review document roles | `specification`, `drawing`, `calculation`, `basis`, `other` |
| Package status | `draft`, `ready`, `in_review`, `completed`, `archived` |
| Run status | `queued`, `running`, `completed`, `failed`, `cancelled` |
| Finding categories | `cross_document_inconsistency`, `missing_information`, `requirement_traceability_gap`, `unsupported_assumption`, `revision_inconsistency`, `missing_engineering_evidence`, `other_observation` |
| Finding verification | `unverified`, `evidence_verified`, `insufficient_evidence`, `revoked` |
| Disposition actions | `assign`, `accept`, `reject`, `modify`, `close`, `reopen` |
| Ownership | `tenantId` + `workspaceId` + `projectId` immutable |

### 1.2 Persistence tables

| Table | Responsibility |
| --- | --- |
| `engineering_review_packages` | Named package; `documents` JSONB; FK `engineering_projects` |
| `engineering_review_runs` | Scoped execution; `scope`, `input_documents`, `rules`, `provenance` JSONB |
| `engineering_review_findings` | Governed findings bound to package+run+ownership |
| `engineering_review_evidence` | Attributable evidence rows |
| `engineering_review_dispositions` | Human dispositions |

Triggers prevent ownership mutation and require workspace/project consistency. Documents on a package are validated by trigger.

ERA Review **reads** Engineering Core `engineering_projects` / `engineering_documents`. It does not own those tables.

---

## 2. ERA canonical responsibilities

Engineering Review **owns**:

- Review Package, Review Run, ERA Finding, ERA Evidence, Disposition, Verification state, Review Type (future attribute), Review Scope.
- Detector pipeline and fail-closed evidence rules.
- Review-specific security (MFA/AAL2 on `/review`, malware scan policy, immutable ownership).
- Anti-corruption input from PI (`adapters/pi-input.ts` — snapshot only, no reverse package import).

Engineering Review **does not own**:

- Project, Asset, Document identity.
- `engineering_decisions`.
- PI Findings lifecycle.
- Knowledge graph infrastructure.
- Job kernel.
- Digital twin runtime.
- Requirement/Assumption master data (it may *detect gaps* against documents).

---

## 3. PI Findings responsibilities

Table: `project_intelligence_findings` (`20260806120000_batch_41_project_intelligence_findings.sql`).

Header comment in migration: *Findings Intelligence owns consolidated finding lifecycle records. Document Intelligence retains `project_intelligence_document_findings` as source rows. No competing Engineering Core register tables.*

PI Findings **own**:

- Product/domain-specific **detected** findings (`source_type`, `source_feature`, `source_id`).
- Candidate → confirmed lifecycle, duplicate groups, conflict state.
- PI-local `evidence` / `citations` JSONB.
- Soft delete (`deleted_at`).
- Optional `core_record_id` / `core_record_type` pointers into Core registers.

PI Findings **must not**:

- Be deleted or silently renamed into ERA Findings.
- Become the requirement, assumption, or decision system of record.
- Duplicate ERA disposition/evidence engines.

---

## 4. Module review responsibilities

| Surface | Status | Rule |
| --- | --- | --- |
| Engineering Workflow SDK `EngineeringReviewRecord` | Present in `@rtb/engineering-os` workflow-sdk | **Routing/workflow record**, not an ERA Finding. Do not persist SDK records as `engineering_review_findings`. |
| Inspection Intelligence / other V1 modules | Module-local review tasks | May produce evidence or PI-source findings; may later *submit* a Review Package. |
| Model mapping reviews | `engineering_model_mapping_reviews` | Mapping confirmation (`confirm/reject/…`), not ERA. `ai_self_approval` forbidden. |
| Project Controls decision reviews | `project_controls_decision_reviews` | Advisory controls, not ERA. |

---

## 5. Vendor archive status

Legacy standalone folder `C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\Engineering OS` is **read-only reference** (ADR-002, EOS-A0C inventory). Vendor or desktop review tools in that tree are **not** ERA. They are migration candidates for later adapter phases, not a parallel findings product.

Do not copy vendor finding schemas into `engineering_review_*` or `project_intelligence_findings` in EOS-A1.

---

## 6. Future composition principle

```
PI Finding  (detected, product-owned)
    └── may *cite* or *promote into* → ERA Finding (governed, review-owned)
            └── optional later link to Core Record (decision, action, risk)
```

Rules:

1. Promotion is explicit, attributable, and reversible in disposition — never an implicit overwrite.
2. ERA may consume PI documents via `pi-input` snapshots as **untrusted content**.
3. A PI Finding may remain PI-only forever (informational detection).
4. An ERA Finding may exist with no PI counterpart (pure review-package run).
5. Shared identifiers, if added later, are **links**, not merged tables.
6. No adapter implementation in EOS-A1. No data migration in EOS-A1.

Semantic relationship frozen:

- **PI Finding** = product/domain-specific detected finding.
- **ERA Finding** = governed engineering-review finding.

---

## 7. Prohibited duplication

Do not create:

- A third findings table in Engineering Core.
- A “Decision Finding” store that clones ERA categories.
- Optimization-owned findings that bypass Review.
- Graph nodes that *are* findings without a row in ERA or PI.
- Duplicate evidence stores that silently drop ERA verification states.

Existing duplication to **live with** until composed: PI Findings vs ERA Findings vs SDK review records vs mapping reviews vs Controls decision reviews. Composition is ADR-governed, not a merge sprint.
