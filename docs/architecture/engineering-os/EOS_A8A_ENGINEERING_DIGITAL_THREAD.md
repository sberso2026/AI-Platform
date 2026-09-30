# EOS-A8A Engineering Digital Thread Foundation

Status: implemented as the canonical Engineering Digital Thread **composition** layer.

| Field | Value |
| --- | --- |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Baseline (start) | `e58f81b84f475ac57849f7201e97359e5024b311` (EOS-A7B) |
| Target | STAGING / NON-PRODUCTION `rntonzigxwxcjlcsadip` |
| New graph store | NO |
| Universal truth / compliance score | NO |
| Real solver execution | NOT IMPLEMENTED |
| Autonomous engineering approval | NO |

## Purpose

The Engineering Digital Thread answers:

- what is connected
- why it is connected
- where the relationship came from
- which engineering context governed it
- what changed
- what became stale
- what evidence supports a result or decision
- which downstream information may require review

It does **not** manufacture missing relationships to create a complete-looking trace.
It does **not** determine engineering correctness.

## Digital Thread definition

**Engineering Digital Thread** is relationship semantics, authorized traversal, provenance, traceability, lineage, impact-candidate discovery, assurance visibility, and explainability over existing canonical engineering objects.

It is **not** a second database of duplicated engineering objects.

## Digital Thread vs Digital Twin

| | Digital Thread | Digital Twin |
| --- | --- | --- |
| Question | Why is this engineering information related, and how did evidence flow? | What is the operational or physical state of an engineered asset/system? |
| Examples | Requirement → System → Analysis → Review → Decision → Change → Configuration | sensor readings, condition, operating state, telemetry |
| Owner | Engineering Core objects + governed `engineering_object_links`, composed by Digital Thread services | Kernel twin + module twin (`@rtb/digital-twin`) |
| Naming collision | `digital_twin_thread_*` is **twin-scoped reference composition** (batch_84). It is not the Engineering Digital Thread. | Kernel Twin and module Twin remain intentionally separated (ADR-D6). |

They complement one another. They are not the same thing.

## Canonical ownership

| Concern | Owner | Role in A8A |
| --- | --- | --- |
| Canonical engineering objects | Existing bounded contexts (Core, Review, Optimization, …) | source of truth for payloads |
| Governed relationships | Engineering Core `engineering_object_links` + finite taxonomy | source of truth for edges |
| Digital Thread | Engineering OS composition (`packages/engineering-os/src/digital-thread`) | read / traversal / explainability |
| Platform Knowledge Graph | Platform Kernel `knowledge_nodes` / `knowledge_edges` | **projection / query acceleration / future intelligence** — EOS-A8B derived projection; not SOT |
| PI Knowledge Graph | Project Intelligence | product-specific projection only |
| Twin Thread `digital_twin_thread_*` | Operational Digital Twin | twin reference index; not Engineering Digital Thread |
| Audit events | Kernel / Review audit | who did what when — composed on request, not copied as thread edges |

**SOURCE OF TRUTH** = relational Core tables + governed links.

No third graph store. No `EngineeringDigitalThreadGraphDatabase`.

## Object identity

A `ThreadObjectRef` identifies an existing canonical object:

- `tenant_id`
- `workspace_id`
- `object_type`
- `object_id`

Optional: `project_id`, `object_code`, revision / configuration context.

Display title is never identity.

## Domain contract

`ThreadObjectRef`, `ThreadRelation`, `ThreadPath`, `ThreadTrace`, `ThreadQuery`, `ThreadTraversalResult`, `ThreadProvenance`, `ThreadCoverageResult`.

Canonical FK bindings (analysis result → request, configuration item → baseline) may appear as `CANONICAL_FK` composed bindings. They are not invented governed verbs.

## Relation taxonomy

Codes are the existing `GOVERNED_RELATION_TYPES`. A8A adds **machine-readable semantics** (`GOVERNED_RELATION_SEMANTICS`), not duplicate verbs.

Direction is always **from → to**. Inverse labels are documentation/query aids; inverses are not stored as second rows.

