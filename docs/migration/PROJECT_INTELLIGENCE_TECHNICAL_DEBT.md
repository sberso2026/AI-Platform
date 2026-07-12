# Project Intelligence — Technical Debt and Integration Gaps

**Phase:** 6A discovery  
**Purpose:** Record debt that Phase 6 must address without weakening Phase 5 certified controls.

---

## 1. Structural debt

| Debt | Impact | Phase 6 implication |
|------|--------|---------------------|
| Dual codebases (standalone PI vs AI Platform shell) | Drift, duplicate identity, unclear SoT | Treat standalone as product source; AI Platform as integration target |
| Dirty git on `rtb-project-intelligence` master | Migration may miss WIP features | Human freeze/commit before 6B slices |
| Backup tree duplicate | Confusion / wrong source | Ignore for migration |
| Route path inconsistency in AI Platform | Broken deep links | Standardize on `/engineering/apps/project-intelligence` |
| Naming collision: Platform Intelligence vs Project Intelligence | Operator/dev confusion | Keep package names; document clearly in UX copy |

---

## 2. Domain ownership debt (critical)

Standalone PI stores **authoritative-looking copies** of Engineering Core concepts:

- `projects` vs `engineering_projects`
- `assets` vs `engineering_assets`
- `documents` vs `engineering_documents`
- `decisions` / `decision_actions` / `decision_risks` vs Core registers
- `lessons_learned` vs `engineering_lessons`

**Risk:** Silent divergence, double-write bugs, broken uninstall semantics, RLS gaps across workspace/seat.

**Rule for 6B+:** Engineering Core remains authoritative. PI tables for those entities become mapping/legacy until retired.

---

## 3. Tenancy / workspace debt

| Standalone PI | AI Platform |
|---------------|-------------|
| One `profiles.tenant_id` | Multi-workspace, seats, installations |
| No seat model | Certified seat assignment |
| No parent product install gate in app UX | Engineering OS + PI install required |

Integration must not weaken workspace/seat/installation denial scenarios already certified in Phase 3–5.

---

## 4. AI governance debt

| Standalone | Required platform target |
|------------|--------------------------|
| Direct OpenAI SDK/HTTP | Platform model registry + AI Director |
| Prompts embedded in large service files | Prompt registry + versioned IDs |
| Partial `ai_human_review_queue` | Mandatory review before Core writes |
| Traceability uneven | Provider, model, prompt, tools, evidence, confidence, trace, cost |

AI must not approve decisions/risks/actions/issues/TQs/findings.

---

## 5. Meetings / realtime debt

- Teams/Zoom/Meet bots are **scaffolded**, default off
- Graph webhook job stub
- Production live capture not proven
- Dev mock WebSocket is not a production substitute

Preserve manual/mic/MoM paths; treat external bots as optional later adapters.

---

## 6. API / error contract debt

- Standalone PI APIs use assorted error shapes
- AI Platform Phase 5 nested envelope applies to lifecycle routes; many engineering/commerce routes still flat (see `API_ERROR_CONTRACT_MIGRATION.md`)
- Phase 6 PI integration routes must ship nested `{ error: { code, message, requestId, details } }` and fail certification on unexpected 5xx

---

## 7. Security / RLS debt

Standalone: strong **tenant** RLS.  
Gaps vs AI Platform:

- Workspace assignment
- Seat presence
- Active installation / licence / subscription
- Cross-workspace object ID injection
- Service-role audit expectations aligned to Platform

All PI-specific tables introduced into AI Platform require hosted RLS certification scenarios (Phase 6 gate C).

---

## 8. UX / shell debt

- Isolated PI shell duplicates identity, admin, and nav
- Executive vs PlatformShell dual nav
- Legacy dashboard/report tools still present
- AI Platform Engineering UI already provides Core registers — PI must not clone them as second SoT UI

---

## 9. Testing debt

| Standalone | AI Platform need |
|------------|------------------|
| Large Vitest suite | Adapt, do not discard |
| Limited Playwright product cert | New `packages/project-intelligence-certification` with Phase 5-style gates |
| No clean-tree release artifact for PI | Align with Phase 5 release eligibility |

---

## 10. Operational debt

- Document indexing worker + parser are real ops surfaces — need health panel entries
- Evidence packs / readiness scripts are valuable — migrate as operator runbooks under `docs/operations/`
- Env flag sprawl (`RTB_*`, signup, founder bootstrap) must map to Platform feature flags / admin controls

---

## 11. Explicit non-goals (debt not to “fix” by rebuild)

- Do not rewrite Thor grounding to chase greenfield architecture
- Do not drop MoM / citation / indexing because bots are incomplete
- Do not delete Engineering Core data on PI uninstall
- Do not retag `customer-admin-rc-1`
