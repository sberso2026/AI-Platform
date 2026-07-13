# Project Intelligence — Current State Inventory

**Phase:** 6A discovery (read-only)  
**Baseline:** `customer-admin-rc-1` @ `f781fa089670e2842327db1a6797f692f593afc1`  
**Date:** 2026-07-12  
**Status:** Discovery complete — no production behaviour changed

---

## 1. Dual-codebase reality

Project Intelligence today exists in **two places** with different maturity:

| Location | Role | Maturity |
|----------|------|----------|
| `01_Apps/Engineering OS/Project Intelligence/RTB Project Intelligence` | Standalone product codebase (`rtb-project-intelligence`) | Near-product / advanced pilot |
| `01_Apps/AI Platform` (this monorepo) | Integration shell, commerce product key, Engineering Core contracts | Registration only — Batch 2.1 UI **not built** |

**Authoritative product source for capability preservation:**  
`C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\Engineering OS\Project Intelligence\RTB Project Intelligence`

**Remote:** `https://github.com/sberso2026/rtb-project-intelligence.git`  
**Branch:** `master` @ `465d1e0` (*Fix Thor evidence-source integrity…*) with **large uncommitted WIP** on the working tree.  
**Backup snapshot:** `...\Project Intelligence\Backup\RTB Project Intelligence` — duplicate; do not treat as second source of truth.

Do **not** rebuild from AI Platform stubs. Do **not** ignore the standalone app.

---

## 2. AI Platform monorepo inventory (integration shell)

### Packages touching PI

| Package | Path | PI role |
|---------|------|---------|
| `@rtb/engineering-os` | `packages/engineering-os` | Engineering Core; registry entry `project_intelligence` (`enabled: false`, version `0.0.0`) |
| `@rtb/platform-commerce` | `packages/platform-commerce` | Product `project-intelligence`, app key, dependency on Engineering OS, provisioning shell |
| `@rtb/platform-core` | `packages/platform-core` | Nav/commerce adapter hides PI until enabled |
| `@rtb/types` | `packages/types` | `project-intelligence-integration.ts` contracts only |
| `@rtb/platform-intelligence` | `packages/platform-intelligence` | **Platform AI control plane** — naming collision; **not** the PI product |
| Certification packages | commerce / installation / customer-admin | Fixtures reference `project_intelligence` |

### Missing in AI Platform

- No `@rtb/project-intelligence` package  
- No `/engineering/apps/project-intelligence` page  
- No `/engineering/meetings` page (policy references exist)  
- No `ProjectIntelligenceIntegrationClient` implementer  
- No `project_intelligence_project_mappings` table  
- No PI meetings/transcripts/findings tables  

### Documented stance

- `docs/architecture/BATCH_2_READINESS.md` — **Project Intelligence built: No**  
- `docs/architecture/APPLICATION_INSTALLATION.md` — registration and integration shell only  
- `docs/architecture/PROJECT_INTELLIGENCE_INTEGRATION.md` — Batch 2.06 contract for an **existing** separate app  

### Route inconsistency (AI Platform)

| Advertised | Where | On disk |
|------------|-------|---------|
| `/engineering/apps/project-intelligence` | `engineering-os` manifest / seed | Missing |
| `/engineering/project-intelligence` | `apps/web` commerce guards | Missing |

**Phase 6 target route (per brief):** `/engineering/apps/project-intelligence`

---

## 3. Standalone PI inventory (product to modernize)

### Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js ^15.4.6, React 19, TypeScript 5.8 |
| UI | Tailwind 3.4, custom `PlatformShell` |
| Data | Supabase JS + SQL migrations (~42); **no Prisma** |
| Auth | Supabase Auth + `profiles.tenant_id` membership |
| AI | OpenAI HTTP (chat, embeddings, Whisper, TTS) — direct, not Platform Intelligence |
| Parser | Python FastAPI `services/document-parser-service` |
| Tests | Vitest ~335 files |
| Realtime | Dev WebSocket mock (`ws`); not production Teams capture |

### Frontend routes (selected)

| Route | Capability |
|-------|------------|
| `/home` | Portfolio home |
| `/projects`, `/projects/[projectId]` | Project workspace |
| `/documents` | Document upload / index |
| `/meetings`, `/meetings/live`, `/meetings/[id]/mom` | Meetings / live / MoM |
| `/decisions`, `/actions`, `/risks` | Governance registers (PI-local) |
| `/ask` | Thor / Ask Project Intelligence |
| `/analytics`, `/reports`, `/executive`, `/portfolio` | Analytics / executive |
| `/engineering-intelligence/*` | Patterns, rules, lessons, standards |
| `/administration/*`, `/tenant/admin/*` | Admin / health / AI review |
| `/login`, `/platform/*` | Auth / platform ops |

~49 `page.tsx` files. Legacy `/dashboard` and `/reports/legacy/*` exist but are de-emphasized by shell nav.

### Database tables (standalone PI)

**Meetings / MoM**

- `meeting_sessions`, `meeting_transcripts`, `meeting_nlp_analyses`, `meeting_minutes`

**Documents / indexing**

- `documents`, `document_chunks`, `document_pages`
- `document_processing_events`, `document_indexing_jobs`, `document_indexing_worker_heartbeats`
- claim/visual/parser health event tables

**Decision graph (PI-local — conflicts with Engineering Core)**

- `projects`, `assets`
- `decisions`, `decision_options`, `decision_risks`, `decision_actions`, `decision_evidence`, `decision_approvals`, `decision_outcomes`
- `decision_impacted_disciplines`, `decision_assets`, `decision_edges`
- `workflow_instances`, `workflow_stage_events`
- `portfolio_metrics_snapshots`
- Views: `decision_register_view`, `decision_with_counts_view`, `decision_graph_edges_view`, `decision_portfolio_summary_view`

