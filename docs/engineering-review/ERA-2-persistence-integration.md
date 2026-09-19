# ERA-2 — Engineering Review AI persistence, RLS, and Project Intelligence input integration

**Status:** Additive persistence + fail-closed tenant/workspace RLS + PI input adapter — **no UI, no live LLM**  
**Package:** `@rtb/engineering-review` (`packages/engineering-review`)  
**Preserves:** [`ERA-0-architecture.md`](./ERA-0-architecture.md), [`ERA-1-domain-foundation.md`](./ERA-1-domain-foundation.md)

| Field | Value |
| --- | --- |
| Phase | ERA-2 |
| Engine version | `review-engine/0.2.0-era-2` |
| Runtime deps | **none** (no Next.js, React, Supabase, EOS, PI, or platform packages) |
| Migration | `supabase/migrations/20260919120000_engineering_review_persistence.sql` |

---

## Schema

Five additive tables. Canonical engineering files remain `engineering_documents`; package `documents` JSONB stores ID/revision/role snapshots only. There is **no** `engineering_review_documents` table.

| Table | Aggregate | Notes |
| --- | --- | --- |
| `engineering_review_packages` | Review Package | `workspace_id` and `project_id` NOT NULL |
| `engineering_review_runs` | Review Run | Composite FK to package ownership |
| `engineering_review_findings` | Review Finding | Not stored in `project_intelligence_findings` |
| `engineering_review_evidence` | Frozen citation | FK to `engineering_documents(id)` |
| `engineering_review_dispositions` | Human history | Append-only; `actor_kind = 'human'` |

Identifiers, timestamps, JSONB, TEXT+CHECK (not PostgreSQL enums), and `update_updated_at()` follow existing RTB conventions.

Composite unique keys `(id, tenant_id, workspace_id, project_id)` on parent rows enable composite foreign keys on children so a finding cannot be parented to a run in another tenant/workspace/project.

---

## Ownership model

Every Review AI row carries `tenant_id`, `workspace_id`, and `project_id`. Workspace is never nullable.

Guards:

- Trigger `engineering_review_prevent_ownership_mutation` — ownership columns immutable
- Trigger `engineering_review_assert_workspace_project` — workspace belongs to tenant; project belongs to tenant and (if set) the same workspace
- Trigger `engineering_review_assert_document_ownership` — evidence `document_id` must match **tenant AND workspace AND project** on `engineering_documents`. Null workspace/project on a Core document is rejected (fail closed)
- Finding provenance (`created_at`, package/run ids, provenance JSON) is immutable after insert

### Document duplication

Review evidence references `engineering_documents.id`. Package membership is a JSON snapshot of document identifiers, not copied bytes or extracted text.

---

## RLS model

**Primary reference:** `20260712180000_batch_36_project_intelligence_documents.sql` (tenant via `get_user_tenant_ids()` **AND** workspace membership).

**Explicit write policies:** `20260808140000_batch_75_digital_twin_core.sql` and `20260204000001_batch_205_register_rls.sql` (`engineering` execute for INSERT/UPDATE, admin for DELETE).

**Not copied:**

- `20260203000001_batch_20_engineering_rls.sql` — Core `engineering_documents` / `engineering_projects` are **tenant-only** (weaker). Unchanged in ERA-2; recorded for later hardening.
- `20260806120000_batch_41_project_intelligence_findings.sql` — SELECT-only (writes fail by omission). ERA-2 requires explicit INSERT/UPDATE/DELETE.

Authenticated predicates (fail closed when `auth.uid()` has no workspace membership):

| Command | Predicate |
| --- | --- |
| SELECT | tenant membership AND `engineering_review_workspace_allowed(workspace_id)` |
| INSERT | SELECT predicate AND `has_permission('engineering','execute', tenant_id)` |
| UPDATE | same as INSERT, both USING and WITH CHECK |
| DELETE | SELECT predicate AND `has_permission('engineering','admin', tenant_id)` |

Dispositions: INSERT as above; UPDATE and DELETE `USING (false)`.

Service role bypasses RLS (Supabase convention). Ownership triggers still fire.

A user in Workspace A cannot read Workspace B review data in the same tenant.

---

## Repository ports

Defined in `src/ports.ts` (interfaces only):

- `ReviewPackageRepository` — `saveReviewPackage`, `loadReviewPackage`, `deleteReviewPackage`
- `ReviewRunRepository` — `startReviewRun`, `saveReviewRun`, `loadReviewRun`
- `ReviewFindingRepository` — `persistCandidateFindings`, `attachVerifiedEvidence`, `recordHumanDisposition`, `loadReviewRegister`, …
- `ReviewDocumentCatalog` — known `engineering_documents` ownership for laundering checks

The in-memory adapter (`MemoryEngineeringReviewStore`) implements the same tenant+workspace predicates as the SQL policies. Row mappers (`persistence/mappers.ts`) validate status/severity/confidence vocabularies and **fail closed** instead of coercing invalid values (for example PI severity `high` is rejected).

No Supabase client is imported into `@rtb/engineering-review`.

---

## Adapter architecture

```text
Project Intelligence ready document
        |
        v
PI Review Input Adapter   (src/adapters/pi-input.ts)
        |
        v
Canonical Review Input + readiness report
        |
        v
@rtb/engineering-review engine (ERA-1 detectors)
        |
        v
Persistence ports → Memory store now / SQL later
        |
        v
Review Register + disposition history
```

