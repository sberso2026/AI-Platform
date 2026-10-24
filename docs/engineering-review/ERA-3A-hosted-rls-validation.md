# ERA-3A — Hosted JWT/RLS security gate closure

**Status:** Review persistence migrations applied to non-production hosted Postgres; live authenticated JWT/RLS suite executed against the real database.  
**Preserves:** [`ERA-0-architecture.md`](./ERA-0-architecture.md), [`ERA-1-domain-foundation.md`](./ERA-1-domain-foundation.md), [`ERA-2-persistence-integration.md`](./ERA-2-persistence-integration.md), [`ERA-3-security-integration.md`](./ERA-3-security-integration.md)

This phase is **not** a feature phase. No Review UI, no live LLM, no Core `engineering_documents` / `engineering_projects` RLS edits.

ERA-3A validates **deployed** Review authorization. It does not claim SOC 2, penetration-test completion, prompt-injection immunity, or production certification.

---

## Environment

| Field | Value |
| --- | --- |
| Category | Non-production **staging** |
| Project name | RTB AI Platform Staging |
| Project ref | `rntonzigxwxcjlcsadip` |
| Database host | `db.rntonzigxwxcjlcsadip.supabase.co` |
| API host | `rntonzigxwxcjlcsadip.supabase.co` |
| Linked via | Supabase CLI (`supabase db query --linked`) |
| Production? | **No.** Not Engineering OS (`wcydlhqiqdwgoaqrlget`), not RTB-Intranet-Production. |

Credentials used: repository-standard Supabase CLI login (Management API / login role) for migration apply and metadata queries. Live JWT tests used repo-root `.env.local` URL + anon + service-role for that staging project. No passwords, service-role secrets, JWT secrets, or connection strings are recorded here.

`SUPABASE_DB_URL` / `DATABASE_URL` were **not** present. Apply used CLI `--linked` instead of `pnpm --filter @rtb/engineering-review-persistence apply:hosted-migration` (that script requires a DB URL).

Repo-root `.env.local` contains two Supabase URL assignments. The later `SUPABASE_URL` / `SUPABASE_TEST_URL` pair is staging. The earlier `NEXT_PUBLIC_SUPABASE_URL` is Engineering OS. ERA-3A targeted staging only.

---

## Migration deployment

| Migration | Result |
| --- | --- |
| `20260919120000_engineering_review_persistence.sql` | Applied via `supabase db query --linked --file` |
| `20260919133000_engineering_review_persist_functions.sql` | Applied via `supabase db query --linked --file` |
| History | Recorded in `supabase_migrations.schema_migrations` |

Pre-apply inspection:

- Additive `CREATE TABLE` / `CREATE OR REPLACE FUNCTION` / `CREATE POLICY` only
- No `DROP`/`ALTER` of Core `engineering_documents` or `engineering_projects`
- RLS enabled on all five Review tables
- Explicit SELECT / INSERT / UPDATE / DELETE policies
- Persist functions default **SECURITY INVOKER** (`prosecdef = false`)
- Rollback remains: drop Review tables/functions only; do not alter Core/PI

Full `supabase db push` was **not** used. Remote history is behind many later local files; pushing all pending migrations would have been an unrelated schema deploy.

PostgREST schema cache was reloaded (`NOTIFY pgrst, 'reload schema'`).

---

## Deployed tables

Verified in `pg_class` (not inferred from source):

| Table | `relrowsecurity` |
| --- | --- |
| `engineering_review_packages` | true |
| `engineering_review_runs` | true |
| `engineering_review_findings` | true |
| `engineering_review_evidence` | true |
| `engineering_review_dispositions` | true |

`relforcerowsecurity` is false (Supabase table-owner/service-role convention). User JWT proofs used PostgREST with the anon key + user access token, not the service role.

---

## Deployed functions

Verified in `pg_proc` (`prosecdef = false` = SECURITY INVOKER):

| Function | Args |
| --- | --- |
| `engineering_review_persist_finding_bundle` | `jsonb, jsonb` |
| `engineering_review_record_disposition` | `jsonb, jsonb` |
| `engineering_review_workspace_allowed` | `uuid` |
| `engineering_review_prevent_ownership_mutation` | trigger |
| `engineering_review_dispositions_append_only` | trigger |

---

## Deployed policies