**AI governance / intelligence**

- `engineering_concepts`, `engineering_concept_sources`, `engineering_claims`, `engineering_claim_evidence`
- `ai_assistant_answers`, `ai_answer_feedback`, `ai_human_review_queue`
- `engineering_decision_patterns`, `engineering_rules`, `lessons_learned`, `standards_interpretations`, `engineering_findings`

**Platform / ops**

- `tenants`, `profiles` (assumed / aligned), `tenant_invitations`
- `audit_events`, `visual_audit_logs`, `voice_audit_logs`
- `platform_health_snapshots`, `engineering_readiness_runs`, `benchmark_runs`

**Not present as first-class tables:** issues register, technical queries register (Engineering Core has these; PI does not).

### Auth / tenancy

- Single active `profiles.tenant_id` (not multi-membership / multi-workspace like AI Platform)
- Roles: viewer, engineer, coordinator, manager, admin, owner (+ platform roles)
- `TrustedRequestContext` for API authorization
- RLS: tenant isolation via `profiles.tenant_id = auth.uid()` pattern on app tables
- **No AI Platform `workspaces` model** in PI today

### Services (preserve candidates)

| Area | Location (standalone) |
|------|------------------------|
| Thor AI | `services/thorAssistant.ts`, `services/thor/*` |
| Document pipeline | indexing / OCR / retrieval / FastAPI parser |
| Meetings / MoM | `services/meeting/*`, `services/momGenerator.ts` |
| Realtime | `services/realtimePipeline.ts`, mock WS server |
| Decision graph | governance APIs + executive analytics |
| Findings / EI | `services/rtbIntelligence/*` |
| Integrations | `integrations/teamsBot.ts`, `zoomBot.ts`, `googleMeetBot.ts`, `manualMeetingAdapter.ts` (bots **scaffolded**, default off) |

### APIs

~85 App Router `route.ts` handlers under `app/api/**` (no Next server actions). Groups: auth, Thor/AI, documents, meeting/MoM, governance, executive analytics, platform admin, voice/vision, realtime, webhooks.

### Tests / ops

- ~335 Vitest files (security, Thor grounding, indexing, shell, readiness gates)
- Heavy operator evidence under `docs/evidence/`
- CI: `.github/workflows/standards-benchmark.yml`
- Docs: USER_MANUAL, ARCHITECTURE, SECURITY_ARCHITECTURE, DOCUMENT_PARSER_CONTRACT, THOR_DOCUMENT_GROUNDING_AUDIT, AI_GOVERNANCE_*, deployment runbooks

---

## 4. Engineering Core already available in AI Platform

Authoritative in AI Platform (do not duplicate):

| Domain | Tables / APIs |
|--------|----------------|
| Projects | `engineering_projects`, `/api/engineering/projects` |
| Assets | `engineering_assets` |
| Documents (metadata) | `engineering_documents`, versions |
| Decisions / actions / risks / issues / TQs / lessons | Batch 2.05 registers + `/api/engineering/*` |
| Timeline / activity | `engineering_timeline_events`, `engineering_activity_events` |
| Companies / disciplines | Core tables |
| Object links / KG hooks | `engineering_object_links` |
| AI workspace | Engineering AI → kernel AI Director (mock provider today) |
| Commerce install | `commercial_application_installations` + parent Engineering OS |

---

## 5. Deployment model (as discovered)

| App | Deploy model |
|-----|----------------|
| Standalone PI | Next.js app + Supabase project + optional Python parser + optional indexing worker |
| AI Platform | Monorepo Next.js (`apps/web`) + shared hosted staging Supabase `wcydlhqiqdwgoaqrlget` + certified commerce lifecycle |

Phase 6 target: PI becomes an **installable Engineering OS application** inside AI Platform UX and lifecycle — not a permanently separate deployable with competing identity.

---

## 6. Classification summary (high level)

| Layer | Classification |
|-------|----------------|
| Standalone Thor + document pipeline | **preserve with adapter** → Platform Intelligence governance |
| Meetings / transcripts / MoM | **preserve** (PI-owned domain) + human review before Core write |
| PI `projects` / register tables | **migrate to Engineering Core** via mapping; retire as authority |
| PI PlatformShell | **modernize** into shared Engineering shell |
| Meeting bots (Teams/Zoom/Meet) | **preserve with adapter** (incomplete) — do not claim live capture |
| AI Platform PI stubs | **modernize** into real app package consuming Core |
| Backup tree | **deprecate** after cutover confirmation |

Detailed matrix: [PROJECT_INTELLIGENCE_CAPABILITY_MATRIX.md](./PROJECT_INTELLIGENCE_CAPABILITY_MATRIX.md)

---

## 7. Human decisions required before Phase 6B

1. **Canonical PI working tree** — commit or freeze uncommitted WIP before migration slicing.  
2. **Supabase data plane** — migrate PI tenants into AI Platform hosted project vs dual-DB sync period.  
3. **Workspace model** — map PI single-tenant profile model onto AI Platform workspaces/seats.  
4. **Register merge policy** — how to map PI `decisions` / `decision_actions` / `decision_risks` onto Engineering Core registers without silent merge.  
5. **Meeting Intelligence vs Project Intelligence** — **6C-3A locked:** Meetings stay under Project Intelligence as a feature (`application: project-intelligence`, `feature: meetings`). Registry stub `meeting_intelligence` remains disabled; see `docs/architecture/PROJECT_INTELLIGENCE_MEETING_INTEGRATION_DECISIONS.md`.  
6. **External bot production commitment** — keep deferred vs Phase 6B scope.

Until these are resolved, implementation may scaffold adapters and mapping UI but must not run destructive data migration.
