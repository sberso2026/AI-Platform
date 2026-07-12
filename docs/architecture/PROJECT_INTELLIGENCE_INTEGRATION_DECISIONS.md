# Project Intelligence Integration Decisions (Phase 6B)

**Phase:** 6B — Integration Foundation  
**Status:** Approved for implementation  
**Certified Phase 5 baseline:** `customer-admin-rc-1` → `f781fa089670e2842327db1a6797f692f593afc1`  
**Phase 6A discovery:** `c5b17ba`  
**Non-negotiable:** Do not rebuild Project Intelligence. Do not begin destructive legacy data migration in Phase 6B.

---

## 1. Production database

| Decision | Detail |
|----------|--------|
| Final production SoT | **RTB Platform Supabase** |
| Standalone PI Supabase | **Migration source only** |
| Dual-database production | **Prohibited** as a permanent runtime |
| Cutover | Single Platform database after migration verification |

---

## 2. Project authority

| Decision | Detail |
|----------|--------|
| Projects | **Engineering Core** owns `engineering_projects` |
| Legacy PI `projects` | Non-authoritative after mapping approval; retained only for migration evidence |

---

## 3. Shared engineering authority (Engineering Core)

Engineering Core owns:

- assets  
- document metadata  
- decisions, actions, risks, issues, technical queries, lessons  
- timeline and activity  
- companies and disciplines  

Project Intelligence must consume these through adapters / Engineering APIs — never duplicate authoritative registers.

---

## 4. Project Intelligence authority

Project Intelligence owns:

- project mappings (`project_intelligence_project_mappings`)  
- meeting intelligence data (sessions, transcripts, MoM application records)  
- document chunks, embeddings, and indexing operations  
- project health / forecasts (application overlays)  
- intelligence findings and patterns  
- evidence gaps  
- review queue  
- report configurations  
- governed AI sessions (with Platform AI Director traces)  
- analytics overlays  

---

## 5. Meetings

| Decision | Detail |
|----------|--------|
| Phase 6B | Preserve project-specific meeting intelligence **inside** Project Intelligence |
| Split to Meeting Intelligence app | **Not** during Phase 6B |
| Approved outputs | Enter Engineering Core **only** through human review |

---

## 6. Workspace, seats, installation

| Concern | Authoritative control |
|---------|----------------------|
| Workspace | Platform workspace |
| Seats | Certified Commerce seat assignment |
| Installation | `commercial_application_installations` |
| Engineering runtime registration | Derived only; never overrides commerce |

---

## 7. AI runtime

| Decision | Detail |
|----------|--------|
| Target | Platform AI Director |
| Migration | Compatibility adapter (`ProjectIntelligenceAIAdapter`) |
| Legacy Thor / OpenAI paths | Retain until equivalence proven; **no** ungoverned OpenAI in new Phase 6B code |

---

## 8. Phase 6B scope boundary

In scope: source freeze, package scaffold, shared shell, entitlement guards, mapping schema/UI, read adapters, legacy read-only source adapter, AI Director read-only proof, health, certification gates, GitHub verification.

Out of scope: register data migration, dual-write production, retiring standalone PI, auto-merge of projects/registers, deleting legacy tables.
