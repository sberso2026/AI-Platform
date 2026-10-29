# EOS-A8B-C Platform KG Workspace Security & Staging Certification

Status: security closeout of EOS-A8B. Does **not** implement EOS-A8C. Does **not** enable Engineering Digital Thread KG reads by default.

| Field | Value |
| --- | --- |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Baseline | `500b68fe824ee7d513f9f76abf35c2d1f258425d` (EOS-A8B) |
| Target | STAGING / NON-PRODUCTION `rntonzigxwxcjlcsadip` |
| New graph store | NO |
| KG reads default | **OFF** |
| Default thread source | CANONICAL_RELATIONAL |
| Graph writeback | NO |

KG reads remain DEFAULT OFF.

PRODUCT_KG_SQL_READ_SECURITY is the gate for a later, explicit productization decision.

## Original A8B findings

1. **Deployment:** `20260930050000_eos_a8b_platform_kg_thread_projection.sql` was committed but not applied. `supabase db query --linked` from the repo root failed with `DbConfigLoadError` while parsing `.env.local`.
2. **Security:** `knowledge_nodes` / `knowledge_edges` SELECT was `tenant_id = ANY(get_user_tenant_ids())`. Live JWT proof: Tenant A / Workspace A2 could read Workspace A1 Engineering Thread projection nodes. Adapter/relational Digital Thread remained fail-closed.

## Platform KG scope model

Existing producers:

| Producer | Tables | Intended scope | Storage |
| --- | --- | --- | --- |
| Kernel `KnowledgeGraphService` | `knowledge_nodes` / `knowledge_edges` | mixed; optional `workspace_id` on nodes | native `tenant_id`, optional native `workspace_id` |
| Engineering registers (`createKnowledgeNode`) | same | workspace when provided | native `workspace_id` |
| EOS-A8B Digital Thread projection | same, `node_type=engineering_thread_object` | **WORKSPACE** | native `workspace_id` + metadata copy |
| PI KG | `project_intelligence_knowledge_*` | workspace | separate product tables; not merged |

Canonical model (no extra `scope_kind` column):

- **TENANT** — `knowledge_nodes.workspace_id IS NULL`
- **WORKSPACE** — `knowledge_nodes.workspace_id IS NOT NULL`
- **PLATFORM** — not used on `knowledge_nodes` (`tenant_id` is NOT NULL)

Engineering Thread projection **always** writes native `workspace_id`. Display labels are not scope.

## Node RLS

`platform_kg_node_visible(tenant_id, workspace_id)`:

- tenant membership via `get_user_tenant_ids()`
- **and** `engineering_core_workspace_member(workspace_id)` when `workspace_id` is set
- NULL workspace remains tenant-visible (legacy kernel rows)

Anonymous: no tenant ids → deny.

## Edge RLS

`knowledge_edges` has no workspace column. SELECT requires:

- edge `tenant_id` in the caller's tenants
- **and** both `from_node_id` and `to_node_id` rows visible under node RLS

Hidden source, hidden target, or mixed visibility ⇒ edge invisible (no endpoint id leakage).

## Projection worker authority

| Role | KG access |
| --- | --- |
| User JWT | SELECT per RLS. Cannot INSERT/UPDATE/DELETE `engineering_thread_object` or edges with `metadata.family=engineering-thread-projection`. |
| Projection worker | Server `createServiceClient()` writes derived projection. Not shipped to browsers. |
| `service_role` | Bypasses RLS for staging fixtures and rebuild. |

Canonical write path remains: Engineering domain → `engineering_object_links` → projection hook/job → Platform KG. GRAPH_WRITEBACK = NO.

## .env.local parse issue and safe resolution

Supabase CLI loads the project `.env.local` before `--linked` queries. Invalid dotenv keys (hyphenated, `$`, `export`, non-identifiers) cause `DbConfigLoadError`.

Safe method: copy `supabase/config.toml` and `supabase/.temp` into an isolated temp workdir **without** `.env.local`, run `supabase db query --workdir <temp> --linked`, then delete the temp directory. Secrets are not logged. `TEMPORARY_ENV_FILES_REMOVED = YES`.

The repository `.env.local` is not deleted, rewritten, or committed.

## Migration order

1. `20260930050000` A8B indexes on existing KG tables
2. `20260930060000` A8B-C workspace RLS + `idx_knowledge_nodes_workspace_id`
3. ledger rows in `supabase_migrations.schema_migrations`

## Direct SQL JWT tests

`packages/engineering-review-persistence/src/live-a8bc-kg-rls.test.ts` (hosted staging):

- A1 sees A1 projection node; A2 same tenant does not
- B1 / anonymous do not
- `Prefer: count=exact` does not reveal hidden rows
- Visible-visible edge ALLOW; visible-hidden DENY; cross-tenant DENY
- Ordinary user cannot insert projection nodes/edges

## Performance

Workspace predicate uses native `workspace_id` plus `idx_knowledge_nodes_workspace_id` (`tenant_id, workspace_id`) WHERE workspace_id IS NOT NULL. Edge checks are PK lookups on `knowledge_nodes.id`. No RLS bypass. A8B-C does not claim KG is faster than relational traversal.

## Recommendation for future KG read activation

Do **not** set `ENGINEERING_DIGITAL_THREAD_KG_READS=1` until product owners explicitly accept:

- SQL isolation (this phase)
- query parity (A8B)
- latency evidence on representative traces
- operational rebuild/health runbooks

Until then default thread source remains canonical relational.