Inspected from `pg_policies` after apply.

Common SELECT USING:

`tenant_id = ANY (get_user_tenant_ids()) AND engineering_review_workspace_allowed(workspace_id)`

Common INSERT WITH CHECK:

`tenant + workspace + has_permission('engineering', 'execute', tenant_id)`

Common UPDATE USING/WITH CHECK (packages, runs, findings, evidence):

`tenant + workspace + has_permission('engineering', 'execute', tenant_id)`

Common DELETE USING (packages, runs, findings, evidence):

`tenant + workspace + has_permission('engineering', 'admin', tenant_id)`

| Table | Policy | Command | Notes |
| --- | --- | --- | --- |
| `engineering_review_packages` | `*_select` / `*_insert` / `*_update` / `*_delete` | SELECT, INSERT, UPDATE, DELETE | execute write; admin delete |
| `engineering_review_runs` | same pattern | SELECT, INSERT, UPDATE, DELETE | |
| `engineering_review_findings` | same pattern | SELECT, INSERT, UPDATE, DELETE | |
| `engineering_review_evidence` | same pattern | SELECT, INSERT, UPDATE, DELETE | document ownership still enforced by trigger |
| `engineering_review_dispositions` | `*_select` / `*_insert` | SELECT, INSERT | execute insert |
| `engineering_review_dispositions` | `*_update` | UPDATE | `USING (false) WITH CHECK (false)` |
| `engineering_review_dispositions` | `*_delete` | DELETE | `USING (false)` |

PostgREST returns HTTP 200/204 with **zero rows** when USING(false) matches nothing. That is fail-closed (no mutation), not a 4xx. Live tests assert the row is unchanged / still present.

---

## JWT test topology

Labeled fixtures (`cert-er-*`, not production customer data):

```text
Tenant A  (slug cert-er-a)
  Workspace A1  User A1 engineer/execute   User A-admin admin
  Workspace A2  User A2 engineer/execute
Tenant B  (slug cert-er-b)
  Workspace B1  User B1 engineer/execute
```

Each workspace has its own `engineering_projects` and `engineering_documents` row with non-null workspace and project. Seeded Review package/run/finding/evidence/disposition live in A1.

Proof channel: PostgREST `/rest/v1/*` with user JWT. Service-role reads are compared only to prove they are **not** user RLS evidence.

---

## Executed security tests

`ENGINEERING_REVIEW_RLS=1` `pnpm --filter @rtb/engineering-review-persistence test`

**Live JWT file:** 11 tests executed, **0 skipped**. Suite total 17 passed / 0 skipped.

### Positive authorization

| Proof | Result |
| --- | --- |
| A1 SELECT of A1 rows on all five Review tables | PASS (HTTP 200, seeded id present) |
| A1 INSERT package into A1 | PASS (2xx) |
| A1 UPDATE of an A1 disposable package | PASS |
| A-admin DELETE of a disposable A1 package | PASS (row gone) |
| A1 `loadAuthorizedDocument` for A1 document | PASS |
| A1 human disposition of an A1 finding (legal transition) | PASS; history length increased; `actor_kind=human` |

### Negative authorization

| Proof | Result |
| --- | --- |
| A. SELECT isolation — A2 and B1 see zero A1 rows | PASS |
| Anonymous SELECT sees zero Review rows | PASS |
| B. INSERT isolation — A2/B1 INSERT into A1 rejected (4xx) | PASS |
| C. UPDATE isolation — A2 PATCH of A1 package matches zero rows | PASS |
| D. DELETE isolation — execute user cannot delete; row remains | PASS |
| E. Ownership immutability — A1 cannot move package to Tenant B | PASS (4xx / trigger) |
| F. Cross-tenant evidence | PASS (4xx) |
| G. Same-tenant cross-workspace evidence | PASS (4xx) |
| H. Cross-project evidence laundering | PASS (4xx) |
| I. Document UUID guessing (A2, B1, random UUID) | PASS (`EngineeringReviewError`) |
| J. Disposition append-only — PATCH does not rewrite; DELETE leaves row | PASS |
| K. AI/system cannot human-dispose (`actorKind=ai` and `actor_kind=ai` INSERT) | PASS |
| L. Service-role read of A1 is not treated as A2 authorization | PASS (A2 still sees zero) |

---