| Code | Meaning (from → to) | Inverse | Lifecycle | Transitivity |
| --- | --- | --- | --- | --- |
| CONTAINS | parent contains child | CONTAINED_IN | from upstream | allowed same type |
| USES | subject uses object | USED_IN | to upstream | traversal only |
| DEPENDS_ON | subject requires object | DEPENDED_ON_BY | to upstream | traversal only |
| ALLOCATED_TO | requirement allocated to system/asset/interface | HAS_ALLOCATION | from upstream | prohibited |
| VERIFIED_BY | subject verified by evidence | VERIFIES | from upstream | prohibited |
| USED_BY | from is used by to (A1 assumption rule) | USES_ASSUMPTION | from upstream | prohibited |
| CONNECTS | interface connects participant | CONNECTED_BY | from upstream | prohibited |
| AFFECTS | change/decision affects object | AFFECTED_BY | from upstream | prohibited |
| CAUSED_BY | impact caused by change | CAUSES | to upstream | prohibited |
| SELECTS | decision selects alternative | SELECTED_BY | from upstream | prohibited |
| SUPPORTED_BY | decision supported by evidence | SUPPORTS | to upstream | prohibited |
| BASED_ON | subject based on assumption/requirement | BASIS_FOR | to upstream | prohibited |
| REVIEWS | review package reviews object | REVIEWED_BY | to upstream | prohibited |
| FOUND_IN | finding found in review | HAS_FINDING | to upstream | prohibited |
| RESOLVES | disposition resolves finding | RESOLVED_BY | from upstream | prohibited |
| BASELINES | baseline baselines items | BASELINED_IN | from upstream | prohibited |
| SUPERSEDES | later supersedes earlier | SUPERSEDED_BY | to upstream | allowed same type |
| MAPPED_TO | model mapped to platform object | MAPPED_FROM | from upstream | prohibited |
| REPRESENTED_BY | object represented by KG/twin | REPRESENTS | from upstream | prohibited |
| SCOPED_TO | study/request scoped to system | HAS_SCOPE | from upstream | prohibited |
| CONSTRAINED_BY | study constrained by requirement | CONSTRAINS | to upstream | prohibited |

Type safety forbids a small set of nonsensical pairs (for example Requirement CONNECTS Decision). Recommended class lists are not a freeze against legitimate future engineering relationships.

## A7B dependency relation direction

| Analysis semantic | Governed verb | from | to | A8A result |
| --- | --- | --- | --- | --- |
| REQUIRES_RESULT_FROM | DEPENDS_ON | downstream analysis_request | upstream request/result | **CORRECT** — unchanged |
| USES_RESULT_FROM | **USES** | downstream analysis_request | upstream request/result | **MIGRATED** |

A7B originally mapped USES_RESULT_FROM → USED_BY with the same endpoints. A1 USED_BY means “from is used by to”, so downstream USED_BY upstream inverted the verb. EOS-A8A remaps the write to USES without reversing IDs.

Historical A7B USED_BY rows from `analysis_request` are still **read** as USES_RESULT_FROM (dual-read). Optimization `composeOptimizationRequest` remains USED_BY (not rewritten).

## Traversal

Bounded authorized BFS over `engineering_object_links`.

- Default maximum depth: **4**
- Hard server-side maximum: **8** (prevents unbounded graphs without a graph database)
- Node limit 200 / edge limit 400
- Cycle detection with node/edge deduplication
- Explicit truncation (`DEPTH_LIMIT` / `NODE_LIMIT` / `EDGE_LIMIT`) — never silent
- Filters: relation types, object types, upstream / downstream / both

Upstream / downstream follow lifecycle direction in the semantics registry, not merely stored from→to.

## Authorization

Every node and edge is fail-closed:

- tenant match
- workspace membership (`allowedWorkspaceIds`)
- object must resolve in authorized scope

Unauthorized linked objects do **not** leak title, code, existence, relationship count, or hidden tenant/workspace IDs.

Database RLS on `engineering_object_links` already requires both endpoints to be workspace-visible (`engineering_core_link_endpoint_allowed`). Digital Thread does not bypass RLS.

Anonymous deny. Admin remains workspace-scoped (not a cross-workspace oracle).

## Traceability paths

Use actual canonical relations only.

Example (synthetic Crusher Expansion FEED):

Requirement R-001 —ALLOCATED_TO→ Primary Crushing System —SCOPED_TO/BASED_ON→ Analysis Request — canonical FK → Result —REVIEWS→ Review Package; Decision —SUPPORTED_BY→ Result.

Missing hops are `MISSING_RELATION` gaps. They are not inferred.

## Requirement / analysis / decision / configuration / change traces

- **Requirement:** allocation, system/asset/interface, analysis, result/evidence, review, decision; gaps if missing.
- **Analysis:** composes EOS-A7B (discipline, capability, baseline, requirements, assumptions, interfaces, tool binding, plan/job refs, result, review, acceptance, decision links, staleness). Blocked SPACE GASS requests appear with blocking reasons and **no fabricated result**.
- **Decision:** question/context, alternatives, requirements, assumptions, analysis/results, reviews/evidence, superseded decisions, configuration/change. Does not reinterpret Decision authority.
- **Configuration:** frozen configuration items as **SNAPSHOT_EVIDENCE_AVAILABLE**. A4 baselines are snapshots. Full historical reconstruction of every domain object is **not** claimed (`FULL_HISTORICAL_STATE_AVAILABLE` only if the owning bounded context actually versions that object).
- **Change:** caused/affected objects and related requirements, interfaces, analyses, baselines, decisions, reviews. Discovered downstream objects are `DISCOVERED_DEPENDENCY` / `POTENTIAL_DOWNSTREAM_EFFECT` / `TRACE_DEPENDENCY`. They are **never** auto-promoted to `CONFIRMED_ENGINEERING_IMPACT`.

## Staleness and supersession

