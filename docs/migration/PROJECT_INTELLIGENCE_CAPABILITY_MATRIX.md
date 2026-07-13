# Project Intelligence — Capability Matrix

**Phase:** 6A discovery  
**Sources:** Standalone `rtb-project-intelligence` + AI Platform Engineering Core / commerce shell  
**Legend:** preserve unchanged | preserve with adapter | modernize | migrate to Platform | migrate to Engineering Core | deprecate after cutover | unresolved (human decision)

---

## Capability classifications

| Capability | Where it lives today | Classification | Notes |
|------------|----------------------|----------------|-------|
| Product registration / commerce key | AI Platform commerce + engineering registry | **modernize** | Wire full install lifecycle; keep `commercial_application_installations` authoritative |
| Parent Engineering OS dependency | AI Platform installation dependency | **preserve unchanged** | Already certified |
| App route `/engineering/apps/project-intelligence` | AI Platform (missing) | **modernize** | Create under shared Engineering shell |
| PlatformShell / identity / nav | Standalone PI | **modernize** | Replace isolated shell with RTB Engineering chrome |
| Portfolio / home dashboard | Standalone `/home`, executive surfaces | **preserve with adapter** | Rebind to Core projects + PI analytics |
| Project list / detail UX | Standalone `/projects` | **migrate to Engineering Core** (data) + **modernize** (UX) | Core owns projects; PI adds intelligence tabs |
| Project mapping | Types-only in AI Platform | **modernize** | Implement `project_intelligence_project_mappings` |
| Assets register | Both (PI `assets` vs Core `engineering_assets`) | **migrate to Engineering Core** | Mapping + dual-read during cutover |
| Documents metadata | Both (PI `documents` vs Core `engineering_documents`) | **migrate to Engineering Core** (metadata) | PI may own chunks/embeddings/index jobs |
| Document parse / OCR / chunk / embed | Standalone pipeline + FastAPI parser | **preserve with adapter** | High value; wrap under Platform services where appropriate |
| Document retrieval / evidence citations | Standalone Thor grounding | **preserve with adapter** | Must keep citation integrity |
| Decisions register | Both (conflict) | **migrate to Engineering Core** | Human approval required; no AI auto-approve |
| Actions register | Both (`decision_actions` vs `engineering_actions`) | **migrate to Engineering Core** | |
| Risks register | Both (`decision_risks` vs `engineering_risks`) | **migrate to Engineering Core** | |
| Issues register | Core only | **preserve unchanged** (Core) | PI has no first-class issues table |
| Technical queries | Core only | **preserve unchanged** (Core) | PI lacks TQ product module |
| Lessons learned | Both (`lessons_learned` naming collision) | **migrate to Engineering Core** | Disambiguate schemas |
| Decision graph / edges / options / outcomes | Standalone PI | **preserve** (PI-owned analytics) | Keep as intelligence overlay; link to Core IDs |
| Portfolio metrics snapshots | Standalone | **preserve** | PI-owned intelligence |
| Meetings / sessions | Standalone | **preserve** | PI-owned |
| Live transcript / NLP | Standalone + mock WS | **preserve with adapter** | Production capture incomplete |
| MoM generate / approve / export | Standalone | **preserve** + **human review boundary** | Approval → Core actions/decisions only after review |
| Chair assistant / Thor in-meeting | Standalone | **preserve with adapter** | Govern via Platform AI Director |
| Ask Project Intelligence (`/ask`) | Standalone Thor | **migrate to Platform** (governance) + **preserve** UX | Replace ungoverned OpenAI path |
| Findings / patterns / rules / standards | Standalone RTB Intelligence tables | **preserve** | PI-owned intelligence |
| Forecasts | Not found as product tables | **unresolved** | May be analytics views only — confirm in WIP |
| Reports / board pack / benchmarks | Standalone executive layer | **preserve with adapter** | Do not fabricate; keep evidence rules |
| Knowledge graph | PI decision_edges; Platform KG; Core object_links | **modernize** | Prefer Core links + Platform KG; no duplicate register nodes |
| AI Director / model / prompt / tool registries | AI Platform `@rtb/platform-intelligence` | **preserve unchanged** (Platform) | PI must consume |
| Direct OpenAI calls in PI | Standalone | **migrate to Platform** | Ungoverned path not allowed post-integration |
| Human review queue | Standalone `ai_human_review_queue` | **preserve with adapter** | Align with Core write gates |
| Teams / Zoom / Meet bots | Standalone adapters (default off) | **preserve with adapter** | Incomplete — do not claim live |
| Microsoft Graph webhook | Stub job | **modernize** or defer | **unresolved** scope for 6B |
| Document indexing worker | Standalone Postgres queue | **preserve with adapter** | Operationally mature |
| Background `jobs/*` TODOs | Standalone stubs | **deprecate** or rewrite | Do not migrate empty skeletons |
| Feature flags | Both (different systems) | **migrate to Platform** | Use Platform feature flags |
| RLS (PI tables) | Standalone strong tenant RLS | **modernize** | Re-test under AI Platform tenancy + workspace/seat |
| RLS (Core) | AI Platform certified patterns | **preserve unchanged** | |
| Health / readiness | Standalone platform health + AI Platform eng health | **modernize** | Unified `/engineering/apps/project-intelligence/health` |
| Vitest suite (~335) | Standalone | **preserve with adapter** | Port/adapt into `packages/project-intelligence-certification` |
| Playwright / hosted cert | AI Platform Phase 5 model | **modernize** | New PI certification package |
| Backup folder duplicate | `Project Intelligence/Backup` | **deprecate after cutover** | |
| Isolated PI login / founder bootstrap | Standalone | **deprecate after cutover** | Use Platform identity |
| Multi-workspace / seats | AI Platform only | **modernize** (PI must adopt) | Hard gap |

