# ERA-0 — RTB Engineering Review AI

**Product boundary, reuse audit & MVP architecture**

| Field | Value |
| --- | --- |
| Status | ERA-0 architecture only — **no production implementation** |
| Repository | `rtb-ai-os` |
| Root | `C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\AI Platform` |
| Branch | `cursor/eos-ux-1-operational-experience` |
| Baseline SHA | `4e7cf3e859fbc7b868de3f73b61823422914f2af` |
| Working tree | Clean at audit start |
| Package candidate | `packages/engineering-review` → `@rtb/engineering-review` (**not created in ERA-0**) |
| Verdict | **PASS_WITH_LIMITATIONS** |

This report inspects **actual implementation**, not README claims. Named packages and tables are treated as real only where code, schema, and tests demonstrate behaviour.

---

## 1. Executive summary

Engineering Review AI can be productized as a **bounded commercial application** on the existing RTB AI Platform. It must **not** replace Engineering OS, absorb Project Intelligence, or claim professional engineering certification.

The platform already provides the hard parts of a first-pass review product:

- Tenant, workspace, identity, commerce, audit, and RBAC (`@rtb/platform-core`, `@rtb/platform-commerce`).
- Canonical projects and documents (`engineering_projects`, `engineering_documents`).
- PDF/DOCX/TXT ingestion, chunking, hybrid retrieval, citations, and grounded answers (`@rtb/project-intelligence`).
- Human-gated findings lifecycle, evidence rules, and Core-conversion proposals (`packages/project-intelligence/src/findings/*`).
- Advisory AI authority, claim verification, and structural completeness (`@rtb/engineering-os` E2–E12).

What does **not** exist is a systematic **design-package review engine**:

- No review package, review scope, or review run domain.
- No cross-document consistency engine (revision comparison is same-document line-diff only).
- No requirements system of record / traceability graph.
- Project Intelligence “Findings Intelligence” UI is a **shell**; document-worker findings today are mainly **parser-warning candidates**, not design-review observations.
- Engineering Core RLS is **tenant-scoped**, not workspace-scoped. PI document/finding tables are tenant **and** workspace scoped.

**Product recommendation:** create `@rtb/engineering-review` in ERA-1 as a **product domain package** that **reuses** Project Intelligence document intelligence and Engineering OS shared contracts, and **owns** Review Package / Run / Finding / Register. Do not store review findings as the PI findings table of record. Do not make platform-core, platform-kernel, platform-intelligence, or engineering-os depend on the new package.

**Authority recommendation:** inherit the certified E12 rule that AI is advisory. Reuse the Project Intelligence findings state machine rather than inventing a competing one. Map product language (`CANDIDATE` … `CLOSED`) onto those existing states.

---

## 2. Existing architecture map

### 2.1 Platform composition (locked)

```text
RTB AI Platform
  → Operating Systems (Engineering OS installed/licensed)
      → Modules / Applications (Project Intelligence, Inspection, …)
          → Features (documents, meetings, findings, reports)
```

Canonical product model: `docs/architecture/RTB_AI_PLATFORM_PRODUCT_MODEL.md`.  
Engineering OS is the **composition and governance shell**, not a seventh intelligence product: `docs/architecture/ENGINEERING_OS_PRODUCT_BOUNDARY.md`.

Engineering Review AI should sit as a **focused commercial application under Engineering OS**, with its own frontend shell (`/review`), consuming shared platform and PI capabilities. It is not an OS, not Business OS, and not a replacement for `/engineering/*`.

### 2.2 Package graph (relevant)

```text
apps/web
  → @rtb/engineering-os
  → @rtb/project-intelligence
  → @rtb/platform-core
  → @rtb/platform-kernel
  → @rtb/platform-intelligence
  → @rtb/platform-commerce
  → @rtb/database / @rtb/types / @rtb/ui / @rtb/plugin-sdk

@rtb/project-intelligence
  → @rtb/engineering-os
  → @rtb/types

@rtb/engineering-os
  → @rtb/platform-kernel
  → @rtb/platform-intelligence
  → @rtb/platform-commerce
  → @rtb/database / @rtb/types

@rtb/platform-kernel
  → @rtb/platform-core
  → @rtb/platform-intelligence
  → @rtb/database / @rtb/types
```

Observed implication: **any consumer of `@rtb/project-intelligence` already pulls `@rtb/engineering-os` transitively.** Engineering Review can therefore depend on PI without adding a new circular edge, provided Engineering OS never imports `@rtb/engineering-review`.

### 2.3 What is actually implemented

| Concern | Real implementation | Maturity |
| --- | --- | --- |
| Auth / session | `@rtb/platform-core` `AuthService` (`packages/platform-core/src/auth.ts`); Supabase `auth.users` + `profiles` | Production |
| Tenant / workspace | `tenants`, `workspaces`, `tenant_memberships`, `workspace_memberships` (`supabase/migrations/20260101000000_platform_core.sql`); `TenantService` | Production |
| RBAC | `roles.permissions` JSON; `PermissionService`; Engineering map in `packages/engineering-os/src/permissions.ts` including `engineering.document.review` | Production, coarse |
| Commerce / entitlement | `@rtb/platform-commerce`; EOS `assertEngineeringService` (`packages/engineering-os/src/commerce/service-guard.ts`); PI fail-closed access chain (`packages/project-intelligence/src/security/access-guard.ts`) | Production |
| Projects | `engineering_projects`; `EngineeringProjectService` (`packages/engineering-os/src/services/core-services.ts`) — **application-layer workspace filter** | Production |
| Documents (SoT) | `engineering_documents`, `engineering_document_versions` | Production |
| Storage | Supabase bucket `engineering-documents`; signed upload/download (`apps/web/src/lib/engineering/document-storage.ts`) | Production |
| Ingestion | PI jobs + state machine (`packages/project-intelligence/src/documents/ingestion-state-machine.ts`, `document-worker.ts`); tables in `20260712180000_batch_36_project_intelligence_documents.sql` | Production |
| PDF / DOCX / TXT | `PdfDocumentParser` (`pdf-parse`), `DocxDocumentParser` (`mammoth`), `NativeTextDocumentParser` (`native-parsers.ts`, `parser.ts`) | Production with OCR gap |
| Chunking | `chunking.ts` — structural parse via EOS `parseEngineeringStructure` | Production |
| Embeddings | `project_intelligence_document_embeddings.embedding` as **JSONB float arrays** (no pgvector) | Production, limited |
| Retrieval | `ProjectIntelligenceDocumentRetrievalService` — lexical + optional vector, structural rerank, fail-closed auth | Production |
| Grounded Q&A | PI `buildGroundedAnswer`; EOS `runGroundedEngineeringAsk`, `verifyClaimsAgainstEvidence` | Production (Ask / document QA) |
| Citations | `DocumentCitation` (`documents/types.ts`); PI citation tables | Production |
| Document findings | `project_intelligence_document_findings`; worker inserts **parser-warning** candidates | Partial |
| Findings Intelligence | Domain lifecycle/intake/evidence/review-queue **certified**; UI is a placeholder page | Domain-complete, product-incomplete |
| Registers | `engineering_decisions/actions/risks/issues/technical_queries/lessons` + `Engineering*Service` | Production |
| Comments / attachments | `engineering_object_comments`, `engineering_object_attachments` | Production, tenant RLS only |
| Workflow SDK | `EngineeringReviewRecord` in `packages/engineering-os/src/workflow-sdk/index.ts` is a **generic workflow review**, not a design-package review | Reusable primitive |
| Knowledge graph | Kernel `KnowledgeGraphService` (`knowledge_nodes/edges/evidence_items`); PI `EngineeringKnowledgeGraph` is in-memory **refs only** | Infrastructure + domain refs |
| AI Director | `packages/platform-kernel/src/ai-director/ai-director.ts` — intent, adapters, policy, traces | Production runtime |
| Model routing | `ModelRegistryService` | Production |
| Prompts | `PromptRegistryService`; seed `engineering_reviewer_prompt` (advisory, no approvals) | Production |
| Policy | `PolicyEngineService`; seed `engineering_review_required` | Production |
| Audit | Immutable `audit_events`; PI document audit; finding events | Production |
| Evaluation | Platform `EvaluationFrameworkService` uses **placeholder random scores**; EOS E11 KPI catalog is real **contracts**; PI document QA gold-set exists in `docs/pilot/EOS-AI-DOC-QA-1/` | Mixed |
| E12 certification | `packages/engineering-os/src/phase-e12/*` — authority: AI cannot approve; assurance ≠ sign-off | Certified — **do not alter** |
| Plugin SDK | Manifest validation / install hooks (`packages/plugin-sdk/src/index.ts`) | Usable for product registration |
| UI kit | `@rtb/ui` primitives (cards, status chips, evidence visuals) | Reuse for shell |