Digital Thread surfaces existing stale reasons from Optimization, Analysis Intelligence, Configuration, Requirements, Assumptions, and Interfaces. It does not invent a competing staleness engine. Explanations include the authorized path that reached the stale node.

Supersession walks existing `SUPERSEDES` edges (decisions, baselines, governed analysis results). Owning contexts remain responsible for loop prevention; traversal is cycle-safe.

## Provenance vs audit

**Audit:** who did what and when (`audit_events`, activity/timeline).

**Digital Thread:** why engineering information is related and how evidence flows.

Thread edges cite existing `created_by` / `created_at` / tool / adapter / fingerprint / review / decision references. A second audit trail is not created. Audit events are not copied into relations.

## Evidence

Evidence traces only where existing relationships or canonical FKs support it (document, analysis result, review, requirement, decision, configuration, external tool execution). No evidence edge without source proof.

## Assurance gaps and maturity

Bounded coverage queries, for example:

- Requirements with no allocation
- Decisions with no supporting evidence
- Analysis results lacking required review
- Incomplete interfaces
- Changes with unresolved candidate impacts
- Configuration items missing provenance
- Stale results still referenced by active decisions

These are **assurance/traceability conditions requiring review**, not automatic engineering defects.

EOS-A1 Traceability Maturity Model is preserved. A safety-critical Decision may require more evidence than an informational tag. There is no mandate that every object have Requirement + Assumption + Evidence + Decision + Approval.

**No** Engineering Truth Score, Digital Thread Score, Compliance Score, Quality Score, or overall correctness percentage.

## Search

Digital Thread does not duplicate global search. The UI selects a canonical object type/id (or opens from an object panel) and traces it.

Roots: Requirement, System, Asset, Interface, Assumption, Analysis Request/Result, Review, Finding, Decision, Change, Impact, Configuration Baseline, Optimization Study/Run, Document.

## API and UI

- API: `GET /api/engineering/thread` — catalog, coverage, trace, upstream, downstream, relation/object filters, bounded depth. No arbitrary database graph query language.
- UI: `/engineering/thread` — Trace, Upstream, Downstream, Evidence, Changes, Configuration, Assurance Gaps. Textual first. No 3D / force-directed graph in A8A.
- Reusable `ObjectThreadPanel` proven on Analysis Request and Decision detail.

## Explainability and AI boundary

Explanations are deterministic templates from retrieved authorized relations, for example:

- “This Decision is supported by Analysis Result AR-102.”
- “This Result is stale because STALE_REQUIREMENT_CHANGED.”

AI may summarize retrieved authorized relationships. AI must not invent missing relations, confirm impacts, declare correctness or compliance, approve decisions, or alter configuration authority.

## Platform KG / PI KG / Twin

Duplicate edge stores already exist as documented in A1 (Platform KG, PI KG, Core links, Twin Thread). Ownership:

- Core links = engineering relationship SOT
- Platform KG = optional projection when `knowledge_node_id` exists (best-effort in `EngineeringObjectFramework.linkObjects`)
- PI KG = PI product projection
- Twin Thread = twin-scoped references (`by_reference`, `knowledge_graph_reuse`, `composition_mode = references_only`)

A8A does not migrate SOT into Platform KG.

## Persistence

No new Digital Thread object table. EOS-A8A adds only an additive replace of `engineering_object_link_resolve` / `engineering_core_link_endpoint_allowed` so `analysis_request` and `analysis_result` resolve as governed link endpoints (A7B already wrote these types in application code). Existing indexes on `engineering_object_links` remain sufficient.

## Security / performance / tests

- Tenant / workspace isolation, object-level fail-closed filtering, anonymous deny, hidden-object non-disclosure, cross-workspace and cross-tenant links hidden.
- Live JWT RLS: `packages/engineering-review-persistence/src/live-a8a-thread-rls.test.ts` against staging `rntonzigxwxcjlcsadip`.
- Synthetic fixture: Crusher Expansion FEED, including cross-discipline PROCESS → MECHANICAL → STRUCTURAL and blocked SPACE GASS LINEAR_STRUCTURAL_ANALYSIS with no fabricated result.
- Cycle fixture proves termination and deduplication.

## Limitations

- Historical ungoverned `engineering_object_links.relationship` strings remain readable but are DISCOURAGED for new writes.
- Not every canonical object type is versioned; configuration traces distinguish snapshot evidence from full historical state.
- UI is not browser-verified in this phase unless a live session is available.
- Real SPACE GASS / solver execution remains an external dependency (A7C deferred).
- Value Intelligence is out of scope.

## Out of scope (honoured)

New graph database, KG as source of truth, Digital Twin redesign, real solver certification, structural/multidiscipline solver execution, universal scores, automatic confirmed Impact creation, unbounded traversal, autonomous AI relationship creation.

See `EOS_A8B_PLATFORM_KG_PROJECTION.md` for the disposable Platform KG projection (not a second SOT).
See `EOS_A8C_ENGINEERING_ASSURANCE_INTELLIGENCE.md` for persistent Assurance Conditions over this canonical thread.
