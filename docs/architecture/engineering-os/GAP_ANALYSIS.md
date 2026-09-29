# EOS-A0 Gap Analysis

Evidence SHA: `135dd0b659497a7ac68543d50dd2998ee3fe7d0f`  
Status vocabulary: EXISTS | PARTIAL | MISSING | DUPLICATED | DEPRECATED | UNKNOWN  
Owner vocabulary: RTB Platform | Engineering OS | Engineering Review | Shared Intelligence | Future bounded context  
Action vocabulary: REUSE | EXTEND | COMPOSE | MIGRATE | DEPRECATE | CREATE | INVESTIGATE

Security impact: Tenancy / Workspace / RLS / AuthZ / Audit / Trusted execution  
Migration risk: Low / Medium / High

---

## Matrix

| Capability | Current Status | Existing Location | Target Owner | Reuse? | Extension Required? | New Development? | Security Impact | Migration Risk | Recommended Action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Lifecycle Intelligence | PARTIAL | Asset lifecycle: `packages/asset-intelligence/src/domain/lifecycle*.ts`, batch_56; project phases: `engineering_project_phases` (`batch_61`); document status fields | Engineering OS (context) composing Asset Intelligence | Yes — asset + phase tables | Yes — governed lifecycle context, uncertainty/evidence bars | Lifecycle context object + policy hooks | Tenancy, RLS, AuthZ | Medium | EXTEND + COMPOSE |
| Systems Intelligence | MISSING | Asset hierarchy `engineering_assets.parent`; model elements `engineering_model_elements`; DT identities | Engineering OS | Partial — assets/models/twins as realizations | Yes | Canonical system/subsystem register | Tenancy, workspace, RLS, audit | High (identity collision with assets) | CREATE (after A1 identity ADR) |
| Discipline Intelligence | PARTIAL | `engineering_disciplines`; `ENGINEERING_DISCIPLINES` in `packages/engineering-os/src/manifest.ts`; `/engineering/disciplines` | Engineering OS contracts; modules supply methods | Yes — catalog | Yes — shared contracts, not silo apps | Discipline method packs later | AuthZ (discipline roles) | Low | EXTEND |
| Optimization Intelligence | MISSING | No `optim*` tables. DT docs mark optimization a non-goal. Solver runs: `digital_twin_solver_*`, `engineering_execution_jobs` | Future bounded context | Execution host + jobs + review + decisions | Yes | Full study/objective/constraint/run/result model | Tenancy, RLS, trusted execution, audit, jobs | High | CREATE (A5+); COMPOSE host/jobs |
| Decision Intelligence | PARTIAL | Core: `engineering_decisions`, `EngineeringDecisionService`, `/engineering/decisions`; PC: `project_controls_decision_*` (`batch_68`); sibling: `business_os_decisions` | Engineering OS Core | Yes — Core register | Yes — assumptions, authority, supersession, study links | Assumption objects; alternative records | AuthZ, audit, no autonomous approval | Medium (do not merge PC/BOS tables) | EXTEND Core; COMPOSE others |
| Value Intelligence | MISSING | PC cost/progress/opportunity as inputs only | Future bounded context | PC metrics as sources | Yes | Projected/approved/committed/realized/verified value | Tenancy, audit | Medium | CREATE (A9) |
| Requirements Intelligence | MISSING | No requirements package/tables/routes in this repo | Engineering OS | Document register as evidence store | Yes | Requirements, design basis, acceptance, verification links | Tenancy, RLS, audit | High | CREATE (A1/A3 sequence) |
| Assumption Management | MISSING (shared) | Local strings in Asset Intelligence predictive methods (`assumptionsAsserted` / `assumptionsViolated`) | Decision Intelligence (reusable) | Method-local strings as examples only | Yes | First-class assumption objects + links | Audit, AuthZ | Medium | CREATE; do not steal AI predictive fields |
| Change Intelligence | EXISTS (module-scoped) | `packages/project-controls/src/domain/change*.ts`; `/api/engineering/project-controls/change`; batch_64 | Project Controls (contributor) + Engineering OS (canonical engineering change later) | Yes — PC change | Yes if a **canonical engineering change** is required beyond controls change | Maybe a Core change object in A4 | Tenancy, RLS | Medium | COMPOSE now; EXTEND in A4 if identity split needed |
| Impact Intelligence | PARTIAL | `engineering_model_change_impacts`; object links; PC/DT review graphs | Engineering OS horizontal | Yes — model impacts + links | Yes — general dependency traversal | Impact service over thread/graph | Tenancy | Medium | EXTEND |
| Interface Intelligence | PARTIAL | `engineering_model_mappings`; spatial relationships | Engineering OS horizontal | Yes — mappings as one interface class | Yes | Interface register covering physical/functional/discipline/data/control/responsibility/contract/schedule/information | Tenancy, RLS, audit | High | CREATE + EXTEND mappings |
| Configuration Intelligence | MISSING | `engineering_document_versions`; model versions; DT representations | Engineering OS | Versions as inputs | Yes | Baselines, freeze, IFC/installed/as-built/commissioned, supersession, effective dates | Tenancy, audit | High | CREATE (distinct from Change) |
| Uncertainty Intelligence | PARTIAL | Inspection/predictive confidence; decision `confidence`; DT scenarios | Shared Intelligence + Engineering OS | Confidence fields | Yes | Shared ranges/scenarios/sensitivity/information-value | None unique beyond existing | Medium | EXTEND / COMPOSE |
| Engineering Review | PARTIAL / DUPLICATED pattern | No `@rtb/engineering-review`. PI Findings `project_intelligence_findings*`; Workflow SDK `EngineeringReviewRecord`; module `review-workflow.ts`; vendor `engineering-findings` + trusted server in tarball | Engineering Review bounded context | PI Findings + SDK + policy | Yes — composition across systems/opt/requirements | Review packages/runs/dispositions as product | Tenancy, workspace, RLS, AuthZ, trusted execution, audit | High | INVESTIGATE (A1) then CREATE composition; REUSE PI Findings unchanged |
| Verification | PARTIAL | PI finding review items; inspection workflows; document review APIs | Engineering Review | Yes | Yes — requirements verification | Verification records tied to requirements/acceptance | AuthZ, audit | Medium | EXTEND with Requirements |
| Engineering Digital Thread | PARTIAL | `engineering_object_links`; `knowledge_node_id` on objects; DT thread docs; PI knowledge edges | Engineering OS semantics on RTB Platform KG | Yes — links + platform KG | Yes — typed thread relations | Relationship catalog + queries | Tenancy | Medium | EXTEND platform KG; do not add store |
| Knowledge Graph | DUPLICATED infrastructure | Platform: `packages/platform-kernel/src/knowledge-graph/` + `knowledge_*`; PI: `packages/project-intelligence/src/knowledge/graph.ts` + `project_intelligence_knowledge_*` | RTB Platform (infra); Engineering OS (engineering node types) | Platform KG | Yes — engineering types/edges | None (no third store) | Isolation flags already claim no security-owned duplicate KG | High if a third graph is added | REUSE platform; INVESTIGATE PI graph coexistence |
| Search / Retrieval | PARTIAL | `EngineeringSearchService`; `/engineering/search`; PI retrieval | Engineering OS + PI | Yes | Yes — new object types | Search adapters for systems/requirements/opt | AuthZ | Low | EXTEND |
| Memory | EXISTS | `packages/platform-kernel/src/memory/` | RTB Platform | Yes | Optional engineering scopes | None | Tenancy | Low | REUSE |
| Workflow | PARTIAL | Kernel workflow service (start/list); Engineering Workflow SDK `packages/engineering-os/src/workflow-sdk/`; seeded `decision_approval` etc. | RTB Platform (runtime) + Engineering OS (SDK) | Yes | Yes — step engine if required | Avoid a third engine | AuthZ | Medium | COMPOSE; EXTEND kernel if step advance is required |
| Agent Orchestration | PARTIAL | AI Director `packages/platform-kernel/src/ai-director/`; Engineering AI service; default mock adapter | Shared Intelligence | Yes | Yes — real providers later | None in Engineering OS | Policy, review gates | Medium | REUSE / COMPOSE |
| Model Orchestration | EXISTS | `packages/platform-intelligence/src/model-registry/` | Shared Intelligence | Yes | Provider adapters | None in Engineering OS | Secrets, cost | Low | REUSE |
| Tool Orchestration | EXISTS | Intelligence tool registry; ETF tools in `ENGINEERING_TOOLS` | Shared Intelligence + Engineering OS tool metadata | Yes | New tools for opt/review | None | Tool risk class | Low | EXTEND registry entries |
| Assurance | PARTIAL | `@rtb/security-assurance`; Engineering OS security-closure flags; Phase 14 CI | RTB Platform | Yes | Domain-specific assurance cases | Certification suites per new domain | All controls | Medium | EXTEND cert packages, do not fork security product |
| Analysis Engine adapters | PARTIAL | Execution host package + IFC/SPACE GASS/ETABS interop; DT solver adapters | Engineering OS infra | Yes | Generic adapter contract | New vendor adapters later | Trusted execution, licence classification | High if hardcoded | EXTEND host/interop; CREATE generic contract in A8 |
| Engineering Information (core) | EXISTS | Projects/assets/documents/companies; tags tables without UI | Engineering OS | Yes | Systems/drawings/calcs/specs | Those object types | Tenancy, RLS | Medium | EXTEND |
| Tags | PARTIAL | `engineering_tags`, `engineering_entity_tags` + RLS; no UI/API | Engineering OS | Yes | UI/API | Low | Tenancy | Low | EXTEND |
| Construction product | MISSING | Discipline label only | Future module (not V1 frozen set) | No | Yes | Construction records later | Tenancy | High | CREATE only after V1 compatibility ADR |
| Shared connector framework | MISSING | Docs claim; no package; module-local adapters | RTB Platform | No | Yes | Platform connector service | Secrets, tenant | High | CREATE on Platform, not inside EOS |
| Kernel jobs vs module jobs | DUPLICATED | Kernel `JobService`; commerce scheduler; PI claim jobs; `engineering_execution_jobs` | RTB Platform + specialized queues | Yes each | Routing policy | Do not add a fifth queue casually | Trusted execution | Medium | INVESTIGATE job ownership in A5/A8 |
| Digital Twin (operational) | EXISTS | `@rtb/digital-twin` + kernel `digital_twins*` | Digital Twin module | Yes | Thread links only | None for thread | Existing DT security | Low | REUSE; do not rename thread to twin |