### 2.4 Explicit non-implementations (name ≠ capability)

| Name | What it is **not** |
| --- | --- |
| `EngineeringReviewRecord` (Workflow SDK) | Not an Engineering Review Package / Register |
| `engineering_reviewer_prompt` | Not a review engine; advisory prompt only |
| Findings Intelligence page | Not an operational review register |
| `ProjectIntelligenceDocumentComparisonService` | Not cross-document consistency; same-document revision line-diff |
| Platform `EvaluationFrameworkService.executeRun` | Not a trustworthy accuracy harness (random scores) |
| Kernel digital twin / asset intelligence / inspection workflows | Not design-package review |
| `security_assurance_findings` | Security-assurance domain, unrelated |

---

## 3. Reuse matrix

Classification: **REUSE** / **EXTEND** / **NEW** / **DEFER** / **PROHIBITED**.

### 3.1 Platform capabilities

| Capability | Class | Existing implementation | Location | Maturity | Gaps | Review use | Modify existing? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Authentication | REUSE | Supabase Auth + `AuthService` | `packages/platform-core/src/auth.ts` | Production | None for MVP | Same session as platform | No |
| Tenant / workspace | REUSE | Tenant/workspace membership | `packages/platform-core/src/tenant.ts`; `20260101000000_platform_core.sql` | Production | Core engineering tables RLS are tenant-only | Inherit tenant+workspace on all review rows | No existing tables; new tables must be workspace-scoped |
| Projects | REUSE | `engineering_projects` + `EngineeringProjectService` | `packages/engineering-os/src/services/core-services.ts` | Production | Service filters workspace; RLS does not | Review Package belongs to a project | No |
| Documents | REUSE | `engineering_documents` metadata SoT | `20260203000000_batch_20_engineering_tables.sql`; `EngineeringDocumentService` | Production | No package membership | Package documents **reference** these IDs | No |
| Storage | REUSE | Bucket `engineering-documents` | `apps/web/src/lib/engineering/document-storage.ts`; `packages/project-intelligence/src/documents/storage-fetch.ts` | Production | 25 MiB pilot limit; PDF/TXT/DOCX only | Upload via existing document APIs | No |
| Document ingestion | REUSE | PI ingestion + worker | `document-worker.ts`; `ingestion-state-machine.ts`; PI document tables | Production | Findings extraction is warning-only | Review runs only on `ready` / `ready_with_warnings` | No |
| Text extraction | REUSE | pdf-parse, mammoth, native text | `native-parsers.ts` | Production | Scanned PDFs flag OCR but **do not silently OCR**; no CAD/DWG | Text-bearing PDFs/DOCX/TXT only in V1 | No |
| Engineering metadata | REUSE | Filename/text proposals, identity, revision rules | `packages/engineering-os/src/services/document-registration.ts`, `document-identity.ts`; PI `metadata-proposal.ts` | Production | Human metadata review still required | Scope by discipline / document type / revision | No |
| Retrieval | REUSE | Hybrid retrieval, fail-closed auth | `packages/project-intelligence/src/documents/retrieval-service.ts` | Production | Vector is JSONB; recall gate not met on holdout | Review engine queries scoped to package document IDs | No |
| Grounded search | REUSE | PI grounded answer + EOS Ask | `documents/grounded-answer.ts`; `packages/engineering-os/src/services/grounded-ask.ts` | Production | Ask is Q&A, not package review | Evidence lookup and abstention | No |
| Evidence / citations | REUSE | `DocumentCitation`; immutable lineage helpers | `documents/types.ts`; `findings/evidence.ts` | Production | Evidence JSON on findings is not a first-class evidence table for review | Every finding must cite retrievable chunks | No |
| Knowledge graph | DEFER (runtime) / REUSE (infra) | Kernel KG + PI ref graph | `packages/platform-kernel/src/knowledge-graph/`; `packages/project-intelligence/src/knowledge/graph.ts` | Infra real; PI graph in-memory | Not a requirements/traceability SoT | Optional later linking; **not** V1 engine | No |
| AI orchestration | EXTEND | AI Director + EOS grounded ask + E5 reasoning | `packages/platform-kernel/src/ai-director/`; EOS `ai-framework.ts`, `phase-e5/` | Production advisory | No review-run orchestrator | New review pipeline **calls** these; does not fork a second AI stack | No (add adapters only) |
| Model routing | REUSE | `ModelRegistryService` | `packages/platform-intelligence/src/model-registry/` | Production | Mock fallback exists | Route review intents via existing registry | No |
| Prompt management | EXTEND | Prompt registry + `engineering_reviewer_prompt` | `prompt-registry-service.ts`; EOS `manifest.ts`; seed SQL | Production | No versioned review-rule prompts | Add review-run prompt keys; keep “do not approve” | Additive prompt keys only |
| Policy controls | EXTEND | Policy engine + `engineering_review_required` + classification AI | `policy-engine-service.ts`; `packages/engineering-os/src/security-closure/classification-ai-policy.ts` | Production | Review product policy not named | Fail-closed on classification / provider / deny | Additive policies; do not weaken |
| Audit logging | REUSE | Immutable `audit_events`; PI document audit; finding events | `packages/platform-core/src/audit.ts`; PI audit tables | Production | Need review-specific actions | Log package/run/disposition | No |
| Permissions | EXTEND | `engineering.document.review`, `engineering.ai.use`, `engineering.report.create` | `packages/types/src/engineering.ts`; `packages/engineering-os/src/permissions.ts` | Coarse | No finding-disposition permission | Map reviewer vs viewer vs assigner | Additive permission keys in ERA-1 |
| RLS | EXTEND | PI docs/findings: tenant + workspace membership; Core engineering: tenant only | `20260712180000_batch_36_*`; `20260806120000_batch_41_*`; `20260203000001_batch_20_engineering_rls.sql` | Mixed | Workspace isolation gap on Core tables | Review tables **must** copy PI document RLS, not Core tenant-only | New policies only |
| Registers | REUSE (Core) / NEW (Review) | Decisions, actions, risks, issues, TQs, lessons | `20260204000000_batch_205_register_tables.sql`; `register-services.ts` | Production | No review register | Optional conversion of accepted findings → TQ/issue **after human approval** | No |
| Findings | EXTEND (consume) / NEW (SoT) | PI findings domain + document findings table | `packages/project-intelligence/src/findings/*`; `project_intelligence_findings` | Domain-complete | Not package-scoped; UI shell; worker findings ≠ design review | Consume PI candidates as optional input; **own** review findings | Do not mutate PI ownership |
| Workflow | REUSE | EOS Workflow SDK; Kernel `WorkflowService`; PI review actions | `workflow-sdk/index.ts`; `packages/platform-kernel/src/workflow/`; `findings/review-queue.ts` | Mixed | Generic, not package review | Assignment + human gates | No |
| Comments | REUSE | `engineering_object_comments` | Batch 2.05 | Production | RLS tenant-only; object_type string | Comments on review findings | No |
| Attachments | REUSE | `engineering_object_attachments` | Batch 2.05 | Production | Same RLS gap | Supporting files; prefer linking `engineering_documents` | No |
| Reports | NEW (content) / REUSE (patterns) | PI executive dashboard live aggregation; EOS reporting nav | `packages/project-intelligence/src/reports/`; EOS reporting-navigation | Dashboard exists | No review report artifact | Generate evidence-grounded review report | No |
| Evaluation | EXTEND | E11 KPI contracts; PI QA gold-set; platform eval stub | `packages/engineering-os/src/phase-e11/`; `docs/pilot/EOS-AI-DOC-QA-1/`; `evaluation-framework-service.ts` | Mixed | Platform executeRun is random | Dedicated review gold-set metrics | Do not treat stub eval as accuracy |
| Observability | REUSE | Traces/spans; PI retrieval traces | `observability-service.ts`; `retrievalTraceId` | Production | Do not log document bodies | Trace each review run | No |

