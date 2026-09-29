# EOS-A2C Closeout — Database deployment, live RLS proof, Decision workspace hardening

Status: **PASS**  
Date: 2026-09-29  
Branch: `cursor/era-7a-engineering-review-pilot-gate`  
HEAD (unchanged; no commit in this phase): `0dd05bf124c19e1fbb8099f396a904ec86a2d020`

This phase closed the EOS-A2 `PASS_WITH_LIMITATIONS` items: hosted apply, schema proof, live JWT RLS, and parent `engineering_decisions` workspace fail-closed isolation. EOS-A3 was not implemented.

---

## Target database

| Field | Value |
| --- | --- |
| TARGET_ENVIRONMENT | staging (non-production) |
| TARGET_PROJECT_REF | `rntonzigxwxcjlcsadip` |
| Identity proof | Linked Supabase CLI `project-ref` + root `.env.local` `SUPABASE_URL` |
| Not targeted | EOS / production `wcydlhqiqdwgoaqrlget` (`apps/web/.env.local` `NEXT_PUBLIC_SUPABASE_URL`) |
| Apply method | `npx supabase db query --linked` from a temp workdir copying `supabase/config.toml` + `.temp/project-ref` (repo-cwd `.env.local` parse fails). **Not** `supabase db push` (remote ledger is behind many local files). |

Do not apply these migrations to production.

---

## Migrations applied

| Version | Name | Ledger |
| --- | --- | --- |
| `20260929180000` | `eos_a2_decision_assumption_intelligence` | recorded in `supabase_migrations.schema_migrations` |
| `20260929190000` | `eos_a2c_decision_workspace_rls` | recorded |

Prerequisite already present on staging (applied earlier without this ledger row): `engineering_core_workspace_member`, `engineering_core_workspace_matches_tenant`, `engineering_core_prevent_ownership_mutation`.

PostgREST: `NOTIFY pgrst, 'reload schema'` after apply.

Remote ledger latest before A2: `20260919133000` `engineering_review_persist_functions.sql`. Intermediate local files between that version and A2 were **not** bulk-pushed.

---

## Final schema (verified on staging)

**`engineering_decisions` added columns:** `decision_question`, `authority_id`, `effective_at`, `selected_alternative_id`, `supersedes_decision_id`

**New tables (RLS enabled):** `engineering_decision_alternatives`, `engineering_decision_approvals`, `engineering_assumptions`

**`engineering_object_links`:** `relationship_governed` + CHECK `eng_obj_links_governed_taxonomy`

**Integrity:**

- Deferred composite FK `engineering_decisions_selected_alternative_fk` `(selected_alternative_id, id) → alternatives(id, decision_id)`
- Supersession FK + `engineering_decision_supersession_guard` (same tenant/workspace, no self, cycle walk)
- Child scope copy + ownership immutability
- Approval append-only triggers + `USING (false)` update/delete policies
- Selection sync trigger; A2C skips nested sync (`pg_trigger_depth() > 1`) so deleting the selected alternative can clear the parent pointer without heap-updating the deleting row

---

## Decision RLS

**Before A2C (batch_205, confirmed live):**

- SELECT: `tenant_id = ANY(get_user_tenant_ids())`
- INSERT/UPDATE: tenant + `has_permission('engineering','execute')`
- DELETE: `has_permission('engineering','admin')`
- No workspace membership

**After A2C:**

- SELECT: tenant + `engineering_core_workspace_member(workspace_id)`
- INSERT/UPDATE: tenant + execute + workspace member (UPDATE has matching `WITH CHECK`)
- DELETE: admin + workspace member
- INSERT/UPDATE triggers: `engineering_core_workspace_matches_tenant` (NULL workspace rejected on insert) and `engineering_core_prevent_ownership_mutation`

NULL `workspace_id` rows remain stored; user JWT cannot read them (fail-closed, same as ERA-6 Core projects/documents). `service_role` bypasses RLS.

**Object links:** resolvable endpoints (`decision`, `assumption`, `document`, `risk`, `project`, `asset`, `alternative`, `review_package`, `review_evidence`) require workspace membership on both ends via `engineering_core_link_endpoint_allowed`. Types outside that resolve set stay tenant-gated (legacy).

---

## Live JWT matrix

Harness: `packages/engineering-review-persistence/src/live-a2c-decision-rls.test.ts`  
Fixtures: ERA cert users (`cert-er-a1` / `a2` / `a-admin` / `b1`) via `provisionReviewRlsFixtures()`.  
Result: **8/8 passed** against hosted Postgres/PostgREST.