The PI adapter consumes an anti-corruption snapshot (`ProjectIntelligenceDocumentSnapshot`) whose field names match PI (`engineeringDocumentId`, `processingStatus`, chunks, warnings). It does **not** import `@rtb/project-intelligence`.

---

## PI integration

Inspected before implementation:

- `packages/project-intelligence/src/documents/types.ts` — `DOCUMENT_PROCESSING_STATUSES`, `DocumentChunk`, ready = `ready` | `ready_with_warnings`
- Native parser warning `insufficient_extracted_text:ocr_recommended`
- PI document RLS (tenant + workspace) as the security reference

The adapter exposes only what Review needs: document id, tenant/workspace/project, title/type/number/revision, mime, processing status, warnings, extracted text, chunk locators, provenance.

---

## Input readiness

| Review readiness | PI / input condition |
| --- | --- |
| `READY_MACHINE_READABLE` | `ready` or `ready_with_warnings` without OCR warning, with extracted text or chunk content, and a project id |
| `NOT_READY` | in-progress statuses, `retry_pending`, `superseded`, `archived`, unknown status, missing project |
| `OCR_REQUIRED` | PI OCR warning **or** ready with no machine-readable text. ERA-2 does not run OCR |
| `UNSUPPORTED` | image / opaque binary mime types |
| `FAILED_INGESTION` | `failed`, `cancelled` |

`assertReviewInputsReady` fails closed if any document is blocking. Unsupported and OCR-required documents are **not** silently omitted from a run.

---

## Trust boundary

Extracted document text is typed as `UntrustedDocumentText` (`trust: "untrusted_document"`). The adapter never produces `SystemInstruction` from document content.

`DOCUMENT_TRUST_BOUNDARY.promptInjectionSolved` remains `false`. Separation of system/policy instructions, review rules, document content, and retrieved evidence is a type-level and pipeline-stage boundary, not a claim that prompt injection is solved.

---

## Audit integration

Domain port: `ReviewAuditSink` / `InMemoryReviewAuditSink`.

Duck-typed platform bridge: `createPlatformAuditAdapter(log)` maps Review actions onto `AuditService.log` / `audit_events` **without** importing `@rtb/platform-core`.

Audited actions: package created; run created/started/completed/failed; finding created; evidence verified; human disposition; finding closed.

---

## Test strategy

| Suite | What it proves |
| --- | --- |
| ERA-1 domain / detectors / eval / lifecycle | Unchanged contracts still pass |
| `migration.test.ts` | SQL enables RLS + four policies per table; composite FKs; Core RLS untouched; no `/review` routes; no reverse imports |
| `persistence.test.ts` | Tenant A ↛ Tenant B; Workspace A ↛ Workspace B; evidence laundering; unauthorized insert/update/delete; AI cannot dispose; mapper fail-closed |
| `pi-input.test.ts` | Readiness classification and no silent omit |
| `integration.test.ts` | PI snapshot → package → run → detectors → persist → register → disposition history (no network) |
| `hosted-rls.test.ts` | Live JWT RLS opt-in via `ENGINEERING_REVIEW_RLS=1` (skipped by default, same pattern as PI certification) |

In-memory RLS is the default, always-on isolation test. Hosted JWT execution requires existing local/test infrastructure credentials and is not invented here.

---

## Known limitations

1. Hosted Postgres JWT RLS is not executed in the default unit suite (requires fixtures/credentials). SQL policies and the in-memory predicate replica are tested.
2. Core `engineering_documents` / `engineering_projects` remain tenant-only RLS. Review AI does not weaken or “fix” them in ERA-2. Evidence attachment **requires** those Core rows to have non-null workspace and project that match the review row.
3. Actor ids are TEXT (domain `ActorId`), not FK to `profiles`, so fixture actors such as `engineer-1` persist. Platform audit adapter can still record `userId`.
4. No live Supabase adapter in this package (intentionally — domain stays framework-independent). A future `apps/web` or persistence package may bind the ports to `@rtb/database`.
5. Prompt injection is not solved.
6. No commercial Review UI, `/review` routes, or live LLM review.
7. Node local runtime may be v24 while the repo wanted range is `>=22 <23` (pre-existing).

---

## Migration rollback considerations

The migration is additive CREATE only. Rollback is:

1. `DROP TABLE` the five `engineering_review_*` tables (cascades children)
2. `DROP FUNCTION` the `engineering_review_*` helpers

Do not DROP or alter Core/PI tables. Do not edit older migrations. No data backfill is required.

---

## ERA-3 recommendation

Do **not** start commercial UI yet unless product explicitly wants a thin operator surface.

ERA-3 should:

1. Bind ports to a Supabase/Postgres adapter outside the domain package, using UUID identifiers
2. Run hosted JWT RLS against the new tables (`ENGINEERING_REVIEW_RLS=1`) with Workspace A/B fixtures
3. Optionally harden Core `engineering_documents` to tenant **and** workspace (separate change, not mixed with Review product UI)
4. Keep live LLM out until eval/gold-set and human-authority gates remain green
5. Only then add `/review` routes that call the persisted flow — never the reverse (UI first)

---

## Core tenant-only RLS (deferred)

`engineering_projects` and `engineering_documents` SELECT/INSERT/UPDATE remain `tenant_id = ANY(get_user_tenant_ids())` without workspace membership. That is weaker than PI document RLS and is **out of scope** for ERA-2. Review AI compensates by requiring workspace on its own tables and by rejecting evidence whose Core document workspace/project does not match.