### 3.2 Review-specific capabilities

| Capability | Class | Existing | Location | Maturity | Gaps | Review use | Modify existing? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Review Package | NEW | None | — | — | No grouping of a design set | Owns selected documents + scope | No |
| Review Scope | NEW | Query filters exist | Retrieval filters; document types | Partial | No persisted scope object | Discipline, doc types, revision set, review types | No |
| Review Run | NEW | PI `document_processing_runs` are **ingestion** runs | Batch 36 | Different object | Must not overload ingestion runs | Snapshot of package + engine version + findings | No |
| Review Rule | NEW (code-first V1) | Document finding types enum; E5 modes `identify_gaps` / `compare` | `documents/findings.ts`; `phase-e5/contracts.ts` | Enums only | No rule registry | Deterministic detectors + optional LLM propose | No table in V1 unless needed |
| Review Finding | NEW | PI `DocumentFinding` / `project_intelligence_findings` | PI findings | Adjacent | Missing `review_run_id`, package, requirement ref, recommended action as SoT | Canonical review finding contract | Do not reuse PI table as SoT |
| Finding Evidence | EXTEND | Citations + `assertAiFindingHasEvidence` | `findings/evidence.ts`; PI evidence JSON | Production helpers | Need retrievability check at presentation | Copy-on-write evidence rows pointing at chunks | No |
| Cross-document consistency | NEW | Same-doc revision compare | `documents/comparison-service.ts` | Line-diff | No identifier/requirement matching across docs | V1: shared IDs, shall-values, titles, revisions | No |
| Requirement traceability | NEW (limited V1) | Normative `shall/must` extraction | `normative-extraction.ts`; `document-structure.ts` | Text-level | **No requirements table** | Trace shall-statements to evidence; abstain if missing | No |
| Assumption detection | EXTEND | E5 `ASSUMED` basis; assumption language in structure | `phase-e5/contracts.ts` | Advisory | Not packaged as findings | Flag unsupported assumptions with evidence | No |
| Missing-information detection | EXTEND | Completeness (`REQUIRES_TABLE/FIGURE/CHILD`); `incomplete_document_set` | `document-structure.ts`; `DOCUMENT_FINDING_TYPES` | Partial | Completeness is clause-local | Package-level missing drawing/spec/calc evidence | No |
| Finding severity | REUSE | `low/medium/high/critical` separate from confidence | `findings/types.ts` | Production | AI classification is keyword/advisory | Human confirms severity | No |
| Finding confidence | REUSE | `confidence` 0–1 on findings and citations | PI types + schema CHECK | Production | Must never drive severity | Display separately | No |
| Human disposition | EXTEND | Review actions accept/reject/request_changes/defer/assign/close | `findings/review-queue.ts`; document review APIs | Domain + some APIs | Findings Intelligence UI incomplete | Disposition on review findings | New APIs on review domain |
| Reviewer comments | REUSE | Object comments; review `add_comment` | `engineering_object_comments`; review-queue | Production | Threading limited | Comment on finding | No |
| Assignment | REUSE | `assigned_to` on review items; Workflow `EngineeringAssignment` | PI review tables; workflow-sdk | Partial | No SLA productization required for V1 | Assign reviewer | No |
| Finding lifecycle | REUSE (state machine) | PI `FINDINGS_LIFECYCLE_STATUSES` + human-only transitions | `findings/lifecycle.ts` | Certified domain | Product copy uses different names | Adopt PI machine; map UX labels | No competing machine |
| Review Register | NEW | Findings page “register” is copy only | `apps/web/.../findings/page.tsx` | Shell | Not auditable product register | Projection of review findings + dispositions | No |
| Review Report | NEW | No package review report | PI reports are executive widgets | — | — | Snapshot PDF/HTML later; V1 on-screen + export | No |
| Review evaluation metrics | NEW | PI QA recall; E11 `CITATION_CORRECTNESS`, `AI_OVERRIDE_RATE` | Pilot docs; `phase-e11/kpis.ts` | Contracts / Q&A eval | No review gold-set | Engineer-confirmed, FP, grounding, duplication, time | New eval cases; do not claim platform eval |