---

## Preserve / Adapt / Migrate / Retire (rollup)

### Preserve (do not simplify away)

- Document intelligence pipeline (parse → chunk → embed → retrieve → cite)
- Thor grounding / evidence integrity gates
- Meetings, transcripts, MoM workflows (manual / mic paths)
- Decision-graph analytics overlay (options, outcomes, edges) as **non-authoritative** intelligence
- Findings / patterns / AI feedback / human review queue concepts
- Operator evidence discipline and security Vitest coverage

### Adapt (keep behaviour, change boundary)

- Auth → Platform identity, tenant, workspace, seat, installation
- AI calls → Platform Intelligence (Director, registry, metering, traces)
- Shell → shared Engineering OS chrome at `/engineering/apps/project-intelligence`
- Document metadata writes → Engineering Core document APIs
- Approved MoM extractionsctions → Engineering Core registers via review queue

### Migrate (authority moves to Core / Platform)

- `projects`, `assets` → Engineering Core
- `decisions`, `decision_actions`, `decision_risks` → Engineering Core registers
- `lessons_learned` (PI) → Engineering Core lessons
- Feature flags / secrets patterns → Platform services
- Installation / entitlement → certified commerce lifecycle

### Retire after cutover

- Standalone login/bootstrap as primary identity
- Competing PI tables used as source of truth for Core entities
- Legacy `/dashboard` if unused after shell cutover
- `Backup\` tree
- Empty `jobs/*` stubs (replace with real Platform/scheduler jobs if needed)
- Direct production OpenAI path bypassing Platform governance

### Unresolved (block destructive migration)

- Commit freeze for PI dirty git tree
- Dual-DB vs single hosted Supabase strategy
- Whether `meeting_intelligence` stays nested under PI or becomes sibling app — **6C-3A:** nested as PI Meetings feature; stub retained disabled (`PROJECT_INTELLIGENCE_MEETING_INTEGRATION_DECISIONS.md`)
- Forecast product scope
- Production bot/Graph timeline

---

## Installation access chain (target)

```
Tenant → Workspace → User → Subscription → Licence
  → Application Installation (project_intelligence)
  → Seat → Engineering OS (active) → Project Intelligence → Feature → Action
```

Sidebar visibility alone is insufficient — enforce via certified commerce/installation guards already used by Engineering routes.
