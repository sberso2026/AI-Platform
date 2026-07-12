# Project Intelligence — Data Ownership Matrix

**Phase:** 6A discovery + **6B approved decisions**  
**Rule:** Engineering Core remains authoritative for shared engineering entities. Project Intelligence may own application-specific intelligence only.  
**Certified baseline:** `customer-admin-rc-1` — do not weaken commerce/install/RLS semantics.  
**Production database:** RTB Platform Supabase is final SoT; standalone PI Supabase is migration source only (no permanent dual-DB production).  
**Meetings:** Remain inside Project Intelligence for Phase 6B; approved outputs enter Core only via human review.

---

## 1. Ownership principles

1. No competing authoritative copies of Core entities after cutover.  
2. PI may retain **legacy** rows for traceability via mappings.  
3. AI extractionsctions enter a **review queue** before Core writes.  
4. Uninstall of PI removes PI-owned intelligence and mappings; **never** deletes Engineering Core data.  
5. `commercial_application_installations` remains authoritative for install state; any `engineering_application_installations` row is derived.

---

## 2. Engineering Core entities (authoritative)

| Entity | Current owner (AI Platform) | Future owner | Migration action | Authoritative ID | Retention | RLS boundary | API owner | Event owner | Uninstall behaviour |
|--------|----------------------------|--------------|------------------|------------------|-----------|--------------|-----------|-------------|---------------|
| Projects | Engineering Core | Engineering Core | Map from PI `projects` | `engineering_projects.id` | Permanent (tenant) | tenant + eng permissions + workspace/seat | `/api/engineering/projects` | `engineering.project.*` | Retain |
| Assets | Engineering Core | Engineering Core | Map from PI `assets` | `engineering_assets.id` | Permanent | same | `/api/engineering/assets` | asset events | Retain |
| Documents metadata | Engineering Core | Engineering Core | Map from PI `documents` | `engineering_documents.id` | Permanent | same | `/api/engineering/documents` | document events | Retain |
| Decisions | Engineering Core | Engineering Core | Map/merge from PI `decisions` with human review | `engineering_decisions.id` | Permanent | same | `/api/engineering/decisions` | `engineering.decision.*` | Retain |
| Actions | Engineering Core | Engineering Core | Map from PI `decision_actions` | `engineering_actions.id` | Permanent | same | `/api/engineering/actions` | `engineering.action.*` | Retain |
| Risks | Engineering Core | Engineering Core | Map from PI `decision_risks` | `engineering_risks.id` | Permanent | same | `/api/engineering/risks` | `engineering.risk.*` | Retain |
| Issues | Engineering Core | Engineering Core | No PI table — Core only | `engineering_issues.id` | Permanent | same | `/api/engineering/issues` | issue events | Retain |
| Technical queries | Engineering Core | Engineering Core | No PI table — Core only | `engineering_technical_queries.id` | Permanent | same | `/api/engineering/technical-queries` | TQ events | Retain |
| Lessons learned | Engineering Core | Engineering Core | Map from PI `lessons_learned` | `engineering_lessons.id` | Permanent | same | `/api/engineering/lessons` | lesson events | Retain |
| Timeline / activity | Engineering Core | Engineering Core | Subscribe; do not fork | timeline/activity IDs | Permanent | same | `/api/engineering/timeline|activity` | Core events | Retain |
| Companies / disciplines | Engineering Core | Engineering Core | Consume only | Core IDs | Permanent | same | Core APIs | Core | Retain |
| Object links | Engineering Core | Engineering Core | PI creates links via Core | `engineering_object_links.id` | Permanent | same | Core object APIs | link events | Retain |

---

## 3. Project Intelligence–owned entities (target)