---

## 4. Product boundary

### 4.1 What Engineering Review AI is

A commercial SaaS surface that takes an **engineering design package**, runs a **systematic first-pass review**, and produces an **auditable Engineering Review Register** of evidence-grounded candidate findings for a **qualified human engineer**.

Promise (locked):

- Identify inconsistencies, missing information, conflicting requirements, unsupported assumptions, drawing/calculation/specification discrepancies, incomplete evidence, and potential review observations.
- Every **material** finding is evidence-grounded and attributable.
- Humans accept, reject, modify, assign, or close findings.
- The product **never** represents AI output as PE certification, approval, or sign-off.

### 4.2 What it is not

| Not | Owner / reason |
| --- | --- |
| Engineering OS | Composition shell; certified E12; humans already use Ask / registers / modules |
| Project Intelligence | Documents, meetings, findings intelligence, reporting module |
| Inspection / Asset / Twin / Controls / EMI | Certified module ownership; EOS MUST_NEVER_OWN their logic |
| Autonomous design, FEA, CAD/BIM authoring | Out of scope; no zero-cost reuse that delivers V1 value |
| Professional engineering sign-off | E12 `assurance_not_signoff`; PI `FINDINGS_HUMAN_ONLY_TRANSITIONS` |

### 4.3 Bounded domain

Preferred package: `packages/engineering-review` (`@rtb/engineering-review`).

Owns:

- Review Package, Scope, Run, Finding, Evidence snapshot, Disposition, Register, Report contracts.
- Review pipeline orchestration (rules + retrieval + verification + candidate creation).
- Review-specific prompts, eval gold-set, and `/review` UX contracts.
- Commerce product key for the focused offering (ERA-1 catalog work).

Must never own:

- Canonical project/document identity (`engineering_projects`, `engineering_documents`).
- Ingestion/chunk/embedding storage (PI).
- Core registers (TQ, risk, issue, decision) except **optional human-approved conversion**.
- Platform identity, RLS helpers, model registry, or plugin lifecycle.
- Engineering OS experience shell (`/engineering/ask`, module host).

Consumes:

- PI document intelligence (upload already done via EOS document APIs + PI worker).
- EOS Domain SDK refs, commerce guard, claim verification, structural parse.
- Platform core auth/audit; platform intelligence prompts/models/policy; kernel jobs.

### 4.4 Standalone frontend later

Keep the **domain engine** inside `@rtb/engineering-review` with no Next.js imports. `apps/web` (and a future dedicated app) only render routes and call APIs. That allows a later commercial frontend without rewriting the engine.

---

## 5. Dependency architecture

### 5.1 Preferred direction

```text
@rtb/engineering-review
        ├── @rtb/project-intelligence     (documents, retrieval, citations, optional candidate handoff)
        ├── @rtb/platform-intelligence    (prompts, models, policy, flags, observability, eval store)
        ├── @rtb/platform-kernel          (jobs, optional AI Director adapter)
        ├── @rtb/platform-core            (auth, tenant, audit, permissions)
        ├── @rtb/database
        ├── @rtb/types
        └── @rtb/engineering-os           (THIN: Domain SDK, commerce guard, document-structure,
                                           claim-verification, workspace-scope — already a PI dependency)

apps/web (review routes only)
        └── @rtb/engineering-review
        └── @rtb/ui
```

### 5.2 Forbidden edges

`@rtb/engineering-review` **must not** become a dependency of:

- `@rtb/platform-core`
- `@rtb/platform-kernel`
- `@rtb/platform-intelligence`
- `@rtb/engineering-os` (including module-registry, phase-e12, core services)

Rationale: E12 `PhaseE12DoesNotRedesignArchitecture`; EOS product boundary lock; avoid circular imports with PI → EOS.

### 5.3 Direct EOS vs shared interfaces

**Decision:** depend on `@rtb/engineering-os` **thinly** for already-public utilities (structure, claims, commerce, domain refs), and on `@rtb/project-intelligence` for document evidence. Do **not** call EOS module registry, Ask UX, or Core register writes from the review engine except through the existing **human-approved findings conversion adapter** pattern (`findings/core-conversion.ts`).

A pure “interfaces only” split would require extracting structure/claims out of EOS. That is **out of ERA-0/ERA-1 scope** and would risk certified module churn. Transitive EOS via PI already exists.

### 5.4 Commerce packaging

Per `docs/product/RTB_AI_PLATFORM_PACKAGING_AND_LICENSING.md`:

- Tenant always has Platform.
- Engineering OS is the licensed OS parent.
- Engineering Review AI is an **application** (or OS-child product) with its own product key, seats, and routes.
- Fail closed if Engineering OS or required PI document feature is not installed (same pattern as `evaluateProjectIntelligenceAccess`).

Do not require Inspection, Twin, Controls, or Meetings for V1.

---

## 6. Proposed domain model

**No migrations in ERA-0.** Design only. Reuse canonical objects; add tables only where existing rows cannot safely represent the concept.

### 6.1 Reused objects (do not duplicate)

| Object | Table | Role in Review |
| --- | --- | --- |
| Tenant / workspace / user | `tenants`, `workspaces`, `profiles` | Ownership and RLS |
| Project | `engineering_projects` | Package parent |
| Document + revision | `engineering_documents`, `engineering_document_versions` | Package members |
| Extracted chunks / embeddings | `project_intelligence_document_chunks`, `_embeddings` | Evidence sources |
| Ingestion readiness | `project_intelligence_document_ingestions` | Gate: ready before review |
| Comments / attachments | `engineering_object_*` | Collaboration |
| Platform audit | `audit_events` | Cross-cutting audit |
| Optional Core conversion | `engineering_technical_queries`, `engineering_issues`, … | After human accept + convert |

### 6.2 New entities (ERA-1+)

#### `engineering_review_packages`

