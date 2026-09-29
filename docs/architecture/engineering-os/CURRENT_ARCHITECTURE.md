# EOS-A0 Current Architecture

Status: reconnaissance (read-only), updated by **EOS-A0C** local Windows reconciliation; **EOS-A1** domain freeze is documentation-only (see files listed below).  
Original evidence checkout: `/workspace` (`github.com/sberso2026/AI-Platform`)  
Original evidence SHA: `135dd0b659497a7ac68543d50dd2998ee3fe7d0f`  
Original evidence branch at capture: `cursor/bos-1-owner-command-centre-2756`  
EOS-A0 documentation commit: `2758263687131ea2935d6e3d5037e7d131831372` (PR #19)  
Package versions cited at EOS-A0: `@rtb/engineering-os@1.0.0` (phase `14E`, status `ga`)

This document records the **factual** RTB AI Platform architecture. Sections 1–13 below are the **EOS-A0 historical capture** against SHA `135dd0b`. They are preserved. Local Windows state is recorded in **LOCAL_WINDOWS_RECONCILIATION** and must be used for EOS-A1 planning.

EOS-A1 freeze (same evidence HEAD as A0C unless noted): `CANONICAL_DOMAIN_MODEL.md`, `DOMAIN_RELATIONSHIP_MODEL.md`, `BOUNDED_CONTEXT_OWNERSHIP.md`, `TRACEABILITY_MATURITY_MODEL.md`, `ENGINEERING_REVIEW_BOUNDARY.md`, `DIGITAL_THREAD_ARCHITECTURE.md`, `SYSTEMS_AND_DISCIPLINES_MODEL.md`, `OPTIMIZATION_READINESS_CONTRACT.md`, `EOS_A1_ADRS.md`.

---

## LOCAL_WINDOWS_RECONCILIATION

Captured: 2026-09-29 (EOS-A0C). No `git pull` / merge / rebase / reset / branch switch. Working tree left as found.

| Claim | Evidence |
| --- | --- |
| Canonical local repository | `C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\AI Platform` (`git rev-parse --show-toplevel`) |
| Remote | `origin` → `https://github.com/sberso2026/AI-Platform.git` (fetch and push) |
| Same GitHub repository as EOS-A0 | **YES** — `github.com/sberso2026/AI-Platform` |
| Current branch | `cursor/era-7a-engineering-review-pilot-gate` (tracks `origin/cursor/era-7a-engineering-review-pilot-gate`, **ahead 2**) |
| Local HEAD | `0dd05bf124c19e1fbb8099f396a904ec86a2d020` |
| Worktree | **DIRTY** (ERA staging login/runtime leftovers + ERA-PILOT-0E provision scripts; not discarded) |
| EOS-A0 examined HEAD | `135dd0b659497a7ac68543d50dd2998ee3fe7d0f` — **not an ancestor** of local HEAD |
| Merge-base with EOS-A0 SHA | `7771a574185a6c4f1cab47e6a07c36f5056152df` (`Fix EOS-UAT-002 Projects empty/non-JSON response crash`) |
| Divergence | `git rev-list --left-right --count 135dd0b...HEAD` → **4 / 76** (4 commits on EOS-A0/BOS side not in this HEAD; 76 commits on this HEAD not in EOS-A0 SHA) |
| EOS-A0 docs live on | `origin/cursor/eos-a0-architecture-reconnaissance-2756` (materialized into this tree as documentation-only for A0C) |
| Local commits not in EOS-A0 capture | Entire ERA-1…ERA-7 / PILOT-0 series after merge-base, plus local ahead-2: `0c32857e` (staging MFA login), `0dd05bf1` (ERA architecture freeze) |

### Drift classification

**ARCHITECTURAL_DRIFT** (dominant), with additional **NON_ARCHITECTURAL_CODE_DRIFT** and **DOCUMENTATION_DRIFT**.

Material architecture differences vs EOS-A0 SHA `135dd0b`:

| Topic | EOS-A0 (`135dd0b` / BOS-1) | Local Windows HEAD (`0dd05bf`) |
| --- | --- | --- |
| `@rtb/engineering-review` | **Absent** | **Present** `packages/engineering-review` (`0.7.0-era-7`) |
| `@rtb/engineering-review-persistence` | **Absent** | **Present** |
| Review tables | No `engineering_findings`; no review package tables | `engineering_review_packages`, `engineering_review_runs`, `engineering_review_findings`, `engineering_review_evidence`, `engineering_review_dispositions` (`supabase/migrations/20260919*` / `20260920*`) |
| `@rtb/business-os` | **Present** (BOS-0/BOS-1 on this SHA) | **Absent** on this branch |
| `batch_97` Business OS owner command migration | Present | Absent |
| `supabase/migrations` count | 104 | 110 |
| Engineering Review docs | Not in this folder | `docs/engineering-review/**` (ERA-0…ERA-7, PILOT-0) |
| Feature flags | `engineering_os` vs `engineering_os_enabled` | **Still both** — confirmed duplication risk |

EOS-A0 conclusions that **remain valid** on this Windows tree: Kernel/Intelligence composition, V1 hosted modules, Core registers, PI Findings tables, platform vs PI knowledge graphs, kernel vs module digital twin, multiple job queues, no Optimization tables, Decision register vs PC/BOS decisions (BOS tables exist only on the BOS branch, not here).

EOS-A0 conclusions that **do not remain valid** for this Windows tree: “no `@rtb/engineering-review`”, “no review persistence tables”, “Engineering Review is only a scattered pattern”, and “this checkout includes `@rtb/business-os`”.

Dirty worktree (not committed; not part of HEAD architecture): `apps/web` staging/login runtime, `packages/engineering-review` runtime-project, `packages/platform-commerce/scripts/era-pilot-0e-*.ts`, `scripts/review-staging.mjs`. These are **NON_ARCHITECTURAL_CODE_DRIFT** relative to HEAD and were not used to rewrite production architecture.

---

This document records the **factual** RTB AI Platform architecture as implemented in the original EOS-A0 checkout. It does not describe the target Engineering OS six-domain model except where that model already exists in code.

Existing V1 product documentation lives as sibling files under `docs/architecture/ENGINEERING_OS*.md`. Those files remain valid for Phase 14 product boundaries. This folder (`docs/architecture/engineering-os/`) is the EOS-A* architecture series for the revised Engineering OS. It is additive; it does not replace the V1 lock documents.

---

## 1. Canonical repository

| Claim | Evidence |
| --- | --- |
| Monorepo name | `rtb-ai-os` in `/workspace/package.json` |
| Workspace | `pnpm-workspace.yaml`: `apps/*`, `packages/*` |
| Orchestration | Turborepo (`turbo.json`), pnpm `9.15.0`, Node `>=22 <23` |
| Single web app | `apps/web` (`@rtb/web`, Next.js App Router) |
| Database | Supabase CLI + `supabase/migrations/` (104 SQL files in this checkout) |
| Windows path named in EOS-A0 brief | `C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\AI Platform` ÔÇö **not this execution environment** |
| This execution root | `/workspace` on Linux Cloud Agent |

The GitHub repository `sberso2026/AI-Platform` is treated as the canonical implementation base. Local-only uncommitted files on the Windows path were not inspected.

---

## 2. Layered runtime (as coded)

```
apps/web  (Next.js UI + /api/* route handlers)
    Ôöé
    Ôö£ÔöÇÔöÇ @rtb/platform-core          identity session, RBAC, audit, nav, OS catalog
    Ôö£ÔöÇÔöÇ @rtb/platform-kernel        AI Director, events, jobs, workflow, KG, memory,
    Ôöé                               kernel digital twin registry, API keys, notifications,
    Ôöé                               telemetry, plugin lifecycle
    Ôöé       ÔööÔöÇÔöÇ @rtb/platform-intelligence
    Ôöé                               tools, capabilities, policy, prompts, models,
    Ôöé                               cost, observability, feature flags, secrets, evals
    Ôö£ÔöÇÔöÇ @rtb/platform-identity      enterprise SSO/OIDC contracts
    Ôö£ÔöÇÔöÇ @rtb/platform-commerce      products, entitlements, installation, billing
    Ôö£ÔöÇÔöÇ @rtb/plugin-sdk             in-memory plugin manifest/registry
    Ôöé
    Ôö£ÔöÇÔöÇ @rtb/engineering-os         Engineering OS shell + Core registers + module host
    Ôöé       Ôö£ÔöÇÔöÇ hosted modules
    Ôöé       Ôöé     project-intelligence, inspection-intelligence, asset-intelligence,
    Ôöé       Ôöé     project-controls, digital-twin, engineering-model-interoperability
    Ôöé       ÔööÔöÇÔöÇ shared infra
    Ôöé             engineering-shared-project-domain
    Ôöé             engineering-shared-spatial-domain
    Ôöé             engineering-execution-host
    Ôöé
    ÔööÔöÇÔöÇ @rtb/business-os            sibling OS (not an Engineering domain)
```

`createPlatformKernel(supabase)` is defined in `packages/platform-kernel/src/kernel.ts`.  
`createEngineeringOS(supabase, kernel)` is defined in `packages/engineering-os/src/engineering-os.ts`.

---

## 3. Apps and packages

### 3.1 Application

| Path | Role |
| --- | --- |
| `apps/web` | Only application. Hosts `/engineering/*`, `/business/*`, `/platform/*`, `/system/*`, and all `/api/*` handlers. There is no separate `apps/api`. |

### 3.2 Platform packages

| Package | Path | Role in this checkout |
| --- | --- | --- |
| `@rtb/types` | `packages/types` | Shared TypeScript contracts |
| `@rtb/database` | `packages/database` | Supabase client; core `Database` types plus kernel/commerce stubs |
| `@rtb/ui` | `packages/ui` | Shared UI primitives |
| `@rtb/platform-core` | `packages/platform-core` | Auth, permissions, audit, tenants, navigation (`ENGINEERING_NAVIGATION`) |
| `@rtb/platform-kernel` | `packages/platform-kernel` | Kernel facade listed in ┬º4 |
| `@rtb/platform-intelligence` | `packages/platform-intelligence` | Intelligence control plane listed in ┬º5 |
| `@rtb/platform-identity` | `packages/platform-identity` | Enterprise SSO/OIDC |
| `@rtb/platform-commerce` | `packages/platform-commerce` | Commerce / entitlements (Engineering OS is product slug `engineering-os`) |
| `@rtb/plugin-sdk` | `packages/plugin-sdk` | Zod plugin manifests; in-memory `PluginRegistry` |
| `@rtb/security-assurance` | `packages/security-assurance` | Security posture engines and flags (not a second event bus / KG) |

### 3.3 Engineering packages

| Package | Version (package.json / version.ts) | Path |
| --- | --- | --- |
| `@rtb/engineering-os` | `1.0.0` GA, phase `14E` | `packages/engineering-os` |
| `@rtb/engineering-os-certification` | `1.0.0` | `packages/engineering-os-certification` |
| `@rtb/engineering-shared-project-domain` | `0.1.0-shared-project-domain` | `packages/engineering-shared-project-domain` |
| `@rtb/engineering-shared-spatial-domain` | `0.2.0-spatial-core` | `packages/engineering-shared-spatial-domain` |
| `@rtb/engineering-model-interoperability` | `1.0.0` | `packages/engineering-model-interoperability` |
| `@rtb/engineering-execution-host` | `0.1.0-execution-host` | `packages/engineering-execution-host` |
| `@rtb/project-intelligence` | `1.0.0` | `packages/project-intelligence` |
| `@rtb/inspection-intelligence` | `1.0.0` | `packages/inspection-intelligence` |
| `@rtb/asset-intelligence` | `1.0.0` | `packages/asset-intelligence` |
| `@rtb/project-controls` | `1.0.0` | `packages/project-controls` |
| `@rtb/digital-twin` | `1.0.0` | `packages/digital-twin` |

Frozen V1 module keys (`packages/engineering-os/src/version.ts`):  
`project_intelligence`, `inspection_intelligence`, `asset_intelligence`, `project_controls`, `digital_twin`, `engineering_model_interoperability`.

### 3.4 Sibling OS

`@rtb/business-os` is a **separate** operating system. It must not absorb Engineering OS domain objects. Engineering OS must not duplicate Business OS financial/customer surfaces.

---

## 4. Platform Kernel ÔÇö factual status

Facade: `packages/platform-kernel/src/kernel.ts` (`PlatformKernel`).

| Capability | Status | Implementation path | Persistence |
| --- | --- | --- | --- |
| AI Director | EXISTS (shallow; default mock adapter) | `packages/platform-kernel/src/ai-director/` | agent/run tables from phase 15 |
| Event bus | EXISTS (Postgres insert + in-process subscribers) | `packages/platform-kernel/src/event-bus/event-bus.ts` | `events`, `event_subscriptions`, `event_dispatch_attempts` |
| Jobs | PARTIAL (CRUD + synchronous `process()`; no Inngest/BullMQ) | `packages/platform-kernel/src/jobs/job-service.ts` | `background_jobs`, `job_attempts`, `scheduled_jobs` |
| Workflow | PARTIAL (`listDefinitions` / `start` / `listInstances`; no full step engine) | `packages/platform-kernel/src/workflow/workflow-service.ts` | `workflow_*` |
| Knowledge graph | PARTIAL (node/edge/evidence CRUD; no graph query/RAG) | `packages/platform-kernel/src/knowledge-graph/` | `knowledge_nodes`, `knowledge_edges`, `evidence_items` |
| Memory | EXISTS (scoped CRUD) | `packages/platform-kernel/src/memory/` | `ai_memories`, `memory_scopes`, `memory_links` |
| Kernel digital twin registry | PARTIAL | `packages/platform-kernel/src/digital-twin/` | `digital_twins*` (phase 15) |
| API keys | PARTIAL (not a full HTTP gateway) | `packages/platform-kernel/src/api-gateway/` | API key tables |
| Notifications | EXISTS (in-app) | `packages/platform-kernel/src/notifications/` | notification tables |
| Telemetry | PARTIAL (sensor/event ingest) | `packages/platform-kernel/src/telemetry/` | `sensors`, `telemetry_events` |
| Plugin lifecycle | EXISTS (DB-backed) | `packages/platform-kernel/src/plugins/` | `plugins*` |
| Shared connector framework | MISSING | no `@rtb/connectors`; `external_integrations` typed but unused | ÔÇö |

Kernel HTTP surfaces live under `apps/web/src/app/api/platform/*` (events, jobs, workflows, knowledge, notifications, telemetry, AI Director).

**Do not create a second kernel inside Engineering OS.** Compose these services.

---

## 5. Intelligence Platform ÔÇö factual status

Facade: `packages/platform-intelligence/src/intelligence.ts` (`PlatformIntelligence`).

| Capability | Status | Path |
| --- | --- | --- |
| Tool registry | EXISTS | `packages/platform-intelligence/src/tool-registry/` |
| Capability registry | EXISTS | `packages/platform-intelligence/src/capability-registry/` |
| Policy engine | EXISTS | `packages/platform-intelligence/src/policy-engine/` |
| Prompt registry | EXISTS | `packages/platform-intelligence/src/prompt-registry/` |
| Model registry | EXISTS (plus legacy `ai_model_*` fallback) | `packages/platform-intelligence/src/model-registry/` |
| Cost engine | EXISTS | `packages/platform-intelligence/src/cost-engine/` |
| Observability | EXISTS (first-party traces/metrics; not OpenTelemetry) | `packages/platform-intelligence/src/observability/` |
| Feature flags | EXISTS | `packages/platform-intelligence/src/feature-flags/` |
| Secrets | PARTIAL (metadata + placeholder encrypt; plaintext never returned) | `packages/platform-intelligence/src/secret-management/` |
| Evaluation | EXISTS | `packages/platform-intelligence/src/evaluation/` |

Tables originate in `supabase/migrations/20260202000000_batch_175_intelligence_tables.sql` and related RLS/seed files.

Engineering AI is a **consumer**: `EngineeringAIService` in `packages/engineering-os/src/services/supporting-services.ts` plus seeded tools/prompts in `packages/engineering-os/src/manifest.ts`. Policy: no autonomous engineering approval (`engineering_reviewer_prompt`, decision register human approval).

---

## 6. Engineering OS implementation (current)

### 6.1 Product identity

- Package: `@rtb/engineering-os`
- Version lock: `ENGINEERING_OS_VERSION = "1.0.0"`, `ENGINEERING_OS_PHASE = "14E"`, `ENGINEERING_OS_STATUS = "ga"` (`packages/engineering-os/src/version.ts`)
- Feature flag (operational): `engineering_os_enabled`
- Older catalog key `engineering_os` still appears in intelligence seed ÔÇö naming duplication, not a second OS
- Product boundary lock: `docs/architecture/ENGINEERING_OS_PRODUCT_BOUNDARY.md` (`EngineeringOSProductBoundaryLocked = true`)

`ENGINEERING_OS.md` still describes Batch 2.0 (ÔÇ£apps registered, not builtÔÇØ). That prose is **stale** relative to V1.0 GA modules in this checkout. Prefer `version.ts`, module registry, and Phase 14 docs for current status.

### 6.2 `createEngineeringOS()` surface

From `packages/engineering-os/src/engineering-os.ts`:

`projects`, `assets`, `documents`, `disciplines`, `companies`, `applications`, `settings`, `search`, `ai`, `dashboard`, `decisions`, `actions`, `risks`, `issues`, `technicalQueries`, `lessons`, `timeline`, `activity`, `objects`, `demo`, `health`.

Capabilities (`packages/engineering-os/src/manifest.ts`):  
`engineering_os`, `engineering_module_host`, `engineering_project_management`, `engineering_asset_register`, `engineering_document_register`, `engineering_ai_workspace`, `engineering_search`, `engineering_reporting`.

Discipline catalog constants (not specialist solvers): Structural, Civil, Mechanical, Piping, Electrical, Instrumentation, Process, Geotechnical, Marine, Construction, Project Controls, Quality, HSE.

### 6.3 UI routes (`apps/web/src/app/(platform)/engineering/`)

Present:

- `/engineering` Command Centre
- `/engineering/modules`
- `/engineering/projects`, `/projects/new`, `/projects/[projectId]`
- `/engineering/assets`, `/assets/new`, `/assets/[assetId]`
- `/engineering/documents`, `/documents/upload`, `/documents/[documentId]`
- `/engineering/disciplines`, `/engineering/companies`, `/engineering/settings`
- `/engineering/search`, `/engineering/reports`, `/engineering/ai`
- `/engineering/health`, `/engineering/test-runner`
- Registers: `/decisions`, `/actions`, `/risks`, `/issues`, `/technical-queries`, `/lessons`, `/timeline`, `/activity`
- Hosted apps: `/engineering/apps/project-intelligence`, `inspection-intelligence`, `asset-intelligence`, `project-controls`, `digital-twin`, `model-interoperability`, `execution-hosts`, `shared-spatial-domain`

Missing or incomplete vs the EOS-A0 brief:

- `/engineering/tags` ÔÇö tables exist (`engineering_tags`, `engineering_entity_tags`); no page/API
- `/engineering/administration` ÔÇö admin nav group exists; not a dedicated administration product page
- `/engineering/knowledge` ÔÇö layout only, no `page.tsx`
- `/engineering/review` ÔÇö **no** Engineering Review product route

### 6.4 API routes

All under `apps/web/src/app/api/engineering/**`. Core contract snapshot: `packages/types/src/engineering-api-contracts.ts`.

### 6.5 Registers (Engineering Core owned)

Documented in `docs/architecture/ENGINEERING_REGISTERS.md`. Tables from `supabase/migrations/20260204000000_batch_205_register_tables.sql`.

| Register | Table | UI | API |
| --- | --- | --- | --- |
| Decisions | `engineering_decisions` | `/engineering/decisions` | `/api/engineering/decisions` |
| Actions | `engineering_actions` | `/engineering/actions` | `/api/engineering/actions` |
| Risks | `engineering_risks` | `/engineering/risks` | `/api/engineering/risks` |
| Issues | `engineering_issues` | `/engineering/issues` | `/api/engineering/issues` |
| Technical Queries | `engineering_technical_queries` | `/engineering/technical-queries` | `/api/engineering/technical-queries` |
| Lessons | `engineering_lessons` | `/engineering/lessons` | `/api/engineering/lessons` |

Shared: `engineering_object_links`, `engineering_object_comments`, `engineering_object_attachments`, `engineering_timeline_events`, `engineering_activity_events`.

Decision register already stores recommendation, rationale, alternatives, confidence, and human approval (`docs/architecture/DECISION_REGISTER.md`). It is a **register**, not full Decision Intelligence (no assumption objects, supersession graph, or authority model beyond register fields).

### 6.6 Shared engineering domains

| Domain | Path | Persistence |
| --- | --- | --- |
| Shared project references | `packages/engineering-shared-project-domain` | `engineering_project_phases`, `engineering_wbs_nodes`, `engineering_work_packages`, `engineering_activities`, `engineering_milestones` (`batch_61`) |
| Shared spatial | `packages/engineering-shared-spatial-domain` | `engineering_*spatial*` (`batch_85`) |
| Model interoperability | `packages/engineering-model-interoperability` | IFC / SPACE GASS / ETABS tables (`batch_86`, `87`, `89`) |
| Execution host | `packages/engineering-execution-host` | `engineering_execution_hosts`, `engineering_execution_jobs`, artifacts (`batch_88`) |

Construction Intelligence is **not** a package. ÔÇ£ConstructionÔÇØ appears only as a discipline label.

---

## 7. Engineering Review ÔÇö factual boundary

There is **no** package `@rtb/engineering-review` and **no** table `engineering_findings` in `supabase/migrations/` of this monorepo.

What exists instead:

| Layer | What it is | Path |
| --- | --- | --- |
| Workflow SDK review record | Shared TypeScript type `EngineeringReviewRecord` | `packages/engineering-os/src/workflow-sdk/index.ts` |
| Module review workflows | Per-module `review-workflow.ts` | `packages/asset-intelligence`, `project-controls`, `digital-twin`, inspection operational workflows |
| Spatial / model mapping reviews | Domain review tables | `engineering_spatial_reference_reviews`, `engineering_model_mapping_reviews` |
| Project Intelligence findings | Certified findings product | `packages/project-intelligence`; tables `project_intelligence_findings*` (`batch_41`); UI `/engineering/apps/project-intelligence/findings` |
| Policy | Review-required / no AI self-approval | `engineering_review_required`, Findings `aiSelfReview: false` |
| Vendor baseline (not live routes) | Standalone PI `engineering-findings` + trusted server | `vendor/project-intelligence-baseline/ab1f442-source.tar.gz` (`app/api/engineering-findings/**`, `security/authorization/TrustedRequestContext.ts`, migrations `20260611120000_engineering_finding_evidence_workflow.sql`) |

**Reuse unchanged:** PI Findings as the certified document-finding/evidence product; Core registers; Workflow SDK contracts; execution-host authorization; tenant/workspace RLS helpers; no-autonomous-approval policy.

**Do not:** silently replace PI Findings with a new review product; do not weaken `TrustedRequestContext` semantics if/when that vendor pattern is reconstituted; do not treat module-local `EngineeringReviewRecord` instances as a complete bounded context.

---

## 8. Database architecture (this checkout)

- Migration count: **104** files in `supabase/migrations/`
- First: `20260101000000_platform_core.sql`
- Last: `20260818000000_batch_97_business_os_owner_command.sql`

Platform core identity tables (`20260101000000_platform_core.sql`):  
`tenants`, `profiles`, `roles`, `tenant_memberships`, `workspaces`, `workspace_memberships`, `audit_events`, plus plugins/command-centre/settings.

Engineering Core tables (`20260203000000_batch_20_engineering_tables.sql`):  
`engineering_disciplines`, `engineering_companies`, `engineering_company_contacts`, `engineering_asset_types`, `engineering_projects`, `engineering_project_members`, `engineering_assets`, `engineering_documents`, `engineering_document_versions`, `engineering_tags`, `engineering_entity_tags`, `engineering_application_registry`, `engineering_application_installations`, `engineering_settings`, `engineering_audit_links`.

No `CREATE TABLE` matching `optim*` exists. Closest analysis-run tables are `digital_twin_solver_*` (batches 82ÔÇô83) and `engineering_execution_jobs`.

`packages/database/src/types.ts` types only early core tables; later engineering/module tables are `GenericTable` stubs in `kernel-types.ts`. Typed generation (`pnpm db:types`) is not a complete schema catalog in this checkout.

---

## 9. Security boundaries

| Control | Evidence |
| --- | --- |
| Authentication | Supabase session via `@rtb/platform-core` `AuthService` |
| Tenant membership | `tenant_memberships`; helper `get_user_tenant_ids()` in `20260101000001_rls_policies.sql` |
| Workspace membership | `workspace_memberships`; later domain policies require workspace_id membership |
| Authorization | `has_permission(resource, action, tenant_id)`; Engineering resource `engineering` |
| Entitlements | `packages/engineering-os/src/commerce/service-guard.ts` |
| RLS | Dedicated files `batch_20_engineering_rls.sql`, `batch_205_register_rls.sql`; later batches embed RLS |
| Audit | `audit_events`; `engineering_audit_links`; module audit tables |
| Trusted server (vendor) | Present in PI baseline tarball; **not** wired as monorepo API boundary |
| Execution host | Host/admin/execute separation; client retains solver licence (`docs/architecture/CONTROLLED_ENGINEERING_EXECUTION_HOST_CONTRACTS.md`) |
| Security closure | `packages/engineering-os/src/security-closure/`; `docs/security/ENGINEERING_OS_V1_SECURITY_BOUNDARY.md` |

Live JWT RLS test suites exist for commerce/installation/PI. Engineering OS package tests assert RLS **principles** (`packages/engineering-os/src/engineering-os.test.ts`) rather than hosted JWT matrices.

---

## 10. Integration model

| Integration | How it works today |
| --- | --- |
| Kernel events | Register services publish `engineering.decision.*` etc. |
| Knowledge graph | Register create may attach `knowledge_node_id`; PI has a **second** in-memory `EngineeringKnowledgeGraph` (`packages/project-intelligence/src/knowledge/graph.ts`) plus `project_intelligence_knowledge_*` tables |
| Digital twin | Kernel registry **and** `@rtb/digital-twin` module tables linked by `kernel_twin_id` (intentional hybrid) |
| Jobs | Kernel `JobService` **plus** commerce scheduler/outbox **plus** PI document/meeting claim-job RPCs **plus** `engineering_execution_jobs` |
| External analysis | Execution host + model-interop adapters (IFC, SPACE GASS, ETABS). Not a generic vendor-neutral analysis-engine contract covering HYSYS/STAAD/PLAXIS/etc. |
| Connectors | Module-local adapters only (no shared connector framework) |

---

## 11. Test and CI architecture

- Unit/integration: Vitest across domain and certification packages; root `turbo test`
- Hosted RLS: `pnpm test:rls` currently filters `@rtb/platform-commerce test:rls`
- E2E: Playwright configs in 14 certification packages
- Certification packages: 15 `*-certification` packages under `packages/`
- CI: 90+ workflows under `.github/workflows/` including `phase-14*.yml` (Engineering OS readiness, security closure, GA)
- Secret scan: `scripts/secret-exposure-scan.ts` (not gitleaks)
- Dependency SCA: Engineering OS certification `pnpm audit` + `docs/security/RTB_DEPENDENCY_SCA_POLICY.md`, gated in phase-14d

---

## 12. Target-domain snapshot (current code, not aspiration)

| Target domain | Status | Notes |
| --- | --- | --- |
| Lifecycle Intelligence | PARTIAL | Asset Intelligence lifecycle; project phases table; no governed lifecycle context engine |
| Systems Intelligence | MISSING | Asset hierarchy only |
| Discipline Intelligence | PARTIAL | Discipline catalog + UI; no specialist reasoning products |
| Optimization Intelligence | MISSING | Explicitly a non-goal in Digital Twin docs; no optimization tables |
| Decision Intelligence | PARTIAL | Core Decision register + PC decision-support tables + Business OS decisions (sibling OS) |
| Value Intelligence | MISSING | No projected/realized value objects |
| Requirements | MISSING | No requirements tables/routes |
| Assumptions | MISSING as shared objects | Predictive methods have local assumption strings |
| Change | EXISTS (module-scoped) | Project Controls change domain |
| Impact | PARTIAL | `engineering_model_change_impacts`; no general impact graph |
| Interface Intelligence | PARTIAL | Model mappings; no systems interface register |
| Configuration Intelligence | MISSING | Document revisions exist; no configuration baselines/IFC/as-built states |
| Uncertainty Intelligence | PARTIAL | Inspection/predictive confidence; not a shared uncertainty service |
| Engineering Digital Thread | PARTIAL | Object links + KG node ids + DT thread concepts; not a governed semantic layer |
| Knowledge Graph | DUPLICATED infrastructure risk | Platform KG + PI KG tables/in-memory graph |
| Analysis engines | PARTIAL | Execution host + IFC/SPACE GASS/ETABS federation |

---

## 13. Documentation hygiene

`docs/architecture/ARCHITECTURE.md` and `docs/architecture/DATABASE.md` understate kernel/intelligence and list far fewer than 104 migrations. Batch 1.5/1.75 docs (`AI_DIRECTOR.md`, `CAPABILITY_REGISTRY.md`) track code more closely. EOS-A* documents in this folder supersede those older overviews **for Engineering OS planning only**; they do not rewrite platform V1 lock files.