| Entity | Current owner (standalone) | Future owner | Migration action | Authoritative ID | Retention | RLS boundary | API owner | Event owner | Uninstall behaviour |
|--------|---------------------------|--------------|------------------|------------------|-----------|--------------|-----------|-------------|---------------------|
| Project mappings | None in AI Platform | PI | Create `project_intelligence_project_mappings` | mapping `id` | Until retired + audit archive | tenant + workspace | PI migration APIs | `project_intelligence.sync.*` | Delete mappings; keep audit |
| Meeting sessions | PI | PI | Port schema + RLS | `meeting_sessions.id` | Tenant policy | tenant + workspace + install | PI meetings APIs | PI meeting events | Delete PI meeting data |
| Meeting transcripts | PI | PI | Port | `meeting_transcripts.id` | Tenant policy | same | PI | PI | Delete |
| Meeting NLP analyses | PI | PI | Port | analysis id | Tenant policy | same | PI | PI | Delete |
| Meeting minutes (MoM) | PI | PI (draft) → Core (approved extracts) | Port + review gate | MoM id / Core ids | Drafts deletable; approved Core retained | same | PI MoM + Core | PI + Core | Delete drafts; retain Core |
| Document chunks / pages / embeddings | PI | PI | Port as intelligence layer | chunk ids | Tied to mapped document | tenant + workspace | PI document intel APIs | PI | Delete chunks; Core metadata retained |
| Indexing jobs / worker heartbeats | PI | PI | Port | job ids | Operational | service-role audited | workers | PI | Delete |
| Parser / OCR / claim / visual events | PI | PI | Port | event ids | Ops retention | tenant/admin | PI | PI | Delete |
| Decision graph overlay (options, edges, outcomes, evidence, approvals) | PI | PI | Port as **non-authoritative** analytics linked to Core decision IDs | overlay ids | Tenant policy | tenant + workspace | PI analytics | PI | Delete overlay |
| Portfolio metrics snapshots | PI | PI | Port | snapshot ids | Tenant policy | same | PI | PI | Delete |
| Concepts / claims / claim evidence | PI | PI | Port | concept/claim ids | Tenant policy | same | PI | PI | Delete |
| AI answers / feedback / review queue | PI | PI (+ Platform traces) | Port; bind Platform trace IDs | answer/queue ids | Tenant + compliance | same | PI + Platform observability | PI/Platform | Delete PI rows; Platform metering retained per policy |
| Decision patterns / rules / findings / standards interpretations | PI | PI | Port | pattern/finding ids | Tenant policy | same | PI | PI | Delete |
| Report configurations / board packs (if stored) | PI | PI | Port configs only | config ids | Tenant policy | same | PI | PI | Delete configs |
| Forecasts / health snapshots (app-specific) | Partial / unresolved | PI | Confirm schema in WIP then port | snapshot ids | Tenant policy | same | PI | PI | Delete |
| Workflow instances (PI-local) | PI | **unresolved** | Prefer Core workflow hooks where possible | — | — | — | — | — | Do not fork Core approvals |

---

## 4. Standalone PI tables — future disposition

| Current PI table | Current owner | Future owner | Migration action | Authoritative identifier | Retention | RLS boundary | API owner | Event owner | Uninstall |
|------------------|---------------|--------------|------------------|--------------------------|-----------|--------------|-----------|-------------|-----------|
| `projects` | PI | Engineering Core | Match/create + map; retire authority | → `engineering_project_id` | Legacy archive optional | Core | Core | Core | Core retained |
| `assets` | PI | Engineering Core | Map | → `engineering_assets.id` | Legacy optional | Core | Core | Core | Core retained |
| `documents` | PI | Split | Metadata → Core; bytes/chunks stay PI until unified store | Core doc id + PI doc id | Dual until verified | Core + PI | Core + PI | both | Core meta retained; PI intel deleted |
| `document_chunks` | PI | PI | Port | chunk id | With doc intel | PI | PI | PI | Delete |
| `document_pages` | PI | PI | Port | page id | With doc intel | PI | PI | PI | Delete |
| `document_indexing_jobs` | PI | PI | Port | job id | Ops | PI/service | worker | PI | Delete |
| `document_indexing_worker_heartbeats` | PI | PI | Port | heartbeat id | Ops | service | worker | PI | Delete |
| `document_processing_events` (+ claim/visual/parser events) | PI | PI | Port | event id | Ops | PI | PI | PI | Delete |
| `decisions` | PI | Engineering Core | Proposed → review → Core | → `engineering_decisions.id` | Legacy optional | Core | Core | Core | Core retained |
| `decision_options` | PI | PI overlay | Link to Core decision | option id | With overlay | PI | PI | PI | Delete |
| `decision_risks` | PI | Engineering Core (risks) | Map/review | → `engineering_risks.id` | Legacy optional | Core | Core | Core | Core retained |
| `decision_actions` | PI | Engineering Core (actions) | Map/review | → `engineering_actions.id` | Legacy optional | Core | Core | Core | Core retained |
| `decision_evidence` | PI | PI overlay / Core attachments | Prefer Core attachments + citations | evidence id | Policy | PI/Core | both | both | Overlay delete; Core attachments retained |
| `decision_approvals` | PI | Engineering Core workflows | Use Core approval hooks | Core workflow | Permanent | Core | Core | Core | Core retained |
| `decision_outcomes` | PI | PI overlay | Link Core decision | outcome id | With overlay | PI | PI | PI | Delete |
| `decision_edges` (+ impacted disciplines/assets) | PI | PI overlay / Core object_links | Prefer Core links for cross-register | edge/link id | Policy | PI/Core | both | both | Overlay delete; Core links retained |
| `workflow_instances` / `workflow_stage_events` | PI | **unresolved** / Core hooks | Do not duplicate decision approval | — | — | — | — | — | TBD |
| `portfolio_metrics_snapshots` | PI | PI | Port | snapshot id | Tenant | PI | PI | PI | Delete |
| `meeting_sessions` | PI | PI | Port | session id | Tenant | PI | PI | PI | Delete |
| `meeting_transcripts` | PI | PI | Port | transcript id | Tenant | PI | PI | PI | Delete |
| `meeting_nlp_analyses` | PI | PI | Port | analysis id | Tenant | PI | PI | PI | Delete |
| `meeting_minutes` | PI | PI drafts | Port; approved extracts → Core | MoM id | Drafts tenant; extracts Core | PI/Core | both | both | Delete drafts |
| `engineering_concepts` (+ sources) | PI | PI | Port (rename if colliding) | concept id | Tenant | PI | PI | PI | Delete |
| `engineering_claims` (+ evidence) | PI | PI | Port | claim id | Tenant | PI | PI | PI | Delete |
| `ai_assistant_answers` | PI | PI + Platform traces | Port | answer id | Tenant | PI | PI | Platform traces | Delete PI; retain Platform metering |
| `ai_answer_feedback` | PI | PI | Port | feedback id | Tenant | PI | PI | PI | Delete |
| `ai_human_review_queue` | PI | PI | Port; gate Core writes | queue id | Until resolved + audit | PI | PI | PI | Delete open items after policy |
| `engineering_decision_patterns` | PI | PI | Port | pattern id | Tenant | PI | PI | PI | Delete |
| `engineering_rules` | PI | PI | Port | rule id | Tenant | PI | PI | PI | Delete |
| `lessons_learned` (PI) | PI | Engineering Core | Map to `engineering_lessons` | → Core lesson id | Legacy optional | Core | Core | Core | Core retained |
| `standards_interpretations` | PI | PI | Port | interpretation id | Tenant | PI | PI | PI | Delete |
| `engineering_findings` | PI | PI | Port; never auto-promote to Core | finding id | Tenant | PI | PI | PI | Delete |
| `tenant_invitations` | PI | Platform identity | **deprecate** after Platform users/invites | — | — | Platform | Platform | Platform | N/A |
| `profiles` / `tenants` (PI DB) | PI | Platform `tenants` / memberships | **migrate identity**; do not keep parallel IdP | Platform IDs | Platform | Platform | Platform | Platform | Platform retained |
| `audit_events` (+ visual/voice) | PI | PI + Platform audit | Port PI-specific; align correlation IDs | audit id | Compliance | PI/Platform | both | both | Retain per retention policy |
| `platform_health_snapshots` | PI | PI health | Port into app health | snapshot id | Ops | PI admin | PI | PI | Delete |
| `engineering_readiness_runs` / `benchmark_runs` | PI | PI / certification | Port as operator evidence | run id | Ops | admin | PI | PI | Delete or archive |
| Decision graph views | PI | PI | Recreate against mapped Core IDs | view | Derived | PI | PI | — | Drop with overlay |

