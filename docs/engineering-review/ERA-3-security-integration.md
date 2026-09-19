# ERA-3 — Production persistence adapter and live RLS security gate

**Status:** Production Supabase adapter outside the domain package + live JWT RLS gate — **no UI, no live LLM, no Core RLS edits**  
**Preserves:** [`ERA-0-architecture.md`](./ERA-0-architecture.md), [`ERA-1-domain-foundation.md`](./ERA-1-domain-foundation.md), [`ERA-2-persistence-integration.md`](./ERA-2-persistence-integration.md)

| Field | Value |
| --- | --- |
| Phase | ERA-3 |
| Domain package | `@rtb/engineering-review` (still zero runtime deps) |
| Infrastructure package | `@rtb/engineering-review-persistence` |
| Additive migration | `supabase/migrations/20260919133000_engineering_review_persist_functions.sql` |

ERA-3 validates **Review AI persistence authorization and isolation**. It does not claim SOC 2, penetration-test completion, prompt-injection immunity, or production certification.

---

## Production adapter location

**Decision:** dedicated infrastructure package `packages/engineering-review-persistence` (`@rtb/engineering-review-persistence`).

Inspected alternatives:

| Location | Why not |
| --- | --- |
| `@rtb/engineering-review` | Would add Supabase as a domain runtime dependency |
| `@rtb/database` | Generated client/types only; not a product adapter layer |
| `apps/web` | Next.js coupling; ERA-3 forbids UI/HTTP product surface |
| `@rtb/engineering-os` / platform-* | Forbidden reverse dependency |
| `packages/*-certification` | Cert packs are test runners, not production adapters |

This matches Digital Twin’s postgres repository idea **without** copying PI’s in-domain Supabase client.

### Dependency diagram

```text
@rtb/engineering-review          (pure domain: ports, mappers, memory store)
        ^
        |
@rtb/engineering-review-persistence
        ├── @supabase/supabase-js     (authenticated | service | anon clients)
        └── @rtb/platform-core        (AuditService.log only)

Must NOT be imported by:
  @rtb/engineering-os
  @rtb/platform-core
  @rtb/platform-kernel
  @rtb/platform-intelligence
  @rtb/project-intelligence
```

Row/client types stay in the persistence package. Domain mappers remain the only row ↔ contract path and still fail closed on invalid status/severity/confidence.

---

## Authenticated execution model

| Path | Client | Use |
| --- | --- | --- |
| **authenticated** | anon key + user JWT `Authorization` | All user-facing Review operations and **all RLS proof** |
| **service** | service role | Fixture provision / internal only |
| **anon** | anon key, no JWT | Store construction rejected; REST SELECT must return zero rows |

Service-role success is **never** treated as evidence that user RLS works. Live tests explicitly compare a service-role read of an A1 package with a Workspace A2 JWT that must see zero rows.

---

## RLS test topology

Disposable `cert-er-*` fixtures (not production customer data):

```text
Tenant A
  Workspace A1  User A1 (engineer/execute)  User A-admin (admin)
  Workspace A2  User A2 (engineer/execute)
Tenant B
  Workspace B1  User B1 (engineer/execute)
```

Each workspace has its own project and `engineering_documents` row with **non-null** workspace and project (required by Review evidence triggers). Seeded Review package/run/finding/evidence/disposition live in A1.

Live tests hit PostgREST with JWTs (not application filters) plus the authenticated adapter for catalog/disposition/audit.

Enable / disable:

- Auto-run when hosted URL + anon + service-role are present (loads `.env.local`)
- `ENGINEERING_REVIEW_RLS=1` requires credentials (misconfigured otherwise)
- `ENGINEERING_REVIEW_RLS=0` skips (`SKIPPED_ENVIRONMENT_UNAVAILABLE`)

Apply hosted schema: `pnpm --filter @rtb/engineering-review-persistence apply:hosted-migration` (needs `SUPABASE_DB_URL` / `DATABASE_URL` if tables are absent).

---

## Transaction model

Supabase JS has no multi-table transaction API. ERA-3 adds **SECURITY INVOKER** functions (RLS still applies, not privileged DEFINER RPCs):

- `engineering_review_persist_finding_bundle(finding, evidence)` — finding + evidence in one transaction
- `engineering_review_record_disposition(finding, disposition)` — status change + append-only history in one transaction

Partial persistence (finding without evidence, or status without history) is rejected as a unit.

---

## Audit behaviour

`bindPlatformReviewAudit(client)` wraps `AuditService.log`.

Inspected RTB policy (`packages/platform-core/src/audit.ts`): insert failure is `console.error` and **returns null**. Review follows that policy — audit failure does **not** fail the originating Review operation. Critical audit-fail-closed would be a separate platform change.

---

## Document catalog authorization

`loadAuthorizedDocument` queries `engineering_documents` with the **authenticated** client, then applies stronger Review ownership:

1. If RLS hides the row → `document_unauthorized` (UUID guess fails)
2. If the row is visible (Core tenant-only SELECT) but workspace/project mismatch → `cross_workspace_rejected` / `cross_project_rejected`

Review AI does not treat a known UUID as authorization.

---

## Known platform security debt

**KNOWN_PLATFORM_SECURITY_DEBT:** Core `engineering_documents` and `engineering_projects` RLS remain **tenant-only** (`20260203000001`). Same-tenant Workspace A2 documents may be SELECT-visible to User A1 at the Core table.

ERA-3 does **not** modify that RLS. Review compensates by requiring tenant **and** workspace **and** project match before evidence attach. Separate hardening phase should add workspace membership to Core document/project policies, with a dedicated regression pack. Do not mix that change with Review UI.

---

## Known limitations

1. Hosted schema apply requires `SUPABASE_DB_URL` / `DATABASE_URL` if tables are not already present.
2. Generated `@rtb/database` types do not yet include Review tables; the adapter uses an untyped client.
3. Non-UUID domain ids are minted to UUID at the hosted write boundary.
4. Prompt injection is not solved. No SOC 2 / pentest claim.
5. No `/review` UI and no live LLM.

---

## ERA-4 recommendation

Do **not** start commercial Review UI until:

1. This live JWT suite is green on CI with `ENGINEERING_REVIEW_RLS=1`
2. Hosted migrations are part of the normal apply path
3. Optionally, Core document/project workspace RLS is hardened in its own phase

ERA-4, if authorized, should be a thin authenticated API over `SupabaseEngineeringReviewStore` — still no live LLM.