| Aspect | Definition |
| --- | --- |
| Purpose | Named, versioned set of documents constituting a design package under review |
| Ownership | `@rtb/engineering-review` |
| Relationship | `tenant_id`, `workspace_id`, `engineering_project_id` (required) |
| Lifecycle | `draft` → `ready` → `in_review` → `completed` → `archived` |
| Provenance | `created_by`, source (`upload` / `existing_project_docs`), document identity checksums |
| Audit | create/update/archive; document add/remove |
| RLS | tenant + workspace membership + project visibility (application layer) |
| Retention | Follow project/document retention; package row retained for audit after archive |

Do **not** copy file bytes. Members are FKs to `engineering_documents` (+ revision).

#### `engineering_review_documents` (join)

| Aspect | Definition |
| --- | --- |
| Purpose | Package membership: document_id, revision, role (`specification`, `drawing`, `calculation`, `basis`, `other`), inclusion reason |
| Ownership | Review domain |
| Relationship | FK package, FK `engineering_documents` |
| Lifecycle | added / superseded / removed (soft) |
| Provenance | revision + `source_checksum` from EOS document identity |
| Audit | membership changes |
| RLS | same as package |
| Retention | keep historical membership for closed runs |

This is not a second document SoT.

#### `engineering_review_runs`

| Aspect | Definition |
| --- | --- |
| Purpose | Immutable execution of the review engine against a package snapshot |
| Ownership | Review domain |
| Relationship | package, project, tenant, workspace; `engine_version`, `prompt_version`, `model_route` |
| Lifecycle | `queued` → `running` → `completed` / `failed` / `cancelled` |
| Provenance | correlation_id, model/provider IDs, rule set hash, retrieval traces |
| Audit | start/complete/fail; never rewrite findings in place — supersede via new run |
| RLS | tenant + workspace |
| Retention | required for register audit; findings point at run_id |

Distinct from PI `project_intelligence_document_processing_runs`.

#### `engineering_review_findings`

| Aspect | Definition |
| --- | --- |
| Purpose | Canonical review finding (candidate through closed) |
| Ownership | Review domain |
| Relationship | `review_run_id`, package, project, tenant, workspace; optional `source_pi_finding_id` |
| Lifecycle | PI findings state machine (see §9) |
| Provenance | model/prompt, rule_id, confidence, severity (separate), evidence FKs |
| Audit | every status change via events table |
| RLS | tenant + workspace; fail closed if evidence revoked |
| Retention | retain after package archive; soft-delete only with audit |

#### `engineering_review_evidence`

| Aspect | Definition |
| --- | --- |
| Purpose | Frozen citation: chunk_id, document_id, revision, excerpt, page/section, evidence_score |
| Ownership | Review domain |
| Relationship | finding_id; **references** PI chunks, does not copy full document |
| Lifecycle | immutable after insert; `revoked` flag if source deleted |
| Provenance | retrievalTraceId, chunk content_hash |
| Audit | revocation |
| RLS | same tenant/workspace as finding; **no cross-tenant chunk ids** |
| Retention | keep excerpts needed to explain historical findings; respect document deletion policy (revoke + fail closed) |

#### `engineering_review_dispositions`

| Aspect | Definition |
| --- | --- |
| Purpose | Human accept/reject/modify/assign/close with attributable actor |
| Ownership | Review domain |
| Relationship | finding_id, reviewer profile id |
| Lifecycle | append-only decisions |
| Provenance | actor_kind=`human` required for material states |
| Audit | required; also `audit_events` |
| RLS | tenant + workspace |
| Retention | retain with finding |

#### Optional later (DEFER past V1 schema if code-first)

- `engineering_review_rules` — V1 lives in code + prompt versions.
- `engineering_review_scopes` — can be JSON on package until it needs queryability.

### 6.3 Entities **not** created

| Tempting table | Why not |
| --- | --- |
| Duplicate `engineering_documents` | Canonical SoT exists |
| Duplicate chunks/embeddings | PI owns derivatives |
| Reuse `project_intelligence_findings` as Review Register | Different owner, different grain, meetings mixed in, no package/run |
| `EngineeringReviewRecord` as SoT | Workflow primitive only |
| Requirements SoT | V1 extracts shall-statements; full RTM is V2+ |

---

## 7. Review pipeline

```text
Project (engineering_projects)
  ↓
Review Package (new)
  ↓
Documents (engineering_documents members)
  ↓
Existing PI ingestion (worker → chunks/embeddings)
  ↓
Canonical extracted evidence (chunks + citations)
  ↓
Review scope (types A/B/C/F/G/H/I; document roles; revisions)
  ↓
Review engine
    ├── deterministic rules (IDs, shall-values, completeness, revision diff)
    ├── scoped retrieval (package document IDs only)
    └── optional LLM proposal (never authority)
  ↓
Candidate findings
  ↓
Evidence verification (retrieve excerpt, hash, tenant/workspace, claim support)
  ↓
Finding creation (status=candidate; AI cannot accept/close)
  ↓
Human engineering review
  ↓
Accept / Reject / Modify / Assign / Close
  ↓
Review Register (query of findings + dispositions)
  ↓
Review Report (snapshot of register + evidence + limitations)
```

### 7.1 Deterministic boundaries

| Layer | Allowed | Forbidden |
| --- | --- | --- |
| Retrieval | Return authorised chunks in package scope | Cross-tenant, cross-workspace, out-of-package docs |
| Rules | Emit candidates with citations when predicates match | Invent missing clauses; set severity from confidence |
| AI inference | Propose title/description/category; mark `ASSUMED` vs `EVIDENCE_BASED` | Approve, close, certify, mutate Core, raise confidence to imply severity |
| Evidence verification | Drop or abstain if excerpt not retrievable / hash mismatch / unsupported numerical claim | Present as verified |
| Human judgment | Disposition, severity confirmation, assignment, Core conversion | Unattributed changes |

Gate: if ingestion status is not `ready` or `ready_with_warnings`, the run **fails closed** for that document (PI `isAuthoritativeAnswerAllowed`).

Abstention: reuse PI `evaluateAbstention` / answer statuses (`conflicting_evidence`, `insufficient_permission`) rather than fabricating completeness.

---

## 8. Finding contract

Canonical TypeScript-shaped contract (implement in `@rtb/engineering-review` + `@rtb/types` in ERA-1):

