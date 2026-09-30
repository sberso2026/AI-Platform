# EOS-A8B Platform Knowledge Graph Projection of the Engineering Digital Thread

Status: implemented as a **derived, disposable projection** onto existing Platform KG tables.

| Field | Value |
| --- | --- |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Baseline (start) | `a91c478aec97d9dad39e75ffca6f72fced5f3610` (EOS-A8A) |
| Target | STAGING / NON-PRODUCTION `rntonzigxwxcjlcsadip` |
| New graph store | NO |
| Canonical SOT moved to KG | NO |
| Graph writeback | NO |
| AI / inferred edges | NO |
| Product KG read cutover | NO (flag default off) |
| Real solver execution | NOT IMPLEMENTED |
| Autonomous engineering approval | NO |

## SOURCE OF TRUTH

| Concern | Owner | Role in A8B |
| --- | --- | --- |
| Canonical engineering objects | Domain tables (bounded contexts) | object source of truth |
| Governed relationships | `engineering_object_links` | relationship source of truth |
| Platform Knowledge Graph | `knowledge_nodes` / `knowledge_edges` | **derived projection / query acceleration / future intelligence** |
| PI Knowledge Graph | `project_intelligence_knowledge_*` | product-specific projection only |
| A8A relational traversal | `packages/engineering-os/src/digital-thread` | **authoritative reference implementation** |

If relational source and graph projection disagree, the canonical relational Engineering OS model wins.

No `EngineeringDigitalThreadGraph`. Deleting the projection must never delete engineering knowledge. Rebuilding the projection must reproduce the same authorized engineering relationships from canonical data.

## Projection contract

`EngineeringThreadProjectionEdge` preserves:

- `tenant_id`, `workspace_id`
- `source_object_type`, `source_object_id`
- `normalized_relation_type`
- `target_object_type`, `target_object_id`
- `source_link_id` (+ `source_link_ids` when historical USED_BY and current USES collapse)
- `source_relation_type` (provenance; not mutated on source rows)
- `projection_version` (`engineering-thread-projection/v1`)
- `projected_at`
- deterministic `projection_key`

Nodes are lightweight identity projections (`eos-thread:{objectType}:{objectId}`) with optional `project_id`, `object_code`, status, title. Large domain payloads are not copied.

## Normalized relation semantics

Projection uses the A8A governed taxonomy. Historical A7B analysis rows:

- source `relationship = USED_BY` on `analysis_request`
- normalized projection `USES`
- `source_relation_type` remains `USED_BY`

Assumption `USED_BY` is **not** rewritten. One normalized KG edge is emitted for the same endpoints; USED_BY then USES collapse to a single `USES` edge.

## Edge identity

Identity is `eos-thread-edge:{tenantId}:{fromType}:{fromId}:{normalized}:{toType}:{toId}` plus Platform KG unique `(tenant_id, from_node_id, to_node_id, edge_type)`. Display labels are never identity. Repeated projection UPSERTs.

## Incremental updates

Governed `EngineeringObjectFramework.linkObjects` / `unlinkObjects` call the projection service. No second event bus. Job type `engineering.thread.project` reuses JobService for workspace rebuild/reconcile/backfill (`mode=rebuild|reconcile`). Payload is workspace-bounded, idempotent, restartable.

## Reconciliation and rebuild

`reconcileWorkspace` detects missing, duplicate, orphan, stale semantic-version, and wrong-workspace edges, then converges (projects missing, removes orphans).

`rebuildWorkspace` deletes only the derived projection for that tenant/workspace and rebuilds from canonical links. Semantic signatures of initial and rebuilt projections must match. Canonical rows are not modified.

## Delete behavior

Canonical governed link delete removes the projected edge. KG deletes never cascade into `engineering_object_links` or domain tables.

SUPERSEDES projects normally. Historical superseded objects/edges remain visible where authorized.

## Staleness

No KG-specific staleness engine. Canonical stale flags/reasons remain with owning bounded contexts and are copied only as indexing metadata when present.

## Consistency model

