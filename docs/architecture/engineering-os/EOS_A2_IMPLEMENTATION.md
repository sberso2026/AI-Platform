# EOS-A2 Implementation — Decision & Assumption Intelligence

Status: **implemented** (additive schema + Engineering Core services). Does not rewrite EOS-A1 decisions.

Evidence branch: `cursor/era-7a-engineering-review-pilot-gate`  
Migration: `supabase/migrations/20260929180000_eos_a2_decision_assumption_intelligence.sql`

---

## Implemented schema

**Parent (canonical, not replaced):** `engineering_decisions`

Added nullable columns:

- `decision_question`
- `authority_id` (profiles FK; distinct from `owner_id` / `approved_by`)
- `effective_at`
- `selected_alternative_id`
- `supersedes_decision_id`

Not duplicated: `rationale`, `confidence`, `status`, `approval_status`, `approved_by`, `decision_date`, legacy `alternatives` JSONB (kept as snapshot; identifiable children are source of truth going forward).

**Children:**

| Table | Role |
| --- | --- |
| `engineering_decision_alternatives` | Identifiable alternatives (`alternative_code` unique per decision) |
| `engineering_decision_approvals` | Append-only human approval provenance |
| `engineering_assumptions` | First-class Core assumptions |

**Links:** `engineering_object_links.relationship_governed` (default false). Historical `relationship` strings including `contains` remain valid. Governed writes must use the A1 taxonomy CHECK.

**Not created:** systems, requirements, interfaces, change, impact, configuration, optimization, value, KG tables, PI/ERA finding tables.

---

## Canonical ownership

Unchanged from EOS-A1:

- Engineering Core owns Decision, Alternative, Approval events, Assumption.
- Engineering Review owns ERA package/run/finding/evidence/disposition (**runtime unchanged**).
- Project Intelligence owns PI Findings (**not migrated**).
- Project Controls `decision_unit` not merged.
- Platform audit / `engineering_audit_links` remain the security/system audit path.

Assumptions are a **horizontal Core object**, not a product.

---

## Selection integrity (documented choice)

**Choice A:** `engineering_decisions.selected_alternative_id` with deferred composite FK  
`(selected_alternative_id, id) → engineering_decision_alternatives(id, decision_id)`.

This is stronger than `is_selected` alone: PostgreSQL uniqueness of the parent column plus membership in the same decision. Child `is_selected` is synced by trigger for list UX. Multi-select is not permitted.

---

## Relation taxonomy enforcement

1. Application: `assertGovernedRelationWrite` — A2 APIs only accept `BASED_ON`, `SUPPORTED_BY`, `SELECTS`, `USED_BY`, `SUPERSEDES`.
2. Persistence: `relationship_governed = true` plus CHECK against the full A1 taxonomy (so later phases are not boxed into five verbs).
3. Trigger: governed links resolve both endpoints; reject cross-tenant; reject cross-workspace when both objects have `workspace_id`.
4. **No CHECK on ungoverned historical strings.** Legacy `contains` continues via `afterCreate`.

Allowed current endpoint types for governed resolve: decision, assumption, document, risk, project, asset, alternative, review_package, review_evidence. Model text PKs are **not** UUID-linkable; deferred.

---

## Supersession

Trigger + application: same tenant, same workspace, not self, walk prior chain (max 64) to reject cycles. Writes `SUPERSEDES` governed link and records `superseded` approval on the prior decision.

---

## Security model

New tables: RLS enabled before exposure. SELECT/INSERT/UPDATE require `get_user_tenant_ids()` + `engineering_core_workspace_member(workspace_id)` + `has_permission('engineering','execute')`. DELETE is admin + workspace member.

Approvals: INSERT human-only (`actor_kind = 'human'`); UPDATE/DELETE policies `USING (false)`; append-only triggers.

Existing `eng_decisions_*` policies were **not dropped in A2** (A2 did not weaken them). **EOS-A2C** (`20260929190000_eos_a2c_decision_workspace_rls.sql`) replaced those tenant-only policies with Core `engineering_core_workspace_member` fail-closed isolation, matching `engineering_projects` / `engineering_documents`. Child rows inherit parent tenant/workspace via trigger (cannot escape parent).

Assumptions require `workspace_id` (workspace-tenant match trigger + Core ownership immutability).

Hosted apply: staging `rntonzigxwxcjlcsadip` via `npx supabase db query --linked` (not `db push`). See `EOS_A2_CLOSEOUT.md`.

---

## Audit

Reuse `EngineeringObjectFramework.publishCreated` → timeline, activity, kernel event bus, `engineering_audit_links`. Approval rows are **business provenance**, not a second audit subsystem.

No autonomous AI approval (`actor_kind` check + application `assertHumanApprovalActor`).

---

## API / service surface

| Capability | Surface |
| --- | --- |
| Decision CRUD / get | `EngineeringDecisionService` + `GET/POST/PATCH /api/engineering/decisions` |
| Alternatives | `createAlternative`, `updateAlternative`, `selectAlternative`; POST `action=create_alternative\|select_alternative` |
| Approvals | `recordApproval`, `approve`; POST `action=record_approval\|approve` |
| Supersede | `supersede`; POST `action=supersede` |
| Governed link | `linkGoverned`; POST `action=link` |
| Assumptions | `EngineeringAssumptionService` + `/api/engineering/assumptions` (list/get/create/update/validate/link) |

Commerce: assumption policies reuse `decision.read` / `decision.write` (same PI application gate as decisions). No new product.

---

## UI scope

**Lower-risk option B+local:** no standalone Assumptions register page (would add layout ROUTES + page policies). Decision register was extended locally:

- create: question, rationale, confidence
- detail panel: alternatives, select, approvals, related assumption links, create+link assumption

No dashboard, Optimization, or Systems UI.

---

## Tests

- Unit: `decision-intelligence.test.ts` (taxonomy, selection, supersession, confidence, human approval)
- Service: `decision-service.test.ts` (CRUD/select/approve/assumption link; tenant miss; workspace list)
- Migration/schema: `eos-a2-migration.test.ts`
- Core register contract: `engineering-os.test.ts`, `batch-206.test.ts`
- Commerce policy segment: `assumptions` in `ENGINEERING_API_POLICIES`
- A2C contract: `eos-a2c-migration.test.ts`
- Hosted JWT RLS: `packages/engineering-review-persistence/src/live-a2c-decision-rls.test.ts` (opt-in, same credentials as ERA live RLS)

---

## Known limitations

- Legacy parent rows with NULL `workspace_id` remain stored; user JWT cannot read them (fail-closed, same as ERA-6 Core).
- Tenant-admin JWT is still workspace-membership scoped (`cert-er-a-admin` is A1-only). `service_role` bypasses RLS.
- Legacy `alternatives` JSONB is not deleted.
- Model / analysis / requirement / system / configuration / optimization links are not UUID-addressable yet.
- No dual-write to Platform KG (best-effort existing `linkObjects` KG edge remains optional).
- Assumptions UI is via Decision detail, not a full register.
- Next.js `/api/engineering/decisions` was not live-called in A2C; PostgREST JWT is the enforcement boundary.

---

## Deferred work

EOS-A3 Systems & Interface Intelligence. Do not start Optimization (A5), Configuration, Requirements, Change, KG convergence, or flag/job migrations here.