| Field | Notes |
| --- | --- |
| `finding_id` | UUID |
| `tenant_id` / `workspace_id` / `project_id` | Required |
| `review_package_id` / `review_run_id` | Required |
| `discipline` | From `engineering_disciplines` or null |
| `category` | Review taxonomy (see below) — **not** interchangeable with severity |
| `title` / `description` | Human-readable; no certification language |
| `severity` | `low \| medium \| high \| critical` — **human-confirmable**; AI suggestion only |
| `confidence` | `0..1` AI/rule confidence — **never** displayed as severity |
| `source_document_ids` | ≥1 for AI/rule findings |
| `evidence_references` | Chunk/page/section/excerpt/hash |
| `requirement_reference` | Clause/shall id if any; else null |
| `reasoning_summary` | E5 basis: EVIDENCE_BASED / DERIVED / ASSUMED / INSUFFICIENT / CONFLICTING |
| `recommended_action` | Advisory only |
| `status` | Lifecycle status (§9) |
| `human_disposition` | Last human action + reason |
| `reviewer` | Profile id when assigned/disposed |
| `timestamps` | created/updated/disposed |
| `model_provenance` | provider, model, prompt_version, rule_id, engine_version, trace_id |

**Hard rules:**

1. Confidence and severity are independent columns. UI must show both with distinct labels.
2. AI-generated findings with zero evidence are rejected (`assertAiFindingHasEvidence` pattern).
3. A finding is **verified** only if evidence is retrievable, same tenant/workspace, and content_hash matches. Otherwise present as **unverified / revoked**.
4. Copy must not say “approved”, “certified”, “complies”, or “signed off” for AI states.
5. Idempotency key: `review_run_id + rule_or_model + title_normalized + evidence_hash`.

**V1 category set** (narrower than PI’s general findings taxonomy):

`cross_document_inconsistency`, `missing_information`, `design_basis_inconsistency`, `requirement_traceability_gap`, `unsupported_assumption`, `revision_inconsistency`, `missing_engineering_evidence`, `other_observation`.

Drawing-vs-spec and calc-vs-drawing are **not** first-class V1 categories unless text evidence exists; otherwise DEFER.

---

## 9. Human authority model

### 9.1 Adopt existing PI findings state machine

Do **not** create a second incompatible machine. Map product language onto `FINDINGS_LIFECYCLE_STATUSES` (`packages/project-intelligence/src/findings/lifecycle.ts`):

| Product label | Canonical status | Who may enter |
| --- | --- | --- |
| CANDIDATE | `candidate` | system / AI / human |
| AI_REVIEWED | `triage_pending` | system / AI |
| AWAITING_ENGINEER | `under_review` | human (assign) or system after queue |
| MODIFIED | `changes_requested` | human |
| ACCEPTED | `accepted` | **human only** |
| REJECTED | `rejected` | **human only** |
| ASSIGNED | `under_review` + assignment record | human |
| CLOSED | `closed` | **human only** |
| (also keep) | `deferred`, `duplicate`, `superseded`, `reopened`, `archived` | per existing transitions |

Human-only targets already enforced: `accepted`, `rejected`, `conversion_proposed`, `converted`, `closed` (`FINDINGS_HUMAN_ONLY_TRANSITIONS`). AI/system attempting these throws `findings_ai_cannot_approve`.

### 9.2 AI must not

- Approve engineering designs
- Certify compliance
- Sign documents
- Close **material** findings autonomously
- Claim PE / RPEQ / equivalent authority
- Mutate Engineering Core registers

These match E12 `certifyEngineeringAuthorityBoundaries()` and EOS security authority model.

### 9.3 Attribution

Every disposition stores `actor_id`, `actor_kind='human'`, reason, timestamp, idempotency key. Mirror to `audit_events` (`resource_type=engineering_review_finding`).

UI chrome (locked copy): **“AI-assisted first-pass review. Not professional engineering certification, approval, or sign-off.”**

---

## 10. Security model

Engineering Review **inherits** the RTB Trust & Security Layer. Fail closed when authorization or provenance is uncertain. **No cross-tenant retrieval.**

| Control | Assessment | Review requirement |
| --- | --- | --- |
| Tenant isolation | PI retrieval throws if `authorized=false`; SQL filters `tenantId`; adversarial identity suite denies cross-tenant AI context | Review queries must pass `RetrievalAuthorization` with tenant+workspace+package document IDs |
| Workspace isolation | PI document/finding RLS: tenant **and** `workspace_memberships`. Core `engineering_documents` / projects RLS: **tenant only** (app layer filters workspace) | New review tables follow **PI document RLS**, not Core tenant-only. Application layer still filters project |
| RLS | Enabled on PI and Core tables | SELECT/INSERT/UPDATE WITH CHECK tenant+workspace; service role worker audited |
| RBAC | `engineering.document.review`, `engineering.ai.use` | Reviewer role for disposition; viewer cannot close; admin for settings |
| Audit | Immutable `audit_events` | Required on package, run, disposition |
| Encryption | Platform/Supabase at rest assumed; not re-specified here | No extra store of raw files |
| Secrets | `SecretManagementService` exists; **placeholder encryption** | Review must use existing provider credential path; never client keys (`docs/security/PROJECT_INTELLIGENCE_DOCUMENT_PROVIDER_SECURITY.md`) |
| Model-provider boundary | Classification policy deny-by-default for `ENGINEERING_SENSITIVE` / `CLIENT_CONFIDENTIAL` unless explicit allow; training use forbidden | Design packages default `ENGINEERING_SENSITIVE`; fail closed |
| Document access | Signed URLs; worker downloads after auth | Package membership cannot expand storage ACLs |
| Evidence access | Citations include excerpts; chunks RLS | Presentation must re-check chunk visibility; revoked evidence blocks “verified” |
| Retention / deletion | PI soft-delete on chunks; Core documents unique per number/revision | Deleting a document revokes evidence; findings remain with revoked flag |
| Prompt injection | Security assurance **does not claim completeness**; identity suite denies `allowUntrustedDocumentInstructions` | Treat document text as **untrusted**; instructions in PDFs cannot change policy, tenant, or close findings |
| Malicious documents | Password PDFs fail 422; invalid PDF 422; size/mime policy | No executable/macro types; DOCX is text extract only |
| Cross-tenant retrieval | Forbidden in PI retrieve + identity adversarial | Package scope ⊆ authorised project docs; empty intersection → 403 |

**Known inherited gaps (do not silently “fix” Core in ERA-1 unless scoped):**

1. `engineering_documents` / `engineering_projects` RLS is tenant-wide.
2. `engineering_object_comments` manage policy is tenant-wide without execute permission.
3. PI findings table (batch 41) shipped SELECT (+ implied service writes); confirm write policies before dual-writing.
4. Platform eval scores are random — not a security control, but must not be used as a quality gate.

---

## 11. Evaluation framework

Do **not** use a single “AI accuracy” metric. Separate **SYSTEM / BENCHMARK / REAL_USER** per EOS E11 (`packages/engineering-os/src/phase-e11/kpis.ts`). Never present gold-set scores as live customer ROI.

### 11.1 MVP metrics