Platform KG is an **eventually consistent projection**. Canonical relational Digital Thread is authoritative.

When the projection lags:

- `/api/engineering/thread` default path remains relational A8A traversal
- it must not claim a relationship is missing merely because KG is delayed
- `source=kg` (flagged) returns `projection unavailable/degraded` and falls back to canonical

Expected lag for the synchronous `linkObjects` hook is near zero. Asynchronous jobs may lag; health reports `lagMs`, `LAGGING`, `DEGRADED`, `FAILED`.

## Projection health

Statuses: `HEALTHY`, `LAGGING`, `DEGRADED`, `REBUILD_REQUIRED`, `FAILED`.

Metrics: last projected, last reconciled, lag, edge count, canonical count, missing/duplicate/orphan counts, semantic-version mismatch, pending failures.

A stale `projection_version` (for example v1 rows observed by a v2 mapper) yields `REBUILD_REQUIRED`. Incompatible semantics are not mixed silently.

## Authorization

Every projected node/edge retains `tenant_id` and `workspace_id`. Graph adjacency is not authorization.

Platform KG SQL RLS remains **tenant-only** (phase_15). Same-tenant other-workspace rows can be visible at the SQL table. Therefore:

- **Product KG reads are not certified** as a default Digital Thread path
- Adapter-layer workspace filter is fail-closed for the optional `source=kg` query
- Default UI/API traversal stays relational A8A

Hidden objects must not leak via edge counts, degree, placeholders, or error messages on the adapter path.

## Query parity

The A8B query adapter maps projected edges to `ThreadRelation` using **normalized** relation types and reuses A8A `traverseThread`. Representative traces compared on the Crusher Expansion FEED fixture:

- requirement, analysis, decision, configuration, change, cross-discipline

Expected: same authorized semantic nodes and edges. Blocked SPACE GASS 14.2 Trial analysis is projected with request/discipline/capability/baseline/requirements/tool binding and **no fabricated Analysis Result**.

## Fallback

A8A relational traversal remains available. KG unavailability is `projection unavailable/degraded`, not `engineering thread unavailable`.

## GRAPH WRITEBACK

Prohibited in A8B. AI-generated KG edges must not create `engineering_object_links`. Future inferred relationships require explicit governed promotion (out of scope).

## PI KG boundary

Engineering Digital Thread is **not** dual-written to `project_intelligence_knowledge_*`. PI may consume Platform KG projection or canonical APIs. PI KG remains product-specific.

## Feature flags

Existing env flags (no new flag framework):

- `engineering_digital_thread_kg_projection` / `ENGINEERING_DIGITAL_THREAD_KG_PROJECTION` — projection writes (default on unless set `0`/`false`)
- `engineering_digital_thread_kg_reads` / `ENGINEERING_DIGITAL_THREAD_KG_READS` — optional KG query path (default **off**)

## UI

`/engineering/thread` is not redesigned. It shows projection status, source (Canonical), and last synchronized. KG is not the default query path.

## Performance

Fixture traces are measured in unit tests for both relational and projected traversal. A8B does **not** claim KG performance superiority.

## Limitations

- Platform KG RLS is tenant-scoped; product KG reads remain uncertified until workspace SQL isolation exists.
- Incremental projection is a best-effort hook on governed link write, plus JobService rebuild; not a second outbox.
- UI projection status is not browser-verified in this phase unless a live session is available.
- Real SPACE GASS / solver execution remains deferred (A7C).
- Value Intelligence is out of scope.

## Classification (existing Platform KG)

| Surface | Classification |
| --- | --- |
| `knowledge_nodes` / `knowledge_edges` | REUSE |
| `KnowledgeGraphService.createNode/createEdge` | EXTEND (projection store writes the same tables) |
| Engineering Digital Thread projection module | PROJECTION |
| Historical unnormalized `linkObjects` `createEdge` for governed links | LEGACY (replaced by projector for governed writes) |
| PI KG tables | PRODUCT_SPECIFIC — do not dual-write |
| New graph database | MISSING and forbidden |
| KG writeback to Core | MISSING and forbidden |