---

## Duplication risks (must not grow)

1. **Knowledge graphs:** platform persisted KG vs PI in-memory/SQL graph. Engineering Digital Thread must use platform infrastructure plus typed edges, not a third store.
2. **Decision tables:** Core `engineering_decisions`, PC `project_controls_decision_*`, Business OS `business_os_decisions`, vendor PI decision graph in tarball. Extend Core; link others.
3. **Review patterns:** module `EngineeringReviewRecord` vs PI Findings vs vendor `engineering-findings`. Composition, not copy.
4. **Job systems:** four queues already. Optimization must pick one primary (likely execution host jobs + kernel jobs), not invent another.
5. **Digital twin layers:** kernel registry vs module identities — already an intentional hybrid; thread must not become a third twin.
6. **Feature flag names:** `engineering_os` vs `engineering_os_enabled`.
7. **Workflow:** kernel workflow vs Engineering Workflow SDK vs inspection workflow tables.

---

## Security notes for the gaps

- New objects: follow modern domain RLS (`tenant_id` + workspace membership), not SELECT-true catalog patterns except for true catalogs.
- Do not implement live JWT RLS by weakening tests; add certification suites when domains go live.
- Vendor trusted-server is **stricter** than some monorepo session patterns. If Review reconstitution uses it, keep fail-closed membership.
- Optimization/external engines: licence classification and sandbox already specified for the execution host — reuse, do not bypass.
- `SUPABASE_SERVICE_ROLE_KEY` must not be used for RLS deny assertions (existing BOS/platform rule; keep for any future hosted tests).