| Metric | Definition | Kind |
| --- | --- | --- |
| Engineer-confirmed finding rate | `accepted / (accepted+rejected+modified)` on gold-set and production | BENCHMARK + REAL_USER |
| False-positive rate | `rejected` where gold label is `not_a_finding` | BENCHMARK |
| Evidence-grounding rate | Findings with retrievable, hash-matching citations / all AI-or-rule findings | SYSTEM |
| Unsupported-claim rate | Numerical/normative claims in finding text not supported by evidence (`verifyClaimsAgainstEvidence`) | SYSTEM |
| Finding duplication rate | Duplicate-group size / findings per run | SYSTEM |
| Human override rate | Severity or category changed by reviewer / reviewed findings | REAL_USER |
| Review completion time | Package ready → register closed | REAL_USER |
| Review time reduction | Vs human-only baseline on same gold packages | BENCHMARK (labelled as such) |

Abstention correctness (should abstain when evidence missing) is a **gate**, not a vanity score.

### 11.2 Gold-set strategy

Use **controlled engineering packages** (synthetic + redacted real), versioned, tenant-isolated:

1. Specification + drawing text + calculation note with **planted** inconsistencies (ID mismatch, shall-value conflict, missing revision, unsupported “assume”).
2. Blind holdout (pattern from `docs/pilot/EOS-AI-DOC-QA-1/`).
3. Labels: finding span, category, severity band, must-link document IDs, allowed abstention.
4. Gates for ERA-1 exit (illustrative, to be locked with founder review): evidence-grounding ≥ 0.99 on AI findings; unsupported-claim rate ≤ 0.05; no finding presented as verified with revoked evidence; zero cross-tenant leaks in adversarial cases.

Do not reuse `EvaluationFrameworkService.executeRun` scores until that service is replaced with real graders.

---

## 12. MVP scope

### 12.1 V1 review types

| ID | Type | V1 decision | Rationale |
| --- | --- | --- | --- |
| A | Cross-document inconsistency | **In** | Deterministic ID/value/title conflicts via retrieval + rules |
| B | Missing information | **In** | Completeness + package checklist (spec/drawing/calc present as **roles**, not CV) |
| C | Design-basis inconsistency | **In (limited)** | Textual basis vs spec shall-values; abstain if basis doc absent |
| D | Drawing vs specification | **Limited / mostly DEFER** | Drawings are PDFs; figure data is caption-only (`authoritativeStructuredData: false`); include only when both sides are extracted text |
| E | Calculation vs drawing | **DEFER** | No solver; numeric claim checks only if both are text |
| F | Requirement traceability | **In (limited)** | Shall-statement coverage; not a full RTM |
| G | Unsupported assumptions | **In** | Assumption language without supporting evidence |
| H | Revision inconsistency | **In** | Reuse same-document comparison + package mixed-revision detection |
| I | Missing engineering evidence | **In** | REQUIRES_TABLE/FIGURE/CHILD + package evidence gaps |

### 12.2 V1 product slices

1. Create package from existing project documents (upload already exists).
2. Run review (async job).
3. Finding list + evidence panel + disposition.
4. Register view + basic report.
5. Disclaimer + audit.
6. Gold-set harness for A/B/C/F/G/H/I.

### 12.3 Commercial shell (do not build in ERA-0)

Proposed routes (reuse platform layout, auth, workspace switcher):

| Route | Reuse vs create |
| --- | --- |
| `/review` | **Create** product home |
| `/review/projects` | Reuse `EngineeringProjectService` list |
| `/review/projects/[id]` | Reuse project header; new package summary |
| `/review/projects/[id]/packages` | **Create** |
| `/review/projects/[id]/documents` | Reuse EOS/PI document list filtered to package |
| `/review/projects/[id]/findings` | **Create** (not PI findings page) |
| `/review/projects/[id]/register` | **Create** |
| `/review/projects/[id]/reports` | **Create** |
| `/review/settings` | **Create** (prompts/policy flags only) |

Do **not** hide the product only under `/engineering/apps/project-intelligence/findings`.

---

## 13. Deferred capabilities

Explicit **must not enter V1**, challenged only where zero-cost reuse exists:

| Item | V1 | Challenge result |
| --- | --- | --- |
| FEA / structural solver | PROHIBITED | Client-owned solver ADRs exist; not review MVP |
| Autonomous design | PROHIBITED | E12 |
| Autonomous sign-off | PROHIBITED | E12 + PI human-only close |
| CAD / BIM authoring | PROHIBITED | Spatial/BIM ADRs are Twin/EMI, not review |
| Full standards library | DEFER | No corpus SoT |
| Full code compliance automation | PROHIBITED | Out of ERA-0 instruction; no library |
| Construction scheduling / procurement | PROHIBITED | Project Controls module |
| IoT / digital twins | PROHIBITED | Twin module |
| Computer vision | DEFER | OCR mentioned in PI security doc; **not silently applied**; scanned drawings out of V1 |
| Mining process optimization | PROHIBITED | None |
| Generic Business OS | PROHIBITED | Catalog `coming_soon` |
| Meetings as review evidence | DEFER | PI meetings exist; pollutes design-package promise |
| pgvector migration | DEFER | JSONB embeddings work |
| Full KG-driven review | DEFER | PI graph is ref-only |

---

## 14. Technical risks

1. **Workspace RLS gap on Core documents** — review must not rely on RLS alone for workspace isolation of `engineering_documents`.
2. **OCR / drawing gap** — first-pass review quality collapses on scanned or CAD-plot PDFs; must surface `ready_with_warnings` and abstain.
3. **Findings dual-taxonomy** — PI findings vs review findings could confuse operators if converted carelessly.
4. **Overloading PI findings table** — would violate module ownership and mix meetings with design review.
5. **LLM hallucination** — mitigated only if verification gate is mandatory; skipping it would ship unverified findings.
6. **Circular dependency** — any EOS import of engineering-review breaks the lock.
7. **E12 certification churn** — changing EOS behaviour or migrations to “help” review is out of bounds.
8. **Eval stub** — using platform `executeRun` would fake quality.
9. **25 MiB / mime limits** — large drawing sets may need multiple docs, not one PDF.
10. **Job/runtime cost** — package-wide retrieval + LLM per rule can be expensive; need cost engine + caps (`cost-controls.ts`).

---

## 15. Product risks

1. **Professional liability** — users may treat the register as approval. Mitigation: persistent disclaimer, human-only close, no “compliant” copy.
2. **False confidence** — high AI confidence on low-severity or wrong findings. Mitigation: separate fields; reviewer training in UX.
3. **False negatives on drawings** — market claims must exclude automated drawing interpretation in V1.
4. **Scope creep into Engineering OS** — keep `/review` product shell; do not merge into Ask as implicit sign-off.
5. **Module politics** — PI Findings Intelligence remains for documents/meetings; Review AI is a different commercial promise.
6. **Gold-set overfitting** — follow PI QA split (dev / founder-style / holdout).
7. **Entitlement complexity** — product should run only with Engineering OS + document intelligence entitlement.