---

## 5. New AI Platform table (required)

### `project_intelligence_project_mappings`

| Field | Purpose |
|-------|---------|
| `id` | Primary key |
| `tenant_id` | Tenant scope |
| `workspace_id` | Workspace scope |
| `engineering_project_id` | Core canonical project |
| `legacy_project_intelligence_project_id` | Standalone PI project id |
| `mapping_status` | discovered → … → verified / failed / rolled_back |
| `confidence` | Match confidence |
| `migration_source` | Source system identifier |
| `migration_version` | Migration batch/version |
| `conflict_state` | Conflict payload/state |
| `last_sync_at` / `last_sync_status` | Sync health |
| `metadata` | Extensible |
| `created_at` / `updated_at` | Audit |

**Constraints:** no cross-tenant; no cross-workspace; no duplicate active mapping; low-confidence merges require human review; all changes audited.

UI: `/engineering/apps/project-intelligence/migration`

---

## 6. Ownership conflicts (blockers)

| Conflict | Severity | Resolution required |
|----------|----------|---------------------|
| PI `projects` vs `engineering_projects` | Critical | Mapping + Core authority |
| PI decision graph vs Core registers | Critical | Core authority; overlay analytics only |
| PI `documents` vs Core documents | High | Split metadata vs intel blobs/chunks |
| PI `lessons_learned` vs Core lessons | High | Map + rename |
| PI single-tenant profile vs Platform workspaces/seats | Critical | Identity/workspace redesign |
| Direct OpenAI vs Platform Intelligence | High | Mandatory governance cutover |
| `meeting_intelligence` registry app vs PI meetings module | Medium | Product decision |
| Dirty standalone git WIP | High | Freeze source revision |

**No destructive migration or broad refactoring until these conflicts are accepted by stakeholders.**

---

## 7. Event ownership (target)

| Direction | Events |
|-----------|--------|
| Core → PI (subscribe) | `engineering.project.*`, decision/action/risk/issue/TQ/lesson created/approved/closed |
| PI → Platform (publish) | `project_intelligence.sync.requested`, `project_intelligence.sync.completed`, meeting/intel domain events (TBD, versioned) |

---

## 8. Related docs

- [PROJECT_INTELLIGENCE_CURRENT_STATE.md](../migration/PROJECT_INTELLIGENCE_CURRENT_STATE.md)
- [PROJECT_INTELLIGENCE_CAPABILITY_MATRIX.md](../migration/PROJECT_INTELLIGENCE_CAPABILITY_MATRIX.md)
- [PROJECT_INTELLIGENCE_TECHNICAL_DEBT.md](../migration/PROJECT_INTELLIGENCE_TECHNICAL_DEBT.md)
- [PROJECT_INTELLIGENCE_INTEGRATION.md](../architecture/PROJECT_INTELLIGENCE_INTEGRATION.md)
- [APPLICATION_INSTALLATION.md](../architecture/APPLICATION_INSTALLATION.md)