## Defects discovered

1. **Credential pairing (loader).** Repo-root `.env.local` has two `SUPABASE_SERVICE_ROLE_KEY` assignments. First-wins loaded an Engineering OS key against the staging URL → REST `401 Invalid API key`, tables looked “missing”, JWT tests skipped. **Not** an RLS hole.
2. **PostgREST deny encoding.** Disposition UPDATE/DELETE with `USING (false)` returned 200/204 and zero rows rather than HTTP 400. Row was not mutated. Tests now prove no mutation instead of requiring 4xx.
3. **Seed rename / duplicate seeds.** Early UPDATE test renamed the seeded package, so later provisions inserted extra A1 seeds. Operator SQL removed duplicates; UPDATE now uses a disposable package. Append-only trigger was temporarily disabled only for that operator cleanup, then re-enabled (`tgenabled = O`).
4. **Disposition transition vs leftover state.** After prior accepts, `reopen` from `accepted` is invalid (`accepted → closed` only). Test now chooses a legal human action from current status. Domain transition rules were not weakened.
5. **`audit_events` RLS.** Authenticated human disposition logs `AuditService` insert failure (`new row violates row-level security policy for table "audit_events"`). Business operation still succeeds. Platform audit policy; not a Review isolation failure.

No unauthorized Review access was demonstrated.

---

## Fixes applied

Review-package only (no Core RLS):

- `parseEnvAssignments`: later assignments in the same env file win; invalid keys ignored
- `ENGINEERING_REVIEW_RLS=1` with unreachable tables **throws** (skip is not pass)
- Transient package cleanup (`ERA-3 insert/delete-target/update-target %`)
- Live tests treat PostgREST 200-empty / 204 as denied mutation when the row is proven unchanged
- UPDATE and human-disposition tests no longer depend on a single mutable seed name/status

---

## Generated database types

**Not regenerated.** Repository practice: `@rtb/database` generated types are not shipped as the Review contract (`packages/project-intelligence-certification` notes the repo does not ship generated Supabase types). `@rtb/engineering-review-persistence` keeps an untyped client; domain mappers remain the fail-closed boundary. No fabricated types.

---

## Test data cleanup

| Item | Result |
| --- | --- |
| Transient JWT packages (`ERA-3 insert/delete-target/update-target`) | Removed by suite `afterAll` (0 leftover) |
| Duplicate renamed seeds | Operator-deduped to one `ERA-3 seeded package A1` |
| Labeled topology `cert-er-a` / `cert-er-b` plus users/projects/documents | Retained as identifiable fixtures for re-runs |
| Auto-orgs `cert-er-a1`, `cert-er-a2`, `cert-er-a-admin`, `cert-er-b1` | Platform signup-created identity tenants; labeled; not Review product data |
| RLS policies | Not weakened for cleanup |

---

## Remaining security debt

**KNOWN_PLATFORM_SECURITY_DEBT:** Core `engineering_documents` and `engineering_projects` RLS remain **tenant-only** (`20260203000001`). Same-tenant Workspace A2 documents may be SELECT-visible to User A1 at Core. ERA-3A did **not** change that. Review still requires tenant + workspace + project on Review rows and rejects evidence whose Core document workspace/project does not match.

Also outstanding (not Review table RLS):

- Authenticated insert into `audit_events` denied for Review JWT users
- Hosted JWT suite is not yet a required CI job with `ENGINEERING_REVIEW_RLS=1`

---

## Recommendation for ERA-4

The hosted RLS gate is closed on staging. ERA-4, if authorized, should be a **thin authenticated API** over `SupabaseEngineeringReviewStore` — still no live LLM and no Core RLS mix-in.

Do not start commercial `/review` UI until:

1. This suite stays green (prefer CI with `ENGINEERING_REVIEW_RLS=1` against staging)
2. Review migrations remain on the normal staging apply path
3. Optionally, Core document/project workspace RLS is hardened in its own phase

---

## Checkpoint

| Field | Value |
| --- | --- |
| ERA-2 baseline | `a7f4ef4909c785c5ccf0b1cc2e8913cc0f4e40ca` |
| ERA-3 commit | `0d168ee5451bc1a2a6455d4187d8876ffc85c75b` |
| ERA-3A branch | `cursor/era-3a-engineering-review-hosted-rls` |