---

## 16. Recommended ERA-1 implementation scope

ERA-1 is **still not full product UX**. It should create a **compilable domain package + schema proposal + failing/passing contract tests**, without changing certified EOS behaviour.

1. Create `packages/engineering-review` (`@rtb/engineering-review`) with types, lifecycle mapping, finding contract, pipeline interfaces, and tests.
2. Add `packages/engineering-review/src/domain/*` only (no app routes).
3. Draft **new** SQL in a design note or `*.proposed.sql` **not applied** until an explicit migration ERA (if ERA-1 includes a migration, it must be additive review tables only — **not** modifying existing migrations).
4. Wire review engine to PI retrieval **in tests** with fixtures (no live provider requirement).
5. Implement deterministic detectors for A, B, F, G, H, I on fixture packages.
6. Enforce evidence verification + human-only terminal states.
7. Add commerce product-key **proposal** (do not break existing catalog tests).
8. Document `/review` route map in the package README (pages still unbuilt unless a later ERA).
9. Gold-set v0 under `docs/engineering-review/eval/` (fixtures, not customer data).
10. Security tests: cross-tenant deny, untrusted document instructions ignored, revoked evidence ≠ verified.

**Out of ERA-1:** production UI, FEA, CAD, standards library, modifying E12, modifying PI worker into a full review engine, existing migration edits.

---

## 17. Exact files/packages expected to change in ERA-1

Additive unless noted. **Do not modify** `packages/engineering-os/src/phase-e12/*` or historical `supabase/migrations/*` files.

| Path | Change |
| --- | --- |
| `packages/engineering-review/**` | **NEW** package |
| `packages/engineering-review/package.json` | Workspace package |
| `pnpm-workspace.yaml` | Already `packages/*` — no change if folder added |
| `packages/types/src/engineering-review.ts` (new) + `packages/types/src/index.ts` | Finding/package contracts |
| `docs/engineering-review/**` | Eval fixtures + ERA-1 notes |
| `packages/project-intelligence/src/documents/retrieval-service.ts` | **Unlikely** — consume as-is |
| `packages/project-intelligence/src/findings/lifecycle.ts` | **Unlikely** — import/reuse |
| `apps/web/package.json` | Optional dependency on `@rtb/engineering-review` if API stubs added |
| `apps/web/src/app/(platform)/review/**` | **Defer UI**; only if ERA-1 explicitly includes a stub route |
| `packages/platform-core/src/navigation.ts` | Defer until shell ERA |
| `packages/engineering-os/src/module-registry.ts` | **Avoid** in ERA-1; register as application later without EOS depending on review package |
| `packages/platform-commerce/**` | Additive catalog/product key in a later commerce ERA if required |
| `supabase/migrations/YYYYMMDDHHMMSS_engineering_review_*.sql` | **Only if** a later ERA authorizes new tables — not ERA-0; ERA-1 may still be design-only |

**Must not change in ERA-1:**

- Existing migration files
- E12 certification runners/contracts
- PI meeting intelligence
- Inspection / Twin / Controls / EMI
- Core register behaviour
- Policy that AI can approve

---

## Appendix A — Safety record (ERA-0)

| Check | Result |
| --- | --- |
| Repository root | `C:/Users/sbers/OneDrive/Documents/RTB Eng/01_Apps/AI Platform` (`rtb-ai-os`) |
| Branch | `cursor/eos-ux-1-operational-experience` |
| HEAD | `4e7cf3e859fbc7b868de3f73b61823422914f2af` |
| Working tree at start | Clean |
| Existing migrations modified | No |
| Engineering OS behaviour changed | No |
| E12 functionality altered | No |
| Production DB migrations created | No |
| New runtime dependencies | No |

## Appendix C — ERA-0 validation (non-destructive)

Ran on Node `v24.16.0` (pre-existing engine mismatch: repo wants `>=22 <23`). No unrelated failures were fixed.

| Check | Result |
| --- | --- |
| `@rtb/engineering-os` test | **PASS** 334/334 |
| `@rtb/project-intelligence` test | **PASS** 154 passed, 1 skipped |
| `@rtb/platform-core` test | **PASS** 152/152 |
| `@rtb/platform-kernel` test | **PASS** 12/12 |
| `@rtb/platform-intelligence` test | **PASS** 16/16 |
| `@rtb/platform-core` typecheck | **PASS** |
| `@rtb/platform-kernel` typecheck | **PASS** |
| `@rtb/platform-intelligence` typecheck | **PASS** |
| `@rtb/types` typecheck | **PASS** |
| `@rtb/plugin-sdk` typecheck | **PASS** |
| `@rtb/database` typecheck | **PASS** |
| `@rtb/ui` typecheck | **PASS** |
| `@rtb/engineering-os` typecheck | **PRE-EXISTING FAIL** (not introduced by ERA-0) |
| `@rtb/project-intelligence` typecheck | **PRE-EXISTING FAIL** (inherits EOS errors + `pdfjs-dist` worker types) |
| Lint | Not run package-wide; relevant packages have no local `lint` script |
| New runtime dependencies | None |
| Production code / migrations changed | None |

Pre-existing `tsc` errors (unchanged, not fixed):

- `packages/engineering-os/src/services/core-services.ts` — `Json` cast vs `revision_source: {}`
- `packages/engineering-os/src/services/grounded-ask.ts` — `never` on generate failure fields
- `packages/engineering-os/src/services/technical-query-service.ts` — `"accept"` vs TQ workflow union
- `packages/project-intelligence/src/documents/configure-pdfjs-worker.ts` — missing `pdfjs-dist/legacy/build/pdf.worker.mjs` types

## Appendix B — Key implementation citations

- PI findings human-only close: `packages/project-intelligence/src/findings/lifecycle.ts`
- AI evidence required: `packages/project-intelligence/src/findings/evidence.ts`
- Document worker warning findings: `packages/project-intelligence/src/documents/document-worker.ts`
- Retrieval fail-closed: `packages/project-intelligence/src/documents/retrieval-service.ts` `if (!auth.authorized)`
- Claim verification: `packages/engineering-os/src/services/claim-verification.ts`
- E12 authority: `packages/engineering-os/src/phase-e12/e2e-provenance.ts` `certifyEngineeringAuthorityBoundaries`
- Classification AI: `packages/engineering-os/src/security-closure/classification-ai-policy.ts`
- Untrusted document instructions: `packages/platform-identity/src/domain/internal-adversarial/suite.ts`
)