| Case | Result |
| --- | --- |
| same workspace (A1 → A1) | ALLOW (read/write per execute) |
| same tenant different workspace (A1 → A2) | DENY (empty SELECT / mutation denied) |
| different tenant (A1 → B1, B1 → A) | DENY |
| anonymous | DENY (empty SELECT) |
| service_role | ALLOW (RLS bypass; used for seed/cleanup and A2 visibility) |
| tenant admin JWT (`a-admin`, A1 member only) | ALLOW A1; DENY A2 |

Indirect leakage: A1 cannot read A2 decision id/title/question/selected alternative/supersession via parent SELECT, child tables, or object_links `to_id`.

JWT cross-workspace supersession returns “not found” because the trigger is `SECURITY INVOKER` and RLS hides the foreign parent (same deny, no extra existence oracle vs random UUID). `service_role` sees the explicit share-workspace exception.

---

## Alternative selection

- Same-decision select succeeds; `is_selected` / status sync on the parent write.
- Alternative from another decision / workspace / tenant cannot be selected (composite FK; 400 on JWT PATCH).
- Delete of the selected alternative clears `selected_alternative_id` (A2C BEFORE DELETE trigger + nested-sync skip).

---

## Approvals

- Authorized human INSERT succeeds.
- Unauthorized workspace and cross-tenant INSERT fail.
- UPDATE/DELETE fail (RLS `false` and/or append-only trigger).
- `actor_kind` other than `human` fails CHECK even as `service_role`.

---

## Assumptions

Workspace-aware RLS proven: A1 reads/patches A1; cannot read or mutate A2 or B1. Validate (`validation_status`) succeeds in-workspace.

---

## Supersession

- Legitimate same-workspace A→B succeeds.
- A1 cannot supersede A2 or Tenant B.
- Self-supersession fails.
- Simple cycle A→B→A fails.
- Longer cycle A→B→C→A fails.

Prior-decision `superseded` approval + `SUPERSEDES` governed link remain application-layer (Decision service). Database enforces pointer security and cycle rules.

---

## Object links / taxonomy

Governed same-workspace `BASED_ON` succeeds. Cross-workspace, cross-tenant, and `relationship_governed=true` with `FREE_TEXT_BYPASS` fail.

Live CHECK `eng_obj_links_governed_taxonomy` (when `relationship_governed`):

`CONTAINS`, `USES`, `DEPENDS_ON`, `ALLOCATED_TO`, `VERIFIED_BY`, `USED_BY`, `CONNECTS`, `AFFECTS`, `CAUSED_BY`, `SELECTS`, `SUPPORTED_BY`, `BASED_ON`, `REVIEWS`, `FOUND_IN`, `RESOLVES`, `BASELINES`, `SUPERSEDES`, `MAPPED_TO`, `REPRESENTED_BY`

| Relation | Status |
| --- | --- |
| BASED_ON | PRESENT (A2 writable) |
| SUPPORTED_BY | PRESENT (A2 writable) |
| SELECTS | PRESENT (A2 writable) |
| USED_BY | PRESENT (A2 writable) |
| SUPERSEDES | PRESENT (A2 writable) |
| CONTAINS | PRESENT (CHECK/registry; no System object yet — A3 owns the object, not the verb) |
| USES | PRESENT (same) |
| CONNECTS | PRESENT (same) |

Ungoverned historical strings remain allowed when `relationship_governed = false`. A2 APIs still refuse free-text via `assertGovernedRelationWrite`.

---

## Service / API validation

Live proof used PostgREST with user JWTs (the same tables the Engineering OS services write). That is the final enforcement boundary; service-layer tenant filters are not relied on.

Next.js `/api/engineering/decisions` and `/api/engineering/assumptions` were not called against a running web server in this phase.

---

## Remaining limitations

- Staging `schema_migrations` is not a complete sequential copy of every local file between 20260919133000 and A2.
- NULL-workspace legacy decision rows are invisible to JWT users by design.
- Tenant admin is not all-workspaces; membership is the gate.
- Root ESLint v9 has no `eslint.config.*`; package `turbo lint` was not used as a greenwash.
- Pre-existing `packages/engineering-os` `tsc` errors in `core-services.ts`, `grounded-ask.ts`, `technical-query-service.ts` were not modified.

---

## Out of scope (unchanged)

Engineering Review tables/runtime, PI Findings, Optimization, Systems, Interfaces, Requirements, Change, Impact, Configuration, Value, KG, job queues, flags, twin redesign.

READY_FOR_EOS-A3: **YES** — Systems & Interface Intelligence can add objects that use already-governed `CONTAINS` / `USES` / `CONNECTS`. Do not start A3 from this closeout automatically.
